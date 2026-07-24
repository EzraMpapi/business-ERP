import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  LayoutDashboard, Users, ShoppingCart, Package, Wallet, Briefcase,
  Factory, Truck, Megaphone, Store, FileText, Brain, Settings,
  Search, Bell, ChevronDown, Plus, Phone, Mail, Building2, TrendingUp,
  TrendingDown, MoreHorizontal, ArrowUpRight, ArrowDownRight, Filter, X, Star,
  CircleDollarSign, Clock, CheckCircle2, AlertCircle, Link, Trophy, Medal,
  Inbox, AtSign, CheckCheck, Lock, Send, Printer, Download, ChevronRight,
  Ban, ReceiptText, ClipboardList, FileCheck, Trash2, Copy, Landmark,
  BarChart3, Grid3x3, List, FileSpreadsheet, FileImage, File, Folder,
  FolderOpen, UploadCloud, Eye, Percent, Globe, CreditCard, Tag,
  MessageSquare, MousePointerClick, ChevronUp, ShoppingBag, Minus, Receipt,
  Banknote, Smartphone, ArrowUpDown, Repeat, UserPlus, CalendarCheck,
  Stethoscope, ScanLine, Pill, FlaskConical, Edit2, Heart, Award,
  GraduationCap, HeartHandshake, Layers, ClipboardCheck, Cog, ShieldCheck,
  Wrench, Kanban, Flag, ListTodo, Headphones, Ticket, MessageCircle,
  BookOpen, PhoneCall, LoaderCircle, Gauge, Hash, Video, Mic, PenTool,
  QrCode, MapPin, EyeOff, User, ArrowRight, LogOut, Target, Crosshair,
  GitBranch, Circle, ScanText, History, Calendar, ChevronLeft, Sparkles,
  Zap, HeartPulse, HardHat, Fingerprint, Activity, PiggyBank, HandCoins,
  Users2, Coins, BookHeart, TreePine, Scale, CircleUserRound,
  BadgeDollarSign, Shield, ArrowRightLeft, School, Bus, Tablets, TestTube,
  Building, Hotel, Bed, Car, BookMarked, CalendarDays, UserCheck, Library,
  NotebookPen, Clipboard, DollarSign, BadgeCheck, Microscope, Syringe,
  UtensilsCrossed, ChefHat, Utensils, CookingPot, ConciergeBell, BedDouble,
  Key, DoorOpen, Split, MinusCircle, PlusCircle, RefreshCw, Shuffle,
  ArrowLeftRight, Wallet2, Coffee, Wine, ShoppingBasket, Pizza, Timer,
  Salad, CheckCircle, XCircle, RotateCcw, Archive, Moon, Sun, Sliders,
  SortAsc, SortDesc, CheckSquare, Undo2, BellRing, BarChart2, BadgePercent,
  Calculator, FolderSync, Database, Cpu, Globe2, Languages, GanttChart,
  KanbanSquare, Wifi, WifiOff, RefreshCcw, PanelLeftClose, PanelLeftOpen,
  ArrowUpCircle, ChevronFirst, ChevronLast, ImageIcon, Palette, Save, Info
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Cell,
  LineChart as RLineChart, Line, ComposedChart,
  PieChart as RPieChart, Pie, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis
} from "recharts";
import * as XLSX from "xlsx";

// ─── Shared imports ──────────────────────────────────────────────────────────
import {
  // Supabase
  sb, IS_CONFIGURED, SUPABASE_URL, SUPABASE_ANON_KEY,
  authSignIn, authSignUp, authSignOut, authGetUser, authSignInWithOAuth, callRpc,
  // Hooks
  useLocalPersist, useDebounce, useSortableTable, useCompanyTable,
  mapLeadRow, mapContactRow, mapInventoryRow, mapWarehouseRow, mapTransferRow,
  mapBatchRow, mapSupplierRow, mapPoItems, mapPurchaseOrderRow,
  mapProcurementContractRow, mapExpenseRow, mapAssetRow, mapDocItems,
  mapQuotationRow, mapOrderReturnRow, mapOrderRow, mapPaymentRow,
  mapInvoiceRow, mapSubscriptionRow, mapEmployeeRow, mapLeaveRow,
  mapCandidateRow, mapAttendanceRow, mapPerformanceRow, mapTrainingRow,
  // Utils / UI helpers
  LmsInsightsPanel, mapBenefitRow, mapPayrollRunRow, mapBomComponents, mapBomRow,
  mapMachineRow, mapQcInspectionRow, mapMaintenanceRow, mapProjectRow,
  mapProjectTaskRow, mapMilestoneRow, mapProjectExpenseRow, mapTicketMessages,
  mapTicketRow, mapChatMessages, mapChatRow, mapKbArticleRow, mapCallLogRow,
  mapNotificationChannelRow, mapNotificationRuleRow, mapNotificationLogRow,
  mapAuditLogRow, mapScheduledReportRow, mapIntegrationConnectionRow,
  mapSignatureRow, mapCustomKpiRow, mapCompetitorRow, mapBenchmarkRow,
  mapWorkflowRow, mapCalendarEventRow,
  // Constants / data
  MODULES, STAGES, STAGE_COLOR, contactsSeed, seedLeads,
  money, useSmartAlerts, ALERT_PRIORITY, useBulkSelect, BulkActionBar,
  useAutoSave, DeltaBadge, DOC_TABS, DOC_STATUS_COLOR, DOC_STATUS_NEXT,
  PAYMENT_METHODS, confirmBus, confirmAction, receiptBus,
  invoiceCreatedBus, auditBus, logAudit, recordPayment,
  setActiveTaxRate, COMPANY_TIMEZONES, formatInTimezone,
  lineTotal, numberToWords, ASSET_CATEGORIES, depreciate,
} from "../shared/index.js";
// ─────────────────────────────────────────────────────────────────────────────


