# Backup Market State & Structure Confirmation Strategy
## Complete Setup Guide & Documentation

---

## 1. STRATEGY DESIGN PHILOSOPHY

### What This Strategy Is
This is a **market state engine** and **structure-aware confirmation system** designed as a BACKUP/VALIDATION layer for manual crypto options trading. It does NOT generate entry signals directly—instead, it evaluates market conditions and provides confidence scores for CALL/PUT decisions.

### How It Differs From Simple Entry Signal Scripts

**Traditional Entry Scripts:**
- Focus on single trigger conditions (breakout, ROC cross, etc.)
- Generate many signals
- Often ignore market context
- Can trigger during chop or exhaustion

**This Backup Strategy:**
- **Multi-component state engine**: Combines HTF bias, regime detection, structure analysis, exhaustion detection, volatility regimes, and session quality
- **Macro-aware**: Understands bigger picture before confirming short-term moves
- **Quality over quantity**: Designed to filter OUT bad trades rather than generate many signals
- **Structure-first**: Evaluates pullbacks, extensions, and mean-reversion risk
- **Confidence scoring**: Provides 0-100 scores for both CALL and PUT sides
- **Risk flagging**: Warns about chop, exhaustion, direction conflicts, low volatility

### Core Design Principles

1. **Market State Classification**: Categorizes market into discrete states (Trend Expansion, Pullback, Chop, Exhaustion)
2. **Composite Scoring**: Combines multiple independent signals with weighted contributions
3. **Non-Repainting**: All HTF data uses confirmed bars only (lookahead_off)
4. **Exhaustion Detection**: Identifies late-move risks and overextension
5. **Regime Awareness**: Distinguishes trending markets from choppy/compressed markets
6. **Session Quality**: Incorporates trading session context

---

## 2. COMPONENT BREAKDOWN

### A. HTF Bias + Strength (35% weight)
- **Purpose**: Establishes directional bias from higher timeframe
- **Method**: Fast EMA vs Slow EMA on HTF (default 3m on 30s chart)
- **Strength Metric**: Distance between EMAs normalized by HTF ATR
- **Output**: Bullish/Bearish/Neutral + Strength score
- **Why Important**: Short-term moves aligned with HTF trend are higher probability

### B. Regime Detection (25% weight)
- **Purpose**: Distinguish trending markets from choppy markets
- **Components**:
  - **ADX/DMI**: Measures trend strength (ADX ≥ 20 = trend regime)
  - **ATR Expansion**: Current ATR vs rolling average (expansion = trend fuel)
  - **Directional Efficiency**: Net move / Total move ratio (efficiency ≥ 0.4 = clean trend)
- **Output**: Trend / Chop / Compression classification
- **Why Important**: Avoids taking signals during random walk / chop phases

### C. Structure / Pullback Logic (20% weight)
- **Purpose**: Identifies clean structure vs pullbacks vs breakdowns
- **Components**:
  - **EMA Stack Slope**: Fast EMA (9) and Slow EMA (21) slopes
  - **Distance from Mean**: Price distance from micro EMA (5) in ATR units
  - **Pullback Detection**: Price pulling back within trend (healthy vs breakdown)
- **Output**: Structure Bullish/Bearish/Neutral + Pullback state
- **Why Important**: Pullbacks within trends are higher probability than exhaustion moves

### D. Exhaustion / Mean-Reversion Risk Detection
- **Purpose**: Avoids taking confirmation too late in moves
- **Components**:
  - **Price Extension**: Distance from mean ≥ 2.5 ATR = exhaustion warning
  - **ROC Extreme**: 10-bar ROC ≥ 2% = potential exhaustion
  - **Wick/Body Imbalance**: Large wicks relative to body = rejection/exhaustion
  - **Volatility Spike**: High ATR after extended move = chaos risk
- **Output**: Exhaustion flags + confidence penalty
- **Why Important**: Prevents entering at tops/bottoms of moves

### E. Volatility Regime Classification
- **Purpose**: Adjusts confidence based on volatility environment
- **Classification**:
  - **LOW**: ATR ratio ≤ 0.7 → Often triggers "Stand Down"
  - **NORMAL**: 0.7 < ATR ratio < 1.5 → Standard confidence
  - **HIGH**: ATR ratio ≥ 1.5 → Can be good but watch for exhaustion
- **Why Important**: Low vol = low edge, high vol = higher risk but also opportunity

