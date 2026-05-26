import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  SupplierAssessment, 
  ResponseValue, 
  Question, 
  ASSESSMENT_CATEGORIES, 
  QUESTION_BANK, 
  Badge, 
  Role 
} from "./types";
import { 
  getCurrentUser, 
  fetchUsers, 
  fetchAssessments, 
  registerUser, 
  loginUser, 
  logoutUser, 
  impersonateUser, 
  saveAssessment, 
  submitReview, 
  generateAiSummaries 
} from "./api";
import Header from "./components/Header";
import { 
  Building2, 
  DollarSign, 
  Factory, 
  CheckSquare, 
  Lightbulb, 
  ShieldAlert, 
  Leaf, 
  Lock, 
  Award, 
  Search, 
  Users, 
  Shield, 
  ArrowRight, 
  ChevronRight, 
  Plus, 
  Check, 
  X, 
  AlertTriangle, 
  FileText, 
  ChevronDown, 
  Download, 
  Send, 
  Star, 
  CheckCircle, 
  TrendingUp, 
  BarChart2, 
  Briefcase, 
  Filter, 
  Globe, 
  ExternalLink, 
  AlertCircle, 
  FileCheck, 
  RefreshCw, 
  HelpCircle,
  ThumbsUp,
  Inbox
} from "lucide-react";

