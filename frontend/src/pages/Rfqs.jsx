import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/useToasts.jsx';

const Rfqs = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [continueOpen, setContinueOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', quantity: '', deadline: '', vendors: '' });

  const onContinue = () => {
    if (!form.title.trim()) {
      toast.error('Please enter a request title before continuing.');
      return;
    }
    setContinueOpen(true);
  };

  const commitContinue = () => {
    setContinueOpen(false);
    toast.success(`Request "${form.title}" saved. Routing to vendor assignment.`);
    setTimeout(() => navigate('/vendors'), 600);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-surface-bright">
      <div className="container-page max-w-[1100px] transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
        <div className="mb-20 flex flex-col gap-10">
          <h2 className="font-display-lg text-display-lg text-on-surface tracking-tight">Initiate Quotation Request</h2>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-secondary-fixed border border-secondary-fixed flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary-container"></div>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-[0.15em]">Details</span>
            </div>
            <div className="h-[1px] w-24 bg-surface-container-highest"></div>

            <div className="flex items-center gap-4 opacity-60">
              <div className="w-4 h-4 rounded-full border-2 border-secondary-fixed box-border bg-transparent"></div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.15em]">Vendors</span>
            </div>
            <div className="h-[1px] w-24 bg-surface-container-highest"></div>

            <div className="flex items-center gap-4 opacity-60">
              <div className="w-4 h-4 rounded-full border-2 border-secondary-fixed box-border bg-transparent"></div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.15em]">Review</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="col-span-1 md:col-span-7 bg-surface-container-lowest p-12 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)] flex flex-col gap-12">
            <div className="flex flex-col group">
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Request Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                placeholder="e.g. Q3 Packaging Materials Procurement"
                type="text"
              />
            </div>

            <div className="flex flex-col group">
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Product Specifications & Details</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all resize-none"
                placeholder="Describe the materials, grade, compliance requirements..."
                rows="5"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col group">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Estimated Quantity</label>
                <input
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-data-lg text-data-lg text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all font-mono"
                  placeholder="0"
                  type="number"
                />
              </div>

              <div className="flex flex-col group">
                <label className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Submission Deadline</label>
                <input
                  value={form.deadline}
                  onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
                  className="w-full border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all text-on-surface-variant"
                  type="date"
                />
              </div>
            </div>

            <div className="flex flex-col group border-t border-outline-variant pt-8 mt-2 border-opacity-50">
              <label className="font-label-caps text-label-caps text-on-surface-variant mb-3 uppercase tracking-widest transition-colors group-focus-within:text-primary-container">Vendor Assignment (Optional)</label>
              <div className="flex items-center gap-4">
                <input
                  value={form.vendors}
                  onChange={(e) => setForm((f) => ({ ...f, vendors: e.target.value }))}
                  className="flex-1 border border-outline-variant rounded px-4 py-4 bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline-variant focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                  placeholder="Search and assign vendors..."
                  type="text"
                />
                <button
                  onClick={() => toast.info('Vendor browser opened.')}
                  className="px-6 py-4 border border-outline-variant rounded text-on-surface-variant hover:bg-surface-container-low transition-colors font-label-caps text-label-caps uppercase tracking-widest"
                >
                  Browse
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1 md:col-span-5 flex flex-col justify-between">
            <div className="flex flex-col h-full bg-surface-container-lowest p-10 rounded-xl border border-surface-container-low shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-8 font-serif">Supporting Documents</h3>
              <div className="flex-1 bg-surface-bright border border-dashed border-outline-variant hover:border-primary-container hover:bg-surface-container-low transition-colors duration-300 rounded-xl flex flex-col items-center justify-center p-10 text-center cursor-pointer group">
                <div className="w-20 h-20 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center mb-6 group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "32px", fontWeight: "300" }}>cloud_upload</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mb-3 font-medium">Drag and drop files here</p>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest opacity-70">or click to browse</p>

                <div className="mt-10 pt-6 border-t border-outline-variant border-opacity-30 w-full flex flex-col gap-3">
                  <div className="flex items-center justify-between text-mono-data font-mono-data text-on-surface-variant bg-surface-container p-3 rounded">
                    <span className="truncate max-w-[200px]">technical_specs_v2.pdf</span>
                    <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-error transition-colors">close</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-6 mt-16">
              <button
                onClick={() => setCancelOpen(true)}
                className="px-8 py-4 font-label-caps text-label-caps uppercase tracking-widest text-on-surface hover:text-primary transition-colors duration-200 opacity-70 hover:opacity-100"
              >
                  Cancel
              </button>
              <button
                onClick={onContinue}
                className="px-10 py-5 font-label-caps text-label-caps uppercase tracking-widest bg-primary-container text-on-primary rounded hover:bg-tertiary transition-all duration-300 flex items-center gap-3 transform hover:-translate-y-1 hover:shadow-lg"
              >
                  Continue to Vendors
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {cancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setCancelOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Cancel RFQ" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">close</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Discard this RFQ draft?</h3>
                <p className="font-body-md text-sm text-on-surface-variant">All entered details will be lost. This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setCancelOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Keep editing</button>
              <button
                onClick={() => { setCancelOpen(false); toast.info('Draft discarded.'); navigate('/dashboard'); }}
                className="px-5 py-2.5 rounded-full bg-error text-on-error font-label-caps text-label-caps hover:opacity-90 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {continueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setContinueOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Continue to vendors" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Save and continue?</h3>
                <p className="font-body-md text-sm text-on-surface-variant">Your draft will be saved and you'll be taken to vendor assignment.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setContinueOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Stay here</button>
              <button onClick={commitContinue} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rfqs;
