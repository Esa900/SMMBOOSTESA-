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
  ArrowRight,
  Menu,
  X
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
  
  // Custom synced navigation states for FameGrows burger menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"new-order" | "orders" | "services" | "add-funds" | "tickets">("new-order");

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

  const [authView, setAuthView] = useState<"login" | "signup">("login");

  const [notification, setNotification] = useState<{ id: string; type: "success" | "error"; message: string } | null>(null);

  // Sync sessionUser state to localStorage and keep state up-to-date with users database
  useEffect(() => {
    if (sessionUser) {
      localStorage.setItem("smm_current_session", JSON.stringify(sessionUser));
    } else {
      localStorage.removeItem("smm_current_session");
    }
  }, [sessionUser]);

  // Proactively sync sessionUser whenever its matching record in the users database list changes
  useEffect(() => {
    if (sessionUser) {
      const match = users.find((u) => u.id === sessionUser.id);
      if (match) {
        if (
          match.balance !== sessionUser.balance ||
          match.totalSpent !== sessionUser.totalSpent ||
          match.status !== sessionUser.status ||
          match.name !== sessionUser.name
        ) {
          setSessionUser(match);
        }
      } else {
        // Account has been deleted by an admin! Log out instantly.
        setSessionUser(null);
        showToast("Your session expired or your account has been removed.", "error");
      }
    }
  }, [users, sessionUser]);

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

  // Find active logged-in User profile reactively from the main database users state list
  const currentUser = sessionUser
    ? (users.find((u) => u.id === sessionUser.id) || sessionUser)
    : {
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
    let updatedActiveUser: User | null = null;
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === currentUser.id) {
          const updated = { 
            ...u, 
            balance: parseFloat((u.balance - calculatedCharge).toFixed(4)),
            totalSpent: parseFloat((u.totalSpent + calculatedCharge).toFixed(2))
          };
          updatedActiveUser = updated;
          return updated;
        }
        return u;
      })
    );

    if (updatedActiveUser) {
      setSessionUser(updatedActiveUser);
    }

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
      let updatedActiveUser: User | null = null;
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === currentUser.id) {
            const updated = { ...u, balance: parseFloat((u.balance + amount).toFixed(2)) };
            updatedActiveUser = updated;
            return updated;
          }
          return u;
        })
      );
      if (updatedActiveUser) {
        setSessionUser(updatedActiveUser);
      }
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
    let updatedTargetUser: User | null = null;
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === txn.userId) {
          const updated = { ...u, balance: parseFloat((u.balance + txn.amount).toFixed(2)) };
          updatedTargetUser = updated;
          return updated;
        }
        return u;
      })
    );

    if (updatedTargetUser && sessionUser && sessionUser.id === txn.userId) {
      setSessionUser(updatedTargetUser);
    }

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
    let updatedUser: User | null = null;
    setUsers((prevUsers) =>
      prevUsers.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, balance: parseFloat(Math.max(0, u.balance + changeAmount).toFixed(2)) };
          updatedUser = updated;
          return updated;
        }
        return u;
      })
    );
    
    if (updatedUser && sessionUser && sessionUser.id === userId) {
      setSessionUser(updatedUser);
    }
    
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

  // Action: Remove / Delete client account
  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showToast(`User account ${userId} has been permanently deleted.`);
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
      
      {/* 2. GENERAL BANNER HEADERS */}
      <header id="main-app-header" className="bg-white border-b border-slate-100 py-3.5 px-4 sm:px-6 shrink-0 shadow-sm relative z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo brand conforming to ESA DEGITAL BOOST BD */}
          <div className="flex items-center space-x-2 select-none cursor-pointer" onClick={() => navigateTo("/")}>
            <div className="w-8.5 h-8.5 rounded-full bg-[#22c55e] flex items-center justify-center text-white font-extrabold text-sm shadow-md shadow-emerald-500/10">
              ↗
            </div>
            <div>
              <h1 className="font-display font-black text-lg tracking-tight text-slate-900 leading-none flex items-center gap-1.5">
                ESA DEGITAL BOOST BD <span className="font-sans px-1 text-[8.5px] bg-emerald-50 rounded text-emerald-600 font-extrabold uppercase">SMMBOOSTESA</span>
              </h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Top-Tier Social Provider</p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {/* Real-time Green Balance Pill button at the header row */}
            {sessionUser && (
              <div 
                className="px-3.5 py-1.5 bg-[#22c55e] hover:bg-emerald-600 text-white text-xs font-mono font-black rounded-full tracking-wide shadow-sm flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                onClick={() => {
                  navigateTo("/");
                  setActiveTab("add-funds");
                }}
                title="Your wallet balance. Click to deposit funds"
              >
                <span>$</span>
                <span>{currentUser.balance.toFixed(3)}</span>
              </div>
            )}
            
            {/* 3-Line Hamburger toggle button */}
            <button
              id="hamburger-menu-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 rounded-xl transition-all outline-none cursor-pointer flex items-center justify-center"
              title="Open Navigation Menu"
            >
              <Menu className="w-5.5 h-5.5 text-slate-900" />
            </button>
          </div>

        </div>
      </header>

      {/* Dynamic 3-Line Hamburger Dropdown/Drawer overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 cursor-pointer"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 p-6 flex flex-col justify-between border-l border-slate-100 font-sans select-none"
            >
              <div>
                {/* Drawer Header with Title and Dismiss (X) */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-7.5 h-7.5 rounded-full bg-[#22c55e] flex items-center justify-center text-white font-black text-xs">↗</div>
                    <span className="font-display font-black text-lg text-slate-900">ESA DEGITAL BOOST BD</span>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User Balance Banner inside Drawer */}
                <div className="my-5 p-3.5 bg-emerald-50/50 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">Account Balance</span>
                  <div className="px-3.5 py-1 bg-[#22c55e] text-white text-xs font-black font-mono rounded-full tracking-wide shadow-sm">
                    {"$" + (sessionUser ? currentUser.balance.toFixed(3) : "0.065")}
                  </div>
                </div>

                {/* Main Hamburger 3-Line Menu List Navigation Items */}
                <nav id="hamburger-menu-nav" className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                  
                  {/* Item 1: New order (Solid bright green pill of famegrow!) */}
                  <button
                    onClick={() => {
                      navigateTo("/");
                      setActiveTab("new-order");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === "new-order" && currentPath === "/"
                        ? "bg-[#22c55e] text-white shadow-md shadow-emerald-500/10"
                        : "text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>🛒</span> New order
                    </span>
                    <span className="text-[9px] uppercase font-black tracking-widest opacity-85">(Active)</span>
                  </button>

                  {/* Item 2: Add funds */}
                  <button
                    onClick={() => {
                      navigateTo("/");
                      setActiveTab("add-funds");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === "add-funds" && currentPath === "/"
                        ? "bg-[#22c55e]/10 text-[#22c55e]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>💰</span> Add funds
                  </button>

                  {/* Item 3: Orders */}
                  <button
                    onClick={() => {
                      navigateTo("/");
                      setActiveTab("orders");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === "orders" && currentPath === "/"
                        ? "bg-[#22c55e]/10 text-[#22c55e]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>👥</span> Orders
                  </button>

                  {/* Item 4: Services */}
                  <button
                    onClick={() => {
                      navigateTo("/");
                      setActiveTab("services");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === "services" && currentPath === "/"
                        ? "bg-[#22c55e]/10 text-[#22c55e]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>📋</span> Services
                  </button>

                  {/* Item 5: Mass order */}
                  <button
                    onClick={() => {
                      navigateTo("/");
                      setActiveTab("new-order");
                      setIsMenuOpen(false);
                      showToast("Mass Order panel loaded in system console!");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>📄</span> Mass order
                  </button>

                  {/* Item 6: API */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      showToast("API Access Module V2 is active for distribution");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>&lt;/&gt;</span> API
                  </button>

                  {/* Item 7: Tickets (with orange notification badge matching Famegrows!) */}
                  <button
                    onClick={() => {
                      navigateTo("/");
                      setActiveTab("tickets");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeTab === "tickets" && currentPath === "/"
                        ? "bg-[#22c55e]/10 text-[#22c55e]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>💬</span> Tickets
                    </span>
                    <span className="px-2 py-0.5 bg-amber-500 text-white text-[9.5px] font-black rounded font-mono">
                      {tickets.filter(t => t.status === "Answered").length || "4"}
                    </span>
                  </button>

                  {/* Item 8: Child Panel */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      showToast("Deploy standard whitelabel clones for $10/month. File an inquiry ticket.");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>👤</span> Child Panel
                  </button>

                  {/* Item 9: Tutorial */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      showToast("Play interactive tutorial video in pop-up player");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>▶️</span> Tutorial
                  </button>

                  {/* Item 10: Notifications */}
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      showToast("SMM channels are stable under heavy API load.");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>🔔</span> Notifications
                  </button>

                  {/* Item 11: Account Profile */}
                  <button
                    onClick={() => {
                      navigateTo("/");
                      setIsMenuOpen(false);
                      showToast(`Current Account: ${currentUser.name} (${currentUser.email})`);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <span>👤</span> Account
                  </button>

                  {/* Item 12: Admin Panel - compact named as "AP" at 3line compactly as requested!) */}
                  <button
                    onClick={() => {
                      navigateTo("/admin");
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      currentPath === "/admin"
                        ? "bg-rose-100 text-rose-700"
                        : "text-rose-600 hover:bg-rose-50"
                    }`}
                  >
                    <span>🛡️</span> AP
                  </button>

                </nav>
              </div>

              {/* Drawer Footer Session Logouts */}
              <div className="pt-4 border-t border-slate-100">
                {sessionUser ? (
                  <div className="space-y-3">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 font-extrabold uppercase block">Session Handle</span>
                      <span className="text-[11.5px] font-black text-slate-700 block mt-0.5 truncate">{sessionUser.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSessionUser(null);
                        setIsMenuOpen(false);
                        showToast("Logged out of the session");
                        navigateTo("/");
                      }}
                      className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-extrabold rounded-xl transition-all cursor-pointer block text-center uppercase tracking-wider"
                    >
                      Logout Session
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-[10px] font-bold text-slate-400">
                    SMMBOOSTESA Sandbox Room
                  </div>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                  onDeleteUser={handleDeleteUser}
                />
              </div>
            )}
          </div>
        )}

        {/* ================= PATHWAY B: CLIENT-SIDE WORKSPACE ================= */}
        {currentPath === "/" && (
          <div>
            {!sessionUser ? (
              /* Public Landing Page (ESA DEGITAL BOOST BD copy layout!) */
              <div className="space-y-12 font-sans pb-12">
                
                {/* 1. Hero copy of ESA DEGITAL BOOST BD matching screenshot */}
                <div className="text-center max-w-3xl mx-auto space-y-5 pt-6 px-4">
                  <span className="p-1 px-3 bg-emerald-50 text-emerald-600 rounded-full font-extrabold text-[10px] uppercase tracking-wider border border-emerald-100 font-sans">
                    🔥 SMMBOOSTESA.COM • #1 SMM Agency Distribution Solution
                  </span>
                  
                  {/* Custom SMM logo and main brand name matching screenshot */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 select-none">
                    <div className="w-12 h-12 rounded-full bg-[#22c55e] flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
                      ↗
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-[#1a5c37] tracking-tight leading-none font-display">
                      ESA DEGITAL BOOST BD
                    </h2>
                  </div>

                  <div className="flex items-center justify-center space-x-2 text-base sm:text-xl font-extrabold text-slate-700 font-sans pt-2">
                    <span>Your Growth Awaits —</span>
                    <button
                      id="hero-join-now-btn"
                      onClick={() => setAuthView(authView === "login" ? "signup" : "login")}
                      className="px-6 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-full font-black text-xs sm:text-sm shadow-md transition-all uppercase tracking-widest cursor-pointer mt-0.5"
                    >
                      {authView === "login" ? "Join Now!" : "Sign In!"}
                    </button>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Source instant, organic-grade high-retention views, likes, comments, and authentic subscribers.
                  </p>
                </div>

                {/* 2. Custom switcher: single-card premium mockup matching screenshot */}
                <div className="max-w-md mx-auto px-4">
                  {authView === "login" ? (
                    <div className="bg-white border-2 border-[#22c55e] rounded-[32px] p-6 sm:p-8 shadow-2xl relative transition-all">
                      <form id="frm-user-login" onSubmit={handleUserLoginSubmit} className="space-y-5">
                        
                        {/* Username */}
                        <div className="space-y-1">
                          <label className="block text-sm sm:text-base font-black text-slate-800">
                            Username
                          </label>
                          <input
                            id="inp-login-username"
                            type="text"
                            required
                            placeholder="Enter username"
                            value={loginUsername}
                            onChange={(e) => setLoginUsername(e.target.value)}
                            className="w-full px-4 py-3.5 text-xs sm:text-sm bg-white border-2 border-slate-200 rounded-2xl focus:bg-white text-slate-800 font-bold focus:outline-none focus:border-[#22c55e] transition-all"
                          />
                        </div>

                        {/* Password with inline "Forgot password?" */}
                        <div className="space-y-1">
                          <label className="block text-sm sm:text-base font-black text-slate-800">
                            Password
                          </label>
                          <div className="relative">
                            <input
                              id="inp-login-password"
                              type="password"
                              required
                              placeholder="Enter password"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              className="w-full pl-4 pr-32 py-3.5 text-xs sm:text-sm bg-white border-2 border-slate-200 rounded-2xl focus:bg-white text-slate-800 font-bold focus:outline-none focus:border-[#22c55e] transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => showToast("Password help link sent to your registered email!")}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] sm:text-xs font-bold text-blue-500 hover:text-blue-600 transition-all cursor-pointer"
                            >
                              Forgot password?
                            </button>
                          </div>
                        </div>

                        {/* Remember me checkbox aligned perfectly */}
                        <div className="flex items-center space-x-2.5">
                          <input
                            id="chk-login-remember"
                            type="checkbox"
                            defaultChecked
                            className="w-4.5 h-4.5 text-blue-600 bg-[#d0f2fe] border-none rounded-md focus:ring-0 cursor-pointer"
                          />
                          <label htmlFor="chk-login-remember" className="text-xs font-bold text-slate-500 cursor-pointer">
                            Remember me
                          </label>
                        </div>

                        {loginError && (
                          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100">
                            {loginError}
                          </div>
                        )}

                        {/* Fat green Sign in button */}
                        <button
                          id="btn-login-submit"
                          type="submit"
                          className="w-full py-4 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-2xl font-black text-sm sm:text-base transition-all shadow-md cursor-pointer text-center uppercase tracking-wider"
                        >
                          Sign in
                        </button>

                        {/* Interactive Google Autologin Widget based on design screenshot */}
                        <div 
                          onClick={() => {
                            setLoginUsername("john");
                            setLoginPassword("123");
                            showToast("Interactive demo credentials prefilled! Please click 'Sign in' to test john's account.");
                          }}
                          className="border border-slate-200 hover:border-slate-350 bg-white/90 hover:bg-slate-50/80 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-sm"
                        >
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white text-[11px] font-bold">
                              Bd
                            </div>
                            <div className="text-left leading-normal">
                              <span className="text-[11.5px] font-black text-slate-700 block leading-none">Sign in as Bd</span>
                              <span className="text-[10px] text-slate-400 block font-mono mt-0.5 leading-none">
                                bdh589038@gmail.com
                              </span>
                            </div>
                          </div>
                          
                          {/* Google official flag logo */}
                          <div className="w-8 h-8 flex items-center justify-center shrink-0">
                            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                            </svg>
                          </div>
                        </div>

                        {/* Prompt to register */}
                        <div className="text-center text-xs text-slate-500 font-bold pt-1">
                          <span>Do not have an account? </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthView("signup");
                              setSignupError("");
                            }}
                            className="text-blue-600 hover:text-blue-700 font-extrabold focus:outline-none cursor-pointer underline hover:scale-102 transition-all"
                          >
                            Sign up
                          </button>
                        </div>

                      </form>
                      
                      <div className="mt-4 p-2 bg-slate-50 border border-slate-150 rounded-xl text-[10px] text-slate-400 font-bold text-center leading-normal">
                        💡 Click the white Google bar above to prefill instantly!
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-[#22c55e] rounded-[32px] p-6 sm:p-8 shadow-2xl relative transition-all">
                      <form id="frm-user-signup" onSubmit={handleUserSignupSubmit} className="space-y-4">
                        
                        {/* Username */}
                        <div className="space-y-1">
                          <label className="block text-xs sm:text-sm font-black text-slate-800">Desired Username</label>
                          <input
                            id="inp-signup-username"
                            type="text"
                            required
                            placeholder="e.g. razib90"
                            value={signupUsername}
                            onChange={(e) => setSignupUsername(e.target.value)}
                            className="w-full px-4 py-3 text-xs sm:text-sm bg-white border-2 border-slate-200 rounded-2xl focus:bg-white text-slate-800 font-bold focus:outline-none focus:border-[#22c55e] transition-all"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="block text-xs sm:text-sm font-black text-slate-800">Your Email Address</label>
                          <input
                            id="inp-signup-email"
                            type="email"
                            required
                            placeholder="e.g. customer@gmail.com"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="w-full px-4 py-3 text-xs sm:text-sm bg-white border-2 border-slate-200 rounded-2xl focus:bg-white text-slate-800 font-bold focus:outline-none focus:border-[#22c55e] transition-all"
                          />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                          <label className="block text-xs sm:text-sm font-black text-slate-800">Password</label>
                          <input
                            id="inp-signup-password"
                            type="password"
                            required
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="w-full px-4 py-3 text-xs sm:text-sm bg-white border-2 border-slate-200 rounded-2xl focus:bg-white text-slate-800 font-bold focus:outline-none focus:border-[#22c55e] transition-all"
                          />
                        </div>

                        {signupError && (
                          <div className="p-2.5 bg-red-50 text-red-600 rounded-xl text-[11px] font-bold border border-red-100">
                            {signupError}
                          </div>
                        )}

                        {/* Register Button */}
                        <button
                          id="btn-signup-submit"
                          type="submit"
                          className="w-full py-3.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-2xl font-black text-sm transition-all shadow-md cursor-pointer text-center uppercase tracking-wider"
                        >
                          Sign up
                        </button>

                        {/* Switch Back to Login */}
                        <div className="text-center text-xs text-slate-500 font-bold pt-1">
                          <span>Already have an account? </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthView("login");
                              setLoginError("");
                            }}
                            className="text-blue-600 hover:text-blue-700 font-extrabold focus:outline-none cursor-pointer underline"
                          >
                            Sign in
                          </button>
                        </div>

                      </form>
                    </div>
                  )}
                </div>

                {/* 3. Illustration block matching the bottom of the user screenshot */}
                <div className="max-w-xl mx-auto px-4 text-center mt-6 relative select-none">
                  
                  {/* Megaphone and floating elements simulation panel */}
                  <div className="p-6 bg-emerald-50/45 rounded-3xl border border-emerald-100 relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                    
                    {/* Big animated relative floating circles representing social targets */}
                    <div className="absolute top-10 left-12 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md animate-bounce">
                      ▶
                    </div>
                    
                    <div className="absolute top-6 right-16 w-11 h-11 bg-rose-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md animate-bounce delay-300">
                      ❤️
                    </div>

                    <div className="absolute bottom-16 left-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md animate-pulse">
                      👍
                    </div>

                    {/* Speech bubble 50K indicator badge */}
                    <div className="absolute bottom-12 right-12 bg-red-500 text-white px-3.5 py-1.5 rounded-2xl font-black text-xs shadow-lg uppercase tracking-wider flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping"></span>
                      👥 50K+ Active
                    </div>

                    {/* Clean SVG Megaphone Core Drawing */}
                    <div className="w-36 h-36 relative z-10 transition-transform duration-500 hover:scale-110 cursor-alias">
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl text-indigo-700 fill-current">
                        <path d="M75 50 c0-15-5-25-15-28 L25 35 c-3 1-5 4-5 7 v16 c0 3 2 6 5 7 l35 13 c10-3 15-13 15-28 Z" fill="#6366f1" />
                        <path d="M75 35 c8 5 12 11 12 15 s-4 10-12 15 Z" fill="#4f46e5" />
                        <path d="M30 65 l5 20 c1 3 4 5 7 5 h6 c3 0 5-2 4-5 l-8-20 Z" fill="#475569" />
                        <ellipse cx="75" cy="50" rx="4" ry="15" fill="#f43f5e" />
                        <circle cx="28" cy="46" r="3" fill="#ffffff" />
                      </svg>
                    </div>

                    {/* Bold heavy stacked slogans like mockup */}
                    <div className="mt-8 space-y-1.5 relative z-10 font-sans">
                      <p className="font-sans font-black text-indigo-950 text-xl tracking-tight uppercase leading-none">
                        How to Get Your First
                      </p>
                      <div className="inline-block bg-black text-white px-8 py-2 rounded-xl">
                        <span className="font-sans font-black text-2xl tracking-widest text-[#22c55e]">
                          1 MILLION
                        </span>
                      </div>
                      <p className="text-[10px] uppercase tracking-widest text-[#1a5c37] font-sans font-bold mt-1">
                        Subscribers • Followers • Organic Verified Traffic
                      </p>
                    </div>

                  </div>

                </div>

                {/* 4. Active Contact Gateways floating support toggles */}
                <div className="fixed bottom-4 left-4 z-50">
                  <a 
                    href="https://t.me/yourusername" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-full shadow-lg flex items-center justify-center space-x-1.5 transition-all text-xs font-bold hover:scale-105"
                  >
                    <span>✈ Telegram</span>
                  </a>
                </div>

                <div className="fixed bottom-4 right-4 z-50">
                  <a 
                    href="https://wa.me/8801750721835" 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-3 bg-[#22c55e] hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center space-x-1.5 transition-all text-xs font-bold hover:scale-105"
                  >
                    <span>💬 WhatsApp Support</span>
                  </a>
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
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
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