### F. Session Quality Scoring
- **Purpose**: Incorporates trading session context
- **Sessions**: NY (preferred), London, Asia, Other
- **Scoring**: NY session = +10% confidence boost, Other = -10% penalty
- **Why Important**: Liquidity and volatility vary by session

### G. Order Flow Proxy (Optional, 10% weight)
- **Purpose**: Signed volume imbalance as confidence modifier
- **Method**: Sum of (price_change_sign × volume) over lookback period
- **Output**: Bullish/Bearish/Neutral order flow signal
- **Why Important**: Volume confirmation adds edge, but not a hard gate

---

## 3. OUTPUT EXPLANATION

### A. Bias State (Primary Output)
- **STRONG CALL BIAS**: Call confidence ≥ 70%, favorable conditions
- **WEAK CALL BIAS**: Call confidence 50-69%, moderate conditions
- **NEUTRAL / CHOP**: Confidence < 50% on both sides, unclear
- **WEAK PUT BIAS**: Put confidence 50-69%, moderate conditions
- **STRONG PUT BIAS**: Put confidence ≥ 70%, favorable conditions
- **STAND DOWN**: Low volatility OR exhaustion risk with low confidence

### B. Confidence Scores (0-100)
- **Call Confidence**: 0-100 score for CALL-side edge
- **Put Confidence**: 0-100 score for PUT-side edge
- **Interpretation**:
  - ≥ 70: Strong edge, high confidence
  - 50-69: Moderate edge, acceptable
  - < 50: Weak edge, avoid or wait

### C. Market State Classification
- **TREND EXPANSION UP/DOWN**: Clean trending move, efficient, expanded volatility
- **TREND PULLBACK UP/DOWN**: Healthy pullback within trend (often good entry)
- **CHOP / COMPRESSION**: Low efficiency, compressed volatility, avoid
- **EXHAUSTION UP/DOWN**: Extended move, late stage, high risk
- **NEUTRAL**: Unclear structure

### D. Risk Flags
- **CHOP RISK**: Market in choppy/compressed regime
- **LATE MOVE**: Price extended from mean, exhaustion risk
- **LOW VOL**: Volatility below normal, reduced edge
- **EXHAUSTION RISK**: Multiple exhaustion signals active
- **DIRECTION CONFLICT**: HTF bias conflicts with structure (LTF vs HTF mismatch)

### E. Consensus Mode (Simplified)
- **CALL OK**: Call confidence ≥ min threshold, no major risk flags
- **PUT OK**: Put confidence ≥ min threshold, no major risk flags
- **WAIT**: Confidence below threshold OR risk flags present
- **STAND DOWN**: Low volatility OR exhaustion with low confidence

---

## 4. MAJOR INPUTS EXPLANATION

### HTF Settings
- **HTF Multiplier**: 6 = 3-minute HTF on 30s chart (default). Adjust based on your chart timeframe.
- **HTF Fast EMA**: 21 (default). Faster EMA for trend direction.
- **HTF Slow EMA**: 50 (default). Slower EMA for trend confirmation.
- **HTF Strength Threshold**: 1.5 ATR (default). Minimum EMA separation for "strong" trend.

### Regime Detection
- **ADX Length**: 14 (default). Period for ADX calculation.
- **ADX Trend Threshold**: 20.0 (default). ADX ≥ 20 = trend regime.
- **ATR Length**: 14 (default). Period for ATR calculation.
- **ATR Expansion Factor**: 1.3 (default). ATR ratio ≥ 1.3 = expanded volatility.
- **Efficiency Length**: 20 (default). Lookback for directional efficiency.
- **Efficiency Threshold**: 0.4 (default). Efficiency ≥ 0.4 = clean directional move.

### Structure Settings
- **Structure Fast EMA**: 9 (default). Fast structure EMA.
- **Structure Slow EMA**: 21 (default). Slow structure EMA.
- **Pullback Depth (ATR)**: 1.0 (default). Maximum pullback depth in ATR units.
- **Extension Warning (ATR)**: 2.5 (default). Price extension ≥ 2.5 ATR triggers exhaustion warning.

### Exhaustion Detection
- **Exhaustion ROC Length**: 10 (default). Period for ROC calculation.
- **Exhaustion ROC Threshold**: 2.0% (default). ROC ≥ 2% = extreme move.
- **Wick/Body Exhaustion Ratio**: 2.0 (default). Wick/Body ≥ 2.0 = exhaustion signal.

