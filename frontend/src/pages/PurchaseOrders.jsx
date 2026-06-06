import React, { useState, useMemo } from 'react';
import { useToast } from '../hooks/useToasts.jsx';
import { printPage, sendEmail, exportPOPDF, exportInvoicePDF } from '../utils/export';
import { useFormatCurrency, useFormatDate } from '../utils/format';

const PO_STATUSES = [
  { key: 'draft', label: 'Draft', bg: '#eae6df', ink: '#6b6b6b' },
  { key: 'issued', label: 'Issued', bg: '#fdf2e9', ink: '#b35900' },
  { key: 'approved', label: 'Approved', bg: '#e8f3e8', ink: '#2e592e' },
  { key: 'sent', label: 'Sent to Vendor', bg: '#e8f0f3', ink: '#2e4a59' },
  { key: 'fulfilled', label: 'Fulfilled', bg: '#eae6df', ink: '#1a1a1a' },
  { key: 'closed', label: 'Closed', bg: '#eae6df', ink: '#6b6b6b' },
];

const INVOICE_STATUSES = [
  { key: 'pending', label: 'Pending', bg: '#fdf2e9', ink: '#b35900' },
  { key: 'sent', label: 'Sent', bg: '#e8f0f3', ink: '#2e4a59' },
  { key: 'paid', label: 'Paid', bg: '#e8f3e8', ink: '#2e592e' },
  { key: 'overdue', label: 'Overdue', bg: '#fde7e7', ink: '#b00020' },
  { key: 'partial', label: 'Partial', bg: '#fdf2e9', ink: '#b35900' },
];

const statusPillStyle = (statuses, kind) => {
  const s = statuses.find((x) => x.key === kind) || statuses[0];
  return s;
};

const generatePONumber = () => {
  const yr = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  const ts = new Date().toISOString().slice(-5, -3);
  return `PO-${yr}-${seq}${ts}`;
};

const generateInvoiceNumber = () => {
  const yr = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `INV-${yr}-${seq}`;
};

