import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';
import { useFormatCurrency, useFormatDate } from '../utils/format';

const Approvals = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fmt = useFormatCurrency();
  const fmtDate = useFormatDate();
  const [remarks, setRemarks] = useState('');
  const [confirm, setConfirm] = useState(null); // 'approve' | 'reject' | null
  const [status, setStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'

  const open = (kind) => {
    if (kind === 'reject' && !remarks.trim()) {
      toast.error('Remarks are required to reject this PO.');
      return;
    }
    setConfirm(kind);
  };

  const commit = () => {
    if (confirm === 'approve') {
      setStatus('approved');
      toast.success('PO-2023-4921 approved. Vendor has been notified.');
    } else if (confirm === 'reject') {
      setStatus('rejected');
      toast.error('PO-2023-4921 rejected. Procurement has been notified.');
    }
    setConfirm(null);
    setTimeout(() => navigate('/dashboard'), 1200);
  };

  return (
    <div className="container-page">
      <div className="mb-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/dashboard" className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors" aria-label="Back to dashboard">
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-caps text-label-caps tracking-widest uppercase">Pending Approval</span>
          </Link>
        </div>
        <h2 className="font-display-lg text-display-lg text-primary font-normal mb-2 tracking-tight">PO-2023-4921</h2>
        <p className="font-mono-data text-mono-data text-on-surface-variant">Submitted on Oct 24, 2023 by J. Smith (Procurement)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl">
        <div className="lg:col-span-8 space-y-8">
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
                    placeholder="Enter approval remarks (mandatory for rejection)..."
                    rows="3"
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => open('approve')} disabled={status !== 'pending'} className="flex-1 bg-primary text-white py-4 px-6 font-label-caps text-label-caps uppercase tracking-widest hover:bg-black transition-all duration-300 flex justify-center items-center gap-2 transform active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Approve
                  </button>
                  <button onClick={() => open('reject')} disabled={status !== 'pending'} className="flex-1 bg-transparent border border-outline text-primary py-4 px-6 font-label-caps text-label-caps uppercase tracking-widest hover:bg-[#EAE6DF] hover:border-primary transition-all duration-300 flex justify-center items-center gap-2 transform active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Reject
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
                    {status === 'approved' ? 'PO-2023-4921 Approved' : 'PO-2023-4921 Rejected'}
                  </p>
                  <p className="font-body-md text-sm text-on-surface-variant">Redirecting you back to the dashboard…</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-surface-bright soft-shadow p-8 sticky top-24 border border-transparent hover:border-outline-variant/30 transition-all duration-300">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-8 border-b border-surface-variant pb-4">Approval Chain</h3>

            <div className="relative pl-6 space-y-8 border-l border-surface-variant/50 ml-2">
              <div className="relative group cursor-default">
                <div className="absolute -left-[30px] top-1 w-3 h-3 bg-primary rounded-full border border-primary group-hover:scale-110 transition-transform duration-200"></div>
                <p className="font-label-caps text-label-caps text-primary uppercase tracking-wider mb-1 group-hover:text-black transition-colors">Procurement Review</p>
                <p className="font-body-md text-body-md text-on-surface-variant">J. Smith</p>
                <p className="font-mono-data text-[11px] text-on-surface-variant/60 mt-1">Oct 24, 09:15 AM</p>
              </div>

              <div className="relative group cursor-default">
                <div className="absolute -left-[30px] top-1 w-3 h-3 bg-primary rounded-full border border-primary group-hover:scale-110 transition-transform duration-200"></div>
                <p className="font-label-caps text-label-caps text-primary uppercase tracking-wider mb-1 group-hover:text-black transition-colors">Department Head</p>
                <p className="font-body-md text-body-md text-on-surface-variant">S. Miller</p>
                <p className="font-mono-data text-[11px] text-on-surface-variant/60 mt-1">Oct 24, 02:30 PM</p>
              </div>

              <div className="relative group cursor-default">
                <div className={`absolute -left-[34px] top-0 w-5 h-5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 ${status === 'approved' ? 'bg-secondary-container' : status === 'rejected' ? 'bg-error-container' : 'bg-[#EAE6DF]'}`}>
                  <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-primary' : status === 'approved' ? 'bg-secondary' : 'bg-error'}`}></div>
                </div>
                <p className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-bold mb-1">Finance Director</p>
                <p className="font-body-md text-body-md text-primary font-medium">
                  {status === 'pending' && 'Pending Your Action'}
                  {status === 'approved' && 'Approved by You'}
                  {status === 'rejected' && 'Rejected by You'}
                </p>
                <span className={`inline-block mt-2 px-2 py-1 font-label-caps text-[10px] uppercase tracking-wider transition-colors ${
                  status === 'pending' ? 'bg-[#f0ebd8] text-[#8c7b3e] group-hover:bg-[#e6ddc1]'
                  : status === 'approved' ? 'bg-secondary-container text-secondary'
                  : 'bg-error-container text-error'
                }`}>
                  {status === 'pending' ? 'Awaiting' : status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>

              <div className="relative opacity-40 group hover:opacity-60 transition-opacity duration-200 cursor-default">
                <div className="absolute -left-[30px] top-1 w-3 h-3 bg-transparent rounded-full border border-on-surface-variant"></div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Final Release</p>
                <p className="font-body-md text-body-md text-on-surface-variant">System Auto</p>
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
                {confirm === 'reject' && remarks.trim() && (
                  <div className="mt-3 p-3 bg-surface-bright rounded text-sm font-mono-data text-on-surface-variant italic">"{remarks}"</div>
                )}
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
