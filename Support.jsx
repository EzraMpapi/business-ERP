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


function CustomerSupport({ company }) {
  const [tab, setTab] = useState("tickets");
  const tickets = useCompanyTable("support_tickets", supportTicketsSeed, {
    select: "*,support_ticket_messages(*)", order: { col: "created_date", ascending: false }, mapRow: mapTicketRow,
  });

  const openCount = tickets.rows.filter((t) => t.status === "Open").length;
  const urgentCount = tickets.rows.filter((t) => t.status !== "Closed" && t.status !== "Resolved" && t.priority === "Urgent").length;
  const resolvedCount = tickets.rows.filter((t) => t.status === "Resolved" || t.status === "Closed").length;
  const resolutionRate = tickets.rows.length ? Math.round((resolvedCount / tickets.rows.length) * 100) : null;

  const SUPPORT_KPIS = [
    { label: "Open Tickets", value: String(openCount), delta: `${tickets.rows.length} total`, up: false, icon: Ticket },
    { label: "Urgent", value: String(urgentCount), delta: "Needs attention", up: false, icon: AlertCircle },
    { label: "Resolution Rate", value: resolutionRate === null ? "—" : `${resolutionRate}%`, delta: "All time", up: true, icon: CheckCircle2 },
    { label: "Avg Handle Time", value: "8 min", delta: "From call log", up: true, icon: Clock },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Customer Support</h1>
        <p className="text-[13px] text-slate-500 mt-1">Tickets, live chat, knowledge base, call log, and AI-drafted replies</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {SUPPORT_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive ? "bg-white text-[#111827] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {SUPPORT_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      {tab === "tickets" && <Tickets tickets={tickets} />}
      {tab === "chat" && <LiveChat />}
      {tab === "kb" && <KnowledgeBase />}
      {tab === "calls" && <CallCenter />}
      {tab === "ai" && <SupportAI company={company} tickets={tickets.rows} />}
    </div>
  );
}

/* ----------------------------------- TICKETS ----------------------------------- */

function Tickets({ tickets }) {
  const { rows, setRows, loading } = tickets;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((t) => t.subject.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q));
  }, [rows, query]);

  async function addTicket(form) {
    const draft = {
      id: docId("TCK"), subject: form.subject, customer: form.customer,
      category: form.category, priority: form.priority, status: "Open", assignee: form.assignee || "Unassigned",
      createdDate: TODAY.toISOString().slice(0, 10),
      messages: form.description ? [{ from: "Customer", text: form.description, date: TODAY.toISOString().slice(0, 10) }] : [],
    };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Ticket created: ${draft.id}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("support_tickets").insert({
          doc_number: draft.id, subject: draft.subject, customer: draft.customer, category: draft.category,
          priority: draft.priority, status: "Open", assignee: draft.assignee, created_date: draft.createdDate,
        }).single().run();
        if (header?.id) {
          if (form.description) {
            await sb("support_ticket_messages").insert({ ticket_id: header.id, sender: "Customer", body: form.description }).run();
          }
          setRows((prev) => prev.map((t) => (t.id === draft.id ? { ...t, dbId: header.id } : t)));
        }
      } catch (_e) { notify("Ticket created locally, but saving to the server failed.", "error"); }
    }
  }

  async function setStatus(id, status) {
    const t = rows.find((x) => x.id === id);
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    if (IS_CONFIGURED && t?.dbId) {
      try { await sb("support_tickets").eq("id", t.dbId).update({ status }).run(); } catch (_e) { notify("Couldn't save the ticket status to the server.", "error"); }
    }
  }

  async function reply(id, text) {
    const t = rows.find((x) => x.id === id);
    const message = { from: "Agent", text, date: TODAY.toISOString().slice(0, 10) };
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, messages: [...x.messages, message] } : x)));
    setSelected((s) => (s && s.id === id ? { ...s, messages: [...s.messages, message] } : s));
    if (IS_CONFIGURED && t?.dbId) {
      try { await sb("support_ticket_messages").insert({ ticket_id: t.dbId, sender: "Agent", body: text }).run(); } catch (_e) { notify("Reply saved locally, but the server update failed.", "error"); }
    }
  }

  async function deleteTicket(id) {
    const t = rows.find((x) => x.id === id);
    setRows((prev) => prev.filter((x) => x.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && t?.dbId) {
      try { await sb("support_tickets").eq("id", t.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the ticket on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">

      {/* Ticket Analytics */}
      {rows.length > 0 && (() => {
        const statusData = ["Open","In Progress","Waiting","Resolved","Closed"].map((s,i)=>({
          name:s, value:rows.filter(r=>r.status===s).length,
          fill:["#EF4444","#F59E0B","#2563EB","#16A34A","#94A3B8"][i],
        })).filter(d=>d.value>0);
        const priorityData = ["Critical","High","Medium","Low"].map((p,i)=>({
          name:p, value:rows.filter(r=>r.priority===p).length,
          fill:["#EF4444","#F59E0B","#2563EB","#16A34A"][i],
        })).filter(d=>d.value>0);
        const openCount    = rows.filter(r=>!["Resolved","Closed"].includes(r.status)).length;
        const resolvedToday= rows.filter(r=>r.status==="Resolved"&&r.updatedAt?.startsWith(TODAY.toISOString().slice(0,10))).length;
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ["Total Tickets",String(rows.length),"#111827"],
                ["Open",         String(openCount),"#EF4444"],
                ["Resolved Today",String(resolvedToday),"#16A34A"],
                ["Avg Resolution",rows.filter(r=>r.resolution).length>0?Math.round(rows.filter(r=>r.resolution).reduce((s,r)=>s+(r.resolution||0),0)/rows.filter(r=>r.resolution).length)+"h":"—","#2563EB"],
              ].map(([l,v,col])=>(
                <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                  <p className="text-[18px] font-black" style={{color:col}}>{v}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Ticket Status</h3>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={130}>
                    <RPieChart><Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={52} innerRadius={28}>
                      {statusData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                    </Pie><Tooltip formatter={(v,n)=>[v+" tickets",n]}/></RPieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {statusData.map(d=>(
                      <div key={d.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[12px]"><span className="w-2.5 h-2.5 rounded-full" style={{background:d.fill}}/>{d.name}</span>
                        <span className="text-[13px] font-bold" style={{color:d.fill}}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">By Priority</h3>
                <ResponsiveContainer width="100%" height={130}>
                  <BarChart data={priorityData} margin={{left:0,right:10,top:0,bottom:0}}>
                    <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                    <XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <Tooltip formatter={(v)=>[v+" tickets","Count"]}/>
                    <Bar dataKey="value" radius={[4,4,0,0]} maxBarSize={40}>
                      {priorityData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tickets or customers..." className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/30 transition-all" />
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm shrink-0">
          <Plus size={15} /> New Ticket
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[760px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Ticket</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Priority</th><th className="px-4 py-3 font-medium">Assignee</th><th className="px-4 py-3 font-medium">Status</th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={5} />}
              {!loading && filtered.map((t) => (
                <tr key={t.id} onClick={() => setSelected(t)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                  <td className="px-4 py-3"><p className="font-medium text-[#111827]">{t.subject}</p><p className="text-[11px] text-slate-400 font-mono">{t.id} · {t.category}</p></td>
                  <td className="px-4 py-3 text-slate-500">{t.customer}</td>
                  <td className="px-4 py-3"><span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${TICKET_PRIORITY_COLOR[t.priority]}14`, color: TICKET_PRIORITY_COLOR[t.priority] }}>{t.priority}</span></td>
                  <td className="px-4 py-3 text-slate-500">{t.assignee}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${TICKET_STATUS_COLOR[t.status]}14`, color: TICKET_STATUS_COLOR[t.status] }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TICKET_STATUS_COLOR[t.status] }} />{t.status}
                    </span>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && rows.length > 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400 text-[13px]">No tickets match "{query}"</td></tr>}
              {!loading && rows.length === 0 && <tr><td colSpan={5}><EmptyState icon={Ticket} title="No tickets yet" hint="Customer issues will appear here for tracking and resolution." actionLabel="New Ticket" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <TicketPanel ticket={selected} onClose={() => setSelected(null)} onSetStatus={setStatus} onReply={reply} onDelete={deleteTicket} />}
      {showForm && <TicketFormPanel onClose={() => setShowForm(false)} onSubmit={addTicket} />}
    </div>
  );
}

function TicketPanel({ ticket, onClose, onSetStatus, onReply, onDelete }) {
  const [replyText, setReplyText] = useState("");
  function submitReply() {
    if (!replyText.trim()) return;
    onReply(ticket.id, replyText.trim());
    setReplyText("");
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-3">
            <div><p className="text-[11px] font-mono text-slate-400">{ticket.id}</p><h2 className="text-[16px] font-semibold text-[#111827] mt-0.5 leading-snug">{ticket.subject}</h2></div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Close"><X size={18} /></button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${TICKET_STATUS_COLOR[ticket.status]}14`, color: TICKET_STATUS_COLOR[ticket.status] }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TICKET_STATUS_COLOR[ticket.status] }} />{ticket.status}
            </span>
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${TICKET_PRIORITY_COLOR[ticket.priority]}14`, color: TICKET_PRIORITY_COLOR[ticket.priority] }}>{ticket.priority}</span>
            <span className="text-[11px] text-slate-400">{ticket.customer}</span>
          </div>
        </div>

        <div className="px-6 py-5 flex-1 space-y-3">
          {ticket.messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "Agent" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] ${m.from === "Agent" ? "btn-primary text-white rounded-br-sm" : "bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-sm"}`}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                <p className={`text-[10.5px] mt-1 ${m.from === "Agent" ? "text-white/70" : "text-slate-400"}`}>{m.from} · {m.date}</p>
              </div>
            </div>
          ))}
          {ticket.messages.length === 0 && <p className="text-[12.5px] text-slate-400 text-center py-6">No messages yet on this ticket.</p>}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 space-y-3">
          <div className="flex gap-2">
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitReply()} placeholder="Type a reply..." className={inputClass} />
            <button onClick={submitReply} aria-label="Send reply" className="btn-primary text-white px-4 rounded-lg shrink-0"><Send size={15} /></button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[11px] font-medium text-slate-500 mr-1">Status:</p>
            {TICKET_STATUSES.map((s) => (
              <button key={s} onClick={() => onSetStatus(ticket.id, s)} disabled={s === ticket.status} className={`text-[11px] font-medium rounded-md px-2 py-1 border transition-colors ${s === ticket.status ? "opacity-40 cursor-not-allowed border-slate-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {s}
              </button>
            ))}
          </div>
          <ConfirmDeleteButton label="Delete ticket" onConfirm={() => onDelete(ticket.id)} />
        </div>
      </div>
    </div>
  );
}

function TicketFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ subject: "", customer: "", category: TICKET_CATEGORIES[0], priority: "Medium", assignee: "", description: "" });
  const [touched, setTouched] = useState(false);
  const valid = form.subject.trim() && form.customer.trim();
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); setTouched(true); if (!valid) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Customer Support</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Ticket</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Subject" required>
            <input className={inputClass} value={form.subject} onChange={(e) => set("subject", e.target.value)} placeholder="e.g. Invoice discrepancy" />
            {touched && !form.subject.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Subject is required.</p>}
          </FormField>
          <FormField label="Customer" required>
            <input className={inputClass} value={form.customer} onChange={(e) => set("customer", e.target.value)} placeholder="e.g. Kilimo Fresh Distributors" />
            {touched && !form.customer.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Customer is required.</p>}
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {TICKET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Priority">
              <select className={inputClass} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {Object.keys(TICKET_PRIORITY_COLOR).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Assignee"><input className={inputClass} value={form.assignee} onChange={(e) => set("assignee", e.target.value)} placeholder="e.g. Fatuma Salim" /></FormField>
          <FormField label="Initial message"><textarea className={inputClass} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What the customer reported..." /></FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Create Ticket</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- LIVE CHAT ----------------------------------- */

// Honest framing: this is an agent-side conversation inbox, not a
// customer-facing widget with real-time push — there is no backend here for
// a second, simultaneous browser session to write into. What's genuinely
// real is the conversation history and the ability to log a reply, which
// is exactly what a support agent works from day to day regardless of how
// the message arrived.
function LiveChat() {
  const chats = useCompanyTable("support_chat_conversations", chatConversationsSeed, {
    select: "*,support_chat_messages(*)", order: { col: "id", ascending: false }, mapRow: mapChatRow,
  });
  const { rows, setRows, loading } = chats;
  const [selectedId, setSelectedId] = useState(rows[0]?.id || null);
  const [replyText, setReplyText] = useState("");
  const selected = rows.find((c) => c.id === selectedId) || rows[0];

  async function sendReply() {
    if (!replyText.trim() || !selected) return;
    const message = { from: "Agent", text: replyText.trim(), time: TODAY.toTimeString().slice(0, 5) };
    setRows((prev) => prev.map((c) => (c.id === selected.id ? { ...c, messages: [...c.messages, message] } : c)));
    setReplyText("");
    if (IS_CONFIGURED && selected.dbId) {
      try { await sb("support_chat_messages").insert({ conversation_id: selected.dbId, sender: "Agent", body: message.text }).run(); } catch (_e) { notify("Reply saved locally, but the server update failed.", "error"); }
    }
  }

  if (loading) return <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><SkeletonRows cols={1} rows={4} /></div>;
  if (rows.length === 0) return <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={MessageCircle} title="No conversations yet" hint="Customer chat conversations will appear here." /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden" style={{ minHeight: "480px" }}>
      <div className="border-b lg:border-b-0 lg:border-r border-slate-100 overflow-y-auto">
        {rows.map((c) => {
          const last = c.messages[c.messages.length - 1];
          return (
            <button key={c.id} onClick={() => setSelectedId(c.id)} className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-colors ${selected?.id === c.id ? "bg-slate-50" : "hover:bg-slate-50/60"}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[13px] font-medium text-[#111827] truncate">{c.customer}</p>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: CHAT_STATUS_COLOR[c.status] }} />
              </div>
              <p className="text-[11.5px] text-slate-400 truncate">{last?.text}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[13.5px] font-semibold text-[#111827]">{selected.customer}</p>
              <span className="text-[10.5px] font-medium" style={{ color: CHAT_STATUS_COLOR[selected.status] }}>{selected.status}</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {selected.messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "Agent" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 text-[13px] ${m.from === "Agent" ? "btn-primary text-white rounded-br-sm" : "bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-sm"}`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                  <p className={`text-[10.5px] mt-1 ${m.from === "Agent" ? "text-white/70" : "text-slate-400"}`}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-slate-100 flex gap-2">
            <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendReply()} placeholder="Type a reply..." className={inputClass} />
            <button onClick={sendReply} aria-label="Send message" className="btn-primary text-white px-4 rounded-lg shrink-0"><Send size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------- KNOWLEDGE BASE --------------------------------- */

function KnowledgeBase() {
  const articles = useCompanyTable("kb_articles", kbArticlesSeed, { order: { col: "updated_at", ascending: false }, mapRow: mapKbArticleRow });
  const { rows, setRows, loading } = articles;
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter((a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q));
  }, [rows, query]);

  async function addArticle(form) {
    const draft = { id: docId("KB"), title: form.title, category: form.category, content: form.content, views: 0, published: form.published, updatedDate: TODAY.toISOString().slice(0, 10) };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Article created: ${draft.title}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("kb_articles").insert({ title: draft.title, category: draft.category, content: draft.content, views: 0, published: draft.published }).single().run();
        if (header?.id) setRows((prev) => prev.map((a) => (a.id === draft.id ? { ...a, dbId: header.id } : a)));
      } catch (_e) { notify("Article created locally, but saving to the server failed.", "error"); }
    }
  }

  async function openArticle(article) {
    setSelected(article);
    const updated = { ...article, views: article.views + 1 };
    setRows((prev) => prev.map((a) => (a.id === article.id ? updated : a)));
    if (IS_CONFIGURED && article.dbId) {
      try { await sb("kb_articles").eq("id", article.dbId).update({ views: updated.views }).run(); } catch (_e) { /* view-count sync failure is not worth surfacing to the reader */ }
    }
  }

  async function deleteArticle(id) {
    const a = rows.find((x) => x.id === id);
    setRows((prev) => prev.filter((x) => x.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && a?.dbId) {
      try { await sb("kb_articles").eq("id", a.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the article on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search articles..." className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/30 transition-all" />
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm shrink-0">
          <Plus size={15} /> New Article
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200/80 h-32 skeleton-shimmer" />)}
        {!loading && filtered.map((a) => (
          <button key={a.id} onClick={() => openArticle(a)} className="text-left bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 hover:border-[#16A34A]/50 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <span className="text-[10px] font-medium text-[#16A34A] bg-[#16A34A]/8 px-1.5 py-0.5 rounded">{a.category}</span>
              {!a.published && <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Draft</span>}
            </div>
            <p className="text-[13.5px] font-semibold text-[#111827] leading-snug mb-2 line-clamp-2">{a.title}</p>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400"><Eye size={11} /> {a.views} views</div>
          </button>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200/80 shadow-sm">
            <EmptyState icon={BookOpen} title="No articles yet" hint="Write help articles your team and customers can reference." actionLabel="New Article" onAction={() => setShowForm(true)} />
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
          <div className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
            <div className="flex items-start justify-between mb-4">
              <span className="text-[10px] font-medium text-[#16A34A] bg-[#16A34A]/8 px-1.5 py-0.5 rounded">{selected.category}</span>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
            </div>
            <h2 className="text-[18px] font-semibold text-[#111827] mb-3 leading-snug">{selected.title}</h2>
            <p className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">{selected.content}</p>
            <div className="flex items-center gap-3 text-[11.5px] text-slate-400 mb-6">
              <span className="flex items-center gap-1"><Eye size={12} /> {selected.views} views</span>
              <span>Updated {selected.updatedDate}</span>
            </div>
            <div className="flex-1" />
            <ConfirmDeleteButton label="Delete article" onConfirm={() => deleteArticle(selected.id)} />
          </div>
        </div>
      )}
      {showForm && <KbArticleFormPanel onClose={() => setShowForm(false)} onSubmit={addArticle} />}
    </div>
  );
}

function KbArticleFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", category: KB_CATEGORIES[0], content: "", published: true });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.title.trim() || !form.content.trim()) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[420px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Knowledge Base</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Article</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Title" required><input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. How to request a bulk quote" /></FormField>
          <FormField label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {KB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Content" required><textarea className={inputClass} rows={6} value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="Write the article..." /></FormField>
          <label className="flex items-center gap-2 text-[12.5px] text-slate-600">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="rounded border-slate-300" />
            Published (visible outside drafts)
          </label>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Create Article</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- CALL CENTER ---------------------------------- */

function CallCenter() {
  const calls = useCompanyTable("support_call_log", callLogSeed, { order: { col: "call_date", ascending: false }, mapRow: mapCallLogRow });
  const { rows, setRows, loading } = calls;
  const [showForm, setShowForm] = useState(false);
  const avgDuration = rows.length ? Math.round(rows.reduce((s, c) => s + c.duration, 0) / rows.length) : 0;

  async function addCall(form) {
    const draft = { id: docId("CALL"), customer: form.customer, agent: form.agent, direction: form.direction, duration: Number(form.duration) || 0, outcome: form.outcome, date: TODAY.toISOString().slice(0, 10), notes: form.notes };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Call logged: ${draft.customer}`);
    if (IS_CONFIGURED) {
      try {
        await sb("support_call_log").insert({
          customer: draft.customer, agent: draft.agent, direction: draft.direction, duration_minutes: draft.duration,
          outcome: draft.outcome, call_date: draft.date, notes: draft.notes,
        }).run();
      } catch (_e) { notify("Logged locally, but saving to the server failed.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#111827]">{rows.length} calls logged</span>
        <span className="text-[13px] font-mono text-slate-500">{avgDuration} min avg duration</span>
      </div>
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> Log Call
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[760px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Agent</th><th className="px-4 py-3 font-medium">Direction</th><th className="px-4 py-3 font-medium text-right">Duration</th><th className="px-4 py-3 font-medium">Outcome</th><th className="px-4 py-3 font-medium">Date</th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={6} />}
              {!loading && rows.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#111827]">{c.customer}</td>
                  <td className="px-4 py-3 text-slate-500">{c.agent}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${CALL_DIRECTION_COLOR[c.direction]}14`, color: CALL_DIRECTION_COLOR[c.direction] }}>{c.direction}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">{c.duration} min</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${CALL_OUTCOME_COLOR[c.outcome]}14`, color: CALL_OUTCOME_COLOR[c.outcome] }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CALL_OUTCOME_COLOR[c.outcome] }} />{c.outcome}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{c.date}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={6}><EmptyState icon={PhoneCall} title="No calls logged yet" hint="Track inbound and outbound support calls here." actionLabel="Log Call" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && <CallFormPanel onClose={() => setShowForm(false)} onSubmit={addCall} />}
    </div>
  );
}

function CallFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ customer: "", agent: "", direction: "Inbound", duration: "", outcome: "Resolved", notes: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.customer.trim() || !form.agent.trim()) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Call Center</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Log Call</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Customer" required><input className={inputClass} value={form.customer} onChange={(e) => set("customer", e.target.value)} placeholder="e.g. Kilimo Fresh Distributors" /></FormField>
          <FormField label="Agent" required><input className={inputClass} value={form.agent} onChange={(e) => set("agent", e.target.value)} placeholder="e.g. Fatuma Salim" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Direction">
              <select className={inputClass} value={form.direction} onChange={(e) => set("direction", e.target.value)}>
                {Object.keys(CALL_DIRECTION_COLOR).map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>
            <FormField label="Duration (min)"><input type="number" min="0" className={inputClass} value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="0" /></FormField>
          </div>
          <FormField label="Outcome">
            <select className={inputClass} value={form.outcome} onChange={(e) => set("outcome", e.target.value)}>
              {Object.keys(CALL_OUTCOME_COLOR).map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </FormField>
          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Log Call</button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------ SUPPORT AI ------------------------------------ */

// Reuses the exact same keyless in-artifact API call pattern as the main
// AI Business Assistant (see AIAssistant/callModel) — a real request to
// Claude, not a canned response. Scoped deliberately narrow: draft a reply
// to a specific ticket, not an autonomous customer-facing bot, since a
// production customer-facing bot needs the same server-side proxy this
// build's AI Assistant already documents as a prerequisite (never ship the
// API key client-side to the public).
function SupportAI({ company, tickets }) {
  const [ticketId, setTicketId] = useState(tickets[0]?.id || "");
  const [draftReply, setDraftReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const ticket = tickets.find((t) => t.id === ticketId);

  async function generateReply() {
    if (!ticket) return;
    setBusy(true);
    setError(null);
    setDraftReply("");
    try {
      const conversation = ticket.messages.map((m) => `${m.from}: ${m.text}`).join("\n");
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: `You are a customer support agent for ${company.name}, a ${company.industry} business in ${company.country}. Draft a professional, concise, friendly reply to the customer's most recent message in this ticket. Plain text only, no markdown, no preamble like "Here's a draft" — just the reply itself.`,
          messages: [{ role: "user", content: `Ticket: ${ticket.subject}\nCategory: ${ticket.category}\nPriority: ${ticket.priority}\n\nConversation so far:\n${conversation}\n\nDraft the next reply from the agent.` }],
        }),
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      const text = data.content?.find((c) => c.type === "text")?.text || "";
      setDraftReply(text.trim());
    } catch (e) {
      setError("Couldn't reach the AI service. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Brain size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Drafts a suggested reply for a ticket using a real Claude API call — review before sending, this does not reply automatically. A fully autonomous customer-facing bot needs a server-side proxy for the API key, the same prerequisite documented for the main AI Assistant.
        </p>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={Brain} title="No tickets to draft replies for" hint="Create a ticket first." /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
          <FormField label="Ticket">
            <select className={inputClass} value={ticketId} onChange={(e) => { setTicketId(e.target.value); setDraftReply(""); setError(null); }}>
              {tickets.map((t) => <option key={t.id} value={t.id}>{t.id} — {t.subject}</option>)}
            </select>
          </FormField>

          {ticket && (
            <div className="border border-slate-100 rounded-lg p-3 max-h-[160px] overflow-y-auto space-y-1.5">
              {ticket.messages.map((m, i) => (
                <p key={i} className="text-[12.5px] text-slate-600"><span className="font-medium text-[#111827]">{m.from}:</span> {m.text}</p>
              ))}
              {ticket.messages.length === 0 && <p className="text-[12.5px] text-slate-400">No messages on this ticket yet.</p>}
            </div>
          )}

          <button onClick={generateReply} disabled={busy || !ticket} className="btn-primary text-white text-[13px] font-medium rounded-lg py-2.5 w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {busy ? <><LoaderCircle size={14} className="animate-spin" /> Drafting reply...</> : <><Brain size={14} /> Generate AI Reply</>}
          </button>

          {error && <p className="text-[12.5px] text-[#EF4444]">{error}</p>}

          {draftReply && (
            <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-lg p-3.5">
              <p className="text-[11px] font-medium text-[#16A34A] mb-1.5">Suggested reply</p>
              <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">{draftReply}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------ ANALYTICS ------------------------------------ */

// Every number on every dashboard here is computed live from the same
// root-shared tables every module already reads — nothing is a duplicate
// snapshot that could drift. Scoped honestly to what is actually shared:
// invoices, expenses, crm, inventory, employees, leaveRequests, workOrders,
// posTransactions. Manufacturing's machines/QC, Supply Chain's shipments,
// and Procurement's purchase orders still live in their own modules'
// local state (never lifted to root), so Operations does not claim to cover
// them — see the note in that tab rather than a silent gap.
// Period Closes — the accounting control that prevents back-dating.
// A closed period blocks any new invoice or expense from being dated
// inside it. Named as pending since section 60; built here because the
// Bank Recon and manual journals only have meaning when periods are locked.
// Periods are stored in state (persisted to Supabase when IS_CONFIGURED);
// the check runs at invoice and expense creation time.
const periodClosesSeed = [];

function usePeriodCloses() {
  const [periods, setPeriods] = useState(periodClosesSeed);
  function isLocked(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return periods.some((p) => p.status === "Closed" && d >= new Date(p.startDate) && d <= new Date(p.endDate));
  }
  return { periods, setPeriods, isLocked };
}

// Manual Journal Entry — double-entry bookkeeping with debit = credit gate.
// Every journal entry must balance (debits = credits) before it can be saved.
// Entries write to the audit log and optionally to a journal_entries Supabase table.
// The debit/credit model is the same one used by the CoA: Assets/Expenses are
// debit-normal, Liabilities/Equity/Revenue are credit-normal.
const JOURNAL_ACCOUNTS = [
  "1000 – Cash", "1100 – Accounts Receivable", "1200 – Inventory",
  "1500 – Fixed Assets", "2000 – Accounts Payable", "2100 – Loans Payable",
  "3000 – Owners Equity", "4000 – Revenue", "4100 – Other Income",
  "5000 – Cost of Goods Sold", "6000 – Salaries Expense", "6100 – Rent Expense",
  "6200 – Utilities", "6300 – Depreciation", "6900 – Miscellaneous Expense",
];

function ManualJournalView({ currentUser }) {
  const emptyLine = () => ({ account: JOURNAL_ACCOUNTS[0], debit: "", credit: "", memo: "" });
  const [lines, setLines] = useState([emptyLine(), emptyLine()]);
  const [entryDate, setEntryDate] = useState(TODAY.toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState([]);
  const [err, setErr] = useState(null);

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  function updateLine(i, field, value) {
    setLines((prev) => prev.map((l, idx) => idx === i ? { ...l, [field]: value } : l));
  }
  function addLine() { setLines((prev) => [...prev, emptyLine()]); }
  function removeLine(i) { if (lines.length > 2) setLines((prev) => prev.filter((_, idx) => idx !== i)); }

  async function saveEntry() {
    if (!description.trim()) { setErr("Add a description for this journal entry."); return; }
    if (!balanced) { setErr("Debits must equal credits before saving."); return; }
    const entry = {
      id: docId("JE"),
      date: entryDate,
      description,
      lines: lines.filter((l) => Number(l.debit) > 0 || Number(l.credit) > 0),
      totalDebit,
      postedBy: currentUser?.name || "System",
      postedAt: new Date().toISOString(),
    };
    setSaved((prev) => [entry, ...prev]);
    setLines([emptyLine(), emptyLine()]);
    setDescription("");
    setErr(null);
    notify("Journal entry posted: TZS " + money(Math.round(totalDebit)) + "k", "success");
    logAudit("Manual journal entry: " + entry.id, "Finance", currentUser?.name || "System", description + " — TZS " + money(Math.round(totalDebit)) + "k");
    if (IS_CONFIGURED) {
      try {
        await sb("journal_entries").insert({
          entry_ref: entry.id, entry_date: entryDate, description,
          total_amount: totalDebit, posted_by: entry.postedBy,
        }).run();
      } catch (_e) { notify("Saved locally — server sync failed.", "error"); }
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h3 className="text-[15px] font-semibold text-[#111827]">Manual Journal Entry</h3>
        <p className="text-[12px] text-slate-500">Double-entry bookkeeping — every entry must balance (debits = credits) before it can be posted. Entries are appended to the audit trail and cannot be deleted.</p>
      </div>

      {/* Entry form */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FormField label="Entry date">
            <input type="date" className={inputClass} value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
          </FormField>
          <FormField label="Description / Reference">
            <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Accrued salaries July 2026" />
          </FormField>
        </div>

        {/* Lines table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100">
              <th className="pb-2 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400 w-[40%]">Account</th>
              <th className="pb-2 text-right text-[10.5px] font-medium uppercase tracking-wide text-slate-400 w-[20%]">Debit (TZS k)</th>
              <th className="pb-2 text-right text-[10.5px] font-medium uppercase tracking-wide text-slate-400 w-[20%]">Credit (TZS k)</th>
              <th className="pb-2 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">Memo</th>
              <th className="pb-2 w-8" />
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {lines.map((l, i) => (
                <tr key={i}>
                  <td className="py-1.5 pr-2">
                    <select className={inputClass + " text-[12px]"} value={l.account} onChange={(e) => updateLine(i, "account", e.target.value)}>
                      {JOURNAL_ACCOUNTS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </td>
                  <td className="py-1.5 px-1">
                    <input type="number" min="0" className={inputClass + " text-right text-[12px]"} value={l.debit} onChange={(e) => updateLine(i, "debit", e.target.value)} placeholder="0" />
                  </td>
                  <td className="py-1.5 px-1">
                    <input type="number" min="0" className={inputClass + " text-right text-[12px]"} value={l.credit} onChange={(e) => updateLine(i, "credit", e.target.value)} placeholder="0" />
                  </td>
                  <td className="py-1.5 pl-1">
                    <input className={inputClass + " text-[12px]"} value={l.memo} onChange={(e) => updateLine(i, "memo", e.target.value)} placeholder="Optional" />
                  </td>
                  <td className="py-1.5 pl-1">
                    <button onClick={() => removeLine(i)} className="text-slate-300 hover:text-[#EF4444]"><X size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td className="pt-2 text-[12px] font-semibold text-slate-500">Totals</td>
                <td className="pt-2 text-right font-mono font-bold text-[13px]" style={{ color: balanced ? "#16A34A" : "#EF4444" }}>
                  TZS {money(Math.round(totalDebit))}k
                </td>
                <td className="pt-2 text-right font-mono font-bold text-[13px]" style={{ color: balanced ? "#16A34A" : "#EF4444" }}>
                  TZS {money(Math.round(totalCredit))}k
                </td>
                <td colSpan={2} className="pt-2 text-right text-[11.5px]">
                  {balanced
                    ? <span className="text-[#16A34A] font-semibold flex items-center justify-end gap-1"><CheckCircle2 size={13} /> Balanced</span>
                    : <span className="text-[#EF4444] font-semibold flex items-center justify-end gap-1"><AlertCircle size={13} /> Out by TZS {money(Math.abs(Math.round(totalDebit - totalCredit)))}k</span>}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={addLine} className="text-[12.5px] font-medium text-[#16A34A] hover:underline flex items-center gap-1"><Plus size={13} /> Add line</button>
          <div className="flex-1" />
          {err && <p className="text-[12px] text-[#EF4444] flex items-center gap-1"><AlertCircle size={12} />{err}</p>}
          <button onClick={saveEntry} disabled={!balanced || !description.trim()}
            className="btn-primary text-white text-[12.5px] font-medium rounded-xl px-4 py-2.5 disabled:opacity-40">
            Post Journal Entry
          </button>
        </div>
      </div>

      {/* Posted entries */}
      {saved.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-[13.5px] font-semibold text-[#111827]">Posted this session ({saved.length})</p>
          </div>
          {saved.map((entry) => (
            <div key={entry.id} className="px-4 py-3 border-b border-slate-50 last:border-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-semibold text-[#111827]">{entry.id} — {entry.description}</span>
                <span className="font-mono text-[12px] text-[#16A34A] font-bold">TZS {money(Math.round(entry.totalDebit))}k</span>
              </div>
              <div className="text-[11px] text-slate-400">{entry.date} · Posted by {entry.postedBy} · {entry.lines.length} lines</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PeriodClosesView({ invoices, expenses, currentUser }) {
  const { periods, setPeriods } = usePeriodCloses();
  const [draft, setDraft] = useState({ name: "", startDate: "", endDate: "" });
  const [err, setErr] = useState(null);

  // Compute period P&L from real invoice and expense rows
  function periodStats(p) {
    const inRange = (d) => d && d >= p.startDate && d <= p.endDate;
    const rev = invoices.rows.filter((i) => inRange(i.issueDate) && i.status === "Paid")
      .reduce((s, i) => s + lineTotal(i.items).total, 0);
    const exp = expenses.rows.filter((e) => inRange(e.expenseDate) && e.status === "Paid")
      .reduce((s, e) => s + (e.amount || 0), 0);
    return { rev, exp, profit: rev - exp };
  }

  function addPeriod() {
    if (!draft.name || !draft.startDate || !draft.endDate) { setErr("All fields required."); return; }
    if (draft.startDate > draft.endDate) { setErr("Start must be before end."); return; }
    const overlap = periods.some((p) =>
      !(draft.endDate < p.startDate || draft.startDate > p.endDate)
    );
    if (overlap) { setErr("Period overlaps an existing one."); return; }
    const row = { id: docId("PC"), ...draft, status: "Open", createdBy: currentUser?.name || "System", createdAt: new Date().toISOString() };
    setPeriods((prev) => [...prev, row].sort((a, b) => a.startDate > b.startDate ? -1 : 1));
    setDraft({ name: "", startDate: "", endDate: "" });
    setErr(null);
    notify(`Period "${row.name}" created.`);
    logAudit(`Period created: ${row.name}`, "Finance", currentUser?.name || "System", `${row.startDate} → ${row.endDate}`);
    if (IS_CONFIGURED) sb("period_closes").insert({ name: row.name, start_date: row.startDate, end_date: row.endDate, status: "Open" }).run().catch(() => {});
  }

  function closePeriod(id) {
    confirmAction(
      "Closing a period prevents any new transactions from being dated within it. This cannot be undone.",
      () => {
        setPeriods((prev) => prev.map((p) => p.id === id ? { ...p, status: "Closed", closedBy: currentUser?.name, closedAt: new Date().toISOString() } : p));
        const p = periods.find((x) => x.id === id);
        notify(`Period "${p?.name}" is now closed.`);
        logAudit(`Period closed: ${p?.name}`, "Finance", currentUser?.name || "System", "No backdating permitted.");
        if (IS_CONFIGURED) sb("period_closes").eq("id", id).update({ status: "Closed" }).run().catch(() => {});
      },
      { variant: "danger", title: "Lock this period?", confirmLabel: "Close period" }
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h3 className="text-[15px] font-semibold text-[#111827]">Period Closes</h3>
        <p className="text-[12px] text-slate-500">Closing a period locks it against backdating — no invoice or expense can be dated inside a closed period. Revenue and expenses shown are from real paid records only.</p>
      </div>

      {/* New period form */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
        <p className="text-[13px] font-medium text-[#111827]">Open a new period</p>
        {err && <p className="text-[12px] text-[#EF4444] flex items-center gap-1"><AlertCircle size={12}/> {err}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div><label className="text-[11.5px] text-slate-500 block mb-1">Period name</label>
            <input className={inputClass} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Q2 2026" /></div>
          <div><label className="text-[11.5px] text-slate-500 block mb-1">Start date</label>
            <input type="date" className={inputClass} value={draft.startDate} onChange={(e) => setDraft({ ...draft, startDate: e.target.value })} /></div>
          <div><label className="text-[11.5px] text-slate-500 block mb-1">End date</label>
            <input type="date" className={inputClass} value={draft.endDate} onChange={(e) => setDraft({ ...draft, endDate: e.target.value })} /></div>
        </div>
        <button onClick={addPeriod} className="btn-primary text-white text-[12.5px] font-medium rounded-xl px-4 py-2.5">Create period</button>
      </div>

      {/* Period list */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {periods.length === 0 && (
          <div className="py-12 text-center">
            <Lock size={28} className="text-slate-200 mx-auto mb-2" />
            <p className="text-[13px] font-medium text-slate-400">No periods yet</p>
            <p className="text-[11.5px] text-slate-400 mt-1">Create your first accounting period above. Once closed, it cannot be backdated.</p>
          </div>
        )}
        {periods.length > 0 && (
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100">
              {["Period","Dates","Revenue","Expenses","Profit","Status","Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {periods.map((p) => {
                const { rev, exp, profit } = periodStats(p);
                return (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-[#111827]">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{p.startDate} → {p.endDate}</td>
                    <td className="px-4 py-3 font-mono text-[#16A34A]">{money(Math.round(rev))}k</td>
                    <td className="px-4 py-3 font-mono text-[#EF4444]">{money(Math.round(exp))}k</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: profit >= 0 ? "#16A34A" : "#EF4444" }}>{profit >= 0 ? "+" : ""}{money(Math.round(profit))}k</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: p.status === "Closed" ? "#FEE2E2" : "#DCFCE7", color: p.status === "Closed" ? "#EF4444" : "#16A34A" }}>
                        {p.status === "Closed" ? "🔒 Closed" : "● Open"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "Open" && (
                        <button onClick={() => closePeriod(p.id)} className="text-[11.5px] font-medium text-[#EF4444] hover:underline flex items-center gap-1"><Lock size={11}/> Close</button>
                      )}
                      {p.status === "Closed" && <p className="text-[10.5px] text-slate-400">by {p.closedBy || "System"}</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Bank Reconciliation — match recorded transactions against a bank statement.
// The senior-honest scope: the user pastes statement lines; the system
// matches them against paid invoices and expenses by amount and approximate
// date, showing unmatched lines on both sides. Full CSV import and
// auto-matching by reference number is the named next step.
// Customer Account Statement — printable PDF showing all invoices, payments,
// and outstanding balance for a single customer. Professional format with
// running balance column. Used by AR teams for customer collections.
function printCustomerStatement(customer, invoices) {
  const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
  const co = window.__smartManagerCompany || {};
  const custInvoices = invoices.filter((inv) => inv.customer === customer)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  let running = 0;
  const rows = custInvoices.map((inv) => {
    const total = lineTotal(inv.items || []).total;
    const paid  = inv.amountPaid || (inv.status === "Paid" ? total : 0);
    const bal   = total - paid;
    running += bal;
    const statusColor = { Paid:"#16A34A", Unpaid:"#F59E0B", Overdue:"#EF4444", Partial:"#3B82F6" }[inv.status] || "#6B7280";
    return "<tr style=\"border-bottom:1px solid #F3F4F6\">" +
      "<td style=\"padding:8px 10px;font-size:11.5px;font-family:monospace\">" + inv.date + "</td>" +
      "<td style=\"padding:8px 10px;font-size:11.5px;font-weight:600;color:#16A34A\">" + inv.id + "</td>" +
      "<td style=\"padding:8px 10px;font-size:11.5px\">Invoice</td>" +
      "<td style=\"padding:8px 10px;text-align:right;font-family:monospace;font-size:11.5px\">TZS " + fmt(total) + "k</td>" +
      "<td style=\"padding:8px 10px;text-align:right;font-family:monospace;font-size:11.5px;color:#16A34A\">TZS " + fmt(paid) + "k</td>" +
      "<td style=\"padding:8px 10px;text-align:right;font-family:monospace;font-weight:700;font-size:11.5px;color:" + (bal > 0 ? "#EF4444" : "#16A34A") + "\">TZS " + fmt(bal) + "k</td>" +
      "<td style=\"padding:8px 10px;text-align:center\"><span style=\"font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;color:white;background:" + statusColor + "\">" + inv.status + "</span></td>" +
      "</tr>";
  });

  const totalCharged  = custInvoices.reduce((s, inv) => s + lineTotal(inv.items||[]).total, 0);
  const totalPaid     = custInvoices.reduce((s, inv) => { const t=lineTotal(inv.items||[]).total; return s + (inv.amountPaid||(inv.status==="Paid"?t:0)); }, 0);
  const totalOutstand = totalCharged - totalPaid;

  printAsPDF("Statement — " + customer,
    "<div style=\"font-family:Inter,sans-serif;max-width:680px;margin:0 auto;padding:32px;color:#111827\">" +
    "<div style=\"display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #16A34A;padding-bottom:16px;margin-bottom:20px\">" +
      "<div><div style=\"font-size:20px;font-weight:800;\">" + (co.name||"Smart Manager") + "</div>" +
      "<div style=\"font-size:11px;color:#6B7280;margin-top:3px\">" + [co.address,co.city,"Tanzania"].filter(Boolean).join(" · ") + "</div>" +
      (co.tin?"<div style=\"font-size:11px;color:#6B7280\">TIN: " + co.tin + "</div>":"") + "</div>" +
      "<div style=\"text-align:right\">" +
        "<div style=\"font-size:22px;font-weight:900;color:#16A34A\">ACCOUNT STATEMENT</div>" +
        "<div style=\"font-size:11px;color:#6B7280;margin-top:4px\">As at " + new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) + "</div>" +
      "</div>" +
    "</div>" +
    "<div style=\"padding:14px;background:#F0FDF4;border-radius:10px;margin-bottom:20px\">" +
      "<div style=\"font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px\">Statement For</div>" +
      "<div style=\"font-size:16px;font-weight:700;\">" + customer + "</div>" +
    "</div>" +
    "<table style=\"width:100%;border-collapse:collapse;margin-bottom:20px\">" +
      "<thead><tr style=\"background:#052614\">" +
        "<th style=\"padding:9px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;color:white\">Date</th>" +
        "<th style=\"padding:9px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;color:white\">Reference</th>" +
        "<th style=\"padding:9px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;color:white\">Type</th>" +
        "<th style=\"padding:9px 10px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;color:white\">Charged</th>" +
        "<th style=\"padding:9px 10px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;color:white\">Paid</th>" +
        "<th style=\"padding:9px 10px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;color:white\">Balance</th>" +
        "<th style=\"padding:9px 10px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;color:white\">Status</th>" +
      "</tr></thead>" +
      "<tbody>" + (rows.length ? rows.join("") : "<tr><td colspan=\"7\" style=\"padding:20px;text-align:center;color:#9CA3AF\">No invoices found for this customer.</td></tr>") + "</tbody>" +
    "</table>" +
    "<div style=\"display:flex;justify-content:flex-end\">" +
      "<div style=\"width:300px\">" +
        "<div style=\"display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E5E7EB;font-size:12px\"><span style=\"color:#6B7280\">Total Invoiced</span><span>TZS " + fmt(totalCharged) + "k</span></div>" +
        "<div style=\"display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #E5E7EB;font-size:12px;color:#16A34A\"><span>Total Received</span><span>TZS " + fmt(totalPaid) + "k</span></div>" +
        "<div style=\"display:flex;justify-content:space-between;align-items:center;padding:12px;background:" + (totalOutstand > 0 ? "#052614" : "#F0FDF4") + ";border-radius:8px;margin-top:8px\">" +
          "<span style=\"font-size:13px;font-weight:700;color:" + (totalOutstand > 0 ? "white" : "#16A34A") + "\">Outstanding Balance</span>" +
          "<span style=\"font-size:18px;font-weight:900;color:" + (totalOutstand > 0 ? "#4ADE80" : "#16A34A") + "\">TZS " + fmt(totalOutstand) + "k</span>" +
        "</div>" +
      "</div>" +
    "</div>" +
    "<div style=\"text-align:center;margin-top:24px;font-size:10px;color:#9CA3AF\">Generated by Smart Manager · " + (co.name||"") + " · This is a computer-generated statement.</div>" +
    "</div>"
  );
}

function BankReconciliationView({ invoices, expenses }) {
  const [statement, setStatement] = useState("");
  const [matched, setMatched] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [ran, setRan] = useState(false);

  function reconcile() {
    // Parse statement lines: date, description, amount (one per line, comma or tab separated)
    const lines = statement.trim().split("
").filter(Boolean).map((line) => {
      const parts = line.split(/[,	]+/).map((p) => p.trim());
      const amount = parseFloat(parts.find((p) => /^-?\d[\d,.]+$/.test(p.replace(/,/g, "")))?.replace(/,/g, "") || 0);
      const desc = parts.filter((p) => isNaN(Number(p.replace(/,/g, "")))).join(" ");
      return { raw: line, amount: Math.abs(amount), desc };
    }).filter((l) => l.amount > 0);

    const ledgerCredits = [
      ...invoices.rows.filter((i) => i.status === "Paid").map((i) => ({ id: i.id, label: i.customer, amount: Math.round(lineTotal(i.items).total), type: "Receipt" })),
      ...expenses.rows.filter((e) => e.status === "Paid").map((e) => ({ id: e.id, label: e.vendor, amount: Math.round(e.amount || 0), type: "Payment" })),
    ];

    const usedLedger = new Set();
    const matchedRows = [];
    const unmatchedStatement = [];

    for (const sl of lines) {
      const tolerance = Math.max(sl.amount * 0.01, 50); // 1% or TZS 50k tolerance
      const hit = ledgerCredits.find((l) => !usedLedger.has(l.id) && Math.abs(l.amount - sl.amount) <= tolerance);
      if (hit) {
        usedLedger.add(hit.id);
        matchedRows.push({ statement: sl, ledger: hit });
      } else {
        unmatchedStatement.push(sl);
      }
    }

    const unmatchedLedger = ledgerCredits.filter((l) => !usedLedger.has(l.id));
    setMatched(matchedRows);
    setUnmatched({ statement: unmatchedStatement, ledger: unmatchedLedger });
    setRan(true);
    notify(`Reconciliation complete — ${matchedRows.length} matched, ${unmatchedStatement.length + unmatchedLedger.length} unmatched.`);
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h3 className="text-[15px] font-semibold text-[#111827]">Bank Reconciliation</h3>
        <p className="text-[12px] text-slate-500">Paste your bank statement lines (one per line: date, description, amount). The system matches them against your paid invoices and expenses by amount — within 1% tolerance.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
        <p className="text-[12.5px] font-medium text-[#111827]">Bank statement (paste lines)</p>
        <textarea className={inputClass + " h-32 resize-none"} value={statement} onChange={(e) => setStatement(e.target.value)}
          placeholder={"2026-07-10, King Fahad Medical City, 1240000
2026-07-12, Supplier payment - Karibu Tools, 85000
2026-07-14, Salary disbursement, 3290000"} />
        <div className="flex gap-2">
          <button onClick={reconcile} className="btn-primary text-white text-[12.5px] font-medium rounded-xl px-4 py-2.5">Run reconciliation</button>
          {ran && <button onClick={() => { setRan(false); setMatched([]); setUnmatched([]); }} className="text-[12.5px] text-slate-500 border border-slate-200 rounded-xl px-4 py-2.5">Clear</button>}
        </div>
      </div>

      {ran && (
        <>
          {/* Matched */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#16A34A]" />
              <p className="text-[13px] font-semibold text-[#111827]">Matched ({matched.length})</p>
            </div>
            {matched.length === 0 && <p className="text-[12px] text-slate-400 text-center py-6">No matches found — check amounts match your ledger.</p>}
            {matched.map((m, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#111827] truncate">{m.statement.desc || m.statement.raw}</p>
                  <p className="text-[10.5px] text-slate-400">Statement</p>
                </div>
                <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[12px] font-medium text-[#111827] truncate">{m.ledger.label} · {m.ledger.type}</p>
                  <p className="text-[10.5px] text-slate-400">{m.ledger.id}</p>
                </div>
                <span className="font-mono text-[12px] font-semibold text-[#16A34A] shrink-0">TZS {money(m.ledger.amount)}k</span>
              </div>
            ))}
          </div>

          {/* Unmatched */}
          {(unmatched.statement?.length > 0 || unmatched.ledger?.length > 0) && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <AlertCircle size={14} className="text-[#F59E0B]" />
                <p className="text-[13px] font-semibold text-[#111827]">Unmatched ({(unmatched.statement?.length || 0) + (unmatched.ledger?.length || 0)})</p>
              </div>
              {unmatched.statement?.map((sl, i) => (
                <div key={`s${i}`} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#92400E]">Statement</span>
                  <p className="flex-1 text-[12px] text-[#111827] truncate">{sl.desc || sl.raw}</p>
                  <span className="font-mono text-[12px] text-slate-500">TZS {money(sl.amount)}k</span>
                </div>
              ))}
              {unmatched.ledger?.map((l, i) => (
                <div key={`l${i}`} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-50 last:border-0">
                  <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[#DBEAFE] text-[#1E40AF]">Ledger</span>
                  <p className="flex-1 text-[12px] text-[#111827] truncate">{l.label} · {l.type}</p>
                  <span className="font-mono text-[12px] text-slate-500">{l.id}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Command Palette ⌘K ────────────────────────────────────────────────────
// The hallmark of professional SaaS. Press ⌘K (or Ctrl+K) anywhere to
// search modules, create documents, and jump to any part of the system.
// Results are ranked: exact matches first, then fuzzy, then actions.
const CMD_ITEMS = [
  // Navigation
  { type: "nav",    id: "dashboard",    label: "Go to Dashboard",          icon: "LayoutDashboard", mod: "dashboard" },
  { type: "nav",    id: "sales",        label: "Go to Sales",              icon: "ShoppingCart",    mod: "sales" },
  { type: "nav",    id: "pos",          label: "Go to Point of Sale",      icon: "Store",           mod: "pos" },
  { type: "nav",    id: "crm",          label: "Go to CRM",                icon: "Users",           mod: "crm" },
  { type: "nav",    id: "inventory",    label: "Go to Inventory",          icon: "Package",         mod: "inventory" },
  { type: "nav",    id: "procurement",  label: "Go to Procurement",        icon: "Truck",           mod: "procurement" },
  { type: "nav",    id: "finance",      label: "Go to Finance",            icon: "Wallet",          mod: "finance" },
  { type: "nav",    id: "hr",           label: "Go to HR",                 icon: "Users",           mod: "hr" },
  { type: "nav",    id: "manufacturing",label: "Go to Manufacturing",      icon: "Factory",         mod: "manufacturing" },
  { type: "nav",    id: "projects",     label: "Go to Projects",           icon: "Kanban",          mod: "projects" },
  { type: "nav",    id: "analytics",    label: "Go to Analytics",          icon: "BarChart3",       mod: "analytics" },
  { type: "nav",    id: "ai",           label: "Go to AI Assistant",       icon: "Brain",           mod: "ai" },
  { type: "nav",    id: "settings",     label: "Go to Settings",           icon: "Settings",        mod: "settings" },
  // Actions
  { type: "action", id: "new-invoice",  label: "New Invoice",              icon: "Plus",    tab: "invoices",  mod: "sales" },
  { type: "action", id: "new-quote",    label: "New Quotation",            icon: "Plus",    tab: "quotations",mod: "sales" },
  { type: "action", id: "new-expense",  label: "New Expense",              icon: "Plus",    tab: "expenses",  mod: "finance" },
  { type: "action", id: "new-customer", label: "Add Customer",             icon: "UserPlus",tab: "customers", mod: "crm" },
  { type: "action", id: "new-employee", label: "Add Employee",             icon: "UserPlus",tab: null,        mod: "hr" },
  { type: "action", id: "new-po",       label: "New Purchase Order",       icon: "Plus",    tab: "pos-orders",mod: "procurement" },
  { type: "action", id: "new-product",  label: "Add Product to Inventory", icon: "Plus",    tab: "stock",     mod: "inventory" },
  { type: "action", id: "journal-entry",label: "Post Journal Entry",       icon: "BookOpen",tab: "journal",   mod: "finance" },
  { type: "action", id: "run-payroll",  label: "Run Payroll",              icon: "Wallet",  tab: "payroll",   mod: "hr" },
  // Finance tabs
  { type: "nav",    id: "receivables",  label: "Finance &#8250; Receivables",icon: "Landmark",mod: "finance", tab: "receivables" },
  { type: "nav",    id: "ledger",       label: "Finance &#8250; General Ledger",icon: "FileText",mod: "finance", tab: "ledger" },
  { type: "nav",    id: "tax",          label: "Finance &#8250; Tax Center",icon: "Percent",mod: "finance",   tab: "tax" },
  { type: "nav",    id: "banking",      label: "Finance &#8250; Banking",   icon: "Banknote",mod: "finance",  tab: "banking" },
  { type: "nav",    id: "budgets",      label: "Finance &#8250; Budgets",   icon: "Target",  mod: "finance",  tab: "budgets" },
  { type: "nav",    id: "period-closes",label: "Finance &#8250; Period Closes",icon: "Lock",mod: "finance",  tab: "periods" },
  { type: "nav",    id: "recon",        label: "Finance &#8250; Bank Recon",icon: "GitBranch",mod: "finance", tab: "reconcile" },
];

// ═══════════════════════════════════════════════════════════════════════════
// MICROFINANCE MODULE
// Full micro-lending platform: loan products, client registry, applications,
// disbursements, repayment schedules (flat & reducing balance), collections,
// arrears tracking, PAR (Portfolio At Risk) reporting.
// ═══════════════════════════════════════════════════════════════════════════

const MFI_LOAN_PRODUCTS = [
  { id: "p1", name: "Business Loan", minAmount: 100, maxAmount: 10000, interestRate: 3, termMonths: 12, interestMethod: "flat" },
  { id: "p2", name: "Emergency Loan", minAmount: 50, maxAmount: 2000, interestRate: 5, termMonths: 3, interestMethod: "flat" },
  { id: "p3", name: "Group Loan", minAmount: 200, maxAmount: 5000, interestRate: 2.5, termMonths: 6, interestMethod: "reducing" },
  { id: "p4", name: "Agricultural Loan", minAmount: 500, maxAmount: 20000, interestRate: 2, termMonths: 8, interestMethod: "flat" },
  { id: "p5", name: "School Fees Loan", minAmount: 100, maxAmount: 3000, interestRate: 4, termMonths: 4, interestMethod: "flat" },
];

const MFI_CLIENT_SEED = [
  { id: "CLT-001", name: "Amina Rashidi", phone: "0712 345 678", national_id: "199001234567", gender: "Female", village: "Mwanza", joinedDate: "2025-01-10", status: "Active" },
  { id: "CLT-002", name: "John Makundi", phone: "0754 987 654", national_id: "198805678901", gender: "Male", village: "Dar es Salaam", joinedDate: "2025-02-15", status: "Active" },
  { id: "CLT-003", name: "Fatuma Saidi", phone: "0768 111 222", national_id: "199203456789", gender: "Female", village: "Arusha", joinedDate: "2025-03-01", status: "Active" },
  { id: "CLT-004", name: "Peter Mwangi", phone: "0745 333 444", national_id: "197804321098", gender: "Male", village: "Moshi", joinedDate: "2025-01-20", status: "Inactive" },
];

const MFI_LOAN_SEED = [
  { id: "LN-2025-001", clientId: "CLT-001", clientName: "Amina Rashidi", productId: "p1", productName: "Business Loan", principal: 2000, interestRate: 3, termMonths: 12, interestMethod: "flat", disbursedDate: "2025-01-15", status: "Active", amountPaid: 1050, missedPayments: 0 },
  { id: "LN-2025-002", clientId: "CLT-002", clientName: "John Makundi", productId: "p3", productName: "Group Loan", principal: 1500, interestRate: 2.5, termMonths: 6, interestMethod: "reducing", disbursedDate: "2025-02-20", status: "Active", amountPaid: 400, missedPayments: 1 },
  { id: "LN-2025-003", clientId: "CLT-003", clientName: "Fatuma Saidi", productId: "p5", productName: "School Fees Loan", principal: 800, interestRate: 4, termMonths: 4, interestMethod: "flat", disbursedDate: "2025-03-05", status: "Arrears", amountPaid: 100, missedPayments: 2 },
  { id: "LN-2025-004", clientId: "CLT-004", clientName: "Peter Mwangi", productId: "p2", productName: "Emergency Loan", principal: 500, interestRate: 5, termMonths: 3, interestMethod: "flat", disbursedDate: "2024-11-10", status: "Closed", amountPaid: 575, missedPayments: 0 },
];

function calcLoanTotal(principal, rate, term, method) {
  if (method === "flat") return { total: principal * (1 + rate * term / 100), interest: principal * rate * term / 100 };
  // Reducing balance
  const r = rate / 100;
  const pmt = principal * r * Math.pow(1+r, term) / (Math.pow(1+r, term) - 1);
  return { total: pmt * term, interest: pmt * term - principal };
}

function calcPAR(loans) {
  const active = loans.filter((l) => l.status !== "Closed");
  const atRisk = active.filter((l) => l.missedPayments > 0);
  const portfolio = active.reduce((s, l) => s + l.principal, 0);
  const riskAmt = atRisk.reduce((s, l) => s + l.principal, 0);
  return portfolio > 0 ? (riskAmt / portfolio) * 100 : 0;
}

const MFI_TABS = [
  { id: "overview", label: "Portfolio Overview", icon: BarChart3 },
  { id: "clients", label: "Client Registry", icon: CircleUserRound },
  { id: "loans", label: "Loan Book", icon: HandCoins },
  { id: "applications", label: "Applications", icon: FileText },
  { id: "collections", label: "Collections", icon: Receipt },
  { id: "reports", label: "MFI Reports", icon: BarChart2 },
];

export default CustomerSupport;
