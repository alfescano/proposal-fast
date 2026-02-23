# Market State Confirmation Engine - Setup Guide

## Strategy Overview

This is a **market state confirmation engine** designed as a backup/validation layer for 180-second crypto options trading. Unlike typical entry signal scripts, this focuses on:

1. **Market Structure Awareness** - Understanding trend vs chop vs compression
2. **HTF-LTF Alignment** - Confirming higher timeframe bias before acting
3. **Risk Detection** - Identifying exhaustion, overextension, and poor conditions
4. **Trade Quality Filtering** - Only confirming trades when conditions are favorable

---

## How It Differs From Normal Entry Signal Scripts

| Aspect | Normal Entry Script | This Strategy |
|--------|---------------------|---------------|
| Goal | Generate frequent signals | Validate/confirmation quality |
| Logic | Breakout + momentum | Multi-factor state machine |
| Output | Buy/Sell arrows | Bias + confidence scores |
| Philosophy | "When to enter" | "Is it safe to enter?" |
| Frequency | Many trades | Selective, quality over quantity |

---

## Major Inputs Explained

### HTF Bias Settings
- **HTF Timeframe**: Default 3m - the higher timeframe for directional bias
- **HTF Fast/Slow EMA**: 9/21 default - EMA crossover defines HTF trend
- **HTF ATR Length**: 14 - used to normalize HTF strength

### LTF Structure Settings
- **LTF Fast/Slow/Mid EMA**: 9/21/50 - current chart EMA stack for structure

### Regime Detection
- **ADX Length**: 14 - standard ADX period
- **ADX Trend Threshold**: 25 - above this = trending market
- **ATR Expansion/Compression**: 1.5x/0.6x - volatility regime classification

### Exhaustion Detection
- **Extension Threshold (ATR)**: 3.0 - price > 3 ATR from mid-EMA = overextended
- **ROC Extreme**: 5.0% - >5% ROC in 8 bars = momentum extreme
- **Wick/Body Ratio**: 2.0 - wick >2x body = candle exhaustion signal

### Session Quality
- **Timezone**: UTC (adjust for your broker's timezone)
- **Enable Session Filter**: On by default - avoids poor sessions
- **Strict Session Mode**: Off by default - if ON, only trades in Asia/London/NY

### Simulation Settings
- **30s Chart Bars to Hold**: 6 (6 x 30s = 180 seconds)
- **15s Chart Bars to Hold**: 12 (12 x 15s = 180 seconds)
- **Cooldown Bars**: 3 - prevents overtrading
- **Test Mode**: Off by default - enables faster testing

---

## Recommended Settings

### BTCUSDT 30s
```
HTF Timeframe: 3m
HTF EMA: 9 / 21
LTF EMA: 9 / 21 / 50
ADX Threshold: 25
ATR Expansion: 1.5
Extension Threshold: 3.0
ROC Extreme: 5.0
Session Filter: ON
Cooldown: 3 bars
```

### ETHUSDT 30s
```
HTF Timeframe: 3m  
HTF EMA: 9 / 21
LTF EMA: 9 / 21 / 50
ADX Threshold: 22 (slightly lower - ETH more trend-prone)
ATR Expansion: 1.4
Extension Threshold: 2.5 (slightly tighter)
ROC Extreme: 4.5
Session Filter: ON
Cooldown: 3 bars
```

---

## How To Use With Your Primary Entry Indicator

### When to TRUST CALL signals:
1. Consensus shows "CALL OK"
2. HTF Bias shows "BULL" with strength >50%
3. Market State shows "PULLBACK_UP" or "TREND_EXP_UP"
4. No risk flags (especially no "DIR CONFLICT" or "EXHAUSTION RISK")
5. Session shows "LONDON" or "NY" for best results

### When to TRUST PUT signals:
1. Consensus shows "PUT OK"
2. HTF Bias shows "BEAR" with strength >50%
3. Market State shows "PULLBACK_DOWN" or "TREND_EXP_DOWN"
4. No risk flags
5. Session quality is good

### When to STAND DOWN (even if entry indicator fires):
- Consensus shows "STAND DOWN"
- Market State shows "CHOP", "EXHAUSTION", or "EXTENDED"
- Risk flags show multiple warnings
- Session shows "OTHER" with strict mode ON
- LOW volatility regime detected

---

## Understanding The Dashboard

| Field | Meaning |
|-------|---------|
| MARKET STATE | Current market condition (TREND_UP, PULLBACK_UP, CHOP, etc.) |
| CONSENSUS | Simplified output: CALL OK / PUT OK / WAIT / STAND DOWN |
| CALL Score | 0-100 confidence for CALL direction |
| PUT Score | 0-100 confidence for PUT direction |
| BIAS | Human-readable bias label |
| HTF BIAS | Higher timeframe direction + strength % |
| REGIME | Volatility state + trend status |
| STRUCTURE | Current position in trend (expansion vs pullback) |
| SESSION | Current trading session |
| RISK | Active risk warnings |
| EXHAUSTION | Exhaustion level (NONE / MODERATE / HIGH) |

---

## Troubleshooting Guide

### Why does it show "CHOP" often?
- ADX is below threshold (25 by default)
- ATR ratio shows compression
- Solution: Check if market is actually ranging; this is correct behavior in chop

### Why does it rarely trigger trades?
- Scoring thresholds are conservative (60+ for consensus)
- Cooldown prevents rapid trading
- Solution: Enable Test Mode to verify logic, then tune thresholds if needed

### Why "DIR CONFLICT" appears?
- HTF and LTF are misaligned
- Example: HTF bullish but LTF bearish
- This is a WARNING - usually means wait for alignment

### How to tune without making it reckless:
1. **Start conservative** - defaults are tuned for quality
2. **Adjust thresholds gradually** - 5% changes max
3. **Don't disable penalties** - exhaustion/session/volatility filters are there for a reason
4. **Backtest first** - use replay mode to see behavior across different market conditions

### Common mistakes to avoid:
- Setting ADX threshold too low (will trigger in chop)
- Setting extension threshold too high (will miss exhaustion)
- Disabling session filter (will take poor-quality trades)
- Setting cooldown to 0 (overtrading in backtest)

---

## Test Mode Usage

Enable Test Mode to verify:
- State transitions happen correctly
- Dashboard updates properly
- Entry/exit logic fires as expected

Test Mode sets holding period to 1 bar for rapid validation.

---

## Important Notes

1. **This is NOT a fully automated trading strategy** - it's a confirmation engine
2. **Strategy trades are SIMULATIONS** - they proxy 180s expiry but are not exact
3. **Always use with your primary entry indicator** - this validates, your primary generates
4. **Backtest across multiple sessions** - session filter behavior varies by timezone
5. **Zero repainting** - all HTF data uses `barmerge.lookahead_on` for confirmed values only

---

## Alert Setup

Configure alerts in TradingView:
- `CALL Signal` - when consensus turns to CALL OK
- `PUT Signal` - when consensus turns to PUT OK  
- `Stand Down` - when consensus says STAND DOWN
- `Exhaustion Warning` - when market state is EXHAUSTION

---

## Summary

This backup strategy serves as your **market state compass**. When your primary indicator fires a signal:
1. Check this engine's consensus
2. If "CALL OK" or "PUT OK" → proceed with higher confidence
3. If "WAIT" → be cautious, conditions unclear
4. If "STAND DOWN" → skip the trade, better opportunities ahead

The goal is **accuracy over frequency** - waiting for the right conditions beats taking every signal.
