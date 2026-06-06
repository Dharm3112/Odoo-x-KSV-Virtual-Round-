import React from 'react';

const PurchaseOrders = () => {
  return (
    <div className="flex-1 min-h-screen bg-background relative overflow-x-hidden">
      <div className="p-6 md:py-24 md:pl-[120px] md:pr-16 max-w-[1200px] mx-auto">
        <div className="bg-surface-container-lowest w-full rounded shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] p-8 md:p-16 relative">
          
          <div className="absolute top-8 right-8 md:top-12 md:right-12 flex gap-2 glass-panel px-2 py-1 rounded z-10 border border-outline-variant/20">
            <button className="flex items-center gap-2 px-3 py-2 text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high transition-colors rounded">
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span className="hidden md:inline">Print</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high transition-colors rounded">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span className="hidden md:inline">Send Email</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-primary font-label-caps text-label-caps bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden md:inline">Download PDF</span>
            </button>
          </div>

          <div className="mb-20 pt-16 md:pt-0 max-w-[70%]">
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.1em] mb-4">Purchase Order</div>
            <h2 className="font-display-lg text-display-lg text-on-surface">PO-2023-8472</h2>
            
            <div className="mt-8 flex flex-wrap gap-12 border-t border-outline-variant border-thin pt-6">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Issue Date</p>
                <p className="font-mono-data text-mono-data text-on-surface">Oct 24, 2023</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Delivery Date</p>
                <p className="font-mono-data text-mono-data text-on-surface">Nov 15, 2023</p>
              </div>
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Status</p>
                <div className="inline-flex items-center px-3 py-1 bg-secondary-container text-on-secondary-container font-label-caps text-[10px] rounded-full">
                    APPROVED
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-element-gap mb-20">
            <div className="md:col-span-5 md:pr-8">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-2 mb-4">Vendor Details</h3>
              <p className="font-data-lg text-data-lg text-on-surface mb-2">Lumina Textiles & Co.</p>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  482 Silk Road Avenue<br/>
                  Suite 300<br/>
                  Milan, MI 20121<br/>
                  Italy
              </p>
              <p className="font-mono-data text-mono-data text-on-surface-variant mt-4">ID: VEN-9942</p>
            </div>
            
            <div className="md:col-span-5 md:col-start-7 md:mt-12">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-2 mb-4">Shipping Destination</h3>
              <p className="font-data-lg text-data-lg text-on-surface mb-2">VendorBridge HQ</p>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  100 North Riverside Plaza<br/>
                  Receiving Dock B<br/>
                  Chicago, IL 60606<br/>
                  United States
              </p>
              <p className="font-mono-data text-mono-data text-on-surface-variant mt-4">ATTN: Sarah Jenkins</p>
            </div>
          </div>

          <div className="w-full overflow-x-auto mb-16">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal w-1/2">Item Description</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal text-right">Qty</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal text-right">Unit Price</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-thin border-outline-variant hover:bg-surface-bright transition-colors">
                  <td className="py-6 pr-4">
                    <p className="font-data-lg text-data-lg text-on-surface">Premium Linen Blend - Ivory</p>
                    <p className="font-mono-data text-mono-data text-on-surface-variant mt-1">SKU: TX-LIN-IV-01</p>
                  </td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">2,500 yds</td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">$14.50</td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">$36,250.00</td>
                </tr>
                <tr className="border-b border-thin border-outline-variant hover:bg-surface-bright transition-colors">
                  <td className="py-6 pr-4">
                    <p className="font-data-lg text-data-lg text-on-surface">Silk Organza Roll - Charcoal</p>
                    <p className="font-mono-data text-mono-data text-on-surface-variant mt-1">SKU: TX-SLK-CH-99</p>
                  </td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">800 yds</td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">$28.00</td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">$22,400.00</td>
                </tr>
                <tr className="border-b border-thin border-outline-variant hover:bg-surface-bright transition-colors">
                  <td className="py-6 pr-4">
                    <p className="font-data-lg text-data-lg text-on-surface">Custom Dye Formulation</p>
                    <p className="font-mono-data text-mono-data text-on-surface-variant mt-1">Service Fee - Lot A</p>
                  </td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">1</td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">$1,200.00</td>
                  <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">$1,200.00</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-[320px]">
              <div className="flex justify-between py-3">
                <span className="font-body-md text-body-md text-on-surface-variant">Subtotal</span>
                <span className="font-mono-data text-mono-data text-on-surface">$59,850.00</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-body-md text-body-md text-on-surface-variant">Shipping (Air Freight)</span>
                <span className="font-mono-data text-mono-data text-on-surface">$3,400.00</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-body-md text-body-md text-on-surface-variant">Tax (VAT 22%)</span>
                <span className="font-mono-data text-mono-data text-on-surface">$13,915.00</span>
              </div>
              <div className="flex justify-between items-center py-6 mt-4 border-t border-outline-variant border-thin">
                <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">Total Due</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">$77,165.00</span>
              </div>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-thin border-outline-variant/50 max-w-2xl">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">Terms & Conditions</h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              Please confirm receipt of this purchase order within 48 hours. Goods must be delivered according to the specified delivery date. Any variations in quantity or price must be approved in writing prior to shipment. Net 30 payment terms apply unless otherwise stipulated in the master vendor agreement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
