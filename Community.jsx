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


function HealthcareClinicModule({ currentUser, company }) {
  const [tab, setTab] = useState("overview");
  const [subTab, setSubTab] = useState("list");
  const [selected, setSelected] = useState(null);
  const [modalType, setModalType] = useState(null); // "patient" | "doctor" | "appointment" | "visit" | "prescription" | "report" | "laborder"

  // Data hooks
  const patients      = useCompanyTable("hc_patients",      HC_PATIENTS_SEED,      { mapRow: (r) => ({ ...r, fullName: (r.firstName||"") + " " + (r.lastName||"") }) });
  const doctors       = useCompanyTable("hc_doctors",       HC_DOCTORS_SEED,       { mapRow: (r) => ({ ...r, fullName: "Dr. " + r.firstName + " " + r.lastName }) });
  const appointments  = useCompanyTable("hc_appointments",  HC_APPTS_SEED,         { mapRow: (r) => r });
  const visits        = useCompanyTable("hc_visits",        HC_VISITS_SEED,        { mapRow: (r) => r });
  const prescriptions = useCompanyTable("hc_prescriptions", HC_PRESCRIPTIONS_SEED, { mapRow: (r) => r });
  const reports       = useCompanyTable("hc_reports",       HC_REPORTS_SEED,       { mapRow: (r) => r });
  const labOrders     = useCompanyTable("hc_lab_orders",    [],                    { mapRow: (r) => r });

  // Forms
  const blankPatient  = { firstName:"", lastName:"", gender:"Male", dob:"", bloodType:"A+", marital:"Single", status:"Stable", phone:"", email:"", nationalId:"", nationality:"", occupation:"", allergies:"None", chronicDiseases:"None", notes:"" };
  const blankDoctor   = { firstName:"", lastName:"", gender:"Male", specialty:"General Medicine", dept:"General Medicine", license:"", qualifications:"", fee:"", experience:"", phone:"", email:"", bio:"" };
  const blankAppt     = { patientId:"", doctorId:"", type:"Consultation", start:"", end:"", fee:"", reason:"", notes:"" };
  const blankVisit    = { patientId:"", doctorId:"", diagnosis:"", notes:"" };
  const blankRx       = { patientId:"", doctorId:"", notes:"", drugs:[{ name:HC_MEDICATIONS[0], dosage:"", frequency:"2x/day", days:7, qty:1, instructions:"" }] };
  const blankReport   = { visitId:"", patientId:"", doctorId:"", title:"", description:"", signature:"" };

  const [pForm, setPForm] = useState(blankPatient);
  const [dForm, setDForm] = useState(blankDoctor);
  const [aForm, setAForm] = useState(blankAppt);
  const [vForm, setVForm] = useState(blankVisit);
  const [rxForm, setRxForm] = useState(blankRx);
  const [repForm, setRepForm] = useState(blankReport);
  const [labSelected, setLabSelected] = useState([]);
  const [reviewPatient, setReviewPatient] = useState(patients.rows[0] || null);
  const [reviewDoc, setReviewDoc] = useState(doctors.rows[0] || null);
  const [reviewTab, setReviewTab] = useState("prescribe");

  const nextMrn = () => "MRN-001-" + String(patients.rows.length + 1).padStart(6, "0");
  const nextId  = (prefix, arr) => prefix + String(arr.length + 1).padStart(3, "0");

  // ── Saves ──────────────────────────────────────────────────────────────
  async function savePatient() {
    if (!pForm.firstName || !pForm.lastName) return;
    const row = { ...pForm, id: docId("PT"), mrn: nextMrn(), fullName: pForm.firstName + " " + pForm.lastName };
    patients.setRows((p) => [row, ...p]);
    setPForm(blankPatient); setModalType(null);
    notify("Patient " + row.fullName + " registered (" + row.mrn + ")");
    if (IS_CONFIGURED) { try { await sb("hc_patients").insert({ first_name:row.firstName, last_name:row.lastName, mrn:row.mrn, gender:row.gender, dob:row.dob, blood_type:row.bloodType, status:row.status, phone:row.phone, email:row.email, national_id:row.nationalId, nationality:row.nationality, allergies:row.allergies, chronic_diseases:row.chronicDiseases }).run(); } catch(_e){} }
  }

  async function saveDoctor() {
    if (!dForm.firstName || !dForm.lastName) return;
    const row = { ...dForm, id: nextId("DR-", doctors.rows), fee: Number(dForm.fee)||0, experience: Number(dForm.experience)||0, status:"Active", fullName:"Dr. " + dForm.firstName + " " + dForm.lastName };
    doctors.setRows((p) => [row, ...p]);
    setDForm(blankDoctor); setModalType(null);
    notify("Dr. " + dForm.firstName + " " + dForm.lastName + " added");
    if (IS_CONFIGURED) { try { await sb("hc_doctors").insert({ first_name:row.firstName, last_name:row.lastName, specialty:row.specialty, department:row.dept, license:row.license, qualifications:row.qualifications, fee:row.fee, experience:row.experience, phone:row.phone, email:row.email, status:"Active" }).run(); } catch(_e){} }
  }

  async function saveAppointment() {
    if (!aForm.patientId || !aForm.doctorId || !aForm.start) return;
    const pat = patients.rows.find((p) => p.id === aForm.patientId);
    const doc = doctors.rows.find((d) => d.id === aForm.doctorId);
    const row = { ...aForm, id: docId("APT"), patient: pat?.fullName||"", doctor: doc?.fullName||"", fee: Number(aForm.fee)||doc?.fee||0, status:"Scheduled" };
    appointments.setRows((p) => [row, ...p]);
    setAForm(blankAppt); setModalType(null);
    notify("Appointment booked for " + pat?.fullName);
    if (IS_CONFIGURED) { try { await sb("hc_appointments").insert({ patient_id:row.patientId, doctor_id:row.doctorId, type:row.type, start_time:row.start, end_time:row.end, fee:row.fee, reason:row.reason, status:"Scheduled" }).run(); } catch(_e){} }
  }

  async function openVisit(appt) {
    const existing = visits.rows.find((v) => v.patientId === appt.patientId && v.status === "Open");
    if (existing) { notify("Patient already has an open visit", "error"); return; }
    const row = { id: docId("V"), patientId: appt.patientId, patient: appt.patient, doctorId: appt.doctorId, doctor: appt.doctor, date: new Date().toISOString(), status:"Open", diagnosis:"", notes:"" };
    visits.setRows((p) => [row, ...p]);
    appointments.setRows((p) => p.map((a) => a.id === appt.id ? { ...a, status:"In Progress" } : a));
    notify("Visit opened for " + appt.patient);
  }

  async function closeVisit(visit, diagnosis, notes) {
    visits.setRows((p) => p.map((v) => v.id === visit.id ? { ...v, status:"Closed", diagnosis, notes } : v));
    notify("Visit closed for " + visit.patient);
    logAudit("Visit closed: " + visit.id, "Healthcare", currentUser?.name||"System", visit.patient);
  }

  async function issuePrescription() {
    if (!rxForm.patientId || !rxForm.doctorId || !rxForm.drugs.length) return;
    const pat = patients.rows.find((p) => p.id === rxForm.patientId);
    const doc = doctors.rows.find((d) => d.id === rxForm.doctorId);
    const row = { ...rxForm, id: docId("RX"), patient: pat?.fullName||"", doctor: doc?.fullName||"", date: TODAY.toISOString().slice(0,10), status:"Active" };
    prescriptions.setRows((p) => [row, ...p]);
    setRxForm(blankRx); setModalType(null);
    notify("Prescription issued for " + pat?.fullName);
  }

  async function createReport() {
    if (!repForm.patientId || !repForm.doctorId || !repForm.title) return;
    const pat = patients.rows.find((p) => p.id === repForm.patientId);
    const doc = doctors.rows.find((d) => d.id === repForm.doctorId);
    const row = { ...repForm, id: docId("RPT"), patient: pat?.fullName||"", doctor: doc?.fullName||"", date: TODAY.toISOString().slice(0,10), status: repForm.signature ? "Signed":"Draft" };
    reports.setRows((p) => [row, ...p]);
    setRepForm(blankReport); setModalType(null);
    notify("Medical report created for " + pat?.fullName);
  }

  function orderLabTests() {
    if (!labSelected.length || !reviewPatient) return;
    const row = { id: docId("LAB"), patientId: reviewPatient.id, patient: reviewPatient.fullName, doctor: reviewDoc?.fullName||"", tests: labSelected, date: TODAY.toISOString().slice(0,10), status:"Ordered" };
    labOrders.setRows((p) => [row, ...p]);
    setLabSelected([]);
    notify("Lab order created: " + labSelected.length + " test(s) for " + reviewPatient.fullName);
  }

  const HC_TABS = [
    { id:"overview",     label:"Overview",       icon: LayoutDashboard },
    { id:"patients",     label:"Patients",       icon: Users },
    { id:"doctors",      label:"Doctors",        icon: Stethoscope },
    { id:"appointments", label:"Appointments",   icon: CalendarCheck },
    { id:"visits",       label:"Visits",         icon: Activity },
    { id:"vitals",       label:"Triage / Vitals",icon: HeartPulse },
    { id:"doctorreview", label:"Doctor Review",  icon: ClipboardCheck },
    { id:"reports",      label:"Medical Reports",icon: FileText },
    { id:"prescriptions",label:"Prescriptions",  icon: Pill },
    { id:"laboratory",   label:"Laboratory",     icon: FlaskConical },
    { id:"radiology",    label:"Radiology",      icon: ScanLine },
    { id:"pharmacy",     label:"Pharmacy",       icon: Package },
    { id:"hcbilling",    label:"Billing",        icon: Receipt },
  ];

  const statusColor = { Stable:"#16A34A", Urgent:"#EF4444", Critical:"#DC2626", "In Progress":"#3B82F6", Scheduled:"#6B7280", Confirmed:"#059669", Completed:"#16A34A", Cancelled:"#9CA3AF", Active:"#16A34A", Signed:"#2563EB", Draft:"#F59E0B", Open:"#3B82F6", Closed:"#6B7280", Ordered:"#7C3AED" };
  const statusBg   = { Stable:"#DCFCE7", Urgent:"#FEE2E2", Critical:"#FEE2E2", "In Progress":"#DBEAFE", Scheduled:"#F3F4F6", Confirmed:"#DCFCE7", Completed:"#DCFCE7", Cancelled:"#F3F4F6", Active:"#DCFCE7", Signed:"#DBEAFE", Draft:"#FEF3C7", Open:"#DBEAFE", Closed:"#F3F4F6", Ordered:"#F5F3FF" };
  const StatusPill = ({ s }) => <span className="text-[10.5px] font-semibold px-2 py-0.5 rounded-full" style={{ background: statusBg[s]||"#F3F4F6", color: statusColor[s]||"#6B7280" }}>{s}</span>;

  const HC_BLUE  = "#1B4DE4";
  const HC_TEAL  = "#0F9D8E";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl overflow-hidden px-5 py-5" style={{ background: "linear-gradient(135deg,#1B4DE4 0%,#2D6BE4 50%,#0F9D8E 100%)" }}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope size={20} className="text-white" />
              <h1 className="text-[19px] font-bold text-white">Healthcare / Clinic Manager</h1>
            </div>
            <p className="text-[12px]" style={{ color:"rgba(255,255,255,.65)" }}>
              Patients &middot; Doctors &middot; Appointments &middot; Doctor Review &middot; Lab &middot; Prescriptions
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => { setModalType("patient"); setPForm(blankPatient); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white" style={{ background:"rgba(255,255,255,.15)", border:"1px solid rgba(255,255,255,.3)" }}><UserPlus size={13} />New Patient</button>
            <button onClick={()=>downloadCSV("patients",patients.rows.map(p=>({MRN:p.mrn||p.id,Name:(p.firstName||"")+" "+(p.lastName||""),Gender:p.gender||"",DOB:p.dob||"",BloodType:p.bloodType||"",Phone:p.phone||"",Insurance:p.insuranceProvider||""})),[{key:"MRN",label:"MRN"},{key:"Name",label:"Name"},{key:"Gender",label:"Gender"},{key:"DOB",label:"DOB"},{key:"BloodType",label:"Blood Type"},{key:"Phone",label:"Phone"},{key:"Insurance",label:"Insurance"}])}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white" style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)"}}>
              <Download size={13}/> CSV
            </button>
            <button onClick={()=>{const co=window.__smartManagerCompany||{};printReport("Patient Registry",`<div class="kpi-grid"><div class="kpi"><div class="kpi-label">Patients</div><div class="kpi-value" style="color:#0891B2">${patients.rows.length}</div></div></div><table><thead><tr><th>MRN</th><th>Name</th><th>Gender</th><th>Blood Type</th><th>Phone</th><th>Insurance</th></tr></thead><tbody>${patients.rows.map((p,i)=>`<tr style="background:${i%2===0?"white":"#F8FAFB"}"><td class="bold">${p.mrn||p.id}</td><td>${(p.firstName||"")} ${(p.lastName||"")}</td><td>${p.gender||"—"}</td><td>${p.bloodType||"—"}</td><td>${p.phone||"—"}</td><td>${p.insuranceProvider||"—"}</td></tr>`).join("")}</tbody></table>`,co);}}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white" style={{background:"rgba(255,255,255,.15)",border:"1px solid rgba(255,255,255,.3)"}}>
              <Printer size={13}/> PDF
            </button>
            <button onClick={() => setModalType("appointment")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white" style={{ background:"rgba(255,255,255,.2)", border:"1px solid rgba(255,255,255,.3)" }}><Plus size={13} />Book Appointment</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 bg-white rounded-xl p-1 border border-slate-200 overflow-x-auto">
        {HC_TABS.map((t) => { const I = t.icon; return (
          <button key={t.id} onClick={() => setTab(t.id)} className={"flex items-center gap-1 px-3 py-2 rounded-lg text-[11.5px] font-medium transition-colors whitespace-nowrap " + (tab === t.id ? "text-white shadow-sm" : "text-slate-500 hover:bg-slate-50")} style={{ background: tab === t.id ? HC_BLUE : "transparent" }}>
            <I size={12} />{t.label}
          </button>
        ); })}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label:"Patients",         value: patients.rows.length,                           sub:"Total registered",         color:"#1B4DE4", icon:Users,          bg:"linear-gradient(135deg,#1B4DE4,#4B79F5)" },
              { label:"Doctors",          value: doctors.rows.filter(d=>d.status==="Active").length, sub:"Active practitioners",  color:"#0F9D8E", icon:Stethoscope,    bg:"linear-gradient(135deg,#0F9D8E,#26BFB1)" },
              { label:"Appointments",     value: appointments.rows.length,                       sub:"Total booked",             color:"#7C3AED", icon:CalendarCheck,  bg:"linear-gradient(135deg,#7C3AED,#9F6FF0)" },
              { label:"Open Visits",      value: visits.rows.filter(v=>v.status==="Open").length, sub:"Currently active",        color:"#059669", icon:Activity,       bg:"linear-gradient(135deg,#059669,#10B981)" },
              { label:"Prescriptions",    value: prescriptions.rows.filter(p=>p.status==="Active").length, sub:"Active today",  color:"#D97706", icon:Pill,           bg:"linear-gradient(135deg,#D97706,#F59E0B)" },
              { label:"Lab Orders",       value: labOrders.rows.length,                          sub:"Pending results",          color:"#DC2626", icon:FlaskConical,   bg:"linear-gradient(135deg,#DC2626,#EF4444)" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl p-4 text-white relative overflow-hidden" style={{ background: k.bg }}>
                <div className="absolute right-3 top-3 opacity-20"><k.icon size={44} /></div>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{color:"rgba(255,255,255,.8)"}}>{k.label}</p>
                <p className="text-[32px] font-bold mt-1">{k.value}</p>
                <p className="text-[11px]" style={{color:"rgba(255,255,255,.7)"}}>{k.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Appointments by status */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[13.5px] font-semibold text-[#111827] mb-3">&#x25D4; Appointments by Status</p>
              {["Scheduled","Confirmed","In Progress","Completed","Cancelled"].map((s) => {
                const n = appointments.rows.filter(a=>a.status===s).length;
                return n > 0 ? (
                  <div key={s} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{background:statusColor[s]}} /><span className="text-[12px] text-slate-600">{s}</span></div>
                    <span className="text-[13px] font-bold" style={{color:statusColor[s]}}>{n}</span>
                  </div>
                ) : null;
              })}
            </div>

            {/* Upcoming appointments */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[13.5px] font-semibold text-[#111827] mb-3">&#x1F4C5; Upcoming Appointments</p>
              <div className="space-y-2">
                {appointments.rows.filter(a=>a.status!=="Cancelled"&&a.status!=="Completed").map((a) => (
                  <div key={a.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{background:HC_BLUE}}>{a.patient.charAt(0)}</div>
                    <div className="flex-1 min-w-0"><p className="text-[12px] font-medium text-[#111827] truncate">{a.patient}</p><p className="text-[10.5px] text-slate-400">{a.doctor} &middot; {a.type}</p></div>
                    <StatusPill s={a.status} />
                  </div>
                ))}
                {appointments.rows.filter(a=>a.status!=="Cancelled"&&a.status!=="Completed").length === 0 && <p className="text-[12px] text-slate-400 py-4 text-center">No upcoming appointments</p>}
              </div>
            </div>

            {/* Recent visits */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[13.5px] font-semibold text-[#111827] mb-3">&#x1F3E5; Recent Visits</p>
              <div className="space-y-2">
                {visits.rows.slice(0,4).map((v) => (
                  <div key={v.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50">
                    <Activity size={14} style={{color:HC_TEAL}} className="shrink-0" />
                    <div className="flex-1 min-w-0"><p className="text-[12px] font-medium text-[#111827] truncate">{v.patient}</p><p className="text-[10.5px] text-slate-400 truncate">{v.diagnosis||"Pending"}</p></div>
                    <StatusPill s={v.status} />
                  </div>
                ))}
                {visits.rows.length === 0 && <p className="text-[12px] text-slate-400 py-4 text-center">No visits yet</p>}
              </div>
            </div>
          </div>

          {/* ANALYTICS ROW: Appointment status PieChart + Doctor workload BarChart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Appointment Status Distribution</h3>
              {(() => {
                const apptData = ["Scheduled","Confirmed","In Progress","Completed","Cancelled"].map((s,i)=>({
                  name:s, value:appointments.rows.filter(a=>a.status===s).length,
                  fill:["#F59E0B","#2563EB","#7C3AED","#16A34A","#EF4444"][i],
                })).filter(d=>d.value>0);
                return apptData.length===0?<p className="text-slate-400 text-center py-6">No appointments</p>:(
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={150}>
                      <RPieChart><Pie data={apptData} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={32}>
                        {apptData.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Pie><Tooltip formatter={(v,n)=>[v+" appointments",n]}/></RPieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-1.5">
                      {apptData.map(d=>(
                        <div key={d.name} className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[12px]"><span className="w-2.5 h-2.5 rounded-full" style={{background:d.fill}}/>{d.name}</span>
                          <span className="text-[13px] font-bold" style={{color:d.fill}}>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <h3 className="text-[13.5px] font-semibold text-[#111827] mb-3">Appointment Load by Doctor</h3>
              {(() => {
                const doctorLoad = doctors.rows.map((d,i)=>({
                  name: d.fullName?.split(" ").pop()||d.lastName||"Dr.",
                  value: appointments.rows.filter(a=>a.doctorId===d.id).length,
                  fill: ["#1B4DE4","#059669","#D97706","#7C3AED","#EF4444"][i%5],
                })).filter(d=>d.value>0).sort((a,b)=>b.value-a.value).slice(0,6);
                return doctorLoad.length===0?<p className="text-slate-400 text-center py-6">No appointment data</p>:(
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={doctorLoad} margin={{left:0,right:10,top:0,bottom:0}}>
                      <CartesianGrid vertical={false} stroke="#EEF1F4"/>
                      <XAxis dataKey="name" tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <YAxis tick={{fontSize:10}} axisLine={false} tickLine={false}/>
                      <Tooltip formatter={(v)=>[v+" appointments","Count"]}/>
                      <Bar dataKey="value" radius={[4,4,0,0]} maxBarSize={36}>
                        {doctorLoad.map((d,i)=><Cell key={i} fill={d.fill}/>)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ── PATIENTS ──────────────────────────────────────────────────── */}
      {tab === "patients" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">{patients.rows.length} registered patients</p>
            <button onClick={() => downloadCSV("patients", patients.rows, [{key:"mrn",label:"MRN"},{key:"fullName",label:"Name"},{key:"gender",label:"Gender"},{key:"bloodType",label:"Blood Type"},{key:"phone",label:"Phone"},{key:"status",label:"Status"},{key:"allergies",label:"Allergies"}])} className="flex items-center gap-1 text-[12px] font-medium text-slate-500 border border-slate-200 px-3 py-2.5 rounded-xl hover:border-blue-400 hover:text-blue-600 mr-1"><Download size={13}/>Export</button><button onClick={() => { setModalType("patient"); setPForm(blankPatient); }} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:HC_BLUE}}><UserPlus size={13}/>New Patient</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50">
                {["MRN","Patient","Age / Gender","Blood","Phone","Status","Allergies","Actions"].map((h) => <th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}
              </tr></thead>
              <tbody>
                {patients.rows.map((p) => (
                  <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-[11px] font-medium" style={{color:HC_BLUE}}>{p.mrn}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{background:HC_BLUE}}>{(p.firstName||"?").charAt(0)}{(p.lastName||"").charAt(0)}</div>
                        <div><p className="font-medium text-[#111827]">{p.fullName}</p><p className="text-[10.5px] text-slate-400">{p.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.age ? p.age + " yrs" : "—"} / {p.gender}</td>
                    <td className="px-4 py-3 font-semibold" style={{color:HC_BLUE}}>{p.bloodType}</td>
                    <td className="px-4 py-3 text-slate-500">{p.phone}</td>
                    <td className="px-4 py-3"><StatusPill s={p.status}/></td>
                    <td className="px-4 py-3 text-slate-500 text-[11.5px] max-w-[120px] truncate">{p.allergies}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => { setReviewPatient(p); setTab("doctorreview"); }} title="Doctor Review" className="p-1 rounded text-slate-300 hover:text-[#1B4DE4]"><ClipboardCheck size={13}/></button>
                        <button onClick={() => setSelected(p)} title="View" className="p-1 rounded text-slate-300 hover:text-[#0F9D8E]"><Eye size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DOCTORS ───────────────────────────────────────────────────── */}
      {tab === "doctors" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">{doctors.rows.length} practitioners</p>
            <button onClick={() => { setModalType("doctor"); setDForm(blankDoctor); }} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:HC_BLUE}}><Plus size={13}/>New Doctor</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {doctors.rows.map((d) => (
              <div key={d.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0" style={{background:HC_BLUE}}>{d.firstName.charAt(0)}{d.lastName.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#111827]">{d.fullName}</p>
                    <p className="text-[11.5px] text-slate-400">{d.id} &middot; {d.specialty}</p>
                    <div className="flex gap-1 mt-1">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#1B4DE4]">{d.specialty}</span>
                      <StatusPill s={d.status} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                  <div><p className="text-[10.5px] text-slate-400">Fee</p><p className="text-[13px] font-semibold text-[#111827]">SAR {d.fee}</p></div>
                  <div><p className="text-[10.5px] text-slate-400">Experience</p><p className="text-[13px] font-semibold text-[#111827]">{d.experience} yrs</p></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setSelected(d)} className="flex-1 flex items-center justify-center gap-1 text-[11.5px] font-medium py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#1B4DE4] hover:text-[#1B4DE4] transition-colors"><Eye size={12}/>View</button>
                  <button className="flex-1 flex items-center justify-center gap-1 text-[11.5px] font-medium py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:border-[#0F9D8E] hover:text-[#0F9D8E] transition-colors"><Edit2 size={12}/>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── APPOINTMENTS ──────────────────────────────────────────────── */}
      {tab === "appointments" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">{appointments.rows.length} appointments</p>
            <button onClick={() => { setModalType("appointment"); setAForm(blankAppt); }} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:HC_BLUE}}><Plus size={13}/>Book Appointment</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50">{["#","Patient","Doctor","Type","Date / Time","Fee","Status","Action"].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
              <tbody>
                {appointments.rows.map((a, i) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400">{i+1}</td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{a.patient}</td>
                    <td className="px-4 py-3 text-slate-600">{a.doctor}</td>
                    <td className="px-4 py-3 text-slate-500">{a.type}</td>
                    <td className="px-4 py-3 font-mono text-[11.5px] text-slate-500">{a.start?.replace("T"," ")}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#111827]">SAR {a.fee}</td>
                    <td className="px-4 py-3"><StatusPill s={a.status}/></td>
                    <td className="px-4 py-3">
                      {(a.status==="Scheduled"||a.status==="Confirmed") && (
                        <button onClick={() => openVisit(a)} className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg" style={{background:HC_TEAL}}>Open Visit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── VISITS ────────────────────────────────────────────────────── */}
      {tab === "visits" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">{visits.rows.length} visits total</p>
            <button onClick={() => { setModalType("visit"); setVForm(blankVisit); }} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:HC_BLUE}}><Plus size={13}/>Open Visit</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead><tr className="border-b border-slate-100 bg-slate-50">{["Visit ID","Patient","Doctor","Date","Diagnosis","Status","Action"].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
              <tbody>
                {visits.rows.map((v) => (
                  <tr key={v.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-mono text-[11px] font-medium" style={{color:HC_BLUE}}>{v.id}</td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{v.patient}</td>
                    <td className="px-4 py-3 text-slate-600">{v.doctor}</td>
                    <td className="px-4 py-3 font-mono text-[11.5px] text-slate-400">{v.date?.slice(0,16)?.replace("T"," ")}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{v.diagnosis||"Pending"}</td>
                    <td className="px-4 py-3"><StatusPill s={v.status}/></td>
                    <td className="px-4 py-3">
                      {v.status==="Open" && (
                        <button onClick={() => { const diag=prompt("Diagnosis:"); if(diag) closeVisit(v,diag,v.notes); }} className="text-[11px] font-semibold text-white px-2.5 py-1 rounded-lg bg-slate-600">Close</button>
                      )}
                      <button onClick={() => { const pat=patients.rows.find(p=>p.id===v.patientId); setReviewPatient(pat); setTab("doctorreview"); }} className="ml-1 text-[11px] font-medium text-[#1B4DE4] hover:underline">Review</button>
                    </td>
                  </tr>
                ))}
                {visits.rows.length===0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No visits yet. Open a visit from the Appointments tab.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── DOCTOR REVIEW ─────────────────────────────────────────────── */}
      {tab === "doctorreview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div><h3 className="text-[15px] font-semibold text-[#111827]">Doctor Review</h3><p className="text-[12px] text-slate-400">Verify analyses, review the patient file, and approve what is needed.</p></div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-slate-500">Reviewing doctor:</span>
              <select className={inputClass + " text-[12.5px]"} value={reviewDoc?.id||""} onChange={e=>setReviewDoc(doctors.rows.find(d=>d.id===e.target.value)||null)}>
                {doctors.rows.map(d=><option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
          </div>

          {/* Patient card */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-[16px] font-bold text-white" style={{background:HC_BLUE}}>{reviewPatient?.firstName?.charAt(0)||"?"}{reviewPatient?.lastName?.charAt(0)||""}</div>
                <div>
                  <p className="text-[17px] font-bold text-[#111827]">{reviewPatient?.fullName||"No patient selected"}</p>
                  <p className="text-[12px] font-medium" style={{color:HC_BLUE}}>{reviewPatient?.mrn}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {reviewPatient?.gender && <span className="text-[11.5px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{reviewPatient.gender}</span>}
                    {reviewPatient?.age && <span className="text-[11.5px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{reviewPatient.age} yrs</span>}
                    {reviewPatient?.bloodType && <span className="text-[11.5px] px-2 py-0.5 rounded-full bg-blue-50 text-[#1B4DE4] font-semibold">{reviewPatient.bloodType}</span>}
                    {reviewPatient?.status && <StatusPill s={reviewPatient.status} />}
                  </div>
                </div>
              </div>
              <select className={inputClass + " text-[12.5px]"} value={reviewPatient?.id||""} onChange={e=>setReviewPatient(patients.rows.find(p=>p.id===e.target.value)||null)}>
                {patients.rows.map(p=><option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div><p className="text-[10.5px] uppercase tracking-wide text-slate-400 mb-1">&#9888; Allergies</p><p className="text-[12.5px] text-[#111827]">{reviewPatient?.allergies||"None"}</p></div>
              <div><p className="text-[10.5px] uppercase tracking-wide text-slate-400 mb-1">&#x2693; Chronic Diseases</p><p className="text-[12.5px] text-[#111827]">{reviewPatient?.chronicDiseases||"None"}</p></div>
            </div>
          </div>

          {/* Lab results for this patient */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <p className="text-[13.5px] font-semibold text-[#111827] mb-3">&#x1F9EA; Analyses / Lab Orders</p>
            {labOrders.rows.filter(l=>l.patientId===reviewPatient?.id).length === 0
              ? <p className="text-[12.5px] text-slate-400">No analyses for this patient yet.</p>
              : labOrders.rows.filter(l=>l.patientId===reviewPatient?.id).map((lo) => (
                  <div key={lo.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 mb-2">
                    <FlaskConical size={14} style={{color:"#7C3AED"}} className="shrink-0"/>
                    <div className="flex-1"><p className="text-[12px] font-medium text-[#111827]">{lo.tests?.join(", ")}</p><p className="text-[10.5px] text-slate-400">{lo.date} &middot; {lo.doctor}</p></div>
                    <StatusPill s={lo.status}/>
                  </div>
                ))
            }
          </div>

          {/* Action tabs */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <div className="flex gap-1 mb-4 border-b border-slate-100 pb-3">
              {[["prescribe","&#x1F489; Prescribe medications"],["laborder","&#x1F9EA; Order analysis"],["referral","&#x2708; Referral"]].map(([id,label]) => (
                <button key={id} onClick={()=>setReviewTab(id)} className={"px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors " + (reviewTab===id?"text-white":"text-slate-500 hover:bg-slate-50")} style={{background:reviewTab===id?HC_BLUE:"transparent"}} dangerouslySetInnerHTML={{__html:label}}/>
              ))}
            </div>

            {reviewTab === "prescribe" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <FormField label="Doctor"><select className={inputClass} value={reviewDoc?.id||""} onChange={e=>setReviewDoc(doctors.rows.find(d=>d.id===e.target.value)||null)}>{doctors.rows.map(d=><option key={d.id} value={d.id}>{d.fullName}</option>)}</select></FormField>
                  <FormField label="Drug Name"><input className={inputClass} placeholder="e.g. Paracetamol 500mg" defaultValue="" id="rx-drug"/></FormField>
                  <FormField label="Dosage"><input className={inputClass} placeholder="500mg" id="rx-dose"/></FormField>
                  <FormField label="Frequency"><input className={inputClass} defaultValue="2x/day" id="rx-freq"/></FormField>
                  <FormField label="Days"><input type="number" className={inputClass} defaultValue="7" id="rx-days"/></FormField>
                  <FormField label="Instructions"><input className={inputClass} placeholder="After meals" id="rx-instructions"/></FormField>
                </div>
                <button onClick={() => {
                  const drug = document.getElementById("rx-drug")?.value;
                  if (!drug || !reviewPatient) { notify("Enter drug name and select a patient","error"); return; }
                  const row = { id:docId("RX"), patientId:reviewPatient.id, patient:reviewPatient.fullName, doctorId:reviewDoc?.id||"", doctor:reviewDoc?.fullName||"", date:TODAY.toISOString().slice(0,10), status:"Active", notes:"",
                    drugs:[{ name:drug, dosage:document.getElementById("rx-dose")?.value||"", frequency:document.getElementById("rx-freq")?.value||"2x/day", days:Number(document.getElementById("rx-days")?.value)||7, qty:1, instructions:document.getElementById("rx-instructions")?.value||"" }]
                  };
                  prescriptions.setRows(p=>[row,...p]);
                  notify("Prescription issued for " + reviewPatient.fullName);
                }} className="text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:HC_BLUE}}>Issue Prescription</button>
              </div>
            )}

            {reviewTab === "laborder" && (
              <div className="space-y-3">
                <p className="text-[12.5px] text-slate-500">Select tests to order for <strong>{reviewPatient?.fullName}</strong></p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 max-h-48 overflow-y-auto">
                  {HC_LAB_TESTS.map((test) => (
                    <label key={test} className="flex items-center gap-2 text-[12.5px] text-slate-700 cursor-pointer py-0.5">
                      <input type="checkbox" checked={labSelected.includes(test)} onChange={e=>setLabSelected(prev=>e.target.checked?[...prev,test]:prev.filter(t=>t!==test))} className="rounded" style={{accentColor:HC_BLUE}}/>
                      {test}
                      <span className="text-[10px] text-slate-400 ml-auto">Blood</span>
                    </label>
                  ))}
                </div>
                {labSelected.length > 0 && <p className="text-[12px] text-[#1B4DE4] font-medium">{labSelected.length} test(s) selected</p>}
                <button onClick={orderLabTests} disabled={labSelected.length===0||!reviewPatient} className="text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl disabled:opacity-40" style={{background:HC_BLUE}}>Order Analysis</button>
              </div>
            )}

            {reviewTab === "referral" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Refer To (Specialty)"><input className={inputClass} placeholder="e.g. Cardiology, Orthopedics"/></FormField>
                  <FormField label="Urgency"><select className={inputClass}><option>Routine</option><option>Urgent</option><option>Emergency</option></select></FormField>
                  <FormField label="Reason" cls="col-span-2"><textarea className={inputClass + " min-h-[70px] resize-none"} placeholder="Reason for referral..."/></FormField>
                </div>
                <button onClick={()=>notify("Referral created for " + reviewPatient?.fullName)} className="text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:HC_BLUE}}>Create Referral</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MEDICAL REPORTS ───────────────────────────────────────────── */}
      {tab === "reports" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">{reports.rows.length} medical reports</p>
            <button onClick={() => { setModalType("report"); setRepForm(blankReport); }} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:HC_BLUE}}><Plus size={13}/>New Report</button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <table className="w-full text-[12.5px]"><thead><tr className="border-b border-slate-100 bg-slate-50">{["Report ID","Patient","Doctor","Title","Date","Status",""].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
              <tbody>{reports.rows.length===0?<tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No reports yet.</td></tr>:reports.rows.map((r)=>(
                <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-mono text-[11px] font-medium" style={{color:HC_BLUE}}>{r.id}</td>
                  <td className="px-4 py-3 font-medium text-[#111827]">{r.patient}</td>
                  <td className="px-4 py-3 text-slate-600">{r.doctor}</td>
                  <td className="px-4 py-3 font-medium text-[#111827]">{r.title}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{r.date}</td>
                  <td className="px-4 py-3"><StatusPill s={r.status}/></td>
                  <td className="px-4 py-3"><button onClick={()=>setSelected(r)} className="text-[11px] text-[#1B4DE4] hover:underline font-medium">View</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PRESCRIPTIONS ─────────────────────────────────────────────── */}
      {tab === "prescriptions" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-500">{prescriptions.rows.length} prescriptions issued</p>
            <div className="flex gap-2">
              <button onClick={()=>downloadCSV("prescriptions",prescriptions.rows.map(rx=>({ID:rx.id,Patient:rx.patient,Doctor:rx.doctor,Date:rx.date,Status:rx.status,Notes:rx.notes||""})),[{key:"ID",label:"ID"},{key:"Patient",label:"Patient"},{key:"Doctor",label:"Doctor"},{key:"Date",label:"Date"},{key:"Status",label:"Status"},{key:"Notes",label:"Notes"}])}
                className="flex items-center gap-1.5 text-[12px] font-semibold text-[#16A34A] border border-[#16A34A]/25 bg-[#F0FDF4] px-3 py-2 rounded-lg">
                <Download size={12}/> CSV
              </button>
              <button onClick={() => { setModalType("prescription"); setRxForm(blankRx); }} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-white px-4 py-2.5 rounded-xl" style={{background:HC_BLUE}}><Plus size={13}/>New Prescription</button>
            </div>
          </div>
          <div className="space-y-3">
            {prescriptions.rows.map((rx) => (
              <div key={rx.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2"><span className="font-mono text-[11px] font-medium" style={{color:HC_BLUE}}>{rx.id}</span><StatusPill s={rx.status}/></div>
                    <p className="text-[14px] font-semibold text-[#111827] mt-0.5">{rx.patient}</p>
                    <p className="text-[12px] text-slate-400">{rx.doctor} &middot; {rx.date}</p>
                  </div>
                  <Pill size={18} style={{color:HC_BLUE}} className="shrink-0 mt-1"/>
                </div>
                <div className="space-y-1.5">
                  {rx.drugs?.map((d,i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                      <div><p className="text-[12.5px] font-medium text-[#111827]">{d.name}</p><p className="text-[11px] text-slate-400">{d.dosage} &middot; {d.frequency} &middot; {d.days} days &middot; Qty: {d.qty}</p></div>
                      <p className="text-[11px] text-slate-400 italic">{d.instructions}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {prescriptions.rows.length===0&&<div className="bg-white rounded-xl border border-slate-200/80 p-10 text-center"><Pill size={28} className="text-slate-200 mx-auto mb-2"/><p className="text-slate-400">No prescriptions yet.</p></div>}
          </div>
        </div>
      )}

      {/* ── LABORATORY ────────────────────────────────────────────────── */}
      {tab === "laboratory" && (
        <div className="space-y-4">
          <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200">
            {["Categories","Tests Catalog","Orders"].map((t,i)=>(
              <button key={t} onClick={()=>setSubTab(["cats","catalog","orders"][i])} className={"flex-1 py-2 rounded-lg text-[12.5px] font-medium transition-colors " + (subTab===["cats","catalog","orders"][i]?"text-white":"text-slate-500")} style={{background:subTab===["cats","catalog","orders"][i]?HC_BLUE:"transparent"}}>{t}</button>
            ))}
          </div>
          {(subTab==="cats"||!subTab||subTab==="list") && (
            <div>
              <div className="flex items-center justify-between mb-3"><p className="text-[13.5px] font-semibold text-[#111827]">Laboratory Categories</p><button onClick={()=>notify("Category form — add via settings")} className="flex items-center gap-1 text-[12.5px] font-medium text-white px-3 py-2 rounded-xl" style={{background:HC_BLUE}}><Plus size={12}/>New Category</button></div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {HC_LAB_CATEGORIES.map((cat) => (
                  <div key={cat.id} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 hover:border-[#1B4DE4] transition-colors cursor-pointer">
                    <p className="text-[13.5px] font-semibold text-[#111827]">{cat.name}</p>
                    <p className="text-[12px] text-slate-400 mt-0.5">{cat.nameAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {subTab==="catalog" && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
              <p className="text-[13.5px] font-semibold text-[#111827] mb-3">Tests Catalog ({HC_LAB_TESTS.length} tests)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {HC_LAB_TESTS.map((t) => (
                  <div key={t} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50">
                    <span className="text-[12.5px] text-[#111827]">{t}</span>
                    <span className="text-[10px] text-slate-400">Blood</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {subTab==="orders" && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-[13.5px] font-semibold text-[#111827]">Lab Orders</p>
              </div>
              <table className="w-full text-[12.5px]"><thead><tr className="border-b border-slate-100 bg-slate-50">{["Order #","Patient","Tests","Date","Status"].map(h=><th key={h} className="px-4 py-3 text-left text-[10.5px] font-medium uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead>
                <tbody>{labOrders.rows.length===0?<tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No lab orders. Order from Doctor Review tab.</td></tr>:labOrders.rows.map((lo)=>(
                  <tr key={lo.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-mono text-[11px] font-medium" style={{color:"#7C3AED"}}>{lo.id}</td>
                    <td className="px-4 py-3 font-medium text-[#111827]">{lo.patient}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{lo.tests?.join(", ")}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{lo.date}</td>
                    <td className="px-4 py-3"><StatusPill s={lo.status}/></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── PHARMACY ──────────────────────────────────────────────────── */}
      {tab === "pharmacy" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Active Prescriptions</p><p className="text-[22px] font-bold" style={{color:HC_BLUE}}>{prescriptions.rows.filter(p=>p.status==="Active").length}</p></div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Dispensed Today</p><p className="text-[22px] font-bold text-[#16A34A]">0</p></div>
            <div className="bg-white rounded-xl border border-slate-200/80 p-4"><p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">Medications</p><p className="text-[22px] font-bold text-[#7C3AED]">{HC_MEDICATIONS.length}</p></div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4">
            <p className="text-[13.5px] font-semibold text-[#111827] mb-3">Pending Dispensing</p>
            <div className="space-y-2">
              {prescriptions.rows.filter(p=>p.status==="Active").map((rx) => (
                <div key={rx.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-[#1B4DE4] transition-colors">
                  <div>
                    <p className="text-[13px] font-semibold text-[#111827]">{rx.patient}</p>
                    <p className="text-[11.5px] text-slate-400">{rx.drugs?.map(d=>d.name).join(", ")} &middot; {rx.date}</p>
                  </div>
                  <button onClick={()=>{prescriptions.setRows(p=>p.map(r=>r.id===rx.id?{...r,status:"Dispensed"}:r));notify("Dispensed to "+rx.patient);}} className="text-[12px] font-semibold text-white px-3 py-1.5 rounded-lg" style={{background:HC_TEAL}}>Dispense</button>
                </div>
              ))}
              {prescriptions.rows.filter(p=>p.status==="Active").length===0 && <p className="text-[12.5px] text-slate-400 py-6 text-center">No prescriptions pending dispensing.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── VITALS / TRIAGE ──────────────────────────────────────────── */}
      {tab === "vitals" && (
        <VitalsTriageView patients={patients} currentUser={currentUser} HC_BLUE={HC_BLUE} />
      )}

      {/* ── RADIOLOGY ─────────────────────────────────────────────────── */}
      {tab === "radiology" && (
        <RadiologyView patients={patients} doctors={doctors} currentUser={currentUser} HC_BLUE={HC_BLUE} HC_TEAL={HC_TEAL} />
      )}

      {/* ── HC BILLING ────────────────────────────────────────────────── */}
      {tab === "hcbilling" && (
        <HCBillingView patients={patients} appointments={appointments} visits={visits} prescriptions={prescriptions} labOrders={labOrders} currentUser={currentUser} HC_BLUE={HC_BLUE} />
      )}

      {/* ── MODALS ────────────────────────────────────────────────────── */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.45)"}} onClick={()=>setModalType(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>

            {/* NEW PATIENT */}
            {modalType === "patient" && (<>
              <div className="flex items-center justify-between mb-5"><h2 className="text-[17px] font-semibold text-[#111827]">New Patient</h2><button onClick={()=>setModalType(null)} className="text-slate-400"><X size={18}/></button></div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="First name *"><input className={inputClass} value={pForm.firstName} onChange={e=>setPForm({...pForm,firstName:e.target.value})} placeholder="First name"/></FormField>
                <FormField label="Last name *"><input className={inputClass} value={pForm.lastName} onChange={e=>setPForm({...pForm,lastName:e.target.value})} placeholder="Last name"/></FormField>
                <FormField label="National ID"><input className={inputClass} value={pForm.nationalId} onChange={e=>setPForm({...pForm,nationalId:e.target.value})}/></FormField>
                <FormField label="Date of birth"><input type="date" className={inputClass} value={pForm.dob} onChange={e=>setPForm({...pForm,dob:e.target.value})}/></FormField>
                <FormField label="Gender"><select className={inputClass} value={pForm.gender} onChange={e=>setPForm({...pForm,gender:e.target.value})}><option>Male</option><option>Female</option></select></FormField>
                <FormField label="Blood Type"><select className={inputClass} value={pForm.bloodType} onChange={e=>setPForm({...pForm,bloodType:e.target.value})}>{BLOOD_TYPES.map(b=><option key={b}>{b}</option>)}</select></FormField>
                <FormField label="Marital Status"><select className={inputClass} value={pForm.marital} onChange={e=>setPForm({...pForm,marital:e.target.value})}><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option></select></FormField>
                <FormField label="Status"><select className={inputClass} value={pForm.status} onChange={e=>setPForm({...pForm,status:e.target.value})}><option>Stable</option><option>Urgent</option><option>Critical</option></select></FormField>
                <FormField label="Phone"><input className={inputClass} value={pForm.phone} onChange={e=>setPForm({...pForm,phone:e.target.value})} placeholder="05XXXXXXXX"/></FormField>
                <FormField label="Email"><input className={inputClass} value={pForm.email} onChange={e=>setPForm({...pForm,email:e.target.value})}/></FormField>
                <FormField label="Nationality"><input className={inputClass} value={pForm.nationality} onChange={e=>setPForm({...pForm,nationality:e.target.value})}/></FormField>
                <FormField label="Occupation"><input className={inputClass} value={pForm.occupation} onChange={e=>setPForm({...pForm,occupation:e.target.value})}/></FormField>
                <FormField label="Allergies" cls="col-span-2"><input className={inputClass} value={pForm.allergies} onChange={e=>setPForm({...pForm,allergies:e.target.value})} placeholder="e.g. Penicillin, None"/></FormField>
                <FormField label="Chronic Diseases" cls="col-span-2"><input className={inputClass} value={pForm.chronicDiseases} onChange={e=>setPForm({...pForm,chronicDiseases:e.target.value})} placeholder="e.g. Diabetes, Hypertension, None"/></FormField>
                <FormField label="Notes" cls="col-span-2"><textarea className={inputClass + " min-h-[60px] resize-none"} value={pForm.notes} onChange={e=>setPForm({...pForm,notes:e.target.value})}/></FormField>
              </div>
              <div className="flex gap-2 mt-4 justify-end"><button onClick={()=>setModalType(null)} className="px-4 py-2.5 rounded-xl text-[13px] text-slate-500 border border-slate-200">Cancel</button><button onClick={savePatient} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{background:HC_BLUE}}>Create patient</button></div>
            </>)}

            {/* NEW DOCTOR */}
            {modalType === "doctor" && (<>
              <div className="flex items-center justify-between mb-5"><h2 className="text-[17px] font-semibold text-[#111827]">New Doctor</h2><button onClick={()=>setModalType(null)} className="text-slate-400"><X size={18}/></button></div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="First name *"><input className={inputClass} value={dForm.firstName} onChange={e=>setDForm({...dForm,firstName:e.target.value})}/></FormField>
                <FormField label="Last name *"><input className={inputClass} value={dForm.lastName} onChange={e=>setDForm({...dForm,lastName:e.target.value})}/></FormField>
                <FormField label="Gender"><select className={inputClass} value={dForm.gender} onChange={e=>setDForm({...dForm,gender:e.target.value})}><option>Male</option><option>Female</option></select></FormField>
                <FormField label="Department"><select className={inputClass} value={dForm.dept} onChange={e=>setDForm({...dForm,dept:e.target.value,specialty:e.target.value})}>
                  {["General Medicine","Cardiology","Neurology","Pediatrics","Orthopedics","Dermatology","Ophthalmology","ENT","Gynecology","Radiology","Emergency","Surgery","Psychiatry","Dental","Physiotherapy","Laboratory","Pharmacy"].map(d=><option key={d}>{d}</option>)}
                </select></FormField>
                <FormField label="License number"><input className={inputClass} value={dForm.license} onChange={e=>setDForm({...dForm,license:e.target.value})}/></FormField>
                <FormField label="Qualifications"><input className={inputClass} value={dForm.qualifications} onChange={e=>setDForm({...dForm,qualifications:e.target.value})} placeholder="MBBS, MD..."/></FormField>
                <FormField label="Consultation fee"><input type="number" className={inputClass} value={dForm.fee} onChange={e=>setDForm({...dForm,fee:e.target.value})}/></FormField>
                <FormField label="Years of experience"><input type="number" className={inputClass} value={dForm.experience} onChange={e=>setDForm({...dForm,experience:e.target.value})}/></FormField>
                <FormField label="Phone"><input className={inputClass} value={dForm.phone} onChange={e=>setDForm({...dForm,phone:e.target.value})}/></FormField>
                <FormField label="Email"><input className={inputClass} value={dForm.email} onChange={e=>setDForm({...dForm,email:e.target.value})}/></FormField>
                <FormField label="Biography" cls="col-span-2"><textarea className={inputClass + " min-h-[70px] resize-none"} value={dForm.bio} onChange={e=>setDForm({...dForm,bio:e.target.value})}/></FormField>
              </div>
              <div className="flex gap-2 mt-4 justify-end"><button onClick={()=>setModalType(null)} className="px-4 py-2.5 rounded-xl text-[13px] text-slate-500 border border-slate-200">Cancel</button><button onClick={saveDoctor} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{background:HC_BLUE}}>Create doctor</button></div>
            </>)}

            {/* BOOK APPOINTMENT */}
            {modalType === "appointment" && (<>
              <div className="flex items-center justify-between mb-5"><h2 className="text-[17px] font-semibold text-[#111827]">Book Appointment</h2><button onClick={()=>setModalType(null)} className="text-slate-400"><X size={18}/></button></div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Patient *"><select className={inputClass} value={aForm.patientId} onChange={e=>setAForm({...aForm,patientId:e.target.value})}><option value="">Select a patient...</option>{patients.rows.map(p=><option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>)}</select></FormField>
                <FormField label="Doctor *"><select className={inputClass} value={aForm.doctorId} onChange={e=>{const d=doctors.rows.find(d=>d.id===e.target.value);setAForm({...aForm,doctorId:e.target.value,fee:d?.fee||0});}}><option value="">Select a doctor...</option>{doctors.rows.map(d=><option key={d.id} value={d.id}>{d.fullName}</option>)}</select></FormField>
                <FormField label="Type"><select className={inputClass} value={aForm.type} onChange={e=>setAForm({...aForm,type:e.target.value})}>{APPT_TYPES.map(t=><option key={t}>{t}</option>)}</select></FormField>
                <FormField label="Start *"><input type="datetime-local" className={inputClass} value={aForm.start} onChange={e=>setAForm({...aForm,start:e.target.value})}/></FormField>
                <FormField label="End"><input type="datetime-local" className={inputClass} value={aForm.end} onChange={e=>setAForm({...aForm,end:e.target.value})}/></FormField>
                <FormField label="Fee (SAR)"><input type="number" className={inputClass} value={aForm.fee} onChange={e=>setAForm({...aForm,fee:e.target.value})}/></FormField>
                <FormField label="Reason"><input className={inputClass} value={aForm.reason} onChange={e=>setAForm({...aForm,reason:e.target.value})} placeholder="Reason for visit"/></FormField>
                <FormField label="Notes" cls="col-span-2"><textarea className={inputClass + " min-h-[60px] resize-none"} value={aForm.notes} onChange={e=>setAForm({...aForm,notes:e.target.value})}/></FormField>
              </div>
              <div className="flex gap-2 mt-4 justify-end"><button onClick={()=>setModalType(null)} className="px-4 py-2.5 rounded-xl text-[13px] text-slate-500 border border-slate-200">Cancel</button><button onClick={saveAppointment} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{background:HC_BLUE}}>Book appointment</button></div>
            </>)}

            {/* NEW PRESCRIPTION */}
            {modalType === "prescription" && (<>
              <div className="flex items-center justify-between mb-5"><h2 className="text-[17px] font-semibold text-[#111827]">New Prescription</h2><button onClick={()=>setModalType(null)} className="text-slate-400"><X size={18}/></button></div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <FormField label="Patient *"><select className={inputClass} value={rxForm.patientId} onChange={e=>setRxForm({...rxForm,patientId:e.target.value})}><option value="">Select patient...</option>{patients.rows.map(p=><option key={p.id} value={p.id}>{p.fullName}</option>)}</select></FormField>
                <FormField label="Doctor *"><select className={inputClass} value={rxForm.doctorId} onChange={e=>setRxForm({...rxForm,doctorId:e.target.value})}><option value="">Select doctor...</option>{doctors.rows.map(d=><option key={d.id} value={d.id}>{d.fullName}</option>)}</select></FormField>
              </div>
              <p className="text-[12px] font-medium text-slate-600 mb-2">Drugs</p>
              {rxForm.drugs.map((drug,i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-3 mb-2">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <FormField label="Medication"><select className={inputClass + " text-[12px]"} value={drug.name} onChange={e=>{const d=[...rxForm.drugs];d[i]={...d[i],name:e.target.value};setRxForm({...rxForm,drugs:d});}}>{HC_MEDICATIONS.map(m=><option key={m}>{m}</option>)}</select></FormField>
                    <FormField label="Drug name *"><input className={inputClass} value={drug.name} onChange={e=>{const d=[...rxForm.drugs];d[i]={...d[i],name:e.target.value};setRxForm({...rxForm,drugs:d});}}/></FormField>
                    <FormField label="Dosage"><input className={inputClass} value={drug.dosage} placeholder="500mg" onChange={e=>{const d=[...rxForm.drugs];d[i]={...d[i],dosage:e.target.value};setRxForm({...rxForm,drugs:d});}}/></FormField>
                    <FormField label="Frequency"><input className={inputClass} value={drug.frequency} onChange={e=>{const d=[...rxForm.drugs];d[i]={...d[i],frequency:e.target.value};setRxForm({...rxForm,drugs:d});}}/></FormField>
                    <FormField label="Days"><input type="number" className={inputClass} value={drug.days} onChange={e=>{const d=[...rxForm.drugs];d[i]={...d[i],days:Number(e.target.value)};setRxForm({...rxForm,drugs:d});}}/></FormField>
                    <FormField label="Qty"><input type="number" className={inputClass} value={drug.qty} onChange={e=>{const d=[...rxForm.drugs];d[i]={...d[i],qty:Number(e.target.value)};setRxForm({...rxForm,drugs:d});}}/></FormField>
                    <FormField label="Instructions" cls="col-span-2"><input className={inputClass} value={drug.instructions} placeholder="After meals..." onChange={e=>{const d=[...rxForm.drugs];d[i]={...d[i],instructions:e.target.value};setRxForm({...rxForm,drugs:d});}}/></FormField>
                  </div>
                  {rxForm.drugs.length>1&&<button onClick={()=>setRxForm({...rxForm,drugs:rxForm.drugs.filter((_,j)=>j!==i)})} className="mt-1 text-[11px] text-[#EF4444] hover:underline">Remove drug</button>}
                </div>
              ))}
              <button onClick={()=>setRxForm({...rxForm,drugs:[...rxForm.drugs,{name:HC_MEDICATIONS[0],dosage:"",frequency:"2x/day",days:7,qty:1,instructions:""}]})} className="text-[12px] text-[#1B4DE4] hover:underline mb-3">+ Add drug</button>
              <FormField label="Notes"><textarea className={inputClass + " min-h-[60px] resize-none"} value={rxForm.notes} onChange={e=>setRxForm({...rxForm,notes:e.target.value})}/></FormField>
              <div className="flex gap-2 mt-4 justify-end"><button onClick={()=>setModalType(null)} className="px-4 py-2.5 rounded-xl text-[13px] text-slate-500 border border-slate-200">Cancel</button><button onClick={issuePrescription} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{background:HC_BLUE}}>Issue prescription</button></div>
            </>)}

            {/* NEW MEDICAL REPORT */}
            {modalType === "report" && (<>
              <div className="flex items-center justify-between mb-5"><h2 className="text-[17px] font-semibold text-[#111827]">New Medical Report</h2><button onClick={()=>setModalType(null)} className="text-slate-400"><X size={18}/></button></div>
              <div className="space-y-3">
                <FormField label="From a finished visit">
                  <select className={inputClass} value={repForm.visitId} onChange={e=>{const v=visits.rows.find(v=>v.id===e.target.value);setRepForm({...repForm,visitId:e.target.value,patientId:v?.patientId||"",doctorId:v?.doctorId||""});}}>
                    <option value="">Select visit...</option>{visits.rows.filter(v=>v.status==="Closed").map(v=><option key={v.id} value={v.id}>{v.id} &middot; {v.patient} &middot; {v.date?.slice(0,10)}</option>)}
                  </select>
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Patient *"><select className={inputClass} value={repForm.patientId} onChange={e=>setRepForm({...repForm,patientId:e.target.value})}><option value="">Select...</option>{patients.rows.map(p=><option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>)}</select></FormField>
                  <FormField label="Doctor *"><select className={inputClass} value={repForm.doctorId} onChange={e=>setRepForm({...repForm,doctorId:e.target.value})}><option value="">Select...</option>{doctors.rows.map(d=><option key={d.id} value={d.id}>{d.fullName}</option>)}</select></FormField>
                </div>
                <FormField label="Report title *"><input className={inputClass} value={repForm.title} onChange={e=>setRepForm({...repForm,title:e.target.value})} placeholder="e.g. Consultation summary"/></FormField>
                <FormField label="Situation / description"><textarea className={inputClass + " min-h-[100px] resize-none"} value={repForm.description} onChange={e=>setRepForm({...repForm,description:e.target.value})} placeholder="Describe the patient's condition, findings and recommendations..."/></FormField>
                <FormField label="Doctor signature">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-[12px] text-slate-400 mb-2">Draw signature here (or type initials)</p>
                    <input className={inputClass + " text-center italic text-[16px]"} value={repForm.signature} onChange={e=>setRepForm({...repForm,signature:e.target.value})} placeholder="Type initials or name"/>
                    {repForm.signature && <p className="mt-2 text-[11px] text-slate-400">Signature: <em>{repForm.signature}</em></p>}
                    <button onClick={()=>setRepForm({...repForm,signature:""})} className="mt-1 text-[11px] text-[#EF4444] hover:underline">Clear signature</button>
                  </div>
                </FormField>
              </div>
              <div className="flex gap-2 mt-4 justify-end"><button onClick={()=>setModalType(null)} className="px-4 py-2.5 rounded-xl text-[13px] text-slate-500 border border-slate-200">Cancel</button><button onClick={createReport} className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center gap-1.5" style={{background:HC_BLUE}}><CheckCircle2 size={14}/>Create report</button></div>
            </>)}

          </div>
        </div>
      )}

      {/* ── DETAIL VIEW MODAL ─────────────────────────────────────────── */}
      {selected && !modalType && (
        <div className="fixed inset-0 z-40 flex justify-end" onClick={()=>setSelected(null)}>
          <div className="absolute inset-0 bg-[#111827]/20 backdrop-blur-[2px]"/>
          <div className="relative w-full sm:w-[440px] bg-white h-full shadow-2xl overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="px-6 pt-6 pb-5 border-b border-slate-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-[16px] font-bold text-white" style={{background:HC_BLUE}}>{(selected.firstName||selected.title||"?").charAt(0)}{(selected.lastName||"").charAt(0)}</div>
                  <div><p className="text-[18px] font-bold text-[#111827]">{selected.fullName||selected.title||selected.patient}</p>{selected.mrn&&<p className="text-[12px] font-medium mt-0.5" style={{color:HC_BLUE}}>{selected.mrn}</p>}{selected.specialty&&<p className="text-[12px] text-slate-400">{selected.specialty}</p>}</div>
                </div>
                <button onClick={()=>setSelected(null)} className="text-slate-400"><X size={18}/></button>
              </div>
              {selected.status&&<StatusPill s={selected.status}/>}
            </div>
            <div className="px-6 py-4 space-y-3">
              {Object.entries(selected).filter(([k])=>!["id","fullName","mrn","status","firstName","lastName"].includes(k)).map(([k,v])=>v&&typeof v==="string"&&v.length<120?(
                <div key={k} className="flex items-start gap-3"><p className="text-[11px] text-slate-400 w-28 shrink-0 mt-0.5 capitalize">{k.replace(/([A-Z])/g," $1")}</p><p className="text-[12.5px] text-[#111827] font-medium">{v}</p></div>
              ):null)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SCHOOL MANAGEMENT MODULE
// Tabs: Overview · Students · Teachers · Classes · Attendance
//       Examinations · Fee Collection · Library · Transport
// ═══════════════════════════════════════════════════════════════════════════

const SCH_STUDENTS_SEED = [
  { id:"STU-001", admNo:"ADM-2024-001", name:"Amani Juma",       gender:"M", class:"Form 3A", dob:"2009-05-12", parent:"Juma Hassan",   phone:"0712-001-001", balance:150,  status:"Active",   photo:"" },
  { id:"STU-002", admNo:"ADM-2024-002", name:"Neema Mwangi",     gender:"F", class:"Form 1B", dob:"2011-02-20", parent:"Mwangi Peter",  phone:"0756-002-002", balance:0,    status:"Active",   photo:"" },
  { id:"STU-003", admNo:"ADM-2024-003", name:"Baraka Kimani",    gender:"M", class:"Form 4A", dob:"2007-09-15", parent:"Kimani Alice",  phone:"0722-003-003", balance:300,  status:"Active",   photo:"" },
  { id:"STU-004", admNo:"ADM-2024-004", name:"Zawadi Ochieng",   gender:"F", class:"Form 2A", dob:"2010-07-30", parent:"Ochieng Grace", phone:"0733-004-004", balance:0,    status:"Active",   photo:"" },
  { id:"STU-005", admNo:"ADM-2024-005", name:"Tumaini Luvuno",   gender:"M", class:"Form 3B", dob:"2008-12-01", parent:"Luvuno Mary",   phone:"0744-005-005", balance:450,  status:"Inactive", photo:"" },
];

const SCH_TEACHERS_SEED = [
  { id:"TCH-001", name:"Mr. Kamau Njoroge",  subject:"Mathematics",     qualification:"B.Ed Maths",    experience:8,  phone:"0712-100-001", status:"Active",  salary:850  },
  { id:"TCH-002", name:"Ms. Fatuma Ally",    subject:"English Language", qualification:"B.A English",   experience:5,  phone:"0756-100-002", status:"Active",  salary:750  },
  { id:"TCH-003", name:"Mr. John Owino",     subject:"Biology",          qualification:"B.Sc Biology",  experience:12, phone:"0722-100-003", status:"Active",  salary:950  },
  { id:"TCH-004", name:"Ms. Grace Mutua",    subject:"Chemistry",        qualification:"B.Sc Chemistry",experience:7,  phone:"0733-100-004", status:"Active",  salary:900  },
  { id:"TCH-005", name:"Mr. Hassan Salim",   subject:"Kiswahili",        qualification:"B.Ed Kiswahili",experience:10, phone:"0744-100-005", status:"Active",  salary:800  },
];

const SCH_CLASSES_SEED = [
  { id:"CLS-001", name:"Form 1A", stream:"A", level:"Form 1", students:38, teacher:"Ms. Fatuma Ally",    room:"Room 101", capacity:40 },
  { id:"CLS-002", name:"Form 1B", stream:"B", level:"Form 1", students:36, teacher:"Mr. Hassan Salim",   room:"Room 102", capacity:40 },
  { id:"CLS-003", name:"Form 2A", stream:"A", level:"Form 2", students:42, teacher:"Ms. Grace Mutua",    room:"Room 201", capacity:45 },
  { id:"CLS-004", name:"Form 3A", stream:"A", level:"Form 3", students:39, teacher:"Mr. Kamau Njoroge",  room:"Room 301", capacity:40 },
  { id:"CLS-005", name:"Form 3B", stream:"B", level:"Form 3", students:35, teacher:"Mr. John Owino",     room:"Room 302", capacity:40 },
  { id:"CLS-006", name:"Form 4A", stream:"A", level:"Form 4", students:30, teacher:"Mr. Kamau Njoroge",  room:"Room 401", capacity:40 },
];

const SCH_EXAMS_SEED = [
  { id:"EXM-001", name:"Mid-Term Exam 1",   term:"Term 1 2026", class:"Form 3A", subject:"Mathematics", date:"2026-03-15", maxMarks:100, avgScore:68, passRate:82, status:"Completed" },
  { id:"EXM-002", name:"End-Term Exam 1",   term:"Term 1 2026", class:"Form 3A", subject:"Biology",     date:"2026-04-20", maxMarks:100, avgScore:74, passRate:88, status:"Completed" },
  { id:"EXM-003", name:"Mid-Term Exam 2",   term:"Term 2 2026", class:"Form 4A", subject:"Chemistry",   date:"2026-07-10", maxMarks:100, avgScore:0,  passRate:0,  status:"Scheduled" },
];

const SCH_FEES_SEED = [
  { id:"FEE-001", studentId:"STU-001", student:"Amani Juma",    class:"Form 3A", term:"Term 2 2026", amount:450, paid:300, balance:150, dueDate:"2026-07-01", status:"Partial" },
  { id:"FEE-002", studentId:"STU-002", student:"Neema Mwangi",  class:"Form 1B", term:"Term 2 2026", amount:450, paid:450, balance:0,   dueDate:"2026-07-01", status:"Paid"    },
  { id:"FEE-003", studentId:"STU-003", student:"Baraka Kimani", class:"Form 4A", term:"Term 2 2026", amount:500, paid:200, balance:300, dueDate:"2026-07-01", status:"Partial" },
  { id:"FEE-004", studentId:"STU-004", student:"Zawadi Ochieng",class:"Form 2A", term:"Term 2 2026", amount:450, paid:450, balance:0,   dueDate:"2026-07-01", status:"Paid"    },
  { id:"FEE-005", studentId:"STU-005", student:"Tumaini Luvuno",class:"Form 3B", term:"Term 2 2026", amount:450, paid:0,   balance:450, dueDate:"2026-07-01", status:"Unpaid"  },
];

const SCH_BOOKS_SEED = [
  { id:"LIB-001", title:"Advanced Mathematics F4",   author:"K. Njoroge",     isbn:"978-9966-25-001-1", copies:12, available:8,  category:"Textbook",  shelf:"S-A1" },
  { id:"LIB-002", title:"Biology for Secondary",     author:"WHO Tanzania",   isbn:"978-9966-25-002-2", copies:20, available:15, category:"Textbook",  shelf:"S-B2" },
  { id:"LIB-003", title:"History of East Africa",    author:"A. Atieno",      isbn:"978-9966-25-003-3", copies:8,  available:8,  category:"Reference", shelf:"S-C1" },
  { id:"LIB-004", title:"Kiswahili Fasili Form 3",   author:"TAMISEMI",       isbn:"978-9966-25-004-4", copies:30, available:22, category:"Textbook",  shelf:"S-D3" },
  { id:"LIB-005", title:"Chemistry Practical Guide", author:"M. Wanjiku",     isbn:"978-9966-25-005-5", copies:10, available:3,  category:"Textbook",  shelf:"S-B1" },
];

const SCH_TRANSPORT_SEED = [
  { id:"BUS-001", route:"Route 1 — Kariakoo",   bus:"TZA 234 B", driver:"Ali Hassan",   students:28, departure:"6:30 AM", return:"5:00 PM", status:"Active" },
  { id:"BUS-002", route:"Route 2 — Kinondoni",  bus:"TZA 567 C", driver:"John Mwenda",  students:32, departure:"6:45 AM", return:"5:15 PM", status:"Active" },
  { id:"BUS-003", route:"Route 3 — Tabata",     bus:"TZA 890 D", driver:"Peter Salim",  students:25, departure:"6:15 AM", return:"4:45 PM", status:"Active" },
];

const SCHOOL_SUBJECTS = ["Mathematics","English Language","Kiswahili","Biology","Chemistry","Physics","History","Geography","Commerce","Computer Science","Fine Art","Agriculture","Physical Education"];
const SCHOOL_LEVELS   = ["Form 1","Form 2","Form 3","Form 4"];
const TERMS           = ["Term 1 2026","Term 2 2026","Term 3 2026"];

export default HealthcareClinicModule;
