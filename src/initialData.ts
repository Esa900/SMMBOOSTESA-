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
    name: "Instagram Followers [High Quality / Safe / Day 5K / Non-Drop]",
    category: "Instagram",
    rate: 12.89,
    min: 100,
    max: 100000,
    description: "⚡ Start Time: 0-1 Hours\n⚡ Delivery Speed: 5,000/Day\n♻️ Guarantee: Lifetime Auto-Refill\n👤 Quality: Premium profiles with real-looking bio, avatars, and posts matching famegrows.com standard."
  },
  {
    id: "IG-102",
    name: "Instagram Followers [Active & Highly Engaged / Fast Delivery]",
    category: "Instagram",
    rate: 19.99,
    min: 100,
    max: 50000,
    description: "⚡ Start Time: Instant\n⚡ Delivery Speed: 8,000/Day\n♻️ Guarantee: 30 Days Auto-Refill\n👤 Quality: Highly active real profiles with post uploads and active stories."
  },
  {
    id: "IG-103",
    name: "Instagram Likes [Real Accounts / Super Instant / Lifetime]",
    category: "Instagram",
    rate: 5.89,
    min: 50,
    max: 50000,
    description: "⚡ Start Time: Super Instant (1-5 min)\n⚡ Delivery Speed: 15,000/Day\n🛡️ Guarantee: Lifetime Non-Drop\n👤 Quality: Real active likes from authentic accounts."
  },
  {
    id: "IG-104",
    name: "Instagram Reels Views [Instant Viral Boost / Non-Drop]",
    category: "Instagram",
    rate: 0.89,
    min: 500,
    max: 1000000,
    description: "⚡ Start Time: Instant\n⚡ Speed: 1,000,000/Day\n♻️ Drop Rate: 0%\n📎 Link: Input full Reel or video link."
  },

  // YouTube
  {
    id: "YT-101",
    name: "YouTube Subscribers [Organic Growth / Non-Drop / Safe]",
    category: "YouTube",
    rate: 89.89,
    min: 50,
    max: 10000,
    description: "⚡ Start Time: 12-24 Hours\n⚡ Speed: 200-500 Subscribers/Day\n🛡️ Guarantee: 100% Lifetime Refill\n⚠️ Note: Channel must have at least 1 public video of any duration."
  },
  {
    id: "YT-102",
    name: "YouTube Views [Super Stable / Suggested & External Traffic]",
    category: "YouTube",
    rate: 4.99,
    min: 500,
    max: 200000,
    description: "⚡ Start Time: 1-3 Hours\n⚡ Speed: 5,000-10,000/Day\n🎯 Traffic Sources: Suggested videos, YouTube search engine optimization.\n🛡️ Guarantee: Fully Lifetime Guaranteed."
  },

  // TikTok
  {
    id: "TK-101",
    name: "TikTok Followers [Premium Profiles / Fast Delivery / Safe]",
    category: "TikTok",
    rate: 14.89,
    min: 100,
    max: 50000,
    description: "⚡ Start: 0-6 hours\n⚡ Speed: 10K/Day\n🛡️ 30-Day Auto-Refill. Non-Drop high retention profiles."
  },
  {
    id: "TK-102",
    name: "TikTok Likes [Instant Viral Boost / Active Accounts]",
    category: "TikTok",
    rate: 7.99,
    min: 100,
    max: 50000,
    description: "⚡ Start Time: Instant\n⚡ Speed: 15,000/Day\n👤 Quality: Real active likes to trigger the TikTok algorithm."
  },
  {
    id: "TK-103",
    name: "TikTok Views [Super Instant / Viral Algorithm Trigger]",
    category: "TikTok",
    rate: 0.49,
    min: 1000,
    max: 10000000,
    description: "⚡ Start Time: Instant\n⚡ Speed: 5,000,000/Day\n📎 Link: Input full TikTok video link."
  },

  // Telegram
  {
    id: "TG-101",
    name: "Telegram Channel Members [High Quality / Non-Drop / Instant]",
    category: "Telegram",
    rate: 11.49,
    min: 100,
    max: 25000,
    description: "⚡ Start: Instant to 2 hours\n👤 Quality: Safe active-looking English & global names. Drop rate 0% guaranteed."
  },

  // Facebook
  {
    id: "FB-101",
    name: "Facebook Page Likes & Followers [Premium / Lifetime Refill]",
    category: "Facebook",
    rate: 24.89,
    min: 250,
    max: 50000,
    description: "⚡ Start: 1-3 hours\n⚡ Speed: 2,500/Day\n🛡️ Guarantee: Lifetime guarantee against drops."
  },
  {
    id: "FB-102",
    name: "Facebook Video Views [Ultra Fast Speed / Monetizable]",
    category: "Facebook",
    rate: 1.89,
    min: 500,
    max: 100000,
    description: "⚡ Start Time: Instant (1-10 min)\n⚡ Speed: 100,000/Day\n🎯 Traffic Sources: In-stream ads and video recommendations."
  },

  // Twitter/X
  {
    id: "TW-101",
    name: "Twitter (X) Followers [Real Grade / Non-Drop / Premium]",
    category: "Twitter / X",
    rate: 34.89,
    min: 100,
    max: 20000,
    description: "⚡ Start: 1-2 hours\n⚡ Speed: 1,500/Day\n👤 Quality: High tier profiles with crypto, tech, and creative bios."
  }
];

export const initialUsers: User[] = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@example.com",
    balance: 0.00,
    totalSpent: 354.50,
    role: "user",
    status: "active"
  },
  {
    id: "USR-002",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    balance: 0.00,
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
    method: "bKash Personal",
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
    subject: "Failing to send manual bKash deposit",
    category: "Payment",
    status: "Open",
    createdAt: "2026-06-13T04:20:00-07:00",
    messages: [
      {
        sender: "user",
        message: "Hi, I am trying to deposit $50 of manual bKash but my TrxId keeps getting flagged. Can you help me process this manually or check the transaction status?",
        createdAt: "2026-06-13T04:20:00-07:00"
      }
    ]
  }
];
