/**
 * Dashboard Onboarding & Welcome Messages
 * Optimized for first-time user activation and conversion
 */

export interface OnboardingMessage {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  steps?: OnboardingStep[];
  cta: {
    text: string;
    action: string;
  };
  secondary_cta?: {
    text: string;
    action: string;
  };
  icon?: string;
  urgency?: string;
}

export interface OnboardingStep {
  number: number;
  title: string;
  description: string;
  icon?: string;
}

/**
 * WELCOME MODAL - First-time user sees this immediately after signup
 */
export const welcomeModal: OnboardingMessage = {
  id: "welcome_modal",
  icon: "🎉",
  title: "Welcome to ProposalFast.ai!",
  subtitle: "Your fastest path to closing more clients",
  description:
    "You're about to generate your first client-winning proposal in under 60 seconds. No templates to browse, no writing—just AI-powered brilliance.",
  steps: [
    {
      number: 1,
      title: "Click 'Create New Proposal'",
      description: "Tell us about your client and project",
      icon: "📋",
    },
    {
      number: 2,
      title: "Enter Client Details",
      description: "Name, service, and budget (takes 30 seconds)",
      icon: "✍️",
    },
    {
      number: 3,
      title: "Watch AI Magic Happen",
      description: "Professional proposal generated instantly",
      icon: "✨",
    },
  ],
  cta: {
    text: "Create My First Proposal 🚀",
    action: "START_GENERATOR",
  },
  secondary_cta: {
    text: "Show me a demo",
    action: "VIEW_DEMO",
  },
  urgency: "Pro tip: Your first proposal typically closes 40% faster because it's personalized.",
};

/**
 * GENERATOR PAGE - Intro modal before starting
 */
export const generatorIntro: OnboardingMessage = {
  id: "generator_intro",
  icon: "⚡",
  title: "Generate Your Proposal in 60 Seconds",
  subtitle: "3 questions, 1 professional proposal",
  description:
    "Just answer a few quick questions about your client and project. Our AI will handle the rest—crafting persuasive copy, professional formatting, and proven structure that wins clients.",
  steps: [
    {
      number: 1,
      title: "Client's Name",
      description: "Who are you creating this for?",
      icon: "👤",
    },
    {
      number: 2,
      title: "Project Details",
      description: "What service or product are you proposing?",
      icon: "🎯",
    },
    {
      number: 3,
      title: "Budget/Pricing",
      description: "What's the project value?",
      icon: "💰",
    },
  ],
  cta: {
    text: "Let's Build It 💪",
    action: "BEGIN_GENERATOR",
  },
  secondary_cta: {
    text: "See an example first",
    action: "VIEW_EXAMPLE",
  },
  urgency: "💡 Most users complete this in 2-3 minutes. Ready?",
};

/**
 * DASHBOARD WALKTHROUGH - Guided tour of key features
 */
export const dashboardWalkthrough: OnboardingMessage = {
  id: "dashboard_walkthrough",
  icon: "📊",
  title: "Your Dashboard at a Glance",
  subtitle: "Everything you need to manage & scale proposals",
  description:
    "Navigate your complete proposal ecosystem. See all your proposals, track client responses, monitor close rates, and unlock powerful insights.",
  steps: [
    {
      number: 1,
      title: "Create Proposals",
      description: "Generate AI proposals in seconds",
      icon: "📝",
    },
    {
      number: 2,
      title: "Track Clients",
      description: "See opens, views, signatures, payments",
      icon: "👁️",
    },
    {
      number: 3,
      title: "Customize Brand",
      description: "Add your logo, colors, and messaging",
      icon: "🎨",
    },
    {
      number: 4,
      title: "Collect Payments",
      description: "Payment buttons & e-signature integration",
      icon: "💳",
    },
  ],
  cta: {
    text: "Start the Tour",
    action: "BEGIN_TOUR",
  },
  secondary_cta: {
    text: "Skip for now",
    action: "SKIP_TOUR",
  },
};

/**
 * FEATURE SPOTLIGHT - Highlight Pro features to free users
 */
export const brandKitSpotlight: OnboardingMessage = {
  id: "brand_kit_spotlight",
  icon: "🎨",
  title: "Unlock Your Brand Identity",
  subtitle: "Make every proposal unmistakably YOURS",
  description:
    "Your proposals are currently using default branding. Upgrade to Pro to add your logo, colors, fonts, and messaging. Clients will see YOUR brand, not a generic template.",
  steps: [
    {
      number: 1,
      title: "Upload Your Logo",
      description: "Professional + personalized",
      icon: "📷",
    },
    {
      number: 2,
      title: "Set Brand Colors",
      description: "Match your company identity",
      icon: "🎯",
    },
    {
      number: 3,
      title: "Custom Messaging",
      description: "Add your unique value proposition",
      icon: "✍️",
    },
  ],
  cta: {
    text: "Upgrade to Pro & Brand Your Proposals 💎",
    action: "UPGRADE_PRO_BRAND",
  },
  secondary_cta: {
    text: "Later",
    action: "DISMISS",
  },
  urgency: "Branding increases perceived value by 30%+",
};

