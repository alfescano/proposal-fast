// =============================================================================
// MARKET STATE CONFIRMATION ENGINE - BACKUP STRATEGY
// Pine Script v6 - Decision Support for 180s Crypto Options
// =============================================================================
// Purpose: High-quality confirmation/validation layer for manual CALL/PUT decisions
// Not a direct entry signal - serves as market state compass and trade quality filter
// =============================================================================

//@version=6
strategy("Market State Confirmation Engine", 
     overlay=true, 
     default_qty_type=strategy.percent_of_equity, 
     default_qty_value=10,
     calc_on_order_fills=false,
     calc_on_every_tick=false,
     backtest_fill_limits_assumption=0,
     use_bar_magnifier=true)

// =============================================================================
// INPUTS - CONFIGURABLE PARAMETERS
// =============================================================================

// --- HTF (Higher Timeframe) Settings ---
group_htf = "HTF Bias Settings"
htfTimeframe = input.timeframe(title="HTF Timeframe", defval="3m", group=group_htf)
htfEmaFastLen = input.int(title="HTF Fast EMA", defval=9, minval=1, group=group_htf)
htfEmaSlowLen = input.int(title="HTF Slow EMA", defval=21, minval=1, group=group_htf)
htfAtrLen = input.int(title="HTF ATR Length", defval=14, minval=1, group=group_htf)

// --- LTF (Lower Timeframe - Current Chart) Settings ---
group_ltf = "LTF Structure Settings"
emaFastLen = input.int(title="LTF Fast EMA", defval=9, minval=1, group=group_ltf)
emaSlowLen = input.int(title="LTF Slow EMA", defval=21, minval=1, group=group_ltf)
emaMidLen = input.int(title="LTF Mid EMA", defval=50, minval=1, group=group_ltf)

// --- Regime & Chop Detection ---
group_regime = "Regime Detection"
adxLen = input.int(title="ADX Length", defval=14, minval=1, group=group_regime)
adxThreshold = input.float(title="ADX Trend Threshold", defval=25, minval=0, group=group_regime)
atrScaleLen = input.int(title="ATR Scale Length", defval=100, minval=10, group=group_regime)
atrExpansionThreshold = input.float(title="ATR Expansion Multiplier", defval=1.5, minval=1.0, group=group_regime)
atrCompressionThreshold = input.float(title="ATR Compression Multiplier", defval=0.6, minval=0.1, maxval=1.0, group=group_regime)

// --- Exhaustion & Mean Reversion ---
group_exhaust = "Exhaustion Detection"
extAtrLen = input.int(title="Extension ATR Length", defval=14, minval=1, group=group_exhaust)
extThreshold = input.float(title="Extension Threshold (ATR)", defval=3.0, minval=1.0, group=group_exhaust)
rocLen = input.int(title="ROC Lookback", defval=8, minval=1, group=group_exhaust)
rocExtreme = input.float(title="ROC Extreme Threshold", defval=5.0, minval=0.0, group=group_exhaust)
wickRatioThreshold = input.float(title="Wick/Body Extreme Ratio", defval=2.0, minval=1.0, group=group_exhaust)

// --- Session Settings ---
group_session = "Session Quality"
sessionTimezone = input.string(title="Timezone", defval="UTC", options=["UTC", "America/New_York", "Europe/London", "Asia/Tokyo"], group=group_session)
enableSessionFilter = input.bool(title="Enable Session Filter", defval=true, group=group_session)
strictSessionMode = input.bool(title="Strict Session Mode", defval=false, group=group_session)

// --- Strategy Simulation Settings ---
group_sim = "Simulation Settings"
simHoldingBars30s = input.int(title="30s Chart: Bars to Hold", defval=6, minval=1, group=group_sim)
simHoldingBars15s = input.int(title="15s Chart: Bars to Hold", defval=12, minval=1, group=group_sim)
simCooldown = input.int(title="Cooldown Bars Between Trades", defval=3, minval=0, group=group_sim)
testMode = input.bool(title="Test Mode (Faster Updates)", defval=false, group=group_sim)