### Volatility Regime
- **Low Vol Threshold**: 0.7 (default). ATR ratio ≤ 0.7 = low volatility.
- **High Vol Threshold**: 1.5 (default). ATR ratio ≥ 1.5 = high volatility.
- **Volatility Lookback**: 50 (default). Period for ATR rolling average.

### Strategy Simulation
- **Hold Bars (30s chart)**: 6 (default). 6 bars × 30s = 180 seconds hold period.
- **Cooldown Bars**: 3 (default). Minimum bars between entries.
- **Min Confidence Score**: 60 (default). Minimum confidence to trigger strategy entry.

### Display & Testing
- **Test Mode**: When enabled, lowers effective thresholds by 20% for more frequent updates during verification.

---

## 5. RECOMMENDED SETTINGS

### BTC 30s Chart Settings

**HTF Settings:**
- HTF Multiplier: 6 (3-minute HTF)
- HTF Fast EMA: 21
- HTF Slow EMA: 50
- HTF Strength Threshold: 1.5

**Regime Detection:**
- ADX Length: 14
- ADX Trend Threshold: 20.0
- ATR Length: 14
- ATR Expansion Factor: 1.3
- Efficiency Length: 20
- Efficiency Threshold: 0.4

**Structure:**
- Structure Fast EMA: 9
- Structure Slow EMA: 21
- Pullback Depth: 1.0 ATR
- Extension Warning: 2.5 ATR

**Exhaustion:**
- Exhaustion ROC Length: 10
- Exhaustion ROC Threshold: 2.0%
- Wick/Body Ratio: 2.0

**Volatility:**
- Low Vol Threshold: 0.7
- High Vol Threshold: 1.5
- Volatility Lookback: 50

**Strategy:**
- Hold Bars: 6 (180 seconds)
- Cooldown Bars: 3
- Min Confidence: 60

**Session:**
- Enable Session Filter: ON
- Prefer NY Session: ON

**Order Flow:**
- Enable Order Flow Proxy: ON
- Order Flow Length: 20

### ETH 30s Chart Settings

ETH settings are **identical to BTC** with one potential adjustment:

**Optional ETH Adjustment:**
- Efficiency Threshold: 0.35 (slightly lower, as ETH can be slightly less efficient than BTC)
- Extension Warning: 2.3 ATR (slightly lower, ETH can extend more)

**All other settings remain the same as BTC.**

### 15s Chart Settings

If using 15s chart instead of 30s:

**HTF Settings:**
- HTF Multiplier: 12 (3-minute HTF on 15s chart)
- All other HTF settings remain the same

**Strategy:**
- Hold Bars: 12 (12 bars × 15s = 180 seconds)

**All other settings remain the same as 30s chart.**

---

## 6. HOW TO USE WITH A SEPARATE ENTRY INDICATOR

### Integration Workflow

1. **Run Both Scripts**: Load your primary entry indicator AND this backup strategy on the same chart.

2. **Wait for Primary Signal**: Your primary indicator generates an entry signal (CALL or PUT).

3. **Check Backup Strategy State**:
   - **If Consensus = "CALL OK"** → Primary CALL signal is VALIDATED → Execute CALL
   - **If Consensus = "PUT OK"** → Primary PUT signal is VALIDATED → Execute PUT
   - **If Consensus = "WAIT"** → Primary signal is NOT VALIDATED → Stand down
   - **If Consensus = "STAND DOWN"** → Market conditions unfavorable → Stand down

### Decision Matrix

| Primary Signal | Backup Consensus | Action |
|----------------|------------------|--------|
| CALL | CALL OK | ✅ Execute CALL |
| CALL | PUT OK | ❌ Stand down (conflict) |
| CALL | WAIT | ⚠️ Stand down (low confidence) |
| CALL | STAND DOWN | ❌ Stand down (unfavorable conditions) |
| PUT | PUT OK | ✅ Execute PUT |
| PUT | CALL OK | ❌ Stand down (conflict) |
| PUT | WAIT | ⚠️ Stand down (low confidence) |
| PUT | STAND DOWN | ❌ Stand down (unfavorable conditions) |

### When to Trust CALL Signals

✅ **Trust CALL when:**
- Consensus = "CALL OK"
- Bias State = "STRONG CALL BIAS" or "WEAK CALL BIAS"
- Call Confidence ≥ 60%
- No risk flags (especially no DIRECTION CONFLICT or EXHAUSTION RISK)
- Market State = "TREND EXPANSION UP" or "TREND PULLBACK UP"
- HTF Bias = BULLISH (preferably STRONG)

