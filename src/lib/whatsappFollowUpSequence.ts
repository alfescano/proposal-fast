/**
 * WhatsApp Automation Follow-Up Sequence
 * Optimized for converting free users to paid customers
 * Triggers based on user actions and time delays
 */

export interface FollowUpMessage {
  id: string;
  trigger: string; // "immediate", "24h", "3d", "7d"
  conditions: string[]; // conditions that must be met
  text: string;
  delay?: number; // milliseconds before sending
  includeLink?: string;
  buttons?: FollowUpButton[];
}

export interface FollowUpButton {
  id: string;
  text: string;
  action: string;
}

/**
 * MESSAGE 1 - Immediate After First Proposal
 * Goal: Strike while iron is hot, show instant value of Pro features
 */
export const message1_immediate: FollowUpMessage = {
  id: "followup_msg_1",
  trigger: "immediate",
  conditions: ["user_generated_first_proposal"],
  delay: 3000, // Wait 3 seconds after proposal generation
  text: `🎉 *Your first proposal is ready!*

But here's the thing: You just spent 1 minute creating what normally takes 3 hours.

Now imagine adding:
✅ Your company logo & branding (+ 30% perceived value)
✅ E-signature button (+ 40% close rate)
💳 Payment link (collect deposit instantly)
📊 Tracking (know when client opens it)

*Most Pro users report 2-3x higher close rates.*

Want to unlock these power features?`,
  buttons: [
    { id: "btn_try_pro", text: "⭐ Try Pro Free for 7 Days", action: "UPGRADE_PRO_TRIAL" },
    { id: "btn_maybe_later", text: "⏰ Maybe Later", action: "SNOOZE_FOLLOWUP" },
  ],
  includeLink: "proposalfast.ai/upgrade",
};

/**
 * MESSAGE 2 - 24 Hours Later
 * Goal: Remind of value, introduce social proof, show specificity
 */
export const message2_24h: FollowUpMessage = {
  id: "followup_msg_2",
  trigger: "24h",
  conditions: ["user_generated_first_proposal", "not_upgraded"],
  text: `Hey! 👋

Your proposal is still sitting there, but you're leaving money on the table.

*Here's what's happening:*

❌ Your proposal has basic formatting (looks OK but not premium)
❌ You have no idea if your client even opened it
❌ You have to manually follow up and hope

✅ Pro users get:
• Branded proposals (your logo, colors)
• Real-time notifications (client opens it)
• Automatic follow-ups (we handle it)
• Payment buttons (collect deposits instantly)

*Real user result:* "Used to spend 3 hours per proposal. Now 3 minutes. Close rate doubled."

The math is simple: Close just ONE client with Pro = it pays for itself.

Let's do this! 💪`,
  buttons: [
    { id: "btn_upgrade_24h", text: "🚀 Upgrade to Pro", action: "UPGRADE_PRO_TRIAL" },
    { id: "btn_dismiss", text: "Not now", action: "DISMISS" },
  ],
  includeLink: "proposalfast.ai/pricing",
};

/**
 * MESSAGE 3 - 3 Days Later
 * Goal: Create urgency, introduce scarcity, highlight competitive advantage
 */
export const message3_3d: FollowUpMessage = {
  id: "followup_msg_3",
  trigger: "3d",
  conditions: ["user_generated_first_proposal", "not_upgraded", "no_recent_interaction"],
  text: `⚠️ *Quick warning*

You've been on the free plan for 3 days now. Meanwhile:

🚀 Thousands of freelancers & agencies are using Pro to close deals 2x faster
💼 Your competitors are probably using branding, e-signatures & payment buttons
📊 They're tracking client responses. You're not.

*The gap is widening.*

**Don't lose your competitive edge.**

✨ Here's what you get with Pro:
• 🎨 Custom branding (your logo, your colors)
• ✍️ E-signatures (clients sign in the proposal)
• 💳 Payment collection (get deposits immediately)
• 📊 Full analytics (know exactly what's working)
• ⏰ Auto follow-ups (close more deals automatically)

⭐ *The best part?* Close ONE client with Pro and it pays for itself. Plus we offer 7 days risk-free.

Stop leaving money on the table.`,
  buttons: [
    { id: "btn_upgrade_3d", text: "⭐ Unlock Pro Features Now", action: "UPGRADE_PRO_TRIAL" },
    { id: "btn_ask_questions", text: "❓ Tell Me More", action: "SHOW_FAQ" },
  ],
  includeLink: "proposalfast.ai/pricing",
};

/**
 * MESSAGE 4 - 7 Days Later
 * Goal: Final push with price scarcity, risk reversal, direct action
 */