function LoginPage({ onAuthenticated, onSwitchToSignup }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setBusy(true); setError(null);
    try {
      if (!IS_CONFIGURED) { onAuthenticated(null); return; }
      const result = await authSignIn(identifier.trim(), password);
      if (result.error) { setError(result.error.message || "Login failed."); return; }
      onAuthenticated(result.session || null);
    } catch (_e) { setError("Something went wrong — check your connection."); }
    finally { setBusy(false); }
  }

  function handleMouseMove(e) {
    const r = e.currentTarget.getBoundingClientRect();
    setTiltX(-((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 7);
    setTiltY(((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 7);
  }

  return (
    <div className="min-h-screen w-full flex" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Left — brand panel, hidden on small screens */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12" style={{ background: "linear-gradient(160deg, #052614 0%, #0F4D26 35%, #16A34A 70%, #22C55E 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #4ADE80 0%, transparent 70%)", top: "-100px", right: "-80px", filter: "blur(70px)" }} />
          <div className="absolute w-64 h-64 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #BBF7D0 0%, transparent 70%)", bottom: "5%", left: "10%", filter: "blur(50px)" }} />
          <svg className="absolute opacity-8" style={{ bottom: "15%", right: "5%", width: 180, height: 208 }} viewBox="0 0 120 140">
            <polygon points="60,6 114,33 114,107 60,134 6,107 6,33" fill="none" stroke="#4ADE80" strokeWidth="1.5" />
          </svg>
          <svg className="absolute opacity-6" style={{ top: "5%", left: "5%", width: 80, height: 92 }} viewBox="0 0 120 140">
            <polygon points="60,6 114,33 114,107 60,134 6,107 6,33" fill="none" stroke="#86EFAC" strokeWidth="2" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <svg width="40" height="46" viewBox="0 0 120 140">
              <defs><linearGradient id="lg1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#16A34A"/></linearGradient></defs>
              <polygon points="60,6 114,33 114,107 60,134 6,107 6,33" fill="url(#lg1)"/>
              <text x="60" y="76" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="52" fontWeight="900" fontFamily="Poppins,sans-serif">S</text>
            </svg>
            <div>
              <p className="text-white font-bold text-[18px] leading-tight" style={{ fontFamily: "Poppins,sans-serif" }}>Smart Manager</p>
              <p className="text-white/50 text-[11px] tracking-wide uppercase">Enterprise Edition</p>
            </div>
          </div>
          <h2 className="text-[36px] font-bold text-white leading-tight mb-4" style={{ fontFamily: "Poppins,sans-serif" }}>Africa first AI-powered Business Ecosystem</h2>
          <p className="text-white/65 text-[14px] leading-relaxed">Manage every aspect of your organisation — from sales and inventory to HR, tax, and AI insights — in one place.</p>
        </div>
        <div className="relative z-10 space-y-3">
          {[["TRA Tax Center", "PAYE, SDL, WCF with real brackets"],["Biometric Attendance", "Real fingerprint via WebAuthn"],["AI Command Center", "English & Kiswahili, live business data"]].map(([t,s]) => (
            <div key={t} className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-[#4ADE80]/20 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={12} className="text-[#4ADE80]" /></div>
              <div><p className="text-white text-[13px] font-medium">{t}</p><p className="text-white/50 text-[11.5px]">{s}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — the form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#F8FAFC]">
        <div className="w-full max-w-sm" style={{ perspective: "1200px" }} onMouseMove={handleMouseMove} onMouseLeave={() => { setTiltX(0); setTiltY(0); }}>
          {/* Mobile brand — only on small screens */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <svg width="48" height="55" viewBox="0 0 120 140" className="mb-2">
              <defs><linearGradient id="mlg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#16A34A"/></linearGradient></defs>
              <polygon points="60,6 114,33 114,107 60,134 6,107 6,33" fill="url(#mlg)"/>
              <text x="60" y="76" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="52" fontWeight="900" fontFamily="Poppins,sans-serif">S</text>
            </svg>
            <p className="font-bold text-[#111827] text-[18px]" style={{ fontFamily: "Poppins,sans-serif" }}>Smart Manager</p>
          </div>

          <div style={{ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, transition: "transform 0.12s ease-out" }}>
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8">
              <div className="mb-7">
                <h1 className="text-[22px] font-bold text-[#111827] mb-1" style={{ fontFamily: "Poppins,sans-serif" }}>Welcome back</h1>
                <p className="text-[13px] text-slate-500">Sign in to your account to continue</p>
              </div>

              {error && <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-700"><AlertCircle size={13} className="shrink-0" />{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Email address</label>
                  <input type="text" value={identifier} autoComplete="email" onChange={(e) => setIdentifier(e.target.value)} placeholder="you@company.com"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[13.5px] text-[#111827] placeholder-slate-300 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all" />
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-[13.5px] text-[#111827] placeholder-slate-300 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={busy || !identifier.trim() || !password}
                  className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#16A34A,#22C55E)", boxShadow: "0 4px 14px rgba(22,163,74,0.35)" }}>
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>

              <p className="text-center text-[12.5px] text-slate-500 mt-5">
                Don't have an account? <button type="button" onClick={onSwitchToSignup} className="font-semibold text-[#16A34A] hover:underline">Create one</button>
              </p>
              <button type="button" onClick={() => { DEMO_OVERRIDE = true; onAuthenticated({ demo: true }); }}
                className="w-full mt-3 flex items-center justify-center gap-2 text-[12.5px] font-medium text-slate-500 hover:text-[#16A34A] border border-slate-200 rounded-xl py-2.5 transition-colors">
                <Sparkles size={13} className="text-[#16A34A]" /> Preview demo — no account needed
              </button>
              {!IS_CONFIGURED && <p className="text-center text-[11px] text-slate-400 mt-3">Demo mode — any credentials continue to the sample company.</p>}
            </div>
          </div>
          <p className="text-center text-[11px] text-slate-400 mt-4">© {new Date().getFullYear()} Smart Manager · Enterprise Business Ecosystem</p>
        </div>
      </div>
    </div>
  );
}

// Real inline brand glyphs — not a lucide icon standing in for a brand
// mark, and not an external image asset this environment has no way to
// fetch. Google's four-color "G" and Microsoft's four-square mark are
// simple enough to reproduce faithfully as inline SVG/CSS.
function GoogleGlyph({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="shrink-0">
      <path fill="#EA4335" d="M24 9.5c3.4 0 6.4 1.2 8.8 3.5l6.5-6.5C35.3 2.6 30 0.5 24 0.5 14.9 0.5 7.1 5.7 3.3 13.3l7.6 5.9C12.7 13.3 17.9 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.6c-.5 3-2.2 5.5-4.7 7.2l7.3 5.7c4.3-3.9 6.8-9.7 6.8-17.4z" />
      <path fill="#FBBC05" d="M10.9 28.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6l-7.6-5.9C1.6 16.7 0.5 20.2 0.5 24s1.1 7.3 2.8 10.5l7.6-5.9z" />
      <path fill="#34A853" d="M24 47.5c6 0 11.3-2 15-5.4l-7.3-5.7c-2 1.4-4.6 2.2-7.7 2.2-6.1 0-11.3-3.8-13.1-9.5l-7.6 5.9C7.1 42.3 14.9 47.5 24 47.5z" />
    </svg>
  );
}

function MicrosoftGlyph({ size = 18 }) {
  return (
    <span className="grid grid-cols-2 gap-[2px] shrink-0" style={{ width: size, height: size }}>
      <span style={{ backgroundColor: "#F25022" }} /><span style={{ backgroundColor: "#7FBA00" }} />
      <span style={{ backgroundColor: "#00A4EF" }} /><span style={{ backgroundColor: "#FFB900" }} />
    </span>
  );
}

// Two real paths, matching how every real multi-tenant business system
// (Slack, Notion, QuickBooks Online) actually onboards a new customer:
// found a new company (becomes its first Owner) or join one a teammate
// already created (using the join code they share out of band). Neither
// path lets a signup browse or search other companies — see the schema
// comment on companies.join_code for why that is a deliberate privacy
// boundary, not an oversight.
function SignupPage({ onAuthenticated, onSwitchToLogin }) {
  const [mode, setMode] = useState("create"); // "create" | "join"
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [account, setAccount] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [company, setCompany] = useState({
    name: "", category: COMPANY_CATEGORIES[0], country: SIGNUP_COUNTRIES[0], currency: SIGNUP_CURRENCIES[0],
    website: "", taxId: "",
  });
  const [selectedModules, setSelectedModules] = useState(() => new Set(ONBOARDING_MODULES.map((m) => m.id)));
  const [businessScale, setBusinessScale] = useState("large");
  const [firstBranch, setFirstBranch] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinRole, setJoinRole] = useState("Employee");
  const [customerRef, setCustomerRef] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function setAccountField(key, val) { setAccount((a) => ({ ...a, [key]: val })); }
  function setCompanyField(key, val) { setCompany((c) => ({ ...c, [key]: val })); }
  function toggleModule(id) {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const step1Valid = account.fullName.trim() && account.email.trim() && account.password.length >= 6 && account.password === account.confirmPassword;
  const isPortalRole = joinRole === "External Client" || joinRole === "Supplier";
  const step2Valid = mode === "create" ? company.name.trim().length > 1 : joinCode.trim().length >= 6 && (!isPortalRole || customerRef.trim().length > 0);

  async function handleFinalSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!step2Valid) return;

    // Demo mode: no backend to create a real account or company against —
    // simulate the outcome locally and say so, rather than silently doing
    // nothing or pretending a real signup happened.
    if (!IS_CONFIGURED) {
      notify(`Demo mode — no Supabase project connected, so "${company.name || "your company"}" is not really created. Continuing with the sample company instead.`);
      onAuthenticated(null);
      return;
    }

    setBusy(true);
    try {
      const signUpResult = await authSignUp(account.email.trim(), account.password);
      // A project with email confirmation enabled returns a user but no
      // session yet; a project with confirmation disabled (the simpler
      // setup for an internal business tool) returns both immediately.
      let accessToken = signUpResult.access_token;
      if (!accessToken) {
        throw new Error("Account created — check your email to confirm it, then sign in.");
      }
      if (typeof window !== "undefined") window.localStorage.setItem("bs_access_token", accessToken);

      const rpcResult = mode === "create"
        ? await callRpc("create_company_and_owner", {
            p_name: company.name.trim(), p_industry: company.category, p_country: company.country, p_currency: company.currency, p_full_name: account.fullName.trim(),
          }, accessToken)
        : await callRpc("join_company_with_code", {
            p_join_code: joinCode.trim(), p_full_name: account.fullName.trim(), p_role: joinRole, p_customer_ref: isPortalRole ? customerRef.trim() : null,
          }, accessToken);

      // Real fields the create_company_and_owner RPC does not take directly
      // (phone, website, tax ID, and which modules to enable) are saved as
      // a real follow-up update — kept genuinely optional and non-blocking:
      // if this second call fails, the account and company both still
      // exist correctly, just without these details filled in yet.
      if (mode === "create" && rpcResult?.id) {
        try {
          await sb("companies").eq("id", rpcResult.id).update({ website: company.website || null, tax_id: company.taxId || null, business_scale: businessScale }).run();
          await sb("company_modules").insert(ONBOARDING_MODULES.map((m) => ({ company_id: rpcResult.id, module_key: m.id, enabled: selectedModules.has(m.id) }))).run();
          await sb("branches").insert({ company_id: rpcResult.id, name: firstBranch.trim() || "Head Office", is_headquarters: true }).run();
        } catch (_e) { /* the account and company are real either way; onboarding details can be finished later in Settings */ }
      }
      if (account.phone.trim()) {
        try { await sb("profiles").eq("id", signUpResult.user.id).update({ phone: account.phone.trim() }).run(); } catch (_e) { /* non-blocking */ }
      }

      onAuthenticated({
        userId: signUpResult.user.id, email: signUpResult.user.email, accessToken,
        fullName: account.fullName.trim(), role: mode === "create" ? "Organization Owner" : joinRole,
        customerRef: isPortalRole ? customerRef.trim() : null, company: rpcResult,
      });
    } catch (err) {
      setError(err.message || "Couldn't complete sign up. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const totalSteps = mode === "create" ? 2 : 1;

  // Step labels per mode
  const stepLabels = mode === "create"
    ? ["Account", "Company"]
    : ["Join"];

  const gradientBg = "linear-gradient(160deg, #052614 0%, #0F4D26 35%, #16A34A 70%, #22C55E 100%)";

  return (
    <div className="min-h-screen w-full flex" style={{ fontFamily: "'Inter',system-ui,sans-serif" }}>
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-12" style={{ background: gradientBg }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle,#4ADE80 0%,transparent 70%)", top: "-100px", right: "-80px", filter: "blur(70px)" }} />
          <div className="absolute w-64 h-64 rounded-full opacity-15" style={{ background: "radial-gradient(circle,#BBF7D0 0%,transparent 70%)", bottom: "5%", left: "10%", filter: "blur(50px)" }} />
          <svg className="absolute opacity-8" style={{ bottom: "15%", right: "5%", width: 180, height: 208 }} viewBox="0 0 120 140">
            <polygon points="60,6 114,33 114,107 60,134 6,107 6,33" fill="none" stroke="#4ADE80" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <svg width="40" height="46" viewBox="0 0 120 140">
              <defs><linearGradient id="slg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#16A34A"/></linearGradient></defs>
              <polygon points="60,6 114,33 114,107 60,134 6,107 6,33" fill="url(#slg)"/>
              <text x="60" y="76" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="52" fontWeight="900" fontFamily="Poppins,sans-serif">S</text>
            </svg>
            <div>
              <p className="text-white font-bold text-[18px] leading-tight" style={{ fontFamily: "Poppins,sans-serif" }}>Smart Manager</p>
              <p className="text-white/50 text-[11px] tracking-wide uppercase">Enterprise Edition</p>
            </div>
          </div>
          <h2 className="text-[34px] font-bold text-white leading-tight mb-4" style={{ fontFamily: "Poppins,sans-serif" }}>Start managing your business the smart way</h2>
          <p className="text-white/65 text-[14px] leading-relaxed mb-8">Set up in minutes. Everything from sales to tax, payroll, and AI insights — ready on day one.</p>
          <div className="space-y-3">
            {["Free to get started","No credit card required","Tanzania-first, Africa-ready","AI-powered from day one"].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#4ADE80]/20 flex items-center justify-center shrink-0"><CheckCircle2 size={12} className="text-[#4ADE80]" /></div>
                <p className="text-white/80 text-[13px]">{f}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/30 text-[11px]">© {new Date().getFullYear()} Smart Manager · Enterprise Business Ecosystem</p>
      </div>

      {/* Right — the stepped form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#F8FAFC] overflow-y-auto">
        <div className="w-full max-w-md py-6">

          {/* Mobile brand */}
          <div className="flex lg:hidden flex-col items-center mb-7">
            <svg width="44" height="51" viewBox="0 0 120 140" className="mb-2">
              <defs><linearGradient id="mslg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4ADE80"/><stop offset="100%" stopColor="#16A34A"/></linearGradient></defs>
              <polygon points="60,6 114,33 114,107 60,134 6,107 6,33" fill="url(#mslg)"/>
              <text x="60" y="76" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="52" fontWeight="900" fontFamily="Poppins,sans-serif">S</text>
            </svg>
            <p className="font-bold text-[#111827] text-[18px]" style={{ fontFamily: "Poppins,sans-serif" }}>Smart Manager</p>
          </div>

          {/* Mode switcher */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 mb-6">
            {["create","join"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setStep(1); setError(null); }}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-all ${mode === m ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>
                {m === "create" ? "🏢 Create company" : "🔑 Join with code"}
              </button>
            ))}
          </div>

          {/* Progress */}
          {totalSteps > 1 && (
            <div className="flex items-center gap-2 mb-6">
              {Array.from({length: totalSteps}, (_, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: (step > i + 1) ? "#16A34A" : step === i + 1 ? "#16A34A" : "#E5E7EB", color: (step >= i + 1) ? "white" : "#9CA3AF" }}>
                    {(step > i + 1) ? <CheckCircle2 size={12}/> : i + 1}
                  </div>
                  <p className={`text-[11.5px] font-medium ${step === i + 1 ? "text-[#111827]" : "text-slate-400"}`}>{stepLabels[i]}</p>
                  {i < totalSteps - 1 && <div className="flex-1 h-px" style={{ backgroundColor: (step > i + 1) ? "#16A34A" : "#E5E7EB" }} />}
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 sm:p-8">
            {error && <div className="mb-5 flex items-start gap-2 px-3.5 py-3 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-700"><AlertCircle size={13} className="shrink-0 mt-0.5"/><span>{error}</span></div>}

            {/* JOIN mode */}
            {mode === "join" && (
              <div className="space-y-4">
                <div><h2 className="text-[20px] font-bold text-[#111827]" style={{ fontFamily: "Poppins,sans-serif" }}>Join your company</h2><p className="text-[13px] text-slate-500 mt-0.5">Enter the code your admin shared with you</p></div>
                <AuthTextField label="Full name" icon={User} value={account.fullName} onChange={(e) => setAccountField("fullName", e.target.value)} placeholder="Your full name" />
                <AuthTextField label="Email address" icon={Mail} type="email" value={account.email} onChange={(e) => setAccountField("email", e.target.value)} placeholder="you@company.tz" />
                <AuthTextField label="Password" icon={Lock} type={showPassword ? "text" : "password"} value={account.password} onChange={(e) => setAccountField("password", e.target.value)} placeholder="Min. 6 characters" />
                <AuthTextField label="Join code" icon={Lock} value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. a3f9b2" />
                <div>
                  <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Your role</label>
                  <select className={inputClass} value={joinRole} onChange={(e) => setJoinRole(e.target.value)}>
                    {ROLES.filter((r) => r !== "Organization Owner").map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                {isPortalRole && <AuthTextField label="Customer or supplier reference" icon={Building2} value={customerRef} onChange={(e) => setCustomerRef(e.target.value)} placeholder="As it appears in the system" />}
                <button onClick={handleSubmit} disabled={busy || !account.fullName.trim() || !account.email.trim() || !account.password || !joinCode.trim()}
                  className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg,#16A34A,#22C55E)", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>
                  {busy ? "Joining…" : "Join company"}
                </button>
              </div>
            )}

            {/* CREATE mode — Step 1: Account */}
            {mode === "create" && step === 1 && (
              <div className="space-y-4">
                <div><h2 className="text-[20px] font-bold text-[#111827]" style={{ fontFamily: "Poppins,sans-serif" }}>Create your account</h2><p className="text-[13px] text-slate-500 mt-0.5">Step 1 of 2 — personal details</p></div>
                <AuthTextField label="Full name" icon={User} value={account.fullName} onChange={(e) => setAccountField("fullName", e.target.value)} placeholder="Your full name" />
                <AuthTextField label="Email address" icon={Mail} type="email" value={account.email} onChange={(e) => setAccountField("email", e.target.value)} placeholder="you@company.tz" />
                <div>
                  <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={account.password} onChange={(e) => setAccountField("password", e.target.value)} placeholder="Min. 6 characters"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 pr-11 text-[13.5px] text-[#111827] placeholder-slate-300 outline-none focus:border-[#16A34A] focus:ring-2 focus:ring-[#16A34A]/20 transition-all" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                  </div>
                </div>
                <AuthTextField label="Confirm password" icon={Lock} type="password" value={account.confirmPassword} onChange={(e) => setAccountField("confirmPassword", e.target.value)} placeholder="Repeat password" />
                {account.password && account.confirmPassword && account.password !== account.confirmPassword && (
                  <p className="text-[11.5px] text-red-500 flex items-center gap-1"><AlertCircle size={11}/> Passwords do not match</p>
                )}
                <button onClick={() => { if (step1Valid) setStep(2); }} disabled={!step1Valid}
                  className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg,#16A34A,#22C55E)", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>
                  Continue →
                </button>
              </div>
            )}

            {/* CREATE mode — Step 2: Company */}
            {mode === "create" && step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button onClick={() => setStep(1)} className="text-slate-400 hover:text-slate-600"><ChevronLeft size={18}/></button>
                  <div><h2 className="text-[20px] font-bold text-[#111827]" style={{ fontFamily: "Poppins,sans-serif" }}>Your company</h2><p className="text-[13px] text-slate-500">Step 2 of 2 — business details</p></div>
                </div>
                <AuthTextField label="Company name *" icon={Building2} value={company.name} onChange={(e) => setCompanyField("name", e.target.value)} placeholder="e.g. Kilimanjaro Traders Ltd" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Country</label>
                    <select className={inputClass} value={company.country} onChange={(e) => setCompanyField("country", e.target.value)}>
                      {SIGNUP_COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Currency</label>
                    <select className={inputClass} value={company.currency} onChange={(e) => setCompanyField("currency", e.target.value)}>
                      {SIGNUP_CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Industry</label>
                  <select className={inputClass} value={company.category} onChange={(e) => setCompanyField("category", e.target.value)}>
                    {COMPANY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <AuthTextField label="First branch name" icon={Building2} value={firstBranch} onChange={(e) => setFirstBranch(e.target.value)} placeholder="Head Office" />
                <button onClick={handleSubmit} disabled={busy || !company.name.trim()}
                  className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(135deg,#16A34A,#22C55E)", boxShadow: "0 4px 14px rgba(22,163,74,0.3)" }}>
                  {busy ? "Creating your account…" : "Launch Smart Manager 🚀"}
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-[12.5px] text-slate-500 mt-5">
            Already have an account? <button type="button" onClick={onSwitchToLogin} className="font-semibold text-[#16A34A] hover:underline">Sign in</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Completes setup for a real OAuth session (Google/Microsoft/Apple) that
// authenticated correctly but has no company yet — the identity is
// already real and verified by the OAuth provider, so this skips the
// personal-details step entirely and goes straight to company setup,
// using the exact same create_company_and_owner / join_company_with_code
// RPCs email signup uses. No password is collected here — there is not
// one to set; this account will only ever sign in through the same OAuth
// provider again.
function OAuthCompanySetup({ oauthUser, onAuthenticated, onCancel }) {
  const [mode, setMode] = useState("create");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [fullName, setFullName] = useState(oauthUser.fullName || "");
  const [company, setCompany] = useState({ name: "", category: COMPANY_CATEGORIES[0], country: SIGNUP_COUNTRIES[0], currency: SIGNUP_CURRENCIES[0], website: "", taxId: "" });
  const [selectedModules, setSelectedModules] = useState(() => new Set(ONBOARDING_MODULES.map((m) => m.id)));
  const [businessScale, setBusinessScale] = useState("large");
  const [firstBranch, setFirstBranch] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinRole, setJoinRole] = useState("Employee");
  const [customerRef, setCustomerRef] = useState("");

  function setCompanyField(key, val) { setCompany((c) => ({ ...c, [key]: val })); }
  function toggleModule(id) {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  const isPortalRole = joinRole === "External Client" || joinRole === "Supplier";
  const valid = fullName.trim() && (mode === "create" ? company.name.trim().length > 1 : joinCode.trim().length >= 6 && (!isPortalRole || customerRef.trim().length > 0));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!valid) return;
    setBusy(true);
    try {
      const rpcResult = mode === "create"
        ? await callRpc("create_company_and_owner", {
            p_name: company.name.trim(), p_industry: company.category, p_country: company.country, p_currency: company.currency, p_full_name: fullName.trim(),
          }, oauthUser.accessToken)
        : await callRpc("join_company_with_code", {
            p_join_code: joinCode.trim(), p_full_name: fullName.trim(), p_role: joinRole, p_customer_ref: isPortalRole ? customerRef.trim() : null,
          }, oauthUser.accessToken);

      if (mode === "create" && rpcResult?.id) {
        try {
          await sb("companies").eq("id", rpcResult.id).update({ website: company.website || null, tax_id: company.taxId || null, business_scale: businessScale }).run();
          await sb("company_modules").insert(ONBOARDING_MODULES.map((m) => ({ company_id: rpcResult.id, module_key: m.id, enabled: selectedModules.has(m.id) }))).run();
          await sb("branches").insert({ company_id: rpcResult.id, name: firstBranch.trim() || "Head Office", is_headquarters: true }).run();
        } catch (_e) { /* the account and company are real either way; onboarding details can be finished later in Settings */ }
      }

      onAuthenticated({
        userId: oauthUser.id, email: oauthUser.email, accessToken: oauthUser.accessToken,
        fullName: fullName.trim(), role: mode === "create" ? "Organization Owner" : joinRole,
        customerRef: isPortalRole ? customerRef.trim() : null, company: rpcResult,
      });
    } catch (err) {
      setError(err.message || "Couldn't complete setup. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F8FAFC] p-4 py-10" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="mb-3 flex justify-center"><BrandMark size={64} textSize={26} /></div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ fontFamily: "'Poppins'" }}>
            <span className="text-[#111827]">SMART</span> <span className="text-[#16A34A]">MANAGER</span>
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-200/60 p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-[18px] font-semibold text-[#111827] mb-1">One more step, {fullName.split(" ")[0] || "there"}</h2>
            <p className="text-[13px] text-slate-500">Signed in as {oauthUser.email} — now set up your organization.</p>
          </div>

          <FormField label="Your name" required><input className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" /></FormField>

          <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
            <button type="button" onClick={() => setMode("create")} className={`flex-1 text-[12.5px] font-medium py-2 rounded-md transition-colors ${mode === "create" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>Create a company</button>
            <button type="button" onClick={() => setMode("join")} className={`flex-1 text-[12.5px] font-medium py-2 rounded-md transition-colors ${mode === "join" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>Join a company</button>
          </div>

          {mode === "create" ? (
            <div className="space-y-4">
              <FormField label="Organization name" required><input className={inputClass} value={company.name} onChange={(e) => setCompanyField("name", e.target.value)} placeholder="e.g. BEIRAHISI HARDWARE" /></FormField>
              <FormField label="Business type">
                <CategoryPicker value={company.category} onChange={(v) => setCompanyField("category", v)} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Country">
                  <select className={inputClass} value={company.country} onChange={(e) => setCompanyField("country", e.target.value)}>
                    {SIGNUP_COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
                <FormField label="Currency">
                  <select className={inputClass} value={company.currency} onChange={(e) => setCompanyField("currency", e.target.value)}>
                    {SIGNUP_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormField>
              </div>
              <div>
                <label className="text-[12.5px] font-medium text-slate-600 block mb-2">Business scale</label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ id: "small", label: "Small Business", hint: "One location, lean team" }, { id: "large", label: "Large Business", hint: "Multiple departments" }].map((s) => (
                    <button
                      key={s.id} type="button"
                      onClick={() => { setBusinessScale(s.id); setSelectedModules(new Set(s.id === "small" ? getIndustryProfile(company.category).recommendedModules : SCALE_MODULE_PRESETS.large)); }}
                      className={`text-left rounded-xl border px-3.5 py-2.5 transition-colors ${businessScale === s.id ? "border-[#16A34A]/50" : "border-slate-200 hover:border-slate-300"}`}
                      style={businessScale === s.id ? { backgroundColor: "#DCFCE7" } : undefined}
                    >
                      <p className={`text-[12.5px] font-medium ${businessScale === s.id ? "text-[#111827]" : "text-slate-600"}`}>{s.label}</p>
                      <p className="text-[10.5px] text-slate-400">{s.hint}</p>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Sets a sensible starting set of modules below — nothing is locked away either way.</p>
              </div>
              <div>
                <label className="text-[12.5px] font-medium text-slate-600 block mb-2">Select modules to use</label>
                <div className="grid grid-cols-3 gap-2">
                  {ONBOARDING_MODULES.map((m) => {
                    const Icon = m.icon;
                    const on = selectedModules.has(m.id);
                    return (
                      <button key={m.id} type="button" onClick={() => toggleModule(m.id)} className={`flex flex-col items-center gap-1 rounded-lg border py-2.5 px-1 transition-colors ${on ? "border-[#16A34A]/40 bg-[#16A34A]/5" : "border-slate-200"}`}>
                        <Icon size={15} className={on ? "text-[#16A34A]" : "text-slate-400"} />
                        <span className={`text-[10.5px] font-medium text-center leading-tight ${on ? "text-[#111827]" : "text-slate-400"}`}>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <FormField label="Your first branch or location (optional)">
                <input className={inputClass} value={firstBranch} onChange={(e) => setFirstBranch(e.target.value)} placeholder="e.g. Kariakoo Branch — defaults to Head Office" />
              </FormField>
            </div>
          ) : (
            <div className="space-y-4">
              <FormField label="Company join code" required><input className={inputClass} value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="e.g. A1B2C3D4" /></FormField>
              <FormField label="Your role">
                <select className={inputClass} value={joinRole} onChange={(e) => setJoinRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r.id} value={r.id}>{r.id}</option>)}
                </select>
              </FormField>
              {isPortalRole && (
                <FormField label="Your company name, exactly as it appears on your records" required>
                  <input className={inputClass} value={customerRef} onChange={(e) => setCustomerRef(e.target.value)} placeholder="e.g. Kilimo Fresh Distributors" />
                </FormField>
              )}
            </div>
          )}

          {error && <p className="text-[12.5px] text-[#EF4444] rounded-lg px-3 py-2" style={{ backgroundColor: "#FEE2E2" }}>{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="btn-secondary flex-1 text-[13px] font-medium rounded-lg py-3">Cancel</button>
            <button type="submit" disabled={!valid || busy} aria-label="Finish setup" className="flex-[2] btn-primary text-white text-[14px] font-semibold rounded-lg py-3 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              {busy ? <LoaderCircle size={16} className="animate-spin" /> : "Finish Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------- SHELL ----------------------------------- */


// ═══════════════════════════════════════════════════════════════════════════
// VICOBA / SACCOS COMMUNITY SAVINGS MODULE
// Handles: member registry, weekly share contributions, loan applications,
// loan approvals, repayments, fines, dividend distribution, meeting minutes.
// Used by: VICOBA groups, SACCOS, investment clubs, table banking groups.
// ═══════════════════════════════════════════════════════════════════════════

const VICOBA_MEMBER_SEED = [
  { id: "MBR-001", name: "Amina Hassan",   phone: "0712-345-678", shares: 24, contributions: 480, joinedDate: "2024-01-15", status: "Active",  gender: "F" },
  { id: "MBR-002", name: "John Mwangi",    phone: "0756-789-012", shares: 18, contributions: 360, joinedDate: "2024-01-15", status: "Active",  gender: "M" },
  { id: "MBR-003", name: "Fatuma Juma",    phone: "0783-456-123", shares: 30, contributions: 600, joinedDate: "2024-02-01", status: "Active",  gender: "F" },
  { id: "MBR-004", name: "Peter Kamau",    phone: "0622-111-222", shares: 12, contributions: 240, joinedDate: "2024-03-10", status: "Active",  gender: "M" },
  { id: "MBR-005", name: "Grace Mwenda",   phone: "0769-333-444", shares: 20, contributions: 400, joinedDate: "2024-01-15", status: "Active",  gender: "F" },
  { id: "MBR-006", name: "David Odhiambo", phone: "0744-555-666", shares: 8,  contributions: 160, joinedDate: "2024-04-05", status: "Defaulter",gender: "M" },
];

const VICOBA_LOAN_SEED = [
  { id: "VL-001", memberId: "MBR-001", memberName: "Amina Hassan",   amount: 500,  rate: 10, weeks: 12, disbursed: "2026-01-15", status: "Active",    balance: 280 },
  { id: "VL-002", memberId: "MBR-003", memberName: "Fatuma Juma",    amount: 1000, rate: 10, weeks: 24, disbursed: "2026-02-01", status: "Active",    balance: 650 },
  { id: "VL-003", memberId: "MBR-002", memberName: "John Mwangi",    amount: 300,  rate: 10, weeks: 8,  disbursed: "2025-11-10", status: "Repaid",    balance: 0   },
  { id: "VL-004", memberId: "MBR-006", memberName: "David Odhiambo", amount: 200,  rate: 10, weeks: 8,  disbursed: "2025-12-01", status: "Defaulted", balance: 180 },
];

const VICOBA_MEETING_SEED = [
  { id: "MTG-001", date: "2026-07-07", venue: "Community Hall", attendees: 5, totalBuyIn: 240, loansGiven: 1, minutes: "Reviewed Q2 performance. Elected new treasurer. Approved 1 loan application." },
  { id: "MTG-002", date: "2026-06-30", venue: "Chairperson's House", attendees: 6, totalBuyIn: 288, loansGiven: 0, minutes: "Annual dividend discussion. All members present. Fine collected from 1 member." },
];

export default LoginPage;
