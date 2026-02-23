# Market State Validation Engine - Complete Setup Guide

## 📋 Table of Contents
1. [Strategy Overview](#strategy-overview)
2. [Core Design Philosophy](#core-design-philosophy)
3. [Installation](#installation)
4. [Input Parameters Explained](#input-parameters-explained)
5. [Recommended Settings](#recommended-settings)
6. [How to Use With Primary Indicator](#how-to-use-with-primary-indicator)
7. [Dashboard Interpretation](#dashboard-interpretation)
8. [Troubleshooting](#troubleshooting)
9. [Test Mode](#test-mode)

---

## 📖 Strategy Overview

**Market State Validation Engine (MSVE)** is a backup/confirmation strategy designed for 180-second crypto options trading on myrockitcoin.com. Unlike typical breakout or momentum indicators, MSVE is a **macro-structure awareness system** that tells you:

- ✅ **WHEN to trust your primary entry signals** (CALL OK / PUT OK)
- ⛔ **WHEN to stand down** despite entry signals (choppy, exhausted, low-quality market)
- 🧭 **WHAT market state you're in** (trending, pullback, chop, exhaustion)
- ⚠️ **WHAT risks are present** (extension, conflict, low vol)

### Key Differences from Primary Indicators
| **Primary Indicator** | **MSVE (Backup)** |
|-----------------------|-------------------|
| Micro breakouts, impulse candles | Macro structure, HTF bias |
| Entry trigger generation | Entry validation/filtering |
| High frequency | High accuracy (fewer signals) |
| LTF focused | Multi-timeframe regime aware |
| Breakout/ROC logic | State engine + confirmation scoring |

---

## 🎯 Core Design Philosophy

### 1. **Market State Classification**
MSVE continuously classifies the market into states:
- **TREND EXPANSION ↑/↓**: Strong trending with volatility expansion (best conditions)
- **TREND PULLBACK ↑/↓**: Healthy pullback within trend (good for re-entry)
- **TRENDING ↑/↓**: Directional but not expanding (moderate conditions)
- **COMPRESSION / CHOP**: Low ADX, sideways (avoid trading)
- **EXHAUSTION RISK ↑/↓**: Overextended, reversal risk (stand down)
- **LOW VOL - STAND DOWN**: Volatility too low for reliable 180s expiries
- **HTF ↑/↓ / LTF CONFLICT**: Directional disagreement between timeframes (caution)
- **NEUTRAL**: No clear bias

### 2. **Confirmation Scoring (0-100)**
Two separate scores are calculated:
- **CALL SCORE**: Bull confidence based on HTF bias, regime quality, structure, session, volatility
- **PUT SCORE**: Bear confidence based on same components

Scores are weighted composites of:
- HTF Bias (25%): Are we aligned with higher timeframe trend?
- Regime Quality (20%): Is ADX trending? Is efficiency high?
- Structure (25%): Are EMAs stacked? Is price extended?
- Session (15%): Are we in high-quality trading hours?
- Volatility (15%): Is volatility regime conducive?

Risk penalties applied:
- **Exhaustion**: -30 points
- **Extension**: -15 points
- **Chop**: -20 points
- **Low Vol**: -25 points

### 3. **Consensus Mode**
Simplified one-line output:
- **✓ CALL OK**: High confidence for CALL, all systems green
- **✓ PUT OK**: High confidence for PUT, all systems green
- **⊗ WAIT**: Conflicting signals or insufficient confidence
- **✖ STAND DOWN**: Active risk flags, do not trade

### 4. **Risk Flags**
Five binary flags displayed in dashboard:
- **Chop Risk**: ADX < trend threshold, low efficiency
- **Late/Extended**: Price too far from micro EMA
- **Low Vol**: ATR ratio below threshold
- **Exhaustion**: Distance from mean + ROC extreme + wick imbalance
- **HTF/LTF Conflict**: HTF and LTF disagree on direction

---

## 💻 Installation

1. Copy the entire code from `market_state_validation_engine.pine`
2. Open TradingView
3. Navigate to Pine Editor (bottom panel)
4. Paste the code
5. Click "Add to Chart"
6. The strategy will load with default settings optimized for BTC/ETH 30s charts

**No compilation errors should occur.** If you see errors, ensure you're using Pine Script v6 and have copied the entire script.

---

## ⚙️ Input Parameters Explained

### **HTF Bias Configuration**
- **HTF Timeframe** (default: `3`): Higher timeframe for bias detection. Use `3` (3-minute) for 30s/15s charts. For very fast scalping, try `1` (1-minute).
- **HTF Fast EMA** (default: `8`): Fast EMA on HTF. Lower = more reactive.
- **HTF Slow EMA** (default: `21`): Slow EMA on HTF. Crossover determines HTF direction.
- **HTF Strength Period** (default: `14`): ATR period for normalizing HTF EMA distance. Higher = smoother strength measurement.

### **Regime Detection**
- **ADX Length** (default: `14`): Standard ADX calculation period. Lower = more sensitive to trend changes.
- **ADX Trend Threshold** (default: `25`): Minimum ADX to consider trending. Below = chop. Standard value.
- **ADX Strong Threshold** (default: `40`): ADX for strong trend classification. Above = very strong trend.
- **ATR Length** (default: `14`): ATR period for volatility measurement. Standard value.
- **Efficiency Period** (default: `20`): Lookback for directional efficiency calculation. Higher = smoother.

### **Structure & Pullback**
- **Micro EMA** (default: `5`): Very fast EMA for immediate price structure. Used for extension detection.
- **Trend EMA Fast** (default: `8`): Fast trend EMA.
- **Trend EMA Slow** (default: `21`): Slow trend EMA. Stack alignment = strong structure.
- **Pullback Depth (ATR)** (default: `1.2`): Minimum ATR distance to classify as pullback. Lower = more pullbacks detected.
- **Extension Threshold (ATR)** (default: `2.0`): Distance from micro EMA to flag as extended. Lower = stricter.

### **Exhaustion Detection**
- **Exhaustion Distance (ATR)** (default: `2.5`): Distance from 20 SMA to flag exhaustion. Lower = earlier warnings.
- **ROC Length** (default: `3`): Rate of change period. Lower = faster ROC.
- **ROC Extreme Threshold %** (default: `2.0`): Minimum ROC % to flag extreme. Lower = more sensitive.
- **Wick/Body Imbalance Ratio** (default: `2.0`): Wick-to-body ratio to flag exhaustion candles. Lower = stricter.

### **Volatility Regime**
- **Vol Regime Fast ATR** (default: `5`): Fast ATR for volatility regime.
- **Vol Regime Slow ATR** (default: `20`): Slow ATR for volatility regime.
- **Low Vol Threshold** (default: `0.6`): Fast/Slow ATR ratio below = LOW vol. Higher = fewer low vol flags.
- **High Vol Threshold** (default: `1.4`): Fast/Slow ATR ratio above = HIGH vol. Lower = more high vol flags.

### **Session Quality**
- **Enable Session Filter** (default: `true`): Whether to use session scoring.
- **Asia Session Score** (default: `60`): 0-100 score for Asia hours (00:00-08:00 UTC).
- **London Session Score** (default: `90`): 0-100 score for London hours (08:00-16:00 UTC).
- **NY Session Score** (default: `95`): 0-100 score for NY hours (13:00-21:00 UTC).
- **Other Session Score** (default: `50`): Score for non-peak hours.

**Note**: Crypto markets are 24/7, but institutional activity peaks during these sessions. Adjust based on your preferred trading hours.

### **Strategy Behavior**
- **Holding Period (bars)** (default: `6`): 
  - 30s chart: `6` bars = 180 seconds
  - 15s chart: `12` bars = 180 seconds
  - Adjust if using different chart timeframes
- **Cooldown Between Trades (bars)** (default: `3`): Minimum bars to wait after closing before new entry. Prevents overtrading.
- **Min Confidence for Entry** (default: `65`): Minimum CALL/PUT score to trigger strategy entry. Lower = more trades, higher = fewer/better trades.

### **Confirmation Scoring Weights**
Fine-tune the importance of each component (must sum conceptually to importance balance):
- **HTF Bias Weight** (default: `0.25`)
- **Regime Quality Weight** (default: `0.20`)
- **Structure Weight** (default: `0.25`)
- **Session Weight** (default: `0.15`)
- **Volatility Weight** (default: `0.15`)

**Advanced users**: Increase HTF weight if you want stronger HTF alignment requirement. Increase Structure weight for more price action focus.

### **Visual Settings**
- **Show Dashboard** (default: `true`): Display right-side table with all metrics.
- **Show State Labels** (default: `true`): Print labels on chart when market state changes.
- **Show Background Tint** (default: `true`): Color background green (CALL OK), red (PUT OK), orange (STAND DOWN).
- **Test Mode** (default: `false`): Increases sensitivity of regime/structure/vol scores by 20-30%. Use for testing; disable for live trading.

---

## 🎚️ Recommended Settings

### **BTC 30s Chart (Conservative)**
```
HTF Timeframe: 3
HTF Fast EMA: 8
HTF Slow EMA: 21
ADX Length: 14
ADX Trend Threshold: 25
ADX Strong Threshold: 40
Pullback Depth (ATR): 1.2
Extension Threshold (ATR): 2.0
Exhaustion Distance (ATR): 2.5
Low Vol Threshold: 0.6
High Vol Threshold: 1.4
Holding Period (bars): 6
Min Confidence for Entry: 70
Session Filter: Enabled
Test Mode: OFF
```

**Characteristics**: Fewer trades, higher quality, strict filtering. Good for volatile BTC conditions.

### **BTC 30s Chart (Balanced)**
```
HTF Timeframe: 3
HTF Fast EMA: 8
HTF Slow EMA: 21
ADX Length: 14
ADX Trend Threshold: 23
ADX Strong Threshold: 38
Pullback Depth (ATR): 1.0
Extension Threshold (ATR): 2.2
Exhaustion Distance (ATR): 2.8
Low Vol Threshold: 0.55
High Vol Threshold: 1.5
Holding Period (bars): 6
Min Confidence for Entry: 65
Session Filter: Enabled
Test Mode: OFF
```

**Characteristics**: Moderate trade frequency, balanced risk/reward. **DEFAULT RECOMMENDED**.

### **BTC 30s Chart (Aggressive - More Signals)**
```
HTF Timeframe: 3
HTF Fast EMA: 6
HTF Slow EMA: 18
ADX Length: 12
ADX Trend Threshold: 20
ADX Strong Threshold: 35
Pullback Depth (ATR): 0.8
Extension Threshold (ATR): 2.5
Exhaustion Distance (ATR): 3.0
Low Vol Threshold: 0.5
High Vol Threshold: 1.6
Holding Period (bars): 6
Min Confidence for Entry: 60
Session Filter: Enabled
Test Mode: OFF
```

**Characteristics**: More trades, earlier entries. Higher risk of false signals during chop.

### **ETH 30s Chart (Recommended)**
```
HTF Timeframe: 3
HTF Fast EMA: 8
HTF Slow EMA: 21
ADX Length: 14
ADX Trend Threshold: 24
ADX Strong Threshold: 39
Pullback Depth (ATR): 1.1
Extension Threshold (ATR): 2.1
Exhaustion Distance (ATR): 2.6
Low Vol Threshold: 0.58
High Vol Threshold: 1.45
Holding Period (bars): 6
Min Confidence for Entry: 66
Session Filter: Enabled
Test Mode: OFF
```

**Characteristics**: ETH tends to be slightly smoother than BTC. Slightly relaxed thresholds vs BTC conservative.

### **15s Chart Adjustments**
If using 15s charts:
- **Holding Period**: Change to `12` (12 bars × 15s = 180s)
- **HTF Timeframe**: Consider using `1` or `2` minute HTF for faster response
- **ADX Length**: Consider lowering to `12` for faster regime detection
- **Min Confidence**: May need to raise to `68-72` due to increased noise on 15s

---

## 🤝 How to Use With Primary Indicator

### Workflow Integration

**STEP 1: Load Both Indicators**
- Primary indicator: Your existing breakout/impulse entry system
- MSVE (this strategy): Load on same chart

**STEP 2: Wait for Primary Signal**
- Your primary indicator prints CALL or PUT signal
- **Do NOT execute immediately**

**STEP 3: Check MSVE Consensus**
```
IF primary indicator shows CALL signal:
  → Check MSVE dashboard
  → CONSENSUS must show "✓ CALL OK"
  → CALL SCORE should be ≥ 65-70
  → Risk flags should be minimal (max 1-2 yellow)
  → Market State should be TRENDING ↑, EXPANSION ↑, or PULLBACK ↑
  → IF all green → EXECUTE CALL on myrockitcoin.com
  → ELSE → SKIP this signal

IF primary indicator shows PUT signal:
  → Check MSVE dashboard
  → CONSENSUS must show "✓ PUT OK"
  → PUT SCORE should be ≥ 65-70
  → Risk flags should be minimal
  → Market State should be TRENDING ↓, EXPANSION ↓, or PULLBACK ↓
  → IF all green → EXECUTE PUT on myrockitcoin.com
  → ELSE → SKIP this signal
```

### Trust Rules

#### **TRUST PRIMARY CALL SIGNAL WHEN:**
✅ CONSENSUS: "✓ CALL OK"  
✅ CALL SCORE: ≥ 65  
✅ Market State: Contains ↑ (upward bias)  
✅ Risk Flags: Max 1 yellow (preferably 0)  
✅ Bias: "STRONG CALL BIAS" or "WEAK CALL BIAS"  
✅ No "STAND DOWN" warning  

#### **TRUST PRIMARY PUT SIGNAL WHEN:**
✅ CONSENSUS: "✓ PUT OK"  
✅ PUT SCORE: ≥ 65  
✅ Market State: Contains ↓ (downward bias)  
✅ Risk Flags: Max 1 yellow (preferably 0)  
✅ Bias: "STRONG PUT BIAS" or "WEAK PUT BIAS"  
✅ No "STAND DOWN" warning  

#### **STAND DOWN / IGNORE PRIMARY SIGNAL WHEN:**
❌ CONSENSUS: "✖ STAND DOWN"  
❌ Market State: "COMPRESSION / CHOP", "LOW VOL", "EXHAUSTION RISK"  
❌ Risk Flags: ≥ 3 yellow flags  
❌ Chop Risk: Yellow  
❌ Low Vol: Yellow  
❌ HTF/LTF Conflict: Yellow (especially if strong conflict)  
❌ CALL SCORE and PUT SCORE both < 60  

#### **WAIT / DISCRETIONARY ZONE:**
⚠️ CONSENSUS: "⊗ WAIT"  
⚠️ Scores: 55-64 range  
⚠️ Risk Flags: 2 yellow  
⚠️ Market State: "NEUTRAL", "HTF/LTF CONFLICT"  

In WAIT zone, you may:
- Skip (safest)
- Wait for next bar confirmation
- Use discretion based on primary indicator strength

### Real-World Example

**Scenario**: BTC 30s chart, your primary indicator prints CALL signal at 09:15 UTC.

**MSVE Dashboard Shows**:
```
CONSENSUS:        ✓ CALL OK
BIAS:             STRONG CALL BIAS
STATE:            TREND EXPANSION ↑
CALL SCORE:       78
PUT SCORE:        15
Risk Flags:
  Chop Risk:      ✓ (green)
  Late/Extended:  ✓ (green)
  Low Vol:        ✓ (green)
  Exhaustion:     ✓ (green)
  HTF/LTF Conflict: ✓ (green)
```

**Action**: ✅ **EXECUTE CALL** on myrockitcoin.com (180s expiry)

**Reasoning**: All systems aligned, strong score, no risk flags, clean trend expansion.

---

**Scenario 2**: ETH 30s chart, primary indicator prints PUT signal at 14:32 UTC.

**MSVE Dashboard Shows**:
```
CONSENSUS:        ⊗ WAIT
BIAS:             NEUTRAL / CHOP
STATE:            COMPRESSION / CHOP
CALL SCORE:       35
PUT SCORE:        42
Risk Flags:
  Chop Risk:      ⚠ (yellow)
  Late/Extended:  ✓ (green)
  Low Vol:        ✓ (green)
  Exhaustion:     ✓ (green)
  HTF/LTF Conflict: ✓ (green)
```

**Action**: ❌ **SKIP THIS TRADE**

**Reasoning**: Chop detected, scores too low, consensus is WAIT, market state is compression. High probability of losing 180s expiry in choppy conditions.

---

## 📊 Dashboard Interpretation

### **Consensus Line** (Most Important)
- **✓ CALL OK**: Green background. Safe to take CALL signals from primary indicator.
- **✓ PUT OK**: Red background. Safe to take PUT signals from primary indicator.
- **⊗ WAIT**: Gray background. Conflicting data, wait for clarity.
- **✖ STAND DOWN**: Orange background. Active risk, do not trade even if primary signals.

### **Bias Line**
Tells you the broader directional lean:
- **STRONG CALL BIAS**: High confidence bullish environment
- **WEAK CALL BIAS**: Moderate bullish lean
- **NEUTRAL / CHOP**: No clear direction, avoid
- **WEAK PUT BIAS**: Moderate bearish lean
- **STRONG PUT BIAS**: High confidence bearish environment
- **STAND DOWN**: Risk-off state

### **State Line**
Current market condition:
- **TREND EXPANSION ↑/↓**: Strong trend + volatility expanding (BEST conditions)
- **TREND PULLBACK ↑/↓**: Healthy retrace in trend (GOOD for re-entry)
- **TRENDING ↑/↓**: Directional but stable (MODERATE)
- **COMPRESSION / CHOP**: Sideways, avoid (BAD)
- **EXHAUSTION RISK ↑/↓**: Overextended, reversal risk (BAD)
- **LOW VOL - STAND DOWN**: Insufficient volatility (BAD)
- **HTF ↑/↓ / LTF CONFLICT**: Timeframe disagreement (CAUTION)
- **NEUTRAL**: No bias (SKIP)

### **CALL SCORE / PUT SCORE**
0-100 confidence scores:
- **75-100**: Very high confidence (STRONG)
- **65-74**: Good confidence (MODERATE)
- **55-64**: Marginal (DISCRETIONARY)
- **0-54**: Insufficient (AVOID)

Only the score matching your signal direction matters. If primary shows CALL signal, check CALL SCORE.

### **Risk Flags**
Each flag is binary (✓ green = safe, ⚠ yellow = risk):
- **Chop Risk**: Market is choppy (ADX low, efficiency low)
- **Late/Extended**: Price far from structure, late entry risk
- **Low Vol**: ATR too low, unreliable for 180s expiries
- **Exhaustion**: Overextended, mean reversion risk
- **HTF/LTF Conflict**: Higher and lower timeframes disagree

**Rule of thumb**: 0-1 yellow = acceptable, 2 yellow = caution, 3+ yellow = avoid.

---

## 🔧 Troubleshooting

### **Problem: Always shows "NEUTRAL" or "WAIT"**

**Cause**: Settings too strict, or market genuinely directionless.

**Solutions**:
1. Lower **Min Confidence for Entry** from 65 to 60
2. Lower **ADX Trend Threshold** from 25 to 22
3. Lower **Low Vol Threshold** from 0.6 to 0.55
4. Temporarily enable **Test Mode** to see if states activate
5. Check if HTF timeframe is too high (try `1` or `2` minute instead of `3`)
6. Verify you're on a trending asset (BTC/ETH). If on low-volume altcoin, may genuinely be choppy.

### **Problem: Too many "STAND DOWN" signals**

**Cause**: Risk filters too aggressive for current market.

**Solutions**:
1. Increase **Exhaustion Distance (ATR)** from 2.5 to 3.0
2. Increase **Extension Threshold (ATR)** from 2.0 to 2.5
3. Increase **ROC Extreme Threshold %** from 2.0 to 2.5
4. Lower **Wick/Body Imbalance Ratio** from 2.0 to 2.5 (makes it harder to trigger)
5. Check if genuinely in exhaustion (look at price action - is it overextended?)

### **Problem: Shows CALL OK/PUT OK but trades lose on backtest**

**Cause**: Either strategy holding period doesn't match reality, or market conditions unsuitable for 180s expiries.

**Solutions**:
1. Verify **Holding Period (bars)** matches 180 seconds on your chart (30s chart = 6 bars)
2. Check if using **Test Mode** in live trading (should be OFF)
3. Increase **Min Confidence for Entry** to 70-75 for stricter entries
4. Review if you're trading during recommended sessions (enable Session Filter)
5. Add stricter regime filters: Increase **ADX Trend Threshold** to 27-30
6. Remember: This is a FILTER. It can't make a bad primary indicator profitable. Ensure your primary signal generator is sound.

### **Problem: HTF/LTF Conflict flag always yellow**

**Cause**: LTF and HTF moving at different speeds, or HTF timeframe too high.

**Solutions**:
1. Lower **HTF Timeframe** (try `2` or `1` minute instead of `3`)
2. This is actually useful information - conflict means lower timeframe may be making noise while HTF hasn't confirmed. Wait for alignment.
3. If persistent conflict, consider trading only when flag is green (stricter but safer).

### **Problem: Scores seem random/jumpy**

**Cause**: Inputs too short, or volatile market.

**Solutions**:
1. Increase **ADX Length** from 14 to 16-18 for smoother regime detection
2. Increase **Efficiency Period** from 20 to 25-30
3. Increase **ATR Length** from 14 to 16-20
4. Adjust **Scoring Weights** to reduce influence of jumpier components (e.g., lower Structure weight, increase HTF weight)

### **Problem: Low Vol flag always yellow during certain hours**

**Cause**: Genuinely low volatility during those sessions (e.g., Asia session).

**Solutions**:
1. This is correct behavior - avoid trading during low volatility
2. If you must trade these hours, lower **Low Vol Threshold** from 0.6 to 0.5 (riskier)
3. Better solution: Adjust **Asia Session Score** downward and only trade when CONSENSUS confirms despite low vol

### **Problem: No strategy trades appear on chart**

**Cause**: Either no signals met confidence threshold, or cooldown too long, or genuinely no opportunities.

**Solutions**:
1. Lower **Min Confidence for Entry**
2. Reduce **Cooldown Between Trades** from 3 to 1-2 bars
3. Enable **Test Mode** temporarily to see if signals increase
4. Check CONSENSUS output - if always WAIT/STAND DOWN, see "Always shows NEUTRAL" troubleshooting above

---

## 🧪 Test Mode

**Purpose**: Test Mode increases sensitivity of scoring components to make state transitions and signals appear more frequently. Use for verification, NOT live trading.

**What it does**:
- Regime Score: +30% boost
- Structure Score: +20% boost
- Volatility Score: +20% boost
- **Effect**: More CALL OK / PUT OK signals, fewer STAND DOWN / WAIT states

**When to use**:
✅ Initial setup to verify strategy is working  
✅ Testing new settings on demo account  
✅ Confirming visual outputs are displaying  

**When NOT to use**:
❌ Live trading with real money  
❌ Backtesting (will give unrealistic results)  
❌ Validating primary indicator (will give false confidence)  

**How to enable**: Set **Test Mode** input to `true`

**Expected behavior in Test Mode**:
- Consensus will show OK states more often
- Risk flags may still appear (they are not boosted)
- Scores will be 10-20 points higher on average
- More strategy entries on chart

**Remember**: Once you've verified the strategy works, **turn Test Mode OFF** before trading.

---

## 📈 Advanced Tips

### **Combining with Volume Profile**
If you have volume profile tools:
- Check if price is near high-volume nodes when CONSENSUS says OK
- Avoid low-volume nodes even if CONSENSUS is green
- Use POC (Point of Control) as additional confluence

### **Session Optimization**
Crypto volatility patterns:
- **Asia (00:00-08:00 UTC)**: Often low vol, avoid unless strong trend
- **London (08:00-16:00 UTC)**: Increasing vol, good for breakouts
- **NY (13:00-21:00 UTC)**: Peak vol, best for 180s expiries
- **Overlap (13:00-16:00 UTC)**: London+NY, highest quality

Consider disabling trades outside London/NY sessions entirely for ultra-conservative approach.

### **Multi-Asset Correlation**
- If trading BTC and ETH simultaneously, check if MSVE agrees on direction for both
- Divergence (BTC CALL OK, ETH PUT OK) may indicate false signals
- Convergence (both CALL OK or both PUT OK) adds confidence

### **Risk Management**
- Even with CALL OK / PUT OK, limit consecutive losses to 3-4 before taking break
- If market state rapidly cycles between states (e.g., EXPANSION → CHOP → EXPANSION in 5 minutes), consider standing down
- Use MSVE to size positions: STRONG BIAS = larger size, WEAK BIAS = smaller size

### **Customization for Your Primary Indicator**
If your primary indicator is:
- **Very aggressive**: Increase MSVE **Min Confidence** to 70-75 to filter out noise
- **Very conservative**: Decrease MSVE **Min Confidence** to 60-65 to not over-filter
- **HTF-based**: Lower MSVE **HTF Timeframe** to avoid double-filtering same timeframe
- **LTF-based**: Keep MSVE **HTF Timeframe** at 3+ to provide true HTF confirmation

---

## ✅ Final Checklist Before Live Trading

- [ ] Test Mode is **OFF**
- [ ] Holding Period matches chart timeframe (30s = 6 bars, 15s = 12 bars)
- [ ] Min Confidence for Entry is appropriate for risk tolerance (65-70 recommended)
- [ ] HTF Timeframe is logical for your chart (3min HTF for 30s chart is standard)
- [ ] Session scores match your trading hours
- [ ] Backtest on demo/paper account for at least 20 signals
- [ ] Verify CONSENSUS output aligns with your understanding of market conditions
- [ ] Risk flags make sense (manually verify a few yellow flags are real risks)
- [ ] Integration with primary indicator is clear (you know when to trust vs ignore)

---

## 📞 Quick Reference Card

**WHEN TO TAKE PRIMARY INDICATOR'S CALL SIGNAL:**
```
✓ CALL OK + CALL SCORE ≥ 65 + State contains ↑ + Max 1 risk flag
```

**WHEN TO TAKE PRIMARY INDICATOR'S PUT SIGNAL:**
```
✓ PUT OK + PUT SCORE ≥ 65 + State contains ↓ + Max 1 risk flag
```

**WHEN TO STAND DOWN REGARDLESS OF PRIMARY SIGNAL:**
```
✖ STAND DOWN OR 3+ risk flags OR State = CHOP/LOW VOL/EXHAUSTION
```

**WHEN TO USE DISCRETION:**
```
⊗ WAIT + Scores 55-64 + 2 risk flags → Your call, but safer to skip
```

---

**Good luck with your 180-second options trading! Remember: MSVE is designed to keep you OUT of bad trades, not to generate entries. Fewer, better trades is the goal.**