❌ **Do NOT trust CALL when:**
- Consensus = "WAIT" or "STAND DOWN"
- Risk flags present (especially CHOP RISK, EXHAUSTION RISK, DIRECTION CONFLICT)
- Put Confidence > Call Confidence
- Market State = "CHOP / COMPRESSION" or "EXHAUSTION UP"
- HTF Bias = BEARISH

### When to Trust PUT Signals

✅ **Trust PUT when:**
- Consensus = "PUT OK"
- Bias State = "STRONG PUT BIAS" or "WEAK PUT BIAS"
- Put Confidence ≥ 60%
- No risk flags (especially no DIRECTION CONFLICT or EXHAUSTION RISK)
- Market State = "TREND EXPANSION DOWN" or "TREND PULLBACK DOWN"
- HTF Bias = BEARISH (preferably STRONG)

❌ **Do NOT trust PUT when:**
- Consensus = "WAIT" or "STAND DOWN"
- Risk flags present (especially CHOP RISK, EXHAUSTION RISK, DIRECTION CONFLICT)
- Call Confidence > Put Confidence
- Market State = "CHOP / COMPRESSION" or "EXHAUSTION DOWN"
- HTF Bias = BULLISH

### When to Stand Down (Even If Primary Indicator Signals)

**Always stand down when:**
- Consensus = "STAND DOWN"
- Risk flags: CHOP RISK + LOW VOL (double whammy)
- Risk flags: EXHAUSTION RISK + LATE MOVE
- Risk flags: DIRECTION CONFLICT (HTF vs Structure mismatch)
- Volatility = LOW (reduced edge)
- Both Call and Put Confidence < 50%

**Consider standing down when:**
- Consensus = "WAIT"
- Only one risk flag present but confidence is marginal (50-60%)
- Market State = "CHOP / COMPRESSION" for extended period

---

## 7. TROUBLESHOOTING GUIDE

### Problem: Strategy Shows "NEUTRAL / CHOP" Too Often

**Possible Causes:**
1. **Market is actually choppy**: This is correct behavior—the strategy is filtering out low-quality conditions.
2. **Thresholds too strict**: ADX threshold, efficiency threshold, or confidence thresholds may be too high.
3. **HTF not aligned**: HTF multiplier may be too high, causing HTF to be too slow.

**Solutions:**
- **Verify market conditions**: Check ADX, efficiency, and ATR expansion manually. If market is genuinely choppy, this is correct.
- **Lower thresholds slightly**:
  - ADX Trend Threshold: 20 → 18
  - Efficiency Threshold: 0.4 → 0.35
  - Min Confidence: 60 → 55
- **Adjust HTF**: Try HTF Multiplier: 6 → 4 (faster HTF)
- **Enable Test Mode**: Temporarily enable Test Mode to see if states update more frequently.

### Problem: Strategy Never Triggers Trades

**Possible Causes:**
1. **Min Confidence too high**: Default is 60, may need lowering.
2. **Cooldown too long**: Cooldown bars may prevent entries.
3. **Risk flags always active**: Exhaustion or conflict flags blocking entries.
4. **Market genuinely unfavorable**: Strategy is working correctly by filtering bad conditions.

**Solutions:**
- **Lower Min Confidence**: 60 → 50 (but be cautious—this reduces quality filter)
- **Reduce Cooldown**: Cooldown Bars: 3 → 1
- **Check Risk Flags**: Review dashboard to see which flags are active. If exhaustion/conflict flags are always on, market may be too extended or conflicted.
- **Enable Test Mode**: See if trades trigger more often (but remember Test Mode is for verification only).

### Problem: Strategy Triggers Too Many Trades

**Possible Causes:**
1. **Min Confidence too low**: Lower threshold allows more marginal trades.
2. **Test Mode enabled**: Test Mode lowers effective thresholds.
3. **Thresholds too loose**: ADX, efficiency, or exhaustion thresholds may be too permissive.

**Solutions:**
- **Raise Min Confidence**: 60 → 65 or 70
- **Disable Test Mode**: If enabled, disable it.
- **Tighten thresholds**:
  - ADX Trend Threshold: 20 → 22
  - Efficiency Threshold: 0.4 → 0.45
  - Extension Warning: 2.5 → 2.8 ATR
