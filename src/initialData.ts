import { Service, Category, Order, User, Ticket, Transaction } from "./types";

export const initialCategories: Category[] = [
  { id: "instagram", name: "Instagram", iconName: "Instagram" },
  { id: "youtube", name: "YouTube", iconName: "Youtube" },
  { id: "tiktok", name: "TikTok", iconName: "Music" },
  { id: "facebook", name: "Facebook", iconName: "Facebook" },
  { id: "twitter", name: "Twitter / X", iconName: "MessageCircle" },
  { id: "telegram", name: "Telegram", iconName: "Send" },
];

export const initialServices: Service[] = [
  // Instagram
  {
    id: "IG-101",
    name: "Instagram Followers [Real & Active / Lifetime Guarantee / Day 15K]",
    category: "Instagram",
    rate: 1.85,
    min: 100,
    max: 100000,
    description: "⚡ Start Time: 0-1 Hours\n⚡ Speed: 15,000/Day\n🛡️ Guarantee: Lifetime Auto-Refill\n👤 Quality: Real look profiles with posts and active stories."
  },
  {
    id: "IG-102",
    name: "Instagram Followers [High Speed / Low Drop / No Refill]",
    category: "Instagram",
    rate: 0.95,
    min: 200,
    max: 250000,
    description: "⚡ Start Time: Instant\n⚡ Speed: 50,000/Day\n❌ Guarantee: No Refill\n👤 Quality: Mixed bots and real-looking profiles."
  },
  {
    id: "IG-201",
    name: "Instagram Likes [Super Instant / Maximum 50k / Real Accounts]",
    category: "Instagram",
    rate: 0.45,
    min: 50,
    max: 50000,
    description: "⚡ Start Time: Instant (1-5 min)\n⚡ Speed: 20,000/Day\n🛡️ Guarantee: 30 Days Refill\n👤 Quality: Real active likes."
  },
  {
    id: "IG-301",
    name: "Instagram Reels Views [Instant Speed / Day 1M / Non-Drop]",
    category: "Instagram",
    rate: 0.12,
    min: 500,
    max: 1000000,
    description: "⚡ Start Time: Instant\n⚡ Speed: 1,000,000/Day\n♻️ Drop Rate: 0%\n📎 Link: Input full Reel link or post link."
  },

  // YouTube
  {
    id: "YT-101",
    name: "YouTube Subscribers [Organic / Non-Drop / Day 500]",
    category: "YouTube",
    rate: 18.50,
    min: 50,
    max: 10000,
    description: "⚡ Start Time: 12-24 Hours\n⚡ Speed: 200-500/Day\n🛡️ Guarantee: 30-Day Refill\n⚠️ Note: Channel must have at least 1 video of 2+ minutes."
  },
  {
    id: "YT-201",
    name: "YouTube Views [Super Stable / External & Search Traffic]",
    category: "YouTube",
    rate: 3.20,
    min: 500,
    max: 200000,
    description: "⚡ Start Time: 1-3 Hours\n⚡ Speed: 5,000-10,000/Day\n🎯 Traffic Sources: Suggested videos, YouTube search, external embeds.\n🛡️ Guarantee: Fully Lifetime Guaranteed."
  },
  {
    id: "YT-301",
    name: "YouTube Watch Time Hours [100% Monetizable / 15+ Min Video]",
    category: "YouTube",
    rate: 11.20,
    min: 100,
    max: 4000,
    description: "⚡ Start Time: 24-48 Hours\n⚡ Speed: 200-400 Hours/Day\n⚠️ Requirements: Video must be 15+ Minutes long. Public video only."
  },

  // TikTok
  {
    id: "TK-101",
    name: "TikTok Followers [Real Look / Day 10k / Safe]",
    category: "TikTok",
    rate: 3.80,
    min: 100,
    max: 50000,
    description: "⚡ Start: 0-6 hours\n⚡ Speed: 10K/Day\n🛡️ 30-Day Refill policy. Stable and safe profiles."
  },
  {
    id: "TK-201",
    name: "TikTok Views [Super Viral Boost / Instant / Max 10M]",
    category: "TikTok",
    rate: 0.04,
    min: 1000,
    max: 10000000,
    description: "⚡ Start Time: Instant\n⚡ Cost-effective tool for boosting statistics and algorithm trigger."
  },

  // Telegram
  {
    id: "TG-101",
    name: "Telegram Channel Members [High Quality / Safe / Non-Drop]",
    category: "Telegram",
    rate: 2.10,
    min: 100,
    max: 25000,
    description: "⚡ Start: Instant to 2 hours.\n👤 Quality: Clean active-looking profiles with English, Arabic, Russian names."
  },

  // Facebook
  {
    id: "FB-101",
    name: "Facebook Page Likes & Followers [Premium / Organic Speed]",
    category: "Facebook",
    rate: 5.40,
    min: 250,
    max: 50000,
    description: "⚡ Start: 1-3 hours\n⚡ Speed: 2K-5K/Day\n🛡️ Guarantee: Lifetime guarantee against drops."
  },

  // Twitter/X
  {
    id: "TW-101",
    name: "Twitter (X) Followers [Real Grade / Non-Drop / Stable]",
    category: "Twitter / X",
    rate: 12.90,
    min: 100,
    max: 20000,
    description: "⚡ Start: 1-2 hours\n⚡ Quality: High quality profiles with crypto & tech bio histories."
  }
];

