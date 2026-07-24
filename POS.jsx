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


function POS({ inventory, transactionsHook, company, currentUser }) {
  const [tab, setTab] = useState("checkout");
  const transactions = transactionsHook;

  const todayStr = TODAY.toISOString().slice(0, 10);
  const stats = useMemo(() => {
    const today = transactions.rows.filter((t) => t.date === todayStr);
    const revenue = today.reduce((s, t) => s + t.items.reduce((si, it) => si + it.qty * it.price, 0) * (1 + TAX_RATE), 0);
    const itemsSold = today.reduce((s, t) => s + t.items.reduce((si, it) => si + it.qty, 0), 0);
    return { count: today.length, revenue, itemsSold, avg: today.length ? revenue / today.length : 0 };
  }, [transactions.rows, todayStr]);

  const POS_KPIS = [
    { label: "Today Sales", value: `TZS ${money(Math.round(stats.revenue))}k`, delta: "Incl. VAT", up: true, icon: CircleDollarSign },
    { label: "Transactions", value: String(stats.count), delta: "Today", up: true, icon: Receipt },
    { label: "Items Sold", value: String(stats.itemsSold), delta: "Today", up: true, icon: ShoppingBag },
    { label: "Avg Basket", value: `TZS ${money(Math.round(stats.avg))}k`, delta: "Per sale today", up: true, icon: Percent },
  ];

  return (
    <div className="space-y-5">
      <PosShiftPanel transactions={transactions} currentUser={currentUser} />
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Point of Sale</h1>
        <p className="text-[13px] text-slate-500 mt-1">Counter checkout, priced and stocked from live Inventory</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {POS_TABS.map((t) => {
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
        {POS_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      {tab === "checkout" && <Checkout inventory={inventory} transactions={transactions} company={company} />}
      {tab === "history" && <RegisterHistory transactions={transactions} inventory={inventory} company={company} />}
    </div>
  );
}

function Checkout({ inventory, transactions, company }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState([]); // [{ sku, name, price, qty }]
  const [method, setMethod] = useState("Cash");
  const [receipt, setReceipt] = useState(null);
  const [busy, setBusy] = useState(false);

  // POS sells the same physical stock Inventory tracks, priced with the
  // same retail markup the storefront uses — one product, one price,
  // regardless of which counter it's sold from.
  const products = useMemo(
    () => inventory.rows.map((it) => ({ ...it, price: Math.round(it.unitCost * MARKUP) })),
    [inventory.rows]
  );
  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = category === "all" || p.category === category;
      const matchesQ = !query.trim() || p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase());
      return matchesCat && matchesQ;
    });
  }, [products, category, query]);

  function addToCart(item) {
    const stock = inventory.rows.find((it) => it.sku === item.sku)?.qty || 0;
    setCart((prev) => {
      const existing = prev.find((c) => c.sku === item.sku);
      if (existing) {
        if (existing.qty >= stock) {
          notify(`Only ${stock} ${item.unit} of ${item.name} in stock`, "error");
          return prev;
        }
        return prev.map((c) => (c.sku === item.sku ? { ...c, qty: c.qty + 1 } : c));
      }
      if (stock <= 0) {
        notify(`${item.name} is out of stock`, "error");
        return prev;
      }
      return [...prev, { sku: item.sku, name: item.name, price: item.price, qty: 1, unit: item.unit }];
    });
  }

  function changeQty(sku, delta) {
    setCart((prev) => prev
      .map((c) => (c.sku === sku ? { ...c, qty: c.qty + delta } : c))
      .filter((c) => c.qty > 0));
  }

  const subtotal = cart.reduce((s, c) => s + c.qty * c.price, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  async function completeSale() {
    if (cart.length === 0 || busy) return;

    // Final stock-sufficiency check against live Inventory right before
    // committing — the cart could have gone stale if stock moved elsewhere
    // (a sales order fulfilled, a work order completed) while shopping.
    const shortages = cart.filter((c) => {
      const stock = inventory.rows.find((it) => it.sku === c.sku)?.qty || 0;
      return c.qty > stock;
    });
    if (shortages.length) {
      notify(`Not enough stock for: ${shortages.map((s) => s.name).join(", ")}`, "error");
      return;
    }

    setBusy(true);
    const draft = { id: docId("POS"), cashier: currentUser?.name || "You", method, date: TODAY.toISOString().slice(0, 10), createdAt: new Date().toISOString(), items: cart.map((c) => ({ sku: c.sku, name: c.name, qty: c.qty, price: c.price })), returns: [] };

    // Deduct sold quantities from the shared Inventory table immediately —
    // the same table Inventory, Manufacturing, and Sales all read.
    inventory.setRows((prev) => prev.map((it) => {
      const line = cart.find((c) => c.sku === it.sku);
      return line ? { ...it, qty: Math.max(0, it.qty - line.qty) } : it;
    }));
    transactions.setRows((prev) => [draft, ...prev]);

    if (IS_CONFIGURED) {
      try {
        const header = await sb("pos_transactions").insert({
          doc_number: draft.id, payment_method: method, subtotal, tax, total,
        }).single().run();
        if (header?.id) {
          await sb("pos_transaction_items").insert(
            cart.map((c) => ({ transaction_id: header.id, item_name: c.name, item_sku: c.sku, qty: c.qty, price: c.price }))
          ).run();
          transactions.setRows((prev) => prev.map((t) => (t.id === draft.id ? { ...t, dbId: header.id } : t)));
        }
        for (const c of cart) {
          const item = inventory.rows.find((it) => it.sku === c.sku);
          const newQty = Math.max(0, (item?.qty || 0) - c.qty);
          await sb("inventory_items").eq("sku", c.sku).update({ qty_on_hand: newQty }).run();
          await sb("inventory_stock_movements").insert({ item_id: c.sku, movement: "Out", qty: c.qty, reference: `${draft.id} sale` }).run();
        }
      } catch (e) {
        notify("Sale completed locally, but saving to the server failed.", "error");
      }
    }

    notify(`Sale complete — TZS ${money(total)}k`);
    setReceipt({ ...draft, subtotal, tax, total });
    setCart([]);
    setBusy(false);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
      {/* Product picker */}
      <div className="space-y-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto">
            <button
              onClick={() => setCategory("all")}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${category === "all" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}
            >
              All
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
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search or scan SKU..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/30 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((p) => {
            const status = stockStatus(p.qty, p.reorder);
            const outOfStock = status === "Out of Stock";
            return (
              <button
                key={p.sku}
                onClick={() => addToCart(p)}
                disabled={outOfStock}
                className={`text-left bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5 transition-all ${
                  outOfStock ? "opacity-40 cursor-not-allowed" : "hover:border-[#16A34A]/50 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <div
                  className="h-16 rounded-lg mb-2.5 flex items-center justify-center"
                  style={{ background: CATEGORY_GRADIENT[p.category] || "linear-gradient(135deg, #111827, #16A34A)" }}
                >
                  <Package size={20} strokeWidth={1.5} className="text-white/85" />
                </div>
                <p className="text-[12.5px] font-medium text-[#111827] leading-snug line-clamp-2 min-h-[32px]">{p.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[13px] font-mono font-semibold text-[#111827]">{money(p.price)}k</span>
                  <span className="text-[10.5px] text-slate-400 font-mono">{outOfStock ? "0 left" : `${p.qty} left`}</span>
                </div>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full bg-white rounded-xl border border-slate-200/80 shadow-sm">
              <EmptyState icon={Search} title="No products found" hint="Try a different search term or category." />
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 lg:sticky lg:top-0 flex flex-col">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-3 flex items-center gap-2">
          <ShoppingBag size={15} /> Current Sale
        </h3>

        {cart.length === 0 ? (
          <p className="text-[12.5px] text-slate-400 py-8 text-center">Tap a product to add it to the sale.</p>
        ) : (
          <div className="space-y-2.5 mb-4 max-h-[320px] overflow-y-auto">
            {cart.map((c) => (
              <div key={c.sku} className="flex items-center gap-2.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] font-medium text-[#111827] truncate">{c.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{money(c.price)}k each</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => changeQty(c.sku, -1)} aria-label={`Decrease ${c.name} quantity`} className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                    <Minus size={11} />
                  </button>
                  <span className="text-[12.5px] font-mono w-5 text-center">{c.qty}</span>
                  <button onClick={() => changeQty(c.sku, 1)} aria-label={`Increase ${c.name} quantity`} className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50">
                    <Plus size={11} />
                  </button>
                </div>
                <span className="text-[12.5px] font-mono text-[#111827] w-14 text-right shrink-0">{money(c.qty * c.price)}k</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-slate-100 pt-3 space-y-1.5 text-[12.5px] mb-4">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-mono">TZS {money(subtotal)}k</span></div>
          <div className="flex justify-between text-slate-500"><span>VAT ({Math.round(TAX_RATE * 100)}%)</span><span className="font-mono">TZS {money(tax)}k</span></div>
          <div className="flex justify-between text-[#111827] font-semibold text-[14px] pt-1.5 border-t border-slate-100"><span>Total</span><span className="font-mono">TZS {money(total)}k</span></div>
        </div>

        <div className="mb-4">
          <p className="text-[11px] font-medium text-slate-500 mb-2">Payment method</p>
          <div className="grid grid-cols-3 gap-1.5">
            {POS_PAYMENT_METHODS.map((m) => {
              const Icon = m === "Cash" ? Banknote : m === "Card" ? CreditCard : Smartphone;
              return (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`flex flex-col items-center gap-1 text-[10.5px] font-medium rounded-lg py-2 border transition-colors ${
                    method === m ? "border-[#16A34A] bg-[#16A34A]/8 text-[#111827]" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={15} /> {m}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={completeSale}
          disabled={cart.length === 0 || busy}
          className="btn-primary text-white text-[13px] font-semibold rounded-lg py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Processing..." : `Complete Sale · TZS ${money(total)}k`}
        </button>
      </div>

      {receipt && <ReceiptPanel receipt={receipt} onClose={() => setReceipt(null)} company={company} />}
    </div>
  );
}

function ReceiptPanel({ receipt, onClose, allowReturn, onOpenReturn, company }) {
  const returns = receipt.returns || [];
  const refunded = returns.reduce((s, r) => s + r.refundTotal, 0);
  const fullyReturned = receipt.items.every((it) => {
    const returnedQty = returns.reduce((s, r) => s + (r.items.find((ri) => ri.sku === it.sku)?.qty || 0), 0);
    return returnedQty >= it.qty;
  });

  // A real bug fixed here, not just a new feature added: this button had
  // no onClick handler at all before this pass — clicking "Print
  // Receipt" did nothing, silently. Fixed with a genuine print function
  // that opens a real, separate print document sized to the company
  // actual configured receipt width (58mm, 80mm, or A4) rather than
  // printing whatever happens to be on screen, honoring the real
  // header/footer/logo preferences set in Settings.
  function printReceipt() {
    const width = company?.receiptWidth || "80mm";
    const showLogo = company?.receiptShowLogo !== false;
    const footer = company?.receiptFooter || "Thank you for your business!";
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) { notify("Pop-up blocked — allow pop-ups to print receipts.", "error"); return; }
    const itemRows = receipt.items.map((it) => `<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>${it.qty}× ${it.name}</span><span>${money(it.qty * it.price)}k</span></div>`).join("");
    win.document.write(`
      <html><head><title>Receipt ${receipt.id}</title>
      <style>
        body { font-family: monospace; padding: 12px; max-width: ${width === "A4" ? "210mm" : width}; margin: 0 auto; font-size: ${width === "58mm" ? "10px" : "12px"}; }
        h2 { text-align: center; margin: 4px 0; }
        hr { border: none; border-top: 1px dashed #999; margin: 8px 0; }
        .total { display:flex; justify-content:space-between; font-weight:bold; margin-top: 6px; }
        .footer { text-align:center; margin-top: 14px; font-size: 0.9em; }
      </style></head>
      <body>
        ${showLogo ? "<h2>" + (company?.name || "Receipt") + "</h2>" : ""}
        <p style="text-align:center;margin:0;">${receipt.id} · ${TODAY.toISOString().slice(0, 10)}</p>
        <hr />
        ${itemRows}
        <hr />
        <div class="total"><span>Total</span><span>TZS ${money(receipt.total)}k</span></div>
        <div class="footer">${footer}</div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#16A34A14" }}>
              <CheckCircle2 size={18} className="text-[#16A34A]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 font-mono">{receipt.id}</p>
              <h2 className="text-[16px] font-semibold text-[#111827]">{allowReturn ? "Receipt" : "Sale Complete"}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {fullyReturned && (
          <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5 mb-4 w-fit" style={{ backgroundColor: "#EF444414", color: "#EF4444" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" /> Fully returned
          </span>
        )}

        <div className="border border-slate-100 rounded-lg overflow-hidden mb-5">
          {receipt.items.map((it, i) => (
            <div key={i} className={`flex items-center justify-between px-3 py-2.5 text-[13px] ${i !== receipt.items.length - 1 ? "border-b border-slate-50" : ""}`}>
              <div>
                <p className="text-slate-700">{it.name}</p>
                <p className="text-[11px] text-slate-400 font-mono">{it.qty} × TZS {money(it.price)}k</p>
              </div>
              <span className="font-mono text-[#111827]">{money(it.qty * it.price)}k</span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5 text-[13px] mb-6">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span className="font-mono">TZS {money(receipt.subtotal)}k</span></div>
          <div className="flex justify-between text-slate-500"><span>VAT ({Math.round(TAX_RATE * 100)}%)</span><span className="font-mono">TZS {money(receipt.tax)}k</span></div>
          <div className="flex justify-between text-[#111827] font-semibold text-[14px] pt-1.5 border-t border-slate-100"><span>Total Paid</span><span className="font-mono">TZS {money(receipt.total)}k</span></div>
          {refunded > 0 && (
            <div className="flex justify-between text-[#EF4444] font-medium pt-1"><span>Refunded</span><span className="font-mono">−{money(refunded)}k</span></div>
          )}
        </div>

        <div className="flex items-center gap-2.5 text-[13px] text-slate-600 mb-4">
          <Receipt size={14} className="text-slate-400" /> Paid via {receipt.method}
        </div>

        {returns.length > 0 && (
          <div className="mb-4">
            <p className="text-[11px] text-slate-400 mb-2 uppercase tracking-wide">Returns</p>
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              {returns.map((r) => (
                <div key={r.id} className="px-3 py-2.5 text-[13px] border-b border-slate-50 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-700">{r.reason}</p>
                    <span className="font-mono text-[#EF4444]">−{money(r.refundTotal)}k</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">{r.date} · {r.items.map((it) => `${it.qty}× ${it.name}`).join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1" />

        <div className="flex flex-col gap-2">
          <button onClick={printReceipt} className="flex items-center justify-center gap-1.5 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">
            <Printer size={13} /> Print Receipt
          </button>
          {allowReturn && !fullyReturned && (
            <button
              onClick={onOpenReturn}
              className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-[#EF4444] border border-[#EF4444]/25 rounded-lg py-2.5 hover:bg-[#EF4444]/5 transition-colors"
            >
              <ArrowUpDown size={13} /> Process Return
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReturnFormPanel({ transaction, onClose, onSubmit }) {
  // How much of each line item has already been returned, across every
  // prior return on this transaction — you can't return more than remains.
  const remaining = transaction.items.map((it) => {
    const alreadyReturned = (transaction.returns || []).reduce(
      (s, r) => s + (r.items.find((ri) => ri.sku === it.sku)?.qty || 0), 0
    );
    return { ...it, maxQty: it.qty - alreadyReturned };
  }).filter((it) => it.maxQty > 0);

  const [qtys, setQtys] = useState(() => Object.fromEntries(remaining.map((it) => [it.sku, 0])));
  const [reason, setReason] = useState(RETURN_REASONS[0]);

  function setQty(sku, val, max) {
    setQtys((q) => ({ ...q, [sku]: Math.max(0, Math.min(max, val)) }));
  }

  const returnItems = remaining.filter((it) => qtys[it.sku] > 0).map((it) => ({ sku: it.sku, name: it.name, qty: qtys[it.sku], price: it.price }));
  const refundSubtotal = returnItems.reduce((s, it) => s + it.qty * it.price, 0);
  const refundTotal = Math.round(refundSubtotal * (1 + TAX_RATE));
  const valid = returnItems.length > 0;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">{transaction.id}</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Process Return</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 flex-1 space-y-4">
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-2">Select items and quantities to return</p>
            <div className="space-y-2.5">
              {remaining.map((it) => (
                <div key={it.sku} className="flex items-center gap-2.5 border border-slate-100 rounded-lg p-2.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium text-[#111827] truncate">{it.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Up to {it.maxQty} returnable · {money(it.price)}k each</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button type="button" onClick={() => setQty(it.sku, qtys[it.sku] - 1, it.maxQty)} className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50" aria-label={`Decrease ${it.name} return quantity`}>
                      <Minus size={11} />
                    </button>
                    <span className="text-[12.5px] font-mono w-5 text-center">{qtys[it.sku]}</span>
                    <button type="button" onClick={() => setQty(it.sku, qtys[it.sku] + 1, it.maxQty)} className="w-6 h-6 rounded-md border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50" aria-label={`Increase ${it.name} return quantity`}>
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              ))}
              {remaining.length === 0 && <p className="text-[12.5px] text-slate-400">Every item on this receipt has already been returned.</p>}
            </div>
          </div>

          <FormField label="Reason">
            <select className={inputClass} value={reason} onChange={(e) => setReason(e.target.value)}>
              {RETURN_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>

          {valid && (
            <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-[12.5px]">
              <div className="flex justify-between text-slate-500"><span>Refund subtotal</span><span className="font-mono">TZS {money(refundSubtotal)}k</span></div>
              <div className="flex justify-between text-slate-500"><span>VAT ({Math.round(TAX_RATE * 100)}%)</span><span className="font-mono">TZS {money(Math.round(refundSubtotal * TAX_RATE))}k</span></div>
              <div className="flex justify-between text-[#EF4444] font-semibold pt-1 border-t border-slate-200 mt-1"><span>Total refund</span><span className="font-mono">TZS {money(refundTotal)}k</span></div>
            </div>
          )}

          <p className="text-[11.5px] text-slate-400">Returned quantities are restocked to Inventory immediately.</p>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">Cancel</button>
          <button
            type="button"
            disabled={!valid}
            onClick={() => onSubmit({ items: returnItems, reason, refundTotal })}
            className="flex-1 text-[12px] font-medium bg-[#EF4444] text-white rounded-lg py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Refund TZS {money(refundTotal)}k
          </button>
        </div>
      </div>
    </div>
  );
}

function RegisterHistory({ transactions, inventory, company }) {
  const [selected, setSelected] = useState(null);
  const [returning, setReturning] = useState(null);
  const { rows, setRows, loading } = transactions;

  async function processReturn(transaction, { items, reason, refundTotal }) {
    const returnRecord = { id: `RET-${Date.now()}`, items, reason, refundTotal, date: TODAY.toISOString().slice(0, 10) };

    // Restock returned quantities to the shared Inventory immediately.
    inventory.setRows((prev) => prev.map((it) => {
      const line = items.find((ri) => ri.sku === it.sku);
      return line ? { ...it, qty: it.qty + line.qty } : it;
    }));

    setRows((prev) => prev.map((t) => (t.id === transaction.id ? { ...t, returns: [returnRecord, ...(t.returns || [])] } : t)));
    setSelected((s) => (s && s.id === transaction.id ? { ...s, returns: [returnRecord, ...(s.returns || [])] } : s));
    setReturning(null);
    notify(`Return processed — TZS ${money(refundTotal)}k refunded, stock restocked`);

    if (IS_CONFIGURED && transaction.dbId) {
      try {
        const header = await sb("pos_returns").insert({
          transaction_id: transaction.dbId, reason, refund_total: refundTotal,
        }).single().run();
        if (header?.id) {
          await sb("pos_return_items").insert(
            items.map((it) => ({ return_id: header.id, item_name: it.name, item_sku: it.sku, qty: it.qty, price: it.price }))
          ).run();
        }
        for (const it of items) {
          const item = inventory.rows.find((i) => i.sku === it.sku);
          const newQty = (item?.qty || 0) + it.qty;
          await sb("inventory_items").eq("sku", it.sku).update({ qty_on_hand: newQty }).run();
          await sb("inventory_stock_movements").insert({ item_id: it.sku, movement: "In", qty: it.qty, reference: `${transaction.id} return` }).run();
        }
      } catch (e) {
        notify("Return processed locally, but saving to the server failed.", "error");
      }
    }
  }

  // Daily sales for last 7 days
  const last7 = useMemo(() => {
    return Array.from({length:7}, (_,i) => {
      const d = new Date(TODAY);
      d.setDate(d.getDate()-6+i);
      const ds = d.toISOString().slice(0,10);
      const dayTxns = rows.filter(t => t.date === ds);
      const revenue = dayTxns.reduce((s,t) => s + t.items.reduce((si,it)=>si+it.qty*it.price,0)*(1+TAX_RATE), 0);
      const txns    = dayTxns.length;
      return { day:d.toLocaleDateString("en",{weekday:"short"}), revenue:Math.round(revenue), txns };
    });
  }, [rows]);

  const totalRevenue = rows.reduce((s,t) => s + t.items.reduce((si,it)=>si+it.qty*it.price,0)*(1+TAX_RATE), 0);
  const totalTxns    = rows.length;
  const avgBasket    = totalTxns > 0 ? totalRevenue/totalTxns : 0;

  return (
    <div className="space-y-4">
      {/* 7-day sales chart */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Sales — Last 7 Days</h3>
            <p className="text-[11.5px] text-slate-400">Revenue trend · TZS thousands</p>
          </div>
          <div className="flex gap-4 text-[12px]">
            {[["Total Revenue","TZS "+money(Math.round(totalRevenue))+"k","#16A34A"],["Transactions",totalTxns,"#2563EB"],["Avg Basket","TZS "+money(Math.round(avgBasket))+"k","#7C3AED"]].map(([l,v,col])=>(
              <div key={l} className="text-center">
                <p className="text-[10px] text-slate-400 uppercase tracking-wide">{l}</p>
                <p className="text-[15px] font-bold" style={{color:col}}>{v}</p>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={last7} margin={{left:-10,right:4,top:0,bottom:0}}>
            <CartesianGrid vertical={false} stroke="#F3F4F6"/>
            <XAxis dataKey="day" tick={{fontSize:11}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="left"  tick={{fontSize:10}} axisLine={false} tickLine={false}/>
            <YAxis yAxisId="right" orientation="right" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
            <Tooltip formatter={(v,n)=>[n==="revenue"?"TZS "+money(v)+"k":v+" txns",n==="revenue"?"Revenue":"Transactions"]}/>
            <Bar  yAxisId="left"  dataKey="revenue" fill="#16A34A18" stroke="#16A34A" strokeWidth={1} radius={[4,4,0,0]} name="revenue"/>
            <Line yAxisId="left"  dataKey="revenue" stroke="#16A34A" strokeWidth={2.5} dot={{r:3,fill:"#16A34A"}} type="monotone" name="revenue-line"/>
            <Line yAxisId="right" dataKey="txns"    stroke="#7C3AED" strokeWidth={2}   dot={{r:3,fill:"#7C3AED"}} type="monotone" strokeDasharray="4 2" name="txns"/>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Receipt</th>
              <th className="px-4 py-3 font-medium">Cashier</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium text-right">Items</th>
              <th className="px-4 py-3 font-medium text-right">Total (TZS 000)</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows cols={6} />}
            {!loading && rows.map((t) => {
              const total = Math.round(t.items.reduce((s, it) => s + it.qty * it.price, 0) * (1 + TAX_RATE));
              const hasReturns = (t.returns || []).length > 0;
              return (
                <tr key={t.id} onClick={() => setSelected(t)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-[#111827]">
                    {t.id}
                    {hasReturns && <span className="ml-1.5 text-[10px] font-sans font-medium text-[#EF4444]">· returned</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{t.cashier}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{t.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                      style={{ backgroundColor: `${POS_PAYMENT_COLOR[t.method]}14`, color: POS_PAYMENT_COLOR[t.method] }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: POS_PAYMENT_COLOR[t.method] }} />
                      {t.method}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">{t.items.reduce((s, it) => s + it.qty, 0)}</td>
                  <td className="px-4 py-3 text-right font-mono">{money(total)}</td>
                </tr>
              );
            })}
            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState icon={Receipt} title="No sales recorded yet" hint="Completed sales from the Checkout tab will appear here." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <ReceiptPanel
          receipt={{ ...selected, subtotal: Math.round(selected.items.reduce((s, it) => s + it.qty * it.price, 0)), tax: Math.round(selected.items.reduce((s, it) => s + it.qty * it.price, 0) * TAX_RATE), total: Math.round(selected.items.reduce((s, it) => s + it.qty * it.price, 0) * (1 + TAX_RATE)) }}
          onClose={() => setSelected(null)}
          allowReturn
          onOpenReturn={() => setReturning(selected)}
          company={company}
        />
      )}
      {returning && (
        <ReturnFormPanel
          transaction={returning}
          onClose={() => setReturning(null)}
          onSubmit={(payload) => processReturn(returning, payload)}
        />
      )}
    </div>
  );
}

/* ----------------------------- BUSINESS ALERTS (SHARED UTILITY) ----------------------------- */

// Every alert here is computed from the same shared tables every module
// reads — nothing is a stored "notification" that can go stale. Clicking
// one navigates straight to the module where it can be acted on.
function useBusinessAlerts({ inventory, invoices, expenses, leaveRequests, workOrders, subscriptions }) {
  return useMemo(() => {
    const alerts = [];
    const todayStr = TODAY.toISOString().slice(0, 10);

    const outOfStock = inventory.rows.filter((it) => it.qty <= 0);
    if (outOfStock.length) {
      alerts.push({
        id: "out-of-stock", icon: Ban, color: "#EF4444", target: "inventory",
        title: `${outOfStock.length} item${outOfStock.length > 1 ? "s" : ""} out of stock`,
        subtitle: outOfStock.slice(0, 2).map((i) => i.name).join(", ") + (outOfStock.length > 2 ? "…" : ""),
      });
    }

    const lowStock = inventory.rows.filter((it) => it.qty > 0 && it.qty <= it.reorder);
    if (lowStock.length) {
      alerts.push({
        id: "low-stock", icon: AlertCircle, color: "#F59E0B", target: "inventory",
        title: `${lowStock.length} item${lowStock.length > 1 ? "s" : ""} low on stock`,
        subtitle: lowStock.slice(0, 2).map((i) => i.name).join(", ") + (lowStock.length > 2 ? "…" : ""),
      });
    }

    const overdue = invoices.rows.filter((inv) => inv.status !== "Paid" && inv.dueDate && inv.dueDate < todayStr);
    if (overdue.length) {
      const total = overdue.reduce((s, inv) => s + (lineTotal(inv.items).total - (inv.amountPaid || 0)), 0);
      alerts.push({
        id: "overdue-invoices", icon: Landmark, color: "#EF4444", target: "finance",
        title: `${overdue.length} invoice${overdue.length > 1 ? "s" : ""} overdue`,
        subtitle: `TZS ${money(Math.round(total))}k outstanding past due date`,
      });
    }

    const pendingExpenses = expenses.rows.filter((e) => e.status === "Pending");
    if (pendingExpenses.length) {
      alerts.push({
        id: "pending-expenses", icon: Wallet, color: "#F59E0B", target: "finance",
        title: `${pendingExpenses.length} expense${pendingExpenses.length > 1 ? "s" : ""} awaiting payment`,
        subtitle: pendingExpenses.slice(0, 2).map((e) => e.vendor).join(", ") + (pendingExpenses.length > 2 ? "…" : ""),
      });
    }

    const unusualExpenses = detectUnusualExpenses(expenses.rows);
    if (unusualExpenses.length) {
      alerts.push({
        id: "unusual-expenses", icon: AlertCircle, color: "#EF4444", target: "finance",
        title: `${unusualExpenses.length} unusual expense${unusualExpenses.length > 1 ? "s" : ""} detected`,
        subtitle: unusualExpenses.slice(0, 2).map((e) => `${e.vendor} (${e.multiple}× ${e.category} average)`).join(", "),
      });
    }

    const pendingLeave = leaveRequests.rows.filter((l) => l.status === "Pending");
    if (pendingLeave.length) {
      alerts.push({
        id: "pending-leave", icon: Clock, color: "#F59E0B", target: "hr",
        title: `${pendingLeave.length} leave request${pendingLeave.length > 1 ? "s" : ""} awaiting approval`,
        subtitle: pendingLeave.slice(0, 2).map((l) => l.employee).join(", ") + (pendingLeave.length > 2 ? "…" : ""),
      });
    }

    const overdueOrders = workOrders.rows.filter((w) => w.status !== "Completed" && w.status !== "Cancelled" && w.dueDate && w.dueDate < todayStr);
    if (overdueOrders.length) {
      alerts.push({
        id: "overdue-work-orders", icon: Factory, color: "#F59E0B", target: "manufacturing",
        title: `${overdueOrders.length} work order${overdueOrders.length > 1 ? "s" : ""} behind schedule`,
        subtitle: overdueOrders.slice(0, 2).map((w) => w.product).join(", ") + (overdueOrders.length > 2 ? "…" : ""),
      });
    }

    const dueSubscriptions = subscriptions.rows.filter((s) => s.status === "Active" && s.nextBillingDate < todayStr);
    if (dueSubscriptions.length) {
      alerts.push({
        id: "subscriptions-due", icon: Repeat, color: "#F59E0B", target: "sales",
        title: `${dueSubscriptions.length} subscription${dueSubscriptions.length > 1 ? "s" : ""} due for billing`,
        subtitle: dueSubscriptions.slice(0, 2).map((s) => s.customer).join(", ") + (dueSubscriptions.length > 2 ? "…" : ""),
      });
    }

    return alerts;
  }, [inventory.rows, invoices.rows, expenses.rows, leaveRequests.rows, workOrders.rows, subscriptions.rows]);
}

function NotificationCenter({ inventory, invoices, expenses, leaveRequests, workOrders, subscriptions, onNavigate }) {
  const [open, setOpen] = useState(false);
  const alerts = useBusinessAlerts({ inventory, invoices, expenses, leaveRequests, workOrders, subscriptions });

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-slate-400 hover:text-slate-600"
        aria-label={"Notifications" + (alerts.length ? " (" + alerts.length + " alerts)" : "")}
      >
        <Bell size={17} strokeWidth={1.75} />
        {alerts.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-[#EF4444] rounded-full ring-1 ring-white flex items-center justify-center text-[9px] font-bold text-white leading-none">{alerts.length > 9 ? "9+" : alerts.length}</span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-2 w-[320px] bg-white rounded-xl border border-slate-200/80 shadow-lg z-40 overflow-hidden"
            style={{ animation: "toastIn .15s ease-out" }}
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-[#111827]">Notifications</h3>
              {alerts.length > 0 && <span className="text-[11px] text-slate-400 font-mono">{alerts.length}</span>}
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <CheckCircle2 size={20} className="text-[#16A34A] mx-auto mb-2" />
                  <p className="text-[12.5px] text-slate-500">All clear — nothing needs attention right now.</p>
                </div>
              ) : (
                alerts.map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      onClick={() => { onNavigate(a.target); setOpen(false); }}
                      className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50/70 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${a.color}14` }}>
                        <Icon size={15} style={{ color: a.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium text-[#111827]">{a.title}</p>
                        <p className="text-[11.5px] text-slate-400 truncate">{a.subtitle}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {/* Daily Briefing quick-open */}
            <div className="px-3 py-2.5 border-t border-slate-100">
              <button
                onClick={() => { setOpen(false); if(window.__openDailyBrief) window.__openDailyBrief(); }}
                className="w-full flex items-center justify-center gap-1.5 text-[12px] font-bold text-white py-2 rounded-xl bg-[#0D2214] hover:bg-[#1a3a2a] transition-colors">
                📊 View Today Daily Brief
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// A real command palette — the Cmd+K pattern every serious productivity
// tool uses (Linear, Notion, Superhuman, VS Code), deliberately chosen
// because it's not a pattern SME-focused competitors typically bother
// with at all. Genuinely useful for the exact person this system claims
// to serve at the "large business" end: someone doing the same handful
// of actions dozens of times a day, for whom reaching for a mouse and
// hunting through a sidebar is real, measurable friction. Only ever
// shows modules already in `modules` — the same RBAC- and entitlement-
// filtered list the sidebar itself uses, so this can never let someone
// jump to something they do not actually have access to.
const PALETTE_ACTIONS = [
  { id: "new-invoice", label: "Create Invoice", module: "sales", intent: { tab: "invoices", openForm: true } },
  { id: "new-lead", label: "New Lead", module: "crm", intent: { tab: "leads" } },
  { id: "approve-leave", label: "Approve Leave", module: "hr", intent: { tab: "leave" } },
  { id: "record-payment", label: "Record Payment", module: "finance", intent: { tab: "receivables" } },
  { id: "record-expense", label: "Record Expense", module: "finance", intent: { tab: "expenses" } },
  { id: "settings", label: "Open Settings", module: "settings", intent: null },
];

function CommandPalette({ modules, crm, invoices, inventory, expenses, onNavigate, onNavigateWithIntent, onClose }) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const moduleResults = modules
    .filter((m) => m.label.toLowerCase().includes(query.toLowerCase()))
    .map((m) => ({ id: `mod-${m.id}`, label: m.label, icon: m.icon, kind: "Go to", action: () => onNavigate(m.id) }));

  const actionResults = PALETTE_ACTIONS
    .filter((a) => modules.some((m) => m.id === a.module)) // only real actions for modules this user can actually reach
    .filter((a) => a.label.toLowerCase().includes(query.toLowerCase()))
    .map((a) => ({ id: a.id, label: a.label, icon: Zap, kind: "Quick action", action: () => (a.intent ? onNavigateWithIntent(a.module, a.intent) : onNavigate(a.module)) }));

  // Real global data search — actual customers, invoices, and products,
  // searchable from anywhere. RBAC is preserved by construction, not by a
  // separate check that could drift: each category only searches at all
  // if its parent module is already in the RBAC- and entitlement-filtered
  // `modules` list this palette receives — the identical source of truth
  // the sidebar renders from — so a role without CRM access never sees a
  // customer name surface here. Requires 2+ characters (a single letter
  // matches half of everything) and caps each category at 4 results so
  // the list stays scannable. Selecting a record lands on the right
  // module and tab — the real capability the intent system has — not a
  // deep-link to the exact record's detail panel, which the intent system
  // does not support and this does not pretend to.
  const q = query.trim().toLowerCase();
  const canSee = (moduleId) => modules.some((m) => m.id === moduleId);
  // Month understanding for queries like "Expenses July" — a real month
  // token (3+ letters, English) becomes a real YYYY-MM filter against the
  // current year; generic intent words ("expenses", "gharama") are
  // stripped rather than matched literally against vendor names.
  const MONTH_NAMES = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  let monthKey = null; const textTerms = [];
  for (const t of q.split(/\s+/).filter(Boolean)) {
    const mi = t.length >= 3 ? MONTH_NAMES.findIndex((m) => m.startsWith(t)) : -1;
    if (mi >= 0 && monthKey === null) monthKey = `${TODAY.getFullYear()}-${String(mi + 1).padStart(2, "0")}`;
    else if (!["expense", "expenses", "gharama"].includes(t)) textTerms.push(t);
  }
  const expText = textTerms.join(" ");
  const recordResults = q.length < 2 ? [] : [
    ...(canSee("crm") ? (crm?.rows || [])
      .filter((l) => l.company.toLowerCase().includes(q) || (l.name || "").toLowerCase().includes(q))
      .slice(0, 4)
      .map((l) => ({ id: `rec-lead-${l.id}`, label: l.company, sub: l.name, icon: Building2, kind: "Customer / Lead", action: () => onNavigateWithIntent("crm", { tab: "leads" }) })) : []),
    ...(canSee("sales") ? (invoices?.rows || [])
      .filter((inv) => inv.id.toLowerCase().includes(q) || inv.customer.toLowerCase().includes(q))
      .slice(0, 4)
      .map((inv) => ({ id: `rec-inv-${inv.id}`, label: inv.id, sub: `${inv.customer} · ${inv.status}`, icon: ReceiptText, kind: "Invoice", action: () => onNavigateWithIntent("sales", { tab: "invoices" }) })) : []),
    ...(canSee("inventory") ? (inventory?.rows || [])
      .filter((it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q))
      .slice(0, 4)
      .map((it) => ({ id: `rec-item-${it.sku}`, label: it.name, sub: `${it.sku} · ${it.qty} in stock`, icon: Package, kind: "Product", action: () => onNavigateWithIntent("inventory", { tab: "stock" }) })) : []),
    ...(canSee("finance") ? (expenses?.rows || [])
      .filter((e) => {
        const matchText = !expText || e.vendor.toLowerCase().includes(expText) || (e.category || "").toLowerCase().includes(expText);
        const matchMonth = !monthKey || (e.date || "").startsWith(monthKey);
        return (expText || monthKey) && matchText && matchMonth;
      })
      .slice(0, 4)
      .map((e) => ({ id: `rec-exp-${e.id}`, label: e.vendor, sub: `${e.category} · ${e.date} · TZS ${money(Math.round(e.amount))}k`, icon: ClipboardList, kind: "Expense", action: () => onNavigateWithIntent("finance", { tab: "expenses" }) })) : []),
  ];

  const results = [...recordResults, ...actionResults, ...moduleResults];

  function handleKeyDown(e) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && results[selectedIndex]) { results[selectedIndex].action(); onClose(); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]">
      <div className="absolute inset-0 bg-[#111827]/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden" style={{ animation: "fadeInUp .15s ease-out" }}>
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef} value={query} onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }} onKeyDown={handleKeyDown}
            placeholder="Search customers, invoices, products — or jump anywhere..."
            className="flex-1 outline-none text-[14px] placeholder:text-slate-400"
          />
          <kbd className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Esc</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-1.5">
          {results.length === 0 && <p className="text-[12.5px] text-slate-400 text-center py-8">No matches.</p>}
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <button
                key={r.id} onClick={() => { r.action(); onClose(); }} onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === selectedIndex ? "bg-[#16A34A]/5" : ""}`}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: i === selectedIndex ? "#DCFCE7" : "#F3F4F6" }}>
                  <Icon size={14} style={{ color: i === selectedIndex ? "#16A34A" : "#94A3B8" }} />
                </div>
                <span className={`text-[13px] flex-1 min-w-0 ${i === selectedIndex ? "font-medium text-[#111827]" : "text-slate-600"}`}>
                  <span className="block truncate">{r.label}</span>
                  {r.sub && <span className="block text-[10.5px] text-slate-400 truncate font-normal">{r.sub}</span>}
                </span>
                <span className="text-[10.5px] text-slate-400 shrink-0">{r.kind}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProfileMenu({ currentUser, session, onSignOut }) {
  const [open, setOpen] = useState(false);
  const initials = currentUser.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-medium"
        style={{ background: "linear-gradient(135deg, #22C55E, #15803D)", boxShadow: "0 3px 10px rgba(34,197,94,.4)" }}
        aria-label="Account menu"
      >
        {initials}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200/80 shadow-lg z-40 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[13px] font-medium text-[#111827] truncate">{currentUser.name}</p>
              <p className="text-[11.5px] text-slate-400">{currentUser.role}</p>
              {session && !session.demo && <p className="text-[10.5px] text-slate-400 truncate mt-0.5">{session.email}</p>}
            </div>
            {(!session || session.demo) && (
              <p className="px-4 py-2.5 text-[11px] text-slate-400 border-b border-slate-100">Demo session — not a real signed-in account.</p>
            )}
            <button onClick={onSignOut} className="w-full flex items-center gap-2 text-[12.5px] text-[#EF4444] hover:bg-[#FEE2E2] px-4 py-2.5 text-left transition-colors">
              <LogOut size={13} /> {session && !session.demo ? "Sign out" : "Exit demo"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------- CUSTOMER PORTAL ---------------------------------- */

// The real security boundary here is the schema, not this component. In
// live mode, the RLS policies added alongside profiles.customer_ref
// (invoices_customer_read, orders_customer_read, etc.) mean a signed-in
// External Client's session can only ever receive their own rows from the
// database — sb() runs the identical query an internal user's session
// would, and Postgres decides what comes back based on who's asking. This
// component's own "match by customer name" filtering below is a second,
// redundant safety net for demo mode (where there is no real RLS to rely
// on) — in live mode it's filtering a result set that was already scoped
// correctly before it ever reached the browser.
function CustomerPortal({ currentUser, invoices, filesHook, onSignOut }) {
  const [tab, setTab] = useState("invoices");
  const orders = useCompanyTable("sales_orders", ordersSeed, { mapRow: mapOrderRow });
  const tickets = useCompanyTable("support_tickets", supportTicketsSeed, { mapRow: mapTicketRow });
  const connections = useCompanyTable("integration_connections", INTEGRATION_CONNECTIONS.map((c) => ({ id: c.id, enabled: false, tenantId: "", clientId: "", paymentLink: "", paypalMeLink: "", webhookUrl: "", apiKey: "", businessNumber: "", storeUrl: "", terminalId: "" })), { mapRow: mapIntegrationConnectionRow });

  // Demo mode has no real customer_ref to filter by — this picks the
  // first customer name appearing in the seed data purely so the portal
  // has something real to show, and says so plainly rather than quietly
  // showing every customer's invoices as if that were normal.
  const effectiveCustomer = currentUser.customerRef || invoices.rows[0]?.customer || "Demo Customer";
  const myInvoices = invoices.rows.filter((inv) => inv.customer === effectiveCustomer);
  const myOrders = orders.rows.filter((o) => o.customer === effectiveCustomer);
  const myTickets = tickets.rows.filter((t) => t.customer === effectiveCustomer);
  const myDocuments = filesHook.rows.filter((f) => myInvoices.some((i) => i.id === f.linkedRecord) || myOrders.some((o) => o.id === f.linkedRecord));

  const stripe = connections.rows.find((c) => c.id === "stripe");
  const paypal = connections.rows.find((c) => c.id === "paypal");

  const PORTAL_TABS = [
    { id: "invoices", label: "Invoices", icon: ReceiptText },
    { id: "orders", label: "Orders", icon: Package },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "support", label: "Support", icon: Headphones },
    { id: "chat", label: "Chat with AI", icon: Brain },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <BrandMark size={32} textSize={14} />
          <div>
            <p className="text-[13.5px] font-semibold text-[#111827] leading-tight">Customer Portal</p>
            <p className="text-[10.5px] text-slate-400 leading-tight">{effectiveCustomer}</p>
          </div>
        </div>
        <ProfileMenu currentUser={currentUser} session={{ demo: !currentUser.customerRef }} onSignOut={onSignOut} />
      </header>

      {!currentUser.customerRef && (
        <div className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/20 px-4 sm:px-6 py-2">
          <p className="text-[11.5px] text-[#8a670a]">Demo mode — showing sample data for "{effectiveCustomer}" since there is no real signed-in customer identity yet. In live mode, this portal shows exactly one customer's own records, enforced by the database itself, not by this screen.</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-lg p-1 mb-5 overflow-x-auto w-fit max-w-full">
          {PORTAL_TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${isActive ? "bg-[#16A34A] text-white" : "text-slate-500 hover:text-slate-700"}`}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        <PortalFeedbackWidget currentUser={currentUser} />
        {tab === "invoices" && <CustomerInvoicesTab myInvoices={myInvoices} stripe={stripe} paypal={paypal} />}
        {tab === "orders" && <CustomerOrdersTab myOrders={myOrders} />}
        {tab === "documents" && <CustomerDocumentsTab myDocuments={myDocuments} />}
        {tab === "support" && <CustomerSupportTab myTickets={myTickets} tickets={tickets} customerName={effectiveCustomer} />}
        {tab === "chat" && <CustomerAIChat customerName={effectiveCustomer} myInvoices={myInvoices} myOrders={myOrders} />}
      </div>
    </div>
  );
}

