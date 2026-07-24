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


          {(result.docType === "Receipt" || result.docType === "Invoice") && !saved && (
            <button onClick={saveAsExpense} className="btn-primary text-white text-[12px] font-medium rounded-lg px-3.5 py-2 mt-1">Save as Expense</button>
          )}
          {saved && <p className="text-[11.5px] font-medium text-[#16A34A]">Saved to Payables with the extracted category and payment method — both editable there if the AI read them wrong.</p>}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- LOANS ------------------------------------ */

const LOAN_TYPES = ["Bank Loan", "Personal Loan", "Supplier Credit", "Other"];

// Closes the honest gap this build stated directly in two other reports:
// the Cash Flow Statement and Balance Sheet both said financing
// activities and loan liabilities were "not tracked" because no real
// loan ledger existed anywhere in this schema. This is that ledger, and
// both of those reports now read real numbers from it (see the
// changelog) instead of the honest placeholder they used before it
// existed.
function LoansView() {
  const loans = useCompanyTable("business_loans", [], { order: { col: "borrowed_date", ascending: false }, mapRow: (r) => ({ id: r.id, dbId: r.id, lender: r.lender, loanType: r.loan_type, principal: Number(r.principal) || 0, interestRate: Number(r.interest_rate) || 0, borrowedDate: r.borrowed_date, dueDate: r.due_date, status: r.status, notes: r.notes || "", repayments: (r.loan_repayments || []).map((rp) => ({ id: rp.id, amount: Number(rp.amount) || 0, date: rp.repayment_date, method: rp.method || "" })) }), select: "*,loan_repayments(*)" });
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [repayingLoan, setRepayingLoan] = useState(null);
  const [repayAmount, setRepayAmount] = useState("");
  const [repayMethod, setRepayMethod] = useState("Cash");
  const [form, setForm] = useState({ lender: "", loanType: LOAN_TYPES[0], principal: "", interestRate: "", borrowedDate: TODAY.toISOString().slice(0, 10), dueDate: "" });

  function totalRepaid(loan) { return loan.repayments.reduce((s, r) => s + r.amount, 0); }
  function outstandingBalance(loan) { return Math.max(0, loan.principal - totalRepaid(loan)); }

  const totals = {
    outstanding: loans.rows.reduce((s, l) => s + outstandingBalance(l), 0),
    borrowed: loans.rows.reduce((s, l) => s + l.principal, 0),
    repaid: loans.rows.reduce((s, l) => s + totalRepaid(l), 0),
  };
  const filtered = filter === "All" ? loans.rows : loans.rows.filter((l) => l.status === filter);

  async function addLoan(e) {
    e.preventDefault();
    if (!form.lender.trim() || !form.principal) return;
    const draft = { id: `LOAN-${Date.now()}`, lender: form.lender.trim(), loanType: form.loanType, principal: Number(form.principal), interestRate: Number(form.interestRate) || 0, borrowedDate: form.borrowedDate, dueDate: form.dueDate || null, status: "Active", notes: "", repayments: [] };
    loans.setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    setForm({ lender: "", loanType: LOAN_TYPES[0], principal: "", interestRate: "", borrowedDate: TODAY.toISOString().slice(0, 10), dueDate: "" });
    notify(`Loan recorded: ${draft.lender} — TZS ${money(draft.principal)}k`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("business_loans").insert({ lender: draft.lender, loan_type: draft.loanType, principal: draft.principal, interest_rate: draft.interestRate, borrowed_date: draft.borrowedDate, due_date: draft.dueDate }).single().run();
        if (header?.id) loans.setRows((prev) => prev.map((l) => (l.id === draft.id ? { ...l, dbId: header.id } : l)));
      } catch (_e) { notify("Saved locally, but the server update failed.", "error"); }
    }
  }

  async function recordRepayment(loan) {
    const amt = Number(repayAmount);
    if (!amt || amt <= 0) { notify("Enter an amount above zero.", "error"); return; }
    const balance = outstandingBalance(loan);
    if (amt > balance + 1) {
      notify(`Overpayment blocked — balance is TZS ${money(Math.round(balance))}k. Enter at most ${money(Math.round(balance))}k.`, "error");
      return;
    }
    const draft = { id: docId("RP"), amount: amt, date: TODAY.toISOString().slice(0, 10), method: repayMethod };
    const newTotal = totalRepaid(loan) + amt;
    const newStatus = newTotal >= loan.principal ? "Paid" : loan.status;
    loans.setRows((prev) => prev.map((l) => l.id === loan.id ? { ...l, repayments: [...l.repayments, draft], status: newStatus } : l));
    setRepayingLoan(null); setRepayAmount(""); setRepayMethod("Cash");
    const msg = newStatus === "Paid" ? `Loan fully repaid — TZS ${money(Math.round(newTotal))}k settled.` : `Repayment of TZS ${money(amt)}k recorded. Remaining balance: TZS ${money(Math.round(balance - amt))}k.`;
    notify(msg, newStatus === "Paid" ? "success" : "info");
    logAudit(`Loan repayment: ${loan.lender}`, "Finance", "User", `TZS ${money(amt)}k via ${repayMethod}. Balance: TZS ${money(Math.round(Math.max(0, balance - amt)))}k`);
    if (IS_CONFIGURED && loan.dbId) {
      try {
        await sb("loan_repayments").insert({ loan_id: loan.dbId, amount: amt, repayment_date: draft.date, method: draft.method }).run();
        if (newStatus === "Paid") await sb("business_loans").eq("id", loan.dbId).update({ status: "Paid" }).run();
      } catch (_e) { notify("Saved locally — server update failed.", "error"); }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Loans</h3>
          <p className="text-[12px] text-slate-500">Money the business has borrowed — the real ledger behind Financing Activities in the Cash Flow Statement.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Add Loan</button>
      </div>

      <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #16A34A, #15803D)" }}>
        <p className="text-[12px] text-white/80 mb-1">Outstanding Balance</p>
        <p className="text-[26px] font-mono font-bold text-white mb-4">TZS {money(Math.round(totals.outstanding))}k</p>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/20">
          <div><p className="text-[11px] text-white/70">Total Borrowed</p><p className="text-[15px] font-mono font-semibold text-white">TZS {money(Math.round(totals.borrowed))}k</p></div>
          <div><p className="text-[11px] text-white/70">Total Repaid</p><p className="text-[15px] font-mono font-semibold text-white">TZS {money(Math.round(totals.repaid))}k</p></div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {["All", "Active", "Paid", "Defaulted"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${filter === f ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-3">
        {!loans.loading && filtered.length === 0 && <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={Landmark} title="No loans" hint="Real loans recorded here become real financing activity in the Cash Flow Statement." actionLabel="Add Loan" onAction={() => setShowForm(true)} /></div>}
        {loans.loading && <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 text-center text-[12.5px] text-slate-400">Loading...</div>}
        {filtered.map((l) => (
          <div key={l.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <div className="flex items-start justify-between mb-2">
              <div><p className="text-[13.5px] font-semibold text-[#111827]">{l.lender}</p><p className="text-[11px] text-slate-400">{l.loanType} · borrowed {l.borrowedDate}{l.dueDate ? ` · due ${l.dueDate}` : ""}</p></div>
              <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${l.status === "Paid" ? "bg-[#16A34A]/10 text-[#16A34A]" : l.status === "Defaulted" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{l.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[12px] mb-3">
              <div><p className="text-slate-400">Principal</p><p className="font-mono font-medium text-[#111827]">{money(Math.round(l.principal))}k</p></div>
              <div><p className="text-slate-400">Repaid</p><p className="font-mono font-medium text-[#16A34A]">{money(Math.round(totalRepaid(l)))}k</p></div>
              <div><p className="text-slate-400">Balance</p><p className="font-mono font-medium text-[#EF4444]">{money(Math.round(outstandingBalance(l)))}k</p></div>
            </div>
            {l.status !== "Paid" && (
              repayingLoan === l.id ? (
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  {/* Progress bar — visual balance reduction in real time */}
                  <div>
                    <div className="flex justify-between text-[10.5px] text-slate-400 mb-1">
                      <span>Repaid</span>
                      <span>{Math.min(100, Math.round((totalRepaid(l) + (Number(repayAmount) || 0)) / l.principal * 100))}% of principal</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (totalRepaid(l) / l.principal) * 100)}%`, backgroundColor: "#16A34A" }} />
                      {Number(repayAmount) > 0 && (
                        <div className="h-full rounded-full -mt-2 transition-all" style={{ width: `${Math.min(100, ((totalRepaid(l) + Number(repayAmount)) / l.principal) * 100)}%`, backgroundColor: "#4ADE80", opacity: 0.5 }} />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input type="number" value={repayAmount} onChange={(e) => setRepayAmount(e.target.value)}
                      placeholder={`Balance: TZS ${money(Math.round(outstandingBalance(l)))}k`}
                      className={inputClass + " flex-1 min-w-[120px]"} autoFocus />
                    <select className={inputClass + " max-w-[130px]"} value={repayMethod} onChange={(e) => setRepayMethod(e.target.value)}>
                      {["Cash","Bank Transfer","Mobile Money","Cheque"].map((m) => <option key={m}>{m}</option>)}
                    </select>
                    <button onClick={() => recordRepayment(l)} className="btn-primary text-white text-[12px] font-medium px-3.5 py-2 rounded-lg shrink-0">Record</button>
                    <button onClick={() => { setRepayingLoan(null); setRepayAmount(""); }} className="text-[12px] font-medium border border-slate-200 rounded-lg px-3 py-2 shrink-0">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (totalRepaid(l) / l.principal) * 100)}%`, backgroundColor: "#16A34A" }} />
                  </div>
                  <span className="text-[10.5px] text-slate-400 shrink-0">{Math.round((totalRepaid(l) / l.principal) * 100)}% repaid</span>
                  <button onClick={() => setRepayingLoan(l.id)} className="btn-secondary text-[12px] font-medium rounded-lg py-2 px-3 shrink-0">Record Repayment</button>
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={() => setShowForm(false)} />
          <form onSubmit={addLoan} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
            <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
              <h2 className="text-[18px] font-semibold text-[#111827]">Add Loan</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex-1 space-y-4">
              <FormField label="Lender" required><input className={inputClass} value={form.lender} onChange={(e) => setForm((f) => ({ ...f, lender: e.target.value }))} placeholder="e.g. CRDB Bank" /></FormField>
              <FormField label="Loan type">
                <select className={inputClass} value={form.loanType} onChange={(e) => setForm((f) => ({ ...f, loanType: e.target.value }))}>
                  {LOAN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </FormField>
              <FormField label="Principal amount" required><input type="number" min="0" className={inputClass} value={form.principal} onChange={(e) => setForm((f) => ({ ...f, principal: e.target.value }))} /></FormField>
              <FormField label="Interest rate (%, optional)"><input type="number" min="0" step="0.5" className={inputClass} value={form.interestRate} onChange={(e) => setForm((f) => ({ ...f, interestRate: e.target.value }))} /></FormField>
              <FormField label="Borrowed date"><input type="date" className={inputClass} value={form.borrowedDate} onChange={(e) => setForm((f) => ({ ...f, borrowedDate: e.target.value }))} /></FormField>
              <FormField label="Due date (optional)"><input type="date" className={inputClass} value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></FormField>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5">Cancel</button>
              <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Add Loan</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- BANKING ------------------------------------ */

function Banking({ invoices, expenses, posTransactions }) {
  const channels = useMemo(() => {
    const map = {};
    PAYMENT_METHODS.forEach((m) => { map[m] = { method: m, inflow: 0, outflow: 0 }; });

    invoices.forEach((inv) => {
      (inv.payments || []).forEach((p) => {
        if (map[p.method]) map[p.method].inflow += p.amount;
      });
    });
    (posTransactions || []).forEach((t) => {
      const gross = Math.round(t.items.reduce((s, it) => s + it.qty * it.price, 0) * (1 + TAX_RATE));
      const refunded = (t.returns || []).reduce((s, r) => s + r.refundTotal, 0);
      if (map[t.method]) map[t.method].inflow += (gross - refunded);
    });
    expenses.filter((e) => e.status === "Paid").forEach((e) => {
      if (map[e.method]) map[e.method].outflow += e.amount;
    });

    return Object.values(map).map((c) => ({ ...c, net: c.inflow - c.outflow }));
  }, [invoices, expenses, posTransactions]);

  const totals = channels.reduce((t, c) => ({ inflow: t.inflow + c.inflow, outflow: t.outflow + c.outflow }), { inflow: 0, outflow: 0 });

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Banknote size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Cash movement by channel, from recorded invoice payments, POS sales net of returns, and paid expenses. Legacy invoices marked Paid before an itemized payment method was recorded are not attributed to a channel here — see the General Ledger for those.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {channels.map((c) => {
          const Icon = c.method === "Cash" ? Banknote : c.method === "Card" ? CreditCard : c.method === "Mobile Money" ? Smartphone : Landmark;
          return (
            <div key={c.method} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-[#111827]/5 flex items-center justify-center">
                  <Icon size={16} className="text-[#111827]" />
                </div>
                <h3 className="text-[14px] font-semibold text-[#111827]">{c.method}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10.5px] text-slate-400 mb-0.5">In</p>
                  <p className="text-[13px] font-mono font-medium text-[#16A34A]">+{money(c.inflow)}</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-slate-400 mb-0.5">Out</p>
                  <p className="text-[13px] font-mono font-medium text-[#EF4444]">−{money(c.outflow)}</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-slate-400 mb-0.5">Net</p>
                  <p className={`text-[13px] font-mono font-semibold ${c.net >= 0 ? "text-[#111827]" : "text-[#EF4444]"}`}>{money(c.net)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center justify-between">
        <span className="text-[13px] font-medium text-[#111827]">Total across all channels</span>
        <div className="flex gap-4 text-[13px] font-mono">
          <span className="text-[#16A34A]">+{money(totals.inflow)}k</span>
          <span className="text-[#EF4444]">−{money(totals.outflow)}k</span>
          <span className="font-semibold text-[#111827]">{money(totals.inflow - totals.outflow)}k</span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------- OTHER DEBTORS ------------------------------------ */

const DEBTOR_TYPES = ["Customer", "Supplier", "Employee", "Other"];

// Genuinely distinct from sales_invoices' formal accounts receivable —
// this tracks informal debt: an advance to an employee, a personal loan
// to a supplier, money owed by someone outside any formal sales
// transaction. Real businesses track this constantly, and it never had
// an honest home in this system's existing Sales or CRM tables, both of
// which are specifically about formal customer transactions.
function OtherDebtorsView() {
  const debtors = useCompanyTable("other_debtors", [], { order: { col: "loan_date", ascending: false }, mapRow: (r) => ({ id: r.id, dbId: r.id, debtorType: r.debtor_type, name: r.debtor_name, phone: r.phone || "", amountOwed: Number(r.amount_owed) || 0, amountCollected: Number(r.amount_collected) || 0, description: r.description || "", loanDate: r.loan_date, dueDate: r.due_date, status: r.status }) });
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ debtorType: "Customer", name: "", phone: "", amountOwed: "", description: "", dueDate: "" });

  const totals = {
    outstanding: debtors.rows.reduce((s, d) => s + Math.max(0, d.amountOwed - d.amountCollected), 0),
    owed: debtors.rows.reduce((s, d) => s + d.amountOwed, 0),
    collected: debtors.rows.reduce((s, d) => s + d.amountCollected, 0),
  };
  const filtered = filter === "All" ? debtors.rows : debtors.rows.filter((d) => d.status === filter);

  async function addDebtor(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.amountOwed) return;
    const draft = { id: `DEBT-${Date.now()}`, debtorType: form.debtorType, name: form.name.trim(), phone: form.phone, amountOwed: Number(form.amountOwed), amountCollected: 0, description: form.description, loanDate: TODAY.toISOString().slice(0, 10), dueDate: form.dueDate || null, status: "Pending" };
    debtors.setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    setForm({ debtorType: "Customer", name: "", phone: "", amountOwed: "", description: "", dueDate: "" });
    notify(`Debtor added: ${draft.name}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("other_debtors").insert({ debtor_type: draft.debtorType, debtor_name: draft.name, phone: draft.phone, amount_owed: draft.amountOwed, description: draft.description, due_date: draft.dueDate }).single().run();
        if (header?.id) debtors.setRows((prev) => prev.map((d) => (d.id === draft.id ? { ...d, dbId: header.id } : d)));
      } catch (_e) { notify("Saved locally, but the server update failed.", "error"); }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Other Debtors</h3>
          <p className="text-[12px] text-slate-500">Money owed to the business outside a formal sale — an advance, a personal loan, an informal debt.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Add Debtor</button>
      </div>

      <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #F59E0B, #C4622D)" }}>
        <p className="text-[12px] text-white/80 mb-1">Outstanding Balance</p>
        <p className="text-[26px] font-mono font-bold text-white mb-4">TZS {money(Math.round(totals.outstanding))}k</p>
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/20">
          <div><p className="text-[11px] text-white/70">Total Owed</p><p className="text-[15px] font-mono font-semibold text-white">TZS {money(Math.round(totals.owed))}k</p></div>
          <div><p className="text-[11px] text-white/70">Total Collected</p><p className="text-[15px] font-mono font-semibold text-white">TZS {money(Math.round(totals.collected))}k</p></div>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {["All", "Pending", "Partial", "Paid"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${filter === f ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>{f}</button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
        {!debtors.loading && filtered.length === 0 && <EmptyState icon={UserPlus} title="No debtors" hint="Money owed to the business outside a formal sale, tracked separately from Sales and CRM." actionLabel="Add Debtor" onAction={() => setShowForm(true)} />}
        {debtors.loading && <p className="text-[12.5px] text-slate-400 text-center py-8">Loading...</p>}
        {filtered.map((d) => (
          <div key={d.id} className="flex items-center justify-between px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-[#111827] truncate">{d.name} <span className="text-[10.5px] text-slate-400 font-normal">· {d.debtorType}</span></p>
              <p className="text-[11px] text-slate-400">{d.phone || "No phone"} · since {d.loanDate}</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-[13px] font-mono font-semibold text-[#F59E0B]">TZS {money(Math.round(d.amountOwed - d.amountCollected))}k</p>
              <span className={`text-[10px] font-medium ${d.status === "Paid" ? "text-[#16A34A]" : "text-slate-400"}`}>{d.status}</span>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={() => setShowForm(false)} />
          <form onSubmit={addDebtor} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
            <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
              <h2 className="text-[18px] font-semibold text-[#111827]">Add Debtor</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex-1 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Debtor type</label>
                <div className="flex flex-wrap gap-2">
                  {DEBTOR_TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setForm((f) => ({ ...f, debtorType: t }))} className={`text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${form.debtorType === t ? "border-[#F59E0B]/50 bg-[#F59E0B]/10 text-[#F59E0B]" : "border-slate-200 text-slate-500"}`}>{t}</button>
                  ))}
                </div>
              </div>
              <FormField label="Debtor name" required><input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></FormField>
              <FormField label="Phone (optional)"><input className={inputClass} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></FormField>
              <FormField label="Amount owed" required><input type="number" min="0" className={inputClass} value={form.amountOwed} onChange={(e) => setForm((f) => ({ ...f, amountOwed: e.target.value }))} /></FormField>
              <FormField label="Description (optional)"><textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormField>
              <FormField label="Due date (optional)"><input type="date" className={inputClass} value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} /></FormField>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5">Cancel</button>
              <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- OTHER INCOME ------------------------------------ */

// Every P&L, Cash Flow, and Balance Sheet figure in this build previously
// computed revenue exclusively from sales_invoices and pos_transactions —
// correct for core sales revenue, silently incomplete for genuine
// non-sales income: interest earned, a grant, a one-off asset sale. Real
// and separate from sales revenue, not folded into it and blurring what
// the business actually sold.
function OtherIncomeView() {
  const income = useCompanyTable("other_income", [], { order: { col: "income_date", ascending: false }, mapRow: (r) => ({ id: r.id, dbId: r.id, title: r.title, amount: Number(r.amount) || 0, description: r.description || "", paymentMethod: r.payment_method, date: r.income_date }) });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", description: "", paymentMethod: "Cash", date: TODAY.toISOString().slice(0, 10) });

  const total = income.rows.reduce((s, i) => s + i.amount, 0);

  async function addIncome(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    const draft = { id: `INC-${Date.now()}`, title: form.title.trim(), amount: Number(form.amount), description: form.description, paymentMethod: form.paymentMethod, date: form.date };
    income.setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    setForm({ title: "", amount: "", description: "", paymentMethod: "Cash", date: TODAY.toISOString().slice(0, 10) });
    notify(`Income recorded: ${draft.title}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("other_income").insert({ title: draft.title, amount: draft.amount, description: draft.description, payment_method: draft.paymentMethod, income_date: draft.date }).single().run();
        if (header?.id) income.setRows((prev) => prev.map((i) => (i.id === draft.id ? { ...i, dbId: header.id } : i)));
      } catch (_e) { notify("Saved locally, but the server update failed.", "error"); }
    }
  }

  const PAY_ICONS = { Cash: Banknote, Mobile: Smartphone, Bank: Landmark };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Other Income</h3>
          <p className="text-[12px] text-slate-500">Real, genuine revenue outside a sale — interest, a grant, an asset sale — kept honestly separate from what the business actually sold.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Add Income</button>
      </div>

      <div className="rounded-xl p-5 bg-[#DCFCE7]">
        <p className="text-[12px] text-[#15803D] mb-1">Total Other Income</p>
        <p className="text-[26px] font-mono font-bold text-[#15803D]">TZS {money(Math.round(total))}k</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
        {!income.loading && income.rows.length === 0 && <EmptyState icon={Wallet} title="No other income recorded" hint="Real non-sales revenue this system's P&L would otherwise miss entirely." actionLabel="Add Income" onAction={() => setShowForm(true)} />}
        {income.loading && <p className="text-[12.5px] text-slate-400 text-center py-8">Loading...</p>}
        {income.rows.map((i) => {
          const Icon = PAY_ICONS[i.paymentMethod] || Banknote;
          return (
            <div key={i.id} className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center shrink-0"><Icon size={14} className="text-[#16A34A]" /></div>
              <div className="min-w-0 flex-1"><p className="text-[13px] font-medium text-[#111827] truncate">{i.title}</p><p className="text-[11px] text-slate-400">{i.date} · {i.paymentMethod}</p></div>
              <p className="text-[13px] font-mono font-semibold text-[#16A34A] shrink-0">+{money(Math.round(i.amount))}k</p>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={() => setShowForm(false)} />
          <form onSubmit={addIncome} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
            <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
              <h2 className="text-[18px] font-semibold text-[#111827]">Add Income</h2>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex-1 space-y-4">
              <FormField label="Title" required><input className={inputClass} value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Interest earned" /></FormField>
              <FormField label="Amount" required><input type="number" min="0" className={inputClass} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} /></FormField>
              <FormField label="Description (optional)"><textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></FormField>
              <div>
                <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Payment method</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PAY_ICONS).map(([m, Icon]) => (
                    <button key={m} type="button" onClick={() => setForm((f) => ({ ...f, paymentMethod: m }))} className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-colors ${form.paymentMethod === m ? "border-[#16A34A]/50 bg-[#16A34A]/5" : "border-slate-200"}`}>
                      <Icon size={16} className={form.paymentMethod === m ? "text-[#16A34A]" : "text-slate-400"} />
                      <span className={`text-[11px] font-medium ${form.paymentMethod === m ? "text-[#111827]" : "text-slate-500"}`}>{m}</span>
                    </button>
                  ))}
                </div>
              </div>
              <FormField label="Date"><input type="date" className={inputClass} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></FormField>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5">Cancel</button>
              <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------ TAX -------------------------------------- */

// TRA Tanzania Tax Center — every figure computed from real records with
// real published rates, framed honestly as PLANNING ESTIMATES, never a
// filing. Rates live in a per-country config so Kenya/Uganda/Rwanda/
// Zambia are a rates-table away, not a rewrite — TZ is implemented,
// the others are named as coming, not faked as present. All money in
// TZS thousands, matching this entire build's convention — the PAYE
// brackets below are the real TRA monthly resident brackets expressed
// in thousands (270k/520k/760k/1m boundaries).
const TAX_COUNTRIES = {
  TZ: {
    label: "Tanzania (TRA)", active: true,
    corporateRate: 0.30, sdlRate: 0.035, wcfRate: 0.005,
    paye: (s) => s <= 270 ? 0 : s <= 520 ? (s - 270) * 0.08 : s <= 760 ? 20 + (s - 520) * 0.20 : s <= 1000 ? 68 + (s - 760) * 0.25 : 128 + (s - 1000) * 0.30,
  },
  KE: { label: "Kenya (KRA)", active: false }, UG: { label: "Uganda (URA)", active: false },
  RW: { label: "Rwanda (RRA)", active: false }, ZM: { label: "Zambia (ZRA)", active: false },
};

function TaxCenterView({ invoices, expenses, employeesHook, company }) {
  const [country, setCountry] = useState("TZ");
  const cfg = TAX_COUNTRIES[country];
  const yearStart = `${TODAY.getFullYear()}-01-01`;

  const figures = useMemo(() => {
    if (!cfg.active) return null;
    const outputVat = invoices.rows.filter((i) => i.date >= yearStart).reduce((s, i) => s + lineTotal(i.items).tax, 0);
    const staff = employeesHook.rows.filter((e) => e.status === "Active");
    const payroll = staff.reduce((s, e) => s + e.salary, 0);
    const payeRows = staff.map((e) => ({ name: e.name, salary: e.salary, paye: cfg.paye(e.salary) }));
    const payeTotal = payeRows.reduce((s, r) => s + r.paye, 0);
    const sdl = payroll * cfg.sdlRate;
    const wcf = payroll * cfg.wcfRate;
    const revenue = invoices.rows.filter((i) => i.date >= yearStart).reduce((s, i) => s + lineTotal(i.items).total, 0);
    const expTotal = expenses.filter((e) => e.date >= yearStart).reduce((s, e) => s + e.amount, 0);
    const profit = revenue - expTotal;
    const corp = Math.max(0, profit) * cfg.corporateRate;
    return { outputVat, staff: staff.length, payroll, payeRows, payeTotal, sdl, wcf, profit, corp };
  }, [invoices.rows, expenses, employeesHook.rows, cfg, yearStart]);

  const Card = ({ title, value, note }) => (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
      <p className="text-[11px] text-slate-400 mb-1">{title}</p>
      <p className="text-[15px] font-mono font-semibold text-[#111827]">TZS {money(Math.round(value))}k</p>
      <p className="text-[10.5px] text-slate-400 mt-1">{note}</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Tax Center</h3>
          <p className="text-[12px] text-slate-500">Real published rates against your real records — planning estimates, never a filing.</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {Object.entries(TAX_COUNTRIES).map(([k, v]) => (
            <button key={k} onClick={() => setCountry(k)} className={`text-[11.5px] font-medium px-2.5 py-1.5 rounded-md transition-colors ${country === k ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>{k}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-3.5 flex items-start gap-2.5" style={{ backgroundColor: "#FEF3C7" }}>
        <AlertCircle size={15} className="text-[#F59E0B] shrink-0 mt-0.5" />
        <p className="text-[11.5px] text-[#92400E]">These are estimates computed from what this system has recorded, using published rates — accounting profit is not taxable profit, rates change, and input-VAT credits need per-expense VAT capture this build does not yet do. Verify every figure with TRA or your accountant before filing or paying anything.</p>
      </div>

      {!cfg.active && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-8 text-center">
          <p className="text-[13px] font-medium text-[#111827]">{cfg.label} — coming</p>
          <p className="text-[11.5px] text-slate-400 mt-1">The engine is a per-country rates table — this jurisdiction needs its real brackets added and checked, not a rewrite. Tanzania is live today.</p>
        </div>
      )}

      {figures && (
        <>
          {/* Hero — the one number a business owner asks first: what do I
              owe this month? PAYE + SDL + WCF are the real monthly
              obligations; VAT and corporate tax shown as YTD context.
              Same gradient language as the Loans and Debtors heroes. */}
          <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #16A34A, #15803D)" }}>
            <p className="text-[12px] text-white/80 mb-1">Estimated Monthly Obligation (PAYE + SDL + WCF)</p>
            <p className="text-[26px] font-mono font-bold text-white mb-4">TZS {money(Math.round(figures.payeTotal + figures.sdl + figures.wcf))}k</p>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/20">
              <div><p className="text-[11px] text-white/70">Output VAT (YTD)</p><p className="text-[15px] font-mono font-semibold text-white">TZS {money(Math.round(figures.outputVat))}k</p></div>
              <div><p className="text-[11px] text-white/70">Corporate Tax (YTD est.)</p><p className="text-[15px] font-mono font-semibold text-white">TZS {money(Math.round(figures.corp))}k</p></div>
            </div>
          </div>

          {/* Real TRA filing deadlines — the 7th (PAYE/SDL) and the 20th
              (VAT return) of the following month are published dates, so
              day counts here are computed facts, colored by real urgency,
              not a decorative calendar. */}
          {(() => {
            const nextDue = (day) => {
              const d = new Date(TODAY);
              if (d.getDate() >= day) d.setMonth(d.getMonth() + 1);
              d.setDate(day);
              return d;
            };
            const items = [
              { label: "PAYE & SDL remittance", day: 7 },
              { label: "VAT return & payment", day: 20 },
              { label: "WCF contribution", day: 7 },
            ].map((x) => {
              const due = nextDue(x.day);
              const days = Math.ceil((due - TODAY) / 86400000);
              return { ...x, due: due.toISOString().slice(0, 10), days };
            });
            return (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {items.map((x) => (
                  <div key={x.label} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-[13px]" style={{ backgroundColor: x.days <= 5 ? "#FEE2E2" : "#DCFCE7", color: x.days <= 5 ? "#EF4444" : "#16A34A" }}>{x.days}d</div>
                    <div className="min-w-0"><p className="text-[12px] font-medium text-[#111827] truncate">{x.label}</p><p className="text-[10.5px] text-slate-400">due {x.due} — published TRA date</p></div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="flex justify-end">
            <ExportMenu
              title="Tax Summary" filename="tax-summary" sheetName="Tax Summary"
              headers={["Obligation", "Amount (TZS 000)", "Basis"]}
              rows={[["Output VAT (YTD)", Math.round(figures.outputVat), "Real invoice tax lines"],
                ["PAYE (monthly)", Math.round(figures.payeTotal), `TRA brackets across ${figures.staff} salaries`],
                ["SDL (monthly)", Math.round(figures.sdl), "3.5% of gross payroll"],
                ["WCF (monthly)", Math.round(figures.wcf), "0.5% of gross payroll"],
                ["Corporate Tax (YTD est.)", Math.round(figures.corp), "30% of YTD accounting profit"]]}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Card title="Output VAT (YTD)" value={figures.outputVat} note={`${company.taxRate || 18}% on real invoice tax lines. Input-VAT credit not yet netted — stated, not hidden.`} />
            <Card title="PAYE (monthly)" value={figures.payeTotal} note={`Real TRA brackets across ${figures.staff} active salaries.`} />
            <Card title="SDL (monthly)" value={figures.sdl} note="3.5% of gross payroll. Applies from 10+ employees — check your headcount." />
            <Card title="WCF (monthly)" value={figures.wcf} note="0.5% of gross payroll, private sector rate." />
            <Card title="Corporate Tax (YTD est.)" value={figures.corp} note={`30% on YTD accounting profit of TZS ${money(Math.round(figures.profit))}k — taxable profit differs after adjustments.`} />
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[11px] text-slate-400 mb-1">Excise Duty</p>
              <p className="text-[13px] font-medium text-[#111827]">Not computed</p>
              <p className="text-[10.5px] text-slate-400 mt-1">Excise is product-specific (fuel, beverages, airtime) — needs per-product excise rates this catalog does not carry. Named, not guessed.</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <p className="text-[12.5px] font-semibold text-[#111827] px-4 pt-3.5 pb-2">PAYE per employee — real TRA monthly brackets</p>
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide"><th className="px-4 py-2">Employee</th><th className="px-4 py-2 text-right">Gross (TZS k)</th><th className="px-4 py-2 text-right">PAYE (TZS k)</th></tr></thead>
              <tbody>
                {figures.payeRows.map((r) => (
                  <tr key={r.name} className="border-b border-slate-50 last:border-0"><td className="px-4 py-2 text-[#111827]">{r.name}</td><td className="px-4 py-2 text-right font-mono text-slate-600">{money(r.salary)}</td><td className="px-4 py-2 text-right font-mono text-[#111827]">{money(Math.round(r.paye * 10) / 10)}</td></tr>
                ))}
                {figures.payeRows.length === 0 && !employeesHook.loading && <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400 text-[12px]">No active employees.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* TRA Portal Compliance */}
      {country === "TZ" && figures && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#111827]">TRA Portal — Tax Return Templates</h3>
            <a href="https://taxpayerportal.tra.go.tz" target="_blank" rel="noopener noreferrer"
              className="text-[11.5px] font-medium text-[#16A34A] hover:underline flex items-center gap-1">
              Open TRA Portal <ChevronRight size={12}/>
            </a>
          </div>
          <p className="text-[12px] text-slate-500">Pre-filled from your real records. Print each form to use as a filing reference at <strong>taxpayerportal.tra.go.tz</strong>. Deadlines: PAYE, SDL, WCF by the <strong>7th</strong> · VAT by the <strong>20th</strong> of the following month.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TRAReturnCard title="PAYE Monthly Return" formCode="PAYE.1" deadline="7th of next month"
              fields={[ { l:"Employer TIN", v: company.tin||"—" }, { l:"No. of Employees", v: String(figures.staff) }, { l:"Gross Payroll (TZS)", v: money(Math.round(figures.payroll*1000)) }, { l:"Total PAYE Due", v: `TZS ${money(Math.round(figures.payeTotal*1000))}` } ]}
              onPrint={() => printTRAReturn("PAYE Return", figures, company, employeesHook.rows)} />
            <TRAReturnCard title="VAT Monthly Return" formCode="VAT.1" deadline="20th of next month"
              fields={[ { l:"Taxpayer TIN", v: company.tin||"—" }, { l:"Output VAT (Sales)", v: `TZS ${money(Math.round(figures.outputVat*1000))}` }, { l:"Input VAT", v:"Enter from purchase invoices" }, { l:"Net VAT Payable", v:`TZS ${money(Math.round(figures.outputVat*1000))} (before input credit)` } ]}
              onPrint={() => printTRAReturn("VAT Return", figures, company, [])} />
            <TRAReturnCard title="Skills Development Levy" formCode="SDL" deadline="7th of next month"
              fields={[ { l:"Employer TIN", v: company.tin||"—" }, { l:"Gross Payroll", v:`TZS ${money(Math.round(figures.payroll*1000))}` }, { l:"SDL Rate", v:"3.5%" }, { l:"SDL Due", v:`TZS ${money(Math.round(figures.sdl*1000))}` } ]}
              onPrint={() => printTRAReturn("SDL Return", figures, company, [])} />
            <TRAReturnCard title="Workers Compensation Fund" formCode="WCF" deadline="7th of next month"
              fields={[ { l:"Employer TIN", v: company.tin||"—" }, { l:"Gross Payroll", v:`TZS ${money(Math.round(figures.payroll*1000))}` }, { l:"WCF Rate", v:"0.5%" }, { l:"WCF Due", v:`TZS ${money(Math.round(figures.wcf*1000))}` } ]}
              onPrint={() => printTRAReturn("WCF Return", figures, company, [])} />
          </div>
        </div>
      )}
    </div>
  );
}

function TRAReturnCard({ title, formCode, deadline, fields, onPrint }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-[12.5px] font-semibold text-[#111827]">{title}</p>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{formCode}</p>
          <p className="text-[10.5px] text-[#F59E0B] flex items-center gap-1 mt-0.5"><Clock size={10}/> Due {deadline}</p>
        </div>
        <button onClick={onPrint} className="flex items-center gap-1 text-[11px] font-medium text-[#16A34A] border border-[#16A34A]/30 rounded-lg px-2.5 py-1.5 hover:bg-[#16A34A]/5 shrink-0">
          <Printer size={11}/> Print
        </button>
      </div>
      <div className="space-y-1.5">
        {fields.map((f) => (
          <div key={f.l} className="flex items-center justify-between gap-2 text-[11.5px]">
            <span className="text-slate-400">{f.l}</span>
            <span className="font-medium text-[#111827] text-right truncate max-w-[200px]">{f.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function printTRAReturn(type, figures, company, employees) {
  const co = window.__smartManagerCompany || company || {};
  const month = new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
  const PAYE = (s) => s<=270?0:s<=520?(s-270)*0.08:s<=760?20+(s-520)*0.2:s<=1000?68+(s-760)*0.25:128+(s-1000)*0.3;
  const empRows = type==="PAYE Return" ? employees.filter((e)=>e.status==="Active").map((e)=>
    `<tr><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0">${e.name}</td><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0">${e.role||""}</td><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right">TZS ${fmt(e.salary*1000)}</td><td style="padding:5px 8px;border-bottom:1px solid #f0f0f0;text-align:right;color:#EF4444">TZS ${fmt(PAYE(e.salary)*1000)}</td></tr>`
  ).join("") : "";
  const computedRows = {
    "PAYE Return": [["No. of Employees",String(figures.staff)],["Gross Payroll",`TZS ${fmt(figures.payroll*1000)}`],["Total PAYE Deducted",`TZS ${fmt(figures.payeTotal*1000)}`]],
    "VAT Return":  [["Output VAT (Sales)",`TZS ${fmt(figures.outputVat*1000)}`],["Input VAT (Purchases)","[Enter from purchase records]"],["Net VAT Payable",`TZS ${fmt(figures.outputVat*1000)} (before input credit)`]],
    "SDL Return":  [["Gross Payroll",`TZS ${fmt(figures.payroll*1000)}`],["SDL Rate","3.5%"],["SDL Due",`TZS ${fmt(figures.sdl*1000)}`]],
    "WCF Return":  [["Gross Payroll",`TZS ${fmt(figures.payroll*1000)}`],["WCF Rate","0.5%"],["WCF Due",`TZS ${fmt(figures.wcf*1000)}`]],
  }[type] || [];
  const logoHtml = co.logo ? "<img src=\"" + co.logo + "\" style=\"height:44px;object-fit:contain\" alt=\"logo\"/>" : "<div style=\"font-size:28px\">&#127481;&#127487;</div>";
  const rowsHtml = computedRows.map(function(pair, i) { const l = pair[0]; const v = pair[1]; const bg = i%2 ? "" : " style=\"background:#F8FAFC\""; const color = (l.includes("Due")||l.includes("Deducted")||l.includes("Payable")) ? "#EF4444" : "#111827"; return "<tr" + bg + "><td style=\"padding:6px 10px;font-size:11px;color:#6B7280\">" + l + "</td><td style=\"padding:6px 10px;font-size:12px;font-weight:700;text-align:right;color:" + color + "\">" + v + "</td></tr>"; }).join("");
  const empSection = empRows ? "<p style=\"font-size:11px;font-weight:700;color:#111827;margin-bottom:6px;letter-spacing:.05em\">EMPLOYEE BREAKDOWN</p><table style=\"width:100%;border-collapse:collapse\"><thead><tr style=\"background:#F0FDF4\"><th style=\"padding:5px 8px;font-size:9.5px;text-align:left;font-weight:600;color:#166534\">Employee</th><th style=\"padding:5px 8px;font-size:9.5px;text-align:left;font-weight:600;color:#166534\">Role</th><th style=\"padding:5px 8px;font-size:9.5px;text-align:right;font-weight:600;color:#166534\">Gross Salary</th><th style=\"padding:5px 8px;font-size:9.5px;text-align:right;font-weight:600;color:#166534\">PAYE</th></tr></thead><tbody>" + empRows + "</tbody></table>" : "";
  printAsPDF("TRA — " + type, "<div style=\"font-family:Inter,sans-serif;max-width:640px;margin:0 auto;padding:32px\"><div style=\"display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #16A34A;padding-bottom:16px;margin-bottom:20px\"><div><div style=\"font-size:18px;font-weight:800;color:#16A34A\">TANZANIA REVENUE AUTHORITY</div><div style=\"font-size:13px;font-weight:700;color:#111827;margin-top:2px\">" + type + "</div><div style=\"font-size:11px;color:#6B7280\">Period: " + month + "</div></div><div style=\"text-align:right\">" + logoHtml + "<div style=\"font-size:12px;font-weight:700;color:#111827;margin-top:4px\">" + (co.name||"Your Company") + "</div><div style=\"font-size:11px;color:#6B7280\">TIN: " + (co.tin||"—") + "</div></div></div><table style=\"width:100%;border-collapse:collapse;margin-bottom:16px\"><tr style=\"background:#F0FDF4\"><td colspan=\"2\" style=\"padding:8px 10px;font-weight:700;font-size:11px;color:#166534;letter-spacing:.05em\">TAXPAYER DETAILS</td></tr><tr><td style=\"padding:6px 10px;font-size:11px;color:#6B7280;width:40%\">Business Name</td><td style=\"padding:6px 10px;font-size:11.5px;font-weight:600\">" + (co.name||"—") + "</td></tr><tr style=\"background:#F8FAFC\"><td style=\"padding:6px 10px;font-size:11px;color:#6B7280\">TIN Number</td><td style=\"padding:6px 10px;font-size:11.5px;font-weight:600\">" + (co.tin||"—") + "</td></tr><tr><td style=\"padding:6px 10px;font-size:11px;color:#6B7280\">Registration No.</td><td style=\"padding:6px 10px;font-size:11.5px\">" + (co.regNumber||"—") + "</td></tr><tr style=\"background:#F8FAFC\"><td style=\"padding:6px 10px;font-size:11px;color:#6B7280\">Address</td><td style=\"padding:6px 10px;font-size:11px\">" + [co.address,co.city,"Tanzania"].filter(Boolean).join(", ") + "</td></tr><tr><td style=\"padding:6px 10px;font-size:11px;color:#6B7280\">Return Period</td><td style=\"padding:6px 10px;font-size:11.5px;font-weight:600\">" + month + "</td></tr></table><table style=\"width:100%;border-collapse:collapse;margin-bottom:16px\"><tr style=\"background:#F0FDF4\"><td colspan=\"2\" style=\"padding:8px 10px;font-weight:700;font-size:11px;color:#166534;letter-spacing:.05em\">TAX COMPUTATION</td></tr>" + rowsHtml + "</table>" + empSection + "<div style=\"margin-top:20px;padding:10px;background:#FEF3C7;border-radius:6px;font-size:10px;color:#92400E\">&#9888; Verify with your accountant before filing. Input VAT credits must be applied manually at taxpayerportal.tra.go.tz</div><div style=\"margin-top:10px;font-size:9.5px;color:#9CA3AF;text-align:center\">Generated by Smart Manager &middot; " + new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) + "</div></div>");
}

function TaxSummary({ invoices }) {
  const figures = useMemo(() => {
    const outputVat = invoices.reduce((s, inv) => s + lineTotal(inv.items).tax, 0);
    const taxableRevenue = invoices.reduce((s, inv) => s + lineTotal(inv.items).subtotal, 0);
    return { outputVat, taxableRevenue };
  }, [invoices]);

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Percent size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          VAT on an invoice basis (owed when invoiced, not when paid) — Tanzania's standard treatment. Input VAT from vendor bills is not tracked yet since expenses do not carry a VAT breakdown, so this shows output VAT only, not a true net position.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-4">VAT Summary — {TAX_RATE * 100}% standard rate</h3>
        <div className="space-y-3 text-[13px]">
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Taxable revenue (subtotal of all invoices)</span>
            <span className="font-mono text-[#111827]">TZS {money(Math.round(figures.taxableRevenue))}k</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Output VAT collected</span>
            <span className="font-mono text-[#111827]">TZS {money(Math.round(figures.outputVat))}k</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-slate-500">Input VAT (not yet tracked)</span>
            <span className="font-mono text-slate-400">—</span>
          </div>
          <div className="flex justify-between py-3 font-semibold text-[15px]">
            <span className="text-[#111827]">Estimated VAT payable</span>
            <span className="font-mono text-[#F59E0B]">TZS {money(Math.round(figures.outputVat))}k</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------ ASSETS ------------------------------------ */

function Assets() {
  const assets = useCompanyTable("finance_assets", financeAssetsSeed, { order: { col: "acquisition_date", ascending: false }, mapRow: mapAssetRow });
  const { rows, setRows, loading } = assets;
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const totals = useMemo(() => {
    return rows.reduce((t, a) => {
      const { accumulated, bookValue } = depreciate(a);
      return { cost: t.cost + a.cost, accumulated: t.accumulated + accumulated, bookValue: t.bookValue + bookValue };
    }, { cost: 0, accumulated: 0, bookValue: 0 });
  }, [rows]);

  async function addAsset(form) {
    const draft = {
      id: docId("AST"),
      name: form.name, category: form.category, acquisitionDate: form.acquisitionDate,
      cost: Number(form.cost) || 0, usefulLifeYears: Number(form.usefulLifeYears) || 5,
    };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Asset added: ${draft.name}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("finance_assets").insert({
          name: draft.name, category: draft.category, acquisition_date: draft.acquisitionDate,
          cost: draft.cost, useful_life_years: draft.usefulLifeYears,
        }).single().run();
        if (header?.id) setRows((prev) => prev.map((a) => (a.id === draft.id ? { ...a, dbId: header.id } : a)));
      } catch (_e) { notify("Asset added locally, but saving to the server failed.", "error"); }
    }
  }

  async function deleteAsset(id) {
    const asset = rows.find((a) => a.id === id);
    setRows((prev) => prev.filter((a) => a.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && asset?.dbId) {
      try { await sb("finance_assets").eq("id", asset.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the asset on the server.", "error"); }
    }
  }

  const ASSET_KPIS = [
    { label: "Total Asset Cost", value: `TZS ${money(Math.round(totals.cost))}k`, delta: `${rows.length} assets`, up: true, icon: Package },
    { label: "Accumulated Depreciation", value: `TZS ${money(Math.round(totals.accumulated))}k`, delta: "To date", up: false, icon: TrendingDown },
    { label: "Net Book Value", value: `TZS ${money(Math.round(totals.bookValue))}k`, delta: "Current", up: true, icon: CircleDollarSign },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ASSET_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Asset
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Acquired</th>
                <th className="px-4 py-3 font-medium text-right">Cost</th>
                <th className="px-4 py-3 font-medium text-right">Accum. Deprec.</th>
                <th className="px-4 py-3 font-medium text-right">Book Value</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows cols={6} />}
              {!loading && rows.map((a) => {
                const { accumulated, bookValue, fullyDepreciated } = depreciate(a);
                return (
                  <tr key={a.id} onClick={() => setSelected(a)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#111827]">{a.name}</p>
                      <p className="text-[11px] text-slate-400">{a.category} · {a.id}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{a.acquisitionDate}</td>
                    <td className="px-4 py-3 text-right font-mono">{money(a.cost)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500">{money(accumulated)}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      {money(bookValue)}
                      {fullyDepreciated && <span className="ml-1.5 text-[10px] text-slate-400">fully deprec.</span>}
                    </td>
                    <td className="px-4 py-3 text-right"><ChevronRight size={15} className="text-slate-300 inline" /></td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Package}
                      title="No fixed assets yet"
                      hint="Vehicles, equipment, and buildings live here with straight-line depreciation computed automatically from acquisition date and useful life."
                      actionLabel="New Asset"
                      onAction={() => setShowForm(true)}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && <AssetPanel asset={selected} onClose={() => setSelected(null)} onDelete={deleteAsset} />}
      {showForm && <AssetFormPanel onClose={() => setShowForm(false)} onSubmit={addAsset} />}
    </div>
  );
}

function AssetPanel({ asset, onClose, onDelete }) {
  const { accumulated, bookValue, fullyDepreciated, monthlyDep } = depreciate(asset);
  const pctDepreciated = Math.min(100, Math.round((accumulated / asset.cost) * 100));

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[11px] font-mono text-slate-400">{asset.id}</p>
            <h2 className="text-[17px] font-semibold text-[#111827] mt-0.5 leading-snug">{asset.name}</h2>
            <p className="text-[13px] text-slate-500">{asset.category}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Original Cost</p>
            <p className="text-[15px] font-mono font-semibold text-[#111827]">TZS {money(asset.cost)}k</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Useful Life</p>
            <p className="text-[15px] font-semibold text-[#111827]">{asset.usefulLifeYears} years</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-3">
          <div className="flex justify-between mb-1.5">
            <p className="text-[11px] text-slate-400">Depreciated</p>
            <p className="text-[11px] font-mono text-slate-500">{pctDepreciated}%</p>
          </div>
          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#F59E0B]" style={{ width: `${pctDepreciated}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Accum. Depreciation</p>
            <p className="text-[15px] font-mono font-semibold text-[#F59E0B]">TZS {money(accumulated)}k</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Net Book Value</p>
            <p className="text-[15px] font-mono font-semibold text-[#16A34A]">TZS {money(bookValue)}k</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[13px] text-slate-600 mb-2">
          <Clock size={14} className="text-slate-400" /> Acquired {asset.acquisitionDate}
        </div>
        <div className="flex items-center gap-2.5 text-[13px] text-slate-600 mb-6">
          <TrendingDown size={14} className="text-slate-400" /> TZS {money(monthlyDep)}k depreciation per month{fullyDepreciated ? " (fully depreciated)" : ""}
        </div>

        <div className="flex-1" />
        <ConfirmDeleteButton label="Remove asset" onConfirm={() => onDelete(asset.id)} />
      </div>
    </div>
  );
}

function AssetFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", category: ASSET_CATEGORIES[0], acquisitionDate: TODAY.toISOString().slice(0, 10), cost: "", usefulLifeYears: "5" });
  const [touched, setTouched] = useState(false);
  const valid = form.name.trim() && Number(form.cost) > 0 && Number(form.usefulLifeYears) > 0;

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit(form);
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Finance</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Asset</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Asset name" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Toyota Hilux — Delivery Truck" />
            {touched && !form.name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Asset name is required.</p>}
          </FormField>

          <FormField label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {ASSET_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Cost (TZS 000)" required>
              <input type="number" min="0" className={inputClass} value={form.cost} onChange={(e) => set("cost", e.target.value)} placeholder="0" />
              {touched && !(Number(form.cost) > 0) && <p className="text-[11px] text-[#EF4444] mt-1">Enter a cost.</p>}
            </FormField>
            <FormField label="Useful life (years)" required>
              <input type="number" min="1" className={inputClass} value={form.usefulLifeYears} onChange={(e) => set("usefulLifeYears", e.target.value)} placeholder="5" />
            </FormField>
          </div>

          <FormField label="Acquisition date">
            <input type="date" className={inputClass} value={form.acquisitionDate} onChange={(e) => set("acquisitionDate", e.target.value)} />
          </FormField>

          <p className="text-[11.5px] text-slate-400">Depreciation is calculated automatically using the straight-line method from this date.</p>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white text-[12px] font-medium rounded-lg py-2.5">Create Asset</button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------------- HR --------------------------------------- */

const HR_TABS = [
  { id: "employees",  label: "Employees",     icon: Users },
  { id: "timetable",  label: "Timetable",      icon: CalendarDays },
  { id: "recruitment",label: "Recruitment",    icon: UserPlus },
  { id: "attendance", label: "Attendance",     icon: CalendarCheck },
  { id: "performance",label: "Performance",    icon: Award },
  { id: "training",   label: "Training",       icon: GraduationCap },
  { id: "leave",      label: "Leave Requests", icon: Clock },
  { id: "benefits",   label: "Benefits",       icon: HeartHandshake },
  { id: "payroll",    label: "Payroll",        icon: Banknote },
];

/* ═══════════════════════════════════════════════════════════════════════
   WORKING TIMETABLE & TIMELINE
   ─ Weekly roster grid         → assign duties per employee per day
   ─ Timeline view              → vertical chronological duty stream
   ─ Completion tick            → employee marks duty done
   ─ Manager approval           → biometric-signed higher-rank sign-off
   ─ Smart conflict detection   → same person / overlapping time
   ─ Progress rings             → per-day and per-department %
   ─ PDF export                 → full week schedule as printable sheet
   ─ Supabase persistence       → real data when configured
═══════════════════════════════════════════════════════════════════════ */

// Seed duties for demo
const dutiesSeed = [
  { id:"DTY-001", title:"Morning stock count", assignee:"Juma Batenga",      dept:"Sales",      date:"2026-07-21", startTime:"07:30", endTime:"09:00", type:"Operations", priority:"High",   status:"Approved",   completedAt:"2026-07-21 09:05", approvedBy:"Sarah Kileo",  approvedAt:"2026-07-21 09:15", notes:"" },
  { id:"DTY-002", title:"Client meeting — Uzuri",  assignee:"Sarah Kileo",  dept:"Sales",      date:"2026-07-21", startTime:"10:00", endTime:"11:30", type:"Meeting",    priority:"High",   status:"Completed",  completedAt:"2026-07-21 11:35", approvedBy:null,           approvedAt:null,               notes:"Went well, follow-up needed" },
  { id:"DTY-003", title:"Inventory audit — Aisle C",assignee:"Grace Mmbaga",dept:"Warehouse",  date:"2026-07-21", startTime:"08:00", endTime:"12:00", type:"Audit",      priority:"Medium", status:"In Progress",completedAt:null,               approvedBy:null,           approvedAt:null,               notes:"" },
  { id:"DTY-004", title:"Payroll processing",       assignee:"Amina Hassan", dept:"Finance",    date:"2026-07-21", startTime:"14:00", endTime:"16:00", type:"Finance",    priority:"High",   status:"Pending",    completedAt:null,               approvedBy:null,           approvedAt:null,               notes:"" },
  { id:"DTY-005", title:"Delivery run — Mwanza Rd", assignee:"Elias Rugambwa",dept:"Logistics",date:"2026-07-22", startTime:"07:00", endTime:"13:00", type:"Operations", priority:"Medium", status:"Pending",    completedAt:null,               approvedBy:null,           approvedAt:null,               notes:"" },
  { id:"DTY-006", title:"Weekly team briefing",     assignee:"ALL",           dept:"All",        date:"2026-07-22", startTime:"09:00", endTime:"09:30", type:"Meeting",    priority:"Low",    status:"Pending",    completedAt:null,               approvedBy:null,           approvedAt:null,               notes:"" },
  { id:"DTY-007", title:"Supplier quality review",  assignee:"Juma Batenga", dept:"Sales",      date:"2026-07-22", startTime:"11:00", endTime:"12:30", type:"Review",     priority:"High",   status:"Pending",    completedAt:null,               approvedBy:null,           approvedAt:null,               notes:"" },
  { id:"DTY-008", title:"Night security check",     assignee:"Hassan Omari",  dept:"Security",   date:"2026-07-21", startTime:"22:00", endTime:"23:59", type:"Security",   priority:"High",   status:"Completed",  completedAt:"2026-07-22 00:05", approvedBy:null,           approvedAt:null,               notes:"All clear" },
  { id:"DTY-009", title:"Server backup verification",assignee:"Tech Team",    dept:"IT",         date:"2026-07-23", startTime:"06:00", endTime:"07:00", type:"IT",         priority:"High",   status:"Pending",    completedAt:null,               approvedBy:null,           approvedAt:null,               notes:"" },
  { id:"DTY-010", title:"Customer complaint follow-up",assignee:"Sarah Kileo",dept:"Sales",     date:"2026-07-23", startTime:"14:00", endTime:"15:00", type:"Support",    priority:"High",   status:"Pending",    completedAt:null,               approvedBy:null,           approvedAt:null,               notes:"" },
];

const DUTY_TYPES = ["All Types","Operations","Meeting","Audit","Finance","Review","Security","IT","Support","Training","HR","Other"];
const DUTY_PRIORITIES = ["Low","Medium","High","Critical"];

const DUTY_STATUS_CFG = {
  "Pending":     { col:"#94A3B8", bg:"#F1F5F9", icon:"○",  label:"Pending" },
  "In Progress": { col:"#F59E0B", bg:"#FFFBEB", icon:"◑",  label:"In Progress" },
  "Completed":   { col:"#2563EB", bg:"#EFF6FF", icon:"●",  label:"Completed — awaiting approval" },
  "Approved":    { col:"#16A34A", bg:"#F0FDF4", icon:"✓",  label:"Approved" },
  "Rejected":    { col:"#EF4444", bg:"#FEF2F2", icon:"✗",  label:"Rejected" },
};
const PRIORITY_CFG = {
  Low:      { col:"#94A3B8", bg:"#F1F5F9" },
  Medium:   { col:"#F59E0B", bg:"#FFFBEB" },
  High:     { col:"#EF4444", bg:"#FEF2F2" },
  Critical: { col:"#7C3AED", bg:"#F5F3FF" },
};

// Higher-rank roles that can approve duties
const APPROVER_ROLES = new Set([
  "Super Administrator","Organization Owner","CEO","COO","CFO","CMO","CTO",
  "Finance Manager","HR Manager","Sales Manager","Procurement Officer","Warehouse Manager","Project Manager",
]);
function isApprover(user) {
  return user?.writeAccess === "full" || APPROVER_ROLES.has(user?.role);
}

function mapDutyRow(r) {
  return {
    id:r.id, dbId:r.id,
    title:r.title, assignee:r.assignee||"", dept:r.department||r.dept||"",
    date:r.date, startTime:r.start_time||r.startTime||"", endTime:r.end_time||r.endTime||"",
    type:r.duty_type||r.type||"Operations", priority:r.priority||"Medium", status:r.status||"Pending",
    completedAt:r.completed_at||r.completedAt||null,
    approvedBy:r.approved_by||r.approvedBy||null,
    approvedAt:r.approved_at||r.approvedAt||null,
    notes:r.notes||"",
  };
}

function WorkingTimetable({ employees, currentUser, canManage }) {
  const duties = useCompanyTable("hr_duties", dutiesSeed, { order:{ col:"date", ascending:true }, mapRow:mapDutyRow });
  const { rows, setRows, loading } = duties;

  // ── State ────────────────────────────────────────────────────────────
  const [view, setView]         = useState("timeline");  // timeline | week | roster
  const [weekOffset, setWeek]   = useState(0);
  const [deptFilter, setDept]   = useState("all");
  const [typeFilter, setType]   = useState("All Types");
  const [showForm, setShowForm] = useState(false);
  const [selectedDuty, setSel]  = useState(null);
  const [confirmApprove, setCfm]= useState(null);  // duty to approve/reject

  // ── Week navigation ──────────────────────────────────────────────────
  const weekStart = useMemo(() => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - d.getDay() + 1 + weekOffset * 7); // Monday
    return d;
  }, [weekOffset]);

  const weekDays = useMemo(() => Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().slice(0,10), label: d.toLocaleDateString("en",{weekday:"short"}), num: d.getDate(), isToday: d.toISOString().slice(0,10) === TODAY.toISOString().slice(0,10) };
  }), [weekStart]);

  const weekRange = `${weekDays[0].date} to ${weekDays[6].date}`;

  // ── Filtered duties ──────────────────────────────────────────────────
  const weekDuties = useMemo(() => {
    return rows.filter(d => d.date >= weekDays[0].date && d.date <= weekDays[6].date);
  }, [rows, weekDays]);

  const filtered = useMemo(() => {
    return weekDuties.filter(d =>
      (deptFilter === "all" || d.dept === deptFilter || d.assignee === "ALL") &&
      (typeFilter === "All Types" || d.type === typeFilter)
    );
  }, [weekDuties, deptFilter, typeFilter]);

  // ── Analytics ────────────────────────────────────────────────────────
  const analytics = useMemo(() => {
    const total     = weekDuties.length;
    const done      = weekDuties.filter(d=>["Completed","Approved"].includes(d.status)).length;
    const approved  = weekDuties.filter(d=>d.status==="Approved").length;
    const pending   = weekDuties.filter(d=>d.status==="Pending").length;
    const inProg    = weekDuties.filter(d=>d.status==="In Progress").length;
    const overdue   = weekDuties.filter(d=>d.status==="Pending"&&d.date<TODAY.toISOString().slice(0,10)).length;
    const pct       = total>0?Math.round(done/total*100):0;
    const appPct    = done>0?Math.round(approved/done*100):0;
    // Per-day completion
    const byDay     = weekDays.map(wd => {
      const dayDs   = weekDuties.filter(d=>d.date===wd.date);
      const dayDone = dayDs.filter(d=>["Completed","Approved"].includes(d.status)).length;
      return { ...wd, total:dayDs.length, done:dayDone, pct:dayDs.length>0?Math.round(dayDone/dayDs.length*100):0 };
    });
    // Conflicts: same assignee, same date, overlapping time
    const conflicts = [];
    for (let i=0;i<weekDuties.length;i++) {
      for (let j=i+1;j<weekDuties.length;j++) {
        const a=weekDuties[i], b=weekDuties[j];
        if (a.assignee===b.assignee&&a.assignee!=="ALL"&&a.date===b.date&&a.startTime&&b.startTime) {
          if (a.startTime<b.endTime && b.startTime<a.endTime) conflicts.push([a.id,b.id]);
        }
      }
    }
    return { total, done, approved, pending, inProg, overdue, pct, appPct, byDay, conflicts };
  }, [weekDuties, weekDays]);

  const conflictIds = new Set(analytics.conflicts.flat());

  // ── Departments ──────────────────────────────────────────────────────
  const depts = useMemo(() => {
    const s = new Set(rows.map(d=>d.dept).filter(Boolean));
    return ["all",...Array.from(s).sort()];
  }, [rows]);

  // ── CRUD ─────────────────────────────────────────────────────────────
  async function addDuty(form) {
    // Conflict check
    const conflict = rows.find(d =>
      d.assignee===form.assignee && d.date===form.date && d.assignee!=="ALL" &&
      d.startTime && form.startTime && d.startTime < form.endTime && form.startTime < d.endTime
    );
    if (conflict) {
      notify(`⚠ Schedule conflict — ${form.assignee} already has "${conflict.title}" at ${conflict.startTime}–${conflict.endTime} on ${form.date}`, "error");
      return;
    }
    const draft = {
      id:docId("DTY"), title:form.title, assignee:form.assignee, dept:form.dept||"",
      date:form.date, startTime:form.startTime, endTime:form.endTime,
      type:form.type||"Operations", priority:form.priority||"Medium",
      status:"Pending", completedAt:null, approvedBy:null, approvedAt:null, notes:form.notes||"",
    };
    setRows(p=>[...p, draft]);
    setShowForm(false);
    notify(`Duty assigned: "${draft.title}" → ${draft.assignee}`);
    logAudit("Duty assigned","Timetable",currentUser.name,`${draft.title} to ${draft.assignee} on ${draft.date}`);
    if (IS_CONFIGURED) {
      try {
        await sb("hr_duties").insert({
          title:draft.title, assignee:draft.assignee, department:draft.dept, date:draft.date,
          start_time:draft.startTime, end_time:draft.endTime, duty_type:draft.type,
          priority:draft.priority, status:"Pending", notes:draft.notes,
        }).run();
      } catch(_e) { notify("Duty saved locally, server sync failed.","error"); }
    }
  }

  async function markComplete(duty) {
    const now = new Date().toISOString().slice(0,16).replace("T"," ");
    setRows(p=>p.map(d=>d.id===duty.id?{...d,status:"Completed",completedAt:now}:d));
    setSel(s=>s?.id===duty.id?{...s,status:"Completed",completedAt:now}:s);
    notify(`✓ "${duty.title}" marked complete — awaiting manager approval`);
    logAudit("Duty completed","Timetable",currentUser.name,duty.title);
    if (IS_CONFIGURED && duty.dbId) {
      try { await sb("hr_duties").eq("id",duty.dbId).update({status:"Completed",completed_at:now}).run(); } catch(_e){}
    }
  }

  async function approveDuty(duty, approve) {
    if (!canManage && !isApprover(currentUser)) {
      notify("Only managers and higher-ranked staff can approve duties.","error"); return;
    }
    // Biometric gate (same pattern as Approvals)
    const method = await signWithBiometric(currentUser.name);
    if (approve && method === null) { notify("Signature cancelled — duty not approved.","error"); return; }

    const next      = approve ? "Approved" : "Rejected";
    const approvedBy= approve ? `${currentUser.name} (${currentUser.role})` : null;
    const approvedAt= approve ? new Date().toISOString().slice(0,16).replace("T"," ") : null;
    setRows(p=>p.map(d=>d.id===duty.id?{...d,status:next,approvedBy,approvedAt}:d));
    setSel(s=>s?.id===duty.id?{...s,status:next,approvedBy,approvedAt}:s);
    setCfm(null);
    notify(approve
      ? `✓ "${duty.title}" approved by ${currentUser.name} · ${method==="biometric"?"🔒 digitally signed":"recorded"}`
      : `✗ "${duty.title}" rejected`
    );
    logAudit(next==="Approved"?"Duty approved":"Duty rejected","Timetable",currentUser.name,`${duty.title} by ${duty.assignee}`);
    if (IS_CONFIGURED && duty.dbId) {
      try { await sb("hr_duties").eq("id",duty.dbId).update({status:next,approved_by:approvedBy,approved_at:approvedAt}).run(); } catch(_e){}
    }
  }

  // ── Print weekly schedule PDF ─────────────────────────────────────────
  function printWeekSchedule() {
    const ACCENT = "#16A34A";
    const DARK   = "#0D2214";
    const co     = window.__smartManagerCompany || {};

    const dayBlocks = weekDays.map(wd => {
      const dayDs = filtered.filter(d=>d.date===wd.date).sort((a,b)=>a.startTime.localeCompare(b.startTime));
      const rows  = dayDs.map(d => {
        const sc  = DUTY_STATUS_CFG[d.status]||DUTY_STATUS_CFG["Pending"];
        const pc  = PRIORITY_CFG[d.priority]||PRIORITY_CFG["Medium"];
        return `<tr style="background:${d.date===TODAY.toISOString().slice(0,10)?"#FFFBEB":"white"}">
          <td style="padding:6px 10px;font-size:11px;font-family:monospace;color:#6B7280">${d.startTime}–${d.endTime}</td>
          <td style="padding:6px 10px;font-size:12px;font-weight:600;color:#111827">${d.title}</td>
          <td style="padding:6px 10px;font-size:11px;color:#374151">${d.assignee}</td>
          <td style="padding:6px 10px;font-size:11px;color:#6B7280">${d.type}</td>
          <td style="padding:6px 10px"><span style="background:${pc.bg};color:${pc.col};padding:2px 7px;border-radius:12px;font-size:10px;font-weight:700">${d.priority}</span></td>
          <td style="padding:6px 10px"><span style="background:${sc.bg};color:${sc.col};padding:2px 7px;border-radius:12px;font-size:10px;font-weight:700">${sc.icon} ${d.status}</span></td>
          ${d.approvedBy?`<td style="padding:6px 10px;font-size:10px;color:#16A34A">✓ ${d.approvedBy.split("(")[0].trim()}</td>`:"<td></td>"}
        </tr>`;
      }).join("");
      return `<div style="margin-bottom:20px;page-break-inside:avoid">
        <div style="background:${DARK};color:white;padding:8px 14px;border-radius:8px 8px 0 0;display:flex;justify-content:space-between;align-items:center">
          <div style="font-weight:800;font-size:13px">${wd.label} ${wd.num} ${d===TODAY.toISOString().slice(0,10)?"· Today":""}</div>
          <div style="font-size:11px;opacity:.6">${dayDs.length} dut${dayDs.length!==1?"ies":"y"}</div>
        </div>
        ${dayDs.length===0?`<div style="padding:12px 14px;font-size:11px;color:#9CA3AF;background:#F8FAFB;border-radius:0 0 8px 8px">No duties scheduled</div>`:
        `<table style="width:100%;border-collapse:collapse;border-radius:0 0 8px 8px;overflow:hidden">
          <thead><tr style="background:#F3F4F6">
            <th style="padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF">Time</th>
            <th style="padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF">Duty</th>
            <th style="padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF">Assignee</th>
            <th style="padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF">Type</th>
            <th style="padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF">Priority</th>
            <th style="padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF">Status</th>
            <th style="padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9CA3AF">Approved By</th>
          </tr>${rows}</table>`}
      </div>`;
    }).join("");

    const win = window.open("","_blank","width=1050,height=1200");
    if (!win) { notify("Pop-up blocked","error"); return; }
    win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
      <title>Weekly Timetable ${weekRange}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Inter,Arial,sans-serif;background:#F3F4F6;padding:24px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @media print{body{background:white;padding:0}.toolbar{display:none!important}}
        .header{background:${DARK};border-radius:12px;padding:22px 28px;display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px}
        .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .sum-box{background:white;border-radius:10px;padding:14px;text-align:center;box-shadow:0 1px 8px rgba(0,0,0,.07)}
        .sum-label{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-bottom:4px}
        .sum-val{font-size:22px;font-weight:800;color:#111827}
        .toolbar{position:fixed;bottom:24px;right:24px;display:flex;gap:8px}
        .btn{padding:10px 20px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;border:none;font-family:Inter}
        .btn-p{background:${ACCENT};color:white}.btn-c{background:white;color:#111827;border:1.5px solid #E5E7EB}
      </style></head><body>
      <div class="header">
        <div>
          <div style="font-size:20px;font-weight:900;color:white">${co.name||"BusinessSphere"} — Working Timetable</div>
          <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">Week: ${weekRange} · Generated ${new Date().toLocaleDateString()}</div>
          ${deptFilter!=="all"?`<div style="font-size:11px;color:rgba(255,255,255,.4);margin-top:2px">Department: ${deptFilter}</div>`:""}
        </div>
        <div style="text-align:right">
          <div style="font-size:32px;font-weight:900;color:${ACCENT}">${analytics.pct}%</div>
          <div style="font-size:10px;color:rgba(255,255,255,.4)">Completion rate</div>
        </div>
      </div>
      <div class="summary">
        <div class="sum-box"><div class="sum-label">Total Duties</div><div class="sum-val">${analytics.total}</div></div>
        <div class="sum-box"><div class="sum-label">Completed</div><div class="sum-val" style="color:#2563EB">${analytics.done}</div></div>
        <div class="sum-box"><div class="sum-label">Approved</div><div class="sum-val" style="color:#16A34A">${analytics.approved}</div></div>
        <div class="sum-box"><div class="sum-label">Pending</div><div class="sum-val" style="color:#F59E0B">${analytics.pending}</div></div>
      </div>
      ${dayBlocks}
      <div class="toolbar">
        <button class="btn btn-c" onclick="window.close()">Close</button>
        <button class="btn btn-p" onclick="window.print()">Print / Save PDF</button>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(()=>win.focus(),200);
    notify("Weekly schedule ready to print");
  }

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[19px] font-bold text-[#111827] tracking-tight">Working Timetable</h2>
          <p className="text-[12.5px] text-slate-500 mt-0.5">Assign duties · Track progress · Manager sign-off</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {[["timeline","⏱ Timeline"],["week","📅 Week Grid"],["roster","👥 Roster"]].map(([v,l])=>(
              <button key={v} onClick={()=>setView(v)}
                className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${view===v?"bg-white text-[#111827] shadow-sm":"text-slate-500"}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowForm(true)}
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-white px-3.5 py-2 rounded-xl bg-[#16A34A]">
            <Plus size={13}/> Assign Duty
          </button>
          <button onClick={printWeekSchedule}
            className="flex items-center gap-1.5 text-[12px] font-bold text-slate-600 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50">
            <Printer size={13}/> Export PDF
          </button>
        </div>
      </div>

      {/* Week navigator */}
      <div className="flex items-center gap-3">
        <button onClick={()=>setWeek(w=>w-1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
          <ChevronLeft size={15}/>
        </button>
        <div className="flex-1 text-center">
          <span className="text-[13px] font-semibold text-[#111827]">
            Week of {new Date(weekStart).toLocaleDateString("en",{month:"long",day:"numeric"})}–{weekDays[6].num}, {weekStart.getFullYear()}
          </span>
          {weekOffset===0&&<span className="ml-2 text-[11px] text-[#16A34A] font-bold">Current Week</span>}
        </div>
        <button onClick={()=>setWeek(w=>w+1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50">
          <ChevronRight size={15}/>
        </button>
        {weekOffset!==0&&<button onClick={()=>setWeek(0)} className="text-[11.5px] font-bold text-[#16A34A] border border-[#16A34A]/30 px-2.5 py-1.5 rounded-lg">Today</button>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select className="text-[12px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 font-medium"
          value={deptFilter} onChange={e=>setDept(e.target.value)}>
          {depts.map(d=><option key={d} value={d}>{d==="all"?"All Departments":d}</option>)}
        </select>
        <select className="text-[12px] border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-600 font-medium"
          value={typeFilter} onChange={e=>setType(e.target.value)}>
          {DUTY_TYPES.map(t=><option key={t}>{t}</option>)}
        </select>
        {(deptFilter!=="all"||typeFilter!=="All Types")&&(
          <button onClick={()=>{setDept("all");setType("All Types");}} className="text-[11.5px] text-[#EF4444] font-semibold">✕ Clear</button>
        )}
      </div>

      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          ["Total Duties",  analytics.total,    "#2563EB"],
          ["In Progress",   analytics.inProg,   "#F59E0B"],
          ["Completed",     analytics.done,     "#2563EB"],
          ["Approved ✓",    analytics.approved, "#16A34A"],
          ["Overdue ⚠",    analytics.overdue,  analytics.overdue>0?"#EF4444":"#16A34A"],
        ].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-3 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[20px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Weekly progress rings */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Daily Completion</p>
        <div className="flex gap-2 justify-between">
          {analytics.byDay.map(wd => {
            const fill = wd.total===0?"#E5E7EB":wd.pct===100?"#16A34A":wd.pct>=50?"#F59E0B":"#EF4444";
            const circum = 2*Math.PI*20; // r=20
            return (
              <div key={wd.date} className={`flex flex-col items-center gap-1 flex-1 px-1 py-2 rounded-xl transition-all ${wd.isToday?"bg-[#F0FDF4] border border-[#16A34A]/20":""}`}>
                <div className="relative w-12 h-12">
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#E5E7EB" strokeWidth="4"/>
                    <circle cx="24" cy="24" r="20" fill="none" stroke={fill} strokeWidth="4"
                      strokeDasharray={`${(wd.pct/100)*circum} ${circum}`}
                      strokeLinecap="round" transform="rotate(-90 24 24)"/>
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{color:fill}}>
                    {wd.total===0?"—":wd.pct+"%"}
                  </span>
                </div>
                <span className={`text-[10.5px] font-bold ${wd.isToday?"text-[#16A34A]":"text-slate-500"}`}>{wd.label}</span>
                <span className="text-[9.5px] text-slate-400">{wd.done}/{wd.total}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conflict alert */}
      {analytics.conflicts.length > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5 flex items-start gap-2.5">
          <AlertCircle size={15} className="text-[#EF4444] shrink-0 mt-0.5"/>
          <div>
            <p className="text-[13px] font-bold text-[#991B1B]">⚠ {analytics.conflicts.length} scheduling conflict{analytics.conflicts.length>1?"s":""} detected</p>
            <p className="text-[11.5px] text-[#B91C1C] mt-0.5">Same assignee is scheduled for overlapping duties. Review and reassign.</p>
          </div>
        </div>
      )}

      {/* ── TIMELINE VIEW ── */}
      {view === "timeline" && (
        <div className="space-y-3">
          {weekDays.map(wd => {
            const dayDs = filtered.filter(d=>d.date===wd.date).sort((a,b)=>a.startTime.localeCompare(b.startTime));
            return (
              <div key={wd.date}>
                <div className={`flex items-center gap-3 mb-2 ${wd.isToday?"":"opacity-80"}`}>
                  <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center text-white shrink-0 ${wd.isToday?"bg-[#16A34A]":"bg-[#374151]"}`}>
                    <span className="text-[9px] font-semibold uppercase">{wd.label}</span>
                    <span className="text-[16px] font-black leading-none">{wd.num}</span>
                  </div>
                  <div className="flex-1 h-px bg-slate-200"/>
                  {dayDs.length>0&&<span className="text-[11px] text-slate-400 shrink-0">{dayDs.filter(d=>["Completed","Approved"].includes(d.status)).length}/{dayDs.length} done</span>}
                </div>
                {dayDs.length===0?(
                  <div className="ml-13 pl-4 border-l-2 border-dashed border-slate-200 pb-2 ml-5">
                    <p className="text-[12px] text-slate-300 py-2">No duties scheduled</p>
                  </div>
                ):(
                  <div className="ml-5 pl-4 border-l-2 border-slate-200 space-y-2 pb-2">
                    {dayDs.map(duty => {
                      const sc = DUTY_STATUS_CFG[duty.status]||DUTY_STATUS_CFG["Pending"];
                      const pc = PRIORITY_CFG[duty.priority]||PRIORITY_CFG["Medium"];
                      const isConflict = conflictIds.has(duty.id);
                      const canComplete = duty.status==="Pending"||duty.status==="In Progress";
                      const canApprove  = duty.status==="Completed" && (canManage||isApprover(currentUser));
                      const isExpanded  = selectedDuty?.id === duty.id;

                      return (
                        <div key={duty.id}
                          className={`bg-white rounded-xl border-l-4 shadow-sm transition-all ${isConflict?"border-l-[#EF4444] ring-1 ring-[#EF4444]/20":""}`}
                          style={{borderLeftColor: isConflict?"#EF4444":sc.col}}>
                          <div className="p-3 cursor-pointer" onClick={()=>setSel(isExpanded?null:duty)}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                {/* Status icon — clickable for completion */}
                                <button
                                  onClick={e=>{e.stopPropagation();if(canComplete)markComplete(duty);else if(canApprove)setCfm(duty);}}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border-2 transition-all mt-0.5"
                                  style={{borderColor:sc.col, background:sc.bg, color:sc.col}}
                                  title={canComplete?"Mark as complete":canApprove?"Approve this duty":sc.label}>
                                  <span className="text-[14px] font-black">{sc.icon}</span>
                                </button>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-[13px] font-bold text-[#111827] leading-tight ${duty.status==="Approved"?"line-through opacity-60":""}`}>
                                    {duty.title}
                                    {isConflict&&<span className="ml-1.5 text-[10px] text-[#EF4444] font-black">⚠ CONFLICT</span>}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="text-[11px] font-mono text-slate-400">{duty.startTime}–{duty.endTime}</span>
                                    <span className="text-[10.5px] text-slate-500 font-medium">👤 {duty.assignee}</span>
                                    <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded" style={{background:pc.bg,color:pc.col}}>{duty.priority}</span>
                                    <span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded" style={{background:sc.bg,color:sc.col}}>{duty.type}</span>
                                  </div>
                                  {duty.status==="Approved"&&duty.approvedBy&&(
                                    <p className="text-[10.5px] text-[#16A34A] mt-1">✓ Approved by {duty.approvedBy} at {duty.approvedAt}</p>
                                  )}
                                  {duty.status==="Completed"&&!duty.approvedBy&&(
                                    <p className="text-[10.5px] text-[#2563EB] mt-1">⏳ Completed {duty.completedAt} · Awaiting manager approval</p>
                                  )}
                                </div>
                              </div>
                              {/* Quick actions */}
                              <div className="flex gap-1.5 items-start shrink-0" onClick={e=>e.stopPropagation()}>
                                {canComplete&&(
                                  <button onClick={()=>markComplete(duty)}
                                    className="text-[11px] font-bold text-white bg-[#2563EB] px-2.5 py-1.5 rounded-lg">
                                    ✓ Done
                                  </button>
                                )}
                                {canApprove&&(
                                  <button onClick={()=>setCfm(duty)}
                                    className="text-[11px] font-bold text-white bg-[#16A34A] px-2.5 py-1.5 rounded-lg animate-pulse">
                                    ✓ Approve
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {isExpanded&&(
                            <div className="border-t border-slate-100 px-3 py-3 space-y-2">
                              {duty.notes&&<p className="text-[12px] text-slate-600">📝 {duty.notes}</p>}
                              {/* Biometric verification panel */}
                              {(duty.completionVerified||duty.completionMethod)&&(
                                <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${duty.completionVerified?"bg-[#F0FDF4] border-[#BBF7D0]":"bg-slate-50 border-slate-200"}`}>
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[16px] shrink-0 ${duty.completionVerified?"bg-[#16A34A]/10":"bg-slate-200"}`}>
                                    {duty.completionVerified?"🔒":"📝"}
                                  </div>
                                  <div>
                                    <p className={`text-[12px] font-bold ${duty.completionVerified?"text-[#15803D]":"text-slate-500"}`}>
                                      {duty.completionVerified?"Biometrically Verified Completion":"Manual Completion (unverified)"}
                                    </p>
                                    <p className="text-[10.5px] text-slate-400">
                                      {duty.completionVerified
                                        ?"Employee used WebAuthn biometric (fingerprint/Face ID) to sign duty completion"
                                        :"No biometric signature recorded — employee signed in manually"}
                                    </p>
                                    {duty.completionMethod&&<p className="text-[10px] font-mono text-slate-300 mt-0.5">sig_method: {duty.completionMethod}</p>}
                                  </div>
                                </div>
                              )}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                 <div><span className="text-slate-400">Dept:</span> <strong>{duty.dept||"—"}</strong></div>
                                 <div><span className="text-slate-400">ID:</span> <strong className="font-mono">{duty.id}</strong></div>
                                 {duty.completedAt&&<div><span className="text-slate-400">Completed:</span> <strong>{duty.completedAt}</strong></div>}
                                 {duty.approvedAt&&<div><span className="text-slate-400">Approved:</span> <strong>{duty.approvedAt}</strong></div>}
                               </div>
                              {/* Duty status flow */}
                              <div className="flex items-center gap-1.5 mt-2">
                                {["Pending","In Progress","Completed","Approved"].map((s,i,arr)=>{
                                  const isCurrent = duty.status===s;
                                  const isDone    = ["Completed","Approved"].includes(duty.status)&&(s==="Pending"||s==="In Progress"||s==="Completed"&&duty.status==="Approved");
                                  const sc2       = DUTY_STATUS_CFG[s];
                                  return (
                                    <React.Fragment key={s}>
                                      <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold transition-all ${isCurrent?"text-white":"opacity-40"}`}
                                        style={{background:isCurrent?sc2.col:"#F1F5F9",color:isCurrent?undefined:sc2.col}}>
                                        {sc2.icon} {s}
                                      </div>
                                      {i<arr.length-1&&<div className="w-4 h-px bg-slate-200"/>}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── WEEK GRID VIEW ── */}
      {view === "week" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-[12px]">
              <thead>
                <tr className="bg-[#0D2214]">
                  <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-[rgba(255,255,255,.5)] w-28">Time / Staff</th>
                  {weekDays.map(wd=>(
                    <th key={wd.date} className={`px-2 py-3 text-center font-bold text-[11px] ${wd.isToday?"text-[#16A34A]":"text-[rgba(255,255,255,.7)]"}`}>
                      <div>{wd.label}</div>
                      <div className={`w-6 h-6 rounded-full mx-auto mt-1 flex items-center justify-center text-[12px] font-black ${wd.isToday?"bg-[#16A34A] text-white":"text-[rgba(255,255,255,.6)]"}`}>{wd.num}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(()=>{
                  const assignees = [...new Set(filtered.map(d=>d.assignee))].sort();
                  return assignees.map((person,pi)=>(
                    <tr key={person} className={pi%2===0?"bg-white":"bg-slate-50/50"}>
                      <td className="px-3 py-2.5 font-semibold text-[#111827] border-r border-slate-100 truncate max-w-[110px]">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {person.charAt(0)}
                          </div>
                          <span className="truncate">{person}</span>
                        </div>
                      </td>
                      {weekDays.map(wd=>{
                        const cell = filtered.filter(d=>d.date===wd.date&&(d.assignee===person||d.assignee==="ALL"));
                        return (
                          <td key={wd.date} className={`px-1.5 py-2 align-top min-w-[90px] ${wd.isToday?"bg-[#F0FDF4]/30":""}`}>
                            {cell.length===0?<div className="h-8"/>:cell.map(duty=>{
                              const sc=DUTY_STATUS_CFG[duty.status]||DUTY_STATUS_CFG["Pending"];
                              return (
                                <div key={duty.id} onClick={()=>{setView("timeline");setSel(duty);}}
                                  className="rounded-lg px-2 py-1.5 mb-1 cursor-pointer hover:opacity-80 transition-all border-l-2 relative"
                                  style={{background:sc.bg,borderLeftColor:sc.col}}
                                  title={`${duty.title} ${duty.startTime}–${duty.endTime}`}>
                                  <div className="text-[10.5px] font-bold truncate" style={{color:sc.col}}>{sc.icon} {duty.title}</div>
                                  <div className="text-[9.5px] font-mono text-slate-400">{duty.startTime}</div>
                                  {conflictIds.has(duty.id)&&<div className="absolute top-0.5 right-0.5 w-3 h-3 bg-[#EF4444] rounded-full text-white text-[8px] flex items-center justify-center">!</div>}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ROSTER VIEW ── */}
      {view === "roster" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-[13.5px] font-bold text-[#111827]">All Duties — {filtered.length} for this week</p>
          </div>
          {filtered.length===0?(
            <div className="py-12 text-center text-slate-400">No duties for this week</div>
          ):(
            <table className="w-full text-[12px]">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Status","Duty","Assignee","Dept","Date","Time","Type","Priority","Approved By"].map(h=>(
                  <th key={h} className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime)).map(duty=>{
                  const sc=DUTY_STATUS_CFG[duty.status]||DUTY_STATUS_CFG["Pending"];
                  const pc=PRIORITY_CFG[duty.priority]||PRIORITY_CFG["Medium"];
                  const isConflict=conflictIds.has(duty.id);
                  return (
                    <tr key={duty.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer ${isConflict?"bg-red-50/40":""}`}
                      onClick={()=>{setView("timeline");setSel(duty);}}>
                      <td className="px-3 py-3">
                        <span className="text-[13px]" style={{color:sc.col}}>{sc.icon}</span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-[#111827]">
                        {duty.title}{isConflict&&<span className="ml-1 text-[10px] text-[#EF4444]">⚠</span>}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{duty.assignee}</td>
                      <td className="px-3 py-3 text-slate-500">{duty.dept||"—"}</td>
                      <td className="px-3 py-3 font-mono text-slate-500 text-[11.5px]">{duty.date}</td>
                      <td className="px-3 py-3 font-mono text-slate-500 text-[11.5px]">{duty.startTime}–{duty.endTime}</td>
                      <td className="px-3 py-3 text-slate-500">{duty.type}</td>
                      <td className="px-3 py-3"><span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{background:pc.bg,color:pc.col}}>{duty.priority}</span></td>
                      <td className="px-3 py-3 text-[11px] text-[#16A34A]">{duty.approvedBy?`✓ ${duty.approvedBy.split("(")[0].trim()}`:"—"}</td>
                      <td className="px-3 py-3">
                        {duty.completionVerified
                          ? <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-full whitespace-nowrap">
                              <Fingerprint size={9}/>🔒 Biometric
                            </span>
                          : duty.completedAt
                            ? <span className="text-[10px] text-[#94A3B8] font-medium">📝 Manual</span>
                            : <span className="text-[10px] text-slate-200">—</span>
                        }
                      </td>
                    </tr>
    
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Manager approval dialog ── */}
      {confirmApprove && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm" onClick={()=>setCfm(null)}/>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] flex items-center justify-center text-[28px] mx-auto mb-4">✓</div>
            <h3 className="text-[16px] font-bold text-[#111827] text-center mb-1">Approve Duty?</h3>
            <p className="text-[12.5px] text-slate-500 text-center mb-1">{confirmApprove.title}</p>
            <p className="text-[11.5px] text-slate-400 text-center mb-5">Completed by <strong>{confirmApprove.assignee}</strong> at {confirmApprove.completedAt}</p>
            <p className="text-[11.5px] text-slate-500 text-center mb-4">Your biometric signature or PIN will be requested to confirm approval.</p>
            <div className="flex gap-3">
              <button onClick={()=>approveDuty(confirmApprove,false)}
                className="flex-1 py-2.5 rounded-xl border border-[#EF4444]/30 text-[#EF4444] text-[12.5px] font-bold hover:bg-[#FEF2F2]">
                ✗ Reject
              </button>
              <button onClick={()=>approveDuty(confirmApprove,true)}
                className="flex-1 py-2.5 rounded-xl bg-[#16A34A] text-white text-[12.5px] font-bold hover:bg-[#15803D]">
                ✓ Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New duty form ── */}
      {showForm && (
        <DutyFormPanel employees={employees} onClose={()=>setShowForm(false)} onSubmit={addDuty}/>
      )}
    </div>
  );
}

function DutyFormPanel({ employees, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title:"", assignee: employees.filter(e=>e.status==="Active")[0]?.name||"ALL",
    dept:"", date:TODAY.toISOString().slice(0,10),
    startTime:"09:00", endTime:"10:00",
    type:"Operations", priority:"Medium", notes:"",
  });
  function set(k,v) { setForm(f=>({...f,[k]:v})); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose}/>
      <div className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{animation:"slideIn .15s ease-out"}}>
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Timetable</p>
            <h2 className="text-[18px] font-bold text-[#111827] mt-0.5">Assign Duty</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18}/></button>
        </div>

        <div className="px-6 py-5 flex-1 space-y-4 overflow-y-auto">
          <div>
            <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Duty / Task Title *</label>
            <input className={inputClass} value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Morning stock count"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Assign To *</label>
              <select className={inputClass} value={form.assignee} onChange={e=>set("assignee",e.target.value)}>
                <option value="ALL">ALL STAFF</option>
                {employees.filter(e=>e.status==="Active").map(e=><option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Department</label>
              <input className={inputClass} value={form.dept} onChange={e=>set("dept",e.target.value)} placeholder="e.g. Sales"/>
            </div>
          </div>
          <div>
            <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Date *</label>
            <input type="date" className={inputClass} value={form.date} onChange={e=>set("date",e.target.value)}/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Start Time</label>
              <input type="time" className={inputClass} value={form.startTime} onChange={e=>set("startTime",e.target.value)}/>
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">End Time</label>
              <input type="time" className={inputClass} value={form.endTime} onChange={e=>set("endTime",e.target.value)}/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Duty Type</label>
              <select className={inputClass} value={form.type} onChange={e=>set("type",e.target.value)}>
                {DUTY_TYPES.slice(1).map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Priority</label>
              <select className={inputClass} value={form.priority} onChange={e=>set("priority",e.target.value)}>
                {DUTY_PRIORITIES.map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Notes</label>
            <textarea className={inputClass+" w-full resize-none"} rows={3} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Additional instructions or context…"/>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-[12.5px] font-medium border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50">Cancel</button>
          <button
            onClick={()=>{ if(!form.title.trim()||!form.date) { notify("Title and date are required","error"); return; } onSubmit(form); }}
            className="flex-1 py-2.5 text-[12.5px] font-bold text-white rounded-xl bg-[#16A34A] hover:bg-[#15803D]">
            Assign Duty
          </button>
        </div>
      </div>
    </div>
  );
}

export default DutyFormPanel;