// --- Scoring Weights ---
group_weights = "Scoring Weights"
weightHtf = input.float(title="HTF Weight", defval=0.30, minval=0.0, maxval=1.0, group=group_weights)
weightRegime = input.float(title="Regime Weight", defval=0.25, minval=0.0, maxval=1.0, group=group_weights)
weightStructure = input.float(title="Structure Weight", defval=0.25, minval=0.0, maxval=1.0, group=group_weights)
weightMomentum = input.float(title="Momentum Weight", defval=0.20, minval=0.0, maxval=1.0, group=group_weights)

// =============================================================================
// HTF DATA FETCHING (NON-REPAINTING)
// =============================================================================

// Get HTF EMA values using request.security with lookahead_off
[htfClose, htfEmaFast, htfEmaSlow, htfAtr] = request.security(
     symbol=syminfo.tickerid, 
     timeframe=htfTimeframe, 
     expression=[close, ta.ema(close, htfEmaFastLen), ta.ema(close, htfEmaSlowLen), ta.atr(htfAtrLen)],
     lookahead=barmerge.lookahead_on)

// =============================================================================
// HTF BIAS CALCULATION
// =============================================================================

// HTF Trend Direction (1 = bullish, -1 = bearish, 0 = neutral)
var float htfBiasRaw = 0.0
if (htfEmaFast > htfEmaSlow)
    htfBiasRaw := 1.0
else if (htfEmaFast < htfEmaSlow)
    htfBiasRaw := -1.0
else
    htfBiasRaw := 0.0

// HTF Bias Strength (distance between EMAs normalized by ATR)
htfBiasStrength = math.abs(htfEmaFast - htfEmaSlow) / htfAtr
htfBiasStrengthNorm = math.min(htfBiasStrength / 10, 1.0)  // Normalize to 0-1

// Combined HTF Score: direction * strength
htfScore = htfBiasRaw * htfBiasStrengthNorm

// =============================================================================
// LTF STRUCTURE CALCULATION
// =============================================================================

// LTF EMAs
emaFast = ta.ema(close, emaFastLen)
emaSlow = ta.ema(close, emaSlowLen)
emaMid = ta.ema(close, emaMidLen)

// EMA Stack Direction
var float emaStackDir = 0.0
emaAlignedBull = (emaFast > emaSlow) and (emaSlow > emaMid)
emaAlignedBear = (emaFast < emaSlow) and (emaSlow < emaMid)

if (emaAlignedBull)
    emaStackDir := 1.0
else if (emaAlignedBear)
    emaStackDir := -1.0
else
    emaStackDir := 0.0

// Price Distance from EMA (in ATR units)
atrLtf = ta.atr(extAtrLen)
distFromFastEma = math.abs(close - emaFast) / atrLtf

// =============================================================================
// REGIME DETECTION
// =============================================================================

// ADX Calculation
adxVal = ta.adx(adxLen)
plusDI = ta.plusdi(adxLen)
minusDI = ta.minusdi(adxLen)

// Is Trend Regime?
isTrendRegime = adxVal > adxThreshold

// ATR Expansion/Compression
atrCurrent = ta.atr(20)
atrHistoric = ta.atr(atrScaleLen)
atrRatio = atrCurrent / atrHistoric

var string volatilityRegime = "NORMAL"
if (atrRatio < atrCompressionThreshold)
    volatilityRegime := "LOW"
else if (atrRatio > atrExpansionThreshold)
    volatilityRegime := "HIGH"
else
    volatilityRegime := "NORMAL"

// Directional Efficiency Ratio
dirEff = math.abs(close - close[adxLen]) / (ta.sum(math.abs(change(close)), adxLen) + 0.0001)
dirEffNorm = math.min(dirEff, 1.0)

// Chop Index (0 = chop, 100 = clean trend)
chopIndex = 100 - (math.abs(plusDI - minusDI) / (plusDI + minusDI + 0.0001) * 100)
isChoppy = chopIndex < 50

// =============================================================================
// STRUCTURE & PULLBACK DETECTION
// =============================================================================

// Detect if in pullback within trend
// Pullback = price retreated toward slower EMA but didn't break structure
var float structureState = "RANGE"
pullbackDepth = 0.0

