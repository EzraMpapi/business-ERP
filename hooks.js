// @ts-nocheck
export function useLocalPersist(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem("bs_" + key);
      return stored !== null ? JSON.parse(stored) : defaultVal;
    } catch (_e) { return defaultVal; }
  });
  const setPersist = useCallback((v) => {
    setVal(v);
    try { localStorage.setItem("bs_" + key, JSON.stringify(v)); } catch (_e) {}
  }, [key]);
  return [val, setPersist];
}

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function useSortableTable(rows = []) {
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [filterQ,  setFilterQ]  = useState("");

  const doSort = useCallback((col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  }, [sortCol]);

  const sorted = useMemo(() => {
    let rows2 = [...rows];
    if (filterQ) {
      const q = filterQ.toLowerCase();
      rows2 = rows2.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)));
    }
    if (sortCol) {
      rows2.sort((a, b) => {
        const va = a[sortCol] ?? "", vb = b[sortCol] ?? "";
        const n = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
        return sortDir === "asc" ? n : -n;
      });
    }
    return rows2;
  }, [rows, sortCol, sortDir, filterQ]);

  const SortHeader = ({ col, label, className="" }) => (
    <th className={"cursor-pointer select-none hover:bg-slate-100 transition-colors " + className}
        onClick={() => doSort(col)}>
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {sortCol === col
          ? sortDir === "asc"
            ? <SortAsc size={11} className="text-[#16A34A] shrink-0"/>
            : <SortDesc size={11} className="text-[#16A34A] shrink-0"/>
          : <span className="w-[11px]"/>}
      </div>
    </th>
  );

  return { sorted, sortCol, sortDir, doSort, filterQ, setFilterQ, SortHeader };
}

export function useCompanyTable(table, seed, { select = "*", order, mapRow } = {}) {
  // Demo mode serves the seed instantly. Live mode starts empty and loading —
  // flashing demo rows and then swapping them for real data reads as a glitch.
  // isLive folds in DEMO_OVERRIDE too — a person previewing the demo despite
  // real credentials being configured should see the same instant, honest
  // seed data as someone with no Supabase project connected at all, not a
  // broken screen quietly trying to fetch real data with no real session.
  const isLive = IS_CONFIGURED && !DEMO_OVERRIDE;
  const [rows, setRows] = useState(isLive ? [] : seed);
  const [loading, setLoading] = useState(isLive);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!isLive) return;
    setLoading(true);
    setError(null);
    try {
      // Company scoping is enforced entirely by RLS's current_company_id()
      // (reading the real authenticated session — see section 32 of the
      // handover doc), not filtered again here. A hardcoded ACTIVE_COMPANY_ID
      // constant could never correctly scope queries once real multi-user
      // login exists — different signed-in users belong to different
      // companies, so the one thing that must never happen is the client
      // supplying its own company_id filter; RLS is the single source of
      // truth for which rows a given session can see.
      let q = sb(table).select(select);
      if (order) q = q.order(order.col, { ascending: order.ascending });
      const data = await q.run();
      // mapRow translates the database's snake_case/UUID-keyed shape into
      // the UI's camelCase shape (see mapRow functions below). Every mapped
      // row keeps its real UUID on `dbId` so mutation handlers can target
      // the correct database row even though the UI displays a friendlier
      // id. Tables without a mapper pass through unchanged (demo-only tables).
      setRows(mapRow ? data.map(mapRow) : data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [table, select, order, mapRow]);

  useEffect(() => { reload(); }, [reload]);

  return { rows, setRows, loading, error, reload };
}

/* =============================================================================
   DB → UI ROW MAPPERS
   PostgREST returns snake_case columns keyed by UUID; every UI component in
   this file expects camelCase fields keyed by a human-readable document
   number (L-0231, INV-8801, HDW-2201...). These mappers bridge that gap for
   each live-mapped table. `dbId` carries the real UUID through for mutation
   calls (`.eq("id", row.dbId ?? row.id)`); everything else matches the
   corresponding seed shape exactly, so no component code has to change.

   Coverage: crm_leads, inventory_items, finance_expenses, and the three
   sales document tables (with embedded line items via PostgREST's nested
   select). Other live tables (HR, Manufacturing, SCM, E-Commerce, Documents)
   do not yet have mappers — see the handover doc for the remaining list.
   ============================================================================= */

