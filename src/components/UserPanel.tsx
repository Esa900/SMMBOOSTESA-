import React, { useState } from "react";
import { 
  Instagram, 
  Youtube, 
  Music, 
  Facebook, 
  MessageCircle, 
  Send, 
  PlusCircle, 
  History, 
  List, 
  CreditCard, 
  LifeBuoy, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Search, 
  ChevronRight, 
  ExternalLink,
  MessageSquare,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Service, Category, Order, Ticket, Transaction, User } from "../types";

interface UserPanelProps {
  currentUser: User;
  services: Service[];
  categories: Category[];
  orders: Order[];
  transactions: Transaction[];
  tickets: Ticket[];
  onPlaceOrder: (serviceId: string, link: string, quantity: number) => { success: boolean; message: string };
  onAddFunds: (amount: number, method: string, senderNumber?: string, trxId?: string) => void;
  onAddTicket: (subject: string, category: Ticket["category"], message: string) => void;
  onAddTicketMessage: (ticketId: string, message: string) => void;
  activeTab?: "new-order" | "orders" | "services" | "add-funds" | "tickets";
  setActiveTab?: (tab: "new-order" | "orders" | "services" | "add-funds" | "tickets") => void;
}

export default function UserPanel({
  currentUser,
  services,
  categories,
  orders,
  transactions,
  tickets,
  onPlaceOrder,
  onAddFunds,
  onAddTicket,
  onAddTicketMessage,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
}: UserPanelProps) {
  const [localActiveTab, setLocalActiveTab] = useState<"new-order" | "orders" | "services" | "add-funds" | "tickets">("new-order");
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;

  // Selection states for New Order Form
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("instagram");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [orderLink, setOrderLink] = useState("");
  const [orderQuantity, setOrderQuantity] = useState<number>(100);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");

  // Search/filter states for tables
  const [orderSearchText, setOrderSearchText] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [serviceSearchText, setServiceSearchText] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>("All");

  // Add Funds form states
  const [fundAmount, setFundAmount] = useState<number>(20);
  const [paymentMethod, setPaymentMethod] = useState<string>("bKash Personal");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [fundError, setFundError] = useState("");

  // Tickets form states
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState<Ticket["category"]>("Order");
  const [ticketMessage, setTicketMessage] = useState("");
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [newTicketSuccess, setNewTicketSuccess] = useState(false);

  // Helper for dynamic category icons
  const getCategoryIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case "Instagram": return <Instagram className={className} />;
      case "Youtube": return <Youtube className={className} />;
      case "Music": return <Music className={className} />;
      case "Facebook": return <Facebook className={className} />;
      case "MessageCircle": return <MessageCircle className={className} />;
      case "Send": return <Send className={className} />;
      default: return <Layers className={className} />;
    }
  };

  // Resolve Category Name from Category ID
  const activeCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];
  
  // Filter services by category
  const activeServices = services.filter(
    s => s.category.toLowerCase() === activeCategory.name.toLowerCase()
  );

  // Select initial service if none selected or if selected category changes
  const activeService = services.find(s => s.id === selectedServiceId) || activeServices[0];
  
  React.useEffect(() => {
    if (activeServices.length > 0) {
      // Keep selected helper aligned with category changes
      if (!activeServices.some(s => s.id === selectedServiceId)) {
        setSelectedServiceId(activeServices[0].id);
      }
    }
  }, [selectedCategoryId, activeServices, selectedServiceId]);

  // Compute stats
  const userOrders = orders.filter(o => o.userId === currentUser.id);
  const pendingOrdersCount = userOrders.filter(o => o.status === "Pending" || o.status === "Processing").length;
  const completedOrdersCount = userOrders.filter(o => o.status === "Completed").length;

  // Handle placing order
  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");
    setOrderSuccess("");

    if (!orderLink.trim()) {
      setOrderError("Please enter a valid social media URL link");
      return;
    }

    if (!activeService) {
      setOrderError("No service selected");
      return;
    }

    if (orderQuantity < activeService.min || orderQuantity > activeService.max) {
      setOrderError(`Quantity must be between ${activeService.min.toLocaleString()} and ${activeService.max.toLocaleString()}`);
      return;
    }

    const res = onPlaceOrder(activeService.id, orderLink, orderQuantity);
    if (res.success) {
      setOrderSuccess(res.message);
      setOrderLink("");
      setOrderQuantity(activeService.min);
    } else {
      setOrderError(res.message);
    }
  };

  // Handle funding submit
  const handleFundingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFundError("");
    setPaymentSuccess(false);

    if (fundAmount <= 0) {
      setFundError("Please enter an amount greater than 0");
      return;
    }

    const isBkashNagad = paymentMethod.includes("bKash") || paymentMethod.includes("Nagad");
    if (isBkashNagad) {
      if (!senderNumber.trim()) {
        setFundError("Please enter your sender mobile number (bKash/Nagad)");
        return;
      }
      if (!trxId.trim()) {
        setFundError("Please enter your Transaction ID (TrxID)");
        return;
      }

      onAddFunds(fundAmount, paymentMethod, senderNumber, trxId);
      setPaymentSuccess(true);
      // Keep senderNumber and trxId in state or reset
      setSenderNumber("");
      setTrxId("");
    } else {
      // Simulate direct instant deposit
      onAddFunds(fundAmount, paymentMethod);
      setPaymentSuccess(true);
      setCardName("");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 5000);
    }
  };

  // Handle ticket creation
  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    onAddTicket(ticketSubject, ticketCategory, ticketMessage);
    setTicketSubject("");
    setTicketMessage("");
    setNewTicketSuccess(true);
    setTimeout(() => {
      setNewTicketSuccess(false);
    }, 4000);
  };

  // Handle ticket reply
  const handleTicketReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyMessage.trim()) return;

    onAddTicketMessage(activeTicketId, replyMessage);
    setReplyMessage("");
  };

  // Filtered Lists
  const filteredOrders = userOrders.filter(o => {
    const matchesSearch = o.link.toLowerCase().includes(orderSearchText.toLowerCase()) || 
                          o.serviceName.toLowerCase().includes(orderSearchText.toLowerCase()) ||
                          o.id.toLowerCase().includes(orderSearchText.toLowerCase());
    const matchesStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(serviceSearchText.toLowerCase()) || 
                          s.id.toLowerCase().includes(serviceSearchText.toLowerCase()) ||
                          s.description.toLowerCase().includes(serviceSearchText.toLowerCase());
    const matchesCategory = serviceCategoryFilter === "All" || s.category === serviceCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  return (
    <div id="famegrows-client-layout" className="w-full space-y-6 font-sans">
      {/* 1. TOP HIGH-POLISHED STATS CARDS BLOCK */}
      <div id="user-stats-cards-grid" className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Username & Profile Status */}
        <div className="bg-white border-2 border-green-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 overflow-hidden flex items-center justify-center shrink-0">
            <svg viewBox="0 0 100 100" className="w-10 h-10 select-none">
              <circle cx="50" cy="50" r="45" fill="#fdbaf8" />
              <circle cx="50" cy="40" r="20" fill="#f43f5e" />
              <path d="M25 80 C 25 62, 75 62, 75 80 Z" fill="#9f1239" />
              <circle cx="43" cy="38" r="3" fill="#ffffff" />
              <circle cx="57" cy="38" r="3" fill="#ffffff" />
              <path d="M45 48 Q 50 51, 55 48" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">Username</span>
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-black text-slate-800 truncate font-sans">{currentUser.name}</span>
              <span className="w-4 h-4 bg-[#22c55e] text-white rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" title="Verified Member">✓</span>
            </div>
          </div>
        </div>

        {/* Card 2: Wallet Balance */}
        <div className="bg-white border-2 border-green-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
            <span className="text-xl">💵</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">Balance</span>
            <span className="text-sm sm:text-base font-black text-slate-800 font-mono block">${currentUser.balance.toFixed(3)}</span>
          </div>
        </div>

        {/* Card 3: Total Orders Counter */}
        <div className="bg-white border-2 border-green-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
            <span className="text-xl">📦</span>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">Total Orders</span>
            <span className="text-sm sm:text-base font-black text-slate-800 font-mono block">
              {(532551 + userOrders.length).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 4: Announcement Megaphone links */}
        <div className="bg-white border-2 border-green-500/20 rounded-2xl p-4 flex items-center gap-3 shadow-md">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
            <span className="text-xl">📣</span>
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-slate-400 block tracking-wide uppercase">Announcement</span>
            <a 
              href="https://t.me/smmboostesa" 
              target="_blank" 
              rel="noreferrer"
              className="mt-1 px-3 py-1 bg-[#22c55e] hover:bg-green-600 text-white rounded-full text-[10.5px] font-extrabold flex items-center justify-center gap-1 transition-all"
            >
              Join Now →
            </a>
          </div>
        </div>

      </div>

      {/* 2. SOCIAL CATEGORY CAPSULES SELECTION GRID */}
      <div id="social-grid-wrapper" className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {[
          { icon: <Instagram className="w-5 h-5 text-white" />, targetId: "instagram", name: "Instagram" },
          { icon: <Facebook className="w-5 h-5 text-white" />, targetId: "facebook", name: "Facebook" },
          { icon: <Youtube className="w-5 h-5 text-white" />, targetId: "youtube", name: "YouTube" },
          { icon: <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>, targetId: "twitter", name: "Twitter / X" },
          { icon: <span className="font-bold text-emerald-400 text-md">📻</span>, targetId: "tiktok", name: "Spotify" },
          { icon: <span className="font-bold text-rose-400 text-md">🎵</span>, targetId: "tiktok", name: "TikTok" },
          { icon: <Send className="w-5 h-5 text-white" />, targetId: "telegram", name: "Telegram" },
          { icon: <span className="font-bold text-blue-400 text-xs">LN</span>, targetId: "instagram", name: "LinkedIn" },
          { icon: <span className="font-bold text-violet-400 text-xs">DC</span>, targetId: "facebook", name: "Discord" },
          { icon: <Globe className="w-5 h-5 text-white" />, targetId: "youtube", name: "Global Services" },
          { icon: <Sparkles className="w-5 h-5 text-amber-300" />, targetId: "instagram", name: "Premium Boost" },
          { icon: <Layers className="w-5 h-5 text-teal-400" />, targetId: "facebook", name: "Other Networks" },
        ].map((item, idx) => {
          const isSelected = selectedCategoryId === item.targetId;
          return (
            <button
              key={idx}
              id={`social-capsule-${idx}`}
              onClick={() => {
                setSelectedCategoryId(item.targetId);
                setActiveTab("new-order");
              }}
              title={`SMM category ${item.name}`}
              className={`aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                isSelected 
                  ? "bg-[#22c55e] scale-105 border-2 border-white ring-2 ring-emerald-500" 
                  : "bg-slate-900 hover:bg-slate-800"
              }`}
            >
              {item.icon}
            </button>
          )
        })}
      </div>

      {/* 3. QUICK-NAV QUADRANT SELECTOR (2x2 Grid) */}
      <div id="quick-quadrant-tabs" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        
        {/* Tab 1: New Order */}
        <button
          id="quick-tab-new-order"
          onClick={() => { setActiveTab("new-order"); setActiveTicketId(null); }}
          className={`py-3.5 px-4 rounded-xl font-sans font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
            activeTab === "new-order"
              ? "bg-[#22c55e] border-[#22c55e] text-white shadow-md shadow-emerald-50/50"
              : "bg-white border-[#22c55e] text-slate-800 hover:bg-emerald-50/30"
          }`}
        >
          <span>🛒</span> New Order
        </button>

        {/* Tab 2: Add Funds */}
        <button
          id="quick-tab-add-funds"
          onClick={() => { setActiveTab("add-funds"); setActiveTicketId(null); }}
          className={`py-3.5 px-4 rounded-xl font-sans font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
            activeTab === "add-funds"
              ? "bg-[#22c55e] border-[#22c55e] text-white shadow-md shadow-emerald-50/50"
              : "bg-white border-[#22c55e] text-slate-800 hover:bg-emerald-50/30"
          }`}
        >
          <span>💵</span> Add Funds
        </button>

        {/* Tab 3: My Orders */}
        <button
          id="quick-tab-orders"
          onClick={() => { setActiveTab("orders"); setActiveTicketId(null); }}
          className={`py-3.5 px-4 rounded-xl font-sans font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-[#22c55e] border-[#22c55e] text-white shadow-md shadow-emerald-50/50"
              : "bg-white border-[#22c55e] text-slate-800 hover:bg-emerald-50/30"
          }`}
        >
          <span>📋</span> My Orders
        </button>

        {/* Tab 4: Ticket Support */}
        <button
          id="quick-tab-tickets"
          onClick={() => { setActiveTab("tickets"); setActiveTicketId(null); }}
          className={`py-3.5 px-4 rounded-xl font-sans font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
            activeTab === "tickets"
              ? "bg-[#22c55e] border-[#22c55e] text-white shadow-md shadow-emerald-50/50"
              : "bg-white border-[#22c55e] text-slate-800 hover:bg-emerald-50/30"
          }`}
        >
          <span>🎧</span> Ticket Support
        </button>

      </div>

      {/* 4. BRAND SEARCH CONTAINER */}
      <div id="search-bar-wrap" className="bg-[#f2fdf5] border border-emerald-500/15 rounded-2xl p-4.5 flex items-center relative">
        <Search className="w-4 h-4 text-emerald-600 absolute left-8 top-1/2 transform -translate-y-1/2" />
        <input
          id="inp-panel-global-search"
          type="text"
          placeholder="Search package lists, order logs or transactions..."
          value={activeTab === "services" ? serviceSearchText : activeTab === "orders" ? orderSearchText : ""}
          onChange={(e) => {
            const val = e.target.value;
            if (activeTab === "orders") {
              setOrderSearchText(val);
            } else {
              setServiceSearchText(val);
              setActiveTab("services");
            }
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 text-slate-700"
        />
      </div>

      {/* 4.5 FLOATING WHATSAPP & TELEGRAM HOTLINE WIDGETS */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3.5 z-50">
        {/* Telegram icon */}
        <a
          id="floating-tg"
          href="https://t.me/smmboostesa"
          target="_blank"
          rel="noreferrer"
          className="w-13 h-13 bg-[#0088cc] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
          title="Join Telegram Support Channel"
        >
          <Send className="w-6 h-6 shrink-0" />
        </a>

        {/* WhatsApp icon */}
        <a
          id="floating-wa"
          href="https://wa.me/12345678"
          target="_blank"
          rel="noreferrer"
          className="w-13 h-13 bg-[#25d366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all outline-none"
          title="Direct WhatsApp Helpline"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
            <path d="M12.004 0C5.378 0 .004 5.372.004 11.998c0 2.115.55 4.195 1.597 6.035L0 24l6.136-1.597a11.94 11.94 0 0 0 5.868 1.523c6.626 0 12-5.374 12-11.928C24.004 5.372 18.63 0 12.004 0zm0 22.002c-1.936 0-3.834-.5-5.514-1.45l-.396-.23L2.45 21.31l1.01-3.692-.256-.407a9.923 9.923 0 0 1-1.52-5.215C1.684 6.51 6.32 1.868 12.004 1.868c2.756 0 5.348 1.074 7.298 3.024A10.26 10.26 0 0 1 22.32 12c.002 5.49-4.814 10.002-10.316 10.002z" />
          </svg>
        </a>
      </div>

      {/* 5. ACTIVE VIEWPORT */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {/* TAB 1: NEW ORDER FORM */}
          {activeTab === "new-order" && (
            <motion.div
              key="new-order-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Category selector capsules */}
              <div id="new-order-categories" className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      id={`btn-cat-${cat.id}`}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                          : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      {getCategoryIcon(cat.iconName, "w-6 h-6 mb-2")}
                      <span className="text-[11px] font-semibold tracking-wide truncate w-full text-center">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Central Order Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form parameters */}
                <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h2 className="text-lg font-bold text-slate-800">Place an SMM Order</h2>
                  </div>

                  <form id="frm-place-order" onSubmit={handlePlaceOrderSubmit} className="space-y-4">
                    {/* Select Category read-only indicator */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Category</label>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-2 text-sm font-semibold text-slate-700 capitalize">
                        {getCategoryIcon(activeCategory.iconName, "w-4 h-4 text-slate-600")}
                        <span>{activeCategory.name} Services</span>
                      </div>
                    </div>

                    {/* Select Service Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Select Service</label>
                      <select
                        id="select-service-selector"
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-ellipsis overflow-hidden"
                      >
                        {activeServices.length > 0 ? (
                          activeServices.map(s => (
                            <option key={s.id} value={s.id}>
                              [{s.id}] {s.name} - ${s.rate.toFixed(2)}/1k
                            </option>
                          ))
                        ) : (
                          <option disabled>No services available in this category</option>
                        )}
                      </select>
                    </div>

                    {/* Quantity Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quantity</label>
                        <input
                          id="inp-order-qty"
                          type="number"
                          value={orderQuantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setOrderQuantity(val);
                          }}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">
                          Min: {activeService?.min?.toLocaleString()} | Max: {activeService?.max?.toLocaleString()}
                        </span>
                      </div>

                      {/* Display Computed Price and Charge */}
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Estimated Charge</span>
                        <div className="flex items-baseline space-x-1 mt-1 text-slate-900">
                          <span className="text-xs font-bold font-mono">$</span>
                          <span id="label-computed-charge" className="text-2xl font-black font-mono tracking-tight text-indigo-600">
                            {activeService ? (orderQuantity * (activeService.rate / 1000)).toFixed(4) : "0.00"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">
                          Rate: ${activeService?.rate?.toFixed(2)} per 1,000
                        </span>
                      </div>
                    </div>

                    {/* URL Link Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Link / Destination URL</label>
                      <input
                        id="inp-order-link"
                        type="text"
                        placeholder="https://instagram.com/myusername or post link"
                        value={orderLink}
                        onChange={(e) => setOrderLink(e.target.value)}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {/* Feedback messages */}
                    <AnimatePresence>
                      {orderError && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-2 font-medium">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{orderError}</span>
                        </motion.div>
                      )}
                      {orderSuccess && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs flex items-center space-x-2 font-medium">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{orderSuccess}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Submit Order action */}
                    <button
                      id="btn-submit-order"
                      type="submit"
                      disabled={!activeService}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      Place Order Request <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>

                {/* Right column: Service description info */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* Service information card */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-wider flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-500" /> System Specifications
                    </h3>

                    {activeService ? (
                      <div className="space-y-4">
                        <div className="pb-1">
                          <h4 className="text-sm font-bold text-slate-800 leading-snug">{activeService.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 font-mono mt-1 block">ID: {activeService.id}</span>
                        </div>

                        <div className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 border border-slate-100 rounded-2xl p-4 font-medium leading-relaxed">
                          {activeService.description}
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-center text-xs">
                          <div className="p-2 border border-slate-100 rounded-xl">
                            <span className="text-slate-400 font-medium">Min quantity</span>
                            <p className="font-bold font-mono text-slate-800 mt-0.5">{activeService.min.toLocaleString()}</p>
                          </div>
                          <div className="p-2 border border-slate-100 rounded-xl">
                            <span className="text-slate-400 font-medium">Max quantity</span>
                            <p className="font-bold font-mono text-slate-800 mt-0.5">{activeService.max.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <span className="text-[10px] text-slate-400 font-semibold block leading-tight">
                            Note: Delivery times may fluctuate based on queue load. If orders are stalled, please file a Ticket in the navigation rail.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Selecting a service shows dynamic parameters here.</p>
                    )}
                  </div>

                  {/* SMM Platform Features Info Banner */}
                  <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
                    <div className="relative z-10">
                      <h4 className="font-bold text-sm tracking-wide flex items-center gap-1.5 text-indigo-200">
                        <Sparkles className="w-4 h-4 text-indigo-400" /> Platform Guarantee
                      </h4>
                      <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
                        Join thousands of social agencies who scale clients. All order funds are returned immediately to user balances if canceled or failed.
                      </p>
                    </div>
                    {/* Background visual graphics */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full opacity-10 filter blur-3xl -mr-6 -mt-6"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500 rounded-full opacity-10 filter blur-2xl -ml-6 -mb-6"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: USER ORDERS HISTORY */}
          {activeTab === "orders" && (
            <motion.div
              key="orders-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Your Orders</h2>
                  <p className="text-xs text-slate-400 font-medium">History of SMM campaigns ordered on your account.</p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <select
                    id="select-order-status-filter"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                    <option value="Canceled">Canceled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Search Control */}
              <div className="mb-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="inp-order-search"
                  type="text"
                  placeholder="Search by ID, Service description, Link..."
                  value={orderSearchText}
                  onChange={(e) => setOrderSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                />
              </div>

              {/* Order Data List */}
              <div className="overflow-x-auto">
                {filteredOrders.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Order ID</th>
                        <th className="py-3 px-2">Service Details</th>
                        <th className="py-3 px-2">Destination / Link</th>
                        <th className="py-3 px-2 text-right">Quantity</th>
                        <th className="py-3 px-2 text-right">Charge</th>
                        <th className="py-3 px-2 text-center">Status</th>
                        <th className="py-3 px-2 text-right">Filed On</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredOrders.map((ord) => {
                        let statusColor = "bg-amber-50 text-amber-600 border-amber-100";
                        if (ord.status === "Completed") statusColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                        if (ord.status === "Processing") statusColor = "bg-blue-50 text-blue-600 border-blue-100";
                        if (ord.status === "Canceled") statusColor = "bg-slate-50 text-slate-500 border-slate-100";
                        if (ord.status === "Refunded") statusColor = "bg-indigo-50 text-indigo-600 border-indigo-100";

                        return (
                          <tr key={ord.id} className="hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                            <td className="py-3 px-2 font-mono font-bold text-slate-900">{ord.id}</td>
                            <td className="py-3 px-2 max-w-xs">
                              <span className="font-semibold block truncate leading-snug">{ord.serviceName}</span>
                              <span className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5 block">{ord.category} • ID: {ord.serviceId}</span>
                            </td>
                            <td className="py-3 px-2 max-w-xs truncate">
                              <a 
                                href={ord.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                              >
                                {ord.link} <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            </td>
                            <td className="py-3 px-2 text-right font-mono font-bold">{ord.quantity.toLocaleString()}</td>
                            <td className="py-3 px-2 text-right font-mono font-bold text-indigo-600">${ord.charge.toFixed(4)}</td>
                            <td className="py-3 px-2 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-block ${statusColor}`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-slate-400 text-[11px] font-medium font-mono">
                              {new Date(ord.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-slate-400 font-medium">
                    <p className="text-sm">No SMM orders matched your filters.</p>
                    <p className="text-xs mt-1 text-slate-300">File a campaign in the "New Order" tab to begin tracking updates!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: SERVICES DIRECTORY */}
          {activeTab === "services" && (
            <motion.div
              key="services-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">SMM Services Directory</h2>
                  <p className="text-xs text-slate-400 font-medium">Browse direct pricing rates, minimum and maximum thresholds.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    id="select-service-category-filter"
                    value={serviceCategoryFilter}
                    onChange={(e) => setServiceCategoryFilter(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="All">All Socials</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Search Control */}
              <div className="mb-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="inp-service-directory-search"
                  type="text"
                  placeholder="Search service parameters, guidelines, keywords..."
                  value={serviceSearchText}
                  onChange={(e) => setServiceSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                />
              </div>

              {/* Services Table */}
              <div className="overflow-x-auto">
                {filteredServices.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">ID</th>
                        <th className="py-3 px-2">Channel / Category</th>
                        <th className="py-3 px-2">Service Package Name</th>
                        <th className="py-3 px-2 text-right">Price per 1k</th>
                        <th className="py-3 px-2 text-right">Min Order</th>
                        <th className="py-3 px-2 text-right">Max Order</th>
                        <th className="py-3 px-2 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredServices.map((srv) => (
                        <tr key={srv.id} className="hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                          <td className="py-3 px-2 font-mono font-bold text-indigo-600">{srv.id}</td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-50 border border-slate-100 text-slate-500 inline-block capitalize">
                              {srv.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 max-w-sm">
                            <h4 className="font-bold text-slate-800 leading-tight">{srv.name}</h4>
                            <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mt-0.5 whitespace-pre-line leading-relaxed">
                              {srv.description}
                            </p>
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-emerald-600 block-inline mt-1.5">${srv.rate.toFixed(2)}</td>
                          <td className="py-3 px-2 text-right font-mono">{srv.min.toLocaleString()}</td>
                          <td className="py-3 px-2 text-right font-mono">{srv.max.toLocaleString()}</td>
                          <td className="py-3 px-2 text-center">
                            <button
                              id={`btn-order-direct-${srv.id}`}
                              onClick={() => {
                                setSelectedCategoryId(srv.category.toLowerCase());
                                setSelectedServiceId(srv.id);
                                setActiveTab("new-order");
                              }}
                              className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 rounded-xl text-[10px] font-bold transition-all text-slate-500 cursor-pointer"
                            >
                              Place Order
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-slate-400 font-medium">
                    <p className="text-sm">No SMM services matched search criteria.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 4: ADD FUNDS */}
          {activeTab === "add-funds" && (
            <motion.div
              key="add-funds-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Payment Gateway Form */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <h2 className="text-lg font-bold text-slate-800">Secure Deposits Gateway</h2>
                </div>

                <form id="frm-add-funds" onSubmit={handleFundingSubmit} className="space-y-4">
                  {/* Amount Entry */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Deposit Amount (USD)</label>
                    <div className="relative">
                      <DollarSign className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
                      <input
                        id="inp-fund-amount"
                        type="number"
                        min="5"
                        max="5000"
                        value={fundAmount}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setFundAmount(val);
                        }}
                        className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-lg font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1">Min deposit: $5.00 | Max deposit: $5,000.00</span>
                  </div>

                  {/* Payment Method Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Method</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["bKash Personal", "Nagad Personal", "Credit Card", "PayPal"].map((method) => {
                        const isMatch = paymentMethod === method;
                        let brandClass = "border-slate-100 text-slate-600 hover:bg-slate-50";
                        if (isMatch) {
                          if (method.includes("bKash")) brandClass = "bg-pink-600 border-pink-600 text-white shadow-sm shadow-pink-100";
                          else if (method.includes("Nagad")) brandClass = "bg-orange-600 border-orange-600 text-white shadow-sm shadow-orange-100";
                          else brandClass = "bg-slate-900 border-slate-900 text-white shadow-sm";
                        }
                        return (
                          <button
                            key={method}
                            id={`btn-pay-${method.replace(/\s+/g, '-').toLowerCase()}`}
                            type="button"
                            onClick={() => {
                              setPaymentMethod(method);
                              setPaymentSuccess(false);
                              setFundError("");
                            }}
                            className={`p-3 rounded-xl border text-[11px] font-bold text-center leading-tight transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${brandClass}`}
                          >
                            <span>{method}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gateway Simulator Visualizers */}
                  {(paymentMethod === "bKash Personal" || paymentMethod === "Nagad Personal") && (
                    <div className="space-y-4 pt-2">
                      <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs space-y-2 border border-slate-800">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                          <span className="font-bold text-indigo-400 tracking-wide uppercase">
                            {paymentMethod === "bKash Personal" ? "bKash Send Money" : "Nagad Send Money"} Instructions
                          </span>
                          <span className="px-2 py-0.5 rounded text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 uppercase font-black">Personal</span>
                        </div>
                        <div className="space-y-1.5 text-slate-300 font-sans">
                          <p className="text-[13px] font-bold text-white flex items-center justify-between">
                            <span>Phone Number:</span>
                            <span className="text-emerald-400 font-mono select-all font-black text-sm tracking-wider">01750721835</span>
                          </p>
                          <div className="text-[11px] space-y-1 pt-1 opacity-90 leading-relaxed font-medium">
                            <p>১. আপনার bKash অথবা Nagad অ্যাপে অথবা ডায়াল করুন (যেমন *২৪৭#)</p>
                            <p>২. <strong>Send Money</strong> সিলেক্ট করে নাম্বার দিন: <b className="text-white">01750721835</b></p>
                            <p>৩. আপনার কাঙ্ক্ষিত টাকার পরিমাণ লিখে পিন দিয়ে কনফার্ম করুন।</p>
                            <p>৪. সফলভাবে সেন্ড মানি করার পর নিচের ফর্মে আপনার প্রেরক মোবাইল নাম্বার এবং TrxID (যেমন: AB3278GH) লিখুন এবং জমা দিন।</p>
                          </div>
                          <p className="text-[10px] text-amber-300 font-semibold pt-1">⚠️ Please note: Admin approval is required. Conversion Rate: 1 USD = 120 BDT.</p>
                        </div>
                      </div>

                      {/* Fields for sender and trx ID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Your Sender Number</label>
                          <input
                            id="inp-sender-number"
                            type="text"
                            placeholder="e.g. 017XXXXXXXX"
                            required
                            value={senderNumber}
                            onChange={(e) => setSenderNumber(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-500 text-slate-800 font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Transaction ID (TrxID)</label>
                          <input
                            id="inp-trx-id"
                            type="text"
                            placeholder="e.g. AB4918CD"
                            required
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono tracking-wider focus:ring-1 focus:ring-indigo-500 uppercase font-bold text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "Credit Card" && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cardholder Name</label>
                          <input
                            id="inp-card-name"
                            type="text"
                            placeholder="John Doe"
                            required
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Card Number</label>
                          <input
                            id="inp-card-number"
                            type="text"
                            placeholder="4111 2222 3333 4444"
                            maxLength={19}
                            required
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Expiry (MM/YY)</label>
                          <input
                            id="inp-card-expiry"
                            type="text"
                            placeholder="12/28"
                            maxLength={5}
                            required
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CVV / CVC</label>
                          <input
                            id="inp-card-cvv"
                            type="password"
                            placeholder="***"
                            maxLength={3}
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "PayPal" && (
                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs text-blue-800 leading-relaxed">
                      <p className="font-bold mb-1">Instant PayPal Portal Redirect</p>
                      Clicking deposit will open an authorization pipeline in our simulated sandbox. Funds are immediately updated upon successful login.
                    </div>
                  )}

                  {/* Feedback error or success */}
                  <AnimatePresence>
                    {fundError && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center space-x-2 font-medium">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{fundError}</span>
                      </motion.div>
                    )}
                    {paymentSuccess && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs flex items-center space-x-2.5 font-medium border border-emerald-100">
                        <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                        <div>
                          <span className="font-bold block uppercase tracking-wide text-[10px]">ad fund request inprosess</span>
                          <span>We have received your request. Once verified by our administrators, your balance will be credited.</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    id="btn-trigger-payment"
                    type="submit"
                    className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Authorize Deposit (${fundAmount.toFixed(2)} USD)
                  </button>
                </form>
              </div>

              {/* Transactions History Ledger */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-slate-500" /> Transaction Ledger
                </h3>

                <div className="space-y-3">
                  {transactions.filter(t => t.userId === currentUser.id).length > 0 ? (
                    transactions
                      .filter(t => t.userId === currentUser.id)
                      .map((txn) => (
                        <div key={txn.id} className="p-3 border border-slate-50 hover:border-slate-100 rounded-xl flex items-center justify-between text-xs transition-all">
                          <div>
                            <span className="font-semibold text-slate-800 text-[11px] block">{txn.method}</span>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{txn.id} • {new Date(txn.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold font-mono text-emerald-600 block text-[13px]">+${txn.amount.toFixed(2)}</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold uppercase mt-1 inline-block">Approved</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No deposit records currently registered.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: TICKETS */}
          {activeTab === "tickets" && (
            <motion.div
              key="tickets-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Tickets Panel */}
              <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-full">
                <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4 flex items-center justify-between">
                  <span>Support Tickets</span>
                  <button 
                    id="btn-user-create-new-ticket"
                    onClick={() => setActiveTicketId(null)}
                    className="text-xs bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-xl border border-indigo-100 cursor-pointer hover:bg-indigo-100"
                  >
                    + Create New
                  </button>
                </h2>

                <div className="space-y-2">
                  {tickets.filter(t => t.userId === currentUser.id).length > 0 ? (
                    tickets
                      .filter(t => t.userId === currentUser.id)
                      .map((t) => {
                        const isActive = activeTicketId === t.id;
                        let statColor = "bg-amber-50 text-amber-600 border-amber-100";
                        if (t.status === "Answered") statColor = "bg-indigo-50 text-indigo-600 border-indigo-150 animate-pulse";
                        if (t.status === "Closed") statColor = "bg-slate-50 text-slate-400 border-slate-100";
                        
                        return (
                          <button
                            key={t.id}
                            id={`btn-ticket-${t.id}`}
                            onClick={() => setActiveTicketId(t.id)}
                            className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                              isActive 
                                ? "bg-slate-50 border-slate-300 shadow-sm" 
                                : "bg-white border-slate-100 hover:bg-slate-50/50"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-[10px] font-mono font-bold text-slate-400 leading-none">{t.id}</span>
                              <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[8px] border ${statColor}`}>{t.status}</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{t.subject}</h4>
                            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                              <span>Topic: {t.category}</span>
                              <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                            </div>
                          </button>
                        );
                      })
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No active tickets filed yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Tickets Interaction Workspace */}
              <div className="lg:col-span-8">
                {activeTicket ? (
                  // CHAT MODE
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-[520px]">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 shrink-0">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">{activeTicket.subject}</h4>
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-black">{activeTicket.category}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">Ticket Reference No. {activeTicket.id}</span>
                      </div>
                      <button 
                        id="btn-back-to-new-ticket"
                        onClick={() => setActiveTicketId(null)}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 block cursor-pointer"
                      >
                        File a New Request &rarr;
                      </button>
                    </div>

                    {/* Chat Messages */}
                    <div id="ticket-chat-container" className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
                      {activeTicket.messages.map((msg, index) => {
                        const isAdmin = msg.sender === "admin";
                        return (
                          <div 
                            key={index} 
                            className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                              isAdmin 
                                ? "bg-slate-50 border border-slate-100 text-slate-700" 
                                : "bg-indigo-600 text-white shadow-sm"
                            }`}>
                              <span className="text-[9px] block font-extrabold uppercase tracking-wide opacity-60 mb-1">
                                {isAdmin ? "📋 Support Desk Support" : "👤 You"}
                              </span>
                              <p className="whitespace-pre-wrap">{msg.message}</p>
                              <span className="text-[8px] font-mono tracking-wide text-right block mt-2 opacity-60 leading-none">
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat Reply Form */}
                    {activeTicket.status !== "Closed" ? (
                      <form id="frm-ticket-reply" onSubmit={handleTicketReplySubmit} className="mt-auto pt-3 border-t border-slate-100 shrink-0">
                        <div className="flex gap-2">
                          <input
                            id="inp-ticket-reply-msg"
                            type="text"
                            placeholder="Type progress update or reply..."
                            required
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="flex-1 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:none focus:bg-white focus:outline-none"
                          />
                          <button
                            id="btn-submit-ticket-reply"
                            type="submit"
                            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                          >
                            Send <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-[11px] font-bold text-center mt-auto shrink-0 uppercase tracking-widest">
                        🛡️ This support ticket has been marked Closed by admin.
                      </div>
                    )}
                  </div>
                ) : (
                  // TICKET SUBMISSION MODE
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
                      <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
                        <MessageSquare className="w-4 h-4" />
                      </span>
                      <div>
                        <h2 className="text-md font-bold text-slate-800">Submit Support Request</h2>
                        <span className="text-[10px] text-slate-400 font-medium tracking-wide">Filing queries for direct administrator resolution.</span>
                      </div>
                    </div>

                    <form id="frm-create-ticket" onSubmit={handleTicketSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Subject</label>
                          <input
                            id="inp-ticket-subject"
                            type="text"
                            placeholder="Order delay details, account etc."
                            required
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500 text-slate-700"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Inquiry Topic</label>
                          <select
                            id="select-ticket-category"
                            value={ticketCategory}
                            onChange={(e) => setTicketCategory(e.target.value as Ticket["category"])}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="Order">Order Inquiry</option>
                            <option value="Payment">Billing / Payment Gateway</option>
                            <option value="Service">Service Request</option>
                            <option value="Other">Other Issues</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Describe details</label>
                        <textarea
                          id="inp-ticket-message"
                          rows={4}
                          placeholder="Provide order codes or billing timestamps to expedite resolution..."
                          required
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 font-medium text-slate-700 font-sans"
                        ></textarea>
                      </div>

                      {/* Success block */}
                      <AnimatePresence>
                        {newTicketSuccess && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-medium">
                            ✓ Your ticket has been logged inside our database. Our help desk responds in &lt;1 hour. View its progress on the left sidebar.
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        id="btn-submit-new-ticket"
                        type="submit"
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Submit Ticket Request
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
