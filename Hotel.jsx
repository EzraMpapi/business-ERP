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


function FleetManagementModule({ currentUser, company, onVehiclesLoad }) {
  const [tab, setTab] = useState("overview");
  const vehicles    = useCompanyTable("flt_vehicles",    FLT_VEHICLES_SEED,    { mapRow: r => r });
  useEffect(() => { if (onVehiclesLoad) onVehiclesLoad(vehicles.rows); }, [vehicles.rows, onVehiclesLoad]);
  const trips       = useCompanyTable("flt_trips",       FLT_TRIPS_SEED,       { mapRow: r => r });
  const maintenance = useCompanyTable("flt_maintenance", FLT_MAINTENANCE_SEED, { mapRow: r => r });

  const FLT_BLUE = "#0F172A";
  const FLT_GOLD = "#EAB308";
  const TABS = [
    { id:"overview",  label:"Fleet Overview", icon: LayoutDashboard },
    { id:"vehicles",  label:"Vehicles",       icon: Car },
    { id:"trips",     label:"Trip Log",       icon: MapPin },
    { id:"maintenance",label:"Maintenance",    icon: Wrench },
  ];

  const activeVeh    = vehicles.rows.filter(v=>v.status==="Active").length;
  const totalKm      = trips.rows.reduce((s,t)=>s+t.distance,0);
  const totalFuel    = trips.rows.reduce((s,t)=>s+t.fuelUsed,0);
  const fuelCost     = trips.rows.reduce((s,t)=>s+t.cost,0);
  const maintCost    = maintenance.rows.reduce((s,m)=>s+m.cost,0);
  const dueService   = vehicles.rows.filter(v=>v.mileage >= v.nextService - 2000);
  const expIns       = vehicles.rows.filter(v=>new Date(v.insurance) < new Date(Date.now()+90*24*60*60*1000));

  const VStatusChip = ({s}) => {
    const cfg = {Active:["#DCFCE7","#16A34A"],Available:["#DBEAFE","#1E40AF"],Service:["#FEF3C7","#D97706"],Inactive:["#FEE2E2","#EF4444"],"In Progress":["#DBEAFE","#1E40AF"],Completed:["#DCFCE7","#16A34A"]};
    const [bg,col]=cfg[s]||["#F3F4F6","#6B7280"];
    return <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:bg,color:col}}>{s}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl px-6 py-5" style={{background:"linear-gradient(135deg,#0F172A 0%,#1E293B 50%,#334155 100%)"}}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div><div className="flex items-center gap-2 mb-1"><Bus size={22} className="text-[#EAB308]"/><h1 className="text-[20px] font-bold text-white">Fleet Management</h1></div><p className="text-[12px]" style={{color:"rgba(255,255,255,.55)"}}>Vehicles · Trip Logs · Fuel Tracking · Maintenance · Insurance</p></div>
          <div className="flex gap-2">
            {dueService.length>0&&<div className="bg-yellow-500 text-yellow-900 px-3 py-2 rounded-xl text-[12px] font-bold">{dueService.length} Service Due</div>}
            {expIns.length>0&&<div className="bg-red-500 text-white px-3 py-2 rounded-xl text-[12px] font-bold">{expIns.length} Insurance Expiring</div>}
          </div>
        </div>
      </div>

      <div className="flex gap-0.5 bg-white rounded-xl p-1 border border-slate-200">
        {TABS.map(t=>{const I=t.icon;return(<button key={t.id} onClick={()=>setTab(t.id)} className={"flex items-center gap-1 px-4 py-2 rounded-lg text-[12px] font-medium transition-all "+(tab===t.id?"text-white shadow-sm":"text-slate-500 hover:bg-slate-50")} style={{background:tab===t.id?FLT_BLUE:"transparent"}}><I size={13}/>{t.label}</button>);})}
      </div>

      {tab==="overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[{l:"Fleet Size",v:vehicles.rows.length,sub:activeVeh+" active",c:"#0F172A",I:Car},{l:"Total KM",v:totalKm.toLocaleString(),sub:"All trips",c:"#2563EB",I:MapPin},{l:"Fuel Cost",v:"TZS "+money(fuelCost)+"k",sub:totalFuel+"L used",c:FLT_GOLD,I:Gauge},{l:"Maintenance",v:"TZS "+money(maintCost)+"k",sub:"YTD spend",c:"#EF4444",I:Wrench}].map(k=>(
              <div key={k.l} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><div className="flex items-start justify-between"><div><p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{k.l}</p><p className="text-[22px] font-bold mt-1 text-[#111827]">{k.v}</p><p className="text-[11.5px] mt-0.5" style={{color:k.c}}>{k.sub}</p></div><div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:k.c+"18"}}><k.I size={18} style={{color:k.c}}/></div></div></div>
            ))}
          </div>

          {/* ── Fleet Analytics Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly trip distance trend */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Monthly Distance (km)</h3>
              {(() => {
                const months = Array.from({length:6},(_,i)=>{
                  const d = new Date(TODAY.getFullYear(), TODAY.getMonth()-5+i, 1);
                  const key = d.toISOString().slice(0,7);
                  const label = d.toLocaleString("default",{month:"short"});
                  const dist = trips.rows.filter(t=>(t.date||"").startsWith(key)).reduce((s,t)=>s+t.distance,0);
                  const fuel = trips.rows.filter(t=>(t.date||"").startsWith(key)).reduce((s,t)=>s+t.fuelUsed,0);
                  return {month:label, distance:dist, fuel:Math.round(fuel)};
                });
                return (
                  <ResponsiveContainer width="100%" height={150}>
                    <ComposedChart data={months} margin={{left:-10,right:4,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#F3F4F6"/>
                      <XAxis dataKey="month" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="left"  tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis yAxisId="right" orientation="right" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={(v,n)=>[n==="distance"?v+" km":v+"L",n==="distance"?"Distance":"Fuel"]}/>
                      <Area yAxisId="left"  type="monotone" dataKey="distance" stroke="#0F172A" fill="#0F172A18" strokeWidth={2}/>
                      <Line yAxisId="right" type="monotone" dataKey="fuel"     stroke="#EAB308" strokeWidth={2} dot={{r:3,fill:"#EAB308"}} strokeDasharray="4 2"/>
                    </ComposedChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>

            {/* Vehicle status PieChart */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Fleet Status</h3>
              {(() => {
                const STATUS_COLORS = {Active:"#16A34A", "In Transit":"#2563EB", Maintenance:"#F59E0B", Inactive:"#EF4444"};
                const statusData = Object.entries(
                  vehicles.rows.reduce((m,v)=>({...m,[v.status]:(m[v.status]||0)+1}),{})
                ).map(([name,value])=>({name,value,fill:STATUS_COLORS[name]||"#6B7280"}));
                
                return (
                  <div className="flex gap-4 items-center">
                    <ResponsiveContainer width="60%" height={150}>
                      <RPieChart>
                        <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                          {statusData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                        </Pie>
                        <Tooltip formatter={(v,n)=>[v+" vehicles",n]}/>
                      </RPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {statusData.map(d=>(
                        <div key={d.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[12px] text-slate-600"><span className="w-2.5 h-2.5 rounded-full" style={{background:d.fill}}/>{d.name}</span>
                          <span className="text-[13px] font-bold" style={{color:d.fill}}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {dueService.length>0&&<div className="bg-yellow-50er-yellow-200 rounded-xl p-4"><p className="text-[13px] font-semibold text-yellow-800 mb-2">⚠ Service Due Soon</p>{dueService.map(v=><p key={v.id} className="text-[12px] text-yellow-700">• {v.reg} ({v.make} {v.model}) — {v.mileage.toLocaleString()}km / {v.nextService.toLocaleString()}km service</p>)}</div>}
        </div>
      )}

      {tab==="vehicles" && (
        <div className="space-y-3">
          <div className="flex justify-end gap-2 pb-1">
            <button onClick={()=>downloadCSV("fleet-vehicles",vehicles.rows.map(v=>({
              Reg:v.reg||"",Make:v.make||"",Model:v.model||"",Year:v.year||"",
              Type:v.type||"",Driver:v.driver||"",Status:v.status||"",
              Mileage:v.mileage||0,NextService:v.nextService||0,
              Insurance:v.insurance||""
            })),[{key:"Reg",label:"Reg"},{key:"Make",label:"Make"},{key:"Model",label:"Model"},
              {key:"Year",label:"Year"},{key:"Type",label:"Type"},{key:"Driver",label:"Driver"},
              {key:"Status",label:"Status"},{key:"Mileage",label:"Mileage (km)"},
              {key:"NextService",label:"Next Service (km)"},{key:"Insurance",label:"Insurance"}])}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-[#16A34A] border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-1.5 rounded-lg">
              <Download size={12}/> CSV Fleet Register
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {vehicles.rows.map(v => {
              const kmLeft = v.nextService - v.mileage;
              const pct    = Math.min(100, v.mileage / v.nextService * 100);
              const insExp = new Date(v.insurance) < new Date(Date.now()+90*24*60*60*1000);
              return (
                <div key={v.id} className={"bg-white rounded-xl border shadow-sm p-4 "+(v.status==="Service"?"border-yellow-200":"border-slate-200/80")}>
                  <div className="flex items-start justify-between mb-3">
                    <div><p className="text-[16px] font-bold text-[#111827]">{v.reg}</p><p className="text-[12px] text-slate-400">{v.year} {v.make} {v.model}</p></div>
                    <VStatusChip s={v.status}/>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    {[["Driver",v.driver],["Type",v.type],["Fuel",v.fuel],["Mileage",v.mileage.toLocaleString()+"km"],["Insurance",v.insurance+(insExp?" ⚠":"")]].map(([l,val])=>(
                      <div key={l} className="flex justify-between"><span className="text-[11.5px] text-slate-400">{l}</span><span className={"text-[11.5px] font-medium "+(l==="Insurance"&&insExp?"text-red-500":"text-[#111827]")}>{val}</span></div>
                    ))}
                  </div>
                  <div><p className="text-[10.5px] text-slate-400 mb-1">Next service: {v.nextService.toLocaleString()}km ({kmLeft>0?kmLeft.toLocaleString()+"km left":"OVERDUE"})</p><div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:pct+"%",background:pct>95?"#EF4444":pct>80?"#F59E0B":"#16A34A"}}/></div></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="trips" && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"><p className="text-[13.5px] font-semibold text-[#111827]">Trip Log</p><button onClick={()=>notify("Log new trip")} className="flex items-center gap-1 text-[12px] font-semibold text-white px-3 py-2 rounded-xl" style={{background:FLT_BLUE}}><Plus size={12}/>Log Trip</button></div>
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100 bg-slate-50">{["Vehicle","Driver","Purpose","Start","End","Distance","Fuel Used","Cost","Status"].map(h=><th key={h} className="px-3 py-3 text-left text-[10px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
            <tbody>{trips.rows.map(t=>(
              <tr key={t.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-3 py-3 font-mono text-[11.5px] font-semibold" style={{color:FLT_BLUE}}>{t.vehicle}</td>
                <td className="px-3 py-3 font-medium text-[#111827]">{t.driver}</td>
                <td className="px-3 py-3 text-slate-500 max-w-[150px] truncate">{t.purpose}</td>
                <td className="px-3 py-3 font-mono text-[11px] text-slate-400">{t.start}</td>
                <td className="px-3 py-3 font-mono text-[11px] text-slate-400">{t.end||"—"}</td>
                <td className="px-3 py-3 font-bold text-[#111827]">{t.distance?t.distance+"km":"—"}</td>
                <td className="px-3 py-3 text-slate-500">{t.fuelUsed?t.fuelUsed+"L":"—"}</td>
                <td className="px-3 py-3 font-mono font-bold" style={{color:FLT_GOLD}}>TZS {money(t.cost)}k</td>
                <td className="px-3 py-3"><VStatusChip s={t.status}/></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {tab==="maintenance" && (
        <div className="space-y-3">
          <div className="flex justify-end"><button onClick={()=>notify("Log maintenance record")} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:FLT_BLUE}}><Wrench size={13}/>Log Maintenance</button></div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50">{["Vehicle","Type","Workshop","Mileage","Date","Cost","Status"].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
              <tbody>{maintenance.rows.map(m=>(
                <tr key={m.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-[11.5px] font-semibold" style={{color:FLT_BLUE}}>{m.vehicle}</td>
                  <td className="px-4 py-3 font-medium text-[#111827]">{m.type}</td>
                  <td className="px-4 py-3 text-slate-500">{m.workshop}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">{m.mileageAtService?.toLocaleString()}km</td>
                  <td className="px-4 py-3 font-mono text-[11.5px] text-slate-400">{m.date}</td>
                  <td className="px-4 py-3 font-mono font-bold text-[#EF4444]">TZS {money(m.cost)}k</td>
                  <td className="px-4 py-3"><VStatusChip s={m.status}/></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[13
        </div>
      )}

      {/* ── ANALYTICS TAB ── */}
      {tab === "analytics" && (() => {
        const perVeh = vehicles.rows.map(v=>{
          const vTrips = trips.rows.filter(t=>t.vehicleId===v.id||t.vehicle===v.reg);
          const km     = vTrips.reduce((s,t)=>s+(t.distance||0),0);
          const cost   = vTrips.reduce((s,t)=>s+(t.cost||0),0);
          const fuel   = vTrips.reduce((s,t)=>s+(t.fuelUsed||0),0);
          return {name:v.reg,km:Math.round(km),cost:Math.round(cost),fuel:Math.round(fuel),
            cpk:km>0?+(cost/km).toFixed(1):0};
        }).filter(v=>v.km>0).sort((a,b)=>b.cost-a.cost).slice(0,6);

        const maintByMonth = maintenance.rows.reduce((acc,rec)=>{
          const mo=(rec.date||"").slice(0,7);
          if(mo) acc[mo]=(acc[mo]||0)+(rec.cost||0);
          return acc;
        },{});
        const maintTrend = Object.entries(maintByMonth)
          .sort((a,b)=>a[0].localeCompare(b[0])).slice(-6)
          .map(([mo,cost])=>({mo:mo.slice(5)+"'"+mo.slice(2,4),cost}));

        const totalCost = fuelCost + maintCost;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ["Total Fleet Cost",`TZS ${money(Math.round(totalCost/1000))}k`,"#0F172A"],
                ["Fuel Cost",       `TZS ${money(Math.round(fuelCost/1000))}k`, "#EF4444"],
                ["Maintenance",     `TZS ${money(Math.round(maintCost/1000))}k`,"#F59E0B"],
                ["Total KM",        `${money(Math.round(totalKm))} km`,          "#16A34A"],
              ].map(([l,v,col])=>(
                <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                  <p className="text-[18px] font-black" style={{color:col}}>{v}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Operating Cost by Vehicle (TZS)</h3>
                {perVeh.length===0?<p className="text-slate-400 text-center py-6">No trip data yet</p>:(
                  <ResponsiveContainer width="100%" height={155}>
                    <BarChart data={perVeh} layout="vertical" margin={{left:5,right:24,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                      <XAxis type="number" tick={{fontSize:9}} axisLine={false} tickLine={false}/>
                      <YAxis dataKey="name" type="category" tick={{fontSize:10}} axisLine={false} tickLine={false} width={60}/>
                      <Tooltip formatter={(v)=>[`TZS ${money(v)}`,"Cost"]}/>
                      <Bar dataKey="cost" fill="#0F172A" radius={[0,4,4,0]} maxBarSize={16}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Maintenance Cost Trend</h3>
                {maintTrend.length===0?<p className="text-slate-400 text-center py-6">No records yet</p>:(
                  <ResponsiveContainer width="100%" height={155}>
                    <AreaChart data={maintTrend} margin={{left:0,right:10,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                      <XAxis dataKey="mo" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:9}} axisLine={false} tickLine={false}
                        tickFormatter={v=>v>=1000?`${Math.round(v/1000)}k`:v}/>
                      <Tooltip formatter={(v)=>[`TZS ${money(v)}`,"Maintenance"]}/>
                      <Area type="monotone" dataKey="cost" fill="#FEF3C7" stroke="#EAB308" strokeWidth={2}/>
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            {perVeh.length>0&&(
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-[#0F172A]">
                  <p className="text-[12.5px] font-bold text-white">Efficiency — Cost per KM by Vehicle</p>
                </div>
                <table className="w-full text-[12.5px]">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">
                    {["Vehicle","KM Driven","Fuel (L)","Trip Cost","Cost/KM"].map(h=>(
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {perVeh.map((v,i)=>(
                      <tr key={v.name} className={i%2===0?"bg-white":"bg-slate-50/60"}>
                        <td className="px-4 py-2.5 font-bold text-[#111827]">{v.name}</td>
                        <td className="px-4 py-2.5 font-mono">{money(v.km)} km</td>
                        <td className="px-4 py-2.5 font-mono">{money(v.fuel)} L</td>
                        <td className="px-4 py-2.5 font-mono font-bold">TZS {money(v.cost)}</td>
                        <td className="px-4 py-2.5 font-bold font-mono" style={{color:v.cpk>50?"#EF4444":v.cpk>30?"#F59E0B":"#16A34A"}}>
                          {v.cpk} TZS/km
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// BANKING & MICROFINANCE INSTITUTION MODULE
// Full-spectrum money institution management:
// Accounts · Loans (full lifecycle) · Savings · Deposits
// PAR Monitoring · Interest Calculator · KYC · Collateral
// Teller Operations · Reports & MIS
// ═══════════════════════════════════════════════════════════════════════════

// ── Seed Data ─────────────────────────────────────────────────────────────
const BNK_ACCOUNTS_SEED = [
  { id:"ACC-001001", memberId:"MBR-B001", name:"Amina Hassan",       type:"Savings",       balance:4820,  status:"Active",   openDate:"2023-01-15", branch:"Main", acctNo:"1001-0001-S", interest:3.5  },
  { id:"ACC-001002", memberId:"MBR-B002", name:"John Mwangi",        type:"Current",       balance:12500, status:"Active",   openDate:"2022-06-20", branch:"Main", acctNo:"1001-0002-C", interest:0    },
  { id:"ACC-001003", memberId:"MBR-B003", name:"Fatuma Juma",        type:"Savings",       balance:8900,  status:"Active",   openDate:"2023-03-01", branch:"North",acctNo:"1001-0003-S", interest:3.5  },
  { id:"ACC-001004", memberId:"MBR-B004", name:"Peter Kamau Ltd",    type:"Business",      balance:45000, status:"Active",   openDate:"2021-11-10", branch:"Main", acctNo:"1001-0004-B", interest:1.0  },
  { id:"ACC-001005", memberId:"MBR-B005", name:"Grace Mwenda",       type:"Fixed Deposit", balance:25000, status:"Active",   openDate:"2024-01-01", branch:"Main", acctNo:"1001-0005-F", interest:8.5  },
  { id:"ACC-001006", memberId:"MBR-B006", name:"David Odhiambo",     type:"Savings",       balance:320,   status:"Dormant",  openDate:"2020-05-30", branch:"South",acctNo:"1001-0006-S", interest:3.5  },
  { id:"ACC-001007", memberId:"MBR-B007", name:"Halima Abdallah",    type:"Savings",       balance:7650,  status:"Active",   openDate:"2023-08-15", branch:"Main", acctNo:"1001-0007-S", interest:3.5  },
  { id:"ACC-001008", memberId:"MBR-B008", name:"Rashid Ahmed Corp",  type:"Business",      balance:98000, status:"Active",   openDate:"2022-03-01", branch:"Main", acctNo:"1001-0008-B", interest:1.0  },
];

const BNK_LOANS_SEED = [
  { id:"LN-B0001", memberId:"MBR-B001", member:"Amina Hassan",    product:"Personal Loan", principal:5000,  rate:18, term:24,  disbursed:"2024-01-15", maturity:"2026-01-15", balance:2840,  status:"Active",   collateral:"Logbook",      emi:250,  paid:2160, dpd:0   },
  { id:"LN-B0002", memberId:"MBR-B003", member:"Fatuma Juma",     product:"Business Loan", principal:15000, rate:15, term:36,  disbursed:"2023-06-01", maturity:"2026-06-01", balance:9200,  status:"Active",   collateral:"Title Deed",   emi:520,  paid:5800, dpd:0   },
  { id:"LN-B0003", memberId:"MBR-B004", member:"Peter Kamau Ltd", product:"SME Loan",      principal:50000, rate:14, term:48,  disbursed:"2022-11-10", maturity:"2026-11-10", balance:28000, status:"Active",   collateral:"Property",     emi:1380, paid:22000,dpd:0   },
  { id:"LN-B0004", memberId:"MBR-B006", member:"David Odhiambo",  product:"Personal Loan", principal:2000,  rate:18, term:12,  disbursed:"2024-05-01", maturity:"2025-05-01", balance:1800,  status:"Overdue",  collateral:"Guarantor",    emi:185,  paid:200,  dpd:45  },
  { id:"LN-B0005", memberId:"MBR-B007", member:"Halima Abdallah", product:"Agricultural",  principal:8000,  rate:12, term:18,  disbursed:"2024-03-01", maturity:"2025-09-01", balance:5200,  status:"Active",   collateral:"Farm Title",   emi:490,  paid:2800, dpd:0   },
  { id:"LN-B0006", memberId:"MBR-B002", member:"John Mwangi",     product:"Personal Loan", principal:3000,  rate:18, term:12,  disbursed:"2023-01-15", maturity:"2024-01-15", balance:0,     status:"Closed",   collateral:"Guarantor",    emi:275,  paid:3000, dpd:0   },
  { id:"LN-B0007", memberId:"MBR-B008", member:"Rashid Ahmed",    product:"Business Loan", principal:80000, rate:13, term:60,  disbursed:"2022-03-01", maturity:"2027-03-01", balance:52000, status:"Active",   collateral:"Property",     emi:1820, paid:28000,dpd:0   },
];

const BNK_LOAN_PRODUCTS = [
  { id:"LP-001", name:"Personal Loan",    maxAmt:10000,  minTerm:6,  maxTerm:36, rate:18, collateral:"Guarantor or Logbook",   purpose:"Personal expenses",         processingFee:2 },
  { id:"LP-002", name:"Business Loan",    maxAmt:100000, minTerm:12, maxTerm:60, rate:14, collateral:"Business assets or Title",purpose:"Business expansion",        processingFee:1.5 },
  { id:"LP-003", name:"SME Loan",         maxAmt:500000, minTerm:24, maxTerm:84, rate:13, collateral:"Property or Equipment",  purpose:"SME financing",             processingFee:1 },
  { id:"LP-004", name:"Agricultural Loan",maxAmt:20000,  minTerm:6,  maxTerm:18, rate:12, collateral:"Farm title / Produce",  purpose:"Farming inputs & equipment",processingFee:1 },
  { id:"LP-005", name:"Group Loan",       maxAmt:5000,   minTerm:6,  maxTerm:12, rate:15, collateral:"Group guarantee",        purpose:"Group business",            processingFee:2 },
  { id:"LP-006", name:"Emergency Loan",   maxAmt:2000,   minTerm:1,  maxTerm:6,  rate:20, collateral:"Savings or Guarantor",   purpose:"Emergency needs",           processingFee:3 },
  { id:"LP-007", name:"Mortgage",         maxAmt:1000000,minTerm:60, maxTerm:240,rate:11, collateral:"Property Title Deed",    purpose:"Home purchase/construction", processingFee:1 },
  { id:"LP-008", name:"Asset Finance",    maxAmt:200000, minTerm:12, maxTerm:60, rate:14, collateral:"Asset being financed",   purpose:"Vehicle, equipment, machinery",processingFee:1.5},
];

const BNK_TRANSACTIONS_SEED = [
  { id:"TXN-001", acctNo:"1001-0001-S", member:"Amina Hassan",    type:"Deposit",    amount:500,   balance:4820, date:"2026-07-16 09:14", channel:"Branch", narration:"Cash deposit",            ref:"BR20260716001" },
  { id:"TXN-002", acctNo:"1001-0008-B", member:"Rashid Ahmed",    type:"Withdrawal", amount:5000,  balance:98000,date:"2026-07-16 10:22", channel:"Branch", narration:"Business payment",         ref:"BR20260716002" },
  { id:"TXN-003", acctNo:"1001-0003-S", member:"Fatuma Juma",     type:"Transfer",   amount:1500,  balance:8900, date:"2026-07-17 08:55", channel:"Mobile", narration:"Transfer to 1001-0002-C",  ref:"MB20260717001" },
  { id:"TXN-004", acctNo:"1001-0002-C", member:"John Mwangi",     type:"Loan Repay", amount:520,   balance:12500,date:"2026-07-17 11:30", channel:"Mobile", narration:"Loan LN-B0002 repayment",  ref:"MB20260717002" },
  { id:"TXN-005", acctNo:"1001-0007-S", member:"Halima Abdallah", type:"Deposit",    amount:1000,  balance:7650, date:"2026-07-18 14:05", channel:"Branch", narration:"Salary credit",            ref:"BR20260718001" },
];

const BNK_MEMBERS_SEED = [
  { id:"MBR-B001", name:"Amina Hassan",     dob:"1988-03-22", nationalId:"NIDA-1234567890", phone:"0712-345-678", email:"amina@email.com",    gender:"F", occupation:"Teacher",      kycStatus:"Verified", joinDate:"2023-01-15", branch:"Main"  },
  { id:"MBR-B002", name:"John Mwangi",      dob:"1975-11-05", nationalId:"NIDA-2345678901", phone:"0756-789-012", email:"john@email.com",     gender:"M", occupation:"Business",     kycStatus:"Verified", joinDate:"2022-06-20", branch:"Main"  },
  { id:"MBR-B003", name:"Fatuma Juma",      dob:"1992-07-30", nationalId:"NIDA-3456789012", phone:"0783-456-123", email:"fatuma@email.com",   gender:"F", occupation:"Entrepreneur", kycStatus:"Verified", joinDate:"2023-03-01", branch:"North" },
  { id:"MBR-B004", name:"Peter Kamau Ltd",  dob:"1969-09-15", nationalId:"TIN-987654321",   phone:"0622-111-222", email:"peter@kamau.co.tz",  gender:"M", occupation:"Director",     kycStatus:"Verified", joinDate:"2021-11-10", branch:"Main"  },
  { id:"MBR-B005", name:"Grace Mwenda",     dob:"1984-05-18", nationalId:"NIDA-5678901234", phone:"0769-333-444", email:"grace@email.com",    gender:"F", occupation:"Nurse",        kycStatus:"Verified", joinDate:"2024-01-01", branch:"Main"  },
  { id:"MBR-B006", name:"David Odhiambo",   dob:"1990-02-28", nationalId:"NIDA-6789012345", phone:"0744-555-666", email:"david@email.com",    gender:"M", occupation:"Farmer",       kycStatus:"Pending",  joinDate:"2020-05-30", branch:"South" },
  { id:"MBR-B007", name:"Halima Abdallah",  dob:"1995-12-10", nationalId:"NIDA-7890123456", phone:"0755-666-777", email:"halima@email.com",   gender:"F", occupation:"Farmer",       kycStatus:"Verified", joinDate:"2023-08-15", branch:"Main"  },
  { id:"MBR-B008", name:"Rashid Ahmed Corp",dob:"1965-04-22", nationalId:"TIN-123456789",   phone:"0766-777-888", email:"rashid@rahcorp.co.tz",gender:"M", occupation:"MD/CEO",       kycStatus:"Verified", joinDate:"2022-03-01", branch:"Main"  },
];

const BNK_APPLICATIONS_SEED = [
  { id:"APP-001", memberId:"MBR-B003", member:"Fatuma Juma",  product:"Business Loan", amount:20000, term:36, purpose:"Shop expansion",        collateral:"Title Deed", submittedDate:"2026-07-14", status:"Under Review", officer:"Jane Wairimũ", score:72 },
  { id:"APP-002", memberId:"MBR-B007", member:"Halima Abdallah",product:"Agricultural",amount:10000, term:18, purpose:"Irrigation equipment",  collateral:"Farm Title", submittedDate:"2026-07-15", status:"Approved",      officer:"Tom Otieno",  score:81 },
  { id:"APP-003", memberId:"MBR-B001", member:"Amina Hassan",  product:"Personal Loan",amount:3000,  term:12, purpose:"School fees",           collateral:"Guarantor",  submittedDate:"2026-07-17", status:"Pending Docs",  officer:"Jane Wairimũ", score:68 },
];

export default FleetManagementModule;
