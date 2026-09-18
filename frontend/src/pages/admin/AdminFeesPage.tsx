import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useToast } from "../../components/ui/Toast";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

interface DropdownItem { id: number; name: string; }
interface FeeType { id: number; name: string; description: string | null; }
interface Invoice {
  id: number; student_id: number; fee_type_id: number;
  total_amount: number; paid_amount: number; due_amount: number;
  due_date: string | null; status: string;
}
interface Student { id: number; first_name: string; last_name: string; student_code: string; class_id: number | null; }

const STATUS_COLORS: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700 border-emerald-200",
  PARTIAL: "bg-amber-100 text-amber-700 border-amber-200",
  PENDING: "bg-sky-100 text-sky-700 border-sky-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

export function AdminFeesPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showPayForm, setShowPayForm] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [bulkForm, setBulkForm] = useState({ class_id: "", fee_type_id: "", total_amount: "", due_date: "" });
  const [filterStatus, setFilterStatus] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["admin-invoices"],
    queryFn: async () => (await api.get("/fees/invoices")).data as Invoice[],
  });

  const { data: classes } = useQuery({
    queryKey: ["admin-classes"],
    queryFn: async () => (await api.get("/admin/classes")).data as DropdownItem[],
  });

  const { data: feeTypes } = useQuery({
    queryKey: ["fee-types"],
    queryFn: async () => (await api.get("/fees/types")).data as FeeType[],
  });

  const { data: students } = useQuery({
    queryKey: ["admin-students-list"],
    queryFn: async () => (await api.get("/admin/students")).data as Student[],
  });

  const bulkMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => (await api.post("/fees/invoices/bulk", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setShowBulkForm(false);
      setBulkForm({ class_id: "", fee_type_id: "", total_amount: "", due_date: "" });
      showToast("Invoices generated successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to generate invoices", "error");
    },
  });

  const payMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Record<string, unknown> }) =>
      (await api.post(`/fees/invoices/${id}/payments`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      setShowPayForm(null);
      setPayAmount("");
      showToast("Payment recorded successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to record payment", "error");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => api.delete(`/fees/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      showToast("Invoice deleted successfully");
    },
    onError: (e: { response?: { data?: { detail?: string } } }) => {
      showToast(e.response?.data?.detail || "Failed to delete invoice", "error");
    },
  });

  const totalPending = invoices?.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((s, i) => s + i.due_amount, 0) || 0;
  const totalCollected = invoices?.reduce((s, i) => s + i.paid_amount, 0) || 0;
  const totalDue = invoices?.reduce((s, i) => s + i.due_amount, 0) || 0;

  const filteredInvoices = invoices?.filter(i => !filterStatus || i.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold">Fee Management</h1>
            <p className="text-emerald-100 text-sm mt-0.5">Manage tuition fees, collect payments and track invoices</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-bl-[40px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Collected</p>
            </div>
            <p className="text-2xl font-extrabold text-emerald-600">TK {totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-bl-[40px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending / Overdue</p>
            </div>
            <p className="text-2xl font-extrabold text-amber-600">TK {totalPending.toLocaleString()}</p>
          </div>
        </div>
        <div className="relative bg-white rounded-2xl border border-slate-200 p-5 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-50 rounded-bl-[40px] -z-0" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Due</p>
            </div>
            <p className="text-2xl font-extrabold text-red-600">TK {totalDue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Bulk Generate Form */}
      {showBulkForm && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-emerald-50/50">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Generate Fee Invoices</h2>
              <p className="text-xs text-slate-500">Create invoices for all students in a class</p>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Class *</label>
                <select value={bulkForm.class_id} onChange={(e) => setBulkForm({ ...bulkForm, class_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                  <option value="">Select class...</option>
                  {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Fee Type *</label>
                <select value={bulkForm.fee_type_id} onChange={(e) => setBulkForm({ ...bulkForm, fee_type_id: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                  <option value="">Select type...</option>
                  {feeTypes?.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (TK) *</label>
                <input type="number" value={bulkForm.total_amount} onChange={(e) => setBulkForm({ ...bulkForm, total_amount: e.target.value })}
                  placeholder="e.g. 5000"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Due Date</label>
                <input type="date" value={bulkForm.due_date} onChange={(e) => setBulkForm({ ...bulkForm, due_date: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
              </div>
            </div>
            <div className="flex justify-end mt-5 gap-3">
              <button onClick={() => setShowBulkForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Cancel
              </button>
              <button onClick={() => {
                if (!bulkForm.class_id || !bulkForm.fee_type_id || !bulkForm.total_amount) return;
                bulkMutation.mutate({
                  class_id: Number(bulkForm.class_id), fee_type_id: Number(bulkForm.fee_type_id),
                  total_amount: Number(bulkForm.total_amount), due_date: bulkForm.due_date || null,
                });
              }} disabled={bulkMutation.isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm shadow-emerald-200">
                {bulkMutation.isPending ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Invoices
                  </>
                )}
              </button>
            </div>
            {bulkMutation.isSuccess && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-emerald-700">Invoices generated. Students have been notified.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoices Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">All Invoices{invoices ? ` (${invoices.length})` : ""}</h2>
              <p className="text-xs text-slate-500">Manage fee invoices and track payments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition">
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PENDING">Pending</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <button onClick={() => { setShowBulkForm(!showBulkForm); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm shadow-emerald-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {showBulkForm ? "Close Form" : "New Invoice"}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Payment Form Inline */}
          {showPayForm !== null && (
            <div className="mb-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-700">Record Payment — Invoice #{showPayForm}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Amount (TK) *</label>
                  <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Payment Method</label>
                  <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition">
                    {["CASH", "BKASH", "NAGAD", "BANK", "OTHER"].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setShowPayForm(null); setPayAmount(""); }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                    Cancel
                  </button>
                  <button onClick={() => {
                    if (!payAmount || Number(payAmount) <= 0) return;
                    payMutation.mutate({ id: showPayForm, payload: { amount: Number(payAmount), method: payMethod } });
                  }} disabled={payMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm">
                    {payMutation.isPending ? "Saving..." : "Record Payment"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Invoices Table */}
          {isLoading ? (
            <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}</div>
          ) : !filteredInvoices || filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-1">No invoices found</p>
              <p className="text-xs text-slate-500 mb-4">{filterStatus ? "Try changing the filter" : "Click \"New Invoice\" to create fee invoices"}</p>
              {!filterStatus && (
                <button onClick={() => setShowBulkForm(true)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition">
                  + Create First Invoice
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Fee Type</th>
                    <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Paid</th>
                    <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Due</th>
                    <th className="text-center pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-left pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                    <th className="text-right pb-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map(inv => {
                    const student = students?.find(s => s.id === inv.student_id);
                    const feeType = feeTypes?.find(ft => ft.id === inv.fee_type_id);
                    return (
                      <tr key={inv.id} className="group hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {student ? `${student.first_name[0]}${student.last_name[0]}`.toUpperCase() : "S"}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{student ? `${student.first_name} ${student.last_name}` : `Student #${inv.student_id}`}</p>
                              <p className="text-[10px] text-slate-400">{student?.student_code || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                            {feeType?.name || "Fee"}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-right text-sm font-bold text-slate-900">TK {inv.total_amount.toLocaleString()}</td>
                        <td className="py-3.5 pr-4 text-right text-sm font-semibold text-emerald-600">TK {inv.paid_amount.toLocaleString()}</td>
                        <td className="py-3.5 pr-4 text-right text-sm font-bold text-red-600">TK {inv.due_amount.toLocaleString()}</td>
                        <td className="py-3.5 pr-4 text-center">
                          <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[inv.status] || "bg-slate-100 text-slate-600"}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-xs text-slate-500">{inv.due_date || "—"}</td>
                        <td className="py-3.5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {inv.status !== "PAID" && (
                              <button onClick={() => { setShowPayForm(inv.id); setPayAmount(String(inv.due_amount)); }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Pay
                              </button>
                            )}
                            <button onClick={() => setDeleteConfirmId(inv.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition" title="Delete">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId !== null) {
            deleteMutation.mutate(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Delete Invoice"
        message="Are you sure you want to delete this invoice? This action cannot be undone."
        confirmLabel="Delete Invoice"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