export default function App() {
  // Navigation & Simulation State
  const [currentTab, setCurrentTab] = useState<string>("landing"); // "landing" | "suppliers" | "supplier-dashboard" | "buyer-dashboard" | "admin-dashboard" | "auth" | "about"
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [assessments, setAssessments] = useState<SupplierAssessment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authentication Fields (Explicit sign up option)
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authName, setAuthName] = useState<string>("");
  const [authRole, setAuthRole] = useState<Role>("SUPPLIER");
  const [authCompanyName, setAuthCompanyName] = useState<string>("");
  const [authCategory, setAuthCategory] = useState<string>("Electronic Components");
  const [authLocation, setAuthLocation] = useState<string>("USA");
  const [authError, setAuthError] = useState<string>("");

  // Sourcing Directory State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [badgeFilter, setBadgeFilter] = useState<string>("ALL");
  const [compareSuppliersList, setCompareSuppliersList] = useState<SupplierAssessment[]>([]);
  const [selectedSupplierProfileId, setSelectedSupplierProfileId] = useState<string | null>(null);

  // Supplier Assessment Flow State
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("profile");
  const [activeResponses, setActiveResponses] = useState<ResponseValue[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [qId: string]: number }>({});
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isSubmittingSheet, setIsSubmittingSheet] = useState<boolean>(false);
  const [assessmentSuccessBanner, setAssessmentSuccessBanner] = useState<string | null>(null);

  // Risk Intelligence Action States
  const [isGeneratingRiskSummary, setIsGeneratingRiskSummary] = useState<boolean>(false);
  const [riskSuccessBanner, setRiskSuccessBanner] = useState<string | null>(null);

  // Buyer Invitation & Feedback Simulators
  const [inviteEmail, setInviteEmail] = useState<string>("");
  const [inviteCompanyName, setInviteCompanyName] = useState<string>("");
  const [bulkInviteModalOpen, setBulkInviteModalOpen] = useState<boolean>(false);
  const [simulatedInvites, setSimulatedInvites] = useState<Array<{ email: string; company: string; sentAt: string }>>([]);
  const [buyerFeedbackText, setBuyerFeedbackText] = useState<string>("");
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Admin Review Flow State
  const [adminFeedbackText, setAdminFeedbackText] = useState<string>("");
  const [selectedAdminReviewId, setSelectedAdminReviewId] = useState<string | null>(null);

  // Load backend configurations
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const uRes = await getCurrentUser();
        setUser(uRes);

        const usersList = await fetchUsers();
        setAllUsers(usersList);

        const assessList = await fetchAssessments();
        setAssessments(assessList);

        // Prepopulate responses if current user is active Supplier
        if (uRes && uRes.role === 'SUPPLIER') {
          const matchedAssess = assessList.find(a => a.userId === uRes.id);
          if (matchedAssess) {
            setActiveResponses(matchedAssess.responses);
          }
        }
      } catch (err) {
        console.error("Initialization load failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Update questionnaire draft storage when user switch happens
  useEffect(() => {
    if (user && user.role === 'SUPPLIER') {
      const activeAssess = assessments.find(a => a.userId === user.id);
      if (activeAssess) {
        setActiveResponses(activeAssess.responses);
      } else {
        setActiveResponses([]);
      }
    }
  }, [user, assessments]);

  // Handle immediate simulation/impersonation role switches
  const handleRoleImpersonate = async (targetId: string) => {
    if (targetId === "guest") {
      await logoutUser();
      setUser(null);
      setCurrentTab("landing");
      return;
    }
    const updated = await impersonateUser(targetId);
    if (updated) {
      setUser(updated);
      setSuccessToast(`Impersonated ${updated.name} (${updated.role})`);
      setTimeout(() => setSuccessToast(null), 3000);

      // Auto route to appropriate functional dashboard
      if (updated.role === 'SUPPLIER') {
        setCurrentTab("supplier-dashboard");
      } else if (updated.role === 'BUYER') {
        setCurrentTab("buyer-dashboard");
      } else if (updated.role === 'ADMIN') {
        setCurrentTab("admin-dashboard");
      }
    }
  };

  // Perform self-assessment save draft action
  const handleSaveAssessmentDraft = async (submit: boolean = false) => {
    if (!user) return;
    if (submit) {
      setIsSubmittingSheet(true);
    } else {
      setIsSavingDraft(true);
    }

    try {
      const res = await saveAssessment(user.id, activeResponses, submit);
      if (res.success && res.assessment) {
        // Update local assessments state
        setAssessments(prev => prev.map(a => a.userId === user.id ? res.assessment! : a));
        
        if (submit) {
          setAssessmentSuccessBanner("Successfully submitted your self-assessment to the Niyaan Admin review queue!");
          // Trigger AI risk score calculation and auto-generation immediately on submit!
          await handleAiRiskSynthesis(res.assessment.id);
        } else {
          setAssessmentSuccessBanner("Draft response answers saved successfully!");
        }
        
        setTimeout(() => setAssessmentSuccessBanner(null), 6000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingDraft(false);
      setIsSubmittingSheet(false);
    }
  };

  // Trigger Gemini API summary request for an assessment ID
  const handleAiRiskSynthesis = async (assessId: string) => {
    setIsGeneratingRiskSummary(true);
    try {
      const response = await generateAiSummaries(assessId);
      if (response.success && response.summaries) {
        // Update local assessments list with new generated summaries
        setAssessments(prev => prev.map(a => {
          if (a.id === assessId) {
            return {
              ...a,
              riskSummaries: response.summaries!
            };
          }
          return a;
        }));
        setRiskSuccessBanner(
          response.aiGenerated 
            ? "⚡ Core Intelligence generated premium AI Risk profiles with Gemini." 
            : "Analytical scoring engines formulated baseline corporate threat scores."
        );
        setTimeout(() => setRiskSuccessBanner(null), 7000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingRiskSummary(false);
    }
  };

  // User auth registration procedure
  const handleUserRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail || !authName) {
      setAuthError("Email and Name are raw requirements.");
      return;
    }
    const payload = {
      email: authEmail,
      name: authName,
      role: authRole,
      companyName: authCompanyName || authName,
      category: authCategory,
      location: authLocation
    };

    const res = await registerUser(payload);
    if (res.success && res.user) {
      setUser(res.user);
      // Reload users & assessments registry
      const uL = await fetchUsers();
      setAllUsers(uL);
      const aL = await fetchAssessments();
      setAssessments(aL);

      setSuccessToast(`Welcome to Niyaan Source! Registered successfully.`);
      setTimeout(() => setSuccessToast(null), 3000);

      if (res.user.role === 'SUPPLIER') {
        setCurrentTab("supplier-dashboard");
      } else if (res.user.role === 'BUYER') {
        setCurrentTab("buyer-dashboard");
      } else {
        setCurrentTab("admin-dashboard");
      }
    } else {
      setAuthError(res.error || "A processing error occurred.");
    }
  };

  // User auth login procedure
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!authEmail) {
      setAuthError("Email address is required.");
      return;
    }
    const res = await loginUser(authEmail);
    if (res.success && res.user) {
      setUser(res.user);
      setSuccessToast(`Logged in successfully as ${res.user.name}.`);
      setTimeout(() => setSuccessToast(null), 4000);

      if (res.user.role === 'SUPPLIER') {
        setCurrentTab("supplier-dashboard");
      } else if (res.user.role === 'BUYER') {
        setCurrentTab("buyer-dashboard");
      } else {
        setCurrentTab("admin-dashboard");
      }
    } else {
      setAuthError(res.error || "No registered matching email address found.");
    }
  };

  const handleSignOut = async () => {
    await logoutUser();
    setUser(null);
    setCurrentTab("landing");
    setSuccessToast("Signed out successfully.");
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Toggle checklist & answer responses
  const updateResponseValue = (qId: string, val: string | boolean | number, fileName?: string) => {
    setActiveResponses(prev => {
      const filtered = prev.filter(r => r.questionId !== qId);
      return [...filtered, { questionId: qId, value: val, fileName }];
    });
  };

  // Simulate file upload with incremental progress bar loading!
  const triggerFakeUpload = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate progress bar
    setUploadProgress(prev => ({ ...prev, [qId]: 10 }));
    let progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[qId] || 10;
        if (current >= 100) {
          clearInterval(progressInterval);
          // Store answering mapping
          updateResponseValue(qId, file.name, file.name);
          return prev;
        }
        return { ...prev, [qId]: current + 30 };
      });
    }, 200);
  };

  // Toggle side by side supplier criteria comparisons list
  const toggleComparison = (assess: SupplierAssessment) => {
    setCompareSuppliersList(prev => {
      const active = prev.find(p => p.id === assess.id);
      if (active) {
        return prev.filter(p => p.id !== assess.id);
      }
      if (prev.length >= 3) {
        alert("Sourcing Workspace permits comparison of up to 3 suppliers maximum side-by-side.");
        return prev;
      }
      return [...prev, assess];
    });
  };

  // Handle invitation dispatcher simulation
  const handleSendSupplierInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteCompanyName) {
      alert("Please provide the vendor company name and target email address.");
      return;
    }
    const newInvite = {
      email: inviteEmail,
      company: inviteCompanyName,
      sentAt: new Date().toLocaleTimeString()
    };
    setSimulatedInvites(prev => [newInvite, ...prev]);
    setInviteEmail("");
    setInviteCompanyName("");
    
    setSuccessToast(`✉️ Invitation sent successfully to ${inviteCompanyName}!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Search filter and calculations for Directory
  const matchingAssessmentsList = assessments.filter(assess => {
    const assocVendor = allUsers.find(u => u.id === assess.userId && u.role === 'SUPPLIER');
    
    // Category check
    if (categoryFilter !== 'ALL') {
      if (!assocVendor || assocVendor.category !== categoryFilter) return false;
    }

    // Badge check
    if (badgeFilter !== 'ALL') {
      if (assess.badge !== badgeFilter) return false;
    }

    // Free text match
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase();
      const matchComp = assess.companyName.toLowerCase().includes(term);
      const matchDesc = assocVendor?.companyDescription?.toLowerCase().includes(term) || false;
      const matchLoc = assocVendor?.location?.toLowerCase().includes(term) || false;
      const matchCat = assocVendor?.category?.toLowerCase().includes(term) || false;
      return matchComp || matchDesc || matchLoc || matchCat;
    }

    return true;
  });

  // Calculate stats for landing overview
  const totalVendorsCount = allUsers.filter(u => u.role === "SUPPLIER").length;
  const certifiedVendorsCount = assessments.filter(a => a.status === 'APPROVED' && a.badge).length;
  const goldCount = assessments.filter(a => a.badge === 'GOLD').length;
  const silverCount = assessments.filter(a => a.badge === 'SILVER').length;
  const bronzeCount = assessments.filter(a => a.badge === 'BRONZE').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Simulation status notice toast */}
      {successToast && (
        <div className="fixed bottom-5 right-5 z-50 transform animate-bounce transition-all">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-lg px-4 py-3 shadow-2xl flex items-center gap-2.5">
            <div className="p-1 rounded bg-emerald-500 text-slate-900">
              <Check className="h-4 w-4 stroke-[3]" />
            </div>
            <p className="text-xs font-semibold tracking-tight">{successToast}</p>
          </div>
        </div>
      )}

      {/* Primary Global Navigation Header */}
      <Header 
        user={user} 
        allUsers={allUsers} 
        onImpersonate={handleRoleImpersonate}
        onLogout={handleSignOut}
        currentTab={currentTab}
        onChangeTab={setCurrentTab}
      />

      {/* Main Content Areas based on tabs */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:px-8 focus:outline-none">

        {/* =======================================================
            TAB: LANDING OVERVIEW PAGE (GUEST & ALL ROLES ENTRY)
           ======================================================= */}
        {currentTab === "landing" && (
          <div className="space-y-12 py-4">
            
            {/* Elegant Hero Banner inside Executive Rounded Wrapper */}
            <div className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-brand-navy text-white py-14 md:py-20 px-8 md:px-16 shadow-2xl border border-brand-navy/40">
              {/* Soft background glow modifiers */}
              <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-slate/10 blur-[130px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-1/2 h-full bg-brand-gold/5 blur-[130px] rounded-full pointer-events-none" />
              <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
              
              <div className="max-w-3xl space-y-6 relative z-10">
                {/* Premium Gold Accent Pill */}
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest border border-brand-gold/20">
                  <Shield className="h-3.5 w-3.5 text-brand-gold" /> SECURE EXECUTIVE SUPPLY COMPLIANCE
                </span>
                
                <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight leading-tight text-white">
                  Engineering Vendor Trust.<br/>
                  <span className="text-brand-gold">Sourcing Excellence.</span>
                </h1>
                
                <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-light">
                  Niyaan Source is the premium digital framework bridging procurement transparency. Vendors execute a rigorous multi-pillar compliance audit, earning elite audited ratings. Buyers instantly benchmark structural hazards across our 5 dynamic threat indices.
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <button 
                    onClick={() => {
                      if (!user) {
                        setCurrentTab("auth");
                      } else if (user.role === 'SUPPLIER') {
                        setCurrentTab("supplier-dashboard");
                      } else if (user.role === 'BUYER') {
                        setCurrentTab("buyer-dashboard");
                      } else {
                        setCurrentTab("admin-dashboard");
                      }
                    }}
                    className="cursor-pointer bg-brand-gold text-brand-navy hover:bg-brand-gold/90 text-xs font-bold uppercase tracking-widest px-7 py-3.5 rounded-xl shadow-xl transition-all hover:scale-105 duration-200 flex items-center gap-2 font-display"
                  >
                    <span>
                      {user 
                        ? `Acknowledge Dashboard (${user.role})` 
                        : "Start Supplier Assessment"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-brand-navy" />
                  </button>

                  <button 
                    onClick={() => setCurrentTab("suppliers")}
                    className="cursor-pointer bg-slate-900/60 hover:bg-slate-900 hover:border-brand-gold/30 text-slate-200 text-xs font-bold uppercase tracking-widest px-7 py-3.5 rounded-xl border border-slate-800 transition-all font-display"
                  >
                    Explore Sourced Directory
                  </button>
                  
                  <span className="text-slate-400 text-xs italic font-sans font-medium ml-2 md:inline block">
                    No credit card required. Pure verified audits.
                  </span>
                </div>
              </div>

              {/* Float Visual Metrics */}
              <div className="mt-10 pt-10 border-t border-slate-800/60 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                <div>
                  <p className="text-3xl md:text-4xl font-display font-extrabold text-white">{totalVendorsCount}</p>
                  <p className="text-xs text-brand-slate font-display font-semibold uppercase tracking-wider mt-1">Registered Suppliers</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-display font-extrabold text-[#D9AA52]">{certifiedVendorsCount}</p>
                  <p className="text-xs text-brand-slate font-display font-semibold uppercase tracking-wider mt-1">Vetted & Rated</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-display font-extrabold text-white">{goldCount + silverCount}</p>
                  <p className="text-xs text-brand-slate font-display font-semibold uppercase tracking-wider mt-1">Gold & Silver Ratings</p>
                </div>
                <div>
                  <p className="text-3xl md:text-4xl font-display font-extrabold text-brand-gold">75%</p>
                  <p className="text-xs text-brand-slate font-display font-semibold uppercase tracking-wider mt-1">Objective Yes/No</p>
                </div>
              </div>
            </div>

            {/* Quick Access Helper Alert for Simulating Roles */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-1.5 leading-none">
                  <Users className="h-4 w-4" /> Easy Role Mimicry Suite Active
                </h3>
                <p className="text-xs text-blue-700 mt-1">
                  Niyaan Source is a full-stack MVP. Click any role at the top of the window to instantly simulate the onboarding of <strong>Suppliers</strong>, the procurement flow of <strong>Buyers</strong>, or validation mechanisms of the portal <strong>Admin</strong>.
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleRoleImpersonate("vendor_1")} 
                  className="bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded hover:bg-blue-100 cursor-pointer"
                >
                  Test Gold Vendor
                </button>
                <button 
                  onClick={() => handleRoleImpersonate("buyer_1")} 
                  className="bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded hover:bg-blue-100 cursor-pointer"
                >
                  Test Sourcing Buyer
                </button>
              </div>
            </div>

            {/* Platform Strategy Features Bento Grid */}
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-3xl font-display font-bold tracking-tight text-brand-navy">Integrated Compliance Ecosystem</h2>
                <p className="text-xs font-sans text-brand-slate font-medium leading-relaxed">Robust pillars supporting industrial supply stability, real-time feedback, and elite manufacturing self-assessments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                
                {/* Bento Card 1: 8-Dimension Audits */}
                <motion.div 
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group bg-white rounded-3xl border border-slate-100/80 p-6 space-y-4 shadow-sm executive-card-shadow cursor-pointer"
                >
                  {/* Custom Enclosure: White back, bordered slate-100, transitions to Brand Gold background */}
                  <div className="p-3 bg-white border border-slate-100 text-brand-navy rounded-xl inline-flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-navy group-hover:border-brand-gold transition-all duration-300 shadow-sm">
                    <CheckSquare className="h-6 w-6 text-brand-navy group-hover:text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-brand-navy text-lg">8-Dimension Assessment</h3>
                    <p className="text-[12px] font-sans text-slate-500 font-medium leading-relaxed mt-1.5">
                      Sellers complete exhaustive surveys covering Financial Liquidity, ISO Certifications, Cybersecurity, Sustainability, and R&D capability weightings with active draft state recovery.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] font-display font-bold tracking-wider text-brand-navy inline-flex items-center gap-1 group-hover:text-brand-gold transition-colors uppercase">
                      75% Objective Verification <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>

                {/* Bento Card 2: AI Risk Intelligence */}
                <motion.div 
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group bg-white rounded-3xl border border-slate-100/80 p-6 space-y-4 shadow-sm executive-card-shadow cursor-pointer"
                >
                  <div className="p-3 bg-white border border-slate-100 text-brand-navy rounded-xl inline-flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-navy group-hover:border-brand-gold transition-all duration-300 shadow-sm">
                    <TrendingUp className="h-6 w-6 text-brand-navy group-hover:text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-brand-navy text-lg">Multi-Pillar Risk Scoring</h3>
                    <p className="text-[12px] font-sans text-slate-500 font-medium leading-relaxed mt-1.5">
                      Translates responses into transparent risk thresholds: <strong>Price</strong>, <strong>Logistics</strong>, <strong>Technical</strong>, <strong>Creative</strong>, and <strong>Quality</strong> metrics without simple averages.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] font-display font-bold tracking-wider text-brand-navy inline-flex items-center gap-1 group-hover:text-brand-gold transition-colors uppercase">
                      Powered by Gemini Intelligence <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>

                {/* Bento Card 3: Discovery & Compare */}
                <motion.div 
                  whileHover={{ y: -8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="group bg-white rounded-3xl border border-slate-100/80 p-6 space-y-4 shadow-sm executive-card-shadow cursor-pointer"
                >
                  <div className="p-3 bg-white border border-slate-100 text-brand-navy rounded-xl inline-flex items-center justify-center group-hover:bg-brand-gold group-hover:text-brand-navy group-hover:border-brand-gold transition-all duration-300 shadow-sm">
                    <BarChart2 className="h-6 w-6 text-brand-navy group-hover:text-brand-navy" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-brand-navy text-lg">Benchmarking & Selection</h3>
                    <p className="text-[12px] font-sans text-slate-500 font-medium leading-relaxed mt-1.5">
                      Compare verified suppliers side-by-side on overall compliance rating, digital badge tier, exact lead days, and physical defect PPM scores instantly.
                    </p>
                  </div>
                  <div className="pt-2">
                    <span className="text-[11px] font-display font-bold tracking-wider text-brand-navy inline-flex items-center gap-1 group-hover:text-brand-gold transition-colors uppercase">
                      Compare Side-by-Side <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Featured Suppliers Highlights */}
            <div className="space-y-6 bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-brand-navy">Featured Certified Suppliers</h3>
                  <p className="text-xs text-brand-slate font-sans font-medium">Industry-vetted entities holding verified premium tags on Niyaan Source.</p>
                </div>
                <button 
                  onClick={() => setCurrentTab("suppliers")} 
                  className="text-xs font-display font-bold tracking-wider uppercase text-brand-navy hover:text-brand-gold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  View Sourcing Directory &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {assessments.slice(0, 3).map(assess => {
                  const sUser = allUsers.find(u => u.id === assess.userId && u.role === 'SUPPLIER');
                  return (
                    <motion.div 
                      key={assess.id} 
                      whileHover={{ y: -6 }}
                      className="bg-white rounded-[1.5rem] border border-slate-100 p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-[#a3792e] bg-brand-gold/10 px-2.5 py-1 rounded-full">
                            {sUser?.category || "Industrial Sourcing"}
                          </span>

                          {assess.badge && (
                            <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                              assess.badge === 'GOLD' ? 'bg-brand-gold/10 text-[#96712b] border-[#D9AA52]/40' :
                              assess.badge === 'SILVER' ? 'bg-slate-100 text-slate-700 border-slate-300' :
                              'bg-amber-950/10 text-amber-800 border-amber-950/20'
                            }`}>
                              ★ {assess.badge} TRUSTED
                            </span>
                          )}
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-brand-navy text-base">{assess.companyName}</h4>
                          <p className="text-xs text-slate-500 font-sans line-clamp-2 mt-1.5 leading-relaxed">
                            {sUser?.companyDescription || "Reliable manufacturing materials and robust compliance infrastructure provider."}
                          </p>
                          <div className="flex items-center gap-1.5 mt-3 text-[11px] text-brand-slate font-sans">
                            <Globe className="h-3.5 w-3.5" /> {sUser?.location || "Global Supplier"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-sans">
                        <div className="text-slate-500 font-medium">
                          Compliance Score: <span className="font-display font-bold text-brand-navy text-sm">{assess.overallScore || 0}/100</span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedSupplierProfileId(assess.userId);
                            setCurrentTab("suppliers");
                          }}
                          className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-navy hover:text-brand-gold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          Show Audit Profile &rarr;
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        )}


        {/* =======================================================
            TAB: SOURCING DIRECTORY (PUBLIC / BUYER SEARCH) 
           ======================================================= */}
        {currentTab === "suppliers" && (
          <div className="space-y-6">
            
            {/* Page header and back to lander */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-brand-navy tracking-tight">Verified Sourcing Directory</h1>
                <p className="text-xs text-brand-slate font-sans font-medium">Explore vetted vendor profiles, compare core risk metrics, and assess complete audit sheets.</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentTab("landing")}
                  className="bg-slate-50 text-[10px] items-center text-brand-navy border border-slate-200/50 font-display font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm hover:scale-105 hover:bg-slate-100"
                >
                  &larr; Back to Dashboard
                </button>
              </div>
            </div>

            {/* Comparative Benchmarking Table Overlay (If 1 or more checked) */}
            {compareSuppliersList.length > 0 && (
              <div className="bg-brand-navy border border-brand-gold/20 text-white rounded-3xl p-6 shadow-2xl space-y-4 transition-all executive-glow">
                <div className="flex justify-between items-center pb-2 border-b border-brand-slate/40">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-brand-gold" />
                    <h3 className="font-display font-bold text-xs tracking-wider uppercase text-slate-100">Virtual Side-by-Side Sourcing Benchmark ({compareSuppliersList.length}/3)</h3>
                  </div>
                  <button 
                    onClick={() => setCompareSuppliersList([])}
                    className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-gold hover:text-brand-gold/80 underline cursor-pointer gap-1"
                  >
                    Clear Slate
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {compareSuppliersList.map(item => {
                    const mappedUser = allUsers.find(u => u.id === item.userId);
                    return (
                      <div key={item.id} className="bg-slate-900/60 rounded-2xl p-4 border border-brand-gold/10 text-xs space-y-3 relative">
                        <button 
                          onClick={() => toggleComparison(item)}
                          className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-900/80 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        
                        <div>
                          <p className="font-display font-bold text-[14px] text-white tracking-wide truncate pr-6">{item.companyName}</p>
                          <p className="text-[10px] text-brand-slate font-sans mt-0.5">{mappedUser?.category || "Electronic Components"} • {mappedUser?.location}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 bg-slate-950/40 p-3 rounded-xl text-[11px] font-sans">
                          <div>
                            <span className="text-brand-slate text-[9px] font-bold uppercase tracking-wider block">Total Score</span>
                            <p className="font-display font-bold text-base text-[#D9AA52]">{item.overallScore}/100</p>
                          </div>
                          <div>
                            <span className="text-brand-slate text-[9px] font-bold uppercase tracking-wider block">Badge Tier</span>
                            <p className="font-display font-extrabold text-[#D9AA52] tracking-widest text-xs">{item.badge || "NONE"}</p>
                          </div>
                          <div className="pt-1">
                            <span className="text-brand-slate text-[9px] font-bold uppercase tracking-wider block">Audit Status</span>
                            <p className="text-slate-300 font-medium">{item.status}</p>
                          </div>
                          <div className="pt-1">
                            <span className="text-brand-slate text-[9px] font-bold uppercase tracking-wider block">Progress</span>
                            <p className="text-slate-300 font-bold">{item.progress}%</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <p className="font-display font-bold text-[9px] text-[#D9AA52] uppercase tracking-wider">Pillar Threat Analytics:</p>
                          <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[9px]">
                            <div className="p-1 rounded bg-slate-950/60 border border-slate-900">
                              <span className="text-brand-slate block text-[8px]">Price</span>
                              <span className={`font-semibold ${item.riskScores.priceRisk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.riskScores.priceRisk}
                              </span>
                            </div>
                            <div className="p-1 rounded bg-slate-950/60 border border-slate-900">
                              <span className="text-brand-slate block text-[8px]">Logistics</span>
                              <span className={`font-semibold ${item.riskScores.supplyRisk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.riskScores.supplyRisk}
                              </span>
                            </div>
                            <div className="p-1 rounded bg-slate-950/60 border border-slate-900">
                              <span className="text-brand-slate block text-[8px]">Technical</span>
                              <span className={`font-semibold ${item.riskScores.technicalRisk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.riskScores.technicalRisk}
                              </span>
                            </div>
                            <div className="p-1 rounded bg-slate-950/60 border border-slate-900">
                              <span className="text-brand-slate block text-[8px]">Creative</span>
                              <span className={`font-semibold ${item.riskScores.creativeRisk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.riskScores.creativeRisk}
                              </span>
                            </div>
                            <div className="p-1 rounded bg-slate-950/60 border border-slate-900">
                              <span className="text-brand-slate block text-[8px]">Quality</span>
                              <span className={`font-semibold ${item.riskScores.qualityRisk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                {item.riskScores.qualityRisk}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Expanded Sourcing Profile modal */}
            {selectedSupplierProfileId && (() => {
              const profileUser = allUsers.find(u => u.id === selectedSupplierProfileId);
              const profileAssess = assessments.find(a => a.userId === selectedSupplierProfileId);
              
              if (!profileUser) return null;

              return (
                <div className="bg-brand-navy text-white rounded-[2.5rem] p-6 md:p-8 space-y-6 border border-brand-gold/15 shadow-2xl relative executive-glow">
                  <button 
                    onClick={() => setSelectedSupplierProfileId(null)}
                    className="absolute top-5 right-5 p-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-brand-gold rounded-full cursor-pointer transition-colors"
                    title="Dismiss Profile view"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-slate/20">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-white shrink-0 border border-brand-gold/30 text-brand-navy flex items-center justify-center font-display font-bold text-2xl uppercase rounded-2xl shadow-sm">
                        {profileUser.companyName?.substring(0, 2) || "V"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-xl md:text-2xl font-display font-bold tracking-tight text-white">{profileUser.companyName}</h2>
                          {profileAssess?.badge && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/15 text-[#D9AA52] border border-brand-gold/30 text-[9px] font-display font-extrabold tracking-wider uppercase font-sans">
                              ★ {profileAssess.badge} Verified
                            </span>
                          )}
                        </div>
                        <p className="text-brand-slate text-xs mt-1 font-sans font-medium flex items-center gap-2">
                          <Globe className="h-3.5 w-3.5 text-brand-gold" /> Location: {profileUser.location || "USA"} • Category: {profileUser.category || "Supplier"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-slate-900/60 border border-brand-gold/10 px-4.5 py-3 rounded-2xl text-center min-w-[100px]">
                        <span className="text-[9px] uppercase font-bold text-brand-slate tracking-wider block">Total Score</span>
                        <p className="text-2xl font-sans font-black text-[#D9AA52]">{profileAssess?.overallScore || 0}<span className="text-xs text-brand-slate">/100</span></p>
                      </div>
                      <div className="bg-slate-900/60 border border-brand-gold/10 px-4.5 py-3 rounded-2xl text-center min-w-[100px]">
                        <span className="text-[9px] uppercase font-bold text-brand-slate tracking-wider block">Audit Status</span>
                        <p className="text-xs font-display font-bold text-slate-200 mt-1 uppercase tracking-wider">{profileAssess?.status || "NOT SUBMITTED"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left: General Assessment overview */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-[10px] font-display font-bold text-brand-gold uppercase tracking-widest">Company Bio</h3>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans mt-1">
                          {profileUser.companyDescription || "No detailed descriptive statement provided. Registered materials supplier on Niyaan Source."}
                        </p>
                        <p className="text-xs text-brand-gold font-sans font-semibold pt-1">
                          <a href={profileUser.companyWebsite || "#"} target="_blank" rel="noreferrer" className="underline inline-flex items-center gap-1 hover:text-white transition-colors">
                            <ExternalLink className="h-3 w-3" /> Visit Company Website
                          </a>
                        </p>
                      </div>

                      <div className="space-y-4 pt-4 border-t border-brand-slate/20">
                        <h3 className="text-[10px] font-display font-bold text-brand-gold uppercase tracking-widest">Audited Certifications</h3>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-2.5 p-3 bg-slate-900/40 rounded-xl border border-brand-gold/10">
                            <Award className="h-4 w-4 text-brand-gold shrink-0" />
                            <div>
                              <p className="font-display font-bold text-slate-200">ISO 9001 System Standard</p>
                              <p className="text-[10px] text-brand-slate font-sans mt-0.5">Verified factory system audit logs</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 p-3 bg-slate-900/40 rounded-xl border border-brand-gold/10">
                            <Shield className="h-4 w-4 text-brand-gold shrink-0" />
                            <div>
                              <p className="font-display font-bold text-slate-200">Scope 1 & 2 Carbon Tracking</p>
                              <p className="text-[10px] text-brand-slate font-sans mt-0.5">Verified ESG compliance files</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Technical Pillar Risk Analysis */}
                    <div className="lg:col-span-8 space-y-6 bg-slate-950/40 p-6 rounded-2xl border border-brand-gold/10">
                      <div className="flex items-center justify-between pb-3 border-b border-brand-slate/20">
                        <h3 className="text-[10px] font-display font-bold text-brand-gold uppercase tracking-widest">Verifiable Threat Risk Assessment</h3>
                        <span className="text-[9px] font-mono text-brand-slate tracking-widest uppercase">Analytical Synthesis</span>
                      </div>

                      {profileAssess ? (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          
                          {/* Price Risk summary card */}
                          <div className="space-y-3 bg-[#0d2840]/40 p-3 rounded-xl border border-brand-gold/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-sans font-bold text-slate-200">Price Risk</span>
                              <span className={`risk-badge px-1.5 py-0.5 text-[9px] rounded-lg font-bold uppercase ${
                                profileAssess.riskScores.priceRisk > 60 ? 'bg-rose-950/80 text-rose-400 border border-rose-500/20' :
                                profileAssess.riskScores.priceRisk > 30 ? 'bg-amber-950/80 text-[#D9AA52] border border-brand-gold/20' :
                                'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {profileAssess.riskScores.priceRisk}% Risk
                              </span>
                            </div>
                            <p className="text-slate-300 text-[10px] leading-relaxed italic font-serif">
                              "{profileAssess.riskSummaries.priceRiskSummary}"
                            </p>
                          </div>

                          {/* Supply Risk Card */}
                          <div className="space-y-3 bg-[#0d2840]/40 p-3 rounded-xl border border-brand-gold/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-sans font-bold text-slate-200">Logistics Risk</span>
                              <span className={`risk-badge px-1.5 py-0.5 text-[9px] rounded-lg font-bold uppercase ${
                                profileAssess.riskScores.supplyRisk > 60 ? 'bg-rose-950/80 text-rose-400 border border-rose-500/20' :
                                profileAssess.riskScores.supplyRisk > 30 ? 'bg-amber-950/80 text-[#D9AA52] border border-brand-gold/20' :
                                'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {profileAssess.riskScores.supplyRisk}% Risk
                              </span>
                            </div>
                            <p className="text-slate-300 text-[10px] leading-relaxed italic font-serif">
                              "{profileAssess.riskSummaries.supplyRiskSummary}"
                            </p>
                          </div>

                          {/* Technical Risk Card */}
                          <div className="space-y-3 bg-[#0d2840]/40 p-3 rounded-xl border border-brand-gold/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-sans font-bold text-slate-200">Technical Risk</span>
                              <span className={`risk-badge px-1.5 py-0.5 text-[9px] rounded-lg font-bold uppercase ${
                                profileAssess.riskScores.technicalRisk > 60 ? 'bg-rose-950/80 text-rose-400 border border-rose-500/20' :
                                profileAssess.riskScores.technicalRisk > 30 ? 'bg-amber-950/80 text-[#D9AA52] border border-brand-gold/20' :
                                'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {profileAssess.riskScores.technicalRisk}% Risk
                              </span>
                            </div>
                            <p className="text-slate-300 text-[10px] leading-relaxed italic font-serif">
                              "{profileAssess.riskSummaries.technicalRiskSummary}"
                            </p>
                          </div>

                          {/* Creative Risk Card */}
                          <div className="space-y-3 bg-[#0d2840]/40 p-3 rounded-xl border border-brand-gold/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-sans font-bold text-slate-200">Creative Risk</span>
                              <span className={`risk-badge px-1.5 py-0.5 text-[9px] rounded-lg font-bold uppercase ${
                                profileAssess.riskScores.creativeRisk > 60 ? 'bg-rose-950/80 text-rose-400 border border-rose-500/20' :
                                profileAssess.riskScores.creativeRisk > 30 ? 'bg-amber-950/80 text-[#D9AA52] border border-brand-gold/20' :
                                'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {profileAssess.riskScores.creativeRisk}% Risk
                              </span>
                            </div>
                            <p className="text-slate-300 text-[10px] leading-relaxed italic font-serif">
                              "{profileAssess.riskSummaries.creativeRiskSummary}"
                            </p>
                          </div>

                          {/* Quality risk card */}
                          <div className="space-y-3 bg-[#0d2840]/40 p-3 rounded-xl border border-brand-gold/5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-sans font-bold text-slate-200">Quality Risk</span>
                              <span className={`risk-badge px-1.5 py-0.5 text-[9px] rounded-lg font-bold uppercase ${
                                profileAssess.riskScores.qualityRisk > 60 ? 'bg-rose-950/80 text-rose-400 border border-rose-500/20' :
                                profileAssess.riskScores.qualityRisk > 30 ? 'bg-amber-950/80 text-[#D9AA52] border border-brand-gold/20' :
                                'bg-emerald-950/80 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {profileAssess.riskScores.qualityRisk}% Risk
                              </span>
                            </div>
                            <p className="text-slate-300 text-[10px] leading-relaxed italic font-serif">
                              "{profileAssess.riskSummaries.qualityRiskSummary}"
                            </p>
                          </div>

                        </div>
                      ) : (
                        <p className="text-xs text-brand-slate italic font-sans">Self-assessment questionnaire has not been drafted for this user profile.</p>
                      )}

                      {/* Generative AI Summarization Button inside Discovery View */}
                      {profileAssess && (
                        <div className="pt-4 border-t border-brand-slate/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <p className="text-[11px] text-brand-slate leading-relaxed font-sans max-w-lg">
                            Concerned with generic default scoring? Leverage the <strong>Gemini-3.5-flash AI Summarizer</strong> to read answers dynamically and write specialized assessments.
                          </p>
                          <button 
                            disabled={isGeneratingRiskSummary}
                            onClick={() => handleAiRiskSynthesis(profileAssess.id)}
                            className="bg-brand-gold hover:bg-[#cdaf60] text-brand-navy font-display font-bold text-[10px] tracking-wider uppercase px-4 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 transition-all select-none"
                          >
                            <RefreshCw className={`h-3 w-3 ${isGeneratingRiskSummary ? 'animate-spin' : ''}`} />
                            <span>{isGeneratingRiskSummary ? "Querying Gemini API..." : "⚡ Regenerate with Gemini"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="pt-4 border-t border-brand-slate/20 flex justify-between items-center text-[11px] font-sans">
                    <span className="text-brand-slate">Niyaan Verified Profile No. NY-{selectedSupplierProfileId.substring(0, 5).toUpperCase()}</span>
                    <button 
                      onClick={() => handleSaveAssessmentDraft(false)}
                      className="text-[#D9AA52] font-semibold hover:underline"
                    >
                      Export Assessment Sheet (.PDF)
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Sourcing Directory Controls (Search + Filter dropdowns) */}
            <div className="bg-white border border-slate-100 p-6 rounded-[2rem] space-y-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Search query box */}
                <div className="relative md:col-span-2">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input 
                    type="text" 
                    placeholder="Search by Company, Location, or Component (e.g., 'Taiwan', 'Silicon', 'Alloys')..." 
                    className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-slate-200/80 rounded-xl text-xs font-sans font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-brand-navy cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Dropdown Category Filter */}
                <div>
                  <select 
                    className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl py-3 px-3 text-xs font-display font-medium text-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all cursor-pointer"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Electronic Components">Electronic Components</option>
                    <option value="Raw Metals & Smelting">Raw Metals & Smelting</option>
                    <option value="Industrial Polymers">Industrial Polymers</option>
                    <option value="General Goods">General Goods</option>
                  </select>
                </div>

                {/* Dropdown Badge Rating Filter */}
                <div>
                  <select 
                    className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl py-3 px-3 text-xs font-display font-medium text-brand-navy focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all cursor-pointer"
                    value={badgeFilter}
                    onChange={(e) => setBadgeFilter(e.target.value)}
                  >
                    <option value="ALL">All Rating Tiers</option>
                    <option value="GOLD">★ GOLD Standard Only</option>
                    <option value="SILVER">★ SILVER Standard Only</option>
                    <option value="BRONZE">★ BRONZE Standard Only</option>
                  </select>
                </div>

              </div>

              {/* Badges indicators information strip inside premium enclosure */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 bg-white p-3.5 rounded-[1rem] border border-slate-100 shadow-sm">
                <span className="font-display font-bold text-brand-navy flex items-center gap-1.5"><Filter className="h-4 w-4 text-brand-gold" /> Filter Analytics:</span>
                <div className="flex items-center gap-1.5">
                  <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-[#a3792e] font-display font-bold text-[11px] uppercase tracking-wider">
                    {matchingAssessmentsList.length} Matching Entities
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-4 text-brand-slate font-sans font-medium uppercase text-[10px] tracking-wider ml-auto">
                  <span>★ Gold Metric &ge; 85</span>
                  <span>★ Silver Metric &ge; 70</span>
                  <span>★ Bronze Metric &ge; 50</span>
                </div>
              </div>
            </div>

            {/* Matching Suppliers List Grid using Premium Motion elevations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchingAssessmentsList.length > 0 ? (
                matchingAssessmentsList.map(assess => {
                  const correspondingUser = allUsers.find(u => u.id === assess.userId && u.role === 'SUPPLIER');
                  const isCompared = compareSuppliersList.some(p => p.id === assess.id);

                  return (
                    <motion.div 
                      key={assess.id} 
                      whileHover={{ y: -6 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`rounded-[1.75rem] bg-white p-6 space-y-4 shadow-sm border flex flex-col justify-between transition-all duration-300 ${
                        isCompared ? 'border-2 border-brand-gold ring-4 ring-brand-gold/5 bg-slate-50/10' : 'border-slate-100/90'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <span className="inline-block px-2.5 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-widest bg-brand-navy/5 text-brand-slate">
                              {correspondingUser?.category || "Industrial Sourcing"}
                            </span>
                            <h3 className="font-display font-bold text-brand-navy text-lg leading-snug">
                              {assess.companyName}
                            </h3>
                          </div>
                          
                          {assess.badge && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                              assess.badge === 'GOLD' ? 'bg-brand-gold/10 text-[#96712b] border-[#D9AA52]/40' :
                              assess.badge === 'SILVER' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                              'bg-amber-950/10 text-amber-800 border-amber-950/20'
                            }`}>
                              ★ {assess.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-brand-slate font-sans">
                          <Globe className="h-4 w-4 text-brand-gold" />
                          <span className="font-medium text-slate-500">{correspondingUser?.location || "Global Sourcing Hub"}</span>
                        </div>

                        <p className="text-xs text-slate-500 font-sans leading-relaxed line-clamp-3">
                          {correspondingUser?.companyDescription || "A trusted manufacturing organization that conducts progressive audits and maintains clean material supplies."}
                        </p>

                        {/* Pillar Score Bars indicators with Elite custom tracking */}
                        <div className="space-y-1.5 pt-3 border-t border-slate-100">
                          <div className="flex justify-between text-[11px] text-brand-slate font-display font-bold uppercase tracking-wider">
                            <span>Compliance Integrity index</span>
                            <span className="text-brand-navy">{assess.overallScore || 0}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                assess.overallScore >= 85 ? 'bg-[#D9AA52]' :
                                assess.overallScore >= 70 ? 'bg-brand-navy' : 'bg-brand-slate/40'
                              }`} 
                              style={{ width: `${assess.overallScore || 0}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                        <label className="inline-flex items-center gap-2 text-xs text-brand-navy font-display font-medium tracking-wide cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            className="rounded border-slate-300 text-brand-gold focus:ring-brand-gold cursor-pointer h-4 w-4" 
                            checked={isCompared}
                            onChange={() => toggleComparison(assess)}
                          />
                          <span>Compare</span>
                        </label>

                        <button 
                          onClick={() => setSelectedSupplierProfileId(assess.userId)}
                          className="bg-brand-navy hover:bg-brand-navy/90 text-white text-[10px] font-display font-bold uppercase tracking-widest px-4 py-2 rounded-xl cursor-pointer leading-tight transition-all duration-200 hover:scale-105 shadow-sm"
                        >
                          Show Audit Profile
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-16 bg-white rounded-[2rem] border border-dashed border-slate-200">
                  <Inbox className="h-12 w-12 text-[#D9AA52]/70 mx-auto mb-4" />
                  <p className="text-sm font-display font-bold text-brand-navy">No Vetted Suppliers Match Filtering</p>
                  <p className="text-xs text-brand-slate font-sans mt-1">Try resetting the keyword query or search in 'All Categories'.</p>
                  <button 
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("ALL");
                      setBadgeFilter("ALL");
                    }} 
                    className="mt-4 text-xs font-display font-extrabold uppercase tracking-widest text-[#a3792e] hover:text-brand-gold underline"
                  >
                    Reset Sourcing Filters
                  </button>
                </div>
              )}
            </div>

          </div>
        )}


        {/* =======================================================
            TAB: SUPPLIER SELF-ASSESSMENT WORKPLACE (PORTAL) 
           ======================================================= */}
        {currentTab === "supplier-dashboard" && (
          <div className="space-y-6">
            
            {/* Guarantee verification safety checks */}
            {!user || user.role !== 'SUPPLIER' ? (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-gold/10 rounded-2xl">
                    <AlertCircle className="h-6 w-6 text-[#a3792e]" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-brand-navy">Supplier Authority Required</h3>
                    <p className="text-[11px] text-brand-slate font-sans font-medium mt-0.5">
                      Your current virtual identity is identified as <strong className="text-brand-navy font-bold">{user?.role || "GUEST"}</strong>. The compliance self-assessment suite is restricted to vetted material suppliers.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => handleRoleImpersonate("vendor_1")} 
                    className="flex-1 bg-brand-navy text-white hover:bg-brand-navy/95 text-[11px] font-display font-bold tracking-wider uppercase px-4 py-3 rounded-xl transition-all duration-200 shadow-sm text-left hover:scale-[1.02]"
                  >
                    Impersonate Apex Semiconductor Corp <span className="text-brand-gold font-sans font-bold block mt-0.5 text-[9px] uppercase tracking-normal">Verified Gold Seller</span>
                  </button>
                  <button 
                    onClick={() => handleRoleImpersonate("vendor_3")} 
                    className="flex-1 bg-slate-50 border border-slate-200 hover:bg-slate-150 text-brand-navy text-[11px] font-display font-bold tracking-wider uppercase px-4 py-3 rounded-xl transition-all duration-200 shadow-sm text-left hover:scale-[1.02]"
                  >
                    Impersonate BionIQ Polymers <span className="text-brand-slate font-sans font-medium block mt-0.5 text-[9px] uppercase tracking-normal">Submitted Standard Seller</span>
                  </button>
                </div>
              </div>
            ) : (() => {
              const myAssessment = assessments.find(a => a.userId === user.id) || {
                id: `as_temp`,
                userId: user.id,
                companyName: user.companyName || user.name,
                status: 'NOT_STARTED' as const,
                responses: [],
                progress: 0,
                overallScore: 0,
                riskScores: { priceRisk: 50, supplyRisk: 50, technicalRisk: 50, creativeRisk: 50, qualityRisk: 50 },
                riskSummaries: {
                  priceRiskSummary: "Awaiting submission",
                  supplyRiskSummary: "Awaiting submission",
                  technicalRiskSummary: "Awaiting submission",
                  creativeRiskSummary: "Awaiting submission",
                  qualityRiskSummary: "Awaiting submission"
                },
                badge: null
              };

              return (
                <div className="space-y-6">
                  
                  {/* Dashboard header with status badge and overall score */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-display font-bold tracking-wider uppercase">
                        Enterprise Portal Account
                      </span>
                      <h1 className="text-3xl font-display font-bold text-brand-navy tracking-tight">{user.companyName} Assessment Suite</h1>
                      <div className="flex items-center gap-1.5 text-xs text-brand-slate font-sans font-medium">
                        <span>{user.email}</span>
                        <span>•</span>
                        <span>{user.location || "Global Region"}</span>
                      </div>
                    </div>

                    {/* Compact Metal Grading Badge Card */}
                    <div className={`rounded-2xl shadow-sm px-5 py-3.5 flex items-center gap-5 border transition-all duration-200 ${
                      myAssessment.badge === 'GOLD' ? 'bg-[#fcf8f2] border-[#D9AA52]/40 text-[#a3792e]' :
                      myAssessment.badge === 'SILVER' ? 'bg-slate-50 border-slate-200 text-slate-800' :
                      myAssessment.badge === 'BRONZE' ? 'bg-[#fcfbf9] border-[#c0a078]/20 text-stone-800' :
                      'bg-[#FCFCFD] border-slate-100 text-slate-400'
                    }`}>
                      <div className="text-center">
                        <span className="text-[9px] uppercase font-bold text-brand-slate tracking-wider block">Trust Level</span>
                        <p className="font-display tracking-widest font-extrabold text-[#D9AA52] text-xs">{myAssessment.badge || "UNGRADED"}</p>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div className="text-center">
                        <span className="text-[9px] uppercase font-bold text-brand-slate tracking-wider block">Compliance Weighted</span>
                        <p className="text-2xl font-display font-black text-brand-navy">{myAssessment.overallScore || 0}<span className="text-xs text-brand-slate font-medium">%</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Status Banner */}
                  {myAssessment.status === 'SUBMITTED' && (
                    <div className="bg-[#fcf8f2] border border-[#D9AA52]/20 rounded-2xl p-4 flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-[#a3792e] shrink-0" />
                      <div className="text-xs text-[#a3792e] font-sans font-medium">
                        <strong className="text-brand-navy font-bold">Self-Assessment Pending Verification:</strong> Your questionnaire replies have been locked and submitted to Niyaan Auditors queue (Submitted {myAssessment.submittedAt ? new Date(myAssessment.submittedAt).toLocaleDateString() : "recently"}). You can still browse and edit details, but rating updates take physical effect after Admin approval.
                      </div>
                    </div>
                  )}

                  {myAssessment.status === 'APPROVED' && (
                    <div className="bg-emerald-50/50 border border-emerald-200/40 rounded-2xl p-4 flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="text-xs text-emerald-900 font-sans font-medium">
                        <strong className="text-brand-navy font-bold">★ Platform Certified Standard:</strong> Admin approved your corporate logs on {myAssessment.approvedAt ? new Date(myAssessment.approvedAt).toLocaleDateString() : "recently"}. Congratulations! You are now publicly visible on the Sourcing Directory under Tier Level: <strong className="text-emerald-800">{myAssessment.badge}</strong>.
                        {myAssessment.feedback && (
                          <div className="mt-2 p-3 bg-white/40 rounded-xl border border-emerald-200/20 font-mono text-[10px] text-emerald-950">
                            Auditor Comments: "{myAssessment.feedback}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {assessmentSuccessBanner && (
                    <div className="bg-brand-navy border border-brand-gold/15 text-white rounded-2xl p-3.5 text-xs font-semibold animate-pulse">
                      {assessmentSuccessBanner}
                    </div>
                  )}

                  {/* 12-Column grid with Questionnaire Builder & Category progression on industrial cards */}
                  <div className="grid grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Progression stats & Interactive 8 modules selector sidebar */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                      
                      {/* Overall Progress Progress Indicator Area */}
                      <div className="bg-white border border-slate-100 rounded-[2rem] p-6 space-y-4 shadow-sm">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-display font-bold uppercase tracking-wider text-brand-slate text-[10px]">Worksheet Progress</span>
                          <span className="font-display font-bold text-brand-navy">{myAssessment.progress}% Complete</span>
                        </div>
                        <div className="w-full bg-[#F8FAFC] h-2.5 rounded-full overflow-hidden border border-slate-100 p-0.5">
                          <div 
                            className="bg-brand-gold h-full rounded-full transition-all duration-500" 
                            style={{ width: `${myAssessment.progress}%` }}
                          />
                        </div>

                        {/* Staggered modular lists of metrics */}
                        <div className="grid grid-cols-2 gap-3 pt-4 text-center border-t border-slate-100 text-xs">
                          <div className="bg-[#F8FAFC] border border-slate-100/50 p-2.5 rounded-xl">
                            <span className="block text-brand-slate text-[9px] font-bold uppercase tracking-wider font-sans">Total Answers</span>
                            <span className="text-brand-navy font-display font-bold text-sm block mt-0.5">{activeResponses.length} / {QUESTION_BANK.length}</span>
                          </div>
                          <div className="bg-[#F8FAFC] border border-slate-100/50 p-2.5 rounded-xl">
                            <span className="block text-brand-slate text-[9px] font-bold uppercase tracking-wider font-sans">Portal State</span>
                            <span className="font-display font-bold text-brand-navy text-[11px] block mt-1 uppercase tracking-widest">{myAssessment.status}</span>
                          </div>
                        </div>
                      </div>

                      {/* 8-Dimension Assessment Categories Stack */}
                      <div className="bg-white border border-slate-100 rounded-[2rem] p-4.5 space-y-2 shadow-sm">
                        <span className="block px-3 py-1.5 text-[9px] font-display font-extrabold text-brand-slate tracking-widest uppercase">
                          Compliance Chapters
                        </span>
                        
                        {ASSESSMENT_CATEGORIES.map(category => {
                          const categoryQuestions = QUESTION_BANK.filter(q => q.categoryId === category.id);
                          const answeredCategoryQuestionsCount = activeResponses.filter(resp => 
                            categoryQuestions.some(q => q.id === resp.questionId)
                          ).length;
                          const categoryCompletionRatio = categoryQuestions.length > 0 
                            ? Math.round((answeredCategoryQuestionsCount / categoryQuestions.length) * 100) 
                            : 0;

                          const isActive = activeCategoryTab === category.id;

                          return (
                            <button 
                              key={category.id}
                              onClick={() => setActiveCategoryTab(category.id)}
                              className={`w-full flex items-center justify-between text-left px-3.5 py-3 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${
                                isActive 
                                  ? 'bg-[#0d2840]/5 text-brand-navy border-l-4 border-l-brand-gold font-bold' 
                                  : 'text-slate-600 hover:bg-[#F8FAFC]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <Building2 className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-gold' : 'text-slate-400'}`} />
                                <div>
                                  <p className="font-display font-bold leading-none text-brand-navy">{category.name}</p>
                                  <p className="text-[10px] text-brand-slate font-sans font-medium mt-1 leading-none pr-1 truncate max-w-[150px]">{category.description}</p>
                                </div>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                                categoryCompletionRatio === 100 ? 'bg-emerald-100 text-emerald-800' :
                                categoryCompletionRatio > 0 ? 'bg-amber-100 text-[#a3792e]' :
                                'bg-slate-100 text-slate-400'
                              }`}>
                                {categoryCompletionRatio}%
                              </span>
                            </button>
                          );
                        })}
                      </div>

                    </div>

                    {/* Right: Focused chapter questions flow & action checklist */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                      
                      {/* Chapter info banner */}
                      {(() => {
                        const activeCategory = ASSESSMENT_CATEGORIES.find(c => c.id === activeCategoryTab);
                        const activeQuestions = QUESTION_BANK.filter(q => q.categoryId === activeCategoryTab);

                        if (!activeCategory) return null;

                        return (
                          <div className="bg-white border border-slate-100 p-6 md:p-8 rounded-[2rem] space-y-6 shadow-sm">
                            
                            <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h3 className="text-lg font-display font-bold text-brand-navy flex items-center gap-2">
                                  <FileText className="h-5 w-5 text-brand-gold" />
                                  <span>{activeCategory.name} Chapter</span>
                                </h3>
                                <p className="text-xs text-brand-slate font-sans font-medium mt-0.5">{activeCategory.description}</p>
                              </div>
                              <span className="text-[10px] font-display font-bold uppercase tracking-wider text-brand-gold">
                                {activeQuestions.length} Dimension Points
                              </span>
                            </div>

                            {/* Sequential Questions Map */}
                            <div className="space-y-6">
                              {activeQuestions.map((q, qIndex) => {
                                const currentResponse = activeResponses.find(r => r.questionId === q.id);
                                const currentVal = currentResponse?.value;

                                return (
                                  <div key={q.id} className="p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="space-y-1">
                                        <span className="text-[9px] font-mono font-bold text-brand-slate uppercase tracking-widest">
                                          Pillar Point Q-{q.id} • Mathematical Weight: {q.weight}
                                        </span>
                                        <p className="text-xs font-display font-bold text-brand-navy leading-relaxed pr-2">
                                          {q.text}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Actionable widgets based on Question Type */}
                                    <div className="pt-1.5">
                                      
                                      {/* Type 1: Boolean toggle */}
                                      {q.type === 'boolean' && (
                                        <div className="flex gap-3">
                                          <button 
                                            onClick={() => updateResponseValue(q.id, true)}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-display font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                                              currentVal === true 
                                                ? 'bg-brand-navy border-brand-navy text-white shadow-sm' 
                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-[#0d2840]'
                                            }`}
                                          >
                                            YES / COMPLIANT
                                          </button>
                                          <button 
                                            onClick={() => updateResponseValue(q.id, false)}
                                            className={`px-4 py-2.5 rounded-xl text-[10px] font-display font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
                                              currentVal === false 
                                                ? 'bg-rose-950 border-rose-900 text-rose-300 shadow-sm' 
                                                : 'bg-white border-slate-200 hover:bg-slate-50 text-[#0d2840]'
                                            }`}
                                          >
                                            NO / NON-COMPLIANT
                                          </button>
                                        </div>
                                      )}

                                      {/* Type 2: Multiple Choice Selection */}
                                      {q.type === 'multiple_choice' && q.options && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          {q.options.map(option => (
                                            <button 
                                              key={option}
                                              onClick={() => updateResponseValue(q.id, option)}
                                              className={`text-left px-3.5 py-2.5 border rounded-xl text-[11px] font-display font-semibold cursor-pointer transition-all duration-200 ${
                                                currentVal === option 
                                                  ? 'bg-brand-navy border-brand-navy text-brand-gold font-bold shadow-sm' 
                                                  : 'bg-white border-slate-250 hover:bg-slate-50 text-[#0d2840]'
                                              }`}
                                            >
                                              {option}
                                            </button>
                                          ))}
                                        </div>
                                      )}

                                      {/* Type 3: Numeric Sourcing input */}
                                      {q.type === 'numeric' && (
                                        <div className="max-w-[220px] flex items-center gap-2">
                                          <input 
                                            type="number" 
                                            placeholder="Enter numeric response..." 
                                            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-sans font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all"
                                            value={currentVal !== undefined ? Number(currentVal) : ""}
                                            onChange={(e) => updateResponseValue(q.id, Number(e.target.value))}
                                          />
                                          <span className="text-[10px] text-brand-slate font-display font-extrabold uppercase tracking-wider shrink-0">
                                            {q.id === 'm_2' ? "Days" : q.id === 'q_2' ? "PPM" : "Units"}
                                          </span>
                                        </div>
                                      )}

                                      {/* Type 4: Text input */}
                                      {q.type === 'text' && (
                                        <div className="space-y-1">
                                          <textarea 
                                            rows={2}
                                            maxLength={250}
                                            placeholder="Explain briefly (maximum 3 lines)..." 
                                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-sans font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all"
                                            value={typeof currentVal === 'string' ? currentVal : ""}
                                            onChange={(e) => updateResponseValue(q.id, e.target.value)}
                                          />
                                          <span className="text-[9px] text-brand-slate font-mono block text-right">
                                            {(typeof currentVal === 'string' ? currentVal.length : 0)}/250 chars max
                                          </span>
                                        </div>
                                      )}

                                      {/* Type 5: File Attachment Upload with progression simulator */}
                                      {q.type === 'file' && (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-3">
                                            <label className="bg-white border border-slate-200 hover:bg-slate-50 text-brand-navy text-[10px] font-display font-bold uppercase tracking-wider px-3.5 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-1.5 transition-all">
                                              <Download className="h-3 w-3 transform rotate-180 text-brand-gold" />
                                              <span>Upload Audited Certificate (.PDF)</span>
                                              <input 
                                                type="file" 
                                                accept=".pdf,.png,.jpg,.jpeg" 
                                                className="hidden" 
                                                onChange={(e) => triggerFakeUpload(q.id, e)}
                                              />
                                            </label>

                                            {currentResponse?.fileName && (
                                              <span className="text-xs text-emerald-600 font-sans font-bold flex items-center gap-1 truncate max-w-[250px]">
                                                <FileCheck className="h-3.5 w-3.5 text-emerald-500" /> Checked: {currentResponse.fileName}
                                              </span>
                                            )}
                                          </div>

                                          {/* Simulated progress slider bar */}
                                          {uploadProgress[q.id] !== undefined && uploadProgress[q.id] < 100 && (
                                            <div className="max-w-xs space-y-1">
                                              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-brand-gold h-full" style={{ width: `${uploadProgress[q.id]}%` }} />
                                              </div>
                                              <span className="text-[9px] font-mono text-brand-slate">Uploading Audit Node: {uploadProgress[q.id]}%</span>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                    </div>

                                    {q.evidenceRequired && (
                                      <div className="mt-2.5 bg-[#0d2840]/5 p-3.5 rounded-xl border border-brand-gold/10 text-[11px] text-brand-navy flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div className="flex items-center gap-1.5 font-display font-bold text-brand-navy">
                                          <FileCheck className="h-4 w-4 text-brand-gold shrink-0" />
                                          <span>Evidence Required: <strong className="text-brand-navy underline font-bold font-sans">{q.evidenceRequired}</strong></span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <label className="text-[9px] text-brand-navy bg-white border border-slate-200 hover:bg-[#F8FAFC] font-display font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer select-none transition-all">
                                            Attach File (.PDF / .DOCX / .JSON)
                                            <input 
                                              type="file" 
                                              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.json" 
                                              className="hidden" 
                                              onChange={(e) => triggerFakeUpload(q.id, e)}
                                            />
                                          </label>
                                          {currentResponse?.fileName && (
                                            <span className="text-[10px] text-emerald-700 font-bold font-sans flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 text-ellipsis overflow-hidden max-w-[150px] whitespace-nowrap">
                                              {currentResponse.fileName}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Chapter Footer Actions bar */}
                            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                              <p className="text-[11px] text-brand-slate font-sans font-medium leading-relaxed max-w-md">
                                All answers save locally instantly. Remember to select **Submit to Audits Desk** once compiled to 100%.
                              </p>

                              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <button 
                                  disabled={isSavingDraft || myAssessment.status === 'SUBMITTED'}
                                  onClick={() => handleSaveAssessmentDraft(false)}
                                  className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 border border-slate-200 disabled:opacity-50 text-[10px] text-brand-navy font-display font-bold uppercase tracking-wider px-4.5 py-3 rounded-xl cursor-pointer transition-all"
                                >
                                  {isSavingDraft ? "Drafting..." : "Save Progress Draft"}
                                </button>
                                
                                <button 
                                  disabled={isSubmittingSheet || myAssessment.status === 'SUBMITTED'}
                                  onClick={() => handleSaveAssessmentDraft(true)}
                                  className="w-full sm:w-auto bg-brand-gold hover:bg-[#cdaf60] disabled:bg-slate-100 disabled:text-slate-400 text-brand-navy text-[10px] font-display font-bold uppercase tracking-wider px-4.5 py-3 rounded-xl cursor-pointer transition-all"
                                >
                                  {isSubmittingSheet ? "Calculating..." : "Submit to Audits Desk"}
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })()}

                    </div>

                  </div>

                </div>
              );
            })()}

          </div>
        )}


        {/* =======================================================
            TAB: BUYER WORKSPACE (DYNAMIC RISK INTERACTION) 
           ======================================================= */}
        {currentTab === "buyer-dashboard" && (
          <div className="space-y-6">
            
            {!user || user.role !== 'BUYER' ? (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-navy rounded-2xl">
                    <ShieldAlert className="h-6 w-6 text-brand-gold" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-brand-navy">Sourcing Procurement Access Required</h3>
                    <p className="text-[11px] text-brand-slate font-sans font-medium mt-0.5">
                      Your current session role is identified as <strong className="text-brand-navy font-bold">{user?.role || "GUEST"}</strong>. Sourcing analytics, vendor shortlisting, and procurement threat benchmarks are key restricted sections.
                    </p>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleRoleImpersonate("buyer_1")} 
                    className="bg-brand-navy text-white hover:bg-brand-navy/95 text-xs font-display font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    Impersonate Sarah Chen (Head of Procurement)
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Header overview and actions buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-brand-navy text-[9px] font-display font-bold tracking-wider uppercase">
                      Sarah Chen • Lead Procurement Officer
                    </span>
                    <h1 className="text-3xl font-display font-bold text-brand-navy tracking-tight">Buyer Procurement Workspace</h1>
                    <p className="text-xs text-brand-slate font-sans font-medium">Evaluate prospective suppliers, assign audit requests, and measure key material threats coefficients.</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setBulkInviteModalOpen(true)}
                      className="bg-brand-navy hover:bg-brand-navy/95 text-white hover:text-brand-gold text-[10px] font-display font-bold uppercase tracking-wider px-5 py-3 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5 text-brand-gold" />
                      <span>Issue Compliance Invitation</span>
                    </button>
                  </div>
                </div>

                {/* Simulated invitation dashboard overview if modal open */}
                {bulkInviteModalOpen && (
                  <div className="bg-brand-navy text-white p-6 rounded-[2rem] border border-brand-gold/10 space-y-4 animate-fadeIn shadow-lg">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <h3 className="text-[10px] font-display font-bold uppercase text-brand-gold tracking-widest">Configure Compliance Dispatch Agent</h3>
                      <button 
                        onClick={() => setBulkInviteModalOpen(false)}
                        className="text-slate-400 hover:text-white rounded p-1 transition-all"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSendSupplierInvite} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                      <div className="md:col-span-5 space-y-1">
                        <label className="text-[9px] font-display font-extrabold uppercase text-white/60 tracking-wider">Enterprise Supplier Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Shenzhen Precision Electronics Ltd" 
                          className="w-full bg-[#0d2840]/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all"
                          value={inviteCompanyName}
                          onChange={(e) => setInviteCompanyName(e.target.value)}
                        />
                      </div>
                      
                      <div className="md:col-span-5 space-y-1">
                        <label className="text-[9px] font-display font-extrabold uppercase text-white/60 tracking-wider">Procurement Main Email Contact</label>
                        <input 
                          type="email" 
                          required
                          placeholder="compliance-officer@company.com" 
                          className="w-full bg-[#0d2840]/30 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-brand-gold focus:border-brand-gold transition-all"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <button 
                          type="submit"
                          className="w-full bg-brand-gold hover:bg-[#cdaf60] text-brand-navy text-[10px] font-display font-bold uppercase tracking-wider py-3 px-4 rounded-xl cursor-pointer transition-all"
                        >
                          Send Invitation
                        </button>
                      </div>
                    </form>

                    <div className="space-y-2 pt-2 text-xs">
                      <h4 className="font-display font-bold text-brand-gold text-[9px] uppercase tracking-wider">Dispatched Reminders Log ({simulatedInvites.length + 1})</h4>
                      <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px] text-slate-300 leading-snug">
                        <p className="text-emerald-400">✓ SENT @ 10:04 AM: Invitation to apex@apex-semiconductor.com - Status: VERIFIED GOLD</p>
                        {simulatedInvites.map((inv, idx) => (
                          <p key={idx} className="text-[#D9AA52]">✓ DISPATCHED @ {inv.sentAt}: Verification request to {inv.company} ({inv.email}) - Status: DELIVERED</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Sourcing Profile portfolio status grids */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Card 1: Enterprise portfolio risk summary */}
                  <div className="bg-brand-navy text-white p-6 rounded-[2rem] border border-brand-gold/10 flex flex-col justify-between shadow-sm">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <h3 className="text-[10px] font-display font-bold uppercase text-brand-gold tracking-widest">Portfolio Threats Index</h3>
                        <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-400 rounded-full font-sans text-[9px] font-bold">STABLE</span>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Active Monitored Sellers:</span>
                          <span className="font-mono font-bold text-slate-100">3 Suppliers</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Average Compliance Rating:</span>
                          <span className="font-mono font-bold text-brand-gold text-base">77%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Average Price Deficit Index:</span>
                          <span className="font-mono font-bold text-slate-100">Low Threat (35%)</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300">Pending Supplier Audits Chapters:</span>
                          <span className="font-mono font-bold text-brand-gold">1 Chapter</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 mt-4">
                      <button 
                        onClick={() => setCurrentTab("suppliers")}
                        className="w-full text-center text-[10px] font-display font-bold uppercase tracking-wider text-brand-gold hover:text-white transition-all inline-flex items-center justify-center gap-1.5"
                      >
                        Compare Sourcing Pool &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Price hedge advisory widget */}
                  <div className="bg-white border border-slate-100 p-6 rounded-[2rem] flex flex-col justify-between shadow-sm">
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-display font-bold uppercase text-brand-slate tracking-wider pb-1.5 border-b border-slate-100">
                        Price Risk Benchmark
                      </h3>
                      <p className="text-[11px] leading-relaxed text-brand-slate font-sans font-medium pr-1">
                        Recent industrial audits denote premium price risk profiles among chemical packaging inputs. Buyers are suggested to secure raw polymer matrices contracts under terms &ge; Net 60 to buffer global shipping freight volatility coefficients.
                      </p>
                      <div className="p-3 bg-[#FCFCFD] rounded-xl text-xs border border-slate-100 flex items-center gap-2 text-brand-navy">
                        <AlertCircle className="h-4 w-4 text-[#a3792e] shrink-0" />
                        <span className="text-[11px] font-sans font-semibold">Suggestion: Pivot target alloys inputs to Nordic verified smelting streams.</span>
                      </div>
                    </div>
                    <span className="text-[9px] text-brand-slate block pt-4 font-mono font-semibold">Calculated across 8 chapters dimensions.</span>
                  </div>

                  {/* Card 3: Anonymized Buyer feedback submissions */}
                  <div className="bg-white border border-slate-100 p-6 rounded-[2rem] flex flex-col justify-between shadow-sm">
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-display font-bold uppercase text-brand-slate tracking-wider pb-1.5 border-b border-slate-100">
                        Disclose Supplier Feedback
                      </h3>
                      
                      <div className="space-y-2 text-xs">
                        <textarea 
                          rows={2}
                          placeholder="Submit anonymized feedback about order lead times or material quality..."
                          className="w-full bg-[#F8FAFC] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold p-3 text-xs rounded-xl font-sans font-medium"
                          value={buyerFeedbackText}
                          onChange={(e) => setBuyerFeedbackText(e.target.value)}
                        />
                        <button 
                          onClick={() => {
                            if (!buyerFeedbackText) return;
                            setBuyerFeedbackText("");
                            setSuccessToast("✓ Anonymized feedback published successfully to active vendor database logs.");
                            setTimeout(() => setSuccessToast(null), 3000);
                          }}
                          className="bg-brand-navy text-white hover:bg-brand-navy/95 text-[10px] font-display font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                        >
                          Submit Log
                        </button>
                      </div>
                    </div>
                    <span className="text-[9px] text-brand-slate block pt-4 font-mono font-semibold">Feeds directly to supplier Improvement Recommendations.</span>
                  </div>

                </div>

                {/* Sourcing supplier table summary tracker */}
                <div className="bg-white border border-slate-100 rounded-[2rem] py-6 shadow-sm overflow-hidden">
                  <div className="px-6 pb-4 border-b border-slate-105/40">
                    <h3 className="font-display font-bold text-brand-navy text-sm tracking-tight">Active Sourcing Verification Dashboard</h3>
                  </div>
                  <div className="overflow-x-auto min-w-full">
                    <table className="w-full text-left text-xs text-brand-slate border-collapse">
                      <thead>
                        <tr className="bg-[#F8FAFC]/50 border-b border-slate-100 text-brand-slate uppercase font-display font-bold text-[9px] tracking-wider">
                          <th className="py-3 px-6">Company</th>
                          <th className="py-3 px-6">Calculated Score</th>
                          <th className="py-3 px-6 text-center">Price Risk</th>
                          <th className="py-3 px-6 text-center">Logistics Risk</th>
                          <th className="py-3 px-6 text-center">Technical Risk</th>
                          <th className="py-3 px-6 text-center">Creative Risk</th>
                          <th className="py-3 px-6 text-center">Quality Risk</th>
                          <th className="py-3 px-6 text-center">Assessor Tag</th>
                          <th className="py-3 px-6">Review Option</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans font-medium">
                        {assessments.map(item => {
                          const refUser = allUsers.find(u => u.id === item.userId);
                          return (
                            <tr key={item.id} className="hover:bg-[#F8FAFC]">
                              <td className="py-4 px-6 font-display font-bold text-brand-navy">
                                <div>
                                  <p>{item.companyName}</p>
                                  <span className="text-[10px] text-brand-slate font-sans font-semibold block mt-0.5">{refUser?.category} • {refUser?.location}</span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                                  item.overallScore >= 80 ? 'bg-emerald-50 text-emerald-800' :
                                  'bg-amber-50 text-amber-700'
                                }`}>
                                  {item.overallScore || 0}%
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`font-mono text-[11px] ${item.riskScores.priceRisk > 50 ? 'text-rose-650 font-bold' : 'text-slate-600'}`}>
                                  {item.riskScores.priceRisk}%
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`font-mono text-[11px] ${item.riskScores.supplyRisk > 50 ? 'text-rose-650 font-bold' : 'text-slate-600'}`}>
                                  {item.riskScores.supplyRisk}%
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`font-mono text-[11px] ${item.riskScores.technicalRisk > 50 ? 'text-rose-650 font-bold' : 'text-slate-600'}`}>
                                  {item.riskScores.technicalRisk}%
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                <span className={`font-mono text-[11px] ${item.riskScores.creativeRisk > 50 ? 'text-rose-650 font-bold' : 'text-slate-600'}`}>
                                  {item.riskScores.creativeRisk}%
                                </span>
                              </td>
                              <td className="py-4 px-6 font-semibold font-mono text-center">
                                <span className={`font-mono text-[11px] ${item.riskScores.qualityRisk > 50 ? 'text-rose-650 font-bold' : 'text-slate-600'}`}>
                                  {item.riskScores.qualityRisk}%
                                </span>
                              </td>
                              <td className="py-4 px-6 text-center">
                                {item.badge ? (
                                  <span className="bg-[#fcf8f2] text-[#a3792e] border border-[#D9AA52]/40 font-display font-extrabold px-2 py-0.5 rounded-lg text-[9px]">
                                    ★ {item.badge}
                                  </span>
                                ) : (
                                  <span className="text-brand-slate text-[10px] font-sans font-medium">Awaiting Inspection</span>
                                )}
                              </td>
                              <td className="py-4 px-6 font-display font-bold text-brand-gold">
                                <button 
                                  onClick={() => {
                                    setSelectedSupplierProfileId(item.userId);
                                    setCurrentTab("suppliers");
                                  }}
                                  className="hover:underline cursor-pointer"
                                >
                                  Inspect Complete Portfolio &rarr;
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}


        {/* =======================================================
            TAB: ADMIN PORTAL (REVIEWING & BADGE APPROVAL)
           ======================================================= */}
        {currentTab === "admin-dashboard" && (
          <div className="space-y-6">
            
                 {!user || user.role !== 'ADMIN' ? (
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-rose-50 rounded-2xl">
                    <ShieldAlert className="h-6 w-6 text-rose-700" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-base text-brand-navy">Portal Master Keys Required</h3>
                    <p className="text-[11px] text-brand-slate font-sans font-medium mt-0.5">
                      Your virtual identity role index is registered as <strong className="text-brand-navy font-bold">{user?.role || "GUEST"}</strong>. Master administrative privileges are strictly required to authorize audits and configure grading scales.
                    </p>
                  </div>
                </div>
                <div>
                  <button 
                    onClick={() => handleRoleImpersonate("admin_1")} 
                    className="bg-brand-navy text-white hover:bg-brand-navy/95 text-xs font-display font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    Impersonate Platforms Administrator
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pb-6 border-b border-slate-100">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-[9px] font-display font-bold tracking-wider uppercase">
                      Platforms Audit Command
                    </span>
                    <h1 className="text-3xl font-display font-bold text-brand-navy tracking-tight">Assessor Verification Desk</h1>
                    <p className="text-xs text-brand-slate font-sans font-medium">Verify incoming material self-assessments worksheets to authorize public directory credentials.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left: Assessments Queue lists */}
                  <div className="lg:col-span-8 space-y-4">
                    <h3 className="text-[10px] font-display font-bold uppercase text-brand-slate tracking-widest pl-1">
                      Verification Workflow queue
                    </h3>

                    {assessments.map(item => {
                      const isSelected = selectedAdminReviewId === item.id;
                      const vendorUser = allUsers.find(u => u.id === item.userId);

                      return (
                        <div 
                          key={item.id}
                          className={`bg-white transition-all space-y-4 shadow-sm border rounded-[1.8rem] p-6 ${
                            isSelected ? 'border-brand-gold ring-1 ring-brand-gold/20' : 'border-slate-100'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-display font-bold text-brand-navy text-base">{item.companyName}</h4>
                                <span className={`text-[9px] font-display font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                                  item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                                  item.status === 'SUBMITTED' ? 'bg-[#FCF8F2] text-[#a3792e] animate-pulse' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-brand-slate font-sans font-medium mt-1">Assigned Target Vendor Profile ID: <span className="font-mono text-brand-navy">{item.userId}</span></p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-brand-slate font-sans font-semibold text-xs text-right hidden sm:block">
                                Compliance: <strong className="text-brand-navy font-display text-sm block">{item.overallScore}%</strong>
                              </span>
                              <button 
                                onClick={() => {
                                  setSelectedAdminReviewId(item.id);
                                  setAdminFeedbackText(item.feedback || "");
                                }}
                                className="bg-brand-navy text-white hover:text-brand-gold text-[10px] font-display font-bold uppercase tracking-wider px-4 py-3 rounded-xl cursor-pointer transition-all"
                              >
                                Review Responses ({item.responses.length})
                              </button>
                            </div>
                          </div>

                          {/* Mini visual summary review */}
                          {isSelected && (
                            <div className="p-5 bg-[#F8FAFC] rounded-2xl space-y-4 border border-slate-100 text-xs animate-fadeIn transition-all duration-300">
                              <h5 className="font-display font-bold text-brand-navy border-b border-slate-200/60 pb-1.5 uppercase text-[9px] tracking-wider">Responses Logs</h5>
                              
                              <div className="max-h-56 overflow-y-auto space-y-3 font-sans leading-relaxed">
                                {QUESTION_BANK.map(q => {
                                  const respVal = item.responses.find(r => r.questionId === q.id);
                                  return (
                                    <div key={q.id} className="pb-2 border-b border-slate-200/40">
                                      <p className="font-display font-bold text-brand-navy text-[11px]">[Q: {q.text}]</p>
                                      <p className="mt-1 text-brand-slate font-sans font-medium">
                                        Answer: <strong className="text-brand-navy leading-none font-sans font-bold">
                                          {respVal ? String(respVal.value) : "Awaiting response..."}
                                        </strong>
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="pt-4 border-t border-slate-200 space-y-3">
                                <div>
                                  <label className="block text-[9px] font-display font-extrabold uppercase text-brand-slate pb-1.5 tracking-wider">
                                    Auditing Feedback / Operational Improvement Recommendations
                                  </label>
                                  <textarea 
                                    rows={2}
                                    placeholder="Write formal suggestions here on carbon loops or SOC audits..."
                                    className="w-full bg-white border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-gold focus:border-brand-gold p-3 text-xs rounded-xl font-sans font-medium transition-all"
                                    value={adminFeedbackText}
                                    onChange={(e) => setAdminFeedbackText(e.target.value)}
                                  />
                                </div>

                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={async () => {
                                      const res = await submitReview({
                                        assessmentId: item.id,
                                        status: 'REJECTED',
                                        feedback: adminFeedbackText,
                                        reviewedBy: "Niyaan Admin Team"
                                      });
                                      if (res.success && res.assessment) {
                                        setAssessments(prev => prev.map(a => a.id === item.id ? res.assessment! : a));
                                        setSuccessToast("Assigned Reject status successfully.");
                                        setTimeout(() => setSuccessToast(null), 3000);
                                      }
                                    }}
                                    className="bg-white border border-slate-200 hover:bg-slate-50 text-rose-800 text-[10px] font-display font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl cursor-pointer transition-all"
                                  >
                                    Flag Rejection / Request Fixes
                                  </button>
                                  <button 
                                    onClick={async () => {
                                      const res = await submitReview({
                                        assessmentId: item.id,
                                        status: 'APPROVED',
                                        feedback: adminFeedbackText,
                                        reviewedBy: "Niyaan Admin Team"
                                      });
                                      if (res.success && res.assessment) {
                                        setAssessments(prev => prev.map(a => a.id === item.id ? res.assessment! : a));
                                        
                                        // Auto calculate risk metrics also after approve!
                                        await handleAiRiskSynthesis(item.id);

                                        setSuccessToast("Approved system audit! Rating tag published.");
                                        setTimeout(() => setSuccessToast(null), 4000);
                                      }
                                    }}
                                    className="bg-brand-gold hover:bg-[#cdaf60] text-brand-navy text-[10px] font-display font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-sm"
                                  >
                                    Approve and Issue Badge Rating
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Analytical Metrics distribution block */}
                  <div className="lg:col-span-4 space-y-6">
                    <div className="bg-brand-navy text-white p-6 rounded-[2rem] border border-brand-gold/10 space-y-4 shadow-sm">
                      <h3 className="text-[10px] font-display font-bold uppercase text-brand-gold tracking-widest pb-1.5 border-b border-white/5">
                        Grading Rules Engine
                      </h3>
                      <p className="text-[11px] leading-relaxed text-slate-300 font-sans font-medium">
                        Approval dynamically determines the assigned Badge Rating tags based on target compilation scores mathematically recorded:
                      </p>

                      <div className="space-y-3 font-sans text-xs font-semibold">
                        <div className="flex items-center gap-2.5 p-3.5 bg-[#0d2840]/30 border border-white/5 rounded-2xl">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-gold shrink-0 block" />
                          <span className="text-slate-100 font-display font-bold text-[11px]">GOLD Verified standard: &ge; 85% score</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3.5 bg-[#0d2840]/30 border border-white/5 rounded-2xl">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0 block" />
                          <span className="text-slate-100 font-display font-bold text-[11px]">SILVER Verified standard: &ge; 70% score</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-3.5 bg-[#0d2840]/30 border border-white/5 rounded-2xl">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-800 shrink-0 block" />
                          <span className="text-slate-100 font-display font-bold text-[11px]">BRONZE Verified standard: &ge; 50% score</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}
          </div>
        )}


        {/* =======================================================
            TAB: SIGN IN / REGISTRATION PORTAL FLOW
           ======================================================= */}
        {currentTab === "auth" && (
          <div className="max-w-md mx-auto py-8">
            <div className="rounded-[2rem] p-8 bg-white border border-slate-100 shadow-xl space-y-6 executive-card-shadow">
              
              <div className="text-center space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 text-[#a3792e] text-[9px] font-display font-extrabold tracking-wider uppercase">
                  ⭐ SECURE ACCESS CONTROL
                </span>
                <h1 className="text-2xl font-display font-bold tracking-tight text-brand-navy">Access Niyaan Source</h1>
                <p className="text-brand-slate font-sans font-medium text-xs">Verify credentials or declare a new corporate supplier instance.</p>
              </div>

              {authError && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-xs text-rose-700 font-sans font-semibold">
                  {authError}
                </div>
              )}

              {/* Luxury tab switch */}
              <div className="flex border-b border-slate-100 text-xs text-center font-display">
                <button 
                  type="button"
                  onClick={() => setAuthRole("SUPPLIER")}
                  className={`flex-1 pb-2.5 border-b-2 font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                    authRole === "SUPPLIER" ? "border-brand-gold text-brand-navy" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Supplier Audit
                </button>
                <button 
                  type="button"
                  onClick={() => setAuthRole("BUYER")}
                  className={`flex-1 pb-2.5 border-b-2 font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                    authRole === "BUYER" ? "border-brand-gold text-brand-navy" : "border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  Sourcing Buyer
                </button>
              </div>

              <form onSubmit={handleUserRegister} className="space-y-4 text-xs font-sans font-medium">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Corporate Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="e.g. contact@apex-semiconductor.com"
                    className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-brand-gold focus:border-brand-gold focus:outline-none transition-all"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Contact Agent Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Alexander Sterling"
                    className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-brand-gold focus:border-brand-gold focus:outline-none transition-all"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                  />
                </div>

                {authRole === 'SUPPLIER' && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Company Registered Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Apex Semiconductor Corp"
                        className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-brand-gold focus:border-brand-gold focus:outline-none transition-all"
                        value={authCompanyName}
                        onChange={(e) => setAuthCompanyName(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Sourcing Category</label>
                        <select 
                          className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl px-3 py-3 text-xs focus:ring-1 focus:ring-brand-gold focus:border-brand-gold focus:outline-none transition-all cursor-pointer"
                          value={authCategory}
                          onChange={(e) => setAuthCategory(e.target.value)}
                        >
                          <option value="Electronic Components">Electronic Components</option>
                          <option value="Raw Metals & Smelting">Raw Metals & Smelting</option>
                          <option value="Industrial Polymers">Industrial Polymers</option>
                          <option value="General Goods">General Goods</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-brand-slate uppercase tracking-wider">Corporate Hub Location</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Taiwan, Germany..."
                          className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-brand-gold focus:border-brand-gold focus:outline-none transition-all"
                          value={authLocation}
                          onChange={(e) => setAuthLocation(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-2 space-y-3">
                  <button 
                    type="submit"
                    className="w-full bg-brand-navy hover:bg-brand-navy/95 text-white font-display font-medium text-xs uppercase tracking-widest py-3.5 rounded-xl cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Confirm & Initialize Dashboard
                  </button>

                  <button 
                    type="button"
                    onClick={handleUserLogin}
                    className="w-full text-center text-[10px] uppercase tracking-wider text-brand-slate hover:text-brand-gold cursor-pointer font-display font-bold pt-1 transition-colors"
                  >
                    Or instant sign-in using corporate email
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </main>

      {/* Corporate Professional Footer bar */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-3">
          <p className="text-xs text-slate-400">
            &copy; 2026 Niyaan Source Inc. • All Rights Reserved. Fully Encrypted System Core & Verified Industrial Benchmarking registers.
          </p>
          <div className="flex gap-4 items-center justify-center font-semibold text-[11px] text-slate-500">
            <span className="cursor-pointer hover:text-slate-900">Privacy Protocols</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-slate-900">ISO Audits API</span>
            <span>•</span>
            <span className="cursor-pointer hover:text-slate-900" onClick={() => setCurrentTab("landing")}>Platform Overview</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