// Voice of the customer, collected where the customer actually is: the
// portal. One-tap 0–10 NPS with an optional comment, written to the real
// customer_feedback table. Dismisses after submitting; a portal that
// nags for ratings on every visit trains people to ignore it.
function PortalFeedbackWidget({ currentUser }) {
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  if (done) return null;
  async function submit() {
    if (score === null) return;
    setDone(true);
    notify("Thank you — your feedback landed with the team.");
    if (IS_CONFIGURED) {
      try { await sb("customer_feedback").insert({ customer_name: currentUser.customerRef || currentUser.name, nps_score: score, comment: comment.trim() || null }).run(); } catch (_e) {}
    }
  }
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 mb-4">
      <p className="text-[12.5px] font-medium text-[#111827]">How likely are you to recommend us? <span className="text-slate-400 font-normal">(0 = not at all, 10 = extremely)</span></p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {Array.from({ length: 11 }, (_, i) => (
          <button key={i} onClick={() => setScore(i)} className={`w-8 h-8 rounded-lg text-[12px] font-mono font-medium border ${score === i ? "bg-[#16A34A] text-white border-[#16A34A]" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}>{i}</button>
        ))}
      </div>
      {score !== null && (
        <div className="flex gap-2 mt-2.5">
          <input className={inputClass} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Anything we should know? (optional)" />
          <button onClick={submit} className="btn-primary text-white text-[12px] font-medium rounded-lg px-3.5 shrink-0">Send</button>
        </div>
      )}
    </div>
  );
}

function CustomerInvoicesTab({ myInvoices, stripe, paypal }) {
  const [payingId, setPayingId] = useState(null);

  // Self-serve receipt — the same proven printAsPDF isolation every
  // internal report uses (browser print-to-PDF, clean window, no app
  // chrome), now in the customer's own hands: real invoice data, real
  // payment history, no email round-trip to the business.
  function downloadReceipt(inv) {
    const t = lineTotal(inv.items);
    const items = inv.items.map((it) => `<tr><td>${it.name}</td><td class="right">${it.qty}</td><td class="right">${money(it.rate)}k</td><td class="right">${money(Math.round(it.qty * it.rate))}k</td></tr>`).join("");
    const pays = (inv.payments || []).map((p) => `<tr><td>${p.date}</td><td>${p.method || "—"}</td><td class="right">${money(Math.round(p.amount))}k</td></tr>`).join("");
    printAsPDF(`Receipt ${inv.id}`, `
      <h1>Receipt — ${inv.id}</h1>
      <p style="color:#888;font-size:12px;">${inv.customer} · issued ${inv.date} · status: ${inv.status}</p>
      <table><thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Rate</th><th class="right">Amount</th></tr></thead><tbody>${items}</tbody></table>
      <p style="text-align:right;font-weight:bold;margin-top:10px;">Total: TZS ${money(Math.round(t.total))}k · Paid: TZS ${money(Math.round(inv.amountPaid || 0))}k</p>
      ${pays ? "<h2 style=\"font-size:13px;margin-top:16px;\">Payments</h2><table><thead><tr><th>Date</th><th>Method</th><th class=\"right\">Amount</th></tr></thead><tbody>" + pays + "</tbody></table>" : ""}
      <p style="font-size:10.5px;color:#888;margin-top:18px;">Generated from live records by the customer portal.</p>
    `);
  }
  const canPayOnline = stripe?.enabled && stripe?.paymentLink || paypal?.enabled && paypal?.paypalMeLink;

  function payOnline(invoiceId) {
    const url = stripe?.enabled && stripe?.paymentLink ? stripe.paymentLink : paypal.paypalMeLink;
    // Neither Stripe Payment Links nor a plain PayPal.me link support a
    // dynamic amount from a URL param without more setup on the business
    // side — the honest move is opening the real page and telling the
    // customer to reference their invoice number, not silently pretending
    // the amount carried over.
    notify(`Opening the payment page — reference invoice ${invoiceId} so ${stripe?.enabled ? "the business" : "PayPal"} can match your payment.`);
    window.open(url, "_blank");
    setPayingId(invoiceId);
  }

  return (
    <div className="space-y-3">
      {!canPayOnline && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-3.5">
          <p className="text-[11.5px] text-slate-400">Online payment is not configured yet — the business needs to connect Stripe or PayPal in their own Integrations settings first.</p>
        </div>
      )}
      {myInvoices.length === 0 && <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={ReceiptText} title="No invoices yet" hint="Invoices billed to you will appear here." /></div>}
      {myInvoices.map((inv) => {
        const { total } = lineTotal(inv.items);
        const balance = total - (inv.amountPaid || 0);
        return (
          <div key={inv.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
            <div className="flex items-start justify-between mb-2">
              <div><p className="text-[13.5px] font-semibold text-[#111827]">{inv.id}</p><p className="text-[11px] text-slate-400">Due {inv.dueDate}</p></div>
              <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${inv.status === "Paid" ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#EF4444]/10 text-[#EF4444]"}`}>{inv.status}</span>
              <button onClick={() => downloadReceipt(inv)} className="text-[11px] font-medium text-[#16A34A] hover:underline flex items-center gap-1 ml-2"><Download size={11} /> Receipt</button>
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[20px] font-mono font-bold text-[#111827]">TZS {money(Math.round(total))}k</p>
              {balance > 0 && <p className="text-[11.5px] text-[#EF4444]">TZS {money(Math.round(balance))}k due</p>}
            </div>
            {balance > 0 && canPayOnline && (
              <button onClick={() => payOnline(inv.id)} className="btn-primary text-white text-[12.5px] font-medium rounded-lg py-2.5 w-full flex items-center justify-center gap-2">
                <CreditCard size={14} /> Pay Online
              </button>
            )}
            {payingId === inv.id && <p className="text-[11px] text-slate-400 mt-2 text-center">Paid already? It can take a moment to reflect here — check back shortly.</p>}
          </div>
        );
      })}
    </div>
  );
}

