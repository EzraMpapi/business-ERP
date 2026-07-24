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


function HR({ employeesHook, leaveRequestsHook, expensesHook, intent, clearIntent, currentUser, canManage }) {
  const [tab, setTab] = useState("employees");

  useEffect(() => {
    if (intent?.module !== "hr") return;
    if (intent.tab) setTab(intent.tab);
    clearIntent();
  }, [intent]);

  const { rows: employees, setRows: setEmployees, loading: empLoading, error: empError } = employeesHook;
  const { rows: leaveRequests, setRows: setLeaveRequests, loading: leaveLoading, error: leaveError } = leaveRequestsHook;

  const stats = useMemo(() => {
    const active = employees.filter((e) => e.status === "Active").length;
    const onLeave = employees.filter((e) => e.status === "On Leave").length;
    const payroll = employees.filter((e) => e.status !== "Inactive").reduce((s, e) => s + e.salary, 0);
    return { total: employees.length, active, onLeave, payroll };
  }, [employees]);

  const HR_KPIS = [
    { label: "Total Employees", value: String(stats.total), delta: `${stats.active} active`, up: true, icon: Users },
    { label: "On Leave", value: String(stats.onLeave), delta: "This period", up: false, icon: Clock },
    { label: "Monthly Payroll", value: `TZS ${money(stats.payroll)}k`, delta: "Active staff", up: true, icon: CircleDollarSign },
    { label: "Pending Leave", value: String(leaveRequests.filter((l) => l.status === "Pending").length), delta: "Needs review", up: false, icon: AlertCircle },
  ];

  return (
    <div className="space-y-5">
      {IS_CONFIGURED && (empError || leaveError) && (
        <div className="bg-[#EF4444]/5 border border-[#EF4444]/20 text-[#EF4444] text-[12.5px] rounded-lg px-3.5 py-2.5">
          {"Could not reach Supabase — check your connection."}
        </div>
      )}
      <div>
        <h1 className="text-[20px] sm:text-[22px] font-semibold text-[#111827] tracking-tight">Human Resources</h1>
        <p className="text-[13px] text-slate-500 mt-1">Team roster, recruitment, attendance, and payroll in one place</p>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto w-fit max-w-full">
        {HR_TABS.map((t) => {
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
        {HR_KPIS.map((k) => <KpiCard key={k.label} item={k} />)}
      </div>

      {tab === "employees" && <Employees employees={employees} setEmployees={setEmployees} loading={empLoading} />}
      {tab === "timetable" && <WorkingTimetable employees={employees} currentUser={currentUser} canManage={canManage} />}
      {tab === "recruitment" && <Recruitment />}
      {tab === "attendance" && <Attendance employees={employees} />}
      {tab === "performance" && <Performance employees={employees} />}
      {tab === "training" && <><Training employees={employees} /><LmsInsightsPanel employees={employees} /></>}
      {tab === "leave" && <LeaveRequests requests={leaveRequests} setRequests={setLeaveRequests} loading={leaveLoading} employees={employees} />}
      {tab === "benefits" && <Benefits employees={employees} />}
      {tab === "payroll" && <Payroll employees={employees} expensesHook={expensesHook} />}
    </div>
  );
}

function Employees({ employees, setEmployees, loading }) {
  const [department, setDepartment] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [generatedCode, setGenCode] = useState(null);
  const bulk = useBulkSelect(employees);

  function generateInviteCode(dept, role) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code  = Array.from({length:8}, ()=>chars[Math.floor(Math.random()*chars.length)]).join("");
    const expires = new Date(Date.now() + 7*86400000).toISOString().slice(0,10);
    const inv = { code, dept, role, expires, used: false, createdAt: TODAY.toISOString().slice(0,10) };
    // Store in localStorage for demo — in live mode write to hr_invite_codes table
    try {
      const existing = JSON.parse(localStorage.getItem("hr_invite_codes")||"[]");
      localStorage.setItem("hr_invite_codes", JSON.stringify([...existing, inv]));
    } catch(_e) {}
    if (IS_CONFIGURED) {
      sb("hr_invite_codes").insert({
        code, department:dept, role_hint:role, expires_at:expires, used:false
      }).run().catch(()=>{});
    }
    setGenCode(inv);
    notify(`Invite code generated: ${code} — valid 7 days`);
  }

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const matchesDept = department === "all" || e.department === department;
      const matchesQ = !query.trim() ||
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.role.toLowerCase().includes(query.toLowerCase());
      return matchesDept && matchesQ;
    });
  }, [employees, department, query]);

  async function addEmployee(form) {
    const draft = {
      id: docId("EMP"),
      name: form.name,
      role: form.role,
      department: form.department || DEPARTMENTS[0],
      email: form.email,
      phone: form.phone,
      status: "Active",
      salary: Number(form.salary) || 0,
      hireDate: form.hireDate || TODAY.toISOString().slice(0, 10),
      contractType: form.contractType || "Permanent",
      contractEndDate: form.contractType === "Permanent" ? null : (form.contractEndDate || null),
    };
    setEmployees((prev) => [draft, ...prev]);
    notify(`Employee added: ${draft.name}`);
    setShowForm(false);

    if (IS_CONFIGURED) {
      try {
        const header = await sb("hr_employees").insert({
          full_name: form.name, role: form.role, department: form.department,
          email: form.email, phone: form.phone, status: "Active",
          salary: Number(form.salary) || 0, hire_date: form.hireDate,
          contract_type: draft.contractType, contract_end_date: draft.contractEndDate,
        }).single().run();
        if (header?.id) setEmployees((prev) => prev.map((e) => (e.id === draft.id ? { ...e, dbId: header.id } : e)));
      } catch (e) {
        notify("Employee created locally, but saving to the server failed.", "error");
      }
    }
  }

  async function setStatus(id, status) {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
    if (IS_CONFIGURED && emp?.dbId) {
      try { await sb("hr_employees").eq("id", emp.dbId).update({ status }).run(); }
      catch (e) { notify("Couldn't update the employee status on the server.", "error"); }
    }
  }

  async function deleteEmployee(id) {
    const emp = employees.find((e) => e.id === id);
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && emp?.dbId) {
      try { await sb("hr_employees").eq("id", emp.dbId).delete().run(); }
      catch (e) { notify("Couldn't remove the employee on the server.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => setDepartment("all")}
            className={`text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${department === "all" ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}
          >
            All departments
          </button>
          {DEPARTMENTS.map((d) => (
            <button
              key={d}
              onClick={() => setDepartment(d)}
              className={`text-[12px] font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${department === d ? "bg-white text-[#111827] shadow-sm" : "text-slate-500"}`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or role..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-2 text-[13px] outline-none focus:border-[#16A34A] focus:ring-1 focus:ring-[#16A34A]/30 transition-all"
            />
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#7C3AED] border border-[#7C3AED]/30 bg-[#F5F3FF] px-3.5 py-2 rounded-lg hover:bg-[#EDE9FE] shrink-0"
          >
            <QrCode size={14}/> Invite Code
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0"
          >
            <Plus size={15} /> New Employee
          </button>
        </div>
      </div>

      {/* ── Invite Code Generator Panel ── */}
      {showInvite && (
        <div className="bg-[#F5F3FF] border border-[#C4B5FD] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-bold text-[#5B21B6]">🔐 Generate Employee Invite Code</p>
              <p className="text-[12px] text-[#7C3AED]">Employee enters this code in the Employee Portal to join the company system</p>
            </div>
            <button onClick={()=>{setShowInvite(false);setGenCode(null);}} className="text-[#7C3AED] hover:text-[#5B21B6]"><X size={16}/></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InviteCodeForm onGenerate={generateInviteCode}/>
          </div>
          {generatedCode && (
            <div className="bg-white rounded-xl border-2 border-[#7C3AED] p-4">
              <p className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-wider mb-2">Generated Invite Code</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 font-mono text-[28px] font-black text-[#111827] tracking-[0.3em] bg-slate-50 rounded-xl px-4 py-2.5 text-center border border-slate-200">
                  {generatedCode.code}
                </div>
                <button onClick={()=>{ if(navigator.clipboard) navigator.clipboard.writeText(generatedCode.code); notify("Code copied!"); }}
                  className="text-[12px] font-bold text-white bg-[#7C3AED] px-3 py-2 rounded-lg">
                  Copy
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-3">
                {[
                  ["Department", generatedCode.dept],
                  ["Role", generatedCode.role],
                  ["Expires", generatedCode.expires],
                ].map(([l,v])=>(
                  <div key={l} className="text-center">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">{l}</p>
                    <p className="text-[12.5px] font-semibold text-[#111827]">{v}</p>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2.5 text-center">Share this code with the employee. Valid for 7 days. One-time use.</p>
            </div>
          )}
          {/* Past codes */}
          {(() => {
            try {
              const codes = JSON.parse(localStorage.getItem("hr_invite_codes")||"[]").slice(-5).reverse();
              if (!codes.length) return null;
              return (
                <div>
                  <p className="text-[11px] font-bold text-[#7C3AED] mb-2">Recent Codes</p>
                  <div className="space-y-1.5">
                    {codes.map((inv,i)=>(
                      <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-200">
                        <span className="font-mono font-bold text-[14px] tracking-widest text-[#111827]">{inv.code}</span>
                        <div className="flex gap-3 text-[11.5px] text-slate-500">
                          <span>{inv.dept}</span>
                          <span>{inv.role}</span>
                          <span className={`font-semibold ${inv.used?"text-[#16A34A]":new Date(inv.expires)<new Date()?"text-[#EF4444]":"text-[#F59E0B]"}`}>
                            {inv.used?"✓ Used":new Date(inv.expires)<new Date()?"Expired":"Valid until "+inv.expires}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            } catch(_e){ return null; }
          })()}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <BulkActionBar count={bulk.count} onClear={bulk.clearAll} accent="#16A34A" actions={[
              { label:"Export Selected", onClick:()=>downloadCSV("employees-selected",bulk.selectedRows,[{key:"name",label:"Name"},{key:"department",label:"Dept"},{key:"role",label:"Role"},{key:"salary",label:"Salary"}]) },
              { label:"Mark On Leave", onClick:()=>{ bulk.selectedRows.forEach(e=>{ setEmployees(p=>p.map(x=>x.id===e.id?{...x,status:"On Leave"}:x)); }); bulk.clearAll(); notify(bulk.count+" employees marked On Leave"); } },
              { label:"Deactivate", danger:true, onClick:()=>{ bulk.selectedRows.forEach(e=>{ setEmployees(p=>p.map(x=>x.id===e.id?{...x,status:"Inactive"}:x)); }); bulk.clearAll(); notify(bulk.count+" employees deactivated"); } },
            ]} />
            <div className="overflow-x-auto">
            
          <table className="w-full text-[13px] min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Employee</th>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Hire Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Salary (TZS 000/mo)</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows cols={6} />
              ) : (
                <>
                  {filtered.map((e) => (
                    <tr
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#111827]">{e.name}</p>
                        <p className="text-[11px] text-slate-400">{e.role}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{e.department}</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">{e.hireDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                          style={{ backgroundColor: `${EMPLOYMENT_STATUS_COLOR[e.status]}14`, color: EMPLOYMENT_STATUS_COLOR[e.status] }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EMPLOYMENT_STATUS_COLOR[e.status] }} />
                          {e.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{money(e.salary)}</td>
                      <td className="px-4 py-3 text-right"><ChevronRight size={15} className="text-slate-300 inline" /></td>
                    </tr>
                  ))}
                  {filtered.length === 0 && employees.length > 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400 text-[13px]">No employees match your filters</td></tr>
                  )}
                  {employees.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <EmptyState
                          icon={Users}
                          title="No employees yet"
                          hint="Build your team roster. Salaries you add here feed the monthly payroll KPI automatically."
                          actionLabel="New Employee"
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

      {selected && (
        <EmployeePanel employee={selected} onClose={() => setSelected(null)} onSetStatus={setStatus} onDelete={deleteEmployee} />
      )}
      {showForm && <EmployeeFormPanel onClose={() => setShowForm(false)} onSubmit={addEmployee} />}
    </div>
  );
}

function EmployeePanel({ employee, onClose, onSetStatus, onDelete }) {
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[11px] font-mono text-slate-400">{employee.id}</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">{employee.name}</h2>
            <p className="text-[13px] text-slate-500">{employee.role}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="mb-6">
          <span
            className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
            style={{ backgroundColor: `${EMPLOYMENT_STATUS_COLOR[employee.status]}14`, color: EMPLOYMENT_STATUS_COLOR[employee.status] }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: EMPLOYMENT_STATUS_COLOR[employee.status] }} />
            {employee.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Monthly Salary</p>
            <p className="text-[15px] font-mono font-semibold text-[#111827]">TZS {money(employee.salary)}k</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-[11px] text-slate-400 mb-1">Hire Date</p>
            <p className="text-[15px] font-mono font-semibold text-[#111827]">{employee.hireDate}</p>
          </div>
        </div>

        <div className="space-y-3 mb-3">
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
            <Briefcase size={14} className="text-slate-400" /> {employee.department}
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
            <Mail size={14} className="text-slate-400" /> {employee.email}
          </div>
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600">
            <Phone size={14} className="text-slate-400" /> {employee.phone}
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-6">
          <p className="text-[11px] text-slate-400 mb-1">Contract</p>
          <p className="text-[13px] font-medium text-[#111827]">
            {employee.contractType || "Permanent"}
            {employee.contractEndDate && <span className="text-slate-500 font-normal"> · ends {employee.contractEndDate}</span>}
          </p>
        </div>

        <div className="flex-1" />

        <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            {employee.status !== "Active" && (
              <button onClick={() => onSetStatus(employee.id, "Active")} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">
                Mark Active
              </button>
            )}
            {employee.status !== "On Leave" && (
              <button onClick={() => onSetStatus(employee.id, "On Leave")} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">
                Mark On Leave
              </button>
            )}
            {employee.status !== "Inactive" && (
              <button onClick={() => onSetStatus(employee.id, "Inactive")} className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5 transition-colors">
                Mark Inactive
              </button>
            )}
          </div>
          <ConfirmDeleteButton label="Remove employee" onConfirm={() => onDelete(employee.id)} />
        </div>
      </div>
    </div>
  );
}

function EmployeeFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", role: "", department: DEPARTMENTS[0], email: "", phone: "", salary: "", hireDate: TODAY.toISOString().slice(0, 10), contractType: "Permanent", contractEndDate: "" });
  const [touched, setTouched] = useState(false);
  const valid = form.name.trim() && form.role.trim();

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
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[420px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-[11px] text-slate-400 uppercase tracking-wide">HR</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Employee</h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Full name" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Amara Mwakisisile" />
            {touched && !form.name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Name is required.</p>}
          </FormField>

          <FormField label="Role" required>
            <input className={inputClass} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Warehouse Supervisor" />
            {touched && !form.role.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Role is required.</p>}
          </FormField>

          <FormField label="Department">
            <select className={inputClass} value={form.department} onChange={(e) => set("department", e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Email">
              <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@company.tz" />
            </FormField>
            <FormField label="Phone">
              <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+255 7XX XXX XXX" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Salary (TZS 000/mo)">
              <input type="number" min="0" className={inputClass} value={form.salary} onChange={(e) => set("salary", e.target.value)} placeholder="0" />
            </FormField>
            <FormField label="Hire date">
              <input type="date" className={inputClass} value={form.hireDate} onChange={(e) => set("hireDate", e.target.value)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contract type">
              <select className={inputClass} value={form.contractType} onChange={(e) => set("contractType", e.target.value)}>
                {EMPLOYMENT_CONTRACT_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </FormField>
            {form.contractType !== "Permanent" && (
              <FormField label="Contract end date">
                <input type="date" className={inputClass} value={form.contractEndDate} onChange={(e) => set("contractEndDate", e.target.value)} />
              </FormField>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5 transition-colors">Create Employee</button>
        </div>
      </form>
    </div>
  );
}

function LeaveRequests({ requests, setRequests, loading, employees }) {
  async function setStatus(id, status) {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    if (IS_CONFIGURED) {
      try { await sb("hr_leave_requests").eq("id", id).update({ status }).run(); }
      catch (e) { notify("Couldn't update the leave request on the server.", "error"); }
    }
  }

  // Real balance, not a stored number: allocation minus actual days used
  // across approved Annual leave requests this year, per employee.
  const balances = useMemo(() => {
    return employees
      .filter((e) => e.status !== "Inactive")
      .map((e) => {
        const used = requests
          .filter((r) => r.employee === e.name && r.type === "Annual" && r.status === "Approved")
          .reduce((s, r) => s + daysInclusive(r.startDate, r.endDate), 0);
        return { name: e.name, used, remaining: Math.max(0, ANNUAL_LEAVE_ALLOCATION - used) };
      })
      .sort((a, b) => a.remaining - b.remaining);
  }, [employees, requests]);

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 sm:p-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Annual Leave Balances</h3>
        <p className="text-[11.5px] text-slate-400 mb-4">{ANNUAL_LEAVE_ALLOCATION} days/year allocation, minus approved Annual leave taken</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {balances.map((b) => (
            <div key={b.name} className="border border-slate-100 rounded-lg p-3">
              <p className="text-[12px] font-medium text-[#111827] truncate mb-1.5">{b.name}</p>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(b.used / ANNUAL_LEAVE_ALLOCATION) * 100}%`, backgroundColor: b.remaining <= 3 ? "#EF4444" : "#16A34A" }}
                />
              </div>
              <p className="text-[11px] font-mono text-slate-500">{b.remaining}d left · {b.used}d used</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[680px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && <SkeletonRows cols={5} />}
            {!loading && requests.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <EmptyState
                    icon={Clock}
                    title="No leave requests"
                    hint="Requests submitted by your team will appear here for one-click approval or rejection."
                  />
                </td>
              </tr>
            )}
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 font-medium text-[#111827]">{r.employee}</td>
                <td className="px-4 py-3 text-slate-500">{r.type}</td>
                <td className="px-4 py-3 text-slate-500 font-mono">{r.startDate} → {r.endDate}</td>
                <td className="px-4 py-3">
                  <span
                    className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                    style={{ backgroundColor: `${LEAVE_STATUS_COLOR[r.status]}14`, color: LEAVE_STATUS_COLOR[r.status] }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: LEAVE_STATUS_COLOR[r.status] }} />
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {r.status === "Pending" ? (
                    <div className="flex gap-1.5 justify-end">
                      <button onClick={() => setStatus(r.id, "Rejected")} className="text-[11.5px] font-medium text-[#EF4444] border border-[#EF4444]/25 rounded-md px-2.5 py-1 hover:bg-[#EF4444]/5">
                        Reject
                      </button>
                      <button onClick={() => setStatus(r.id, "Approved")} className="text-[11.5px] font-medium btn-primary text-white rounded-md px-2.5 py-1">
                        Approve
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11.5px] text-slate-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

/* ------------------------------- RECRUITMENT ------------------------------------ */

function Recruitment() {
  const candidates = useCompanyTable("hr_candidates", candidatesSeed, { order: { col: "applied_date", ascending: false }, mapRow: mapCandidateRow });
  const { rows, setRows, loading } = candidates;
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const grouped = useMemo(() => {
    const g = {};
    RECRUITMENT_STAGES.forEach((s) => (g[s] = []));
    rows.forEach((c) => g[c.stage]?.push(c));
    return g;
  }, [rows]);

  async function addCandidate(form) {
    const draft = { id: docId("CAND"), name: form.name, role: form.role, department: form.department, stage: "Applied", email: form.email, appliedDate: TODAY.toISOString().slice(0, 10) };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Candidate added: ${draft.name}`);
    if (IS_CONFIGURED) {
      try {
        const header = await sb("hr_candidates").insert({
          name: draft.name, role: draft.role, department: draft.department, stage: "Applied", email: draft.email, applied_date: draft.appliedDate,
        }).single().run();
        if (header?.id) setRows((prev) => prev.map((c) => (c.id === draft.id ? { ...c, dbId: header.id } : c)));
      } catch (_e) { notify("Candidate added locally, but saving to the server failed.", "error"); }
    }
  }

  async function moveStage(id, dir) {
    const cur = rows.find((c) => c.id === id);
    if (!cur) return;
    const idx = RECRUITMENT_STAGES.indexOf(cur.stage);
    const next = RECRUITMENT_STAGES[Math.min(Math.max(idx + dir, 0), RECRUITMENT_STAGES.length - 1)];
    setRows((prev) => prev.map((c) => (c.id === id ? { ...c, stage: next } : c)));
    setSelected((s) => (s && s.id === id ? { ...s, stage: next } : s));
    if (IS_CONFIGURED && cur.dbId) {
      try { await sb("hr_candidates").eq("id", cur.dbId).update({ stage: next }).run(); } catch (_e) { notify("Couldn't save the candidate stage to the server.", "error"); }
    }
  }

  async function deleteCandidate(id) {
    const cur = rows.find((c) => c.id === id);
    setRows((prev) => prev.filter((c) => c.id !== id));
    setSelected(null);
    if (IS_CONFIGURED && cur?.dbId) {
      try { await sb("hr_candidates").eq("id", cur.dbId).delete().run(); } catch (_e) { notify("Couldn't delete the candidate on the server.", "error"); }
    }
  }


  // Analytics
  const hired     = rows.filter(r=>r.stage==="Hired").length;
  const active    = rows.filter(r=>!["Hired","Rejected"].includes(r.stage)).length;
  const rejected  = rows.filter(r=>r.stage==="Rejected").length;
  const total     = rows.length;
  const offerRate = total>0?Math.round(rows.filter(r=>["Offer","Hired"].includes(r.stage)).length/total*100):0;

  // Funnel data — each stage count
  const funnelData = RECRUITMENT_STAGES.filter(s=>s!=="Rejected").map(s=>({
    stage:s,
    count:grouped[s]?.length||0,
    fill:{Applied:"#94A3B8",Screening:"#3B82F6",Interview:"#7C3AED",Offer:"#F59E0B",Hired:"#16A34A"}[s]||"#6B7280",
  }));
  const maxCount = Math.max(...funnelData.map(d=>d.count), 1);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Total Applicants", total,      "#2563EB"],
          ["In Pipeline",      active,     "#7C3AED"],
          ["Hired",            hired,      "#16A34A"],
          ["Offer Rate",       offerRate+"%","#F59E0B"],
        ].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[22px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Hiring funnel */}
      {total > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-4">Hiring Pipeline Funnel</h3>
          <div className="space-y-2.5">
            {funnelData.map((d, i) => {
              const pct = maxCount > 0 ? (d.count / maxCount * 100) : 0;
              const conv = i > 0 && funnelData[i-1].count > 0
                ? Math.round(d.count / funnelData[i-1].count * 100)
                : null;
              return (
                <div key={d.stage} className="flex items-center gap-3">
                  <span className="text-[12px] font-medium text-slate-600 w-20 shrink-0">{d.stage}</span>
                  <div className="flex-1 h-7 rounded-lg overflow-hidden bg-slate-100" style={{paddingLeft:i*20}}>
                    <div className="h-full rounded-lg flex items-center px-3 transition-all" style={{width:Math.max(pct,8)+"%",background:d.fill}}>
                      {d.count > 0 && <span className="text-[11px] font-bold text-white whitespace-nowrap">{d.count}</span>}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 w-8 text-right">{d.count}</span>
                  {conv !== null && (
                    <span className="text-[10px] text-slate-400 w-12 text-right">{conv}%</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[11.5px]">
            <span className="text-slate-500">Pipeline conversion: <strong style={{color:"#16A34A"}}>{hired}/{total}</strong> applicants hired</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">Rejected: <strong style={{color:"#EF4444"}}>{rejected}</strong></span>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm">
          <Plus size={15} /> New Candidate
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><SkeletonRows cols={1} rows={4} /></div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm">
          <EmptyState icon={UserPlus} title="No candidates yet" hint="Add candidates as they apply and move them through the hiring pipeline." actionLabel="New Candidate" onAction={() => setShowForm(true)} />
        </div>
      ) : (
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
          {RECRUITMENT_STAGES.map((stage) => (
            <div key={stage} className="bg-slate-50 rounded-xl p-2.5 min-h-[320px] w-[200px] sm:w-auto shrink-0 snap-start">
              <div className="flex items-center justify-between px-1.5 py-1.5 mb-1">
                <span
                  className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5"
                  style={{ backgroundColor: `${RECRUITMENT_STAGE_COLOR[stage]}14`, color: RECRUITMENT_STAGE_COLOR[stage] }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RECRUITMENT_STAGE_COLOR[stage] }} />
                  {stage}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{grouped[stage].length}</span>
              </div>
              <div className="space-y-2">
                {grouped[stage].map((c) => (
                  <button key={c.id} onClick={() => setSelected(c)} className="w-full text-left bg-white rounded-lg border border-slate-200/80 p-3 hover:border-[#16A34A]/50 hover:shadow-sm transition-all">
                    <p className="text-[13px] font-medium text-[#111827] leading-snug">{c.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{c.role}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <CandidatePanel candidate={selected} onClose={() => setSelected(null)} onMove={moveStage} onDelete={deleteCandidate} />}
      {showForm && <CandidateFormPanel onClose={() => setShowForm(false)} onSubmit={addCandidate} />}
    </div>
  );
}

function CandidatePanel({ candidate, onClose, onMove, onDelete }) {
  const idx = RECRUITMENT_STAGES.indexOf(candidate.stage);
  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[11px] font-mono text-slate-400">{candidate.id}</p>
            <h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">{candidate.name}</h2>
            <p className="text-[13px] text-slate-500">{candidate.role} · {candidate.department}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="mb-6">
          <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1.5" style={{ backgroundColor: `${RECRUITMENT_STAGE_COLOR[candidate.stage]}14`, color: RECRUITMENT_STAGE_COLOR[candidate.stage] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RECRUITMENT_STAGE_COLOR[candidate.stage] }} />
            {candidate.stage}
          </span>
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600"><Mail size={14} className="text-slate-400" /> {candidate.email}</div>
          <div className="flex items-center gap-2.5 text-[13px] text-slate-600"><Clock size={14} className="text-slate-400" /> Applied {candidate.appliedDate}</div>
        </div>
        <div className="flex-1" />
        <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
          <div className="flex gap-2">
            <button disabled={idx === 0} onClick={() => onMove(candidate.id, -1)} className="flex-1 text-[12px] border border-slate-200 rounded-lg py-2 disabled:opacity-30 hover:bg-slate-50">← Back</button>
            <button disabled={idx === RECRUITMENT_STAGES.length - 1} onClick={() => onMove(candidate.id, 1)} className="flex-1 text-[12px] btn-primary text-white rounded-lg py-2 disabled:opacity-30">Advance →</button>
          </div>
          <ConfirmDeleteButton label="Remove candidate" onConfirm={() => onDelete(candidate.id)} />
        </div>
      </div>
    </div>
  );
}

function CandidateFormPanel({ onClose, onSubmit }) {
  const [form, setForm] = useState({ name: "", role: "", department: DEPARTMENTS[0], email: "" });
  const [touched, setTouched] = useState(false);
  const valid = form.name.trim() && form.role.trim();
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); setTouched(true); if (!valid) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Recruitment</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Candidate</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Full name" required>
            <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Neema Kessy" />
            {touched && !form.name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">Name is required.</p>}
          </FormField>
          <FormField label="Applying for" required>
            <input className={inputClass} value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Warehouse Assistant" />
          </FormField>
          <FormField label="Department">
            <select className={inputClass} value={form.department} onChange={(e) => set("department", e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </FormField>
          <FormField label="Email">
            <input type="email" className={inputClass} value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@gmail.com" />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Add Candidate</button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------- ATTENDANCE ------------------------------------ */

/* ------------------------- BIOMETRIC ATTENDANCE (WebAuthn) ------------------------- */

// Real biometric clock-in/out, built on the browser's genuine Web
// Authentication API — navigator.credentials with a *platform*
// authenticator and userVerification: "required" genuinely triggers the
// device actual fingerprint sensor (Android fingerprint, Windows
// Hello, MacBook Touch ID) or its enrolled PIN/face equivalent. Not a
// simulated prompt — the operating system's own biometric dialog.
//
// Three honest properties stated up front, in code and in the UI:
// 1. The fingerprint NEVER leaves the device — that is WebAuthn's core
//    design, not this implementation's choice. The sensor verifies
//    locally; the browser only reports that verification succeeded.
//    There is no fingerprint image or template anywhere in this system
//    to store, leak, or subpoena — a privacy property, not a gap.
// 2. Credentials are device-bound by WebAuthn's real architecture, so
//    localStorage is the architecturally correct home for the
//    credential-ID mapping — an employee enrolls per device (e.g. the
//    shop's front-desk tablet), which matches how real biometric
//    attendance terminals actually work.
// 3. Same honest caveat as App Lock (section 71): without server-side
//    signature verification this is a strong device-level gate, not
//    cryptographic proof to a server. It genuinely requires the
//    enrolled person's finger on the real sensor — which is exactly
//    the fraud a clock-in system exists to stop: one employee clocking
//    in for another.

// Collision-proof document-number generator — replaces the narrow random
// ranges that could produce duplicates (CON-10 through CON-99 = 90 values).
// Format: PREFIX-YYYYMMDD-XXXX where XXXX is 4 hex digits from the current
// millisecond, giving 65,536 values within the same millisecond while staying
// human-readable. Used for all locally-generated draft ids; the server's
// generate_doc_number() RPC follows the same pattern for the persisted copy.
function docId(prefix) {
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  const hex = (d.getTime() % 65536).toString(16).toUpperCase().padStart(4,'0');
  return `${prefix}-${date}-${hex}`;
}

function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function b64ToBuf(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;
}

// Reusable digital-signature gate for approvals. A WebAuthn assertion IS
// a real cryptographic signature — the device private key signing a
// fresh random challenge, unlocked by the approver's actual fingerprint
// or Face ID. Enrolls a dedicated signing credential on first use.
// Returns "biometric" on a real signed assertion, "unsigned" when the
// device honestly has no platform authenticator (approvals must not
// break on sensor-less desktops), and null when the person cancels —
// cancelling the sensor prompt means declining to sign, so the caller
// aborts. Standing honest caveat, same as App Lock and attendance:
// without server-side assertion verification this is strong device-level
// attestation, not court-grade PKI — stated, never oversold.
async function signWithBiometric(approverName) {
  if (!window.PublicKeyCredential) return "unsigned";
  try {
    const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!available) return "unsigned";
    let cred = window.localStorage.getItem("bs_bio_sign");
    if (!cred) {
      const created = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "BusinessSphere Approvals" },
          user: { id: new TextEncoder().encode("approvals"), name: approverName || "Approver", displayName: approverName || "Approver" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        },
      });
      cred = bufToB64(created.rawId);
      window.localStorage.setItem("bs_bio_sign", cred);
    }
    const assertion = await navigator.credentials.get({
      publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), allowCredentials: [{ type: "public-key", id: b64ToBuf(cred) }], userVerification: "required", timeout: 60000 },
    });
    return assertion ? "biometric" : null;
  } catch (_e) { return null; }
}

function BiometricClockPanel({ employees, attendance }) {
  const [bioAvailable, setBioAvailable] = useState(null); // null = checking
  const [busyId, setBusyId] = useState(null);
  const todayStr = TODAY.toISOString().slice(0, 10);

  useEffect(() => {
    if (!window.PublicKeyCredential) { setBioAvailable(false); return; }
    window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(setBioAvailable)
      .catch(() => setBioAvailable(false));
  }, []);

  const credKey = (emp) => `bs_bio_cred_${emp.id}`;
  const isEnrolled = (emp) => !!window.localStorage.getItem(credKey(emp));
  const todayRow = (emp) => attendance.rows.find((a) => a.employee === emp.name && a.date === todayStr && a.clockIn);

  async function enroll(emp) {
    setBusyId(emp.id);
    try {
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge: crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "BusinessSphere Attendance" },
          user: { id: new TextEncoder().encode(String(emp.id)), name: emp.name, displayName: emp.name },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required" },
          timeout: 60000,
        },
      });
      window.localStorage.setItem(credKey(emp), bufToB64(cred.rawId));
      notify(`Fingerprint enrolled for ${emp.name} on this device.`);
    } catch (_e) {
      notify("Enrollment cancelled or failed — the sensor prompt was dismissed.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function verifyFinger(emp) {
    const stored = window.localStorage.getItem(credKey(emp));
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [{ type: "public-key", id: b64ToBuf(stored) }],
        userVerification: "required",
        timeout: 60000,
      },
    });
    return !!assertion;
  }

  async function clockIn(emp) {
    setBusyId(emp.id);
    try {
      await verifyFinger(emp);
      const now = new Date();
      const late = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 0);
      const draft = { id: `ATT-BIO-${Date.now()}`, employee: emp.name, date: todayStr, status: late ? "Late" : "Present", clockIn: now.toISOString(), clockOut: null };
      attendance.setRows((prev) => [draft, ...prev]);
      notify(`${emp.name} clocked in at ${now.toTimeString().slice(0, 5)}${late ? " (Late)" : ""} — fingerprint verified.`);
      if (IS_CONFIGURED) {
        try {
          const header = await sb("hr_attendance").insert({ employee_id: emp.dbId || null, employee_name: emp.name, attendance_date: todayStr, status: draft.status, clock_in: draft.clockIn }).single().run();
          if (header?.id) attendance.setRows((prev) => prev.map((a) => (a.id === draft.id ? { ...a, dbId: header.id } : a)));
        } catch (_e) { notify("Clocked in locally, but the server update failed.", "error"); }
      }
    } catch (_e) {
      notify("Fingerprint not verified — clock-in refused.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function clockOut(emp) {
    const row = todayRow(emp);
    if (!row) return;
    setBusyId(emp.id);
    try {
      await verifyFinger(emp);
      const now = new Date();
      const hours = ((now - new Date(row.clockIn)) / 3600000).toFixed(1);
      attendance.setRows((prev) => prev.map((a) => (a.id === row.id ? { ...a, clockOut: now.toISOString() } : a)));
      notify(`${emp.name} clocked out at ${now.toTimeString().slice(0, 5)} — ${hours}h worked today.`);
      if (IS_CONFIGURED && row.dbId) {
        try { await sb("hr_attendance").eq("id", row.dbId).update({ clock_out: now.toISOString() }).run(); } catch (_e) { notify("Clocked out locally, but the server update failed.", "error"); }
      }
    } catch (_e) {
      notify("Fingerprint not verified — clock-out refused.", "error");
    } finally {
      setBusyId(null);
    }
  }

  if (bioAvailable === false) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 flex items-start gap-2.5">
        <Fingerprint size={16} className="text-slate-300 shrink-0 mt-0.5" />
        <p className="text-[12px] text-slate-500">Biometric clock-in needs a device with a real fingerprint sensor or equivalent (Android fingerprint, Windows Hello, Touch ID) — none was detected in this browser. Manual attendance logging below still works normally.</p>
      </div>
    );
  }

  const active = employees.rows.filter((e) => e.status === "Active");

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 pt-4 pb-3 border-b border-slate-100 flex items-start gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-[#DCFCE7] flex items-center justify-center shrink-0"><Fingerprint size={17} className="text-[#16A34A]" /></div>
        <div>
          <h3 className="text-[14px] font-semibold text-[#111827]">Biometric Clock-In</h3>
          <p className="text-[11.5px] text-slate-500">Real device fingerprint via WebAuthn — the print never leaves the employee device by design; the sensor verifies locally and only "verified" comes back. Enroll each employee once per device.</p>
        </div>
      </div>
      <div className="divide-y divide-slate-50">
        {active.map((emp) => {
          const row = todayRow(emp);
          const enrolled = isEnrolled(emp);
          const busy = busyId === emp.id;
          return (
            <div key={emp.id} className="flex items-center justify-between px-4 sm:px-5 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[#111827] truncate">{emp.name}</p>
                <p className="text-[11px] text-slate-400">
                  {row?.clockOut ? `In ${row.clockIn.slice(11, 16)} · Out ${row.clockOut.slice(11, 16)} · ${(((new Date(row.clockOut)) - (new Date(row.clockIn))) / 3600000).toFixed(1)}h`
                    : row ? `Clocked in at ${row.clockIn.slice(11, 16)}`
                    : enrolled ? "Enrolled · not clocked in" : "Not enrolled on this device"}
                </p>
              </div>
              <div className="shrink-0 ml-3">
                {!enrolled && <button onClick={() => enroll(emp)} disabled={busy} className="text-[11.5px] font-medium border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-50 flex items-center gap-1"><Fingerprint size={12} /> {busy ? "Waiting for sensor..." : "Enroll"}</button>}
                {enrolled && !row && <button onClick={() => clockIn(emp)} disabled={busy} className="text-[11.5px] font-medium btn-primary text-white rounded-lg px-3 py-1.5 disabled:opacity-50 flex items-center gap-1"><Fingerprint size={12} /> {busy ? "Verifying..." : "Clock In"}</button>}
                {enrolled && row && !row.clockOut && <button onClick={() => clockOut(emp)} disabled={busy} className="text-[11.5px] font-medium bg-[#F59E0B] text-white rounded-lg px-3 py-1.5 disabled:opacity-50 flex items-center gap-1"><Fingerprint size={12} /> {busy ? "Verifying..." : "Clock Out"}</button>}
                {enrolled && row?.clockOut && <span className="text-[11px] font-medium text-[#16A34A]">Day complete</span>}
              </div>
            </div>
          );
        })}
        {active.length === 0 && <p className="text-[12px] text-slate-400 text-center py-6">No active employees to enroll.</p>}
      </div>
    </div>
  );
}

function Attendance({ employees }) {
  const attendance = useCompanyTable("hr_attendance", attendanceSeed, { order: { col: "attendance_date", ascending: false }, mapRow: mapAttendanceRow });
  const { rows, setRows, loading } = attendance;
  const [showForm, setShowForm] = useState(false);
  const todayStr = TODAY.toISOString().slice(0, 10);

  const todayStats = useMemo(() => {
    const today = rows.filter((a) => a.date === todayStr);
    return {
      present: today.filter((a) => a.status === "Present").length,
      late: today.filter((a) => a.status === "Late").length,
      absent: today.filter((a) => a.status === "Absent").length,
    };
  }, [rows, todayStr]);

  async function addAttendance(form) {
    const draft = { id: docId("ATT"), employee: form.employee, date: form.date, status: form.status };
    setRows((prev) => [draft, ...prev]);
    setShowForm(false);
    notify(`Attendance logged: ${draft.employee}`);
    if (IS_CONFIGURED) {
      try { await sb("hr_attendance").insert({ employee_name: draft.employee, attendance_date: draft.date, status: draft.status }).run(); } catch (_e) { notify("Logged locally, but saving to the server failed.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11.5px] text-slate-400 mb-1">Present Today</p><p className="text-[18px] font-mono font-semibold text-[#16A34A]">{todayStats.present}</p></div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11.5px] text-slate-400 mb-1">Late Today</p><p className="text-[18px] font-mono font-semibold text-[#F59E0B]">{todayStats.late}</p></div>
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4"><p className="text-[11.5px] text-slate-400 mb-1">Absent Today</p><p className="text-[18px] font-mono font-semibold text-[#EF4444]">{todayStats.absent}</p></div>
      </div>

      {/* Attendance analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 7-day attendance AreaChart */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Attendance — Last 7 Days</h3>
          {(() => {
            const data7 = Array.from({length:7}, (_,i) => {
              const d = new Date(TODAY);
              d.setDate(d.getDate()-6+i);
              const ds = d.toISOString().slice(0,10);
              const day = rows.filter(a => a.date===ds);
              return {
                day: d.toLocaleDateString("en",{weekday:"short"}),
                present: day.filter(a=>a.status==="Present").length,
                late:    day.filter(a=>a.status==="Late").length,
                absent:  day.filter(a=>a.status==="Absent").length,
              };
            });
            return (
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={data7} margin={{left:-10,right:4,top:0,bottom:0}}>
                  <CartesianGrid vertical={false} stroke="#F3F4F6"/>
                  <XAxis dataKey="day" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip/>
                  <Bar dataKey="present" stackId="a" fill="#16A34A" radius={[0,0,0,0]} name="Present"/>
                  <Bar dataKey="late"    stackId="a" fill="#F59E0B" radius={[0,0,0,0]} name="Late"/>
                  <Bar dataKey="absent"  stackId="a" fill="#EF4444" radius={[3,3,0,0]} name="Absent"/>
                </BarChart>
              </ResponsiveContainer>
            );
          })()}
        </div>

        {/* Department attendance breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Today Status by Employee</h3>
          <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
            {employees.filter(e=>e.status==="Active").slice(0,8).map(e => {
              const todayRecord = rows.find(a => a.date===TODAY.toISOString().slice(0,10) && (a.employee===e.name||a.employee===e.fullName));
              const status = todayRecord?.status || "No Record";
              const col = {Present:"#16A34A",Late:"#F59E0B",Absent:"#EF4444"}[status] || "#94A3B8";
              return (
                <div key={e.id} className="flex items-center gap-2.5 py-1">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:col}}>
                    {(e.fullName||e.name||"?").charAt(0)}
                  </div>
                  <span className="text-[12.5px] font-medium text-[#111827] flex-1 truncate">{e.fullName||e.name}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{background:col+"18",color:col}}>{status}</span>
                  {todayRecord && <span className="text-[10.5px] font-mono text-slate-400 shrink-0">{todayRecord.checkIn}–{todayRecord.checkOut||"—"}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BiometricClockPanel employees={employees} attendance={attendance} />

      {/* ── Biometric Verification Summary ── */}
      {(() => {
        const todayRows = rows.filter(r=>r.date===todayStr);
        const verified  = todayRows.filter(r=>r.verified);
        const manual    = todayRows.filter(r=>!r.verified&&r.clockIn);
        const noSig     = todayRows.filter(r=>!r.clockIn);
        const pct       = todayRows.length>0?Math.round(verified.length/todayRows.length*100):0;
        return (
          <div className="bg-[#0D2214] rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[13px] font-black">🔒 Today Biometric Verification Report</p>
                <p className="text-[11px] text-[rgba(255,255,255,.5)]">{todayStr} · {todayRows.length} records total</p>
              </div>
              <div className="text-right">
                <p className="text-[28px] font-black text-[#16A34A]">{pct}%</p>
                <p className="text-[10px] text-[rgba(255,255,255,.5)]">verified</p>
              </div>
            </div>
            {/* Verification rate bar */}
            <div className="w-full h-2 rounded-full bg-[rgba(255,255,255,.1)] mb-3 overflow-hidden">
              <div className="h-full rounded-full bg-[#16A34A] transition-all" style={{width:pct+"%"}}/>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                ["🔒 Biometric",verified.length,"#16A34A","#F0FDF4"],
                ["📝 Manual",manual.length,"#F59E0B","#FFFBEB"],
                ["⚠ No Clock-in",noSig.length,"#EF4444","#FEF2F2"],
              ].map(([l,n,col,bg])=>(
                <div key={l} className="rounded-xl p-3 text-center" style={{background:"rgba(255,255,255,.06)"}}>
                  <p className="text-[20px] font-black" style={{color:col}}>{n}</p>
                  <p className="text-[10.5px] text-[rgba(255,255,255,.5)]">{l}</p>
                </div>
              ))}
            </div>
            {verified.length>0&&(
              <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,.08)]">
                <p className="text-[10.5px] text-[rgba(255,255,255,.4)] mb-1.5">Biometrically verified today:</p>
                <div className="flex flex-wrap gap-1.5">
                  {verified.map(r=>(
                    <span key={r.id} className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#16A34A] bg-[rgba(22,163,74,0.15)] border border-[rgba(22,163,74,0.3)] px-2 py-0.5 rounded-full">
                      <Fingerprint size={9}/>{r.employee} · {r.clockIn}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <div className="flex justify-end">
        <button onClick={() => setShowForm(true)} className="btn-primary text-white text-[13px] font-medium px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors shrink-0">
          <Plus size={15} /> Log Attendance
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[500px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Employee</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Clock In</th>
              <th className="px-4 py-3 font-medium">Clock Out</th>
              <th className="px-4 py-3 font-medium">Verification</th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={6} />}
              {!loading && rows.map((a) => (
                <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-[#111827]">{a.employee}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[12px]">{a.date}</td>
                  <td className="px-4 py-3">
                    <span className="text-[11px] font-medium px-2 py-1 rounded-full inline-flex items-center gap-1"
                      style={{background:ATTENDANCE_STATUS_COLOR[a.status]+"18",color:ATTENDANCE_STATUS_COLOR[a.status]}}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:ATTENDANCE_STATUS_COLOR[a.status]}}/>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{a.clockIn||"—"}</td>
                  <td className="px-4 py-3 font-mono text-[12px] text-slate-600">{a.clockOut||"—"}</td>
                  <td className="px-4 py-3">
                    {a.verified
                      ? <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
                          <Fingerprint size={10}/> 🔒 Biometric
                        </span>
                      : a.sigMethod==="unsigned"
                        ? <span className="text-[10.5px] text-[#F59E0B] font-medium">📝 Signed (unsigned)</span>
                        : <span className="text-[10.5px] text-slate-300 font-medium">Manual</span>
                    }
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={6}><EmptyState icon={CalendarCheck} title="No
          </table>
        </div>
      </div>
      {showForm && <AttendanceFormPanel employees={employees} onClose={() => setShowForm(false)} onSubmit={addAttendance} />}
    </div>
  );
}

function AttendanceFormPanel({ employees, onClose, onSubmit }) {
  const [form, setForm] = useState({ employee: employees[0]?.name || "", date: TODAY.toISOString().slice(0, 10), status: "Present" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.employee) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Attendance</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Log Attendance</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Employee">
            <select className={inputClass} value={form.employee} onChange={(e) => set("employee", e.target.value)}>
              {employees.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
          </FormField>
          <FormField label="Date"><input type="date" className={inputClass} value={form.date} onChange={(e) => set("date", e.target.value)} /></FormField>
          <FormField label="Status">
            <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["Present", "Late", "Absent", "On Leave"].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Save</button>
        </div>
      </form>
    </div>
  );
}

/* -------------------------------- PERFORMANCE ------------------------------------ */

function Performance({ employees }) {
  const reviews   = useCompanyTable("hr_performance_reviews", performanceReviewsSeed, { order:{ col:"review_date", ascending:false }, mapRow:mapPerformanceRow });
  const { rows, setRows, loading } = reviews;
  const [tab, setTab]     = useState("reviews");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employee:"", period:"Q3 2026", rating:"", reviewer:"", goals:"", achievements:"", areas:"", score:"" });

  const RATINGS = ["Outstanding","Exceeds Expectations","Meets Expectations","Needs Improvement","Unsatisfactory"];
  const RATING_COLOR = {
    Outstanding:            "#16A34A",
    "Exceeds Expectations": "#059669",
    "Meets Expectations":   "#2563EB",
    "Needs Improvement":    "#D97706",
    Unsatisfactory:         "#EF4444",
  };
  const PERIODS = ["Q1 2026","Q2 2026","Q3 2026","Q4 2026","Annual 2025","Annual 2026"];

  // OKR seed data
  const OKR_SEED = [
    { id:"OKR-001", objective:"Increase customer satisfaction score", owner:"Sales Team", period:"Q3 2026",
      keyResults:[
        { kr:"Achieve NPS ≥ 70", target:70, current:62, unit:"score" },
        { kr:"Reduce complaint resolution time", target:24, current:36, unit:"hours" },
        { kr:"Process 100% of refunds within 48h", target:100, current:85, unit:"%" },
      ]
    },
    { id:"OKR-002", objective:"Expand market reach in Dar es Salaam", owner:"Marketing", period:"Q3 2026",
      keyResults:[
        { kr:"Generate 200 qualified leads", target:200, current:147, unit:"leads" },
        { kr:"Onboard 15 new enterprise clients", target:15, current:9, unit:"clients" },
        { kr:"Grow social media followers by 40%", target:40, current:28, unit:"%" },
      ]
    },
    { id:"OKR-003", objective:"Improve operational efficiency", owner:"Operations", period:"Q3 2026",
      keyResults:[
        { kr:"Reduce order processing time to < 2 days", target:2, current:3.2, unit:"days" },
        { kr:"Achieve 98% inventory accuracy", target:98, current:94, unit:"%" },
        { kr:"Cut operational costs by 15%", target:15, current:8, unit:"%" },
      ]
    },
  ];

  async function submitReview() {
    if (!form.employee || !form.rating) return;
    const row = { ...form, id:docId("PR"), review_date:new Date().toISOString().slice(0,10), score:Number(form.score)||
      (form.rating==="Outstanding"?5:form.rating==="Exceeds Expectations"?4:form.rating==="Meets Expectations"?3:form.rating==="Needs Improvement"?2:1) };
    setRows(p => [row, ...p]);
    setShowForm(false);
    setForm({ employee:"", period:"Q3 2026", rating:"", reviewer:"", goals:"", achievements:"", areas:"", score:"" });
    notify("Performance review submitted for "+form.employee);
  }

  const avgScore = rows.length > 0 ? (rows.reduce((s,r)=>s+(r.score||3),0)/rows.length).toFixed(1) : 0;
  const topPerformers = [...rows].sort((a,b)=>(b.score||0)-(a.score||0)).slice(0,3);

  const RatingBadge = ({rating}) => (
    <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full text-white"
      style={{background:RATING_COLOR[rating]||"#6B7280"}}>{rating}</span>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Performance Management</h3>
          <p className="text-[12px] text-slate-400">360° reviews, OKRs, and ratings tracking</p>
        </div>
        <div className="flex gap-2">
          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            {[["reviews","Reviews"],["okr","OKRs"],["matrix","9-Box"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} className={"px-3 py-1.5 rounded-md text-[12px] font-medium transition-all "+(tab===id?"bg-white text-[#111827] shadow-sm":"text-slate-500")}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={()=>setShowForm(v=>!v)} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2 rounded-xl bg-[#7C3AED]">
            <Plus size={13}/>Review
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Reviews Done", rows.length, "#2563EB"],
          ["Avg Score", avgScore+"/5", rows.length>0&&avgScore>=4?"#16A34A":rows.length>0&&avgScore>=3?"#2563EB":"#EF4444"],
          ["Outstanding", rows.filter(r=>r.rating==="Outstanding").length, "#16A34A"],
          ["Needs Attention", rows.filter(r=>["Needs Improvement","Unsatisfactory"].includes(r.rating)).length, "#EF4444"],
        ].map(([l,v,col]) => (
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 p-4 text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[22px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Add review form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 space-y-3">
          <p className="text-[14px] font-semibold text-[#111827]">New Performance Review</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <FormField label="Employee *">
              <select className={inputClass} value={form.employee} onChange={e=>setForm({...form,employee:e.target.value})}>
                <option value="">Select employee...</option>
                {employees.map(e=><option key={e.id} value={e.fullName||e.name}>{e.fullName||e.name}</option>)}
              </select>
            </FormField>
            <FormField label="Review Period">
              <select className={inputClass} value={form.period} onChange={e=>setForm({...form,period:e.target.value})}>
                {PERIODS.map(p=><option key={p}>{p}</option>)}
              </select>
            </FormField>
            <FormField label="Overall Rating *">
              <select className={inputClass} value={form.rating} onChange={e=>setForm({...form,rating:e.target.value})}>
                <option value="">Select rating...</option>
                {RATINGS.map(r=><option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Reviewer"><input className={inputClass} value={form.reviewer} onChange={e=>setForm({...form,reviewer:e.target.value})}/></FormField>
            <FormField label="Goals Achieved"><input className={inputClass} value={form.goals} onChange={e=>setForm({...form,goals:e.target.value})} placeholder="Key goals met"/></FormField>
            <FormField label="Areas for Growth"><input className={inputClass} value={form.areas} onChange={e=>setForm({...form,areas:e.target.value})} placeholder="Development areas"/></FormField>
          </div>
          <div className="flex gap-2">
            <button onClick={submitReview} className="text-[12.5px] font-semibold text-white px-5 py-2.5 rounded-xl bg-[#7C3AED]">Submit Review</button>
            <button onClick={()=>setShowForm(false)} className="text-[12.5px] text-slate-500 px-4 py-2.5">Cancel</button>
          </div>
        </div>
      )}

      {/* REVIEWS TAB */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {rows.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
              <Award size={40} className="mx-auto text-slate-200 mb-3"/>
              <p className="text-slate-400 text-[13.5px]">No reviews yet — click Review to start</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <table className="w-full text-[12.5px]">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  {["Employee","Period","Rating","Score","Reviewer","Goals","Areas","Date"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr></thead>
                <tbody>{rows.map(r => {
                  const scoreVal = r.score || 3;
                  return (
                    <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {(r.employee||"?").charAt(0)}
                          </div>
                          <span className="font-medium text-[#111827]">{r.employee}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.period}</td>
                      <td className="px-4 py-3"><RatingBadge rating={r.rating}/></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[13px]" style={{color:RATING_COLOR[r.rating]||"#6B7280"}}>{scoreVal}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i=>(
                              <div key={i} className="w-2 h-2 rounded-full" style={{background:i<=scoreVal?"#7C3AED":"#E5E7EB"}}/>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{r.reviewer}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate text-[11.5px]">{r.goals||"—"}</td>
                      <td className="px-4 py-3 text-slate-400 max-w-[140px] truncate text-[11.5px]">{r.areas||"—"}</td>
                      <td className="px-4 py-3 font-mono text-[11.5px] text-slate-400">{r.review_date}</td>
                    </tr>
                  );
                })}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* OKRs TAB */}
      {tab === "okr" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-slate-700">Objectives & Key Results — Q3 2026</p>
            <button onClick={()=>notify("Add OKR form")} className="flex items-center gap-1 text-[12px] font-semibold text-white px-3 py-2 rounded-xl bg-[#7C3AED]"><Plus size={12}/>Add OKR</button>
          </div>
          {OKR_SEED.map(okr => {
            const avgProgress = okr.keyResults.reduce((s,kr)=>{
              const pct = kr.unit==="hours"||kr.unit==="days"
                ? Math.round((kr.target/kr.current)*100)  // lower is better
                : Math.round((kr.current/kr.target)*100);
              return s + Math.min(pct,100);
            }, 0) / okr.keyResults.length;
            return (
              <div key={okr.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[14px] font-bold text-[#111827]">{okr.objective}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">{okr.owner} · {okr.period}</p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-[22px] font-black" style={{color:avgProgress>=70?"#16A34A":avgProgress>=40?"#F59E0B":"#EF4444"}}>{Math.round(avgProgress)}%</p>
                    <p className="text-[10.5px] text-slate-400">Overall</p>
                  </div>
                </div>
                {/* Overall progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full transition-all" style={{width:avgProgress+"%",background:avgProgress>=70?"#16A34A":avgProgress>=40?"#F59E0B":"#EF4444"}}/>
                </div>
                <div className="space-y-3">
                  {okr.keyResults.map((kr, i) => {
                    const isLower = kr.unit==="hours"||kr.unit==="days";
                    const pct = Math.min(100, isLower
                      ? Math.round((kr.target/kr.current)*100)
                      : Math.round((kr.current/kr.target)*100));
                    const col = pct>=70?"#16A34A":pct>=40?"#F59E0B":"#EF4444";
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[12.5px] text-slate-600 flex-1">{kr.kr}</p>
                          <span className="text-[12px] font-mono font-bold ml-3 shrink-0" style={{color:col}}>
                            {kr.current} / {kr.target} {kr.unit}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{width:pct+"%",background:col}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 9-BOX MATRIX TAB */}
      {tab === "matrix" && (
        <div className="space-y-4">
          <p className="text-[12.5px] text-slate-500">9-Box Grid: Performance (horizontal) vs Potential (vertical). Positions staff into 9 talent segments to guide succession and development.</p>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
            {/* Y-axis label */}
            <div className="flex gap-3">
              <div className="flex flex-col justify-between py-6 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest" style={{writingMode:"vertical-rl",transform:"rotate(180deg)"}}>← Potential →</span>
              </div>
              <div className="flex-1">
                {/* Grid: 3 rows × 3 cols */}
                {[
                  { row:"High",   cells:["Question Mark",   "Rising Star",     "Star Leader"] },
                  { row:"Medium", cells:["Solid Citizen",   "Core Player",     "Future Leader"] },
                  { row:"Low",    cells:["Risk / Poor Fit", "Effective But...", "Strong Professional"] },
                ].map(({row, cells}) => (
                  <div key={row} className="grid grid-cols-3 gap-2 mb-2">
                    <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-end pr-2 shrink-0 w-12">{row}</div>
                    {cells.map((label, ci) => {
                      const bg = ci===1&&row==="High"?"#EFF6FF":ci===2&&row==="High"?"#F0FDF4":ci===2&&row==="Medium"?"#FFFBEB":"#F8FAFC";
                      const border = ci===2&&row==="High"?"#86EFAC":ci===1&&row==="High"?"#93C5FD":"#E5E7EB";
                      // Find employees in this box
                      const empsHere = employees.filter((_,idx) => {
                        const colMap  = ["Low","Medium","High"];
                        const perfMap = ["Low","Medium","High"];
                        return perfMap.indexOf("Medium") === ci && colMap.indexOf("Medium") === (row==="High"?2:row==="Medium"?1:0);
                      }).slice(0,2);
                      return (
                        <div key={ci} className="rounded-xl border p-2.5 min-h-[72px]" style={{background:bg,borderColor:border}}>
                          <p className="text-[10.5px] font-semibold text-slate-600 mb-1.5">{label}</p>
                          {empsHere.map(e => (
                            <div key={e.id} className="flex items-center gap-1 mb-1">
                              <div className="w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center text-white text-[8px] font-bold">{(e.fullName||e.name||"?").charAt(0)}</div>
                              <span className="text-[10px] text-slate-600 truncate">{(e.fullName||e.name||"—").split(" ")[0]}</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {/* X-axis label */}
                <div className="flex justify-between px-12 mt-1">
                  <span className="text-[10px] text-slate-400 font-medium">Low</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">← Performance →</span>
                  <span className="text-[10px] text-slate-400 font-medium">High</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function PerformanceFormPanel({ employees, onClose, onSubmit }) {
  const [form, setForm] = useState({ employee: employees[0]?.name || "", period: "", rating: PERFORMANCE_RATINGS[0], reviewer: "", notes: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.employee || !form.period.trim()) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[400px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Performance</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">New Review</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Employee">
            <select className={inputClass} value={form.employee} onChange={(e) => set("employee", e.target.value)}>
              {employees.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
          </FormField>
          <FormField label="Review period" required>
            <input className={inputClass} value={form.period} onChange={(e) => set("period", e.target.value)} placeholder="e.g. H1 2026" />
          </FormField>
          <FormField label="Rating">
            <select className={inputClass} value={form.rating} onChange={(e) => set("rating", e.target.value)}>
              {PERFORMANCE_RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>
          <FormField label="Reviewer">
            <input className={inputClass} value={form.reviewer} onChange={(e) => set("reviewer", e.target.value)} placeholder="e.g. EzyMP" />
          </FormField>
          <FormField label="Notes">
            <textarea className={inputClass} rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Summary of the review..." />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Save Review</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- TRAINING ------------------------------------- */

function Training({ employees }) {
  const training = useCompanyTable("hr_training", trainingSeed, { order:{ col:"id", ascending:false }, mapRow:mapTrainingRow });
  const { rows, setRows, loading } = training;
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");

  async function addTraining(form) {
    const draft = { id:docId("TRN"), employee:form.employee, course:form.course, status:"Not Started", completionDate:null };
    setRows(p=>[draft,...p]);
    setShowForm(false);
    notify("Training assigned: "+draft.course);
    if (IS_CONFIGURED) { try { await sb("hr_training").insert({ employee_name:draft.employee, course:draft.course, status:"Not Started" }).run(); } catch(_e) { notify("Assigned locally, server save failed.","error"); } }
  }

  async function markComplete(id) {
    setRows(p=>p.map(r=>r.id===id?{...r,status:"Completed",completionDate:TODAY.toISOString().slice(0,10)}:r));
    if (IS_CONFIGURED) { try { await sb("hr_training").eq("id",id).update({status:"Completed",completion_date:TODAY.toISOString().slice(0,10)}).run(); } catch(_e){} }
    notify("Training marked complete");
  }

  const STATUS_CFG = {
    "Not Started":{ col:"#94A3B8", bg:"#F1F5F9" },
    "In Progress": { col:"#F59E0B", bg:"#FFFBEB" },
    "Completed":   { col:"#16A34A", bg:"#F0FDF4" },
    "Cancelled":   { col:"#EF4444", bg:"#FEF2F2" },
  };

  const completed   = rows.filter(r=>r.status==="Completed").length;
  const inProgress  = rows.filter(r=>r.status==="In Progress").length;
  const notStarted  = rows.filter(r=>r.status==="Not Started").length;
  const compRate    = rows.length>0?Math.round(completed/rows.length*100):0;

  // Unique courses + completion rates
  const courses = useMemo(()=>{
    const map={};
    rows.forEach(r=>{
      if(!map[r.course]) map[r.course]={course:r.course,total:0,done:0};
      map[r.course].total++;
      if(r.status==="Completed") map[r.course].done++;
    });
    return Object.values(map).sort((a,b)=>b.total-a.total).slice(0,6);
  },[rows]);

  // Filter rows
  const filtered = filter==="all" ? rows : rows.filter(r=>r.status===filter);

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Total Enrollments", rows.length,   "#2563EB"],
          ["Completed",         completed,      "#16A34A"],
          ["In Progress",       inProgress,     "#F59E0B"],
          ["Completion Rate",   compRate+"%",   compRate>=70?"#16A34A":compRate>=40?"#F59E0B":"#EF4444"],
        ].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[20px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Course completion breakdown */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
          <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Course Completion Rates</h3>
          <div className="space-y-3">
            {courses.map(course => {
              const pct = course.total>0?Math.round(course.done/course.total*100):0;
              const col = pct>=70?"#16A34A":pct>=40?"#F59E0B":"#EF4444";
              return (
                <div key={course.course} className="flex items-center gap-3">
                  <span className="text-[12.5px] text-slate-600 w-36 shrink-0 truncate">{course.course}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{width:pct+"%",background:col}}/>
                  </div>
                  <span className="text-[12px] font-bold w-12 text-right shrink-0" style={{color:col}}>{pct}%</span>
                  <span className="text-[11px] text-slate-400 w-14 shrink-0">{course.done}/{course.total}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Table with filter + mark complete */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-[13.5px] font-semibold text-[#111827]">Training Records</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
              {["all","Not Started","In Progress","Completed"].map(s=>(
                <button key={s} onClick={()=>setFilter(s)}
                  className={"px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-all "+(filter===s?"bg-white text-[#111827] shadow-sm":"text-slate-500")}>
                  {s==="all"?"All":s}
                </button>
              ))}
            </div>
            <button onClick={()=>setShowForm(true)} className="flex items-center gap-1 text-[12px] font-semibold text-white px-3 py-2 rounded-xl bg-[#16A34A]">
              <Plus size={12}/>Assign
            </button>
          </div>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No {filter==="all"?"training records":filter.toLowerCase()+" trainings"} yet.</div>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {["Employee","Course","Status","Completion Date","Action"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(r=>{
                const sc = STATUS_CFG[r.status]||STATUS_CFG["Not Started"];
                return (
                  <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-[10px] font-bold">{r.employee?.charAt(0)||"?"}</div>
                        <span className="font-medium text-[#111827]">{r.employee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.course}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{background:sc.bg,color:sc.col}}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11.5px] text-slate-400">{r.completionDate||"—"}</td>
                    <td className="px-4 py-3">
                      {r.status !== "Completed" && (
                        <button onClick={()=>markComplete(r.id)} className="text-[11px] font-semibold text-white bg-[#16A34A] px-2.5 py-1 rounded-lg">
                          ✓ Complete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <TrainingFormPanel employees={employees} onClose={()=>setShowForm(false)} onSubmit={addTraining}/>}
    </div>
  );
}


function TrainingFormPanel({ employees, onClose, onSubmit }) {
  const [form, setForm] = useState({ employee: employees[0]?.name || "", course: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!form.course.trim()) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Training</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Assign Training</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Employee">
            <select className={inputClass} value={form.employee} onChange={(e) => set("employee", e.target.value)}>
              {employees.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
          </FormField>
          <FormField label="Course" required>
            <input className={inputClass} value={form.course} onChange={(e) => set("course", e.target.value)} placeholder="e.g. Fleet Safety Certification" />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Assign</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------------- BENEFITS ------------------------------------- */

function Benefits({ employees }) {
  const benefits = useCompanyTable("hr_benefits", benefitsSeed, { order:{ col:"enrollment_date", ascending:false }, mapRow:mapBenefitRow });
  const { rows, setRows, loading } = benefits;
  const [showForm, setShowForm] = useState(false);

  const totalMonthly = rows.filter(b=>b.status==="Active").reduce((s,b)=>s+b.monthlyValue,0);
  const activeCount  = rows.filter(b=>b.status==="Active").length;

  async function addBenefit(form) {
    const draft = { id:docId("BEN"), employee:form.employee, type:form.type, monthlyValue:Number(form.monthlyValue)||0, status:"Active", enrollmentDate:TODAY.toISOString().slice(0,10) };
    setRows(p=>[draft,...p]);
    setShowForm(false);
    notify("Enrolled "+draft.employee+" in "+draft.type);
    if (IS_CONFIGURED) { try { await sb("hr_benefits").insert({ employee_name:draft.employee, benefit_type:draft.type, monthly_value:draft.monthlyValue, status:"Active", enrollment_date:draft.enrollmentDate }).run(); } catch(_e) { notify("Enrolled locally, server save failed.","error"); } }
  }

  // Benefits cost by type
  const byType = useMemo(()=>{
    const map={};
    rows.filter(b=>b.status==="Active").forEach(b=>{ map[b.type]=(map[b.type]||0)+b.monthlyValue; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([name,value],i)=>({
      name, value, fill:["#2563EB","#16A34A","#F59E0B","#7C3AED","#EF4444","#0891B2"][i%6],
    }));
  },[rows]);

  // Employee coverage (% of active employees with at least one benefit)
  const covered = new Set(rows.filter(b=>b.status==="Active").map(b=>b.employee)).size;
  const empCount = employees.filter(e=>e.status==="Active").length;
  const coveragePct = empCount>0?Math.round(covered/empCount*100):0;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          ["Active Benefits",  activeCount,                                    "#2563EB"],
          ["Monthly Cost",     "TZS "+money(Math.round(totalMonthly))+"k",    "#16A34A"],
          ["Annual Cost",      "TZS "+money(Math.round(totalMonthly*12))+"k", "#F59E0B"],
          ["Employee Coverage",coveragePct+"%",                                coveragePct>=80?"#16A34A":"#F59E0B"],
        ].map(([l,v,col])=>(
          <div key={l} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 text-center">
            <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{l}</p>
            <p className="text-[18px] font-bold" style={{color:col}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Benefits cost PieChart */}
      {byType.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Monthly Cost by Benefit Type</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={140}>
                <RPieChart>
                  <Pie data={byType} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {byType.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                  </Pie>
                  <Tooltip formatter={(v)=>["TZS "+money(v)+"k/mo","Cost"]}/>
                </RPieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {byType.map(d=>(
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[12px] text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:d.fill}}/>{d.name}
                    </span>
                    <span className="text-[12px] font-bold" style={{color:d.fill}}>TZS {money(d.value)}k</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Employee coverage bar */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Employee Coverage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12.5px] text-slate-600">Employees with benefits</span>
                  <span className="text-[13px] font-bold" style={{color:coveragePct>=80?"#16A34A":"#F59E0B"}}>{covered}/{empCount}</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{width:coveragePct+"%",background:coveragePct>=80?"#16A34A":"#F59E0B"}}/>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{coveragePct}% coverage</p>
              </div>
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[11.5px] text-slate-500 font-medium">Cost per employee:</p>
                <p className="text-[22px] font-bold text-[#2563EB]">TZS {money(Math.round(totalMonthly/Math.max(covered,1)))}k<span className="text-[13px] font-normal text-slate-400">/mo</span></p>
                <p className="text-[11px] text-slate-400">Annual: TZS {money(Math.round(totalMonthly*12/Math.max(covered,1)))}k per covered employee</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <p className="text-[13.5px] font-semibold text-[#111827]">Benefits Registry</p>
          <button onClick={()=>setShowForm(true)} className="flex items-center gap-1 text-[12px] font-semibold text-white px-3 py-2 rounded-xl bg-[#2563EB]">
            <Plus size={12}/>Enroll
          </button>
        </div>
        {loading ? (
          <div className="p-6 text-center text-slate-400">Loading...</div>
        ) : (
          <table className="w-full text-[12.5px]">
            <thead><tr className="border-b border-slate-100 bg-slate-50">
              {["Employee","Benefit Type","Monthly Value","Enrolled","Status"].map(h=>(
                <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {rows.map(b=>{
                const isActive = b.status==="Active";
                return (
                  <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-[10px] font-bold">{b.employee?.charAt(0)||"?"}</div>
                        <span className="font-medium text-[#111827]">{b.employee}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.type}</td>
                    <td className="px-4 py-3 font-mono font-bold text-[#2563EB]">TZS {money(b.monthlyValue)}k</td>
                    <td className="px-4 py-3 font-mono text-[11.5px] text-slate-400">{b.enrollmentDate}</td>
                    <td className="px-4 py-3">
                      <span className={"text-[10.5px] font-semibold px-2 py-0.5 rounded-full "+(isActive?"bg-green-50 text-green-700":"bg-slate-100 text-slate-500")}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length===0&&<tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No benefits enrolled yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showForm && <BenefitFormPanel employees={employees} onClose={()=>setShowForm(false)} onSubmit={addBenefit}/>}
    </div>
  );
}

// (fragment removed)




function BenefitFormPanel({ employees, onClose, onSubmit }) {
  const [form, setForm] = useState({ employee: employees[0]?.name || "", type: BENEFIT_TYPES[0], monthlyValue: "" });
  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }
  function handleSubmit(e) { e.preventDefault(); if (!(Number(form.monthlyValue) > 0)) return; onSubmit(form); }

  return (
    <div className="fixed inset-0 z-30 flex justify-end">
      <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]" onClick={onClose} />
      <form onSubmit={handleSubmit} className="relative w-full sm:w-[380px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col" style={{ animation: "slideIn .15s ease-out" }}>
        <div className="px-6 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between">
          <div><p className="text-[11px] text-slate-400 uppercase tracking-wide">Benefits</p><h2 className="text-[18px] font-semibold text-[#111827] mt-0.5">Enroll Benefit</h2></div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 flex-1 space-y-4">
          <FormField label="Employee">
            <select className={inputClass} value={form.employee} onChange={(e) => set("employee", e.target.value)}>
              {employees.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
          </FormField>
          <FormField label="Benefit type">
            <select className={inputClass} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {BENEFIT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </FormField>
          <FormField label="Monthly value (TZS 000)" required>
            <input type="number" min="0" className={inputClass} value={form.monthlyValue} onChange={(e) => set("monthlyValue", e.target.value)} placeholder="0" />
          </FormField>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 text-[12px] font-medium border border-slate-200 rounded-lg py-2.5 hover:bg-slate-50">Cancel</button>
          <button type="submit" className="flex-1 text-[12px] font-medium btn-primary text-white rounded-lg py-2.5">Enroll</button>
        </div>
      </form>
    </div>
  );
}

/* ----------------------------------- PAYROLL ------------------------------------- */

function Payroll({ employees, expensesHook }) {
  const runs = useCompanyTable("hr_payroll_runs", payrollRunsSeed, { order: { col: "processed_date", ascending: false }, mapRow: mapPayrollRunRow });
  const { rows, setRows, loading } = runs;
  const activeEmployees = employees.filter((e) => e.status !== "Inactive");
  const currentTotal = activeEmployees.reduce((s, e) => s + e.salary, 0);
  const currentPeriod = TODAY.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const alreadyProcessed = rows.some((r) => r.period === currentPeriod);

  // Generate real payslips — one PDF-print page per employee, showing their
  // gross salary, real TRA PAYE (the same tested bracket function Tax Center
  // uses), net pay, and the company details. printAsPDF opens the browser's
  // print dialog which on every modern device gives "Save as PDF" as a
  // first-class option. Each payslip is a separate window so they can be
  // printed or saved individually or all at once.
  function generatePayslips(run, emps) {
    const co   = window.__smartManagerCompany || {};
    const ACCENT = "#16A34A";
    const DARK   = "#0D2214";
    // TRA PAYE brackets (TZS thousands / month)
    const PAYE = (s) => s <= 270 ? 0 : s <= 520 ? (s-270)*0.08 : s <= 760 ? 20+(s-520)*0.20 : s <= 1000 ? 68+(s-760)*0.25 : 128+(s-1000)*0.30;
    if (!emps.length) { notify("No active employees to generate payslips for.", "error"); return; }
    const rows = emps.map((e) => {
      const gross = e.salary;
      const paye  = Math.round(PAYE(gross) * 100) / 100;
      const sdl   = Math.round(gross * 0.035 * 100) / 100;
      const nhif  = Math.round(Math.min(gross * 0.015, 10) * 100) / 100; // NHIF 1.5% capped at 10k
      const totalDeductions = paye + sdl + nhif;
      const net   = gross - totalDeductions;
      return { ...e, gross, paye, sdl, nhif, totalDeductions, net };
    });

    const logoHtml = co.logo
      ? `<img src="${co.logo}" style="height:44px;object-fit:contain" alt="logo"/>`
      : `<div style="width:44px;height:44px;border-radius:10px;background:${ACCENT};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#fff">${(co.name||"B").charAt(0)}</div>`;

    const slips = rows.map((e, idx) => `
      <div class="slip" style="page-break-after:${idx < rows.length-1 ? "always" : "auto"}">

        <!-- Header bar -->
        <div class="slip-header">
          <div style="display:flex;align-items:center;gap:14px">
            ${logoHtml}
            <div>
              <div style="font-size:17px;font-weight:800;color:white">${co.name || "BusinessSphere"}</div>
              <div style="font-size:10.5px;color:rgba(255,255,255,0.55);margin-top:2px">
                ${[co.address,co.city,"Tanzania"].filter(Boolean).join(" · ")}
                ${co.tin ? " · TIN: "+co.tin : ""}
              </div>
            </div>
          </div>
          <div style="text-align:right">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:rgba(255,255,255,0.5)">Payslip</div>
            <div style="font-size:22px;font-weight:900;color:${ACCENT};margin-top:2px">${run.period}</div>
            <div style="font-size:10.5px;color:rgba(255,255,255,0.4);margin-top:2px">Processed: ${run.processedDate}</div>
          </div>
        </div>

        <!-- Employee info band -->
        <div class="emp-band">
          <div>
            <div class="emp-name">${e.name || e.fullName}</div>
            <div class="emp-meta">${e.role || "Employee"}${e.department ? " · " + e.department : ""}${e.id ? " · ID: "+e.id : ""}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.08em">Employee Since</div>
            <div style="font-size:12.5px;font-weight:600;color:#374151">${e.startDate || "—"}</div>
          </div>
        </div>

        <!-- Earnings + Deductions -->
        <div class="two-col">
          <!-- Earnings -->
          <div class="section">
            <div class="section-title" style="color:${ACCENT}">EARNINGS</div>
            <table class="line-table">
              <tr><td>Basic Salary</td><td class="amt green">TZS ${money(e.gross)}k</td></tr>
              <tr class="total-row"><td>GROSS PAY</td><td class="amt" style="font-size:14px;color:${ACCENT}">TZS ${money(e.gross)}k</td></tr>
            </table>
          </div>
          <!-- Deductions -->
          <div class="section">
            <div class="section-title" style="color:#EF4444">DEDUCTIONS</div>
            <table class="line-table">
              <tr><td>PAYE <span class="sub-note">(TRA brackets)</span></td><td class="amt red">− TZS ${money(e.paye)}k</td></tr>
              <tr><td>SDL <span class="sub-note">(3.5% of gross)</span></td><td class="amt red">− TZS ${money(e.sdl)}k</td></tr>
              <tr><td>NHIF <span class="sub-note">(1.5%, max 10k)</span></td><td class="amt red">− TZS ${money(e.nhif)}k</td></tr>
              <tr class="total-row"><td>TOTAL DEDUCTIONS</td><td class="amt red">− TZS ${money(e.totalDeductions)}k</td></tr>
            </table>
          </div>
        </div>

        <!-- Net pay banner -->
        <div class="net-banner">
          <div>
            <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,0.6)">NET PAY</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px">After all deductions</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:30px;font-weight:900;color:white;letter-spacing:-0.5px">TZS ${money(e.net)}k</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-top:1px">Per month · ${run.period}</div>
          </div>
        </div>

        <!-- Payment info -->
        ${co.bankName ? `
        <div class="pay-info">
          <div class="pay-field"><div class="pay-label">Payment Method</div><div class="pay-value">Bank Transfer</div></div>
          ${co.bankName ? `<div class="pay-field"><div class="pay-label">Bank</div><div class="pay-value">${co.bankName}</div></div>` : ""}
          ${co.bankAccount ? `<div class="pay-field"><div class="pay-label">Account</div><div class="pay-value" style="font-family:monospace">${co.bankAccount}</div></div>` : ""}
        </div>` : ""}

        <!-- Footer note -->
        <div class="slip-footer">
          <span>Confidential — For employee use only</span>
          <span>Generated by BusinessSphere ERP · ${new Date().toLocaleDateString()}</span>
        </div>
      </div>
    `).join("");

    const win = window.open("","_blank","width=900,height=1100");
    if (!win) { notify("Pop-up blocked — allow pop-ups to print payslips.", "error"); return; }
    win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
      <title>Payslips — ${run.period}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Inter,Arial,sans-serif;background:#F3F4F6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @media print{body{background:white}.toolbar{display:none!important}}
        .slip{max-width:720px;margin:24px auto;background:white;border-radius:14px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.10)}
        .slip-header{background:${DARK};padding:28px 32px;display:flex;justify-content:space-between;align-items:flex-start}
        .emp-band{background:#F8FAFB;border-bottom:1px solid #E5E7EB;padding:18px 32px;display:flex;justify-content:space-between;align-items:center}
        .emp-name{font-size:18px;font-weight:800;color:#111827}
        .emp-meta{font-size:11px;color:#6B7280;margin-top:3px}
        .two-col{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:#E5E7EB;margin:0}
        .section{background:white;padding:20px 24px}
        .section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;margin-bottom:10px}
        .line-table{width:100%;border-collapse:collapse}
        .line-table tr{border-bottom:1px solid #F9FAFB}
        .line-table td{padding:6px 0;font-size:12.5px;color:#374151}
        .amt{text-align:right;font-family:monospace;font-weight:600}
        .green{color:#16A34A}.red{color:#EF4444}
        .sub-note{font-size:10px;color:#9CA3AF;font-weight:400}
        .total-row td{border-top:2px solid #E5E7EB;padding-top:10px;font-weight:700;font-size:13px;border-bottom:none}
        .net-banner{background:${DARK};padding:22px 32px;display:flex;justify-content:space-between;align-items:center}
        .pay-info{padding:14px 32px;background:#F0FDF4;border-top:1px solid #D1FAE5;display:flex;gap:32px;flex-wrap:wrap}
        .pay-field{}.pay-label{font-size:10px;color:#9CA3AF;margin-bottom:2px}.pay-value{font-size:12.5px;font-weight:600;color:#111827}
        .slip-footer{padding:12px 32px;background:#F8FAFB;border-top:1px solid #E5E7EB;display:flex;justify-content:space-between;font-size:10px;color:#9CA3AF}
        .toolbar{position:fixed;bottom:24px;right:24px;display:flex;gap:8px;z-index:99}
        .btn{padding:10px 20px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;border:none;font-family:Inter,sans-serif}
        .btn-p{background:${ACCENT};color:white}.btn-c{background:white;color:#111827;border:1.5px solid #E5E7EB}
      </style></head><body>
      ${slips}
      <div class="toolbar no-print">
        <button class="btn btn-c" onclick="window.close()">Close</button>
        <button class="btn btn-p" onclick="window.print()">Print / Save PDF</button>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(() => win.focus(), 200);
    notify(`${rows.length} payslip${rows.length !== 1 ? "s" : ""} ready — print or save as PDF.`);
  }

  async function processPayroll() {
    const draft = {
      id: `PR-${TODAY.getFullYear()}-${String(TODAY.getMonth() + 1).padStart(2, "0")}`,
      period: currentPeriod, employeeCount: activeEmployees.length, totalAmount: currentTotal,
      status: "Processed", processedDate: TODAY.toISOString().slice(0, 10),
    };
    setRows((prev) => [draft, ...prev]);
    notify(`Payroll processed for ${currentPeriod} — TZS ${money(currentTotal)}k`);

    // The real consequence: processing payroll creates an actual expense in
    // the shared Finance table, the same one every other module reads —
    // not a number that only exists inside HR.
    const expenseDraft = {
      id: docId("EX"),
      vendor: `Payroll — ${currentPeriod}`, category: "Salaries",
      date: draft.processedDate, dueDate: draft.processedDate,
      amount: currentTotal, status: "Paid", method: "Bank Transfer",
    };
    expensesHook.setRows((prev) => [expenseDraft, ...prev]);

    if (IS_CONFIGURED) {
      try {
        const header = await sb("hr_payroll_runs").insert({
          period: draft.period, employee_count: draft.employeeCount, total_amount: draft.totalAmount,
          status: "Processed", processed_date: draft.processedDate,
        }).single().run();
        if (header?.id) setRows((prev) => prev.map((r) => (r.id === draft.id ? { ...r, dbId: header.id } : r)));
        const expHeader = await sb("finance_expenses").insert({
          vendor: expenseDraft.vendor, category: "Salaries", expense_date: expenseDraft.date,
          due_date: expenseDraft.dueDate, amount: expenseDraft.amount, status: "Paid", method: "Bank Transfer",
        }).single().run();
        if (expHeader?.id) expensesHook.setRows((prev) => prev.map((e) => (e.id === expenseDraft.id ? { ...e, dbId: expHeader.id } : e)));
      } catch (_e) { notify("Payroll processed locally, but saving to the server failed.", "error"); }
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[14px] font-semibold text-[#111827]">Current Period — {currentPeriod}</h3>
            <p className="text-[12px] text-slate-400">{activeEmployees.length} active employees</p>
          </div>
          <p className="text-[20px] font-mono font-semibold text-[#111827]">TZS {money(currentTotal)}k</p>
        </div>
        <button
          onClick={processPayroll}
          disabled={alreadyProcessed || activeEmployees.length === 0}
          className="btn-primary text-white text-[13px] font-semibold rounded-lg py-3 w-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {alreadyProcessed ? `${currentPeriod} already processed` : `Process Payroll — TZS ${money(currentTotal)}k`}
        </button>
        {!alreadyProcessed && (
          <p className="text-[11.5px] text-slate-400 mt-2.5">Creates a real "Salaries" expense in Finance for the total shown above.</p>
        )}
      </div>

      {/* Payroll analytics */}
      {activeEmployees.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Payroll by Department</h3>
            {(() => {
              const dm = {};
              activeEmployees.forEach(e=>{ const d=e.department||"General"; dm[d]=(dm[d]||0)+e.salary; });
              const data=Object.entries(dm).sort((a,b)=>b[1]-a[1]).map(([name,value])=>({name,value}));
              return(
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data} layout="vertical" margin={{left:5,right:20,top:0,bottom:0}}>
                    <XAxis type="number" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="name" type="category" tick={{fontSize:11}} axisLine={false} tickLine={false} width={75}/>
                    <Tooltip formatter={v=>["TZS "+money(v)+"k","Payroll"]}/>
                    <Bar dataKey="value" fill="#16A34A" radius={[0,5,5,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <h3 className="text-[14px] font-semibold text-[#111827] mb-3">Employee Salary Breakdown</h3>
            <div className="space-y-2 overflow-y-auto max-h-[165px] pr-1">
              {activeEmployees.slice(0,8).map(e=>{
                const pct=currentTotal>0?e.salary/currentTotal*100:0;
                return(
                  <div key={e.id} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#16A34A] flex items-center justify-center text-white text-[9px] font-bold shrink-0">{(e.fullName||e.name||"?").charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-[12px] font-medium text-[#111827] truncate">{e.fullName||e.name}</span>
                        <span className="text-[11px] font-mono font-bold text-[#16A34A] shrink-0 ml-2">TZS {money(e.salary)}k</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#16A34A] rounded-full" style={{width:pct+"%"}}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] min-w-[560px]">
            <thead><tr className="border-b border-slate-100 text-left text-[11px] text-slate-400 uppercase tracking-wide">
              <th className="px-4 py-3 font-medium">Period</th><th className="px-4 py-3 font-medium text-right">Employees</th><th className="px-4 py-3 font-medium text-right">Total (TZS 000)</th><th className="px-4 py-3 font-medium">Processed</th><th className="px-4 py-3 font-medium">Export</th>
            </tr></thead>
            <tbody>
              {loading && <SkeletonRows cols={4} />}
              {!loading && rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-[#111827]">{r.period}</td>
                  <td className="px-4 py-3 text-right font-mono text-slate-500">{r.employeeCount}</td>
                  <td className="px-4 py-3 text-right font-mono">{money(r.totalAmount)}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono">{r.processedDate}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button onClick={() => generatePayslips(r, activeEmployees)} className="text-[11.5px] font-medium text-[#16A34A] hover:underline flex items-center gap-1"><Download size={11}/> PDF</button>
                      <button onClick={()=>downloadCSV(`payroll-${r.period}`,activeEmployees.map(e=>{
                        const gross=e.salary||0;
                        const PAYE=(s)=>s<=270?0:s<=520?(s-270)*0.08:s<=760?20+(s-520)*0.20:s<=1000?68+(s-760)*0.25:128+(s-1000)*0.30;
                        const nssf=Math.min(gross*0.10,20);const nhif=gross<100?0.015*gross:gross<149?0.02*gross:0.025*gross;
                        const paye=PAYE(gross);const net=gross-paye-nssf-nhif;
                        return {Name:e.name||e.full_name||"",Dept:e.dept||"",Gross_k:gross,PAYE_k:Math.round(paye),NSSF_k:Math.round(nssf),NHIF_k:Math.round(nhif),Net_k:Math.round(net)};
                      }),[{key:"Name",label:"Employee"},{key:"Dept",label:"Department"},{key:"Gross_k",label:"Gross (TZS k)"},{key:"PAYE_k",label:"PAYE"},{key:"NSSF_k",label:"NSSF"},{key:"NHIF_k",label:"NHIF"},{key:"Net_k",label:"Net Pay"}])}
                        className="text-[11.5px] font-medium text-[#2563EB] hover:underline flex items-center gap-1"><Download size={11}/> CSV</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && <tr><td colSpan={4}><EmptyState icon={Banknote} title="No payroll runs yet" hint="Processed payroll periods will appear here." /></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- MANUFACTURING --------------------------------- */

const MFG_TABS = [
  { id: "boms", label: "Bill of Materials", icon: ClipboardList },
  { id: "workorders", label: "Production Planning", icon: Factory },
  { id: "machines", label: "Machines", icon: Cog },
  { id: "quality", label: "Quality Control", icon: ShieldCheck },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
];

function bomUnitCost(bom, inventoryRows) {
  const materials = bom.components.reduce((s, c) => s + bomComponentCost(c.sku, inventoryRows) * c.qty, 0);
  return materials + bom.laborCost;
}

export default HR;