export const message4_7d: FollowUpMessage = {
  id: "followup_msg_4",
  trigger: "7d",
  conditions: ["user_generated_first_proposal", "not_upgraded"],
  text: `🎯 *Last chance. Seriously.*

You've been free for a week. Here's what happens now:

❌ Free tier benefits are being rolled back (started today)
❌ Pricing is increasing next month ($29 → $49)
❌ You're missing out on client deals every single day

✅ *Here's your options:*

**Option 1:** Lock in $29/month TODAY (grandfathered rate)
**Option 2:** Wait until next month and pay $49/month
**Option 3:** Keep free plan and keep losing to competitors

**The choice is obvious.**

📊 *By the numbers:*
• Avg Pro user close rate: +40%
• Time per proposal: 60 seconds (vs 3-4 hours free)
• ROI: 1 client pays for a full year

*And remember: 7-day money-back guarantee. Zero risk.*

Ready to make more money? Reply *UPGRADE* and we'll activate your Pro account within minutes.`,
  buttons: [
    { id: "btn_upgrade_final", text: "✅ Lock In $29/month", action: "UPGRADE_PRO_PAID" },
    { id: "btn_reply_upgrade", text: "💬 Reply UPGRADE", action: "SHOW_CHAT_INPUT" },
  ],
  includeLink: "proposalfast.ai/upgrade",
};

/**
 * MESSAGE 5 - 10 Days Later (Alternative Path)
 * Goal: Gentle win-back for users who ignored previous messages
 */
export const message5_10d: FollowUpMessage = {
  id: "followup_msg_5",
  trigger: "10d",
  conditions: ["user_generated_first_proposal", "not_upgraded", "ignored_multiple_followups"],
  text: `We get it. You're busy. 😅

But you're leaving your biggest opportunity on the table.

*Real talk:* You've already experienced the speed of ProposalFast (3-4 hours → 60 seconds). Imagine now:

🎨 Branded proposals (clients see YOUR company, not generic templates)
💳 Instant payments (get deposits same day)
📊 Tracking (know when deals are won or lost)

*One client is all it takes.*

We've made this stupidly easy:
1. Click the link
2. Try Pro for 7 days FREE
3. Close one deal
4. It pays for itself
5. Never look back

No credit card required for the trial. Cancel anytime. You've got nothing to lose.

Let's close some deals. 💪`,
  buttons: [
    { id: "btn_win_back", text: "🎯 Start Pro Trial", action: "UPGRADE_PRO_TRIAL" },
  ],
  includeLink: "proposalfast.ai/upgrade",
};

/**
 * MESSAGE 6 - After First Proposal NOT Opened (Engagement-Based)
 * Goal: Increase proposal engagement, highlight tracking benefits
 */
export const message6_proposal_not_opened: FollowUpMessage = {
  id: "followup_msg_6",
  trigger: "proposal_not_opened_24h",
  conditions: ["user_generated_proposal", "proposal_not_opened_24h", "not_upgraded"],
  text: `📧 *Heads up:*

Your client hasn't opened your proposal yet (24 hours).

**This is where most freelancers fail.**

You send a proposal, don't hear back, and assume they're not interested. Wrong.

With *Pro*, you'd know:
✅ When they opened it
✅ Which sections they read
✅ How long they spent on pricing
✅ When to follow up for maximum impact

*Example:* Client opens proposal, spends 5 minutes on pricing, leaves. Pro users know to call immediately. Free users assume they're not interested.

**Result:** Pro users close 3x more deals because they follow up at the RIGHT time.

Want that advantage?`,
  buttons: [
    { id: "btn_pro_tracking", text: "📊 See Client Tracking Demo", action: "SHOW_TRACKING_DEMO" },
    { id: "btn_upgrade_tracking", text: "⭐ Upgrade to Pro", action: "UPGRADE_PRO_TRIAL" },
  ],
  includeLink: "proposalfast.ai/upgrade",
};

/**
 * MESSAGE 7 - Win-Back (For Users Who Cancel)
 * Goal: Recover churned users with special offer
 */
export const message7_winback: FollowUpMessage = {
  id: "followup_msg_7",
  trigger: "subscription_cancelled",
  conditions: ["pro_user_cancelled"],
  text: `We're sad to see you go. 😢

Before you leave, can we ask: Was there something we could have done better?

*Or maybe you just needed a break?*

Either way, we'd love to have you back. 

**Special offer (72 hours only):**
✨ Your first month back: 50% OFF
✨ Lifetime $19/month locked in (normally $29)
✨ All Pro features included

This deal expires in 3 days. If you were on the fence, this is your sign. 🔥`,
  buttons: [
    { id: "btn_return_offer", text: "🔥 Claim 50% Off", action: "APPLY_WINBACK_OFFER" },
    { id: "btn_feedback", text: "💬 Share Feedback", action: "SHOW_SURVEY" },
  ],
  includeLink: "proposalfast.ai/upgrade",
};

