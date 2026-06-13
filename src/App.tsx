import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Users, 
  Lock, 
  User as UserIcon,
  HelpCircle, 
  Settings, 
  Globe, 
  ShieldCheck, 
  Coins, 
  LogOut, 
  AlertCircle,
  CheckCircle2,
  Bell,
  Eye,
  Monitor,
  RefreshCw,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  initialCategories, 
  initialServices, 
  initialUsers, 
  initialOrders, 
  initialTransactions, 
  initialTickets 
} from "./initialData";
import { Category, Service, User, Order, Transaction, Ticket } from "./types";
import UserPanel from "./components/UserPanel";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  // Global State Loaded from LocalStorage or seeded from initialData
  const [categories, setCategories] = useState<Category[]>(() => {
    const local = localStorage.getItem("smm_categories");
    return local ? JSON.parse(local) : initialCategories;
  });

  const [services, setServices] = useState<Service[]>(() => {
    const local = localStorage.getItem("smm_services");
    return local ? JSON.parse(local) : initialServices;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const local = localStorage.getItem("smm_users");
    return local ? JSON.parse(local) : initialUsers;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem("smm_orders");
    return local ? JSON.parse(local) : initialOrders;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const local = localStorage.getItem("smm_transactions");
    return local ? JSON.parse(local) : initialTransactions;
  });

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const local = localStorage.getItem("smm_tickets");
    return local ? JSON.parse(local) : initialTickets;
  });

  // Navigation and Simulated browser routing
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [pathInput, setPathInput] = useState<string>("smmboostesa.com/");

  // Session user details (persisted)
  const [sessionUser, setSessionUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("smm_current_session");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  // Admin login states
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");

  // Customer Login/Signup credentials states
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const [notification, setNotification] = useState<{ id: string; type: "success" | "error"; message: string } | null>(null);

  // Sync sessionUser state to localStorage
  useEffect(() => {
    if (sessionUser) {
      localStorage.setItem("smm_current_session", JSON.stringify(sessionUser));
    } else {
      localStorage.removeItem("smm_current_session");
    }
  }, [sessionUser]);

  // Synchronize hash address on-load and keep it responsive
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash.toLowerCase();
      if (h.includes("admin") || h.includes("smmboostesa/admin")) {
        setCurrentPath("/admin");
        setPathInput("smmboostesa.com/admin");
      } else {
        setCurrentPath("/");
        setPathInput("smmboostesa.com/");
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    if (path === "/admin") {
      setPathInput("smmboostesa.com/admin");
      window.location.hash = "admin";
    } else {
      setPathInput("smmboostesa.com/");
      window.location.hash = "";
    }
  };

  // Toast dispatch helper
  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now().toString();
    setNotification({ id, type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.id === id ? null : prev));
    }, 4500);
  };

  // Find active logged-in User profile
  const currentUser = sessionUser || {
    id: "GUEST",
    name: "Guest Explorer",
    email: "guest@smmboostesa.com",
    balance: 0.00,
    totalSpent: 0,
    role: "user" as const,
    status: "active" as const
  };

  // Sync state variables to standard LocalStorage database objects
  useEffect(() => {
    localStorage.setItem("smm_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("smm_services", JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem("smm_users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem("smm_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("smm_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("smm_tickets", JSON.stringify(tickets));
  }, [tickets]);

  // ================= CORE CLIENT ACTIONS =================

  // Place SMM Order
  const handlePlaceOrder = (serviceId: string, link: string, quantity: number) => {
    const activeService = services.find((s) => s.id === serviceId);
    if (!activeService) {
      return { success: false, message: "Package details not found" };
    }

    const calculatedCharge = quantity * (activeService.rate / 1000);

    // Balance verification
    if (currentUser.balance < calculatedCharge) {
      showToast(`Insufficient wallet balance. Order cost is $${calculatedCharge.toFixed(2)}`, "error");
      return { 
        success: false, 
        message: `Insufficient wallet balance. This order costs $${calculatedCharge.toFixed(2)} but you only possess $${currentUser.balance.toFixed(2)}` 
      };
    }

    // Deduct charge from customer balance
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === currentUser.id
          ? { 
              ...u, 
              balance: parseFloat((u.balance - calculatedCharge).toFixed(4)),
              totalSpent: parseFloat((u.totalSpent + calculatedCharge).toFixed(2))
            }
          : u
      )
    );

    // Enqueue order item
    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      serviceId: activeService.id,
      serviceName: activeService.name,
      category: activeService.category,
      link: link,
      quantity: quantity,
      charge: parseFloat(calculatedCharge.toFixed(4)),
      status: "Pending",
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    showToast(`Order logged successfully! ID: ${newOrder.id}`);
    return { success: true, message: `Campaign logged! ID: ${newOrder.id}. Dispatching initiated soon.` };
  };

  // Add Funds Deposit Gateway
  const handleAddFunds = (amount: number, method: string, senderNumber?: string, trxId?: string) => {
    const isBkashNagad = method.toLowerCase().includes("bkash") || method.toLowerCase().includes("nagad");

    // Record Transaction
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      amount: amount,
      method: method,
      status: isBkashNagad ? "Pending" : "Completed",
      createdAt: new Date().toISOString(),
      senderNumber: senderNumber,
      trxId: trxId,
    };

    if (!isBkashNagad) {
      // Direct automated deposit (Credit Card, PayPal etc)
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === currentUser.id
            ? { ...u, balance: parseFloat((u.balance + amount).toFixed(2)) }
            : u
        )
      );
      showToast(`Deposited $${amount.toFixed(2)} via ${method}!`);
    } else {
      // Manual payment gateway triggers exact requested toast
      showToast("ad fund request inprosess");
    }

    setTransactions((prev) => [newTxn, ...prev]);
  };

  // Admin Approve Manual Payment Request
  const handleApproveTransaction = (txnId: string) => {
    const txn = transactions.find((t) => t.id === txnId);
    if (!txn || txn.status !== "Pending") return;

    // Credit targeted client account
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === txn.userId
          ? { ...u, balance: parseFloat((u.balance + txn.amount).toFixed(2)) }
          : u
      )
    );

    // Swap transaction status to Completed
    setTransactions((prevTxns) =>
      prevTxns.map((t) => (t.id === txnId ? { ...t, status: "Completed" } : t))
    );

    showToast(`Approved deposit of $${txn.amount.toFixed(2)} for ${txn.userName}`);
  };

  // Admin Reject Manual Payment Request
  const handleRejectTransaction = (txnId: string) => {
    setTransactions((prevTxns) =>
      prevTxns.map((t) => (t.id === txnId ? { ...t, status: "Failed" } : t))
    );
    showToast(`Payment request rejected.`);
  };

  // File support Ticket
  const handleAddTicket = (subject: string, category: Ticket["category"], message: string) => {
    const newTicket: Ticket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      userName: currentUser.name,
      subject: subject,
      category: category,
      status: "Open",
      createdAt: new Date().toISOString(),
      messages: [
        {
          sender: "user",
          message: message,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    showToast("Support ticket created!");
  };

  // Reply to support message as Customer
  const handleAddTicketMessage = (ticketId: string, message: string) => {
    setTickets((prevTickets) =>
      prevTickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "Open" as const,
              messages: [
                ...t.messages,
                {
                  sender: "user" as const,
                  message: message,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : t
      )
    );
    showToast("Message sent to SMM help desk!");
  };

  // ================= CORE ADMIN ACTIONS =================

  // Action: Update Order Status (handles cancel refunds automatically!)
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    // Detect if switching to Refunded status
    if (newStatus === "Refunded" && targetOrder.status !== "Refunded") {
      // Return order charge to Customer wallet balance and deduct spent
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.id === targetOrder.userId
            ? { 
                ...u, 
                balance: parseFloat((u.balance + targetOrder.charge).toFixed(4)),
                totalSpent: parseFloat(Math.max(0, u.totalSpent - targetOrder.charge).toFixed(2))
              }
            : u
        )
      );
      showToast(`Processed refund of $${targetOrder.charge.toFixed(2)} to client ${targetOrder.userName}`);
    }

    setOrders((prevOrders) =>
      prevOrders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Order ${orderId} marked as ${newStatus}`);
  };

  // Action: Manually adjust client balance
  const handleUpdateUserBalance = (userId: string, changeAmount: number) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId
          ? { ...u, balance: parseFloat(Math.max(0, u.balance + changeAmount).toFixed(2)) }
          : u
      )
    );
    
    const absoluteVal = Math.abs(changeAmount);
    const actionWord = changeAmount >= 0 ? "Credited" : "Deducted";
    showToast(`${actionWord} $${absoluteVal.toFixed(2)} to client record.`);
  };

  // Action: Add SMM package
  const handleAddService = (newService: Service) => {
    setServices((prev) => [...prev, newService]);
    showToast(`Package package ${newService.id} registered!`);
  };

  // Action: Delete package
  const handleDeleteService = (serviceId: string) => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    showToast("SMM Package deleted");
  };

  // Action: Reply ticket as administrator
  const handleAdminReplyTicket = (ticketId: string, message: string) => {
    setTickets((prevTickets) =>
      prevTickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: "Answered" as const,
              messages: [
                ...t.messages,
                {
                  sender: "admin" as const,
                  message: message,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : t
      )
    );
    showToast("Response transmitted to customer client panel!");
  };

  // Action: Close Ticket
  const handleCloseTicket = (ticketId: string) => {
    setTickets((prevTickets) =>
      prevTickets.map((t) => (t.id === ticketId ? { ...t, status: "Closed" as const } : t))
    );
    showToast("Ticket marked as Closed.");
  };

  // ================= LOGIN & SIGNUP HANDLERS =================

  // Handle Client Login
  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setLoginError("Please enter both username and password");
      return;
    }

    // Lookup user in current database list
    const foundUser = users.find(u => 
      u.role === "user" && 
      (u.name.toLowerCase() === loginUsername.trim().toLowerCase() || u.email.toLowerCase() === loginUsername.trim().toLowerCase()) &&
      (!u.password || u.password === loginPassword.trim())
    );

    if (foundUser) {
      if (foundUser.status === "suspended") {
        setLoginError("This account has been suspended by System Security.");
        return;
      }
      setSessionUser(foundUser);
      showToast(`Welcome back, ${foundUser.name}!`);
      setLoginUsername("");
      setLoginPassword("");
    } else {
      setLoginError("Incorrect credentials. Any unknown account must be registered first below!");
    }
  };

  // Handle Client Sign Up (Registration)
  const handleUserSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    if (!signupUsername.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setSignupError("Please fill out all fields to register your account.");
      return;
    }

    // Verify uniqueness
    const exists = users.some(u => 
      u.name.toLowerCase() === signupUsername.trim().toLowerCase() ||
      u.email.toLowerCase() === signupEmail.trim().toLowerCase()
    );

    if (exists) {
      setSignupError("A user with this username/email already exists.");
      return;
    }

    const newUser: User = {
      id: `USR-${Math.floor(100000 + Math.random() * 900000).toString()}`,
      name: signupUsername.trim(),
      email: signupEmail.trim(),
      balance: 0.00, // Balanced starts at zero as requested
      totalSpent: 0,
      role: "user",
      status: "active",
      password: signupPassword.trim()
    };

    setUsers((prev) => [...prev, newUser]);
    setSessionUser(newUser);

    // reset fields
    setSignupUsername("");
    setSignupEmail("");
    setSignupPassword("");
    showToast(`Registered successfully! Please submit a manual recharge to add balance.`);
  };

  // Handle Admin Authorization PIN Card
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoginError("");

    if (adminPasswordInput === "ESA900ZZ") {
      let adminUsr = users.find(u => u.role === "admin");
      if (!adminUsr) {
        adminUsr = {
          id: "USR-ADM",
          name: "SMMBOOSTESA Staff",
          email: "admin@smmboostesa.com",
          balance: 9999.00,
          totalSpent: 0,
          role: "admin",
          status: "active",
          password: "ESA900ZZ"
        };
        setUsers(prev => [...prev, adminUsr!]);
      }
      setSessionUser(adminUsr!);
      showToast("Access Level Verified. Administration Console unlocked!");
      setAdminPasswordInput("");
    } else {
      setAdminLoginError("Invalid admin security password. Correct key is: ESA900ZZ");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans antialiased pb-16 flex flex-col">
      
      {/* 1. REALISTIC INTERACTIVE MOCK BROWSER CHROME CONTROLLER */}
      <div id="mock-browser-chrome" className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 shrink-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Navigation indicators / Browser status */}
          <div className="flex items-center space-x-3 text-slate-300">
            <div className="flex space-x-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
            </div>
            
            <div className="flex items-center space-x-1.5 bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-400 font-mono">
              <Monitor className="w-3 h-3 text-indigo-400" />
              <span>SMMBOOSTESA Sandbox</span>
            </div>
          </div>

          {/* Location / Address URL Bar */}
          <div className="flex-1 max-w-2xl w-full flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1 text-slate-300 relative">
            <span className="text-[11px] text-slate-500 select-none mr-1 font-mono">https://</span>
            <input 
              id="browser-url-input"
              type="text" 
              value={pathInput}
              onChange={(e) => setPathInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = pathInput.toLowerCase();
                  if (val.includes("/admin") || val.includes("smmboostesa/admin")) {
                    navigateTo("/admin");
                  } else {
                    navigateTo("/");
                  }
                }
              }}
              className="flex-1 bg-transparent text-xs text-slate-200 outline-none font-sans py-0.5"
            />
            <button 
              id="btn-browser-refresh"
              onClick={() => {
                const val = pathInput.toLowerCase();
                if (val.includes("/admin") || val.includes("smmboostesa/admin")) {
                  navigateTo("/admin");
                } else {
                  navigateTo("/");
                }
                showToast("Page refreshed successfully!");
              }}
              className="text-slate-500 hover:text-slate-300"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Route Switches (Instant Navigation) */}
          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-slate-400 text-[10px] uppercase font-bold mr-1 hidden sm:inline">Test Views:</span>
            
            <button
              id="btn-navigate-client"
              onClick={() => navigateTo("/")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentPath === "/" 
                  ? "bg-indigo-600 text-white shadow-sm" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              smmboostesa.com/
            </button>

            <button
              id="btn-navigate-admin"
              onClick={() => navigateTo("/admin")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                currentPath === "/admin" 
                  ? "bg-red-600 text-white shadow-sm" 
                  : "bg-slate-800 text-red-400 hover:bg-slate-700 hover:text-red-300"
              }`}
            >
              <Lock className="w-3 h-3" /> smmboostesa/admin
            </button>
          </div>

        </div>
      </div>

      {/* 2. GENERAL BANNER HEADERS */}
      <header id="main-app-header" className="bg-white border-b border-slate-100 py-4 px-6 shrink-0 shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-3 select-none">
            <div className="w-10 h-10 rounded-2xl bg-slate-950 flex items-center justify-center text-white border border-slate-900 shadow-sm">
              <Layers className="w-5.5 h-5.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
                SMMBOOSTESA <span className="font-sans px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-600 font-extrabold uppercase leading-none">famegrow standard</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">Premium Social Media Marketing Agency</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {sessionUser && (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">{sessionUser.role === 'admin' ? "🛡️ Admin" : "👤 Client Account"}</span>
                  <span className="text-xs font-bold text-slate-700 block">{sessionUser.name}</span>
                </div>
                <button
                  id="btn-session-logout"
                  onClick={() => {
                    setSessionUser(null);
                    showToast("Logged out successfully");
                    navigateTo("/");
                  }}
                  className="p-2 border border-rose-100 text-rose-500 rounded-xl hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}
            
            {!sessionUser && (
              <div className="flex items-center justify-end text-xs font-bold text-slate-400">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse mr-1.5 font-sans"></span>
                <span>Active Sandbox Mode</span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 3. SUBPORTAL LAYOUT CONTEXT */}
      <main id="core-portal-grid" className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full relative z-30">
        
        {/* ================= PATHWAY A: ADMIN CHALLENGE PANEL ================= */}
        {currentPath === "/admin" && (
          <div>
            {!sessionUser || sessionUser.role !== "admin" ? (
              /* Admin password challenge */
              <motion.div 
                key="admin-gate-panel"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto bg-white border border-slate-100 rounded-3xl p-8 shadow-xl mt-6 space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto shadow-sm">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-bold font-sans text-slate-900">SMMBOOSTESA Admin Gate</h2>
                  <p className="text-xs text-slate-400">Enter system credential key passphrase to unlock administrative panel dashboard.</p>
                </div>

                <form id="frm-admin-pin" onSubmit={handleAdminLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Administrative Secret key</label>
                    <input
                      id="inp-admin-password"
                      type="password"
                      placeholder="Enter Admin Password (ESA900ZZ)"
                      required
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-slate-800"
                    />
                  </div>

                  {adminLoginError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold text-center">
                      ❌ {adminLoginError}
                    </div>
                  )}

                  <button
                    id="btn-admin-submit"
                    type="submit"
                    className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                  >
                    Authenticate Console
                  </button>
                </form>
              </motion.div>
            ) : (
              /* Inside active Admin Panel view */
              <div>
                {/* Header segment banner */}
                <div className="bg-gradient-to-r from-red-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 mb-8 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-black text-xl tracking-tight leading-tight flex items-center gap-2">
                      <ShieldCheck className="w-6 h-6 text-red-500 shrink-0 animate-pulse" /> SMMBOOSTESA Control Room
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      Active billing operations, pending bKash/Nagad queries, SMM packages catalog, and order dispatch management.
                    </p>
                  </div>

                  <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl text-xs font-mono text-red-200 flex items-center gap-2 shrink-0">
                    <Eye className="w-4 h-4 text-red-400" /> 
                    <span>Administrator Node Active</span>
                  </div>
                </div>

                <AdminPanel
                  users={users}
                  services={services}
                  categories={categories}
                  orders={orders}
                  tickets={tickets}
                  transactions={transactions}
                  onUpdateOrderStatus={handleUpdateOrderStatus}
                  onUpdateUserBalance={handleUpdateUserBalance}
                  onAddService={handleAddService}
                  onDeleteService={handleDeleteService}
                  onAdminReplyTicket={handleAdminReplyTicket}
                  onCloseTicket={handleCloseTicket}
                  onApproveTransaction={handleApproveTransaction}
                  onRejectTransaction={handleRejectTransaction}
                />
              </div>
            )}
          </div>
        )}

        {/* ================= PATHWAY B: CLIENT-SIDE WORKSPACE ================= */}
        {currentPath === "/" && (
          <div>
            {!sessionUser ? (
              /* Public Landing Page (famegrow.com copy layout!) */
              <div className="space-y-12 font-sans">
                
                {/* 1. Hero copy of famegrow.com */}
                <div className="text-center max-w-3xl mx-auto space-y-4 pt-4">
                  <span className="p-1 px-3 bg-indigo-50 text-indigo-600 rounded-full font-bold text-[10px] uppercase tracking-widest border border-indigo-100 font-sans">
                    🔥 SMMBOOSTESA.COM • #1 SMM Agency Distribution Solution
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight font-display">
                    Premium Social Media Growth, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600">Copied from Famegrow</span>
                  </h2>
                  <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed font-sans">
                    Source lightning fast, organic-grade likes, subscribers, verified views, and custom comments. Fully persistent user database & instant manual bKash/Nagad gateways.
                  </p>
                </div>

                {/* 2. Login vs Signup forms Side-by-side */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto">
                  
                  {/* Login segment (Left, span 6) */}
                  <div className="lg:col-span-6 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-2">
                      <span className="p-1 px-2.5 bg-slate-50 text-slate-500 rounded-lg text-[9px] uppercase font-black">Secure Login Gate</span>
                      <h3 className="text-lg font-bold text-slate-800">Welcome Back Client</h3>
                      <p className="text-xs text-slate-400">Enter your registered credentials to launch ordering console.</p>
                    </div>

                    <form id="frm-user-login" onSubmit={handleUserLoginSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Username / Email</label>
                        <input
                          id="inp-login-username"
                          type="text"
                          required
                          placeholder="e.g. john"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium focus:none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Password</label>
                        <input
                          id="inp-login-password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium focus:none"
                        />
                      </div>

                      {loginError && (
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100">
                          {loginError}
                        </div>
                      )}

                      <button
                        id="btn-login-submit"
                        type="submit"
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer uppercase tracking-wider"
                      >
                        Sign In Now <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                      </button>
                    </form>

                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-400 font-medium leading-relaxed">
                      💡 <strong>Seeded Account Hints:</strong> Enter username <code>john</code> with password <code>123</code> (free $145 balance preset) to instantly login!
                    </div>
                  </div>

                  {/* Signup segment (Right, span 6) */}
                  <div className="lg:col-span-6 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
                    <div className="space-y-2">
                      <span className="p-1 px-2.5 bg-indigo-50 text-indigo-500 rounded-lg text-[9px] uppercase font-black">Quick Signup Portal</span>
                      <h3 className="text-lg font-bold text-slate-800">New Account Registration</h3>
                      <p className="text-xs text-slate-400">"jar mone tai registration Kore login korbi" - Anyone can sign up freely!</p>
                    </div>

                    <form id="frm-user-signup" onSubmit={handleUserSignupSubmit} className="space-y-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Desired Username</label>
                        <input
                          id="inp-signup-username"
                          type="text"
                          required
                          placeholder="e.g. razib90"
                          value={signupUsername}
                          onChange={(e) => setSignupUsername(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium focus:none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Your Email Address</label>
                        <input
                          id="inp-signup-email"
                          type="email"
                          required
                          placeholder="e.g. customer@famegrow.com"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Password</label>
                        <input
                          id="inp-signup-password"
                          type="password"
                          required
                          placeholder="••••••••"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white text-slate-800 font-medium"
                        />
                      </div>

                      {signupError && (
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100">
                          {signupError}
                        </div>
                      )}

                      <button
                        id="btn-signup-submit"
                        type="submit"
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow cursor-pointer uppercase tracking-wider"
                      >
                        Register & Start Free <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                      </button>
                    </form>

                    <div className="p-3 bg-indigo-50 text-indigo-800 border border-indigo-100 rounded-xl text-[10px] font-medium leading-relaxed">
                      💳 <strong>Wallet Policy:</strong> New accounts start with a **$0.00** balance preset. Please submit a manual bKash or Nagad recharge to add balance!
                    </div>
                  </div>

                </div>

                {/* 3. SMM Category matrix & Public Pricing table list */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm max-w-5xl mx-auto space-y-4 font-sans">
                  <div className="border-b border-slate-50 pb-4">
                    <h3 className="text-sm font-bold text-slate-800">Public SMM Pricing Catalog</h3>
                    <p className="text-xs text-slate-400 mt-1">Guests can browse available services package list. Log in to place direct campaigns!</p>
                  </div>

                  <div className="overflow-x-auto select-none">
                    <table className="w-full text-left text-xs font-sans">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-extrabold uppercase">
                          <th className="py-2.5">ID</th>
                          <th className="py-2.5">Category</th>
                          <th className="py-2.5">Package Description</th>
                          <th className="py-2.5 text-right">Rate / 1000</th>
                          <th className="py-2.5 text-right">Limits (Min / Max)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 font-medium text-slate-600">
                        {services.map((srv) => (
                          <tr key={srv.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 font-mono text-slate-400">{srv.id}</td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 uppercase font-bold">
                                {srv.category}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-800 font-bold">{srv.name}</td>
                            <td className="py-2.5 text-right font-bold text-indigo-600">${srv.rate.toFixed(2)}</td>
                            <td className="py-2.5 text-right font-mono text-[11px] text-slate-400">{srv.min.toLocaleString()} - {srv.max.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : (
              /* If customer is successfully logged-in, show standard UserPanel UI */
              <div>
                {/* User welcome message banner */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 mb-8 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-black text-xl tracking-tight leading-tight flex items-center gap-2 capitalize">
                      <Globe className="w-6 h-6 text-indigo-400 shrink-0" /> Welcome back, {currentUser.name}!
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-sans">
                      Instantly source premium, guaranteed growth campaigns to fuel engagement on top networks.
                    </p>
                  </div>

                  <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-xs font-mono text-indigo-300 flex items-center gap-2 shrink-0">
                    <Coins className="w-4 h-4 text-indigo-400 animate-bounce" /> 
                    <span>Wallet Balance: <b className="text-white">${currentUser.balance.toFixed(2)}</b></span>
                  </div>
                </div>

                <UserPanel
                  currentUser={currentUser}
                  services={services}
                  categories={categories}
                  orders={orders}
                  transactions={transactions}
                  tickets={tickets}
                  onPlaceOrder={handlePlaceOrder}
                  onAddFunds={handleAddFunds}
                  onAddTicket={handleAddTicket}
                  onAddTicketMessage={handleAddTicketMessage}
                />
              </div>
            )}
          </div>
        )}

      </main>

      {/* 4. REAL-TIME INTERACTIVE FLOATING NOTIFICATIONS */}
      <AnimatePresence>
        {notification && (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 25, y: 15 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-slate-100 rounded-2xl p-4.5 shadow-2xl flex items-start space-x-3 select-none"
          >
            {notification.type === "success" ? (
              <span className="p-1 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 border border-emerald-100">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </span>
            ) : (
              <span className="p-1 bg-rose-50 text-rose-600 rounded-lg shrink-0 border border-rose-100">
                <AlertCircle className="w-4.5 h-4.5" />
              </span>
            )}
            <div className="flex-1 min-w-0 pr-1">
              <span className="text-xs font-extrabold text-slate-800 tracking-wide uppercase block">System Notification</span>
              <p className="text-xs font-medium text-slate-600 mt-1 leading-normal">{notification.message}</p>
            </div>
            <button
              id="btn-dismiss-toast"
              onClick={() => setNotification(null)}
              className="text-[10px] font-bold text-slate-400 hover:text-slate-600 block shrink-0"
            >
              Okay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