- **Increase Cooldown**: Cooldown Bars: 3 → 5

### Problem: Strategy Shows Wrong Direction (CALL OK During Downtrend)

**Possible Causes:**
1. **HTF data lag**: HTF may be slower to flip than expected.
2. **Structure overriding HTF**: Structure logic may be conflicting with HTF.
3. **Order flow proxy**: Signed volume may be showing bullish while price is bearish.

**Solutions:**
- **Check HTF Bias in Dashboard**: Verify HTF is actually bullish. If HTF is bearish but strategy shows CALL OK, there may be a logic issue (should not happen with default settings).
- **Review Risk Flags**: Check for DIRECTION CONFLICT flag—this warns when HTF and structure conflict.
- **Disable Order Flow**: Temporarily disable Order Flow Proxy to see if it's causing the issue.
- **Verify HTF Timeframe**: Ensure HTF Multiplier is correct for your chart timeframe.

### Problem: Exhaustion Warnings Too Frequent

**Possible Causes:**
1. **Extension Warning threshold too low**: 2.5 ATR may be too sensitive.
2. **ROC threshold too low**: 2.0% may trigger too often.
3. **Market is genuinely extended**: Strategy is correctly identifying exhaustion.

**Solutions:**
- **Raise Extension Warning**: 2.5 → 3.0 ATR
- **Raise ROC Threshold**: 2.0% → 2.5%
- **Verify market conditions**: If market is genuinely extended, this is correct behavior.

### Problem: Low Volatility Always Triggers "STAND DOWN"

**Possible Causes:**
1. **Low Vol Threshold too high**: 0.7 may be too sensitive.
2. **Market is genuinely low volatility**: Strategy is correctly identifying low-edge conditions.

**Solutions:**
- **Lower Low Vol Threshold**: 0.7 → 0.6 (but be cautious—low vol = low edge)
- **Disable Session Filter temporarily**: See if session scoring is contributing.
- **Accept low vol stand-down**: Low volatility periods often have reduced edge—standing down may be correct.

### How to Tune Without Making It Reckless

**Golden Rules:**
1. **Never lower Min Confidence below 50**: Below 50 = marginal edge.
2. **Never disable exhaustion detection entirely**: Exhaustion detection prevents late entries.
3. **Never set ADX Trend Threshold below 15**: Below 15 = accepting chop as trend.
4. **Never set Efficiency Threshold below 0.3**: Below 0.3 = accepting random walk.
5. **Always keep at least 2 risk flags active**: Risk flags are safety nets.

**Safe Tuning Approach:**
1. **Start with Test Mode**: Enable Test Mode to see how states change with lower thresholds.
2. **Adjust one parameter at a time**: Change one input, observe for 20-30 minutes, then adjust another.
3. **Monitor Risk Flags**: If risk flags disappear after tuning, verify market conditions haven't actually improved.
4. **Compare with manual analysis**: Verify strategy outputs match your manual market structure analysis.
5. **Revert if quality degrades**: If trade quality decreases after tuning, revert changes.

---

## 8. TEST MODE USAGE

### What Test Mode Does
- **Lowers effective confidence thresholds by 20%**: Makes states update more frequently for verification.
- **Does NOT change underlying logic**: All components still work the same way.
- **For verification only**: Use to verify strategy is working correctly, then disable for live trading.

### When to Use Test Mode
- **Initial setup**: Verify strategy is updating states correctly.
- **Parameter tuning**: See how changes affect state transitions.
- **Market condition verification**: Confirm strategy correctly identifies market states.
- **Learning**: Understand how different market conditions trigger different states.

### When NOT to Use Test Mode
- **Live trading**: Disable Test Mode for actual trading decisions.
- **Backtesting**: Test Mode skews results—use normal mode for backtesting.
- **Final validation**: Use normal mode for final validation before going live.

---

## 9. STRATEGY SIMULATION BEHAVIOR

### How Strategy Entries Work
- **Purpose**: Simulate validation trades for CALL/PUT decisions (NOT direct broker execution).
- **Entry Logic**: 
  - Enters LONG when Consensus = "CALL OK" (simulates CALL validation)
  - Enters SHORT when Consensus = "PUT OK" (simulates PUT validation)
- **Hold Period**: Fixed bars based on chart timeframe (6 bars on 30s = 180 seconds).
- **Exit Logic**: Time-based exit after hold period (simulates 180-second expiry).

