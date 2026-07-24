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


function AIAssistant({ company, invoices, inventory, crm, expenses, employees, leaveRequests, suppliers, quotations, scheduledWorkflows }) {
  const [personaId, setPersonaId] = useState(null);
  const persona = AI_PERSONAS.find((p) => p.id === personaId);
  const data = { company, invoices, inventory, crm, expenses, employees, leaveRequests, suppliers, quotations, scheduledWorkflows };

  if (!persona) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Smart Manager AI</h1>
          <p className="text-[13px] text-slate-500 mt-1">One assistant, twelve roles — each grounded in the live data relevant to it</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AI_PERSONAS.map((p) => {
            const Icon = p.icon;
            return (
              <button
                key={p.id}
                onClick={() => setPersonaId(p.id)}
                className="text-left bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 hover:border-[#16A34A]/50 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ background: `linear-gradient(135deg, ${p.color}, #111827)` }}>
                  <Icon size={18} className="text-white" />
                </div>
                <p className="text-[14px] font-semibold text-[#111827] mb-1">{p.name}</p>
                <p className="text-[12px] text-slate-500 leading-relaxed">{p.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[75vh] max-w-3xl mx-auto">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${persona.color}, #111827)` }}>
            <persona.icon size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-[18px] sm:text-[20px] font-semibold text-[#111827] tracking-tight">{persona.name}</h1>
            <p className="text-[12.5px] text-slate-500">{persona.tagline}</p>
          </div>
        </div>
        <button onClick={() => setPersonaId(null)} className="btn-secondary text-[12px] font-medium rounded-lg px-3 py-1.5 shrink-0">
          Switch Assistant
        </button>
      </div>

      {persona.disclaimer && (
        <div className="flex items-start gap-2.5 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-3 mb-4">
          <AlertCircle size={15} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#8a670a] leading-relaxed">{persona.disclaimer}</p>
        </div>
      )}

      {persona.mode === "docgen" && <DocumentGenerator company={company} />}
      {persona.mode === "meeting" && <AIMeetingAssistant company={company} />}
      {persona.mode !== "docgen" && persona.mode !== "meeting" && <ChatInterface persona={persona} data={data} />}
    </div>
  );
}

/* -------------------------------- AI CHAT ENGINE -------------------------------- */

// The one real chat engine every conversational persona shares. Scoped
// per-call by `persona`: which data it sees, which tools it may use, how
// it introduces itself. Nothing here is persona-specific logic — that all
// lives in the AI_PERSONAS config above.
function ChatInterface({ persona, data }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const speechSupported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const tools = AI_TOOLS_ALL.filter((t) => persona.tools.includes(t.name));

  async function executeTool(name, toolInput) {
    try {
      if (name === "create_lead") {
        const draft = {
          id: docId("L"), name: toolInput.contact_name, company: toolInput.company_name,
          stage: "New", value: Number(toolInput.value_tzs_k) || 0, currency: "TZS000", owner: `AI ${persona.name}`,
          email: toolInput.email || "", phone: toolInput.phone || "", industry: toolInput.industry || "General",
          lastActivity: "Just now", score: 50,
        };
        data.crm.setRows((prev) => [draft, ...prev]);
        notify(`Lead created: ${draft.company}`);
        if (IS_CONFIGURED) {
          try {
            const header = await sb("crm_leads").insert({
              contact_name: draft.name, company_name: draft.company, stage: "New",
              value_amount: draft.value, email: draft.email, phone: draft.phone, industry: draft.industry,
            }).single().run();
            if (header?.id) data.crm.setRows((prev) => prev.map((l) => (l.id === draft.id ? { ...l, dbId: header.id } : l)));
          } catch (_e) { notify("Lead created locally, but saving to the server failed.", "error"); }
        }
        return `Success: created lead ${draft.id} for ${draft.company} at the New stage with value TZS ${draft.value}k.`;
      }

      if (name === "adjust_stock") {
        const item = data.inventory.rows.find((it) => it.sku === toolInput.sku);
        if (!item) return `Error: no inventory item with SKU ${toolInput.sku}. Check the snapshot for valid SKUs.`;
        const delta = Number(toolInput.delta) || 0;
        const newQty = Math.max(0, item.qty + delta);
        data.inventory.setRows((prev) => prev.map((it) => (it.sku === item.sku ? { ...it, qty: newQty } : it)));
        notify(`Stock adjusted: ${item.name} ${delta > 0 ? "+" : ""}${delta}`);
        logAudit("Stock adjusted via AI Assistant", "Inventory", `AI ${persona.name}`, `${item.name} (${item.sku}) ${delta > 0 ? "+" : ""}${delta} → ${newQty} ${item.unit}`);
        if (IS_CONFIGURED) {
          try {
            await sb("inventory_items").eq("sku", item.sku).update({ qty_on_hand: newQty }).run();
            await sb("inventory_stock_movements").insert({
              item_id: item.sku, movement: delta > 0 ? "In" : "Out", qty: Math.abs(delta),
              reference: toolInput.reason || `AI ${persona.name} adjustment`,
            }).run();
          } catch (_e) { notify("Adjustment saved locally, but the server update failed.", "error"); }
        }
        return `Success: ${item.name} (${item.sku}) adjusted by ${delta}; new on-hand quantity is ${newQty} ${item.unit}.`;
      }

      if (name === "mark_invoice_paid") {
        const inv = data.invoices.rows.find((i) => i.id === toolInput.invoice_id);
        if (!inv) return `Error: no invoice with ID ${toolInput.invoice_id}. Check the snapshot for valid invoice IDs.`;
        if (inv.status === "Paid") return `No change: ${inv.id} is already fully paid.`;
        const total = lineTotal(inv.items).total;
        data.invoices.setRows((prev) => prev.map((i) => (i.id === inv.id ? { ...i, status: "Paid", amountPaid: total } : i)));
        notify(`${inv.id} marked as paid`);
        if (IS_CONFIGURED && inv.dbId) {
          try { await sb("sales_invoices").eq("id", inv.dbId).update({ status: "Paid", amount_paid: total }).run(); } catch (_e) { notify("Payment saved locally, but the server update failed.", "error"); }
        }
        return `Success: ${inv.id} for ${inv.customer} marked as Paid; TZS ${money(total)}k settled.`;
      }

      if (name === "record_expense") {
        const draft = {
          id: docId("EX"), vendor: toolInput.vendor, category: toolInput.category || "Supplies",
          date: TODAY.toISOString().slice(0, 10), dueDate: TODAY.toISOString().slice(0, 10),
          amount: Number(toolInput.amount_tzs_k) || 0, status: "Paid", method: toolInput.method || "Cash",
        };
        data.expenses.setRows((prev) => [draft, ...prev]);
        notify(`Expense recorded: ${draft.vendor}`);
        if (IS_CONFIGURED) {
          try {
            const header = await sb("finance_expenses").insert({
              vendor: draft.vendor, category: draft.category, expense_date: draft.date, due_date: draft.dueDate,
              amount: draft.amount, status: "Paid", method: draft.method,
            }).single().run();
            if (header?.id) data.expenses.setRows((prev) => prev.map((e) => (e.id === draft.id ? { ...e, dbId: header.id } : e)));
          } catch (_e) { notify("Expense recorded locally, but saving to the server failed.", "error"); }
        }
        return `Success: recorded TZS ${draft.amount}k expense to ${draft.vendor} (${draft.category}), marked Paid via ${draft.method}.`;
      }

      if (name === "approve_leave") {
        const candidates = data.leaveRequests.rows.filter((l) => l.employee === toolInput.employee && l.status === "Pending" && (!toolInput.type || l.type === toolInput.type));
        if (candidates.length === 0) return "Error: no pending leave request found for " + toolInput.employee + (toolInput.type ? " (" + toolInput.type + ")" : "") + ". Check the snapshot.";
        const target = candidates[0];
        data.leaveRequests.setRows((prev) => prev.map((l) => (l.id === target.id ? { ...l, status: "Approved" } : l)));
        notify(`Leave approved for ${target.employee}`);
        logAudit("Leave approved via AI Assistant", "HR", `AI ${persona.name}`, `${target.employee} — ${target.type}, ${target.startDate} to ${target.endDate}`);
        if (IS_CONFIGURED && target.dbId) {
          try { await sb("hr_leave_requests").eq("id", target.dbId).update({ status: "Approved" }).run(); } catch (_e) { notify("Approved locally, but the server update failed.", "error"); }
        }
        return `Success: approved ${target.type} leave for ${target.employee}, ${target.startDate} to ${target.endDate}.`;
      }

      if (name === "create_invoice" || name === "create_quotation") {
        const isInvoice = name === "create_invoice";
        const lineItems = (toolInput.items || []).map((li) => {
          const invItem = data.inventory.rows.find((it) => it.sku === li.sku);
          if (!invItem) return null;
          return { sku: invItem.sku, name: invItem.name, qty: Number(li.qty) || 1, rate: invItem.unitCost };
        }).filter(Boolean);
        if (lineItems.length === 0) return `Error: none of the requested SKUs were found in the inventory snapshot. Check the exact SKUs and try again.`;

        const docId = isInvoice ? `INV-${Math.floor(8000 + Math.random() * 1900)}` : `QT-${Math.floor(1000 + Math.random() * 900)}`;
        const orderDate = TODAY.toISOString().slice(0, 10);
        const draft = isInvoice
          ? { id: docId, customer: toolInput.customer, date: orderDate, dueDate: new Date(TODAY.getTime() + (Number(toolInput.due_in_days) || 14) * 86400000).toISOString().slice(0, 10), orderRef: "—", status: "Unpaid", amountPaid: 0, items: lineItems, payments: [] }
          : { id: docId, customer: toolInput.customer, date: orderDate, validUntil: new Date(TODAY.getTime() + (Number(toolInput.valid_days) || 14) * 86400000).toISOString().slice(0, 10), status: "Draft", owner: `AI ${persona.name}`, items: lineItems };

        const hook = isInvoice ? data.invoices : data.quotations;
        hook.setRows((prev) => [draft, ...prev]);
        const { total } = lineTotal(lineItems);
        notify(`${isInvoice ? "Invoice" : "Quotation"} ${docId} created for ${toolInput.customer} — TZS ${money(Math.round(total))}k`);
        logAudit(`${isInvoice ? "Invoice" : "Quotation"} created via AI Assistant`, "Sales", `AI ${persona.name}`, `${docId} — ${toolInput.customer}, TZS ${money(Math.round(total))}k`);

        if (IS_CONFIGURED) {
          try {
            const table = isInvoice ? "sales_invoices" : "sales_quotations";
            const itemsTable = isInvoice ? "sales_invoice_items" : "sales_quotation_items";
            const header = await sb(table).insert(
              isInvoice
                ? { doc_number: docId, customer: draft.customer, issue_date: draft.date, due_date: draft.dueDate, status: "Unpaid", amount_paid: 0 }
                : { doc_number: docId, customer: draft.customer, issue_date: draft.date, valid_until: draft.validUntil, status: "Draft" }
            ).single().run();
            if (header?.id) {
              await sb(itemsTable).insert(lineItems.map((li) => ({ [isInvoice ? "invoice_id" : "quotation_id"]: header.id, item_sku: li.sku, item_name: li.name, qty: li.qty, rate: li.rate }))).run();
              hook.setRows((prev) => prev.map((d) => (d.id === docId ? { ...d, dbId: header.id } : d)));
            }
          } catch (_e) { notify(`${isInvoice ? "Invoice" : "Quotation"} created locally, but saving to the server failed.`, "error"); }
        }
        return `Success: created ${docId} for ${toolInput.customer} with ${lineItems.length} line item(s), total TZS ${money(Math.round(total))}k.`;
      }

      if (name === "create_workflow") {
        const draft = { id: docId("SCH"), reportType: toolInput.report_type, frequency: toolInput.frequency, format: toolInput.format, recipientEmail: toolInput.recipient_email || "", status: "Active", lastRun: null };
        data.scheduledWorkflows.setRows((prev) => [draft, ...prev]);
        notify(`Workflow scheduled: ${draft.reportType} (${draft.frequency})`);
        logAudit("Workflow created via AI Assistant", "Reports", `AI ${persona.name}`, `${draft.reportType}, ${draft.frequency}, ${draft.format}`);
        if (IS_CONFIGURED) {
          try {
            const header = await sb("scheduled_reports").insert({ report_type: draft.reportType, frequency: draft.frequency, format: draft.format, recipient_email: draft.recipientEmail, status: "Active" }).single().run();
            if (header?.id) data.scheduledWorkflows.setRows((prev) => prev.map((s) => (s.id === draft.id ? { ...s, dbId: header.id } : s)));
          } catch (_e) { notify("Workflow created locally, but saving to the server failed.", "error"); }
        }
        return `Success: scheduled ${draft.reportType} to generate ${draft.frequency.toLowerCase()} as ${draft.format}. Real unattended delivery still needs a server-side scheduled job — see Reports' Scheduled Reports tab for the same caveat.`;
      }

      if (name === "show_chart") {
        // Not a mutation — this "tool" is the mechanism for the model to
        // hand back structured data instead of prose, which the message
        // renderer below turns into a real recharts chart inline in the
        // conversation. Returning success here just closes the tool-use
        // loop; the actual rendering happens from the tool_use block itself.
        return `Chart displayed: ${toolInput.title}.`;
      }

      return `Error: unknown tool ${name}.`;
    } catch (e) {
      return `Error executing ${name}: ${e.message}`;
    }
  }

  async function callModel(convo) {
    const snapshot = buildBusinessSnapshot(data, persona.scope);
    const roleFraming = persona.id === "consultant" || persona.id === "voice-commands"
      ? `You are the Smart Manager AI Business Assistant for ${data.company.name}`
      : `You are acting as an AI ${persona.name} for ${data.company.name}, a specialist focused on ${persona.tagline.toLowerCase()}`;
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: `${roleFraming}, a ${data.company.industry} business in ${data.company.country}. You have the live business snapshot below (all monetary values are in thousands of ${data.company.currency}). Answer using ONLY this data — cite specific document IDs, customers, and figures. ${tools.length > 0 ? "You can also take actions with the provided tools when the owner clearly asks you to; only act on explicit requests, use exact IDs/SKUs/names from the snapshot, and after acting, confirm what changed in one or two sentences." : "You have no tools in this role — answer and advise only, do not claim to have taken any action."} If a request is ambiguous, ask rather than guessing. Be concise and practical. Plain text, no markdown headers.\n\nLIVE BUSINESS SNAPSHOT (scope: ${persona.scope.join(", ") || "none"}):\n${JSON.stringify(snapshot)}`,
        tools: tools.length > 0 ? tools : undefined,
        messages: convo,
      }),
    });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    return response.json();
  }

  async function send(text) {
    const question = text.trim();
    if (!question || busy) return;

    let convo = [...messages, { role: "user", content: question }];
    setMessages(convo);
    setInput("");
    setBusy(true);

    try {
      for (let round = 0; round < 4; round++) {
        const responseData = await callModel(convo);
        convo = [...convo, { role: "assistant", content: responseData.content }];
        setMessages(convo);

        const toolUses = (responseData.content || []).filter((b) => b.type === "tool_use");
        if (toolUses.length === 0) break;

        const results = [];
        for (const tu of toolUses) {
          const result = await executeTool(tu.name, tu.input);
          results.push({ type: "tool_result", tool_use_id: tu.id, content: result });
        }
        convo = [...convo, { role: "user", content: results }];
        setMessages(convo);
      }
    } catch (e) {
      notify("The AI assistant couldn't be reached. Please try again.", "error");
      setMessages(messages);
      setInput(question);
    } finally {
      setBusy(false);
    }
  }

  // Real Web Speech API integration, feature-detected — not assumed to
  // work everywhere. Chrome-family browsers support it; Safari and
  // Firefox largely do not, and an iframe'd artifact may have microphone
  // permission blocked by its host page regardless of browser support.
  // Either way, the failure is explained, not silent.
  function startListening() {
    if (!speechSupported) {
      notify("Voice input is not supported in this browser — try Chrome or Edge.", "error");
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
    };
    recognition.onerror = () => {
      notify("Couldn't capture audio — check microphone permissions for this page.", "error");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }
  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return (
    <div className="flex-1 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden min-h-[420px]">
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.length === 0 && !busy && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3.5" style={{ backgroundColor: `${persona.color}14` }}>
              <persona.icon size={19} strokeWidth={1.75} style={{ color: persona.color }} />
            </div>
            <h3 className="text-[14.5px] font-semibold text-[#111827]">Ask your {persona.name}</h3>
            <p className="text-[12.5px] text-slate-500 mt-1 max-w-[320px] leading-relaxed mb-5">
              Grounded in your live data{tools.length > 0 ? " — and able to act on it when you ask." : "."} Try one of these:
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[400px]">
              {persona.suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-left text-[12.5px] text-slate-600 bg-slate-50 hover:bg-[#16A34A]/8 hover:text-[#111827] border border-slate-100 rounded-lg px-3.5 py-2.5 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => {
          if (typeof m.content === "string") {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-xl rounded-br-sm px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap btn-primary text-white">
                  {m.content}
                </div>
              </div>
            );
          }
          return (m.content || []).map((block, j) => {
            if (block.type === "text" && block.text.trim()) {
              return (
                <div key={`${i}-${j}`} className="flex justify-start group">
                  <div className="relative max-w-[85%]">
                    <div className="rounded-xl rounded-bl-sm px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap bg-slate-50 text-slate-700 border border-slate-100">
                      {block.text}
                    </div>
                    <div className="absolute -bottom-6 left-0 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { if (navigator.clipboard) { navigator.clipboard.writeText(block.text); notify("Copied to clipboard"); } }}
                        className="flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-0.5 shadow-sm"
                        title="Copy response"
                      >
                        <Copy size={10}/> Copy
                      </button>
                      {i === messages.length - 1 && (
                        <button
                          onClick={() => { const prev = messages.slice(0,-1); setMessages(prev); send(messages[messages.length-2]?.content||""); }}
                          className="flex items-center gap-1 text-[10.5px] text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-md px-2 py-0.5 shadow-sm"
                          title="Regenerate response"
                        >
                          <RotateCcw size={10}/> Retry
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            if (block.type === "tool_use" && block.name === "show_chart") {
              const chartData = (block.input.data || []).map((d) => ({ label: d.label, value: Number(d.value) || 0 }));
              return (
                <div key={`${i}-${j}`} className="flex justify-start w-full">
                  <div className="max-w-[92%] w-full bg-white border border-slate-200/80 rounded-xl rounded-bl-sm shadow-sm p-4">
                    <p className="text-[12.5px] font-semibold text-[#111827] mb-3">{block.input.title}</p>
                    <ResponsiveContainer width="100%" height={180}>
                      {block.input.chart_type === "line" ? (
                        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke="#EEF1F4" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEF1F4", fontSize: 12, fontFamily: "'Inter'" }} />
                          <Area type="monotone" dataKey="value" stroke="#16A34A" fill="#16A34A" fillOpacity={0.12} strokeWidth={2} />
                        </AreaChart>
                      ) : (
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid vertical={false} stroke="#EEF1F4" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={0} angle={chartData.length > 5 ? -20 : 0} textAnchor={chartData.length > 5 ? "end" : "middle"} height={chartData.length > 5 ? 45 : 25} />
                          <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEF1F4", fontSize: 12, fontFamily: "'Inter'" }} />
                          <Bar dataKey="value" fill="#16A34A" radius={[5, 5, 0, 0]} />
                        </BarChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            }
            if (block.type === "tool_use") {
              return (
                <div key={`${i}-${j}`} className="flex justify-start">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#16A34A] bg-[#16A34A]/8 border border-[#16A34A]/20 rounded-full px-3 py-1.5">
                    <CheckCircle2 size={12} /> {actionLabel(block.name, block.input)}
                  </span>
                </div>
              );
            }
            return null;
          });
        })}

        {busy && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-100 rounded-xl rounded-bl-sm px-3.5 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" style={{ animationDelay: `${d * 0.18}s` }} />)}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-3 sm:p-4">
        {persona.mode === "forecast" && (
          <button
            onClick={() => send("Generate a full forward-looking forecast: project cash position, sales trend, and the biggest risks over the next quarter based on the current data. Structure it as Cash Outlook, Sales Outlook, and Key Risks.")}
            disabled={busy}
            className="w-full mb-2.5 text-[12.5px] font-medium btn-primary text-white rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Gauge size={14} /> Generate Full Forecast
          </button>
        )}
        <div className="flex gap-2">
          <button
            onClick={listening ? stopListening : startListening}
            disabled={busy}
            className={`rounded-lg px-3 flex items-center justify-center shrink-0 border transition-colors disabled:opacity-40 ${listening ? "bg-[#EF4444] border-[#EF4444] text-white" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            aria-label={listening ? "Stop listening" : "Start voice input"}
            title={speechSupported ? "Voice input" : "Voice input not supported in this browser"}
          >
            <Mic size={15} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={listening ? "Listening..." : "Ask anything, or use the mic..."}
            disabled={busy}
            className={`${inputClass} flex-1 disabled:opacity-60`}
          />
          <button onClick={() => send(input)} disabled={busy || !input.trim()} className="btn-primary text-white rounded-lg px-4 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed shrink-0" aria-label="Send">
            <Send size={15} />
          </button>
        </div>
        <p className="text-[10.5px] text-slate-400 mt-2 ml-0.5">
          Powered by Claude · reads and acts on this session's data{IS_CONFIGURED ? "" : " (demo dataset)"}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------ AI DOCUMENT GENERATOR ------------------------------ */

const DOC_TYPES = ["Email", "Business Letter", "Internal Memo", "Company Policy", "Meeting Agenda", "Job Posting"];

function DocumentGenerator({ company }) {
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [recipient, setRecipient] = useState("");
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const isEmail = docType === "Email";

  async function generate() {
    if (!brief.trim()) return;
    setBusy(true);
    setError(null);
    setResult("");
    setEmailSubject("");
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 900,
          system: isEmail
            ? `You draft professional business emails for ${company.name}, a ${company.industry} business in ${company.country}. Reply with exactly two parts: a line starting with "Subject: " followed by the subject, then a blank line, then the email body. No other preamble, no markdown formatting.`
            : `You draft professional business documents for ${company.name}, a ${company.industry} business in ${company.country}. Write only the finished document — no preamble, no "Here's a draft", no markdown formatting. Plain, professional text ready to send as-is.`,
          messages: [{ role: "user", content: "Document type: " + docType + (recipient.trim() ? "\nRecipient: " + recipient.trim() : "") + "\n\nBrief: " + brief }],
        }),
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const responseData = await response.json();
      const text = (responseData.content?.find((c) => c.type === "text")?.text || "").trim();
      if (isEmail) {
        const match = text.match(/^Subject:\s*(.+?)\n+([\s\S]*)$/i);
        if (match) { setEmailSubject(match[1].trim()); setResult(match[2].trim()); }
        else { setEmailSubject(`Message from ${company.name}`); setResult(text); }
      } else {
        setResult(text);
      }
    } catch (e) {
      setError("Couldn't reach the AI service. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function downloadTxt() {
    const blob = new Blob([result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${docType.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // A real mailto: link — the browser's own default mail client opens
  // with subject and body pre-filled. This is genuine browser capability,
  // not a simulated "send" — no email actually leaves until the person
  // reviews it in their own mail client and clicks send themselves.
  function openInMailClient() {
    const url = `mailto:${encodeURIComponent(recipient.trim())}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(result)}`;
    window.location.href = url;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
      <FormField label="Document type">
        <select className={inputClass} value={docType} onChange={(e) => setDocType(e.target.value)}>
          {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </FormField>
      {isEmail && (
        <FormField label="Recipient email"><input type="email" className={inputClass} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="customer@company.tz" /></FormField>
      )}
      <FormField label="What should it say?">
        <textarea className={inputClass} rows={4} value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="e.g. A letter to Kilimo Fresh Distributors apologizing for a late delivery and offering a 5% discount on their next order." />
      </FormField>
      <button onClick={generate} disabled={busy || !brief.trim()} className="btn-primary text-white text-[13px] font-medium rounded-lg py-2.5 w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {busy ? <><LoaderCircle size={14} className="animate-spin" /> Drafting...</> : <><FileText size={14} /> Generate {isEmail ? "Email" : "Document"}</>}
      </button>
      {error && <p className="text-[12.5px] text-[#EF4444]">{error}</p>}
      {result && (
        <div className="space-y-3">
          {isEmail && emailSubject && (
            <div className="bg-slate-50 border border-slate-100 rounded-lg px-4 py-2.5">
              <p className="text-[11px] text-slate-400">Subject</p>
              <p className="text-[13px] font-medium text-[#111827]">{emailSubject}</p>
            </div>
          )}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 max-h-[360px] overflow-y-auto">
            <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">{result}</p>
          </div>
          <div className="flex gap-2">
            {isEmail && (
              <button onClick={openInMailClient} disabled={!recipient.trim()} className="flex-1 btn-primary text-white text-[12.5px] font-medium rounded-lg py-2.5 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                <Mail size={13} /> Open in Mail
              </button>
            )}
            <button onClick={downloadTxt} className="flex-1 text-[12.5px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 flex items-center justify-center gap-2">
              <Download size={13} /> Download as .txt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- AI MEETING SUMMARY ------------------------------- */

// AI Meeting Assistant — five things were requested (record, create
// minutes, extract action items, assign tasks, schedule follow-ups), and
// exactly one of them needed an honest boundary drawn before building
// anything: "automatically records meetings" can't mean capturing audio
// from a call happening on Zoom, Meet, or Teams — this app has no access
// to another platform media stream, the identical constraint already
// stated for Voice/Video Calls in the Collaboration Hub (section 37).
// What's real instead: the Web Speech API, already proven elsewhere in
// this build (the AI chat's voice input, section 23), reconfigured for
// continuous listening instead of one utterance — a genuine, live,
// growing transcript of whatever the microphone actually hears, started
// and stopped by a person, not a background process no one asked for.
function AIMeetingAssistant({ company }) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null); // { summary, decisions[], actionItems[] }
  const [followUpsCreated, setFollowUpsCreated] = useState(false);
  const recognitionRef = useRef(null);
  const calendarEvents = useCompanyTable("calendar_events", [], { mapRow: mapCalendarEventRow });

  const speechSupported = typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  function startRecording() {
    if (!speechSupported) {
      notify("Live transcription is not supported in this browser — try Chrome or Edge. You can still paste a transcript below.", "error");
      return;
    }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = transcript ? transcript + " " : "";
    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk + " ";
        else interim += chunk;
      }
      setTranscript(finalText + interim);
    };
    recognition.onerror = () => {
      notify("Lost the microphone connection — check permissions for this page. What was captured so far is kept.", "error");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }
  function stopRecording() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  async function generateMinutes() {
    if (!transcript.trim()) return;
    setBusy(true);
    setError(null);
    setResult(null);
    setFollowUpsCreated(false);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: `You produce structured meeting minutes for ${company.name}. Respond with ONLY valid JSON, no markdown fences, no preamble, in exactly this shape: {"summary": "2-3 sentence overview", "decisions": ["decision 1", "decision 2"], "actionItems": [{"task": "what needs doing", "owner": "who, if mentioned, else empty string", "dueDate": "YYYY-MM-DD if a date or relative time is mentioned (compute it from today, ${TODAY.toISOString().slice(0, 10)}), else empty string"}]}. Only include what is actually in the transcript — an empty array is correct if nothing qualifies, never invent items to fill the shape.`,
          messages: [{ role: "user", content: `Meeting transcript or notes:\n\n${transcript}` }],
        }),
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      const text = (data.content?.find((c) => c.type === "text")?.text || "").trim();
      const cleaned = text.replace(/^```json\s*|\s*```$/g, "");
      const parsed = JSON.parse(cleaned);
      setResult({ summary: parsed.summary || "", decisions: parsed.decisions || [], actionItems: (parsed.actionItems || []).map((a, i) => ({ ...a, id: i, include: true })) });
    } catch (e) {
      setError("Couldn't generate minutes — the AI service didn't return a response we could read. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  function updateActionItem(id, key, value) {
    setResult((r) => ({ ...r, actionItems: r.actionItems.map((a) => (a.id === id ? { ...a, [key]: value } : a)) }));
  }

  // "Assigns tasks" and "schedules follow-ups" — both real, both landing
  // in the exact same Shared Calendar built in the Collaboration Hub
  // (section 37), not a third, parallel task list. An action item with an
  // owner and a due date becomes a real calendar event; a person can see
  // it, and everyone else's calendar in this company, in the same place.
  async function createFollowUps() {
    const toSchedule = result.actionItems.filter((a) => a.include && a.dueDate);
    if (toSchedule.length === 0) { notify("No action items have both a due date and are checked — nothing to schedule.", "error"); return; }
    const created = [];
    for (const item of toSchedule) {
      const draft = {
        id: `EVT-${Date.now()}-${item.id}`, title: item.task, type: "General", date: item.dueDate,
        startTime: "09:00", endTime: "09:30", meetingLink: "", attendees: item.owner || "", description: `Follow-up from meeting: ${item.task}`,
      };
      created.push(draft);
      calendarEvents.setRows((prev) => [...prev, draft]);
      if (IS_CONFIGURED) {
        try {
          await sb("calendar_events").insert({
            title: draft.title, event_type: draft.type, event_date: draft.date,
            start_time: draft.startTime, end_time: draft.endTime, attendees: draft.attendees, description: draft.description,
          }).run();
        } catch (_e) { /* one failed sync among several shouldn't block the rest; the toast below reflects local success either way */ }
      }
    }
    logAudit("Meeting follow-ups scheduled", "AI Meeting Assistant", `AI ${company.name} meeting`, `${created.length} follow-up(s) added to the Shared Calendar`);
    notify(`${created.length} follow-up${created.length > 1 ? "s" : ""} added to the Shared Calendar.`);
    setFollowUpsCreated(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Mic size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Recording captures real speech from this device microphone via your browser — it can't capture audio from a call happening on Zoom, Meet, or Teams elsewhere, the same honest limit already stated for video calls in the Collaboration Hub. For those, paste the transcript your call platform generates instead.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#111827]">Transcript</p>
          <button
            onClick={listening ? stopRecording : startRecording}
            className={`text-[12px] font-medium rounded-lg px-3 py-1.5 flex items-center gap-1.5 ${listening ? "bg-[#EF4444] text-white" : "btn-secondary"}`}
          >
            {listening ? <><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Stop Recording</> : <><Mic size={12} /> Start Recording</>}
          </button>
        </div>
        <FormField label="">
          <textarea className={inputClass} rows={8} value={transcript} onChange={(e) => setTranscript(e.target.value)} placeholder="Click Start Recording to capture live speech, or paste an existing transcript / notes here..." />
        </FormField>
        <button onClick={generateMinutes} disabled={busy || !transcript.trim() || listening} className="btn-primary text-white text-[13px] font-medium rounded-lg py-2.5 w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {busy ? <><LoaderCircle size={14} className="animate-spin" /> Generating minutes...</> : <><FileText size={14} /> Generate Minutes & Action Items</>}
        </button>
        {error && <p className="text-[12.5px] text-[#EF4444]">{error}</p>}
      </div>

      {result && (
        <>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <p className="text-[13px] font-semibold text-[#111827] mb-2">Summary</p>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-4">{result.summary}</p>
            {result.decisions.length > 0 && (
              <>
                <p className="text-[13px] font-semibold text-[#111827] mb-2">Decisions</p>
                <ul className="space-y-1 mb-1">
                  {result.decisions.map((d, i) => <li key={i} className="text-[13px] text-slate-600 flex gap-2"><CheckCircle2 size={14} className="text-[#16A34A] shrink-0 mt-0.5" /> {d}</li>)}
                </ul>
              </>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[13px] font-semibold text-[#111827]">Action Items</p>
              {followUpsCreated && <span className="text-[11px] font-medium text-[#16A34A] flex items-center gap-1"><CheckCircle2 size={12} /> Scheduled</span>}
            </div>
            <p className="text-[11.5px] text-slate-400 mb-3">Edit the owner or due date below, then schedule follow-ups — each checked item with a due date becomes a real event on the Shared Calendar.</p>
            {result.actionItems.length === 0 ? (
              <p className="text-[12.5px] text-slate-400 py-3">No action items found in this transcript.</p>
            ) : (
              <div className="space-y-2 mb-4">
                {result.actionItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 border border-slate-100 rounded-lg p-3">
                    <input type="checkbox" checked={item.include} onChange={(e) => updateActionItem(item.id, "include", e.target.checked)} className="mt-1 rounded border-slate-300" />
                    <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
                      <input value={item.task} onChange={(e) => updateActionItem(item.id, "task", e.target.value)} className="text-[12.5px] bg-transparent outline-none text-[#111827] font-medium" />
                      <input value={item.owner} onChange={(e) => updateActionItem(item.id, "owner", e.target.value)} placeholder="Owner" className="text-[12px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1 w-full sm:w-32" />
                      <input type="date" value={item.dueDate} onChange={(e) => updateActionItem(item.id, "dueDate", e.target.value)} className="text-[12px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1 w-full sm:w-36" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {result.actionItems.length > 0 && (
              <button onClick={createFollowUps} className="btn-primary text-white text-[12.5px] font-medium rounded-lg py-2.5 w-full flex items-center justify-center gap-2">
                <Calendar size={14} /> Schedule Follow-ups on Shared Calendar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* --------------------------------- MARKETING ----------------------------------- */

const MKT_TABS = [
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "segments", label: "Segments", icon: Users },
  { id: "sms", label: "Bulk SMS", icon: MessageSquare },
];

const CAMPAIGN_STATUS_NEXT = { Draft: "Scheduled", Scheduled: "Sent", Sent: null };

export default AIAssistant;
