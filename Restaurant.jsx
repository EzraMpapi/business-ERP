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


function RestaurantModule({ currentUser, company }) {
  const [tab, setTab]       = useState("floor");
  const [kitchenTab, setKitchenTab] = useState("active");
  const [menuCat, setMenuCat]   = useState("All");
  const [activeTable, setActiveTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cart, setCart]         = useState([]);
  const [orderNote, setOrderNote] = useState("");
  const [selectedWaiter, setSelectedWaiter] = useState(RST_WAITERS[0]);
  const [showResvForm, setShowResvForm] = useState(false);
  const [resvForm, setResvForm] = useState({ name:"", phone:"", date:"", time:"", covers:"", table:"", note:"" });

  const tables       = useCompanyTable("rst_tables",       RST_TABLES_SEED,       { mapRow: r => r });
  const menuItems    = useCompanyTable("rst_menu",         RST_MENU_SEED,         { mapRow: r => r });
  const orders       = useCompanyTable("rst_orders",       RST_ORDERS_SEED,       { mapRow: r => r });
  const reservations = useCompanyTable("rst_reservations", RST_RESERVATIONS_SEED, { mapRow: r => r });

  const RST_RED    = "#B91C1C";
  const RST_ORANGE = "#C2410C";
  const RST_GREEN  = "#16A34A";

  const TABS = [
    { id:"floor",    label:"Table Floor",    icon: Layers },
    { id:"order",    label:"Take Order",     icon: UtensilsCrossed },
    { id:"kitchen",  label:"Kitchen Display",icon: ChefHat },
    { id:"menu",     label:"Menu Manager",   icon: BookOpen },
    { id:"reservations",label:"Reservations",icon: CalendarDays },
    { id:"reports",  label:"Reports",        icon: BarChart3 },
  ];

  // Analytics
  const todayOrders  = orders.rows.filter(o=>o.status!=="Cancelled");
  const todayRevenue = todayOrders.filter(o=>o.status==="Paid").reduce((s,o)=>s+o.total,0);
  const pendingOrders= orders.rows.filter(o=>o.status==="Preparing"||o.status==="Ready");
  const occupiedTbls = tables.rows.filter(t=>t.status==="Occupied").length;
  const occupancy    = tables.rows.length>0?(occupiedTbls/tables.rows.length*100).toFixed(0):0;

  const tableStatusStyle = {
    Available:{ bg:"#F0FDF4", border:"#86EFAC",  dot:"#16A34A", text:"#15803D" },
    Occupied: { bg:"#FEF2F2", border:"#FCA5A5",  dot:"#EF4444", text:"#B91C1C" },
    Reserved: { bg:"#EFF6FF", border:"#93C5FD",  dot:"#3B82F6", text:"#1D4ED8" },
    Cleaning: { bg:"#FFFBEB", border:"#FCD34D",  dot:"#F59E0B", text:"#B45309" },
  };

  function addToCart(item) {
    setCart(prev => {
      const ex = prev.find(c=>c.id===item.id);
      if (ex) return prev.map(c=>c.id===item.id?{...c,qty:c.qty+1}:c);
      return [...prev, {...item, qty:1}];
    });
  }
  function removeFromCart(id) { setCart(p=>p.filter(c=>c.id!==id)); }
  function updateQty(id, delta) {
    setCart(p=>p.map(c=>c.id===id?{...c,qty:Math.max(1,c.qty+delta)}:c).filter(c=>c.qty>0));
  }

  const cartSubtotal = cart.reduce((s,c)=>s+c.price*c.qty,0);
  const cartTax      = Math.round(cartSubtotal * 0.1);
  const cartTotal    = cartSubtotal + cartTax;

  async function placeOrder() {
    if (!activeTable || cart.length===0) { notify("Select a table and add items","error"); return; }
    const tbl = tables.rows.find(t=>t.id===activeTable);
    const row = {
      id: docId("ORD"), table: tbl?.number||activeTable,
      waiter: selectedWaiter,
      items: cart.map(c=>({id:c.id,name:c.name,qty:c.qty,price:c.price})),
      subtotal: cartSubtotal, tax: cartTax, total: cartTotal,
      paid: 0, status:"Preparing", timeIn: new Date().toTimeString().slice(0,5), note: orderNote, kitchen:"In Progress"
    };
    orders.setRows(p=>[row,...p]);
    tables.setRows(p=>p.map(t=>t.id===activeTable?{...t,status:"Occupied",waiter:selectedWaiter,currentOrder:row.id}:t));
    setCart([]); setOrderNote(""); setActiveTable(null);
    notify("Order "+row.id+" placed for "+tbl?.number+" — "+cart.length+" items");
    logAudit("Order: "+row.id, "Restaurant", currentUser?.name||"Waiter", "Table "+tbl?.number+", TZS "+money(cartTotal)+"k");
  }

  async function updateOrderStatus(orderId, status) {
    orders.setRows(p=>p.map(o=>o.id===orderId?{...o,status,kitchen:status==="Ready"?"Ready":status==="Paid"?"Served":"In Progress"}:o));
    if (status==="Paid") {
      const ord = orders.rows.find(o=>o.id===orderId);
      if (ord) {
        orders.setRows(p=>p.map(o=>o.id===orderId?{...o,paid:o.total}:o));
        tables.setRows(p=>p.map(t=>t.number===ord.table?{...t,status:"Cleaning",waiter:"",currentOrder:null}:t));
      }
    }
    notify("Order "+orderId+" → "+status);
  }

  async function addReservation() {
    if (!resvForm.name||!resvForm.date||!resvForm.time) return;
    const row = {...resvForm, id:docId("RES"), covers:Number(resvForm.covers)||2, status:"Pending"};
    reservations.setRows(p=>[row,...p]);
    if (resvForm.table) {
      const tblId = tables.rows.find(t=>t.number===resvForm.table)?.id;
      if (tblId) tables.setRows(p=>p.map(t=>t.id===tblId?{...t,status:"Reserved"}:t));
    }
    setResvForm({name:"",phone:"",date:"",time:"",covers:"",table:"",note:""});
    setShowResvForm(false);
    notify("Reservation for "+resvForm.name+" on "+resvForm.date);
  }

  const filteredMenu = menuCat==="All" ? menuItems.rows : menuItems.rows.filter(m=>m.category===menuCat);

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div className="rounded-2xl px-6 py-5 relative overflow-hidden" style={{background:"linear-gradient(135deg,#7F1D1D 0%,#B91C1C 40%,#C2410C 100%)"}}>
        <div className="absolute right-6 top-3 opacity-10 text-[80px]">🍽️</div>
        <div className="relative flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1"><UtensilsCrossed size={22} className="text-white"/><h1 className="text-[20px] font-bold text-white">{company?.name||"Restaurant"} Management</h1></div>
            <p className="text-[12px]" style={{color:"rgba(255,255,255,.6)"}}>Tables · Orders · Kitchen · Menu · Reservations · Billing</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[["Tables",tables.rows.length],["Occupied",occupiedTbls+" ("+occupancy+"%)"],["Active Orders",pendingOrders.length],["Revenue",TZS_FMT(todayRevenue)]].map(([l,v])=>(
              <div key={l} className="text-center rounded-xl px-4 py-2" style={{background:"rgba(255,255,255,.12)"}}>
                <p className="text-[16px] font-black text-white">{v}</p>
                <p className="text-[10px] text-white/55">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-0.5 bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto">
        {TABS.map(t=>{const I=t.icon;return(
          <button key={t.id} onClick={()=>setTab(t.id)} className={"flex items-center gap-1 px-3 py-2 rounded-lg text-[11.5px] font-medium transition-all whitespace-nowrap "+(tab===t.id?"text-white shadow-sm":"text-slate-500 hover:bg-slate-50")} style={{background:tab===t.id?RST_RED:"transparent"}}>
            <I size={12}/>{t.label}
            {t.id==="kitchen"&&pendingOrders.length>0&&<span className="ml-0.5 bg-yellow-400 text-yellow-900 text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pendingOrders.length}</span>}
          </button>
        );})}
      </div>

      {/* TABLE FLOOR */}
      {tab==="floor" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries({Available:"#16A34A",Occupied:"#EF4444",Reserved:"#3B82F6",Cleaning:"#F59E0B"}).map(([s,col])=>{
              const n=tables.rows.filter(t=>t.status===s).length;
              return <div key={s} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center"><p className="text-[22px] font-bold" style={{color:col}}>{n}</p><p className="text-[11.5px] text-slate-400 mt-0.5">{s}</p></div>;
            })}
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <p className="text-[13.5px] font-semibold text-[#111827] mb-4">Restaurant Floor Plan</p>
            {TABLE_ZONES.map(zone=>{
              const zoneTables = tables.rows.filter(t=>t.zone===zone);
              if (!zoneTables.length) return null;
              return (
                <div key={zone} className="mb-5 last:mb-0">
                  <p className="text-[11.5px] font-semibold text-slate-400 uppercase tracking-wide mb-2.5">{zone}</p>
                  <div className="flex flex-wrap gap-3">
                    {zoneTables.map(t=>{
                      const s = tableStatusStyle[t.status] || tableStatusStyle.Available;
                      const ord = t.currentOrder ? orders.rows.find(o=>o.id===t.currentOrder) : null;
                      return (
                        <div key={t.id} onClick={()=>{setActiveTable(t.id);setTab("order");}} className="w-36 rounded-2xl p-3 cursor-pointer hover:shadow-lg transition-all border-2" style={{background:s.bg,borderColor:s.border}}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{background:s.dot}}/><span className="text-[14px] font-black" style={{color:s.text}}>{t.number}</span></div>
                            <span className="text-[10px] font-medium text-slate-400">{t.seats} seats</span>
                          </div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide" style={{color:s.text}}>{t.status}</p>
                          {t.waiter&&<p className="text-[10px] text-slate-500 truncate mt-0.5">{t.waiter}</p>}
                          {ord&&<p className="text-[11px] font-bold mt-1.5" style={{color:s.text}}>TZS {money(ord.total)}k</p>}
                          {t.status==="Cleaning"&&<button onClick={e=>{e.stopPropagation();tables.setRows(p=>p.map(x=>x.id===t.id?{...x,status:"Available"}:x));notify("Table "+t.number+" ready");}} className="mt-2 w-full text-[10px] font-bold py-1 rounded-lg bg-white border" style={{color:s.text,borderColor:s.border}}>Mark Ready</button>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAKE ORDER */}
      {tab==="order" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: Menu */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1 overflow-x-auto">
                {["All",...MENU_CATEGORIES].map(cat=>(
                  <button key={cat} onClick={()=>setMenuCat(cat)} className={"px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all "+(menuCat===cat?"text-white":"text-slate-500 bg-white border border-slate-200 hover:border-red-300")} style={{background:menuCat===cat?RST_RED:"white"}}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredMenu.map(item=>(
                <div key={item.id} onClick={()=>item.available&&addToCart(item)} className={"bg-white rounded-xl border shadow-sm p-3 cursor-pointer transition-all "+(item.available?"hover:border-red-300 hover:shadow-md":"opacity-50 cursor-not-allowed")} style={{borderColor:cart.find(c=>c.id===item.id)?"#EF4444":"#E5E7EB"}}>
                  <div className="text-[28px] mb-2 text-center">{item.image}</div>
                  <p className="text-[12.5px] font-semibold text-[#111827] leading-tight">{item.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[13px] font-bold" style={{color:RST_RED}}>{TZS_FMT(item.price)}</p>
                    {item.popular&&<span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700">★ Popular</span>}
                  </div>
                  {!item.available&&<p className="text-[10px] text-red-400 font-semibold mt-1">Unavailable</p>}
                  {cart.find(c=>c.id===item.id)&&<div className="mt-1.5 bg-red-600 text-white text-[10px] font-bold text-center py-0.5 rounded-lg">In Order ({cart.find(c=>c.id===item.id).qty})</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Order Ticket */}
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100" style={{background:RST_RED}}>
                <p className="text-[14px] font-bold text-white">Order Ticket</p>
                <div className="flex gap-2 mt-2">
                  <select className="flex-1 bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1.5 text-[11.5px]" value={activeTable||""} onChange={e=>setActiveTable(e.target.value)}>
                    <option value="">Select Table</option>
                    {tables.rows.filter(t=>t.status==="Available"||t.status===activeTable).map(t=><option key={t.id} value={t.id}>{t.number} — {t.seats} seats ({t.zone})</option>)}
                  </select>
                  <select className="flex-1 bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1.5 text-[11.5px]" value={selectedWaiter} onChange={e=>setSelectedWaiter(e.target.value)}>
                    {RST_WAITERS.map(w=><option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-3 min-h-[200px]">
                {cart.length===0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                    <UtensilsCrossed size={32}/>
                    <p className="text-[12px] mt-2">Tap menu items to add</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map(item=>(
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="text-[11.5px]">{item.image}</span>
                        <div className="flex-1 min-w-0"><p className="text-[12px] font-medium text-[#111827] truncate">{item.name}</p><p className="text-[11px] text-slate-400">{TZS_FMT(item.price)}</p></div>
                        <div className="flex items-center gap-1">
                          <button onClick={()=>updateQty(item.id,-1)} className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[14px] font-bold hover:bg-red-100 hover:text-red-600">−</button>
                          <span className="text-[12.5px] font-bold w-5 text-center">{item.qty}</span>
                          <button onClick={()=>updateQty(item.id,1)} className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[14px] font-bold hover:bg-green-100 hover:text-green-600">+</button>
                        </div>
                        <span className="text-[12px] font-bold text-[#111827] w-16 text-right">{TZS_FMT(item.price*item.qty)}</span>
                        <button onClick={()=>removeFromCart(item.id)} className="text-slate-300 hover:text-red-500"><X size={13}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {cart.length>0&&(
                <div className="border-t border-slate-100 p-3 space-y-2">
                  <input className={inputClass+" text-[12px]"} value={orderNote} onChange={e=>setOrderNote(e.target.value)} placeholder="Special instructions (optional)..."/>
                  <div className="space-y-1 text-[12.5px]">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{TZS_FMT(cartSubtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tax (10%)</span><span>{TZS_FMT(cartTax)}</span></div>
                    <div className="flex justify-between font-bold text-[14px] border-t border-slate-100 pt-1.5"><span>Total</span><span style={{color:RST_RED}}>{TZS_FMT(cartTotal)}</span></div>
                  </div>
                  <button onClick={placeOrder} className="w-full py-3 rounded-xl text-[13.5px] font-bold text-white" style={{background:RST_RED}}>
                    🍽️ Send to Kitchen
                  </button>
                  <button onClick={()=>setCart([])} className="w-full py-2 rounded-xl text-[12px] text-slate-500 border border-slate-200">Clear Order</button>
                </div>
              )}
            </div>

            {/* Active orders summary */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[13px] font-semibold text-[#111827] mb-3">Active Orders</p>
              <div className="space-y-2">
                {pendingOrders.length===0?<p className="text-slate-400 text-[12px] text-center py-2">No active orders</p>:pendingOrders.map(o=>(
                  <div key={o.id} className="p-2.5 rounded-lg border border-slate-100">
                    <div className="flex justify-between items-center">
                      <div><p className="text-[12.5px] font-bold text-[#111827]">Table {o.table}</p><p className="text-[11px] text-slate-400">{o.items.length} items · {o.timeIn}</p></div>
                      <div className="flex gap-1">
                        {o.status==="Preparing"&&<button onClick={()=>updateOrderStatus(o.id,"Ready")} className="text-[10.5px] font-bold text-white px-2 py-1 rounded-lg bg-yellow-500">Ready</button>}
                        {o.status==="Ready"&&<button onClick={()=>updateOrderStatus(o.id,"Paid")} className="text-[10.5px] font-bold text-white px-2 py-1 rounded-lg bg-green-600">Bill & Pay</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KITCHEN DISPLAY */}
      {tab==="kitchen" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[["active","Active Orders","#B91C1C"],["ready","Ready to Serve","#16A34A"],["all","All Today","#2563EB"]].map(([id,label,col])=>(
              <button key={id} onClick={()=>setKitchenTab(id)} className="px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all" style={{background:kitchenTab===id?col:"white",color:kitchenTab===id?"white":col,border:`1.5px solid ${col}`}}>{label}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orders.rows.filter(o=>{
              if(kitchenTab==="active") return o.status==="Preparing";
              if(kitchenTab==="ready") return o.status==="Ready";
              return o.status!=="Cancelled";
            }).map(o=>{
              const isReady=o.status==="Ready", isPreparing=o.status==="Preparing";
              return(
                <div key={o.id} className="bg-white rounded-2xl border-2 shadow-md overflow-hidden" style={{borderColor:isReady?"#16A34A":isPreparing?"#F59E0B":"#E5E7EB"}}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{background:isReady?"#16A34A":isPreparing?"#F59E0B":"#F3F4F6"}}>
                    <div className="flex items-center gap-2">
                      <span className="text-[22px] font-black text-white">{o.table}</span>
                      <div><p className="text-[11px] text-white/80">{o.waiter}</p><p className="text-[11px] text-white/70">{o.timeIn}</p></div>
                    </div>
                    <div className="text-right"><p className="text-[12px] font-bold text-white">{isReady?"✓ READY":isPreparing?"⏳ COOKING":"✅ DONE"}</p><p className="text-[10px] text-white/70">{o.id}</p></div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2.5 mb-4">
                      {o.items.map((item,i)=>(
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-[22px]">{menuItems.rows.find(m=>m.id===item.id)?.image||"🍽️"}</span>
                          <div className="flex-1"><p className="text-[13.5px] font-semibold text-[#111827]">{item.name}</p>{o.note&&i===0&&<p className="text-[11px] text-orange-500 font-medium">📝 {o.note}</p>}</div>
                          <span className="text-[20px] font-black" style={{color:isPreparing?"#F59E0B":"#16A34A"}}>×{item.qty}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {isPreparing&&<button onClick={()=>updateOrderStatus(o.id,"Ready")} className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold text-white bg-green-600">✓ Mark Ready</button>}
                      {isReady&&<button onClick={()=>updateOrderStatus(o.id,"Paid")} className="flex-1 py-2.5 rounded-xl text-[12.5px] font-bold text-white" style={{background:RST_RED}}>Bill & Pay</button>}
                    </div>
                  </div>
                </div>
              );
            })}
            {orders.rows.filter(o=>kitchenTab==="active"?o.status==="Preparing":kitchenTab==="ready"?o.status==="Ready":o.status!=="Cancelled").length===0&&(
              <div className="col-span-full text-center py-16 text-slate-300"><ChefHat size={40} className="mx-auto mb-3"/><p className="text-[15px]">No {kitchenTab==="active"?"active orders":kitchenTab==="ready"?"orders ready":"orders"}</p></div>
            )}
          </div>
        </div>
      )}

      {/* MENU MANAGER */}
      {tab==="menu" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[["Menu Items",menuItems.rows.length,"#B91C1C"],["Available",menuItems.rows.filter(m=>m.available).length,"#16A34A"],["Popular",menuItems.rows.filter(m=>m.popular).length,"#F59E0B"],["Categories",MENU_CATEGORIES.length,"#7C3AED"]].map(([l,v,col])=>(
              <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p><p className="text-[22px] font-bold" style={{color:col}}>{v}</p></div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"><p className="text-[13.5px] font-semibold text-[#111827]">Menu Items</p><button onClick={()=>notify("Add menu item")} className="flex items-center gap-1 text-[12px] font-semibold text-white px-3 py-2 rounded-xl" style={{background:RST_RED}}><Plus size={12}/>Add Item</button></div>
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50">{["","Item","Category","Price","Cost","Margin","Prep","Popular","Available"].map(h=><th key={h} className="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
              <tbody>{menuItems.rows.map(item=>{
                const margin=item.price>0?((item.price-item.cost)/item.price*100).toFixed(0):0;
                return(
                  <tr key={item.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-3 py-3 text-[20px]">{item.image}</td>
                    <td className="px-3 py-3"><p className="font-medium text-[#111827]">{item.name}</p><p className="text-[11px] text-slate-400 max-w-[160px] truncate">{item.description}</p></td>
                    <td className="px-3 py-3"><span className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full" style={{background:RST_RED+"15",color:RST_RED}}>{item.category}</span></td>
                    <td className="px-3 py-3 font-bold" style={{color:RST_RED}}>{TZS_FMT(item.price)}</td>
                    <td className="px-3 py-3 text-slate-400">{TZS_FMT(item.cost)}</td>
                    <td className="px-3 py-3 font-bold" style={{color:margin>50?"#16A34A":margin>30?"#F59E0B":"#EF4444"}}>{margin}%</td>
                    <td className="px-3 py-3 text-slate-500">{item.prepTime}min</td>
                    <td className="px-3 py-3">{item.popular?<span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">★ Yes</span>:<span className="text-slate-300 text-[11px]">—</span>}</td>
                    <td className="px-3 py-3">
                      <button onClick={()=>menuItems.setRows(p=>p.map(m=>m.id===item.id?{...m,available:!m.available}:m))} className={"text-[10.5px] font-bold px-2 py-0.5 rounded-full "+(item.available?"bg-green-50 text-green-600":"bg-red-50 text-red-500")}>{item.available?"Available":"Unavail."}</button>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* RESERVATIONS */}
      {tab==="reservations" && (
        <div className="space-y-3">
          {!showResvForm&&<div className="flex justify-end"><button onClick={()=>setShowResvForm(true)} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:RST_RED}}><Plus size={13}/>New Reservation</button></div>}
          {showResvForm&&(
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-3">
              <p className="text-[14px] font-semibold text-[#111827]">New Reservation</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <FormField label="Guest Name *"><input className={inputClass} value={resvForm.name} onChange={e=>setResvForm({...resvForm,name:e.target.value})}/></FormField>
                <FormField label="Phone"><input className={inputClass} value={resvForm.phone} onChange={e=>setResvForm({...resvForm,phone:e.target.value})}/></FormField>
                <FormField label="Date *"><input type="date" className={inputClass} value={resvForm.date} onChange={e=>setResvForm({...resvForm,date:e.target.value})}/></FormField>
                <FormField label="Time *"><input type="time" className={inputClass} value={resvForm.time} onChange={e=>setResvForm({...resvForm,time:e.target.value})}/></FormField>
                <FormField label="Covers (guests)"><input type="number" min="1" className={inputClass} value={resvForm.covers} onChange={e=>setResvForm({...resvForm,covers:e.target.value})}/></FormField>
                <FormField label="Table"><select className={inputClass} value={resvForm.table} onChange={e=>setResvForm({...resvForm,table:e.target.value})}><option value="">Select table...</option>{tables.rows.filter(t=>t.status==="Available").map(t=><option key={t.id} value={t.number}>{t.number} — {t.seats} seats ({t.zone})</option>)}</select></FormField>
                <FormField label="Special Note" cls="col-span-2"><input className={inputClass} value={resvForm.note} onChange={e=>setResvForm({...resvForm,note:e.target.value})} placeholder="Birthday, Anniversary, Dietary requirements..."/></FormField>
              </div>
              <div className="flex gap-2"><button onClick={addReservation} className="text-[12.5px] font-semibold text-white px-5 py-2.5 rounded-xl" style={{background:RST_RED}}>Confirm Reservation</button><button onClick={()=>setShowResvForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button></div>
            </div>
          )}
          <div className="space-y-3">
            {reservations.rows.map(r=>{
              const sty={Confirmed:["#DCFCE7","#16A34A"],Pending:["#FEF3C7","#D97706"],Cancelled:["#FEE2E2","#EF4444"]}[r.status]||["#F3F4F6","#6B7280"];
              return(
                <div key={r.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex items-center gap-4 flex-wrap">
                  <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0" style={{background:RST_RED+"15"}}>
                    <p className="text-[10.5px] font-bold text-red-700">{r.date?.slice(5,7)}/{r.date?.slice(8,10)}</p>
                    <p className="text-[14px] font-black text-red-700">{r.time}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-[#111827]">{r.name}</p>
                    <p className="text-[12px] text-slate-400">{r.covers} covers · Table {r.table||"TBA"} · {r.phone}</p>
                    {r.note&&<p className="text-[12px] text-orange-500 font-medium mt-0.5">📝 {r.note}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:sty[0],color:sty[1]}}>{r.status}</span>
                    {r.status==="Pending"&&<button onClick={()=>reservations.setRows(p=>p.map(x=>x.id===r.id?{...x,status:"Confirmed"}:x))} className="text-[11px] font-bold text-white px-2.5 py-1 rounded-lg" style={{background:RST_RED}}>Confirm</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REPORTS */}
      {tab==="reports" && (
        <div className="space-y-4">
          {/* Export bar */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-[12.5px] text-slate-500">Today: {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</p>
            <div className="flex gap-2">
              <button onClick={()=>downloadCSV("restaurant-orders",orders.rows.map(o=>({
                ID:o.id,Table:o.table||"—",Items:o.items?.map(i=>`${i.qty}×${i.name}`).join("; ")||"",
                Total_k:Math.round(o.items?.reduce((s,i)=>s+(i.price||0)*i.qty,0)||0),
                Status:o.status||"",Time:o.time||"",Server:o.server||"",
              })),[{key:"ID",label:"Order ID"},{key:"Table",label:"Table"},{key:"Items",label:"Items"},
                 {key:"Total_k",label:"Total (TZS k)"},{key:"Status",label:"Status"},{key:"Time",label:"Time"},{key:"Server",label:"Server"}])}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#16A34A] border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-1.5 rounded-lg">
                <Download size={12}/> CSV
              </button>
              <button onClick={()=>{
                const co=window.__smartManagerCompany||{};
                const top=menuItems.rows.map(mi=>{
                  const sold=orders.rows.flatMap(o=>o.items||[]).filter(i=>i.id===mi.id).reduce((s,i)=>s+i.qty,0);
                  const rev=orders.rows.flatMap(o=>o.items||[]).filter(i=>i.id===mi.id).reduce((s,i)=>s+(i.price||0)*i.qty,0);
                  return {name:mi.name,sold,rev};
                }).filter(m=>m.sold>0).sort((a,b)=>b.rev-a.rev).slice(0,10);
                printReport("Restaurant Daily Report",`
                  <div class="kpi-grid">
                    <div class="kpi"><div class="kpi-label">Orders Today</div><div class="kpi-value" style="color:#B91C1C">${todayOrders.length}</div></div>
                    <div class="kpi"><div class="kpi-label">Revenue</div><div class="kpi-value" style="color:#16A34A">${TZS_FMT(todayRevenue)}</div></div>
                    <div class="kpi"><div class="kpi-label">Avg Order</div><div class="kpi-value">${TZS_FMT(todayOrders.length>0?todayRevenue/Math.max(todayOrders.filter(o=>o.status==="Paid").length,1):0)}</div></div>
                    <div class="kpi"><div class="kpi-label">Tables Served</div><div class="kpi-value" style="color:#7C3AED">${new Set(todayOrders.map(o=>o.table)).size}</div></div>
                  </div>
                  <table><thead><tr><th>Item</th><th class="r">Sold</th><th class="r">Revenue</th></tr></thead>
                  <tbody>${top.map((m,i)=>`<tr style="background:${i%2===0?"white":"#F8FAFB"}"><td class="bold">${m.name}</td><td class="r">${m.sold}×</td><td class="r">${TZS_FMT(m.rev)}</td></tr>`).join("")}</tbody></table>`,co);
              }} className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-[#B91C1C] px-3 py-1.5 rounded-lg">
                <Printer size={12}/> Daily Report
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[["Total Orders",todayOrders.length,"#B91C1C"],["Revenue",TZS_FMT(todayRevenue),"#16A34A"],["Avg Order Value",TZS_FMT(todayOrders.length>0?todayRevenue/Math.max(todayOrders.filter(o=>o.status==="Paid").length,1):0),"#2563EB"],["Tables Served",new Set(todayOrders.map(o=>o.table)).size,"#7C3AED"]].map(([l,v,col])=>(
              <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p><p className="text-[18px] font-bold" style={{color:col}}>{v}</p></div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <p className="text-[13.5px] font-semibold text-[#111827] mb-3">Best Selling Items</p>
            {menuItems.rows.map(m=>{
              const sold=orders.rows.flatMap(o=>o.items).filter(i=>i.id===m.id).reduce((s,i)=>s+i.qty,0);
              const rev=orders.rows.flatMap(o=>o.items).filter(i=>i.id===m.id).reduce((s,i)=>s+i.price*i.qty,0);
              if(!sold)return null;
              const maxSold=Math.max(...menuItems.rows.map(mi=>orders.rows.flatMap(o=>o.items).filter(i=>i.id===mi.id).reduce((s,i)=>s+i.qty,0)));
              return(
                <div key={m.id} className="flex items-center gap-3 mb-2.5">
                  <span className="text-[18px] shrink-0">{m.image}</span>
                  <span className="text-[12.5px] text-slate-700 w-40 shrink-0 truncate">{m.name}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:(sold/maxSold*100)+"%",background:RST_RED}}/></div>
                  <span className="text-[12px] font-bold text-slate-700 w-8 text-right">{sold}×</span>
                  <span className="text-[12px] font-mono font-bold w-20 text-right" style={{color:RST_RED}}>{TZS_FMT(rev)}</span>
                </div>
              );
            }).filter(Boolean)}
          </div>

          {/* Revenue Chart — Category Breakdown */}
          {(() => {
            const catRev = menuItems.rows.reduce((m,item)=>{
              const earned = orders.rows.flatMap(o=>o.items).filter(i=>i.id===item.id).reduce((s,i)=>s+i.price*i.qty,0);
              if (!earned) return m;
              m[item.category] = (m[item.category]||0) + earned;
              return m;
            },{});
            const catData = Object.entries(catRev).sort((a,b)=>b[1]-a[1]).map(([name,value],i)=>({
              name, value:Math.round(value/1000),
              fill:["#B91C1C","#C2410C","#16A34A","#2563EB","#7C3AED"][i%5],
            }));
            if (!catData.length) return null;
            return (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                  <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Revenue by Category (TZS k)</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={catData} margin={{left:0,right:10,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                      <XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={(v)=>[`TZS ${money(v)}k`,"Revenue"]}/>
                      <Bar dataKey="value" radius={[4,4,0,0]} maxBarSize={40}>
                        {catData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                  <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Category Mix</h3>
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="60%" height={160}>
                      <RPieChart>
                        <Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                          {catData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                        </Pie>
                        <Tooltip formatter={(v)=>[`TZS ${money(v)}k`,"Revenue"]}/>
                      </RPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {catData.map(d=>(
                        <div key={d.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[12px]">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:d.fill}}/>
                            {d.name}
                          </span>
                          <span className="text-[12px] font-bold text-slate-700">TZS {money(d.value)}k</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Print bill button */}
          {activeTable && (() => {
            const tblOrder = orders.rows.find(o=>o.tableId===activeTable&&o.status!=="Paid"&&o.status!=="Cancelled");
            if (!tblOrder) return null;
            return (
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-bold text-[#B91C1C]">Active order on Table {tables.rows.find(t=>t.id===activeTable)?.number}</p>
                  <p className="text-[11.5px] text-[#991B1B]">TZS {TZS_FMT(tblOrder.total)} · {tblOrder.items?.length} items</p>
                </div>
                <button
                  onClick={()=>{
                    const co=window.__smartManagerCompany||{};
                    const tbl=tables.rows.find(t=>t.id===activeTable);
                    const win=window.open("","_blank","width=420,height=640");
                    if (!win) return;
                    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Bill</title><style>
                      *{margin:0;padding:0;box-sizing:border-box}body{font-family:monospace;font-size:13px;padding:16px;max-width:300px;margin:0 auto}
                      h2{font-size:16px;font-weight:bold;text-align:center;margin-bottom:4px}.center{text-align:center}.divider{border-top:1px dashed #999;margin:8px 0}
                      .row{display:flex;justify-content:space-between;margin:3px 0}.total{font-weight:bold;font-size:15px}.btn{display:block;width:100%;padding:10px;background:#B91C1C;color:white;border:none;font-family:monospace;font-size:13px;cursor:pointer;margin-top:12px;border-radius:8px}
                      @media print{.btn{display:none!important}}
                    </style></head><body>
                      <h2>${co.name||"Restaurant"}</h2>
                      <div class="center" style="font-size:11px;color:#666">${co.address||""} · ${co.phone||""}</div>
                      <div class="divider"></div>
                      <div class="row"><span>Table:</span><span>${tbl?.number||""}</span></div>
                      <div class="row"><span>Waiter:</span><span>${tblOrder.waiter||""}</span></div>
                      <div class="row"><span>Date:</span><span>${new Date().toLocaleDateString()}</span></div>
                      <div class="divider"></div>
                      ${(tblOrder.items||[]).map(it=>`<div class="row"><span>${it.name} ×${it.qty}</span><span>${TZS_FMT??"TZS "+(it.price*it.qty/1000).toFixed(0)+"k"}</span></div>`).join("")}
                      <div class="divider"></div>
                      <div class="row"><span>Subtotal</span><span>TZS ${((tblOrder.total||0)/1000/1.1).toFixed(0)}k</span></div>
                      <div class="row"><span>Tax (10%)</span><span>TZS ${((tblOrder.total||0)/1000*0.1/1.1).toFixed(0)}k</span></div>
                      <div class="divider"></div>
                      <div class="row total"><span>TOTAL</span><span>TZS ${((tblOrder.total||0)/1000).toFixed(0)}k</span></div>
                      <div class="divider"></div>
                      <div class="center" style="font-size:11px;margin-top:8px">Thank you for dining with us!</div>
                      <button class="btn" onclick="window.print()">Print Bill</button>
                    </body></html>`);
                    win.document.close();
                  }}
                  className="flex items-center gap-1.5 text-[12.5px] font-bold text-white px-4 py-2 rounded-xl" style={{background:"#B91C1C"}}>
                  <Printer size={13}/> Print Bill
                </button>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── INVITE CODE FORM (inline in HR) ───────────────────── */
function InviteCodeForm({ onGenerate }) {
  const [dept, setDept] = useState(DEPARTMENTS[0]);
  const [role, setRole] = useState("");
  return (
    <>
      <div>
        <label className="text-[11px] font-bold text-[#5B21B6] uppercase tracking-wide block mb-1">Department</label>
        <select className={inputClass} value={dept} onChange={e=>setDept(e.target.value)}>
          {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
        </select>
      </div>
      <div>
        <label className="text-[11px] font-bold text-[#5B21B6] uppercase tracking-wide block mb-1">Role / Job Title</label>
        <input className={inputClass} value={role} onChange={e=>setRole(e.target.value)} placeholder="e.g. Sales Executive"/>
      </div>
      <div className="col-span-2">
        <button onClick={()=>onGenerate(dept, role||"Employee")}
          className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-white py-2.5 rounded-xl bg-[#7C3AED]">
          <QrCode size={14}/> Generate Invite Code
        </button>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EMPLOYEE PORTAL
   A self-service portal for individual employees:
   ─ Join via HR-generated invite code
   ─ Personal dashboard with greeting + today's snapshot
   ─ Clock In / Clock Out (with timestamp + GPS optional)
   ─ Duty Tracker — view assigned duties, confirm start, mark complete
   ─ Leave Request — submit and track leave
   ─ Payslip Viewer — view monthly payslip from HR payroll
   ─ Profile — view personal info, department, contract type
═══════════════════════════════════════════════════════════════════════════ */
/* ─────────────────── EMPLOYEE PORTAL SUB-COMPONENTS ─────────────────── */

// ── Announcements seed ───────────────────────────────────────────────────
const ANNOUNCEMENTS_SEED = [
  { id:"ANN-001", title:"Q3 Performance Reviews — Reminder", body:"All employees should complete their self-assessment by July 31. Log into the Employee Portal under Profile to access your review form.", category:"HR", priority:"High",   date:"2026-07-20", author:"HR Department", pinned:true },
  { id:"ANN-002", title:"Office Closure — 7th August", body:"The office will be closed on 7th August 2026 for the public holiday. All employees should ensure pending tasks are completed by 6th August.", category:"General", priority:"Medium", date:"2026-07-18", author:"Administration", pinned:false },
  { id:"ANN-003", title:"New Health Insurance Benefits", body:"We are pleased to announce upgraded health insurance coverage for all permanent employees, effective 1st August 2026. Dental and optical cover are now included. Details will be shared by HR shortly.", category:"Benefits", priority:"High",   date:"2026-07-15", author:"HR Department", pinned:true },
  { id:"ANN-004", title:"Monthly Town Hall — Friday 3pm", body:"Join us this Friday at 3pm in the Main Conference Room (or via Zoom link shared by email) for our monthly company update. Attendance is strongly encouraged.", category:"Events",  priority:"Medium", date:"2026-07-12", author:"Management",   pinned:false },
  { id:"ANN-005", title:"Safety Drill — Next Tuesday 10am", body:"A scheduled fire safety drill will take place next Tuesday 10am. Please cooperate with the safety officer's instructions. Estimated duration: 20 minutes.", category:"Safety",  priority:"Medium", date:"2026-07-10", author:"Safety Officer",pinned:false },
];

const ANN_CAT_COLORS = {
  HR:      ["#EFF6FF","#2563EB","#BFDBFE"],
  General: ["#F8FAFB","#374151","#E5E7EB"],
  Benefits:["#F0FDF4","#16A34A","#BBF7D0"],
  Events:  ["#F5F3FF","#7C3AED","#DDD6FE"],
  Safety:  ["#FFFBEB","#D97706","#FDE68A"],
};

function PortalNoticeboard({ company }) {
  const co = company || {};
  const [filter, setFilter] = useState("All");
  const categories = ["All","HR","General","Benefits","Events","Safety"];
  const filtered = filter==="All" ? ANNOUNCEMENTS_SEED : ANNOUNCEMENTS_SEED.filter(a=>a.category===filter);
  const pinned   = filtered.filter(a=>a.pinned);
  const regular  = filtered.filter(a=>!a.pinned);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-[16px] font-bold text-[#111827]">📌 Company Noticeboard</h2>
          <p className="text-[12px] text-slate-500">{co.name||"BusinessSphere"} · Official Announcements</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5 overflow-x-auto">
          {categories.map(cat=>(
            <button key={cat} onClick={()=>setFilter(cat)}
              className={`px-2.5 py-1.5 rounded-md text-[11.5px] font-semibold whitespace-nowrap ${filter===cat?"bg-white text-[#111827] shadow-sm":"text-slate-500"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned announcements */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">📌 Pinned</p>
          {pinned.map(ann => {
            const [bg,col,border] = ANN_CAT_COLORS[ann.category]||["#F8FAFB","#374151","#E5E7EB"];
            return (
              <div key={ann.id} className="rounded-xl border-l-4 p-4 shadow-sm" style={{background:bg,borderLeftColor:col,border:`1px solid ${border}`,borderLeftWidth:4}}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{background:col+"22",color:col}}>{ann.category}</span>
                      <span className="text-[10.5px] font-bold text-[#EF4444] bg-[#FEF2F2] px-2 py-0.5 rounded-full">{ann.priority}</span>
                    </div>
                    <h3 className="text-[14px] font-bold text-[#111827] mb-1">{ann.title}</h3>
                    <p className="text-[12.5px] text-slate-600 leading-relaxed">{ann.body}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400">
                  <span>By {ann.author}</span>
                  <span>·</span>
                  <span>{ann.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Regular announcements */}
      <div className="space-y-2">
        {regular.length===0&&pinned.length===0&&(
          <div className="bg-white rounded-xl border p-10 text-center text-slate-400">
            <Bell size={32} className="mx-auto mb-2 text-slate-200"/>
            <p>No announcements in this category</p>
          </div>
        )}
        {regular.map(ann=>{
          const [bg,col,border] = ANN_CAT_COLORS[ann.category]||["#F8FAFB","#374151","#E5E7EB"];
          return (
            <div key={ann.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[16px]" style={{background:bg}}>
                  {ann.category==="HR"?"👥":ann.category==="Benefits"?"🎁":ann.category==="Events"?"🗓":ann.category==="Safety"?"⚠️":"📢"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full" style={{background:col+"22",color:col}}>{ann.category}</span>
                    <span className="text-[11px] text-slate-400">{ann.date}</span>
                  </div>
                  <h3 className="text-[13px] font-bold text-[#111827]">{ann.title}</h3>
                  <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{ann.body}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5">By {ann.author}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Team Directory ────────────────────────────────────────────────────────
function PortalTeam({ employees, self, empName }) {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  const depts = ["All", ...new Set(employees.filter(e=>e.status==="Active").map(e=>e.department).filter(Boolean))].sort();
  const filtered = employees.filter(e=>
    e.status==="Active" &&
    (deptFilter==="All" || e.department===deptFilter) &&
    (!query.trim() || e.name.toLowerCase().includes(query.toLowerCase()) || e.role?.toLowerCase().includes(query.toLowerCase()))
  );

  const DEPT_COLORS = ["#2563EB","#16A34A","#D97706","#7C3AED","#EF4444","#0891B2","#059669","#DC2626"];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#111827]">👥 Our Team</h2>
          <p className="text-[12px] text-slate-500">{filtered.length} colleagues · {depts.length-1} departments</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input value={query} onChange={e=>setQuery(e.target.value)}
              className="border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[12.5px] outline-none bg-white w-48"
              placeholder="Search name or role…"/>
          </div>
        </div>
      </div>

      {/* Department filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {depts.map((d,i)=>(
          <button key={d} onClick={()=>setDeptFilter(d)}
            className={`px-3 py-1.5 rounded-full text-[11.5px] font-semibold border transition-all ${
              deptFilter===d
                ? "text-white border-transparent"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
            style={deptFilter===d?{background:i===0?"#0D2214":DEPT_COLORS[(i-1)%DEPT_COLORS.length]}:{}}>
            {d}
          </button>
        ))}
      </div>

      {/* Team grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((emp,idx)=>{
          const deptIdx = depts.indexOf(emp.department);
          const avatarBg = DEPT_COLORS[(deptIdx-1+DEPT_COLORS.length)%DEPT_COLORS.length] || "#0D2214";
          const isSelf = emp.id === self?.id || emp.name === empName;
          return (
            <div key={emp.id} className={`bg-white rounded-xl border shadow-sm p-4 transition-all hover:shadow-md ${isSelf?"border-[#16A34A]/40 ring-1 ring-[#16A34A]/20":""}`}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[18px] font-black shrink-0"
                  style={{background:avatarBg}}>
                  {emp.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[13.5px] font-bold text-[#111827] truncate">{emp.name}</p>
                    {isSelf&&<span className="text-[9.5px] font-black text-[#16A34A] bg-[#F0FDF4] px-1.5 py-0.5 rounded-full border border-[#BBF7D0]">YOU</span>}
                  </div>
                  <p className="text-[11.5px] text-slate-500 truncate">{emp.role}</p>
                  <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1"
                    style={{background:avatarBg+"18",color:avatarBg}}>
                    {emp.department}
                  </span>
                </div>
              </div>
              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
                {emp.email&&(
                  <a href={`mailto:${emp.email}`} className="flex items-center gap-2 text-[11.5px] text-slate-500 hover:text-[#2563EB] transition-colors">
                    <AtSign size={12} className="shrink-0"/><span className="truncate">{emp.email}</span>
                  </a>
                )}
                {emp.phone&&(
                  <a href={`tel:${emp.phone}`} className="flex items-center gap-2 text-[11.5px] text-slate-500 hover:text-[#16A34A] transition-colors">
                    <PhoneCall size={12} className="shrink-0"/><span>{emp.phone}</span>
                  </a>
                )}
                {emp.phone&&(
                  <a href={`https://wa.me/${emp.phone.replace(/[^0-9]/g,"")}?text=Hi ${emp.name.split(" ")[0]},`}
                    target="_blank" rel="noopener"
                    className="flex items-center gap-2 text-[11.5px] font-semibold rounded-lg px-2 py-1 mt-1"
                    style={{color:"#16A34A",background:"#F0FDF4"}}>
                    <MessageCircle size={12}/> WhatsApp
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length===0&&(
        <div className="bg-white rounded-xl border p-10 text-center text-slate-400">
          <Users size={32} className="mx-auto mb-2 text-slate-200"/>
          <p>No team members found</p>
        </div>
      )}
    </div>
  );
}

// ── Employee Expenses ─────────────────────────────────────────────────────
const EXPENSE_CATEGORIES_PERSONAL = ["Travel","Meals & Entertainment","Office Supplies","Communication","Training","Medical","Transport","Other"];

function PortalExpenses({ empName, employees }) {
  const [form, setForm] = useState({ category:"Travel", description:"", amount:"", date:TODAY.toISOString().slice(0,10), receipt:"" });
  const [claims, setClaims] = useState([
    { id:"CLM-001", category:"Travel",  description:"Taxi to client site — Uzuri Beauty",  amount:45,  date:"2026-07-18", status:"Approved",  approvedBy:"HR Manager" },
    { id:"CLM-002", category:"Meals",   description:"Team lunch — July strategy meeting",  amount:120, date:"2026-07-15", status:"Pending",   approvedBy:null },
    { id:"CLM-003", category:"Transport",description:"Fuel reimbursement — delivery run",  amount:85,  date:"2026-07-10", status:"Rejected",  approvedBy:"Finance Manager" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  function submitClaim() {
    if (!form.description.trim()||!form.amount) { notify("Description and amount are required","error"); return; }
    const claim = {
      id:docId("CLM"), category:form.category, description:form.description,
      amount:Number(form.amount), date:form.date, status:"Pending", approvedBy:null,
    };
    setClaims(p=>[claim,...p]);
    setForm({category:"Travel",description:"",amount:"",date:TODAY.toISOString().slice(0,10),receipt:""});
    setShowForm(false);
    notify("Expense claim submitted — awaiting finance approval");
    logAudit("Expense claim","Employee Portal",empName,`${claim.category} TZS ${claim.amount}k`);
  }

  const totalApproved = claims.filter(c=>c.status==="Approved").reduce((s,c)=>s+c.amount,0);
  const totalPending  = claims.filter(c=>c.status==="Pending").reduce((s,c)=>s+c.amount,0);

  const STATUS_CFG = {
    Approved:{ col:"#16A34A", bg:"#F0FDF4", icon:"✅" },
    Pending: { col:"#F59E0B", bg:"#FFFBEB", icon:"⏳" },
    Rejected:{ col:"#EF4444", bg:"#FEF2F2", icon:"❌" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-bold text-[#111827]">🧾 My Expense Claims</h2>
          <p className="text-[12px] text-slate-500">Submit and track reimbursement requests</p>
        </div>
        <button onClick={()=>setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-white px-3.5 py-2 rounded-xl bg-[#16A34A]">
          <Plus size={13}/> New Claim
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Total Claims",   String(claims.length),              "#111827"],
          ["Approved",       `TZS ${money(totalApproved)}k`,    "#16A34A"],
          ["Pending Review", `TZS ${money(totalPending)}k`,     "#F59E0B"],
        ].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[18px] font-black" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Expense form */}
      {showForm&&(
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <h3 className="text-[14px] font-bold text-[#111827] mb-4">New Expense Claim</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Category</label>
              <select className={inputClass} value={form.category} onChange={e=>set("category",e.target.value)}>
                {EXPENSE_CATEGORIES_PERSONAL.map(cat=><option key={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Amount (TZS k) *</label>
              <input type="number" className={inputClass} value={form.amount} onChange={e=>set("amount",e.target.value)} placeholder="e.g. 45"/>
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Date</label>
              <input type="date" className={inputClass} value={form.date} onChange={e=>set("date",e.target.value)} max={TODAY.toISOString().slice(0,10)}/>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Description *</label>
              <input className={inputClass} value={form.description} onChange={e=>set("description",e.target.value)} placeholder="What was this expense for?"/>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Receipt Reference / Note (optional)</label>
              <input className={inputClass} value={form.receipt} onChange={e=>set("receipt",e.target.value)} placeholder="Receipt no., vendor name, etc."/>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={()=>setShowForm(false)} className="flex-1 text-[12.5px] font-medium border border-slate-200 rounded-xl py-2.5 text-slate-500">Cancel</button>
            <button onClick={submitClaim} className="flex-1 text-[12.5px] font-bold text-white rounded-xl py-2.5 bg-[#16A34A]">Submit Claim</button>
          </div>
        </div>
      )}

      {/* Claims list */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-[13.5px] font-bold text-[#111827]">Claims History ({claims.length})</p>
        </div>
        {claims.length===0?(
          <div className="py-10 text-center text-slate-400">
            <Receipt size={32} className="mx-auto mb-2 text-slate-200"/>
            <p>No expense claims yet. Submit your first claim above.</p>
          </div>
        ):(
          <div className="divide-y divide-slate-50">
            {claims.map(claim=>{
              const sc = STATUS_CFG[claim.status]||STATUS_CFG.Pending;
              return (
                <div key={claim.id} className="px-4 py-3.5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] shrink-0" style={{background:sc.bg}}>
                    {sc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-bold text-[#111827]">{claim.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded" style={{background:sc.bg,color:sc.col}}>{claim.category}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{claim.date}</span>
                          {claim.approvedBy&&<span className="text-[10.5px] text-slate-400">· {claim.approvedBy}</span>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-black font-mono" style={{color:sc.col}}>TZS {money(claim.amount)}k</p>
                        <span className="text-[10.5px] font-bold" style={{color:sc.col}}>{sc.icon} {claim.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Training Tracker ──────────────────────────────────────────────────────
function PortalTraining({ empName }) {
  const training = useCompanyTable("hr_training", trainingSeed, {
    order:{ col:"course", ascending:true }, mapRow:r=>r,
  });
  const myTraining = training.rows.filter(t=>
    t.employee?.toLowerCase().includes(empName.split(" ")[0].toLowerCase())||
    t.employee===empName
  );

  async function markDone(id) {
    const today = TODAY.toISOString().slice(0,10);
    training.setRows(p=>p.map(t=>t.id===id?{...t,status:"Completed",completionDate:today}:t));
    notify("Training marked as completed");
    logAudit("Training completed","Employee Portal",empName,id);
    if (IS_CONFIGURED) {
      try { await sb("hr_training").eq("id",id).update({status:"Completed",completion_date:today}).run(); } catch(_e){}
    }
  }

  const done       = myTraining.filter(t=>t.status==="Completed").length;
  const inProgress = myTraining.filter(t=>t.status==="In Progress").length;
  const pending    = myTraining.filter(t=>t.status==="Not Started").length;
  const pct        = myTraining.length > 0 ? Math.round(done/myTraining.length*100) : 0;

  const STATUS_CFG_T = {
    "Completed":  {col:"#16A34A",bg:"#F0FDF4",icon:"✅",label:"Completed"},
    "In Progress":{col:"#F59E0B",bg:"#FFFBEB",icon:"▶️",label:"In Progress"},
    "Not Started":{col:"#94A3B8",bg:"#F1F5F9",icon:"📚",label:"Not Started"},
  };

  // All available training (company-wide + mine)
  const allTraining = training.rows.slice(0,10);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[16px] font-bold text-[#111827]">📚 My Training</h2>
        <p className="text-[12px] text-slate-500">Assigned courses, progress, and completions</p>
      </div>

      {/* Progress summary */}
      <div className="bg-[#0D2214] rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-semibold text-[rgba(255,255,255,.7)]">Overall Progress</p>
          <p className="text-[28px] font-black text-[#16A34A]">{pct}%</p>
        </div>
        <div className="w-full h-2.5 bg-[rgba(255,255,255,.1)] rounded-full overflow-hidden mb-4">
          <div className="h-full rounded-full bg-[#16A34A] transition-all" style={{width:pct+"%"}}/>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[["Completed",done,"#16A34A"],["In Progress",inProgress,"#F59E0B"],["Not Started",pending,"#94A3B8"]].map(([l,v,col])=>(
            <div key={l} className="text-center">
              <p className="text-[22px] font-black" style={{color:col}}>{v}</p>
              <p className="text-[10px] text-[rgba(255,255,255,.5)] uppercase tracking-wide">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* My assigned courses */}
      {myTraining.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-[13.5px] font-bold text-[#111827]">My Courses ({myTraining.length})</p>
          </div>
          <div className="divide-y divide-slate-50">
            {myTraining.map(t=>{
              const sc = STATUS_CFG_T[t.status]||STATUS_CFG_T["Not Started"];
              return (
                <div key={t.id} className="px-4 py-3.5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] shrink-0" style={{background:sc.bg}}>
                    {sc.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-bold text-[#111827]">{t.course}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{background:sc.bg,color:sc.col}}>{sc.label}</span>
                          {t.completionDate&&<span className="text-[11px] text-slate-400 font-mono">{t.completionDate}</span>}
                        </div>
                      </div>
                      {t.status!=="Completed"&&(
                        <button onClick={()=>markDone(t.id)}
                          className="text-[11px] font-bold text-white bg-[#16A34A] px-3 py-1.5 rounded-lg shrink-0">
                          ✓ Mark Done
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {myTraining.length===0&&(
        <div className="bg-white rounded-xl border p-8 text-center text-slate-400">
          <GraduationCap size={32} className="mx-auto mb-2 text-slate-200"/>
          <p className="text-[13px]">No training assigned to you yet.</p>
          <p className="text-[12px] mt-1">HR will assign courses — check back soon.</p>
        </div>
      )}

      {/* Available training (company-wide) */}
      {allTraining.filter(t=>t.employee!==empName&&!myTraining.find(m=>m.course===t.course)).length>0&&(
        <div>
          <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wide mb-2">📖 Company Training Library</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allTraining.filter(t=>t.employee!==empName&&!myTraining.find(m=>m.course===t.course)).slice(0,4).map(t=>{
              const sc = STATUS_CFG_T[t.status]||STATUS_CFG_T["Not Started"];
              return (
                <div key={t.id} className="bg-white rounded-xl border border-slate-200/80 p-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:sc.bg}}>
                      {sc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-bold text-[#111827] truncate">{t.course}</p>
                      <p className="text-[11px] text-slate-400">{t.employee} · {sc.label}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default RestaurantModule;