if (emaAlignedBull)
    // In uptrend - check if pulling back
    if (close < emaFast and close > emaSlow)
        structureState := "PULLBACK_UP"
        pullbackDepth := (emaFast - close) / atrLtf
    else if (close > emaFast)
        structureState := "EXPANSION_UP"
        pullbackDepth := (close - emaFast) / atrLtf
    else
        structureState := "RANGE"
else if (emaAlignedBear)
    // In downtrend - check if pulling back
    if (close > emaFast and close < emaSlow)
        structureState := "PULLBACK_DOWN"
        pullbackDepth := (close - emaFast) / atrLtf
    else if (close < emaFast)
        structureState := "EXPANSION_DOWN"
        pullbackDepth := (emaFast - close) / atrLtf
    else
        structureState := "RANGE"
else
    structureState := "RANGE"

// =============================================================================
// EXHAUSTION & MEAN REVERSION RISK
// =============================================================================

// Price Extension from Mid EMA (normalized ATR)
extensionFromMean = math.abs(close - emaMid) / atrLtf
isOverextended = extensionFromMean > extThreshold

// Wick/Body Ratio (for candle imbalance)
bodySize = math.abs(close - open)
upperWick = high - math.max(close, open)
lowerWick = math.min(close, open) - low

var float wickImbalance = 0.0
if (bodySize > 0)
    wickImbalance := math.max(upperWick, lowerWick) / bodySize
else
    wickImbalance := 1.0

isWickHeavy = wickImbalance > wickRatioThreshold

// ROC (Rate of Change) - momentum check
rocVal = ta.roc(close, rocLen)
isRocExtreme = math.abs(rocVal) > rocExtreme

// Volatility Spike (current ATR vs recent)
atrSpike = atrCurrent > ta.sma(atrCurrent, 20)[1] * 1.5

// Composite Exhaustion Score (0 = fresh, 100 = exhausted)
exhaustionScore = 0.0
if (isOverextended)
    exhaustionScore := exhaustionScore + 33.3
if (isWickHeavy)
    exhaustionScore := exhaustionScore + 33.3
if (isRocExtreme)
    exhaustionScore := exhaustionScore + 33.3

var string exhaustionRisk = "NONE"
if (exhaustionScore >= 66.6)
    exhaustionRisk := "HIGH"
else if (exhaustionScore >= 33.3)
    exhaustionRisk := "MODERATE"
else
    exhaustionRisk := "NONE"

// =============================================================================
// SESSION QUALITY
// =============================================================================

// Session detection (simplified hour-based)
hourUTC = hour(time, sessionTimezone)

// Define major sessions (UTC hours)
isAsiaSession = (hourUTC >= 0 and hourUTC < 7) or (hourUTC >= 21 and hourUTC <= 23)
isLondonSession = hourUTC >= 7 and hourUTC < 12
isNySession = hourUTC >= 12 and hourUTC < 17
isOffSession = not (isAsiaSession or isLondonSession or isNySession)

var string currentSession = "OTHER"
if (isAsiaSession)
    currentSession := "ASIA"
else if (isLondonSession)
    currentSession := "LONDON"
else if (isNySession)
    currentSession := "NY"
else
    currentSession := "OTHER"

// Session quality scoring
var float sessionQuality = 0.5
if (isLondonSession or isNySession)
    sessionQuality := 1.0
else if (isAsiaSession)
    sessionQuality := 0.7
else
    sessionQuality := 0.4

// Stand-down if strict mode and off-session
sessionOk = enableSessionFilter ? (strictSessionMode ? (currentSession != "OTHER") : true) : true

// =============================================================================
// VOLUME ORDER FLOW PROXY (SAFE PINE-COMPATIBLE)
// =============================================================================

// Signed volume proxy: direction * relative volume
volumeDir = math.sign(change(close)) * volume
volumeDirSum = ta.sma(volumeDir, 20)
volumeDirNorm = volumeDirSum / (ta.sma(volume, 20) + 0.0001)

// Momentum modifier from volume
volMomentum = math.sign(volumeDirNorm)

// =============================================================================
// COMPOSITE CONFIRMATION SCORES
// =============================================================================

