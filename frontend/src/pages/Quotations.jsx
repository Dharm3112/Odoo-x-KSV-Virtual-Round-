import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';
import { useFormatCurrency } from '../utils/format';

const QUOTES = [
  {
    id: 'q1', vendor: 'GlobalTech Materials', location: 'Shanghai, CN',
    total: 138200, lead: '28 Days', leadWarn: true, rating: 4.1,
    material: '95% Match. Slight variance in tensile tolerance.', terms: 'Net 30',
    optimal: true,
  },
  {
    id: 'q2', vendor: 'Apex Industries', location: 'Frankfurt, DE',
    total: 142500, lead: '14 Days', leadVerified: true, rating: 4.8, halfStar: true,
    material: '100% Match. Includes ISO 9001 certification docs.', terms: 'Net 45',
  },
  {
    id: 'q3', vendor: 'Nordic Steel Co.', location: 'Stockholm, SE',
    total: 151000, lead: '12 Days', rating: 4.9,
    material: '100% Match. Premium grade assurance provided.', terms: 'Net 60',
  },
];

const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center text-on-surface-variant gap-1">
      {[0,1,2,3,4].map((i) => (
        <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${i < full ? 1 : 0}` }}>star</span>
      ))}
      <span className="font-mono-data text-mono-data text-on-surface ml-2">{rating.toFixed(1)}</span>
    </div>
  );
};

const StarsAccent = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center text-tertiary gap-1">
      {[0,1,2,3,4].map((i) => (
        <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${i < full ? 1 : 0}` }}>star</span>
      ))}
      <span className="font-mono-data text-mono-data text-on-surface ml-2">{rating.toFixed(1)}</span>
    </div>
  );
};