/**
 * PAYMENT INTEGRATION - Highlight closing power
 */
export const paymentIntegrationSpotlight: OnboardingMessage = {
  id: "payment_integration_spotlight",
  icon: "💳",
  title: "Close Deals Instantly",
  subtitle: "Collect deposits right from the proposal",
  description:
    "Add payment buttons to your proposals. Clients can sign AND pay without leaving the document. Reduce close time by 50%. Increase conversion by 40%.",
  steps: [
    {
      number: 1,
      title: "Client Opens Proposal",
      description: "Beautiful, branded document",
      icon: "👀",
    },
    {
      number: 2,
      title: "Client Signs Electronically",
      description: "E-signature built-in",
      icon: "✍️",
    },
    {
      number: 3,
      title: "Client Pays Immediately",
      description: "Payment button right in the proposal",
      icon: "💰",
    },
  ],
  cta: {
    text: "Upgrade to Pro & Add Payment Links 🚀",
    action: "UPGRADE_PRO_PAYMENT",
  },
  secondary_cta: {
    text: "Not now",
    action: "DISMISS",
  },
  urgency: "Pro users report 25-40% faster close rates.",
};

/**
 * ANALYTICS SPOTLIGHT - Show value of tracking
 */
export const analyticsSpotlight: OnboardingMessage = {
  id: "analytics_spotlight",
  icon: "📊",
  title: "Track Every Client Interaction",
  subtitle: "Know exactly where deals are won or lost",
  description:
    "See when clients open, view, and sign proposals. Understand which proposals convert best. Follow up at the perfect moment. Stop guessing.",
  steps: [
    {
      number: 1,
      title: "Real-Time Notifications",
      description: "Know instantly when client opens",
      icon: "🔔",
    },
    {
      number: 2,
      title: "Engagement Metrics",
      description: "Track reads, time spent, which sections",
      icon: "📈",
    },
    {
      number: 3,
      title: "Win Rate Analysis",
      description: "See your proposal close rate trending up",
      icon: "🎯",
    },
  ],
  cta: {
    text: "Unlock Analytics With Pro 📊",
    action: "UPGRADE_PRO_ANALYTICS",
  },
  secondary_cta: {
    text: "Learn more",
    action: "LEARN_ANALYTICS",
  },
  urgency: "Data-driven follow-up increases close rates 3x.",
};

/**
 * ACHIEVEMENT MODAL - Celebrate first proposal creation
 */
export const firstProposalAchievement: OnboardingMessage = {
  id: "first_proposal_achievement",
  icon: "🎉",
  title: "🏆 Congrats! Your First Proposal is Ready!",
  subtitle: "You just saved 2+ hours of work",
  description:
    "Your proposal looks stunning and is ready to impress your client. But here's the thing: 60% of proposals never convert. Want to know why yours WILL?",
  steps: [
    {
      number: 1,
      title: "Add Your Branding",
      description: "Make it unmistakably yours (+20% perceived value)",
      icon: "🎨",
    },
    {
      number: 2,
      title: "Add Payment Button",
      description: "Client can sign & pay without leaving the doc (+40% conversion)",
      icon: "💳",
    },
    {
      number: 3,
      title: "Enable Tracking",
      description: "Know when they open it & when to follow up (+3x close rate)",
      icon: "👁️",
    },
  ],
  cta: {
    text: "Upgrade to Pro & Maximize Close Rate 🚀",
    action: "UPGRADE_PRO_FULL",
  },
  secondary_cta: {
    text: "Send as-is for now",
    action: "SEND_PROPOSAL",
  },
  urgency: "Pro users average 2.3x higher close rates.",
};

/**
 * USAGE MILESTONE - After 3 free proposals
 */
export const usageMilestoneThree: OnboardingMessage = {
  id: "usage_milestone_three",
  icon: "📈",
  title: "You're on a Roll! 🔥",
  subtitle: "3 proposals created. Time to level up?",
  description:
    "You've already experienced the power of ProposalFast. Imagine doing this 10x faster with branding, tracking, and payment collection. That's Pro.",
  steps: [
    {
      number: 1,
      title: "Before Pro",
      description: "3-4 hours per proposal + no tracking",
      icon: "😐",
    },
    {
      number: 2,
      title: "With Pro",
      description: "1-2 minutes per proposal + full analytics",
      icon: "⚡",
    },
    {
      number: 3,
      title: "Your ROI",
      description: "Close just 1 client = Pro pays for itself",
      icon: "💰",
    },
  ],
  cta: {
    text: "Try Pro Free for 7 Days 💎",
    action: "UPGRADE_PRO_TRIAL",
  },
  secondary_cta: {
    text: "Keep free plan",
    action: "SKIP_UPGRADE",
  },
  urgency: "7-day money-back guarantee. No risk.",
};

/**
 * INACTIVITY REMINDER - Bring users back
 */
