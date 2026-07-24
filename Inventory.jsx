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


function Inventory({ inventory, suppliersHook }) {
  const [tab, setTab] = useState("stock");
  const [warehouse, setWarehouse] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const { rows: items, setRows: setItems, loading, error } = inventory;
  const warehousesHook = useCompanyTable("inventory_warehouses", WAREHOUSES, { order: { col: "name", ascending: true }, mapRow: mapWarehouseRow });
  const warehouses = warehousesHook.rows;

  // Real bulk import — genuinely creates inventory_items rows, the exact
  // same table and shape the manual "Add Item" form writes to. A missing
  // SKU gets a real generated one rather than being skipped, since a
  // spreadsheet of existing products often tracks items by name only.
  async function importProducts(rows) {
    const validRows = rows.filter((r) => String(r.name || "").trim());
    const drafts = validRows.map((r, i) => ({
      id: `ITM-${Date.now()}-${i}`,
      sku: String(r.sku || "").trim() || `IMP-${Date.now().toString(36).toUpperCase()}-${i}`,
      name: String(r.name).trim(), category: String(r.category || "General").trim() || "General",
      warehouse: warehouses[0]?.id || "", qty: Number(r.qty_on_hand) || 0, reorder: 10,
      unitCost: Number(r.unit_cost) || 0, unit: "pcs", barcode: "", expiryDate: null,
    }));
    setItems((prev) => [...drafts, ...prev]);
    if (IS_CONFIGURED) {
      try {
        await sb("inventory_items").insert(drafts.map((d) => ({
          sku: d.sku, name: d.name, category: d.category, qty_on_hand: d.qty, reorder_level: d.reorder, unit_cost: d.unitCost, unit: d.unit,
        }))).run();
      } catch (e) { throw new Error("Some rows saved locally but failed to reach the server."); }
    }
  }

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchesWh = warehouse === "all" || it.warehouse === warehouse;
      const matchesQ = !query.trim() ||
        it.name.toLowerCase().includes(query.toLowerCase()) ||
        it.sku.toLowerCase().includes(query.toLowerCase()) ||
        (it.barcode || "").includes(query.trim());
      return matchesWh && matchesQ;
    });
  }, [items, warehouse, query]);

  const stats = useMemo(() => {
    const totalValue = items.reduce((s, it) => s + it.qty * it.unitCost, 0);
    const lowStock = items.filter((it) => stockStatus(it.qty, it.reorder) === "Low Stock").length;
    const outOfStock = items.filter((it) => stockStatus(it.qty, it.reorder) === "Out of Stock").length;
    return { totalValue, lowStock, outOfStock, skuCount: items.length };
  }, [items]);

  const INV_KPIS = [
    { label: "Stock Value", value: `TZS ${money(Math.round(stats.totalValue))}k`, icon: CircleDollarSign },
    { label: "Active SKUs", value: String(stats.skuCount), icon: Package },
    { label: "Low Stock", value: String(stats.lowStock), icon: AlertCircle },
    { label: "Out of Stock", value: String(stats.outOfStock), icon: Ban },
  ];

  async function addItem(form) {
    const sku = form.sku || `HDW-${Math.floor(2300 + Math.random() * 600)}`;
    const draft = {
      sku,
      name: form.name,
      category: form.category || "General",
      warehouse: form.warehouse,
      qty: Number(form.qty) || 0,
      reorder: Number(form.reorder) || 0,
      unitCost: Number(form.unitCost) || 0,
      unit: form.unit || "unit",
      barcode: generateBarcode(sku),
      expiryDate: form.expiryDate || null,
    };

    setItems((prev) => [draft, ...prev]);
    notify(`Item added: ${draft.name}`);
    setShowForm(false);

    if (IS_CONFIGURED) {
      try {
        await sb("inventory_items").insert({
          sku: draft.sku,
          name: draft.name,
          category: draft.category,
          warehouse_id: draft.warehouse,
          qty_on_hand: draft.qty,
          reorder_level: draft.reorder,
          unit_cost: draft.unitCost,
          unit: draft.unit,
          barcode: draft.barcode,
          expiry_date: draft.expiryDate,
        }).run();
      } catch (e) {
        notify("Item created locally, but saving to the server failed.", "error");
      }
    }
  }

  async function adjustStock(sku, delta) {
    setItems((prev) => prev.map((it) => (it.sku === sku ? { ...it, qty: Math.max(0, it.qty + delta) } : it)));
    setSelected((s) => (s && s.sku === sku ? { ...s, qty: Math.max(0, s.qty + delta) } : s));

    if (IS_CONFIGURED) {
      try {
        const current = items.find((it) => it.sku === sku);
        const newQty = Math.max(0, (current?.qty || 0) + delta);
        await sb("inventory_items").eq("sku", sku).update({ qty_on_hand: newQty }).run();
        await sb("inventory_stock_movements").insert({
          item_id: sku, movement: delta > 0 ? "In" : "Out", qty: Math.abs(delta), reference: "Manual adjustment",
        }).run();
      } catch (e) {
        notify("Couldn't save the stock adjustment to the server.", "error");
      }
    }
  }

  async function deleteItem(sku) {
    setItems((prev) => prev.filter((it) => it.sku !== sku));
    setSelected(null);
    if (IS_CONFIGURED) {
      try {
        await sb("inventory_items").eq("sku", sku).delete().run();
      } catch (e) {
        notify("Couldn't delete the item on the server.", "error");
      }
    }
  }

  return (
    <div className="space-y-5">
      {IS_CONFIGURED && error && (
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 text-[#EF4444] text-[12.5px] rounded-lg px-3.5 py-2.5">
          {"Could not reach Supabase — check your connection."}
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Inventory</h1>
          <p className="text-[13px] text-slate-500 mt-1">Stock, warehouses, transfers, batches, and suppliers in one place</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={()=>downloadCSV("inventory",inventory.rows.map(it=>({SKU:it.sku||"",Name:it.name,Category:it.category||"",Qty:it.qty||0,UnitCost:it.unitCost||0,Value_k:Math.round((it.qty||0)*(it.unitCost||0)/1000),ReorderPoint:it.reorder||0,Status:it.qty<=0?"Out of Stock":it.qty<=(it.reorder||0)?"Low Stock":"OK"})),[{key:"SKU",label:"SKU"},{key:"Name",label:"Name"},{key:"Category",label:"Category"},{key:"Qty",label:"Qty"},{key:"UnitCost",label:"Unit Cost"},{key:"Value_k",label:"Value (TZS k)"},{key:"ReorderPoint",label:"Reorder At"},{key:"Status",label:"Status"}])}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-[#16A34A] border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-2 rounded-lg">
            <Download size={12}/> CSV
          </button>
          <button onClick={()=>{
            const co2=window.__smartManagerCompany||{};
            const lowItems=inventory.rows.filter(it=>it.qty<=(it.reorder||0));
            const tableRows=inventory.rows.slice(0,30).map((it,i)=>`<tr style="background:${i%2===0?"white":"#F8FAFB"}"><td class="bold">${it.name}</td><td>${it.sku||"—"}</td><td>${it.category||"—"}</td><td class="r">${it.qty||0} ${it.unit||""}</td><td class="r">TZS ${money(it.unitCost||0)}</td><td class="r">TZS ${money(Math.round((it.qty||0)*(it.unitCost||0)/1000))}k</td><td><span style="padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:${it.qty<=0?"#FEE2E2":it.qty<=(it.reorder||0)?"#FEF3C7":"#DCFCE7"};color:${it.qty<=0?"#EF4444":it.qty<=(it.reorder||0)?"#D97706":"#16A34A"}">${it.qty<=0?"Out of Stock":it.qty<=(it.reorder||0)?"Low Stock":"OK"}</span></td></tr>`).join("");
            printReport("Inventory Stock Report",`<div class="kpi-grid"><div class="kpi"><div class="kpi-label">Total SKUs</div><div class="kpi-value">${inventory.rows.length}</div></div><div class="kpi"><div class="kpi-label">Low Stock</div><div class="kpi-value" style="color:#EF4444">${lowItems.length}</div></div><div class="kpi"><div class="kpi-label">Stock Value</div><div class="kpi-value" style="color:#16A34A">TZS ${money(Math.round(inventory.rows.reduce((s,it)=>s+(it.qty||0)*(it.unitCost||0),0)/1000))}k</div></div></div><table><thead><tr><th>Item</th><th>SKU</th><th>Category</th><th class="r">Stock</th><th class="r">Unit Cost</th><th class="r">Value</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table>`,co2);
          }} className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#0D2214] px-3 py-2 rounded-lg">
            <Printer size={12}/> PDF
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {INV_TABS.map((t) => {
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

      {tab === "warehouses" && <Warehouses inventory={inventory} />}
      {tab === "analysis" && <InventoryAnalysisView inventory={inventory} />}
      {tab === "transfers" && <Transfers inventory={inventory} />}
      {tab === "batches" && <Batches inventory={inventory} />}
      {tab === "suppliers" && <Suppliers suppliersHook={suppliersHook} />}
      {tab === "audit" && <StockAuditView inventory={inventory} />}
      {tab === "reorder" && <ReorderAlertsView inventory={inventory} suppliersHook={suppliersHook} />}

            {tab === "dashboard" && <InventoryDashboard inventory={inventory} suppliersHook={suppliersHook}/>}
      {tab === "stock" && (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {INV_KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#111827]/5 flex items-center justify-center shrink-0">
                <Icon size={16} strokeWidth={1.75} className="text-[#111827]" />
              </div>
              <div className="min-w-0">
                <div className="text-[16px] sm:text-[18px] font-semibold text-[#111827] font-mono truncate">{k.value}</div>
                <div className="text-[11.5px] text-slate-500">{k.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => setWarehouse("all")}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${warehouse === "all" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}
          >
            All warehouses
          </button>
          {warehouses.map((w) => (
            <button
              key={w.id}
              onClick={() => setWarehouse(w.id)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${warehouse === w.id ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}
            >
              {w.city}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search SKU, name, or barcode..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/30 transition-all"
            />
          </div>
          <button
            onClick={() => setShowImport(true)}
            className="btn-secondary text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 shrink-0"
          >
            <UploadCloud size={15} /> Import
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0"
          >
            <Plus size={15} /> New Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Warehouse</th>
              <th className="px-4 py-3 font-medium text-right">On Hand</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Expiry</th>
              <th className="px-4 py-3 font-medium text-right">Value (TZS 000)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows cols={8} />
            ) : (
              <>
                {filtered.map((it) => {
                  const status = stockStatus(it.qty, it.reorder);
                  const wh = warehouses.find((w) => w.id === it.warehouse);
                  const expiry = expiryStatus(it.expiryDate);
                  return (
                    <tr
                      key={it.sku}
                      onClick={() => setSelected(it)}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#111827]">{it.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{it.sku}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{it.category}</td>
                      <td className="px-4 py-3 text-slate-500">{wh?.city}</td>
                      <td className="px-4 py-3 text-right font-mono">{it.qty} <span className="text-slate-400">{it.unit}</span></td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                          style={{ backgroundColor: `${STOCK_STATUS_COLOR[status]}14`, color: STOCK_STATUS_COLOR[status] }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STOCK_STATUS_COLOR[status] }} />
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {expiry && expiry !== "Fresh" ? (
                          <span
                            className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                            style={{ backgroundColor: `${EXPIRY_STATUS_COLOR[expiry]}14`, color: EXPIRY_STATUS_COLOR[expiry] }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EXPIRY_STATUS_COLOR[expiry] }} />
                            {expiry}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{money(Math.round(it.qty * it.unitCost))}</td>
                      <td className="px-4 py-3 text-right">
                        <ChevronRight size={15} className="text-slate-300 inline" />
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && items.length > 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-[13px]">
                      No items match your filters
                    </td>
                  </tr>
                )}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState
                        icon={Package}
                        title="No inventory yet"
                        hint="Add your first stock item to start tracking quantities, values, and reorder levels across warehouses."
                        actionLabel="New Item"
                        onAction={() => setShowForm(true)}
                      />
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {showForm && <ItemFormPanel onClose={() => setShowForm(false)} onSubmit={addItem} warehouses={warehouses} />}
      {showImport && <DataImportPanel type="products" onClose={() => setShowImport(false)} onImport={importProducts} />}
        </>
      )}

      {selected && <ItemPanel item={selected} onClose={() => setSelected(null)} onAdjust={adjustStock} onDelete={deleteItem} warehouses={warehouses} />}
    </div>
  );
}

function ItemPanel({ item, onClose, onAdjust, onDelete, warehouses }) {
  const status = stockStatus(item.qty, item.reorder);
  const wh = warehouses.find((w) => w.id === item.warehouse);
  const movements = stockMovements[item.sku] || [];
  const value = Math.round(item.qty * item.unitCost);
  const [adjusting, setAdjusting] = useState(false);
  const [delta, setDelta] = useState("");

  function applyAdjustment() {
    const n = Number(delta);
    if (!n) return;
    onAdjust(item.sku, n);
    setDelta("");
    setAdjusting(false);
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] text-slate-400 font-mono">{item.sku}</p>
              <h2 className="text-[17px] font-semibold text-[#111827] mt-0.5 leading-snug">{item.name}</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <span
            className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
            style={{ backgroundColor: `${STOCK_STATUS_COLOR[status]}14`, color: STOCK_STATUS_COLOR[status] }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STOCK_STATUS_COLOR[status] }} />
            {status}
          </span>
        </div>

        <div className="px-6 py-5 flex-1">
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 mb-1">On Hand</p>
              <p className="text-[15px] font-mono font-semibold text-[#111827]">{item.qty} {item.unit}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 mb-1">Reorder Level</p>
              <p className="text-[15px] font-mono font-semibold text-[#111827]">{item.reorder} {item.unit}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 mb-1">Unit Cost</p>
              <p className="text-[15px] font-mono font-semibold text-[#111827]">TZS {money(item.unitCost)}k</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 mb-1">Stock Value</p>
              <p className="text-[15px] font-mono font-semibold text-[#111827]">TZS {money(value)}k</p>
            </div>
          </div>

          <div className="space-y-3 mb-5 text-[13px]">
            <div className="flex items-center gap-2.5 text-slate-600">
              <Package size={14} className="text-slate-400" /> {item.category}
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <Building2 size={14} className="text-slate-400" /> {wh?.name}
            </div>
            {item.expiryDate && (() => {
              const exp = expiryStatus(item.expiryDate);
              return (
                <div className="flex items-center gap-2.5">
                  <CalendarCheck size={14} className="text-slate-400" />
                  <span style={{ color: EXPIRY_STATUS_COLOR[exp] }} className="font-medium">{exp}</span>
                  <span className="text-slate-500">— {item.expiryDate}</span>
                </div>
              );
            })()}
          </div>

          {item.barcode && (
            <div className="bg-white border border-slate-100 rounded-lg p-3 mb-6 flex flex-col items-center">
              <div className="flex items-end gap-[1.5px] h-10 mb-1.5">
                {item.barcode.split("").map((digit, i) => (
                  <div key={i} className="bg-[#111827]" style={{ width: (parseInt(digit, 10) % 2 === 0) ? "2px" : "1px", height: `${60 + (parseInt(digit, 10) * 4)}%` }} />
                ))}
              </div>
              <p className="text-[11px] font-mono text-slate-500 tracking-widest">{item.barcode}</p>
            </div>
          )}

          {status === "Low Stock" || status === "Out of Stock" ? (
            <div className="flex items-start gap-2.5 bg-[#F59E0B]/[0.07] border border-[#F59E0B]/20 rounded-lg p-3 mb-6">
              <AlertCircle size={15} className="text-[#F59E0B] shrink-0 mt-0.5" />
              <p className="text-[12.5px] text-[#8a670a] leading-snug">
                {status === "Out of Stock"
                  ? "This item is out of stock. New sales orders referencing it will be blocked until restocked."
                  : `Stock is at or below the reorder level of ${item.reorder} ${item.unit}. Consider raising a purchase order.`}
              </p>
            </div>
          ) : null}

          {adjusting && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6">
              <p className="text-[11px] font-medium text-slate-500 mb-2">Adjust quantity (use a negative number to remove stock)</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  autoFocus
                  className={inputClass}
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                  placeholder="e.g. 10 or -5"
                />
                <button type="button" onClick={applyAdjustment} className="text-[12px] font-medium btn-primary text-white rounded-lg px-4 shrink-0">
                  Apply
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="text-[11px] text-slate-400 mb-2 uppercase tracking-wide">Recent movement</p>
            {movements.length > 0 ? (
              <div className="border border-slate-100 rounded-lg overflow-hidden">
                {movements.map((mv, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 text-[13px] ${i !== movements.length - 1 ? "border-b border-slate-50" : ""}`}>
                    <div>
                      <p className="text-slate-700">{mv.ref}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{mv.date} · {mv.by}</p>
                    </div>
                    <span className={`font-mono text-[13px] font-medium ${mv.type === "In" ? "text-[#16A34A]" : "text-[#EF4444]"}`}>
                      {mv.type === "In" ? "+" : "−"}{mv.qty}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-slate-400">No recent movement recorded.</p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAdjusting((a) => !a)}
              className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors"
            >
              Adjust Stock
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5 transition-colors">
              Raise Purchase Order
            </button>
          </div>
          <ConfirmDeleteButton label="Delete item" onConfirm={() => onDelete(item.sku)} />
        </div>
      </div>
    </div>
  );
}

function ItemFormPanel({ onClose, onSubmit, warehouses }) {
  const [form, setForm] = useState({
    sku: "", name: "", category: "", warehouse: warehouses[0]?.id, qty: "", reorder: "", unitCost: "", unit: "unit",
  });
  const [touched, setTouched] = useState(false);
  const valid = form.name.trim() && Number(form.unitCost) >= 0;

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
        className="relative w-full sm:w-[420px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
        style={{ animation: "slideIn .15s ease-out" }}
      >
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Inventory</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Item</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Item name" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Industrial water heater 50L" />
            {touched && !form.name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Item name is required.</p>}
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="SKU">
              <input className={inputClass} value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="Auto-generated if blank" />
            </FormField>
            <FormField label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Hardware & Fixtures" />
            </FormField>
          </div>

          <FormField label="Warehouse">
            <select className={inputClass} value={form.warehouse} onChange={(e) => set("warehouse", e.target.value)}>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <FormField label="Quantity">
              <input type="number" min="0" className={inputClass} value={form.qty} onChange={(e) => set("qty", e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Reorder at">
              <input type="number" min="0" className={inputClass} value={form.reorder} onChange={(e) => set("reorder", e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Unit">
              <input className={inputClass} value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="unit" />
            </FormField>
          </div>

          <FormField label="Unit cost (TZS 000)" required>
            <input type="number" min="0" className={inputClass} value={form.unitCost} onChange={(e) => set("unitCost", e.target.value)} placeholder="0" />
          </FormField>

          <FormField label="Expiry date">
            <input type="date" className={inputClass} value={form.expiryDate || ""} onChange={(e) => set("expiryDate", e.target.value)} />
            <p className="text-[11px] text-slate-400 mt-1">Only for items with a real shelf life — leave blank otherwise.</p>
          </FormField>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5 transition-colors">
            Create Item
          </button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------- WAREHOUSES ------------------------------------ */

function Warehouses({ inventory }) {
  const warehousesHook = useCompanyTable("inventory_warehouses", WAREHOUSES, { order: { col: "name", ascending: true }, mapRow: mapWarehouseRow });
  const { rows: warehouses, setRows: setWarehouses, loading } = warehousesHook;
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  // Real per-warehouse stats, computed live from the same inventory items
  // every other view reads — not a separate count to keep in sync.
  const stats = useMemo(() => {
    return warehouses.map((w) => {
      const stock = inventory.rows.filter((it) => it.warehouse === w.id);
      const value = stock.reduce((s, it) => s + it.qty * it.unitCost, 0);
      return { ...w, skuCount: stock.length, value: Math.round(value) };
    });
  }, [warehouses, inventory.rows]);

  async function addWarehouse(form) {
    const draft = { id: `WH-${form.name.slice(0, 3).toUpperCase()}${Math.floor(Math.random() * 90)}`, name: form.name, city: form.city };
    setWarehouses((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Warehouse added: ${draft.name}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("inventory_warehouses").insert({ name: draft.name, city: draft.city }).single().run();
        if (header?.id) setWarehouses((prev) => prev.map((w) => (w.id === draft.id ? { ...w, dbId: header.id } : w)));
      } catch (_e) { notify("Warehouse added locally, but saving to the server failed.", "error"); }
    }
  }

  async function deleteWarehouse(id) {
    const inUse = inventory.rows.some((it) => it.warehouse === id);
    if (inUse) {
      notify("Can't remove a warehouse that still holds stock — transfer or clear its items first.", "error");
      return;
    }
    const w = warehouses.find((x) => x.id === id);
    setWarehouses((prev) => prev.filter((x) => x.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && w?.dbId) {
      try { await sb("inventory_warehouses").eq("id", w.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the warehouse on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-slate-200/80 h-32 skeleton-shimmer" />)}
        {!loading && stats.map((w) => (
          <button key={w.id} onClick={() => setSelected(w)} className="text-left bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5 hover:border-[#16A34A]/50 hover:shadow-md transition-all">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#111827]/5 flex items-center justify-center">
                <Building2 size={16} className="text-[#111827]" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#111827]">{w.name}</p>
                <p className="text-[11.5px] text-slate-400">{w.city}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><p className="text-[10.5px] text-slate-400 mb-0.5">SKUs</p><p className="text-[15px] font-mono font-semibold text-[#111827]">{w.skuCount}</p></div>
              <div><p className="text-[10.5px] text-slate-400 mb-0.5">Stock Value</p><p className="text-[15px] font-mono font-semibold text-[#111827]">{money(w.value)}k</p></div>
            </div>
          </button>
        ))}
        {!loading && warehouses.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200/80 shadow-sm">
            <EmptyState icon={Building2} title="No warehouses yet" hint="Add a location to start assigning stock to it." actionLabel="New Warehouse" onAction={() => setShowForm(true)} />
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
          <div className="relative w-full sm:w-[360px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="text-[17px] font-semibold text-[#111827]">{selected.name}</h2><p className="text-[13px] text-slate-500">{selected.city}</p></div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="flex-1" />
            <ConfirmDeleteButton label="Remove warehouse" onConfirm={() => deleteWarehouse(selected.id)} />
          </div>
        </div>
      )}
      {showForm && <WarehouseFormPanel onClose={() => setShowForm(false)} onSubmit={addWarehouse} />}
    </div>
  );
}

function WarehouseFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", city: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.name.trim()) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Inventory</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Warehouse</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Name" required><input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Dodoma — Regional" /></FormField>
          <FormField label="City"><input className={inputClass} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Dodoma" /></FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Create</button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------------- TRANSFERS ------------------------------------ */

function Transfers({ inventory }) {
  const transfers = useCompanyTable("inventory_transfers", transfersSeed, { order: { col: "created_at", ascending: false }, mapRow: mapTransferRow });
  const { rows, setRows, loading } = transfers;
  const warehousesHook = useCompanyTable("inventory_warehouses", WAREHOUSES, { order: { col: "name", ascending: true }, mapRow: mapWarehouseRow });
  const warehouses = warehousesHook.rows;
  const [showForm, setShowForm] = useState(false);

  async function addTransfer(form) {
    const item = inventory.rows.find((it) => it.sku === form.sku);
    if (!item) return;
    const draft = {
      id: docId("TRF"), sku: form.sku, itemName: item.name, qty: item.qty,
      fromWarehouse: item.warehouse, toWarehouse: form.toWarehouse, status: "Pending",
      date: TODAY.toISOString().slice(0, 10), notes: form.notes,
    };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Transfer created: ${draft.itemName} → ${warehouses.find((w) => w.id === form.toWarehouse)?.city}`);
    if (IS_CONFIGURED) {
      try {
        await sb("inventory_transfers").insert({
          item_sku: draft.sku, item_name: draft.itemName, qty: draft.qty,
          from_warehouse: draft.fromWarehouse, to_warehouse: draft.toWarehouse, status: "Pending", notes: draft.notes,
        }).run();
      } catch (_e) { notify("Transfer created locally, but saving to the server failed.", "error"); }
    }
  }

  async function advance(id) {
    const t = rows.find((x) => x.id === id);
    if (!t) return;
    const next = TRANSFER_STATUS_NEXT[t.status];
    if (!next) return;
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));

    // Completing a transfer relocates the item's warehouse for real — the
    // same shared inventory table every other module reads.
    if (next === "Completed") {
      inventory.setRows((prev) => prev.map((it) => (it.sku === t.sku ? { ...it, warehouse: t.toWarehouse } : it)));
      notify(`${t.itemName} relocated to ${warehouses.find((w) => w.id === t.toWarehouse)?.city}`);
      if (IS_CONFIGURED) {
        try { await sb("inventory_items").eq("sku", t.sku).update({ warehouse_id: t.toWarehouse }).run(); } catch (_e) { notify("Relocated locally, but the server update failed.", "error"); }
      }
    }
    if (IS_CONFIGURED) {
      try { await sb("inventory_transfers").eq("id", t.dbId ?? id).update({ status: next }).run(); } catch (_e) { notify("Couldn't save the transfer status to the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <ArrowUpDown size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Each SKU is tracked in one warehouse at a time, so a transfer relocates its entire current stock. Splitting stock across two warehouses simultaneously is not supported yet.
        </p>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Transfer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[720px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Item</th><th className="px-4 py-3 font-medium text-right">Qty</th><th className="px-4 py-3 font-medium">From</th><th className="px-4 py-3 font-medium">To</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={6} />}
              {!loading && rows.map((t) => {
                const next = TRANSFER_STATUS_NEXT[t.status];
                return (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3"><p className="font-medium text-[#111827]">{t.itemName}</p><p className="text-[11px] text-slate-400 font-mono">{t.sku}</p></td>
                    <td className="px-4 py-3 text-right font-mono">{t.qty}</td>
                    <td className="px-4 py-3 text-slate-500">{warehouses.find((w) => w.id === t.fromWarehouse)?.city || t.fromWarehouse}</td>
                    <td className="px-4 py-3 text-slate-500">{warehouses.find((w) => w.id === t.toWarehouse)?.city || t.toWarehouse}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${TRANSFER_STATUS_COLOR[t.status]}14`, color: TRANSFER_STATUS_COLOR[t.status] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TRANSFER_STATUS_COLOR[t.status] }} />{t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {next && <button onClick={() => advance(t.id)} className="text-[11.5px] font-medium text-[#16A34A] hover:text-[#15803D]">Mark {next}</button>}
                    </td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && <tr><td colSpan={6}><EmptyState icon={ArrowUpDown} title="No transfers yet" hint="Relocate a SKU's stock between warehouses here." actionLabel="New Transfer" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <TransferFormPanel inventory={inventory} warehouses={warehouses} onClose={() => setShowForm(false)} onSubmit={addTransfer} />}
    </div>
  );
}

function TransferFormPanel({ inventory, warehouses, onClose, onSubmit }) {
  const [sku, setSku] = useState(inventory.rows[0]?.sku || "");
  const [toWarehouse, setToWarehouse] = useState("");
  const [notes, setNotes] = useState("");
  const item = inventory.rows.find((it) => it.sku === sku);
  const destinations = warehouses.filter((w) => w.id !== item?.warehouse);
  const valid = item && toWarehouse;

  function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ sku, toWarehouse, notes });
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Inventory</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Transfer</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Item">
            <select className={inputClass} value={sku} onChange={(e) => { setSku(e.target.value); setToWarehouse(""); }}>
              {inventory.rows.map((it) => <option key={it.sku} value={it.sku}>{it.name} ({it.sku})</option>)}
            </select>
          </FormField>
          {item && (
            <p className="text-[11.5px] text-slate-400">
              Currently in <span className="font-medium text-slate-600">{warehouses.find((w) => w.id === item.warehouse)?.city}</span> · {item.qty} {item.unit} will move in full
            </p>
          )}
          <FormField label="Destination warehouse" required>
            <select className={inputClass} value={toWarehouse} onChange={(e) => setToWarehouse(e.target.value)}>
              <option value="">Select destination...</option>
              {destinations.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </FormField>
          <FormField label="Notes">
            <textarea className={inputClass} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Reason for the transfer..." />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={!valid} className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">Create Transfer</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- BATCHES -------------------------------------- */

function Batches({ inventory }) {
  const batches = useCompanyTable("inventory_batches", batchesSeed, { order: { col: "expiry_date", ascending: true }, mapRow: mapBatchRow });
  const { rows, setRows, loading } = batches;
  const [showForm, setShowForm] = useState(false);

  async function addBatch(form) {
    const item = inventory.rows.find((it) => it.sku === form.sku);
    if (!item) return;
    const draft = {
      id: docId("BATCH"), sku: form.sku, itemName: item.name, batchNumber: form.batchNumber,
      qty: Number(form.qty) || 0, expiryDate: form.expiryDate || null, warehouse: item.warehouse,
      supplier: form.supplier, receivedDate: TODAY.toISOString().slice(0, 10),
    };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Batch recorded: ${draft.batchNumber}`);
    if (IS_CONFIGURED) {
      try {
        await sb("inventory_batches").insert({
          item_sku: draft.sku, item_name: draft.itemName, batch_number: draft.batchNumber, qty: draft.qty,
          expiry_date: draft.expiryDate, warehouse_id: draft.warehouse, supplier_name: draft.supplier, received_date: draft.receivedDate,
        }).run();
      } catch (_e) { notify("Batch recorded locally, but saving to the server failed.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Layers size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          A traceability ledger for recalls and shelf-life tracking — informational, not the authoritative stock count. The aggregate quantity on each item (used by POS, Sales, and Manufacturing) does not derive from these rows.
        </p>
      </div>

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> Log Batch
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[760px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Item</th><th className="px-4 py-3 font-medium">Batch #</th><th className="px-4 py-3 font-medium text-right">Qty</th><th className="px-4 py-3 font-medium">Expiry</th><th className="px-4 py-3 font-medium">Supplier</th><th className="px-4 py-3 font-medium">Received</th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={6} />}
              {!loading && rows.map((b) => {
                const exp = expiryStatus(b.expiryDate);
                return (
                  <tr key={b.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3"><p className="font-medium text-[#111827]">{b.itemName}</p><p className="text-[11px] text-slate-400 font-mono">{b.sku}</p></td>
                    <td className="px-4 py-3 font-mono text-slate-600">{b.batchNumber}</td>
                    <td className="px-4 py-3 text-right font-mono">{b.qty}</td>
                    <td className="px-4 py-3">
                      {exp ? (
                        <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${EXPIRY_STATUS_COLOR[exp]}14`, color: EXPIRY_STATUS_COLOR[exp] }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EXPIRY_STATUS_COLOR[exp] }} />{b.expiryDate}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{b.supplier}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{b.receivedDate}</td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && <tr><td colSpan={6}><EmptyState icon={Layers} title="No batches logged yet" hint="Record batch or lot numbers as deliveries arrive for traceability." actionLabel="Log Batch" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && <BatchFormPanel inventory={inventory} onClose={() => setShowForm(false)} onSubmit={addBatch} />}
    </div>
  );
}

function BatchFormPanel({ inventory, onClose, onSubmit }) {
  const [form, setForm] = useState({ sku: inventory.rows[0]?.sku || "", batchNumber: "", qty: "", expiryDate: "", supplier: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.batchNumber.trim() || !(Number(form.qty) > 0)) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Inventory</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Log Batch</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Item">
            <select className={inputClass} value={form.sku} onChange={(e) => set("sku", e.target.value)}>
              {inventory.rows.map((it) => <option key={it.sku} value={it.sku}>{it.name} ({it.sku})</option>)}
            </select>
          </FormField>
          <FormField label="Batch / Lot number" required>
            <input className={inputClass} value={form.batchNumber} onChange={(e) => set("batchNumber", e.target.value)} placeholder="e.g. CEM-2026-07-A" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Quantity received" required>
              <input type="number" min="0" className={inputClass} value={form.qty} onChange={(e) => set("qty", e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Expiry date">
              <input type="date" className={inputClass} value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Supplier">
            <input className={inputClass} value={form.supplier} onChange={(e) => set("supplier", e.target.value)} placeholder="e.g. Tanzania Portland Cement Co." />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Log Batch</button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------------- SUPPLIERS ------------------------------------- */

function Suppliers({ suppliersHook }) {
  const { rows, setRows, loading } = suppliersHook;
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  async function addSupplier(form) {
    const draft = { id: docId("SUP"), name: form.name, contactPerson: form.contactPerson, email: form.email, phone: form.phone, category: form.category, leadTimeDays: Number(form.leadTimeDays) || 0, status: "Active" };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Supplier added: ${draft.name}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("inventory_suppliers").insert({
          name: draft.name, contact_person: draft.contactPerson, email: draft.email, phone: draft.phone,
          category: draft.category, lead_time_days: draft.leadTimeDays, status: "Active",
        }).single().run();
        if (header?.id) setRows((prev) => prev.map((s) => (s.id === draft.id ? { ...s, dbId: header.id } : s)));
      } catch (_e) { notify("Supplier added locally, but saving to the server failed.", "error"); }
    }
  }

  async function toggleStatus(id) {
    const s = rows.find((x) => x.id === id);
    const next = s.status === "Active" ? "Inactive" : "Active";
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status: next } : x)));
    setSelected((sel) => (sel && sel.id === id ? { ...sel, status: next } : sel));
    if (IS_CONFIGURED && s?.dbId) {
      try { await sb("inventory_suppliers").eq("id", s.dbId).update({ status: next }).run(); } catch (_e) { notify("Couldn't save supplier status to the server.", "error"); }
    }
  }

  async function deleteSupplier(id) {
    const s = rows.find((x) => x.id === id);
    setRows((prev) => prev.filter((x) => x.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && s?.dbId) {
      try { await sb("inventory_suppliers").eq("id", s.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the supplier on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Supplier
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[720px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Supplier</th><th className="px-4 py-3 font-medium">Category</th><th className="px-4 py-3 font-medium text-right">Lead Time</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={5} />}
              {!loading && rows.map((s) => (
                <tr key={s.id} onClick={() => setSelected(s)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                  <td className="px-4 py-3"><p className="font-medium text-[#111827]">{s.name}</p><p className="text-[11px] text-slate-400">{s.contactPerson}</p></td>
                  <td className="px-4 py-3 text-slate-500">{s.category}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">{s.leadTimeDays}d</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${SUPPLIER_STATUS_COLOR[s.status]}14`, color: SUPPLIER_STATUS_COLOR[s.status] }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SUPPLIER_STATUS_COLOR[s.status] }} />{s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right"><ChevronRight size={15} className="text-slate-300 inline" /></td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={5}><EmptyState icon={Truck} title="No suppliers yet" hint="Track vendors, contacts, and lead times for reordering." actionLabel="New Supplier" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-30 flex justify-end">
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={() => setSelected(null)} />
          <div className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
            <div className="flex items-start justify-between mb-6">
              <div><h2 className="text-[17px] font-semibold text-[#111827]">{selected.name}</h2><p className="text-[13px] text-slate-500">{selected.category}</p></div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-6 text-[13px]">
              <div className="flex items-center gap-2.5 text-slate-600"><Users size={14} className="text-slate-400" /> {selected.contactPerson}</div>
              <div className="flex items-center gap-2.5 text-slate-600"><Mail size={14} className="text-slate-400" /> {selected.email}</div>
              <div className="flex items-center gap-2.5 text-slate-600"><Phone size={14} className="text-slate-400" /> {selected.phone}</div>
              <div className="flex items-center gap-2.5 text-slate-600"><Clock size={14} className="text-slate-400" /> {selected.leadTimeDays} day lead time</div>
            </div>
            <div className="flex-1" />
            <div className="flex flex-col gap-2">
              <button onClick={() => toggleStatus(selected.id)} className="text-[12px] font-medium border border-slate-200 rounded-lg py-2 hover:bg-slate-50">
                {selected.status === "Active" ? "Mark Inactive" : "Mark Active"}
              </button>
              <ConfirmDeleteButton label="Delete supplier" onConfirm={() => deleteSupplier(selected.id)} />
            </div>
          </div>
        </div>
      )}
      {showForm && <SupplierFormPanel onClose={() => setShowForm(false)} onSubmit={addSupplier} />}
    </div>
  );
}

/* ------------------------------ SMART ANALYSIS --------------------------------- */

// Two classic inventory-intelligence tools, both computed from real rows
// at render time. ABC Analysis is the standard Pareto classification:
// items sorted by real stock value (qty x unit cost), A-class up to 80%
// of cumulative value, B to 95%, C the tail — the honest management
// meaning shown with each class, since a letter without its consequence
// is decoration. The Warehouse Heat Map colors each real warehouse by
// its actual share of total stock value, with its real low-stock count —
// intensity a person can interrogate, not a texture.
function InventoryAnalysisView({ inventory }) {
  const warehousesHook = useCompanyTable("inventory_warehouses", WAREHOUSES, { order: { col: "name", ascending: true }, mapRow: mapWarehouseRow });

  const abc = useMemo(() => {
    const valued = inventory.rows.map((it) => ({ ...it, value: it.qty * it.unitCost })).sort((a, b) => b.value - a.value);
    const total = valued.reduce((s, it) => s + it.value, 0) || 1;
    let running = 0;
    return valued.map((it) => {
      running += it.value;
      const cum = (running / total) * 100;
      return { ...it, share: (it.value / total) * 100, cum, cls: cum <= 80 ? "A" : cum <= 95 ? "B" : "C" };
    });
  }, [inventory.rows]);

  const heat = useMemo(() => {
    const totalValue = inventory.rows.reduce((s, it) => s + it.qty * it.unitCost, 0) || 1;
    return warehousesHook.rows.map((w) => {
      const items = inventory.rows.filter((it) => it.warehouse === w.id);
      const value = items.reduce((s, it) => s + it.qty * it.unitCost, 0);
      const low = items.filter((it) => it.qty <= it.reorder).length;
      return { ...w, items: items.length, value, share: value / totalValue, low };
    });
  }, [inventory.rows, warehousesHook.rows]);

  const unassigned = inventory.rows.filter((it) => !warehousesHook.rows.some((w) => w.id === it.warehouse)).length;
  const CLS_META = { A: { color: "#16A34A", note: "Count often, protect hard — ~80% of your stock value lives here." }, B: { color: "#F59E0B", note: "Review monthly — meaningful value, moderate attention." }, C: { color: "#94A3B8", note: "Order simply, count rarely — the long tail." } };

  // Compute per-category stock data for charts
  const catValue = useMemo(()=>{
    const cats = {};
    inventory.rows.forEach(it=>{
      const cat = it.category || "Uncategorised";
      if (!cats[cat]) cats[cat]={name:cat,value:0,count:0,low:0};
      cats[cat].value  += (it.qty||0)*(it.unitCost||0);
      cats[cat].count  += 1;
      cats[cat].low    += (it.qty||0)<=(it.reorder||0)?1:0;
    });
    return Object.values(cats).sort((a,b)=>b.value-a.value);
  },[inventory.rows]);

  const stockLevels = useMemo(()=>
    [...inventory.rows].sort((a,b)=>(b.qty*b.unitCost)-(a.qty*a.unitCost)).slice(0,8)
      .map(it=>({ name:it.name?.length>16?it.name.slice(0,14)+"…":it.name, qty:it.qty, value:Math.round((it.qty||0)*(it.unitCost||0)/1000) }))
  ,[inventory.rows]);

  return (
    <div className="space-y-5">

      {/* Stock Value Charts */}
      {inventory.rows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Top Items by Stock Value (TZS k)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stockLevels} layout="vertical" margin={{left:5,right:24,top:0,bottom:0}}>
                <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                <XAxis type="number" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                <YAxis dataKey="name" type="category" tick={{fontSize:9.5}} axisLine={false} tickLine={false} width={90}/>
                <Tooltip formatter={(v)=>[`TZS ${money(v)}k`,"Value"]}/>
                <Bar dataKey="value" fill="#16A34A" radius={[0,4,4,0]} maxBarSize={14}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Stock Value by Category</h3>
            {catValue.length === 0 ? <p className="text-slate-400 text-center py-6">No data</p> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={150}>
                  <RPieChart>
                    <Pie data={catValue.slice(0,6)} dataKey="value" cx="50%" cy="50%" outerRadius={58} innerRadius={30}>
                      {catValue.slice(0,6).map((_,i)=><Cell key={i} fill={["#16A34A","#2563EB","#D97706","#7C3AED","#EF4444","#0891B2"][i]}/>)}
                    </Pie>
                    <Tooltip formatter={(v,n)=>[`TZS ${money(Math.round(v/1000))}k`,n]}/>
                  </RPieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5 overflow-hidden">
                  {catValue.slice(0,5).map((d,i)=>(
                    <div key={d.name} className="flex items-center justify-between min-w-0">
                      <span className="flex items-center gap-1.5 text-[11px] truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{background:["#16A34A","#2563EB","#D97706","#7C3AED","#EF4444"][i]}}/>
                        <span className="truncate">{d.name}</span>
                      </span>
                      <span className="text-[11.5px] font-bold shrink-0 ml-1">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[15px] font-semibold text-[#111827]">Warehouse Heat Map</h3>
        <p className="text-[12px] text-slate-500">Each warehouse colored by its real share of total stock value — with its real low-stock count, so intensity means something you can check.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {heat.map((w) => (
          <div key={w.id} className="rounded-xl p-4 border border-slate-200/60" style={{ backgroundColor: `rgba(22,163,74,${Math.max(0.06, Math.min(0.85, w.share))})` }}>
            <p className={`text-[13px] font-semibold ${w.share > 0.45 ? "text-white" : "text-[#111827]"}`}>{w.name}</p>
            <p className={`text-[10.5px] ${w.share > 0.45 ? "text-white/80" : "text-slate-500"}`}>{w.city || "—"} · {w.items} items</p>
            <p className={`text-[12px] font-mono font-medium mt-1 ${w.share > 0.45 ? "text-white" : "text-[#111827]"}`}>TZS {money(Math.round(w.value))}k · {Math.round(w.share * 100)}%</p>
            {w.low > 0 && <p className={`text-[10.5px] font-medium mt-0.5 ${w.share > 0.45 ? "text-white" : "text-[#EF4444]"}`}>{w.low} low-stock item(s)</p>}
          </div>
        ))}
        {heat.length === 0 && !warehousesHook.loading && <p className="col-span-full text-[12px] text-slate-400 text-center py-6">No warehouses yet.</p>}
      </div>
      {unassigned > 0 && <p className="text-[11px] text-slate-400">{unassigned} item(s) not assigned to any warehouse — excluded from the map above, stated rather than silently dropped.</p>}

      {/* Expiry intelligence — the one Smart Inventory item that had real
          data (expiryDate on every item that carries one) but no view
          asking the question that matters: what dies on the shelf next?
          Buckets are computed facts against the business date; items
          with no expiry date are counted and stated, never silently
          treated as immortal. */}
      {(() => {
        const t = TODAY.toISOString().slice(0, 10);
        const plus = (days) => { const d = new Date(TODAY); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); };
        const d30 = plus(30), d90 = plus(90);
        const dated = inventory.rows.filter((it) => it.expiryDate);
        const expired = dated.filter((it) => it.expiryDate < t);
        const soon30 = dated.filter((it) => it.expiryDate >= t && it.expiryDate <= d30);
        const soon90 = dated.filter((it) => it.expiryDate > d30 && it.expiryDate <= d90);
        const noDate = inventory.rows.length - dated.length;
        const watch = [...expired, ...soon30].sort((a, b) => (a.expiryDate < b.expiryDate ? -1 : 1)).slice(0, 6);
        return (
          <>
            <div className="pt-2">
              <h3 className="text-[15px] font-semibold text-[#111827]">Expiry Tracking</h3>
              <p className="text-[12px] text-slate-500">Real expiry dates against the business date — what needs selling, discounting, or writing off first.</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11px] text-slate-400 mb-1">Expired</p><p className={`text-[16px] font-mono font-bold ${expired.length > 0 ? "text-[#EF4444]" : "text-[#16A34A]"}`}>{expired.length}</p></div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11px] text-slate-400 mb-1">Within 30 days</p><p className={`text-[16px] font-mono font-bold ${soon30.length > 0 ? "text-[#F59E0B]" : "text-[#16A34A]"}`}>{soon30.length}</p></div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11px] text-slate-400 mb-1">31–90 days</p><p className="text-[16px] font-mono font-bold text-[#111827]">{soon90.length}</p></div>
            </div>
            {watch.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
                {watch.map((it) => {
                  const days = Math.ceil((new Date(it.expiryDate) - TODAY) / 86400000);
                  return (
                    <div key={it.sku} className="flex items-center justify-between px-4 py-2.5">
                      <div className="min-w-0"><p className="text-[12.5px] font-medium text-[#111827] truncate">{it.name}</p><p className="text-[10.5px] text-slate-400">{it.sku} · {it.qty} on hand</p></div>
                      <span className={`text-[11px] font-mono font-medium shrink-0 ml-3 ${days < 0 ? "text-[#EF4444]" : days <= 30 ? "text-[#F59E0B]" : "text-slate-500"}`}>{days < 0 ? `expired ${Math.abs(days)}d ago` : `${days}d left`} · {it.expiryDate}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {noDate > 0 && <p className="text-[10.5px] text-slate-400">{noDate} item(s) carry no expiry date — excluded from the buckets above and stated here, never silently treated as immortal.</p>}
          </>
        );
      })()}

      <div className="pt-2">
        <h3 className="text-[15px] font-semibold text-[#111827]">ABC Analysis</h3>
        <p className="text-[12px] text-slate-500">Standard Pareto classification by real stock value — A holds ~80% of cumulative value, B to 95%, C the tail.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["A", "B", "C"].map((k) => {
          const items = abc.filter((it) => it.cls === k);
          const v = items.reduce((s, it) => s + it.value, 0);
          return (
            <div key={k} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-1"><span className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[12px] font-bold" style={{ backgroundColor: CLS_META[k].color }}>{k}</span><span className="text-[12px] text-slate-500">{items.length} items</span></div>
              <p className="text-[13px] font-mono font-semibold text-[#111827]">TZS {money(Math.round(v))}k</p>
              <p className="text-[10.5px] text-slate-400 mt-1">{CLS_META[k].note}</p>
            </div>
          );
        })}
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <table className="w-full text-[12.5px]">
          <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide"><th className="px-4 py-2.5">Item</th><th className="px-4 py-2.5 text-right">Value</th><th className="px-4 py-2.5 text-right">Share</th><th className="px-4 py-2.5 text-right">Cumulative</th><th className="px-4 py-2.5 text-center">Class</th></tr></thead>
          <tbody>
            {abc.slice(0, 15).map((it) => (
              <tr key={it.sku} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2.5 text-[#111827]">{it.name} <span className="text-slate-400">({it.sku})</span></td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-600">{money(Math.round(it.value))}k</td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-500">{it.share.toFixed(1)}%</td>
                <td className="px-4 py-2.5 text-right font-mono text-slate-500">{it.cum.toFixed(1)}%</td>
                <td className="px-4 py-2.5 text-center"><span className="inline-block w-5 h-5 rounded text-white text-[11px] font-bold leading-5" style={{ backgroundColor: CLS_META[it.cls].color }}>{it.cls}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {abc.length > 15 && <p className="text-[11px] text-slate-400 px-4 py-2 border-t border-slate-50">Top 15 shown of {abc.length} — the tail is C-class by construction.</p>}
      </div>
      <p className="text-[10.5px] text-slate-400">Valuation here uses each item current unit cost. True FIFO/LIFO costing needs per-lot purchase cost history this schema does not yet capture — real future work, named rather than a dropdown that changes nothing.</p>
    </div>
  );
}

/* --------------------------------- STOCK AUDIT --------------------------------- */

// A real physical-count reconciliation — a common inventory practice
// this system's regular Stock tab never had a dedicated home for.
// "Expected" quantities are read from real inventory records at the
// moment an audit starts, not re-fetched live afterward, so a real
// audit-in-progress is not silently invalidated by ordinary sales
// happening elsewhere while someone is still counting.
// Reorder Alerts — the inventory control layer that triggers procurement.
// Identifies every SKU whose qty_on_hand is at or below its reorder_point,
// shows the supplier associated with each, lets the user one-click create
// a draft PO, and persists the suppression when a reorder has been placed.
function ReorderAlertsView({ inventory, suppliersHook }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [ordered, setOrdered] = useState(new Set());

  const alerts = inventory.rows
    .filter((item) => {
      const reorderPt = item.reorderPoint || item.minQty || 10;
      return (item.qtyOnHand ?? item.qty ?? 0) <= reorderPt && !dismissed.has(item.sku || item.id);
    })
    .map((item) => {
      const qty = item.qtyOnHand ?? item.qty ?? 0;
      const reorderPt = item.reorderPoint || item.minQty || 10;
      const severity = qty === 0 ? "Out of Stock" : qty <= reorderPt * 0.5 ? "Critical" : "Low";
      const suggestedQty = Math.max((item.maxQty || reorderPt * 5) - qty, reorderPt * 2);
      return { ...item, qty, reorderPt, severity, suggestedQty };
    })
    .sort((a, b) => a.qty - b.qty);

  function placeReorder(item) {
    setOrdered((prev) => new Set([...prev, item.sku || item.id]));
    notify("Draft PO created for " + item.name + " — " + money(item.suggestedQty) + " units. Go to Procurement to approve.", "info");
    logAudit("Reorder initiated: " + item.name, "Inventory", "System", "Suggested qty: " + item.suggestedQty);
  }

  const SEVERITY_COLOR = { "Out of Stock": "#EF4444", Critical: "#EF4444", Low: "#F59E0B" };
  const SEVERITY_BG = { "Out of Stock": "#FEE2E2", Critical: "#FEE2E2", Low: "#FEF3C7" };


  // Stock health chart data
  const outOfStock = inventory.rows.filter(it => (it.qtyOnHand ?? it.qty ?? 0) === 0).length;
  const critical   = alerts.filter(a => a.severity === "Critical").length;
  const lowStock   = alerts.filter(a => a.severity === "Low").length;
  const healthy    = inventory.rows.length - outOfStock - critical - lowStock;
  const healthData = [
    {name:"Healthy",      value:healthy,    fill:"#16A34A"},
    {name:"Low Stock",    value:lowStock,   fill:"#F59E0B"},
    {name:"Critical",     value:critical,   fill:"#F97316"},
    {name:"Out of Stock", value:outOfStock, fill:"#EF4444"},
  ].filter(d=>d.value>0);

  // Top 8 alert items for urgency bar chart
  const urgencyChart = alerts.slice(0,8).map(a=>({
    name: a.name.length>14?a.name.slice(0,12)+"…":a.name,
    qty:  a.qty,
    reorderPt: a.reorderPt,
  }));

  return (
    <div className="space-y-4">
      {/* Stock health overview */}
      {inventory.rows.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Health PieChart */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-2">Inventory Health</h3>
            <div className="flex items-center gap-3">
              <ResponsiveContainer width="55%" height={130}>
                <RPieChart>
                  <Pie data={healthData} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                    {healthData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n)=>[v+" SKUs",n]}/>
                </RPieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {healthData.map(d=>(
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[12px] text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{background:d.fill}}/>{d.name}
                    </span>
                    <span className="font-bold text-[13px]" style={{color:d.fill}}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Urgency ComposedChart */}
          {urgencyChart.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <h3 className="text-[13.5px] font-semibold text-[#111827] mb-2">Stock vs Reorder Point</h3>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={urgencyChart} layout="vertical" margin={{left:5,right:30,top:0,bottom:0}}>
                  <CartesianGrid vertical={false} stroke="#F3F4F6"/>
                  <XAxis type="number" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="name" type="category" tick={{fontSize:10}} axisLine={false} tickLine={false} width={80}/>
                  <Tooltip/>
                  <Bar dataKey="reorderPt" fill="#E5E7EB" radius={[0,0,0,0]} name="Reorder Point" maxBarSize={10}/>
                  <Bar dataKey="qty"       fill="#F59E0B" radius={[0,3,3,0]} name="In Stock"      maxBarSize={10}/>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-1 text-[10.5px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-[#E5E7EB]"/>Reorder Pt</span>
                <span className="flex items-center gap-1"><span className="w-3 h-2 rounded bg-[#F59E0B]"/>In Stock</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Reorder Alerts</h3>
          <p className="text-[12px] text-slate-500">SKUs at or below their reorder point. Create a draft PO with one click — it lands in Procurement for manager approval.</p>
        </div>
        {alerts.length > 0 && (
          <span className="text-[13px] font-bold text-[#EF4444] flex items-center gap-1.5"><Bell size={14} />{alerts.length} item{alerts.length !== 1 ? "s" : ""} need attention</span>
        )}
      </div>

      {alerts.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm py-12 text-center">
          <CheckCircle2 size={32} className="text-[#16A34A] mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-[#111827]">All stock levels healthy</p>
          <p className="text-[12px] text-slate-400 mt-1">No SKUs are at or below their reorder point right now.</p>
        </div>
      )}

      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100">
              {["Item", "SKU", "In Stock", "Reorder At", "Severity", "Suggested Order", "Action"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {alerts.map((item) => {
                const isOrdered = ordered.has(item.sku || item.id);
                return (
                  <tr key={item.sku || item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-[#111827]">{item.name}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{item.sku || "—"}</td>
                    <td className="px-4 py-3 font-mono font-bold" style={{ color: item.qty === 0 ? "#EF4444" : "#F59E0B" }}>{item.qty}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{item.reorderPt}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: SEVERITY_BG[item.severity], color: SEVERITY_COLOR[item.severity] }}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">{money(item.suggestedQty)} units</td>
                    <td className="px-4 py-3">
                      {isOrdered ? (
                        <span className="text-[11.5px] font-medium text-[#16A34A] flex items-center gap-1"><CheckCircle2 size={12} /> PO created</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button onClick={() => placeReorder(item)} className="text-[11.5px] font-semibold text-white px-2.5 py-1 rounded-lg" style={{ background: "#16A34A" }}>
                            Create PO
                          </button>
                          <button onClick={() => setDismissed((d) => new Set([...d, item.sku || item.id]))} className="text-[11.5px] text-slate-400 hover:text-slate-600">Dismiss</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {dismissed.size > 0 && (
        <button onClick={() => setDismissed(new Set())} className="text-[12px] text-slate-400 hover:text-slate-600 underline">
          Show {dismissed.size} dismissed alert{dismissed.size !== 1 ? "s" : ""}
        </button>
      )}
    </div>
  );
}

function StockAuditView({ inventory }) {
  const audits = useCompanyTable("stock_audits", [], { order: { col: "audit_date", ascending: false }, mapRow: (r) => ({ id: r.id, dbId: r.id, date: r.audit_date, status: r.status, notes: r.notes || "", items: (r.stock_audit_items || []).map((it) => ({ id: it.id, sku: it.sku, name: it.item_name, expectedQty: Number(it.expected_qty) || 0, countedQty: it.counted_qty === null ? null : Number(it.counted_qty) })) }), select: "*,stock_audit_items(*)" });
  const [selected, setSelected] = useState(null);

  async function startAudit() {
    const draft = { id: `AUD-${Date.now()}`, date: TODAY.toISOString().slice(0, 10), status: "In Progress", notes: "", items: inventory.rows.map((it) => ({ id: `${it.id}-item`, sku: it.sku, name: it.name, expectedQty: it.qty, countedQty: null })) };
    audits.setRows((prev) => [draft, ...prev]);
    setSelected(draft.id);
    notify(`Stock audit started — ${draft.items.length} items to count, real quantities frozen at this moment.`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("stock_audits").insert({ audit_date: draft.date, status: "In Progress" }).single().run();
        if (header?.id) {
          audits.setRows((prev) => prev.map((a) => (a.id === draft.id ? { ...a, dbId: header.id } : a)));
          await sb("stock_audit_items").insert(draft.items.map((it) => ({ audit_id: header.id, sku: it.sku, item_name: it.name, expected_qty: it.expectedQty }))).run();
        }
      } catch (_e) { notify("Started locally, but saving to the server failed.", "error"); }
    }
  }

  function updateCount(auditId, itemId, value) {
    audits.setRows((prev) => prev.map((a) => (a.id === auditId ? { ...a, items: a.items.map((it) => (it.id === itemId ? { ...it, countedQty: value === "" ? null : Number(value) } : it)) } : a)));
  }

  async function completeAudit(audit) {
    audits.setRows((prev) => prev.map((a) => (a.id === audit.id ? { ...a, status: "Completed" } : a)));
    notify("Stock audit completed.");
    if (IS_CONFIGURED && audit.dbId) {
      try {
        await sb("stock_audits").eq("id", audit.dbId).update({ status: "Completed" }).run();
        for (const it of audit.items) {
          if (it.countedQty !== null) await sb("stock_audit_items").eq("id", it.id).update({ counted_qty: it.countedQty }).run();
        }
      } catch (_e) { notify("Completed locally, but the server update failed.", "error"); }
    }
  }

  const selectedAudit = audits.rows.find((a) => a.id === selected);

  if (selectedAudit) {
    const variances = selectedAudit.items.filter((it) => it.countedQty !== null && it.countedQty !== it.expectedQty);
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setSelected(null)} className="text-[12px] text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-1"><ChevronLeft size={13} /> All audits</button>
            <h3 className="text-[15px] font-semibold text-[#111827]">Audit · {selectedAudit.date}</h3>
          </div>
          {selectedAudit.status === "In Progress" && <button onClick={() => completeAudit(selectedAudit)} className="btn-primary text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg">Complete Audit</button>}
        </div>
        {variances.length > 0 && (
          <div className="bg-[#FEE2E2] rounded-lg p-3">
            <p className="text-[12.5px] font-medium text-[#EF4444]">{variances.length} item{variances.length === 1 ? "" : "s"} with a real variance between recorded and counted stock.</p>
          </div>
        )}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide"><th className="px-4 py-2.5">Item</th><th className="px-4 py-2.5 text-right">Expected</th><th className="px-4 py-2.5 text-right">Counted</th><th className="px-4 py-2.5 text-right">Variance</th></tr></thead>
            <tbody>
              {selectedAudit.items.map((it) => {
                const variance = it.countedQty === null ? null : it.countedQty - it.expectedQty;
                return (
                  <tr key={it.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2.5 text-[#111827]">{it.name} <span className="text-slate-400">({it.sku})</span></td>
                    <td className="px-4 py-2.5 text-right font-mono text-slate-500">{it.expectedQty}</td>
                    <td className="px-4 py-2.5 text-right">
                      {selectedAudit.status === "In Progress" ? (
                        <input type="number" value={it.countedQty ?? ""} onChange={(e) => updateCount(selectedAudit.id, it.id, e.target.value)} className="w-20 text-right bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-[12px]" />
                      ) : <span className="font-mono text-slate-500">{it.countedQty ?? "—"}</span>}
                    </td>
                    <td className={`px-4 py-2.5 text-right font-mono font-medium ${variance === null ? "text-slate-300" : variance === 0 ? "text-[#16A34A]" : "text-[#EF4444]"}`}>{variance === null ? "—" : variance > 0 ? `+${variance}` : variance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Stock Audit</h3>
          <p className="text-[12px] text-slate-500">Real physical counts reconciled against real recorded quantities — variance surfaced per item, not silently trusted forever.</p>
        </div>
        <button onClick={startAudit} className="btn-primary text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Start Audit</button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
        {!audits.loading && audits.rows.length === 0 && <EmptyState icon={ClipboardCheck} title="No audits yet" hint="Start one to freeze today's recorded quantities and reconcile them against a real physical count." actionLabel="Start Audit" onAction={startAudit} />}
        {audits.loading && <p className="text-[12.5px] text-slate-400 text-center py-8">Loading...</p>}
        {audits.rows.map((a) => (
          <button key={a.id} onClick={() => setSelected(a.id)} className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors">
            <div><p className="text-[13px] font-medium text-[#111827]">Audit · {a.date}</p><p className="text-[11px] text-slate-400">{a.items.length} items</p></div>
            <span className={`text-[10.5px] font-medium px-2 py-0.5 rounded-full ${a.status === "Completed" ? "bg-[#16A34A]/10 text-[#16A34A]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>{a.status}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SupplierFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", contactPerson: "", email: "", phone: "", category: "", leadTimeDays: "" });
  const [touched, setTouched] = useState(false);
  const valid = form.name.trim();
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); setTouched(true); if (!valid) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Inventory</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Supplier</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Company name" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Coastal Steel & Hardware Ltd" />
            {touched && !form.name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Name is required.</p>}
          </FormField>
          <FormField label="Contact person"><input className={inputClass} value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="e.g. Anna Kimaro" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email"><input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="sales@company.tz" /></FormField>
            <FormField label="Phone"><input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+255 7XX XXX XXX" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category"><input className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Hardware & Fixtures" /></FormField>
            <FormField label="Lead time (days)"><input type="number" min="0" className={inputClass} value={form.leadTimeDays} onChange={(e) => set("leadTimeDays", e.target.value)} placeholder="0" /></FormField>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Add Supplier</button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------- PROCUREMENT ------------------------------------ */

const PROC_TABS = [
  { id: "orders", label: "Purchase Orders", icon: ClipboardCheck },
  { id: "approvals", label: "Approvals", icon: CheckCircle2 },
  { id: "contracts", label: "Contracts", icon: FileText },
  { id: "payments", label: "Vendor Payments", icon: Banknote },
  { id: "portal", label: "Supplier Portal", icon: Building2 },
];

function Procurement({ inventory, suppliersHook, expensesHook, currentUser, canManage }) {
  const [tab, setTab] = useState("orders");
  const orders = useCompanyTable("procurement_purchase_orders", purchaseOrdersSeed, {
    select: "*,purchase_order_items(*)", order: { col: "order_date", ascending: false }, mapRow: mapPurchaseOrderRow,
  });
  const contracts = useCompanyTable("procurement_contracts", procurementContractsSeed, {
    order: { col: "start_date", ascending: false }, mapRow: mapProcurementContractRow,
  });

  const pendingApproval = orders.rows.filter((o) => o.status === "Pending Approval");
  const readyToPay = orders.rows.filter((o) => o.status === "Received");
  const totalCommitted = orders.rows.filter((o) => !["Draft", "Cancelled"].includes(o.status)).reduce((s, o) => s + poTotal(o.items), 0);

  const PROC_KPIS = [
    { label: "Open Purchase Orders", value: String(orders.rows.filter((o) => !["Paid", "Cancelled"].includes(o.status)).length), delta: `${orders.rows.length} total`, up: true, icon: ClipboardCheck },
    { label: "Pending Approval", value: String(pendingApproval.length), delta: "Needs sign-off", up: false, icon: AlertCircle },
    { label: "Committed Spend", value: `TZS ${money(Math.round(totalCommitted))}k`, delta: "Active POs", up: true, icon: CircleDollarSign },
    { label: "Awaiting Payment", value: String(readyToPay.length), delta: "Received, unpaid", up: false, icon: Banknote },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Procurement</h1>
        <p className="text-[13px] text-slate-500 mt-1">Purchase orders, approvals, contracts, and vendor payments</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {PROC_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          const badge = t.id === "approvals" && pendingApproval.length > 0 ? pendingApproval.length : null;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                isActive ? "bg-white text-[#111827] shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon size={13} /> {t.label}
              {badge && <span className="text-[10px] font-semibold bg-[#F59E0B] text-white rounded-full w-4 h-4 flex items-center justify-center">{badge}</span>}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PROC_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      {tab === "orders" && <PurchaseOrders orders={orders} inventory={inventory} suppliersHook={suppliersHook} />}
      {tab === "approvals" && <Approvals orders={orders} canManage={canManage} currentUser={currentUser} />}
      {tab === "contracts" && <ProcurementContracts contracts={contracts} suppliersHook={suppliersHook} />}
      {tab === "payments" && <VendorPayments orders={orders} expensesHook={expensesHook} />}
      {tab === "portal" && <SupplierPortal suppliersHook={suppliersHook} orders={orders} />}
    </div>
  );
}

/* ------------------------------- PURCHASE ORDERS --------------------------------- */

function PurchaseOrders({ orders, inventory, suppliersHook }) {
  const { rows, setRows, loading } = orders;
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  async function addOrder(form) {
    const items = form.items.filter((it) => it.sku && it.qty > 0);
    const total = poTotal(items);
    const status = total >= PO_APPROVAL_THRESHOLD ? "Pending Approval" : "Approved";
    const draft = {
      id: docId("PO"), supplier: form.supplier, status,
      orderDate: TODAY.toISOString().slice(0, 10), expectedDate: form.expectedDate || null,
      requestedBy: form.requestedBy || "You", items,
    };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(status === "Pending Approval"
      ? `${draft.id} created — TZS ${money(total)}k needs approval before it can proceed`
      : `${draft.id} created and auto-approved (under TZS ${money(PO_APPROVAL_THRESHOLD)}k)`);

    if (IS_CONFIGURED) {
      try {
        const header = await sb("procurement_purchase_orders").insert({
          doc_number: draft.id, supplier: draft.supplier, status, order_date: draft.orderDate,
          expected_date: draft.expectedDate, requested_by: draft.requestedBy,
        }).single().run();
        if (header?.id) {
          await sb("purchase_order_items").insert(
            items.map((it) => ({ purchase_order_id: header.id, item_sku: it.sku, item_name: it.name, qty: it.qty, cost: it.cost }))
          ).run();
          setRows((prev) => prev.map((o) => (o.id === draft.id ? { ...o, dbId: header.id } : o)));
        }
      } catch (_e) { notify("PO created locally, but saving to the server failed.", "error"); }
    }
  }

  async function receiveOrder(order) {
    // Receiving a PO is a real inventory event — the same shared table
    // Sales fulfillment and Manufacturing already write to, just adding
    // stock instead of consuming it.
    inventory.setRows((prev) => prev.map((it) => {
      const line = order.items.find((oi) => oi.sku === it.sku);
      return line ? { ...it, qty: it.qty + line.qty } : it;
    }));
    setRows((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "Received" } : o)));
    setSelected((s) => (s && s.id === order.id ? { ...s, status: "Received" } : s));
    notify(`${order.id} received — stock updated`);

    if (IS_CONFIGURED) {
      try {
        await sb("procurement_purchase_orders").eq("id", order.dbId ?? order.id).update({ status: "Received" }).run();
        for (const it of order.items) {
          const item = inventory.rows.find((i) => i.sku === it.sku);
          const newQty = (item?.qty || 0) + it.qty;
          await sb("inventory_items").eq("sku", it.sku).update({ qty_on_hand: newQty }).run();
          await sb("inventory_stock_movements").insert({ item_id: it.sku, movement: "In", qty: it.qty, reference: `${order.id} received` }).run();
        }
      } catch (_e) { notify("Received locally, but the server update failed.", "error"); }
    }
  }

  async function cancelOrder(id) {
    const o = rows.find((x) => x.id === id);
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, status: "Cancelled" } : x)));
    setSelected(null);
    if (IS_CONFIGURED && o?.dbId) {
      try { await sb("procurement_purchase_orders").eq("id", o.dbId).update({ status: "Cancelled" }).run(); } catch (_e) { notify("Couldn't save the cancellation to the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">

      {/* Procurement Analytics */}
      {rows.length > 0 && (() => {
        const total = rows.reduce((s,o)=>s+(o.items||[]).reduce((si,i)=>si+i.qty*i.cost,0),0);
        const byStatus = ["Pending Approval","Approved","Ordered","Partially Received","Fully Received","Cancelled"].map((s,i)=>({
          name: s.replace(" Approval","").replace("Partially","Part.").replace("Fully",""),
          value: rows.filter(r=>r.status===s).length,
          fill: ["#F59E0B","#2563EB","#7C3AED","#0891B2","#16A34A","#EF4444"][i],
        })).filter(d=>d.value>0);
        const bySupplier = Object.entries(
          rows.reduce((m,o)=>{
            const val=(o.items||[]).reduce((s,i)=>s+i.qty*i.cost,0);
            m[o.supplier]=(m[o.supplier]||0)+val; return m;
          },{})
        ).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,value])=>({
          name: name.length > 16 ? name.slice(0,14)+"…" : name,
          value: Math.round(value/1000),
        }));
        return (
          <div className="space-y-4">
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ["Total POs",String(rows.length),"#111827"],
                ["Total Spend",`TZS ${money(Math.round(total/1000))}k`,"#7C3AED"],
                ["Pending Approval",String(rows.filter(r=>r.status==="Pending Approval").length),"#F59E0B"],
                ["Received",String(rows.filter(r=>r.status==="Fully Received").length),"#16A34A"],
              ].map(([l,v,col])=>(
                <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                  <p className="text-[18px] font-black" style={{color:col}}>{v}</p>
                </div>
              ))}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">PO Status Distribution</h3>
                {byStatus.length===0?<p className="text-slate-400 text-center py-6">No data</p>:(
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={140}>
                      <RPieChart><Pie data={byStatus} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={28}>
                        {byStatus.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Pie><Tooltip formatter={(v,n)=>[v+" orders",n]}/></RPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {byStatus.map(d=>(
                        <div key={d.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[11.5px]"><span className="w-2 h-2 rounded-full" style={{background:d.fill}}/>{d.name}</span>
                          <span className="text-[12.5px] font-black" style={{color:d.fill}}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Top Suppliers by Spend (TZS k)</h3>
                {bySupplier.length===0?<p className="text-slate-400 text-center py-6">No orders yet</p>:(
                  <ResponsiveContainer width="100%" height={140}>
                    <BarChart data={bySupplier} layout="vertical" margin={{left:5,right:20,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                      <XAxis type="number" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                      <YAxis dataKey="name" type="category" tick={{fontSize:10}} axisLine={false} tickLine={false} width={80}/>
                      <Tooltip formatter={(v)=>[`TZS ${money(v)}k`,"Spend"]}/>
                      <Bar dataKey="value" fill="#7C3AED" radius={[0,4,4,0]} maxBarSize={16}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Purchase Order
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[760px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">PO</th><th className="px-4 py-3 font-medium">Supplier</th><th className="px-4 py-3 font-medium">Expected</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium text-right">Value (TZS 000)</th><th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={6} />}
              {!loading && rows.map((o) => (
                <tr key={o.id} onClick={() => setSelected(o)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                  <td className="px-4 py-3 font-mono font-medium text-[#111827]">{o.id}</td>
                  <td className="px-4 py-3 text-slate-700">{o.supplier}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{o.expectedDate || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${PO_STATUS_COLOR[o.status]}14`, color: PO_STATUS_COLOR[o.status] }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PO_STATUS_COLOR[o.status] }} />{o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{money(Math.round(poTotal(o.items)))}</td>
                  <td className="px-4 py-3 text-right"><ChevronRight size={15} className="text-slate-300 inline" /></td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={6}><EmptyState icon={ClipboardCheck} title="No purchase orders yet" hint="Create a PO to order stock from a supplier." actionLabel="New Purchase Order" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <PurchaseOrderPanel
          order={selected}
          onClose={() => setSelected(null)}
          onReceive={() => receiveOrder(selected)}
          onCancel={() => cancelOrder(selected.id)}
        />
      )}
      {showForm && <PurchaseOrderFormPanel inventory={inventory} suppliersHook={suppliersHook} onClose={() => setShowForm(false)} onSubmit={addOrder} />}
    </div>
  );
}

function PurchaseOrderPanel({ order, onClose, onReceive, onCancel }) {
  const total = poTotal(order.items);
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[420px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Purchase Order</p><h2 className="text-[19px] font-semibold text-[#111827] font-mono mt-0.5">{order.id}</h2></div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
          </div>
          <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${PO_STATUS_COLOR[order.status]}14`, color: PO_STATUS_COLOR[order.status] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: PO_STATUS_COLOR[order.status] }} />{order.status}
          </span>
        </div>
        <div className="px-6 py-5 flex-1">
          <div className="mb-5"><p className="text-[11px] text-slate-400 mb-1">Supplier</p><p className="text-[14px] font-medium text-[#111827]">{order.supplier}</p></div>
          <div className="mb-5">
            <p className="text-[11px] text-slate-400 mb-2 uppercase tracking-wide">Items</p>
            <div className="border border-slate-100 rounded-lg overflow-hidden">
              {order.items.map((it, i) => (
                <div key={i} className={`flex items-center justify-between px-3 py-2.5 text-[13px] ${i !== order.items.length - 1 ? "border-b border-slate-50" : ""}`}>
                  <div><p className="text-slate-700">{it.name}</p><p className="text-[11px] text-slate-400 font-mono">{it.qty} × {money(it.cost)}k</p></div>
                  <span className="font-mono text-[#111827]">{money(Math.round(it.qty * it.cost))}k</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[14px] font-semibold text-[#111827] pt-2 border-t border-slate-100">
            <span>Total</span><span className="font-mono">TZS {money(Math.round(total))}k</span>
          </div>
          <div className="mt-5 space-y-2 text-[13px] text-slate-600">
            <div className="flex items-center gap-2.5"><Clock size={14} className="text-slate-400" /> Ordered {order.orderDate}</div>
            <div className="flex items-center gap-2.5"><Users size={14} className="text-slate-400" /> Requested by {order.requestedBy}</div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col gap-2">
          {order.status === "Approved" && (
            <button onClick={onReceive} className="btn-primary text-white text-[13px] font-semibold rounded-lg py-2.5">Mark Received</button>
          )}
          {!["Received", "Paid", "Cancelled"].includes(order.status) && (
            <button onClick={onCancel} className="text-[12px] font-medium text-[#EF4444] border border-[#EF4444]/25 rounded-lg py-2 hover:bg-[#EF4444]/5">Cancel Order</button>
          )}
        </div>
      </div>
    </div>
  );
}

function PurchaseOrderFormPanel({ inventory, suppliersHook, onClose, onSubmit }) {
  const suppliers = suppliersHook.rows.filter((s) => s.status === "Active");
  const [supplier, setSupplier] = useState(suppliers[0]?.name || "");
  const [expectedDate, setExpectedDate] = useState("");
  const [requestedBy, setRequestedBy] = useState("");
  const [items, setItems] = useState([{ sku: inventory.rows[0]?.sku || "", qty: "", cost: "" }]);

  function updateItem(i, key, val) {
    setItems((prev) => prev.map((it, idx) => {
      if (idx !== i) return it;
      const next = { ...it, [key]: val };
      if (key === "sku") {
        const invItem = inventory.rows.find((x) => x.sku === val);
        if (invItem) next.cost = invItem.unitCost;
      }
      return next;
    }));
  }
  function addRow() { setItems((prev) => [...prev, { sku: inventory.rows[0]?.sku || "", qty: "", cost: "" }]); }
  function removeRow(i) { setItems((prev) => prev.filter((_, idx) => idx !== i)); }

  const validItems = items.filter((it) => it.sku && Number(it.qty) > 0);
  const total = validItems.reduce((s, it) => s + Number(it.qty) * Number(it.cost || 0), 0);
  const valid = supplier && validItems.length > 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    onSubmit({
      supplier, expectedDate, requestedBy,
      items: validItems.map((it) => ({ sku: it.sku, name: inventory.rows.find((x) => x.sku === it.sku)?.name || it.sku, qty: Number(it.qty), cost: Number(it.cost) || 0 })),
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Procurement</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Purchase Order</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Supplier" required>
            <select className={inputClass} value={supplier} onChange={(e) => setSupplier(e.target.value)}>
              {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </FormField>

          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-2">Items</p>
            <div className="space-y-2.5">
              {items.map((it, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <select className={`${inputClass} flex-1`} value={it.sku} onChange={(e) => updateItem(i, "sku", e.target.value)}>
                    {inventory.rows.map((inv) => <option key={inv.sku} value={inv.sku}>{inv.name}</option>)}
                  </select>
                  <input type="number" min="0" className={`${inputClass} w-16`} value={it.qty} onChange={(e) => updateItem(i, "qty", e.target.value)} placeholder="Qty" />
                  <input type="number" min="0" className={`${inputClass} w-20`} value={it.cost} onChange={(e) => updateItem(i, "cost", e.target.value)} placeholder="Cost" />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeRow(i)} className="text-slate-300 hover:text-[#EF4444] mt-2.5 shrink-0" aria-label={`Remove line item ${i + 1}`}><X size={14} /></button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addRow} className="text-[12px] font-medium text-[#16A34A] hover:text-[#15803D] mt-2 flex items-center gap-1"><Plus size={12} /> Add item</button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Expected delivery"><input type="date" className={inputClass} value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} /></FormField>
            <FormField label="Requested by"><input className={inputClass} value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} placeholder="Your name" /></FormField>
          </div>

          {total > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 text-[13px]">
              <div className="flex justify-between font-semibold text-[#111827]"><span>Total</span><span className="font-mono">TZS {money(Math.round(total))}k</span></div>
              {total >= PO_APPROVAL_THRESHOLD && (
                <p className="text-[11px] text-[#F59E0B] mt-1.5">Above TZS {money(PO_APPROVAL_THRESHOLD)}k — this PO will require Owner/Admin approval before it can be received.</p>
              )}
            </div>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={!valid} className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5 disabled:opacity-40 disabled:cursor-not-allowed">Create PO</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- APPROVALS ------------------------------------- */

function Approvals({ orders, canManage, currentUser }) {
  const { rows, setRows } = orders;
  const pending = rows.filter((o) => o.status === "Pending Approval");

  async function decide(order, approve) {
    if (!canManage) {
      notify(`Approving purchase orders requires a full-write role — you're viewing as ${currentUser.role} (read-only).`, "error");
      return;
    }
    const next = approve ? "Approved" : "Cancelled";
    // Approvals carry a real digital signature: a WebAuthn assertion —
    // the device own key cryptographically signing a fresh challenge,
    // unlocked by the approver's real fingerprint or Face ID. Cancelling
    // the prompt is declining to sign, so the approval aborts; a device
    // with no sensor proceeds honestly recorded as "unsigned".
    let method = "unsigned";
    if (approve) {
      method = await signWithBiometric(currentUser.name);
      if (method === null) { notify("Signature cancelled — the order was not approved.", "error"); return; }
    }
    setRows((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
    notify(approve ? `${order.id} approved — ${method === "biometric" ? "digitally signed with your fingerprint/Face ID" : "no sensor on this device, recorded as unsigned"}.` : `${order.id} rejected`);
    if (IS_CONFIGURED) {
      try {
        await sb("procurement_purchase_orders").eq("id", order.dbId ?? order.id).update({ status: next }).run();
        if (approve) await sb("approval_signatures").insert({ doc_type: "Purchase Order", doc_ref: order.id, approved_by: currentUser.name, method }).run();
      } catch (_e) { notify("Couldn't save the decision to the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      {!canManage && (
        <div className="flex items-start gap-2.5 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-3">
          <Lock size={15} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#8a670a] leading-relaxed">
            You are viewing as {currentUser.role}. Approving or rejecting purchase orders requires a full-write role — switch roles in Settings to test this.
          </p>
        </div>
      )}

      {pending.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <EmptyState icon={CheckCircle2} title="Nothing waiting on approval" hint={`Purchase orders over TZS ${money(PO_APPROVAL_THRESHOLD)}k land here before they can be received.`} />
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((o) => {
            const total = poTotal(o.items);
            return (
              <div key={o.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-mono font-medium text-[#111827]">{o.id}</p>
                    <p className="text-[13px] text-slate-500">{o.supplier} · requested by {o.requestedBy}</p>
                  </div>
                  <p className="text-[16px] font-mono font-semibold text-[#111827]">TZS {money(Math.round(total))}k</p>
                </div>
                <p className="text-[12px] text-slate-400 mb-3">{o.items.map((it) => `${it.qty}× ${it.name}`).join(", ")}</p>
                <div className="flex gap-2">
                  <button onClick={() => decide(o, false)} disabled={!canManage} className="flex-1 text-[12px] font-medium text-[#EF4444] border border-[#EF4444]/25 rounded-lg py-2 hover:bg-[#EF4444]/5 disabled:opacity-40 disabled:cursor-not-allowed">Reject</button>
                  <button onClick={() => decide(o, true)} disabled={!canManage} className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2 disabled:opacity-40 disabled:cursor-not-allowed">Approve</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- PROCUREMENT CONTRACTS --------------------------------- */

function ProcurementContracts({ contracts, suppliersHook }) {
  const { rows, setRows, loading } = contracts;
  const [showForm, setShowForm] = useState(false);

  async function addContract(form) {
    const draft = { id: docId("PC"), supplier: form.supplier, type: form.type, startDate: form.startDate, endDate: form.endDate || null, value: Number(form.value) || 0, notes: form.notes };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Contract added: ${draft.supplier}`);
    if (IS_CONFIGURED) {
      try {
        await sb("procurement_contracts").insert({
          doc_number: draft.id, supplier: draft.supplier, contract_type: draft.type, start_date: draft.startDate,
          end_date: draft.endDate, value: draft.value, notes: draft.notes,
        }).run();
      } catch (_e) { notify("Contract added locally, but saving to the server failed.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Contract
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[720px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Supplier</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">End Date</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium text-right">Value (TZS 000)</th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={5} />}
              {!loading && rows.map((c) => {
                const status = contractStatus(c.endDate);
                return (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-[#111827]">{c.supplier}</td>
                    <td className="px-4 py-3 text-slate-500">{c.type}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono">{c.endDate || "Open-ended"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${CONTRACT_STATUS_COLOR[status]}14`, color: CONTRACT_STATUS_COLOR[status] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CONTRACT_STATUS_COLOR[status] }} />{status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{money(c.value)}</td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && <tr><td colSpan={5}><EmptyState icon={FileText} title="No contracts yet" hint="Track supplier agreements and renewal dates here." actionLabel="New Contract" onAction={() => setShowForm(true)} /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {showForm && <ContractFormPanel suppliersHook={suppliersHook} onClose={() => setShowForm(false)} onSubmit={addContract} />}
    </div>
  );
}

function ContractFormPanel({ suppliersHook, onClose, onSubmit }) {
  const suppliers = suppliersHook.rows;
  const [form, setForm] = useState({ supplier: suppliers[0]?.name || "", type: CONTRACT_TYPES[0], startDate: TODAY.toISOString().slice(0, 10), endDate: "", value: "", notes: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.supplier) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Procurement</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Contract</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Supplier">
            <select className={inputClass} value={form.supplier} onChange={(e) => set("supplier", e.target.value)}>
              {suppliers.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </FormField>
          <FormField label="Contract type">
            <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start date"><input type="date" className={inputClass} value={form.startDate} onChange={(e) => set("startDate", e.target.value)} /></FormField>
            <FormField label="End date">
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              <p className="text-[11px] text-slate-400 mt-1">Leave blank for open-ended agreements.</p>
            </FormField>
          </div>
          <FormField label="Contract value (TZS 000)"><input type="number" min="0" className={inputClass} value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="0" /></FormField>
          <FormField label="Notes"><textarea className={inputClass} rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Create Contract</button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------------- VENDOR PAYMENTS --------------------------------- */

function VendorPayments({ orders, expensesHook }) {
  const { rows, setRows } = orders;
  const readyToPay = rows.filter((o) => o.status === "Received");
  const paid       = rows.filter((o) => o.status === "Paid");

  async function payOrder(order) {
    const total = poTotal(order.items);
    const expenseDraft = {
      id: docId("EX"), vendor: order.supplier, category: "Inventory Purchases",
      date: TODAY.toISOString().slice(0, 10), dueDate: TODAY.toISOString().slice(0, 10),
      amount: total, status: "Paid", method: "Bank Transfer",
    };
    // The real consequence: paying a vendor creates an actual expense in
    // the shared Finance table — the same one Payroll and Subscriptions
    // already write to — not just a status flip inside Procurement.
    expensesHook.setRows((prev) => [expenseDraft, ...prev]);
    setRows((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "Paid" } : o)));
    notify(`${order.id} paid — TZS ${money(Math.round(total))}k recorded in Finance`);

    if (IS_CONFIGURED) {
      try {
        const header = await sb("finance_expenses").insert({
          vendor: expenseDraft.vendor, category: "Inventory Purchases", expense_date: expenseDraft.date,
          due_date: expenseDraft.dueDate, amount: expenseDraft.amount, status: "Paid", method: "Bank Transfer",
        }).single().run();
        if (header?.id) expensesHook.setRows((prev) => prev.map((e) => (e.id === expenseDraft.id ? { ...e, dbId: header.id } : e)));
        await sb("procurement_purchase_orders").eq("id", order.dbId ?? order.id).update({ status: "Paid" }).run();
      } catch (_e) { notify("Paid locally, but saving to the server failed.", "error"); }
    }
  }

  // Supplier spend breakdown (paid POs)
  const bySupplier = Object.entries(
    paid.reduce((m, o) => { m[o.supplier] = (m[o.supplier] || 0) + poTotal(o.items); return m; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([name, value], i) => ({
      name: name.length > 16 ? name.slice(0, 14) + "…" : name,
      value: Math.round(value / 1000),
      fill: ["#2563EB","#16A34A","#7C3AED","#F59E0B","#EF4444","#0891B2","#EA580C","#64748B"][i % 8],
    }));

  const totalPaid    = paid.reduce((s, o) => s + poTotal(o.items), 0);
  const totalPending = readyToPay.reduce((s, o) => s + poTotal(o.items), 0);
  const avgPO        = paid.length ? Math.round(totalPaid / paid.length) : 0;

  return (
    <div className="space-y-5">
      {/* KPI summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Pending Payment", readyToPay.length,                          "#F59E0B"],
          ["Pending Value",   "TZS "+money(Math.round(totalPending))+"k", "#EF4444"],
          ["Total Paid",      "TZS "+money(Math.round(totalPaid))+"k",    "#16A34A"],
          ["Avg PO Size",     "TZS "+money(Math.round(avgPO))+"k",        "#2563EB"],
        ].map(([l, v, col]) => (
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[18px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Supplier spend chart */}
      {bySupplier.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Spend by Supplier</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={bySupplier} layout="vertical" margin={{left:5,right:24,top:0,bottom:0}}>
              <CartesianGrid vertical={false} stroke="#F3F4F6"/>
              <XAxis type="number" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:11}} axisLine={false} tickLine={false} width={100}/>
              <Tooltip formatter={(v) => ["TZS "+money(v)+"k","Paid"]}/>
              <Bar dataKey="value" radius={[0,5,5,0]}>
                {bySupplier.map((d, i) => <Cell key={i} fill={d.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Ready to pay */}
      <div>
        <h3 className="text-[14px] font-semibold text-[#111827] mb-3">
          Awaiting Payment <span className="ml-2 text-[12px] font-normal text-slate-400">({readyToPay.length} PO{readyToPay.length !== 1 ? "s" : ""} · TZS {money(Math.round(totalPending))}k)</span>
        </h3>
        {readyToPay.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-[13px] text-slate-400">
            No purchase orders awaiting payment right now.
          </div>
        ) : (
          <div className="space-y-2.5">
            {readyToPay.map((o) => {
              const total = poTotal(o.items);
              const urgency = total > 500 ? "#EF4444" : total > 200 ? "#F59E0B" : "#16A34A";
              return (
                <div key={o.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-[12px]" style={{background:urgency}}>
                        {o.supplier?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-semibold text-[13.5px] text-[#111827]">{o.supplier}</p>
                        <p className="text-[11.5px] text-slate-400 font-mono">{o.id} · {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[17px] font-mono font-bold text-[#111827]">TZS {money(Math.round(total))}k</p>
                        <p className="text-[10.5px] text-slate-400">Bank Transfer</p>
                      </div>
                      <button
                        onClick={() => payOrder(o)}
                        className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl shadow-sm"
                        style={{background:"#16A34A"}}
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment history */}
      {paid.length > 0 && (
        <div>
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Payment History <span className="ml-2 text-[12px] font-normal text-slate-400">({paid.length} POs paid)</span></h3>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  {["PO","Supplier","Items","Amount","Status"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {paid.map((o) => (
                    <tr key={o.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-mono font-medium text-[#111827]">{o.id}</td>
                      <td className="px-4 py-3 text-slate-600">{o.supplier}</td>
                      <td className="px-4 py-3 text-slate-400 text-center">{o.items?.length || 0}</td>
                      <td className="px-4 py-3 font-mono font-bold text-[#16A34A]">TZS {money(Math.round(poTotal(o.items)))}k</td>
                      <td className="px-4 py-3"><span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Paid</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ather than a separate record.
function SupplierPortal({ suppliersHook, orders }) {
  const suppliers = suppliersHook.rows;
  const stats = useMemo(() => {
    return suppliers.map((s) => {
      const supplierOrders = orders.rows.filter((o) => o.supplier === s.name);
      const totalSpend = supplierOrders.filter((o) => o.status !== "Cancelled").reduce((sum, o) => sum + poTotal(o.items), 0);
      const openOrders = supplierOrders.filter((o) => !["Paid", "Cancelled"].includes(o.status)).length;
      return { ...s, orderCount: supplierOrders.length, totalSpend, openOrders };
    });
  }, [suppliers, orders.rows]);

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <Building2 size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          An internal view of each supplier relationship — not a separate external login, since this build has no supplier-facing authentication yet.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[14px] font-semibold text-[#111827]">{s.name}</p>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: `${SUPPLIER_STATUS_COLOR[s.status]}14`, color: SUPPLIER_STATUS_COLOR[s.status] }}>{s.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div><p className="text-[10.5px] text-slate-400 mb-0.5">Orders</p><p className="text-[14px] font-mono font-semibold text-[#111827]">{s.orderCount}</p></div>
              <div><p className="text-[10.5px] text-slate-400 mb-0.5">Open</p><p className="text-[14px] font-mono font-semibold text-[#111827]">{s.openOrders}</p></div>
              <div><p className="text-[10.5px] text-slate-400 mb-0.5">Spend</p><p className="text-[14px] font-mono font-semibold text-[#111827]">{money(Math.round(s.totalSpend))}k</p></div>
            </div>
          </div>
        ))}
        {stats.length === 0 && (
          <div className="col-span-full bg-white rounded-xl border border-slate-200/80 shadow-sm">
            <EmptyState icon={Building2} title="No suppliers yet" hint="Add suppliers from Inventory to see their activity here." />
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- FINANCE ----------------------------------- */

const FIN_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "receivables", label: "Receivables", icon: Landmark },
  { id: "expenses", label: "Payables", icon: ClipboardList },
  { id: "ledger", label: "General Ledger", icon: FileText },
  { id: "chart-of-accounts", label: "Chart of Accounts", icon: BookOpen },
  { id: "budgets", label: "Budgets", icon: Target },
  { id: "scan", label: "Scan Document", icon: ScanText },
  { id: "ratios", label: "Financial Ratios", icon: Zap },
  { id: "loans", label: "Loans", icon: Landmark },
  { id: "other-debtors", label: "Other Debtors", icon: UserPlus },
  { id: "other-income", label: "Other Income", icon: Wallet },
  { id: "banking", label: "Banking", icon: Banknote },
  { id: "tax", label: "Tax", icon: Percent },
  { id: "assets", label: "Assets", icon: Package },
];

export default Inventory;
