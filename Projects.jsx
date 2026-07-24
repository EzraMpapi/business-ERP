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


function Documents({ filesHook, company }) {
  const [folder, setFolder] = useState("all");
  const [view, setView] = useState("grid");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { rows: files, setRows: setFiles, loading, error } = filesHook;

  const folderCounts = useMemo(() => {
    const map = {};
    DOC_FOLDERS.forEach((f) => (map[f] = 0));
    files.forEach((f) => { map[f.folder] = (map[f.folder] || 0) + 1; });
    return map;
  }, [files]);

  const filtered = useMemo(() => {
    return files.filter((f) => {
      const matchesFolder = folder === "all" || f.folder === folder;
      const q = query.trim().toLowerCase();
      const matchesQ = !q || f.name.toLowerCase().includes(q) || (f.content || "").toLowerCase().includes(q);
      return matchesFolder && matchesQ;
    });
  }, [files, folder, query]);

  const totalSizeLabel = useMemo(() => {
    const totalMB = files.reduce((s, f) => {
      const n = parseFloat(f.size);
      return s + (f.size.includes("KB") ? n / 1024 : n);
    }, 0);
    return `${totalMB.toFixed(1)} MB`;
  }, [files]);

  async function addFile(form) {
    const draft = {
      id: docId("DOC"),
      name: form.name,
      type: form.type,
      folder: form.folder,
      size: `${(0.1 + Math.random() * 2).toFixed(1)} MB`,
      uploadedBy: "You",
      date: TODAY.toISOString().slice(0, 10),
      linkedRecord: form.linkedRecord || null,
      content: form.content || "",
      versions: [],
    };
    setFiles((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Uploaded: ${draft.name}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("documents").insert({
          name: draft.name, file_type: draft.type, folder: draft.folder,
          size_label: draft.size, linked_record: draft.linkedRecord, content: draft.content, versions: draft.versions,
        }).single().run();
        if (header?.id) setFiles((prev) => prev.map((f) => (f.id === draft.id ? { ...f, dbId: header.id } : f)));
      } catch (_e) { notify("File added locally, but saving to the server failed.", "error"); }
    }
  }

  async function addVersion(fileId, versionForm) {
    const file = files.find((f) => f.id === fileId);
    if (!file) return;
    const newVersion = { version: (file.versions?.length || 0) + 1, date: TODAY.toISOString().slice(0, 10), size: versionForm.size || file.size, note: versionForm.note || "" };
    const updatedVersions = [...(file.versions || []), { version: file.versions?.length ? file.versions[file.versions.length - 1].version : 0, date: file.date, size: file.size, note: "Previous version" }];
    // The version being replaced is archived into the history; the file's
    // own top-level date/size become the new version's — so "current" is
    // always what the document actually is right now, and history is a
    // real, ordered trail of what it used to be, not a guess.
    setFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, date: newVersion.date, size: newVersion.size, versions: updatedVersions } : f)));
    setSelected((s) => (s && s.id === fileId ? { ...s, date: newVersion.date, size: newVersion.size, versions: updatedVersions } : s));
    notify(`New version added to ${file.name}`);
    if (IS_CONFIGURED && file.dbId) {
      try { await sb("documents").eq("id", file.dbId).update({ size_label: newVersion.size, versions: updatedVersions, created_at: newVersion.date }).run(); } catch (_e) { notify("Version saved locally, but the server update failed.", "error"); }
    }
  }

  async function deleteFile(id) {
    const file = files.find((f) => f.id === id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && file?.dbId) {
      try { await sb("documents").eq("id", file.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the file on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      {IS_CONFIGURED && error && (
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 text-[#EF4444] text-[12.5px] rounded-lg px-3.5 py-2.5">
          {"Could not reach Supabase — check your connection."}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Documents</h1>
          <p className="text-[13px] text-slate-500 mt-1">{files.length} files · {totalSizeLabel} stored</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          <UploadCloud size={15} /> Upload File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
        {/* Folder sidebar */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-2.5 h-fit lg:sticky lg:top-0">
          <button
            onClick={() => setFolder("all")}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-colors ${
              folder === "all" ? "bg-[#16A34A]/8 text-[#111827] font-medium" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2"><FolderOpen size={15} className="text-slate-400" /> All Files</span>
            <span className="text-[11px] text-slate-400 font-mono">{files.length}</span>
          </button>
          {DOC_FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] mb-0.5 transition-colors ${
                folder === f ? "bg-[#16A34A]/8 text-[#111827] font-medium" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2 truncate"><Folder size={15} className="text-slate-400 shrink-0" /> <span className="truncate">{f}</span></span>
              <span className="text-[11px] text-slate-400 font-mono shrink-0">{folderCounts[f] || 0}</span>
            </button>
          ))}
        </div>

        {/* File area */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/30 transition-all"
              />
            </div>
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-1 shrink-0">
              <button onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} className={`p-1.5 rounded-md ${view === "grid" ? "bg-white shadow-sm text-[#111827]" : "text-slate-400"}`}>
                <Grid3x3 size={15} />
              </button>
              <button onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"} className={`p-1.5 rounded-md ${view === "list" ? "bg-white shadow-sm text-[#111827]" : "text-slate-400"}`}>
                <List size={15} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className={view === "grid" ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3" : "space-y-2"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 h-24 skeleton-shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
              <EmptyState
                icon={FileText}
                title={files.length === 0 ? "No documents yet" : "No files match your search"}
                hint={files.length === 0 ? "Upload contracts, statements, and compliance records to keep them alongside the records they relate to." : "Try a different search term or folder."}
                actionLabel={files.length === 0 ? "Upload File" : undefined}
                onAction={files.length === 0 ? () => setShowForm(true) : undefined}
              />
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filtered.map((f) => {
                const meta = FILE_TYPE_STYLE[f.type] || FILE_TYPE_STYLE.pdf;
                const Icon = meta.Icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setSelected(f)}
                    className="text-left bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 hover:border-[#16A34A]/50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${meta.color}14` }}>
                        <Icon size={17} style={{ color: meta.color }} />
                      </div>
                      <span className="text-[9.5px] font-bold tracking-wide px-1.5 py-0.5 rounded" style={{ backgroundColor: `${meta.color}14`, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-[12.5px] font-medium text-[#111827] leading-snug line-clamp-2 min-h-[32px]">{f.name}</p>
                    <p className="text-[11px] text-slate-400 mt-2">{f.size} · {f.date}</p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px] min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Folder</th>
                      <th className="px-4 py-3 font-medium">Uploaded</th>
                      <th className="px-4 py-3 font-medium text-right">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((f) => {
                      const meta = FILE_TYPE_STYLE[f.type] || FILE_TYPE_STYLE.pdf;
                      const Icon = meta.Icon;
                      return (
                        <tr key={f.id} onClick={() => setSelected(f)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <Icon size={15} style={{ color: meta.color }} className="shrink-0" />
                              <span className="text-[#111827] font-medium truncate">{f.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{f.folder}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono">{f.date} · {f.uploadedBy}</td>
                          <td className="px-4 py-3 text-right font-mono text-slate-500">{f.size}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && <FilePanel file={selected} company={company} onClose={() => setSelected(null)} onDelete={deleteFile} onAddVersion={addVersion} />}
      {showForm && <FileFormPanel onClose={() => setShowForm(false)} onSubmit={addFile} />}
    </div>
  );
}

function FilePanel({ file, company, onClose, onDelete, onAddVersion }) {
  const meta = FILE_TYPE_STYLE[file.type] || FILE_TYPE_STYLE.pdf;
  const Icon = meta.Icon;
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryBusy, setSummaryBusy] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

  // Real signatures for this specific document — reuses the exact same
  // table and pad already built for Integrations' E-Signature tool
  // (section 25), not a second, parallel signature system. A document's
  // signatures are just that same table filtered to this document's id.
  const signatures = useCompanyTable("signatures", signaturesSeed, { order: { col: "signed_at", ascending: false }, mapRow: mapSignatureRow });
  const fileSignatures = signatures.rows.filter((s) => s.documentRef === file.id);

  async function generateSummary() {
    if (!file.content?.trim()) return;
    setSummaryBusy(true);
    setSummaryError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 400,
          system: `You summarize business documents for ${company.name}. Write 2-4 short sentences covering what this document is and the key facts in it (parties, dates, amounts, terms) — whatever's actually present in the text. Plain text, no markdown.`,
          messages: [{ role: "user", content: file.content }],
        }),
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      setSummary((data.content?.find((c) => c.type === "text")?.text || "").trim());
    } catch (e) {
      setSummaryError("Couldn't reach the AI service. Try again in a moment.");
    } finally {
      setSummaryBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}14` }}>
              <Icon size={20} style={{ color: meta.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[14.5px] font-semibold text-[#111827] leading-snug break-words">{file.name}</p>
              <p className="text-[11.5px] text-slate-400">{file.folder}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">File size</p>
            <p className="text-[15px] font-mono font-semibold text-[#111827]">{file.size}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">{file.versions?.length > 0 ? "Current version" : "Uploaded"}</p>
            <p className="text-[15px] font-mono font-semibold text-[#111827]">{file.date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-[13px] text-slate-600 mb-3">
          <Users size={14} className="text-slate-400" /> Uploaded by {file.uploadedBy}
        </div>
        {file.linkedRecord && (
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600 mb-5">
            <Tag size={14} className="text-slate-400" /> Linked to record <span className="font-mono text-[#16A34A] font-medium">{file.linkedRecord}</span>
          </div>
        )}

        {/* Version History — a real, ordered trail of what this document
            used to be, not a single-shot file with no memory of change. */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5"><History size={12} /> Version History</p>
            <button onClick={() => setShowVersionForm(true)} className="text-[11px] font-medium text-[#16A34A] hover:text-[#15803D]">+ New Version</button>
          </div>
          {(!file.versions || file.versions.length === 0) ? (
            <p className="text-[12px] text-slate-400">No prior versions — this is the only one on record.</p>
          ) : (
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 text-[12px] bg-[#16A34A]/5">
                <span className="font-medium text-[#111827]">Version {file.versions.length + 1} (current)</span>
                <span className="text-slate-400 font-mono">{file.date}</span>
              </div>
              {[...file.versions].reverse().map((v) => (
                <div key={v.version} className="flex items-center justify-between px-3 py-2 text-[12px] border-t border-slate-50">
                  <span className="text-slate-600">Version {v.version}{v.note ? ` — ${v.note}` : ""}</span>
                  <span className="text-slate-400 font-mono">{v.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Document Summary — real, from real extracted/entered text.
            Honest when there is nothing to summarize yet, rather than
            calling the API on an empty string and returning something
            that looks like a summary but is not grounded in anything. */}
        <div className="mb-5">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Brain size={12} /> AI Summary</p>
          {!file.content?.trim() ? (
            <p className="text-[12px] text-slate-400">No text content on this document yet — scan it with OCR or add text on upload to enable summarization.</p>
          ) : summary ? (
            <div className="bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-lg p-3">
              <p className="text-[12.5px] text-slate-700 leading-relaxed">{summary}</p>
            </div>
          ) : (
            <button onClick={generateSummary} disabled={summaryBusy} className="btn-secondary text-[12px] font-medium rounded-lg py-2 px-3 flex items-center gap-1.5 disabled:opacity-50">
              {summaryBusy ? <><LoaderCircle size={12} className="animate-spin" /> Summarizing...</> : <><Brain size={12} /> Generate Summary</>}
            </button>
          )}
          {summaryError && <p className="text-[11.5px] text-[#EF4444] mt-1.5">{summaryError}</p>}
        </div>

        {/* Electronic Signatures — the exact same signature pad and table
            as Integrations' E-Signature tool, scoped to this one document. */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5"><PenTool size={12} /> Signatures</p>
            <button onClick={() => setShowSignaturePad(true)} className="text-[11px] font-medium text-[#16A34A] hover:text-[#15803D]">+ Sign Document</button>
          </div>
          {fileSignatures.length === 0 ? (
            <p className="text-[12px] text-slate-400">Not signed yet.</p>
          ) : (
            <div className="space-y-2">
              {fileSignatures.map((s) => (
                <div key={s.id} className="flex items-center gap-3 border border-slate-100 rounded-lg p-2">
                  <img src={s.imageData} alt={`Signature by ${s.signerName}`} className="h-8 bg-white" />
                  <div className="min-w-0"><p className="text-[12px] font-medium text-[#111827] truncate">{s.signerName}</p><p className="text-[10.5px] text-slate-400">{new Date(s.signedAt).toLocaleDateString()}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1" />

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
          <button className="flex items-center justify-center gap-1.5 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">
            <Eye size={13} /> Preview
          </button>
          <ConfirmDeleteButton label="Delete file" onConfirm={() => onDelete(file.id)} />
        </div>
      </div>

      {showVersionForm && <VersionUploadPanel currentSize={file.size} onClose={() => setShowVersionForm(false)} onSubmit={(v) => { onAddVersion(file.id, v); setShowVersionForm(false); }} />}
      {showSignaturePad && (
        <DocumentSignaturePad
          documentId={file.id}
          onClose={() => setShowSignaturePad(false)}
          onSigned={(entry) => { signatures.setRows((prev) => [entry, ...prev]); setShowSignaturePad(false); }}
        />
      )}
    </div>
  );
}

function VersionUploadPanel({ currentSize, onClose, onSubmit }) {
  const [note, setNote] = useState("");
  const [size, setSize] = useState(currentSize);
  function handleSubmit(e) { e.preventDefault(); onSubmit({ note, size }); }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[360px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Version History</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Version</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="What changed?"><input className={inputClass} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Updated pricing terms" /></FormField>
          <FormField label="New file size"><input className={inputClass} value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 1.3 MB" /></FormField>
          <p className="text-[11.5px] text-slate-400">The previous version moves into history below; this becomes the current one.</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Save New Version</button>
        </div>
      </form>
    </div>
  );
}

// A lean, document-scoped version of the exact same canvas signature pad
// built for Integrations (section 25) — same drawing logic, same table,
// just pre-filled with this document's id rather than a typed-in reference.
function DocumentSignaturePad({ documentId, onClose, onSigned }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [signerName, setSignerName] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }
  function startDraw(e) { e.preventDefault(); drawingRef.current = true; const ctx = canvasRef.current.getContext("2d"); const { x, y } = getPos(e, canvasRef.current); ctx.beginPath(); ctx.moveTo(x, y); }
  function draw(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = getPos(e, canvasRef.current);
    ctx.lineWidth = 2; ctx.lineCap = "round"; ctx.strokeStyle = "#111827";
    ctx.lineTo(x, y); ctx.stroke();
    setHasDrawn(true);
  }
  function endDraw() { drawingRef.current = false; }
  function clearCanvas() { const c = canvasRef.current; c.getContext("2d").clearRect(0, 0, c.width, c.height); setHasDrawn(false); }

  async function save() {
    if (!hasDrawn || !signerName.trim()) return;
    const imageData = canvasRef.current.toDataURL("image/png");
    const draft = { id: `SIG-${Date.now()}`, documentRef: documentId, signerName: signerName.trim(), imageData, signedAt: new Date().toISOString() };
    onSigned(draft);
    notify(`Signed by ${draft.signerName}`);
    if (IS_CONFIGURED) {
      try { await sb("signatures").insert({ document_ref: documentId, signer_name: draft.signerName, image_data: imageData }).run(); } catch (_e) { notify("Signed locally, but saving to the server failed.", "error"); }
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-5">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">{documentId}</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Sign Document</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <p className="text-[11.5px] text-slate-400 mb-4">A lightweight signature capture for internal sign-off — not a certified e-signature platform (no identity verification or legal audit trail). See Integrations for the same disclosure.</p>
        <FormField label="Signer name" required><input className={inputClass} value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Full name" /></FormField>
        <p className="text-[11px] font-medium text-slate-500 mt-4 mb-2">Sign below</p>
        <canvas
          ref={canvasRef} width={340} height={140}
          className="w-full border border-slate-200 rounded-lg bg-slate-50 touch-none cursor-crosshair"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        <div className="flex gap-2 mt-3">
          <button onClick={clearCanvas} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2 hover:bg-slate-50">Clear</button>
          <button onClick={save} disabled={!hasDrawn || !signerName.trim()} className="flex-1 btn-primary text-white text-[12px] font-medium rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed">Save Signature</button>
        </div>
        <div className="flex-1" />
      </div>
    </div>
  );
}

function FileFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", type: "pdf", folder: DOC_FOLDERS[0], linkedRecord: "", content: "" });
  const [touched, setTouched] = useState(false);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState(null);
  const valid = form.name.trim();

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onSubmit(form);
  }

  async function handleScanFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setOcrError(null);
    setOcrBusy(true);
    setOcrProgress(0);
    if (!form.name.trim()) set("name", file.name);
    const result = await runOCR(file, setOcrProgress);
    setOcrBusy(false);
    if (result.ok) {
      set("content", result.text);
      notify(result.text ? "Text extracted from the scan." : "OCR ran, but found no readable text in this image.");
    } else {
      setOcrError(result.error);
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[420px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Documents</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Upload File</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 flex-1 space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 flex flex-col items-center text-center">
            <UploadCloud size={22} className="text-slate-300 mb-2" />
            <p className="text-[12px] text-slate-400 mb-3">This is a demo register — raw files are not stored, but scanning one below does run real OCR and keeps the extracted text.</p>
            <label className="text-[12px] font-medium text-[#16A34A] border border-[#16A34A]/30 rounded-lg px-3 py-2 cursor-pointer hover:bg-[#16A34A]/5 transition-colors flex items-center gap-1.5">
              <ScanText size={13} /> Scan a document (OCR)
              <input type="file" accept="image/*" className="hidden" onChange={handleScanFile} disabled={ocrBusy} />
            </label>
            {ocrBusy && <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5"><LoaderCircle size={11} className="animate-spin" /> Reading text... {ocrProgress}%</p>}
            {ocrError && <p className="text-[11px] text-[#EF4444] mt-2">{ocrError}</p>}
          </div>

          <FormField label="File name" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Vendor Agreement — ABC Ltd.pdf" />
            {touched && !form.name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">File name is required.</p>}
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type">
              <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
                {Object.entries(FILE_TYPE_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </FormField>
            <FormField label="Folder">
              <select className={inputClass} value={form.folder} onChange={(e) => set("folder", e.target.value)}>
                {DOC_FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>
          </div>

          <FormField label="Linked record (optional)">
            <input className={inputClass} value={form.linkedRecord} onChange={(e) => set("linkedRecord", e.target.value)} placeholder="e.g. INV-8801, SO-2117, EMP-104" />
          </FormField>

          <FormField label="Text content (for search & AI summary)">
            <textarea className={inputClass} rows={5} value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="Populated automatically by Scan (OCR) above, or type/paste it yourself." />
            <p className="text-[11px] text-slate-400 mt-1">Full-text search and AI summaries both work from this — a document with no text here can only be found by its file name.</p>
          </FormField>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white text-[12px] font-medium rounded-lg py-2.5">Upload</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- PROJECTS ------------------------------------ */

function Projects({ filesHook, expensesHook }) {
  const projects = useCompanyTable("projects", projectsSeed, { order: { col: "start_date", ascending: false }, mapRow: mapProjectRow });
  const tasks = useCompanyTable("project_tasks", projectTasksSeed, { order: { col: "due_date", ascending: true }, mapRow: mapProjectTaskRow });
  const milestones = useCompanyTable("project_milestones", projectMilestonesSeed, { order: { col: "due_date", ascending: true }, mapRow: mapMilestoneRow });
  const projectExpenses = useCompanyTable("project_expenses", projectExpensesSeed, { order: { col: "expense_date", ascending: false }, mapRow: mapProjectExpenseRow });

  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const selectedProject = projects.rows.find((p) => p.id === selectedId);

  const todayStr = TODAY.toISOString().slice(0, 10);
  const stats = useMemo(() => {
    const active = projects.rows.filter((p) => p.status === "Active").length;
    const totalBudget = projects.rows.reduce((s, p) => s + p.budget, 0);
    const dueSoonTasks = tasks.rows.filter((t) => t.status !== "Done" && t.dueDate && t.dueDate >= todayStr && daysBetween(new Date(t.dueDate), TODAY) <= 7).length;
    const overdueMilestones = milestones.rows.filter((m) => milestoneStatus(m) === "Overdue").length;
    return { active, totalBudget, dueSoonTasks, overdueMilestones };
  }, [projects.rows, tasks.rows, milestones.rows]);

  const PROJECT_KPIS = [
    { label: "Active Projects", value: String(stats.active), delta: `${projects.rows.length} total`, up: true, icon: Kanban },
    { label: "Total Budget", value: `TZS ${money(stats.totalBudget)}k`, delta: "All projects", up: true, icon: CircleDollarSign },
    { label: "Tasks Due Soon", value: String(stats.dueSoonTasks), delta: "Next 7 days", up: false, icon: ListTodo },
    { label: "Overdue Milestones", value: String(stats.overdueMilestones), delta: "Needs attention", up: false, icon: Flag },
  ];

  async function addProject(form) {
    const draft = { id: docId("PRJ"), name: form.name, client: form.client, status: "Planning", startDate: form.startDate, endDate: form.endDate, budget: Number(form.budget) || 0, manager: form.manager };
    projects.setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Project created: ${draft.name}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("projects").insert({
          name: draft.name, client: draft.client, status: "Planning", start_date: draft.startDate,
          end_date: draft.endDate, budget: draft.budget, manager: draft.manager,
        }).single().run();
        if (header?.id) projects.setRows((prev) => prev.map((p) => (p.id === draft.id ? { ...p, dbId: header.id } : p)));
      } catch (_e) { notify("Project created locally, but saving to the server failed.", "error"); }
    }
  }

  if (selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedId(null)}
        onSetStatus={async (status) => {
          projects.setRows((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, status } : p)));
          if (IS_CONFIGURED && selectedProject.dbId) {
            try { await sb("projects").eq("id", selectedProject.dbId).update({ status }).run(); } catch (_e) { notify("Couldn't save the project status to the server.", "error"); }
          }
        }}
        tasksHook={tasks}
        milestonesHook={milestones}
        expensesHook={projectExpenses}
        financeExpensesHook={expensesHook}
        filesHook={filesHook}
      />
    );
  }

  function printProjects() {
    const rows = projects.rows.map((p,i)=>`
      <tr style="background:${i%2===0?"white":"#F8FAFB"}">
        <td class="bold">${p.name}</td>
        <td>${p.client||"—"}</td>
        <td>${p.status}</td>
        <td class="r">${p.progress||0}%</td>
        <td class="r">TZS ${money(p.budget||0)}k</td>
        <td class="r">${p.deadline||"—"}</td>
        <td>${p.pm||"—"}</td>
      </tr>`).join("");
    const kpis = `<div class="kpi-grid">
      <div class="kpi"><div class="kpi-label">Total Projects</div><div class="kpi-value">${projects.rows.length}</div></div>
      <div class="kpi"><div class="kpi-label">Active</div><div class="kpi-value" style="color:#2563EB">${projects.rows.filter(p=>p.status==="Active"||p.status==="In Progress").length}</div></div>
      <div class="kpi"><div class="kpi-label">Completed</div><div class="kpi-value" style="color:#16A34A">${projects.rows.filter(p=>p.status==="Completed").length}</div></div>
      <div class="kpi"><div class="kpi-label">Total Budget</div><div class="kpi-value" style="color:#7C3AED">TZS ${money(projects.rows.reduce((s,p)=>s+(p.budget||0),0))}k</div></div>
    </div>`;
    printReport("Project Status Report", kpis+`<table>
      <thead><tr><th>Project</th><th>Client</th><th>Status</th><th class="r">Progress</th><th class="r">Budget</th><th class="r">Deadline</th><th>Manager</th></tr></thead>
      <tbody>${rows}</tbody></table>`, company);
  }

  function exportProjectsCsv() {
    downloadCSV("projects", projects.rows.map(p=>({
      Name:p.name, Client:p.client||"", Status:p.status, Progress:p.progress||0,
      Budget_k:p.budget||0, Deadline:p.deadline||"", Manager:p.pm||"",
    })),[{key:"Name",label:"Project"},{key:"Client",label:"Client"},{key:"Status",label:"Status"},
       {key:"Progress",label:"Progress %"},{key:"Budget_k",label:"Budget (TZS k)"},{key:"Deadline",label:"Deadline"},{key:"Manager",label:"Manager"}]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Projects</h1>
          <p className="text-[13px] text-slate-500 mt-1">Tasks, timelines, milestones, files, and budgets per project</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportProjectsCsv} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#16A34A] border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-2 rounded-lg">
            <Download size={13}/> CSV
          </button>
          <button onClick={printProjects} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white bg-[#0D2214] px-3 py-2 rounded-lg">
            <Printer size={13}/> PDF Report
          </button>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm shrink-0">
          <Plus size={15} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PROJECT_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      {/* Project portfolio analytics */}
      {projects.rows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Status breakdown BarChart */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Project Status Breakdown</h3>
            {(() => {
              const statusData = ["Planning","Active","On Hold","Completed","Cancelled"].map(s=>({
                name:s, value:projects.rows.filter(p=>p.status===s).length,
                fill:{Planning:"#94A3B8",Active:"#16A34A","On Hold":"#F59E0B",Completed:"#2563EB",Cancelled:"#EF4444"}[s],
              })).filter(d=>d.value>0);
              return statusData.length === 0 ? null : (
                <div className="flex items-center gap-3">
                  <ResponsiveContainer width="55%" height={140}>
                    <RPieChart>
                      <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={32}>
                        {statusData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Pie>
                      <Tooltip formatter={(v,n)=>[v+" projects",n]}/>
                    </RPieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-1.5">
                    {statusData.map(d=>(
                      <div key={d.name} className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-[12px] text-slate-600">
                          <span className="w-2.5 h-2.5 rounded-full" style={{background:d.fill}}/>{d.name}
                        </span>
                        <span className="text-[13px] font-bold" style={{color:d.fill}}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Budget utilization BarChart */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Budget Utilization</h3>
            {(() => {
              const budgetData = projects.rows.filter(p=>p.budget>0).slice(0,6).map(p=>{
                const spent = projectExpenses.rows.filter(e=>e.projectId===p.id).reduce((s,e)=>s+e.amount,0);
                const pct   = Math.round(spent/p.budget*100);
                return {
                  name: p.name.length>14 ? p.name.slice(0,12)+"…" : p.name,
                  budget: Math.round(p.budget),
                  spent:  Math.round(spent),
                  over:   spent > p.budget,
                  pct,
                };
              }).sort((a,b)=>b.pct-a.pct);
              if (budgetData.length===0) return <p className="text-slate-400 text-center py-6">No projects with budgets</p>;
              return (
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={budgetData} layout="vertical" margin={{left:5,right:30,top:0,bottom:0}}>
                    <CartesianGrid vertical={false} stroke="#F3F4F6"/>
                    <XAxis type="number" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="name" type="category" tick={{fontSize:10}} axisLine={false} tickLine={false} width={75}/>
                    <Tooltip formatter={(v,n)=>["TZS "+money(v)+"k",n==="spent"?"Spent":"Budget"]}/>
                    <Bar dataKey="budget" fill="#E5E7EB" radius={[0,0,0,0]} maxBarSize={12} name="budget"/>
                    <Bar dataKey="spent" radius={[0,4,4,0]} maxBarSize={12} name="spent">
                      {budgetData.map((d,i)=><Cell key={i} fill={d.over?"#EF4444":"#16A34A"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200/80 h-36 skeleton-shimmer" />)}
        {!projects.loading && projects.rows.map((p) => {
          const projectTasks = tasks.rows.filter((t) => t.projectId === p.id);
          const doneCount = projectTasks.filter((t) => t.status === "Done").length;
          const progress = projectTasks.length ? Math.round((doneCount / projectTasks.length) * 100) : 0;
          return (
            <button key={p.id} onClick={() => setSelectedId(p.id)} className="text-left bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 hover:border-[#16A34A]/50 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[14px] font-semibold text-[#111827] leading-snug pr-2">{p.name}</p>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: `${PROJECT_STATUS_COLOR[p.status]}14`, color: PROJECT_STATUS_COLOR[p.status] }}>{p.status}</span>
              </div>
              <p className="text-[12px] text-slate-500 mb-3">{p.client}</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                <div className="h-full rounded-full btn-primary" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{progress}% complete</span>
                <span className="font-mono">TZS {money(p.budget)}k</span>
              </div>
            </button>
          );
        })}
        {!projects.loading && projects.rows.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200/80 shadow-sm">
            <EmptyState icon={Kanban} title="No projects yet" hint="Create a project to track tasks, milestones, files, and budget in one place." actionLabel="New Project" onAction={() => setShowForm(true)} />
          </div>
        )}
      </div>

      {/* Gantt — real horizontal time bars, not a picture of one. The
          axis runs from the earliest real start date to the latest real
          end date across dated projects; each bar's position and width
          are computed offsets, colored by real status, with a today
          marker at the business date. Projects missing either date are
          counted honestly below rather than drawn as guesses. */}
      {(() => {
        const dated = projects.rows.filter((p) => p.startDate && p.endDate && p.endDate >= p.startDate);
        if (dated.length === 0) return null;
        const min = dated.map((p) => p.startDate).sort()[0];
        const max = dated.map((p) => p.endDate).sort().slice(-1)[0];
        const span = Math.max(1, new Date(max) - new Date(min));
        const pct = (d) => Math.max(0, Math.min(100, ((new Date(d) - new Date(min)) / span) * 100));
        const todayPct = pct(TODAY.toISOString().slice(0, 10));
        const color = { Active: "#16A34A", Planning: "#94A3B8", "On Hold": "#F59E0B", Completed: "#CBD5E1" };
        const undated = projects.rows.length - dated.length;
        return (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Project Timeline (Gantt)</h3>
            <p className="text-[11.5px] text-slate-500 mb-4">{min} → {max} · green line marks today ({TODAY.toISOString().slice(0, 10)})</p>
            <div className="relative space-y-2.5">
              <div className="absolute top-0 bottom-0 w-px bg-[#16A34A] z-10" style={{ left: `${todayPct}%` }} />
              {dated.map((p) => {
                const left = pct(p.startDate), width = Math.max(2, pct(p.endDate) - left);
                return (
                  <div key={p.id} className="relative h-7">
                    <div className="absolute inset-y-0 rounded-md flex items-center px-2 overflow-hidden" style={{ left: `${left}%`, width: `${width}%`, backgroundColor: `${color[p.status] || "#94A3B8"}22`, borderLeft: `3px solid ${color[p.status] || "#94A3B8"}` }}>
                      <span className="text-[11px] font-medium text-[#111827] truncate">{p.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {undated > 0 && <p className="text-[10.5px] text-slate-400 mt-3">{undated} project(s) missing a start or end date — excluded from the timeline and stated, never drawn as guesses.</p>}
          </div>
        );
      })()}

      {/* Resource allocation — real open-task counts per real assignee,
          the honest version of the feature: who is actually loaded, from
          data already recorded, with unassigned work named as its own
          row because invisible work is how teams drown. */}
      {(() => {
        const open = tasks.rows.filter((t) => t.status !== "Done");
        if (open.length === 0) return null;
        const byPerson = {};
        open.forEach((t) => { const k = t.assignee || "Unassigned"; byPerson[k] = (byPerson[k] || 0) + 1; });
        const entries = Object.entries(byPerson).sort((a, b) => b[1] - a[1]);
        const maxN = entries[0][1];
        return (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
            <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Resource Allocation — open tasks per person</h3>
            <div className="space-y-2">
              {entries.map(([name, n]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className={`text-[12px] w-32 truncate shrink-0 ${name === "Unassigned" ? "text-[#F59E0B] font-medium" : "text-slate-600"}`}>{name}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(n / maxN) * 100}%`, backgroundColor: name === "Unassigned" ? "#F59E0B" : "#16A34A" }} /></div>
                  <span className="text-[11.5px] font-mono text-slate-500 shrink-0 w-6 text-right">{n}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {showForm && <ProjectFormPanel onClose={() => setShowForm(false)} onSubmit={addProject} />}
    </div>
  );
}

function ProjectFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", client: "", manager: "", startDate: TODAY.toISOString().slice(0, 10), endDate: "", budget: "" });
  const [touched, setTouched] = useState(false);
  const valid = form.name.trim() && form.client.trim();
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); setTouched(true); if (!valid) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[420px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Projects</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Project</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Project name" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Cold Chain Rollout" />
            {touched && !form.name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Project name is required.</p>}
          </FormField>
          <FormField label="Client" required>
            <input className={inputClass} value={form.client} onChange={(e) => set("client", e.target.value)} placeholder="e.g. Kilimo Fresh Distributors" />
            {touched && !form.client.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Client is required.</p>}
          </FormField>
          <FormField label="Project manager"><input className={inputClass} value={form.manager} onChange={(e) => set("manager", e.target.value)} placeholder="e.g. David Chen" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date"><input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></FormField>
            <FormField label="End date"><input type="date" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} /></FormField>
          </div>
          <FormField label="Budget (TZS 000)"><input type="number" min="0" className={inputClass} value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="0" /></FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Create Project</button>
        </div>
      </form>
    </div>
  );
}

const PROJECT_DETAIL_TABS = [
  { id: "tasks", label: "Tasks", icon: ListTodo },
  { id: "timeline", label: "Timeline", icon: CalendarCheck },
  { id: "milestones", label: "Milestones", icon: Flag },
  { id: "files", label: "Files", icon: FileText },
  { id: "budget", label: "Budget", icon: CircleDollarSign },
  { id: "timelog", label: "Time Log", icon: Clock },
];

function ProjectDetail({ project, onBack, onSetStatus, tasksHook, milestonesHook, expensesHook, financeExpensesHook, filesHook, currentUser }) {
  const [tab, setTab] = useState("tasks");
  const projectTasks = tasksHook.rows.filter((t) => t.projectId === project.id);
  const projectMilestones = milestonesHook.rows.filter((m) => m.projectId === project.id);

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-[12.5px] font-medium text-slate-500 hover:text-[#111827] flex items-center gap-1">
        <ChevronRight size={14} className="rotate-180" /> All Projects
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">{project.name}</h1>
          <p className="text-[13px] text-slate-500 mt-1">{project.client} · Managed by {project.manager || "Unassigned"}</p>
        </div>
        <select
          value={project.status}
          onChange={(e) => onSetStatus(e.target.value)}
          className="text-[12.5px] font-medium rounded-lg px-3 py-2 border shrink-0"
          style={{ borderColor: `${PROJECT_STATUS_COLOR[project.status]}40`, color: PROJECT_STATUS_COLOR[project.status], backgroundColor: `${PROJECT_STATUS_COLOR[project.status]}0a` }}
        >
          {Object.keys(PROJECT_STATUS_COLOR).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {PROJECT_DETAIL_TABS.map((t) => {
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

      {tab === "tasks" && <ProjectTasks project={project} tasksHook={tasksHook} />}
      {tab === "timeline" && <ProjectTimeline tasks={projectTasks} milestones={projectMilestones} />}
      {tab === "milestones" && <ProjectMilestones project={project} milestonesHook={milestonesHook} />}
      {tab === "files" && <ProjectFiles project={project} filesHook={filesHook} />}
      {tab === "budget" && <ProjectBudget project={project} expensesHook={expensesHook} financeExpensesHook={financeExpensesHook} />}
      {tab === "timelog" && <ProjectTimeLog project={project} currentUser={currentUser} />}
    </div>
  );
}

/* ------------------------------ PROJECT TASKS (KANBAN + LIST) ------------------------------ */

function ProjectTasks({ project, tasksHook }) {
  const [view, setView] = useState("board");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { rows: allTasks, setRows: setAllTasks } = tasksHook;
  const tasks = allTasks.filter((t) => t.projectId === project.id);

  const grouped = useMemo(() => {
    const g = {};
    TASK_STATUSES.forEach((s) => (g[s] = []));
    tasks.forEach((t) => g[t.status]?.push(t));
    return g;
  }, [tasks]);

  async function addTask(form) {
    const draft = { id: docId("TSK"), projectId: project.id, title: form.title, assignee: form.assignee, status: "To Do", priority: form.priority, dueDate: form.dueDate };
    setAllTasks((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Task added: ${draft.title}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("project_tasks").insert({
          project_ref: project.id, title: draft.title, assignee: draft.assignee, status: "To Do", priority: draft.priority, due_date: draft.dueDate,
        }).single().run();
        if (header?.id) setAllTasks((prev) => prev.map((t) => (t.id === draft.id ? { ...t, dbId: header.id } : t)));
      } catch (_e) { notify("Task added locally, but saving to the server failed.", "error"); }
    }
  }

  async function moveTask(id, status) {
    const t = allTasks.find((x) => x.id === id);
    setAllTasks((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    if (IS_CONFIGURED && t?.dbId) {
      try { await sb("project_tasks").eq("id", t.dbId).update({ status }).run(); } catch (_e) { notify("Couldn't save the task status to the server.", "error"); }
    }
  }

  async function deleteTask(id) {
    const t = allTasks.find((x) => x.id === id);
    setAllTasks((prev) => prev.filter((x) => x.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && t?.dbId) {
      try { await sb("project_tasks").eq("id", t.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the task on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button onClick={() => setView("board")} className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${view === "board" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>Board</button>
          <button onClick={() => setView("list")} className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${view === "list" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>List</button>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm shrink-0">
          <Plus size={15} /> New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <EmptyState icon={ListTodo} title="No tasks yet" hint="Break this project into tasks and track them on the board." actionLabel="New Task" onAction={() => setShowForm(true)} />
        </div>
      ) : view === "board" ? (
        <div className="flex sm:grid sm:grid-cols-4 gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {TASK_STATUSES.map((status) => (
            <div key={status} className="bg-slate-50 rounded-xl p-2.5 min-h-[280px] w-[220px] sm:w-auto shrink-0 snap-start">
              <div className="flex items-center justify-between px-1.5 py-1.5 mb-1">
                <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${TASK_STATUS_COLOR[status]}14`, color: TASK_STATUS_COLOR[status] }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TASK_STATUS_COLOR[status] }} />{status}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{grouped[status].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[status].map((t) => (
                  <button key={t.id} onClick={() => setSelected(t)} className="w-full text-left bg-white rounded-lg border border-slate-200/80 p-3 hover:border-[#16A34A]/50 hover:shadow-sm transition-all">
                    <p className="text-[13px] font-medium text-[#111827] leading-snug mb-1.5">{t.title}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${PRIORITY_COLOR[t.priority]}14`, color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                      <span className="text-[10.5px] text-slate-400 font-mono">{t.dueDate}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[600px]">
              <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Task</th><th className="px-4 py-3 font-medium">Assignee</th><th className="px-4 py-3 font-medium">Priority</th><th className="px-4 py-3 font-medium">Due</th><th className="px-4 py-3 font-medium">Status</th>
              </tr></thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id} onClick={() => setSelected(t)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                    <td className="px-4 py-3 font-medium text-[#111827]">{t.title}</td>
                    <td className="px-4 py-3 text-slate-500">{t.assignee}</td>
                    <td className="px-4 py-3"><span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${PRIORITY_COLOR[t.priority]}14`, color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span></td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{t.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${TASK_STATUS_COLOR[t.status]}14`, color: TASK_STATUS_COLOR[t.status] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TASK_STATUS_COLOR[t.status] }} />{t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && <TaskPanel task={selected} onClose={() => setSelected(null)} onMove={moveTask} onDelete={deleteTask} />}
      {showForm && <TaskFormPanel onClose={() => setShowForm(false)} onSubmit={addTask} />}
    </div>
  );
}

function TaskPanel({ task, onClose, onMove, onDelete }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div><p className="text-[11px] font-mono text-slate-400">{task.id}</p><h2 className="text-[17px] font-semibold text-[#111827] mt-0.5 leading-snug">{task.title}</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${TASK_STATUS_COLOR[task.status]}14`, color: TASK_STATUS_COLOR[task.status] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TASK_STATUS_COLOR[task.status] }} />{task.status}
          </span>
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${PRIORITY_COLOR[task.priority]}14`, color: PRIORITY_COLOR[task.priority] }}>{task.priority} priority</span>
        </div>
        <div className="space-y-3 mb-6 text-[13px]">
          <div className="flex items-center gap-2.5 text-slate-600"><Users size={14} className="text-slate-400" /> {task.assignee || "Unassigned"}</div>
          <div className="flex items-center gap-2.5 text-slate-600"><Clock size={14} className="text-slate-400" /> Due {task.dueDate}</div>
        </div>
        <div className="flex-1" />
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
          <p className="text-[11px] font-medium text-slate-500">Move to</p>
          <div className="grid grid-cols-2 gap-1.5">
            {TASK_STATUSES.map((s) => (
              <button key={s} onClick={() => onMove(task.id, s)} disabled={s === task.status} className={`text-[11.5px] font-medium rounded-lg py-2 border transition-colors ${s === task.status ? "opacity-40 cursor-not-allowed border-slate-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                {s}
              </button>
            ))}
          </div>
          <ConfirmDeleteButton label="Delete task" onConfirm={() => onDelete(task.id)} />
        </div>
      </div>
    </div>
  );
}

function TaskFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", assignee: "", priority: "Medium", dueDate: TODAY.toISOString().slice(0, 10) });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.title.trim()) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Task</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Task</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Title" required><input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Install racking system" /></FormField>
          <FormField label="Assignee"><input className={inputClass} value={form.assignee} onChange={(e) => set("assignee", e.target.value)} placeholder="e.g. Grace Mmbaga" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Priority">
              <select className={inputClass} value={form.priority} onChange={(e) => set("priority", e.target.value)}>
                {Object.keys(PRIORITY_COLOR).map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Due date"><input type="date" className={inputClass} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></FormField>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Add Task</button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------------ TIMELINE ------------------------------------ */

// A chronological merge of tasks and milestones — not a full Gantt chart,
// but a genuine date-ordered view of everything on this project, each
// entry colored by its real, live-computed status.
function ProjectTimeline({ tasks, milestones }) {
  const todayStr = TODAY.toISOString().slice(0, 10);
  const items = useMemo(() => {
    const taskItems = tasks.map((t) => ({ kind: "task", date: t.dueDate, title: t.title, sub: t.assignee, color: TASK_STATUS_COLOR[t.status], label: t.status }));
    const msItems = milestones.map((m) => { const s = milestoneStatus(m); return { kind: "milestone", date: m.dueDate, title: m.title, sub: "Milestone", color: MILESTONE_STATUS_COLOR[s], label: s }; });
    return [...taskItems, ...msItems].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }, [tasks, milestones]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
      {items.length === 0 ? (
        <EmptyState icon={CalendarCheck} title="Nothing scheduled yet" hint="Tasks and milestones with due dates will appear here in order." />
      ) : (
        <div className="relative pl-5 space-y-5">
          <div className="absolute left-[5px] top-1 bottom-1 w-px bg-slate-100" />
          {items.map((it, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white" style={{ backgroundColor: it.color }} />
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-[#111827] truncate">{it.kind === "milestone" && <Flag size={11} className="inline mr-1 -mt-0.5" />}{it.title}</p>
                  <p className="text-[11px] text-slate-400">{it.sub}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[12px] font-mono ${it.date < todayStr && it.label !== "Done" && it.label !== "Completed" ? "text-[#EF4444] font-medium" : "text-slate-500"}`}>{it.date}</p>
                  <p className="text-[10.5px]" style={{ color: it.color }}>{it.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------ MILESTONES ------------------------------------ */

function ProjectMilestones({ project, milestonesHook }) {
  const { rows: allMilestones, setRows: setAllMilestones } = milestonesHook;
  const [showForm, setShowForm] = useState(false);
  const milestones = allMilestones.filter((m) => m.projectId === project.id);

  async function addMilestone(form) {
    const draft = { id: docId("MS"), projectId: project.id, title: form.title, dueDate: form.dueDate, completed: false };
    setAllMilestones((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Milestone added: ${draft.title}`);
    if (IS_CONFIGURED) {
      try { await sb("project_milestones").insert({ project_ref: project.id, title: draft.title, due_date: draft.dueDate, completed: false }).run(); } catch (_e) { notify("Added locally, but saving to the server failed.", "error"); }
    }
  }

  async function toggleComplete(id) {
    const m = allMilestones.find((x) => x.id === id);
    const next = !m.completed;
    setAllMilestones((prev) => prev.map((x) => (x.id === id ? { ...x, completed: next } : x)));
    if (IS_CONFIGURED && m?.dbId) {
      try { await sb("project_milestones").eq("id", m.dbId).update({ completed: next }).run(); } catch (_e) { notify("Couldn't save the milestone on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Milestone
        </button>
      </div>
      {milestones.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <EmptyState icon={Flag} title="No milestones yet" hint="Mark the key dates that matter for this project." actionLabel="New Milestone" onAction={() => setShowForm(true)} />
        </div>
      ) : (
        <div className="space-y-2.5">
          {milestones.map((m) => {
            const status = milestoneStatus(m);
            return (
              <div key={m.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button onClick={() => toggleComplete(m.id)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${m.completed ? "bg-[#16A34A] border-[#16A34A]" : "border-slate-300"}`} aria-label={m.completed ? "Mark incomplete" : "Mark complete"}>
                    {m.completed && <CheckCircle2 size={12} className="text-white" />}
                  </button>
                  <div className="min-w-0">
                    <p className={`text-[13.5px] font-medium truncate ${m.completed ? "text-slate-400 line-through" : "text-[#111827]"}`}>{m.title}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{m.dueDate}</p>
                  </div>
                </div>
                <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5 shrink-0" style={{ backgroundColor: `${MILESTONE_STATUS_COLOR[status]}14`, color: MILESTONE_STATUS_COLOR[status] }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: MILESTONE_STATUS_COLOR[status] }} />{status}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {showForm && <MilestoneFormPanel onClose={() => setShowForm(false)} onSubmit={addMilestone} />}
    </div>
  );
}

function MilestoneFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", dueDate: TODAY.toISOString().slice(0, 10) });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.title.trim()) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[360px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Milestone</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Milestone</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Title" required><input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Phase 1 complete" /></FormField>
          <FormField label="Due date"><input type="date" className={inputClass} value={form.dueDate} onChange={(e) => set("dueDate", e.target.value)} /></FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Add Milestone</button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------------- FILES -------------------------------------- */

// Not a separate document store — the same reasoning HR's Documents
// decision already established. Files here are real rows in the shared
// Documents table, filtered to this project via linkedRecord, so a file
// uploaded from either screen shows up consistently in both.
function ProjectFiles({ project, filesHook }) {
  const linkedFiles = filesHook.rows.filter((f) => f.linkedRecord === project.id);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <FileText size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          These are real files from the Documents module, linked to this project — not a separate store. Upload from Documents and link it to <span className="font-mono">{project.id}</span> to see it here.
        </p>
      </div>
      {linkedFiles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <EmptyState icon={FileText} title="No files linked yet" hint="Link a file to this project from the Documents module." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {linkedFiles.map((f) => (
            <div key={f.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5">
              <p className="text-[13px] font-medium text-[#111827] truncate">{f.name}</p>
              <p className="text-[11px] text-slate-400">{f.type} · {f.size}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------- BUDGET -------------------------------------- */

// Project Time Log — team members log hours against a project.
// Each entry records who did what and for how long.
// Total hours and daily breakdown visible at a glance.
// Integrates with the project budget for labour cost tracking.
const HOURLY_RATE_DEFAULT = 35; // TZS 35k/hour default billable rate

function ProjectTimeLog({ project, currentUser }) {
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), hours: "", description: "", person: currentUser?.name || "" });
  const [touched, setTouched] = useState(false);

  const totalHours = entries.reduce((s, e) => s + e.hours, 0);
  const totalCost = totalHours * HOURLY_RATE_DEFAULT;

  // Group entries by date for the daily breakdown
  const byDate = entries.reduce((acc, e) => {
    acc[e.date] = (acc[e.date] || 0) + e.hours;
    return acc;
  }, {});

  function addEntry() {
    setTouched(true);
    if (!form.hours || Number(form.hours) <= 0 || !form.description.trim()) return;
    const entry = {
      id: docId("TL"),
      date: form.date,
      person: form.person || currentUser?.name || "Unassigned",
      hours: Number(form.hours),
      description: form.description.trim(),
    };
    setEntries((prev) => [entry, ...prev]);
    setForm((f) => ({ ...f, hours: "", description: "" }));
    setTouched(false);
    notify("Time entry logged: " + entry.hours + "h on " + project.name);
    logAudit("Time logged: " + entry.hours + "h", "Projects", currentUser?.name || "System", project.name + " — " + entry.description);
  }

  function removeEntry(id) {
    confirmAction("Remove this time entry?", () => setEntries((prev) => prev.filter((e) => e.id !== id)), { variant: "danger", confirmLabel: "Remove" });
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 text-center">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Total Hours</p>
          <p className="text-[22px] font-bold text-[#111827]">{totalHours.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 text-center">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Labour Cost</p>
          <p className="text-[22px] font-bold text-[#16A34A]">TZS {money(Math.round(totalCost))}k</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 p-3 text-center">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Log Entries</p>
          <p className="text-[22px] font-bold text-[#111827]">{entries.length}</p>
        </div>
      </div>

      {/* Add entry form */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 space-y-3">
        <p className="text-[13px] font-medium text-[#111827]">Log time</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <FormField label="Date">
            <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </FormField>
          <FormField label="Person">
            <input className={inputClass} value={form.person} onChange={(e) => setForm({ ...form, person: e.target.value })} placeholder="Your name" />
          </FormField>
          <FormField label="Hours">
            <input type="number" min="0.25" step="0.25" className={inputClass} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} placeholder="e.g. 2.5" />
          </FormField>
          <FormField label="What you worked on">
            <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" />
          </FormField>
        </div>
        {touched && (!form.hours || Number(form.hours) <= 0) && <p className="text-[11.5px] text-[#EF4444]">Enter hours above zero.</p>}
        {touched && !form.description.trim() && <p className="text-[11.5px] text-[#EF4444]">Add a description.</p>}
        <button onClick={addEntry} className="btn-primary text-white text-[12.5px] font-medium rounded-xl px-4 py-2.5">Log Hours</button>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm py-10 text-center">
          <Clock size={28} className="text-slate-200 mx-auto mb-2" />
          <p className="text-[13px] font-medium text-slate-400">No time logged yet</p>
          <p className="text-[11.5px] text-slate-400 mt-1">Add your first entry above to start tracking project hours.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100">
              {["Date", "Person", "Hours", "Description", "Cost", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-mono text-[11.5px] text-slate-500">{e.date}</td>
                  <td className="px-4 py-2.5 font-medium text-[#111827]">{e.person}</td>
                  <td className="px-4 py-2.5 font-mono font-bold text-[#111827]">{e.hours.toFixed(1)}h</td>
                  <td className="px-4 py-2.5 text-slate-600 max-w-[200px] truncate">{e.description}</td>
                  <td className="px-4 py-2.5 font-mono text-[#16A34A]">TZS {money(Math.round(e.hours * HOURLY_RATE_DEFAULT))}k</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => removeEntry(e.id)} className="text-slate-300 hover:text-[#EF4444]"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
              <tr className="bg-slate-50 border-t-2 border-slate-200">
                <td colSpan={2} className="px-4 py-2.5 text-[11.5px] font-semibold text-slate-500">Total</td>
                <td className="px-4 py-2.5 font-mono font-bold text-[#111827]">{totalHours.toFixed(1)}h</td>
                <td />
                <td className="px-4 py-2.5 font-mono font-bold text-[#16A34A]">TZS {money(Math.round(totalCost))}k</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ProjectBudget({ project, expensesHook, financeExpensesHook }) {
  const { rows: allExpenses, setRows: setAllExpenses } = expensesHook;
  const [showForm, setShowForm] = useState(false);
  const spend = allExpenses.filter((e) => e.projectId === project.id);
  const totalSpent = spend.reduce((s, e) => s + e.amount, 0);
  const remaining = project.budget - totalSpent;
  const pctUsed = project.budget > 0 ? Math.min(100, Math.round((totalSpent / project.budget) * 100)) : 0;

  async function logExpense(form) {
    const draft = { id: docId("PE"), projectId: project.id, description: form.description, amount: Number(form.amount) || 0, date: TODAY.toISOString().slice(0, 10) };
    setAllExpenses((prev) => [draft, ...prev]);
    setShowForm(false);

    // Mirrors Maintenance's pattern exactly: a real cost here creates a
    // real Finance expense, not just a number inside Projects.
    const financeDraft = { id: docId("EX"), vendor: `Project: ${project.name}`, category: "Project Costs", date: draft.date, dueDate: draft.date, amount: draft.amount, status: "Paid", method: "Cash" };
    financeExpensesHook.setRows((prev) => [financeDraft, ...prev]);
    notify(`Expense logged — TZS ${money(draft.amount)}k recorded in Finance`);

    if (IS_CONFIGURED) {
      try {
        await sb("project_expenses").insert({ project_ref: project.id, description: draft.description, amount: draft.amount, expense_date: draft.date }).run();
        const header = await sb("finance_expenses").insert({
          vendor: financeDraft.vendor, category: "Project Costs", expense_date: financeDraft.date,
          due_date: financeDraft.dueDate, amount: financeDraft.amount, status: "Paid", method: "Cash",
        }).single().run();
        if (header?.id) financeExpensesHook.setRows((prev) => prev.map((e) => (e.id === financeDraft.id ? { ...e, dbId: header.id } : e)));
      } catch (_e) { notify("Logged locally, but saving to the server failed.", "error"); }
    }
  }


  const byCategory = useMemo(() => {
    const map = {};
    spend.forEach(e => { map[e.category]=(map[e.category]||0)+e.amount; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([name,value],i)=>({
      name, value:Math.round(value),
      fill:["#2563EB","#16A34A","#F59E0B","#EF4444","#7C3AED","#0891B2"][i%6],
    }));
  }, [spend]);

  const spendTrend = useMemo(()=>Array.from({length:6},(_,i)=>{
    const d = new Date(TODAY); d.setDate(d.getDate()-35+i*7);
    const ws = d.toISOString().slice(0,10);
    const we = new Date(d.getTime()+7*86400000).toISOString().slice(0,10);
    return {week:"W"+(i+1), spend:Math.round(spend.filter(e=>(e.date||"")>=ws&&(e.date||"")<we).reduce((s,e)=>s+e.amount,0))};
  }),[spend]);

  return (
    <div className="space-y-5">
      {spend.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-2">Spend by Category</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="55%" height={130}>
                <RPieChart>
                  <Pie data={byCategory} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {byCategory.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                  </Pie>
                  <Tooltip formatter={(v)=>["TZS "+money(v)+"k","Spent"]}/>
                </RPieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-1.5">
                {byCategory.slice(0,4).map(d=>(
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[11.5px] text-slate-600">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{background:d.fill}}/>
                      {d.name}
                    </span>
                    <span className="text-[11.5px] font-mono font-bold" style={{color:d.fill}}>TZS {money(d.value)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-2">Weekly Spend</h3>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={spendTrend} margin={{left:-10,right:4,top:0,bottom:0}}>
                <CartesianGrid vertical={false} stroke="#F3F4F6"/>
                <XAxis dataKey="week" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                <Tooltip formatter={(v)=>["TZS "+money(v)+"k","Spent"]}/>
                <Bar dataKey="spend" fill="#2563EB" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[11px] text-slate-400 mt-1">Budget used: <strong style={{color:pctUsed>=90?"#EF4444":pctUsed>=70?"#F59E0B":"#16A34A"}}>{pctUsed}%</strong></p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div><p className="text-[11px] text-slate-400 mb-1">Budget</p><p className="text-[16px] font-mono font-semibold text-[#111827]">TZS {money(project.budget)}k</p></div>
          <div><p className="text-[11px] text-slate-400 mb-1">Spent</p><p className="text-[16px] font-mono font-semibold text-[#F59E0B]">TZS {money(Math.round(totalSpent))}k</p></div>
          <div><p className="text-[11px] text-slate-400 mb-1">Remaining</p><p className={`text-[16px] font-mono font-semibold ${remaining >= 0 ? "text-[#16A34A]" : "text-[#EF4444]"}`}>TZS {money(Math.round(remaining))}k</p></div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pctUsed}%`, backgroundColor: pctUsed >= 100 ? "#EF4444" : pctUsed >= 80 ? "#F59E0B" : "#16A34A" }} />
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">{pctUsed}% of budget used</p>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> Log Expense
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[480px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium text-right">Amount (TZS 000)</th>
            </tr></thead>
            <tbody>
              {spend.map((e) => (
                <tr key={e.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 text-[#111827]">{e.description}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{e.date}</td>
                  <td className="px-4 py-3 text-right font-mono">{money(e.amount)}</td>
                </tr>
              ))}
              {spend.length === 0 && <tr><td colSpan={3}><EmptyState icon={CircleDollarSign} title="No expenses logged yet" hint="Log project costs to track spend against budget." actionLabel="Log Expense" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <ProjectExpenseFormPanel onClose={() => setShowForm(false)} onSubmit={logExpense} />}
    </div>
  );
}

function ProjectExpenseFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ description: "", amount: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.description.trim() || !(Number(form.amount) > 0)) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[360px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Budget</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Log Expense</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Description" required><input className={inputClass} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Racking materials" /></FormField>
          <FormField label="Amount (TZS 000)" required><input type="number" min="0" className={inputClass} value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0" /></FormField>
          <p className="text-[11.5px] text-slate-400">This creates a real "Project Costs" expense in Finance automatically.</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Log Expense</button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------ CUSTOMER SUPPORT ------------------------------ */

const SUPPORT_TABS = [
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "chat", label: "Live Chat", icon: MessageCircle },
  { id: "kb", label: "Knowledge Base", icon: BookOpen },
  { id: "calls", label: "Call Center", icon: PhoneCall },
  { id: "ai", label: "AI Assistant", icon: Brain },
];

export default Documents;