export function mapLeadRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.contact_name, company: r.company_name, stage: r.stage,
    value: Number(r.value_amount) || 0, currency: r.currency || "TZS000",
    owner: r.owner_id || "Unassigned", email: r.email || "", phone: r.phone || "",
    industry: r.industry || "General", score: r.score ?? 50,
    lastActivity: r.last_activity_at ? new Date(r.last_activity_at).toLocaleDateString() : "—",
    expectedCloseDate: r.expected_close_date || null,
  };
}

export function mapContactRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.name, title: r.title || "", company: r.company, email: r.email || "", phone: r.phone || "", isPrimary: r.is_primary,
  };
}

export function mapInventoryRow(r) {
  return {
    sku: r.sku, dbId: r.id,
    name: r.name, category: r.category || "General", warehouse: r.warehouse_id,
    qty: Number(r.qty_on_hand) || 0, reorder: Number(r.reorder_level) || 0,
    unitCost: Number(r.unit_cost) || 0, unit: r.unit || "unit",
    barcode: r.barcode || generateBarcode(r.sku), expiryDate: r.expiry_date || null,
  };
}

export function mapWarehouseRow(r) {
  return { id: r.id, dbId: r.id, name: r.name, city: r.city || "" };
}

export function mapTransferRow(r) {
  return {
    id: r.id, dbId: r.id,
    sku: r.item_sku, itemName: r.item_name, qty: Number(r.qty) || 0,
    fromWarehouse: r.from_warehouse, toWarehouse: r.to_warehouse,
    status: r.status, date: r.created_at?.slice(0, 10), notes: r.notes || "",
  };
}

export function mapBatchRow(r) {
  return {
    id: r.id, dbId: r.id,
    sku: r.item_sku, itemName: r.item_name, batchNumber: r.batch_number,
    qty: Number(r.qty) || 0, expiryDate: r.expiry_date, warehouse: r.warehouse_id,
    supplier: r.supplier_name || "", receivedDate: r.received_date,
  };
}

export function mapSupplierRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.name, contactPerson: r.contact_person || "", email: r.email || "", phone: r.phone || "",
    category: r.category || "", leadTimeDays: Number(r.lead_time_days) || 0, status: r.status,
  };
}

export function mapPoItems(items) {
  return (items || []).map((it) => ({ sku: it.item_sku, name: it.item_name, qty: Number(it.qty) || 0, cost: Number(it.cost) || 0 }));
}

export function mapPurchaseOrderRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    supplier: r.supplier, status: r.status, orderDate: r.order_date, expectedDate: r.expected_date,
    requestedBy: r.requested_by || "", items: mapPoItems(r.purchase_order_items),
  };
}

export function mapProcurementContractRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    supplier: r.supplier, type: r.contract_type, startDate: r.start_date, endDate: r.end_date,
    value: Number(r.value) || 0, notes: r.notes || "",
  };
}

export function mapExpenseRow(r) {
  return {
    id: r.id, dbId: r.id,
    vendor: r.vendor, category: r.category, date: r.expense_date, dueDate: r.due_date || r.expense_date,
    amount: Number(r.amount) || 0, status: r.status, method: r.method || "",
  };
}

export function mapAssetRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.name, category: r.category, acquisitionDate: r.acquisition_date,
    cost: Number(r.cost) || 0, usefulLifeYears: Number(r.useful_life_years) || 5,
  };
}

// Shared by all three sales documents: PostgREST returns the child items
// table as a nested array keyed by its own table name when the select
// string embeds it (e.g. "*,sales_invoice_items(*)").
export function mapDocItems(items) {
  return (items || [])
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((it) => ({ name: it.item_name, qty: Number(it.qty) || 0, rate: Number(it.rate) || 0, sku: it.item_sku || null }));
}

export function mapQuotationRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    customer: r.customer, date: r.issue_date, validUntil: r.valid_until,
    status: r.status, owner: r.owner_id || "Unassigned",
    items: mapDocItems(r.sales_quotation_items),
  };
}

