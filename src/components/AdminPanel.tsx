import React, { useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Layers, 
  LifeBuoy, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Search, 
  Trash2, 
  Plus, 
  Edit3, 
  Send, 
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Lock,
  Layers3,
  Coins,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Service, Order, Ticket, User, Category, Transaction } from "../types";

interface AdminPanelProps {
  users: User[];
  services: Service[];
  categories: Category[];
  orders: Order[];
  tickets: Ticket[];
  transactions: Transaction[];
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
  onUpdateUserBalance: (userId: string, changeAmount: number) => void;
  onAddService: (newService: Service) => void;
  onDeleteService: (serviceId: string) => void;
  onAdminReplyTicket: (ticketId: string, message: string) => void;
  onCloseTicket: (ticketId: string) => void;
  onApproveTransaction: (txnId: string) => void;
  onRejectTransaction: (txnId: string) => void;
}

export default function AdminPanel({
  users,
  services,
  categories,
  orders,
  tickets,
  transactions,
  onUpdateOrderStatus,
  onUpdateUserBalance,
  onAddService,
  onDeleteService,
  onAdminReplyTicket,
  onCloseTicket,
  onApproveTransaction,
  onRejectTransaction,
}: AdminPanelProps) {
  const [activeAdminTab, setActiveAdminTab] = useState<"dashboard" | "orders" | "services" | "users" | "tickets" | "deposits">("dashboard");

  // Orders Manager States
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");

  // Services Manager States
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [newSrvId, setNewSrvId] = useState("");
  const [newSrvName, setNewSrvName] = useState("");
  const [newSrvCategory, setNewSrvCategory] = useState("Instagram");
  const [newSrvRate, setNewSrvRate] = useState<number>(1.50);
  const [newSrvMin, setNewSrvMin] = useState<number>(100);
  const [newSrvMax, setNewSrvMax] = useState<number>(50000);
  const [newSrvDesc, setNewSrvDesc] = useState("");
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState("All");

  // Users Manager States
  const [userSearchText, setUserSearchText] = useState("");
  const [adjustBalanceUserId, setAdjustBalanceUserId] = useState<string | null>(null);
  const [adjustBalanceAmount, setAdjustBalanceAmount] = useState<number>(10);
  const [adjustType, setAdjustType] = useState<"add" | "deduct">("add");

  // Tickets Manager States
  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [adminReplyMessage, setAdminReplyMessage] = useState("");

  // System Stats calculations
  const totalRevenue = orders
    .filter(o => o.status === "Completed" || o.status === "Processing")
    .reduce((sum, current) => sum + current.charge, 0);

  const activeTicketsCount = tickets.filter(t => t.status === "Open").length;
  const pendingTxnsCount = transactions.filter(t => t.status === "Pending").length;
  const pendingOrdersCount = orders.filter(o => o.status === "Pending" || o.status === "Processing").length;

  // Handle adding custom service package
  const handleCreateServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSrvId.trim() || !newSrvName.trim() || newSrvRate <= 0) return;

    onAddService({
      id: newSrvId,
      name: newSrvName,
      category: newSrvCategory,
      rate: newSrvRate,
      min: newSrvMin,
      max: newSrvMax,
      description: newSrvDesc || "⚡ Standard Delivery Speed Packages"
    });

    // Reset Form
    setNewSrvId("");
    setNewSrvName("");
    setNewSrvDesc("");
    setShowAddServiceModal(false);
  };

  // Handle balance adjustment
  const handleBalanceAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustBalanceUserId || adjustBalanceAmount <= 0) return;

    const delta = adjustType === "add" ? adjustBalanceAmount : -adjustBalanceAmount;
    onUpdateUserBalance(adjustBalanceUserId, delta);
    setAdjustBalanceUserId(null);
    setAdjustBalanceAmount(10);
  };

  // Handle support answer
  const handleSendAdminReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicketId || !adminReplyMessage.trim()) return;

    onAdminReplyTicket(replyTicketId, adminReplyMessage);
    setAdminReplyMessage("");
  };

  // Filtered lists
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.userName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.link.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.serviceName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === "All" || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
           u.email.toLowerCase().includes(userSearchText.toLowerCase()) ||
           u.id.toLowerCase().includes(userSearchText.toLowerCase());
  });

  const activeReplyTicket = tickets.find(t => t.id === replyTicketId);
  const pendingTxnsList = transactions.filter(t => t.status === "Pending");

  return (
    <div className="space-y-6">
      {/* Prominent Real-time Manual Recharge Alerts */}
      {pendingTxnsList.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-2xl text-white shrink-0 animate-bounce">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Pending Mobile Billing Alerts</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Each request below is currently "Pending". Kindly check your physical <b>bKash / Nagad merch app ledger</b> for the matching sender number and reference / TrxID. Once verified, click <b>"Approve"</b> to credit their balance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingTxnsList.map((txn) => (
              <div key={txn.id} className="bg-white border border-amber-100 rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-50 pb-2">
                    <span className="font-extrabold text-xs text-slate-800">{txn.userName} <span className="text-[10px] text-slate-400 font-mono">({txn.userId})</span></span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase text-center shrink-0 ${
                      txn.method.includes("bKash") 
                        ? "bg-pink-50 text-pink-600 border border-pink-100" 
                        : "bg-orange-50 text-orange-600 border border-orange-100"
                    }`}>
                      {txn.method}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 font-medium text-slate-600">
                    <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Amount:</span>
                      <span className="text-emerald-600 font-extrabold font-mono text-right">
                        ${txn.amount.toFixed(2)} USD (৳{(txn.amount * 120).toLocaleString()} BDT)
                      </span>
                    </div>

                    {txn.senderNumber && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Sender Mobile:</span>
                        <span className="font-mono font-bold text-slate-800">{txn.senderNumber}</span>
                      </div>
                    )}

                    {txn.trxId && (
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Reference / TrxID:</span>
                        <span className="font-mono font-bold text-rose-600 uppercase bg-rose-50 px-1 py-0.5 rounded text-[11px] select-all border border-rose-100/30 font-sans tracking-wide">{txn.trxId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm(`Approve deposit of $${txn.amount.toFixed(2)} for ${txn.userName}?`)) {
                        onApproveTransaction(txn.id);
                      }
                    }}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm uppercase tracking-wider text-center"
                  >
                    Yes (Approve)
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Reject this transaction request?")) {
                        onRejectTransaction(txn.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-100 uppercase tracking-wider text-center"
                  >
                    No (Reject)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* SIDEBAR NAVIGATION */}
      <div className="lg:col-span-3">
        {/* Admin Badge Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm text-white mb-6 relative overflow-hidden">
          <div className="relative z-10">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 font-extrabold border border-red-500/30 uppercase tracking-wider inline-flex items-center gap-1">
              <Lock className="w-3 h-3" /> System Admin
            </span>
            <h3 className="font-sans text-lg font-black tracking-tight mt-3">Portal Controller</h3>
            <p className="text-xs text-slate-400 mt-1">Configure packages, dispatch orders, and verify billing logs.</p>
          </div>
          {/* subtle design pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full opacity-10 filter blur-3xl -mr-6 -mt-6"></div>
        </div>

        {/* Admin Nav */}
        <div className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm">
          <span className="px-4 py-2 block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Management Console</span>
          <nav className="space-y-1">
            <button
              id="admin-nav-dashboard"
              onClick={() => { setActiveAdminTab("dashboard"); setReplyTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeAdminTab === "dashboard" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <TrendingUp className="w-5 h-5 shrink-0" />
              <span>Performance Hub</span>
            </button>

            <button
              id="admin-nav-orders"
              onClick={() => { setActiveAdminTab("orders"); setReplyTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeAdminTab === "orders" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Layers className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">Manage Orders</span>
              <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                {orders.length}
              </span>
            </button>

            <button
              id="admin-nav-services"
              onClick={() => { setActiveAdminTab("services"); setReplyTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeAdminTab === "services" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Layers3 className="w-5 h-5 shrink-0" />
              <span>SMM Services Matrix</span>
            </button>

            <button
              id="admin-nav-users"
              onClick={() => { setActiveAdminTab("users"); setAdjustBalanceUserId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeAdminTab === "users" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Users className="w-5 h-5 shrink-0" />
              <span>Registered Clients</span>
              <span className="font-mono text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {users.length}
              </span>
            </button>

            <button
              id="admin-nav-tickets"
              onClick={() => { setActiveAdminTab("tickets"); setReplyTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeAdminTab === "tickets" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <LifeBuoy className="w-5 h-5 shrink-0" />
              <span className="flex-1 text-left">Support Desk</span>
              {activeTicketsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500 text-white font-bold leading-none animate-pulse">
                  {activeTicketsCount}
                </span>
              )}
            </button>

            <button
              id="admin-nav-deposits"
              onClick={() => { setActiveAdminTab("deposits"); setReplyTicketId(null); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
                activeAdminTab === "deposits" 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Coins className="w-5 h-5 shrink-0 text-amber-500" />
              <span className="flex-1 text-left">Fund Approvals</span>
              {pendingTxnsCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-bold inline-block animate-bounce font-sans">
                  {pendingTxnsCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* RIGHT DISPLAY PANEL */}
      <div className="lg:col-span-9">
        <AnimatePresence mode="wait">
          {/* TAB 1: HUB DASHBOARD */}
          {activeAdminTab === "dashboard" && (
            <motion.div
              key="admin-dash"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Analytics Matrix Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Total Volume Sales</span>
                  <div className="text-xl font-black font-mono text-indigo-600 mt-1 flex items-baseline">
                    <span className="text-sm font-bold">$</span>
                    {totalRevenue.toFixed(2)}
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-2">Combined completed orders</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Active Clients</span>
                  <span className="text-xl font-black font-mono text-slate-950 mt-1 block">
                    {users.length}
                    <span className="text-xs text-slate-400 font-semibold ml-1">accounts</span>
                  </span>
                  <span className="text-[9px] text-emerald-600 font-bold block mt-2">● 100% cloud nodes active</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Pending Campaigns</span>
                  <span className="text-xl font-black font-mono text-amber-500 mt-1 block">
                    {pendingOrdersCount}
                    <span className="text-xs text-slate-400 font-semibold ml-1">items</span>
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-2">Orders in stream queue</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Active Support Tickets</span>
                  <span className="text-xl font-black font-mono text-red-500 mt-1 block">
                    {activeTicketsCount}
                    <span className="text-xs text-slate-400 font-semibold ml-1">open</span>
                  </span>
                  <span className="text-[9px] text-rose-500 font-bold block mt-2">Action required</span>
                </div>
              </div>

              {/* Graphical representation of orders by Category & Live stream log */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual statistics matrix list */}
                <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-slate-500" /> Platform Category Distribution
                  </h3>

                  <div className="space-y-4">
                    {categories.map((cat) => {
                      // count how many orders are custom filed for this category
                      const count = orders.filter(o => o.category.toLowerCase() === cat.name.toLowerCase()).length;
                      const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;

                      return (
                        <div key={cat.id}>
                          <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                            <span className="capitalize">{cat.name} Campaigns</span>
                            <span className="font-mono text-[11px] font-bold">{count} Order{count !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)</span>
                          </div>
                          {/* percentage indicator line bar */}
                          <div className="w-full bg-slate-50 rounded-full h-2 overflow-hidden border border-slate-100">
                            <div 
                              className="bg-indigo-600 h-full rounded-full transition-all"
                              style={{ width: `${percentage > 0 ? percentage : 3}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Real-time event notifications stack */}
                <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" /> Administrative Feed
                  </h3>

                  <div className="space-y-3">
                    {orders.slice(0, 4).map((org) => {
                      return (
                        <div key={org.id} className="p-3 border border-slate-50 hover:border-slate-100 rounded-xl text-xs transition-all flex items-start gap-2">
                          <span className={`p-1 mt-0.5 rounded-lg ${
                            org.status === "Completed" ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                          }`}>
                            <Coins className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-800 leading-snug">
                              Order <span className="font-mono text-indigo-600">{org.id}</span> placed
                            </p>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {org.userName} spent ${org.charge.toFixed(3)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SYSTEM ORDERS MANAGER */}
          {activeAdminTab === "orders" && (
            <motion.div
              key="admin-orders"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">SMM Campaigns Dispatch Desk</h2>
                  <p className="text-xs text-slate-400 font-medium">Global control of campaigns. Canceling orders instantly refunds user balances.</p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    id="select-admin-order-status"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none"
                  >
                    <option value="All">All statuses</option>
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
                  id="inp-admin-order-search"
                  type="text"
                  placeholder="Search by client, ID, target service link..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-400"
                />
              </div>

              {/* Global Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Account / User</th>
                      <th className="py-3 px-2">SMM Package Name</th>
                      <th className="py-3 px-2">Target Link</th>
                      <th className="py-3 px-2 text-right">Quantity</th>
                      <th className="py-3 px-2 text-right font-mono">Charge</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-center">Action Console</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((ord) => {
                        let statusStyle = "bg-amber-50 text-amber-600 border-amber-100";
                        if (ord.status === "Completed") statusStyle = "bg-emerald-50 text-emerald-600 border-emerald-100";
                        if (ord.status === "Processing") statusStyle = "bg-blue-50 text-blue-600 border-blue-100";
                        if (ord.status === "Canceled") statusStyle = "bg-slate-50 text-slate-500 border-slate-100";
                        if (ord.status === "Refunded") statusStyle = "bg-indigo-50 text-indigo-600 border-indigo-150";

                        return (
                          <tr key={ord.id} className="hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                            <td className="py-4 px-2 font-mono font-bold text-slate-900">{ord.id}</td>
                            <td className="py-4 px-2">
                              <span className="font-bold text-slate-800 block truncate">{ord.userName}</span>
                              <span className="text-[10px] text-slate-400 font-mono block mt-0.5">UID: {ord.userId}</span>
                            </td>
                            <td className="py-4 px-2 max-w-xs">
                              <span className="font-semibold text-slate-800 line-clamp-1 leading-snug">{ord.serviceName}</span>
                              <span className="text-[10px] text-indigo-600 font-bold tracking-wide uppercase mt-0.5 block">{ord.category} • ID: {ord.serviceId}</span>
                            </td>
                            <td className="py-4 px-2 max-w-xs truncate">
                              <a 
                                href={ord.link} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-slate-500 hover:text-indigo-600 hover:underline flex items-center gap-1 font-mono text-[10px]"
                              >
                                {ord.link} <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </td>
                            <td className="py-4 px-2 text-right font-mono font-bold text-slate-900">{ord.quantity.toLocaleString()}</td>
                            <td className="py-4 px-2 text-right font-mono font-extrabold text-slate-900">${ord.charge.toFixed(3)}</td>
                            <td className="py-4 px-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold border inline-block ${statusStyle}`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-center">
                              {/* Action selector tools */}
                              <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-[10px] font-bold">
                                {ord.status !== "Completed" && ord.status !== "Refunded" && ord.status !== "Canceled" ? (
                                  <>
                                    {ord.status === "Pending" && (
                                      <button
                                        id={`btn-act-process-${ord.id}`}
                                        onClick={() => onUpdateOrderStatus(ord.id, "Processing")}
                                        className="px-2 py-1 bg-white hover:bg-blue-50 text-blue-600 transition-all cursor-pointer border-r border-slate-200"
                                      >
                                        Process
                                      </button>
                                    )}
                                    {ord.status === "Processing" && (
                                      <button
                                        id={`btn-act-complete-${ord.id}`}
                                        onClick={() => onUpdateOrderStatus(ord.id, "Completed")}
                                        className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-600 transition-all cursor-pointer border-r border-slate-200"
                                      >
                                        Complete
                                      </button>
                                    )}
                                    <button
                                      id={`btn-act-refund-${ord.id}`}
                                      onClick={() => onUpdateOrderStatus(ord.id, "Refunded")}
                                      className="px-2 py-1 bg-white hover:bg-indigo-50 text-indigo-600 transition-all cursor-pointer"
                                      title="Cancel and Refund Client Balance"
                                    >
                                      Refund
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-slate-400 font-medium px-2 py-1 bg-slate-50">Locked</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 font-medium text-xs">
                          No system campaigns logged.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: SERVICES MATRIX MANAGER */}
          {activeAdminTab === "services" && (
            <motion.div
              key="admin-services"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Services Packages Directory</h2>
                  <p className="text-xs text-slate-400 font-medium">Construct new packages or update rates. Deleting blocks them from client options.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-admin-add-service-trigger"
                    onClick={() => setShowAddServiceModal(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Package
                  </button>
                </div>
              </div>

              {/* Add Custom Package Modal Form */}
              <AnimatePresence>
                {showAddServiceModal && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    exit={{ opacity: 0, height: 0 }} 
                    className="p-5 bg-slate-50 border border-slate-200 rounded-2xl mb-6 space-y-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" /> New Campaign Package Details
                      </h3>
                      <button 
                        id="btn-close-service-form"
                        onClick={() => setShowAddServiceModal(false)}
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>

                    <form id="frm-add-service" onSubmit={handleCreateServiceSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Service Package ID</label>
                        <input
                          id="inp-srv-id"
                          type="text"
                          placeholder="e.g. IG-105"
                          required
                          value={newSrvId}
                          onChange={(e) => setNewSrvId(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Client Category Name</label>
                        <select
                          id="select-srv-category"
                          value={newSrvCategory}
                          onChange={(e) => setNewSrvCategory(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rate per 1k (USD)</label>
                        <input
                          id="inp-srv-rate"
                          type="number"
                          step="0.01"
                          required
                          value={newSrvRate}
                          onChange={(e) => setNewSrvRate(parseFloat(e.target.value) || 0)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Package Label / Name</label>
                        <input
                          id="inp-srv-name"
                          type="text"
                          placeholder="e.g. Instagram Followers [Premium Global HQ / Day 30K]"
                          required
                          value={newSrvName}
                          onChange={(e) => setNewSrvName(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Minimum Order Qty</label>
                        <input
                          id="inp-srv-min"
                          type="number"
                          required
                          value={newSrvMin}
                          onChange={(e) => setNewSrvMin(parseInt(e.target.value) || 100)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Maximum Order Qty</label>
                        <input
                          id="inp-srv-max"
                          type="number"
                          required
                          value={newSrvMax}
                          onChange={(e) => setNewSrvMax(parseInt(e.target.value) || 50000)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Package description</label>
                        <input
                          id="inp-srv-desc"
                          type="text"
                          placeholder="⚡ Start: 0-1h | Guarantee: 30D"
                          value={newSrvDesc}
                          onChange={(e) => setNewSrvDesc(e.target.value)}
                          className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <button
                          id="btn-submit-new-service"
                          type="submit"
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow"
                        >
                          Register SMM Package Package
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Service packages matrix */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">ID</th>
                      <th className="py-3 px-2">Social Segment</th>
                      <th className="py-3 px-2">Global Packages Packages</th>
                      <th className="py-3 px-2 text-right">Rate / 1k</th>
                      <th className="py-3 px-2 text-right">Min Qty</th>
                      <th className="py-3 px-2 text-right">Max Qty</th>
                      <th className="py-3 px-2 text-center">Console</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-slate-50/50 transition-all font-medium text-slate-700">
                        <td className="py-3.5 px-2 font-mono font-bold text-indigo-600">{srv.id}</td>
                        <td className="py-3.5 px-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 border border-slate-100 text-slate-500">
                            {srv.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 max-w-sm">
                          <h4 className="font-bold text-slate-800 leading-tight">{srv.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-1 truncate">{srv.description}</span>
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono font-black text-emerald-600">${srv.rate.toFixed(2)}</td>
                        <td className="py-3.5 px-2 text-right font-mono text-slate-500">{srv.min.toLocaleString()}</td>
                        <td className="py-3.5 px-2 text-right font-mono text-slate-500">{srv.max.toLocaleString()}</td>
                        <td className="py-3.5 px-2 text-center">
                          <button
                            id={`btn-del-service-${srv.id}`}
                            onClick={() => onDeleteService(srv.id)}
                            className="p-1 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer inline-flex items-center"
                            title="Delete Campaign Package"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 4: REGISTERED USERS MANAGER */}
          {activeAdminTab === "users" && (
            <motion.div
              key="admin-users"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm"
            >
              <div className="pb-6 border-b border-slate-100 mb-6">
                <h2 className="text-lg font-bold text-slate-800">SMM Customers Directory</h2>
                <p className="text-xs text-slate-400 font-medium">Verify credentials, modify and adjust dollar balances manually for bonuses or custom orders.</p>
              </div>

              {/* Search Control */}
              <div className="mb-4 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  id="inp-user-directory-search"
                  type="text"
                  placeholder="Search accounts by name/email/UID..."
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-400"
                />
              </div>

              {/* Balance Adjust Drawer Form */}
              <AnimatePresence>
                {adjustBalanceUserId && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    exit={{ opacity: 0, height: 0 }} 
                    className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl mb-6 space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-indigo-100/50 pb-2">
                      <span className="font-extrabold text-[10px] text-indigo-700 uppercase tracking-widest">
                        Adjust Balance for User ID: {adjustBalanceUserId}
                      </span>
                      <button 
                        id="btn-close-balance-adjust"
                        onClick={() => setAdjustBalanceUserId(null)}
                        className="text-xs font-bold text-indigo-500 hover:text-indigo-700"
                      >
                        Cancel
                      </button>
                    </div>

                    <form id="frm-adjust-balance" onSubmit={handleBalanceAdjustSubmit} className="flex flex-col sm:flex-row gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Adjustment Action</label>
                        <select
                          id="select-adjust-type"
                          value={adjustType}
                          onChange={(e) => setAdjustType(e.target.value as "add" | "deduct")}
                          className="w-full p-2.5 bg-white border border-indigo-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="add">Add Credit (+ USD)</option>
                          <option value="deduct">Deduct Debits (- USD)</option>
                        </select>
                      </div>

                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Balance Amount ($)</label>
                        <input
                          id="inp-adjust-balance-amount"
                          type="number"
                          step="0.01"
                          required
                          value={adjustBalanceAmount}
                          onChange={(e) => setAdjustBalanceAmount(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-white border border-indigo-100 rounded-xl text-xs font-mono font-bold text-slate-800"
                        />
                      </div>

                      <button
                        id="btn-submit-balance-adjust"
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        Commit Adjustment
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Users List Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3 px-2">User ID</th>
                      <th className="py-3 px-2">Primary Client Name</th>
                      <th className="py-3 px-2">Account email Address</th>
                      <th className="py-3 px-2 text-right">Wallet Balance</th>
                      <th className="py-3 px-2 text-right">Sum Total Spent</th>
                      <th className="py-3 px-2 text-center">Status</th>
                      <th className="py-3 px-2 text-center">Adjust Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-slate-50/50 transition-all font-medium">
                        <td className="py-3.5 px-2 font-mono font-bold text-slate-900">{usr.id}</td>
                        <td className="py-3.5 px-2 font-bold text-slate-800">{usr.name}</td>
                        <td className="py-3.5 px-2 font-mono text-slate-400">{usr.email}</td>
                        <td className="py-3.5 px-2 text-right font-mono font-black text-indigo-600">${usr.balance.toFixed(2)}</td>
                        <td className="py-3.5 px-2 text-right font-mono font-bold text-slate-500">${usr.totalSpent.toFixed(2)}</td>
                        <td className="py-3.5 px-2 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            usr.role === "admin" 
                              ? "bg-red-50 text-red-600 border-red-100" 
                              : "bg-emerald-50 text-emerald-600 border-emerald-100"
                          }`}>
                            {usr.role === "admin" ? "Admin" : "Client"}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center">
                          <button
                            id={`btn-adjust-bal-trigger-${usr.id}`}
                            onClick={() => {
                              setAdjustBalanceUserId(usr.id);
                              setAdjustBalanceAmount(10);
                            }}
                            className="px-3 py-1 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-150 rounded-lg text-[10px] font-bold transition-all text-slate-600 cursor-pointer"
                          >
                            Modify ($)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SYSTEM TICKETS DESK */}
          {activeAdminTab === "tickets" && (
            <motion.div
              key="admin-tickets"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Tickets Directory list (left) */}
              <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-800 pb-3 border-b border-slate-100 mb-4 uppercase tracking-wider">
                  Support Desk Tickets
                </h2>

                <div className="space-y-2">
                  {tickets.length > 0 ? (
                    tickets.map((t) => {
                      const isActive = replyTicketId === t.id;
                      let statColor = "bg-amber-50 text-amber-600 border-amber-100";
                      if (t.status === "Answered") statColor = "bg-slate-50 text-slate-400 border-slate-100";
                      if (t.status === "Closed") statColor = "bg-slate-100 text-slate-500 border-slate-200";

                      return (
                        <button
                          key={t.id}
                          id={`btn-admin-ticket-${t.id}`}
                          onClick={() => setReplyTicketId(t.id)}
                          className={`w-full p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            isActive 
                              ? "bg-slate-50 border-slate-300 shadow-sm" 
                              : "bg-white border-slate-100 hover:bg-slate-50/50"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1.5 animate-pulse">
                            <span className="text-[10px] font-mono font-bold text-slate-400">{t.id}</span>
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[8px] border ${statColor}`}>{t.status}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1">{t.subject}</h4>
                          <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                            <span className="truncate">Client: {t.userName}</span>
                            <span>Topic: {t.category}</span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      No tickets received in database.
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Chat interface responding to client query (right) */}
              <div className="lg:col-span-8">
                {activeReplyTicket ? (
                  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-[520px]">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4 shrink-0">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-800 leading-tight">Inquiry Subject: {activeReplyTicket.subject}</h4>
                          <span className="text-[9px] bg-red-50 text-red-500 font-bold px-2 py-0.5 rounded border border-red-100">{activeReplyTicket.category}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Reference Ticket {activeReplyTicket.id} • Submitted by {activeReplyTicket.userName}</span>
                      </div>
                      
                      {activeReplyTicket.status !== "Closed" && (
                        <button
                          id="btn-admin-close-ticket"
                          onClick={() => {
                            onCloseTicket(activeReplyTicket.id);
                            setReplyTicketId(null);
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-white hover:bg-slate-900 border border-slate-200 transition-all rounded-lg cursor-pointer"
                        >
                          Close Ticket
                        </button>
                      )}
                    </div>

                    {/* Chat messaging display */}
                    <div id="admin-ticket-chat-container" className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 select-text">
                      {activeReplyTicket.messages.map((m, index) => {
                        const isCurrentAdmin = m.sender === "admin";
                        return (
                          <div 
                            key={index} 
                            className={`flex ${isCurrentAdmin ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                              isCurrentAdmin 
                                ? "bg-indigo-600 text-white shadow-sm" 
                                : "bg-slate-50 border border-slate-100 text-slate-700" 
                            }`}>
                              <span className="text-[9px] block font-extrabold uppercase tracking-wide opacity-65 mb-1 text-right">
                                {isCurrentAdmin ? "📋 Administrator Staff" : `👤 Client: ${activeReplyTicket.userName}`}
                              </span>
                              <p className="whitespace-pre-wrap">{m.message}</p>
                              <span className="text-[8px] font-mono tracking-wide text-right block mt-2 opacity-60">
                                {new Date(m.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chat reply submission input */}
                    {activeReplyTicket.status !== "Closed" ? (
                      <form id="frm-admin-ticket-reply" onSubmit={handleSendAdminReply} className="mt-auto pt-3 border-t border-slate-100 shrink-0">
                        <div className="flex gap-2">
                          <input
                            id="inp-admin-ticket-reply-msg"
                            type="text"
                            placeholder="Type formal customer-service response..."
                            required
                            value={adminReplyMessage}
                            onChange={(e) => setAdminReplyMessage(e.target.value)}
                            className="flex-1 p-3 bg-slate-50 border border-slate-150 rounded-xl text-xs font-medium focus:none focus:bg-white focus:outline-none"
                          />
                          <button
                            id="btn-submit-admin-reply"
                            type="submit"
                            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow"
                          >
                            Send Reply <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-3 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl text-[11px] font-bold text-center mt-auto shrink-0 uppercase tracking-widest">
                        🛡️ This Support Ticket is CLOSED.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-150 border-dashed rounded-3xl p-12 text-center text-slate-400 font-medium">
                    <LifeBuoy className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm">No ticket workspace selected.</p>
                    <p className="text-xs mt-1 text-slate-400">Select a support ticket from the left column to reply directly as the admin desk.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeAdminTab === "deposits" && (
            <motion.div
              key="admin-deposits-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Header Banner */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <span className="p-1 px-1.5 bg-amber-50 rounded-lg text-amber-500 font-bold text-xs">
                      bKash / Nagad
                    </span>
                    Manual Billing Approvals
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Verify incoming mobile transactions and authorize immediate balance additions.</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold text-amber-600 font-mono">
                    Pending Queue: {pendingTxnsCount} Requests
                  </div>
                </div>
              </div>

              {/* Incoming Deposits verification grid/table */}
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Transaction Queries</h3>
                  <span className="text-[10px] text-slate-400 font-semibold italic">Merchant Number: 01750721835</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {transactions.length > 0 ? (
                    transactions.map((txn) => {
                      const isPending = txn.status === "Pending";
                      return (
                        <div key={txn.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-all">
                          <div className="space-y-1.5 flex-1 select-text">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                txn.method.includes("bKash") 
                                  ? "bg-pink-50 text-pink-600 border border-pink-100" 
                                  : txn.method.includes("Nagad")
                                  ? "bg-orange-50 text-orange-600 border border-orange-100"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}>
                                {txn.method}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">ID: {txn.id}</span>
                              <span className="text-[11px] text-slate-300">•</span>
                              <span className="text-[10px] text-slate-400 font-medium">{new Date(txn.createdAt).toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-1 gap-x-4 pt-1 text-xs">
                              <div>
                                <span className="text-slate-400 font-medium">Customer:</span>{" "}
                                <span className="font-bold text-slate-700">{txn.userName}</span>{" "}
                                <span className="text-[10px] text-slate-400 font-mono">({txn.userId})</span>
                              </div>
                              {txn.senderNumber && (
                                <div>
                                  <span className="text-slate-400 font-medium">Sender:</span>{" "}
                                  <span className="font-bold font-mono text-indigo-600">{txn.senderNumber}</span>
                                </div>
                              )}
                              {txn.trxId && (
                                <div>
                                  <span className="text-slate-400 font-medium">TrxID:</span>{" "}
                                  <span className="font-bold font-mono text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded uppercase select-all border border-slate-200">
                                    {txn.trxId}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                            {/* Amounts */}
                            <div className="text-left md:text-right">
                              <span className="text-base font-black font-mono text-indigo-600 block leading-tight">
                                ${txn.amount.toFixed(2)} USD
                              </span>
                              <span className="text-[11px] font-mono text-emerald-600 block mt-0.5 leading-none font-bold">
                                ৳{(txn.amount * 120).toLocaleString()} BDT
                              </span>
                            </div>

                            {/* Actions / Status Badge */}
                            <div>
                              {isPending ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    id={`btn-approve-txn-${txn.id}`}
                                    onClick={() => onApproveTransaction(txn.id)}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-sm hover:shadow-emerald-100 uppercase"
                                  >
                                    Yes
                                  </button>
                                  <button
                                    id={`btn-reject-txn-${txn.id}`}
                                    onClick={() => onRejectTransaction(txn.id)}
                                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-100 uppercase"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${
                                  txn.status === "Completed"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-red-50 text-red-600 border-red-100"
                                }`}>
                                  {txn.status === "Completed" ? "Completed" : "Rejected"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 text-slate-400 text-sm font-medium">
                      <Coins className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                      No bKash/Nagad transactions present in database history.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
  );
}
