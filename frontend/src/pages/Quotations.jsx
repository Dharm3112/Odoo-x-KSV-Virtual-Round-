import React from 'react';

const Quotations = () => {
  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pb-32">
      <div className="px-8 md:px-asymmetric-offset pt-12 pb-8">
        <p className="font-mono-data text-mono-data text-on-surface-variant uppercase tracking-widest mb-4">RFQ-2024-892 • High-Tensile Steel Cabling</p>
        <h2 className="font-display-lg text-display-lg text-on-surface mb-6">Quotation Comparison</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Review submitted vendor bids for precision and value alignment. The matrix highlights the optimal choice based on your weighted criteria scoring.</p>
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
          <div className="w-[320px] flex-shrink-0 flex flex-col bg-[#F5F5F0] rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.02)] border-2 border-secondary-fixed/40 snap-center relative">
            <div className="absolute -top-3 left-6 bg-tertiary text-on-tertiary font-label-caps text-label-caps px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm z-10">
              <span className="material-symbols-outlined text-[14px]">star</span>
              Optimal Choice
            </div>
            <div className="relative z-10">
              <div className="h-[120px] mb-8 flex flex-col justify-end border-b border-outline-variant/20 pb-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">GlobalTech Materials</h3>
                <p className="font-mono-data text-mono-data text-on-surface-variant">Shanghai, CN</p>
              </div>
              <div className="h-20 flex items-center border-b border-outline-variant/20">
                <span className="font-data-lg text-data-lg text-on-surface">$138,200.00</span>
              </div>
              <div className="h-20 flex items-center border-b border-outline-variant/20">
                <span className="font-data-lg text-data-lg text-on-surface text-error">28 Days</span>
              </div>
              <div className="h-20 flex items-center border-b border-outline-variant/20">
                <div className="flex items-center text-on-surface-variant gap-1">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined">star</span>
                  <span className="font-mono-data text-mono-data text-on-surface ml-2">4.1</span>
                </div>
              </div>
              <div className="h-24 flex items-center border-b border-outline-variant/20">
                <p className="font-body-md text-body-md text-on-surface">95% Match. Slight variance in tensile tolerance.</p>
              </div>
              <div className="h-24 flex items-center">
                <p className="font-body-md text-body-md text-on-surface">Net 30</p>
              </div>
            </div>
          </div>

          <div className="w-[320px] flex-shrink-0 flex flex-col bg-surface-bright rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.02)] border border-transparent snap-center relative">
            <div className="h-[120px] mb-8 flex flex-col justify-end border-b border-outline-variant/30 pb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Apex Industries</h3>
              <p className="font-mono-data text-mono-data text-on-surface-variant">Frankfurt, DE</p>
            </div>
            <div className="h-20 flex items-center border-b border-outline-variant/30">
              <span className="font-data-lg text-data-lg text-on-surface">$142,500.00</span>
            </div>
            <div className="h-20 flex items-center border-b border-outline-variant/30">
              <span className="font-data-lg text-data-lg text-on-surface">14 Days</span>
              <span className="material-symbols-outlined text-secondary ml-2 text-[18px]">verified</span>
            </div>
            <div className="h-20 flex items-center border-b border-outline-variant/30">
              <div className="flex items-center text-tertiary gap-1">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0.5" }}>star_half</span>
                <span className="font-mono-data text-mono-data text-on-surface ml-2">4.8</span>
              </div>
            </div>
            <div className="h-24 flex items-center border-b border-outline-variant/30">
              <p className="font-body-md text-body-md text-on-surface">100% Match. Includes ISO 9001 certification docs.</p>
            </div>
            <div className="h-24 flex items-center">
              <p className="font-body-md text-body-md text-on-surface">Net 45</p>
            </div>
          </div>

          <div className="w-[320px] flex-shrink-0 flex flex-col bg-surface-bright rounded-2xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.02)] border border-transparent snap-center">
            <div className="h-[120px] mb-8 flex flex-col justify-end border-b border-outline-variant/20 pb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Nordic Steel Co.</h3>
              <p className="font-mono-data text-mono-data text-on-surface-variant">Stockholm, SE</p>
            </div>
            <div className="h-20 flex items-center border-b border-outline-variant/20">
              <span className="font-data-lg text-data-lg text-on-surface">$151,000.00</span>
            </div>
            <div className="h-20 flex items-center border-b border-outline-variant/20">
              <span className="font-data-lg text-data-lg text-on-surface">12 Days</span>
            </div>
            <div className="h-20 flex items-center border-b border-outline-variant/20">
              <div className="flex items-center text-on-surface-variant gap-1">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-mono-data text-mono-data text-on-surface ml-2">4.9</span>
              </div>
            </div>
            <div className="h-24 flex items-center border-b border-outline-variant/20">
              <p className="font-body-md text-body-md text-on-surface">100% Match. Premium grade assurance provided.</p>
            </div>
            <div className="h-24 flex items-center">
              <p className="font-body-md text-body-md text-on-surface">Net 60</p>
            </div>
          </div>
        </div>
        </div>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-30 mt-12 -mx-8 px-8 py-6 bg-surface/80 backdrop-blur-md border-t border-outline-variant/20 flex justify-end">
        <button className="bg-primary-container text-on-primary-container font-label-caps text-label-caps px-10 py-4 rounded-full shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] hover:scale-105 transition-transform duration-300 flex items-center gap-3 border border-outline/20">
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>task_alt</span>
          Award Contract
        </button>
      </div>
    </div>
  );
};

export default Quotations;