export function mapOrderReturnRow(rr) {
  return {
    id: rr.id, reason: rr.reason, date: rr.created_at?.slice(0, 10),
    items: (rr.sales_order_return_items || []).map((it) => ({ name: it.item_name, sku: it.item_sku, qty: Number(it.qty) || 0, rate: Number(it.rate) || 0 })),
  };
}

export function mapOrderRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    customer: r.customer, date: r.order_date, quotationRef: r.quotation_id ? "linked" : "—",
    status: r.status, owner: r.owner_id || "Unassigned",
    items: mapDocItems(r.sales_order_items),
    returns: (r.sales_order_returns || []).map(mapOrderReturnRow),
  };
}

export function mapPaymentRow(r) {
  return { id: r.id, amount: Number(r.amount) || 0, method: r.method, date: r.payment_date, reference: r.reference || null };
}

export function mapInvoiceRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    customer: r.customer, date: r.issue_date, dueDate: r.due_date,
    orderRef: r.order_id ? "linked" : "—", status: r.status,
    amountPaid: Number(r.amount_paid) || 0,
    items: mapDocItems(r.sales_invoice_items),
    payments: (r.sales_payments || []).map(mapPaymentRow).sort((a, b) => (a.date < b.date ? 1 : -1)),
  };
}

export function mapSubscriptionRow(r) {
  return {
    id: r.doc_number, dbId: r.id,
    customer: r.customer, plan: r.plan, amount: Number(r.amount) || 0, cycle: r.cycle,
    status: r.status, startDate: r.start_date, nextBillingDate: r.next_billing_date,
  };
}

export function mapEmployeeRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.full_name, role: r.role, department: r.department || "General",
    email: r.email || "", phone: r.phone || "", status: r.status,
    salary: Number(r.salary) || 0, hireDate: r.hire_date,
    contractType: r.contract_type || "Permanent", contractEndDate: r.contract_end_date,
  };
}

// Leave requests store employee_id (a real FK); the embedded select
// "*,hr_employees(full_name)" brings the name along so the UI never has
// to do a second lookup or show a bare UUID.
export function mapLeaveRow(r) {
  return {
    id: r.id, dbId: r.id,
    employee: r.hr_employees?.full_name || "Unknown",
    type: r.leave_type, startDate: r.start_date, endDate: r.end_date, status: r.status,
  };
}

export function mapCandidateRow(r) {
  return {
    id: r.id, dbId: r.id,
    name: r.name, role: r.role, department: r.department, stage: r.stage,
    email: r.email || "", appliedDate: r.applied_date,
  };
}

export function mapAttendanceRow(r) {
  return {
    id: r.id, dbId: r.id,
    employee: r.hr_employees?.full_name || r.employee_name || "Unknown",
    date: r.attendance_date, status: r.status,
    clockIn: r.clock_in || null, clockOut: r.clock_out || null,
    verified:  r.verified    || false,   // true = signed via WebAuthn biometric
    sigMethod: r.sig_method  || "none",  // "biometric" | "unsigned" | "none"
    location:  r.location    || null,
    deviceId:  r.device_id   || null,
  };
}

export function mapPerformanceRow(r) {
  return {
    id: r.id, dbId: r.id,
    employee: r.hr_employees?.full_name || r.employee_name || "Unknown",
    period: r.period, rating: r.rating, reviewer: r.reviewer, notes: r.notes || "", date: r.review_date,
  };
}

export function mapTrainingRow(r) {
  return {
    id: r.id, dbId: r.id,
    employee: r.hr_employees?.full_name || r.employee_name || "Unknown",
    course: r.course, status: r.status, completionDate: r.completion_date,
    mandatory: !!r.is_mandatory, compliance: !!r.is_compliance,
    dueDate: r.due_date || null, videoUrl: r.video_url || null,
  };
}

// LMS Insights — the layer that turns the training list into a learning
// system. Department progress is computed from real assignments joined
// to each employee real department; overdue mandatory training is a
// computed fact (mandatory + past due + not completed); and every
// completed course earns a real printable certificate through the same
// proven printAsPDF isolation every report uses. Honest scope stated in
// the UI: video is linked, not hosted (the storage-layer boundary), and
// exams need a question/answer model — real future work, not a quiz
