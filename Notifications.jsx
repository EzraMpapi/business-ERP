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


function Notifications({ inventory, invoices, expenses, leaveRequests, workOrders, subscriptions, canManage, currentUser, smartAlerts, onNavigate }) {
  const [tab, setTab] = useState("channels");
  const channels = useCompanyTable("notification_channels", notificationChannelsSeed, { mapRow: mapNotificationChannelRow });
  const rules = useCompanyTable("notification_rules", notificationRulesSeed, { mapRow: mapNotificationRuleRow });
  const log = useCompanyTable("notification_log", notificationLogSeed, { order: { col: "created_at", ascending: false }, mapRow: mapNotificationLogRow });
  const alerts = useBusinessAlerts({ inventory, invoices, expenses, leaveRequests, workOrders, subscriptions });

  const enabledCount = channels.rows.filter((c) => c.enabled).length;
  const functionalEnabled = channels.rows.filter((c) => c.enabled && NOTIFICATION_CHANNELS.find((n) => n.id === c.id)?.functional).length;

  // Notification inbox — derives from smart alerts + audit log + approvals
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("bs_read_notifs")||"[]")); } catch(_e) { return new Set(); }
  });
  function markRead(id) {
    setReadIds(prev => {
      const next = new Set(prev); next.add(id);
      try { localStorage.setItem("bs_read_notifs", JSON.stringify([...next].slice(-200))); } catch(_e){}
      return next;
    });
  }
  function markAllRead() {
    const allIds = [...(smartAlerts||[]).map(a=>a.id), ...log.rows.map(r=>r.id)];
    setReadIds(prev => {
      const next = new Set([...prev, ...allIds]);
      try { localStorage.setItem("bs_read_notifs", JSON.stringify([...next].slice(-200))); } catch(_e){}
      return next;
    });
  }
  const unreadCount = (smartAlerts||[]).filter(a=>!readIds.has(a.id)).length + log.rows.slice(0,20).filter(r=>!readIds.has(r.id)).length;

  async function logDispatch(entry) {
    const draft = { id: `LOG-${Date.now()}`, ...entry, timestamp: new Date().toISOString() };
    log.setRows((prev) => [draft, ...prev].slice(0, 100));
    if (IS_CONFIGURED) {
      try { await sb("notification_log").insert({ channel: entry.channel, event: entry.event, message: entry.message, status: entry.status, note: entry.note }).run(); } catch (_e) { /* logging failures shouldn't block the notification flow itself */ }
    }
  }

  return (
    {/* ── Smart Alerts Panel ── */}
    {smartAlerts && smartAlerts.length > 0 && (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-bold text-[#111827]">⚡ Smart Alerts ({smartAlerts.length})</p>
          <span className="text-[11px] text-slate-400">Auto-detected across all modules</span>
        </div>
        <div className="space-y-2">
          {smartAlerts.map(alert => {
            const ap = ALERT_PRIORITY[alert.priority] || ALERT_PRIORITY.medium;
            return (
              <div key={alert.id} className="flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all" style={{background:ap.bg,borderColor:ap.border}} onClick={()=>onNavigate&&onNavigate(alert.module)}>
                <span className="text-[20px] shrink-0">{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-semibold" style={{color:ap.text}}>{alert.title}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase" style={{background:ap.badge,color:ap.badgeText}}>{alert.priority}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">{alert.category}</span>
                  </div>
                  <p className="text-[12px] mt-0.5" style={{color:ap.text+"CC"}}>{alert.detail}</p>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">{alert.action}</span>
                  <ChevronRight size={13} className="text-slate-300"/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    )}
    <div className="space-y-5">
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Notifications</h1>
        <p className="text-[13px] text-slate-500 mt-1">Configure delivery channels and route real business alerts to them</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {NOTIF_TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className={`text-[12px] font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 whitespace-nowrap transition-colors ${isActive ? "bg-white text-[#111827] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      <StatRow items={[
        { label: "Channels Enabled", value: String(enabledCount), sub: `of ${NOTIFICATION_CHANNELS.length}` },
        { label: "Functional Channels On", value: String(functionalEnabled), sub: "Slack / Teams only" },
        { label: "Active Business Alerts", value: String(alerts.length), color: alerts.length > 0 ? "text-[#F59E0B]" : undefined },
        { label: "Dispatches Logged", value: String(log.rows.length) },
      ]} />

      {tab === "inbox" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-[13.5px] font-bold text-[#111827]">Notification Inbox</p>
              {unreadCount > 0 && (
                <span className="text-[11px] font-black text-white bg-[#EF4444] px-2 py-0.5 rounded-full">{unreadCount} unread</span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[12px] font-semibold text-[#16A34A] hover:text-[#15803D]">
                ✓ Mark all read
              </button>
            )}
          </div>

          {/* Active smart alerts as priority notifications */}
          {(smartAlerts||[]).length > 0 && (
            <div className="space-y-2">
              <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide">Active Alerts</p>
              {(smartAlerts||[]).map(alert => {
                const ap = ALERT_PRIORITY[alert.priority] || ALERT_PRIORITY.medium;
                const isRead = readIds.has(alert.id);
                return (
                  <div key={alert.id} onClick={()=>{ markRead(alert.id); onNavigate&&onNavigate(alert.module); }}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer hover:shadow-sm transition-all ${isRead?"opacity-50":""}`}
                    style={{background:ap.bg, borderColor:ap.border}}>
                    <span className="text-[18px] shrink-0">{alert.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-semibold" style={{color:ap.text}}>{alert.title}</p>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase" style={{background:ap.badge,color:ap.badgeText}}>{alert.priority}</span>
                        {!isRead && <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0"/>}
                      </div>
                      <p className="text-[12px] mt-0.5 text-slate-600">{alert.detail}</p>
                    </div>
                    <button onClick={e=>{e.stopPropagation();markRead(alert.id);}} className="shrink-0 text-[10.5px] text-slate-400 hover:text-slate-600 px-2 py-1 rounded">
                      {isRead?"✓":"Mark read"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dispatch log as recent activity feed */}
          {log.rows.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide">Recent Dispatches</p>
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
                {log.rows.slice(0,15).map((entry) => {
                  const isRead = readIds.has(entry.id);
                  const statusColor = entry.status==="sent"?"#16A34A":entry.status==="error"?"#EF4444":"#F59E0B";
                  return (
                    <div key={entry.id} onClick={()=>markRead(entry.id)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors ${isRead?"":"bg-[#FFFBEB]"}`}>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isRead?"bg-slate-200":"bg-[#F59E0B]"}`}/>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold text-[#111827] truncate">{entry.event||entry.message}</p>
                        <p className="text-[11px] text-slate-400 truncate">{entry.channel} · {entry.message}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:statusColor+"15",color:statusColor}}>
                          {entry.status}
                        </span>
                        <p className="text-[10px] text-slate-300 mt-0.5">{entry.timestamp?.slice(0,16).replace("T"," ")||""}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {(smartAlerts||[]).length === 0 && log.rows.length === 0 && (
            <div className="py-16 text-center">
              <Bell size={28} className="text-slate-200 mx-auto mb-3"/>
              <p className="text-[13px] font-semibold text-slate-400">No notifications yet</p>
              <p className="text-[11.5px] text-slate-300 mt-1">Smart alerts and dispatch history appear here as business events occur</p>
            </div>
          )}
        </div>
      )}
      {tab === "channels" && <NotificationChannels channels={channels} onLog={logDispatch} canManage={canManage} currentUser={currentUser} />}
      {tab === "routing" && <AlertRouting rules={rules} channels={channels.rows} alerts={alerts} onLog={logDispatch} />}
      {tab === "log" && <NotificationLog log={log} />}
    </div>
  );
}

/* ------------------------------- NOTIFICATION CHANNELS ------------------------------- */

function NotificationChannels({ channels, onLog, canManage, currentUser }) {
  const { rows, setRows, loading } = channels;
  const [testing, setTesting] = useState(null);

  function getChannel(id) { return rows.find((c) => c.id === id) || {}; }

  async function updateField(id, key, value) {
    if (!canManage) return;
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    if (IS_CONFIGURED) {
      const c = rows.find((x) => x.id === id);
      try {
        await sb("notification_channels").eq("channel_id", id).update({ [key === "enabled" ? "enabled" : key]: value }).run();
      } catch (_e) { /* saved locally regardless; a background sync failure is not worth interrupting typing */ }
    }
  }

  async function sendTest(meta) {
    const config = getChannel(meta.id);
    if (!config.enabled) { notify(`Enable ${meta.name} first.`, "error"); return; }
    setTesting(meta.id);
    if (meta.functional) {
      const result = await sendWebhookNotification(config.webhookUrl, `Test notification from Smart Manager — if you can see this, ${meta.name} is connected correctly.`);
      notify(result.note, result.ok ? undefined : "error");
      onLog({ channel: meta.name, event: "Test notification", message: "Manual test send", status: result.ok ? "Sent" : "Failed", note: result.note });
    } else {
      notify(`${meta.name} needs a backend integration to actually send — see the note below. Nothing was dispatched.`, "error");
      onLog({ channel: meta.name, event: "Test notification", message: "Manual test send", status: "Unavailable", note: meta.requirement });
    }
    setTesting(null);
  }

  return (
    <div className="space-y-4">
      {!canManage && (
        <div className="flex items-start gap-2.5 bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-lg p-3">
          <Lock size={15} className="text-[#F59E0B] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#8a670a] leading-relaxed">
            You are viewing as {currentUser.role}. Webhook URLs are credentials — editing channel configuration requires a full-write role. You can still view settings and test enabled channels below.
          </p>
        </div>
      )}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {NOTIFICATION_CHANNELS.map((meta) => {
        const config = getChannel(meta.id);
        const Icon = meta.icon;
        return (
          <div key={meta.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#111827]/5 flex items-center justify-center"><Icon size={16} className="text-[#111827]" /></div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">{meta.name}</p>
                  {meta.functional ? (
                    <span className="text-[10px] font-medium text-[#16A34A]">Real delivery</span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-400">Needs a backend</span>
                  )}
                </div>
              </div>
              {loading ? <div className="w-9 h-5 rounded-full skeleton-shimmer" /> : (
                <ToggleSwitch on={config.enabled} disabled={!canManage} onChange={() => updateField(meta.id, "enabled", !config.enabled)} label={`${config.enabled ? "Disable" : "Enable"} ${meta.name}`} />
              )}
            </div>

            {!meta.functional && (
              <p className="text-[11.5px] text-slate-400 leading-relaxed mb-3">{meta.requirement}</p>
            )}

            <div className="space-y-2.5 mb-3">
              {meta.fields.map((f) => (
                <div key={f.key}>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">{f.label}</label>
                  <input
                    className={inputClass}
                    value={config[f.key] || ""}
                    onChange={(e) => updateField(meta.id, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    disabled={!config.enabled || !canManage}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => sendTest(meta)}
              disabled={!config.enabled || testing === meta.id}
              className={`w-full text-[12px] font-medium rounded-lg py-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${meta.functional ? "btn-primary text-white" : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              {testing === meta.id ? "Sending..." : meta.functional ? "Send Test Notification" : "Test (unavailable)"}
            </button>
          </div>
        );
      })}
    </div>
    </div>
  );
}

/* --------------------------------- ALERT ROUTING --------------------------------- */

function AlertRouting({ rules, channels, alerts, onLog }) {
  const { rows, setRows, loading } = rules;
  const [dispatching, setDispatching] = useState(false);

  function getRule(id) { return rows.find((r) => r.id === id) || { channels: [] }; }

  async function toggleChannel(alertType, channelId) {
    const rule = getRule(alertType);
    const nextChannels = rule.channels.includes(channelId) ? rule.channels.filter((c) => c !== channelId) : [...rule.channels, channelId];
    setRows((prev) => {
      const exists = prev.find((r) => r.id === alertType);
      return exists ? prev.map((r) => (r.id === alertType ? { ...r, channels: nextChannels } : r)) : [...prev, { id: alertType, channels: nextChannels }];
    });
    if (IS_CONFIGURED) {
      try { await sb("notification_rules").eq("alert_type", alertType).update({ channels: nextChannels }).run(); } catch (_e) { /* local state already reflects the change */ }
    }
  }

  async function dispatchNow() {
    if (alerts.length === 0) { notify("No active alerts to dispatch right now."); return; }
    setDispatching(true);
    let sent = 0, skipped = 0;
    for (const alert of alerts) {
      const rule = getRule(alert.id);
      for (const channelId of rule.channels) {
        const channel = channels.find((c) => c.id === channelId);
        const meta = NOTIFICATION_CHANNELS.find((n) => n.id === channelId);
        if (!channel?.enabled) { skipped++; continue; }
        const text = `[Smart Manager] ${alert.title} — ${alert.subtitle}`;
        if (meta.functional) {
          const result = await sendWebhookNotification(channel.webhookUrl, text);
          onLog({ channel: meta.name, event: alert.title, message: text, status: result.ok ? "Sent" : "Failed", note: result.note });
          if (result.ok) sent++; else skipped++;
        } else {
          onLog({ channel: meta.name, event: alert.title, message: text, status: "Unavailable", note: meta.requirement });
          skipped++;
        }
      }
    }
    notify(`Dispatch complete — ${sent} sent, ${skipped} skipped or unavailable.`);
    setDispatching(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-lg p-3">
        <ArrowUpDown size={15} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Routes the same real alerts already shown in the topbar Notification Center — nothing here is a separate alert system. "Dispatch Now" sends the alerts currently active to whichever enabled channels are checked below.
        </p>
      </div>

      <div className="flex justify-end">
        <button onClick={dispatchNow} disabled={dispatching} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-40">
          <Send size={14} /> {dispatching ? "Dispatching..." : `Dispatch Now (${alerts.length} active)`}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Alert Type</th>
                {NOTIFICATION_CHANNELS.map((c) => <th key={c.id} className="px-3 py-3 font-medium text-center">{c.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading && <SkeletonRows cols={NOTIFICATION_CHANNELS.length + 1} />}
              {!loading && ALERT_ROUTING_TYPES.map((t) => {
                const rule = getRule(t.id);
                const isActive = alerts.some((a) => a.id === t.id);
                return (
                  <tr key={t.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#111827]">{t.label}</p>
                      {isActive && <span className="text-[10px] font-medium text-[#F59E0B]">Currently active</span>}
                    </td>
                    {NOTIFICATION_CHANNELS.map((c) => (
                      <td key={c.id} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={rule.channels.includes(c.id)}
                          onChange={() => toggleChannel(t.id, c.id)}
                          className="rounded border-slate-300"
                          aria-label={`Route ${t.label} to ${c.name}`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- DISPATCH LOG --------------------------------- */

function NotificationLog({ log }) {
  const { rows, loading } = log;
  const STATUS_COLOR = { Sent: "#16A34A", Failed: "#EF4444", Unavailable: "#9CA3AF" };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[680px]">
          <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
            <th className="px-4 py-3 font-medium">Channel</th><th className="px-4 py-3 font-medium">Event</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Note</th><th className="px-4 py-3 font-medium">When</th>
          </tr></thead>
          <tbody>
            {loading && <SkeletonRows cols={5} />}
            {!loading && rows.map((l) => (
              <tr key={l.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-[#111827]">{l.channel}</td>
                <td className="px-4 py-3 text-slate-600">{l.event}</td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${STATUS_COLOR[l.status]}14`, color: STATUS_COLOR[l.status] }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLOR[l.status] }} />{l.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-400 text-[11.5px] max-w-[240px] truncate" title={l.note}>{l.note}</td>
                <td className="px-4 py-3 text-slate-400 font-mono text-[11.5px]">{new Date(l.timestamp).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={5}><EmptyState icon={FileText} title="No dispatches yet" hint="Test a channel or dispatch alerts to see the log fill in here." /></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --------------------------------- SETTINGS ----------------------------------- */

function ToggleSwitch({ on, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-9 h-5 rounded-full transition-colors shrink-0 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      style={{ backgroundColor: on ? "#16A34A" : "rgba(17,24,39,0.16)" }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

/* ─────────────────────── CONGRATULATIONS STUDIO ────────────────────────
   Professional letter templates: loyalty awards, partnership recognition,
   staff achievements, seasonal greetings. Print-ready A4 PDF output.
──────────────────────────────────────────────────────────────────────── */

const CONGRATS_TEMPLATES = [
  {
    id: "loyalty",
    label: "Top Buyer Award",
    icon: "🏆",
    subject: "Certificate of Customer Excellence",
    body: "On behalf of {company}, we are delighted to recognise {recipient} as one of our most valued customers.\n\nYour exceptional loyalty and consistent business partnership have been instrumental in our growth journey. This year, you have demonstrated outstanding commitment that sets you apart as a truly distinguished partner.\n\nWe are proud to award you our {tier} status, which comes with exclusive benefits including a {discount}% loyalty discount on all future orders.\n\nThank you for choosing us as your trusted business partner. We look forward to continuing this remarkable relationship and creating even greater success together.",
    accent: "#D97706",
    footer: "This letter is a token of our sincere appreciation.",
  },
  {
    id: "partnership",
    label: "Business Partnership",
    icon: "🤝",
    subject: "Letter of Partnership Recognition",
    body: "Dear {recipient},\n\nIt is with great pleasure that {company} formally recognises and celebrates the outstanding partnership we share with you.\n\nSince the beginning of our collaboration, you have consistently demonstrated the qualities that define a truly exceptional business partner — reliability, integrity, and a shared commitment to excellence.\n\nThis recognition is a reflection of our deep appreciation for your trust in our products and services. We are committed to continuing to deliver the highest standards of quality and service that you deserve.\n\nWe look forward to many more years of successful partnership and shared growth.",
    accent: "#2563EB",
    footer: "Wishing you continued success in all your endeavours.",
  },
  {
    id: "achievement",
    label: "Staff Achievement",
    icon: "⭐",
    subject: "Certificate of Achievement",
    body: "Dear {recipient},\n\nOn behalf of the entire team at {company}, I am delighted to congratulate you on your outstanding achievement and exceptional contribution.\n\nYour dedication, hard work, and commitment to excellence have not gone unnoticed. You have consistently gone above and beyond what is expected, and your positive impact on our organisation is truly remarkable.\n\nThis recognition is a testament to your talent, perseverance, and professional excellence. You are an inspiration to your colleagues and a cornerstone of our success.\n\nThank you for your invaluable contribution. We are proud to have you as part of our team.",
    accent: "#16A34A",
    footer: "Keep up the excellent work — the best is yet to come.",
  },
  {
    id: "seasonal",
    label: "Season's Greetings",
    icon: "🎄",
    subject: "Season's Greetings & Best Wishes",
    body: "Dear {recipient},\n\nAs the year draws to a close, we at {company} take this moment to express our heartfelt gratitude for your partnership and support throughout the year.\n\nThis year has been a journey of growth, challenges, and achievements — all made more rewarding by partners like you. Your trust in us has been our greatest motivation.\n\nWe wish you and your team a wonderful festive season filled with joy, good health, and well-deserved rest. May the coming year bring you continued success, prosperity, and happiness in all your endeavours.\n\nWith warm regards and sincere appreciation for your partnership.",
    accent: "#7C3AED",
    footer: "Thank you for an outstanding year together.",
  },
  {
    id: "anniversary",
    label: "Business Anniversary",
    icon: "🎂",
    subject: "Celebrating Our Partnership Anniversary",
    body: "Dear {recipient},\n\nToday, we celebrate a very special milestone — the anniversary of our partnership with {recipient}.\n\nLooking back over the years, we are filled with pride and gratitude for the journey we have shared together. Your loyalty, trust, and continued support have been the foundation upon which we have built our success.\n\nThis partnership is more than a business relationship — it is a bond built on mutual respect, shared values, and a commitment to excellence that we both hold dear.\n\nHere is to many more years of collaboration, growth, and shared achievement. Thank you for being an extraordinary partner.",
    accent: "#EF4444",
    footer: "Celebrating the milestones we have achieved together.",
  },
];

function CongratulationsStudio({ company }) {
  const [templateId, setTemplateId]     = useState(CONGRATS_TEMPLATES[0].id);
  const [recipient, setRecipient]       = useState("");
  const [recipientTitle, setRecTitle]   = useState("");
  const [recipientOrg, setRecOrg]       = useState("");
  const [tier, setTier]                 = useState("Gold");
  const [discount, setDiscount]         = useState("10");
  const [customBody, setCustomBody]     = useState("");
  const [senderName, setSenderName]     = useState(company?.owner || "");
  const [senderTitle, setSenderTitle]   = useState("Chief Executive Officer");
  const [sigStyle, setSigStyle]         = useState("formal"); // formal | cursive | stamp
  const [editing, setEditing]           = useState(false);

  const template = CONGRATS_TEMPLATES.find(t => t.id === templateId) || CONGRATS_TEMPLATES[0];

  // Merge variables into body
  function mergeBody(raw) {
    return (customBody || raw)
      .replace(/\{company\}/g,   company?.name || "BusinessSphere")
      .replace(/\{recipient\}/g, recipient || "Valued Partner")
      .replace(/\{tier\}/g,      tier)
      .replace(/\{discount\}/g,  discount);
  }

  // ── Print Professional Letter ─────────────────────────────────────────
  function printLetter() {
    const ACCENT = template.accent;
    const DARK   = "#0D2214";
    const co     = company || {};
    const body   = mergeBody(template.body);
    const today  = new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});

    const paragraphs = body.split("\n\n").map(p =>
      `<p style="margin-bottom:14px;line-height:1.75;font-size:13.5px;color:#374151">${p.replace(/\n/g,"<br/>")}</p>`
    ).join("");

    const sigBlock = sigStyle === "cursive"
      ? `<div style="font-family:'Dancing Script',cursive;font-size:32px;color:${ACCENT};margin:4px 0 2px">${senderName}</div>`
      : sigStyle === "stamp"
      ? `<div style="display:inline-block;border:3px solid ${ACCENT};border-radius:50%;width:80px;height:80px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:${ACCENT};margin:8px 0">${(senderName||"B").charAt(0)}</div>`
      : `<div style="font-size:17px;font-weight:800;color:#111827;margin:4px 0 2px;border-bottom:2px solid ${ACCENT};display:inline-block;padding-bottom:3px">${senderName}</div>`;

    const win = window.open("","_blank","width=900,height=1200");
    if (!win) { notify("Pop-up blocked — allow pop-ups to print.", "error"); return; }

    win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
      <title>${template.subject}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800&family=Dancing+Script:wght@700&display=swap" rel="stylesheet"/>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Inter,Arial,sans-serif;background:#F3F4F6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @media print{body{background:white}.toolbar{display:none!important}}
        .page{max-width:720px;margin:24px auto;background:white;min-height:970px;display:flex;flex-direction:column;border-radius:12px;overflow:hidden;box-shadow:0 8px 48px rgba(0,0,0,.14)}
        .border-top{height:8px;background:linear-gradient(90deg,${ACCENT},${ACCENT}88)}
        .letterhead{padding:36px 48px 28px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid #F3F4F6}
        .co-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:#111827}
        .co-meta{font-size:10.5px;color:#9CA3AF;margin-top:3px;line-height:1.7}
        .doc-tag{text-align:right}
        .doc-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:${ACCENT};margin-bottom:4px}
        .doc-date{font-size:12px;color:#6B7280}
        .ref-band{padding:18px 48px;background:${ACCENT}08;border-bottom:1px solid ${ACCENT}18}
        .ref-subject{font-family:'Playfair Display',serif;font-size:17px;font-weight:700;color:#111827}
        .ref-meta{font-size:11.5px;color:#6B7280;margin-top:3px}
        .recipient-block{padding:24px 48px 12px}
        .rec-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-bottom:6px}
        .rec-name{font-size:15px;font-weight:700;color:#111827}
        .rec-detail{font-size:12px;color:#6B7280;margin-top:2px}
        .salutation{padding:0 48px 16px;font-size:13.5px;font-weight:600;color:#111827}
        .body-text{padding:0 48px;flex:1}
        .signature-block{padding:28px 48px 32px}
        .sig-label{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-bottom:10px}
        .sig-title{font-size:11.5px;color:#6B7280;margin-top:4px}
        .sig-company{font-size:11.5px;font-weight:700;color:${ACCENT};margin-top:2px}
        .footer-band{padding:14px 48px;background:${DARK};display:flex;justify-content:space-between;align-items:center;margin-top:auto}
        .footer-note{font-size:10px;color:rgba(255,255,255,.4)}
        .footer-quote{font-size:10px;font-style:italic;color:rgba(255,255,255,.5)}
        .ornament{text-align:center;padding:10px 0;font-size:24px;color:${ACCENT};opacity:.25}
        .toolbar{position:fixed;bottom:24px;right:24px;display:flex;gap:8px}
        .btn{padding:10px 20px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;border:none;font-family:Inter}
        .btn-p{background:${ACCENT};color:white}.btn-c{background:white;color:#111827;border:1.5px solid #E5E7EB}
      </style></head><body>
      <div class="page">
        <div class="border-top"></div>

        <!-- Letterhead -->
        <div class="letterhead">
          <div>
            <div class="co-name">${co.name||"BusinessSphere"}</div>
            <div class="co-meta">
              ${[co.address,co.city,"Tanzania"].filter(Boolean).join(" · ")}<br/>
              ${co.phone?"Tel: "+co.phone+" · ":""}${co.email||""}<br/>
              ${co.tin?"TIN: "+co.tin:""}
            </div>
          </div>
          <div class="doc-tag">
            <div class="doc-label">${template.icon} ${template.label}</div>
            <div class="doc-date">${today}</div>
            <div style="font-size:10px;color:#D1D5DB;margin-top:3px">Ref: ${co.name?.replace(/\s+/g,"")||"BSP"}-${Date.now().toString(36).toUpperCase().slice(-6)}</div>
          </div>
        </div>

        <!-- Subject -->
        <div class="ref-band">
          <div class="ref-subject">RE: ${template.subject}</div>
          <div class="ref-meta">${co.name||"BusinessSphere"} · Official Correspondence</div>
        </div>

        <!-- Recipient -->
        <div class="recipient-block">
          <div class="rec-label">Addressed To</div>
          <div class="rec-name">${recipient||"Valued Partner"}</div>
          ${recipientTitle ? `<div class="rec-detail">${recipientTitle}</div>` : ""}
          ${recipientOrg ? `<div class="rec-detail">${recipientOrg}</div>` : ""}
        </div>

        <!-- Salutation -->
        <div class="salutation">Dear ${recipient||"Valued Partner"},</div>

        <!-- Body -->
        <div class="body-text">${paragraphs}</div>

        <!-- Ornament -->
        <div class="ornament">— ✦ —</div>

        <!-- Signature -->
        <div class="signature-block">
          <div class="sig-label">Yours sincerely,</div>
          ${sigBlock}
          <div class="sig-title">${senderTitle}</div>
          <div class="sig-company">${co.name||"BusinessSphere"}</div>
          ${co.phone?`<div style="font-size:10.5px;color:#9CA3AF;margin-top:2px">${co.phone}</div>`:""}
          ${co.email?`<div style="font-size:10.5px;color:#9CA3AF">${co.email}</div>`:""}
        </div>

        <!-- Footer -->
        <div class="footer-band">
          <div class="footer-note">${co.name||"BusinessSphere"} · ${co.address||""} · Tanzania</div>
          <div class="footer-quote">"${template.footer}"</div>
        </div>
      </div>

      <div class="toolbar">
        <button class="btn btn-c" onclick="window.close()">Close</button>
        <button class="btn btn-p" onclick="window.print()">Print / Save PDF</button>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(()=>win.focus(), 200);
    notify("Letter ready — print or save as PDF");
  }

  const mergedPreview = mergeBody(customBody || template.body);

  return (
    <div className="p-5 space-y-5">
      {/* Template picker */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Choose Template</p>
        <div className="flex flex-wrap gap-2">
          {CONGRATS_TEMPLATES.map(t => (
            <button key={t.id} onClick={()=>{ setTemplateId(t.id); setCustomBody(""); setEditing(false); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12.5px] font-semibold transition-all ${
                templateId===t.id
                  ? "text-white shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
              style={templateId===t.id?{background:t.accent,borderColor:t.accent}:{}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Fields */}
        <div className="space-y-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Recipient Details</p>
          <div>
            <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Full Name / Organisation *</label>
            <input className={inputClass} value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="e.g. Baraka Hotels & Resorts"/>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Title / Role</label>
              <input className={inputClass} value={recipientTitle} onChange={e=>setRecTitle(e.target.value)} placeholder="e.g. Managing Director"/>
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Organisation</label>
              <input className={inputClass} value={recipientOrg} onChange={e=>setRecOrg(e.target.value)} placeholder="e.g. Baraka Group"/>
            </div>
          </div>

          {templateId === "loyalty" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Loyalty Tier</label>
                <select className={inputClass} value={tier} onChange={e=>setTier(e.target.value)}>
                  {["Platinum","Gold","Silver","Bronze","Member"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Discount %</label>
                <input type="number" min="0" max="100" className={inputClass} value={discount} onChange={e=>setDiscount(e.target.value)}/>
              </div>
            </div>
          )}

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide pt-2">Signatory</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Sender Name</label>
              <input className={inputClass} value={senderName} onChange={e=>setSenderName(e.target.value)} placeholder="Your full name"/>
            </div>
            <div>
              <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Title</label>
              <input className={inputClass} value={senderTitle} onChange={e=>setSenderTitle(e.target.value)}/>
            </div>
          </div>
          <div>
            <label className="text-[11.5px] font-semibold text-slate-600 block mb-1">Signature Style</label>
            <div className="flex gap-2">
              {[["formal","✍ Formal"],["cursive","𝒞 Cursive"],["stamp","◉ Stamp"]].map(([v,l])=>(
                <button key={v} onClick={()=>setSigStyle(v)}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-semibold border transition-all ${
                    sigStyle===v?"bg-[#16A34A] text-white border-[#16A34A]":"bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}>{l}</button>
              ))}
            </div>
          </div>

          {/* Body editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11.5px] font-semibold text-slate-600">Letter Body</label>
              <button onClick={()=>{setEditing(!editing); if(!editing && !customBody) setCustomBody(template.body);}}
                className="text-[11px] font-bold text-[#16A34A] hover:underline">
                {editing?"✓ Done":"✏ Customise"}
              </button>
            </div>
            {editing ? (
              <textarea
                className={inputClass+" w-full resize-none text-[12px] leading-relaxed"}
                rows={8}
                value={customBody||template.body}
                onChange={e=>setCustomBody(e.target.value)}
                placeholder="Edit the letter body…"
              />
            ) : (
              <p className="text-[11.5px] text-slate-400 italic border border-dashed border-slate-200 rounded-xl p-3 leading-relaxed">
                {mergedPreview.slice(0,200)}…
              </p>
            )}
            <p className="text-[10.5px] text-slate-400 mt-1">
              Variables: <code>{"{company}"}</code> <code>{"{recipient}"}</code> <code>{"{tier}"}</code> <code>{"{discount}"}</code>
            </p>
          </div>

          <button onClick={printLetter}
            className="w-full flex items-center justify-center gap-2 text-[13px] font-bold text-white py-3 rounded-xl shadow-sm"
            style={{background:template.accent}}>
            <Printer size={15}/> Print / Save as PDF
          </button>
        </div>

        {/* Live Preview */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Live Preview</p>
          <div className="border-2 border-dashed border-slate-200 rounded-xl overflow-hidden bg-white"
            style={{fontFamily:"Inter,sans-serif",fontSize:12}}>
            {/* Border accent */}
            <div style={{height:5,background:`linear-gradient(90deg,${template.accent},${template.accent}66)`}}/>
            {/* Mini letterhead */}
            <div style={{padding:"14px 18px",display:"flex",justifyContent:"space-between",borderBottom:"1px solid #F3F4F6"}}>
              <div>
                <div style={{fontSize:13,fontWeight:800,color:"#111827"}}>{company?.name||"BusinessSphere"}</div>
                <div style={{fontSize:9.5,color:"#9CA3AF",marginTop:2}}>{company?.address||""} · Tanzania</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:9,fontWeight:700,textTransform:"uppercase",letterSpacing:2,color:template.accent}}>{template.icon} {template.label}</div>
                <div style={{fontSize:10,color:"#9CA3AF",marginTop:2}}>{new Date().toLocaleDateString()}</div>
              </div>
            </div>
            {/* Subject band */}
            <div style={{padding:"10px 18px",background:template.accent+"0A",borderBottom:`1px solid ${template.accent}20`}}>
              <div style={{fontSize:12,fontWeight:700,color:"#111827"}}>RE: {template.subject}</div>
            </div>
            {/* Recipient + body */}
            <div style={{padding:"10px 18px",maxHeight:220,overflow:"hidden"}}>
              <div style={{fontSize:11,fontWeight:700,color:"#111827",marginBottom:2}}>{recipient||"Valued Partner"}</div>
              {recipientTitle&&<div style={{fontSize:10,color:"#6B7280"}}>{recipientTitle}</div>}
              {recipientOrg&&<div style={{fontSize:10,color:"#6B7280",marginBottom:6}}>{recipientOrg}</div>}
              <div style={{fontSize:11,fontWeight:600,color:"#111827",margin:"8px 0 6px"}}>Dear {recipient||"Valued Partner"},</div>
              <div style={{fontSize:10.5,color:"#6B7280",lineHeight:1.6,overflow:"hidden",maxHeight:100,WebkitMaskImage:"linear-gradient(to bottom,#000 60%,transparent)"}}>
                {mergedPreview.slice(0,300)}
              </div>
            </div>
            {/* Signature */}
            <div style={{padding:"8px 18px 12px",borderTop:"1px solid #F3F4F6"}}>
              <div style={{fontSize:10,color:"#9CA3AF",marginBottom:4}}>Yours sincerely,</div>
              <div style={{fontSize:14,fontWeight:800,color:template.accent,borderBottom:`1.5px solid ${template.accent}`,display:"inline-block",paddingBottom:2}}>{senderName||"[Your Name]"}</div>
              <div style={{fontSize:10,color:"#6B7280",marginTop:2}}>{senderTitle}</div>
              <div style={{fontSize:10,fontWeight:700,color:template.accent}}>{company?.name||"BusinessSphere"}</div>
            </div>
            {/* Footer */}
            <div style={{padding:"8px 18px",background:"#0D2214",display:"flex",justifyContent:"space-between"}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,.4)"}}>{company?.name||"BusinessSphere"}</div>
              <div style={{fontSize:9,fontStyle:"italic",color:"rgba(255,255,255,.3)"}}>{template.footer}</div>
            </div>
          </div>
          <p className="text-[10.5px] text-slate-400 mt-2 text-center">Preview · Full A4 letter prints with all details</p>
        </div>
      </div>
    </div>
  );
}


/* ─────────────────────── BUSINESS CARD DESIGNER ────────────────────────
   Professional double-sided business cards — 5 themes, live preview,
   team card batch, print-ready PDF (85×54mm standard).
──────────────────────────────────────────────────────────────────────── */

const CARD_THEMES = [
  {
    id: "executive",
    label: "Executive",
    front: { bg: "#0D2214", text: "#FFFFFF", accent: "#16A34A", sub: "rgba(255,255,255,0.55)" },
    back:  { bg: "#16A34A", text: "#FFFFFF", accent: "#FFFFFF", sub: "rgba(255,255,255,0.7)" },
  },
  {
    id: "ocean",
    label: "Ocean Blue",
    front: { bg: "#1E3A5F", text: "#FFFFFF", accent: "#60A5FA", sub: "rgba(255,255,255,0.55)" },
    back:  { bg: "#2563EB", text: "#FFFFFF", accent: "#FFFFFF", sub: "rgba(255,255,255,0.7)" },
  },
  {
    id: "minimal",
    label: "Clean White",
    front: { bg: "#FFFFFF", text: "#111827", accent: "#16A34A", sub: "#6B7280" },
    back:  { bg: "#F8FAFB", text: "#111827", accent: "#16A34A", sub: "#6B7280" },
  },
  {
    id: "gold",
    label: "Gold Premium",
    front: { bg: "#1A1200", text: "#FFFFFF", accent: "#D97706", sub: "rgba(255,255,255,0.55)" },
    back:  { bg: "#D97706", text: "#FFFFFF", accent: "#FFFFFF", sub: "rgba(255,255,255,0.75)" },
  },
  {
    id: "purple",
    label: "Royal Purple",
    front: { bg: "#2E1065", text: "#FFFFFF", accent: "#A78BFA", sub: "rgba(255,255,255,0.55)" },
    back:  { bg: "#7C3AED", text: "#FFFFFF", accent: "#FFFFFF", sub: "rgba(255,255,255,0.7)" },
  },
];

function CardPreview({ theme, fields, side, scale }) {
  const s   = scale || 1;
  const c   = side === "back" ? theme.back : theme.front;
  const W   = 340 * s, H = 214 * s;

  const px = v => v * s;

  if (side === "back") {
    return (
      <div style={{
        width:W, height:H, background:c.bg, borderRadius:px(12), overflow:"hidden",
        position:"relative", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", fontFamily:"Inter,sans-serif",
      }}>
        {/* Pattern overlay */}
        <div style={{position:"absolute",inset:0,opacity:0.06,backgroundImage:`repeating-linear-gradient(45deg,${c.accent} 0,${c.accent} 1px,transparent 0,transparent 50%)`,backgroundSize:px(14)+"px "+px(14)+"px"}}/>
        {/* Logo circle */}
        <div style={{
          width:px(64), height:px(64), borderRadius:"50%",
          background:c.accent, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:px(28), fontWeight:900,
          color:c.bg, marginBottom:px(10), position:"relative",
          boxShadow:`0 0 0 ${px(6)} ${c.accent}30`,
        }}>
          {(fields.company||"B").charAt(0)}
        </div>
        {fields.company && (
          <div style={{fontSize:px(14), fontWeight:800, color:c.text, letterSpacing:-0.3, position:"relative", textAlign:"center"}}>{fields.company}</div>
        )}
        {fields.tagline && (
          <div style={{fontSize:px(9.5), color:c.sub, marginTop:px(4), position:"relative", textAlign:"center", maxWidth:px(240)}}>{fields.tagline}</div>
        )}
        {(fields.website || fields.email) && (
          <div style={{marginTop:px(10), position:"relative", textAlign:"center"}}>
            {fields.website && <div style={{fontSize:px(9), color:c.accent, fontWeight:600}}>{fields.website}</div>}
            {fields.email && <div style={{fontSize:px(9), color:c.sub}}>{fields.email}</div>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      width:W, height:H, background:c.bg, borderRadius:px(12), overflow:"hidden",
      position:"relative", display:"flex", flexDirection:"column",
      justifyContent:"space-between", padding:px(22), fontFamily:"Inter,sans-serif",
      boxShadow:"0 4px 24px rgba(0,0,0,.18)",
    }}>
      {/* Accent stripe */}
      <div style={{position:"absolute", left:0, top:0, bottom:0, width:px(5), background:c.accent}}/>

      {/* Top section */}
      <div>
        {/* Company name + logo */}
        <div style={{display:"flex", alignItems:"center", gap:px(10), marginBottom:px(14)}}>
          <div style={{
            width:px(36), height:px(36), borderRadius:px(8), background:c.accent,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:px(18), fontWeight:900, color:c.bg, flexShrink:0,
          }}>{(fields.company||"B").charAt(0)}</div>
          <div style={{fontSize:px(13), fontWeight:800, color:c.text, letterSpacing:-0.3}}>{fields.company||"Company Name"}</div>
        </div>

        {/* Name + title */}
        <div style={{fontSize:px(18), fontWeight:900, color:c.text, letterSpacing:-0.5, lineHeight:1.1}}>{fields.name||"Full Name"}</div>
        <div style={{fontSize:px(10), fontWeight:600, color:c.accent, marginTop:px(3), textTransform:"uppercase", letterSpacing:1}}>{fields.title||"Job Title"}</div>
        {fields.dept && <div style={{fontSize:px(9.5), color:c.sub, marginTop:px(1)}}>{fields.dept}</div>}
      </div>

      {/* Bottom contact info */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:px(4)}}>
        {[
          fields.phone    && ["📞", fields.phone],
          fields.mobile   && ["📱", fields.mobile],
          fields.email    && ["✉", fields.email],
          fields.website  && ["🌐", fields.website],
          fields.address  && ["📍", fields.address],
          fields.linkedin && ["in", fields.linkedin],
        ].filter(Boolean).slice(0,6).map(([icon, val], i) => (
          <div key={i} style={{display:"flex", alignItems:"center", gap:px(4)}}>
            <span style={{fontSize:px(9), opacity:0.7}}>{icon}</span>
            <span style={{fontSize:px(8.5), color:c.sub, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:px(120)}}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BusinessCardDesigner({ company }) {
  const [themeId, setThemeId]     = useState("executive");
  const [viewSide, setViewSide]   = useState("front"); // front | back | both
  const [fields, setFields]       = useState({
    name:     company?.owner || "",
    title:    "Chief Executive Officer",
    dept:     "",
    company:  company?.name || "",
    tagline:  company?.tagline || "Excellence in Every Transaction",
    phone:    company?.phone || "",
    mobile:   "",
    email:    company?.email || "",
    website:  company?.website || "",
    address:  company?.city || "Dar es Salaam, Tanzania",
    linkedin: "",
  });
  const [teamMode, setTeamMode]   = useState(false);
  const [teamCards, setTeamCards] = useState([{ ...fields }]);

  const theme = CARD_THEMES.find(t => t.id === themeId) || CARD_THEMES[0];
  function setF(k, v) { setFields(f => ({ ...f, [k]: v })); }

  // ── Print PDF ─────────────────────────────────────────────────────────
  function printCards() {
    const cards = teamMode ? teamCards : [fields];
    const W = 340, H = 214; // 85×54mm at 4px/mm

    function renderFront(f, th) {
      const c = th.front;
      const contacts = [
        f.phone    && `<div style="display:flex;align-items:center;gap:5px"><span style="font-size:9px;opacity:.7">📞</span><span style="font-size:9px;color:${c.sub}">${f.phone}</span></div>`,
        f.mobile   && `<div style="display:flex;align-items:center;gap:5px"><span style="font-size:9px;opacity:.7">📱</span><span style="font-size:9px;color:${c.sub}">${f.mobile}</span></div>`,
        f.email    && `<div style="display:flex;align-items:center;gap:5px"><span style="font-size:9px;opacity:.7">✉</span><span style="font-size:9px;color:${c.sub}">${f.email}</span></div>`,
        f.website  && `<div style="display:flex;align-items:center;gap:5px"><span style="font-size:9px;opacity:.7">🌐</span><span style="font-size:9px;color:${c.sub}">${f.website}</span></div>`,
        f.address  && `<div style="display:flex;align-items:center;gap:5px"><span style="font-size:9px;opacity:.7">📍</span><span style="font-size:9px;color:${c.sub}">${f.address}</span></div>`,
        f.linkedin && `<div style="display:flex;align-items:center;gap:5px"><span style="font-size:9px;font-weight:700;color:${c.accent}">in</span><span style="font-size:9px;color:${c.sub}">${f.linkedin}</span></div>`,
      ].filter(Boolean).slice(0,6);
      return `<div style="width:${W}px;height:${H}px;background:${c.bg};border-radius:12px;overflow:hidden;position:relative;display:flex;flex-direction:column;justify-content:space-between;padding:22px;font-family:Inter,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.15)">
        <div style="position:absolute;left:0;top:0;bottom:0;width:5px;background:${c.accent}"></div>
        <div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
            <div style="width:36px;height:36px;border-radius:8px;background:${c.accent};display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:900;color:${c.bg}">${(f.company||"B").charAt(0)}</div>
            <div style="font-size:13px;font-weight:800;color:${c.text}">${f.company||""}</div>
          </div>
          <div style="font-size:18px;font-weight:900;color:${c.text};letter-spacing:-0.5px;line-height:1.1">${f.name||""}</div>
          <div style="font-size:10px;font-weight:600;color:${c.accent};margin-top:3px;text-transform:uppercase;letter-spacing:1px">${f.title||""}</div>
          ${f.dept?`<div style="font-size:9.5px;color:${c.sub};margin-top:1px">${f.dept}</div>`:""}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">${contacts.join("")}</div>
      </div>`;
    }

    function renderBack(f, th) {
      const c = th.back;
      return `<div style="width:${W}px;height:${H}px;background:${c.bg};border-radius:12px;overflow:hidden;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Inter,sans-serif;box-shadow:0 4px 20px rgba(0,0,0,.15)">
        <div style="position:absolute;inset:0;opacity:.06;background-image:repeating-linear-gradient(45deg,${c.accent} 0,${c.accent} 1px,transparent 0,transparent 50%);background-size:14px 14px"></div>
        <div style="width:64px;height:64px;border-radius:50%;background:${c.accent};display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:${c.bg};margin-bottom:10px;position:relative;box-shadow:0 0 0 8px ${c.accent}30">${(f.company||"B").charAt(0)}</div>
        ${f.company?`<div style="font-size:14px;font-weight:800;color:${c.text};position:relative;text-align:center">${f.company}</div>`:""}
        ${f.tagline?`<div style="font-size:9.5px;color:${c.sub};margin-top:4px;position:relative;text-align:center;max-width:240px">${f.tagline}</div>`:""}
        ${(f.website||f.email)?`<div style="margin-top:10px;position:relative;text-align:center">${f.website?`<div style="font-size:9px;color:${c.accent};font-weight:600">${f.website}</div>`:""}${f.email?`<div style="font-size:9px;color:${c.sub}">${f.email}</div>`:""}</div>`:""}
      </div>`;
    }

    const cardSets = cards.map(f => `
      <div class="card-row">
        <div class="card-label">FRONT</div>
        <div class="card-label">BACK</div>
        ${renderFront(f, theme)}
        ${renderBack(f, theme)}
        <div class="cut-hint">✂ cut line</div>
      </div>
    `).join("");

    const win = window.open("","_blank","width=960,height=1100");
    if (!win) { notify("Pop-up blocked — allow pop-ups to print.", "error"); return; }
    win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
      <title>Business Cards — ${company?.name||"BusinessSphere"}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Inter,Arial,sans-serif;background:#E5E7EB;padding:32px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @media print{body{background:white;padding:0}.toolbar{display:none!important}.page-hint{display:none}}
        h1{font-size:18px;font-weight:800;color:#111827;margin-bottom:6px;text-align:center}
        .subtitle{font-size:12px;color:#6B7280;text-align:center;margin-bottom:24px}
        .card-row{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start;justify-content:center;margin-bottom:32px;padding:20px;background:white;border-radius:12px;box-shadow:0 2px 16px rgba(0,0,0,.08);position:relative;page-break-inside:avoid}
        .card-label{position:absolute;top:8px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#9CA3AF}
        .card-label:first-of-type{left:20px}.card-label:nth-of-type(2){left:calc(50% + 10px)}
        .cut-hint{width:100%;text-align:center;font-size:9px;color:#D1D5DB;padding-top:8px;letter-spacing:.1em}
        .toolbar{position:fixed;bottom:24px;right:24px;display:flex;gap:8px}
        .btn{padding:10px 20px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;border:none;font-family:Inter}
        .btn-p{background:#16A34A;color:white}.btn-c{background:white;color:#111827;border:1.5px solid #E5E7EB}
        .page-hint{text-align:center;font-size:11px;color:#9CA3AF;margin-bottom:20px}
      </style></head><body>
      <h1>Business Cards — ${company?.name||"BusinessSphere"}</h1>
      <div class="subtitle">Theme: ${theme.label} · ${cards.length} card${cards.length!==1?"s":""} · Standard size 85mm × 54mm</div>
      <div class="page-hint">Tip: Print on card stock, then cut along the dashed lines</div>
      ${cardSets}
      <div class="toolbar">
        <button class="btn btn-c" onclick="window.close()">Close</button>
        <button class="btn btn-p" onclick="window.print()">Print / Save PDF</button>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(()=>win.focus(), 200);
    notify(`${cards.length} business card${cards.length!==1?"s":""} ready to print`);
  }

  // Team mode helpers
  function addTeamCard() { setTeamCards(t=>[...t,{...fields,name:"",title:"",dept:""}]); }
  function updateTeamCard(i,k,v) { setTeamCards(t=>t.map((c,idx)=>idx===i?{...c,[k]:v}:c)); }

  const FIELDS = [
    ["name","Full Name","e.g. Amina Hassan","text"],
    ["title","Job Title","e.g. Sales Manager","text"],
    ["dept","Department","e.g. Sales & Marketing","text"],
    ["phone","Phone","e.g. +255 712 345 678","tel"],
    ["mobile","Mobile","e.g. +255 755 000 111","tel"],
    ["email","Email","e.g. amina@company.co.tz","email"],
    ["website","Website","e.g. www.company.co.tz","url"],
    ["address","Location","e.g. Dar es Salaam, Tanzania","text"],
    ["linkedin","LinkedIn","e.g. linkedin.com/in/amina","text"],
    ["tagline","Tagline (back)","e.g. Excellence in Every Transaction","text"],
  ];

  return (
    <div className="p-5 space-y-5">
      {/* Theme picker */}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Card Theme</p>
        <div className="flex flex-wrap gap-2">
          {CARD_THEMES.map(t => (
            <button key={t.id} onClick={()=>setThemeId(t.id)}
              className={`px-4 py-2 rounded-xl text-[12.5px] font-bold border transition-all ${
                themeId===t.id?"text-white shadow-md":"bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
              style={themeId===t.id?{background:t.front.bg,borderColor:t.front.accent}:{}}>
              <span className="w-3 h-3 rounded-full inline-block mr-2 align-middle" style={{background:t.front.accent}}/>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Side toggle + Team toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-slate-100 rounded-lg p-0.5">
          {[["front","Front"],["back","Back"],["both","Both Sides"]].map(([v,l])=>(
            <button key={v} onClick={()=>setViewSide(v)}
              className={`px-3 py-1.5 rounded-md text-[12px] font-semibold transition-all ${viewSide===v?"bg-white text-[#111827] shadow-sm":"text-slate-500"}`}>
              {l}
            </button>
          ))}
        </div>
        <button onClick={()=>setTeamMode(!teamMode)}
          className={`px-3.5 py-2 rounded-xl text-[12px] font-bold border transition-all ${teamMode?"bg-[#2563EB] text-white border-[#2563EB]":"bg-white text-slate-600 border-slate-200"}`}>
          👥 {teamMode?"Exit ":""}Team Mode
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Fields */}
        <div>
          {!teamMode ? (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Card Information</p>
              <div className="grid grid-cols-2 gap-2">
                {FIELDS.map(([key,label,ph,type])=>(
                  <div key={key} className={key==="name"||key==="tagline"?"col-span-2":""}>
                    <label className="text-[11px] font-semibold text-slate-500 block mb-1">{label}</label>
                    <input type={type} className={inputClass} value={fields[key]||""} onChange={e=>setF(key,e.target.value)} placeholder={ph}/>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Team Cards ({teamCards.length})</p>
                <button onClick={addTeamCard} className="text-[11.5px] font-bold text-[#16A34A] border border-[#16A34A]/30 px-2.5 py-1.5 rounded-lg">+ Add Person</button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {teamCards.map((tc,i)=>(
                  <div key={i} className="border border-slate-200 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] font-bold text-[#111827]">Card {i+1}</p>
                      {teamCards.length>1&&<button onClick={()=>setTeamCards(t=>t.filter((_,idx)=>idx!==i))} className="text-slate-400 hover:text-[#EF4444] text-[11px]">Remove</button>}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[["name","Name"],["title","Title"],["phone","Phone"],["email","Email"]].map(([k,l])=>(
                        <div key={k}>
                          <label className="text-[10.5px] font-semibold text-slate-500 block mb-1">{l}</label>
                          <input className={inputClass} value={tc[k]||""} onChange={e=>updateTeamCard(i,k,e.target.value)} placeholder={fields[k]}/>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={printCards}
            className="mt-4 w-full flex items-center justify-center gap-2 text-[13px] font-bold text-white py-3 rounded-xl bg-[#0D2214] shadow-sm hover:bg-[#1a3a2a] transition-colors">
            <Printer size={15}/> Print {teamMode&&teamCards.length>1?teamCards.length+" Cards":"Business Card"}
          </button>
        </div>

        {/* Live preview */}
        <div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">Live Preview</p>
          <div className="space-y-4">
            {(viewSide==="front"||viewSide==="both") && (
              <div>
                <p className="text-[10.5px] text-slate-400 mb-2 uppercase tracking-wide font-semibold">Front Side</p>
                <div style={{transform:"scale(0.85)",transformOrigin:"top left",display:"inline-block"}}>
                  <CardPreview theme={theme} fields={fields} side="front" scale={0.85}/>
                </div>
              </div>
            )}
            {(viewSide==="back"||viewSide==="both") && (
              <div>
                <p className="text-[10.5px] text-slate-400 mb-2 uppercase tracking-wide font-semibold">Back Side</p>
                <div style={{transform:"scale(0.85)",transformOrigin:"top left",display:"inline-block"}}>
                  <CardPreview theme={theme} fields={fields} side="back" scale={0.85}/>
                </div>
              </div>
            )}
          </div>
          <p className="text-[10.5px] text-slate-400 mt-3">Standard 85×54mm · Print on 300gsm card stock for best results</p>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
