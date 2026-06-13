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
  Sparkles
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
}: UserPanelProps) {
  const [activeTab, setActiveTab ] = useState<"new-order" | "orders" | "services" | "add-funds" | "tickets">("new-order");

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* LEFT NAVIGATION COLUMN */}
      <div className="lg:col-span-3">
        {/* User Card */}
        <div id="user-pnl-overview" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center space-x-4 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100 uppercase">
              {currentUser.name.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 leading-tight block">{currentUser.name}</h3>
              <span className="text-xs text-slate-400 font-medium block">{currentUser.email}</span>
            </div>
          </div>

          {/* Quick Balance Status */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-500">Available Balance</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100">Active</span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">${currentUser.balance.toFixed(2)}</div>
            <div className="mt-3 flex gap-2">
              <button 
                id="btn-nav-add-funds"
                onClick={() => setActiveTab("add-funds")}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-medium rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" /> Add Funds
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-slate-50/50 p-2 text-xs rounded-xl border border-slate-50">
              <div className="text-slate-400 font-semibold">Total Spent</div>
              <div className="font-mono text-slate-800 font-bold mt-1">${currentUser.totalSpent.toFixed(2)}</div>
            </div>
            <div className="bg-slate-50/50 p-2 text-xs rounded-xl border border-slate-50">
              <div className="text-slate-400 font-semibold">Orders</div>
              <div className="font-mono text-slate-800 font-bold mt-1">{userOrders.length}</div>
            </div>
          </div>
        </div>

        {/* Side Nav Menu */}
        <div id="user-sidebar-menu" className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm">
          <span className="px-4 py-2 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</span>
          <nav className="space-y-1">
            <button
              id="sidebar-nav-new-order"
              onClick={() => { setActiveTab("new-order"); setActiveTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "new-order" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <PlusCircle className="w-5 h-5 shrink-0" />
              <span>New Order</span>
            </button>

            <button
              id="sidebar-nav-orders"
              onClick={() => { setActiveTab("orders"); setActiveTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "orders" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <History className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">My Orders</span>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {userOrders.length}
              </span>
            </button>

            <button
              id="sidebar-nav-services"
              onClick={() => { setActiveTab("services"); setActiveTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "services" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <List className="w-5 h-5 shrink-0" />
              <span>Services List</span>
            </button>

            <button
              id="sidebar-nav-add-funds"
              onClick={() => { setActiveTab("add-funds"); setActiveTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "add-funds" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <CreditCard className="w-5 h-5 shrink-0" />
              <span>Add Funds</span>
            </button>

            <button
              id="sidebar-nav-tickets"
              onClick={() => { setActiveTab("tickets"); setActiveTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === "tickets" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LifeBuoy className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">Support Ticket</span>
              {tickets.filter(t => t.status === "Answered").length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-50 animate-pulse"></span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* RIGHT DISPLAY PANEL */}
      <div className="lg:col-span-9">
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
