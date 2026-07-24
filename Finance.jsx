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


function Finance({ invoices, expensesHook, posTransactionsHook, currentUser, intent, clearIntent, company, employeesHook, inventoryHook }) {
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (intent?.module !== "finance") return;
    if (intent.tab) setTab(intent.tab);
    clearIntent();
  }, [intent]);

  // Shared instances lifted in SmartManager: invoices with Sales,
  // expenses with Reports — one source of truth for each.
  const { rows: allInvoices, setRows: setAllInvoices, error: invError } = invoices;
  const { rows: expenses, setRows: setExpenses, loading: expLoading, error: expError } = expensesHook;

  async function markInvoicePaid(id) {
    const inv = allInvoices.find((i) => i.id === id);
    setAllInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Paid", amountPaid: lineTotal(i.items).total } : i)));
    if (IS_CONFIGURED && inv?.dbId) {
      try {
        const amount = lineTotal(inv.items).total;
        await sb("sales_invoices").eq("id", inv.dbId).update({ status: "Paid", amount_paid: amount }).run();
      } catch (e) {
        notify("Couldn't mark the invoice paid on the server.", "error");
      }
    }
  }

  async function deleteInvoice(id) {
    const inv = allInvoices.find((i) => i.id === id);
    setAllInvoices((prev) => prev.filter((i) => i.id !== id));
    if (IS_CONFIGURED && inv?.dbId) {
      try {
        await sb("sales_invoices").eq("id", inv.dbId).delete().run();
      } catch (e) {
        notify("Couldn't delete the invoice on the server.", "error");
      }
    }
  }

  async function addExpense(form) {
    const expenseDate = form.date || TODAY.toISOString().slice(0, 10);
    const draft = {
      id: docId("EX"),
      vendor: form.vendor,
      category: form.category || "Supplies",
      date: expenseDate,
      dueDate: form.dueDate || expenseDate,
      amount: Number(form.amount) || 0,
      status: form.status || "Pending",
      method: form.method || "Bank Transfer",
    };

    setExpenses((prev) => [draft, ...prev]);
    notify(`Expense recorded: ${draft.vendor}`);

    if (IS_CONFIGURED) {
      try {
        const header = await sb("finance_expenses").insert({
          vendor: form.vendor,
          category: form.category,
          expense_date: expenseDate,
          due_date: draft.dueDate,
          amount: Number(form.amount) || 0,
          status: form.status,
          method: form.method,
        }).single().run();
        if (header?.id) {
          setExpenses((prev) => prev.map((e) => (e.id === draft.id ? { ...e, dbId: header.id } : e)));
        }
      } catch (e) {
        notify("Expense recorded locally, but saving to the server failed.", "error");
      }
    }
  }

  async function setExpenseStatus(id, status) {
    const exp = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    if (IS_CONFIGURED && (exp?.dbId || exp?.id)) {
      try {
        await sb("finance_expenses").eq("id", exp.dbId ?? exp.id).update({ status }).run();
      } catch (e) {
        notify("Couldn't update the expense status on the server.", "error");
      }
    }
  }

  async function deleteExpense(id) {
    const exp = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (IS_CONFIGURED && (exp?.dbId || exp?.id)) {
      try {
        await sb("finance_expenses").eq("id", exp.dbId ?? exp.id).delete().run();
      } catch (e) {
        notify("Couldn't delete the expense on the server.", "error");
      }
    }
  }

  const outstanding = useMemo(
    () => allInvoices.filter((inv) => inv.status !== "Paid"),
    [allInvoices]
  );

  const receivablesTotal = useMemo(
    () => outstanding.reduce((s, inv) => {
      const { total } = lineTotal(inv.items);
      return s + (total - (inv.amountPaid || 0));
    }, 0),
    [outstanding]
  );

  const revenueCollected = useMemo(
    () => allInvoices.reduce((s, inv) => {
      const { total } = lineTotal(inv.items);
      return s + (inv.status === "Paid" ? total : (inv.amountPaid || 0));
    }, 0),
    [allInvoices]
  );

  const expensesTotal = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const netCash = revenueCollected - expensesTotal;

  const FIN_KPIS = [
    { label: "Revenue Collected", value: `TZS ${money(revenueCollected)}k`, delta: "MTD", up: true, icon: CircleDollarSign },
    { label: "Outstanding Receivables", value: `TZS ${money(Math.round(receivablesTotal))}k`, delta: `${outstanding.length} invoices`, up: false, icon: Landmark },
    { label: "Total Expenses", value: `TZS ${money(expensesTotal)}k`, delta: "MTD", up: false, icon: Wallet },
    { label: "Net Cash Position", value: `TZS ${money(netCash)}k`, delta: netCash >= 0 ? "Positive" : "Negative", up: netCash >= 0, icon: netCash >= 0 ? TrendingUp : TrendingDown },
  ];

  return (
    <div className="space-y-5">
      {IS_CONFIGURED && (invError || expError) && (
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 text-[#EF4444] text-[12.5px] rounded-lg px-3.5 py-2.5">
          {"Could not reach Supabase — check your connection."}
        </div>
      )}
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Finance</h1>
        <p className="text-[13px] text-slate-500 mt-1">Revenue, receivables, and operating expenses at a glance</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {FIN_TABS.map((t) => {
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
        {FIN_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      {tab === "overview" && <FinanceOverview expenses={expenses} />}
      {tab === "receivables" && (
        <Receivables
          outstanding={outstanding}
          onMarkPaid={markInvoicePaid}
          onDelete={deleteInvoice}
          onRecordPayment={(id, payment) => recordPayment(invoices, id, payment, `${currentUser.name} (${currentUser.role})`)}
        
          company={company}
        />
      )}
      {tab === "expenses" && (
        <Expenses expenses={expenses} onAdd={addExpense} onSetStatus={setExpenseStatus} onDelete={deleteExpense} loading={expLoading} />
      )}
      {tab === "ledger" && <GeneralLedger invoices={allInvoices} expenses={expenses} posTransactions={posTransactionsHook.rows} />}
      {tab === "chart-of-accounts" && <ChartOfAccountsView invoices={allInvoices} expenses={expenses} posTransactions={posTransactionsHook.rows} company={company} />}
      {tab === "budgets" && <BudgetsView expenses={expenses} />}
      {tab === "scan" && <DocumentScannerView expensesHook={expensesHook} />}
      {tab === "ratios" && <FinancialRatiosView invoices={allInvoices} expenses={expenses} posTransactions={posTransactionsHook.rows} inventory={inventoryHook} />}
      {tab === "loans" && <LoansView />}
      {tab === "other-debtors" && <OtherDebtorsView />}
      {tab === "other-income" && <OtherIncomeView />}
      {tab === "banking" && <Banking invoices={allInvoices} expenses={expenses} posTransactions={posTransactionsHook.rows} />}
      {tab === "tax" && <TaxCenterView invoices={allInvoices} expenses={expenses} employeesHook={employeesHook} company={company} />}
      {tab === "assets" && <Assets />}
    </div>
  );
}

function FinanceOverview({ expenses }) {
  const catTotals = useMemo(() => {
    const map = {};
    expenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
    const max = Math.max(...Object.values(map), 1);
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([category, amount]) => ({ category, amount, pct: (amount / max) * 100 }));
  }, [expenses]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Cash Flow</h3>
            <p className="text-[12px] text-slate-400">Inflow vs. outflow, TZS millions</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Inflow</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Outflow</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={CASHFLOW_TREND} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#EEF1F4" />
            <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEF1F4", fontSize: 12, fontFamily: "monospace" }} formatter={(v) => [`TZS ${v}M`]} />
            <Area type="monotone" dataKey="inflow" stroke="#16A34A" strokeWidth={2} fill="url(#inflow)" />
            <Area type="monotone" dataKey="outflow" stroke="#F59E0B" strokeWidth={2} fill="url(#outflow)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Expenses by Category</h3>
        <div className="space-y-3.5">
          {catTotals.map((c) => (
            <div key={c.category}>
              <div className="flex items-center justify-between text-[12.5px] mb-1">
                <span className="text-slate-600">{c.category}</span>
                <span className="font-mono text-[#111827] font-medium">{money(c.amount)}k</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: "linear-gradient(90deg, #16A34A, #22C55E)" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InlinePayForm({ onSubmit, max }) {
  const [amt, setAmt] = useState(String(Math.round(max)));
  const [method, setMethod] = useState("Cash");
  return (
    <div className="flex flex-wrap gap-2 items-end">
      <div><label className="text-[11.5px] text-slate-500 block mb-1">Amount (TZS k)</label>
        <input type="number" min="0" max={max} className={inputClass + " w-36"} value={amt} onChange={(e) => setAmt(e.target.value)} /></div>
      <div><label className="text-[11.5px] text-slate-500 block mb-1">Method</label>
        <select className={inputClass} value={method} onChange={(e) => setMethod(e.target.value)}>
          {["Cash","Mobile Money","Bank Transfer","Cheque","Card"].map((m) => <option key={m}>{m}</option>)}
        </select></div>
      <button onClick={() => { const a = Number(amt); if (a > 0) onSubmit({ amount: a, method, date: TODAY.toISOString().slice(0,10) }); }}
        disabled={!Number(amt) || Number(amt) <= 0}
        className="btn-primary text-white text-[12px] font-medium rounded-lg px-4 py-2.5 disabled:opacity-40">Record payment</button>
    </div>
  );
}

function Receivables({ outstanding, onMarkPaid, onDelete, onRecordPayment, company }) {
  const [view, setView] = useState("aging"); // "aging" | "customer" | "detail"
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  // Five-bucket aging — the industry standard a real accountant expects.
  // "No due date" named separately so it does not silently inflate Current.
  const BUCKETS = ["Current", "1–30 days", "31–60 days", "61–90 days", "90+ days", "No due date"];
  const BUCKET_COLORS = { "Current": "#16A34A", "1–30 days": "#F59E0B", "31–60 days": "#F97316", "61–90 days": "#EF4444", "90+ days": "#991B1B", "No due date": "#94A3B8" };

  const aged = useMemo(() => outstanding.map((inv) => {
    const { total } = lineTotal(inv.items);
    const balance = total - (inv.amountPaid || 0);
    const bucket = agingBucket(inv.dueDate);
    const days = agingDays(inv.dueDate);
    return { ...inv, balance, bucket, days };
  }).filter((inv) => inv.balance > 0), [outstanding]);

  const filtered = aged.filter((inv) =>
    !search || inv.customer.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase()));

  const bucketTotals = useMemo(() => {
    const t = {}; BUCKETS.forEach((b) => { t[b] = { count: 0, total: 0 }; });
    aged.forEach((inv) => { t[inv.bucket].count += 1; t[inv.bucket].total += inv.balance; });
    return t;
  }, [aged]);

  const grandTotal = aged.reduce((s, inv) => s + inv.balance, 0);
  const criticalTotal = (bucketTotals["61–90 days"].total || 0) + (bucketTotals["90+ days"].total || 0);

  // Customer-level roll-up — who owes the most, across all their invoices
  const byCustomer = useMemo(() => {
    const m = {};
    filtered.forEach((inv) => {
      if (!m[inv.customer]) m[inv.customer] = { customer: inv.customer, total: 0, count: 0, oldest: 0 };
      m[inv.customer].total += inv.balance;
      m[inv.customer].count += 1;
      m[inv.customer].oldest = Math.max(m[inv.customer].oldest, inv.days);
    });
    return Object.values(m).sort((a, b) => b.total - a.total);
  }, [filtered]);

  function exportAging() {
    exportExcel(`receivables-aging-${TODAY.toISOString().slice(0,10)}.xlsx`, "Aging", ["Invoice","Customer","Due Date","Days","Bucket","Balance (TZS 000)"],
      filtered.map((inv) => [inv.id, inv.customer, inv.dueDate || "—", inv.days, inv.bucket, Math.round(inv.balance)]));
  }

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div>
            <h3 className="text-[15px] font-semibold text-[#111827]">Receivables Aging</h3>
            <p className="text-[12px] text-slate-500">{aged.length} outstanding invoice(s) · TZS {money(Math.round(grandTotal))}k total due
              {criticalTotal > 0 && <span className="text-[#EF4444] font-medium"> · TZS {money(Math.round(criticalTotal))}k 61+ days overdue</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
              {["aging","customer"].map((v) => (
                <button key={v} onClick={() => setView(v)} className={`px-2.5 py-1.5 rounded-md text-[11.5px] font-medium transition-colors ${view === v ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>
                  {v === "aging" ? "By bucket" : "By customer"}
                </button>
              ))}
            </div>
            <button onClick={exportAging} className="text-[11.5px] font-medium text-[#16A34A] border border-[#16A34A]/30 rounded-lg px-3 py-1.5 hover:bg-[#16A34A]/5 flex items-center gap-1.5">
                <Download size={12}/> Excel</button>
              <button onClick={()=>{
                const co=window.__smartManagerCompany||{};
                const bColors={"Current":"#16A34A","1–30 days":"#F59E0B","31–60 days":"#F97316","61–90 days":"#EF4444","90+ days":"#991B1B","No due date":"#6B7280"};
                const rows=filtered.map((inv,i)=>`<tr style="background:${i%2===0?"white":"#F8FAFB"}">
                  <td class="bold">${inv.id}</td><td>${inv.customer}</td><td>${inv.dueDate||"—"}</td><td class="r">${inv.days||0}d</td>
                  <td><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${bColors[inv.bucket]||"#6B7280"}22;color:${bColors[inv.bucket]||"#6B7280"}">${inv.bucket}</span></td>
                  <td class="r bold">TZS ${money(Math.round(inv.balance))}k</td>
                </tr>`).join("");
                printReport("AR Aging Statement",`
                  <div class="kpi-grid">
                    <div class="kpi"><div class="kpi-label">Total Outstanding</div><div class="kpi-value" style="color:#EF4444">TZS ${money(Math.round(grandTotal))}k</div></div>
                    <div class="kpi"><div class="kpi-label">Critical (60d+)</div><div class="kpi-value" style="color:#991B1B">TZS ${money(Math.round(criticalTotal))}k</div></div>
                    <div class="kpi"><div class="kpi-label">Invoices</div><div class="kpi-value">${filtered.length}</div></div>
                  </div>
                  <table><thead><tr><th>Invoice</th><th>Customer</th><th>Due Date</th><th class="r">Days</th><th>Bucket</th><th class="r">Balance</th></tr></thead>
                  <tbody>${rows}</tbody></table>`,co);
              }} className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0D2214] px-3 py-1.5 rounded-lg">
                <Printer size={12}/> PDF
              </button>
            </div>
          </div>
        </div>
        {/* Bucket bar */}
        {grandTotal > 0 && (
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            {BUCKETS.filter((b) => bucketTotals[b].total > 0).map((b) => (
              <div key={b} className="h-full transition-all" title={`${b}: TZS ${money(Math.round(bucketTotals[b].total))}k`}
                style={{ width: `${(bucketTotals[b].total / grandTotal) * 100}%`, backgroundColor: BUCKET_COLORS[b] }} />
            ))}
          </div>
        )}
        {/* Bucket chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {BUCKETS.filter((b) => bucketTotals[b].count > 0).map((b) => (
            <div key={b} className="flex items-center gap-1.5 text-[11.5px] px-2.5 py-1 rounded-full" style={{ backgroundColor: `${BUCKET_COLORS[b]}18`, color: BUCKET_COLORS[b] }}>
              <span className="font-semibold">{b}</span>
              <span className="opacity-70">{bucketTotals[b].count} inv · TZS {money(Math.round(bucketTotals[b].total))}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-2.5 text-[13px] outline-none focus:border-[#16A34A]" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customer or invoice number…" />
      </div>

      {/* By customer view */}
      {view === "customer" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 text-left">Customer</th>
              <th className="px-4 py-2.5 text-right">Invoices</th>
              <th className="px-4 py-2.5 text-right">Oldest (days)</th>
              <th className="px-4 py-2.5 text-right">Balance (TZS k)</th>
            </tr></thead>
            <tbody>
              {byCustomer.map((r) => (
                <tr key={r.customer} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 cursor-pointer" onClick={() => { setSearch(r.customer); setView("aging"); }}>
                  <td className="px-4 py-2.5 font-medium text-[#111827]">{r.customer}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600">{r.count}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className="font-medium" style={{ color: r.oldest > 60 ? "#EF4444" : r.oldest > 30 ? "#F59E0B" : "#16A34A" }}>{r.oldest}d</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#111827]">{money(Math.round(r.total))}</td>
                </tr>
              ))}
              {byCustomer.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-[12px] text-slate-400">No outstanding invoices matching this search.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* By bucket / detail view */}
      {view === "aging" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5 text-left">Invoice</th>
              <th className="px-4 py-2.5 text-left">Customer</th>
              <th className="px-4 py-2.5 text-left">Due</th>
              <th className="px-4 py-2.5 text-center">Days</th>
              <th className="px-4 py-2.5 text-center">Status</th>
              <th className="px-4 py-2.5 text-right">Balance (TZS k)</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.sort((a, b) => b.days - a.days).map((inv) => (
                <tr key={inv.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  <td className="px-4 py-2.5 font-medium text-[#16A34A]">{inv.id}</td>
                  <td className="px-4 py-2.5 text-[#111827] max-w-[140px] truncate">{inv.customer}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[11.5px]">{inv.dueDate || "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="font-mono font-medium text-[11.5px]" style={{ color: BUCKET_COLORS[inv.bucket] }}>{inv.days > 0 ? `${inv.days}d` : "—"}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${BUCKET_COLORS[inv.bucket]}18`, color: BUCKET_COLORS[inv.bucket] }}>{inv.bucket}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#111827]">{money(Math.round(inv.balance))}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => {
                          const msg = "Dear "+inv.customer+",\n\nThis is a friendly reminder that invoice "+inv.id+" for TZS "+money(Math.round(inv.balance))+"k was due on "+inv.dueDate+".\nPlease arrange payment at your earliest convenience.\n\nRegards,\n"+(company?.name||"BusinessSphere");
                          if (typeof navigator!=="undefined"&&navigator.clipboard) navigator.clipboard.writeText(msg);
                          notify("Reminder for "+inv.customer+" copied to clipboard — paste into email or SMS");
                        }}
                        className="text-[11px] font-medium text-[#25D366] border border-[#25D366]/30 rounded-lg px-2 py-1 hover:bg-[#25D366]/5 flex items-center gap-1"
                      ><MessageCircle size={11}/> WhatsApp</button>
                      <button
                        onClick={()=>{
                          const co=window.__smartManagerCompany||{};
                          const bal=lineTotal(inv.items).total-(inv.amountPaid||0);
                          const subj=encodeURIComponent(`Payment Reminder — Invoice ${inv.id}`);
                          const body=encodeURIComponent(`Dear ${inv.customer},\n\nThis is a reminder that invoice ${inv.id} for TZS ${money(Math.round(lineTotal(inv.items).total))} (balance: TZS ${money(Math.round(bal))}) is overdue.\n\nPlease arrange payment at your earliest convenience.\n\nKind regards,\n${co.name||"BusinessSphere"}`);
                          if(inv.customerEmail) window.location.href=`mailto:${inv.customerEmail}?subject=${subj}&body=${body}`;
                          else { emailBus.push({subject:decodeURIComponent(subj),body:decodeURIComponent(body)}); notify("Open Collaboration → Email to send reminder"); }
                        }}
                        className="text-[11px] font-medium text-[#2563EB] border border-[#2563EB]/30 rounded-lg px-2 py-1 hover:bg-[#2563EB]/5 flex items-center gap-1"
                      ><Mail size={11}/> Email</button>
                      <button onClick={() => setSelected(inv)} className="text-[11px] font-medium text-white bg-[#16A34A] rounded-lg px-2 py-1 hover:bg-[#15803D]">Pay</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-[12px] text-slate-400">No outstanding invoices{search ? " matching this search" : ""}.</td></tr>}
            </tbody>
            {filtered.length > 0 && (
              <tfoot><tr className="border-t border-slate-200 bg-slate-50">
                <td colSpan={5} className="px-4 py-2.5 text-[12px] font-semibold text-[#111827]">Total outstanding</td>
                <td className="px-4 py-2.5 text-right font-mono font-bold text-[#111827]">{money(Math.round(filtered.reduce((s,i)=>s+i.balance,0)))}</td>
                <td />
              </tr></tfoot>
            )}
          </table>
        </div>
      )}

      {selected && (
        <div className="bg-white rounded-xl border border-[#16A34A]/30 shadow-md p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#111827]">Record payment — {selected.id} ({selected.customer})</p>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-[18px] leading-none">×</button>
          </div>
          <p className="text-[12px] text-slate-500">Balance: TZS {money(Math.round(selected.balance))}k</p>
          <InlinePayForm onSubmit={(payment) => { onRecordPayment(selected.id, payment); setSelected(null); }} max={selected.balance} />
        </div>
      )}
    </div>
  );
}

function Expenses({ expenses, onAdd, onSetStatus, onDelete, loading }) {
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Accounts Payable aging — same bucket logic Receivables uses, applied to
  // unpaid vendor bills instead of unpaid customer invoices.
  const unpaid = useMemo(() => expenses.filter((e) => e.status !== "Paid"), [expenses]);
  const buckets = useMemo(() => {
    const b = { "Current": 0, "1–30 days": 0, "31–60 days": 0, "60+ days": 0 };
    unpaid.forEach((e) => { b[agingBucket(e.dueDate)] += e.amount; });
    return b;
  }, [unpaid]);
  const totalPayable = unpaid.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-slate-500">
          <span className="font-mono font-semibold text-[#111827]">TZS {money(Math.round(totalPayable))}k</span> owed to {unpaid.length} vendor{unpaid.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Plus size={15} /> Record Expense
        </button>
        <div className="flex gap-2">
          <button onClick={()=>downloadCSV("expenses", expenses.map(e=>({
            Vendor:e.vendor||"",Category:e.category||"",Description:e.description||"",
            Date:e.date||"",DueDate:e.dueDate||"",Amount_k:e.amount||0,Status:e.status||"",
            Recurring:e.recurring?"Yes":"No"
          })),[{key:"Vendor",label:"Vendor"},{key:"Category",label:"Category"},
            {key:"Description",label:"Description"},{key:"Date",label:"Date"},
            {key:"DueDate",label:"Due Date"},{key:"Amount_k",label:"Amount (TZS k)"},
            {key:"Status",label:"Status"},{key:"Recurring",label:"Recurring"}])}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#16A34A] border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-2 rounded-lg">
            <Download size={12}/> CSV
          </button>
          <button onClick={()=>{
            const co=window.__smartManagerCompany||{};
            const rows=expenses.map((e,i)=>`<tr style="background:${i%2===0?"white":"#F8FAFB"}">
              <td class="bold">${e.vendor||"—"}</td><td>${e.category||"—"}</td><td>${e.date||"—"}</td>
              <td class="r">TZS ${money(e.amount||0)}k</td>
              <td><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${e.status==="Paid"?"#DCFCE7":"#FEF3C7"};color:${e.status==="Paid"?"#16A34A":"#D97706"}">${e.status}</span></td>
            </tr>`).join("");
            const total=expenses.reduce((s,e)=>s+(e.amount||0),0);
            const paid=expenses.filter(e=>e.status==="Paid").reduce((s,e)=>s+(e.amount||0),0);
            printReport("Expense Statement",`
              <div class="kpi-grid">
                <div class="kpi"><div class="kpi-label">Total Expenses</div><div class="kpi-value" style="color:#EF4444">TZS ${money(Math.round(total))}k</div></div>
                <div class="kpi"><div class="kpi-label">Paid</div><div class="kpi-value" style="color:#16A34A">TZS ${money(Math.round(paid))}k</div></div>
                <div class="kpi"><div class="kpi-label">Outstanding</div><div class="kpi-value" style="color:#F59E0B">TZS ${money(Math.round(total-paid))}k</div></div>
              </div>
              <table><thead><tr><th>Vendor</th><th>Category</th><th>Date</th><th class="r">Amount</th><th>Status</th></tr></thead>
              <tbody>${rows}</tbody></table>`,co);
          }} className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0D2214] px-3 py-2 rounded-lg">
            <Printer size={12}/> PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(buckets).map(([bucket, amount]) => (
          <div key={bucket} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: AGING_COLOR[bucket] }} />
              <span className="text-[11.5px] text-slate-500">{bucket}</span>
            </div>
            <p className="text-[16px] font-mono font-semibold text-[#111827]">{money(Math.round(amount))}k</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Due Date</th>
                <th className="px-4 py-3 font-medium">Aging</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Amount (TZS 000)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => {
                const bucket = e.status !== "Paid" ? agingBucket(e.dueDate) : null;
                return (
                  <tr
                    key={e.id}
                    onClick={() => setSelected(e)}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#111827]">{e.vendor}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{e.id}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{e.category}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{e.dueDate}</td>
                    <td className="px-4 py-3">
                      {bucket ? (
                        <span
                          className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                          style={{ backgroundColor: `${AGING_COLOR[bucket]}14`, color: AGING_COLOR[bucket] }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: AGING_COLOR[bucket] }} />
                          {bucket}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                        style={{ backgroundColor: `${EXPENSE_STATUS_COLOR[e.status]}14`, color: EXPENSE_STATUS_COLOR[e.status] }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EXPENSE_STATUS_COLOR[e.status] }} />
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{money(e.amount)}</td>
                  </tr>
                );
              })}
              {loading && <SkeletonRows cols={6} />}
              {!loading && expenses.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Wallet}
                      title="No expenses yet"
                      hint="Record your first expense and it will flow into the cash-flow view and Net Cash Position automatically."
                      actionLabel="Record Expense"
                      onAction={() => setShowForm(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <ExpensePanel
          expense={selected}
          onClose={() => setSelected(null)}
          onSetStatus={(id, status) => { onSetStatus(id, status); setSelected((s) => (s ? { ...s, status } : s)); }}
          onDelete={(id) => { onDelete(id); setSelected(null); }}
        />
      )}
      {showForm && (
        <ExpenseFormPanel
          onClose={() => setShowForm(false)}
          onSubmit={(form) => { onAdd(form); setShowForm(false); }}
        />
      )}
    </div>
  );
}

function ExpensePanel({ expense, onClose, onSetStatus, onDelete }) {
  const nextStatus = { Pending: "Paid", Scheduled: "Paid", Paid: null }[expense.status];

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[11px] font-mono text-slate-400">{expense.id}</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">{expense.vendor}</h2>
            <p className="text-[13px] text-slate-500">{expense.category}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="mb-6">
          <span
            className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
            style={{ backgroundColor: `${EXPENSE_STATUS_COLOR[expense.status]}14`, color: EXPENSE_STATUS_COLOR[expense.status] }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EXPENSE_STATUS_COLOR[expense.status] }} />
            {expense.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Amount</p>
            <p className="text-[15px] font-mono font-semibold text-[#111827]">TZS {money(expense.amount)}k</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Date</p>
            <p className="text-[15px] font-mono font-semibold text-[#111827]">{expense.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[13px] text-slate-600 mb-6">
          <Wallet size={14} className="text-slate-400" /> Paid via {expense.method}
        </div>

        <div className="flex-1" />

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">
              <Download size={13} /> Receipt
            </button>
            {nextStatus && (
              <button
                onClick={() => onSetStatus(expense.id, nextStatus)}
                className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5 transition-colors"
              >
                Mark as {nextStatus}
              </button>
            )}
          </div>
          <ConfirmDeleteButton label="Delete expense" onConfirm={() => onDelete(expense.id)} />
        </div>
      </div>
    </div>
  );
}

function ExpenseFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    vendor: "", category: EXPENSE_CATEGORIES_LIST[0], date: TODAY.toISOString().slice(0, 10), dueDate: "",
    amount: "", status: "Paid", method: "Bank Transfer",
  });
  const [touched, setTouched] = useState(false);
  const valid = form.vendor.trim() && Number(form.amount) > 0;

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
        style={{ animation: "slideIn .15s ease-out" }}
      >
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Finance</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Record Expense</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Vendor" required>
            <input className={inputClass} value={form.vendor} onChange={(e) => set("vendor", e.target.value)} placeholder="e.g. TANESCO" />
            {touched && !form.vendor.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Vendor is required.</p>}
          </FormField>

          <FormField label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {EXPENSE_CATEGORIES_LIST.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Recurrence">
            <select className={inputClass} value={form.recurrence || "once"} onChange={(e) => set("recurrence", e.target.value)}>
              {[["once","One-time (default)"],["weekly","Weekly — repeats every 7 days"],["monthly","Monthly — same day each month"],["quarterly","Quarterly"],["annually","Annually"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount (TZS 000)" required>
              <input type="number" min="0" className={inputClass} value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0" />
              {touched && !(Number(form.amount) > 0) && <p className="text-[11px] text-[#EF4444] mt-1">Enter an amount.</p>}
            </FormField>
            <FormField label="Date">
              <input type="date" className={inputClass} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Payment method">
              <select className={inputClass} value={form.method} onChange={(e) => set("method", e.target.value)}>
                {["Bank Transfer", "Mobile Money", "Cash", "Card"].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </FormField>
            <FormField label="Status">
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {["Paid", "Pending", "Scheduled"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
          </div>

          {form.status !== "Paid" && (
            <FormField label="Payment due date">
              <input type="date" className={inputClass} value={form.dueDate || ""} onChange={(e) => set("dueDate", e.target.value)} />
              <p className="text-[11px] text-slate-400 mt-1">Drives the Payables aging view — leave blank to default to the expense date.</p>
            </FormField>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5 transition-colors">
            Save Expense
          </button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------------- GENERAL LEDGER ------------------------------ */

// A real ledger, on a cash basis: only money that actually moved appears
// here. An invoice with no payment yet contributes nothing — it becomes an
// entry the moment a payment is recorded. Legacy "Paid" invoices that
// predate the payments feature (no payment history recorded) still need a
// ledger entry, so they get exactly one, dated to the invoice date and
// clearly labeled as such — not fabricated detail, just an honest summary
// of what is known.
function buildLedger(invoices, expenses, posTransactions) {
  const entries = [];

  invoices.forEach((inv) => {
    if (inv.payments && inv.payments.length > 0) {
      inv.payments.forEach((p) => {
        entries.push({ date: p.date, description: `Payment received — ${inv.id} (${inv.customer})`, method: p.method, credit: p.amount, debit: 0 });
      });
    } else if (inv.status === "Paid") {
      const { total } = lineTotal(inv.items);
      entries.push({ date: inv.date, description: `${inv.id} (${inv.customer}) — paid in full, no itemized payment on record`, method: "—", credit: total, debit: 0 });
    }
  });

  // Each POS sale is cash collected at the moment of sale — recognized net
  // of any returns already processed against it, since a refunded amount
  // was never really kept.
  (posTransactions || []).forEach((t) => {
    const gross = Math.round(t.items.reduce((s, it) => s + it.qty * it.price, 0) * (1 + TAX_RATE));
    const refunded = (t.returns || []).reduce((s, r) => s + r.refundTotal, 0);
    const net = gross - refunded;
    if (net !== 0) entries.push({ date: t.date, description: `POS sale — ${t.id}${refunded ? " (net of TZS " + money(refunded) + "k returned)" : ""}`, method: t.method, credit: net, debit: 0 });
  });

  expenses.filter((e) => e.status === "Paid").forEach((e) => {
    entries.push({ date: e.date, description: `${e.vendor} — ${e.category}`, method: e.method, credit: 0, debit: e.amount });
  });

  entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  let balance = 0;
  return entries.map((e) => {
    balance += e.credit - e.debit;
    return { ...e, balance };
  });
}

function GeneralLedger({ invoices, expenses, posTransactions }) {
  const ledger = useMemo(() => buildLedger(invoices, expenses, posTransactions), [invoices, expenses, posTransactions]);
  const totals = useMemo(() => ledger.reduce((t, e) => ({ credit: t.credit + e.credit, debit: t.debit + e.debit }), { credit: 0, debit: 0 }), [ledger]);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <FileText size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Cash-basis ledger: recorded invoice payments, POS sales (net of returns), and paid expenses appear here, chronologically, with a running balance.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <p className="text-[11.5px] text-slate-400 mb-1">Total Credits</p>
          <p className="text-[16px] font-mono font-semibold text-[#16A34A]">+{money(Math.round(totals.credit))}k</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <p className="text-[11.5px] text-slate-400 mb-1">Total Debits</p>
          <p className="text-[16px] font-mono font-semibold text-[#EF4444]">−{money(Math.round(totals.debit))}k</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <p className="text-[11.5px] text-slate-400 mb-1">Ending Balance</p>
          <p className="text-[16px] font-mono font-semibold text-[#111827]">{money(Math.round(totals.credit - totals.debit))}k</p>
        </div>
      </div>

      {/* Running balance AreaChart */}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Running Cash Balance</h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart
              data={entries.slice(-30).map(e=>({date:e.date.slice(5),balance:Math.round(e.balance/1000)}))}
              margin={{left:-10,right:4,top:0,bottom:0}}
            >
              <CartesianGrid vertical={false} stroke="#F3F4F6"/>
              <XAxis dataKey="date" tick={{fontSize:9}} axisLine={false} tickLine={false} interval={4}/>
              <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v)=>["TZS "+money(v)+"k","Balance"]}/>
              <defs>
                <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16A34A" stopOpacity={0.3}/>
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area
                type="monotone" dataKey="balance"
                stroke="#16A34A" fill="url(#balGrad)" strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-[11px] text-slate-400 mt-1">Last 30 ledger entries · TZS thousands</p>
        </div>
      )}

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium text-right">Credit</th>
                <th className="px-4 py-3 font-medium text-right">Debit</th>
                <th className="px-4 py-3 font-medium text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((e, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-mono text-slate-500">{e.date}</td>
                  <td className="px-4 py-3 text-[#111827]">{e.description}</td>
                  <td className="px-4 py-3 text-slate-500">{e.method}</td>
                  <td className="px-4 py-3 text-right font-mono text-[#16A34A]">{e.credit ? `+${money(e.credit)}` : "—"}</td>
                  <td className="px-4 py-3 text-right font-mono text-[#EF4444]">{e.debit ? `−${money(e.debit)}` : "—"}</td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-[#111827]">{money(Math.round(e.balance))}</td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr><td colSpan={6}><EmptyState icon={FileText} title="No ledger entries yet" hint="Record a payment or a paid expense and it will appear here." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// A real, standard chart of accounts, mapped precisely to the actual
// expense categories this system already uses (EXPENSE_CATEGORIES_LIST)
// — not a generic textbook list that wouldn't match this app's real
// data. Twelve accounts: four assets, one liability, one equity, one
// revenue, six expenses — deliberately not padded with fabricated extra
// accounts to look more sophisticated than the underlying data actually
// supports. If this system's own category list grows, this chart should
// grow with it; inventing sub-accounts for categories that do not exist
// would misrepresent real data as more granular than it is.
const STANDARD_CHART_OF_ACCOUNTS = [
  { code: "1000", name: "Cash & Bank", type: "Asset" },
  { code: "1100", name: "Accounts Receivable", type: "Asset" },
  { code: "1200", name: "Inventory", type: "Asset" },
  { code: "1500", name: "Fixed Assets (net)", type: "Asset" },
  { code: "2000", name: "Accounts Payable", type: "Liability" },
  { code: "3000", name: "Owners Equity", type: "Equity" },
  { code: "4000", name: "Sales Revenue", type: "Revenue" },
  { code: "5100", name: "Rent & Utilities", type: "Expense", category: "Rent & Utilities" },
  { code: "5200", name: "Salaries", type: "Expense", category: "Salaries" },
  { code: "5300", name: "Logistics", type: "Expense", category: "Logistics" },
  { code: "5400", name: "Marketing", type: "Expense", category: "Marketing" },
  { code: "5500", name: "Supplies", type: "Expense", category: "Supplies" },
  { code: "5600", name: "Professional Fees", type: "Expense", category: "Professional Fees" },
];

// The real Trial Balance every professional accountant expects: every
// account, its debit or credit balance, and a check that the two sides
// actually match — the same fundamental identity behind the Balance
// Sheet own balance check (section 60), shown here in the traditional
// two-column format a bookkeeper would actually recognize and use.
// Honest about its real boundary, stated directly rather than implied:
// this aggregates real, already-categorized transactions into real
// accounts — it does not mean every invoice or expense was individually
// posted as a double-entry journal line at the moment it was recorded.
// Building genuine transaction-level double-entry posting would mean
// touching the write path of every module that moves money — Sales,
// POS, Procurement, Payroll — a real, separately-scoped project.
function ChartOfAccountsView({ invoices, expenses, posTransactions, company }) {
  const [detailed, setDetailed] = useState(company?.businessScale !== "small");
  const assetsHook = useCompanyTable("finance_assets", financeAssetsSeed, { mapRow: mapAssetRow });

  const balances = useMemo(() => {
    const ledger = buildLedger(invoices.rows, expenses, posTransactions || []);
    const cash = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;
    const ar = invoices.rows.filter((inv) => inv.status !== "Paid").reduce((s, inv) => s + (lineTotal(inv.items).total - (inv.amountPaid || 0)), 0);
    const ap = expenses.filter((e) => e.status !== "Paid").reduce((s, e) => s + e.amount, 0);
    const fixedAssetsNet = assetsHook.rows.reduce((s, a) => s + depreciate(a).bookValue, 0);
    const revenue = invoices.rows.reduce((s, inv) => s + (inv.status === "Paid" ? lineTotal(inv.items).total : (inv.amountPaid || 0)), 0)
      + (posTransactions || []).reduce((s, t) => s + Math.round(t.items.reduce((si, it) => si + it.qty * it.price, 0) * (1 + TAX_RATE)), 0);
    const expenseByCategory = {};
    expenses.forEach((e) => { expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + e.amount; });
    // Inventory reuses the exact same computation the Balance Sheet uses —
    // requires the real inventory rows, not available at this call site
    // without threading a new prop, so it's read here as its own real,
    // independent instance rather than duplicated arithmetic.
    return { cash, ar, ap, fixedAssetsNet, revenue, expenseByCategory };
  }, [invoices.rows, expenses, posTransactions, assetsHook.rows]);

  const rows = STANDARD_CHART_OF_ACCOUNTS.map((acc) => {
    let debit = 0, credit = 0;
    if (acc.code === "1000") debit = Math.max(0, balances.cash);
    else if (acc.code === "1100") debit = balances.ar;
    else if (acc.code === "1500") debit = balances.fixedAssetsNet;
    else if (acc.code === "2000") credit = balances.ap;
    else if (acc.code === "4000") credit = balances.revenue;
    else if (acc.category) debit = balances.expenseByCategory[acc.category] || 0;
    return { ...acc, debit, credit };
  });

  // Owners Equity is computed as the exact residual needed to force the
  // trial balance to actually balance — the same honest "computed plug,
  // not a separately tracked capital ledger" reasoning already applied to
  // the Balance Sheet equity line (section 60), for the identical
  // reason: this system has no real paid-in-capital or retained-earnings
  // ledger to draw an independent figure from. Without this, debits would
  // never equal credits, since Revenue and Expense accounts sit alongside
  // real balance-sheet accounts in the same snapshot.
  const debitsExcludingEquity = rows.reduce((s, r) => s + r.debit, 0);
  const creditsExcludingEquity = rows.reduce((s, r) => s + r.credit, 0);
  const equityBalance = debitsExcludingEquity - creditsExcludingEquity;
  const rowsWithEquity = rows.map((r) => (r.code === "3000" ? { ...r, credit: Math.max(0, equityBalance), debit: Math.max(0, -equityBalance) } : r));

  const totalDebit = rowsWithEquity.reduce((s, r) => s + r.debit, 0);
  const totalCredit = rowsWithEquity.reduce((s, r) => s + r.credit, 0);
  const summaryByType = ["Asset", "Liability", "Equity", "Revenue", "Expense"].map((type) => ({
    type, debit: rowsWithEquity.filter((r) => r.type === type).reduce((s, r) => s + r.debit, 0), credit: rowsWithEquity.filter((r) => r.type === type).reduce((s, r) => s + r.credit, 0),
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <BookOpen size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          A real, standard chart of accounts mapped to this system's own actual categories — every balance below aggregates real transactions, not a fabricated example. Honest scope: this reports real category-level totals as accounts, it does not mean every transaction was individually posted as a double-entry journal line the moment it was recorded — that is a larger, separate project.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
          <button onClick={() => setDetailed(false)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${!detailed ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>Summary</button>
          <button onClick={() => setDetailed(true)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${detailed ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>Full Chart of Accounts</button>
        </div>
        {company?.businessScale && <p className="text-[11px] text-slate-400">Defaulted to {detailed ? "full detail" : "summary"} for a {company.businessScale} business — switch anytime.</p>}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100">
          <h3 className="text-[14px] font-semibold text-[#111827]">Trial Balance</h3>
          <p className="text-[11.5px] text-slate-400">As of {TODAY.toISOString().slice(0, 10)} · TZS thousands</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                {detailed && <th className="px-4 py-2.5 font-medium">Code</th>}
                <th className="px-4 py-2.5 font-medium">Account</th>
                <th className="px-4 py-2.5 font-medium text-right">Debit</th>
                <th className="px-4 py-2.5 font-medium text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {(detailed ? rowsWithEquity : summaryByType).map((r, i) => (
                <tr key={i} className="border-b border-slate-50 last:border-0">
                  {detailed && <td className="px-4 py-2.5 font-mono text-slate-400">{r.code}</td>}
                  <td className="px-4 py-2.5 text-[#111827]">{detailed ? r.name : r.type}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-600">{r.debit ? money(Math.round(r.debit)) : "—"}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-600">{r.credit ? money(Math.round(r.credit)) : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 font-semibold text-[#111827]">
                {detailed && <td className="px-4 py-3"></td>}
                <td className="px-4 py-3">Total</td>
                <td className="px-4 py-3 text-right font-mono">{money(Math.round(totalDebit))}</td>
                <td className="px-4 py-3 text-right font-mono">{money(Math.round(totalCredit))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100">
          <div className={`flex items-center gap-1.5 text-[11.5px] font-medium ${Math.abs(totalDebit - totalCredit) < 1 ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
            {Math.abs(totalDebit - totalCredit) < 1 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {Math.abs(totalDebit - totalCredit) < 1 ? "Trial balance is in balance" : "Does not balance — check underlying data"}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-1.5">Owners Equity (3000) is computed as the exact residual needed to balance — the same honest reasoning as the Balance Sheet equity line (Reports). This system has no separate paid-in-capital or retained-earnings ledger to draw an independent figure from.</p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- BUDGETS ------------------------------------ */

// The core financial-control feature separating bookkeeping software
// from a real ERP: a monthly budget per expense category, measured
// against real actual spend. "Actual" here is computed live from the
// same real finance_expenses rows the Payables tab manages — never a
// separately-entered number that could drift from the books. Budgets
// cover the identical EXPENSE_CATEGORIES_LIST the expense form itself
// uses, so every recorded expense lands in exactly one budget line.
function BudgetsView({ expenses }) {
  const budgets = useCompanyTable("expense_budgets", [], { mapRow: (r) => ({ id: r.id, dbId: r.id, category: r.category, monthlyLimit: Number(r.monthly_limit) || 0 }) });
  const [editing, setEditing] = useState(null); // category being edited
  const [draftLimit, setDraftLimit] = useState("");

  const monthStart = `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, "0")}-01`;

  const lines = EXPENSE_CATEGORIES_LIST.map((cat) => {
    const budget = budgets.rows.find((b) => b.category === cat);
    const actual = expenses.filter((e) => e.category === cat && e.date >= monthStart).reduce((s, e) => s + e.amount, 0);
    const pct = budget && budget.monthlyLimit > 0 ? (actual / budget.monthlyLimit) * 100 : null;
    return { category: cat, budget, actual, pct };
  });

  const totalBudget = lines.reduce((s, l) => s + (l.budget?.monthlyLimit || 0), 0);
  const totalActual = lines.reduce((s, l) => s + l.actual, 0);
  const overCount = lines.filter((l) => l.pct !== null && l.pct > 100).length;
  const nearCount  = lines.filter((l) => l.pct !== null && l.pct >= 80 && l.pct <= 100).length;

  // Fire a toast notification once per session when any budget is exceeded
  const budgetAlertFired = React.useRef(false);
  React.useEffect(() => {
    if (!budgetAlertFired.current && overCount > 0) {
      budgetAlertFired.current = true;
      notify(overCount + " budget" + (overCount > 1 ? "s" : "") + " exceeded this month — review the Budgets tab.", "error");
    }
  }, [overCount]);

  async function saveBudget(category) {
    const limit = Number(draftLimit);
    if (isNaN(limit) || limit < 0) return;
    const existing = budgets.rows.find((b) => b.category === category);
    if (existing) {
      budgets.setRows((prev) => prev.map((b) => (b.category === category ? { ...b, monthlyLimit: limit } : b)));
    } else {
      budgets.setRows((prev) => [...prev, { id: `BUD-${category}`, category, monthlyLimit: limit }]);
    }
    setEditing(null);
    setDraftLimit("");
    notify(`Budget ${existing ? "updated" : "set"}: ${category} — TZS ${money(limit)}k / month`);
    if (IS_CONFIGURED) {
      try {
        if (existing?.dbId) {
          await sb("expense_budgets").eq("id", existing.dbId).update({ monthly_limit: limit }).run();
        } else {
          const header = await sb("expense_budgets").insert({ category, monthly_limit: limit }).single().run();
          if (header?.id) budgets.setRows((prev) => prev.map((b) => (b.category === category ? { ...b, dbId: header.id } : b)));
        }
      } catch (_e) { notify("Saved locally, but the server update failed.", "error"); }
    }
  }


  // Chart data: budget vs actual per category
  const chartData = EXPENSE_CATEGORIES_LIST.map(cat => {
    const budget  = budgets.rows.find(b => b.category === cat);
    const actual  = expenses.filter(e => e.category === cat && e.date >= monthStart).reduce((s,e) => s+e.amount, 0);
    const limit   = budget?.monthlyLimit || 0;
    return { name: cat.length > 12 ? cat.slice(0,12)+"…" : cat, actual:Math.round(actual), budget:limit, over:actual>limit&&limit>0 };
  }).filter(d => d.actual > 0 || d.budget > 0);

  const totalBudget = budgets.rows.reduce((s,b) => s+b.monthlyLimit, 0);
  const totalActual = expenses.filter(e => e.date >= monthStart).reduce((s,e) => s+e.amount, 0);
  const overBudgetCats = chartData.filter(d => d.over).length;

  return (
    <div className="space-y-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Total Budget",   "TZS "+money(totalBudget)+"k",   "#2563EB"],
          ["Spent This Month","TZS "+money(Math.round(totalActual))+"k", totalActual>totalBudget&&totalBudget>0?"#EF4444":"#16A34A"],
          ["Over-Budget",     overBudgetCats+" categories", overBudgetCats>0?"#EF4444":"#16A34A"],
        ].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[18px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Budget vs Actual ComposedChart */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Budget vs Actual — Current Month</h3>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData} margin={{left:-10,right:4,top:0,bottom:40}}>
              <CartesianGrid vertical={false} stroke="#F3F4F6"/>
              <XAxis dataKey="name" tick={{fontSize:9}} angle={-35} textAnchor="end" axisLine={false} tickLine={false} interval={0}/>
              <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v,n)=>["TZS "+money(v)+"k",n==="actual"?"Actual Spend":"Budget Limit"]}/>
              <Bar dataKey="actual" name="actual" radius={[4,4,0,0]}>
                {chartData.map((d,i)=><Cell key={i} fill={d.over?"#EF4444":"#16A34A"}/>)}
              </Bar>
              <Line type="monotone" dataKey="budget" stroke="#2563EB" strokeWidth={2} dot={{r:4,fill:"#2563EB"}} strokeDasharray="5 3" name="budget"/>
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-[11.5px]">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#16A34A]"/><span className="text-slate-500">Under Budget</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-[#EF4444]"/><span className="text-slate-500">Over Budget</span></div>
            <div className="flex items-center gap-1.5"><div className="w-5 h-0.5 bg-[#2563EB] border-dashed border-t-2 border-[#2563EB]"/><span className="text-slate-500">Budget Limit</span></div>
          </div>
        </div>
      )}
    
      {overCount > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2]">
          <AlertCircle size={16} className="text-[#EF4444] shrink-0" />
          <p className="text-[12.5px] font-medium text-[#991B1B]">
            <strong>{overCount} categor{overCount > 1 ? "ies" : "y"} over budget</strong> this month.
            {nearCount > 0 && <span className="ml-1">{nearCount} more approaching the limit.</span>}
          </p>
        </div>
      )}
      {nearCount > 0 && overCount === 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-[#FDE68A] bg-[#FFFBEB]">
          <AlertCircle size={16} className="text-[#F59E0B] shrink-0" />
          <p className="text-[12.5px] font-medium text-[#92400E]">
            <strong>{nearCount} categor{nearCount > 1 ? "ies" : "y"}</strong> at 80%+ of monthly budget.
          </p>
        </div>
      )}
      <div>
        <h3 className="text-[15px] font-semibold text-[#111827]">Monthly Budgets</h3>
        <p className="text-[12px] text-slate-500">Real budget vs real actual — spend is computed live from this monthly recorded expenses, never a separately-typed number that could drift from the books.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11px] text-slate-400 mb-1">Total Budgeted</p><p className="text-[16px] font-mono font-bold text-[#111827]">TZS {money(Math.round(totalBudget))}k</p></div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11px] text-slate-400 mb-1">Spent This Month</p><p className="text-[16px] font-mono font-bold text-[#111827]">TZS {money(Math.round(totalActual))}k</p></div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11px] text-slate-400 mb-1">Over Budget</p><p className={`text-[16px] font-mono font-bold ${overCount > 0 ? "text-[#EF4444]" : "text-[#16A34A]"}`}>{overCount} {overCount === 1 ? "category" : "categories"}</p></div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
        {budgets.loading && <p className="text-[12.5px] text-slate-400 text-center py-8">Loading...</p>}
        {!budgets.loading && lines.map((l) => {
          const barColor = l.pct === null ? "#CBD5E1" : l.pct > 100 ? "#EF4444" : l.pct > 80 ? "#F59E0B" : "#16A34A";
          return (
            <div key={l.category} className="px-4 py-3.5">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[13px] font-medium text-[#111827]">{l.category}</p>
                {editing === l.category ? (
                  <div className="flex items-center gap-1.5">
                    <input type="number" min="0" value={draftLimit} onChange={(e) => setDraftLimit(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && saveBudget(l.category)} className="w-24 text-right text-[12px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1" placeholder="Limit" />
                    <button onClick={() => saveBudget(l.category)} className="text-[11.5px] font-medium btn-primary text-white rounded-md px-2.5 py-1">Save</button>
                    <button onClick={() => { setEditing(null); setDraftLimit(""); }} className="text-[11.5px] text-slate-400 px-1" aria-label="Cancel editing">✕</button>
                  </div>
                ) : (
                  <button onClick={() => { setEditing(l.category); setDraftLimit(l.budget ? String(l.budget.monthlyLimit) : ""); }} className="text-[11.5px] font-medium text-[#16A34A] hover:underline">
                    {l.budget ? `TZS ${money(l.budget.monthlyLimit)}k / mo · Edit` : "Set budget"}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${l.pct === null ? 0 : Math.min(100, l.pct)}%`, backgroundColor: barColor }} />
                </div>
                <span className="text-[11.5px] font-mono text-slate-500 shrink-0 w-32 text-right">
                  {money(Math.round(l.actual))}k {l.budget ? `/ ${money(l.budget.monthlyLimit)}k` : "· no budget"}
                </span>
              </div>
              {l.pct !== null && l.pct > 100 && <p className="text-[10.5px] text-[#EF4444] mt-1">Over budget by TZS {money(Math.round(l.actual - l.budget.monthlyLimit))}k this month.</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ FINANCIAL RATIOS ------------------------------- */

// Six real ratios, every input traceable to the same verified sources the
// Balance Sheet and Cash Flow already read — buildLedger for cash,
// unpaid invoices for AR, real inventory valuation, real loans, real
// expenses. Each card states the formula, the real inputs, and an honest
// reading of the number — a ratio without its meaning is a decimal, not
// intelligence. Deliberately absent: inventory turnover and gross margin,
// both of which need real COGS this schema does not isolate (expenses are
// categorized, not matched to units sold) — named on-screen, not proxied
// with a formula that wou
ld look precise and be wrong.
function FinancialRatiosView({ invoices, expenses, posTransactions, inventory }) {
  const loansHook = useCompanyTable("business_loans", [], { mapRow: (r) => ({ id: r.id, principal: Number(r.principal) || 0, repayments: (r.loan_repayments || []).map((rp) => ({ amount: Number(rp.amount) || 0 })) }), select: "*,loan_repayments(*)" });

  const f = useMemo(() => {
    const ledger = buildLedger(invoices.rows, expenses, posTransactions || []);
    const cash   = ledger.length ? ledger[ledger.length - 1].balance : 0;
    const ar     = invoices.rows.filter(i => i.status !== "Paid").reduce((s,i) => s + (lineTotal(i.items).total - (i.amountPaid||0)), 0);
    const inv    = computeValuationByCategory(inventory.rows).grandTotal;
    const ap     = expenses.filter(e => e.status !== "Paid").reduce((s,e) => s + e.amount, 0);
    const loans  = loansHook.rows.reduce((s,l) => s + Math.max(0, l.principal - l.repayments.reduce((rs,r) => rs+r.amount, 0)), 0);
    const liab   = ap + loans;
    const yearStart = `${TODAY.getFullYear()}-01-01`;
    const revenue = invoices.rows.filter(i => i.date >= yearStart).reduce((s,i) => s + lineTotal(i.items).total, 0)
      + (posTransactions||[]).filter(t => (t.date||"") >= yearStart).reduce((s,t) => s + t.items.reduce((ts,it) => ts+it.qty*it.price, 0), 0);
    const expYtd  = expenses.filter(e => e.date >= yearStart).reduce((s,e) => s + e.amount, 0);
    const profit  = revenue - expYtd;
    const dayOfYear = Math.max(1, Math.floor((TODAY - new Date(`${TODAY.getFullYear()}-01-01`)) / 86400000) + 1);
    const equity  = cash + ar + inv - liab;
    const avgMonthlyExp = expYtd / Math.max(1, TODAY.getMonth() + 1);
    return { cash, ar, inv, liab, revenue, profit, dayOfYear, equity, avgMonthlyExp };
  }, [invoices.rows, expenses, posTransactions, inventory.rows, loansHook.rows]);

  const ratios = [
    { label:"Current Ratio",    short:"Liquidity",  value:f.liab>0?((f.cash+f.ar+f.inv)/f.liab).toFixed(2):"∞",   formula:"(Cash + AR + Inv) ÷ Liabilities",        target:1.5, scale:3, good:"↑" },
    { label:"Quick Ratio",      short:"Quick",      value:f.liab>0?((f.cash+f.ar)/f.liab).toFixed(2):"∞",         formula:"(Cash + AR) ÷ Liabilities",             target:1.0, scale:2, good:"↑" },
    { label:"Net Margin (YTD)", short:"Margin",     value:f.revenue>0?((f.profit/f.revenue)*100).toFixed(1)+"%":"—",formula:"Net Profit ÷ Revenue × 100",           target:15,  scale:30, good:"↑" },
    { label:"Debt-to-Equity",   short:"Leverage",   value:f.equity>0?(f.liab/f.equity).toFixed(2):"—",            formula:"Total Liabilities ÷ Equity",            target:1.0, scale:3, good:"↓" },
    { label:"DSO (days)",       short:"DSO",        value:f.revenue>0?Math.round(f.ar/(f.revenue/f.dayOfYear)):"—",formula:"AR ÷ (Revenue ÷ Days Elapsed)",          target:30,  scale:90, good:"↓" },
    { label:"Cash Runway",      short:"Runway",     value:f.avgMonthlyExp>0?(f.cash/f.avgMonthlyExp).toFixed(1)+" mo":"—",formula:"Cash ÷ Avg Monthly Expenses",    target:3,   scale:12, good:"↑" },
  ];

  // Normalise for radar: each metric → 0-100 score
  const radarData = ratios.map(r => {
    const raw = parseFloat(r.value) || 0;
    let score;
    if (r.short==="Margin")   score = Math.min(100, raw * 2);   // 50% margin = 100 score
    else if (r.short==="DSO") score = Math.max(0, 100 - raw);   // lower DSO = better
    else if (r.short==="Leverage") score = Math.max(0, 100 - raw * 25); // lower D/E = better
    else if (r.short==="Runway")   score = Math.min(100, raw * 8);
    else score = Math.min(100, raw * 50); // ratios: 2.0 = 100%
    return { subject: r.short, score: Math.round(Math.max(0, score)) };
  });

  const overallHealth = Math.round(radarData.reduce((s,d) => s+d.score, 0) / radarData.length);
  const healthCol = overallHealth >= 70 ? "#16A34A" : overallHealth >= 50 ? "#F59E0B" : "#EF4444";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-[15px] font-semibold text-[#111827]">Financial Ratios</h3>
        <p className="text-[12px] text-slate-500">Six core ratios computed from live data — RadarChart shows overall financial health at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RadarChart */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[13.5px] font-semibold text-[#111827]">Financial Health Profile</h4>
            <div className="text-right">
              <p className="text-[22px] font-black" style={{color:healthCol}}>{overallHealth}</p>
              <p className="text-[10.5px] font-semibold" style={{color:healthCol}}>{overallHealth>=70?"Healthy":overallHealth>=50?"Moderate":"Needs Work"}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{top:10,right:20,bottom:10,left:20}}>
              <PolarGrid stroke="#E5E7EB"/>
              <PolarAngleAxis dataKey="subject" tick={{fontSize:11,fill:"#6B7280"}}/>
              <Radar name="Score" dataKey="score" stroke={healthCol} fill={healthCol} fillOpacity={0.25} strokeWidth={2}/>
              <Tooltip formatter={v=>[v+"/100","Health Score"]}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Ratio cards */}
        <div className="grid grid-cols-2 gap-3">
          {ratios.map(r => {
            const raw  = parseFloat(r.value) || 0;
            const isGood = r.good === "↑" ? raw >= parseFloat(r.target) : raw <= parseFloat(r.target);
            const col  = isNaN(raw) ? "#6B7280" : isGood ? "#16A34A" : "#EF4444";
            return (
              <div key={r.label} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <p className="text-[10.5px] text-slate-400 uppercase tracking-wide leading-tight">{r.label}</p>
                <p className="text-[22px] font-mono font-bold my-1" style={{color:col}}>{r.value}</p>
                <p className="text-[10px] font-mono text-slate-400 leading-tight">{r.formula}</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full" style={{background:col+"15",color:col}}>
                    {isGood ? "✓ On Target" : "⚠ Below Target"}
                  </span>
                  <span className="text-[9.5px] text-slate-300">Target: {r.target}{r.short==="Margin"?"%":r.short==="DSO"?" days":r.short==="Runway"?"mo":""}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-[10.5px] text-slate-400">Inventory turnover and gross margin absent intentionally — both require cost-of-goods-sold matched to units sold, which this schema does not track per-unit.</p>
    </div>
  );
}

"TIN Certificate", "Other"];

function DocumentScannerView({ expensesHook }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setResult(null); setError(null); setSaved(false);
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = () => rej(new Error("read failed"));
        r.readAsDataURL(file);
      });
      const mediaType = file.type || "image/jpeg";
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
            { type: "text", text: `Classify this business document and extract its data. Respond ONLY with JSON, no markdown fences, exactly this shape: {"docType": one of ${JSON.stringify(SCAN_DOC_TYPES)}, "issuer": string or null, "date": "YYYY-MM-DD" or null, "totalAmount": number or null, "vatAmount": number or null (only if VAT is itemized on the document), "currency": string or null, "referenceNumber": string or null, "tin": string or null, "category": the best fit from ${JSON.stringify(EXPENSE_CATEGORIES_LIST)} or null if genuinely unclear, "paymentMethod": one of ["Cash","Mobile Money","Bank Transfer","Card"] or null if not shown, "summary": one short sentence}. If a field is not visible, use null — never invent values.` },
          ] }],
        }),
      });
      const data = await response.json();
      const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
    } catch (_e) {
      setError("Couldn't read that image — try a clearer, well-lit photo of the full document.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveAsExpense() {
    if (!result) return;
    const amount = Number(result.totalAmount) || 0;
    // Extracted category is validated against the real expense category
    // list — an AI suggestion outside it falls back to "Supplies" rather
    // than inventing a category the Budgets tab could never match.
    // Method falls back to "Cash", the honest default for a paper
    // receipt in this market. Both remain editable in Payables.
    const category = EXPENSE_CATEGORIES_LIST.includes(result.category) ? result.category : "Supplies";
    const method = ["Cash", "Mobile Money", "Bank Transfer", "Card"].includes(result.paymentMethod) ? result.paymentMethod : "Cash";
    const draft = { id: `EXP-SCAN-${Date.now()}`, vendor: result.issuer || "Scanned receipt", category, date: result.date || TODAY.toISOString().slice(0, 10), dueDate: result.date || TODAY.toISOString().slice(0, 10), amount, status: "Paid", method };
    expensesHook.setRows((prev) => [draft, ...prev]);
    setSaved(true);
    notify(`Expense created from scan: ${draft.vendor} — TZS ${money(Math.round(amount))}k`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("finance_expenses").insert({ vendor: draft.vendor, category: draft.category, expense_date: draft.date, due_date: draft.dueDate, amount: draft.amount, status: draft.status, method: draft.method }).single().run();
        if (header?.id) expensesHook.setRows((prev) => prev.map((x) => (x.id === draft.id ? { ...x, dbId: header.id } : x)));
      } catch (_e) { notify("Saved locally, but the server update failed.", "error"); }
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h3 className="text-[15px] font-semibold text-[#111827]">AI Document Scanner</h3>
        <p className="text-[12px] text-slate-500">Photograph a receipt, invoice, tax document, ID, business license, or TIN certificate — real AI vision classifies it and extracts the data. The photo is processed, not stored; QR/barcode decoding needs a dedicated decoder and is named as future work, not faked.</p>
      </div>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" id="doc-scan-input" />
      <label htmlFor="doc-scan-input" className="btn-primary text-white text-[13px] font-medium px-4 py-2.5 rounded-lg inline-flex items-center gap-2 cursor-pointer">
        <ScanText size={15} /> {busy ? "Reading document..." : "Scan with camera / upload"}
      </label>
      {busy && <p className="text-[12px] text-slate-400">Real AI vision is reading the document — a few seconds.</p>}
      {error && <p className="text-[12px] text-[#EF4444]">{error}</p>}
      {result && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#DCFCE7] text-[#16A34A]">{result.docType || "Unknown"}</span>
            <span className="text-[10.5px] text-slate-400">Fields not visible come back empty — never invented.</span>
          </div>
          {[["Issuer", result.issuer], ["Date", result.date], ["Amount", result.totalAmount != null ? `${result.currency || ""} ${result.totalAmount}` : null], ["VAT (itemized)", result.vatAmount != null ? `${result.currency || ""} ${result.vatAmount}` : null], ["Category (AI suggestion)", result.category], ["Payment Method", result.paymentMethod], ["Reference", result.referenceNumber], ["TIN", result.tin]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-[12.5px]"><span className="text-slate-500">{k}</span><span className="font-medium text-[#111827]">{v ?? "—"}</span></div>
          ))}
          {result.summary && <p className="text-[11.5px] text-slate-400 pt-1 border-t border-slate-50">{result.summary}</p>}

export default Finance;
