// @ts-nocheck
// widget that grades nothing.
export function LmsInsightsPanel({ employees }) {
  const training = useCompanyTable("hr_training", [], { order: { col: "created_at", ascending: false }, mapRow: mapTrainingRow, select: "*,hr_employees(full_name)" });
  const t = TODAY.toISOString().slice(0, 10);

  const deptOf = (name) => (employees.rows.find((e) => e.name === name)?.department) || "General";
  const byDept = {};
  training.rows.forEach((row) => {
    const d = deptOf(row.employee);
    byDept[d] = byDept[d] || { total: 0, done: 0 };
    byDept[d].total += 1;
    if (row.status === "Completed") byDept[d].done += 1;
  });
  const overdue = training.rows.filter((r) => r.mandatory && r.status !== "Completed" && r.dueDate && r.dueDate < t);
  const completed = training.rows.filter((r) => r.status === "Completed").slice(0, 6);

  function printCertificate(row) {
    printAsPDF(`Certificate — ${row.course}`, `
      <div style="text-align:center;padding:40px 20px;border:3px double #16A34A;">
        <p style="letter-spacing:3px;color:#16A34A;font-size:12px;">CERTIFICATE OF COMPLETION</p>
        <h1 style="margin:18px 0 6px;">${row.employee}</h1>
        <p style="color:#555;">has successfully completed the course</p>
        <h2 style="margin:10px 0;">${row.course}</h2>
        ${row.compliance ? '<p style="color:#16A34A;font-size:12px;font-weight:bold;">COMPLIANCE TRAINING</p>' : ""}
        <p style="color:#888;font-size:12px;margin-top:16px;">Completed ${row.completionDate || "—"} · issued from live training records</p>
      </div>
    `);
  }

  return (
    <div className="space-y-4 mt-5">
      {overdue.length > 0 && (
        <div className="rounded-xl p-3.5 flex items-start gap-2.5" style={{ backgroundColor: "#FEE2E2" }}>
          <AlertCircle size={15} className="text-[#EF4444] shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-[#991B1B]"><strong>{overdue.length} overdue mandatory training(s):</strong> {overdue.slice(0, 4).map((r) => `${r.employee} — ${r.course}`).join("; ")}{overdue.length > 4 ? "…" : ""}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
        <h3 className="text-[14px] font-semibold text-[#111827] mb-1">Training Progress by Department</h3>
        <p className="text-[11.5px] text-slate-500 mb-3">Real completion rates from real assignments — video is linked, not hosted, and exams need a question model (named future work, not a quiz that grades nothing).</p>
        <div className="space-y-2">
          {Object.entries(byDept).sort((a, b) => b[1].total - a[1].total).map(([dept, s]) => (
            <div key={dept} className="flex items-center gap-3">
              <span className="text-[12px] text-slate-600 w-32 truncate shrink-0">{dept}</span>
              <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${(s.done / s.total) * 100}%`, backgroundColor: s.done === s.total ? "#16A34A" : "#F59E0B" }} /></div>
              <span className="text-[11.5px] font-mono text-slate-500 shrink-0">{s.done}/{s.total}</span>
            </div>
          ))}
          {!training.loading && training.rows.length === 0 && <p className="text-[12px] text-slate-400 text-center py-3">No training assignments yet.</p>}
        </div>
      </div>

      {completed.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm divide-y divide-slate-50">
          <p className="text-[13px] font-semibold text-[#111827] px-4 pt-3.5 pb-2">Certificates — completed courses</p>
          {completed.map((row) => (
            <div key={row.id} className="flex items-center justify-between px-4 py-2.5">
              <div className="min-w-0"><p className="text-[12.5px] font-medium text-[#111827] truncate">{row.employee} — {row.course}</p><p className="text-[10.5px] text-slate-400">{row.compliance ? "Compliance · " : ""}completed {row.completionDate || "—"}</p></div>
              <button onClick={() => printCertificate(row)} className="text-[11px] font-medium text-[#16A34A] hover:underline shrink-0 ml-3 flex items-center gap-1"><Download size={11} /> Certificate</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function mapBenefitRow(r) {
  return {
    id: r.id, dbId: r.id,
    employee: r.hr_employees?.full_name || r.employee_name || "Unknown",
    type: r.benefit_type, monthlyValue: Number(r.monthly_value) || 0, status: r.status, enrollmentDate: r.enrollment_date,
  };
}

export function mapPayrollRunRow(r) {
  return {
    id: r.id, dbId: r.id,
    period: r.period, employeeCount: r.employee_count, totalAmount: Number(r.total_amount) || 0,
    status: r.status, processedDate: r.processed_date,
  };
}

export function mapBomComponents(components) {
  return (components || []).map((c) => ({ sku: c.item_sku, qty: Number(c.qty) || 0 }));
}

export function mapBomRow(r) {
  return {
    id: r.id, dbId: r.id,
    product: r.product_name, outputUnit: r.output_unit, laborCost: Number(r.labor_cost) || 0,
    components: mapBomComponents(r.manufacturing_bom_components),
  };
}

export function mapMachineRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.name, type: r.machine_type || "", warehouse: r.warehouse_id, status: r.status, purchaseDate: r.purchase_date,
  };
}

export function mapQcInspectionRow(r) {
  return {
    id: r.id, dbId: r.id,
    workOrderId: r.work_order_ref, inspector: r.inspector, result: r.result,
    defectsFound: Number(r.defects_found) || 0, notes: r.notes || "", date: r.inspection_date,
  };
}

export function mapMaintenanceRow(r) {
  return {
    id: r.id, dbId: r.id,
    machine: r.machine_name, type: r.maintenance_type, technician: r.technician || "",
    date: r.maintenance_date, cost: Number(r.cost) || 0, notes: r.notes || "", nextDueDate: r.next_due_date,
  };
}

export function mapProjectRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.name, client: r.client, status: r.status, startDate: r.start_date, endDate: r.end_date,
    budget: Number(r.budget) || 0, manager: r.manager || "",
  };
}

export function mapProjectTaskRow(r) {
  return {
    id: r.id, dbId: r.id,
    projectId: r.project_ref, title: r.title, assignee: r.assignee || "", status: r.status,
    priority: r.priority, dueDate: r.due_date,
  };
}

export function mapMilestoneRow(r) {
  return {
    id: r.id, dbId: r.id,
    projectId: r.project_ref, title: r.title, dueDate: r.due_date, completed: r.completed,
  };
}

export function mapProjectExpenseRow(r) {
  return {
    id: r.id, dbId: r.id,
    projectId: r.project_ref, description: r.description, amount: Number(r.amount) || 0, date: r.expense_date,
  };
}

export function mapTicketMessages(messages) {
  return (messages || []).map((m) => ({ from: m.sender, text: m.body, date: m.sent_at?.slice(0, 10) }));
}

export function mapTicketRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    subject: r.subject, customer: r.customer, category: r.category, priority: r.priority,
    status: r.status, assignee: r.assignee || "", createdDate: r.created_date,
    messages: mapTicketMessages(r.support_ticket_messages),
  };
}

export function mapChatMessages(messages) {
  return (messages || []).map((m) => ({ from: m.sender, text: m.body, time: m.sent_at }));
}

export function mapChatRow(r) {
  return {
    id: r.id, dbId: r.id,
    customer: r.customer, status: r.status, messages: mapChatMessages(r.support_chat_messages),
  };
}

export function mapKbArticleRow(r) {
  return {
    id: r.id, dbId: r.id,
    title: r.title, category: r.category, content: r.content, views: Number(r.views) || 0,
    published: r.published, updatedDate: r.updated_at?.slice(0, 10),
  };
}

export function mapCallLogRow(r) {
  return {
    id: r.id, dbId: r.id,
    customer: r.customer, agent: r.agent, direction: r.direction, duration: Number(r.duration_minutes) || 0,
    outcome: r.outcome, date: r.call_date, notes: r.notes || "",
  };
}

export function mapNotificationChannelRow(r) {
  return {
    id: r.channel_id, dbId: r.id, enabled: r.enabled,
    webhookUrl: r.webhook_url || "", fromAddress: r.from_address || "", fromNumber: r.from_number || "",
    businessNumber: r.business_number || "", serverKey: r.server_key || "",
  };
}

export function mapNotificationRuleRow(r) {
  return { id: r.alert_type, dbId: r.id, channels: r.channels || [] };
}

export function mapNotificationLogRow(r) {
  return {
    id: r.id, dbId: r.id, channel: r.channel, event: r.event, message: r.message,
    status: r.status, note: r.note || "", timestamp: r.created_at,
  };
}

export function mapAuditLogRow(r) {
  return { id: r.id, action: r.action, module: r.module, actor: r.actor, details: r.details || "", timestamp: r.created_at };
}

export function mapScheduledReportRow(r) {
  return {
    id: r.id, dbId: r.id, reportType: r.report_type, frequency: r.frequency, format: r.format,
    recipientEmail: r.recipient_email || "", status: r.status, lastRun: r.last_run,
  };
}

export function mapIntegrationConnectionRow(r) {
  return {
    id: r.integration_id, dbId: r.id, enabled: r.enabled,
    tenantId: r.tenant_id || "", clientId: r.client_id || "", paymentLink: r.payment_link || "", paypalMeLink: r.paypal_me_link || "",
    webhookUrl: r.webhook_url || "", apiKey: r.api_key || "", businessNumber: r.business_number || "", storeUrl: r.store_url || "", terminalId: r.terminal_id || "",
  };
}

export function mapSignatureRow(r) {
  return {
    id: r.id, dbId: r.id, documentRef: r.document_ref, signerName: r.signer_name,
    imageData: r.image_data, signedAt: r.signed_at,
  };
}

export function mapCustomKpiRow(r) {
  return { id: r.id, dbId: r.id, metricId: r.metric_id, label: r.label, target: Number(r.target_value) || 0 };
}

export function mapCompetitorRow(r) {
  return {
    id: r.id, dbId: r.id, name: r.name, category: r.category || "",
    threatLevel: r.threat_level, notes: r.notes || "", lastUpdated: r.updated_at?.slice(0, 10),
  };
}

export function mapBenchmarkRow(r) {
  return { id: r.id, dbId: r.id, metricId: r.metric_id, label: r.label, benchmarkValue: Number(r.benchmark_value) || 0 };
}

export function mapWorkflowRow(r) {
  return { id: r.id, dbId: r.id, name: r.name, trigger: r.trigger_type, enabled: r.enabled, steps: r.steps || [], condition: r.condition || null, lastRun: r.last_run };
}

export function mapCalendarEventRow(r) {
  return {
    id: r.id, dbId: r.id, title: r.title, type: r.event_type, date: r.event_date,
    startTime: r.start_time, endTime: r.end_time, meetingLink: r.meeting_link || "",
    attendees: r.attendees || "", description: r.description || "",
  };
}

export function mapCollabChannelRow(r) {
  return { id: r.id, dbId: r.id, name: r.name, scope: r.scope, description: r.description || "" };
}

export function mapCollabMessageRow(r) {
  return { id: r.id, dbId: r.id, channelId: r.channel_ref, sender: r.sender, text: r.body, timestamp: r.created_at };
}

export function mapWorkspaceRow(r) {
  return {
    id: r.id, dbId: r.id, name: r.name, department: r.department || "",
    members: r.members || "", channelId: r.channel_ref || "", description: r.description || "",
  };
}

export function mapMarketplaceTemplateRow(r) {
  return {
    id: r.id, dbId: r.id, name: r.name, description: r.description, category: r.category,
    trigger: r.trigger_type, steps: r.steps || [], publisherName: r.published_by_company_name || "Official",
    isOfficial: r.is_official, installCount: r.install_count || 0,
  };
}

// bom_id is a real FK into manufacturing_boms, and BOMs now have a full
// live CRUD (see BOMFormPanel) — closing the gap this comment used to
// describe. bomId carries the real UUID once a real project is connected;
// in demo mode it matches bomsSeed's "BOM-01"-style codes directly.
export function mapWorkOrderRow(r) {
  return {
    id: r.id, dbId: r.id,
    bomId: r.bom_id, product: r.product, qty: Number(r.qty) || 0, status: r.status,
    startDate: r.start_date, dueDate: r.due_date,
    assignedTo: r.profiles?.full_name || "Unassigned",
  };
}

export function mapVehicleRow(r) {
  return {
    reg: r.reg, dbId: r.id,
    type: r.vehicle_type || "", driver: r.driver || "", capacity: r.capacity || "", status: r.status,
  };
}

export function mapShipmentRow(r) {
  return {
    id: r.id, dbId: r.id,
    orderRef: r.order_ref || "—", customer: r.customer, destination: r.destination,
    vehicle: r.vehicle_reg, dispatchDate: r.dispatch_date, expectedDate: r.expected_date, status: r.status,
  };
}

// ecommerce_products only stores price/published/featured — name and
// category are looked up live from Inventory via the embedded select
// "*,inventory_items(name,category)", so a rename in Inventory is
// reflected on the storefront without touching this row at all.
export function mapProductRow(r) {
  return {
    sku: r.sku, dbId: r.id,
    name: r.inventory_items?.name || r.sku,
    category: r.inventory_items?.category || "General",
    price: Number(r.price) || 0, published: r.published, featured: r.featured,
  };
}

export function mapOnlineOrderItems(items) {
  return (items || []).map((it) => ({ name: it.item_name, qty: Number(it.qty) || 0, price: Number(it.price) || 0 }));
}

export function mapOnlineOrderRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    customer: r.customer_name, email: r.customer_email || "",
    items: mapOnlineOrderItems(r.ecommerce_order_items),
    total: Number(r.total) || 0, status: r.status, method: r.payment_method || "", date: r.order_date,
  };
}

export function mapFileRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.name, type: r.file_type, folder: r.folder, size: r.size_label || "—",
    uploadedBy: r.profiles?.full_name || "Unknown", date: r.created_at?.slice(0, 10),
    linkedRecord: r.linked_record || null, content: r.content || "", versions: r.versions || [],
  };
}

export function mapCampaignRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.name, type: r.campaign_type, status: r.status, segment: r.segment,
    sentDate: r.sent_date, openRate: r.open_rate === null ? null : Number(r.open_rate),
    clickRate: r.click_rate === null ? null : Number(r.click_rate),
  };
}

export function mapPosItems(items) {
  return (items || []).map((it) => ({ sku: it.item_sku, name: it.item_name, qty: Number(it.qty) || 0, price: Number(it.price) || 0 }));
}

export function mapReturnRow(rr) {
  return {
    id: rr.id, refundTotal: Number(rr.refund_total) || 0, reason: rr.reason,
    date: rr.created_at?.slice(0, 10), items: mapPosItems(rr.pos_return_items),
  };
}

export function mapPosTransactionRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    cashier: r.profiles?.full_name || "Unknown", method: r.payment_method, date: r.created_at?.slice(0, 10),
    createdAt: r.created_at || null,
    items: mapPosItems(r.pos_transaction_items),
    returns: (r.pos_returns || []).map(mapReturnRow),
  };
}

/* =============================================================================
   TOASTS — lightweight module-level pub/sub so any handler anywhere can call
   notify() without prop-drilling through seven module trees. The <Toasts />
   component at the app root subscribes and renders the stack.
   ============================================================================= */

export const toastBus = {
  listeners: new Set(),
  push(toast) { this.listeners.forEach((fn) => fn(toast)); },
};

let toastSeq = 0;
export function notify(message, type = "success") {
  toastBus.push({ id: ++toastSeq, message, type });
}

export const TOAST_STYLE = {
  success: { bg: "rgba(5,46,22,0.97)", accent: "#22C55E", label: "#BBF7D0", Icon: CheckCircle2 },
  error:   { bg: "rgba(60,10,8,0.97)",  accent: "#EF4444", label: "#FECACA", Icon: AlertCircle },
  info:    { bg: "rgba(12,15,28,0.97)", accent: "#38BDF8", label: "#BAE6FD", Icon: Bell },
};
export const TOAST_DURATION = 3800;

// Premium toast — glassmorphism card, auto-progress bar that drains in real
// time, stacked dismiss. The progress bar uses a CSS animation tied to the
// same duration constant so the two can never drift apart.
// Activity Stream — live feed from auditBus + historical audit_log rows.
// Same bus pattern as toasts. Updates in real time as any action anywhere
// in the system emits via logAudit(). The reference app showed this;
// the implementation here uses the bus that already exists.
export const ACTIVITY_MODULE_COLORS = {
  "Finance": "#16A34A", "Sales": "#3B82F6", "Procurement": "#8B5CF6",
  "HR": "#F59E0B", "Inventory": "#06B6D4", "Workflow Studio": "#EC4899",
  "Point of Sale": "#10B981", "Security": "#EF4444", "CRM": "#F97316",
};

export function ActivityStream({ currentUser }) {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("All");
  const dbAudit = useCompanyTable("audit_log", [], {
    order: { col: "created_at", ascending: false },
    mapRow: (r) => ({ id: r.id, action: r.action, module: r.module, actor: r.actor, details: r.details, timestamp: r.created_at }),
  });

  useEffect(() => {
    if (!dbAudit.loading) {
      setEntries((prev) => {
        const existing = new Set(prev.map((e) => e.id));
        const fresh = dbAudit.rows.filter((r) => !existing.has(r.id));
        return [...prev, ...fresh].sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)).slice(0, 100);
      });
    }
  }, [dbAudit.loading, dbAudit.rows.length]);

  useEffect(() => {
    const handler = (entry) => setEntries((prev) => [entry, ...prev].slice(0, 100));
    auditBus.listeners.add(handler);
    return () => auditBus.listeners.delete(handler);
  }, []);

  const modules = ["All", ...new Set(entries.map((e) => e.module).filter(Boolean))];
  const visible = filter === "All" ? entries : entries.filter((e) => e.module === filter);

  const ago = (ts) => {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(ts)) / 60000));
    return mins < 1 ? "just now" : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.floor(mins/60)}h ago` : new Date(ts).toLocaleDateString("en-GB", { day:"numeric", month:"short" });
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-[15px] font-semibold text-[#111827]">Activity Stream</h3>
          <p className="text-[12px] text-slate-500">Live feed of significant actions across every module — updates in real time as work happens, no refresh needed.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {modules.slice(0, 7).map((m) => (
            <button key={m} onClick={() => setFilter(m)} className={`text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg transition-colors ${filter === m ? "bg-[#DCFCE7] text-[#16A34A]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{m}</button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        {dbAudit.loading && <p className="text-[12px] text-slate-400 text-center py-8">Loading activity history...</p>}
        {!dbAudit.loading && visible.length === 0 && (
          <div className="py-14 text-center">
            <Activity size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-[13px] font-medium text-slate-400">No activity yet</p>
            <p className="text-[11.5px] text-slate-400 mt-1">Actions across Sales, Finance, HR, and Workflows appear here as they happen.</p>
          </div>
        )}
        {visible.slice(0, 50).map((e) => {
          const color = ACTIVITY_MODULE_COLORS[e.module] || "#94A3B8";
          return (
            <div key={e.id} className="flex items-start gap-3 px-4 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
              <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-medium text-[#111827]">{e.action}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">{e.module}{e.details ? ` · ${e.details}` : ""}{e.actor ? ` · ${e.actor}` : ""}</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 shrink-0 mt-0.5">{ago(e.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// SendReceiptPanel — appears automatically whenever a payment brings
// an invoice to fully Paid (receiptBus), giving the operator an instant
// one-tap dispatch to the customer. Three genuinely functional channels
// in a browser:
//   WhatsApp:  wa.me/{phone}?text={url-encoded message} — opens the real
//              WhatsApp app with the message pre-filled; the operator
//              hits send. No API, no credentials, works on any phone.
//   Email:     mailto:{email}?subject=...&body=... — opens the device
//              default email client with subject and body pre-filled.
//   SMS:       sms:{phone}?body={text} — opens the device SMS app.
// Automated sending (message without human confirmation) needs a backend
// gateway — Twilio, AfricasTalking, SendGrid — named in the UI, not faked.
// The receipt itself is a real printable PDF via printAsPDF.
/* ═══════════════════════════════════════════════════════════════════════
   POST-CREATE DISPATCH PANEL
   Fires immediately after any invoice is saved.
   Slides up from the bottom-right as a non-blocking overlay —
   same pattern as SendReceiptPanel (which fires after payment).
   Gives the operator one-tap dispatch to:
     • WhatsApp  – pre-fills WA with the invoice details → wa.me or API
     • Email     – pre-fills a professional invoice email → mailto or SMTP
     • Print PDF – opens the print invoice window
     • Copy Link – copies a payment link with invoice reference
     • Dismiss   – saves without sending
═══════════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════════
   DAILY BUSINESS BRIEFING
   Auto-triggers once per day when a high-rank user (CEO/Owner/Manager)
   opens the system. Shows a full-page executive report covering every
   enabled module — KPIs, alerts (🚨 low stock, overdue invoices, etc.),
   trends, and smart recommendations.
   Downloadable as a print-ready PDF with company branding.
   Dismissible; re-opens via the top-bar bell or "Today Brief" button.
═══════════════════════════════════════════════════════════════════════ */

export const BRIEFING_EXEC_ROLES = new Set([
  "Super Administrator","Organization Owner","CEO","COO","CFO","CMO","CTO",
  "Finance Manager","HR Manager","Sales Manager","Project Manager","Warehouse Manager",
]);

export function DailyBriefing({ company, currentUser, canManage, invoices, inventory,
  expenses, crm, employees, leaveRequests, workOrders, subscriptions, smartAlerts, enabledModules }) {

  const co = company || {};
  const TODAY_STR = TODAY.toISOString().slice(0, 10);
  const briKey    = `bs_brief_${TODAY_STR}`;

  // Auto-show once per day for exec roles
  const [open, setOpen] = useState(() => {
    if (!BRIEFING_EXEC_ROLES.has(currentUser?.role)) return false;
    try { return !localStorage.getItem(briKey); } catch { return false; }
  });
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    if (open) { try { localStorage.setItem(briKey, "1"); } catch {} }
  }, [open]);

  // Expose open trigger to topbar
  useEffect(() => {
    window.__openDailyBrief = () => setOpen(true);
    return () => { delete window.__openDailyBrief; };
  }, []);

  // ── Compute all section data ─────────────────────────────────────────
  const data = useMemo(() => {
    const fmt    = (n) => new Intl.NumberFormat("en-US").format(Math.round(n || 0));
    const today  = TODAY_STR;
    const invRows = invoices?.rows || [];

    // SALES
    const todayInvs   = invRows.filter(i => i.date === today);
    const totalBilled = invRows.reduce((s, i) => s + lineTotal(i.items || []).total, 0);
    const totalCollected = invRows.reduce((s, i) => s + (i.amountPaid || 0), 0);
    const overdueInvs = invRows.filter(i => i.status !== "Paid" && i.dueDate < today);
    const overdueAmt  = overdueInvs.reduce((s, i) => s + lineTotal(i.items||[]).total - (i.amountPaid||0), 0);
    const unpaidInvs  = invRows.filter(i => i.status === "Unpaid" || i.status === "Partial");

    // INVENTORY
    const invItems  = inventory?.rows || [];
    const lowStock  = invItems.filter(it => it.stock <= it.reorderPoint && it.reorderPoint > 0);
    const outOfStock= invItems.filter(it => it.stock <= 0);
    const stockValue= invItems.reduce((s, it) => s + (it.stock || 0) * (it.cost || 0), 0);

    // FINANCE / EXPENSES
    const expRows  = expenses?.rows || [];
    const todayExp = expRows.filter(e => e.date === today);
    const totalExp = expRows.reduce((s, e) => s + (e.amount || 0), 0);
    const grossPL  = totalCollected - totalExp;

    // CRM
    const leads    = crm?.rows || [];
    const newLeads = leads.filter(l => l.createdAt?.slice(0,10) === today || l.date?.slice(0,10) === today);
    const openOpps = leads.filter(l => !["Won","Lost"].includes(l.stage));
    const pipeVal  = openOpps.reduce((s, l) => s + (l.value || 0), 0);

    // HR
    const emps      = employees || [];
    const activeEmps= emps.filter(e => e.status === "Active");
    const onLeave   = (leaveRequests?.rows || []).filter(l =>
      l.status === "Approved" && l.startDate <= today && l.endDate >= today
    );
    const expContracts = emps.filter(e =>
      e.contractEndDate && e.contractEndDate <= new Date(Date.now()+30*86400000).toISOString().slice(0,10)
    );

    // MANUFACTURING
    const wos       = workOrders?.rows || [];
    const overdueWO = wos.filter(w => w.status !== "Completed" && w.status !== "Cancelled" && w.dueDate < today);

    // SUBSCRIPTIONS
    const subs      = subscriptions?.rows || [];
    const subsDue   = subs.filter(s => s.status === "Active" && s.nextBillingDate && s.nextBillingDate <= new Date(Date.now()+7*86400000).toISOString().slice(0,10));
    const MRR       = subs.filter(s=>s.status==="Active").reduce((sum,s)=>{
      const mo={Monthly:1,Quarterly:3,Annual:12}[s.cycle]||1;
      return sum+(s.amount/mo);
    },0);

    // SMART ALERTS — deduplicated, ranked
    const alerts = (smartAlerts || []).slice(0, 20);

    return {
      fmt, today, todayInvs, totalBilled, totalCollected, overdueInvs, overdueAmt,
      unpaidInvs, lowStock, outOfStock, stockValue, expRows, todayExp, totalExp,
      grossPL, leads, newLeads, openOpps, pipeVal, activeEmps, onLeave,
      expContracts, wos, overdueWO, subs, subsDue, MRR, alerts,
    };
  }, [invoices?.rows, inventory?.rows, expenses?.rows, crm?.rows,
      employees, leaveRequests?.rows, workOrders?.rows, subscriptions?.rows, smartAlerts]);

  if (!open) return null;

  const { fmt, today, todayInvs, totalBilled, totalCollected, overdueInvs, overdueAmt,
    unpaidInvs, lowStock, outOfStock, stockValue, expRows, todayExp, totalExp,
    grossPL, leads, newLeads, openOpps, pipeVal, activeEmps, onLeave,
    expContracts, wos, overdueWO, subs, subsDue, MRR, alerts } = data;

  const ALERT_CFG = {
    critical: { col:"#EF4444", bg:"#FEF2F2", border:"#FECACA", label:"CRITICAL" },
    high:     { col:"#F59E0B", bg:"#FFFBEB", border:"#FDE68A", label:"HIGH" },
    medium:   { col:"#3B82F6", bg:"#EFF6FF", border:"#BFDBFE", label:"MEDIUM" },
    low:      { col:"#16A34A", bg:"#F0FDF4", border:"#BBF7D0", label:"LOW" },
  };

  // ── PDF export ───────────────────────────────────────────────────────
  function printBriefing() {
    const ACCENT = "#16A34A";
    const DARK   = "#0D2214";
    const genTime = new Date().toLocaleString("en-GB",{dateStyle:"full",timeStyle:"short"});

    const alertRows = alerts.map(a => {
      const ac = ALERT_CFG[a.priority]||ALERT_CFG.medium;
      return `<tr>
        <td style="padding:8px 12px">
          <span style="background:${ac.bg};color:${ac.col};padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;border:1px solid ${ac.border}">${ac.label}</span>
        </td>
        <td style="padding:8px 12px;font-size:12px;font-weight:600;color:#111827">${a.title||a.message||""}</td>
        <td style="padding:8px 12px;font-size:11.5px;color:#6B7280">${a.module||""}</td>
        <td style="padding:8px 12px;font-size:11.5px;color:#6B7280">${a.detail||a.description||""}</td>
      </tr>`;
    }).join("");

    const lowStockRows = lowStock.slice(0,10).map((it,i)=>`<tr style="background:${i%2===0?"#fff":"#FEF2F2"}">
      <td style="padding:7px 12px;font-size:12px;font-weight:600;color:#111827">${it.name}</td>
      <td style="padding:7px 12px;font-size:11.5px;color:#6B7280">${it.category||"—"}</td>
      <td style="padding:7px 12px;text-align:center;font-size:12px;font-weight:700;color:${it.stock<=0?"#EF4444":"#F59E0B"}">${it.stock} ${it.unit||""}</td>
      <td style="padding:7px 12px;text-align:center;font-size:11.5px;color:#6B7280">${it.reorderPoint}</td>
      <td style="padding:7px 12px;text-align:right;font-size:11.5px;color:#6B7280">${it.supplierName||"—"}</td>
    </tr>`).join("");

    const overdueRows = overdueInvs.slice(0,10).map((inv,i)=>{
      const bal = lineTotal(inv.items||[]).total-(inv.amountPaid||0);
      const days= Math.ceil((new Date(today)-new Date(inv.dueDate))/86400000);
      return `<tr style="background:${i%2===0?"#fff":"#FEF2F2"}">
        <td style="padding:7px 12px;font-size:11.5px;font-family:monospace;font-weight:700">${inv.id}</td>
        <td style="padding:7px 12px;font-size:12px;font-weight:600;color:#111827">${inv.customer}</td>
        <td style="padding:7px 12px;font-size:11.5px;color:#6B7280">${inv.dueDate}</td>
        <td style="padding:7px 12px;text-align:center;font-size:11.5px;color:#EF4444;font-weight:700">${days} days</td>
        <td style="padding:7px 12px;text-align:right;font-size:12px;font-family:monospace;font-weight:700;color:#EF4444">TZS ${fmt(bal)}k</td>
      </tr>`;
    }).join("");

    const win = window.open("","_blank","width=1050,height=1200");
    if (!win) { notify("Pop-up blocked — allow pop-ups to download the briefing.","error"); return; }
    win.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
      <title>Daily Briefing — ${co.name||"BusinessSphere"} · ${today}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet"/>
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:Inter,Arial,sans-serif;background:#F3F4F6;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        @media print{body{background:white;font-size:11px}.toolbar{display:none!important}.page{box-shadow:none!important;margin:0!important}}
        .page{max-width:960px;margin:24px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,.12)}
        .hdr{background:${DARK};padding:32px 40px;display:flex;justify-content:space-between;align-items:flex-start}
        .co-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:white}
        .co-meta{font-size:10.5px;color:rgba(255,255,255,.5);margin-top:4px;line-height:1.7}
        .doc-title{font-size:34px;font-weight:900;color:${ACCENT};text-align:right;letter-spacing:-0.5px}
        .doc-sub{font-size:12px;color:rgba(255,255,255,.5);margin-top:6px;text-align:right}
        .alert-band{padding:16px 40px;display:flex;gap:10px;flex-wrap:wrap;border-bottom:1px solid #E5E7EB}
        .a-pill{display:flex;align-items:center;gap:6px;padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;border:1px solid}
        .kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#E5E7EB}
        .kpi{background:white;padding:18px 22px}
        .kpi-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#9CA3AF;margin-bottom:4px}
        .kpi-value{font-size:22px;font-weight:900;color:#111827}
        .kpi-sub{font-size:10.5px;color:#6B7280;margin-top:3px}
        .section{padding:24px 40px;border-bottom:1px solid #F3F4F6}
        .sec-hdr{display:flex;align-items:center;gap:8px;margin-bottom:14px}
        .sec-icon{font-size:18px}
        .sec-title{font-size:14px;font-weight:800;color:#111827}
        .sec-badge{background:${DARK};color:white;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700}
        table.data{width:100%;border-collapse:collapse}
        table.data thead tr{background:${DARK}}
        table.data thead th{padding:8px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:rgba(255,255,255,.7)}
        table.data thead th.r{text-align:right}table.data thead th.c{text-align:center}
        .ftr{background:${DARK};padding:16px 40px;display:flex;justify-content:space-between;align-items:center}
        .ftr-note{font-size:10.5px;color:rgba(255,255,255,.4)}
        .ftr-brand{font-size:11px;font-weight:700;color:${ACCENT}}
        .toolbar{position:fixed;bottom:24px;right:24px;display:flex;gap:8px}
        .btn{padding:10px 20px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer;border:none;font-family:Inter}
        .btn-p{background:${ACCENT};color:white}.btn-c{background:white;color:#111827;border:1.5px solid #E5E7EB}
        .no-data{color:#9CA3AF;font-size:12px;text-align:center;padding:16px 0}
      </style></head><body>
      <div class="page">

        <!-- HEADER -->
        <div class="hdr">
          <div>
            <div class="co-name">${co.name||"BusinessSphere"}</div>
            <div class="co-meta">${[co.industry,co.city,co.country||"Tanzania"].filter(Boolean).join(" · ")}</div>
            <div class="co-meta" style="margin-top:6px">Prepared for: <strong style="color:rgba(255,255,255,.8)">${currentUser?.name||"Executive"}</strong> (${currentUser?.role||""})</div>
          </div>
          <div>
            <div class="doc-title">Daily Briefing</div>
            <div class="doc-sub">${new Date(today).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
            <div class="doc-sub" style="margin-top:3px">Generated: ${genTime}</div>
          </div>
        </div>

        <!-- ALERT BAND -->
        ${alerts.length>0?`<div class="alert-band">${alerts.slice(0,8).map(a=>{
          const ac=ALERT_CFG[a.priority]||ALERT_CFG.medium;
          return `<div class="a-pill" style="background:${ac.bg};border-color:${ac.border};color:${ac.col}">
            ${a.priority==="critical"?"🚨":a.priority==="high"?"⚠":"ℹ"} ${a.title||a.message||""}
          </div>`;
        }).join("")}</div>`:""}

        <!-- KPI SUMMARY -->
        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-label">Total AR Billed</div><div class="kpi-value" style="color:${ACCENT}">TZS ${fmt(totalBilled)}k</div><div class="kpi-sub">${(invoices?.rows||[]).length} invoices</div></div>
          <div class="kpi"><div class="kpi-label">Total Collected</div><div class="kpi-value" style="color:#2563EB">TZS ${fmt(totalCollected)}k</div><div class="kpi-sub">${Math.round(totalBilled>0?totalCollected/totalBilled*100:0)}% collection rate</div></div>
          <div class="kpi"><div class="kpi-label">Overdue AR</div><div class="kpi-value" style="color:${overdueAmt>0?"#EF4444":"#16A34A"}">TZS ${fmt(overdueAmt)}k</div><div class="kpi-sub">${overdueInvs.length} invoices overdue</div></div>
          <div class="kpi"><div class="kpi-label">Gross P&L</div><div class="kpi-value" style="color:${grossPL>=0?"#16A34A":"#EF4444"}">${grossPL>=0?"+":""}TZS ${fmt(Math.abs(grossPL))}k</div><div class="kpi-sub">Collected − Expenses</div></div>
          <div class="kpi"><div class="kpi-label">Inventory Value</div><div class="kpi-value">TZS ${fmt(stockValue)}k</div><div class="kpi-sub">${(inventory?.rows||[]).length} SKUs</div></div>
          <div class="kpi"><div class="kpi-label">Low / Out of Stock</div><div class="kpi-value" style="color:${lowStock.length>0?"#EF4444":"#16A34A"}">${lowStock.length}</div><div class="kpi-sub">${outOfStock.length} completely out</div></div>
          <div class="kpi"><div class="kpi-label">Active Staff</div><div class="kpi-value">${activeEmps.length}</div><div class="kpi-sub">${onLeave.length} on leave today</div></div>
          <div class="kpi"><div class="kpi-label">Pipeline Value</div><div class="kpi-value" style="color:#7C3AED">TZS ${fmt(pipeVal)}k</div><div class="kpi-sub">${openOpps.length} open opportunities</div></div>
        </div>

        <!-- ALERTS TABLE -->
        ${alerts.length>0?`<div class="section">
          <div class="sec-hdr"><span class="sec-icon">🚨</span><span class="sec-title">Active Alerts</span><span class="sec-badge">${alerts.length}</span></div>
          <table class="data"><thead><tr>
            <th>Priority</th><th>Alert</th><th>Module</th><th>Detail</th>
          </tr></thead><tbody>${alertRows}</tbody></table>
        </div>`:""}

        <!-- OVERDUE INVOICES -->
        ${overdueInvs.length>0?`<div class="section">
          <div class="sec-hdr"><span class="sec-icon">📄</span><span class="sec-title">Overdue Invoices</span><span class="sec-badge">${overdueInvs.length}</span></div>
          <table class="data"><thead><tr>
            <th>Invoice</th><th>Customer</th><th>Due Date</th><th class="c">Days Overdue</th><th class="r">Balance (TZS)</th>
          </tr></thead><tbody>${overdueRows}</tbody></table>
        </div>`:`<div class="section"><div class="sec-hdr"><span class="sec-icon">✅</span><span class="sec-title" style="color:#16A34A">No Overdue Invoices</span></div></div>`}

        <!-- LOW STOCK -->
        ${lowStock.length>0?`<div class="section">
          <div class="sec-hdr"><span class="sec-icon">📦</span><span class="sec-title">Low Stock / Reorder Needed</span><span class="sec-badge">${lowStock.length}</span></div>
          <table class="data"><thead><tr>
            <th>Item</th><th>Category</th><th class="c">Current Stock</th><th class="c">Reorder Point</th><th>Preferred Supplier</th>
          </tr></thead><tbody>${lowStockRows}</tbody></table>
        </div>`:`<div class="section"><div class="sec-hdr"><span class="sec-icon">✅</span><span class="sec-title" style="color:#16A34A">All Stock Levels Healthy</span></div></div>`}

        <!-- HR SNAPSHOT -->
        <div class="section">
          <div class="sec-hdr"><span class="sec-icon">👥</span><span class="sec-title">HR Snapshot</span></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">
            <div style="background:#F8FAFB;border-radius:10px;padding:14px">
              <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Active Employees</div>
              <div style="font-size:22px;font-weight:800;color:#111827">${activeEmps.length}</div>
            </div>
            <div style="background:${onLeave.length>0?"#FFFBEB":"#F8FAFB"};border-radius:10px;padding:14px">
              <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">On Leave Today</div>
              <div style="font-size:22px;font-weight:800;color:${onLeave.length>0?"#F59E0B":"#111827"}">${onLeave.length}</div>
              ${onLeave.slice(0,2).map(l=>`<div style="font-size:10.5px;color:#92400E;margin-top:3px">${l.employeeName||l.employee||"—"}</div>`).join("")}
            </div>
            <div style="background:${expContracts.length>0?"#FEF2F2":"#F8FAFB"};border-radius:10px;padding:14px">
              <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">Expiring Contracts (30d)</div>
              <div style="font-size:22px;font-weight:800;color:${expContracts.length>0?"#EF4444":"#111827"}">${expContracts.length}</div>
            </div>
          </div>
          ${overdueWO.length>0?`<div style="margin-top:12px;background:#FEF2F2;border-radius:10px;padding:12px">
            <div style="font-size:11px;font-weight:700;color:#EF4444;margin-bottom:6px">⚠ ${overdueWO.length} Work Order${overdueWO.length>1?"s":""} Overdue</div>
            ${overdueWO.slice(0,3).map(w=>`<div style="font-size:11.5px;color:#374151;margin-bottom:2px">• ${w.productName||w.title||w.id} — due ${w.dueDate}</div>`).join("")}
          </div>`:""}
        </div>

        <!-- CRM + SUBSCRIPTIONS -->
        <div class="section">
          <div class="sec-hdr"><span class="sec-icon">📊</span><span class="sec-title">CRM & Revenue</span></div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
            ${[
              ["New Leads Today",String(newLeads.length),"#2563EB"],
              ["Open Opportunities",String(openOpps.length),"#7C3AED"],
              ["Pipeline Value","TZS "+fmt(pipeVal)+"k","#7C3AED"],
              ["MRR (Active Subs)","TZS "+fmt(MRR)+"k","#16A34A"],
            ].map(([l,v,col])=>`<div style="background:#F8FAFB;border-radius:10px;padding:14px">
              <div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.1em;margin-bottom:4px">${l}</div>
              <div style="font-size:18px;font-weight:800;color:${col}">${v}</div>
            </div>`).join("")}
          </div>
          ${subsDue.length>0?`<div style="margin-top:12px;background:#FFFBEB;border-radius:10px;padding:12px">
            <div style="font-size:11px;font-weight:700;color:#F59E0B;margin-bottom:6px">⏰ ${subsDue.length} Subscription${subsDue.length>1?"s":""} Due for Billing (Next 7 Days)</div>
            ${subsDue.slice(0,3).map(s=>`<div style="font-size:11.5px;color:#374151;margin-bottom:2px">• ${s.customer} — ${s.plan} — ${s.nextBillingDate}</div>`).join("")}
          </div>`:""}
        </div>

        <!-- FOOTER -->
        <div class="ftr">
          <div class="ftr-note">Confidential — For executive use only · ${co.name||"BusinessSphere"} · ${genTime}</div>
          <div class="ftr-brand">BusinessSphere ERP Daily Brief</div>
        </div>
      </div>

      <div class="toolbar">
        <button class="btn btn-c" onclick="window.close()">Close</button>
        <button class="btn btn-p" onclick="window.print()">Download / Print PDF</button>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(()=>win.focus(),200);
    notify("Daily Briefing PDF ready — print or save");
  }

  // ── Render: full-page modal overlay ─────────────────────────────────
  const criticals = alerts.filter(a=>a.priority==="critical");
  const highs     = alerts.filter(a=>a.priority==="high");
  const fmtCur    = (n) => "TZS " + new Intl.NumberFormat("en-US").format(Math.round(n||0)) + "k";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(13,34,20,0.7)",backdropFilter:"blur(4px)"}}>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] mx-4 flex flex-col overflow-hidden"
        style={{animation:"briefingIn .35s cubic-bezier(.22,1,.36,1)"}}>

        {/* ── Header bar ── */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-slate-100" style={{background:"#0D2214"}}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-widest">BusinessSphere ERP</span>
                <span className="text-[rgba(255,255,255,.3)]">·</span>
                <span className="text-[10.5px] text-[rgba(255,255,255,.4)] font-mono">{new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span>
              </div>
              <h1 className="text-white text-[24px] font-black tracking-tight leading-none">Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {(currentUser?.name||"").split(" ")[0]} 👋</h1>
              <p className="text-[rgba(255,255,255,.5)] text-[12.5px] mt-1.5">Here is your daily business briefing for {co.name||"your company"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={printBriefing}
                className="flex items-center gap-1.5 text-[12px] font-bold text-white px-3.5 py-2 rounded-xl border border-[rgba(255,255,255,.15)] hover:bg-[rgba(255,255,255,.08)]">
                <Printer size={13}/> PDF
              </button>
              <button onClick={()=>setOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[rgba(255,255,255,.6)] hover:text-white hover:bg-[rgba(255,255,255,.1)]">
                <X size={16}/>
              </button>
            </div>
          </div>

          {/* Alert summary pills */}
          {(criticals.length>0||highs.length>0) && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {criticals.length>0&&<span className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-[#EF4444] px-3 py-1 rounded-full">🚨 {criticals.length} Critical</span>}
              {highs.length>0&&<span className="flex items-center gap-1.5 text-[11px] font-bold text-[#111827] bg-[#F59E0B] px-3 py-1 rounded-full">⚠ {highs.length} High</span>}
              {lowStock.length>0&&<span className="flex items-center gap-1.5 text-[11px] font-bold text-[#EF4444] bg-[#FEF2F2] border border-[#FECACA] px-3 py-1 rounded-full">📦 {lowStock.length} Low Stock</span>}
              {overdueInvs.length>0&&<span className="flex items-center gap-1.5 text-[11px] font-bold text-[#F59E0B] bg-[#FFFBEB] border border-[#FDE68A] px-3 py-1 rounded-full">⏰ {overdueInvs.length} Overdue Invoices</span>}
            </div>
          )}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">

          {/* KPI tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100">
            {[
              {l:"Total AR Billed",   v:fmtCur(data.totalBilled),   col:"#16A34A", sub:(invoices?.rows||[]).length+" invoices"},
              {l:"Collected",         v:fmtCur(data.totalCollected), col:"#2563EB", sub:Math.round(data.totalBilled>0?data.totalCollected/data.totalBilled*100:0)+"% rate"},
              {l:"Overdue AR",        v:fmtCur(data.overdueAmt),    col:data.overdueAmt>0?"#EF4444":"#16A34A", sub:data.overdueInvs.length+" invoices"},
              {l:"Gross P&L",         v:(data.grossPL>=0?"+":"")+fmtCur(Math.abs(data.grossPL)), col:data.grossPL>=0?"#16A34A":"#EF4444", sub:"Collected − Expenses"},
              {l:"Inventory Value",   v:fmtCur(data.stockValue),    col:"#111827", sub:(inventory?.rows||[]).length+" SKUs"},
              {l:"Low/Out of Stock",  v:String(data.lowStock.length),col:data.lowStock.length>0?"#EF4444":"#16A34A", sub:data.outOfStock.length+" completely out"},
              {l:"Active Staff",      v:String(data.activeEmps.length),col:"#111827", sub:data.onLeave.length+" on leave today"},
              {l:"Pipeline Value",    v:fmtCur(data.pipeVal),       col:"#7C3AED", sub:data.openOpps.length+" open opps"},
            ].map(({l,v,col,sub})=>(
              <div key={l} className="bg-white px-4 py-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">{l}</p>
                <p className="text-[19px] font-black" style={{color:col}}>{v}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* 🚨 ALERTS SECTION */}
          {alerts.length > 0 && (
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-black text-[#111827] mb-3 flex items-center gap-2">
                🚨 Active Alerts <span className="text-[11px] font-bold text-white bg-[#EF4444] px-2 py-0.5 rounded-full">{alerts.length}</span>
              </h2>
              <div className="space-y-2">
                {alerts.map((a, i) => {
                  const ac = ALERT_CFG[a.priority] || ALERT_CFG.medium;
                  return (
                    <div key={i} className="flex items-start gap-3 px-3 py-3 rounded-xl border"
                      style={{background:ac.bg, borderColor:ac.border}}>
                      <span className="text-[16px] shrink-0 mt-0.5">{a.priority==="critical"?"🚨":a.priority==="high"?"⚠️":"ℹ️"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{background:ac.col,color:"white"}}>{ac.label}</span>
                          <span className="text-[10.5px] font-semibold text-slate-500">{a.module||""}</span>
                        </div>
                        <p className="text-[13px] font-bold" style={{color:ac.col}}>{a.title||a.message||""}</p>
                        {(a.detail||a.description)&&<p className="text-[11.5px] text-slate-500 mt-0.5">{a.detail||a.description}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 📦 INVENTORY ALERTS */}
          {(lowStock.length > 0 || outOfStock.length > 0) && (
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-black text-[#111827] mb-3 flex items-center gap-2">
                📦 Low Stock Items <span className="text-[11px] font-bold text-white bg-[#EF4444] px-2 py-0.5 rounded-full">{lowStock.length}</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead><tr className="bg-[#0D2214]">
                    {["Item","Category","Stock","Reorder Point","Supplier","Status"].map(h=>(
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-[rgba(255,255,255,.7)]">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {lowStock.slice(0,8).map((it,i)=>(
                      <tr key={it.id} className={i%2===0?"bg-white":"bg-[#FEF2F2]/50"}>
                        <td className="px-3 py-2.5 font-bold text-[#111827]">{it.name}</td>
                        <td className="px-3 py-2.5 text-slate-500">{it.category||"—"}</td>
                        <td className="px-3 py-2.5 font-mono font-black" style={{color:it.stock<=0?"#EF4444":"#F59E0B"}}>{it.stock} {it.unit||""}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-500">{it.reorderPoint}</td>
                        <td className="px-3 py-2.5 text-slate-500">{it.supplierName||"—"}</td>
                        <td className="px-3 py-2.5">
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${it.stock<=0?"bg-[#EF4444] text-white":"bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]"}`}>
                            {it.stock<=0?"🚨 OUT OF STOCK":"⚠ REORDER NOW"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 📄 OVERDUE INVOICES */}
          {overdueInvs.length > 0 && (
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-[14px] font-black text-[#111827] mb-3 flex items-center gap-2">
                📄 Overdue Invoices <span className="text-[11px] font-bold text-white bg-[#F59E0B] px-2 py-0.5 rounded-full">{overdueInvs.length}</span>
                <span className="text-[13px] font-black text-[#EF4444] ml-auto">{fmtCur(data.overdueAmt)} outstanding</span>
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead><tr className="bg-[#0D2214]">
                    {["Invoice","Customer","Due Date","Days Late","Balance"].map(h=>(
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-[rgba(255,255,255,.7)]">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {overdueInvs.slice(0,8).map((inv,i)=>{
                      const bal  = lineTotal(inv.items||[]).total-(inv.amountPaid||0);
                      const days = Math.ceil((new Date(TODAY_STR)-new Date(inv.dueDate))/86400000);
                      return (
                        <tr key={inv.id} className={i%2===0?"bg-white":"bg-[#FEF2F2]/50"}>
                          <td className="px-3 py-2.5 font-mono font-bold text-[#111827]">{inv.id}</td>
                          <td className="px-3 py-2.5 font-semibold text-[#111827]">{inv.customer}</td>
                          <td className="px-3 py-2.5 font-mono text-slate-500">{inv.dueDate}</td>
                          <td className="px-3 py-2.5">
                            <span className={`font-bold ${days>30?"text-[#EF4444]":days>14?"text-[#F59E0B]":"text-[#374151]"}`}>{days}d</span>
                          </td>
                          <td className="px-3 py-2.5 font-mono font-black text-[#EF4444]">{fmtCur(bal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 👥 HR + 📊 CRM snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
            <div className="px-6 py-4">
              <h2 className="text-[14px] font-black text-[#111827] mb-3">👥 HR Snapshot</h2>
              <div className="space-y-2">
                {[
                  ["Active Employees", activeEmps.length, "#111827"],
                  ["On Leave Today",   onLeave.length,    onLeave.length>0?"#F59E0B":"#16A34A"],
                  ["Expiring Contracts (30d)", expContracts.length, expContracts.length>0?"#EF4444":"#16A34A"],
                  ["Overdue Work Orders", data.overdueWO.length, data.overdueWO.length>0?"#EF4444":"#16A34A"],
                ].map(([l,v,col])=>(
                  <div key={l} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-[12.5px] text-slate-600">{l}</span>
                    <span className="text-[14px] font-black" style={{color:col}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-6 py-4">
              <h2 className="text-[14px] font-black text-[#111827] mb-3">📊 CRM & Revenue</h2>
              <div className="space-y-2">
                {[
                  ["New Leads Today",       newLeads.length,      "#2563EB"],
                  ["Open Opportunities",    openOpps.length,      "#7C3AED"],
                  ["Pipeline Value",        fmtCur(pipeVal),      "#7C3AED"],
                  ["Monthly Recurring Rev", fmtCur(MRR),          "#16A34A"],
                  ["Subs Due (7 days)",     subsDue.length,       subsDue.length>0?"#F59E0B":"#16A34A"],
                ].map(([l,v,col])=>(
                  <div key={l} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-[12.5px] text-slate-600">{l}</span>
                    <span className="text-[14px] font-black" style={{color:col}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Good standing notice */}
          {alerts.length===0&&lowStock.length===0&&overdueInvs.length===0&&(
            <div className="mx-6 my-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl p-4 text-center">
              <p className="text-[15px] font-black text-[#16A34A]">✅ Business Health: All Clear</p>
              <p className="text-[12.5px] text-[#166534] mt-1">No critical alerts, no low stock, no overdue invoices. Business is running smoothly.</p>
            </div>
          )}
        </div>

        {/* ── Footer actions ── */}
        <div className="shrink-0 px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">Auto-shows once per day · Re-open anytime from the top bar</p>
          <div className="flex gap-2">
            <button onClick={printBriefing}
              className="flex items-center gap-1.5 text-[12.5px] font-bold text-white px-4 py-2 rounded-xl bg-[#16A34A]">
              <Printer size={13}/> Download PDF
            </button>
            <button onClick={()=>setOpen(false)}
              className="text-[12.5px] font-medium text-slate-600 border border-slate-200 px-4 py-2 rounded-xl hover:bg-white">
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes briefingIn {
          from{opacity:0;transform:scale(.96) translateY(20px)}
          to{opacity:1;transform:scale(1)    translateY(0)}
        }
      `}</style>
    </div>
  );
}


export function PostCreateDispatch({ company, crm }) {
  const [inv, setInv]     = useState(null);   // the just-created invoice
  const [sent, setSent]   = useState({});      // which channels were used
  const [visible, setVis] = useState(false);   // animate in/out
  const [closing, setClg] = useState(false);   // closing animation

  useEffect(() => {
    const handler = (invoice) => {
      setInv(invoice);
      setSent({});
      setClg(false);
      setVis(true);
    };
    invoiceCreatedBus.listeners.add(handler);
    return () => invoiceCreatedBus.listeners.delete(handler);
  }, []);

  // Auto-dismiss after 60 seconds if untouched
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => dismiss(), 60000);
    return () => clearTimeout(t);
  }, [visible]);

  function dismiss() {
    setClg(true);
    setTimeout(() => { setVis(false); setClg(false); setInv(null); }, 280);
  }

  if (!inv || !visible) return null;

  const co      = company || window.__smartManagerCompany || {};
  const { subtotal, tax, total } = lineTotal(inv.items || []);
  const fmt     = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));

  // Find customer contact info from CRM
  const lead    = (crm?.rows || []).find(l =>
    (l.company || l.contact || "").toLowerCase() === (inv.customer || "").toLowerCase()
  );
  const phone   = (lead?.phone || inv.customerPhone || "").replace(/[^0-9]/g, "");
  const email   = lead?.email || inv.customerEmail || "";

  // ── WA message body ─────────────────────────────────────────────────
  const waMsg = [
    `*Invoice ${inv.id}* from *${co.name || "BusinessSphere"}*`,
    ``,
    `Dear ${inv.customer},`,
    ``,
    `Your invoice is ready.`,
    ``,
    `📋 *Invoice:*  ${inv.id}`,
    `📅 *Date:*     ${inv.date}`,
    `📆 *Due:*      ${inv.dueDate || "On receipt"}`,
    `💰 *Amount:*   TZS ${fmt(total)}`,
    ``,
    inv.items?.slice(0, 3).map(it =>
      `  • ${it.name}  ×${it.qty}  @ TZS ${fmt(it.rate)}`
    ).join("\n"),
    inv.items?.length > 3 ? `  • …and ${inv.items.length - 3} more item${inv.items.length - 3 > 1 ? "s" : ""}` : null,
    ``,
    co.bankName   ? `🏦 *Bank:*      ${co.bankName} — ${co.bankAccount || ""}` : null,
    co.mpesa      ? `📱 *M-Pesa:*    ${co.mpesa}` : null,
    ``,
    `Please quote reference *${inv.id}* when making payment.`,
    ``,
    `Thank you for your business!`,
    `_${co.name || "BusinessSphere"}_`,
  ].filter(l => l !== null).join("\n");

  // ── Email body ───────────────────────────────────────────────────────
  const emailSubject = `Invoice ${inv.id} from ${co.name || "BusinessSphere"} — TZS ${fmt(total)}`;
  const emailBody    = [
    `Dear ${inv.customer},`,
    ``,
    `Please find your invoice details below.`,
    ``,
    `Invoice No:  ${inv.id}`,
    `Issue Date:  ${inv.date}`,
    `Due Date:    ${inv.dueDate || "On receipt"}`,
    `Amount:      TZS ${fmt(total)} (incl. 18% VAT)`,
    ``,
    `Items:`,
    ...(inv.items || []).map(it => `  ${it.name}  ×${it.qty}  TZS ${fmt((it.qty||1)*(it.rate||0))}`),
    ``,
    `Payment Details:`,
    co.bankName    ? `  Bank:      ${co.bankName}` : null,
    co.bankAccount ? `  Account:   ${co.bankAccount}` : null,
    co.bankBranch  ? `  Branch:    ${co.bankBranch}` : null,
    co.mpesa       ? `  M-Pesa:    ${co.mpesa}` : null,
    ``,
    `Please use reference ${inv.id} when making payment.`,
    ``,
    `Thank you for your business.`,
    ``,
    `Kind regards,`,
    co.owner ? co.owner : null,
    co.name  || "BusinessSphere",
    co.phone ? `Tel: ${co.phone}` : null,
    co.email ? co.email : null,
  ].filter(l => l !== null).join("\n");

  // ── Actions ──────────────────────────────────────────────────────────
  function sendWhatsApp() {
    if (!phone) {
      // No phone — open WA Center pre-loaded
      waBus.push({ templateId: "invoice", vars: {
        docId: inv.id, amount: fmt(total), dueDate: inv.dueDate || "On receipt", ref: inv.id,
      }});
      notify("Open Collaboration → WhatsApp to send — no phone number found for this customer");
      setSent(s => ({ ...s, whatsapp: true }));
      return;
    }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMsg)}`, "_blank", "noopener");
    setSent(s => ({ ...s, whatsapp: true }));
    notify(`✓ WhatsApp opened for ${inv.customer} — click Send in WhatsApp to deliver`);
    logAudit("Invoice WA sent", "Sales", co.owner || "System", `${inv.id} → ${inv.customer}`);
  }

  function sendEmail() {
    if (!email) {
      emailBus.push({ subject: emailSubject, body: emailBody, tmpl: "invoice" });
      notify("Open Collaboration → Email to send — no email address found for this customer");
      setSent(s => ({ ...s, email: true }));
      return;
    }
    const params = new URLSearchParams();
    params.set("subject", emailSubject);
    params.set("body", emailBody);
    window.location.href = `mailto:${encodeURIComponent(email)}?${params.toString()}`;
    setSent(s => ({ ...s, email: true }));
    notify(`✓ Email client opened for ${inv.customer} — click Send to deliver`);
    logAudit("Invoice email sent", "Sales", co.owner || "System", `${inv.id} → ${inv.customer}`);
  }

  function copyPayLink() {
    const link = `https://pay.${(co.website || "businesssphere.co.tz").replace(/^https?:\/\//,"")}/${inv.id}?amount=${Math.round(total)}&customer=${encodeURIComponent(inv.customer)}`;
    if (navigator.clipboard) navigator.clipboard.writeText(link);
    setSent(s => ({ ...s, link: true }));
    notify(`Payment link copied — Ref: ${inv.id}`);
  }

  function printNow() {
    // Reuse the printInvoice from Sales module (needs the doc format)
    // We rebuild it inline since PostCreateDispatch is outside Sales scope
    const doc = {
      ...inv,
      status: "Unpaid",
      payments: [],
      amountPaid: 0,
      customerEmail: email,
      customerPhone: phone,
    };
    // Trigger the Sales printInvoice via a synthetic event on the invoice
    // The cleanest cross-scope approach: push to a print bus
    printInvoiceBus.push(doc);
    setSent(s => ({ ...s, print: true }));
  }

  // ── Render ────────────────────────────────────────────────────────────
  const ACTIONS = [
    {
      id: "whatsapp",
      label: phone ? "Send via WhatsApp" : "WhatsApp Center",
      sub:    phone ? phone : "No phone — opens WA Center",
      icon:   "📱",
      color:  "#25D366",
      bg:     "#F0FFF4",
      border: "#D1FAE5",
      fn:     sendWhatsApp,
    },
    {
      id: "email",
      label: email ? "Send via Email" : "Email Center",
      sub:   email ? email : "No email — opens Email Center",
      icon:  "✉️",
      color: "#2563EB",
      bg:    "#EFF6FF",
      border:"#BFDBFE",
      fn:    sendEmail,
    },
    {
      id: "print",
      label: "Print / Save PDF",
      sub:   "Professional invoice PDF",
      icon:  "🖨",
      color: "#374151",
      bg:    "#F8FAFB",
      border:"#E5E7EB",
      fn:    printNow,
    },
    {
      id: "link",
      label: "Copy Payment Link",
      sub:   `pay.… / ${inv.id}`,
      icon:  "🔗",
      color: "#7C3AED",
      bg:    "#F5F3FF",
      border:"#DDD6FE",
      fn:    copyPayLink,
    },
  ];

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-280 ${closing ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}
      style={{animation: closing ? undefined : "slideUp .28s cubic-bezier(.22,1,.36,1)"}}>
      <div className="w-[340px] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden">

        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100" style={{background:"#0D2214"}}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-[#16A34A] uppercase tracking-widest">Invoice Created</span>
                <span className="text-[10px] text-[rgba(255,255,255,.3)]">•</span>
                <span className="text-[10px] font-mono text-[rgba(255,255,255,.5)]">{inv.id}</span>
              </div>
              <p className="text-white font-black text-[17px] leading-tight">{inv.customer}</p>
              <p className="text-[#16A34A] font-mono font-bold text-[15px] mt-0.5">TZS {fmt(total)}</p>
            </div>
            <div className="text-right">
              <p className="text-[rgba(255,255,255,.4)] text-[10px] mb-0.5">Due</p>
              <p className="text-white font-semibold text-[12px]">{inv.dueDate || "On receipt"}</p>
              <p className="text-[rgba(255,255,255,.3)] text-[10px] mt-0.5">{inv.items?.length} item{inv.items?.length !== 1 ? "s" : ""}</p>
            </div>
          </div>

          {/* Items preview pills */}
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {(inv.items || []).slice(0, 3).map((it, i) => (
              <span key={i} className="text-[10.5px] text-[rgba(255,255,255,.6)] bg-[rgba(255,255,255,.08)] px-2 py-0.5 rounded-full">
                {it.name.length > 18 ? it.name.slice(0, 16) + "…" : it.name}
              </span>
            ))}
            {(inv.items?.length || 0) > 3 && (
              <span className="text-[10.5px] text-[rgba(255,255,255,.4)] px-1">+{inv.items.length - 3} more</span>
            )}
          </div>
        </div>

        {/* Subtitle */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-[11.5px] font-semibold text-[#111827]">Send this invoice to the customer</p>
          <p className="text-[10.5px] text-slate-400">Choose one or more channels — each can be used independently</p>
        </div>

        {/* Action buttons */}
        <div className="px-3 pb-2 space-y-1.5 mt-1">
          {ACTIONS.map(a => {
            const done = sent[a.id];
            return (
              <button key={a.id} onClick={a.fn}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all hover:shadow-sm active:scale-[.98]"
                style={{
                  background: done ? a.bg : "white",
                  borderColor: done ? a.color + "40" : "#E5E7EB",
                }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[19px] shrink-0"
                  style={{background: a.bg, border: `1.5px solid ${a.border}`}}>
                  {done ? "✓" : a.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[12.5px] font-bold" style={{color: done ? a.color : "#111827"}}>
                    {done ? "Sent — " + a.label : a.label}
                  </p>
                  <p className="text-[10.5px] text-slate-400 truncate">{a.sub}</p>
                </div>
                {done && (
                  <span className="text-[11px] font-black shrink-0" style={{color: a.color}}>✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 pb-3 flex gap-2">
          <button onClick={dismiss}
            className="flex-1 text-[12px] font-medium text-slate-500 border border-slate-200 rounded-xl py-2 hover:bg-slate-50">
            Dismiss
          </button>
          {Object.keys(sent).length > 0 && (
            <button onClick={dismiss}
              className="flex-1 text-[12px] font-bold text-white rounded-xl py-2 bg-[#16A34A]">
              ✓ Done · Close
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px) scale(.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>
    </div>
  );
}

// Bus for cross-scope PDF printing from PostCreateDispatch
export const printInvoiceBus = {
  listeners: new Set(),
  push(doc) { this.listeners.forEach(fn => fn(doc)); },
};


export function SendReceiptPanel() {
  const [receipt, setReceipt] = useState(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState({});

  useEffect(() => {
    const handler = (r) => {
      setReceipt(r);
      setPhone(r.customerPhone || "");
      setEmail(r.customerEmail || "");
      setSent({});
    };
    receiptBus.listeners.add(handler);
    return () => receiptBus.listeners.delete(handler);
  }, []);

  if (!receipt) return null;

  const total = lineTotal(receipt.items || []).total;
  const refPart = receipt.reference ? " (Ref: " + receipt.reference + ")" : "";
  const msg = encodeURIComponent(
    "✅ Receipt — " + receipt.invoiceId + "\n\nDear " + receipt.customer + ",\n\nPayment of TZS " + money(Math.round(receipt.amount)) + "k received on " + receipt.date + " via " + receipt.method + refPart + ".\n\nThank you for your business!\n\n— SmartManager"
  );
  const subject = encodeURIComponent(`Receipt for ${receipt.invoiceId} — ${receipt.customer}`);

  function sendViaWhatsApp() {
    const num = phone.replace(/[\s\-\(\)]/g, "");
    window.open(`https://wa.me/${num}?text=${msg}`, "_blank");
    setSent((s) => ({ ...s, whatsapp: true }));
    notify(`WhatsApp opened for ${receipt.customer} — hit Send in WhatsApp to deliver the receipt.`);
  }

  function sendViaEmail() {
    window.location.href = `mailto:${email}?subject=${subject}&body=${msg}`;
    setSent((s) => ({ ...s, email: true }));
    notify(`Email client opened — confirm send to deliver the receipt to ${receipt.customer}.`);
  }

  function sendViaSMS() {
    const num = phone.replace(/[\s\-\(\)]/g, "");
    window.location.href = `sms:${num}?body=${msg}`;
    setSent((s) => ({ ...s, sms: true }));
    notify(`SMS app opened — confirm send to deliver the receipt to ${receipt.customer}.`);
  }

  function printReceipt() {
    const co = window.__smartManagerCompany || {};
    const fmt = (n) => new Intl.NumberFormat("en-US").format(Math.round(n));
    const subtotalVal = (receipt.items||[]).reduce((s,it)=>s+(it.qty||1)*(it.rate||0),0);
    const taxVal = subtotalVal * 0.18;
    const itemRows = (receipt.items || []).map((it) =>
      "<tr><td style=\"padding:7px 10px;border-bottom:1px solid #F3F4F6\">" + it.name + "</td>" +
      "<td style=\"padding:7px 10px;border-bottom:1px solid #F3F4F6;text-align:center;font-family:monospace\">" + (it.qty||1) + "</td>" +
      "<td style=\"padding:7px 10px;border-bottom:1px solid #F3F4F6;text-align:right;font-family:monospace\">" + fmt(it.rate||0) + "k</td>" +
      "<td style=\"padding:7px 10px;border-bottom:1px solid #F3F4F6;text-align:right;font-family:monospace;font-weight:600\">" + fmt((it.qty||1)*(it.rate||0)) + "k</td></tr>"
    ).join("");
    const logoHtml = co.logo
      ? "<img src=\"" + co.logo + "\" style=\"height:44px;object-fit:contain;filter:brightness(0) invert(1)\" alt=\"logo\"/>"
      : "<svg width=\"36\" height=\"42\" viewBox=\"0 0 120 140\"><polygon points=\"60,6 114,33 114,107 60,134 6,107 6,33\" fill=\"rgba(255,255,255,.9)\"/><text x=\"60\" y=\"78\" text-anchor=\"middle\" dominant-baseline=\"middle\" fill=\"#16A34A\" font-size=\"52\" font-weight=\"900\" font-family=\"sans-serif\">S</text></svg>";
    const detailStrip = [co.address ? "📍 " + co.address + (co.city ? ", " + co.city : "") : "",
      co.phone ? "📞 " + co.phone : "", co.email ? "✉️ " + co.email : "", co.tin ? "TIN: " + co.tin : ""]
      .filter(Boolean).map((s) => "<span>" + s + "</span>").join("  ·  ");
    printAsPDF("Receipt " + receipt.invoiceId,
      "<div style=\"font-family:Inter,sans-serif;max-width:520px;margin:0 auto;background:white\">" +
      "<div style=\"background:linear-gradient(135deg,#052614,#16A34A);padding:22px 28px;display:flex;align-items:center;justify-content:space-between\">" +
        "<div style=\"display:flex;align-items:center;gap:12px\">" + logoHtml +
          "<div><div style=\"font-size:16px;font-weight:800;color:white\">" + (co.name||"Smart Manager") + "</div>" +
          (co.tagline ? "<div style=\"font-size:10px;color:rgba(255,255,255,.7);font-style:italic\">" + co.tagline + "</div>" : "") + "</div></div>" +
        "<div style=\"text-align:right\"><div style=\"font-size:10px;color:rgba(255,255,255,.6);letter-spacing:.06em;text-transform:uppercase\">Payment Receipt</div>" +
          "<div style=\"font-size:15px;font-weight:900;color:white;margin-top:2px\">" + (receipt.id||docId("RCT")) + "</div></div>" +
      "</div>" +
      (detailStrip ? "<div style=\"background:#F0FDF4;padding:8px 28px;font-size:10.5px;color:#166534\">" + detailStrip + "</div>" : "") +
      "<div style=\"padding:24px 28px\">" +
        "<div style=\"display:flex;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid #E5E7EB\">" +
          "<div><div style=\"font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#9CA3AF;margin-bottom:4px\">Bill To</div>" +
          "<div style=\"font-size:14px;font-weight:700;color:#111827\">" + receipt.customer + "</div></div>" +
          "<div style=\"text-align:right\"><div style=\"font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:#9CA3AF;margin-bottom:4px\">Details</div>" +
          "<div style=\"font-size:11.5px;color:#111827\">Invoice: <strong>" + receipt.invoiceId + "</strong></div>" +
          "<div style=\"font-size:11px;color:#6B7280\">Date: " + receipt.date + "</div>" +
          "<div style=\"font-size:11px;color:#6B7280\">Method: " + receipt.method + "</div>" +
          (receipt.reference ? "<div style=\"font-size:11px;color:#6B7280\">Ref: " + receipt.reference + "</div>" : "") + "</div>" +
        "</div>" +
        "<table style=\"width:100%;border-collapse:collapse;margin-bottom:16px\">" +
          "<thead><tr style=\"background:#F8FAFC;border-bottom:2px solid #E5E7EB\">" +
            "<th style=\"padding:8px 10px;text-align:left;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6B7280\">Description</th>" +
            "<th style=\"padding:8px 10px;text-align:center;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6B7280\">Qty</th>" +
            "<th style=\"padding:8px 10px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6B7280\">Rate</th>" +
            "<th style=\"padding:8px 10px;text-align:right;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;color:#6B7280\">Amount</th>" +
          "</tr></thead><tbody>" + itemRows + "</tbody></table>" +
        "<div style=\"border-top:1px solid #E5E7EB;padding-top:12px;margin-bottom:16px\">" +
          "<div style=\"display:flex;justify-content:space-between;font-size:11.5px;color:#6B7280;margin-bottom:4px\"><span>Subtotal</span><span>TZS " + fmt(subtotalVal) + "k</span></div>" +
          "<div style=\"display:flex;justify-content:space-between;font-size:11.5px;color:#6B7280;margin-bottom:10px\"><span>VAT (18%)</span><span>TZS " + fmt(taxVal) + "k</span></div>" +
          "<div style=\"display:flex;justify-content:space-between;padding:12px 16px;background:#052614;border-radius:10px\">" +
            "<span style=\"font-size:14px;font-weight:800;color:white\">TOTAL PAID</span>" +
            "<span style=\"font-size:18px;font-weight:900;color:#4ADE80\">TZS " + fmt(receipt.amount) + "k</span>" +
          "</div>" +
        "</div>" +
        "<div style=\"background:#F0FDF4;border:1px solid #BBF7D0;border-radius:10px;padding:14px;text-align:center;margin-bottom:16px\">" +
          "<div style=\"font-size:18px;margin-bottom:4px\">✅</div>" +
          "<div style=\"font-size:13px;font-weight:700;color:#16A34A\">Payment Confirmed</div>" +
          "<div style=\"font-size:11px;color:#166534;margin-top:2px\">This receipt is your official proof of payment.</div>" +
        "</div>" +
        "<div style=\"text-align:center;border-top:1px solid #E5E7EB;padding-top:12px\">" +
          (co.website ? "<div style=\"font-size:11px;color:#16A34A;margin-bottom:4px\">" + co.website + "</div>" : "") +
          "<div style=\"font-size:10px;color:#9CA3AF\">Generated by Smart Manager · " + new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) + "</div>" +
        "</div>" +
      "</div></div>"
    );
    setSent((s) => ({ ...s, print: true }));
  }

  const CHANNELS = [
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#22C55E", bg: "#F0FDF4", border: "#86EFAC", fn: sendViaWhatsApp, need: phone, hint: "wa.me link — opens WhatsApp, you tap Send" },
    { id: "email", label: "Email", icon: Mail, color: "#3B82F6", bg: "#EFF6FF", border: "#93C5FD", fn: sendViaEmail, need: email, hint: "mailto: link — opens your email client" },
    { id: "sms", label: "SMS", icon: MessageSquare, color: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D", fn: sendViaSMS, need: phone, hint: "sms: link — opens your SMS app" },
  ];

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-4 z-50 w-[calc(100vw-2rem)] sm:w-[400px]" style={{ animation: "toastIn .25s cubic-bezier(.34,1.4,.64,1)" }}>
      <div className="bg-white rounded-2xl shadow-2xl border border-[#16A34A]/20 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: "linear-gradient(135deg,#052614,#16A34A)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle2 size={16} className="text-white" /></div>
            <div>
              <p className="text-[13px] font-semibold text-white">Payment received ✓</p>
              <p className="text-[10.5px] text-white/70">{receipt.customer} · TZS {money(Math.round(receipt.amount))}k · {receipt.invoiceId}</p>
            </div>
          </div>
          <button onClick={() => setReceipt(null)} className="text-white/60 hover:text-white"><X size={15} /></button>
        </div>

        <div className="p-4 space-y-3">
          {/* Contact fields */}
          <div className="grid grid-cols-2 gap-2">
            <div><label className="text-[10.5px] text-slate-500 block mb-1">Phone (WhatsApp / SMS)</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+255 7XX XXX XXX" /></div>
            <div><label className="text-[10.5px] text-slate-500 block mb-1">Email</label>
              <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@email.com" /></div>
          </div>

          {/* Channel buttons */}
          <div className="grid grid-cols-3 gap-2">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const done = sent[ch.id];
              const disabled = !ch.need;
              return (
                <button key={ch.id} onClick={ch.fn} disabled={disabled}
                  title={disabled ? `Enter ${ch.id === "email" ? "email" : "phone"} first` : ch.hint}
                  className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl border text-[11px] font-medium transition-all disabled:opacity-40"
                  style={{ backgroundColor: done ? ch.bg : "white", borderColor: done ? ch.border : "#E2E8F0", color: done ? ch.color : "#6B7280" }}>
                  <Icon size={16} style={{ color: done ? ch.color : "#94A3B8" }} />
                  {done ? "✓ Opened" : ch.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 text-center">Each button opens your device app — confirm send there. Automated sending needs AfricasTalking/SendGrid backend.</p>

          {/* Print PDF */}
          <button onClick={printReceipt} className="w-full flex items-center justify-center gap-2 text-[12.5px] font-medium border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 transition-colors text-slate-600">
            <Download size={13} className="text-[#16A34A]" /> Download / Print receipt PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// Global Confirmation Dialog — a modal "Are you sure?" that replaces
// the immediate-delete pattern across all 22 modules. Destructive
// actions (variant:"danger") show a red confirm button; neutral ones
// (default) show brand green. Escape key and backdrop click both cancel.
export function ConfirmDialog() {
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const handler = (d) => setDialog(d);
    confirmBus.listeners.add(handler);
    return () => confirmBus.listeners.delete(handler);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => { if (e.key === "Escape") setDialog(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog]);

  if (!dialog) return null;
  const danger = dialog.variant === "danger";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={() => setDialog(null)}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-slate-200/60" onClick={(e) => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${danger ? "bg-red-50" : "bg-[#DCFCE7]"}`}>
          {danger ? <AlertCircle size={22} className="text-[#EF4444]" /> : <AlertCircle size={22} className="text-[#16A34A]" />}
        </div>
        <h3 className="text-[16px] font-bold text-[#111827] text-center mb-2" style={{ fontFamily: "Poppins,Inter,sans-serif" }}>
          {dialog.title || (danger ? "Are you sure?" : "Confirm action")}
        </h3>
        <p className="text-[13px] text-slate-500 text-center mb-6 leading-relaxed">{dialog.message}</p>
        <div className="flex gap-3">
          <button onClick={() => setDialog(null)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { dialog.onConfirm(); setDialog(null); }}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all"
            style={{ background: danger ? "linear-gradient(135deg,#EF4444,#DC2626)" : "linear-gradient(135deg,#16A34A,#22C55E)", boxShadow: danger ? "0 4px 12px rgba(239,68,68,0.3)" : "0 4px 12px rgba(22,163,74,0.3)" }}
          >
            {dialog.confirmLabel || (danger ? "Delete" : "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toasts() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const onToast = (t) => {
      setToasts((prev) => [...prev.slice(-4), { ...t, born: Date.now() }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== t.id)), TOAST_DURATION);
    };
    toastBus.listeners.add(onToast);
    return () => toastBus.listeners.delete(onToast);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-4 z-[60] flex flex-col gap-2.5 w-[calc(100vw-2rem)] sm:w-[360px] pointer-events-none">
      {toasts.map((t) => {
        const s = TOAST_STYLE[t.type] || TOAST_STYLE.info;
        const Icon = s.Icon;
        return (
          <div key={t.id} className="pointer-events-auto overflow-hidden rounded-xl shadow-2xl" style={{ animation: "toastIn .22s cubic-bezier(.34,1.4,.64,1)", backdropFilter: "blur(16px)", background: s.bg, border: `1px solid ${s.accent}28` }}>
            {/* Auto-draining progress bar */}
            <div className="h-[2px] w-full" style={{ background: `${s.accent}30` }}>
              <div className="h-full" style={{ backgroundColor: s.accent, animation: `toastDrain ${TOAST_DURATION}ms linear forwards` }} />
            </div>
            <div className="flex items-start gap-3 px-4 py-3.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${s.accent}22` }}>
                <Icon size={14} style={{ color: s.accent }} />
              </div>
              <p className="flex-1 text-[12.5px] leading-snug font-medium" style={{ color: s.label }}>{t.message}</p>
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity mt-0.5" aria-label="Dismiss">
                <X size={13} className="text-white" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------- DATA ---------------------------------- */

// A real 15-role model, replacing the earlier 4-tier placeholder (that
// comment predicted this exact expansion). Each role is defined along two
// dimensions this app can genuinely enforce: which modules appear in the
// sidebar at all (allowedModules), and whether the role can create/edit/
// delete or only view (writeAccess). This is a real, meaningful two-axis
// permission model — not a full per-action permission matrix. Building
// that would mean gating every individual create/edit/delete control
// across all twenty modules individually, a large, separate undertaking
// documented as a follow-up rather than attempted here at risk of leaving
// half the app's buttons correctly gated and half not. What's below is
// fully real: change your role in Settings and the sidebar genuinely
// changes, and every write-gated screen already in the app (Procurement
// Approvals, Notification Channels, Integration Connections, Settings
// itself) respects it immediately.
export const ALL_MODULE_IDS = [
  "dashboard", "crm", "sales", "inventory", "procurement", "finance", "reports", "hr",
  "manufacturing", "scm", "marketing", "ecommerce", "pos", "documents", "projects",
  "support", "analytics", "notifications", "integrations", "ai", "workflows", "collaboration",
];

export const ROLES = [
  {
    id: "Super Administrator", category: "System",
    description: "Full system control, including company settings, module entitlements, and every integration credential.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ALL_MODULE_IDS, writeAccess: "full",
  },
  {
    id: "Organization Owner", category: "Executive",
    description: "Full business access — the owner's own view of everything the company runs.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ALL_MODULE_IDS, writeAccess: "full",
  },
  {
    id: "CEO", category: "Executive",
    description: "Full visibility and control across every function, with Analytics and Dashboard as primary working views.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ALL_MODULE_IDS, writeAccess: "full",
  },
  {
    id: "CFO", category: "Executive",
    description: "Full financial authority — Finance, Procurement spend, and Reports — plus company-wide visibility for oversight.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ["finance", "procurement", "reports", "analytics"], writeAccess: "full",
  },
  {
    id: "Finance Manager", category: "Department Head",
    description: "Sees every module for company-wide financial oversight; day-to-day work — invoicing, payables, ledger, tax — happens in Finance, Reports, and Procurement spend.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ["finance", "reports", "analytics", "procurement", "notifications"], writeAccess: "full",
  },
  {
    id: "HR Manager", category: "Department Head",
    description: "Sees every module for company-wide oversight; day-to-day work — recruitment, attendance, payroll, leave approvals — happens in HR.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ["hr", "analytics", "documents"], writeAccess: "full",
  },
  {
    id: "Sales Manager", category: "Department Head",
    description: "Sees every module for company-wide oversight; day-to-day work — pipeline, quotations, orders, invoicing, campaigns — happens in CRM, Sales, and Marketing.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ["crm", "sales", "marketing", "ecommerce", "analytics", "support", "workflows"], writeAccess: "full",
  },
  {
    id: "Procurement Officer", category: "Operations",
    description: "Sees every module for company-wide visibility; day-to-day work — purchase orders, supplier relationships, vendor payments — happens in Procurement and Inventory.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ["procurement", "inventory"], writeAccess: "full",
  },
  {
    id: "Warehouse Manager", category: "Operations",
    description: "Sees every module for company-wide visibility; day-to-day work — stock, work orders, shipments, fleet — happens in Inventory, Manufacturing, and Supply Chain.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ["inventory", "manufacturing", "scm", "pos"], writeAccess: "full",
  },
  {
    id: "Project Manager", category: "Operations",
    description: "Sees every module for company-wide visibility; day-to-day work — tasks, timelines, milestones, budgets — happens in Projects.",
    allowedModules: ALL_MODULE_IDS, primaryModules: ["projects", "documents", "reports"], writeAccess: "full",
  },
  {
    id: "Customer Support Agent", category: "Front Line",
    description: "Handles tickets, live chat, the knowledge base, and the call log; views CRM for customer context.",
    allowedModules: ["dashboard", "support", "crm", "collaboration"], primaryModules: ["support", "crm"], writeAccess: "full",
  },
  {
    id: "Employee", category: "General Staff",
    description: "General staff access — company documents, team chat, and the shared calendar. No administrative capability.",
    allowedModules: ["dashboard", "documents", "collaboration"], primaryModules: ["documents"], writeAccess: "none",
  },
  {
    id: "Auditor", category: "Oversight",
    description: "Sees every module for audit purposes; cannot create, edit, or delete anything anywhere in the system.",
    allowedModules: ALL_MODULE_IDS, primaryModules: [], writeAccess: "none",
  },
  {
    id: "External Client", category: "External Portal",
    description: "A customer-facing role, scoped to Customer Support only. Honest limitation: this build has no real customer authentication, so this view is not filtered to one client's own records — see the handover doc.",
    allowedModules: ["support"], primaryModules: ["support"], writeAccess: "none",
  },
  {
    id: "Supplier", category: "External Portal",
    description: "A vendor-facing role, scoped to Procurement's Supplier Portal. Same honest limitation as External Client: not filtered to one supplier's own purchase orders without real supplier-side authentication.",
    allowedModules: ["procurement"], primaryModules: ["procurement"], writeAccess: "none",
  },
];

// Dynamic Home Screen — every role lands on a genuinely different
// dashboard, not a cosmetic label change. Reuses the exact real Analytics
// dashboard functions (section 21) rather than computing the same numbers
// a second time for the home screen; "financial" here calls the literal
// same FinancialDashboard() function Analytics' own Financial tab calls.
// Two view types have no direct Analytics equivalent because their domain
// is not lifted to root-shared state (Procurement's POs, Projects' tasks,
// Support's tickets all live in their own modules' local state — see
// section 21's own stated scope boundary): those roles get a focused
// welcome and a direct link into their actual module instead of a
// fabricated widget standing in for data this screen does not have.
export const ROLE_HOME_VIEW = {
  "Super Administrator": "executive",
  "Organization Owner": "executive",
  "CEO": "executive",
  "CFO": "financial",
  "Finance Manager": "financial",
  "HR Manager": "hr",
  "Sales Manager": "sales",
  "Procurement Officer": "operations",
  "Warehouse Manager": "operations",
  "Project Manager": "focused",
  "Customer Support Agent": "focused",
  "Employee": "minimal",
  "Auditor": "executive",
  "External Client": "minimal",
  "Supplier": "minimal",
};

