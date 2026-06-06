import React from 'react';

const Approvals = () => {
  return (
    <div className="flex-1 px-6 md:px-12 lg:px-24 py-12 pb-32">
      <div className="mb-12 max-w-4xl">
        <div className="flex items-center gap-3 mb-4">
          <span className="material-symbols-outlined text-primary text-[20px] cursor-pointer hover:opacity-70 transition-opacity">arrow_back</span>
          <span className="font-label-caps text-label-caps text-on-surface-variant tracking-widest uppercase">Pending Approval</span>
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
                <p className="font-display-md text-display-md text-primary tracking-tight">$14,550.00</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Cost Center</p>
                <p className="font-body-md text-body-md text-primary">Production (CC-892)</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Requested Delivery</p>
                <p className="font-body-md text-body-md text-primary">Nov 15, 2023</p>
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
                    <td className="py-4 px-2 text-right">$45.00</td>
                    <td className="py-4 px-2 text-right">$6,750.00</td>
                  </tr>
                  <tr className="border-t border-[#DCD7CE]/50 hover:bg-surface-container-low transition-colors duration-200">
                    <td className="py-4 px-2">Linen Canvas - Natural</td>
                    <td className="py-4 px-2 text-right">200m</td>
                    <td className="py-4 px-2 text-right">$39.00</td>
                    <td className="py-4 px-2 text-right">$7,800.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-container-lowest soft-shadow p-8 lg:p-10 border border-surface-variant hover:border-outline-variant/50 transition-all duration-300">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Your Decision</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Review the details above before finalizing your decision. Remarks are required for rejection.</p>
            
            <div className="mb-8 relative group">
              <textarea className="w-full bg-transparent border-0 border-b border-[#DCD7CE] text-primary font-body-md text-body-md py-3 px-0 focus:ring-0 focus:border-primary transition-colors resize-none placeholder-on-surface-variant/50 group-hover:border-outline-variant outline-none" id="remarks" placeholder="Enter approval remarks (mandatory for rejection)..." required rows="3"></textarea>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 bg-primary text-white py-4 px-6 font-label-caps text-label-caps uppercase tracking-widest hover:bg-black transition-all duration-300 flex justify-center items-center gap-2 transform active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Approve
              </button>
              <button className="flex-1 bg-transparent border border-outline text-primary py-4 px-6 font-label-caps text-label-caps uppercase tracking-widest hover:bg-[#EAE6DF] hover:border-primary transition-all duration-300 flex justify-center items-center gap-2 transform active:scale-[0.98]">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                Reject
              </button>
            </div>
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
                <div className="absolute -left-[34px] top-0 w-5 h-5 bg-[#EAE6DF] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <p className="font-label-caps text-label-caps text-primary uppercase tracking-wider font-bold mb-1">Finance Director</p>
                <p className="font-body-md text-body-md text-primary font-medium">Pending Your Action</p>
                <span className="inline-block mt-2 px-2 py-1 bg-[#f0ebd8] text-[#8c7b3e] font-label-caps text-[10px] uppercase tracking-wider group-hover:bg-[#e6ddc1] transition-colors">Awaiting</span>
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
    </div>
  );
};

export default Approvals;