// Normalize all components to 0-1
regimeScore = isTrendRegime ? dirEffNorm : (isChoppy ? 0.2 : 0.5)
structureScore = (emaStackDir != 0.0) ? 0.7 : 0.3
momentumScore = (math.abs(rocVal) / rocExtreme) * 0.5 + 0.5
momentumScore := math.min(momentumScore, 1.0)

// Apply modifiers
structureScoreModified = structureScore
if (structureState == "PULLBACK_UP" or structureState == "PULLBACK_DOWN")
    structureScoreModified := structureScoreModified * 1.2  // Pullback is good entry point
structureScoreModified := math.min(structureScoreModified, 1.0)

// Apply risk modifiers
exhaustionPenalty = exhaustionScore / 100.0
volPenalty = (volatilityRegime == "LOW") ? 0.3 : 0.0
sessionPenalty = sessionOk ? 0.0 : 0.5

// Final weighted scores
callScoreRaw = (
     (htfScore > 0 ? htfScore : 0.0) * weightHtf +
     regimeScore * (isTrendRegime ? 1.0 : 0.5) * weightRegime +
     (emaStackDir > 0 ? structureScoreModified : 0.0) * weightStructure +
     (rocVal > 0 ? momentumScore : 0.0) * weightMomentum
)

putScoreRaw = (
     (htfScore < 0 ? math.abs(htfScore) : 0.0) * weightHtf +
     regimeScore * (isTrendRegime ? 1.0 : 0.5) * weightRegime +
     (emaStackDir < 0 ? structureScoreModified : 0.0) * weightStructure +
     (rocVal < 0 ? momentumScore : 0.0) * weightMomentum
)

// Apply penalties
callScore = callScoreRaw * (1.0 - exhaustionPenalty - volPenalty - sessionPenalty) * 100.0
putScore = putScoreRaw * (1.0 - exhaustionPenalty - volPenalty - sessionPenalty) * 100.0

callScore := math.max(0, math.min(callScore, 100))
putScore := math.max(0, math.min(putScore, 100))

// =============================================================================
// MARKET STATE CLASSIFICATION
// =============================================================================

var string marketState = "NEUTRAL"

if (isChoppy or volatilityRegime == "LOW")
    marketState := "CHOP"
else if (isTrendRegime and emaAlignedBull)
    marketState := (structureState == "EXPANSION_UP") ? "TREND_EXP_UP" : "PULLBACK_UP"
else if (isTrendRegime and emaAlignedBear)
    marketState := (structureState == "EXPANSION_DOWN") ? "TREND_EXP_DOWN" : "PULLBACK_DOWN"
else if (exhaustionRisk == "HIGH")
    marketState := "EXHAUSTION"
else if (isOverextended)
    marketState := "EXTENDED"
else
    marketState := "RANGE"

// =============================================================================
// RISK FLAGS
// =============================================================================

var string riskFlag1 = "OK"
var string riskFlag2 = "OK"
var string riskFlag3 = "OK"
var string riskFlag4 = "OK"

if (isChoppy)
    riskFlag1 := "CHOP RISK"
if (volatilityRegime == "LOW")
    riskFlag2 := "LOW VOL"
if (exhaustionRisk == "HIGH")
    riskFlag3 := "EXHAUSTION RISK"
if (not sessionOk)
    riskFlag4 := "POOR SESSION"

// HTF/LTF Conflict check
htfLtfConflict = (htfBiasRaw != 0) and (emaStackDir != 0) and (htfBiasRaw != emaStackDir)
if (htfLtfConflict)
    riskFlag1 := "DIR CONFLICT"

// =============================================================================
// CONSENSUS OUTPUT
// =============================================================================

var string consensus = "WAIT"

callThreshold = 60.0
putThreshold = 60.0

if (callScore > callThreshold and putScore < callThreshold - 20)
    consensus := "CALL OK"
else if (putScore > putThreshold and callScore < putThreshold - 20)
    consensus := "PUT OK"
else if (isChoppy or volatilityRegime == "LOW" or exhaustionRisk == "HIGH" or not sessionOk)
    consensus := "STAND DOWN"
else
    consensus := "WAIT"

// Bias label
var string biasLabel = "NEUTRAL"
if (callScore > 70)
    biasLabel := "STRONG CALL"