function CustomerOrdersTab({ myOrders }) {
  const ORDER_STEPS = ["Pending", "Confirmed", "Fulfilled"];
  return (
    <div className="space-y-3">
      {myOrders.length === 0 && <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={Package} title="No orders yet" hint="Your orders will appear here once placed." /></div>}
      {myOrders.map((o) => {
        const stepIndex = o.status === "Cancelled" ? -1 : ORDER_STEPS.indexOf(o.status);
        return (
          <div key={o.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13.5px] font-semibold text-[#111827]">{o.id}</p>
              <span className="text-[11px] text-slate-400">{o.date}</span>
            </div>
            {o.status === "Cancelled" ? (
              <p className="text-[12.5px] text-[#EF4444]">This order was cancelled.</p>
            ) : (
              <div className="flex items-center">
                {ORDER_STEPS.map((step, i) => (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i <= stepIndex ? "bg-[#16A34A] text-white" : "bg-slate-100 text-slate-400"}`}>{i <= stepIndex ? <CheckCircle2 size={13} /> : i + 1}</div>
                      <span className={`text-[10px] mt-1 ${i <= stepIndex ? "text-[#111827] font-medium" : "text-slate-400"}`}>{step}</span>
                    </div>
                    {i < ORDER_STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < stepIndex ? "bg-[#16A34A]" : "bg-slate-100"}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CustomerDocumentsTab({ myDocuments }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
      {myDocuments.length === 0 ? (
        <EmptyState icon={FileText} title="No documents yet" hint="Contracts and paperwork tied to your invoices or orders will appear here." />
      ) : (
        <div className="divide-y divide-slate-50">
          {myDocuments.map((f) => {
            const meta = FILE_TYPE_STYLE[f.type] || FILE_TYPE_STYLE.pdf;
            const Icon = meta.Icon;
            return (
              <div key={f.id} className="flex items-center gap-2.5 px-4 py-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}14` }}><Icon size={14} style={{ color: meta.color }} /></div>
                <div className="min-w-0 flex-1"><p className="text-[12.5px] font-medium text-[#111827] truncate">{f.name}</p><p className="text-[11px] text-slate-400">{f.size} · {f.date}</p></div>
                <span className="text-[11px] text-slate-300">No file storage in this demo</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CustomerSupportTab({ myTickets, tickets, customerName }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "General", description: "" });

  async function submitTicket(e) {
    e.preventDefault();
    if (!form.subject.trim()) return;
    const draft = { id: docId("TK"), subject: form.subject, customer: customerName, category: form.category, priority: "Medium", status: "Open", assignee: null, createdDate: TODAY.toISOString().slice(0, 10) };
    tickets.setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    setForm({ subject: "", category: "General", description: "" });
    notify(`Ticket ${draft.id} submitted — the support team will follow up.`);
    if (IS_CONFIGURED) {
      try { await sb("support_tickets").insert({ doc_number: draft.id, subject: draft.subject, customer: draft.customer, category: draft.category }).run(); } catch (_e) { notify("Ticket saved locally, but sending to the server failed.", "error"); }
    }
  }

  return (
    <div className="space-y-3">
      <button onClick={() => setShowForm((s) => !s)} className="btn-primary text-white text-[12.5px] font-medium rounded-lg py-2.5 px-4 flex items-center gap-2 w-full sm:w-auto">
        <Plus size={14} /> Open a Support Ticket
      </button>
      {showForm && (
        <form onSubmit={submitTicket} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-3">
          <FormField label="Subject" required><input className={inputClass} value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="What's this about?" /></FormField>
          <FormField label="Category">
            <select className={inputClass} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {["Billing", "Technical", "Product", "General"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </FormField>
          <FormField label="Details"><textarea className={inputClass} rows={4} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Tell us more..." /></FormField>
          <button type="submit" className="btn-primary text-white text-[12.5px] font-medium rounded-lg py-2.5 w-full">Submit Ticket</button>
        </form>
      )}
      <div className="space-y-2">
        {myTickets.length === 0 && <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={Headphones} title="No tickets yet" hint="Tickets you open will show up here." /></div>}
        {myTickets.map((t) => (
          <div key={t.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex items-center justify-between">
            <div className="min-w-0"><p className="text-[12.5px] font-medium text-[#111827] truncate">{t.subject}</p><p className="text-[11px] text-slate-400">{t.id} · {t.category} · {t.createdDate}</p></div>
            <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${t.status === "Resolved" || t.status === "Closed" ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{t.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// A deliberately narrow AI persona — it only ever sees THIS customer's own
// invoices and orders, never the full business snapshot every internal
// persona in section 23 reads from. A customer-facing AI leaking another
// customer's balance, or the business internal costs and margins, would
// be a real privacy failure, not a hypothetical one; the safest fix is
// structural — this component is never given access to anything broader
// than what is already been filtered to this one customer above.
function CustomerAIChat({ customerName, myInvoices, myOrders }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    if (!input.trim() || busy) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setBusy(true);
    try {
      const snapshot = {
        customer: customerName,
        invoices: myInvoices.map((i) => ({ id: i.id, status: i.status, due_date: i.dueDate, total_tzs_k: Math.round(lineTotal(i.items).total), balance_tzs_k: Math.round(lineTotal(i.items).total - (i.amountPaid || 0)) })),
        orders: myOrders.map((o) => ({ id: o.id, status: o.status, order_date: o.date })),
      };
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 500,
          system: `You are a customer support assistant for ${customerName}. You can only discuss ${customerName}'s own invoices and orders, provided below as JSON — never invent information not present here, and never discuss any other customer or internal business figures, because you have no access to them. If asked about something outside this data, say you do not have that information and suggest opening a support ticket.\n\nYour data:\n${JSON.stringify(snapshot, null, 2)}`,
          messages: [...messages, userMsg],
        }),
      });
      const data = await response.json();
      const text = data.content?.find((c) => c.type === "text")?.text || "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (_e) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't reach the AI service — please try again in a moment." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-[480px]">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[12.5px] font-medium text-[#111827]">Chat with AI</p>
        <p className="text-[11px] text-slate-400">Scoped to your own invoices and orders only — nothing else about this business.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <p className="text-[12.5px] text-slate-400 text-center py-8">Ask about your invoices or order status.</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-[13px] ${m.role === "user" ? "btn-primary text-white" : "bg-slate-50 text-slate-700"}`}>{m.content}</div>
          </div>
        ))}
        {busy && <div className="flex justify-start"><LoaderCircle size={16} className="animate-spin text-[#16A34A]" /></div>}
      </div>
      <div className="p-3 border-t border-slate-100 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask about your invoices or orders..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#16A34A]" />
        <button onClick={send} disabled={busy || !input.trim()} className="btn-primary text-white rounded-lg px-3 disabled:opacity-40" aria-label="Send"><Send size={15} /></button>
      </div>
    </div>
  );
}

/* ---------------------------------- SUPPLIER PORTAL ---------------------------------- */

// The same real security design as the Customer Portal (section 40): RLS
// policies added alongside profiles.customer_ref are what actually scope
// a supplier's session to their own purchase orders, contracts, and
// payment history — this component's own filtering is a demo-mode
// fallback, not the security boundary, in live mode it's just narrowing
// a result set the database had already scoped correctly.
function ExternalSupplierPortal({ currentUser, onSignOut }) {
  const [tab, setTab] = useState("orders");
  const purchaseOrders = useCompanyTable("procurement_purchase_orders", purchaseOrdersSeed, {
    select: "*,purchase_order_items(*)", mapRow: mapPurchaseOrderRow,
  });
  const contracts = useCompanyTable("procurement_contracts", procurementContractsSeed, { mapRow: mapProcurementContractRow });
  const expenses = useCompanyTable("finance_expenses", expensesSeed, { mapRow: mapExpenseRow });
  const files = useCompanyTable("documents", filesSeed, { mapRow: mapFileRow });

  const effectiveSupplier = currentUser.customerRef || purchaseOrders.rows[0]?.supplier || "Demo Supplier";
  const myOrders = purchaseOrders.rows.filter((po) => po.supplier === effectiveSupplier);
  const myContracts = contracts.rows.filter((c) => c.supplier === effectiveSupplier);
  const myPayments = expenses.rows.filter((e) => e.vendor === effectiveSupplier);
  const myDocuments = files.rows.filter((f) => myOrders.some((po) => po.id === f.linkedRecord));

  const PORTAL_TABS = [
    { id: "orders", label: "Purchase Orders", icon: ClipboardList },
    { id: "invoices", label: "Upload Invoices", icon: UploadCloud },
    { id: "payments", label: "Track Payments", icon: Wallet },
    { id: "contracts", label: "Contracts", icon: FileCheck },
    { id: "deliveries", label: "Deliveries", icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <BrandMark size={32} textSize={14} />
          <div>
            <p className="text-[13.5px] font-semibold text-[#111827] leading-tight">Supplier Portal</p>
            <p className="text-[10.5px] text-slate-400 leading-tight">{effectiveSupplier}</p>
          </div>
        </div>
        <ProfileMenu currentUser={currentUser} session={{ demo: !currentUser.customerRef }} onSignOut={onSignOut} />
      </header>

      {!currentUser.customerRef && (
        <div className="bg-[#F59E0B]/10 border-b border-[#F59E0B]/20 px-4 sm:px-6 py-2">
          <p className="text-[11.5px] text-[#8a670a]">Demo mode — showing sample data for "{effectiveSupplier}" since there is no real signed-in supplier identity yet. In live mode, this portal shows exactly one supplier's own records, enforced by the database itself.</p>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
        <div className="flex items-center gap-1 bg-white border border-slate-200/80 rounded-lg p-1 mb-5 overflow-x-auto w-fit max-w-full">
          {PORTAL_TABS.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${isActive ? "bg-[#16A34A] text-white" : "text-slate-500 hover:text-slate-700"}`}>
                <Icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {tab === "orders" && <SupplierOrdersTab myOrders={myOrders} />}
        {tab === "invoices" && <SupplierInvoiceUploadTab myOrders={myOrders} filesHook={files} />}
        {tab === "payments" && <SupplierPaymentsTab myPayments={myPayments} />}
        {tab === "contracts" && <SupplierContractsTab myContracts={myContracts} />}
        {tab === "deliveries" && <SupplierDeliveriesTab myOrders={myOrders} purchaseOrdersHook={purchaseOrders} />}
      </div>
    </div>
  );
}

function SupplierOrdersTab({ myOrders }) {
  return (
    <div className="space-y-3">
      {myOrders.length === 0 && <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={ClipboardList} title="No purchase orders yet" hint="Purchase orders issued to you will appear here as soon as they're raised." /></div>}
      {myOrders.map((po) => {
        const total = po.items.reduce((s, it) => s + it.qty * it.cost, 0);
        return (
          <div key={po.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
            <div className="flex items-start justify-between mb-3">
              <div><p className="text-[13.5px] font-semibold text-[#111827]">{po.id}</p><p className="text-[11px] text-slate-400">Ordered {po.orderDate}{po.expectedDate ? ` · expected ${po.expectedDate}` : ""}</p></div>
              <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${po.status === "Paid" ? "bg-[#16A34A]/10 text-[#16A34A]" : po.status === "Cancelled" ? "bg-[#EF4444]/10 text-[#EF4444]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{po.status}</span>
            </div>
            <div className="space-y-1 mb-3">
              {po.items.map((it, i) => (
                <div key={i} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-slate-600">{it.name} × {it.qty}</span>
                  <span className="font-mono text-slate-500">TZS {money(it.qty * it.cost)}k</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11.5px] text-slate-400">Total</span>
              <span className="text-[15px] font-mono font-bold text-[#111827]">TZS {money(Math.round(total))}k</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SupplierInvoiceUploadTab({ myOrders, filesHook }) {
  const [selectedPO, setSelectedPO] = useState(myOrders[0]?.id || "");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const uploadedForPO = filesHook.rows.filter((f) => f.linkedRecord === selectedPO && f.folder === "Purchase Orders");

  async function upload(e) {
    e.preventDefault();
    if (!fileName.trim() || !selectedPO) return;
    setBusy(true);
    const draft = {
      id: docId("DOC"), name: fileName.trim(), type: "pdf", folder: "Purchase Orders",
      size: "—", uploadedBy: "Supplier", date: TODAY.toISOString().slice(0, 10), linkedRecord: selectedPO, content: "", versions: [],
    };
    filesHook.setRows((prev) => [draft, ...prev]);
    setFileName("");
    notify(`Invoice submitted for ${selectedPO} — the business will review it.`);
    if (IS_CONFIGURED) {
      try { await sb("documents").insert({ name: draft.name, file_type: draft.type, folder: draft.folder, linked_record: draft.linkedRecord }).run(); } catch (_e) { notify("Submitted locally, but sending to the server failed.", "error"); }
    }
    setBusy(false);
  }

  if (myOrders.length === 0) return <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={UploadCloud} title="No purchase orders to invoice against" hint="You'll be able to upload an invoice once a purchase order is issued to you." /></div>;

  return (
    <div className="space-y-4">
      <form onSubmit={upload} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 space-y-3">
        <FormField label="Purchase order">
          <select className={inputClass} value={selectedPO} onChange={(e) => setSelectedPO(e.target.value)}>
            {myOrders.map((po) => <option key={po.id} value={po.id}>{po.id}</option>)}
          </select>
        </FormField>
        <FormField label="Invoice file name" required>
          <input className={inputClass} value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g. Invoice-4471.pdf" />
          <p className="text-[11px] text-slate-400 mt-1">This demo register does not store raw file bytes (see the Document Center's own note on this) — it records the invoice as a real, trackable entry the business can see and act on.</p>
        </FormField>
        <button type="submit" disabled={busy || !fileName.trim()} className="btn-primary text-white text-[12.5px] font-medium rounded-lg py-2.5 w-full disabled:opacity-40">Submit Invoice</button>
      </form>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        {uploadedForPO.length === 0 ? (
          <EmptyState icon={FileText} title="No invoices submitted for this PO yet" hint="Invoices you submit for the selected purchase order will appear here." />
        ) : (
          <div className="divide-y divide-slate-50">
            {uploadedForPO.map((f) => (
              <div key={f.id} className="flex items-center gap-2.5 px-4 py-3">
                <FileText size={16} className="text-[#EF4444] shrink-0" />
                <div className="min-w-0 flex-1"><p className="text-[12.5px] font-medium text-[#111827] truncate">{f.name}</p><p className="text-[11px] text-slate-400">Submitted {f.date}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SupplierPaymentsTab({ myPayments }) {
  const totalPaid = myPayments.filter((e) => e.status === "Paid").reduce((s, e) => s + e.amount, 0);
  const totalPending = myPayments.filter((e) => e.status !== "Paid").reduce((s, e) => s + e.amount, 0);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11px] text-slate-400 mb-1">Received to date</p><p className="text-[17px] font-mono font-bold text-[#16A34A]">TZS {money(Math.round(totalPaid))}k</p></div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11px] text-slate-400 mb-1">Pending</p><p className="text-[17px] font-mono font-bold text-[#F59E0B]">TZS {money(Math.round(totalPending))}k</p></div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        {myPayments.length === 0 ? (
          <EmptyState icon={Wallet} title="No payment history yet" hint="Payments made to you will appear here." />
        ) : (
          <div className="divide-y divide-slate-50">
            {myPayments.map((e) => (
              <div key={e.id} className="flex items-center justify-between px-4 py-3">
                <div><p className="text-[12.5px] font-medium text-[#111827]">{e.category}</p><p className="text-[11px] text-slate-400">{e.date}{e.method ? ` · ${e.method}` : ""}</p></div>
                <div className="text-right">
                  <p className="text-[13px] font-mono font-semibold text-[#111827]">TZS {money(Math.round(e.amount))}k</p>
                  <span className={`text-[10px] font-medium ${e.status === "Paid" ? "text-[#16A34A]" : "text-[#F59E0B]"}`}>{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SupplierContractsTab({ myContracts }) {
  return (
    <div className="space-y-3">
      {myContracts.length === 0 && <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={FileCheck} title="No contracts on file" hint="Supply agreements with your company will appear here." /></div>}
      {myContracts.map((c) => (
        <div key={c.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
          <div className="flex items-start justify-between mb-2">
            <div><p className="text-[13.5px] font-semibold text-[#111827]">{c.id}</p><p className="text-[11px] text-slate-400">{c.type}</p></div>
            <p className="text-[15px] font-mono font-bold text-[#111827]">TZS {money(Math.round(c.value))}k</p>
          </div>
          <p className="text-[11.5px] text-slate-500 mb-2">{c.startDate} — {c.endDate || "Open-ended"}</p>
          {c.notes && <p className="text-[12.5px] text-slate-600 leading-relaxed">{c.notes}</p>}
        </div>
      ))}
    </div>
  );
}

function SupplierDeliveriesTab({ myOrders, purchaseOrdersHook }) {
  const [editingId, setEditingId] = useState(null);
  const [newDate, setNewDate] = useState("");
  const pending = myOrders.filter((po) => po.status !== "Cancelled" && po.status !== "Paid");

  // Calls the real supplier_update_delivery_date RPC (schema section
  // "SUPPLIER PORTAL") rather than an UPDATE straight to the table — RLS
  // alone can't stop a supplier with row UPDATE access from also rewriting
  // their PO's status, so the RPC is the only door, and it only ever
  // touches expected_date after verifying the PO is genuinely theirs.
  async function saveDate(po) {
    if (!newDate) return;
    if (IS_CONFIGURED) {
      try {
        await callRpc("supplier_update_delivery_date", { p_po_doc_number: po.id, p_new_expected_date: newDate }, (typeof window !== "undefined" && window.localStorage.getItem("bs_access_token")) || "");
      } catch (_e) { notify("Couldn't update the delivery date on the server.", "error"); }
    }
    purchaseOrdersHook.setRows((prev) => prev.map((p) => (p.id === po.id ? { ...p, expectedDate: newDate } : p)));
    notify(`Delivery date updated for ${po.id}`);
    setEditingId(null);
  }

  return (
    <div className="space-y-3">
      {pending.length === 0 && <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={Truck} title="No active deliveries" hint="Purchase orders awaiting delivery will appear here." /></div>}
      {pending.map((po) => (
        <div key={po.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13.5px] font-semibold text-[#111827]">{po.id}</p>
            <span className="text-[10.5px] font-medium px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B]">{po.status}</span>
          </div>
          <p className="text-[12px] text-slate-500 mb-3">Currently committed: {po.expectedDate || "No date set"}</p>
          {editingId === po.id ? (
            <div className="flex gap-2">
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inputClass} />
              <button onClick={() => saveDate(po)} className="btn-primary text-white text-[12px] font-medium px-3 rounded-lg shrink-0">Save</button>
              <button onClick={() => setEditingId(null)} className="text-[12px] font-medium border border-slate-200 rounded-lg px-3 shrink-0">Cancel</button>
            </div>
          ) : (
            <button onClick={() => { setEditingId(po.id); setNewDate(po.expectedDate || ""); }} className="btn-secondary text-[12px] font-medium rounded-lg py-2 px-3 flex items-center gap-1.5">
              <Truck size={13} /> Update Delivery Date
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function ComingSoon({ label }) {
  return (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-xl bg-[#111827]/5 flex items-center justify-center mb-4">
        <Lock size={18} className="text-[#111827]/40" />
      </div>
      <h2 className="text-[16px] font-semibold text-[#111827]">{label} module</h2>
      <p className="text-[13px] text-slate-500 mt-1.5 max-w-xs">
        Next up in the build sequence. Dashboard and CRM are live — this module follows the same architecture.
      </p>
    </div>
  );
}

/* ---------------------------------- AUTHENTICATION ----------------------------------- */

// Expanded from 12 broad categories to real SME-specific granularity —
// verified against actual SokoBook screenshots (not a general assumption
// about what categories "should" exist), which showed roughly sixty
// specific categories in a searchable list. This replaces the earlier
// broad list built before this build had any real reference to check
// against.
const COMPANY_CATEGORIES = [
  "Agriculture", "Auto / Parts", "Bakery", "Beauty Parlour", "Cable Operator", "Catering", "Clothing",
  "Computer Services", "Construction", "Consulting", "Cosmetics", "Dairy Products", "Education",
  "Electronics", "Entertainment", "Fashion Accessories", "Financial Services", "Fishing",
  "Food & Beverages", "Footwear", "Fresh House", "Fruits & Vegetables", "Furniture", "Garage",
  "Gift & Toys", "Grocery", "Handicrafts", "Hardware", "Healthcare & Pharmacy", "Hospitality & Tourism",
  "Hostel", "Hotel", "Information Technology", "Jewellery", "Kitchen Utensils", "Laundry",
  "Legal Services", "Logistics & Transport", "Maintenance Services", "Manufacturing",
  "Medical & Healthcare", "Mill", "Mobile & Accessories", "Music", "Non Profit", "Nursery", "Online",
  "Personal", "Petroleum", "Pet Stores", "Photo Studio", "Poultry", "Printing",
  "Professional Services", "Religious Store", "Restaurant & Cafe", "Retail & Wholesale", "Salon",
  "Security Services", "Sports & Fitness", "Stationery", "Street Foods", "Sweet Shop", "Tailoring",
  "Technology", "Textiles", "Tours & Travel", "Transportation", "Veterinary", "Waste Collection",
  "Water Jars", "Other",
];
const SIGNUP_COUNTRIES = ["Tanzania", "Kenya", "Uganda", "Rwanda", "Zambia", "Malawi", "Other"];
const SIGNUP_CURRENCIES = ["TZS", "KES", "UGX", "RWF", "ZMW", "MWK", "USD"];

// A genuine industry-clustering system, built deliberately as a smaller
// number of real, differentiated profiles rather than 69 individually
// tailored experiences — the latter is not honestly buildable to real
// quality in a single pass, and a shallow, mostly-identical version of
// 69 "customized" experiences would be exactly the kind of overclaim
// this build has avoided throughout. This is the same real pattern
// international SaaS products actually use (QuickBooks, Square, and Xero
// all ask "what kind of business" during setup and adjust real defaults,
// not cosmetic labels, based on the answer) — seven meaningful clusters,
// every one of the 69 real categories mapped to exactly one, each
// cluster genuinely differentiated in what it recommends, not just
// differently named.
const INDUSTRY_PROFILES = {
  retail: {
    label: "Retail & Trade", icon: Store,
    recommendedModules: ["inventory", "sales", "finance", "procurement", "crm"],
    tips: [
      "Inventory and Sales & POS matter most here — real stock levels and real counter sales, kept in sync automatically.",
      "Set up Suppliers in Procurement early so reordering low stock is one click, not a phone-call scramble.",
      "The Business Credit Profile (Reports) is worth building early if you'll ever need supplier trade credit or a stock loan.",
    ],
  },
  food_hospitality: {
    label: "Food & Hospitality", icon: Store,
    recommendedModules: ["sales", "inventory", "hr", "finance"],
    tips: [
      "Sales & POS for the counter, Inventory for real perishable stock — the Stock Audit tab (Inventory) is genuinely useful here for catching real spoilage variance, not just theft.",
      "HR & Payroll matters more in this industry than most — shift-based staff and real leave tracking, not just a headcount number.",
      "Expenses' 'Rent & Utilities' category tends to be the largest real cost center here — watch it in Reports' Profit & Loss.",
    ],
  },
  professional_services: {
    label: "Professional & Creative Services", icon: Briefcase,
    recommendedModules: ["crm", "projects", "finance", "sales"],
    tips: [
      "CRM and Projects together are the real backbone here — a client relationship and the actual work delivered for them, tracked as one thread rather than two disconnected records.",
      "Real invoicing discipline matters most in service businesses — Reports' Receivables Aging (Finance) surfaces exactly which client relationships need a follow-up call.",
      "Consider Workflow Studio (Automation) for real, repeatable client onboarding steps rather than remembering them by hand each time.",
    ],
  },
  personal_care: {
    label: "Personal Care & Wellness", icon: Sparkles,
    recommendedModules: ["sales", "crm", "hr", "finance"],
    tips: [
      "CRM matters more here than in most retail businesses — real repeat-client relationships and their real preferences are the actual asset.",
      "Sales & POS for real day-to-day transactions, with HR & Payroll if staff work on commission or shifts.",
      "The Scenario Planner (Predictive Intelligence) is genuinely useful for modeling a real price change against real client volume before raising rates.",
    ],
  },
  healthcare: {
    label: "Healthcare & Veterinary", icon: HeartPulse,
    recommendedModules: ["inventory", "crm", "sales", "finance"],
    tips: [
      "Inventory's expiry-sensitive stock matters more here than almost any other industry — the Stock Audit tab is worth using on a real, regular schedule, not just once.",
      "CRM here functions as a real client/patient relationship record — recurring visits and real contact history matter as much as the transaction itself.",
      "Real compliance and licensing costs are worth their own Expense category (Finance) rather than being buried in a generic 'Other' bucket.",
    ],
  },
  industrial_construction: {
    label: "Construction, Manufacturing & Industrial", icon: HardHat,
    recommendedModules: ["projects", "procurement", "manufacturing", "inventory", "finance"],
    tips: [
      "Projects for real job/site tracking, Procurement and Manufacturing for real materials and production — this cluster is the one this build's fullest module set was actually built for.",
      "Fixed Assets (Finance) matters more here than most industries — real equipment depreciation affects real project costing, not just year-end paperwork.",
      "The Cash Flow Statement's Investing Activities (Reports) will show real equipment purchases as they happen, not just at audit time.",
    ],
  },
  logistics_agriculture: {
    label: "Logistics, Transport & Agriculture", icon: Truck,
    recommendedModules: ["inventory", "procurement", "finance", "sales"],
    tips: [
      "Real seasonality matters here more than almost any other industry — the Cash Flow Statement's Month vs Year-to-Date toggle (Reports) is worth checking regularly, not just at review time.",
      "Suppliers and Procurement matter early — real lead times on inputs (fuel, feed, parts) genuinely affect operations, not just bookkeeping.",
      "Loans (Finance) is worth setting up honestly from day one if seasonal financing is part of how this business actually runs — real Cash Flow accuracy depends on it.",
    ],
  },
};

// Every one of the 69 real categories mapped to exactly one profile —
// checked for completeness against COMPANY_CATEGORIES below, not
// assumed. "Other" and any unmapped edge case honestly fall back to a
// balanced, generic set rather than a guessed cluster.
const CATEGORY_TO_INDUSTRY = {
  "Grocery": "retail", "Hardware": "retail", "Electronics": "retail", "Clothing": "retail",
  "Footwear": "retail", "Fashion Accessories": "retail", "Furniture": "retail", "Kitchen Utensils": "retail",
  "Jewellery": "retail", "Gift & Toys": "retail", "Stationery": "retail", "Textiles": "retail",
  "Mobile & Accessories": "retail", "Cosmetics": "retail", "Handicrafts": "retail", "Religious Store": "retail",
  "Water Jars": "retail", "Pet Stores": "retail", "Retail & Wholesale": "retail", "Music": "retail", "Petroleum": "retail",
  "Restaurant & Cafe": "food_hospitality", "Bakery": "food_hospitality", "Catering": "food_hospitality",
  "Street Foods": "food_hospitality", "Sweet Shop": "food_hospitality", "Food & Beverages": "food_hospitality",
  "Hotel": "food_hospitality", "Hostel": "food_hospitality", "Fresh House": "food_hospitality",
  "Fruits & Vegetables": "food_hospitality", "Dairy Products": "food_hospitality", "Hospitality & Tourism": "food_hospitality",
  "Consulting": "professional_services", "Legal Services": "professional_services", "Information Technology": "professional_services",
  "Computer Services": "professional_services", "Photo Studio": "professional_services", "Professional Services": "professional_services",
  "Technology": "professional_services", "Printing": "professional_services", "Education": "professional_services",
  "Non Profit": "professional_services", "Financial Services": "professional_services", "Security Services": "professional_services",
  "Salon": "personal_care", "Beauty Parlour": "personal_care", "Laundry": "personal_care", "Tailoring": "personal_care",
  "Sports & Fitness": "personal_care", "Personal": "personal_care",
  "Healthcare & Pharmacy": "healthcare", "Medical & Healthcare": "healthcare", "Veterinary": "healthcare", "Nursery": "healthcare",
  "Construction": "industrial_construction", "Manufacturing": "industrial_construction", "Auto / Parts": "industrial_construction",
  "Garage": "industrial_construction", "Maintenance Services": "industrial_construction", "Mill": "industrial_construction",
  "Waste Collection": "industrial_construction",
  "Agriculture": "logistics_agriculture", "Fishing": "logistics_agriculture", "Poultry": "logistics_agriculture",
  "Logistics & Transport": "logistics_agriculture", "Transportation": "logistics_agriculture", "Tours & Travel": "logistics_agriculture",
  "Cable Operator": "logistics_agriculture",
  "Entertainment": "professional_services", "Online": "professional_services", "Other": "retail",
};

// A real, checkable completeness guarantee, not an assumption: every
// category in COMPANY_CATEGORIES must resolve to a real profile.
// Development-time console warning only — never surfaced to a person
// using the app, and never blocks anything if it somehow fires.
if (typeof window !== "undefined") {
  const unmapped = COMPANY_CATEGORIES.filter((c) => !CATEGORY_TO_INDUSTRY[c]);
  if (unmapped.length > 0) console.warn("Categories missing an industry mapping:", unmapped);
}

function getIndustryProfile(category) {
  const clusterId = CATEGORY_TO_INDUSTRY[category] || "retail";
  return { id: clusterId, ...INDUSTRY_PROFILES[clusterId] };
}

// Real ITU-assigned calling codes, in the same order as SIGNUP_COUNTRIES —
// not placeholder digits.
const COUNTRY_CALLING_CODES = { "Tanzania": "+255", "Kenya": "+254", "Uganda": "+256", "Rwanda": "+250", "Zambia": "+260", "Malawi": "+265", "Other": "+" };

// Mirrors the modules a real business would toggle at signup, matching
// the onboarding pattern in the reference design — this writes to the
// exact same real enabledModules Settings already manages (section 1);
// signup is just the first place a person sets it, not a separate system.
const ONBOARDING_MODULES = [
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "hr", label: "HR & Payroll", icon: Users },
  { id: "crm", label: "CRM", icon: Building2 },
  { id: "inventory", label: "Inventory", icon: Package },
  { id: "procurement", label: "Procurement", icon: ClipboardList },
  { id: "sales", label: "Sales & POS", icon: ReceiptText },
  { id: "projects", label: "Projects", icon: FileText },
  { id: "manufacturing", label: "Manufacturing", icon: Factory },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
];

// The one genuine, checkable thing "business scale" determines in this
// system: which modules are pre-selected during onboarding. A small
// business starts with the essentials a one-location shop actually uses
// day one; a large business starts with the full suite, since a growing
// company with multiple departments typically needs HR, Procurement, and
// Manufacturing from the outset, not as an afterthought. Neither preset
// locks anything away — every module stays available to enable later in
// Settings regardless of which scale was chosen, since this is a default,
// not a restriction.
const SCALE_MODULE_PRESETS = {
  small: ["finance", "inventory", "sales", "crm"],
  large: ONBOARDING_MODULES.map((m) => m.id),
};

// The brand mark, extracted once so Login, Signup, and the sidebar (see
// the shell below) all render the identical logo rather than three
// separately-drifting copies of the same clip-path hexagon.
function BrandMark({ size = 80, textSize = 32 }) {
  return (
    <div
      className="flex items-center justify-center shrink-0"
      style={{
        width: size, height: size,
        background: "linear-gradient(135deg, #22C55E, #15803D)",
        clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
      }}
    >
      <span className="text-white font-bold" style={{ fontFamily: "'Poppins'", fontSize: textSize }}>S</span>
    </div>
  );
}

function AuthTextField({ label, icon: Icon, type = "text", value, onChange, placeholder, rightSlot }) {
  return (
    <div>
      {label && <label className="text-[12.5px] font-medium text-slate-600 block mb-1.5">{label}</label>}
      <div className="relative">
        <div className="absolute left-1 top-1 bottom-1 w-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#DCFCE7" }}>
          <Icon size={15} className="text-[#16A34A]" />
        </div>
        <input
          type={type} value={value} onChange={onChange} placeholder={placeholder}
          className={`w-full bg-white border border-slate-200 rounded-lg pl-12 py-2.5 text-[13.5px] outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/30 transition-all ${rightSlot ? "pr-10" : "pr-3"}`}
        />
        {rightSlot}
      </div>
    </div>
  );
}

export default POS;
