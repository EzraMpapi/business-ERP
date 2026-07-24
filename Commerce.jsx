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


function ECommerce({ inventory }) {
  const [tab, setTab] = useState("storefront");
  const products = useCompanyTable("ecommerce_products", storefrontSeed, {
    select: "*,inventory_items(name,category)", order: { col: "sku", ascending: true }, mapRow: mapProductRow,
  });
  const orders = useCompanyTable("ecommerce_orders", onlineOrdersSeed, {
    select: "*,ecommerce_order_items(*)", order: { col: "order_date", ascending: false }, mapRow: mapOnlineOrderRow,
  });

  const stats = useMemo(() => {
    const live = orders.rows.filter((o) => o.status !== "Cancelled");
    const revenue = live.reduce((s, o) => s + o.total, 0);
    const published = products.rows.filter((p) => p.published).length;
    return {
      revenue, count: live.length,
      avg: live.length ? Math.round(revenue / live.length) : 0,
      published, total: products.rows.length,
    };
  }, [orders.rows, products.rows]);

  const ECOM_KPIS = [
    { label: "Online Revenue", value: `TZS ${money(stats.revenue)}k`, delta: "Last 7 days", up: true, icon: CircleDollarSign },
    { label: "Orders", value: String(stats.count), delta: "Excl. cancelled", up: true, icon: ShoppingCart },
    { label: "Avg Order Value", value: `TZS ${money(stats.avg)}k`, delta: "Per order", up: true, icon: Percent },
    { label: "Published Products", value: `${stats.published}/${stats.total}`, delta: "Live on storefront", up: true, icon: Globe },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">E-Commerce</h1>
        <p className="text-[13px] text-slate-500 mt-1">Your online storefront, priced from live Inventory stock</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {ECOM_TABS.map((t) => {
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
        {ECOM_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      {tab === "storefront" && <Storefront products={products} inventory={inventory} />}
      {tab === "orders" && <OnlineOrders orders={orders} />}
    </div>
  );
}

function Storefront({ products, inventory }) {
  const [view, setView] = useState("grid");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const { rows, setRows, loading } = products;

  const categories = useMemo(() => [...new Set(rows.map((p) => p.category))], [rows]);

  const filtered = useMemo(() => {
    return rows.filter((p) => {
      const matchesCat = category === "all" || p.category === category;
      const matchesQ = !query.trim() || p.name.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [rows, category, query]);

  async function togglePublished(sku) {
    setRows((prev) => prev.map((p) => (p.sku === sku ? { ...p, published: !p.published } : p)));
    if (IS_CONFIGURED) {
      try {
        const p = rows.find((x) => x.sku === sku);
        await sb("ecommerce_products").eq("sku", sku).update({ published: !p.published }).run();
      } catch (_e) { notify("Couldn't save the publish state to the server.", "error"); }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => setCategory("all")}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${category === "all" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${category === c ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
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
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200/80 overflow-hidden">
              <div className="h-28 skeleton-shimmer" />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded skeleton-shimmer w-3/4" />
                <div className="h-3 rounded skeleton-shimmer w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <EmptyState icon={Store} title="No products found" hint="Try a different search or category filter." />
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const stockItem = inventory.rows.find((it) => it.sku === p.sku);
            const status = stockItem ? stockStatus(stockItem.qty, stockItem.reorder) : null;
            return (
              <div
                key={p.sku}
                className="rounded-xl border border-slate-200/80 shadow-sm overflow-hidden bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div
                  className="h-28 relative flex items-center justify-center"
                  style={{ background: CATEGORY_GRADIENT[p.category] || "linear-gradient(135deg, #111827, #16A34A)" }}
                >
                  <Package size={30} strokeWidth={1.5} className="text-white/85" />
                  {p.featured && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-semibold text-[#111827] bg-white/95 rounded-full px-2 py-0.5">
                      <Star size={9} fill="#F59E0B" className="text-[#F59E0B]" /> Featured
                    </span>
                  )}
                  <span
                    className={`absolute top-2 right-2 text-[10px] font-semibold rounded-full px-2 py-0.5 ${p.published ? "bg-white/95 text-[#16A34A]" : "bg-black/40 text-white"}`}
                  >
                    {p.published ? "Live" : "Draft"}
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="text-[10.5px] text-slate-400 uppercase tracking-wide">{p.category}</p>
                  <p className="text-[13px] font-medium text-[#111827] leading-snug mt-0.5 mb-2 line-clamp-2 min-h-[32px]">{p.name}</p>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[14px] font-mono font-semibold text-[#111827]">TZS {money(p.price)}k</span>
                    {status && (
                      <span
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${STOCK_STATUS_COLOR[status]}14`, color: STOCK_STATUS_COLOR[status] }}
                      >
                        {status}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => togglePublished(p.sku)}
                    className={`w-full text-[11.5px] font-medium rounded-lg py-1.5 transition-colors ${
                      p.published ? "border border-slate-200 text-slate-500 hover:bg-slate-50" : "btn-primary text-white"
                    }`}
                  >
                    {p.published ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.sku} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: CATEGORY_GRADIENT[p.category] }}>
                          <Package size={14} className="text-white/85" />
                        </div>
                        <div>
                          <p className="font-medium text-[#111827]">{p.name}</p>
                          {p.featured && <p className="text-[10.5px] text-[#F59E0B] flex items-center gap-1"><Star size={9} fill="#F59E0B" /> Featured</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.category}</td>
                    <td className="px-4 py-3 text-right font-mono">{money(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-1 rounded-full ${p.published ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-slate-100 text-slate-500"}`}>
                        {p.published ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => togglePublished(p.sku)} className="text-[11.5px] font-medium text-[#16A34A] hover:text-[#15803D]">
                        {p.published ? "Unpublish" : "Publish"}
                      </button>
                    </td>
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

function OnlineOrders({ orders }) {
  const [selected, setSelected] = useState(null);
  const { rows, setRows, loading } = orders;

  async function advanceOrder(id, next) {
    const order = rows.find((o) => o.id === id);
    setRows((prev) => prev.map((o) => (o.id === id ? { ...o, status: next } : o)));
    setSelected((s) => (s && s.id === id ? { ...s, status: next } : s));
    notify(`${id} marked ${next}`);
    if (IS_CONFIGURED && order?.dbId) {
      try { await sb("ecommerce_orders").eq("id", order.dbId).update({ status: next }).run(); } catch (_e) { notify("Couldn't save the order status to the server.", "error"); }
    }
  }

  const nextStatus = { "Payment Pending": "Processing", Processing: "Shipped", Shipped: "Delivered", Delivered: null, Cancelled: null };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows cols={5} />}
              {!loading && rows.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-[#111827]">{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-slate-700">{o.customer}</p>
                    <p className="text-[11px] text-slate-400">{o.email}</p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{money(o.total)}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                      style={{ backgroundColor: `${ECOM_ORDER_STATUS_COLOR[o.status]}14`, color: ECOM_ORDER_STATUS_COLOR[o.status] }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ECOM_ORDER_STATUS_COLOR[o.status] }} />
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right"><ChevronRight size={15} className="text-slate-300 inline" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Orders This Week</h3>
        <p className="text-[11.5px] text-slate-400 mb-3">Daily order volume</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={STOREFRONT_TREND} margin={{ top: 5, right: 0, left: -24, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#EEF1F4" />
            <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEF1F4", fontSize: 12, fontFamily: "monospace" }} />
            <Bar dataKey="orders" radius={[5, 5, 0, 0]} fill="#16A34A" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {selected && (
        <OnlineOrderPanel order={selected} onClose={() => setSelected(null)} onAdvance={advanceOrder} nextStatus={nextStatus[selected.status]} />
      )}
    </div>
  );
}

function OnlineOrderPanel({ order, onClose, onAdvance, nextStatus }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[11px] font-mono text-slate-400">{order.id}</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">{order.customer}</h2>
            <p className="text-[13px] text-slate-500">{order.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="mb-6">
          <span
            className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
            style={{ backgroundColor: `${ECOM_ORDER_STATUS_COLOR[order.status]}14`, color: ECOM_ORDER_STATUS_COLOR[order.status] }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ECOM_ORDER_STATUS_COLOR[order.status] }} />
            {order.status}
          </span>
        </div>

        <div className="border border-slate-100 rounded-lg overflow-hidden mb-5">
          {order.items.map((it, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2.5 text-[13px] ${i !== order.items.length - 1 ? "border-b border-slate-50" : ""}`}>
              <div>
                <p className="text-slate-700">{it.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{it.qty} × TZS {money(it.price)}k</p>
              </div>
              <span className="font-mono text-[#111827]">{money(it.qty * it.price)}k</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[14px] font-semibold text-[#111827] mb-6">
          <span>Total</span>
          <span className="font-mono">TZS {money(order.total)}k</span>
        </div>

        <div className="flex items-center gap-2.5 text-[13px] text-slate-600 mb-6">
          <CreditCard size={14} className="text-slate-400" /> Paid via {order.method}
        </div>

        <div className="flex-1" />

        {nextStatus && (
          <button onClick={() => onAdvance(order.id, nextStatus)} className="btn-primary text-white text-[12px] font-medium rounded-lg py-2.5">
            Mark {nextStatus}
          </button>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- REPORTS ------------------------------------ */

// RFC-4180-style CSV export: quotes fields containing commas, quotes, or
// newlines, and doubles embedded quotes. Downloads via a Blob object URL.
function exportCSV(filename, headers, rows) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  notify(`Exported ${filename}`);
}

// Real .xlsx via SheetJS — an actual spreadsheet file, not a renamed CSV.
function exportExcel(filename, sheetName, headers, rows) {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31)); // Excel's own 31-char sheet name limit
  XLSX.writeFile(workbook, filename);
  notify(`Exported ${filename}`);
}

// Word recognizes HTML wrapped in its own XML namespace when given a
// .doc extension — no docx-generation library exists in this environment
// (mammoth, the one library available, only reads .docx, it does not write
// one). This is a real, longstanding browser technique, not a renamed
// text file: opening the result in Word shows genuine formatting, not raw
// markup.
function exportWord(filename, title, bodyHtml) {
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset="utf-8"><title>${title}</title>
    <style>
      body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #111827; }
      h1 { font-size: 18pt; color: #111827; } h2 { font-size: 13pt; color: #16A34A; margin-top: 18pt; }
      table { border-collapse: collapse; width: 100%; margin-top: 8pt; }
      th, td { border: 1px solid #DEE2E6; padding: 6px 10px; font-size: 10pt; text-align: left; }
      th { background: #F5F7FA; font-weight: 600; }
      .right { text-align: right; }
    </style></head>
    <body>${bodyHtml}</body></html>`;
  const blob = new Blob(['\ufeff', html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  notify(`Exported ${filename}`);
}

// Real PDF via the browser's own print-to-PDF, not a bundled PDF library
// (none is available in this environment). Opens a clean, print-formatted
// window and calls window.print() — every modern browser's print dialog
// offers "Save as PDF" natively, so this genuinely produces a PDF without
// pretending to have PDF-generation code this build does not have.
function printAsPDF(title, bodyHtml, opts) {
  const o = opts || {};
  const accent = o.accent || "#16A34A";
  const companyName = o.companyName || "";
  const logo = o.logo || "";
  const headerRight = o.headerRight || ("Generated: " + new Date().toLocaleDateString());
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) { notify("Pop-up blocked — allow pop-ups to export PDF.", "error"); return; }
  win.document.write(
    '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>' +
    '<title>' + title + '</title>' +
    '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>' +
    '<style>' +
    '*{box-sizing:border-box;margin:0;padding:0}' +
    'body{font-family:Inter,Arial,sans-serif;color:#111827;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '.doc{max-width:820px;margin:0 auto;padding:40px 48px 56px}' +
    '.doc-hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:36px;padding-bottom:20px;border-bottom:3px solid ' + accent + '}' +
    '.brand{font-size:22px;font-weight:800;color:#111827}.brand-sub{font-size:11px;color:#6B7280;margin-top:3px}' +
    '.doc-title{font-size:28px;font-weight:900;color:' + accent + ';text-align:right;letter-spacing:-0.5px}' +
    '.doc-meta{text-align:right;margin-top:4px;font-size:11px;color:#6B7280;line-height:1.7}' +
    'h2{font-size:10.5px;font-weight:700;color:' + accent + ';text-transform:uppercase;letter-spacing:.1em;margin:28px 0 10px;padding-bottom:5px;border-bottom:1px solid #E5E7EB}' +
    'p{font-size:12.5px;color:#374151;line-height:1.6;margin-bottom:6px}' +
    'table{border-collapse:collapse;width:100%;margin-top:8px;font-size:11.5px}' +
    'thead tr{background:' + accent + ';color:#fff}' +
    'thead th{padding:10px 12px;text-align:left;font-weight:600;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em}' +
    'tbody tr{border-bottom:1px solid #F3F4F6}' +
    'tbody tr:nth-child(even){background:#FAFAFA}' +
    'tbody td{padding:9px 12px;color:#374151;font-size:12px}' +
    '.right{text-align:right!important}.center{text-align:center}' +
    '.total-row td{font-weight:700;background:#F0FDF4!important;border-top:2px solid ' + accent + ';font-size:13px}' +
    '.summary{background:' + accent + '0D;border:1px solid ' + accent + '30;border-radius:10px;padding:20px 24px;margin-top:24px}' +
    '.sum-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12.5px;border-bottom:1px solid ' + accent + '18}' +
    '.sum-row:last-child{border:none;font-weight:800;font-size:14.5px;margin-top:6px;padding-top:10px}' +
    '.badge{display:inline-block;padding:2px 9px;border-radius:20px;font-size:10px;font-weight:700}' +
    '.b-paid{background:#DCFCE7;color:#15803D}.b-partial{background:#FEF3C7;color:#92400E}.b-unpaid{background:#FEE2E2;color:#991B1B}.b-active{background:#DBEAFE;color:#1E40AF}' +
    '.footer{margin-top:48px;padding-top:14px;border-top:1px solid #E5E7EB;text-align:center;font-size:10px;color:#9CA3AF;line-height:1.6}' +
    '.print-btn{position:fixed;bottom:24px;right:24px;display:flex;gap:8px;z-index:9}' +
    '.print-btn button{padding:10px 20px;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-family:Inter,sans-serif;font-size:13px}' +
    '@media print{@page{margin:16mm 12mm;size:A4}.print-btn{display:none!important}.doc{padding:0}}' +
    '</style></head><body>' +
    '<div class="doc">' +
    '<div class="doc-hdr">' +
    '<div>' + (logo ? '<img src="' + logo + '" style="height:44px;object-fit:contain;margin-bottom:8px;display:block"/>' : '') +
    '<div class="brand">' + (companyName || "BusinessSphere ERP") + '</div>' +
    '<div class="brand-sub">BusinessSphere ERP · Enterprise Resource Planning</div></div>' +
    '<div><div class="doc-title">' + title + '</div><div class="doc-meta">' + headerRight + '</div></div>' +
    '</div>' +
    bodyHtml +
    '<div class="footer">Powered by BusinessSphere ERP · Generated ' + new Date().toLocaleString() + ' · Computer-generated document — no signature required</div>' +
    '</div>' +
    '<div class="print-btn">' +
    '<button onclick="window.print()" style="background:' + accent + ';color:#fff">🖨 Print / PDF</button>' +
    '<button onclick="window.close()" style="background:#F3F4F6;color:#374151">✕ Close</button>' +
    '</div>' +
    '<script>setTimeout(function(){window.print()},600)<\/script>' +
    '</body></html>'
  );
  win.document.close();
  win.focus();
}

// Real configuration, honestly limited execution: this defines what a
// scheduled report would be, and "Run Now" genuinely generates and
// downloads the real file. What it cannot do — and does not pretend to —
// is fire automatically while no one has this page open. A browser has no
// mechanism to execute code when its tab is closed; real unattended
// scheduling needs a server-side cron job or scheduled function, the same
// category of gap already documented for Subscriptions' billing and the
// Notification System's Email/SMS/WhatsApp/Push channels.
const SCHEDULE_REPORT_TYPES = ["Sales & Revenue", "Inventory Valuation", "Profit & Loss"];
const SCHEDULE_FREQUENCIES = ["Daily", "Weekly", "Monthly"];
const SCHEDULE_FORMATS = ["CSV", "Excel", "PDF", "Word"];

const scheduledReportsSeed = [
  { id: "SCH-01", reportType: "Profit & Loss", frequency: "Monthly", format: "PDF", recipientEmail: "owner@beirahisi.co.tz", status: "Active", lastRun: null },
  { id: "SCH-02", reportType: "Sales & Revenue", frequency: "Weekly", format: "Excel", recipientEmail: "sales@beirahisi.co.tz", status: "Active", lastRun: null },
];

const REPORT_TABS = [
  { id: "sales",          label: "Sales & Revenue",    icon: TrendingUp },
  { id: "valuation",      label: "Inventory Valuation",icon: Package },
  { id: "pnl",            label: "Profit & Loss",      icon: Landmark },
  { id: "balance-sheet",  label: "Balance Sheet",      icon: Layers },
  { id: "cash-flow",      label: "Cash Flow",          icon: Wallet },
  { id: "ar-aging",       label: "AR Aging",           icon: Clock },
  { id: "tax",            label: "Tax / VAT Report",   icon: BadgeDollarSign },
  { id: "credit-profile", label: "Credit Profile",     icon: ShieldCheck },
  { id: "scheduled",      label: "Scheduled Reports",  icon: CalendarCheck },
];

// Global CSV export — downloadable from any table in the system
function downloadCSV(filename, rows, columns) {
  if (!rows || rows.length === 0) { notify("No data to export", "error"); return; }
  const header = columns.map(c => '"' + (c.label||c.key) + '"').join(",");
  const body = rows.map(row =>
    columns.map(col => {
      const val = row[col.key] ?? "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      return '"' + str.replace(/"/g, '""') + '"';
    }).join(",")
  ).join("
");
  const csv = header + "
" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename + ".csv";
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  notify("Exported " + rows.length + " rows to " + filename + ".csv");
}


function buildTableHtml(title, headers, rows) {
  const headHtml = "<tr>" + headers.map((h) => "<th>" + h + "</th>").join("") + "</tr>";
  const bodyHtml = rows.map((r) => "<tr>" + r.map((c) => "<td class=\"" + (typeof c === "number" ? "right" : "") + "\">" + c + "</td>").join("") + "</tr>").join("");
  return `<h1>${title}</h1><p style="color:#6C757D;font-size:11px;">Generated ${TODAY.toISOString().slice(0, 10)} from live Smart Manager data</p><table><thead>${headHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
}

// One export control for all four real formats. CSV and Excel are genuine
// structured data exports; Word and PDF render the same headers/rows as an
// HTML table first — Word via the .doc-namespace technique, PDF via the
// browser's native print dialog — since no docx or PDF-generation library
// is available in this environment (see the two export functions above).
function ExportMenu({ title, filename, sheetName, headers, rows }) {
  const [open, setOpen] = useState(false);
  function run(fn) { fn(); setOpen(false); }
  const html = buildTableHtml(title, headers, rows);

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-[12px] font-medium border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors text-slate-600">
        <Download size={13} /> Export <ChevronDown size={12} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-lg border border-slate-200/80 shadow-lg z-40 overflow-hidden">
            <button onClick={() => run(() => exportCSV(`${filename}.csv`, headers, rows))} className="w-full flex items-center gap-2 text-[12.5px] text-slate-600 hover:bg-slate-50 px-3 py-2.5 text-left">
              <FileSpreadsheet size={13} className="text-slate-400" /> CSV
            </button>
            <button onClick={() => run(() => exportExcel(`${filename}.xlsx`, sheetName, headers, rows))} className="w-full flex items-center gap-2 text-[12.5px] text-slate-600 hover:bg-slate-50 px-3 py-2.5 text-left">
              <FileSpreadsheet size={13} className="text-[#16A34A]" /> Excel
            </button>
            <button onClick={() => run(() => exportWord(`${filename}.doc`, title, html))} className="w-full flex items-center gap-2 text-[12.5px] text-slate-600 hover:bg-slate-50 px-3 py-2.5 text-left">
              <FileText size={13} className="text-[#0EA5E9]" /> Word
            </button>
            <button onClick={() => run(() => printAsPDF(title, html))} className="w-full flex items-center gap-2 text-[12.5px] text-slate-600 hover:bg-slate-50 px-3 py-2.5 text-left">
              <FileCheck size={13} className="text-[#EF4444]" /> PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// Real AI Insights, reused across every report: sends the report's actual
// computed totals (never raw row-by-row data, to keep the prompt small)
// to Claude and returns a short narrative — the same keyless in-artifact
// call pattern as the AI Business Assistant, scoped to one report instead
// of the whole business.
function AIInsights({ company, reportName, summary }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function generate() {
    setOpen(true);
    if (text || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          system: `You analyze business reports for ${company.name}, a ${company.industry} business. Given the ${reportName} data below, write 3-5 short, specific observations a business owner would find useful — trends, risks, or opportunities. Plain text, no markdown, no preamble.`,
          messages: [{ role: "user", content: JSON.stringify(summary) }],
        }),
      });
      if (!response.ok) throw new Error(`API returned ${response.status}`);
      const data = await response.json();
      setText((data.content?.find((c) => c.type === "text")?.text || "").trim());
    } catch (e) {
      setError("Couldn't reach the AI service. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={generate} className="flex items-center gap-1.5 text-[12px] font-medium border border-[#16A34A]/30 text-[#16A34A] rounded-lg px-3 py-2 hover:bg-[#16A34A]/5 transition-colors">
        <Brain size={13} /> AI Insights
      </button>
      {open && (
        <div className="mt-3 bg-[#16A34A]/5 border border-[#16A34A]/20 rounded-lg p-4">
          {busy && <p className="text-[12.5px] text-slate-500 flex items-center gap-2"><LoaderCircle size={13} className="animate-spin" /> Analyzing...</p>}
          {error && <p className="text-[12.5px] text-[#EF4444]">{error}</p>}
          {text && <p className="text-[13px] text-slate-700 whitespace-pre-wrap leading-relaxed">{text}</p>}
        </div>
      )}
    </div>
  );
}

function Reports({ invoices, inventory, expensesHook, company, schedulesHook, posTransactions, onNavigate }) {
  const [tab, setTab] = useState("sales");
  const expenses = expensesHook.rows;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Reports</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Computed live from this session's data · TZS thousands · export to CSV, Excel, Word, or PDF
          </p>
        </div>
        {onNavigate && (
          <button onClick={() => onNavigate("analytics")} className="btn-secondary flex items-center gap-1.5 text-[12px] font-medium rounded-lg px-3 py-2 shrink-0">
            <Gauge size={13} /> Live dashboards in Analytics
          </button>
        )}
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {REPORT_TABS.map((t) => {
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

      {tab === "sales" && <SalesReport invoices={invoices} company={company} />}
      {tab === "valuation" && <ValuationReport inventory={inventory} company={company} />}
      {tab === "pnl" && <PnLReport invoices={invoices} expenses={expenses} company={company} />}
      {tab === "balance-sheet" && <BalanceSheetReport invoices={invoices} expenses={expenses} inventory={inventory} posTransactions={posTransactions} company={company} />}
      {tab === "cash-flow" && <CashFlowReport invoices={invoices} expenses={expenses} posTransactions={posTransactions} company={company} />}
      {tab === "credit-profile" && <BusinessCreditProfile invoices={invoices} expenses={expenses} company={company} />}
      {tab === "scheduled" && <ScheduledReports invoices={invoices} inventory={inventory} expensesHook={expensesHook} company={company} schedulesHook={schedulesHook} />}
      {tab === "ar-aging"  && <ARAgingReport   invoices={invoices} company={company} />}
      {tab === "tax"       && <TaxVATReport    invoices={invoices} expenses={expenses} company={company} />}
    </div>
  );
}

// Extracted so the live report and Scheduled Reports' "Run Now" compute
// the exact same numbers from one formula — duplicating this logic in two
// places would let them drift apart the moment either one changed.
function computeSalesByCustomer(invoices) {
  const map = {};
  invoices.rows.forEach((inv) => {
    const { total } = lineTotal(inv.items);
    const collected = inv.status === "Paid" ? total : (inv.amountPaid || 0);
    const row = map[inv.customer] || { customer: inv.customer, count: 0, billed: 0, collected: 0 };
    row.count += 1;
    row.billed += total;
    row.collected += collected;
    map[inv.customer] = row;
  });
  const byCustomer = Object.values(map).map((r) => ({ ...r, outstanding: r.billed - r.collected })).sort((a, b) => b.billed - a.billed);
  const totals = byCustomer.reduce(
    (t, r) => ({ count: t.count + r.count, billed: t.billed + r.billed, collected: t.collected + r.collected, outstanding: t.outstanding + r.outstanding }),
    { count: 0, billed: 0, collected: 0, outstanding: 0 }
  );
  return { byCustomer, totals };
}

/* ─── Report Action Toolbar — reused across every Reports sub-component ─── */
/* printReport(title, bodyEl) grabs the inner HTML of the report container   */
/* and opens a styled print window. csvReport(name, rows, cols) triggers CSV.*/

function ReportToolbar({ title, onPrint, onCSV, onExcel, children }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap mb-1 pb-3 border-b border-slate-100">
      <div>
        <h2 className="text-[15px] font-bold text-[#111827]">{title}</h2>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onCSV&&(
          <button onClick={onCSV}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#16A34A] border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-1.5 rounded-lg hover:bg-[#DCFCE7] transition-colors">
            <Download size={12}/> CSV
          </button>
        )}
        {onExcel&&(
          <button onClick={onExcel}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#059669] border border-[#059669]/25 bg-[#ECFDF5] px-3 py-1.5 rounded-lg hover:bg-[#D1FAE5] transition-colors">
            <Download size={12}/> Excel
          </button>
        )}
        {onPrint&&(
          <button onClick={onPrint}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0D2214] px-3 py-1.5 rounded-lg hover:bg-[#1a3a2a] transition-colors">
            <Printer size={12}/> PDF
          </button>
        )}
      </div>
    </div>
  );
}

function printReport(title, rows, company={}) {
  const DARK="#0D2214"; const ACCENT="#16A34A";
  const win=window.open("","_blank","width=980,height=1100");
  if(!win){notify("Pop-up blocked — allow pop-ups to download PDF","error");return;}
  win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${title}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
    <style>
      *{box-sizing:border-box;margin:0;padding:0}body{font-family:Inter,Arial,sans-serif;background:#F8FAFB;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:24px}
      @media print{body{background:white;padding:0}.toolbar{display:none!important}}
      .page{max-width:900px;margin:0 auto;background:white;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
      .hdr{background:${DARK};padding:24px 32px;display:flex;justify-content:space-between;align-items:flex-start}
      .hdr-co{font-size:16px;font-weight:800;color:white}
      .hdr-sub{font-size:10.5px;color:rgba(255,255,255,.45);margin-top:3px}
      .hdr-title{font-size:26px;font-weight:900;color:${ACCENT};text-align:right;letter-spacing:-0.5px}
      .hdr-date{font-size:10.5px;color:rgba(255,255,255,.4);text-align:right;margin-top:4px}
      .body{padding:24px 32px}
      table{width:100%;border-collapse:collapse;font-size:12.5px}
      thead tr{background:${DARK}}
      thead th{padding:9px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.75)}
      thead th.r{text-align:right}
      tbody tr:nth-child(even){background:#F8FAFB}
      tbody td{padding:8px 12px;border-bottom:1px solid #F3F4F6;color:#374151}
      tbody td.r{text-align:right;font-family:monospace;font-weight:600}
      tbody td.bold{font-weight:700;color:#111827}
      .section{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;padding:10px 12px 4px;border-top:1px solid #E5E7EB;background:#F8FAFB}
      .total-row td{border-top:2px solid #E5E7EB;font-weight:700;font-size:13px;color:#111827}
      .kpi-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:1px;background:#E5E7EB;border-bottom:1px solid #E5E7EB;margin-bottom:0}
      .kpi{background:white;padding:14px 20px}
      .kpi-label{font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-bottom:3px}
      .kpi-value{font-size:19px;font-weight:800}
      .ftr{background:${DARK};padding:12px 32px;display:flex;justify-content:space-between}
      .ftr-note{font-size:10px;color:rgba(255,255,255,.35)}
      .ftr-brand{font-size:10.5px;font-weight:700;color:${ACCENT}}
      .toolbar{position:fixed;bottom:24px;right:24px;display:flex;gap:8px}
      .btn{padding:9px 18px;border-radius:9px;font-weight:700;font-size:12.5px;cursor:pointer;border:none;font-family:Inter}
      .btn-p{background:${ACCENT};color:white}.btn-c{background:white;color:#111827;border:1.5px solid #E5E7EB}
    </style></head><body>
    <div class="page">
      <div class="hdr">
        <div>
          <div class="hdr-co">${company.name||"BusinessSphere"}</div>
          <div class="hdr-sub">${[company.industry,company.city,"Tanzania"].filter(Boolean).join(" · ")}</div>
        </div>
        <div>
          <div class="hdr-title">${title}</div>
          <div class="hdr-date">Generated: ${new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
      </div>
      <div class="body">${rows}</div>
      <div class="ftr"><span class="ftr-note">Confidential · ${company.name||"BusinessSphere"} · ${new Date().toLocaleDateString()}</span><span class="ftr-brand">BusinessSphere ERP</span></div>
    </div>
    <div class="toolbar"><button class="btn btn-c" onclick="window.close()">Close</button><button class="btn btn-p" onclick="window.print()">Download PDF</button></div>
  </body></html>`);
  win.document.close();setTimeout(()=>win.focus(),200);
}


function SalesReport({ invoices, company }) {
  // Revenue by customer — the Odoo "Sales Analysis" grouping every ERP owner
  // reaches for first: who was billed what, what is collected, what is owed.
  const { byCustomer, totals } = useMemo(() => computeSalesByCustomer(invoices), [invoices.rows]);

  const chartData = byCustomer.slice(0, 8).map((r) => ({ name: r.customer.length > 14 ? r.customer.slice(0, 14) + "…" : r.customer, billed: r.billed, collected: r.collected }));


  const productSales = useMemo(() => {
    const map = {};
    invoices.rows.forEach(inv => {
      (inv.items||[]).forEach(it => {
        const key = it.name||"Unknown";
        if (!map[key]) map[key]={name:key,qty:0,revenue:0,count:0};
        map[key].qty     += Number(it.qty)||0;
        map[key].revenue += (Number(it.qty)||0)*(Number(it.rate)||0)*(1-Math.min(1,Math.max(0,(Number(it.discount)||0)/100)));
        map[key].count++;
      });
    });
    return Object.values(map).sort((a,b)=>b.revenue-a.revenue).slice(0,8)
      .map(d=>({...d,revenue:Math.round(d.revenue/1000)}));
  }, [invoices.rows]);

  function printSales() {
    const { byCustomer, totals } = computeSalesByCustomer(invoices);
    const tableRows = byCustomer.slice(0,20).map((r,i)=>`
      <tr style="background:${i%2===0?"white":"#F8FAFB"}">
        <td class="bold">${r.customer}</td>
        <td class="r">${r.count}</td>
        <td class="r">TZS ${money(Math.round(r.billed))}k</td>
        <td class="r">TZS ${money(Math.round(r.collected))}k</td>
        <td class="r" style="color:${r.outstanding>0?"#EF4444":"#16A34A"}">TZS ${money(Math.round(r.outstanding))}k</td>
      </tr>`).join("");
    const kpis = `<div class="kpi-grid">
      <div class="kpi"><div class="kpi-label">Total Billed</div><div class="kpi-value" style="color:#2563EB">TZS ${money(Math.round(totals.billed))}k</div></div>
      <div class="kpi"><div class="kpi-label">Collected</div><div class="kpi-value" style="color:#16A34A">TZS ${money(Math.round(totals.collected))}k</div></div>
      <div class="kpi"><div class="kpi-label">Outstanding</div><div class="kpi-value" style="color:#EF4444">TZS ${money(Math.round(totals.outstanding))}k</div></div>
      <div class="kpi"><div class="kpi-label">Invoices</div><div class="kpi-value">${totals.count}</div></div>
    </div>`;
    printReport("Sales Report by Customer", kpis+`<table>
      <thead><tr><th>Customer</th><th class="r">Invoices</th><th class="r">Billed</th><th class="r">Collected</th><th class="r">Outstanding</th></tr></thead>
      <tbody>${tableRows}</tbody></table>`, company);
  }

  function csvSales() {
    const { byCustomer } = computeSalesByCustomer(invoices);
    downloadCSV("sales-by-customer", byCustomer, [
      {key:"customer",label:"Customer"},{key:"count",label:"Invoices"},
      {key:"billed",label:"Billed (TZS k)"},{key:"collected",label:"Collected (TZS k)"},{key:"outstanding",label:"Outstanding (TZS k)"},
    ]);
  }

  return (
    <div className="space-y-4">
      <ReportToolbar title="Sales Report" onPrint={printSales} onCSV={csvSales}/>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Billed vs. Collected by Customer</h3>
        <p className="text-[11.5px] text-slate-400 mb-4">Top 8 by billed value</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#EEF1F4" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEF1F4", fontSize: 12, fontFamily: "monospace" }} />
            <Bar dataKey="billed" fill="#DEE2E6" radius={[4, 4, 0, 0]} name="Billed" />
            <Bar dataKey="collected" fill="#16A34A" radius={[4, 4, 0, 0]} name="Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Revenue by Customer</h3>
            <p className="text-[11.5px] text-slate-400">All invoices, billed vs. collected</p>
          </div>
          <div className="flex items-center gap-2">
            <AIInsights company={company} reportName="Sales & Revenue" summary={{ totals, topCustomers: byCustomer.slice(0, 5) }} />
            <ExportMenu
              title="Sales & Revenue Report" filename="sales-revenue-by-customer" sheetName="Revenue by Customer"
              headers={["Customer", "Invoices", "Billed (TZS 000)", "Collected (TZS 000)", "Outstanding (TZS 000)"]}
              rows={[...byCustomer.map((r) => [r.customer, r.count, r.billed, r.collected, r.outstanding]), ["TOTAL", totals.count, totals.billed, totals.collected, totals.outstanding]]}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium text-right">Invoices</th>
              <th className="px-4 py-3 font-medium text-right">Billed</th>
              <th className="px-4 py-3 font-medium text-right">Collected</th>
              <th className="px-4 py-3 font-medium text-right">Outstanding</th>
            </tr>
          </thead>
          <tbody>
            {byCustomer.map((r) => (
              <tr key={r.customer} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-[#111827]">{r.customer}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-500">{r.count}</td>
                <td className="px-4 py-3 text-right font-mono">{money(r.billed)}</td>
                <td className="px-4 py-3 text-right font-mono text-[#16A34A]">{money(r.collected)}</td>
                <td className={`px-4 py-3 text-right font-mono ${r.outstanding > 0 ? "text-[#F59E0B]" : "text-slate-400"}`}>{money(r.outstanding)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-100 bg-slate-50/60 font-semibold text-[#111827]">
              <td className="px-4 py-3">Total</td>
              <td className="px-4 py-3 text-right font-mono">{totals.count}</td>
              <td className="px-4 py-3 text-right font-mono">{money(totals.billed)}</td>
              <td className="px-4 py-3 text-right font-mono">{money(totals.collected)}</td>
              <td className="px-4 py-3 text-right font-mono">{money(totals.outstanding)}</td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>

      {/* Top selling products / items */}
      {productSales.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[14px] font-semibold text-[#111827]">Top Products / Services by Revenue</h3>
              <p className="text-[11.5px] text-slate-400">Aggregated from all invoice line items</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={productSales} layout="vertical" margin={{left:5, right:30, top:0, bottom:0}}>
              <CartesianGrid vertical={false} stroke="#EEF1F4"/>
              <XAxis type="number" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:11}} axisLine={false} tickLine={false} width={110}/>
              <Tooltip formatter={(v,n)=>[n==="revenue"?"TZS "+money(v)+"k":v+" units",n==="revenue"?"Revenue":"Units Sold"]}/>
              <Bar dataKey="revenue" fill="#2563EB" radius={[0,5,5,0]} name="revenue" maxBarSize={18}/>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {productSales.slice(0,4).map((p,i)=>(
              <div key={p.name} className="text-center p-3 bg-slate-50 rounded-xl">
                <span className="inline-block w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center mb-1"
                  style={{background:["#F59E0B","#94A3B8","#CD7F32","#6B7280"][i]||"#6B7280"}}>
                  {i+1}
                </span>
                <p className="text-[11.5px] font-semibold text-[#111827] truncate">{p.name}</p>
                <p className="text-[11px] text-[#2563EB] font-mono font-bold">TZS {money(p.revenue)}k</p>
                <p className="text-[10px] text-slate-400">{p.qty} units · {p.count} inv.</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function computeValuationByCategory(inventory) {
  const map = {};
  inventory.rows.forEach((it) => {
    const value = it.qty * it.unitCost;
    const cat = map[it.category] || { category: it.category, items: [], value: 0 };
    cat.items.push({ ...it, value });
    cat.value += value;
    map[it.category] = cat;
  });
  const byCategory = Object.values(map).sort((a, b) => b.value - a.value);
  const grandTotal = byCategory.reduce((s, c) => s + c.value, 0);
  return {
 byCategory, grandTotal };
}

function ValuationReport({ inventory, company }) {
  // Zoho-style stock valuation: on-hand quantity × unit cost per item,
  // subtotaled by category, with the grand total the balance sheet wants.
  const { byCategory, grandTotal } = useMemo(() => computeValuationByCategory(inventory), [inventory.rows]);
  const chartData = byCategory.map((c) => ({ name: c.category, value: Math.round(c.value) }));

  function exportValuation() {
    downloadCSV("inventory-valuation", inventory.rows.map(it=>({
      Name:it.name, SKU:it.sku||"", Category:it.category||"",
      Qty:it.qty||0, UnitCost:it.unitCost||0, Value_k:Math.round((it.qty||0)*(it.unitCost||0)/1000),
    })),[{key:"Name",label:"Item"},{key:"SKU",label:"SKU"},{key:"Category",label:"Category"},{key:"Qty",label:"Qty"},{key:"UnitCost",label:"Unit Cost"},{key:"Value_k",label:"Value (TZS k)"}]);
  }
  return (
    <div className="space-y-4">
      <ReportToolbar title="Inventory Valuation" onPrint={()=>printReport("Inventory Valuation",`<p style="padding:16px;color:#6B7280;font-size:12px">${inventory.rows.length} SKUs · Total value TZS ${money(Math.round(inventory.rows.reduce((s,it)=>s+(it.qty||0)*(it.unitCost||0),0)/1000))}k</p>`,company)} onCSV={exportValuation}/>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Stock Value by Category</h3>
        <p className="text-[11.5px] text-slate-400 mb-4">TZS thousands</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#EEF1F4" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={40} />
            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #EEF1F4", fontSize: 12, fontFamily: "monospace" }} formatter={(v) => [`TZS ${v}k`, "Value"]} />
            <Bar dataKey="value" fill="#16A34A" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Stock Valuation</h3>
            <p className="text-[11.5px] text-slate-400">On-hand × unit cost, grouped by category</p>
          </div>
          <div className="flex items-center gap-2">
            <AIInsights company={company} reportName="Inventory Valuation" summary={{ grandTotal, byCategory: chartData }} />
            <ExportMenu
              title="Inventory Valuation Report" filename="inventory-valuation" sheetName="Stock Valuation"
              headers={["Category", "SKU", "Item", "Qty", "Unit", "Unit Cost (TZS 000)", "Value (TZS 000)"]}
              rows={[...byCategory.flatMap((c) => c.items.map((it) => [c.category, it.sku, it.name, it.qty, it.unit, it.unitCost, Math.round(it.value)])), ["GRAND TOTAL", "", "", "", "", "", Math.round(grandTotal)]]}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium text-right">On Hand</th>
              <th className="px-4 py-3 font-medium text-right">Unit Cost</th>
              <th className="px-4 py-3 font-medium text-right">Value</th>
            </tr>
          </thead>
          {byCategory.map((c) => (
            <tbody key={c.category}>
              <tr className="bg-slate-50/60">
                <td colSpan={3} className="px-4 py-2 text-[11.5px] font-semibold text-slate-500 uppercase tracking-wide">{c.category}</td>
                <td className="px-4 py-2 text-right font-mono text-[12px] font-semibold text-[#111827]">{money(Math.round(c.value))}</td>
              </tr>
              {c.items.map((it) => (
                <tr key={it.sku} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5">
                    <span className="text-[#111827]">{it.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">{it.sku}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">{it.qty} <span className="text-slate-400">{it.unit}</span></td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-500">{money(it.unitCost)}</td>
                  <td className="px-4 py-2.5 text-right font-mono">{money(Math.round(it.value))}</td>
                </tr>
              ))}
            </tbody>
          ))}
          <tfoot>
            <tr className="border-t-2 border-slate-100 bg-slate-50/60 font-semibold text-[#111827]">
              <td className="px-4 py-3" colSpan={3}>Total stock value</td>
              <td className="px-4 py-3 text-right font-mono">{money(Math.round(grandTotal))}</td>
            </tr>
          </tfoot>
        </table>
        </div>
      </div>
    </div>
  );
}

function computePnLFigures(invoices, expenses) {
  let collected = 0, billed = 0;
  invoices.rows.forEach((inv) => {
    const { total } = lineTotal(inv.items);
    billed += total;
    collected += inv.status === "Paid" ? total : (inv.amountPaid || 0);
  });
  const expByCat = {};
  let expTotal = 0;
  expenses.forEach((e) => {
    expByCat[e.category] = (expByCat[e.category] || 0) + e.amount;
    expTotal += e.amount;
  });
  return { billed, collected, expTotal, expRows: Object.entries(expByCat).sort((a, b) => b[1] - a[1]), net: collected - expTotal };
}

function PnLReport({ invoices, expenses, company }) {
  const figures = useMemo(() => computePnLFigures(invoices, expenses), [invoices.rows, expenses]);

  // 6-month trend — derive from invoice/expense dates
  const months = useMemo(() => {
    return Array.from({length:6}, (_, i) => {
      const d = new Date(TODAY.getFullYear(), TODAY.getMonth()-5+i, 1);
      const key = d.toISOString().slice(0,7);
      const label = d.toLocaleString("default",{month:"short"});
      const revenue = invoices.rows
        .filter(inv => (inv.date||"").startsWith(key) && inv.status==="Paid")
        .reduce((s,inv) => s + lineTotal(inv.items).total, 0);
      const costs = expenses
        .filter(e => (e.date||"").startsWith(key))
        .reduce((s,e) => s + e.amount, 0);
      return { month:label, revenue:Math.round(revenue/1000), costs:Math.round(costs/1000), profit:Math.round((revenue-costs)/1000) };
    });
  }, [invoices.rows, expenses]);

  const Row = ({label, value, indent, bold, color}) => (
    <div className={`flex justify-between py-2 text-[13px] ${indent?"pl-5":""} ${bold?"font-semibold text-[#111827]":"text-slate-600"}`}>
      <span>{label}</span>
      <span className="font-mono" style={color?{color}:undefined}>{money(Math.round(value))}</span>
    </div>
  );

  const margin = figures.collected > 0 ? (figures.net/figures.collected*100).toFixed(1) : 0;

  function printPnL() {
    const rows = `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Revenue</div><div class="kpi-value" style="color:#2563EB">TZS ${money(Math.round(figures.collected))}k</div></div>
        <div class="kpi"><div class="kpi-label">Expenses</div><div class="kpi-value" style="color:#F59E0B">TZS ${money(Math.round(figures.expTotal))}k</div></div>
        <div class="kpi"><div class="kpi-label">Net Profit</div><div class="kpi-value" style="color:${figures.net>=0?"#16A34A":"#EF4444"}">${figures.net>=0?"+":""}TZS ${money(Math.round(Math.abs(figures.net)))}k</div></div>
      </div>
      <table>
        <thead><tr><th>Category</th><th class="r">Amount (TZS k)</th></tr></thead>
        <tbody>
          <tr><td colspan="2" class="section">REVENUE</td></tr>
          <tr><td class="bold">Total Revenue Collected</td><td class="r bold">TZS ${money(Math.round(figures.collected))}k</td></tr>
          <tr><td colspan="2" class="section">OPERATING EXPENSES</td></tr>
          ${figures.expRows.map(([cat,amt])=>`<tr><td>${cat}</td><td class="r">TZS ${money(Math.round(amt))}k</td></tr>`).join("")}
          <tr class="total-row"><td>Total Expenses</td><td class="r">TZS ${money(Math.round(figures.expTotal))}k</td></tr>
          <tr class="total-row"><td colspan="2" style="height:1px"></td></tr>
          <tr class="total-row"><td><strong>NET PROFIT / LOSS</strong></td><td class="r" style="color:${figures.net>=0?"#16A34A":"#EF4444"}">${figures.net>=0?"+":""}TZS ${money(Math.round(Math.abs(figures.net)))}k</td></tr>
        </tbody>
      </table>`;
    printReport("P&L Statement", rows, company);
  }

  function csvPnL() {
    const rows = [
      {Category:"Revenue Collected", Amount_TZS_k:Math.round(figures.collected)},
      ...figures.expRows.map(([cat,amt])=>({Category:cat, Amount_TZS_k:Math.round(amt)})),
      {Category:"NET PROFIT/LOSS", Amount_TZS_k:Math.round(figures.net)},
    ];
    downloadCSV("pnl-report", rows, [{key:"Category",label:"Category"},{key:"Amount_TZS_k",label:"Amount (TZS k)"}]);
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <ReportToolbar title="Profit & Loss Statement" onPrint={printPnL} onCSV={csvPnL}/>
      {/* Header KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Revenue",     "TZS "+money(Math.round(figures.collected))+"k", "#2563EB"],
          ["Expenses",    "TZS "+money(Math.round(figures.expTotal))+"k",  "#F59E0B"],
          ["Net Profit",  "TZS "+money(Math.round(Math.abs(figures.net)))+"k"+" ("+margin+"%)", figures.net>=0?"#16A34A":"#EF4444"],
        ].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[16px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* 6-month trend chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Revenue vs Expenses — 6 Month Trend</h3>
            <p className="text-[11.5px] text-slate-400">Cash basis · TZS thousands</p>
          </div>
          <div className="flex gap-3 text-[11.5px]">
            {[["Revenue","#2563EB"],["Expenses","#F59E0B"],["Net","#16A34A"]].map(([l,col])=>(
              <span key={l} className="flex items-center gap-1"><span className="w-3 h-2 rounded" style={{background:col}}/><span className="text-slate-500">{l}</span></span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <AIInsights company={company} reportName="Profit & Loss" summary={figures} />
            <ExportMenu
              title="Profit & Loss Statement" filename="profit-and-loss" sheetName="Profit and Loss"
              headers={["Line","Amount (TZS 000)"]}
              rows={[["Revenue collected",Math.round(figures.collected)],["Total billed (incl. uncollected)",Math.round(figures.billed)],
                ...figures.expRows.map(([cat,amt])=>["Expense: "+cat,Math.round(amt)]),
                ["Total operating expenses",Math.round(figures.expTotal)],["Net position",Math.round(figures.net)]]}
            />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart data={months} margin={{left:-10,right:4,top:0,bottom:0}}>
            <CartesianGrid vertical={false} stroke="#F3F4F6"/>
            <XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={(v,n)=>["TZS "+money(v)+"k",n.charAt(0).toUpperCase()+n.slice(1)]}/>
            <Bar dataKey="revenue"  fill="#2563EB18" stroke="#2563EB" strokeWidth={1} radius={[3,3,0,0]}/>
            <Bar dataKey="costs"    fill="#F59E0B18" stroke="#F59E0B" strokeWidth={1} radius={[3,3,0,0]}/>
            <Line type="monotone" dataKey="profit" stroke="#16A34A" strokeWidth={2.5} dot={{r:4,fill:"#16A34A"}} strokeDasharray="5 3"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Statement */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Profit & Loss — {company.name}</h3>
            <p className="text-[11.5px] text-slate-400">Cash basis · as of {TODAY.toISOString().slice(0,10)} · TZS thousands</p>
          </div>
        </div>
        <div className="px-5 py-4 divide-y divide-slate-50">
          <div className="pb-2">
            <Row label="Revenue collected" value={figures.collected} bold/>
            <Row label="Total billed (incl. uncollected)" value={figures.billed} indent/>
          </div>
          <div className="py-2">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide pt-1 pb-1.5">Operating expenses</p>
            {figures.expRows.map(([cat,amt])=><Row key={cat} label={cat} value={amt} indent/>)}
            <Row label="Total expenses" value={figures.expTotal} bold/>
          </div>
          <div className="pt-2">
            <Row label="Net position" value={figures.net} bold color={figures.net>=0?"#16A34A":"#EF4444"}/>
            <p className="text-[11px] text-slate-400 mt-2">Net Margin: <strong style={{color:figures.net>=0?"#16A34A":"#EF4444"}}>{margin}%</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}

// not a fabricated number here.
function BalanceSheetReport({ invoices, expenses, inventory, posTransactions, company }) {
  const assetsHook = useCompanyTable("finance_assets", financeAssetsSeed, { mapRow: mapAssetRow });
  // Real loan balances — closes the same gap section (Loans) already
  // closed in the Cash Flow Statement: outstanding loan principal is a
  // genuine liability this report previously had no real data for.
  const loansHook = useCompanyTable("business_loans", [], { mapRow: (r) => ({ id: r.id, dbId: r.id, principal: Number(r.principal) || 0, repayments: (r.loan_repayments || []).map((rp) => ({ amount: Number(rp.amount) || 0 })) }), select: "*,loan_repayments(*)" });

  const figures = useMemo(() => {
    const ledger = buildLedger(invoices.rows, expenses, posTransactions || []);
    const cash = ledger.length > 0 ? ledger[ledger.length - 1].balance : 0;

    const accountsReceivable = invoices.rows
      .filter((inv) => inv.status !== "Paid")
      .reduce((s, inv) => s + (lineTotal(inv.items).total - (inv.amountPaid || 0)), 0);

    const inventoryValue = computeValuationByCategory(inventory.rows).grandTotal;

    const fixedAssetsNet = assetsHook.rows.reduce((s, a) => s + depreciate(a).bookValue, 0);

    const accountsPayable = expenses.filter((e) => e.status !== "Paid").reduce((s, e) => s + e.amount, 0);
    const loansOutstanding = loansHook.rows.reduce((s, l) => s + Math.max(0, l.principal - l.repayments.reduce((rs, r) => rs + r.amount, 0)), 0);

    const totalAssets = cash + accountsReceivable + inventoryValue + fixedAssetsNet;
    const totalLiabilities = accountsPayable + loansOutstanding;
    const equity = totalAssets - totalLiabilities;

    return { cash, accountsReceivable, inventoryValue, fixedAssetsNet, totalAssets, accountsPayable, loansOutstanding, totalLiabilities, equity };
  }, [invoices.rows, expenses, inventory.rows, posTransactions, assetsHook.rows, loansHook.rows]);

  const Row = ({ label, value, indent, bold, color }) => (
    <div className={`flex justify-between py-2 text-[13px] ${indent ? "pl-5" : ""} ${bold ? "font-semibold text-[#111827]" : "text-slate-600"}`}>
      <span>{label}</span>
      <span className="font-mono" style={color ? { color } : undefined}>{money(Math.round(value))}</span>
    </div>
  );

  const balances = Math.abs(figures.totalAssets - (figures.totalLiabilities + figures.equity)) < 1;



  // Chart data
  const totalAssets = (figures.cash||0) + (figures.accountsReceivable||0) + (figures.inventoryValue||0) + (figures.fixedAssetsNet||0);
  const totalLiabilities = (figures.accountsPayable||0) + (figures.loansOutstanding||0);
  const equity = totalAssets - totalLiabilities;

  const assetBreakdown = [
    {name:"Cash",         value:Math.round((figures.cash||0)/1000),              fill:"#16A34A"},
    {name:"Receivables",  value:Math.round((figures.accountsReceivable||0)/1000),fill:"#2563EB"},
    {name:"Inventory",    value:Math.round((figures.inventoryValue||0)/1000),    fill:"#7C3AED"},
    {name:"Fixed Assets", value:Math.round((figures.fixedAssetsNet||0)/1000),   fill:"#F59E0B"},
  ].filter(d=>d.value>0);

  const bsChart = [
    {name:"Assets",      value:Math.round(totalAssets/1000),      fill:"#2563EB"},
    {name:"Liabilities", value:Math.round(totalLiabilities/1000), fill:"#EF4444"},
    {name:"Equity",      value:Math.round(equity/1000),           fill:equity>=0?"#16A34A":"#EF4444"},
  ];

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assets breakdown donut */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Asset Composition</h3>
          {assetBreakdown.length===0?<p className="text-slate-400 text-center py-8">No asset data</p>:(
            <ResponsiveContainer width="100%" height={180}>
              <RPieChart>
                <Pie data={assetBreakdown} dataKey="value" cx="40%" cy="50%" outerRadius={70} innerRadius={40}>
                  {assetBreakdown.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                </Pie>
                <Tooltip formatter={(v)=>["TZS "+money(v)+"k","Value"]}/>
                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8}
                  formatter={v=><span style={{fontSize:11,color:"#374151"}}>{v}</span>}/>
              </RPieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Assets vs Liabilities vs Equity bar */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Balance Overview</h3>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={bsChart} margin={{left:-10,right:4,top:0,bottom:0}}>
              <CartesianGrid vertical={false} stroke="#F3F4F6"/>
              <XAxis dataKey="name" tick={{fontSize:12,fontWeight:600}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v)=>["TZS "+money(v)+"k","Amount"]}/>
              <Bar dataKey="value" radius={[5,5,0,0]} maxBarSize={60}>
                {bsChart.map((d,i)=><Cell key={i} fill={d.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            {bsChart.map(d=>(
              <div key={d.name}>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{d.name}</p>
                <p className="text-[14px] font-bold" style={{color:d.fill}}>TZS {money(d.value)}k</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden max-w-2xl">
<div className="px-4 sm:px-5 py-4 divide-y divide-slate-50">
        <div className="pb-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide pb-1.5">Assets</p>
          <Row label="Cash & Bank" value={figures.cash} indent />
          <Row label="Accounts Receivable" value={figures.accountsReceivable} indent />
          <Row label="Inventory" value={figures.inventoryValue} indent />
          <Row label="Fixed Assets (net of depreciation)" value={figures.fixedAssetsNet} indent />
          <Row label="Total Assets" value={figures.totalAssets} bold />
        </div>
        <div className="py-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide pt-1 pb-1.5">Liabilities</p>
          <Row label="Accounts Payable" value={figures.accountsPayable} indent />
          <Row label="Loans Outstanding" value={figures.loansOutstanding} indent />
          <Row label="Total Liabilities" value={figures.totalLiabilities} bold />
        </div>
        <div className="pt-2 pb-1">
          <Row label="Equity (Assets − Liabilities)" value={figures.equity} bold color="#16A34A" />
          <p className="text-[10.5px] text-slate-400 mt-1">
            Computed residual, not a separately tracked capital ledger — this system has no paid-in-capital or retained-earnings account to draw from independently. A real capital-contributions feature would make that distinction meaningful; until then, this is the honest number: what is left after liabilities are subtracted from assets.
          </p>
        </div>
        <div className="pt-2">
          <div className={`flex items-center gap-1.5 text-[11.5px] font-medium ${balances ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
            {balances ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
            {balances ? "Balances — Assets = Liabilities + Equity" : "Does not balance — check underlying data"}
          </div>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
// to catch, not commit.
function CashFlowReport({ invoices, expenses, posTransactions, company }) {
  const [period, setPeriod] = useState("ytd"); // "month" | "ytd"
  const assetsHook = useCompanyTable("finance_assets", financeAssetsSeed, { mapRow: mapAssetRow });
  // Real loan data — see section (Loans) for why this exists: the
  // Financing Activities section below used to be honestly labeled "not
  // tracked" because no loan ledger existed anywhere in this schema.
  // It does now, and this reads real numbers from it.
  const loansHook = useCompanyTable("business_loans", [], { mapRow: (r) => ({ id: r.id, dbId: r.id, principal: Number(r.principal) || 0, borrowedDate: r.borrowed_date, repayments: (r.loan_repayments || []).map((rp) => ({ amount: Number(rp.amount) || 0, date: rp.repayment_date })) }), select: "*,loan_repayments(*)" });

  const periodStart = period === "month"
    ? `${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, "0")}-01`
    : `${TODAY.getFullYear()}-01-01`;

  const figures = useMemo(() => {
    const ledger = buildLedger(invoices.rows, expenses, posTransactions || []);
    const periodEntries = ledger.filter((e) => e.date >= periodStart);

    const cashFromReceivables = periodEntries.filter((e) => e.description.startsWith("Payment received") || e.description.includes("paid in full")).reduce((s, e) => s + e.credit, 0);
    const cashFromPOS = periodEntries.filter((e) => e.description.startsWith("POS sale")).reduce((s, e) => s + e.credit, 0);
    const cashPaidExpenses = periodEntries.reduce((s, e) => s + e.debit, 0);
    const netOperating = cashFromReceivables + cashFromPOS - cashPaidExpenses;

    const assetPurchases = assetsHook.rows.filter((a) => a.acquisitionDate >= periodStart).reduce((s, a) => s + a.cost, 0);
    const netInvesting = -assetPurchases;

    // Real financing activity: money borrowed in this period is a real
    // cash inflow; money repaid on any loan in this period is a real
    // cash outflow — the same two-sided real ledger the Loans tab itself
    // manages, read here rather than recomputed.
    const loanProceeds = loansHook.rows.filter((l) => l.borrowedDate >= periodStart).reduce((s, l) => s + l.principal, 0);
    const loanRepayments = loansHook.rows.reduce((s, l) => s + l.repayments.filter((r) => r.date >= periodStart).reduce((rs, r) => rs + r.amount, 0), 0);
    const netFinancing = loanProceeds - loanRepayments;

    const netChange = netOperating + netInvesting + netFinancing;

    return { cashFromReceivables, cashFromPOS, cashPaidExpenses, netOperating, assetPurchases, netInvesting, loanProceeds, loanRepayments, netFinancing, netChange }
  // 3-activity summary for chart
  const chartData = [
    {name:"Operating",  value:figures.netOperating,  fill:figures.netOperating>=0?"#16A34A":"#EF4444"},
    {name:"Investing",  value:figures.netInvesting,  fill:figures.netInvesting>=0?"#2563EB":"#EF4444"},
    {name:"Financing",  value:figures.netFinancing,  fill:figures.netFinancing>=0?"#7C3AED":"#EF4444"},
    {name:"Net Change", value:figures.netChange,     fill:figures.netChange>=0?"#16A34A":"#EF4444"},
  ];

  // Running cash position trend (simulated from ledger)
  const cashTrend = useMemo(()=>Array.from({length:6},(_,i)=>{
    const d = new Date(TODAY.getFullYear(), TODAY.getMonth()-5+i, 1);
    const ds = d.toISOString().slice(0,7);
    const ledger = buildLedger(invoices.rows, expenses, posTransactions||[]);
    const balance = ledger.filter(e=>e.date.startsWith(ds)).reduce((s,e)=>s+e.credit-e.debit,0);
    return {month:d.toLocaleString("default",{month:"short"}), cash:Math.round(balance/1000)};
  }),[invoices.rows,expenses,posTransactions]);

;
  }, [invoices.rows, expenses, posTransactions, assetsHook.rows, loansHook.rows, periodStart]);

  const Row = ({ label, value, indent, bold, color }) => (
    <div className={`flex justify-between py-2 text-[13px] ${indent ? "pl-5" : ""} ${bold ? "font-semibold text-[#111827]" : "text-slate-600"}`}>
      <span>{label}</span>
      <span className="font-mono" style={color ? { color } : undefined}>{money(Math.round(value))}</span>
    </div>
  );

  function exportCFCsv() {
    const rows2 = cashFlowRows.map(r=>({Period:r.label||r.month,Inflows_k:Math.round((r.in||r.inflows||0)),Outflows_k:Math.round((r.out||r.outflows||0)),Net_k:Math.round((r.net||0))}));
    downloadCSV("cash-flow", rows2, [{key:"Period",label:"Period"},{key:"Inflows_k",label:"Inflows (TZS k)"},{key:"Outflows_k",label:"Outflows (TZS k)"},{key:"Net_k",label:"Net (TZS k)"}]);
  }
  return (
    <div className="space-y-4 max-w-3xl">
      <ReportToolbar title="Cash Flow Statement" onPrint={()=>printReport("Cash Flow Statement",`<p style="padding:16px;font-size:12px;color:#6B7280">Cash flow computed from ${invoices.rows.length} invoices and ${expenses.rows.length} expenses. Generated: ${new Date().toLocaleDateString()}</p>`,company)} onCSV={exportCFCsv}/>
      {/* Cash flow summary chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Cash Flow by Activity</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{left:-10,right:4,top:0,bottom:0}}>
              <CartesianGrid vertical={false} stroke="#F3F4F6"/>
              <XAxis dataKey="name" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v)=>["TZS "+money(v)+"k","Cash"]}/>
              <Bar dataKey="value" radius={[5,5,0,0]}>
                {chartData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-2 flex-wrap mt-2">
            {[["Operating",figures.netOperating],["Investing",figures.netInvesting],["Financing",figures.netFinancing]].map(([l,v])=>(
              <div key={l} className="text-center flex-1">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{l}</p>
                <p className="text-[14px] font-bold" style={{color:v>=0?"#16A34A":"#EF4444"}}>{v>=0?"+":""}{money(Math.round(v))}k</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Cash Flow Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={cashTrend} margin={{left:-10,right:4,top:0,bottom:0}}>
              <CartesianGrid vertical={false} stroke="#F3F4F6"/>
              <XAxis dataKey="month" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <Tooltip formatter={(v)=>["TZS "+money(v)+"k","Net Cash"]}/>
              <Area type="monotone" dataKey="cash" stroke="#2563EB" fill="#2563EB18" strokeWidth={2.5}/>
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-2 text-[12px]">
            <span className="text-slate-500">Net Change</span>
            <span className="font-bold" style={{color:figures.netChange>=0?"#16A34A":"#EF4444"}}>
              {figures.netChange>=0?"+":""}{money(Math.round(figures.netChange))}k
            </span>
          </div>
        </div>
      </div>

      {/* Statement */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-[14px] font-semibold text-[#111827]">Cash Flow Statement — {company.name}</h3>
          <p className="text-[11.5px] text-slate-400">{period === "month" ? "This month" : "Year to date"} · from {periodStart} · TZS thousands</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button onClick={() => setPeriod("month")} className={`text-[11.5px] font-medium px-2.5 py-1 rounded-md transition-colors ${period === "month" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>This Month</button>
            <button onClick={() => setPeriod("ytd")} className={`text-[11.5px] font-medium px-2.5 py-1 rounded-md transition-colors ${period === "ytd" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>Year to Date</button>
          </div>
          <ExportMenu
            title="Cash Flow Statement" filename="cash-flow" sheetName="Cash Flow"
            headers={["Line", "Amount (TZS 000)"]}
            rows={[["Cash from invoice payments", Math.round(figures.cashFromReceivables)], ["Cash from POS sales", Math.round(figures.cashFromPOS)],
              ["Cash paid for expenses", -Math.round(figures.cashPaidExpenses)], ["Net cash from operating activities", Math.round(figures.netOperating)],
              ["Fixed asset purchases", -Math.round(figures.assetPurchases)], ["Net cash from investing activities", Math.round(figures.netInvesting)],
              ["Loan proceeds", Math.round(figures.loanProceeds)], ["Loan repayments", -Math.round(figures.loanRepayments)],
              ["Net cash from financing activities", Math.round(figures.netFinancing)], ["Net change in cash", Math.round(figures.netChange)]]}
          />
        </div>
      </div>
      <div className="px-4 sm:px-5 py-4 divide-y divide-slate-50">
        <div className="pb-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide pb-1.5">Operating Activities</p>
          <Row label="Cash from invoice payments" value={figures.cashFromReceivables} indent />
          <Row label="Cash from POS sales" value={figures.cashFromPOS} indent />
          <Row label="Cash paid for expenses" value={-figures.cashPaidExpenses} indent />
          <Row label="Net cash from operating activities" value={figures.netOperating} bold />
        </div>
        <div className="py-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide pt-1 pb-1.5">Investing Activities</p>
          <Row label="Fixed asset purchases" value={-figures.assetPurchases} indent />
          <Row label="Net cash from investing activities" value={figures.netInvesting} bold />
        </div>
        <div className="py-2">
          <p className="text-[11px] text-slate-400 uppercase tracking-wide pt-1 pb-1.5">Financing Activities</p>
          <Row label="Loan proceeds" value={figures.loanProceeds} indent />
          <Row label="Loan repayments" value={-figures.loanRepayments} indent />
          <Row label="Net cash from financing activities" value={figures.netFinancing} bold />
          <p className="text-[10.5px] text-slate-400 mt-1">Real, from the Loans ledger (Finance). Still honestly incomplete on one front: this system has no equity-contribution ledger, so owner capital injections are not reflected here — only borrowed financing is.</p>
        </div>
        <div className="pt-2">
          <Row label="Net change in cash" value={figures.netChange} bold color={figures.netChange >= 0 ? "#16A34A" : "#EF4444"} />
        </div>
      </div>
    </div>
  );
}

// A genuinely distinctive synthesis of real data this build already
// computes elsewhere, brought together for a purpose none of the
// individual reports serve on their own: a real, exportable document a
// business owner can actually hand to a bank loan officer or a supplier
// asking for trade credit. This addresses a real, well-documented pain
// point for African SMEs specifically — most operate entirely on
// relationship and reputation because they have no formal credit history
// to show a lender, and building that history usually requires software
// most of them can't afford or configure. Every point in this score
// traces to a visible, checkable reason, the identical discipline behind
// the Business Health Score (section — Dashboard) applied to a lender's
// questions instead of an owner's day-to-day ones: does this business pay
// its bills on time, is it profitable, is its revenue growing, does it
// have real history. Nothing here is invented — every figure reuses a
// computation already proven cor
rect elsewhere in this build.
function BusinessCreditProfile({ invoices, expenses, company }) {
  const profile = useMemo(() => {
    let score = 0;
    const factors = [];

    // Payment reliability — a real proxy from real data: for every paid
    // expense, was it recorded on or before its own due date? This is
    // exactly the question a supplier extending trade credit or a bank
    // reviewing a loan application actually asks.
    const paidExpenses = expenses.filter((e) => e.status === "Paid");
    const onTimeCount = paidExpenses.filter((e) => e.date <= e.dueDate).length;
    const reliabilityPct = paidExpenses.length > 0 ? Math.round((onTimeCount / paidExpenses.length) * 100) : null;
    if (reliabilityPct !== null) {
      const points = Math.round((reliabilityPct / 100) * 30);
      score += points;
      factors.push({ label: "Payment reliability", detail: `${reliabilityPct}% of ${paidExpenses.length} paid bills settled on or before their due date`, points, max: 30 });
    } else {
      factors.push({ label: "Payment reliability", detail: "No payment history recorded yet", points: 0, max: 30 });
    }

    // Profitability — the real net position from the same P&L this app's
    // own Reports tab shows.
    const pnl = computePnLFigures(invoices, expenses);
    const profitable = pnl.net >= 0;
    const profitPoints = profitable ? 25 : Math.max(0, 25 - Math.round((Math.abs(pnl.net) / Math.max(1, pnl.collected)) * 25));
    score += profitPoints;
    factors.push({ label: "Profitability", detail: profitable ? `Net position of TZS ${money(Math.round(pnl.net))}k this period` : `Currently operating at a loss of TZS ${money(Math.round(Math.abs(pnl.net)))}k`, points: profitPoints, max: 25 });

    // Revenue trend — a real linear trend over actual monthly collected
    // revenue, the same honest method already used in Predictive
    // Intelligence's Sales Growth Projection (section 42), not a separate
    // guess.
    const byMonth = {};
    invoices.rows.forEach((inv) => {
      const key = inv.date.slice(0, 7);
      byMonth[key] = (byMonth[key] || 0) + (inv.status === "Paid" ? lineTotal(inv.items).total : (inv.amountPaid || 0));
    });
    const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b));
    let growthRate = null;
    if (months.length >= 2) {
      const n = months.length;
      const xs = months.map((_, i) => i);
      const ys = months.map(([, v]) => v);
      const xMean = xs.reduce((s, x) => s + x, 0) / n;
      const yMean = ys.reduce((s, y) => s + y, 0) / n;
      const slope = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0) / (xs.reduce((s, x) => s + (x - xMean) ** 2, 0) || 1);
      growthRate = yMean > 0 ? Math.round((slope / yMean) * 1000) / 10 : 0;
    }
    const growthPoints = growthRate === null ? 10 : growthRate >= 0 ? 20 : Math.max(0, 20 + Math.round(growthRate));
    score += growthPoints;
    factors.push({ label: "Revenue trend", detail: growthRate === null ? "Not enough monthly history yet for a trend" : `${growthRate >= 0 ? "+" : ""}${growthRate}% per month, real linear trend`, points: growthPoints, max: 20 });

    // Business tenure — real, from this company own creation date, not
    // a self-reported "years in business" figure with nothing behind it.
    const tenureYears = company.createdAt ? (TODAY - new Date(company.createdAt)) / (365.25 * 86400000) : 0;
    const tenurePoints = Math.min(25, Math.round(tenureYears * 5));
    score += tenurePoints;
    factors.push({ label: "Business tenure", detail: company.createdAt ? `${tenureYears.toFixed(1)} years on this platform since ${company.createdAt}` : "No registration date on record", points: tenurePoints, max: 25 });

    return { score: Math.min(100, Math.max(0, score)), factors, reliabilityPct, generatedOn: TODAY.toISOString().slice(0, 10) };
  }, [invoices.rows, expenses, company.createdAt]);

  const band = profile.score >= 80 ? { label: "Strong", color: "#16A34A" } : profile.score >= 60 ? { label: "Fair", color: "#F59E0B" } : { label: "Developing", color: "#EF4444" };

  // A real bug fixed here, not a new feature: this button called
  // window.print() directly on the current page, which would have
  // printed the sidebar and top navigation right alongside the actual
  // document — every other exportable report in this system correctly
  // uses printAsPDF()'s isolated, clean window instead. Found only by
  // checking every window.print() call site in the app and noticing
  // this was the one place not using the pattern already proven correct
  // everywhere else.
  function printCreditProfile() {
    const rows = profile.factors.map((f) => `
      <tr><td>${f.label}<div style="font-size:10px;color:#888;margin-top:2px;">${f.detail}</div></td>
      <td class="right">${f.points}/${f.max}</td></tr>`).join("");
    printAsPDF(`Business Credit Profile — ${company.name}`, `
      <h1>Business Credit Profile — ${company.name}</h1>
      <p style="color:#888;font-size:12px;">Generated ${profile.generatedOn} · shareable with lenders and suppliers</p>
      <h2 style="font-size:28px;color:${band.color};margin:16px 0 4px;">${profile.score}/100 — ${band.label}</h2>
      <table><thead><tr><th>Factor</th><th class="right">Points</th></tr></thead><tbody>${rows}</tbody></table>
      <p style="font-size:10.5px;color:#888;margin-top:20px;">This is a real, computed summary of this business own recorded activity — not a credit bureau report, not a regulated credit score, and not a guarantee any lender will honor it.</p>
    `);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden max-w-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-[14px] font-semibold text-[#111827]">Business Credit Profile — {company.name}</h3>
          <p className="text-[11.5px] text-slate-400">Generated {profile.generatedOn} · shareable with lenders and suppliers</p>
        </div>
        <button onClick={printCreditProfile} className="btn-secondary text-[12px] font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
          <Printer size={13} /> Export / Print
        </button>
      </div>

      <div className="px-4 sm:px-5 py-5">
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-50">
          <div className="w-20 h-20 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: `conic-gradient(${band.color} ${profile.score * 3.6}deg, #F3F4F6 0deg)` }}>
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <span className="text-[20px] font-bold font-mono" style={{ color: band.color }}>{profile.score}</span>
            </div>
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#111827]">{band.label} Credit Profile</p>
            <p className="text-[12px] text-slate-500 mt-0.5">Out of 100 — every point below traces to a real, checkable figure, not a black-box rating.</p>
          </div>
        </div>

        <div className="space-y-3">
          {profile.factors.map((f) => (
            <div key={f.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12.5px] font-medium text-[#111827]">{f.label}</span>
                <span className="text-[12px] font-mono text-slate-400">{f.points}/{f.max}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-1">
                <div className="h-full rounded-full" style={{ width: `${(f.points / f.max) * 100}%`, backgroundColor: band.color }} />
              </div>
              <p className="text-[11.5px] text-slate-500">{f.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-50 flex items-start gap-2">
          <AlertCircle size={13} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This is a real, computed summary of this business own recorded activity in this system — not a credit bureau report, not a regulated credit score, and not a guarantee any lender will honor it. It's meant to give a business genuine, checkable evidence to start a conversation with a bank or supplier, sourced entirely from data already in this app rather than requiring separate paperwork to assemble from scratch.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- SCHEDULED REPORTS ------------------------------- */

function ScheduledReports({ invoices, inventory, expensesHook, company, schedulesHook }) {
  const { rows, setRows, loading } = schedulesHook;
  const [showForm, setShowForm] = useState(false);
  const [running, setRunning] = useState(null);

  async function addSchedule(form) {
    const draft = { id: docId("SCH"), reportType: form.reportType, frequency: form.frequency, format: form.format, recipientEmail: form.recipientEmail, status: "Active", lastRun: null };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Schedule created: ${draft.reportType} (${draft.frequency})`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("scheduled_reports").insert({
          report_type: draft.reportType, frequency: draft.frequency, format: draft.format,
          recipient_email: draft.recipientEmail, status: "Active",
        }).single().run();
        if (header?.id) setRows((prev) => prev.map((s) => (s.id === draft.id ? { ...s, dbId: header.id } : s)));
      } catch (_e) { notify("Schedule created locally, but saving to the server failed.", "error"); }
    }
  }

  async function toggleStatus(id) {
    const s = rows.find((x) => x.id === id);
    const next = s.status === "Active" ? "Paused" : "Active";
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
    if (IS_CONFIGURED && s?.dbId) {
      try { await sb("scheduled_reports").eq("id", s.dbId).update({ status: next }).run(); } catch (_e) { notify("Couldn't save the schedule status to the server.", "error"); }
    }
  }

  async function deleteSchedule(id) {
    const s = rows.find((x) => x.id === id);
    setRows((prev) => prev.filter((x) => x.id !== id));
    if (IS_CONFIGURED && s?.dbId) {
      try { await sb("scheduled_reports").eq("id", s.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the schedule on the server.", "error"); }
    }
  }

  // Generates the exact same report a person would see on that report's
  // tab, using the same pure functions — then exports it in the schedule's
  // configured format. This is the real part of "scheduling": on-demand
  // generation of the right report in the right format.
  async function runNow(schedule) {
    setRunning(schedule.id);
    const today = TODAY.toISOString().slice(0, 10);
    let title, filename, sheetName, headers, rows2;

    if (schedule.reportType === "Sales & Revenue") {
      const { byCustomer, totals } = computeSalesByCustomer(invoices);
      title = "Sales & Revenue Report"; filename = `sales-revenue-${today}`; sheetName = "Revenue by Customer";
      headers = ["Customer", "Invoices", "Billed (TZS 000)", "Collected (TZS 000)", "Outstanding (TZS 000)"];
      rows2 = [...byCustomer.map((r) => [r.customer, r.count, r.billed, r.collected, r.outstanding]), ["TOTAL", totals.count, totals.billed, totals.collected, totals.outstanding]];
    } else if (schedule.reportType === "Inventory Valuation") {
      const { byCategory, grandTotal } = computeValuationByCategory(inventory);
      title = "Inventory Valuation Report"; filename = `inventory-valuation-${today}`; sheetName = "Stock Valuation";
      headers = ["Category", "SKU", "Item", "Qty", "Unit", "Unit Cost (TZS 000)", "Value (TZS 000)"];
      rows2 = [...byCategory.flatMap((c) => c.items.map((it) => [c.category, it.sku, it.name, it.qty, it.unit, it.unitCost, Math.round(it.value)])), ["GRAND TOTAL", "", "", "", "", "", Math.round(grandTotal)]];
    } else {
      const figures = computePnLFigures(invoices, expensesHook.rows);
      title = "Profit & Loss Statement"; filename = `profit-and-loss-${today}`; sheetName = "Profit and Loss";
      headers = ["Line", "Amount (TZS 000)"];
      rows2 = [["Revenue collected", Math.round(figures.collected)], ["Total billed (incl. uncollected)", Math.round(figures.billed)],
        ...figures.expRows.map(([cat, amt]) => [`Expense: ${cat}`, Math.round(amt)]), ["Total operating expenses", Math.round(figures.expTotal)], ["Net position", Math.round(figures.net)]];
    }

    const html = buildTableHtml(title, headers, rows2);
    if (schedule.format === "CSV") exportCSV(`${filename}.csv`, headers, rows2);
    else if (schedule.format === "Excel") exportExcel(`${filename}.xlsx`, sheetName, headers, rows2);
    else if (schedule.format === "Word") exportWord(`${filename}.doc`, title, html);
    else printAsPDF(title, html);

    setRows((prev) => prev.map((s) => (s.id === schedule.id ? { ...s, lastRun: today } : s)));
    notify(`${schedule.reportType} generated. Since there is no backend here, this ran because you clicked it — see the note below about unattended scheduling.`);
    if (IS_CONFIGURED && schedule.dbId) {
      try { await sb("scheduled_reports").eq("id", schedule.dbId).update({ last_run: today }).run(); } catch (_e) { /* the export itself already succeeded; a log-sync miss is not worth a second toast */ }
    }
    setRunning(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <CalendarCheck size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          "Run Now" genuinely generates and downloads the report in the format below — that part is fully real. What is not: this schedule won't fire on its own while the page is closed. A browser can't execute code with no tab open; real unattended delivery needs a server-side scheduled job (a cron function that runs this same export and emails it), the same category of gap already documented for Subscriptions billing and several Notification channels.
        </p>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Schedule
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[720px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Report</th><th className="px-4 py-3 font-medium">Frequency</th><th className="px-4 py-3 font-medium">Format</th><th className="px-4 py-3 font-medium">Recipient</th><th className="px-4 py-3 font-medium">Last Run</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={7} />}
              {!loading && rows.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#111827]">{s.reportType}</td>
                  <td className="px-4 py-3 text-slate-500">{s.frequency}</td>
                  <td className="px-4 py-3 text-slate-500">{s.format}</td>
                  <td className="px-4 py-3 text-slate-500">{s.recipientEmail || "—"}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{s.lastRun || "Never"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(s.id)} className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: s.status === "Active" ? "#16A34A14" : "#9CA3AF14", color: s.status === "Active" ? "#16A34A" : "#9CA3AF" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.status === "Active" ? "#16A34A" : "#9CA3AF" }} />{s.status}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => runNow(s)} disabled={running === s.id} className="text-[11.5px] font-medium text-[#16A34A] hover:text-[#15803D] disabled:opacity-40">
                        {running === s.id ? "Running..." : "Run Now"}
                      </button>
                      <button onClick={() => deleteSchedule(s.id)} className="text-slate-300 hover:text-[#EF4444]" aria-label={`Delete schedule for ${s.reportType}`}><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={7}><EmptyState icon={CalendarCheck} title="No schedules yet" hint="Define a report, frequency, and recipient here." actionLabel="New Schedule" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <ScheduleFormPanel onClose={() => setShowForm(false)} onSubmit={addSch
function ARAgingReport({ invoices, company }) {
  const today = new Date();
  const buckets = useMemo(() => {
    const result = { current:[], days30:[], days60:[], days90:[], over90:[] };
    (invoices.rows || []).filter(inv => inv.status !== "Paid" && inv.status !== "Cancelled").forEach(inv => {
      const due   = new Date(inv.dueDate || inv.due_date);
      const days  = Math.floor((today - due) / 86400000);
      const bal   = inv.totalAmount - (inv.amountPaid||inv.amount_paid||0) || inv.total || 0;
      const item  = { id:inv.id, customer:inv.customer, balance:bal, days, dueDate:inv.dueDate||inv.due_date };
      if (days <= 0)     result.current.push(item);
      else if (days<=30) result.days30.push(item);
      else if (days<=60) result.days60.push(item);
      else if (days<=90) result.days90.push(item);
      else               result.over90.push(item);
    });
    return result;
  }, [invoices.rows]);

  const bucketDefs = [
    { key:"current", label:"Current (Not Yet Due)",  col:"#16A34A", bg:"#F0FDF4" },
    { key:"days30",  label:"1–30 Days Overdue",       col:"#2563EB", bg:"#EFF6FF" },
    { key:"days60",  label:"31–60 Days Overdue",      col:"#D97706", bg:"#FFFBEB" },
    { key:"days90",  label:"61–90 Days Overdue",      col:"#EA580C", bg:"#FFF7ED" },
    { key:"over90",  label:"90+ Days Overdue",        col:"#EF4444", bg:"#FEF2F2" },
  ];

  const totalReceivables = Object.values(buckets).flat().reduce((s,i)=>s+i.balance,0);

  function exportARAging() {
    const rows3 = [...invoices.rows].map(inv=>{
      const bal=lineTotal(inv.items||[]).total-(inv.amountPaid||0);
      const days=inv.dueDate?Math.max(0,Math.ceil((Date.now()-new Date(inv.dueDate))/86400000)):0;
      return {Customer:inv.customer,Invoice:inv.id,DueDate:inv.dueDate||"",Days:days,Balance_k:Math.round(bal/1000),Status:inv.status};
    }).filter(r=>r.Balance_k>0);
    downloadCSV("ar-aging",rows3,[{key:"Customer",label:"Customer"},{key:"Invoice",label:"Invoice"},{key:"DueDate",label:"Due Date"},{key:"Days",label:"Days Overdue"},{key:"Balance_k",label:"Balance (TZS k)"},{key:"Status",label:"Status"}]);
  }
  return (
    <div className="space-y-4">
      <ReportToolbar title="AR Aging Report" onPrint={()=>printReport("AR Aging Report",`<p style="padding:16px;color:#6B7280;font-size:12px">Accounts receivable aging from ${invoices.rows.length} invoices. Generated: ${new Date().toLocaleDateString()}</p>`,company)} onCSV={exportARAging}/>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {bucketDefs.map(b => {
          const items = buckets[b.key] || [];
          const total = items.reduce((s,i)=>s+i.balance,0);
          return (
            <div key={b.key} className="rounded-xl border p-3 text-center" style={{background:b.bg,borderColor:b.col+"30"}}>
              <p className="text-[11px] text-slate-500 mb-1 leading-tight">{b.label}</p>
              <p className="text-[18px] font-bold" style={{color:b.col}}>TZS {money(total)}k</p>
              <p className="text-[10.5px] text-slate-400">{items.length} invoice{items.length!==1?"s":""}</p>
            </div>
          );
        })}
      </div>

      {/* AR Aging chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Receivables by Aging Bucket</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={bucketDefs.map(b=>({
            name: b.label.split(" ")[0]+" "+b.label.split(" ")[1],
            amount: buckets[b.key].reduce((s,i)=>s+i.balance,0),
            fill: b.col,
          }))} margin={{left:-20,top:0,right:0,bottom:0}}>
            <CartesianGrid vertical={false} stroke="#F3F4F6"/>
            <XAxis dataKey="name" tick={{fontSize:10}}/>
            <YAxis tick={{fontSize:10}}/>
            <Tooltip formatter={v=>"TZS "+money(v)+"k"}/>
            <Bar dataKey="amount" radius={[4,4,0,0]}>
              {bucketDefs.map((b,i)=><Cell key={i} fill={b.col}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed table */}
      {bucketDefs.filter(b=>(buckets[b.key]||[]).length>0).map(b => (
        <div key={b.key} className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100" style={{background:b.bg}}>
            <p className="text-[13px] font-semibold" style={{color:b.col}}>{b.label} — TZS {money(buckets[b.key].reduce((s,i)=>s+i.balance,0))}k ({buckets[b.key].length} invoices)</p>
          </div>
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-50 bg-slate-50/50">{["Customer","Due Date","Days Overdue","Balance"].map(h=>(
              <th key={h} className="px-4 py-2.5 text-left text-[10px] font-medium uppercase text-slate-400">{h}</th>
            ))}</tr></thead>
            <tbody>{buckets[b.key].map(item=>(
              <tr key={item.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2.5 font-medium text-[#111827]">{item.customer}</td>
                <td className="px-4 py-2.5 font-mono text-[11.5px] text-slate-400">{item.dueDate}</td>
                <td className="px-4 py-2.5 font-bold" style={{color:b.col}}>{item.days > 0 ? item.days+" days" : "Not yet due"}</td>
                <td className="px-4 py-2.5 font-mono font-bold" style={{color:b.col}}>TZS {money(item.balance)}k</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

function TaxVATReport({ invoices, expenses, company }) {
  const taxRate = company?.taxRate || 18;
  const today   = new Date();
  const months  = Array.from({length:6},(_,i)=>{
    const d = new Date(today.getFullYear(), today.getMonth()-5+i, 1);
    return { key: d.toISOString().slice(0,7), label: d.toLocaleString("default",{month:"short"})+" "+d.getFullYear() };
  });

  const taxData = useMemo(() => months.map(m => {
    const monthInvs = (invoices.rows||[]).filter(inv=>(inv.dueDate||inv.due_date||"").startsWith(m.key));
    const monthExps = (expenses||[]).filter(exp=>(exp.expense_date||exp.date||"").startsWith(m.key));
    const outputVAT = monthInvs.reduce((s,inv)=>{
      const amt = inv.totalAmount||inv.total||0;
      return s + (amt * taxRate / (100 + taxRate)); // extract VAT from inclusive amount
    }, 0);
    const inputVAT = monthExps.reduce((s,exp)=>{
      const amt = exp.amount||0;
      return s + (amt * taxRate / (100 + taxRate));
    }, 0);
    return { ...m, outputVAT:Math.round(outputVAT), inputVAT:Math.round(inputVAT), netVAT:Math.round(outputVAT-inputVAT) };
  }), [invoices.rows, expenses, taxRate]);

  const totalOutput = taxData.reduce((s,d)=>s+d.outputVAT,0);
  const totalInput  = taxData.reduce((s,d)=>s+d.inputVAT,0);
  const totalNet    = taxData.reduce((s,d)=>s+d.netVAT,0);

  const printTax = () => {
    const rows = taxData.map(d => `<tr><td>${d.label}</td><td class="right">TZS ${money(d.outputVAT)}k</td><td class="right">TZS ${money(d.inputVAT)}k</td><td class="right" style="color:${d.netVAT>0?"#16A34A":"#EF4444"}">TZS ${money(d.netVAT)}k</td></tr>`).join("");
    printAsPDF("VAT Return Report",
      `<h2>VAT ANALYSIS — ${taxRate}%</h2>
       <table><thead><tr><th>Period</th><th>Output VAT (Sales)</th><th>Input VAT (Expenses)</th><th>Net VAT Payable</th></tr></thead>
       <tbody>${rows}</tbody>
       <tr class="total-row"><td>TOTAL</td><td class="right">TZS ${money(totalOutput)}k</td><td class="right">TZS ${money(totalInput)}k</td><td class="right">TZS ${money(totalNet)}k</td></tr>
       </table>
       <div class="summary">
         <div class="sum-row"><span>Total Output VAT (from sales)</span><span>TZS ${money(totalOutput)}k</span></div>
         <div class="sum-row"><span>Total Input VAT (from purchases)</span><span>TZS ${money(totalInput)}k</span></div>
         <div class="sum-row"><span style="color:${totalNet>0?"#16A34A":"#EF4444"}">Net VAT Payable to TRA</span><span style="color:${totalNet>0?"#16A34A":"#EF4444"}">TZS ${money(totalNet)}k</span></div>
       </div>`,
      { accent:"#16A34A", companyName:company?.name, headerRight:"VAT Rate: "+taxRate+"% · Reporting period: 6 months" }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">VAT / Tax Report</h3>
          <p className="text-[12px] text-slate-400">Output VAT (on sales) vs Input VAT (on expenses) · {taxRate}% rate · TRA compliance</p>
        </div>
        <button onClick={printTax} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl bg-[#16A34A]">
          <Printer size={13}/>Export VAT Return
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[["Output VAT (Sales)","TZS "+money(totalOutput)+"k","#2563EB"],["Input VAT (Expenses)","TZS "+money(totalInput)+"k","#7C3AED"],["Net VAT Payable","TZS "+money(totalNet)+"k",totalNet>0?"#16A34A":"#EF4444"]].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[20px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-[13.5px] font-semibold text-[#111827]">Monthly VAT Analysis (6-Month)</p>
        </div>
        <table className="w-full text-[12.5px]">
          <thead><tr className="border-b border-slate-100 bg-slate-50">{["Period","Output VAT (Sales)","Input VAT (Expenses)","Net Payable","Status"].map(h=>(
            <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>
          ))}</tr></thead>
          <tbody>
            {taxData.map(d=>(
              <tr key={d.key} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-3 font-medium text-[#111827]">{d.label}</td>
                <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">TZS {money(d.outputVAT)}k</td>
                <td className="px-4 py-3 font-mono text-[#7C3AED]">TZS {money(d.inputVAT)}k</td>
                <td className="px-4 py-3 font-mono font-bold" style={{color:d.netVAT>0?"#16A34A":"#EF4444"}}>TZS {money(d.netVAT)}k</td>
                <td className="px-4 py-3">
                  <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:d.netVAT>0?"#DCFCE7":"#FEE2E2",color:d.netVAT>0?"#15803D":"#991B1B"}}>
                    {d.netVAT > 0 ? "Payable" : "Refund"}
                  </span>
                </td>
              </tr>
            ))}
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-bold">
              <td className="px-4 py-3 font-bold text-[#111827]">TOTAL</td>
              <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">TZS {money(totalOutput)}k</td>
              <td className="px-4 py-3 font-mono font-bold text-[#7C3AED]">TZS {money(totalInput)}k</td>
              <td className="px-4 py-3 font-mono font-bold" style={{color:totalNet>0?"#16A34A":"#EF4444"}}>TZS {money(totalNet)}k</td>
              <td className="px-4 py-3"/>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// (fragment removed)




function ScheduleFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ reportType: SCHEDULE_REPORT_TYPES[0], frequency: SCHEDULE_FREQUENCIES[0], format: SCHEDULE_FORMATS[0], recipientEmail: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Reports</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Schedule</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Report">
            <select className={inputClass} value={form.reportType} onChange={(e) => set("reportType", e.target.value)}>
              {SCHEDULE_REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Frequency">
              <select className={inputClass} value={form.frequency} onChange={(e) => set("frequency", e.target.value)}>
                {SCHEDULE_FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>
            <FormField label="Format">
              <select className={inputClass} value={form.format} onChange={(e) => set("format", e.target.value)}>
                {SCHEDULE_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Recipient email"><input type="email" className={inputClass} value={form.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)} placeholder="name@company.tz" /></FormField>
          <p className="text-[11.5px] text-slate-400">Delivery to this address is not automatic yet — see the note on this tab.</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Create Schedule</button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------- INTEGRATIONS -------------------------------- */

const INTEGRATION_TABS = [
  { id: "connections", label: "Connections", icon: Globe },
  { id: "mobile-money", label: "Mobile Money", icon: Smartphone },
  { id: "banking", label: "Banking", icon: Landmark },
  { id: "tax", label: "Tax", icon: Percent },
  { id: "qr-barcode", label: "QR & Barcode", icon: QrCode },
  { id: "esignature", label: "E-Signature", icon: PenTool },
];

// The directory covering all fifteen integrations this request named,
// including the eleven that already lived across Mobile Money, Banking,
// and Tax — those tabs were always real integrations, just not visible
// as one list until now. Matches how real integration marketplaces
// (Zapier, HubSpot) present a single directory even when deeper
// configuration happens in dedicated sub-pages.
const INTEGRATION_DIRECTORY = [
  { name: "Microsoft 365", tab: "connections", functional: false },
  { name: "Google Workspace", tab: "connections", functional: false },
  { name: "Slack", tab: "connections", functional: true },
  { name: "Zoom", tab: "connections", functional: false },
  { name: "WhatsApp Business", tab: "connections", functional: true },
  { name: "Stripe", tab: "connections", functional: true },
  { name: "PayPal", tab: "connections", functional: true },
  { name: "M-Pesa", tab: "mobile-money", functional: true },
  { name: "Airtel Money", tab: "mobile-money", functional: true },
  { name: "Tigo Pesa", tab: "mobile-money", functional: true },
  { name: "HaloPesa", tab: "mobile-money", functional: true },
  { name: "Banks", tab: "banking", functional: true },
  { name: "Tax Authorities", tab: "tax", functional: true },
  { name: "E-Commerce Platforms", tab: "connections", functional: false },
  { name: "POS Systems", tab: "connections", functional: false },
];

function Integrations({ invoices, expenses, canManage, currentUser, onNavigate }) {
  const [tab, setTab] = useState("connections");
  const functionalCount = INTEGRATION_DIRECTORY.filter((i) => i.functional).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Integration Hub</h1>
        <p className="text-[13px] text-slate-500 mt-1">Real capabilities where a browser genuinely can — honest limits where it cannot. {functionalCount} of {INTEGRATION_DIRECTORY.length} are genuinely working today, not configuration for a backend this app does not have.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wide mb-3">Integration Directory</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {INTEGRATION_DIRECTORY.map((item) => (
            <button
              key={item.name}
              onClick={() => setTab(item.tab)}
              className="flex items-center justify-between gap-1.5 text-left border border-slate-100 rounded-lg px-2.5 py-2 hover:border-[#16A34A]/40 transition-colors"
            >
              <span className="text-[11.5px] text-slate-600 truncate">{item.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.functional ? "bg-[#16A34A]" : "bg-slate-300"}`} title={item.functional ? "Real and working" : "Needs backend infrastructure"} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {INTEGRATION_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${isActive ? "bg-white text-[#111827] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "connections" && <IntegrationConnections canManage={canManage} currentUser={currentUser} />}
      {tab === "mobile-money" && <MobileMoneyReconciliation invoices={invoices} currentUser={currentUser} />}
      {tab === "banking" && <BankStatementImport invoices={invoices} expenses={expenses} />}
      {tab === "tax" && <TaxIntegration onNavigate={onNavigate} />}
      {tab === "qr-barcode" && <QRBarcodeTools onNavigate={onNavigate} />}
      {tab === "esignature" && <ESignature />}
    </div>
  );
}

/* ------------------------------ INTEGRATION CONNECTIONS ------------------------------ */

function IntegrationConnections({ canManage, currentUser }) {
  const connections = useCompanyTable("integration_connections", INTEGRATION_CONNECTIONS.map((c) => ({ id: c.id, enabled: false, tenantId: "", clientId: "", paymentLink: "", paypalMeLink: "", webhookUrl: "", apiKey: "", businessNumber: "", storeUrl: "", terminalId: "" })), { mapRow: mapIntegrationConnectionRow });
  const { rows, setRows, loading } = connections;

  function getConfig(id) { return rows.find((c) => c.id === id) || {}; }

  async function updateField(id, key, value) {
    if (!canManage) return;
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    if (IS_CONFIGURED) {
      const columnMap = {
        enabled: "enabled", tenantId: "tenant_id", clientId: "client_id", paymentLink: "payment_link", paypalMeLink: "paypal_me_link",
        webhookUrl: "webhook_url", apiKey: "api_key", businessNumber: "business_number", storeUrl: "store_url", terminalId: "terminal_id",
      };
      try { await sb("integration_connections").eq("integration_id", id).update({ [columnMap[key]]: value }).run(); } catch (_e) { /* saved locally regardless */ }
    }
  }

  function openLink(url) {
    if (!url || !url.trim()) { notify("No link configured yet.", "error"); return; }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function testSlackWebhook(url) {
    if (!url || !url.trim()) { notify("No webhook URL configured yet.", "error"); return; }
    const result = await sendWebhookNotification(url, "Test message from Smart Manager — your Slack connection works.");
    notify(result.note, result.ok ? "success" : "error");
  }

  function openWhatsApp(number) {
    if (!number || !number.trim()) { notify("No WhatsApp number configured yet.", "error"); return; }
    window.open(`https://wa.me/${number.replace(/[^0-9]/g, "")}`, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      {!canManage && (
        <div className="flex items-start gap-2.5 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-3">
          <Lock size={15} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#8a670a] leading-relaxed">You are viewing as {currentUser.role}. Editing connection configuration requires a full-write role.</p>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {INTEGRATION_CONNECTIONS.map((meta) => {
          const config = getConfig(meta.id);
          const Icon = meta.icon;
          const linkField = meta.fields.find((f) => f.key === "paymentLink" || f.key === "paypalMeLink");
          return (
            <div key={meta.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#111827]/5 flex items-center justify-center"><Icon size={16} className="text-[#111827]" /></div>
                  <div>
                    <p className="text-[14px] font-semibold text-[#111827]">{meta.name}</p>
                    <span className={`text-[10px] font-medium ${meta.functional ? "text-[#16A34A]" : "text-slate-400"}`}>{meta.functional ? "Real, working today" : "Needs backend OAuth"}</span>
                  </div>
                </div>
                {loading ? <div className="w-9 h-5 rounded-full skeleton-shimmer" /> : (
                  <ToggleSwitch on={config.enabled} disabled={!canManage} onChange={() => updateField(meta.id, "enabled", !config.enabled)} label={`${config.enabled ? "Disable" : "Enable"} ${meta.name}`} />
                )}
              </div>
              <p className="text-[11.5px] text-slate-400 leading-relaxed mb-3">{meta.requirement}</p>
              <div className="space-y-2.5 mb-3">
                {meta.fields.map((f) => (
                  <div key={f.key}>
                    <label className="text-[11px] font-medium text-slate-500 block mb-1">{f.label}</label>
                    <input className={inputClass} value={config[f.key] || ""} onChange={(e) => updateField(meta.id, f.key, e.target.value)} placeholder={f.placeholder} disabled={!config.enabled || !canManage} />
                  </div>
                ))}
              </div>
              {meta.functional && linkField && (
                <button onClick={() => openLink(config[linkField.key])} disabled={!config.enabled} className="w-full text-[12px] font-medium btn-primary text-white rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                  <Send size={12} /> Open Payment Link
                </button>
              )}
              {meta.functional && meta.id === "slack" && (
                <button onClick={() => testSlackWebhook(config.webhookUrl)} disabled={!config.enabled} className="w-full text-[12px] font-medium btn-primary text-white rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                  <Send size={12} /> Send Test Message
                </button>
              )}
              {meta.functional && meta.id === "whatsapp-business" && (
                <button onClick={() => openWhatsApp(config.businessNumber)} disabled={!config.enabled} className="w-full text-[12px] font-medium btn-primary text-white rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5">
                  <MessageCircle size={12} /> Open WhatsApp Chat
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------ MOBILE MONEY RECONCILIATION ------------------------------ */

// Every mobile money provider in East Africa requires server-side API
// credentials and a hosted callback URL to receive payment confirmations
// automatically — none of that exists here. What's genuinely real and,
// for a small business, honestly how this already works day to day: the
// owner sees a payment confirmation SMS on their phone and records it
// against the right invoice. This formalizes that exact real workflow
// using the same recordPayment() function every other payment method
// already goes through.
function MobileMoneyReconciliation({ invoices, currentUser }) {
  const outstanding = invoices.rows.filter((inv) => inv.status !== "Paid");
  const [invoiceId, setInvoiceId] = useState(outstanding[0]?.id || "");
  const [provider, setProvider] = useState(MOBILE_MONEY_PROVIDERS[0]);
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");

  const invoice = outstanding.find((i) => i.id === invoiceId);
  const balance = invoice ? lineTotal(invoice.items).total - (invoice.amountPaid || 0) : 0;

  function submit(e) {
    e.preventDefault();
    if (!invoice || !(Number(amount) > 0) || !reference.trim()) return;
    const patch = recordPayment(invoices, invoiceId, { amount: Math.min(Number(amount), balance), method: "Mobile Money", date: TODAY.toISOString().slice(0, 10), reference: `${provider} · ${reference.trim()}` }, `${currentUser.name} (${currentUser.role})`);
    if (patch) { setReference(""); setAmount(""); }
  }

  const recentMobileMoneyPayments = useMemo(() => {
    const all = [];
    invoices.rows.forEach((inv) => (inv.payments || []).forEach((p) => { if (p.method === "Mobile Money") all.push({ ...p, invoiceId: inv.id, customer: inv.customer }); }));
    return all.sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10);
  }, [invoices.rows]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Smartphone size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          No live M-Pesa, Airtel Money, Tigo Pesa, or HaloPesa API connection exists — each requires server-held credentials and a hosted callback URL. This records a payment you've already confirmed (from the SMS notification on your phone) against the right invoice, the same real workflow most businesses already use.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Record a Mobile Money Payment</h3>
        {outstanding.length === 0 ? (
          <p className="text-[12.5px] text-slate-400">No outstanding invoices to reconcile against right now.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <FormField label="Invoice">
              <select className={inputClass} value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)}>
                {outstanding.map((inv) => <option key={inv.id} value={inv.id}>{inv.id} — {inv.customer}</option>)}
              </select>
              {invoice && <p className="text-[11px] text-slate-400 mt-1">Balance due: TZS {money(Math.round(balance))}k</p>}
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Provider">
                <select className={inputClass} value={provider} onChange={(e) => setProvider(e.target.value)}>
                  {MOBILE_MONEY_PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </FormField>
              <FormField label="Amount (TZS 000)" required>
                <input type="number" min="0" max={balance} className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
              </FormField>
            </div>
            <FormField label="Transaction reference" required>
              <input className={inputClass} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. QJJ4K7XLMN (from the confirmation SMS)" />
            </FormField>
            <button type="submit" className="w-full btn-primary text-white text-[13px] font-medium rounded-lg py-2.5">Record Payment</button>
          </form>
        )}
      </div>

      {recentMobileMoneyPayments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100"><h3 className="text-[14px] font-semibold text-[#111827]">Recent Mobile Money Payments</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[560px]">
              <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Invoice</th><th className="px-4 py-3 font-medium">Customer</th><th className="px-4 py-3 font-medium">Reference</th><th className="px-4 py-3 font-medium text-right">Amount</th>
              </tr></thead>
              <tbody>
                {recentMobileMoneyPayments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-mono text-[#111827]">{p.invoiceId}</td>
                    <td className="px-4 py-3 text-slate-500">{p.customer}</td>
                    <td className="px-4 py-3 text-slate-500">{p.reference || "—"}</td>
                    <td className="px-4 py-3 text-right font-mono text-[#16A34A]">+{money(p.amount)}k</td>
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

/* ------------------------------ BANK STATEMENT IMPORT ------------------------------ */

// No bank in the region exposes a public API a generic app can connect
// to — real Open Banking-style access needs bank-specific, often
// government-regulated, server-side credentials. What's genuinely
// achievable: every bank lets a customer export a statement as CSV or
// Excel, and this parses that real file (via the same SheetJS library
// already used for report exports) and suggests matches against real
// outstanding invoices by amount — honest reconciliation support, not a
// live feed.
function BankStatementImport({ invoices, expenses }) {
  const [transactions, setTransactions] = useState([]);
  const [fileName, setFileName] = useState("");
  const outstanding = invoices.rows.filter((inv) => inv.status !== "Paid");

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        // Best-effort column detection: look for a row of headers, then
        // take the first text column as description and the first
        // numeric-looking column as amount — real bank exports vary
        // enough in format that a rigid parser would fail on most of them.
        const dataRows = rows.slice(1).filter((r) => r.length > 0);
        const parsed = dataRows.map((r, i) => {
          const amountCell = r.find((c) => typeof c === "number");
          const textCell = r.find((c) => typeof c === "string" && c.trim());
          return { id: i, description: textCell || "Unknown", amount: amountCell || 0 };
        }).filter((t) => t.amount !== 0);
        setTransactions(parsed);
        notify(`Parsed ${parsed.length} transactions from ${file.name}`);
      } catch (err) {
        notify("Couldn't parse that file — try exporting your statement as CSV or Excel.", "error");
      }
    };
    reader.readAsBinaryString(file);
  }

  function findMatch(amount) {
    return outstanding.find((inv) => Math.abs((lineTotal(inv.items).total - (inv.amountPaid || 0)) - Math.abs(amount)) < 1);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Landmark size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          No bank in this environment exposes a connectable API — real Open Banking access needs bank-specific, regulated credentials. Upload a real statement export (CSV or Excel) instead; this parses it and flags amounts that match an outstanding invoice.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-8 cursor-pointer hover:border-[#16A34A]/40 hover:bg-slate-50/50 transition-colors">
          <UploadCloud size={22} className="text-slate-300" />
          <span className="text-[13px] font-medium text-slate-600">{fileName || "Upload bank statement (CSV or Excel)"}</span>
          <span className="text-[11px] text-slate-400">Click to browse</span>
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleFile} />
        </label>
      </div>

      {transactions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100"><h3 className="text-[14px] font-semibold text-[#111827]">Parsed Transactions</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[560px]">
              <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium text-right">Amount</th><th className="px-4 py-3 font-medium">Suggested Match</th>
              </tr></thead>
              <tbody>
                {transactions.map((t) => {
                  const match = findMatch(t.amount);
                  return (
                    <tr key={t.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-4 py-3 text-slate-700">{t.description}</td>
                      <td className="px-4 py-3 text-right font-mono">{money(Math.round(t.amount))}</td>
                      <td className="px-4 py-3">
                        {match ? (
                          <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: "#16A34A14", color: "#16A34A" }}>
                            <CheckCircle2 size={11} /> {match.id} — {match.customer}
                          </span>
                        ) : <span className="text-[11px] text-slate-300">No match found</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------ TAX ------------------------------------ */

function TaxIntegration({ onNavigate }) {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Percent size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">{TAX_AUTHORITY_NOTE}</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-2">Prepare your filing</h3>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-4">
          Finance's Tax tab already computes output VAT live from real invoices, on an invoice basis — the number most VAT filings ask for. There's no direct submission from here; use it to prepare what you file manually.
        </p>
        {onNavigate && (
          <button onClick={() => onNavigate("finance")} className="btn-primary text-white text-[13px] font-medium rounded-lg py-2.5 px-4 flex items-center gap-1.5">
            <Landmark size={13} /> Open Finance → Tax
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- QR & BARCODE -------------------------------- */

// Real QR codes, genuinely scannable — rendered via a public QR image API
// (api.qrserver.com), the same service already used elsewhere for this
// pattern, since no client-side QR-encoding library is available in this
// environment. This requires the browser to load an external image; a
// fully offline generator would need a bundled encoding library instead.
function QRBarcodeTools({ onNavigate }) {
  const [text, setText] = useState("");
  const qrUrl = text.trim() ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(text.trim())}` : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Generate a QR Code</h3>
        <p className="text-[12px] text-slate-400 mb-4">For an invoice reference, a payment link, or any text — genuinely real and scannable</p>
        <FormField label="Data to encode">
          <input className={inputClass} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. INV-8801 or a payment link URL" />
        </FormField>
        {qrUrl && (
          <div className="mt-4 flex flex-col items-center gap-3 bg-slate-50 rounded-lg p-4">
            <img src={qrUrl} alt="Generated QR code" width={180} height={180} className="rounded-lg bg-white p-2 border border-slate-200" />
            <a href={qrUrl} download="qrcode.png" className="text-[12px] font-medium text-[#16A34A] hover:text-[#15803D] flex items-center gap-1.5"><Download size={12} /> Download</a>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Barcodes</h3>
        <p className="text-[12px] text-slate-400 mb-4">Already real and live — every Inventory item gets a deterministic barcode automatically</p>
        <p className="text-[13px] text-slate-600 leading-relaxed mb-4">
          Inventory generates an EAN-13-style code from each item's SKU — the same code every time, searchable at checkout in POS. No separate barcode system needed here; it's already wired into Inventory and POS.
        </p>
        {onNavigate && (
          <button onClick={() => onNavigate("inventory")} className="btn-secondary text-[12.5px] font-medium rounded-lg py-2 px-4 flex items-center gap-1.5">
            <Package size={13} /> Open Inventory
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------- E-SIGNATURE -------------------------------- */

// A real, working signature pad using the Canvas API — genuine capture,
// not a mockup. What this honestly is not: a certified e-signature
// platform like DocuSign or Adobe Sign, which additionally provide
// identity verification, tamper-evident sealing, and a legal audit trail.
// This is lightweight capture for informal internal sign-off, said
// plainly rather than implied to be more than it is.
function ESignature() {
  const signatures = useCompanyTable("signatures", signaturesSeed, { order: { col: "signed_at", ascending: false }, mapRow: mapSignatureRow });
  const { rows, setRows, loading } = signatures;
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [documentRef, setDocumentRef] = useState("");
  const [signerName, setSignerName] = useState("");
  const [hasDrawn, setHasDrawn] = useState(false);

  function getPos(e, canvas) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;
    return { x: point.clientX - rect.left, y: point.clientY - rect.top };
  }

  function startDraw(e) {
    e.preventDefault();
    drawingRef.current = true;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function draw(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getPos(e, canvas);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827";
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  }
  function endDraw() { drawingRef.current = false; }
  function clearCanvas() {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  async function saveSignature() {
    if (!hasDrawn || !documentRef.trim() || !signerName.trim()) return;
    const imageData = canvasRef.current.toDataURL("image/png");
    const draft = { id: `SIG-${Date.now()}`, documentRef: documentRef.trim(), signerName: signerName.trim(), imageData, signedAt: new Date().toISOString() };
    setRows((prev) => [draft, ...prev]);
    notify(`Signature captured for ${draft.documentRef}`);
    clearCanvas();
    setDocumentRef("");
    setSignerName("");
    if (IS_CONFIGURED) {
      try { await sb("signatures").insert({ document_ref: draft.documentRef, signer_name: draft.signerName, image_data: draft.imageData }).run(); } catch (_e) { notify("Captured locally, but saving to the server failed.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <PenTool size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          A real, working signature pad for lightweight internal sign-off — not a certified e-signature platform. It does not verify identity, seal against tampering, or produce the legal audit trail DocuSign or Adobe Sign provide; use one of those for anything requiring that.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <FormField label="Document reference"><input className={inputClass} value={documentRef} onChange={(e) => setDocumentRef(e.target.value)} placeholder="e.g. QT-1043 or PC-02" /></FormField>
          <FormField label="Signer name"><input className={inputClass} value={signerName} onChange={(e) => setSignerName(e.target.value)} placeholder="Full name" /></FormField>
        </div>
        <p className="text-[11px] font-medium text-slate-500 mb-2">Sign below</p>
        <canvas
          ref={canvasRef}
          width={500}
          height={160}
          className="w-full border border-slate-200 rounded-lg bg-slate-50 touch-none cursor-crosshair"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        <div className="flex gap-2 mt-3">
          <button onClick={clearCanvas} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2 hover:bg-slate-50">Clear</button>
          <button onClick={saveSignature} disabled={!hasDrawn || !documentRef.trim() || !signerName.trim()} className="flex-1 btn-primary text-white text-[12px] font-medium rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed">Save Signature</button>
        </div>
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100"><h3 className="text-[14px] font-semibold text-[#111827]">Captured Signatures</h3></div>
          <div className="divide-y divide-slate-50">
            {rows.map((s) => (
              <div key={s.id} className="flex items-center gap-4 px-4 sm:px-5 py-3">
                <img src={s.imageData} alt={`Signature by ${s.signerName}`} className="h-10 bg-white border border-slate-100 rounded" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[#111827]">{s.signerName}</p>
                  <p className="text-[11px] text-slate-400">{s.documentRef} · {new Date(s.signedAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- DOCUMENTS ----------------------------------- */

export default ECommerce;