else if (callScore > 50)
    biasLabel := "WEAK CALL"
else if (putScore > 70)
    biasLabel := "STRONG PUT"
else if (putScore > 50)
    biasLabel := "WEAK PUT"
else
    biasLabel := "NEUTRAL"

// =============================================================================
// STRATEGY SIMULATION (PROXY FOR 180s OPTIONS)
// =============================================================================

// Determine holding bars based on timeframe
holdingBars = timeframe.isseconds ? (timeframe.multiplier <= 15 ? simHoldingBars15s : simHoldingBars30s) : simHoldingBars30s
if (testMode)
    holdingBars := 1

// Track entry bar for time-based exit
var int entryBar = 0

// Cooldown logic
var int barsSinceEntry = 0
barsSinceEntry := barsSinceEntry + 1

canTrade = barsSinceEntry > simCooldown

// Entry signals
callSignal = (consensus == "CALL OK") and canTrade and (strategy.position_size == 0)
putSignal = (consensus == "PUT OK") and canTrade and (strategy.position_size == 0)

// Execute simulated trades
if (callSignal)
    strategy.entry(id="CALL_Validate", direction=strategy.long)
    entryBar := bar_index
    barsSinceEntry := 0

if (putSignal)
    strategy.entry(id="PUT_Validate", direction=strategy.short)
    entryBar := bar_index
    barsSinceEntry := 0

// Exit logic (time-based for 180s simulation)
if (strategy.position_size != 0)
    if (bar_index - entryBar >= holdingBars)
        strategy.close(id=strategy.opentrades.entry_id(0))

// =============================================================================
// VISUALS - DASHBOARD
// =============================================================================

// Dashboard table
var table dashboard = table.new(position.bottom_right, 2, 12, bgcolor=color.new(color.gray, 90), frame=true, frame_width=1)

// Update dashboard
if (barstate.islast)
    // Row 1: Title
    table.cell(dashboard, 0, 0, "MARKET STATE", text_color=color.white, text_size=size.normal)
    table.cell(dashboard, 1, 0, marketState, bgcolor=color.new(color.gray, 80), text_color=color.yellow, text_size=size.normal)
    
    // Row 2: Consensus
    table.cell(dashboard, 0, 1, "CONSENSUS", text_color=color.white, text_size=size.small)
    consensusColor = consensus == "CALL OK" ? color.green : (consensus == "PUT OK" ? color.red : (consensus == "STAND DOWN" ? color.orange : color.gray))
    table.cell(dashboard, 1, 1, consensus, bgcolor=color.new(consensusColor, 80), text_color=color.white, text_size=size.normal)
    
    // Row 3: Call Score
    table.cell(dashboard, 0, 2, "CALL Score", text_color=color.white, text_size=size.small)
    callScoreStr = str.tostring(callScore, "#.0")
    callScoreColor = callScore > 60 ? color.green : (callScore > 40 ? color.yellow : color.red)
    table.cell(dashboard, 1, 2, callScoreStr, bgcolor=color.new(callScoreColor, 80), text_color=color.white, text_size=size.small)
    
    // Row 4: Put Score
    table.cell(dashboard, 0, 3, "PUT Score", text_color=color.white, text_size=size.small)
    putScoreStr = str.tostring(putScore, "#.0")
    putScoreColor = putScore > 60 ? color.red : (putScore > 40 ? color.yellow : color.green)
    table.cell(dashboard, 1, 3, putScoreStr, bgcolor=color.new(putScoreColor, 80), text_color=color.white, text_size=size.small)
    
    // Row 5: Bias
    table.cell(dashboard, 0, 4, "BIAS", text_color=color.white, text_size=size.small)
    biasColor = callScore > putScore ? color.green : (putScore > callScore ? color.red : color.gray)
    table.cell(dashboard, 1, 4, biasLabel, bgcolor=color.new(biasColor, 80), text_color=color.white, text_size=size.small)
    
    // Row 6: HTF
    table.cell(dashboard, 0, 5, "HTF BIAS", text_color=color.white, text_size=size.small)
    htfStr = htfBiasRaw > 0 ? "BULL" : (htfBiasRaw < 0 ? "BEAR" : "NEUT")
    table.cell(dashboard, 1, 5, htfStr + " (" + str.tostring(htfBiasStrengthNorm * 100, "#.#") + "%)", text_color=color.white, text_size=size.small)
    
    // Row 7: Regime
    table.cell(dashboard, 0, 6, "REGIME", text_color=color.white, text_size=size.small)
    regimeStr = volatilityRegime + " / " + (isTrendRegime ? "TREND" : "RANGE")
    table.cell(dashboard, 1, 6, regimeStr, text_color=color.white, text_size=size.small)
    
    // Row 8: Structure
    table.cell(dashboard, 0, 7, "STRUCTURE", text_color=color.white, text_size=size.small)
    table.cell(dashboard, 1, 7, structureState, text_color=color.white, text_size=size.small)
    
    // Row 9: Session
    table.cell(dashboard, 0, 8, "SESSION", text_color=color.white, text_size=size.small)
    table.cell(dashboard, 1, 8, currentSession, text_color=color.white, text_size=size.small)
    
    // Row 10: Risk Flags
    table.cell(dashboard, 0, 9, "RISK", text_color=color.white, text_size=size.small)
    riskText = riskFlag1 + (riskFlag2 != "OK" ? "\n" + riskFlag2 : "") + (riskFlag3 != "OK" ? "\n" + riskFlag3 : "")
    riskColor = (riskFlag1 != "OK" or riskFlag2 != "OK" or riskFlag3 != "OK") ? color.orange : color.green
    table.cell(dashboard, 1, 9, riskText, bgcolor=color.new(riskColor, 85), text_color=color.white, text_size=size.small)
    
    // Row 11: Exhaustion
    table.cell(dashboard, 0, 10, "EXHAUSTION", text_color=color.white, text_size=size.small)
    table.cell(dashboard, 1, 10, exhaustionRisk, text_color=color.white, text_size=size.small)

