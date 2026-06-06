import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';
import { useFormatCurrency, useFormatDate } from '../utils/format';

const STAGES = [
  { key: 'submitted', label: 'Submitted', icon: 'outbox' },
  { key: 'review', label: 'In Review', icon: 'visibility' },
  { key: 'decision', label: 'Decision', icon: 'gavel' },
  { key: 'released', label: 'Released', icon: 'task_alt' },
];

const INITIAL_TIMELINE = [
  { id: 1, stage: 'Submitted', actor: 'J. Smith', role: 'Procurement Officer', decision: 'submitted', timestamp: '2023-10-24T09:15:00', remarks: 'PO drafted from approved quotation Q-2024-892. Routed for departmental review.' },
  { id: 2, stage: 'In Review', actor: 'S. Miller', role: 'Department Head', decision: 'approved', timestamp: '2023-10-24T14:30:00', remarks: 'Budget verified. Cost falls within Q4 procurement cap of $25,000.' },
];

const DECISION_LABEL = { approved: 'Approved', rejected: 'Rejected', submitted: 'Submitted', recall: 'Recalled' };

const Approvals = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fmt = useFormatCurrency();
  const fmtDate = useFormatDate();
  const [remarks, setRemarks] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [status, setStatus] = useState('pending');
  const [tab, setTab] = useState('summary');
  const [timeline, setTimeline] = useState(INITIAL_TIMELINE);
  const [currentStage, setCurrentStage] = useState(2);

  const open = (kind) => {
    if (kind === 'reject' && !remarks.trim()) {
      toast.error('Remarks are required to reject this PO.');
      return;
    }
    setConfirm(kind);
  };

  const commit = () => {
    const kind = confirm;
    const now = new Date();
    if (kind === 'approve') {
      setStatus('approved');
      setCurrentStage(3);
      setTimeline((t) => [...t, {
        id: Date.now(), stage: 'Decision', actor: 'You (Finance Director)', role: 'Finance Director',
        decision: 'approved', timestamp: now.toISOString(), remarks: remarks.trim() || 'Approved without additional remarks.',
      }, {
        id: Date.now() + 1, stage: 'Released', actor: 'System', role: 'Auto',
        decision: 'approved', timestamp: new Date(now.getTime() + 1000).toISOString(),
        remarks: 'PO released to vendor. Awaiting fulfillment.',
      }]);
      toast.success('PO-2023-4921 approved. Vendor has been notified.');
    } else if (kind === 'reject') {
      setStatus('rejected');
      setCurrentStage(0);
      setTimeline((t) => [...t, {
        id: Date.now(), stage: 'Decision', actor: 'You (Finance Director)', role: 'Finance Director',
        decision: 'rejected', timestamp: now.toISOString(),
        remarks: remarks.trim() || 'Rejected without remarks.',
      }, {
        id: Date.now() + 1, stage: 'Returned', actor: 'System', role: 'Auto',
        decision: 'rejected', timestamp: new Date(now.getTime() + 1000).toISOString(),
        remarks: 'PO returned to procurement for revision.',
      }]);
      toast.error('PO-2023-4921 rejected. Procurement has been notified.');
    }
    setConfirm(null);
    setRemarks('');
    setTab('timeline');
    setTimeout(() => navigate('/dashboard'), 1800);
  };

  const recall = () => {
    if (status !== 'approved') return;
    setStatus('pending');
    setCurrentStage(2);
    setTimeline((t) => [...t, {
      id: Date.now(), stage: 'Decision', actor: 'You (Finance Director)', role: 'Finance Director',
      decision: 'recall', timestamp: new Date().toISOString(),
      remarks: 'Approval recalled. PO sent back for re-review.',
    }]);
    toast.info('Approval recalled. PO is back under review.');
  };

  const stageState = (idx) => {
    if (status === 'approved' && idx <= 3) return 'done';
    if (status === 'rejected' && idx === 0) return 'done';
    if (status === 'rejected' && idx === 1) return 'done';
    if (status === 'rejected' && idx === 2) return 'done';
    if (status === 'rejected' && idx === 3) return 'rejected';
    if (idx < currentStage) return 'done';
    if (idx === currentStage) return status === 'rejected' ? 'rejected' : 'active';
    return 'pending';
  };

  return (
    <div className="container-page">
      <div className="mb-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors" aria-label="Back to dashboard">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-caps text-label-caps tracking-widest uppercase">Pending Approval</span>
          </Link>
        </div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display-lg text-display-lg text-primary font-normal mb-2 tracking-tight">PO-2023-4921</h2>
            <p className="font-mono-data text-mono-data text-on-surface-variant">Submitted on Oct 24, 2023 by J. Smith (Procurement)</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-caps text-label-caps uppercase tracking-widest ${
              status === 'pending' ? 'bg-[#f0ebd8] text-[#8c7b3e]'
              : status === 'approved' ? 'bg-secondary-container text-secondary'
              : 'bg-error-container text-error'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'pending' ? 'bg-[#8c7b3e]' : status === 'approved' ? 'bg-secondary' : 'bg-error'}`}></span>
              {status === 'pending' ? 'Pending Decision' : status === 'approved' ? 'Approved' : 'Rejected'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-caps text-label-caps uppercase tracking-widest bg-surface-container-high text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">grade</span>
              Stage {currentStage + 1} of 4
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-caps text-label-caps uppercase tracking-widest bg-primary-container/30 text-primary">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              $14,550.00
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-outline-variant mb-8 max-w-5xl">
        <nav className="flex gap-1" role="tablist">
          {[
            { key: 'summary', label: 'Summary', icon: 'description' },
            { key: 'workflow', label: 'Workflow', icon: 'account_tree' },
            { key: 'timeline', label: `Timeline (${timeline.length})`, icon: 'schedule' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              role="tab"
              aria-selected={tab === t.key}
              className={`px-5 py-3 font-label-caps text-label-caps uppercase tracking-widest transition-colors flex items-center gap-2 -mb-px border-b-2 ${
                tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl">
        <div className="lg:col-span-8 space-y-8">
          {tab === 'summary' && (
            <>
              <div className="bg-surface-container-lowest soft-shadow p-8 lg:p-10 border border-transparent hover:border-outline-variant/30 transition-all duration-300">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-8 border-b border-surface-variant pb-4">Order Details</h3>
                <div className="grid grid-cols-2 gap-y-8 gap-x-12">
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Vendor</p>
                    <p className="font-data-lg text-data-lg text-primary">Aura Textiles Ltd.</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Total Amount</p>
                    <p className="font-display-md text-display-md text-primary tracking-tight">{fmt(14550)}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Cost Center</p>
                    <p className="font-body-md text-body-md text-primary">Production (CC-892)</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Requested Delivery</p>
                    <p className="font-body-md text-body-md text-primary">{fmtDate('2023-11-15')}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Quotation Ref</p>
                    <p className="font-mono-data text-mono-data text-primary">Q-2024-892</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Payment Terms</p>
                    <p className="font-body-md text-body-md text-primary">Net 30</p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest soft-shadow p-8 lg:p-10 hover:border-outline-variant/30 transition-all duration-300 border border-transparent">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-6 border-b border-surface-variant pb-4">Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="font-label-caps text-label-caps text-on-surface-variant uppercase pb-4 font-normal tracking-wider w-1/2">Item Description</th>
                        <th className="font-label-caps text-label-caps text-on-surface-variant uppercase pb-4 font-normal tracking-wider text-right">Qty</th>
                        <th className="font-label-caps text-label-caps text-on-surface-variant uppercase pb-4 font-normal tracking-wider text-right">Unit Price</th>
                        <th className="font-label-caps text-label-caps text-on-surface-variant uppercase pb-4 font-normal tracking-wider text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono-data text-mono-data text-primary">
                      <tr className="border-t border-[#DCD7CE]/50 hover:bg-surface-container-low transition-colors duration-200">
                        <td className="py-4 px-2">Premium Silk Blend - Ivory</td>
                        <td className="py-4 px-2 text-right">150m</td>
                        <td className="py-4 px-2 text-right">{fmt(45)}</td>
                        <td className="py-4 px-2 text-right">{fmt(6750)}</td>
                      </tr>
                      <tr className="border-t border-[#DCD7CE]/50 hover:bg-surface-container-low transition-colors duration-200">
                        <td className="py-4 px-2">Linen Canvas - Natural</td>
                        <td className="py-4 px-2 text-right">200m</td>
                        <td className="py-4 px-2 text-right">{fmt(39)}</td>
                        <td className="py-4 px-2 text-right">{fmt(7800)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-surface-container-lowest soft-shadow p-8 lg:p-10 border border-surface-variant hover:border-outline-variant/50 transition-all duration-300">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Your Decision</h3>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">Review the details above before finalizing your decision. Remarks are required for rejection.</p>

                {status === 'pending' ? (
                  <>
                    <div className="mb-8 relative group">
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-[#DCD7CE] text-primary font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-primary transition-colors resize-none placeholder-on-surface-variant/50 group-hover:border-outline-variant outline-none"
                        id="remarks"
                        placeholder="Enter approval remarks (mandatory for rejection)…"
                        rows="3"
                      ></textarea>
                      <p className="font-mono-data text-mono-data text-on-surface-variant mt-2 flex items-center gap-2">
                        {confirm === 'reject' && !remarks.trim() ? (
                          <><span className="material-symbols-outlined text-error text-[14px]">error</span> Remarks required for rejection</>
                        ) : (
                          <><span className="material-symbols-outlined text-[14px]">info</span> {remarks.length} character(s) · visible to procurement</>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button onClick={() => open('approve')} className="flex-1 bg-primary text-white py-4 px-6 font-label-caps text-label-caps uppercase tracking-widest hover:bg-black transition-all duration-300 flex justify-center items-center gap-2 transform active:scale-[0.98]">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        Approve &amp; Release
                      </button>
                      <button onClick={() => open('reject')} className="flex-1 bg-transparent border border-outline text-primary py-4 px-6 font-label-caps text-label-caps uppercase tracking-widest hover:bg-[#EAE6DF] hover:border-primary transition-all duration-300 flex justify-center items-center gap-2 transform active:scale-[0.98]">
                        <span className="material-symbols-outlined text-[18px]">cancel</span>
                        Reject &amp; Return
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={`p-6 rounded-lg flex items-center gap-4 ${status === 'approved' ? 'bg-secondary-container/40' : 'bg-error-container/40'}`}>
                    <span className={`material-symbols-outlined text-[28px] ${status === 'approved' ? 'text-secondary' : 'text-error'}`}>
                      {status === 'approved' ? 'check_circle' : 'cancel'}
                    </span>
                    <div>
                      <p className="font-data-lg text-data-lg text-primary">
                        PO-2023-4921 {status === 'approved' ? 'Approved &amp; Released' : 'Rejected &amp; Returned'}
                      </p>
                      <p className="font-body-md text-sm text-on-surface-variant">Redirecting you back to the dashboard…</p>
                    </div>
                    {status === 'approved' && (
                      <button onClick={recall} className="ml-auto px-4 py-2 text-on-surface-variant hover:text-primary font-label-caps text-label-caps uppercase tracking-widest">
                        Recall
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'workflow' && (
            <div className="bg-surface-container-lowest soft-shadow p-8 lg:p-10 border border-transparent">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">Workflow State Machine</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">Visualize how this PO transitions through procurement, finance, and final release.</p>

              <div className="relative grid grid-cols-4 gap-2 mb-10">
                {STAGES.map((s, idx) => {
                  const state = stageState(idx);
                  const colors = {
                    done: 'bg-secondary-container text-secondary border-secondary',
                    active: 'bg-primary-container text-on-primary-container border-primary',
                    pending: 'bg-surface-container text-on-surface-variant border-outline-variant',
                    rejected: 'bg-error-container text-error border-error',
                  }[state];
                  return (
                    <div key={s.key} className="flex flex-col items-center text-center relative">
                      {idx < STAGES.length - 1 && (
                        <div className={`absolute top-7 left-[60%] w-[80%] h-0.5 ${stageState(idx + 1) === 'pending' ? 'bg-outline-variant' : state === 'rejected' ? 'bg-error' : 'bg-secondary'}`}></div>
                      )}
                      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center mb-3 relative z-10 ${colors}`}>
                        <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
                      </div>
                      <span className="font-label-caps text-label-caps uppercase tracking-widest text-xs">{s.label}</span>
                      <span className="font-mono-data text-mono-data text-on-surface-variant mt-1">
                        {state === 'done' ? 'Completed' : state === 'active' ? 'In progress' : state === 'rejected' ? 'Terminated' : 'Queued'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { from: 'Submitted', to: 'In Review', when: 'After creation', actor: 'Procurement → Department Head' },
                  { from: 'In Review', to: 'Decision', when: 'After departmental sign-off', actor: 'Department Head → Finance Director' },
                  { from: 'Decision', to: 'Released', when: 'After finance approval', actor: 'Finance Director → System auto-release' },
                  { from: 'Decision', to: 'Returned', when: 'On rejection', actor: 'Finance Director → Procurement' },
                ].map((t) => (
                  <div key={t.from + t.to} className="p-4 bg-surface-bright rounded border border-outline-variant/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{t.from}</span>
                      <span className="material-symbols-outlined text-on-surface-variant text-[16px]">arrow_forward</span>
                      <span className="font-label-caps text-label-caps text-primary uppercase">{t.to}</span>
                    </div>
                    <p className="font-mono-data text-mono-data text-on-surface-variant">{t.when}</p>
                    <p className="font-mono-data text-mono-data text-on-surface mt-1">{t.actor}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'timeline' && (
            <div className="bg-surface-container-lowest soft-shadow p-8 lg:p-10 border border-transparent">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Approval Timeline</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">Every action, decision, and remark recorded for audit.</p>
                </div>
                <span className="font-mono-data text-mono-data text-on-surface-variant">{timeline.length} event(s)</span>
              </div>

              <ol className="relative pl-6 space-y-6 border-l-2 border-outline-variant/40 ml-2">
                {timeline.map((e, i) => {
                  const dotColor = e.decision === 'approved' ? 'bg-secondary' : e.decision === 'rejected' ? 'bg-error' : e.decision === 'recall' ? 'bg-tertiary' : 'bg-primary';
                  return (
                    <li key={e.id} className="relative">
                      <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full ${dotColor} ring-4 ring-surface-container-lowest`}></div>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">{e.stage}</span>
                            <span className={`font-label-caps text-xs px-2 py-0.5 rounded uppercase tracking-widest ${
                              e.decision === 'approved' ? 'bg-secondary-container text-secondary'
                              : e.decision === 'rejected' ? 'bg-error-container text-error'
                              : e.decision === 'recall' ? 'bg-tertiary-container text-on-tertiary-container'
                              : 'bg-surface-container-high text-on-surface-variant'
                            }`}>{DECISION_LABEL[e.decision]}</span>
                          </div>
                          <p className="font-body-md text-body-md text-on-surface mt-1">{e.actor} · <span className="text-on-surface-variant">{e.role}</span></p>
                        </div>
                        <span className="font-mono-data text-mono-data text-on-surface-variant">{new Date(e.timestamp).toLocaleString()}</span>
                      </div>
                      {e.remarks && (
                        <p className="font-body-md text-sm text-on-surface-variant mt-2 italic border-l-2 border-outline-variant/30 pl-3">"{e.remarks}"</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface-bright soft-shadow p-8 sticky top-24 border border-transparent hover:border-outline-variant/30 transition-all duration-300">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-8 border-b border-surface-variant pb-4">Approval Chain</h3>

            <div className="relative pl-6 space-y-8 border-l border-surface-variant/50 ml-2">
              <div className="relative group cursor-default">
                <div className="absolute -left-[30px] top-1 w-3 h-3 bg-primary rounded-full border border-primary"></div>
                <p className="font-label-caps text-label-caps text-primary uppercase tracking-wider mb-1">Procurement Review</p>
                <p className="font-body-md text-body-md text-on-surface-variant">J. Smith</p>
                <p className="font-mono-data text-[11px] text-on-surface-variant/60 mt-1">Oct 24, 09:15 AM</p>
                <span className="inline-block mt-2 px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider bg-secondary-container text-secondary">Approved</span>
              </div>

              <div className="relative group cursor-default">
                <div className="absolute -left-[30px] top-1 w-3 h-3 bg-primary rounded-full border border-primary"></div>
                <p className="font-label-caps text-label-caps text-primary uppercase tracking-wider mb-1">Department Head</p>
                <p className="font-body-md text-body-md text-on-surface-variant">S. Miller</p>
                <p className="font-mono-data text-[11px] text-on-surface-variant/60 mt-1">Oct 24, 02:30 PM</p>
                <span className="inline-block mt-2 px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider bg-secondary-container text-secondary">Approved</span>
              </div>

              <div className="relative group cursor-default">
                <div className={`absolute -left-[34px] top-0 w-5 h-5 rounded-full flex items-center justify-center ${status === 'approved' ? 'bg-secondary-container' : status === 'rejected' ? 'bg-error-container' : 'bg-[#EAE6DF]'}`}>
                  <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-primary' : status === 'approved' ? 'bg-secondary' : 'bg-error'}`}></div>
                </div>
                <p className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-bold mb-1">Finance Director</p>
                <p className="font-body-md text-body-md text-primary font-medium">
                  {status === 'pending' && 'Pending Your Action'}
                  {status === 'approved' && 'Approved by You'}
                  {status === 'rejected' && 'Rejected by You'}
                </p>
                <span className={`inline-block mt-2 px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider ${
                  status === 'pending' ? 'bg-[#f0ebd8] text-[#8c7b3e]'
                  : status === 'approved' ? 'bg-secondary-container text-secondary'
                  : 'bg-error-container text-error'
                }`}>
                  {status === 'pending' ? 'Awaiting' : status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>

              <div className={`relative group cursor-default ${status === 'approved' ? 'opacity-100' : 'opacity-40'} hover:opacity-100 transition-opacity duration-200`}>
                <div className={`absolute -left-[30px] top-1 w-3 h-3 rounded-full border ${status === 'approved' ? 'bg-secondary border-secondary' : 'bg-transparent border-on-surface-variant'}`}></div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Final Release</p>
                <p className="font-body-md text-body-md text-on-surface-variant">System Auto</p>
                <p className="font-mono-data text-[11px] text-on-surface-variant/60 mt-1">{status === 'approved' ? 'Released to vendor' : 'Pending'}</p>
                {status === 'approved' && <span className="inline-block mt-2 px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider bg-secondary-container text-secondary">Released</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setConfirm(null)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={confirm === 'approve' ? 'Approve PO' : 'Reject PO'} className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${confirm === 'approve' ? 'bg-secondary-container text-secondary' : 'bg-error-container text-error'}`}>
                <span className="material-symbols-outlined">{confirm === 'approve' ? 'check_circle' : 'cancel'}</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">{confirm === 'approve' ? 'Approve PO-2023-4921?' : 'Reject PO-2023-4921?'}</h3>
                <p className="font-body-md text-sm text-on-surface-variant">
                  {confirm === 'approve'
                    ? 'This will release the PO for vendor fulfillment. You can still recall it from the audit log.'
                    : 'Procurement will be notified with your remarks. The PO will not be released.'}
                </p>
                {remarks.trim() && (
                  <div className="mt-3 p-3 bg-surface-bright rounded text-sm font-mono-data text-on-surface-variant italic">"{remarks}"</div>
                )}
                <div className="mt-4 p-3 bg-primary-container/10 rounded border border-primary-container/30 text-xs space-y-1">
                  <p className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Workflow transition</p>
                  <p className="font-mono-data text-on-surface-variant">Decision → {confirm === 'approve' ? 'Released' : 'Returned'}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirm(null)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button
                onClick={commit}
                className={`px-5 py-2.5 rounded-full font-label-caps text-label-caps transition-colors ${confirm === 'approve' ? 'bg-primary text-on-primary hover:bg-tertiary' : 'bg-error text-on-error hover:opacity-90'}`}
              >
                {confirm === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Approvals;
