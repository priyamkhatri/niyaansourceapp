import React from "react";
import { User, Role } from "../types";
import { Building2, LogOut, ShieldAlert, Award, Search, Users, Shield, Compass, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

interface HeaderProps {
  user: User | null;
  allUsers: User[];
  onImpersonate: (userId: string) => void;
  onLogout: () => void;
  currentTab: string;
  onChangeTab: (tab: string) => void;
}

export default function Header({ 
  user, 
  allUsers, 
  onImpersonate, 
  onLogout,
  currentTab,
  onChangeTab
}: HeaderProps) {
  // Group users by role for organized testing selection
  const suppliers = allUsers.filter(u => u.role === "SUPPLIER");
  const buyers = allUsers.filter(u => u.role === "BUYER");
  const admins = allUsers.filter(u => u.role === "ADMIN");

  return (
    <header className="divide-y divide-slate-100 border-b border-slate-100 bg-white sticky top-0 z-50">
      
      {/* Premium Impersonation Simulation Panel */}
      <div className="bg-brand-navy text-xs text-slate-300 py-3 px-6 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand-gold animate-pulse" />
            <span className="font-display font-bold tracking-widest text-[#D9AA52] text-[10px] uppercase">EXECUTIVE ROLE SIMULATION:</span>
            <span className="text-slate-300 text-[11px] font-sans font-medium">Select a virtual profile to switch dashboards:</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-display">Suppliers:</span>
              <select 
                className="bg-slate-900 border border-slate-800 text-slate-200 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-gold cursor-pointer max-w-[130px] font-sans transition-colors"
                value={user?.role === 'SUPPLIER' ? user.id : ""}
                onChange={(e) => e.target.value && onImpersonate(e.target.value)}
              >
                <option value="" disabled>--- Select ---</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Vendor)</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-display">Buyers:</span>
              <select 
                className="bg-slate-900 border border-slate-800 text-slate-200 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-gold cursor-pointer max-w-[130px] font-sans transition-colors"
                value={user?.role === 'BUYER' ? user.id : ""}
                onChange={(e) => e.target.value && onImpersonate(e.target.value)}
              >
                <option value="" disabled>--- Select ---</option>
                {buyers.map(b => (
                  <option key={b.id} value={b.id}>{b.name} (Buyer)</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider font-display">Admins:</span>
              <select 
                className="bg-slate-900 border border-slate-800 text-slate-200 text-[11px] rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-gold cursor-pointer max-w-[130px] font-sans transition-colors"
                value={user?.role === 'ADMIN' ? user.id : ""}
                onChange={(e) => e.target.value && onImpersonate(e.target.value)}
              >
                <option value="" disabled>--- Select ---</option>
                {admins.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => onImpersonate("guest")}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold cursor-pointer uppercase font-display tracking-widest transition-all ${
                !user 
                  ? "bg-brand-gold text-brand-navy shadow-inner" 
                  : "bg-slate-900 border border-slate-800 hover:bg-slate-800 text-brand-gold"
              }`}
            >
              Public Guest
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="px-6 py-4 max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Brand logo block following "Niyaan Executive Slate" */}
        <div 
          onClick={() => onChangeTab("landing")} 
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {/* Custom enclosure: White backgrounds with slate-100 borders, transitions on group-hover */}
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-100 group-hover:bg-brand-navy group-hover:text-brand-gold group-hover:border-brand-navy transition-all duration-300">
            <Building2 className="h-5 w-5 text-brand-navy group-hover:text-brand-gold transition-colors" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-xl tracking-tight text-brand-navy">Niyaan Source</span>
              <span className="inline-flex items-center rounded-full bg-brand-gold/10 px-2 py-0.5 text-[10px] font-bold text-brand-gold tracking-wider uppercase">MVP</span>
            </div>
            <p className="text-[10px] font-display text-brand-slate tracking-widest uppercase font-medium">Unified Vendor Assessment Portal</p>
          </div>
        </div>

        {/* Global Nav Tabs with sliding tab transition */}
        <nav className="hidden lg:flex items-center gap-2 text-sm">
          <button 
            onClick={() => onChangeTab("landing")}
            className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider font-display transition-colors cursor-pointer ${
              currentTab === "landing" ? "text-brand-navy" : "text-brand-slate hover:text-brand-navy"
            }`}
          >
            <span className="relative z-10">Dashboard</span>
            {currentTab === "landing" && (
              <motion.div 
                layoutId="tabUnderline" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
          
          <button 
            onClick={() => onChangeTab("suppliers")}
            className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider font-display transition-colors cursor-pointer ${
              currentTab === "suppliers" ? "text-brand-navy" : "text-brand-slate hover:text-brand-navy"
            }`}
          >
            <span className="relative z-10">Sourcing Director</span>
            {currentTab === "suppliers" && (
              <motion.div 
                layoutId="tabUnderline" 
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>

          {/* Contextual dynamic menus with unique premium styled layouts */}
          {user?.role === 'SUPPLIER' && (
            <button 
              onClick={() => onChangeTab("supplier-dashboard")}
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider font-display transition-colors cursor-pointer ${
                currentTab === "supplier-dashboard" ? "text-brand-navy" : "text-brand-slate hover:text-brand-navy"
              }`}
            >
              <span className="relative z-10 text-emerald-800">My Compliance Status</span>
              {currentTab === "supplier-dashboard" && (
                <motion.div 
                  layoutId="tabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          )}

          {user?.role === 'BUYER' && (
            <button 
              onClick={() => onChangeTab("buyer-dashboard")}
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider font-display transition-colors cursor-pointer ${
                currentTab === "buyer-dashboard" ? "text-brand-navy" : "text-brand-slate hover:text-brand-navy"
              }`}
            >
              <span className="relative z-10 text-brand-navy">Buyer Workspace</span>
              {currentTab === "buyer-dashboard" && (
                <motion.div 
                  layoutId="tabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-gold rounded-full"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          )}

          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => onChangeTab("admin-dashboard")}
              className={`relative px-4 py-2 text-xs font-bold uppercase tracking-wider font-display transition-colors cursor-pointer ${
                currentTab === "admin-dashboard" ? "text-brand-navy" : "text-brand-slate hover:text-brand-navy"
              }`}
            >
              <span className="relative z-10 text-rose-800">Compliance Control</span>
              {currentTab === "admin-dashboard" && (
                <motion.div 
                  layoutId="tabUnderline" 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </button>
          )}
        </nav>

        {/* Auth status block */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-brand-navy font-display">{user.name}</p>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-display ${
                    user.role === 'ADMIN' ? 'bg-rose-50 text-rose-700' :
                    user.role === 'BUYER' ? 'bg-brand-navy/10 text-brand-navy' :
                    'bg-emerald-50 text-emerald-700'
                  }`}>
                    {user.role}
                  </span>
                  {user.companyName && (
                    <span className="text-[10px] text-brand-slate font-medium truncate max-w-[100px] font-sans">
                      @{user.companyName}
                    </span>
                  )}
                </div>
              </div>

              {/* Avatar placeholder matching colors */}
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-display font-medium text-white text-sm uppercase shadow-sm ${
                user.role === 'ADMIN' ? 'bg-rose-600' :
                user.role === 'BUYER' ? 'bg-brand-navy' :
                'bg-emerald-600'
              }`}>
                {user.name.substring(0, 2)}
              </div>

              <button 
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-500 hover:text-brand-gold cursor-pointer transition-colors"
                title="Sign out of Niyaan Source"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onChangeTab("auth")}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-brand-gold text-brand-navy px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-brand-gold/90 hover:scale-[1.03] transition-all shadow-md active:scale-95"
              >
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