### Understanding Strategy Performance
- **Win Rate**: Percentage of simulated trades that are profitable.
- **Average Trade**: Average profit/loss per simulated trade.
- **Drawdown**: Maximum equity drawdown during simulation.
- **Trade Frequency**: Number of trades per day/week.

### Important Notes
- **Strategy trades are PROXIES**: They simulate validation, not actual broker execution.
- **Real execution**: You manually execute CALL/PUT on myrockitcoin.com based on Consensus output.
- **Strategy performance ≠ Real performance**: Strategy uses fixed hold period, real trades have variable outcomes.
- **Use for signal quality evaluation**: Strategy performance helps evaluate signal quality and filtering effectiveness.

---

## 10. VISUAL ELEMENTS GUIDE

### Dashboard Table (Top Right)
- **BIAS STATE**: Current bias classification (STRONG CALL/PUT, NEUTRAL, STAND DOWN).
- **CONSENSUS**: Simplified output (CALL OK, PUT OK, WAIT, STAND DOWN).
- **CALL CONF / PUT CONF**: Confidence scores (0-100%).
- **MARKET STATE**: Market state classification.
- **HTF BIAS**: Higher timeframe bias and strength.
- **REGIME**: Trend / Chop / Mixed classification.
- **VOLATILITY**: LOW / NORMAL / HIGH classification.
- **ADX**: Current ADX value (trend strength).
- **SESSION**: Current trading session.
- **RISK FLAGS**: Active risk warnings.
- **EFFICIENCY**: Directional efficiency ratio.
- **ORDER FLOW**: Signed volume bias (if enabled).
- **HTF**: Higher timeframe identifier.

### Labels
- **State Labels**: Show bias state, market state, confidence scores, and consensus on chart.
- **Color Coding**:
  - Green (Lime): Strong bullish / CALL OK
  - Red: Strong bearish / PUT OK
  - Orange: Warnings / Stand Down
  - Gray: Neutral / Chop
  - Blue: Pullback states

### Background Tint
- **Green Tint**: Strong CALL bias active.
- **Red Tint**: Strong PUT bias active.
- **Orange Tint**: Stand Down state active.
- **No Tint**: Neutral or weak bias.

### HTF Bias Ribbon
- **Blue Ribbon**: HTF bullish bias.
- **Red Ribbon**: HTF bearish bias.
- **Gray Ribbon**: HTF neutral.

---

## 11. FINAL CHECKLIST

Before using this strategy for live trading:

- [ ] Strategy compiles with ZERO errors in TradingView Pine Editor
- [ ] All inputs are set to recommended values (BTC/ETH 30s)
- [ ] Test Mode is DISABLED
- [ ] Dashboard table is visible and updating
- [ ] HTF timeframe is correct for your chart (6 for 30s, 12 for 15s)
- [ ] Session timezone is correct for your location
- [ ] Strategy entries/exits are visible (if using for simulation)
- [ ] You understand Consensus output meanings
- [ ] You understand Risk Flags meanings
- [ ] You have tested integration with your primary entry indicator
- [ ] You know when to trust CALL vs PUT vs STAND DOWN

---

## 12. QUICK REFERENCE

### Consensus Meanings
- **CALL OK**: Execute CALL if primary indicator signals CALL
- **PUT OK**: Execute PUT if primary indicator signals PUT
- **WAIT**: Stand down, wait for better conditions
- **STAND DOWN**: Unfavorable conditions, do not trade

### Risk Flags Meanings
- **CHOP**: Market in choppy/compressed regime
- **LATE**: Price extended, exhaustion risk
- **LOW_VOL**: Low volatility, reduced edge
- **EXH**: Exhaustion signals active
- **CONFLICT**: HTF bias conflicts with structure

### Market States Meanings
- **TREND EXPANSION**: Clean trending move, high probability
- **TREND PULLBACK**: Healthy pullback within trend, good entry
- **CHOP / COMPRESSION**: Low efficiency, avoid
- **EXHAUSTION**: Late stage move, high risk
- **NEUTRAL**: Unclear structure

---

## END OF GUIDE

This backup strategy is designed to be a **validation layer** that helps you avoid bad trades and confirms good ones. It prioritizes **accuracy over frequency** and focuses on **market structure and state awareness**.

Use it alongside your primary entry indicator to improve decision quality and reduce false signals.

Good luck with your trading!
