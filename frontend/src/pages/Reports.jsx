import React from 'react';

const Reports = () => {
  return (
    <div className="container-page min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 stagger-1">
        <div className="max-w-2xl">
          <p className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase tracking-widest">Q3 Performance</p>
          <h2 className="font-display-lg text-display-lg text-on-background tracking-tight">Reports & Analytics</h2>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <button className="px-6 py-3 rounded-full bg-transparent text-primary font-label-caps text-label-caps hover:bg-surface-variant transition-colors flex items-center gap-2 group">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-y-0.5 transition-transform">download</span>
            Export CSV
          </button>
          <button className="px-6 py-3 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            Generate Report
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <div className="bg-surface-container-lowest rounded-xl luxury-shadow p-8 flex flex-col justify-between group cursor-default stagger-2 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
          <div className="flex justify-between items-start mb-12">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Total Spend</h3>
            <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors">account_balance_wallet</span>
          </div>
          <div>
            <div className="font-display-md text-display-md text-on-background mb-2">$14.2M</div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">trending_up</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">+8.4% vs last quarter</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl luxury-shadow p-8 flex flex-col justify-between group cursor-default stagger-3 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
          <div className="flex justify-between items-start mb-12">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Active Vendors</h3>
            <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors">storefront</span>
          </div>
          <div>
            <div className="font-display-md text-display-md text-on-background mb-2">342</div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-surface-tint text-[16px]">trending_flat</span>
              <span className="font-mono-data text-mono-data text-surface-tint">Stable allocation</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl luxury-shadow p-8 flex flex-col justify-between group cursor-default stagger-4 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
          <div className="flex justify-between items-start mb-12">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Open POs</h3>
            <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors">receipt_long</span>
          </div>
          <div>
            <div className="font-display-md text-display-md text-on-background mb-2">1,840</div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">trending_down</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">-2.1% clearance rate</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl luxury-shadow p-8 flex flex-col justify-between group cursor-default relative overflow-hidden stagger-5 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-12 relative z-10">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase">Cost Savings</h3>
            <span className="material-symbols-outlined text-surface-dim group-hover:text-primary transition-colors">savings</span>
          </div>
          <div className="relative z-10">
            <div className="font-display-md text-display-md text-on-background mb-2">$845K</div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">trending_up</span>
              <span className="font-mono-data text-mono-data text-on-surface-variant">+12.5% negotiation yield</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl luxury-shadow p-10 md:p-12 stagger-6 border border-outline-variant/10">
          <div className="flex justify-between items-end mb-12 border-b border-surface-variant pb-6">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">Procurement Allocation</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Distribution of spend across primary operational categories.</p>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">more_horiz</span>
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-data-lg text-data-lg text-on-background">Raw Materials</span>
                <span className="font-mono-data text-mono-data text-on-surface-variant">42%</span>
              </div>
              <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary rounded-full" style={{ width: "42%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-data-lg text-data-lg text-on-background">Logistics & Freight</span>
                <span className="font-mono-data text-mono-data text-on-surface-variant">28%</span>
              </div>
              <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary/80 rounded-full" style={{ width: "28%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-data-lg text-data-lg text-on-background">IT & Infrastructure</span>
                <span className="font-mono-data text-mono-data text-on-surface-variant">15%</span>
              </div>
              <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary/60 rounded-full" style={{ width: "15%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-data-lg text-data-lg text-on-background">Professional Services</span>
                <span className="font-mono-data text-mono-data text-on-surface-variant">10%</span>
              </div>
              <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary/40 rounded-full" style={{ width: "10%" }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-data-lg text-data-lg text-on-background">Marketing & Media</span>
                <span className="font-mono-data text-mono-data text-on-surface-variant">5%</span>
              </div>
              <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-secondary/20 rounded-full" style={{ width: "5%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl luxury-shadow p-10 md:p-12 flex flex-col stagger-7 border border-outline-variant/10">
          <div className="mb-12 border-b border-surface-variant pb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-background mb-2">Risk Matrix</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">Vendor exposure mapped by likelihood and operational impact.</p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="relative flex h-full">
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 origin-center whitespace-nowrap">
                <span className="font-label-caps text-label-caps text-surface-tint uppercase tracking-widest">Likelihood</span>
              </div>

              <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 aspect-square max-w-[400px] mx-auto w-full">
                <div className="bg-surface-variant/50 rounded-lg p-6 flex flex-col items-start justify-between group hover:bg-surface-variant transition-colors cursor-default">
                  <span className="font-label-caps text-label-caps text-on-surface-variant">Monitor</span>
                  <span className="font-display-md text-display-md text-on-background">18<span className="text-lg text-on-surface-variant">%</span></span>
                </div>

                <div className="bg-secondary-container rounded-lg p-6 flex flex-col items-start justify-between group hover:bg-secondary/20 transition-colors cursor-default">
                  <span className="font-label-caps text-label-caps text-on-secondary-container">Critical</span>
                  <span className="font-display-md text-display-md text-on-secondary-fixed">8<span className="text-lg opacity-70">%</span></span>
                </div>

                <div className="bg-surface-container-lowest border border-surface-variant rounded-lg p-6 flex flex-col items-start justify-between group hover:bg-surface-bright transition-colors cursor-default">
                  <span className="font-label-caps text-label-caps text-surface-tint">Stable</span>
                  <span className="font-display-md text-display-md text-surface-tint">62<span className="text-lg opacity-70">%</span></span>
                </div>

                <div className="bg-secondary-fixed/50 rounded-lg p-6 flex flex-col items-start justify-between group hover:bg-secondary-fixed transition-colors cursor-default">
                  <span className="font-label-caps text-label-caps text-on-secondary-fixed-variant">Watchlist</span>
                  <span className="font-display-md text-display-md text-on-background">12<span className="text-lg text-on-surface-variant">%</span></span>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <span className="font-label-caps text-label-caps text-surface-tint uppercase tracking-widest">Impact</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