export const inactivityReminder: OnboardingMessage = {
  id: "inactivity_reminder",
  icon: "👋",
  title: "Hey, We Miss You! 👋",
  subtitle: "Your first client deal is waiting",
  description:
    "You created an account to generate proposals faster. Ready to create your next one? (Hint: It'll take less than 2 minutes.)",
  steps: [
    {
      number: 1,
      title: "Remember?",
      description: "You used to spend hours on proposals",
      icon: "😵",
    },
    {
      number: 2,
      title: "Now?",
      description: "60 seconds with ProposalFast",
      icon: "⚡",
    },
    {
      number: 3,
      title: "Next?",
      description: "Create your winning proposal today",
      icon: "🚀",
    },
  ],
  cta: {
    text: "Generate a New Proposal 🎯",
    action: "START_GENERATOR",
  },
  secondary_cta: {
    text: "I'm busy",
    action: "REMIND_LATER",
  },
};

/**
 * DASHBOARD TOOLTIPS - Context-aware help messages
 */
export const dashboardTooltips = {
  create_proposal: {
    title: "💡 Create a New Proposal",
    text: "Click here to start generating a new proposal. Just describe what you're selling—AI handles the rest.",
    example: "Example: 'Social media marketing for 3 months' or 'Website redesign'",
  },
  my_proposals: {
    title: "📋 Your Proposals Library",
    text: "All your proposals in one place. See which are pending, signed, or paid.",
    tip: "Pro users can track when clients open and view their proposals.",
  },
  templates: {
    title: "🎨 Your Templates",
    text: "Pre-built templates for different industries. Save time by reusing.",
    upgrade: "Pro users can customize and save unlimited templates.",
  },
  brand_kit: {
    title: "🎨 Brand Kit",
    text: "Upload your logo, set your colors, customize messaging. Make every proposal unmistakably YOU.",
    upgrade: "Free plan uses default branding. Upgrade to Pro for full customization.",
  },
  integrations: {
    title: "🔗 Integrations",
    text: "Connect with Stripe (payments), HubSpot (CRM), Calendly (meetings).",
    upgrade: "Pro users get payment, CRM, and calendar integrations.",
  },
  analytics: {
    title: "📊 Your Analytics",
    text: "Track opens, views, signatures, and payments. See your close rate in real-time.",
    tip: "Pro users who track proposals close 3x more deals.",
  },
  settings: {
    title: "⚙️ Settings",
    text: "Manage your account, subscription, notifications, and integrations.",
    security: "Keep your information secure. Enable two-factor authentication.",
  },
};

/**
 * TOOLBAR TIPS - Quick contextual tips
 */
export const toolbarTips = [
  {
    id: "tip_1",
    icon: "💡",
    text: "💡 Tip: Type what you want to propose (e.g., 'Create a proposal for social media marketing')",
  },
  {
    id: "tip_2",
    icon: "🔥",
    text: "🔥 Your success starts with your first client. Let's win that client today.",
  },
  {
    id: "tip_3",
    icon: "⚡",
    text: "⚡ Pro users generate proposals 30x faster. Try Pro free for 7 days.",
  },
  {
    id: "tip_4",
    icon: "👀",
    text: "👀 Did you know? Adding your branding increases perceived value by 30%.",
  },
  {
    id: "tip_5",
    icon: "💰",
    text: "💰 Close one client with ProposalFast Pro and it pays for itself instantly.",
  },
  {
    id: "tip_6",
    icon: "📈",
    text: "📈 Proposals with e-signatures close 2.5x faster. Upgrade to Pro to unlock.",
  },
];

/**
 * FEATURE UNLOCK MESSAGES - Show what's available at each tier
 */
export const featureUnlock = {
  free: {
    features: ["Unlimited AI proposals", "PDF & HTML export", "Basic templates"],
    locked: ["Custom branding", "E-signatures", "Payment collection", "Client tracking", "Analytics"],
  },
  pro: {
    features: [
      "Everything in Free",
      "Custom branding (logo, colors, fonts)",
      "E-signature integration",
      "Payment collection (Stripe, PayPal)",
      "Client tracking & analytics",
      "CRM integration",
      "Priority support",
    ],
    locked: ["Team collaboration", "API access", "White-label"],
  },
  business: {
    features: [
      "Everything in Pro",
      "Team collaboration (unlimited users)",
      "Advanced analytics & reporting",
      "Custom integrations",
      "API access",
      "Dedicated account manager",
      "Custom contracts",
    ],
  },
};

/**
 * EXPORT - All onboarding messages
 */
export const onboardingMessages = {
  welcome: welcomeModal,
  generatorIntro,
  dashboardWalkthrough,
  brandKitSpotlight,
  paymentIntegrationSpotlight,
  analyticsSpotlight,
  firstProposalAchievement,
  usageMilestoneThree,
  inactivityReminder,
  tooltips: dashboardTooltips,
  toolbarTips,
  featureUnlock,
};

export default onboardingMessages;
