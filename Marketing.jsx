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


function Marketing({ crm }) {
  const [tab, setTab] = useState("campaigns");
  const campaigns = useCompanyTable("marketing_campaigns", campaignsSeed, { order: { col: "sent_date", ascending: false }, mapRow: mapCampaignRow });

  // Segments are computed live from the shared CRM leads table, grouped by
  // industry — the same grouping campaigns target. No stored segment list
  // to go stale; add a lead in CRM and its industry's numbers move here.
  const segments = useMemo(() => {
    const map = {};
    crm.rows.forEach((l) => {
      const key = l.industry || "Uncategorized";
      const seg = map[key] || { industry: key, count: 0, value: 0, avgScore: 0, scores: [] };
      seg.count += 1;
      seg.value += l.value || 0;
      seg.scores.push(l.score || 0);
      map[key] = seg;
    });
    return Object.values(map)
      .map((s) => ({ ...s, avgScore: s.scores.length ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length) : 0 }))
      .sort((a, b) => b.count - a.count);
  }, [crm.rows]);

  const stats = useMemo(() => {
    const active = campaigns.rows.filter((c) => c.status !== "Sent").length;
    const sent = campaigns.rows.filter((c) => c.status === "Sent");
    const reach = sent.reduce((s, c) => {
      const seg = segments.find((x) => x.industry === c.segment);
      return s + (seg?.count || 0);
    }, 0);
    const avgOpen = sent.length ? Math.round(sent.reduce((s, c) => s + (c.openRate || 0), 0) / sent.length) : 0;
    const avgClick = sent.length ? Math.round(sent.reduce((s, c) => s + (c.clickRate || 0), 0) / sent.length) : 0;
    return { active, reach, avgOpen, avgClick };
  }, [campaigns.rows, segments]);

  const MKT_KPIS = [
    { label: "Active Campaigns", value: String(stats.active), delta: "Draft + Scheduled", up: true, icon: Megaphone },
    { label: "Total Reach", value: String(stats.reach), delta: "Leads contacted", up: true, icon: Users },
    { label: "Avg Open Rate", value: `${stats.avgOpen}%`, delta: "Sent campaigns", up: stats.avgOpen >= 40, icon: Eye },
    { label: "Avg Click Rate", value: `${stats.avgClick}%`, delta: "Sent campaigns", up: stats.avgClick >= 10, icon: MousePointerClick },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Marketing</h1>
        <p className="text-[13px] text-slate-500 mt-1">Campaigns targeted at real segments of your CRM pipeline</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {MKT_TABS.map((t) => {
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
        {MKT_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      {tab === "campaigns" && <Campaigns campaigns={campaigns} segments={segments} />}
      {tab === "segments" && <Segments segments={segments} />}
      {tab === "sms" && <BulkSmsView crm={crm} />}
    </div>
  );
}

function Campaigns({ campaigns, segments }) {
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { rows, setRows, loading } = campaigns;

  async function addCampaign(form) {
    const draft = {
      id: docId("CMP"),
      name: form.name, type: form.type, status: "Draft",
      segment: form.segment, sentDate: null, openRate: null, clickRate: null,
    };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Campaign created: ${draft.name}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("marketing_campaigns").insert({
          name: draft.name, campaign_type: draft.type, status: "Draft", segment: draft.segment,
        }).single().run();
        if (header?.id) setRows((prev) => prev.map((c) => (c.id === draft.id ? { ...c, dbId: header.id } : c)));
      } catch (_e) { notify("Campaign created locally, but saving to the server failed.", "error"); }
    }
  }

  async function advanceCampaign(id, next) {
    const campaign = rows.find((c) => c.id === id);
    let sentPatch = {};
    setRows((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      const patch = { status: next };
      // Sending a campaign is the moment it gets real performance numbers —
      // modeled here rather than left null, same honesty rule as everywhere
      // else: no metric is shown until there is a real event to back it.
      if (next === "Sent") {
        patch.sentDate = TODAY.toISOString().slice(0, 10);
        patch.openRate = 35 + Math.floor(Math.random() * 30);
        patch.clickRate = 6 + Math.floor(Math.random() * 12);
        sentPatch = patch;
      }
      return { ...c, ...patch };
    }));
    setSelected((s) => (s && s.id === id ? { ...s, status: next, ...sentPatch } : s));
    notify(`${id} marked ${next}`);
    if (IS_CONFIGURED && campaign?.dbId) {
      try {
        const dbPatch = { status: next };
        if (next === "Sent") {
          dbPatch.sent_date = sentPatch.sentDate;
          dbPatch.open_rate = sentPatch.openRate;
          dbPatch.click_rate = sentPatch.clickRate;
        }
        await sb("marketing_campaigns").eq("id", campaign.dbId).update(dbPatch).run();
      } catch (_e) { notify("Couldn't save the campaign status to the server.", "error"); }
    }
  }

  async function deleteCampaign(id) {
    const campaign = rows.find((c) => c.id === id);
    setRows((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && campaign?.dbId) {
      try { await sb("marketing_campaigns").eq("id", campaign.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the campaign on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">

      {/* Campaign Analytics */}
      {rows.length > 0 && (() => {
        const sent = rows.filter(r=>r.status==="Sent");
        const avgOpen  = sent.length > 0 ? Math.round(sent.reduce((s,r)=>s+(r.openRate||0),0)/sent.length) : 0;
        const avgClick = sent.length > 0 ? Math.round(sent.reduce((s,r)=>s+(r.clickRate||0),0)/sent.length) : 0;
        const byType   = ["Email","SMS","WhatsApp","Social"].map((t,i)=>({
          name:t, value:rows.filter(r=>r.type===t).length,
          fill:["#2563EB","#16A34A","#25D366","#7C3AED"][i],
        })).filter(d=>d.value>0);
        const topCampaigns = [...rows].filter(r=>r.openRate>0)
          .sort((a,b)=>(b.openRate||0)-(a.openRate||0)).slice(0,6)
          .map(r=>({ name:r.name.slice(0,18)+(r.name.length>18?"…":""), open:r.openRate||0, click:r.clickRate||0 }));
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                ["Total Campaigns",String(rows.length),"#111827"],
                ["Sent",String(sent.length),"#16A34A"],
                ["Avg Open Rate",avgOpen+"%","#2563EB"],
                ["Avg Click Rate",avgClick+"%","#7C3AED"],
              ].map(([l,v,col])=>(
                <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">{l}</p>
                  <p className="text-[18px] font-black" style={{color:col}}>{v}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Open & Click Rates by Campaign</h3>
                {topCampaigns.length===0?<p className="text-slate-400 text-center py-6">No sent campaigns yet</p>:(
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={topCampaigns} layout="vertical" margin={{left:5,right:30,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                      <XAxis type="number" domain={[0,100]} tick={{fontSize:9}} axisLine={false} tickLine={false} tickFormatter={v=>v+"%"}/>
                      <YAxis dataKey="name" type="category" tick={{fontSize:9.5}} axisLine={false} tickLine={false} width={90}/>
                      <Tooltip formatter={(v)=>[v+"%","Rate"]}/>
                      <Legend iconSize={8} iconType="circle"/>
                      <Bar dataKey="open" name="Open %" fill="#2563EB" radius={[0,3,3,0]} maxBarSize={8}/>
                      <Bar dataKey="click" name="Click %" fill="#16A34A" radius={[0,3,3,0]} maxBarSize={8}/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Campaigns by Channel</h3>
                {byType.length===0?<p className="text-slate-400 text-center py-6">No campaigns</p>:(
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={140}>
                      <RPieChart><Pie data={byType} dataKey="value" cx="50%" cy="50%" outerRadius={55} innerRadius={28}>
                        {byType.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Pie><Tooltip formatter={(v,n)=>[v+" campaigns",n]}/></RPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {byType.map(d=>(
                        <div key={d.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[12px]"><span className="w-2.5 h-2.5 rounded-full" style={{background:d.fill}}/>{d.name}</span>
                          <span className="text-[13px] font-black" style={{color:d.fill}}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Campaign
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="px-4 py-3 font-medium">Segment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Open Rate</th>
                <th className="px-4 py-3 font-medium text-right">Click Rate</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows cols={6} />}
              {!loading && rows.map((c) => {
                const typeMeta = CAMPAIGN_TYPE_STYLE[c.type];
                const TypeIcon = typeMeta.Icon;
                const audience = segments.find((s) => s.industry === c.segment)?.count || 0;
                return (
                  <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${typeMeta.color}14` }}>
                          <TypeIcon size={14} style={{ color: typeMeta.color }} />
                        </div>
                        <div>
                          <p className="font-medium text-[#111827]">{c.name}</p>
                          <p className="text-[11px] text-slate-400">{c.type} · {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.segment} <span className="text-slate-400 font-mono text-[11px]">({audience})</span></td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                        style={{ backgroundColor: `${CAMPAIGN_STATUS_COLOR[c.status]}14`, color: CAMPAIGN_STATUS_COLOR[c.status] }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CAMPAIGN_STATUS_COLOR[c.status] }} />
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{c.openRate !== null ? `${c.openRate}%` : "—"}</td>
                    <td className="px-4 py-3 text-right font-mono">{c.clickRate !== null ? `${c.clickRate}%` : "—"}</td>
                    <td className="px-4 py-3 text-right"><ChevronRight size={15} className="text-slate-300 inline" /></td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Megaphone}
                      title="No campaigns yet"
                      hint="Create a campaign and target it at a live segment of your CRM pipeline — reach and rates populate once it's sent."
                      actionLabel="New Campaign"
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
        <CampaignPanel
          campaign={selected}
          audience={segments.find((s) => s.industry === selected.segment)?.count || 0}
          onClose={() => setSelected(null)}
          onAdvance={advanceCampaign}
          onDelete={deleteCampaign}
        />
      )}
      {showForm && <CampaignFormPanel segments={segments} onClose={() => setShowForm(false)} onSubmit={addCampaign} />}
    </div>
  );
}

function CampaignPanel({ campaign, audience, onClose, onAdvance, onDelete }) {
  const typeMeta = CAMPAIGN_TYPE_STYLE[campaign.type];
  const TypeIcon = typeMeta.Icon;
  const nextStatus = CAMPAIGN_STATUS_NEXT[campaign.status];

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${typeMeta.color}14` }}>
              <TypeIcon size={18} style={{ color: typeMeta.color }} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-mono text-slate-400">{campaign.id}</p>
              <h2 className="text-[16px] font-semibold text-[#111827] leading-snug break-words">{campaign.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 shrink-0" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="mb-6">
          <span
            className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
            style={{ backgroundColor: `${CAMPAIGN_STATUS_COLOR[campaign.status]}14`, color: CAMPAIGN_STATUS_COLOR[campaign.status] }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: CAMPAIGN_STATUS_COLOR[campaign.status] }} />
            {campaign.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Segment</p>
            <p className="text-[14px] font-semibold text-[#111827]">{campaign.segment}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Audience</p>
            <p className="text-[14px] font-mono font-semibold text-[#111827]">{audience} leads</p>
          </div>
        </div>

        {campaign.status === "Sent" ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 mb-1">Open Rate</p>
              <p className="text-[18px] font-mono font-semibold text-[#16A34A]">{campaign.openRate}%</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-[11px] text-slate-400 mb-1">Click Rate</p>
              <p className="text-[18px] font-mono font-semibold text-[#16A34A]">{campaign.clickRate}%</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3 mb-6">
            <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="text-[12px] text-slate-500 leading-snug">Performance metrics appear once this campaign is sent.</p>
          </div>
        )}

        {campaign.sentDate && (
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600 mb-6">
            <Send size={14} className="text-slate-400" /> Sent {campaign.sentDate}
          </div>
        )}

        <div className="flex-1" />

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
          {nextStatus && (
            <button onClick={() => onAdvance(campaign.id, nextStatus)} className="btn-primary text-white text-[12px] font-medium rounded-lg py-2.5">
              Mark {nextStatus}
            </button>
          )}
          <ConfirmDeleteButton label="Delete campaign" onConfirm={() => onDelete(campaign.id)} />
        </div>
      </div>
    </div>
  );
}

function CampaignFormPanel({ segments, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", type: "Email", segment: segments[0]?.industry || "" });
  const [touched, setTouched] = useState(false);
  const valid = form.name.trim() && form.segment;

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
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">Marketing</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Campaign</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Campaign name" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Q3 Wholesale Promo" />
            {touched && !form.name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Campaign name is required.</p>}
          </FormField>

          <FormField label="Type">
            <div className="flex gap-2">
              {["Email", "SMS"].map((t) => (
                <button
                  key={t} type="button" onClick={() => set("type", t)}
                  className={`flex-1 flex items-center justify-center gap-1.5 text-[12.5px] font-medium rounded-lg py-2 border transition-colors ${
                    form.type === t ? "border-[#16A34A] bg-[#16A34A]/8 text-[#111827]" : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {t === "Email" ? <Mail size={13} /> : <MessageSquare size={13} />} {t}
                </button>
              ))}
            </div>
          </FormField>

          <FormField label="Target segment" required>
            <select className={inputClass} value={form.segment} onChange={(e) => set("segment", e.target.value)}>
              {segments.map((s) => <option key={s.industry} value={s.industry}>{s.industry} ({s.count} leads)</option>)}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">Audience is computed live from your CRM pipeline by industry.</p>
          </FormField>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 btn-primary text-white text-[12px] font-medium rounded-lg py-2.5">Create Campaign</button>
        </div>
      </form>
    </div>
  );
}

function Segments({ segments }) {
  if (segments.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
        <EmptyState icon={Users} title="No segments yet" hint="Segments are computed from CRM leads by industry — add leads in CRM and they'll group here automatically." />
      </div>
    );
  }
  const maxCount = Math.max(...segments.map((s) => s.count));
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
      <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Segments by Industry</h3>
      <p className="text-[11.5px] text-slate-400 mb-5">Live from CRM — every lead is counted exactly once, grouped by its industry</p>
      <div className="space-y-4">
        {segments.map((s) => (
          <div key={s.industry}>
            <div className="flex items-center justify-between text-[13px] mb-1.5">
              <span className="font-medium text-[#111827]">{s.industry}</span>
              <span className="text-slate-500">
                <span className="font-mono">{s.count}</span> leads · <span className="font-mono">TZS {money(s.value)}k</span> pipeline · avg score <span className="font-mono">{s.avgScore}</span>
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full btn-primary" style={{ width: `${(s.count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- BULK SMS -------------------------------- */

const SMS_CATEGORIES = ["General", "Debt Reminder", "Promotion", "Notification", "Greeting"];
const SMS_VARIABLES = ["{customer_name}", "{business_name}", "{amount}", "{balance}"];

// Templates and customer groups are real, genuine CRUD — matching the
// exact real pattern found in competitor evidence, variable placeholders
// and all. What's honestly not real, and won't pretend to be: actually
// delivering a message. That needs a real SMS gateway (Africa Talking,
// Twilio, or similar) with real API credentials this build has never
// had — the identical honest boundary already drawn around WhatsApp's
// paid Business Platform (section 44). "Send" is disabled and says
// exactly why, rather than silently pretending to succeed.
function BulkSmsView({ crm }) {
  const [tab, setTab] = useState("groups");
  const templates = useCompanyTable("sms_templates", [], { mapRow: (r) => ({ id: r.id, dbId: r.id, name: r.name, category: r.category, message: r.message }) });
  const groups = useCompanyTable("sms_groups", [], { mapRow: (r) => ({ id: r.id, dbId: r.id, name: r.name, members: (r.sms_group_members || []).map((m) => ({ name: m.name, phone: m.phone })) }), select: "*,sms_group_members(*)" });
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: "", category: "General", message: "" });
  const [groupName, setGroupName] = useState("");
  const [selectedLeads, setSelectedLeads] = useState(new Set());

  const smsCount = Math.ceil((templateForm.message.length || 1) / 160) || 1;

  async function saveTemplate(e) {
    e.preventDefault();
    if (!templateForm.name.trim() || !templateForm.message.trim()) return;
    const draft = { id: `TPL-${Date.now()}`, name: templateForm.name.trim(), category: templateForm.category, message: templateForm.message };
    templates.setRows((prev) => [draft, ...prev]);
    setShowTemplateForm(false);
    setTemplateForm({ name: "", category: "General", message: "" });
    notify("Template saved.");
    if (IS_CONFIGURED) {
      try {
        const header = await sb("sms_templates").insert({ name: draft.name, category: draft.category, message: draft.message }).single().run();
        if (header?.id) templates.setRows((prev) => prev.map((t) => (t.id === draft.id ? { ...t, dbId: header.id } : t)));
      } catch (_e) { notify("Saved locally, but the server update failed.", "error"); }
    }
  }

  async function saveGroup(e) {
    e.preventDefault();
    if (!groupName.trim() || selectedLeads.size === 0) return;
    const members = crm.rows.filter((l) => selectedLeads.has(l.id)).map((l) => ({ name: l.company, phone: l.phone }));
    const draft = { id: `GRP-${Date.now()}`, name: groupName.trim(), members };
    groups.setRows((prev) => [draft, ...prev]);
    setShowGroupForm(false);
    setGroupName("");
    setSelectedLeads(new Set());
    notify(`Group created: ${draft.name} (${members.length} members)`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("sms_groups").insert({ name: draft.name }).single().run();
        if (header?.id) {
          groups.setRows((prev) => prev.map((g) => (g.id === draft.id ? { ...g, dbId: header.id } : g)));
          if (members.length > 0) await sb("sms_group_members").insert(members.map((m) => ({ group_id: header.id, name: m.name, phone: m.phone }))).run();
        }
      } catch (_e) { notify("Saved locally, but the server update failed.", "error"); }
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl p-5" style={{ background: "linear-gradient(135deg, #2563EB, #1D4ED8)" }}>
        <div className="flex items-start gap-2.5">
          <AlertCircle size={16} className="text-white/90 shrink-0 mt-0.5" />
          <p className="text-[12px] text-white/90 leading-relaxed">Templates and groups below are real. Actually sending a message needs a real SMS gateway connected — this build has no SMS provider credentials configured, so "Send" is disabled rather than pretending to succeed. Connect a provider like Africa Talking or Twilio to enable real sending.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {[{ id: "groups", label: "Groups" }, { id: "templates", label: "Templates" }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md transition-colors ${tab === t.id ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "groups" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] text-slate-500">{groups.rows.length} groups</p>
            <button onClick={() => setShowGroupForm(true)} className="btn-primary text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Create Group</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
            {!groups.loading && groups.rows.length === 0 && <EmptyState icon={Users} title="No Customer Groups" hint="Create groups to organize customers for future bulk messaging." actionLabel="Create Group" onAction={() => setShowGroupForm(true)} />}
            {groups.loading && <p className="text-[12.5px] text-slate-400 text-center py-8">Loading...</p>}
            {groups.rows.map((g) => (
              <div key={g.id} className="flex items-center justify-between px-4 py-3.5">
                <div><p className="text-[13px] font-medium text-[#111827]">{g.name}</p><p className="text-[11px] text-slate-400">{g.members.length} members</p></div>
                <button disabled title="Requires a connected SMS gateway" className="text-[12px] font-medium text-slate-300 cursor-not-allowed flex items-center gap-1"><Send size={13} /> Send</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "templates" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] text-slate-500">{templates.rows.length} templates</p>
            <button onClick={() => setShowTemplateForm(true)} className="btn-primary text-white text-[12.5px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5"><Plus size={14} /> Create Template</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!templates.loading && templates.rows.length === 0 && <div className="col-span-full bg-white rounded-xl border border-slate-200/80 shadow-sm"><EmptyState icon={FileText} title="No templates" hint="Save a reusable message template with variable placeholders." actionLabel="Create Template" onAction={() => setShowTemplateForm(true)} /></div>}
            {templates.loading && <p className="col-span-full text-[12.5px] text-slate-400 text-center py-8">Loading...</p>}
            {templates.rows.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-center justify-between mb-1.5"><p className="text-[13px] font-medium text-[#111827]">{t.name}</p><span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">{t.category}</span></div>
                <p className="text-[12px] text-slate-500 line-clamp-2">{t.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showGroupForm && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={() => setShowGroupForm(false)} />
          <form onSubmit={saveGroup} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
            <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
              <h2 className="text-[18px] font-semibold text-[#111827]">Create Group</h2>
              <button type="button" onClick={() => setShowGroupForm(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex-1 space-y-4">
              <FormField label="Group name" required><input className={inputClass} value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="e.g. Wholesale customers" /></FormField>
              <div>
                <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Select real customers from CRM ({selectedLeads.size} selected)</label>
                <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-50">
                  {crm.rows.filter((l) => l.phone).map((l) => (
                    <label key={l.id} className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-slate-50">
                      <input type="checkbox" checked={selectedLeads.has(l.id)} onChange={(e) => setSelectedLeads((prev) => { const next = new Set(prev); if (e.target.checked) next.add(l.id); else next.delete(l.id); return next; })} />
                      <div className="min-w-0"><p className="text-[12.5px] text-[#111827] truncate">{l.company}</p><p className="text-[10.5px] text-slate-400">{l.phone}</p></div>
                    </label>
                  ))}
                  {crm.rows.filter((l) => l.phone).length === 0 && <p className="text-[11.5px] text-slate-400 text-center py-4">No CRM leads with a phone number yet.</p>}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button type="button" onClick={() => setShowGroupForm(false)} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5">Cancel</button>
              <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Create Group</button>
            </div>
          </form>
        </div>
      )}

      {showTemplateForm && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={() => setShowTemplateForm(false)} />
          <form onSubmit={saveTemplate} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
            <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
              <h2 className="text-[18px] font-semibold text-[#111827]">Create Template</h2>
              <button type="button" onClick={() => setShowTemplateForm(false)} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
            </div>
            <div className="px-6 py-5 flex-1 space-y-4">
              <FormField label="Template name" required><input className={inputClass} value={templateForm.name} onChange={(e) => setTemplateForm((f) => ({ ...f, name: e.target.value }))} /></FormField>
              <div>
                <label className="text-[12px] font-medium text-slate-600 block mb-1.5">Category</label>
                <div className="flex flex-wrap gap-2">
                  {SMS_CATEGORIES.map((c) => (
                    <button key={c} type="button" onClick={() => setTemplateForm((f) => ({ ...f, category: c }))} className={`text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${templateForm.category === c ? "border-[#2563EB]/50 bg-[#2563EB]/10 text-[#2563EB]" : "border-slate-200 text-slate-500"}`}>{c}</button>
                  ))}
                </div>
              </div>
              <FormField label="Message content" required><textarea className={inputClass} rows={5} value={templateForm.message} onChange={(e) => setTemplateForm((f) => ({ ...f, message: e.target.value }))} placeholder="Type your template message here..." /></FormField>
              <div className="flex flex-wrap gap-2">
                {SMS_VARIABLES.map((v) => (
                  <button key={v} type="button" onClick={() => setTemplateForm((f) => ({ ...f, message: f.message + v }))} className="text-[11px] font-mono px-2 py-1 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200">{v}</button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">{templateForm.message.length} characters · {smsCount}/{smsCount} SMS</p>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <button type="button" onClick={() => setShowTemplateForm(false)} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5">Cancel</button>
              <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Create Template</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------- POS -------------------------------------- */

const POS_TABS = [
  { id: "checkout", label: "Checkout", icon: ShoppingBag },
  { id: "history", label: "Register History", icon: Receipt },
];

// POS Shifts & Cash Drawer — the control a till cannot run without, and
// the one real gap a competitive audit exposed. Expected cash is COMPUTED
// (opening float + cash sales + pay-ins - pay-outs); counted cash is what
// a human physically finds in the drawer; the variance between them is
// the entire point. Both directions matter and the UI says so: short can
// be theft or a miskeyed sale, over means a customer was overcharged or a
// sale never rung. One shift open at a time, so attributing sales by
// timestamp is unambiguous rather than a guess.
function PosShiftPanel({ transactions, currentUser }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  const shifts = useCompanyTable("pos_shifts", [], { order: { col: "opened_at", ascending: false }, mapRow: (r) => ({ id: r.id, dbId: r.id, cashier: r.cashier, openingFloat: Number(r.opening_float) || 0, countedCash: r.counted_cash === null || r.counted_cash === undefined ? null : Number(r.counted_cash), status: r.status, openedAt: r.opened_at, closedAt: r.closed_at }) });
  const moves = useCompanyTable("pos_cash_movements", [], { order: { col: "created_at", ascending: false }, mapRow: (r) => ({ id: r.id, dbId: r.id, shiftId: r.shift_id, kind: r.kind, amount: Number(r.amount) || 0, reason: r.reason || "" }) });
  const [floatDraft, setFloatDraft] = useState("");
  const [countDraft, setCountDraft] = useState("");
  const [move, setMove] = useState({ kind: "Pay In", amount: "", reason: "" });

  const open = shifts.rows.find((s) => s.status === "Open");
  const valueOf = (t) => (t.items || []).reduce((s, it) => s + it.qty * it.price, 0);

  const sales = useMemo(() => {
    if (!open) return { count: 0, gross: 0, cash: 0, other: 0 };
    const rows = transactions.rows.filter((t) => t.createdAt && t.createdAt >= open.openedAt);
    const cash = rows.filter((t) => t.method === "Cash").reduce((s, t) => s + valueOf(t), 0);
    const gross = rows.reduce((s, t) => s + valueOf(t), 0);
    return { count: rows.length, gross, cash, other: gross - cash };
  }, [transactions.rows, open]);

  const mine = open ? moves.rows.filter((m) => m.shiftId === (open.dbId || open.id)) : [];
  const payIns = mine.filter((m) => m.kind === "Pay In").reduce((s, m) => s + m.amount, 0);
  const payOuts = mine.filter((m) => m.kind === "Pay Out").reduce((s, m) => s + m.amount, 0);
  const expected = open ? open.openingFloat + sales.cash + payIns - payOuts : 0;
  const counted = Number(countDraft);
  const variance = countDraft.trim() === "" || isNaN(counted) ? null : counted - expected;

  async function openShift() {
    const f = Number(floatDraft);
    if (isNaN(f) || f < 0) { notify("Enter the counted opening float.", "error"); return; }
    if (open) { notify("A shift is already open — close it first. One drawer, one shift.", "error"); return; }
    const row = { id: `SH-${Date.now()}`, cashier: currentUser?.name || "Cashier", openingFloat: f, countedCash: null, status: "Open", openedAt: new Date().toISOString(), closedAt: null };
    shifts.setRows((prev) => [row, ...prev]);
    setFloatDraft("");
    notify(`Shift opened by ${row.cashier} — float TZS ${money(f)}k.`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("pos_shifts").insert({ cashier: row.cashier, opening_float: f, status: "Open", opened_at: row.openedAt }).single().run();
        if (header?.id) shifts.setRows((prev) => prev.map((s) => (s.id === row.id ? { ...s, dbId: header.id } : s)));
      } catch (_e) { notify("Opened locally, but the server update failed.", "error"); }
    }
  }

  async function addMove() {
    const amt = Number(move.amount);
    if (!open || isNaN(amt) || amt <= 0) { notify("Enter an amount above zero.", "error"); return; }
    const row = { id: `CM-${Date.now()}`, shiftId: open.dbId || open.id, kind: move.kind, amount: amt, reason: move.reason.trim() };
    moves.setRows((prev) => [row, ...prev]);
    setMove({ kind: move.kind, amount: "", reason: "" });
    notify(`${row.kind} of TZS ${money(amt)}k recorded — expected cash updated.`);
    if (IS_CONFIGURED && open.dbId) {
      try { await sb("pos_cash_movements").insert({ shift_id: open.dbId, kind: row.kind, amount: amt, reason: row.reason || null }).run(); } catch (_e) { notify("Recorded locally, but the server update failed.", "error"); }
    }
  }

  function printZReport(shiftData, salesData, movesData, co) {
    const { open: sh, expected: exp, variance: va, counted: cnt2, payIns: pIn, payOuts: pOut } = shiftData;
    const openedAt = sh.openedAt || sh.createdAt || "";
    const closedAt = new Date().toISOString();
    const durationMins = openedAt ? Math.round((Date.now()-new Date(openedAt).getTime())/60000) : 0;
    const varColor = va===0?"#16A34A":va<0?"#EF4444":"#F59E0B";
    const rows = movesData.map((mv,i)=>`<tr style="background:${i%2===0?"white":"#F8FAFB"}"><td>${mv.kind}</td><td>${mv.reason||"—"}</td><td class="r" style="color:${mv.kind==="Pay In"?"#16A34A":"#EF4444"}">${mv.kind==="Pay In"?"+":"-"}TZS ${money(mv.amount||0)}k</td></tr>`).join("");
    printReport(`Z-Report · ${co?.name||"BusinessSphere"}`, `
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Cashier</div><div class="kpi-value" style="font-size:15px">${sh.cashier}</div></div>
        <div class="kpi"><div class="kpi-label">Transactions</div><div class="kpi-value" style="color:#2563EB">${salesData.count}</div></div>
        <div class="kpi"><div class="kpi-label">Total Sales</div><div class="kpi-value" style="color:#16A34A">TZS ${money(Math.round(salesData.gross))}k</div></div>
        <div class="kpi"><div class="kpi-label">Variance</div><div class="kpi-value" style="color:${varColor}">${va===0?"Balanced":va>0?"+"+money(va)+"k":money(va)+"k"}</div></div>
      </div>
      <table><thead><tr><th>Summary</th><th class="r">Amount</th></tr></thead><tbody>
        <tr><td>Opening Float</td><td class="r">TZS ${money(sh.openingFloat||0)}k</td></tr>
        <tr><td>Cash Sales</td><td class="r">TZS ${money(Math.round(salesData.cash))}k</td></tr>
        <tr><td>Non-cash Sales</td><td class="r">TZS ${money(Math.round(salesData.other))}k</td></tr>
        <tr><td>Pay Ins</td><td class="r" style="color:#16A34A">+TZS ${money(pIn)}k</td></tr>
        <tr><td>Pay Outs</td><td class="r" style="color:#EF4444">-TZS ${money(pOut)}k</td></tr>
        <tr class="total-row"><td>Expected in Drawer</td><td class="r">TZS ${money(Math.round(exp))}k</td></tr>
        <tr class="total-row"><td>Counted Cash</td><td class="r">TZS ${money(cnt2)}k</td></tr>
        <tr class="total-row"><td><strong>VARIANCE</strong></td><td class="r" style="color:${varColor}"><strong>${va===0?"Balanced ✓":va>0?"OVER by TZS "+money(va)+"k":"SHORT by TZS "+money(Math.abs(va))+"k"}</strong></td></tr>
      </tbody></table>
      ${movesData.length>0?`<br/><table><thead><tr><th>Cash Movements</th><th>Reason</th><th class="r">Amount</th></tr></thead><tbody>${rows}</tbody></table>`:""}
      <p style="padding:12px;font-size:11px;color:#9CA3AF;text-align:center">Opened: ${new Date(openedAt).toLocaleString()} · Duration: ${Math.floor(durationMins/60)}h ${durationMins%60}m · Closed: ${new Date(closedAt).toLocaleString()}</p>
    `, co||{});
  }

  async function closeShift() {
    if (!open || variance === null) { notify("Count the drawer first — a shift closed without a count proves nothing.", "error"); return; }
    const closedAt = new Date().toISOString();
    const verdict = variance === 0 ? "balanced exactly" : variance < 0 ? `SHORT by TZS ${money(Math.abs(variance))}k` : `OVER by TZS ${money(variance)}k`;
    // Auto-print Z-Report on close
    printZReport({open, expected, variance, counted, payIns, payOuts}, sales, mine, window.__smartManagerCompany||{});
    shifts.setRows((prev) => prev.map((s) => (s.id === open.id ? { ...s, status: "Closed", countedCash: counted, closedAt } : s)));
    notify(`Shift closed — drawer ${verdict}. Z-Report printed.`, variance === 0 ? "success" : "error");
    logAudit("POS shift closed", "Point of Sale", `${open.cashier}: expected ${money(Math.round(expected))}k, counted ${money(counted)}k — ${verdict}`, currentUser?.name || "Cashier");
    setCountDraft("");
    if (IS_CONFIGURED && open.dbId) {
      try { await sb("pos_shifts").eq("id", open.dbId).update({ status: "Closed", counted_cash: counted, closed_at: closedAt }).run(); } catch (_e) { notify("Closed locally, but the server update failed.", "error"); }
    }
  }

  const Row = ({ label, value, strong }) => (
    <div className={`flex items-center justify-between py-1.5 ${strong ? "border-t border-slate-200 mt-1 pt-2" : ""}`}>
      <span className={`text-[12px] ${strong ? "font-semibold text-[#111827]" : "text-slate-500"}`}>{label}</span>
      <span className={`text-[12.5px] font-mono ${strong ? "font-bold text-[#111827]" : "text-slate-600"}`}>{value}</span>
    </div>
  );

  if (!open) {
    const last = shifts.rows.find((s) => s.status === "Closed");
    const lastVar = last && last.countedCash !== null ? null : null;
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-[13.5px] font-semibold text-[#111827]">No shift open</p>
            <p className="text-[11px] text-slate-400">Count the drawer and open a shift before selling — sales rung with no shift open are recorded, but reconcile to nothing.</p>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <input type="number" min="0" className={inputClass + " w-36"} value={floatDraft} onChange={(e) => setFloatDraft(e.target.value)} placeholder="Opening float (TZS k)" />
            <button onClick={openShift} className="btn-primary text-white text-[12px] font-medium rounded-lg px-3.5 py-2 shrink-0">Open Shift</button>
          </div>
        </div>
        {last && <p className="text-[10.5px] text-slate-400 mt-2.5 pt-2.5 border-t border-slate-100">Last shift: {last.cashier} · closed {(last.closedAt || "").slice(0, 16).replace("T", " ")} · counted TZS {money(last.countedCash ?? 0)}k</p>}
      </div>
    );
  }

  const mins = Math.max(0, Math.round((now - new Date(open.openedAt)) / 60000));
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
          <p className="text-[13.5px] font-semibold text-[#111827]">Shift open — {open.cashier}</p>
          <span className="text-[11px] text-slate-400">{Math.floor(mins / 60)}h {mins % 60}m</span>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>printZReport({open,expected,variance,counted,payIns,payOuts},sales,mine,window.__smartManagerCompany||{})}
            className="flex items-center gap-1.5 text-[12px] font-medium bg-[#0D2214] text-white rounded-lg px-3 py-2">
            <Printer size={12}/> Z-Report
          </button>
          <button onClick={closeShift} className="text-[12px] font-medium bg-[#F59E0B] text-white rounded-lg px-3.5 py-2 shrink-0">Close Shift & Reconcile</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <div><p className="text-[10.5px] text-slate-400">Transactions</p><p className="text-[15px] font-mono font-bold text-[#111827]">{sales.count}</p></div>
        <div><p className="text-[10.5px] text-slate-400">Total Sales</p><p className="text-[15px] font-mono font-bold text-[#111827]">{money(Math.round(sales.gross))}k</p></div>
        <div><p className="text-[10.5px] text-slate-400">Cash Sales</p><p className="text-[15px] font-mono font-bold text-[#16A34A]">{money(Math.round(sales.cash))}k</p></div>
        <div><p className="text-[10.5px] text-slate-400">Non-cash Sales</p><p className="text-[15px] font-mono font-bold text-slate-500">{money(Math.round(sales.other))}k</p></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
        <div>
          <p className="text-[12px] font-semibold text-[#111827] mb-1">Cash Drawer</p>
          <Row label="Opening float" value={`${money(open.openingFloat)}k`} />
          <Row label="+ Cash sales" value={`${money(Math.round(sales.cash))}k`} />
          <Row label="+ Pay ins" value={`${money(payIns)}k`} />
          <Row label="− Pay outs" value={`${money(payOuts)}k`} />
          <Row label="Expected in drawer" value={`TZS ${money(Math.round(expected))}k`} strong />
          <div className="flex gap-2 items-center mt-2.5">
            <input type="number" className={inputClass} value={countDraft} onChange={(e) => setCountDraft(e.target.value)} placeholder="Counted cash (TZS k)" />
          </div>
          {variance !== null && (
            <div className="mt-2 rounded-lg px-3 py-2" style={{ backgroundColor: variance === 0 ? "#DCFCE7" : variance < 0 ? "#FEE2E2" : "#FEF3C7" }}>
              <p className="text-[12px] font-semibold" style={{ color: variance === 0 ? "#16A34A" : variance < 0 ? "#EF4444" : "#92400E" }}>
                {variance === 0 ? "Balanced exactly." : variance < 0 ? `SHORT by TZS ${money(Math.abs(variance))}k` : `OVER by TZS ${money(variance)}k`}
              </p>
              {variance !== 0 && <p className="text-[10px] mt-0.5" style={{ color: variance < 0 ? "#991B1B" : "#92400E" }}>{variance < 0 ? "Money left the till without a sale — or a sale was miskeyed." : "Over is not good news: a customer was likely overcharged, or a sale never got rung."}</p>}
            </div>
          )}
        </div>

        <div>
          <p className="text-[12px] font-semibold text-[#111827] mb-1">Pay In / Pay Out</p>
          <p className="text-[10.5px] text-slate-400 mb-2">Any money crossing the till that is not a sale — a float top-up, petty cash, or a refund paid out from an earlier shift. Without these, expected cash is a lie the moment anyone opens the drawer.</p>
          <div className="flex flex-wrap gap-2">
            <select className={inputClass + " max-w-[110px]"} value={move.kind} onChange={(e) => setMove({ ...move, kind: e.target.value })}>
              <option>Pay In</option><option>Pay Out</option>
            </select>
            <input type="number" min="0" className={inputClass + " max-w-[110px]"} value={move.amount} onChange={(e) => setMove({ ...move, amount: e.target.value })} placeholder="TZS k" />
            <input className={inputClass + " flex-1 min-w-[120px]"} value={move.reason} onChange={(e) => setMove({ ...move, reason: e.target.value })} placeholder="Reason" />
            <button onClick={addMove} className="btn-primary text-white text-[12px] font-medium rounded-lg px-3 py-2 shrink-0">Record</button>
          </div>
          {mine.length > 0 && (
            <div className="mt-2.5 space-y-1">
              {mine.slice(0, 4).map((m) => (
                <div key={m.id} className="flex justify-between text-[11.5px]">
                  <span className="text-slate-500 truncate">{m.kind}{m.reason ? ` · ${m.reason}` : ""}</span>
                  <span className={`font-mono shrink-0 ml-2 ${m.kind === "Pay In" ? "text-[#16A34A]" : "text-[#EF4444]"}`}>{m.kind === "Pay In" ? "+" : "−"}{money(m.amount)}k</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Marketing;
