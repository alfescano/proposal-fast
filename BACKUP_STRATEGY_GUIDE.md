# Backup Strategy: Market Structure Compass v1.0 — Complete Guide

## Table of Contents
1. [Strategy Design Philosophy](#1-strategy-design-philosophy)
2. [How It Differs From a Normal Entry Signal Script](#2-how-it-differs-from-a-normal-entry-signal-script)
3. [Architecture Overview](#3-architecture-overview)
4. [Every Major Input & Threshold Explained](#4-every-major-input--threshold-explained)
5. [Recommended BTC 30s Settings](#5-recommended-btc-30s-settings)
6. [Recommended ETH 30s Settings](#6-recommended-eth-30s-settings)
7. [How to Use WITH a Separate Entry Indicator](#7-how-to-use-with-a-separate-entry-indicator)
8. [Troubleshooting Guide](#8-troubleshooting-guide)
9. [Test Mode Settings](#9-test-mode-settings)
10. [Consensus Mode Explained](#10-consensus-mode-explained)

---

## 1. Strategy Design Philosophy

This is **not** an entry signal generator. It is a **market state compass** and **trade quality filter** designed to answer one question:

> "Is the current market environment trustworthy enough for my primary indicator's CALL/PUT signals?"

### Core Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Accuracy > Frequency** | Multiple confirmation layers must agree before showing strong bias |
| **Structure-Aware** | EMA stack analysis, pullback detection, overextension measurement |
| **Regime-Aware** | ADX + Efficiency Ratio dual-confirmation for trend vs chop |
| **Risk-First** | Exhaustion detection, volatility regime, session quality all act as risk gates |
| **Non-Repainting** | All HTF data uses `barmerge.lookahead_off`, bar-close logic only |
| **Macro Focus** | Looks at the bigger picture rather than micro-level breakout patterns |

### What It Outputs

The strategy produces **six layers of information**:

1. **Bigger-Picture Bias** — STRONG CALL / WEAK CALL / NEUTRAL / WEAK PUT / STRONG PUT / STAND DOWN
2. **Composite Confirmation Score** — Signed directional score from -100 to +100
3. **Market State Classification** — TREND EXP UP/DOWN, TREND PB UP/DOWN, COMPRESSION, EXHAUSTION, REVERSAL RISK, CHOP
4. **Risk Flags** — CHOP, EXTENDED, LOW VOL, EXHAUST, CONFLICT
5. **Consensus Mode** — Single-line: CALL OK / PUT OK / WAIT / STAND DOWN
6. **Simulated Strategy Trades** — Long/Short entries that proxy CALL/PUT validation for backtesting

---

## 2. How It Differs From a Normal Entry Signal Script

| Aspect | Typical Entry Indicator | This Backup Strategy |
|--------|------------------------|---------------------|
| **Logic Family** | Breakout detection, impulse candle, ROC threshold | Market state engine, regime detection, structural confirmation |
| **Signal Type** | "Enter NOW" | "The environment is/isn't trustworthy" |
| **Frequency** | Many signals per session | Few state changes, selective trades |
| **Purpose** | Generate entries | Validate/reject entries from another system |
| **Exhaustion Handling** | Often chases late moves | Explicitly detects and penalizes exhaustion |
| **Chop Handling** | May generate false signals in chop | Detects chop regime and issues STAND DOWN |
| **HTF Integration** | May use HTF for direction only | Uses HTF for direction + strength + conflict detection |
| **Volatility** | Often ignores vol regime | Classifies LOW/NORMAL/HIGH and adjusts confidence |
| **Session Awareness** | Usually none | Scores sessions and downgrades off-hours |

**Key Differentiation**: Your primary indicator says "breakout detected, enter now." This backup strategy says "the market structure supports/contradicts that signal." They are complementary, not redundant.

---

## 3. Architecture Overview

The strategy is built as a **7-engine pipeline** that feeds into a **weighted composite scorer**:

```
┌─────────────────────────────────────────────────────────┐
│                    INPUT ENGINES                         │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ HTF Bias │ Regime   │Structure │Exhaustion│ Session/Vol  │
│ +Strength│ Detection│+Pullback │ +MR Risk │ +Flow Proxy  │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│              WEIGHTED COMPOSITE SCORER                   │
│         (configurable weights per engine)                │
├─────────────────────────────────────────────────────────┤
│              CLASSIFICATION LAYER                        │
│  Bias | State | Risk Flags | Consensus | Strategy Trades │
├─────────────────────────────────────────────────────────┤
│              VISUAL OUTPUT                               │
│  Dashboard Table | Background Tint | Labels | Ribbon     │
└─────────────────────────────────────────────────────────┘
```

### Engine Details

**Engine 1: HTF Bias + Strength**
- Compares fast/slow EMA on higher timeframe (default 3m)
- Measures spread in ATR units for strength normalization
- Outputs: direction (-1/0/+1) and strength (0-100%)

**Engine 2: Regime Detection**
- ADX for trend strength measurement
- Kaufman Efficiency Ratio for directional efficiency
- Both must agree for "trending" classification
- Outputs: TRENDING / CHOP / MIXED + regime score (0-1)

**Engine 3: Structure + Pullback**
- EMA stack analysis (micro/short/medium alignment)
- Micro EMA slope for momentum direction
- Pullback depth measurement in ATR units
- Overextension detection from medium EMA
- Outputs: structure score (-1 to +1), pullback/overextension flags

**Engine 4: Exhaustion Detection**
- Short-burst ROC extreme detection
- Wick/body imbalance analysis
- Volatility spike detection (ATR vs ATR average)
- Combined with overextension for reversal risk
- Outputs: exhaustion score (0-1), exhaustion flag

**Engine 5: Session Quality**
- Classifies time into Asia/London/NY/Other
- Configurable timezone offset
- Each session has a quality score (0-100)
- Outputs: session score, session label

**Engine 6: Volatility Regime**
- ATR percentile rank over lookback period
- Classifies as LOW / NORMAL / HIGH
- LOW vol triggers stand-down conditions
- Outputs: vol regime label, vol quality score

**Engine 7: Order Flow Proxy**
- Signed volume = price direction × volume
- Smoothed with EMA and normalized against average volume
- Acts as confidence modifier (not hard gate)
- Outputs: flow score (-1 to +1), bullish/bearish flags

---

## 4. Every Major Input & Threshold Explained

### General Settings

| Input | Default | Purpose |
|-------|---------|---------|
| **Chart Timeframe** | 30 | Tells the strategy whether you're on 15s or 30s so it can auto-calculate holding bars (180s ÷ bar size) |
| **Hold Bars Override** | 0 (auto) | Override auto-calculation. 0 = auto (6 bars for 30s, 12 bars for 15s) |
| **Cooldown Between Trades** | 3 bars | Minimum bars between strategy trade exits and new entries. Prevents overtrading |
| **Test Mode** | false | Relaxes thresholds by ~30% so you see more state changes and trades during verification |

### HTF Bias + Strength

| Input | Default | Purpose |
|-------|---------|---------|
| **HTF Timeframe** | 3m | Higher timeframe for directional bias. 3m gives ~6x the chart TF on 30s |
| **HTF Fast EMA** | 8 | Fast EMA on HTF. Responsive to recent direction |
| **HTF Slow EMA** | 21 | Slow EMA on HTF. Represents the macro trend |
| **HTF Strength Threshold** | 0.3 ATR | Minimum EMA spread (in ATR units) to consider HTF bias "strong." Below this = FLAT. Higher = more selective |

### Regime Detection

| Input | Default | Purpose |
|-------|---------|---------|
| **ADX Length** | 10 | ADX calculation period. Lower = more responsive, noisier |
| **ADX Trend Threshold** | 20 | ADX above this = trending. Classic threshold. Lower in test mode |
| **Efficiency Ratio Length** | 10 | Kaufman ER lookback. Measures how "efficient" price movement is |
| **Efficiency Ratio Threshold** | 0.4 | ER above this = directionally efficient (trending). Below = choppy |

### Structure + Pullback

| Input | Default | Purpose |
|-------|---------|---------|
| **Micro EMA** | 5 | Very fast EMA for immediate price structure |
| **Short EMA** | 9 | Short-term trend EMA |
| **Medium EMA** | 21 | Medium-term trend EMA. Overextension measured from this |
| **Pullback Depth** | 0.5 ATR | How far price must deviate from micro EMA (in ATR) to classify as pullback |
| **Overextension Threshold** | 1.5 ATR | Distance from medium EMA (in ATR) that flags overextension |

### Exhaustion Detection

| Input | Default | Purpose |
|-------|---------|---------|
| **Exhaustion ROC Length** | 3 | Short-burst rate of change lookback. Detects sudden spikes |
| **Exhaustion ROC Threshold** | 0.4% | ROC above this % flags exhaustion. Tuned for BTC 30s volatility |
| **Wick/Body Ratio** | 0.6 | If largest wick > 0.6× body, flags wick imbalance (rejection signal) |
| **Vol Spike Lookback** | 20 | Lookback for average ATR comparison |
| **Vol Spike Multiplier** | 1.8 | Current ATR must be 1.8× average to flag volatility spike |

### Session Quality

| Input | Default | Purpose |
|-------|---------|---------|
| **Enable Session Scoring** | true | Toggle session-based confidence adjustment |
| **UTC Offset** | 0 | Your timezone offset. Set to your local UTC offset |
| **Asia Score** | 40 | Asia session quality (lower = less trustworthy for 180s trades) |
| **London Score** | 80 | London session quality |
| **NY Score** | 90 | NY session quality (highest liquidity, best for short-duration trades) |
| **Other Score** | 30 | Off-hours quality |

### Volatility Regime

| Input | Default | Purpose |
|-------|---------|---------|
| **ATR Length** | 14 | ATR calculation period (used globally) |
| **Vol Percentile Lookback** | 50 | How many bars to rank current ATR against |
| **Low Vol Percentile** | 25 | ATR below 25th percentile = LOW vol |
| **High Vol Percentile** | 75 | ATR above 75th percentile = HIGH vol |

### Order Flow Proxy

| Input | Default | Purpose |
|-------|---------|---------|
| **Enable Signed Volume** | true | Toggle order flow proxy |
| **Smoothing Length** | 10 | EMA smoothing for signed volume |
| **Imbalance Threshold** | 0.3 | Normalized signed volume above this = bullish flow, below -this = bearish |

### Score Weights

| Input | Default | Purpose |
|-------|---------|---------|
| **HTF Bias Weight** | 30 | How much HTF direction influences the composite score |
| **Regime Quality Weight** | 20 | How much trend/chop regime affects confidence |
| **Structure Weight** | 20 | How much EMA stack/slope contributes to direction |
| **Exhaustion Penalty Weight** | 15 | How much exhaustion reduces confidence |
| **Session Quality Weight** | 10 | How much session timing affects confidence |
| **Order Flow Weight** | 5 | How much signed volume proxy influences direction |

### Entry Thresholds

| Input | Default | Purpose |
|-------|---------|---------|
| **Strong Bias Threshold** | 65 | Composite score above +65 = STRONG CALL, below -65 = STRONG PUT |
| **Weak Bias Threshold** | 45 | Score between 45-65 = WEAK bias |
| **Stand Down Threshold** | 25 | Used internally for stand-down logic |

---

## 5. Recommended BTC 30s Settings

BTC on 30s timeframe has moderate volatility with clear trending periods. These defaults are tuned for BTC:

```
General:
  Chart Timeframe: 30
  Hold Bars Override: 0 (auto = 6 bars)
  Cooldown: 3 bars
  Test Mode: false

HTF Bias:
  HTF Timeframe: 3 (3 minute)
  HTF Fast EMA: 8
  HTF Slow EMA: 21
  HTF Strength Threshold: 0.3

Regime:
  ADX Length: 10
  ADX Trend Threshold: 20
  Efficiency Ratio Length: 10
  Efficiency Ratio Threshold: 0.4

Structure:
  Micro EMA: 5
  Short EMA: 9
  Medium EMA: 21
  Pullback Depth: 0.5 ATR
  Overextension: 1.5 ATR

Exhaustion:
  ROC Length: 3
  ROC Threshold: 0.4%
  Wick Ratio: 0.6
  Vol Spike Lookback: 20
  Vol Spike Mult: 1.8

Session: (assuming UTC timezone)
  Asia: 40, London: 80, NY: 90, Other: 30

Volatility:
  ATR Length: 14
  Percentile Lookback: 50
  Low: 25th, High: 75th

Weights: (defaults are BTC-optimized)
  HTF: 30, Regime: 20, Structure: 20, Exhaust: 15, Session: 10, OF: 5

Thresholds:
  Strong: 65, Weak: 45, Stand Down: 25
```

**BTC-specific notes:**
- BTC tends to have cleaner trends than ETH, so the default ADX threshold of 20 works well
- The 0.4% ROC exhaustion threshold catches BTC's characteristic sharp spikes
- HTF 3m provides good macro context without being too slow for 30s decisions

---

## 6. Recommended ETH 30s Settings

ETH is typically noisier than BTC with more chop. Adjust these settings:

```
Changes from BTC defaults:

HTF Bias:
  HTF Strength Threshold: 0.35 (slightly higher to filter ETH noise)

Regime:
  ADX Trend Threshold: 22 (ETH needs slightly higher bar for "trending")
  Efficiency Ratio Threshold: 0.45 (stricter directional efficiency)

Structure:
  Pullback Depth: 0.6 ATR (ETH pullbacks tend to be deeper)
  Overextension: 1.3 ATR (ETH overextends faster relative to its ATR)

Exhaustion:
  ROC Threshold: 0.5% (ETH has larger % moves on 30s)
  Vol Spike Mult: 1.7 (ETH vol spikes are more common, lower threshold)

Weights:
  HTF: 30, Regime: 25, Structure: 15, Exhaust: 15, Session: 10, OF: 5
  (Increased regime weight because ETH chop detection is more critical)

Thresholds:
  Strong: 68 (slightly more selective for ETH)
  Weak: 48
```

**ETH-specific notes:**
- ETH has more frequent chop regimes, so regime detection weight is increased
- Structure weight is slightly reduced because ETH EMA stacks are less reliable
- Higher strong bias threshold prevents false confidence during ETH's noisier price action
- Lower overextension threshold catches ETH's tendency to snap back faster

---

## 7. How to Use WITH a Separate Entry Indicator

This is the most important section. The backup strategy is designed to be used **alongside** your primary entry indicator.

### Decision Matrix

| Primary Indicator Says | Backup Strategy Shows | Action |
|----------------------|----------------------|--------|
| CALL signal | CALL OK / STRONG CALL | ✅ **TAKE THE TRADE** — High confidence |
| CALL signal | WEAK CALL | ⚠️ **PROCEED WITH CAUTION** — Reduce size or wait for upgrade |
| CALL signal | NEUTRAL / WAIT | ❌ **SKIP** — Market structure doesn't support the signal |
| CALL signal | WEAK PUT / STRONG PUT | ❌ **DEFINITELY SKIP** — Signal is against macro structure |
| CALL signal | STAND DOWN | ❌ **STAND DOWN** — Market is too risky regardless of signal |
| PUT signal | PUT OK / STRONG PUT | ✅ **TAKE THE TRADE** — High confidence |
| PUT signal | WEAK PUT | ⚠️ **PROCEED WITH CAUTION** |
| PUT signal | NEUTRAL / WAIT | ❌ **SKIP** |
| PUT signal | WEAK CALL / STRONG CALL | ❌ **DEFINITELY SKIP** |
| PUT signal | STAND DOWN | ❌ **STAND DOWN** |

### When to Trust CALL Signals

Trust your primary indicator's CALL signal when the backup strategy shows **ALL** of these:
1. **Consensus**: CALL OK (or at minimum, not STAND DOWN / PUT OK)
2. **HTF Bias**: BULL with strength > 30%
3. **Regime**: TRENDING (not CHOP)
4. **State**: TREND EXP UP or TREND PB UP
5. **Risk Flags**: No CONFLICT, no EXHAUST
6. **Volatility**: NORMAL or HIGH (not LOW)

**Ideal CALL scenario:**
- Dashboard shows: CALL OK, STRONG CALL, TREND EXP UP, TRENDING, BULL 60%+, NORMAL vol, no risk flags
- Score: +65 or higher
- Background: green tint

### When to Trust PUT Signals

Trust your primary indicator's PUT signal when the backup strategy shows **ALL** of these:
1. **Consensus**: PUT OK
2. **HTF Bias**: BEAR with strength > 30%
3. **Regime**: TRENDING
4. **State**: TREND EXP DOWN or TREND PB DOWN
5. **Risk Flags**: No CONFLICT, no EXHAUST
6. **Volatility**: NORMAL or HIGH

**Ideal PUT scenario:**
- Dashboard shows: PUT OK, STRONG PUT, TREND EXP DOWN, TRENDING, BEAR 60%+, NORMAL vol, no risk flags
- Score: -65 or lower
- Background: red tint

### When to STAND DOWN (Even If Primary Indicator Prints a Signal)

**Always stand down when you see:**
- Consensus: STAND DOWN
- Risk flags: 3+ flags active simultaneously
- State: EXHAUSTION or REVERSAL RISK
- Regime: CHOP with score < 50
- Volatility: LOW (market is dead, 180s trades will likely expire flat)
- HTF Bias: FLAT with no strength
- Direction CONFLICT flag (LTF structure opposes HTF bias)

**Stand-down scenarios in practice:**
- Your primary indicator shows a CALL breakout, but the backup shows EXHAUSTION + EXTENDED + score only +30 → The breakout is likely a late-move trap
- Your primary indicator shows a PUT signal, but HTF is BULL 70% and backup shows CONFLICT → The PUT is fighting the macro trend
- Both indicators are quiet, backup shows CHOP + LOW VOL → No edge, wait for regime change

---

## 8. Troubleshooting Guide

### "It always shows NEUTRAL / CHOP"

**Causes:**
1. Market is genuinely choppy (this is the strategy working correctly)
2. Thresholds are too strict for current conditions
3. HTF timeframe is too high, making bias changes rare

**Fixes:**
- Enable **Test Mode** temporarily to see if states change with relaxed thresholds
- Lower **ADX Trend Threshold** from 20 to 16-18
- Lower **Efficiency Ratio Threshold** from 0.4 to 0.3
- Lower **Strong Bias Threshold** from 65 to 55
- Lower **HTF Strength Threshold** from 0.3 to 0.2
- Try a closer HTF (e.g., 2m instead of 3m)

### "It never triggers strategy trades"

**Causes:**
1. Strategy trades require STRONG bias + TRENDING + not exhausted (triple gate)
2. Cooldown period is too long
3. Market hasn't had clean trending periods in the backtest range

**Fixes:**
- Enable **Test Mode** (reduces all thresholds by ~30%)
- Reduce **Cooldown** from 3 to 1
- Lower **Strong Bias Threshold** from 65 to 50
- Check that the backtest range includes trending periods (not just weekend chop)

### "Too many STAND DOWN signals"

**Causes:**
1. Low volatility period (common during Asia session or weekends)
2. Exhaustion detection is too sensitive
3. Session scoring is penalizing your trading hours

**Fixes:**
- Increase **Asia Score** and **Other Score** if you trade those sessions
- Raise **Exhaustion ROC Threshold** from 0.4% to 0.6%
- Raise **Vol Spike Multiplier** from 1.8 to 2.2
- Lower **Exhaustion Penalty Weight** from 15 to 10

### "Score seems stuck near zero"

**Causes:**
1. Weights are balanced but engines are conflicting (HTF bull + structure bear = cancellation)
2. This is actually the CONFLICT state working correctly

**Fixes:**
- Check the **RISK FLAGS** row — if CONFLICT is showing, the engines genuinely disagree
- This is a valid "don't trade" signal
- If you want more decisive scores, increase **HTF Bias Weight** to 40 (makes HTF the dominant voice)

### "Exhaustion flags too often on BTC"

**Causes:**
1. BTC's natural volatility triggers the ROC threshold frequently
2. Vol spike multiplier is too low for BTC's baseline volatility

**Fixes:**
- Raise **Exhaustion ROC Threshold** from 0.4% to 0.5-0.6%
- Raise **Vol Spike Multiplier** from 1.8 to 2.0-2.5
- Raise **Overextension Threshold** from 1.5 to 2.0 ATR

### How to Tune Without Making It Reckless

**Safe tuning principles:**
1. **Never lower more than 2 thresholds at once** — change one, observe, then adjust another
2. **Use Test Mode first** — it applies a balanced ~30% relaxation across all thresholds
3. **Keep regime detection strict** — ADX + ER dual-confirmation is the most important filter
4. **Don't zero out weights** — every engine contributes signal quality
5. **Prefer adjusting weights over thresholds** — weights change emphasis, thresholds change sensitivity
6. **Watch the backtest win rate** — if it drops below 50% after tuning, you've gone too far

**Tuning priority order (safest to riskiest):**
1. Session scores (no risk, just matches your trading hours)
2. Score weights (changes emphasis without changing sensitivity)
3. HTF timeframe (closer = more responsive, further = more stable)
4. Entry thresholds (Strong/Weak bias levels)
5. Regime thresholds (ADX/ER — be careful here)
6. Exhaustion thresholds (last resort — these protect you from bad trades)

---

## 9. Test Mode Settings

**Test Mode** (`i_testMode = true`) applies these automatic adjustments:

| Parameter | Normal | Test Mode | Effect |
|-----------|--------|-----------|--------|
| ADX Trend Threshold | 20 | 14 | More bars classified as "trending" |
| Efficiency Ratio Threshold | 0.4 | 0.28 | Easier to pass directional efficiency test |
| Strong Bias Threshold | 65 | 45.5 | More STRONG CALL/PUT classifications |
| Weak Bias Threshold | 45 | 31.5 | More WEAK bias instead of NEUTRAL |
| Exhaustion ROC Threshold | 0.4% | 0.56% | Fewer exhaustion flags |
| Overextension Threshold | 1.5 ATR | 1.95 ATR | Harder to trigger overextension |

**When to use Test Mode:**
- First time adding the strategy to a chart (verify it produces state changes)
- After changing instruments (verify it works on the new pair)
- During low-volatility periods when normal mode shows mostly NEUTRAL
- When debugging why trades aren't triggering

**When NOT to use Test Mode:**
- Live trading decisions (thresholds are intentionally relaxed)
- Evaluating backtest performance (results will be inflated)
- Comparing against your primary indicator (signals won't be selective enough)

---

## 10. Consensus Mode Explained

The **Consensus Mode** output simplifies all 7 engines into a single actionable word:

| Consensus | Meaning | What To Do |
|-----------|---------|------------|
| **CALL OK** | Strong bullish bias, trending regime, no major risk flags | Trust CALL signals from primary indicator |
| **PUT OK** | Strong bearish bias, trending regime, no major risk flags | Trust PUT signals from primary indicator |
| **WAIT** | Weak bias detected but not strong enough, or mixed signals | Don't trade. Wait for upgrade to CALL OK / PUT OK |
| **STAND DOWN** | Elevated risk: chop + low vol, exhaustion, or multiple risk flags | Don't trade regardless of what primary indicator shows |

**Consensus logic:**
```
STAND DOWN  → Any stand-down condition active (chop+lowvol, exhaustion+weak, chop+weak)
CALL OK     → Strong CALL bias (composite score > strong threshold)
PUT OK      → Strong PUT bias (composite score < -strong threshold)
WAIT        → Everything else (weak bias, neutral, mixed)
```

**How to read it at a glance:**
- Green "CALL OK" → You have a green light for CALL trades
- Red "PUT OK" → You have a green light for PUT trades
- Yellow "WAIT" → Market is ambiguous, patience required
- Gray "STAND DOWN" → Market is dangerous, protect capital

---

## Quick Reference Card

```
╔══════════════════════════════════════════════════════╗
║          MARKET STRUCTURE COMPASS v1.0               ║
║              QUICK REFERENCE                         ║
╠══════════════════════════════════════════════════════╣
║                                                      ║
║  CONSENSUS = CALL OK  →  Trust CALL signals          ║
║  CONSENSUS = PUT OK   →  Trust PUT signals           ║
║  CONSENSUS = WAIT     →  Skip all trades             ║
║  CONSENSUS = STAND DN →  No trading, protect capital  ║
║                                                      ║
║  RISK FLAGS:                                         ║
║    CHOP     = Regime is choppy, no edge              ║
║    EXTENDED = Price too far from mean                 ║
║    LOW VOL  = Market is dead                         ║
║    EXHAUST  = Move is exhausted, reversal risk       ║
║    CONFLICT = LTF and HTF disagree                   ║
║                                                      ║
║  SCORE:                                              ║
║    +65 to +100 = Strong CALL environment             ║
║    +45 to +65  = Weak CALL (caution)                 ║
║    -45 to +45  = Neutral (no edge)                   ║
║    -65 to -45  = Weak PUT (caution)                  ║
║    -100 to -65 = Strong PUT environment              ║
║                                                      ║
║  STRATEGY TRADES:                                    ║
║    Long entries = CALL validation (not real orders)   ║
║    Short entries = PUT validation (not real orders)   ║
║    Hold = 6 bars (30s) or 12 bars (15s) = 180s      ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
```

---

*Strategy designed for BTCUSDT and ETHUSDT on 15s/30s charts with 3m HTF confirmation.*
*For manual 180-second crypto options trading on myrockitcoin.com.*
*Use as a BACKUP confirmation layer alongside your primary entry indicator.*