const PurchaseOrders = () => {
  const toast = useToast();
  const fmt = useFormatCurrency();
  const fmtDate = useFormatDate();
  const [poNumber] = useState(generatePONumber());
  const [invoiceNumber] = useState(generateInvoiceNumber());
  const [poStatus, setPoStatus] = useState('approved');
  const [invoiceStatus, setInvoiceStatus] = useState('pending');
  const [activeView, setActiveView] = useState('po');
  const [emailOpen, setEmailOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [email, setEmail] = useState('lumina.orders@luminatex.com');

  const poDate = '2023-10-24';
  const deliveryDate = '2023-11-15';
  const issueDate = '2023-10-24';
  const invoiceDueDate = '2023-11-23';

  const lineItems = [
    { item: 'Premium Linen Blend - Ivory', sku: 'SKU: TX-LIN-IV-01', qty: '2,500 yds', unit: fmt(14.5), tax: '22%', amount: fmt(36250) },
    { item: 'Silk Organza Roll - Charcoal', sku: 'SKU: TX-SLK-CH-99', qty: '800 yds', unit: fmt(28), tax: '22%', amount: fmt(22400) },
    { item: 'Custom Dye Formulation', sku: 'Service Fee - Lot A', qty: '1', unit: fmt(1200), tax: '22%', amount: fmt(1200) },
  ];

  const subtotal = 59850;
  const shipping = 3400;
  const taxRate = 0.22;
  const tax = subtotal * taxRate;
  const totalDue = subtotal + shipping + tax;

  const onPrint = () => {
    if (activeView === 'po') {
      printPage(poNumber);
    } else {
      printPage(invoiceNumber);
    }
    toast.info(`Opening print dialog for ${activeView === 'po' ? poNumber : invoiceNumber}…`);
  };

  const onDownloadPDF = async () => {
    try {
      if (activeView === 'po') {
        await exportPOPDF({
          po: {
            number: poNumber,
            issueDate: fmtDate(poDate),
            deliveryDate: fmtDate(deliveryDate),
            status: 'APPROVED',
            terms: 'Please confirm receipt of this purchase order within 48 hours. Goods must be delivered according to the specified delivery date. Any variations in quantity or price must be approved in writing prior to shipment. Net 30 payment terms apply unless otherwise stipulated in the master vendor agreement.',
          },
          vendor: {
            name: 'Lumina Textiles & Co.',
            address: '482 Silk Road Avenue, Suite 300\nMilan, MI 20121\nItaly',
            id: 'ID: VEN-9942',
          },
          shipTo: {
            name: 'VendorBridge HQ',
            address: '100 North Riverside Plaza\nReceiving Dock B\nChicago, IL 60606\nUnited States',
            attn: 'ATTN: Sarah Jenkins',
          },
          lineItems: [
            { item: 'Premium Linen Blend - Ivory', sku: 'SKU: TX-LIN-IV-01', qty: '2,500 yds', unit: fmt(14.5), amount: fmt(36250) },
            { item: 'Silk Organza Roll - Charcoal', sku: 'SKU: TX-SLK-CH-99', qty: '800 yds', unit: fmt(28), amount: fmt(22400) },
            { item: 'Custom Dye Formulation', sku: 'Service Fee - Lot A', qty: '1', unit: fmt(1200), amount: fmt(1200) },
          ],
          totals: { subtotal: fmt(subtotal), shipping: fmt(shipping), tax: fmt(tax) },
          filename: `${poNumber}.pdf`,
        });
        toast.success(`${poNumber}.pdf downloaded.`);
      } else {
        await exportInvoicePDF({
          invoice: {
            number: invoiceNumber,
            issueDate: fmtDate(issueDate),
            dueDate: fmtDate(invoiceDueDate),
            status: invoiceStatus.toUpperCase(),
            statusKind: invoiceStatus,
            poNumber,
            paymentInstructions: 'Remit payment via bank transfer to the account details on file. Reference the invoice number with your payment. Late payments are subject to a 1.5% monthly service charge.',
          },
          billFrom: {
            name: 'Lumina Textiles & Co.',
            address: '482 Silk Road Avenue, Suite 300\nMilan, MI 20121\nItaly',
            taxId: 'VAT: IT 01234567890',
          },
          billTo: {
            name: 'VendorBridge HQ',
            address: '100 North Riverside Plaza\nReceiving Dock B\nChicago, IL 60606\nUnited States',
            attn: 'ATTN: Sarah Jenkins',
          },
          lineItems: [
            { item: 'Premium Linen Blend - Ivory', sku: 'SKU: TX-LIN-IV-01', qty: '2,500 yds', unit: fmt(14.5), tax: '22%', amount: fmt(36250) },
            { item: 'Silk Organza Roll - Charcoal', sku: 'SKU: TX-SLK-CH-99', qty: '800 yds', unit: fmt(28), tax: '22%', amount: fmt(22400) },
            { item: 'Custom Dye Formulation', sku: 'Service Fee - Lot A', qty: '1', unit: fmt(1200), tax: '22%', amount: fmt(1200) },
          ],
          totals: { subtotal: fmt(subtotal), shipping: fmt(shipping), tax: fmt(tax), taxRate },
          filename: `${invoiceNumber}.pdf`,
        });
        toast.success(`${invoiceNumber}.pdf downloaded.`);
      }
    } catch (err) {
      console.error('PDF export failed', err);
      toast.error(`Could not generate PDF: ${err?.message || 'unknown error'}`);
    }
  };

  const onSendEmail = () => setEmailOpen(true);

  const submitEmail = () => {
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (activeView === 'po') {
      const subject = `Purchase Order ${poNumber} from VendorBridge`;
      const body = `Dear Lumina Textiles team,\n\nPlease find attached purchase order ${poNumber} (${fmt(totalDue)} total).\n\nDelivery is requested by ${fmtDate(deliveryDate)}. Please confirm receipt within 48 hours.\n\nBest,\nVendorBridge`;
      sendEmail({ to: email, subject, body });
      toast.success(`Drafted email to ${email} in your default mail client.`);
    } else {
      const subject = `Invoice ${invoiceNumber} from VendorBridge`;
      const body = `Dear Lumina Textiles team,\n\nPlease find attached invoice ${invoiceNumber} for PO ${poNumber} (${fmt(totalDue)} total).\n\nPayment is due by ${fmtDate(invoiceDueDate)}. Please reference the invoice number with your payment.\n\nBest,\nVendorBridge`;
      sendEmail({ to: email, subject, body });
      toast.success(`Drafted email to ${email} in your default mail client.`);
    }
    setEmailOpen(false);
  };

  const updatePOStatus = (next) => {
    const prev = poStatus;
    setPoStatus(next);
    setStatusOpen(false);
    toast.success(`PO status: ${PO_STATUSES.find((s) => s.key === prev)?.label} → ${PO_STATUSES.find((s) => s.key === next)?.label}`);
  };

  const updateInvoiceStatus = (next) => {
    const prev = invoiceStatus;
    setInvoiceStatus(next);
    setStatusOpen(false);
    toast.success(`Invoice status: ${INVOICE_STATUSES.find((s) => s.key === prev)?.label} → ${INVOICE_STATUSES.find((s) => s.key === next)?.label}`);
  };

  const poStyle = useMemo(() => statusPillStyle(PO_STATUSES, poStatus), [poStatus]);
  const invStyle = useMemo(() => statusPillStyle(INVOICE_STATUSES, invoiceStatus), [invoiceStatus]);

  return (
    <div className="flex-1 min-h-screen bg-background relative overflow-x-hidden">
      <div className="container-page max-w-[1200px] py-12">
        <div className="mb-6 max-w-5xl">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">{activeView === 'po' ? 'Purchase Order' : 'Invoice'}</span>
              <h2 className="font-display-lg text-display-lg text-on-surface mt-1">{activeView === 'po' ? poNumber : invoiceNumber}</h2>
              <p className="font-mono-data text-mono-data text-on-surface-variant mt-2">Auto-generated · {new Date().toLocaleString()}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex border border-outline-variant/40 rounded-full p-1 bg-surface-bright">
                <button
                  onClick={() => setActiveView('po')}
                  className={`px-5 py-2 rounded-full font-label-caps text-label-caps uppercase tracking-widest transition-colors flex items-center gap-2 ${
                    activeView === 'po' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                  Purchase Order
                </button>
                <button
                  onClick={() => setActiveView('invoice')}
                  className={`px-5 py-2 rounded-full font-label-caps text-label-caps uppercase tracking-widest transition-colors flex items-center gap-2 ${
                    activeView === 'invoice' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                  Invoice
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ background: activeView === 'po' ? poStyle.bg : invStyle.bg, color: activeView === 'po' ? poStyle.ink : invStyle.ink }} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-label-caps text-label-caps uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: activeView === 'po' ? poStyle.ink : invStyle.ink }}></span>
                  {activeView === 'po' ? poStyle.label : invStyle.label}
                </span>
                <button
                  onClick={() => setStatusOpen(true)}
                  className="px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:text-primary font-label-caps text-label-caps uppercase tracking-widest flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[14px]">edit</span>
                  Update status
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest w-full rounded shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] p-8 md:p-16 relative">
          <div className="absolute top-8 right-8 md:top-12 md:right-12 flex gap-2 glass-panel px-2 py-1 rounded z-10 border border-outline-variant/20">
            <button onClick={onPrint} className="flex items-center gap-2 px-3 py-2 text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high transition-colors rounded">
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span className="hidden md:inline">Print {activeView === 'po' ? 'PO' : 'Invoice'}</span>
            </button>
            <button onClick={onSendEmail} className="flex items-center gap-2 px-3 py-2 text-on-surface-variant font-label-caps text-label-caps hover:bg-surface-container-high transition-colors rounded">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span className="hidden md:inline">Send Email</span>
            </button>
            <button onClick={onDownloadPDF} className="flex items-center gap-2 px-3 py-2 text-primary font-label-caps text-label-caps bg-surface-container-high hover:bg-surface-container-highest transition-colors rounded">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span className="hidden md:inline">Download {activeView === 'po' ? 'PO' : 'Invoice'} PDF</span>
            </button>
          </div>

          <div className="mb-20 pt-16 md:pt-0 max-w-[70%]">
            <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.1em] mb-4">{activeView === 'po' ? 'Purchase Order' : 'Invoice'}</div>
            <h2 className="font-display-lg text-display-lg text-on-surface">{activeView === 'po' ? poNumber : invoiceNumber}</h2>
            {activeView === 'invoice' && (
              <p className="font-mono-data text-mono-data text-on-surface-variant mt-2">For PO {poNumber}</p>
            )}

            <div className="mt-8 flex flex-wrap gap-12 border-t border-outline-variant border-thin pt-6">
              {activeView === 'po' ? (
                <>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Issue Date</p>
                    <p className="font-mono-data text-mono-data text-on-surface">{fmtDate(poDate)}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Delivery Date</p>
                    <p className="font-mono-data text-mono-data text-on-surface">{fmtDate(deliveryDate)}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">PO Status</p>
                    <span style={{ background: poStyle.bg, color: poStyle.ink }} className="inline-flex items-center gap-1.5 px-3 py-1 font-label-caps text-[10px] rounded-full uppercase tracking-widest">
                      {poStyle.label}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Issue Date</p>
                    <p className="font-mono-data text-mono-data text-on-surface">{fmtDate(issueDate)}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Due Date</p>
                    <p className="font-mono-data text-mono-data text-on-surface">{fmtDate(invoiceDueDate)}</p>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Invoice Status</p>
                    <span style={{ background: invStyle.bg, color: invStyle.ink }} className="inline-flex items-center gap-1.5 px-3 py-1 font-label-caps text-[10px] rounded-full uppercase tracking-widest">
                      {invStyle.label}
                    </span>
                  </div>
                  <div>
                    <p className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-1">Payment Terms</p>
                    <p className="font-mono-data text-mono-data text-on-surface">Net 30</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-element-gap mb-20">
            {activeView === 'po' ? (
              <>
                <div className="md:col-span-5 md:pr-8">
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-2 mb-4">Vendor Details</h3>
                  <p className="font-data-lg text-data-lg text-on-surface mb-2">Lumina Textiles & Co.</p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    482 Silk Road Avenue<br />
                    Suite 300<br />
                    Milan, MI 20121<br />
                    Italy
                  </p>
                  <p className="font-mono-data text-mono-data text-on-surface-variant mt-4">ID: VEN-9942</p>
                </div>
                <div className="md:col-span-5 md:col-start-7 md:mt-12">
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-2 mb-4">Shipping Destination</h3>
                  <p className="font-data-lg text-data-lg text-on-surface mb-2">VendorBridge HQ</p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    100 North Riverside Plaza<br />
                    Receiving Dock B<br />
                    Chicago, IL 60606<br />
                    United States
                  </p>
                  <p className="font-mono-data text-mono-data text-on-surface-variant mt-4">ATTN: Sarah Jenkins</p>
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-5 md:pr-8">
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-2 mb-4">Billed By</h3>
                  <p className="font-data-lg text-data-lg text-on-surface mb-2">Lumina Textiles & Co.</p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    482 Silk Road Avenue<br />
                    Suite 300<br />
                    Milan, MI 20121<br />
                    Italy
                  </p>
                  <p className="font-mono-data text-mono-data text-on-surface-variant mt-4">VAT: IT 01234567890</p>
                </div>
                <div className="md:col-span-5 md:col-start-7 md:mt-12">
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-2 mb-4">Billed To</h3>
                  <p className="font-data-lg text-data-lg text-on-surface mb-2">VendorBridge HQ</p>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    100 North Riverside Plaza<br />
                    Receiving Dock B<br />
                    Chicago, IL 60606<br />
                    United States
                  </p>
                  <p className="font-mono-data text-mono-data text-on-surface-variant mt-4">ATTN: Sarah Jenkins</p>
                </div>
              </>
            )}
          </div>

          <div className="w-full overflow-x-auto mb-16">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal w-2/5">Item Description</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal text-right">Qty</th>
                  <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal text-right">Unit Price</th>
                  {activeView === 'invoice' && (
                    <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal text-right">Tax</th>
                  )}
                  <th className="font-label-caps text-label-caps text-on-surface-variant uppercase border-b border-thin border-outline-variant pb-4 font-normal text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((l, i) => (
                  <tr key={i} className="border-b border-thin border-outline-variant hover:bg-surface-bright transition-colors">
                    <td className="py-6 pr-4">
                      <p className="font-data-lg text-data-lg text-on-surface">{l.item}</p>
                      <p className="font-mono-data text-mono-data text-on-surface-variant mt-1">{l.sku}</p>
                    </td>
                    <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">{l.qty}</td>
                    <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">{l.unit}</td>
                    {activeView === 'invoice' && (
                      <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">{l.tax}</td>
                    )}
                    <td className="py-6 font-mono-data text-mono-data text-on-surface text-right">{l.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-[360px]">
              <div className="flex justify-between py-3">
                <span className="font-body-md text-body-md text-on-surface-variant">Subtotal</span>
                <span className="font-mono-data text-mono-data text-on-surface">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-body-md text-body-md text-on-surface-variant">Shipping (Air Freight)</span>
                <span className="font-mono-data text-mono-data text-on-surface">{fmt(shipping)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="font-body-md text-body-md text-on-surface-variant">Tax (VAT {(taxRate * 100).toFixed(0)}%)</span>
                <span className="font-mono-data text-mono-data text-on-surface">{fmt(tax)}</span>
              </div>
              <div className="flex justify-between items-center py-6 mt-4 border-t border-outline-variant border-thin">
                <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">Total {activeView === 'invoice' ? 'Due' : 'Amount'}</span>
                <span className="font-headline-sm text-headline-sm text-on-surface">{fmt(totalDue)}</span>
              </div>
              {activeView === 'invoice' && invoiceStatus === 'paid' && (
                <div className="mt-3 p-3 bg-secondary-container/30 border border-secondary/30 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">check_circle</span>
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest text-xs">Paid in full</span>
                </div>
              )}
              {activeView === 'invoice' && invoiceStatus === 'overdue' && (
                <div className="mt-3 p-3 bg-error-container/30 border border-error/30 rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-error">warning</span>
                  <span className="font-label-caps text-label-caps text-error uppercase tracking-widest text-xs">Overdue — escalate to collections</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-thin border-outline-variant/50 max-w-2xl">
            <h4 className="font-label-caps text-label-caps text-on-surface-variant uppercase mb-2">{activeView === 'po' ? 'Terms & Conditions' : 'Payment Instructions'}</h4>
            <p className="font-body-md text-body-md text-on-surface-variant text-sm">
              {activeView === 'po'
                ? 'Please confirm receipt of this purchase order within 48 hours. Goods must be delivered according to the specified delivery date. Any variations in quantity or price must be approved in writing prior to shipment. Net 30 payment terms apply unless otherwise stipulated in the master vendor agreement.'
                : 'Remit payment via bank transfer to the account details on file. Reference the invoice number with your payment. Late payments are subject to a 1.5% monthly service charge. For questions, contact accounts@vendorbridge.com.'}
            </p>
          </div>
        </div>
      </div>

      {emailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setEmailOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Send ${activeView === 'po' ? 'PO' : 'Invoice'} via email`} className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-md p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">mail</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Send {activeView === 'po' ? 'PO' : 'Invoice'} via email</h3>
                <p className="font-body-md text-sm text-on-surface-variant">A prefilled draft will open in your default mail client.</p>
              </div>
            </div>
            <label className="block mb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-widest">Recipient</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-outline-variant rounded px-4 py-3 bg-transparent font-body-md text-body-md text-on-surface focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                placeholder="vendor@example.com"
              />
            </label>
            <div className="p-3 bg-surface-bright rounded text-xs space-y-1 mb-4">
              <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">Subject</p>
              <p className="font-mono-data text-on-surface">{activeView === 'po' ? `Purchase Order ${poNumber} from VendorBridge` : `Invoice ${invoiceNumber} from VendorBridge`}</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEmailOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Cancel</button>
              <button onClick={submitEmail} className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label-caps text-label-caps hover:bg-tertiary transition-colors">Open draft</button>
            </div>
          </div>
        </div>
      )}

      {statusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/10 backdrop-blur-[2px]" onClick={() => setStatusOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Update status" className="bg-surface-container-lowest rounded-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.2)] border border-outline-variant/20 w-full max-w-lg p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">published_with_changes</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Update {activeView === 'po' ? 'PO' : 'Invoice'} status</h3>
                <p className="font-body-md text-sm text-on-surface-variant">Move this {activeView === 'po' ? 'purchase order' : 'invoice'} through its lifecycle. The buyer or vendor will be notified of the change.</p>
              </div>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">Purchase Order</p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {PO_STATUSES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => updatePOStatus(s.key)}
                  disabled={activeView !== 'po'}
                  className={`px-3 py-2.5 rounded-lg font-label-caps text-label-caps uppercase tracking-widest text-xs border transition-all ${
                    poStatus === s.key ? 'border-primary bg-primary-container/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-bright'
                  } ${activeView !== 'po' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-2">Invoice</p>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {INVOICE_STATUSES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => updateInvoiceStatus(s.key)}
                  disabled={activeView !== 'invoice'}
                  className={`px-3 py-2.5 rounded-lg font-label-caps text-label-caps uppercase tracking-widest text-xs border transition-all ${
                    invoiceStatus === s.key ? 'border-primary bg-primary-container/10 text-primary' : 'border-outline-variant/40 text-on-surface-variant hover:bg-surface-bright'
                  } ${activeView !== 'invoice' ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setStatusOpen(false)} className="px-5 py-2.5 rounded-full font-label-caps text-label-caps text-on-surface-variant hover:bg-surface-bright transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;