export const initialUsers: User[] = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@example.com",
    balance: 145.50,
    totalSpent: 354.50,
    role: "user",
    status: "active"
  },
  {
    id: "USR-002",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    balance: 12.00,
    totalSpent: 1058.00,
    role: "user",
    status: "active"
  },
  {
    id: "USR-003",
    name: "Admin Portal",
    email: "esakhan5477@gmail.com",
    balance: 9999.00,
    totalSpent: 0,
    role: "admin",
    status: "active"
  }
];

export const initialOrders: Order[] = [
  {
    id: "ORD-9481",
    userId: "USR-001",
    userName: "John Doe",
    serviceId: "IG-101",
    serviceName: "Instagram Followers [Real & Active / Lifetime Guarantee / Day 15K]",
    category: "Instagram",
    link: "https://instagram.com/influencer.jane",
    quantity: 5000,
    charge: 9.25,
    status: "Completed",
    createdAt: "2026-06-11T14:32:00-07:00"
  },
  {
    id: "ORD-9482",
    userId: "USR-001",
    userName: "John Doe",
    serviceId: "YT-201",
    serviceName: "YouTube Views [Super Stable / External & Search Traffic]",
    category: "YouTube",
    link: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    quantity: 10000,
    charge: 32.00,
    status: "Processing",
    createdAt: "2026-06-12T09:15:00-07:00"
  },
  {
    id: "ORD-9483",
    userId: "USR-002",
    userName: "Sarah Jenkins",
    serviceId: "YT-101",
    serviceName: "YouTube Subscribers [Organic / Non-Drop / Day 500]",
    category: "YouTube",
    link: "https://youtube.com/c/sarahgaming",
    quantity: 1000,
    charge: 18.50,
    status: "Pending",
    createdAt: "2026-06-13T01:40:00-07:00"
  },
  {
    id: "ORD-9484",
    userId: "USR-001",
    userName: "John Doe",
    serviceId: "TK-201",
    serviceName: "TikTok Views [Super Viral Boost / Instant / Max 10M]",
    category: "TikTok",
    link: "https://tiktok.com/@johndoetok/video/721345678",
    quantity: 50000,
    charge: 2.00,
    status: "Completed",
    createdAt: "2026-06-12T19:00:00-07:00"
  }
];

export const initialTransactions: Transaction[] = [
  {
    id: "TXN-3921",
    userId: "USR-001",
    userName: "John Doe",
    amount: 150.00,
    method: "Credit Card",
    status: "Completed",
    createdAt: "2026-06-10T10:15:00-07:00"
  },
  {
    id: "TXN-3922",
    userId: "USR-001",
    userName: "John Doe",
    amount: 50.00,
    method: "PayPal",
    status: "Completed",
    createdAt: "2026-06-12T15:20:00-07:00"
  },
  {
    id: "TXN-3923",
    userId: "USR-002",
    userName: "Sarah Jenkins",
    amount: 200.00,
    method: "Cryptocurrency (USDT)",
    status: "Completed",
    createdAt: "2026-06-11T08:12:00-07:00"
  }
];

export const initialTickets: Ticket[] = [
  {
    id: "TCK-5081",
    userId: "USR-001",
    userName: "John Doe",
    subject: "Speed issue with Subscriber campaign",
    category: "Order",
    status: "Answered",
    createdAt: "2026-06-12T10:05:00-07:00",
    messages: [
      {
        sender: "user",
        message: "Hello, my YouTube Subscriber campaign (ORD-9482) is running a bit slow today. Do you have any updates on the dispatch time? Thank you!",
        createdAt: "2026-06-12T10:05:00-07:00"
      },
      {
        sender: "admin",
        message: "Hello John! Checked the system, this campaign (YT Subscribers) has a start buffer of up to 24 hours. Your campaign has begun sending subscribers and is fully active. You will see steady speeds today!",
        createdAt: "2026-06-12T11:45:00-07:00"
      }
    ]
  },
  {
    id: "TCK-5082",
    userId: "USR-002",
    userName: "Sarah Jenkins",
    subject: "Failing to add funds via PayPal",
    category: "Payment",
    status: "Open",
    createdAt: "2026-06-13T04:20:00-07:00",
    messages: [
      {
        sender: "user",
        message: "Hi, I am trying to deposit $50 using PayPal but I received a card gateway error. Can you help me process this manually or check the node settings?",
        createdAt: "2026-06-13T04:20:00-07:00"
      }
    ]
  }
];