/**
 * MESSAGE 8 - Success Story (After User Closes Deal)
 * Goal: Celebrate win, encourage Pro upgrade
 */
export const message8_deal_closed: FollowUpMessage = {
  id: "followup_msg_8",
  trigger: "proposal_accepted",
  conditions: ["free_user_proposal_accepted"],
  text: `🎉 *CONGRATS! Your proposal was accepted!*

You just closed a deal with ProposalFast!

Now imagine if you had Pro features:
✅ You'd have tracked their engagement the whole time
✅ You'd have collected a deposit through the proposal
✅ You'd have their signature already done
✅ Entire deal would be automated

**Translation:** Same result, but 80% less work, 2x faster.

And here's the kicker: *This deal already paid for your Pro subscription. Multiple times over.*

Why not upgrade and make the next one even easier?`,
  buttons: [
    { id: "btn_celebrate_upgrade", text: "⭐ Upgrade & Celebrate", action: "UPGRADE_PRO_TRIAL" },
    { id: "btn_share_success", text: "📢 Share My Win", action: "SHARE_SUCCESS" },
  ],
  includeLink: "proposalfast.ai/upgrade",
};

/**
 * SEQUENCE CONFIGURATION
 * Defines when each message sends based on user conditions
 */
export const followUpSequence = [
  message1_immediate, // Sends immediately after first proposal
  message2_24h, // Sends 24 hours later if no upgrade
  message3_3d, // Sends 3 days later with urgency
  message4_7d, // Final push at 7 days with price scarcity
  message5_10d, // Win-back attempt at 10 days
  message6_proposal_not_opened, // Sends if proposal not opened within 24h
  message7_winback, // Win-back offer for cancelled subscribers
  message8_deal_closed, // Celebration + upsell after deal closes
];

/**
 * SEND STRATEGY
 * Optimized timing and frequency
 */
export const sendStrategy = {
  immediate: {
    delay: 3000, // 3 seconds after action
    frequency: "once",
  },
  "24h": {
    delay: 86400000, // 24 hours
    frequency: "once",
    conditions: ["not_upgraded"],
  },
  "3d": {
    delay: 259200000, // 3 days
    frequency: "once",
    conditions: ["not_upgraded", "no_engagement"],
  },
  "7d": {
    delay: 604800000, // 7 days
    frequency: "once",
    conditions: ["not_upgraded", "multiple_proposals"],
  },
  "10d": {
    delay: 864000000, // 10 days
    frequency: "once",
    conditions: ["not_upgraded", "ignored_multiple"],
  },
};

/**
 * CONVERSION METRICS TO TRACK
 */
export const metricsToTrack = {
  messageDelivered: "Count of messages sent",
  messageClicked: "Count of CTA button clicks",
  messageConverted: "Count of users who upgraded after message",
  conversionRate: "CTR / Delivered",
  timeToConversion: "Days from first proposal to upgrade",
  messageSequenceCompletion: "Users who received all 4 messages",
  bestPerformingMessage: "Which message drove most upgrades",
  bestPerformingCTA: "Which button text converted best",
  clickThroughByDelay: "CTR by message timing",
};

/**
 * A/B TESTING VARIANTS
 * Test different copy and timing
 */
export const abTestVariants = {
  subject_line: {
    control: "Your proposal is ready!",
    variant_a: "You're leaving money on the table",
    variant_b: "Double your close rate (it's easy)",
  },
  urgency_level: {
    low: "Gentle reminder, no pressure",
    medium: "Time-sensitive offer",
    high: "Price increase scarcity",
  },
  social_proof_style: {
    specific: "Real user quote with metric",
    generic: "General statement about Pro users",
    none: "No social proof",
  },
  cta_copy: {
    benefit_driven: "⭐ Unlock Pro Features Now",
    urgency_driven: "🔥 Lock In $29/month",
    action_driven: "✅ Start Pro Trial",
  },
};

export default {
  followUpSequence,
  sendStrategy,
  metricsToTrack,
  abTestVariants,
  message1_immediate,
  message2_24h,
  message3_3d,
  message4_7d,
  message5_10d,
  message6_proposal_not_opened,
  message7_winback,
  message8_deal_closed,
};