// =============================================================================
// VISUALS - BACKGROUND TINTS BY STATE
// =============================================================================

bgColor = color.new(color.gray, 95)
if (marketState == "TREND_EXP_UP" or marketState == "PULLBACK_UP")
    bgColor := color.new(color.green, 95)
else if (marketState == "TREND_EXP_DOWN" or marketState == "PULLBACK_DOWN")
    bgColor := color.new(color.red, 95)
else if (marketState == "EXHAUSTION")
    bgColor := color.new(color.orange, 95)
else if (marketState == "CHOP")
    bgColor := color.new(color.blue, 95)

bgcolor(color=bgColor)

// =============================================================================
// PLOTTING (OPTIONAL VISUALS)
// =============================================================================

// Plot EMAs
plot(emaFast, color=color.orange, title="EMA Fast")
plot(emaSlow, color=color.purple, title="EMA Slow")
plot(emaMid, color=color.blue, title="EMA Mid", linewidth=2)

// Plot entry signals on chart
plotshape(callSignal, title="CALL Signal", location=location.belowbar, color=color.green, style=shape.triangleup, size=size.tiny, text="CALL")
plotshape(putSignal, title="PUT Signal", location=location.abovebar, color=color.red, style=shape.triangledown, size=size.tiny, text="PUT")

// Plot HTF bias ribbon
htfRibbonColor = htfBiasRaw > 0 ? color.new(color.green, 80) : (htfBiasRaw < 0 ? color.new(color.red, 80) : color.new(color.gray, 80))
plot(emaMid + (htfBiasRaw * atrLtf * 0.5), color=htfRibbonColor, title="HTF Bias Ribbon", linewidth=3)

// =============================================================================
// ALERTS
// =============================================================================

alertcondition(callSignal, title="CALL Signal", message="CALL OK - Confirming bullish bias")
alertcondition(putSignal, title="PUT Signal", message="PUT OK - Confirming bearish bias")
alertcondition(consensus == "STAND DOWN", title="Stand Down", message="Market state suggests standing down")
alertcondition(marketState == "EXHAUSTION", title="Exhaustion Warning", message="Market may be exhausted - caution")

// =============================================================================
// END OF STRATEGY
// =============================================================================
