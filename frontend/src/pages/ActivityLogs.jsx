import React from 'react';

const ActivityLogs = () => {
  return (
    <div className="flex-1 pl-6 pr-6 md:pl-asymmetric-offset md:pr-16 max-w-[1440px] pt-12 md:pt-24 pb-32">
      <div className="mb-16">
        <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-4 tracking-tight">System Activity</h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">A comprehensive, real-time audit log of all logistical events, approvals, and system changes across VendorBridge Master.</p>
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-16 border-b border-outline-variant pb-1">
        <button className="font-data-lg text-data-lg text-primary border-b-[1.5px] border-primary pb-3 px-1 -mb-[1.5px]">All Events</button>
        <button className="font-data-lg text-data-lg text-on-surface-variant hover:text-primary transition-colors pb-3 px-1">Approval Required <span className="ml-2 bg-error-container text-on-error-container text-[11px] px-2 py-0.5 rounded-full relative -top-0.5">3</span></button>
        <button className="font-data-lg text-data-lg text-on-surface-variant hover:text-primary transition-colors pb-3 px-1">RFQ Updates</button>
        <button className="font-data-lg text-data-lg text-on-surface-variant hover:text-primary transition-colors pb-3 px-1">Invoice Processed</button>
        <button className="font-data-lg text-data-lg text-on-surface-variant hover:text-primary transition-colors pb-3 px-1">System Audit</button>
        
        <div className="flex-1 min-w-[20px]"></div>
        
        <div className="flex items-center gap-3 mb-3">
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-mono-data text-mono-data border border-outline-variant px-4 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            Last 7 Days
          </button>
          <button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-mono-data text-mono-data border border-outline-variant px-4 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="relative max-w-[900px]">
        <div className="absolute left-[100px] top-4 bottom-12 w-px bg-surface-variant hidden md:block"></div>

        <div className="relative flex flex-col md:flex-row items-start mb-16 group stagger-1">
          <div className="md:w-[100px] md:text-right md:pr-8 pt-1 mb-4 md:mb-0 shrink-0">
            <div className="font-mono-data text-mono-data text-primary">10:42 AM</div>
            <div className="font-mono-data text-[11px] text-on-surface-variant mt-1">Today</div>
          </div>
          <div className="hidden md:block absolute left-[96.5px] top-[10px] w-2 h-2 rounded-full bg-error ring-4 ring-background z-10 transition-transform group-hover:scale-125"></div>
          
          <div className="flex-1 bg-surface-container-lowest p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] rounded-sm border border-transparent hover:border-outline-variant/30 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-label-caps text-error bg-error-container/30 px-3 py-1 rounded-sm tracking-wider">Approval Required</span>
              <span className="material-symbols-outlined text-outline-variant text-[18px]">more_horiz</span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-2">RFQ #10492 Exceeds Threshold</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Vendor 'Lumina Textiles' submitted a quotation that is 14% above the pre-approved budget limit for Q3 synthetics.</p>
            
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-outline-variant/30">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-on-primary font-mono-data text-[10px]">SJ</div>
              <span className="font-mono-data text-mono-data text-on-surface-variant flex-1">Assigned to: Sarah Jenkins</span>
              <button className="bg-primary-container text-on-primary font-mono-data text-mono-data px-6 py-2 rounded-sm hover:bg-primary transition-colors">Review</button>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col md:flex-row items-start mb-16 group stagger-2">
          <div className="md:w-[100px] md:text-right md:pr-8 pt-1 mb-4 md:mb-0 shrink-0">
            <div className="font-mono-data text-mono-data text-on-surface-variant">08:15 AM</div>
            <div className="font-mono-data text-[11px] text-on-surface-variant mt-1">Today</div>
          </div>
          <div className="hidden md:block absolute left-[96.5px] top-[10px] w-2 h-2 rounded-full bg-surface-tint ring-4 ring-background z-10 transition-transform group-hover:scale-125"></div>
          
          <div className="flex-1 bg-surface-bright p-8 border border-outline-variant/20 rounded-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-label-caps text-surface-tint tracking-wider">Invoice Processed</span>
            </div>
            <h3 className="font-headline-sm text-[20px] text-primary mb-2">Payment Cleared: Global Logistics Inc.</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">Invoice INV-2023-884 for October freight forwarding services has been automatically processed and settled via ACH.</p>
            <div className="inline-flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">receipt_long</span>
              <span className="font-mono-data text-mono-data text-primary font-medium">$42,500.00 USD</span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col md:flex-row items-start mb-16 group stagger-3">
          <div className="md:w-[100px] md:text-right md:pr-8 pt-1 mb-4 md:mb-0 shrink-0">
            <div className="font-mono-data text-mono-data text-on-surface-variant">14:30 PM</div>
            <div className="font-mono-data text-[11px] text-on-surface-variant mt-1">Yesterday</div>
          </div>
          <div className="hidden md:block absolute left-[96.5px] top-[10px] w-2 h-2 rounded-full border-2 border-outline-variant bg-background ring-4 ring-background z-10 transition-transform group-hover:scale-125"></div>
          
          <div className="flex-1 bg-surface-bright p-8 border border-outline-variant/20 rounded-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider">RFQ Update</span>
            </div>
            <h3 className="font-headline-sm text-[20px] text-primary mb-2">New Bid Submitted</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Nexus Materials has submitted a preliminary bid for RFQ #10495 (Raw Aluminum). The bid is currently under automated compliance review.</p>
          </div>
        </div>

        <div className="relative flex flex-col md:flex-row items-start group stagger-4">
          <div className="md:w-[100px] md:text-right md:pr-8 pt-1 mb-4 md:mb-0 shrink-0 opacity-60">
            <div className="font-mono-data text-mono-data text-on-surface-variant">02:00 AM</div>
            <div className="font-mono-data text-[11px] text-on-surface-variant mt-1">Yesterday</div>
          </div>
          <div className="hidden md:block absolute left-[96.5px] top-[10px] w-2 h-2 rounded-full bg-outline-variant ring-4 ring-background z-10 opacity-50"></div>
          
          <div className="flex-1 py-4 flex items-start gap-4 opacity-70">
            <span className="material-symbols-outlined text-outline-variant">memory</span>
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant block mb-1">System Audit</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">Automated database backup and integrity check completed successfully. 0 anomalies detected.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-[900px] flex justify-center md:pl-[100px]">
        <button className="font-mono-data text-mono-data text-on-surface-variant hover:text-primary transition-colors border-b border-transparent hover:border-primary pb-1">Load Older Events</button>
      </div>
    </div>
  );
};

export default ActivityLogs;
