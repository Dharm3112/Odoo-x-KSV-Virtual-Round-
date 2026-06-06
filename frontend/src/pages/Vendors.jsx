import React, { useState, useEffect } from 'react';

const Vendors = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => {
    setIsDrawerOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDrawerOpen]);

  return (
    <>
      <div className="container-page">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <h2 className="font-display-lg text-display-lg text-primary mb-2">Vendor Directory</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md">Manage your network of luxury suppliers, track compliance, and orchestrate global logistics.</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative flex items-center w-64">
              <span className="material-symbols-outlined absolute left-0 text-on-surface-variant text-[18px]">search</span>
              <input className="input-minimal w-full pl-8 pb-2 font-body-md text-body-md text-primary placeholder:text-on-surface-variant/50" placeholder="Search vendors..." type="text"/>
            </div>
            <button className="bg-primary-container text-on-primary px-6 py-3 rounded font-label-caps text-label-caps tracking-wider hover:bg-tertiary transition-colors duration-300">
              Add Vendor
            </button>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-editorial p-8 md:p-12 overflow-x-auto relative">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30 w-1/4">Vendor Name</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">Categories</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">GST Details</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30">Contact</th>
                <th className="font-label-caps text-label-caps text-on-surface-variant pb-6 font-medium border-b border-outline-variant/30 text-right pr-4">Status</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-body-md text-primary">
              <tr className="group cursor-pointer hover:bg-surface-bright transition-colors duration-200 border-b border-outline-variant/20 last:border-0 animate-fade-in-up delay-100" onClick={openDrawer}>
                <td className="py-8 pr-6">
                  <div className="font-data-lg text-data-lg font-medium mb-1 group-hover:text-tertiary-container transition-colors">Aura Textiles Ltd.</div>
                  <div className="font-mono-data text-mono-data text-on-surface-variant">VND-8820-UK</div>
                </td>
                <td className="py-8 pr-6 text-on-surface-variant">Cashmere, Silk, Hardware</td>
                <td className="py-8 pr-6 text-on-surface-variant font-mono-data">GB 123 4567 89</td>
                <td className="py-8 pr-6">
                  <div>E. Sinclair</div>
                  <div className="text-on-surface-variant text-sm mt-1">elena@auratex.co.uk</div>
                </td>
                <td className="py-8 text-right pr-4">
                  <span className="inline-block px-3 py-1 bg-[#e8f3e8] text-[#2e592e] font-label-caps text-label-caps rounded-full">Approved</span>
                </td>
              </tr>
              <tr className="group cursor-pointer hover:bg-surface-bright transition-colors duration-200 border-b border-outline-variant/20 last:border-0 animate-fade-in-up delay-200" onClick={openDrawer}>
                <td className="py-8 pr-6">
                  <div className="font-data-lg text-data-lg font-medium mb-1 group-hover:text-tertiary-container transition-colors">Atelier Maison Noir</div>
                  <div className="font-mono-data text-mono-data text-on-surface-variant">VND-4019-FR</div>
                </td>
                <td className="py-8 pr-6 text-on-surface-variant">Leather Goods, Packaging</td>
                <td className="py-8 pr-6 text-on-surface-variant font-mono-data">FR 89 876 543 210</td>
                <td className="py-8 pr-6">
                  <div>J. Dubois</div>
                  <div className="text-on-surface-variant text-sm mt-1">contact@maisonnoir.fr</div>
                </td>
                <td className="py-8 text-right pr-4">
                  <span className="inline-block px-3 py-1 bg-[#e8f3e8] text-[#2e592e] font-label-caps text-label-caps rounded-full">Approved</span>
                </td>
              </tr>
              <tr className="group cursor-pointer hover:bg-surface-bright transition-colors duration-200 border-b border-outline-variant/20 last:border-0 animate-fade-in-up delay-300" onClick={openDrawer}>
                <td className="py-8 pr-6">
                  <div className="font-data-lg text-data-lg font-medium mb-1 group-hover:text-tertiary-container transition-colors">Lumina Glassworks</div>
                  <div className="font-mono-data text-mono-data text-on-surface-variant">VND-9932-IT</div>
                </td>
                <td className="py-8 pr-6 text-on-surface-variant">Display Cabinets, Fixtures</td>
                <td className="py-8 pr-6 text-on-surface-variant font-mono-data">IT 01234567890</td>
                <td className="py-8 pr-6">
                  <div>M. Rossi</div>
                  <div className="text-on-surface-variant text-sm mt-1">m.rossi@luminaglass.it</div>
                </td>
                <td className="py-8 text-right pr-4">
                  <span className="inline-block px-3 py-1 bg-[#fdf2e9] text-[#b35900] font-label-caps text-label-caps rounded-full">Pending Audit</span>
                </td>
              </tr>
              <tr className="group cursor-pointer hover:bg-surface-bright transition-colors duration-200 border-b border-outline-variant/20 last:border-0 animate-fade-in-up delay-400" onClick={openDrawer}>
                <td className="py-8 pr-6">
                  <div className="font-data-lg text-data-lg font-medium mb-1 group-hover:text-tertiary-container transition-colors">Nordic Timber Co.</div>
                  <div className="font-mono-data text-mono-data text-on-surface-variant">VND-1102-SE</div>
                </td>
                <td className="py-8 pr-6 text-on-surface-variant">Raw Materials, Pallets</td>
                <td className="py-8 pr-6 text-on-surface-variant font-mono-data">SE 556677889901</td>
                <td className="py-8 pr-6">
                  <div>L. Berg</div>
                  <div className="text-on-surface-variant text-sm mt-1">logistics@nordictimber.se</div>
                </td>
                <td className="py-8 text-right pr-4">
                  <span className="inline-block px-3 py-1 bg-surface-variant text-on-surface-variant font-label-caps text-label-caps rounded-full">Inactive</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-end items-center gap-4 text-on-surface-variant font-body-md text-sm">
          <span>Rows per page: 10</span>
          <span className="mx-4">1-4 of 124</span>
          <div className="flex gap-2">
            <button className="p-1 hover:text-primary transition-colors disabled:opacity-30"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
            <button className="p-1 hover:text-primary transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
          </div>
        </div>
      </div>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-primary/10 backdrop-blur-[2px] z-50 transition-opacity duration-300" 
          onClick={closeDrawer}
        ></div>
      )}

      {/* Slide-over Detail Drawer */}
      <aside
        className={`fixed top-0 right-0 h-screen w-full sm:w-[480px] md:w-[40%] md:max-w-[640px] bg-surface-container-lowest shadow-drawer z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] overflow-y-auto flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Vendor details"
      >
        <div className="sticky top-0 bg-surface-container-lowest/80 backdrop-blur-md px-10 py-8 flex justify-between items-start border-b border-outline-variant/20 z-10">
          <div>
            <span className="inline-block px-3 py-1 bg-[#e8f3e8] text-[#2e592e] font-label-caps text-label-caps rounded-full mb-4">Approved</span>
            <h3 className="font-display-md text-display-md text-primary leading-tight">Aura Textiles Ltd.</h3>
            <p className="font-mono-data text-mono-data text-on-surface-variant mt-2">VND-8820-UK</p>
          </div>
          <button className="p-2 -mr-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-bright" onClick={closeDrawer} aria-label="Close vendor details">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-10 flex-1">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 mb-16">
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Primary Contact</h4>
              <p className="font-data-lg text-data-lg text-primary">Elena Sinclair</p>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">+44 20 7946 0958</p>
              <p className="font-body-md text-body-md text-primary mt-1 underline decoration-outline-variant underline-offset-4">elena@auratex.co.uk</p>
            </div>
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">HQ Address</h4>
              <p className="font-body-md text-body-md text-primary leading-relaxed">
                152 Silk Road<br/>
                Spitalfields<br/>
                London, E1 6FA<br/>
                United Kingdom
              </p>
            </div>
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">GST / VAT</h4>
              <p className="font-mono-data text-mono-data text-primary">GB 123 4567 89</p>
            </div>
            <div>
              <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Payment Terms</h4>
              <p className="font-body-md text-body-md text-primary">Net 45 Days</p>
            </div>
          </div>

          <div className="mb-16">
            <h4 className="font-headline-sm text-headline-sm text-primary mb-6">Supplied Categories</h4>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-2 border border-outline-variant/40 rounded font-body-md text-sm text-primary">Premium Cashmere</span>
              <span className="px-4 py-2 border border-outline-variant/40 rounded font-body-md text-sm text-primary">Raw Silk</span>
              <span className="px-4 py-2 border border-outline-variant/40 rounded font-body-md text-sm text-primary">Bespoke Hardware</span>
              <span className="px-4 py-2 border border-outline-variant/40 rounded font-body-md text-sm text-primary">Sustainable Dyes</span>
            </div>
          </div>

          <div className="bg-surface-bright rounded-lg p-8 relative overflow-hidden">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-6">Recent Activity</h4>
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[7px] before:w-[1px] before:bg-outline-variant/30">
              <div className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-surface-container-lowest border border-outline-variant flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                </div>
                <p className="font-body-md text-body-md text-primary">Purchase Order <span className="font-mono-data">PO-24-0091</span> Issued</p>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">Oct 12, 2023 • £45,200.00</p>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-surface-container-lowest border border-outline-variant"></div>
                <p className="font-body-md text-body-md text-primary">Annual Compliance Audit Passed</p>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">Sep 05, 2023 • Sustainability Metrics Validated</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10 mt-auto border-t border-outline-variant/10 flex justify-end gap-4">
          <button className="px-6 py-3 font-label-caps text-label-caps text-primary hover:bg-surface-bright rounded transition-colors">
            Edit Profile
          </button>
          <button className="px-6 py-3 font-label-caps text-label-caps bg-primary-container text-on-primary rounded hover:bg-tertiary transition-colors">
            Create PO
          </button>
        </div>
      </aside>
    </>
  );
};

export default Vendors;