const Quotations = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const fmt = useFormatCurrency();
  const [selected, setSelected] = useState(null);
  const [reviewQuote, setReviewQuote] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const onAward = () => setConfirm(true);
  const commitAward = () => {
    setConfirm(false);
    toast.success(`Contract awarded to ${QUOTES.find((q) => q.id === selected)?.vendor}. PO draft created.`);
    setTimeout(() => navigate('/purchase-orders'), 900);
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-32">
      <div className="px-8 md:px-asymmetric-offset pt-12 pb-8 flex items-start justify-between gap-6">
        <div>
          <p className="font-mono-data text-mono-data text-on-surface-variant uppercase tracking-widest mb-4">RFQ-2024-892 • High-Tensile Steel Cabling</p>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-6">Quotation Comparison</h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Review submitted vendor bids for precision and value alignment. The matrix highlights the optimal choice based on your weighted criteria scoring.</p>
        </div>
        <Link
          to="/vendor-quotation"
          className="shrink-0 px-6 py-4 bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase tracking-widest rounded-full shadow-[0_10px_30px_-10px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-300 flex items-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>rate_review</span>
          Submit a Quotation
        </Link>
      </div>

      <div className="relative w-full px-8 md:px-12 overflow-x-auto overflow-y-visible no-scrollbar pb-16 snap-x snap-mandatory">
        <div className="flex items-start min-w-max">
        <div className="w-[200px] flex-shrink-0 sticky left-0 z-20 bg-surface/90 backdrop-blur-sm py-6 pr-8 flex flex-col shadow-[10px_0_20px_-10px_rgba(0,0,0,0.02)] snap-start">
          <div className="h-[120px] mb-8"></div>
          <div className="h-20 flex items-center border-b border-outline-variant/30">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Total Landed Cost</span>
          </div>
          <div className="h-20 flex items-center border-b border-outline-variant/30">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Est. Lead Time</span>
          </div>
          <div className="h-20 flex items-center border-b border-outline-variant/30">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Vendor Rating</span>
          </div>
          <div className="h-24 flex items-center border-b border-outline-variant/30">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Material Spec. Adherence</span>
          </div>
          <div className="h-24 flex items-center">
            <span className="font-label-caps text-label-caps text-on-surface-variant">Payment Terms</span>
          </div>
        </div>

        <div className="flex gap-8 pl-8">
          {QUOTES.map((q) => (
            <div
              key={q.id}
              onClick={() => setSelected(q.id)}
              className={`w-[320px] flex-shrink-0 flex flex-col rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.02)] snap-center relative cursor-pointer transition-all ${
                selected === q.id
                  ? 'bg-primary-container/30 border-2 border-primary'
                  : q.optimal
                    ? 'bg-[#F5F5F0] border-2 border-secondary-fixed/40'
                    : 'bg-surface-bright border border-transparent'
              }`}
            >
              {q.optimal && (
                <div className="absolute -top-3 left-6 bg-tertiary text-on-tertiary font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm z-10">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  Optimal Choice
                </div>
              )}
              <div className="relative z-10">
                <div className="h-[120px] mb-8 flex flex-col justify-end border-b border-outline-variant/20 pb-4">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{q.vendor}</h3>
                  <p className="font-mono-data text-mono-data text-on-surface-variant">{q.location}</p>
                </div>
                <div className="h-20 flex items-center border-b border-outline-variant/20">
                  <span className="font-data-lg text-data-lg text-on-surface">{fmt(q.total)}</span>
                </div>
                <div className="h-20 flex items-center border-b border-outline-variant/20">
                  <span className={`font-data-lg text-data-lg ${q.leadWarn ? 'text-error' : 'text-on-surface'}`}>{q.lead}</span>
                  {q.leadVerified && <span className="material-symbols-outlined text-secondary ml-2 text-[18px]">verified</span>}
                </div>
                <div className="h-20 flex items-center border-b border-outline-variant/20">
                  {q.vendor === 'Apex Industries' ? <StarsAccent rating={q.rating} /> : <Stars rating={q.rating} />}
                </div>
                <div className="h-24 flex items-center border-b border-outline-variant/20">
                  <p className="font-body-md text-body-md text-on-surface">{q.material}</p>
                </div>
                <div className="h-24 flex items-center justify-between">
                  <p className="font-body-md text-body-md text-on-surface">{q.terms}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setReviewQuote(q); }}
                    className="px-4 py-2 rounded-full bg-surface-container-lowest text-primary font-mono-data text-mono-data hover:bg-primary hover:text-on-primary transition-colors border border-outline-variant/30"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-30 mt-12 -mx-8 px-8 py-6 bg-surface/80 backdrop-blur-md border-t border-outline-variant/20 flex justify-end">
        <button
          onClick={onAward}
          disabled={!selected}
          className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-10 py-4 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-300 flex items-center gap-3 border border-outline/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>task_alt</span>
          {selected ? `Award Contract — ${QUOTES.find((q) => q.id === selected)?.vendor}` : 'Award Contract'}
        </button>
      </div>

      {confirm && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setConfirm(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Award contract" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">task_alt</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Award contract to {QUOTES.find((q) => q.id === selected)?.vendor}?</h3>
                <p className="font-body-md text-sm text-on-surface-variant">A draft purchase order will be created and queued for approval. Other vendors will be notified of the decision.</p>
                <div className="mt-4 p-4 bg-surface-bright rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">Total Landed Cost</span>
                    <span className="font-mono-data text-primary font-medium">{fmt(QUOTES.find((q) => q.id === selected)?.total || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">Payment Terms</span>
                    <span className="font-mono-data text-primary font-medium">{QUOTES.find((q) => q.id === selected)?.terms}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirm(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button onClick={commitAward} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">Award contract</button>
            </div>
          </div>
        </div>
      )}

      {reviewQuote && (
        <ReviewQuoteModal
          quote={reviewQuote}
          onClose={() => setReviewQuote(null)}
          onSelectForAward={() => { setReviewQuote(null); setSelected(reviewQuote.id); toast.info(`${reviewQuote.vendor} selected.`); }}
          fmt={fmt}
        />
      )}
    </div>
  );
};

const ReviewQuoteModal = ({ quote, onClose, onSelectForAward, fmt }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Review quotation" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="font-mono-data text-mono-data text-on-surface-variant uppercase tracking-widest mb-1">RFQ-2024-892</p>
            <h3 className="font-headline-sm text-headline-sm text-primary">{quote.vendor}</h3>
            <p className="font-mono-data text-mono-data text-on-surface-variant mt-1">{quote.location}</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-bright" aria-label="Close review">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 p-6 bg-surface-bright rounded-lg">
          <div>
            <dt className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Landed cost</dt>
            <dd className="font-data-lg text-data-lg text-primary">{fmt(quote.total)}</dd>
          </div>
          <div>
            <dt className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Lead time</dt>
            <dd className="font-data-lg text-data-lg text-primary">{quote.lead}</dd>
          </div>
          <div>
            <dt className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Vendor rating</dt>
            <dd className="font-data-lg text-data-lg text-primary">{quote.rating.toFixed(1)} / 5</dd>
          </div>
          <div>
            <dt className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Payment terms</dt>
            <dd className="font-data-lg text-data-lg text-primary">{quote.terms}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Material spec.</p>
          <p className="font-body-md text-body-md text-on-surface">{quote.material}</p>
        </div>

        <div className="mt-6 p-4 bg-primary-container/10 rounded-lg border border-primary-container/20">
          <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">Want to respond to this RFQ as a vendor?</p>
          <Link
            to="/vendor-quotation"
            className="inline-flex items-center gap-2 font-label-caps text-label-caps text-primary hover:text-tertiary transition-colors"
          >
            Open the Vendor Quotation submission page
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Close</button>
          <button
            onClick={onSelectForAward}
            className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors"
          >
            Select for award
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quotations;
