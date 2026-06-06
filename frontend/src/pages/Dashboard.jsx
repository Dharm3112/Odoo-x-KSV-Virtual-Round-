import React from 'react';
import { useFormatCurrency } from '../utils/format';

const Dashboard = () => {
  const fmt = useFormatCurrency();
  return (
    <div className="container-page">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-element-gap mb-20">
        <div className="flex flex-col gap-4 group cursor-default animate-fade-in-up delay-100">
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-primary tracking-tighter">12</span>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[20px]">arrow_forward</span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2 inline-block w-3/4">Pending Approvals</span>
        </div>
        <div className="flex flex-col gap-4 group cursor-default mt-8 animate-fade-in-up delay-200">
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-primary tracking-tighter">8</span>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[20px]">arrow_forward</span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2 inline-block w-3/4">Active RFQs</span>
        </div>
        <div className="flex flex-col gap-4 group cursor-default animate-fade-in-up delay-300">
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-primary tracking-tighter">45</span>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[20px]">arrow_forward</span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2 inline-block w-3/4">Recent POs</span>
        </div>
        <div className="flex flex-col gap-4 group cursor-default mt-8 animate-fade-in-up delay-400">
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-primary tracking-tighter">128</span>
            <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[20px]">arrow_forward</span>
          </div>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30 pb-2 inline-block w-3/4">Recent Invoices</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-8 bg-surface-container-lowest soft-shadow rounded-xl p-10 flex flex-col relative overflow-hidden animate-fade-in-up delay-500">
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Spending Trends</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Q3 Corporate Output vs Projection</p>
            </div>
            <div className="flex gap-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed inline-block"></span> Actual
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-2">
                <span className="w-2 h-2 rounded-full border border-outline inline-block"></span> Projection
              </span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px] relative w-full mt-auto">
            <svg className="w-full h-full preserve-aspect-ratio-none overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 300">
              <line stroke="#f0f1f1" strokeWidth="1" x1="0" x2="800" y1="50" y2="50"></line>
              <line stroke="#f0f1f1" strokeWidth="1" x1="0" x2="800" y1="150" y2="150"></line>
              <line stroke="#f0f1f1" strokeWidth="1" x1="0" x2="800" y1="250" y2="250"></line>
              <path d="M 0 250 L 0 200 Q 100 220 200 150 T 400 100 T 600 180 T 800 80 L 800 250 Z" fill="#e7e2d9" opacity="0.6"></path>
              <path className="chart-path" d="M 0 200 Q 100 220 200 150 T 400 100 T 600 180 T 800 80" fill="none" stroke="#615e57" strokeWidth="2"></path>
              <path d="M 0 180 Q 200 190 400 150 T 800 100" fill="none" stroke="#c4c7c7" strokeDasharray="6 6" strokeWidth="1.5"></path>
            </svg>
            <div className="absolute bottom-[-30px] left-0 w-full flex justify-between text-mono-data font-mono-data text-outline">
              <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 pl-8 lg:border-l border-outline-variant/30 relative animate-fade-in-up delay-600">
          <div className="mb-10 flex justify-between items-center">
            <h3 className="font-headline-sm text-headline-sm text-primary">Recent Activity</h3>
            <button className="text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>
          </div>
          <div className="relative">
            <div className="absolute left-[7px] top-2 bottom-0 w-[1px] bg-outline-variant/30"></div>
            <ul className="flex flex-col gap-10">
              <li className="relative pl-8 group">
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-primary transition-transform group-hover:scale-125"></span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-data text-mono-data text-outline">10:42 AM</span>
                  <p className="font-data-lg text-data-lg text-primary">PO #8902 Approved</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Lumina Textiles • {fmt(14500)}</p>
                </div>
              </li>
              <li className="relative pl-8 group">
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-surface-variant transition-transform group-hover:scale-125"></span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-data text-mono-data text-outline">09:15 AM</span>
                  <p className="font-data-lg text-data-lg text-primary">New RFQ Published</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Packaging Materials Q4</p>
                </div>
              </li>
              <li className="relative pl-8 group">
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-surface-variant transition-transform group-hover:scale-125"></span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-data text-mono-data text-outline">Yesterday, 16:30</span>
                  <p className="font-data-lg text-data-lg text-primary">Invoice Received</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Atlas Logistics • INV-9921</p>
                </div>
              </li>
              <li className="relative pl-8 group">
                <span className="absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 border-surface bg-error transition-transform group-hover:scale-125"></span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono-data text-mono-data text-error">Yesterday, 14:00</span>
                  <p className="font-data-lg text-data-lg text-primary">Vendor Alert: Delay</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">Shipment #402 delayed by 48h</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
