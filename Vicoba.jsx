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


function VicobaSaccosModule({ currentUser }) {
  const [tab, setTab] = useState("overview");
  const members  = useCompanyTable("vicoba_members",  VICOBA_MEMBER_SEED,  { mapRow: (r) => ({ ...r, shares: r.shares||0, contributions: r.contributions||0 }) });
  const loans    = useCompanyTable("vicoba_loans",    VICOBA_LOAN_SEED,    { mapRow: (r) => ({ ...r, balance: r.balance||0 }) });
  const meetings = useCompanyTable("vicoba_meetings", VICOBA_MEETING_SEED, { mapRow: (r) => r });
  const [memberForm, setMemberForm] = useState({ name:"", phone:"", gender:"F", shares:1 });
  const [loanForm,   setLoanForm]   = useState({ memberId:"", amount:"", weeks:12, rate:10 });
  const [meetingForm,setMeetingForm]= useState({ date: TODAY.toISOString().slice(0,10), venue:"", attendees:"", totalBuyIn:"", minutes:"" });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showLoanForm,   setShowLoanForm]   = useState(false);
  const [showMeetingForm,setShowMeetingForm]= useState(false);

  const totalShares       = members.rows.reduce((s,m) => s + m.shares, 0);
  const totalFund         = members.rows.reduce((s,m) => s + m.contributions, 0);
  const activeLoans       = loans.rows.filter((l) => l.status === "Active");
  const totalLoanPortfolio= activeLoans.reduce((s,l) => s + l.balance, 0);
  const defaulted         = loans.rows.filter((l) => l.status === "Defaulted");
  const SHARE_PRICE       = 20; // TZS 20k per share

  const VICOBA_TABS = [
    { id:"overview",   label:"Overview",   icon: LayoutDashboard },
    { id:"members",    label:"Members",    icon: Users },
    { id:"loans",      label:"Loans",      icon: CircleDollarSign },
    { id:"meetings",   label:"Meetings",   icon: CalendarCheck },
    { id:"dividends",  label:"Dividends",  icon: TrendingUp },
  ];

  async function addMember() {
    if (!memberForm.name.trim()) return;
    const row = { id: docId("MBR"), name: memberForm.name.trim(), phone: memberForm.phone, gender: memberForm.gender,
      shares: Number(memberForm.shares)||1, contributions: (Number(memberForm.shares)||1)*SHARE_PRICE,
      joinedDate: TODAY.toISOString().slice(0,10), status:"Active" };
    members.setRows((prev) => [row, ...prev]);
    setMemberForm({ name:"", phone:"", gender:"F", shares:1 });
    setShowMemberForm(false);
    notify("Member " + row.name + " added");
    if (IS_CONFIGURED) { try { await sb("vicoba_members").insert({ name:row.name, phone:row.phone, gender:row.gender, shares:row.shares, contributions:row.contributions, joined_date:row.joinedDate, status:"Active" }).run(); } catch(_e){} }
  }

  async function disburseLoan() {
    if (!loanForm.memberId || !loanForm.amount) return;
    const member = members.rows.find((m) => m.id === loanForm.memberId);
    const total  = Number(loanForm.amount) * (1 + Number(loanForm.rate)/100);
    const row = { id: docId("VL"), memberId: loanForm.memberId, memberName: member?.name||"",
      amount: Number(loanForm.amount), rate: Number(loanForm.rate), weeks: Number(loanForm.weeks),
      disbursed: TODAY.toISOString().slice(0,10), status:"Active", balance: total };
    loans.setRows((prev) => [row, ...prev]);
    setLoanForm({ memberId:"", amount:"", weeks:12, rate:10 });
    setShowLoanForm(false);
    notify("Loan of TZS " + money(row.amount) + "k disbursed to " + member?.name);
    if (IS_CONFIGURED) { try { await sb("vicoba_loans").insert({ member_id:row.memberId, amount:row.amount, rate:row.rate, weeks:row.weeks, disbursed:row.disbursed, status:"Active", balance:row.balance }).run(); } catch(_e){} }
  }

  async function repayLoan(loan, amount) {
    const newBal = Math.max(0, loan.balance - amount);
    const newStatus = newBal <= 0 ? "Repaid" : "Active";
    loans.setRows((prev) => prev.map((l) => l.id===loan.id ? {...l, balance: newBal, status: newStatus} : l));
    notify("TZS " + money(amount) + "k repayment recorded for " + loan.memberName);
    logAudit("Loan repayment: " + loan.id, "VICOBA", currentUser?.name||"System", "TZS " + money(amount) + "k");
  }

  async function addMeeting() {
    if (!meetingForm.venue.trim()) return;
    const row = { id: docId("MTG"), ...meetingForm, attendees: Number(meetingForm.attendees)||0, totalBuyIn: Number(meetingForm.totalBuyIn)||0, loansGiven: 0 };
    meetings.setRows((prev) => [row, ...prev]);
    setMeetingForm({ date: TODAY.toISOString().slice(0,10), venue:"", attendees:"", totalBuyIn:"", minutes:"" });
    setShowMeetingForm(false);
    notify("Meeting recorded for " + row.date);
  }

  // Dividend calculation — distributes profit proportional to shares held
  const totalInterestEarned = loans.rows.reduce((s,l) => s + (l.amount * l.rate/100), 0);
  const dividendPerShare = totalShares > 0 ? totalInterestEarned / totalShares : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden px-5 py-5 relative" style={{background:"linear-gradient(135deg,#1E3A5F 0%,#2563EB 60%,#1D4ED8 100%)"}}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[19px] font-bold text-white">VICOBA / SACCOS Manager</h1>
            <p className="text-[12px] mt-0.5" style={{color:"rgba(255,255,255,.65)"}}>Community savings & credit management &middot; {members.rows.length} members &middot; Cycle 2026</p>
          </div>
          <div className="flex gap-2">
            <button onClick={()=>downloadCSV("vicoba-members",members.rows.map(m=>({
              ID:m.id,Name:m.name||"",Phone:m.phone||"",Shares:m.shares||0,
              Savings_k:m.savings||0,Balance_k:m.balance||0,Status:m.status||"Active"
            })),[{key:"ID",label:"ID"},{key:"Name",label:"Name"},{key:"Phone",label:"Phone"},
              {key:"Shares",label:"Shares"},{key:"Savings_k",label:"Savings (TZS k)"},
              {key:"Balance_k",label:"Balance (TZS k)"},{key:"Status",label:"Status"}])}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white" style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)"}}>
              <Download size={13}/> CSV
            </button>
            <button onClick={() => setShowMemberForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white" style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)"}}><UserPlus size={13}/>Add Member</button>
            <button onClick={() => setShowLoanForm(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white" style={{background:"rgba(255,255,255,.2)",border:"1px solid rgba(255,255,255,.3)"}}><Plus size={13}/>New Loan</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto">
        {VICOBA_TABS.map((t) => {
          const I = t.icon;
          return <button key={t.id} onClick={() => setTab(t.id)} className={"flex items-center gap-1.5 flex-1 justify-center py-2 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap " + (tab===t.id?"bg-[#2563EB] text-white shadow-sm":"text-slate-500 hover:bg-slate-50")}><I size={13}/>{t.label}</button>;
        })}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label:"Total Members", value: members.rows.length, sub: members.rows.filter(m=>m.status==="Active").length+" active", icon: Users, color:"#2563EB" },
              { label:"Group Fund",    value: "TZS "+money(totalFund)+"k", sub:"Total contributions", icon: Wallet, color:"#16A34A" },
              { label:"Loan Portfolio",value: "TZS "+money(totalLoanPortfolio)+"k", sub: activeLoans.length+" active loans", icon: CircleDollarSign, color:"#F59E0B" },
              { label:"Defaulted",     value: "TZS "+money(defaulted.reduce((s,l)=>s+l.balance,0))+"k", sub: defaulted.length+" loans at risk", icon: AlertCircle, color:"#EF4444" },
            ].map((k) => (
              <div key={k.label} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{k.label}</p>
                    <p className="text-[21px] font-bold mt-1 text-[#111827]">{k.value}</p>
                    <p className="text-[11px] mt-0.5" style={{color:k.color}}>{k.sub}</p>
                  </div>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{background:k.color+"18"}}><k.icon size={17} style={{color:k.color}}/></div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[13.5px] font-semibold text-[#111827] mb-3">Share Distribution — Top Members</p>
              {(() => {
                const shareData = [...members.rows].sort((a,b)=>b.shares-a.shares).slice(0,6).map((m,i)=>({
                  name: m.name.split(" ")[0],
                  value: m.shares,
                  fill: ["#2563EB","#16A34A","#D97706","#7C3AED","#EF4444","#0891B2"][i%6],
                }));
                return shareData.length===0?<p className="text-slate-400 text-center py-4">No members</p>:(
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={shareData} margin={{left:0,right:10,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                      <XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={(v)=>[v+" shares","Shares"]}/>
                      <Bar dataKey="value" radius={[4,4,0,0]} maxBarSize={36}>
                        {shareData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[13.5px] font-semibold text-[#111827] mb-3">Loan Portfolio Status</p>
              {(() => {
                const loanStatusData = [
                  {name:"Active",   value:loans.rows.filter(l=>l.status==="Active").length,   fill:"#2563EB"},
                  {name:"Repaid",   value:loans.rows.filter(l=>l.status==="Repaid").length,   fill:"#16A34A"},
                  {name:"Defaulted",value:loans.rows.filter(l=>l.status==="Defaulted").length,fill:"#EF4444"},
                ].filter(d=>d.value>0);
                return loanStatusData.length===0?<p className="text-slate-400 text-center py-4">No loans yet</p>:(
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={150}>
                      <RPieChart><Pie data={loanStatusData} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={30}>
                        {loanStatusData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Pie><Tooltip formatter={(v,n)=>[v+" loans",n]}/></RPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {loanStatusData.map(d=>(
                        <div key={d.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[12px]"><span className="w-2.5 h-2.5 rounded-full" style={{background:d.fill}}/>{d.name}</span>
                          <span className="text-[13px] font-bold" style={{color:d.fill}}>{d.value}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-[11.5px] text-slate-500">Interest Earned: <strong className="text-[#16A34A]">TZS {money(Math.round(totalInterestEarned))}k</strong></p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
        </div>
      )}

      {/* Members */}
      {tab === "members" && (
        <div className="space-y-3">
          {showMemberForm && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              <p className="text-[13.5px] font-semibold text-[#111827]">Add New Member</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FormField label="Full Name"><input className={inputClass} value={memberForm.name} onChange={e=>setMemberForm({...memberForm,name:e.target.value})} placeholder="Full name"/></FormField>
                <FormField label="Phone"><input className={inputClass} value={memberForm.phone} onChange={e=>setMemberForm({...memberForm,phone:e.target.value})} placeholder="07XX XXX XXX"/></FormField>
                <FormField label="Gender"><select className={inputClass} value={memberForm.gender} onChange={e=>setMemberForm({...memberForm,gender:e.target.value})}><option value="F">Female</option><option value="M">Male</option></select></FormField>
                <FormField label="Initial Shares"><input type="number" min="1" className={inputClass} value={memberForm.shares} onChange={e=>setMemberForm({...memberForm,shares:e.target.value})} placeholder="1"/></FormField>
              </div>
              <div className="flex gap-2"><button onClick={addMember} className="btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5">Save Member</button><button onClick={()=>setShowMemberForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button></div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {["Member","Phone","Gender","Shares","Fund (TZS k)","Status",""].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}
              </tr></thead>
              <tbody>
                {members.rows.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:"#2563EB"}}>{m.name.charAt(0)}</div><span className="font-medium text-[#111827]">{m.name}</span></div></td>
                    <td className="px-4 py-3 text-slate-500">{m.phone}</td>
                    <td className="px-4 py-3 text-slate-500">{m.gender==="F"?"Female":"Male"}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#111827]">{m.shares}</td>
                    <td className="px-4 py-3 font-mono text-[#16A34A]">{money(m.contributions)}k</td>
                    <td className="px-4 py-3"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:m.status==="Active"?"#DCFCE7":m.status==="Defaulter"?"#FEE2E2":"#F3F4F6",color:m.status==="Active"?"#16A34A":m.status==="Defaulter"?"#EF4444":"#6B7280"}}>{m.status}</span></td>
                    <td className="px-4 py-3"><button onClick={()=>setLoanForm({...loanForm,memberId:m.id})} className="text-[11px] text-[#2563EB] hover:underline">Loan</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loans */}
      {tab === "loans" && (
        <div className="space-y-3">
          {showLoanForm && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              <p className="text-[13.5px] font-semibold text-[#111827]">New Loan Application</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FormField label="Member">
                  <select className={inputClass} value={loanForm.memberId} onChange={e=>setLoanForm({...loanForm,memberId:e.target.value})}>
                    <option value="">Select member...</option>
                    {members.rows.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </FormField>
                <FormField label="Amount (TZS k)"><input type="number" min="0" className={inputClass} value={loanForm.amount} onChange={e=>setLoanForm({...loanForm,amount:e.target.value})} placeholder="0"/></FormField>
                <FormField label="Interest Rate (%)"><input type="number" className={inputClass} value={loanForm.rate} onChange={e=>setLoanForm({...loanForm,rate:e.target.value})}/></FormField>
                <FormField label="Repayment Weeks"><input type="number" min="1" className={inputClass} value={loanForm.weeks} onChange={e=>setLoanForm({...loanForm,weeks:e.target.value})}/></FormField>
              </div>
              {loanForm.amount && <p className="text-[12px] text-slate-500">Total repayable: <strong className="text-[#111827]">TZS {money(Number(loanForm.amount)*(1+loanForm.rate/100))}k</strong> &middot; Weekly: <strong>TZS {money(Number(loanForm.amount)*(1+loanForm.rate/100)/loanForm.weeks)}k</strong></p>}
              <div className="flex gap-2"><button onClick={disburseLoan} className="btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5">Disburse Loan</button><button onClick={()=>setShowLoanForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button></div>
            </div>
          )}
          {!showLoanForm && <div className="flex justify-end"><button onClick={()=>setShowLoanForm(true)} className="flex items-center gap-1.5 btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5"><Plus size={13}/>New Loan</button></div>}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {["Loan ID","Member","Principal","Interest","Balance","Status","Action"].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}
              </tr></thead>
              <tbody>
                {loans.rows.map((l) => {
                  const interest = l.amount * l.rate / 100;
                  const pct = l.balance / (l.amount + interest) * 100;
                  return (
                    <tr key={l.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 font-mono font-medium text-[#2563EB]">{l.id}</td>
                      <td className="px-4 py-3 font-medium text-[#111827]">{l.memberName}</td>
                      <td className="px-4 py-3 font-mono">{money(l.amount)}k</td>
                      <td className="px-4 py-3 font-mono text-[#F59E0B]">{money(interest)}k</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:Math.max(0,pct)+"%",background:l.status==="Defaulted"?"#EF4444":"#2563EB"}}/></div>
                          <span className="font-mono text-[11.5px] font-bold" style={{color:l.status==="Defaulted"?"#EF4444":"#111827"}}>{money(l.balance)}k</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:l.status==="Active"?"#DBEAFE":l.status==="Repaid"?"#DCFCE7":"#FEE2E2",color:l.status==="Active"?"#2563EB":l.status==="Repaid"?"#16A34A":"#EF4444"}}>{l.status}</span></td>
                      <td className="px-4 py-3">{l.status==="Active"&&<button onClick={()=>{ const amt=prompt("Amount received (TZS k):"); if(amt&&Number(amt)>0) repayLoan(l,Number(amt)); }} className="text-[11.5px] font-semibold text-white bg-[#16A34A] px-2.5 py-1 rounded-lg">Repay</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Meetings */}
      {tab === "meetings" && (
        <div className="space-y-3">
          {!showMeetingForm && <div className="flex justify-end"><button onClick={()=>setShowMeetingForm(true)} className="flex items-center gap-1.5 btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5"><Plus size={13}/>Record Meeting</button></div>}
          {showMeetingForm && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              <p className="text-[13.5px] font-semibold text-[#111827]">Record Meeting</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FormField label="Date"><input type="date" className={inputClass} value={meetingForm.date} onChange={e=>setMeetingForm({...meetingForm,date:e.target.value})}/></FormField>
                <FormField label="Venue"><input className={inputClass} value={meetingForm.venue} onChange={e=>setMeetingForm({...meetingForm,venue:e.target.value})} placeholder="Meeting location"/></FormField>
                <FormField label="Attendees"><input type="number" className={inputClass} value={meetingForm.attendees} onChange={e=>setMeetingForm({...meetingForm,attendees:e.target.value})}/></FormField>
                <FormField label="Buy-in (TZS k)"><input type="number" className={inputClass} value={meetingForm.totalBuyIn} onChange={e=>setMeetingForm({...meetingForm,totalBuyIn:e.target.value})}/></FormField>
              </div>
              <FormField label="Minutes / Notes">
                <textarea className={inputClass + " min-h-[80px] resize-none"} value={meetingForm.minutes} onChange={e=>setMeetingForm({...meetingForm,minutes:e.target.value})} placeholder="Key decisions, resolutions, actions..."/>
              </FormField>
              <div className="flex gap-2"><button onClick={addMeeting} className="btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5">Save Meeting</button><button onClick={()=>setShowMeetingForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button></div>
            </div>
          )}
          <div className="space-y-3">
            {meetings.rows.map((m) => (
              <div key={m.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div><p className="text-[14px] font-semibold text-[#111827]">Meeting — {m.date}</p><p className="text-[12px] text-slate-400">{m.venue}</p></div>
                  <div className="flex gap-4 text-right">
                    <div><p className="text-[10.5px] text-slate-400">Attendees</p><p className="text-[14px] font-bold text-[#2563EB]">{m.attendees}</p></div>
                    <div><p className="text-[10.5px] text-slate-400">Buy-in</p><p className="text-[14px] font-bold text-[#16A34A]">TZS {money(m.totalBuyIn)}k</p></div>
                  </div>
                </div>
                {m.minutes && <p className="text-[12px] text-slate-500 leading-relaxed">{m.minutes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dividends */}
      {tab === "dividends" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[15px] font-semibold text-[#111827] mb-1">Annual Dividend Projection</h3>
            <p className="text-[12px] text-slate-500 mb-4">Based on current interest earned from all loans. Distributed proportional to shares held.</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-[11px] text-slate-400 mb-1">Total Interest</p><p className="text-[18px] font-bold text-[#16A34A]">TZS {money(totalInterestEarned)}k</p></div>
              <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-[11px] text-slate-400 mb-1">Total Shares</p><p className="text-[18px] font-bold text-[#2563EB]">{totalShares}</p></div>
              <div className="bg-slate-50 rounded-xl p-3 text-center"><p className="text-[11px] text-slate-400 mb-1">Per Share</p><p className="text-[18px] font-bold text-[#111827]">TZS {money(dividendPerShare)}k</p></div>
            </div>
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100"><th className="py-2 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">Member</th><th className="py-2 text-right text-[10.5px] font-medium uppercase tracking-wide text-slate-400">Shares</th><th className="py-2 text-right text-[10.5px] font-medium uppercase tracking-wide text-slate-400">Dividend</th></tr></thead>
              <tbody>
                {[...members.rows].sort((a,b)=>b.shares-a.shares).map((m) => (
                  <tr key={m.id} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 font-medium text-[#111827]">{m.name}</td>
                    <td className="py-2.5 text-right font-mono">{m.shares}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-[#16A34A]">TZS {money(m.shares * dividendPerShare)}k</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// COMMUNITY GROUPS MODULE
// Handles: Table Banking, Investment Clubs, Chamas, Welfare Funds, SUCCESS,
// Church Funds, NGO Project Tracking, Cooperative Societies.
// Each group type has its own workflow but shares the same fund management.
// ═══════════════════════════════════════════════════════════════════════════

const COMMUNITY_GROUP_TYPES = [
  "Table Banking", "Investment Club", "Chama", "Welfare Fund", "SUCCESS Group",
  "Church Fund", "NGO / CBO", "Cooperative", "Youth Group", "Women's Group"
];

const COMM_GROUPS_SEED = [
  { id: "GRP-001", name: "Umoja Investment Club", type: "Investment Club", members: 12, fund: 3600, cycle: "Monthly", startDate: "2024-01-01", status: "Active" },
  { id: "GRP-002", name: "Mama Faida Table Banking", type: "Table Banking",  members: 20, fund: 2400, cycle: "Weekly",  startDate: "2024-03-15", status: "Active" },
  { id: "GRP-003", name: "Vijana SUCCESS Group",    type: "SUCCESS Group",   members: 15, fund: 1800, cycle: "Monthly", startDate: "2025-01-01", status: "Active" },
];

const COMM_CONTRIBUTIONS_SEED = [
  { id: "CTB-001", groupId: "GRP-001", member: "Alice Ng'endo", amount: 100, date: "2026-07-01", type: "Monthly Share",  status: "Paid" },
  { id: "CTB-002", groupId: "GRP-001", member: "Bob Otieno",        amount: 100, date: "2026-07-01", type: "Monthly Share",  status: "Paid" },
  { id: "CTB-003", groupId: "GRP-002", member: "Chama Mwalimu",     amount: 50,  date: "2026-07-07", type: "Weekly Buy-in",  status: "Paid" },
  { id: "CTB-004", groupId: "GRP-001", member: "Diana Waweru",      amount: 100, date: "2026-07-01", type: "Monthly Share",  status: "Pending" },
];

function CommunityGroupsModule({ currentUser }) {
  const [tab, setTab]         = useState("groups");
  const [selGroup, setSelGroup] = useState(null);
  const groups        = useCompanyTable("community_groups",        COMM_GROUPS_SEED,        { mapRow: (r) => ({ ...r, fund: r.fund||0 }) });
  const contributions = useCompanyTable("community_contributions", COMM_CONTRIBUTIONS_SEED, { mapRow: (r) => r });
  const [groupForm,   setGroupForm]   = useState({ name:"", type: COMMUNITY_GROUP_TYPES[0], cycle:"Monthly", startDate: TODAY.toISOString().slice(0,10) });
  const [ctbForm,     setCtbForm]     = useState({ groupId:"", member:"", amount:"", type:"Contribution", date: TODAY.toISOString().slice(0,10) });
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showCtbForm,   setShowCtbForm]   = useState(false);

  const TABS = [
    { id:"groups",        label:"Groups",        icon: Users },
    { id:"contributions", label:"Contributions", icon: CircleDollarSign },
    { id:"welfare",       label:"Welfare Fund",  icon: Heart },
    { id:"reports",       label:"Reports",       icon: BarChart3 },
  ];

  const totalFunds      = groups.rows.reduce((s,g)=>s+g.fund,0);
  const totalMembers    = groups.rows.reduce((s,g)=>s+g.members,0);
  const pendingCtbs     = contributions.rows.filter((c)=>c.status==="Pending");
  const thisMonthCtbs   = contributions.rows.filter((c)=>c.date >= TODAY.toISOString().slice(0,8)+"01");

  async function addGroup() {
    if (!groupForm.name.trim()) return;
    const row = { id: docId("GRP"), ...groupForm, members: 0, fund: 0, status:"Active" };
    groups.setRows((prev) => [row, ...prev]);
    setGroupForm({ name:"", type: COMMUNITY_GROUP_TYPES[0], cycle:"Monthly", startDate: TODAY.toISOString().slice(0,10) });
    setShowGroupForm(false);
    notify("Group '" + row.name + "' created");
    if (IS_CONFIGURED) { try { await sb("community_groups").insert({ name:row.name, type:row.type, cycle:row.cycle, start_date:row.startDate, status:"Active", members:0, fund:0 }).run(); } catch(_e){} }
  }

  async function addContribution() {
    if (!ctbForm.groupId || !ctbForm.member.trim() || !ctbForm.amount) return;
    const row = { id: docId("CTB"), ...ctbForm, amount: Number(ctbForm.amount), status:"Paid" };
    contributions.setRows((prev) => [row, ...prev]);
    groups.setRows((prev) => prev.map((g) => g.id===ctbForm.groupId ? {...g, fund: g.fund + Number(ctbForm.amount)} : g));
    setCtbForm({ ...ctbForm, member:"", amount:"" });
    setShowCtbForm(false);
    notify("TZS " + money(row.amount) + "k contribution recorded for " + row.member);
    logAudit("Contribution: " + row.member, "Community", currentUser?.name||"System", "TZS " + money(row.amount) + "k");
  }

  const WELFARE_EVENTS = [
    { event:"Medical Emergency", member:"Alice Ng'endo", amount:200, date:"2026-06-15", status:"Paid" },
    { event:"Funeral Support",   member:"Bob Otieno",        amount:150, date:"2026-05-20", status:"Paid" },
    { event:"Hospital Visit",    member:"Pending Review",    amount:100, date:"2026-07-10", status:"Pending" },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden px-5 py-5" style={{background:"linear-gradient(135deg,#7C3AED 0%,#6D28D9 50%,#4C1D95 100%)"}}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-[19px] font-bold text-white">Community Groups Manager</h1>
            <p className="text-[12px] mt-0.5" style={{color:"rgba(255,255,255,.65)"}}>Table Banking &middot; Investment Clubs &middot; VICOBA &middot; Welfare &middot; SUCCESS &middot; Chamas</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center"><p className="text-[10px] text-purple-300">Total Funds</p><p className="text-[16px] font-bold text-white">TZS {money(totalFunds)}k</p></div>
            <div className="text-center"><p className="text-[10px] text-purple-300">Members</p><p className="text-[16px] font-bold text-white">{totalMembers}</p></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto">
        {TABS.map((t) => { const I=t.icon; return (
          <button key={t.id} onClick={()=>setTab(t.id)} className={"flex items-center gap-1.5 flex-1 justify-center py-2 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap "+(tab===t.id?"bg-[#7C3AED] text-white shadow-sm":"text-slate-500 hover:bg-slate-50")}><I size={13}/>{t.label}</button>
        ); })}
      </div>

      {/* GROUPS TAB */}
      {tab === "groups" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-3 gap-3 flex-1 mr-4">
              {[["Groups",groups.rows.length,"#7C3AED"],["Total Members",totalMembers,"#2563EB"],["Total Funds","TZS "+money(totalFunds)+"k","#16A34A"]].map(([l,v,col])=>(
                <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-3"><p className="text-[11px] text-slate-400">{l}</p><p className="text-[18px] font-bold mt-0.5" style={{color:col}}>{v}</p></div>
              ))}
            </div>
            <button onClick={()=>setShowGroupForm(true)} className="flex items-center gap-1.5 btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5 shrink-0"><Plus size={13}/>New Group</button>
            <button onClick={()=>downloadCSV("community-groups",groups.rows.map(g=>({
              ID:g.id,Name:g.name||"",Category:g.category||"",Members:g.memberCount||0,
              Balance_k:g.balance||0,Lead:g.lead||"",Location:g.location||"",
            })),[{key:"ID",label:"ID"},{key:"Name",label:"Name"},{key:"Category",label:"Category"},
              {key:"Members",label:"Members"},{key:"Balance_k",label:"Balance (TZS k)"},
              {key:"Lead",label:"Leader"},{key:"Location",label:"Location"}])}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#16A34A] border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-2 rounded-lg">
              <Download size={12}/> CSV
            </button>
          </div>
          {showGroupForm && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              <p className="text-[13.5px] font-semibold text-[#111827]">Create New Community Group</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FormField label="Group Name"><input className={inputClass} value={groupForm.name} onChange={e=>setGroupForm({...groupForm,name:e.target.value})} placeholder="e.g. Umoja Chama"/></FormField>
                <FormField label="Type"><select className={inputClass} value={groupForm.type} onChange={e=>setGroupForm({...groupForm,type:e.target.value})}>{COMMUNITY_GROUP_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></FormField>
                <FormField label="Contribution Cycle"><select className={inputClass} value={groupForm.cycle} onChange={e=>setGroupForm({...groupForm,cycle:e.target.value})}>{["Weekly","Bi-weekly","Monthly","Quarterly"].map(c=><option key={c}>{c}</option>)}</select></FormField>
                <FormField label="Start Date"><input type="date" className={inputClass} value={groupForm.startDate} onChange={e=>setGroupForm({...groupForm,startDate:e.target.value})}/></FormField>
              </div>
              <div className="flex gap-2"><button onClick={addGroup} className="btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5">Create Group</button><button onClick={()=>setShowGroupForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button></div>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {groups.rows.map((g) => {
              const typeColor = {"Table Banking":"#16A34A","Investment Club":"#2563EB","Chama":"#7C3AED","Welfare Fund":"#EF4444","SUCCESS Group":"#F59E0B","Church Fund":"#EC4899","NGO / CBO":"#0891B2","Cooperative":"#D97706"}[g.type]||"#6B7280";
              return (
                <div key={g.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 cursor-pointer hover:border-[#7C3AED] transition-colors" onClick={()=>{setSelGroup(g);setTab("contributions");}}>
                  <div className="flex items-start justify-between mb-3">
                    <div><p className="text-[14px] font-semibold text-[#111827]">{g.name}</p><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:typeColor+"18",color:typeColor}}>{g.type}</span></div>
                    <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">{g.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg p-2 text-center"><p className="text-[10px] text-slate-400">Members</p><p className="text-[15px] font-bold text-[#111827]">{g.members}</p></div>
                    <div className="rounded-lg p-2 text-center" style={{background:typeColor+"10"}}><p className="text-[10px] text-slate-400">Fund</p><p className="text-[15px] font-bold" style={{color:typeColor}}>TZS {money(g.fund)}k</p></div>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-2">{g.cycle} contributions &middot; Since {g.startDate}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTRIBUTIONS TAB */}
      {tab === "contributions" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-semibold text-[#111827]">Contributions {selGroup ? "— " + selGroup.name : "(All Groups)"}</p>
              <p className="text-[12px] text-slate-400">{pendingCtbs.length} pending &middot; TZS {money(thisMonthCtbs.reduce((s,c)=>s+c.amount,0))}k collected this month</p>
            </div>
            <button onClick={()=>setShowCtbForm(true)} className="flex items-center gap-1.5 btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5"><Plus size={13}/>Record</button>
          </div>
          {showCtbForm && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
              <p className="text-[13.5px] font-semibold text-[#111827]">Record Contribution</p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <FormField label="Group"><select className={inputClass} value={ctbForm.groupId} onChange={e=>setCtbForm({...ctbForm,groupId:e.target.value})}><option value="">Select...</option>{groups.rows.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></FormField>
                <FormField label="Member Name"><input className={inputClass} value={ctbForm.member} onChange={e=>setCtbForm({...ctbForm,member:e.target.value})} placeholder="Member name"/></FormField>
                <FormField label="Amount (TZS k)"><input type="number" className={inputClass} value={ctbForm.amount} onChange={e=>setCtbForm({...ctbForm,amount:e.target.value})}/></FormField>
                <FormField label="Type"><select className={inputClass} value={ctbForm.type} onChange={e=>setCtbForm({...ctbForm,type:e.target.value})}>{["Contribution","Share Purchase","Fine","Registration","Special Levy"].map(t=><option key={t}>{t}</option>)}</select></FormField>
                <FormField label="Date"><input type="date" className={inputClass} value={ctbForm.date} onChange={e=>setCtbForm({...ctbForm,date:e.target.value})}/></FormField>
              </div>
              <div className="flex gap-2"><button onClick={addContribution} className="btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5">Save</button><button onClick={()=>setShowCtbForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button></div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50">{["Date","Member","Group","Type","Amount","Status"].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
              <tbody>
                {(selGroup ? contributions.rows.filter(c=>c.groupId===selGroup.id) : contributions.rows).map((ct)=>{
                  const grp = groups.rows.find(g=>g.id===ct.groupId);
                  return (
                    <tr key={ct.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-mono text-slate-500">{ct.date}</td>
                      <td className="px-4 py-2.5 font-medium text-[#111827]">{ct.member}</td>
                      <td className="px-4 py-2.5 text-slate-500">{grp?.name||ct.groupId}</td>
                      <td className="px-4 py-2.5 text-slate-500">{ct.type}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-[#7C3AED]">TZS {money(ct.amount)}k</td>
                      <td className="px-4 py-2.5"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:ct.status==="Paid"?"#DCFCE7":"#FEF3C7",color:ct.status==="Paid"?"#16A34A":"#92400E"}}>{ct.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WELFARE FUND TAB */}
      {tab === "welfare" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Welfare Reserve</p><p className="text-[22px] font-bold text-[#7C3AED]">TZS {money(1200)}k</p></div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Disbursed YTD</p><p className="text-[22px] font-bold text-[#EF4444]">TZS 350k</p></div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Claims Pending</p><p className="text-[22px] font-bold text-[#F59E0B]">1</p></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100"><p className="text-[13.5px] font-semibold text-[#111827]">Welfare Claims</p></div>
            <table className="w-full text-[12.5px]"><thead><tr className="border-b border-slate-100 bg-slate-50">{["Event","Member","Amount","Date","Status"].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
              <tbody>{WELFARE_EVENTS.map((w,i)=>(
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#111827]">{w.event}</td>
                  <td className="px-4 py-3 text-slate-600">{w.member}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-[#EF4444]">TZS {money(w.amount)}k</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{w.date}</td>
                  <td className="px-4 py-3"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:w.status==="Paid"?"#DCFCE7":"#FEF3C7",color:w.status==="Paid"?"#16A34A":"#92400E"}}>{w.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORTS TAB */}
      {tab === "reports" && (
        <div className="space-y-4">
          {/* KPI tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["Total Groups",    String(groups.rows.length),                       "#7C3AED"],
              ["Total Members",   String(totalMembers),                             "#2563EB"],
              ["Funds Collected", `TZS ${money(contributions.rows.filter(c=>c.status==="Paid").reduce((s,c)=>s+c.amount,0))}k`, "#16A34A"],
              ["Pending",         `TZS ${money(contributions.rows.filter(c=>c.status==="Pending").reduce((s,c)=>s+c.amount,0))}k`, "#F59E0B"],
            ].map(([l,v,col])=>(
              <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                <p className="text-[10.5px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                <p className="text-[18px] font-bold" style={{color:col}}>{v}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Funds by Group BarChart */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Funds Collected by Group</h3>
              {(() => {
                const grpData = groups.rows.map((g,i)=>({
                  name: g.name.length>14?g.name.slice(0,12)+"…":g.name,
                  value: contributions.rows.filter(c=>c.groupId===g.id&&c.status==="Paid").reduce((s,c)=>s+c.amount,0),
                  fill: ["#7C3AED","#2563EB","#16A34A","#D97706","#EF4444"][i%5],
                })).filter(d=>d.value>0);
                return grpData.length===0?<p className="text-slate-400 text-center py-6">No contributions</p>:(
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={grpData} margin={{left:0,right:10,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                      <XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={(v)=>[`TZS ${money(v)}k`,"Collected"]}/>
                      <Bar dataKey="value" radius={[4,4,0,0]} maxBarSize={40}>
                        {grpData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
            {/* Contribution status PieChart */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Contribution Status</h3>
              {(() => {
                const ctbStatus = [
                  {name:"Paid",    value:contributions.rows.filter(c=>c.status==="Paid").length,    fill:"#16A34A"},
                  {name:"Pending", value:contributions.rows.filter(c=>c.status==="Pending").length, fill:"#F59E0B"},
                  {name:"Waived",  value:contributions.rows.filter(c=>c.status==="Waived").length,  fill:"#94A3B8"},
                ].filter(d=>d.value>0);
                return ctbStatus.length===0?<p className="text-slate-400 text-center py-6">No records</p>:(
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={150}>
                      <RPieChart><Pie data={ctbStatus} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={30}>
                        {ctbStatus.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Pie><Tooltip formatter={(v,n)=>[v+" records",n]}/></RPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {ctbStatus.map(d=>(
                        <div key={d.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[12px]"><span className="w-2.5 h-2.5 rounded-full" style={{background:d.fill}}/>{d.name}</span>
                          <span className="text-[13px] font-bold" style={{color:d.fill}}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// HEALTHCARE / CLINIC MANAGEMENT MODULE
// Based on the Al Shifa Clinic design — full clinical workflow:
// Patients · Doctors · Appointments · Visits · Doctor Review
// Medical Reports (with digital signature) · Prescriptions
// Laboratory · Radiology · Pharmacy · Invoices · Notifications
// ═══════════════════════════════════════════════════════════════════════════

const HC_PATIENTS_SEED = [
  { id:"PT-001", mrn:"MRN-001-000001", firstName:"Mohammed", lastName:"Al Qahtani", gender:"Male", dob:"1990-03-14", age:36, bloodType:"O+", marital:"Married", status:"Stable", phone:"0501234567", email:"m.qahtani@email.com", nationalId:"1234567890", nationality:"Saudi", occupation:"Engineer", allergies:"Penicillin", chronicDiseases:"Hypertension", notes:"" },
  { id:"PT-002", mrn:"MRN-001-000002", firstName:"Noura", lastName:"Al Dossari", gender:"Female", dob:"1993-07-22", age:33, bloodType:"A+", marital:"Single", status:"Stable", phone:"0507654321", email:"n.dossari@email.com", nationalId:"2345678901", nationality:"Saudi", occupation:"Teacher", allergies:"None", chronicDiseases:"None", notes:"" },
  { id:"PT-003", mrn:"MRN-001-000003", firstName:"Yousef", lastName:"Al Mutairi", gender:"Male", dob:"1985-11-05", age:40, bloodType:"B-", marital:"Married", status:"Urgent", phone:"0551112233", email:"y.mutairi@email.com", nationalId:"3456789012", nationality:"Saudi", occupation:"Business Owner", allergies:"Sulfa drugs", chronicDiseases:"Diabetes Type 2", notes:"Monitor blood sugar weekly" },
  { id:"PT-004", mrn:"MRN-001-000004", firstName:"Leonardo", lastName:"Bacha", gender:"Male", dob:"1988-09-30", age:37, bloodType:"A+", marital:"Single", status:"Stable", phone:"5522336699", email:"admin@studies.com", nationalId:"121545", nationality:"Philipian", occupation:"", allergies:"None", chronicDiseases:"None", notes:"" },
];

const HC_DOCTORS_SEED = [
  { id:"DR-001", firstName:"Ahmed", lastName:"Al Ghamdi", gender:"Male", specialty:"Cardiology", dept:"Cardiology", license:"LIC-1001", qualifications:"MD, FACC", fee:300, experience:12, phone:"0509876543", email:"a.ghamdi@clinic.com", status:"Active", bio:"Senior cardiologist with 12 years experience." },
  { id:"DR-002", firstName:"Layla", lastName:"Al Zahrani", gender:"Female", specialty:"General Medicine", dept:"General Medicine", license:"LIC-1002", qualifications:"MBBS, DFM", fee:250, experience:8, phone:"0558887766", email:"l.zahrani@clinic.com", status:"Active", bio:"Family medicine specialist." },
];

const HC_APPTS_SEED = [
  { id:"APT-001", patientId:"PT-001", patient:"Mohammed Al Qahtani", doctorId:"DR-001", doctor:"Dr. Ahmed Al Ghamdi", type:"Consultation", start:"2026-07-16T09:00", end:"2026-07-16T09:30", fee:300, reason:"Chest pain follow-up", status:"Confirmed", notes:"" },
  { id:"APT-002", patientId:"PT-002", patient:"Noura Al Dossari", doctorId:"DR-002", doctor:"Dr. Layla Al Zahrani", type:"Check-up", start:"2026-07-17T10:00", end:"2026-07-17T10:30", fee:250, reason:"Annual check-up", status:"Scheduled", notes:"" },
];

const HC_VISITS_SEED = [
  { id:"V-0001", patientId:"PT-001", patient:"Mohammed Al Qahtani", doctorId:"DR-001", doctor:"Dr. Ahmed Al Ghamdi", date:"2026-07-03T14:32", status:"Closed", diagnosis:"Hypertension management", notes:"BP controlled. Continue medication." },
];

const HC_PRESCRIPTIONS_SEED = [
  { id:"RX-001", patientId:"PT-002", patient:"Noura Al Dossari", doctorId:"DR-002", doctor:"Dr. Layla Al Zahrani", date:"2026-07-03", drugs:[{ name:"Amlodipine 5mg", dosage:"5mg", frequency:"2x/day", days:6, qty:1, instructions:"After meals" }], notes:"", status:"Active" },
];

const HC_REPORTS_SEED = [
  { id:"RPT-001", visitId:"V-0001", patientId:"PT-001", patient:"Mohammed Al Qahtani", doctorId:"DR-001", doctor:"Dr. Ahmed Al Ghamdi", title:"Consultation Summary", description:"Patient presents with controlled hypertension. BP reading 130/85. Continue current medications and dietary modifications. Follow-up in 3 months.", date:"2026-07-03", status:"Signed" },
];

const HC_LAB_CATEGORIES = [
  { id:"LC-01", name:"Biochemistry", nameAr:"الكيمياء الحيوية" },
  { id:"LC-02", name:"Diabetes", nameAr:"السكري" },
  { id:"LC-03", name:"Hematology (Blood)", nameAr:"أمراض الدم" },
  { id:"LC-04", name:"Lipid Profile", nameAr:"الدهون" },
  { id:"LC-05", name:"Liver Function", nameAr:"وظائف الكبد" },
  { id:"LC-06", name:"Kidney Function", nameAr:"وظائف الكلى" },
  { id:"LC-07", name:"Thyroid", nameAr:"الغدة الدرقية" },
  { id:"LC-08", name:"Electrolytes", nameAr:"الأملاح" },
  { id:"LC-09", name:"Vitamins", nameAr:"الفيتامينات" },
  { id:"LC-10", name:"Inflammation", nameAr:"الالتهابات" },
  { id:"LC-11", name:"Cardiac", nameAr:"القلب" },
  { id:"LC-12", name:"Urine", nameAr:"البول" },
];

const HC_LAB_TESTS = [
  "Albumin","ALT (SGPT)","Calcium","CK-MB","C-Reactive Protein (CRP)","eGFR","Fasting Blood Glucose","Fasting Insulin",
  "Alkaline Phosphatase","AST (SGOT)","Chloride","Complete Blood Count (CBC)","Creatinine","ESR","HbA1c","LDL Cholesterol",
  "HDL Cholesterol","Total Cholesterol","Triglycerides","TSH","T3","T4","Vitamin D","Vitamin B12","Uric Acid","Urine Analysis",
  "PSA","Iron","Ferritin","Sodium","Potassium","Magnesium","Phosphorus","Troponin I","BNP","D-Dimer","PT/INR",
];

const HC_MEDICATIONS = [
  "Amlodipine 5mg","Metformin 500mg","Paracetamol 500mg","Ibuprofen 400mg","Amoxicillin 500mg","Omeprazole 20mg",
  "Atorvastatin 10mg","Losartan 50mg","Metoprolol 25mg","Aspirin 81mg","Vitamin D3 1000IU","Vitamin B12 500mcg",
  "Azithromycin 500mg","Ciprofloxacin 500mg","Prednisolone 5mg","Salbutamol Inhaler","Insulin Glargine","Glibenclamide 5mg",
];

const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const APPT_TYPES = ["Consultation","Check-up","Follow-up","Emergency","Procedure","Vaccination"];
const APPT_STATUSES = ["Scheduled","Confirmed","In Progress","Completed","Cancelled","No Show"];


// ─── VITALS / TRIAGE ────────────────────────────────────────────────────────
const VITAL_SEED = [
  { id:"V001", patientId:"PT-001", patient:"Mohammed Al Qahtani", date:"2026-07-16", bp:"130/85", pulse:72, temp:36.8, weight:82, height:175, spo2:98, respiratoryRate:16, pain:2, nurse:"Nurse Hana", notes:"Stable vitals" },
  { id:"V002", patientId:"PT-003", patient:"Yousef Al Mutairi",   date:"2026-07-16", bp:"145/95", pulse:88, temp:37.2, weight:95, height:178, spo2:96, respiratoryRate:18, pain:5, nurse:"Nurse Hana", notes:"Elevated BP, referred to doctor" },
];

function VitalsTriageView({ patients, currentUser, HC_BLUE }) {
  const vitals = useCompanyTable("hc_vitals", VITAL_SEED, { mapRow: r => r });
  const [form, setForm] = useState({ patientId:"", date: new Date().toISOString().slice(0,10), bp:"", pulse:"", temp:"", weight:"", height:"", spo2:"", respiratoryRate:"", pain:"0", nurse: currentUser?.name||"", notes:"" });
  const [showForm, setShowForm] = useState(false);

  const bmi = (w, h) => h > 0 ? (w / ((h/100)**2)).toFixed(1) : "—";
  const bmiLabel = (b) => b < 18.5 ? "Underweight" : b < 25 ? "Normal" : b < 30 ? "Overweight" : "Obese";
  const bmiColor = (b) => b < 18.5 ? "#3B82F6" : b < 25 ? "#16A34A" : b < 30 ? "#F59E0B" : "#EF4444";

  async function saveVitals() {
    if (!form.patientId) return;
    const pat = patients.rows.find(p => p.id === form.patientId);
    const row = { ...form, id: docId("VIT"), patient: pat?.fullName||"", bmi: bmi(Number(form.weight), Number(form.height)) };
    vitals.setRows(prev => [row, ...prev]);
    setForm({ patientId:"", date: new Date().toISOString().slice(0,10), bp:"", pulse:"", temp:"", weight:"", height:"", spo2:"", respiratoryRate:"", pain:"0", nurse: currentUser?.name||"", notes:"" });
    setShowForm(false);
    notify("Vitals recorded for " + pat?.fullName);
    logAudit("Vitals recorded", "Healthcare", currentUser?.name||"System", pat?.fullName + " — BP: " + form.bp);
    if (IS_CONFIGURED) { try { await sb("hc_vitals").insert({ patient_id:row.patientId, patient_name:row.patient, entry_date:row.date, bp:row.bp, pulse:Number(row.pulse), temperature:Number(row.temp), weight:Number(row.weight), height:Number(row.height), spo2:Number(row.spo2), pain_score:Number(row.pain), notes:row.notes }).run(); } catch(_e){} }
  }

  const urgentPatients = patients.rows.filter(p => p.status === "Urgent" || p.status === "Critical");

  return (
    <div className="space-y-4">
      {urgentPatients.length > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2]">
          <AlertCircle size={18} className="text-[#EF4444] shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-[#991B1B]">{urgentPatients.length} patient{urgentPatients.length > 1 ? "s" : ""} flagged Urgent / Critical</p>
            <p className="text-[11.5px] text-[#B91C1C]">{urgentPatients.map(p => p.fullName).join(", ")}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div><h3 className="text-[15px] font-semibold text-[#111827]">Triage & Vitals</h3><p className="text-[12px] text-slate-400">Record patient vitals at every visit. BMI auto-calculated.</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{ background: HC_BLUE }}><Plus size={13} />Record Vitals</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <p className="text-[14px] font-semibold text-[#111827]">New Vitals Entry</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormField label="Patient" cls="col-span-2">
              <select className={inputClass} value={form.patientId} onChange={e => setForm({ ...form, patientId: e.target.value })}>
                <option value="">Select patient...</option>
                {patients.rows.map(p => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </FormField>
            <FormField label="Date"><input type="date" className={inputClass} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></FormField>
            <FormField label="Attending Nurse"><input className={inputClass} value={form.nurse} onChange={e => setForm({ ...form, nurse: e.target.value })} /></FormField>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <FormField label="Blood Pressure"><input className={inputClass} value={form.bp} onChange={e => setForm({ ...form, bp: e.target.value })} placeholder="120/80" /></FormField>
            <FormField label="Pulse (bpm)"><input type="number" className={inputClass} value={form.pulse} onChange={e => setForm({ ...form, pulse: e.target.value })} placeholder="72" /></FormField>
            <FormField label="Temperature (°C)"><input type="number" step="0.1" className={inputClass} value={form.temp} onChange={e => setForm({ ...form, temp: e.target.value })} placeholder="36.5" /></FormField>
            <FormField label="SpO2 (%)"><input type="number" className={inputClass} value={form.spo2} onChange={e => setForm({ ...form, spo2: e.target.value })} placeholder="98" /></FormField>
            <FormField label="Weight (kg)"><input type="number" step="0.1" className={inputClass} value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></FormField>
            <FormField label="Height (cm)"><input type="number" className={inputClass} value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} /></FormField>
            <FormField label="Resp. Rate (/min)"><input type="number" className={inputClass} value={form.respiratoryRate} onChange={e => setForm({ ...form, respiratoryRate: e.target.value })} placeholder="16" /></FormField>
            <FormField label="Pain Score (0-10)"><input type="range" min="0" max="10" className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-3" value={form.pain} onChange={e => setForm({ ...form, pain: e.target.value })} style={{ accentColor: HC_BLUE }} /><p className="text-center text-[12px] font-bold mt-0.5" style={{ color: Number(form.pain) > 7 ? "#EF4444" : Number(form.pain) > 4 ? "#F59E0B" : "#16A34A" }}>{form.pain}/10</p></FormField>
          </div>
          {form.weight && form.height && (
            <div className="p-3 rounded-xl border" style={{ borderColor: bmiColor(Number(bmi(Number(form.weight), Number(form.height)))) + "40", background: bmiColor(Number(bmi(Number(form.weight), Number(form.height)))) + "08" }}>
              <p className="text-[12px] font-semibold" style={{ color: bmiColor(Number(bmi(Number(form.weight), Number(form.height)))) }}>
                BMI: {bmi(Number(form.weight), Number(form.height))} — {bmiLabel(Number(bmi(Number(form.weight), Number(form.height))))}
              </p>
            </div>
          )}
          <FormField label="Notes"><input className={inputClass} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Clinical observations..." /></FormField>
          <div className="flex gap-2"><button onClick={saveVitals} className="btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5">Save Vitals</button><button onClick={() => setShowForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button></div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead><tr className="border-b border-slate-100 bg-slate-50">
            {["Patient","Date","BP","Pulse","Temp","SpO2","Weight","BMI","Pain","Nurse"].map(h => <th key={h} className="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}
          </tr></thead>
          <tbody>
            {vitals.rows.map(v => {
              const bmiVal = bmi(Number(v.weight), Number(v.height));
              const painColor = Number(v.pain) > 7 ? "#EF4444" : Number(v.pain) > 4 ? "#F59E0B" : "#16A34A";
              return (
                <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-3 py-2.5 font-medium text-[#111827]">{v.patient}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-400">{v.date}</td>
                  <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: v.bp?.split("/")[0] > 140 ? "#EF4444" : "#111827" }}>{v.bp}</td>
                  <td className="px-3 py-2.5 font-mono">{v.pulse}</td>
                  <td className="px-3 py-2.5 font-mono" style={{ color: Number(v.temp) > 37.5 ? "#EF4444" : "#111827" }}>{v.temp}°</td>
                  <td className="px-3 py-2.5 font-mono font-semibold" style={{ color: Number(v.spo2) < 95 ? "#EF4444" : "#16A34A" }}>{v.spo2}%</td>
                  <td className="px-3 py-2.5 font-mono text-slate-600">{v.weight}kg</td>
                  <td className="px-3 py-2.5"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: bmiColor(Number(bmiVal)) + "15", color: bmiColor(Number(bmiVal)) }}>{bmiVal}</span></td>
                  <td className="px-3 py-2.5 font-bold" style={{ color: painColor }}>{v.pain}/10</td>
                  <td className="px-3 py-2.5 text-slate-400 text-[11.5px]">{v.nurse}</td>
                </tr>
              );
            })}
            {vitals.rows.length === 0 && <tr><td colSpan={10} className="px-4 py-10 text-center text-slate-400">No vitals recorded yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RADIOLOGY ───────────────────────────────────────────────────────────────
const RADIOLOGY_SEED = [
  { id:"RAD-001", patientId:"PT-001", patient:"Mohammed Al Qahtani", type:"X-Ray", region:"Chest", doctor:"Dr. Ahmed Al Ghamdi", date:"2026-07-10", status:"Reported", findings:"No acute cardiopulmonary disease. Clear lung fields.", priority:"Routine" },
  { id:"RAD-002", patientId:"PT-003", patient:"Yousef Al Mutairi",   type:"CT Scan", region:"Abdomen", doctor:"Dr. Layla Al Zahrani", date:"2026-07-14", status:"Pending", findings:"", priority:"Urgent" },
];

const RADIOLOGY_TYPES = ["X-Ray","CT Scan","MRI","Ultrasound","Echocardiogram","Mammography","PET Scan","DEXA Scan","Fluoroscopy","Nuclear Medicine"];
const BODY_REGIONS   = ["Chest","Abdomen","Brain/Head","Spine","Pelvis","Knee","Shoulder","Hip","Wrist","Ankle","Full Body","Heart","Breast","Liver","Kidney","Thyroid"];

function RadiologyView({ patients, doctors, currentUser, HC_BLUE, HC_TEAL }) {
  const orders = useCompanyTable("hc_radiology", RADIOLOGY_SEED, { mapRow: r => r });
  const [form, setForm] = useState({ patientId:"", type: RADIOLOGY_TYPES[0], region: BODY_REGIONS[0], doctorId:"", priority:"Routine", notes:"" });
  const [showForm, setShowForm] = useState(false);
  const [reportingId, setReportingId] = useState(null);
  const [findings, setFindings] = useState("");

  const statusColor = { Pending:"#F59E0B", "In Progress":"#3B82F6", Reported:"#16A34A", Cancelled:"#9CA3AF" };
  const statusBg    = { Pending:"#FEF3C7", "In Progress":"#DBEAFE", Reported:"#DCFCE7", Cancelled:"#F3F4F6" };

  async function placeOrder() {
    if (!form.patientId) return;
    const pat = patients.rows.find(p => p.id === form.patientId);
    const doc = doctors.rows.find(d => d.id === form.doctorId);
    const row = { ...form, id: docId("RAD"), patient: pat?.fullName||"", doctor: doc?.fullName||"", date: TODAY.toISOString().slice(0,10), status:"Pending", findings:"" };
    orders.setRows(p => [row, ...p]);
    setForm({ patientId:"", type: RADIOLOGY_TYPES[0], region: BODY_REGIONS[0], doctorId:"", priority:"Routine", notes:"" });
    setShowForm(false);
    notify("Radiology order placed: " + row.type + " — " + pat?.fullName);
    logAudit("Radiology order: " + row.id, "Healthcare", currentUser?.name||"System", pat?.fullName + " — " + row.type + " " + row.region);
  }

  function submitReport() {
    if (!findings.trim() || !reportingId) return;
    orders.setRows(p => p.map(o => o.id === reportingId ? { ...o, findings, status:"Reported" } : o));
    notify("Radiology report submitted");
    setReportingId(null); setFindings("");
  }

  const stats = { total: orders.rows.length, pending: orders.rows.filter(o=>o.status==="Pending").length, reported: orders.rows.filter(o=>o.status==="Reported").length, urgent: orders.rows.filter(o=>o.priority==="Urgent").length };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total Orders", stats.total, HC_BLUE],["Pending",stats.pending,"#F59E0B"],["Reported",stats.reported,"#16A34A"],["Urgent",stats.urgent,"#EF4444"]].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p><p className="text-[24px] font-bold" style={{color:col}}>{v}</p></div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div><h3 className="text-[15px] font-semibold text-[#111827]">Radiology Orders</h3><p className="text-[12px] text-slate-400">X-Ray, CT, MRI, Ultrasound and more</p></div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{ background: HC_BLUE }}><Plus size={13}/>New Order</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-3">
          <p className="text-[14px] font-semibold text-[#111827]">New Radiology Order</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FormField label="Patient *"><select className={inputClass} value={form.patientId} onChange={e=>setForm({...form,patientId:e.target.value})}><option value="">Select patient...</option>{patients.rows.map(p=><option key={p.id} value={p.id}>{p.fullName}</option>)}</select></FormField>
            <FormField label="Scan Type"><select className={inputClass} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{RADIOLOGY_TYPES.map(t=><option key={t}>{t}</option>)}</select></FormField>
            <FormField label="Body Region"><select className={inputClass} value={form.region} onChange={e=>setForm({...form,region:e.target.value})}>{BODY_REGIONS.map(r=><option key={r}>{r}</option>)}</select></FormField>
            <FormField label="Referring Doctor"><select className={inputClass} value={form.doctorId} onChange={e=>setForm({...form,doctorId:e.target.value})}><option value="">Select doctor...</option>{doctors.rows.map(d=><option key={d.id} value={d.id}>{d.fullName}</option>)}</select></FormField>
            <FormField label="Priority"><select className={inputClass} value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}><option>Routine</option><option>Urgent</option><option>Emergency</option></select></FormField>
            <FormField label="Clinical notes"><input className={inputClass} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Indication for scan..."/></FormField>
          </div>
          <div className="flex gap-2"><button onClick={placeOrder} className="btn-primary text-white text-[12.5px] rounded-xl px-4 py-2.5">Place Order</button><button onClick={()=>setShowForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button></div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead><tr className="border-b border-slate-100 bg-slate-50">{["Order#","Patient","Type","Region","Priority","Date","Status","Findings","Action"].map(h=><th key={h} className="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
          <tbody>
            {orders.rows.map(o => (
              <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-3 py-3 font-mono text-[11px] font-medium" style={{color:HC_BLUE}}>{o.id}</td>
                <td className="px-3 py-3 font-medium text-[#111827]">{o.patient}</td>
                <td className="px-3 py-3 text-slate-600">{o.type}</td>
                <td className="px-3 py-3 text-slate-500">{o.region}</td>
                <td className="px-3 py-3"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:o.priority==="Urgent"?"#FEE2E2":o.priority==="Emergency"?"#FEE2E2":"#F0FDF4",color:o.priority==="Routine"?"#16A34A":"#EF4444"}}>{o.priority}</span></td>
                <td className="px-3 py-3 font-mono text-[11px] text-slate-400">{o.date}</td>
                <td className="px-3 py-3"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:statusBg[o.status]||"#F3F4F6",color:statusColor[o.status]||"#6B7280"}}>{o.status}</span></td>
                <td className="px-3 py-3 text-slate-500 max-w-[180px] truncate text-[11.5px]">{o.findings||"—"}</td>
                <td className="px-3 py-3">
                  {o.status !== "Reported" && (
                    <button onClick={() => { setReportingId(o.id); setFindings(o.findings||""); }} className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg" style={{background:HC_TEAL}}>Report</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.rows.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-slate-400">No radiology orders yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {reportingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.4)"}}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
            <p className="text-[15px] font-semibold text-[#111827] mb-1">Enter Radiology Report</p>
            <p className="text-[12px] text-slate-400 mb-4">{orders.rows.find(o=>o.id===reportingId)?.type} — {orders.rows.find(o=>o.id===reportingId)?.patient}</p>
            <FormField label="Findings / Impression">
              <textarea className={inputClass + " min-h-[100px] resize-none"} value={findings} onChange={e=>setFindings(e.target.value)} placeholder="Describe radiological findings and impression..."/>
            </FormField>
            <div className="flex gap-2 mt-4">
              <button onClick={submitReport} className="flex-1 btn-primary text-white rounded-xl py-2.5 text-[13px] font-semibold">Submit Report</button>
              <button onClick={()=>setReportingId(null)} className="flex-1 text-[13px] text-slate-500 rounded-xl py-2.5 border border-slate-200">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HC BILLING ──────────────────────────────────────────────────────────────
const HC_SERVICE_RATES = {
  "Consultation": 250, "Check-up": 200, "Follow-up": 150, "Emergency": 500, "Procedure": 400, "Vaccination": 100,
  "X-Ray": 180, "CT Scan": 650, "MRI": 900, "Ultrasound": 300, "Lab Panel": 150, "Full Blood Count": 80,
};

function HCBillingView({ patients, appointments, visits, prescriptions, labOrders, currentUser, HC_BLUE }) {
  const invoices = useCompanyTable("hc_invoices", [], { mapRow: r => r });
  const [genModal, setGenModal] = useState(false);
  const [genForm, setGenForm] = useState({ patientId:"", services:[], discount:0, notes:"", paymentMethod:"Cash" });
  const [customService, setCustomService] = useState({ name:"", amount:"" });

  const PAYMENT_METHODS = ["Cash","Bank Transfer","Insurance","Mobile Money","Card","Credit"];
  const totalRevenue = invoices.rows.filter(i=>i.status==="Paid").reduce((s,i)=>s+i.total,0);
  const outstanding  = invoices.rows.filter(i=>i.status==="Unpaid"||i.status==="Partial").reduce((s,i)=>s+i.balance,0);

  function addService(name, amount) {
    setGenForm(f => ({ ...f, services: [...f.services, { name, amount: Number(amount) }] }));
  }
  function removeService(i) {
    setGenForm(f => ({ ...f, services: f.services.filter((_,j) => j !== i) }));
  }

  const subtotal  = genForm.services.reduce((s, sv) => s + sv.amount, 0);
  const discAmt   = subtotal * (Number(genForm.discount)||0) / 100;
  const total     = subtotal - discAmt;

  async function generateInvoice() {
    if (!genForm.patientId || genForm.services.length === 0) return;
    const pat = patients.rows.find(p => p.id === genForm.patientId);
    const row = { id: docId("INV"), patientId: genForm.patientId, patient: pat?.fullName||"", date: TODAY.toISOString().slice(0,10), services: genForm.services, subtotal, discount: Number(genForm.discount)||0, discAmt, total, balance: total, status:"Unpaid", paymentMethod: genForm.paymentMethod, notes: genForm.notes, issuedBy: currentUser?.name||"System" };
    invoices.setRows(p => [row, ...p]);
    setGenModal(false);
    setGenForm({ patientId:"", services:[], discount:0, notes:"", paymentMethod:"Cash" });
    notify("Invoice " + row.id + " generated for " + pat?.fullName + " — TZS " + money(total) + "k");
    logAudit("Invoice generated: " + row.id, "Healthcare", currentUser?.name||"System", pat?.fullName + " — TZS " + money(total) + "k");
  }

  function markPaid(inv) {
    invoices.setRows(p => p.map(i => i.id === inv.id ? { ...i, status:"Paid", balance:0 } : i));
    notify("Invoice " + inv.id + " marked as paid");
  }

  const statusColor = { Paid:"#16A34A", Unpaid:"#EF4444", Partial:"#F59E0B", Cancelled:"#9CA3AF" };
  const statusBg    = { Paid:"#DCFCE7", Unpaid:"#FEE2E2", Partial:"#FEF3C7", Cancelled:"#F3F4F6" };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total Invoices", invoices.rows.length, HC_BLUE],["Revenue (Paid)","TZS "+money(totalRevenue)+"k","#16A34A"],["Outstanding","TZS "+money(outstanding)+"k","#EF4444"],["Paid",invoices.rows.filter(i=>i.status==="Paid").length,"#059669"]].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p><p className="text-[22px] font-bold" style={{color:col}}>{v}</p></div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div><h3 className="text-[15px] font-semibold text-[#111827]">Clinical Invoices</h3><p className="text-[12px] text-slate-400">Generate invoices from clinic services, lab orders and prescriptions</p></div>
        <button onClick={() => setGenModal(true)} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{ background: HC_BLUE }}><Plus size={13}/>Generate Invoice</button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead><tr className="border-b border-slate-100 bg-slate-50">{["Invoice","Patient","Date","Services","Total","Balance","Status","Action"].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
          <tbody>
            {invoices.rows.map(inv => (
              <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-[11px] font-medium" style={{color:HC_BLUE}}>{inv.id}</td>
                <td className="px-4 py-3 font-medium text-[#111827]">{inv.patient}</td>
                <td className="px-4 py-3 font-mono text-[11.5px] text-slate-400">{inv.date}</td>
                <td className="px-4 py-3 text-slate-500 text-[11.5px] max-w-[160px] truncate">{inv.services?.map(s=>s.name).join(", ")}</td>
                <td className="px-4 py-3 font-mono font-semibold text-[#111827]">TZS {money(inv.total)}k</td>
                <td className="px-4 py-3 font-mono font-bold" style={{color:inv.balance>0?"#EF4444":"#16A34A"}}>TZS {money(inv.balance)}k</td>
                <td className="px-4 py-3"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:statusBg[inv.status]||"#F3F4F6",color:statusColor[inv.status]||"#6B7280"}}>{inv.status}</span></td>
                <td className="px-4 py-3 flex items-center gap-1.5">
                  {inv.status !== "Paid" && <button onClick={() => markPaid(inv)} className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg bg-[#16A34A]">Mark Paid</button>}
                  <button onClick={() => {
                    const co = window.__smartManagerCompany || {};
                    printAsPDF("Invoice " + inv.id, "<div style=\"font-family:Inter,sans-serif;max-width:640px;margin:0 auto;padding:32px;color:#111827\"><div style=\"display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px\"><div><div style=\"font-size:22px;font-weight:900;color:" + HC_BLUE + "\">CLINIC INVOICE</div><div style=\"font-size:12px;color:#6B7280;margin-top:4px\">" + inv.id + " &middot; " + inv.date + "</div></div><div style=\"text-align:right\"><div style=\"font-size:16px;font-weight:700;\">" + (co.name||"Healthcare Clinic") + "</div></div></div><div style=\"padding:14px;background:#F0F9FF;border-radius:10px;margin-bottom:20px\"><div style=\"font-size:10px;color:#6B7280;text-transform:uppercase;margin-bottom:4px\">Bill To</div><div style=\"font-size:16px;font-weight:700;\">" + inv.patient + "</div></div><table style=\"width:100%;border-collapse:collapse;margin-bottom:20px\"><thead><tr style=\"background:" + HC_BLUE + "\"><th style=\"padding:10px;text-align:left;color:white;font-size:11px\">Service</th><th style=\"padding:10px;text-align:right;color:white;font-size:11px\">Amount</th></tr></thead><tbody>" + (inv.services||[]).map(s=>"<tr style=\"border-bottom:1px solid #F3F4F6\"><td style=\"padding:9px 10px;font-size:12px\">" + s.name + "</td><td style=\"padding:9px 10px;font-size:12px;text-align:right;font-family:monospace\">TZS " + money(s.amount) + "k</td></tr>").join("") + "</tbody></table><div style=\"display:flex;justify-content:flex-end\"><div style=\"width:250px\"><div style=\"display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E5E7EB;font-size:12px\"><span style=\"color:#6B7280\">Subtotal</span><span>TZS " + money(inv.subtotal) + "k</span></div>" + (inv.discount>0?"<div style=\"display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E5E7EB;font-size:12px;color:#16A34A\"><span>Discount (" + inv.discount + "%)</span><span>-TZS " + money(inv.discAmt) + "k</span></div>":"") + "<div style=\"display:flex;justify-content:space-between;padding:12px;background:" + HC_BLUE + ";border-radius:8px;margin-top:8px\"><span style=\"color:white;font-weight:700\">Total</span><span style=\"color:white;font-weight:900;font-size:18px\">TZS " + money(inv.total) + "k</span></div></div></div><div style=\"text-align:center;margin-top:24px;font-size:10px;color:#9CA3AF\">Thank you for choosing our clinic</div></div>");
                  }} className="text-[11px] text-slate-400 hover:text-[#1B4DE4] p-1"><Printer size={13}/></button>
                </td>
              </tr>
            ))}
            {invoices.rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400">No invoices yet. Click "Generate Invoice" to create one.</td></tr>}
          </tbody>
        </table>
      </div>

      {genModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.45)"}} onClick={()=>setGenModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h2 className="text-[17px] font-semibold text-[#111827]">Generate Invoice</h2><button onClick={()=>setGenModal(false)} className="text-slate-400"><X size={18}/></button></div>

            <FormField label="Patient *">
              <select className={inputClass} value={genForm.patientId} onChange={e=>setGenForm({...genForm,patientId:e.target.value})}>
                <option value="">Select patient...</option>{patients.rows.map(p=><option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>)}
              </select>
            </FormField>

            <div className="mt-3 mb-2">
              <p className="text-[12px] font-medium text-slate-600 mb-2">Services</p>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {Object.entries(HC_SERVICE_RATES).map(([name, rate]) => (
                  <button key={name} onClick={() => addService(name, rate)} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-200 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors">
                    <span className="text-[12px] text-slate-700">{name}</span>
                    <span className="text-[11.5px] font-mono font-semibold text-[#1B4DE4]">{rate}k</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={inputClass + " flex-1 text-[12px]"} value={customService.name} onChange={e=>setCustomService({...customService,name:e.target.value})} placeholder="Custom service name"/>
                <input type="number" className={inputClass + " w-20 text-[12px]"} value={customService.amount} onChange={e=>setCustomService({...customService,amount:e.target.value})} placeholder="TZSk"/>
                <button onClick={()=>{ if(customService.name&&customService.amount){addService(customService.name,customService.amount);setCustomService({name:"",amount:""});} }} className="px-3 py-2 rounded-xl text-[12px] font-semibold text-white" style={{background:HC_BLUE}}>Add</button>
              </div>
            </div>

            {genForm.services.length > 0 && (
              <div className="border border-slate-200 rounded-xl p-3 mb-3 space-y-1.5">
                {genForm.services.map((sv,i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12.5px] text-[#111827]">{sv.name}</span>
                    <div className="flex items-center gap-2"><span className="text-[12.5px] font-mono font-semibold text-[#1B4DE4]">TZS {money(sv.amount)}k</span><button onClick={()=>removeService(i)} className="text-slate-300 hover:text-[#EF4444]"><X size={12}/></button></div>
                  </div>
                ))}
                <div className="border-t border-slate-100 pt-1.5 mt-1.5 flex justify-between font-semibold"><span className="text-[12.5px]">Subtotal</span><span className="font-mono text-[12.5px]">TZS {money(subtotal)}k</span></div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Discount (%)"><input type="number" min="0" max="100" className={inputClass} value={genForm.discount} onChange={e=>setGenForm({...genForm,discount:e.target.value})}/></FormField>
              <FormField label="Payment Method"><select className={inputClass} value={genForm.paymentMethod} onChange={e=>setGenForm({...genForm,paymentMethod:e.target.value})}>{PAYMENT_METHODS.map(m=><option key={m}>{m}</option>)}</select></FormField>
            </div>
            <FormField label="Notes" cls="mt-2"><input className={inputClass} value={genForm.notes} onChange={e=>setGenForm({...genForm,notes:e.target.value})}/></FormField>

            {total > 0 && (
              <div className="mt-3 p-3 rounded-xl flex items-center justify-between" style={{background:HC_BLUE}}>
                <span className="text-[14px] font-semibold text-white">Total Due</span>
                <span className="text-[20px] font-bold text-white">TZS {money(total)}k</span>
              </div>
            )}

            <div className="flex gap-2 mt-4"><button onClick={()=>setGenModal(false)} className="flex-1 px-4 py-2.5 rounded-xl text-[13px] text-slate-500 border border-slate-200">Cancel</button><button onClick={generateInvoice} disabled={!genForm.patientId||genForm.services.length===0} className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-40" style={{background:HC_BLUE}}>Generate Invoice</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VicobaSaccosModule;
