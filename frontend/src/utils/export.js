import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const sanitizeCell = (v) => {
  if (v == null) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

export const toCSV = (rows, columns) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    return columns ? columns.map((c) => sanitizeCell(c.label || c.key)).join(',') : '';
  }
  const cols = columns || Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
  const header = cols.map((c) => sanitizeCell(c.label || c.key)).join(',');
  const body = rows
    .map((row) => cols.map((c) => sanitizeCell(typeof c.format === 'function' ? c.format(row) : row[c.key])).join(','))
    .join('\n');
  return `${header}\n${body}`;
};

export const exportCSV = (rows, columns, filename = 'export.csv') => {
  const csv = toCSV(rows, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename);
};

export const exportHTML = (html, filename = 'export.html') => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  triggerDownload(blob, filename);
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const printPage = (title = 'VendorBridge') => {
  const prev = document.title;
  document.title = title;
  window.print();
  document.title = prev;
};

export const printElement = (elementId, title = 'VendorBridge') => {
  const node = document.getElementById(elementId);
  if (!node) {
    printPage(title);
    return;
  }
  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((n) => n.outerHTML)
    .join('\n');
  win.document.open();
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${title}</title>${styles}</head><body>${node.outerHTML}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); win.close(); }, 300);
};

export const sendEmail = ({ to = '', subject = '', body = '' }) => {
  const params = new URLSearchParams({ subject, body });
  if (to) params.set('to', to);
  window.location.href = `mailto:${to}?${params.toString()}`;
};

const hexToRgb = (hex) => {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return [0, 0, 0];
  return m.map((c) => parseInt(c, 16));
};

const FONT = {
  family: '"Space Grotesk", "Helvetica Neue", Helvetica, Arial, sans-serif',
  display: '"Playfair Display", "Times New Roman", Georgia, serif',
  mono: '"JetBrains Mono", "Courier New", monospace',
};

const COLOR = {
  ink: '#1a1a1a',
  muted: '#6b6b6b',
  faint: '#9a9a9a',
  border: '#e5e1d8',
  borderSoft: '#efece6',
  surface: '#fafaf7',
  surfaceLowest: '#ffffff',
  primary: '#615e57',
  secondary: '#a8a39a',
  success: '#2e592e',
  successBg: '#e8f3e8',
  warn: '#b35900',
  warnBg: '#fdf2e9',
  danger: '#b00020',
  dangerBg: '#fde7e7',
  accent: '#c4c7c7',
  brand: '#1a1a1a',
};

const exportPDFSimple = ({
  filename, title, subtitle, columns, rows, meta, orientation = 'portrait',
}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const [r, g, b] = hexToRgb(COLOR.ink);
  const [ar, ag, ab] = hexToRgb(COLOR.muted);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(r, g, b);
  doc.text(title, margin, margin + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(ar, ag, ab);
  const stamp = new Date().toLocaleString();
  const headerLine = subtitle ? `${subtitle}  •  ${stamp}` : stamp;
  doc.text(headerLine, margin, margin + 26);

  doc.setDrawColor(229, 225, 216);
  doc.setLineWidth(0.5);
  doc.line(margin, margin + 36, pageWidth - margin, margin + 36);

  if (meta && Object.keys(meta).length) {
    let y = margin + 56;
    const entries = Object.entries(meta);
    entries.forEach(([k, v], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = margin + col * ((pageWidth - margin * 2) / 2);
      const yy = y + row * 16;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(ar, ag, ab);
      doc.text(String(k).toUpperCase(), x, yy);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(r, g, b);
      doc.text(String(v), x + 80, yy);
    });
  }

  const tableStartY = margin + 56 + Math.ceil(Object.keys(meta || {}).length / 2) * 16 + 18;

  autoTable(doc, {
    startY: tableStartY,
    head: [columns.map((c) => c.label || c.key)],
    body: rows.map((row) => columns.map((c) => {
      const raw = typeof c.format === 'function' ? c.format(row) : row[c.key];
      return raw == null ? '' : String(raw);
    })),
    margin: { left: margin, right: margin, bottom: margin },
    styles: { font: 'helvetica', fontSize: 9, cellPadding: 6, textColor: [26, 26, 26], lineColor: [229, 225, 216], lineWidth: 0.4 },
    headStyles: { fillColor: [245, 245, 240], textColor: [97, 94, 87], fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [250, 250, 247] },
    columnStyles: Object.fromEntries(columns.map((c, i) => [i, c.align ? { halign: c.align } : {}])),
  });

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(ar, ag, ab);
    doc.text(`VendorBridge  •  ${stamp}`, margin, pageHeight - 24);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 24, { align: 'right' });
  }

  doc.save(filename);
};

export const exportPDF = (config) => exportPDFSimple(config);

/* ------------------------------------------------------------------ */
/*  Rich PDF: render styled HTML to canvas and embed as PDF pages     */
/* ------------------------------------------------------------------ */

const buildReportShell = ({ title, subtitle, stamp, sections }) => `
  <div style="
    background: ${COLOR.surface};
    color: ${COLOR.ink};
    font-family: ${FONT.family};
    width: 1100px;
    padding: 64px 64px 48px 64px;
    box-sizing: border-box;
  ">
    <div style="display:flex; align-items:flex-end; justify-content:space-between; border-bottom: 1px solid ${COLOR.border}; padding-bottom: 24px; margin-bottom: 40px;">
      <div>
        <div style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 8px;">${subtitle || 'VendorBridge Report'}</div>
        <h1 style="font-family: ${FONT.display}; font-size: 38px; font-weight: 500; margin: 0; letter-spacing: -0.01em; color: ${COLOR.ink};">${title}</h1>
      </div>
      <div style="text-align:right;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: ${COLOR.muted};">Generated</div>
        <div style="font-family: ${FONT.mono}; font-size: 12px; color: ${COLOR.ink}; margin-top: 4px;">${stamp}</div>
      </div>
    </div>
    ${sections.map((s) => s).join('')}
  </div>
`;

const sectionHeader = (label, title) => `
  <div style="margin: 40px 0 20px 0; padding-bottom: 12px; border-bottom: 1px solid ${COLOR.borderSoft}; display:flex; align-items:baseline; justify-content:space-between;">
    <h2 style="font-family: ${FONT.display}; font-size: 20px; font-weight: 500; margin: 0; color: ${COLOR.ink};">${title}</h2>
    <span style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted};">${label}</span>
  </div>
`;

const kpiGrid = (kpis) => `
  <div style="display:grid; grid-template-columns: repeat(${kpis.length}, 1fr); gap: 20px; margin-bottom: 28px;">
    ${kpis.map((k) => `
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 26px 24px 22px 24px; box-shadow: 0 6px 30px -16px rgba(0,0,0,0.06);">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 14px;">${k.label}</div>
        <div style="font-family: ${FONT.display}; font-size: 30px; font-weight: 500; color: ${COLOR.ink}; line-height: 1; margin-bottom: 10px;">${k.value}</div>
        ${k.delta ? `<div style="display:flex; align-items:center; gap: 6px; font-family: ${FONT.mono}; font-size: 10px;"><span style="color: ${k.deltaPositive === false ? COLOR.danger : COLOR.success};">${k.delta}</span><span style="color: ${COLOR.muted};">${k.sub || ''}</span></div>` : ''}
      </div>
    `).join('')}
  </div>
`;

const barRow = (label, pct, color = COLOR.primary) => `
  <div style="margin: 14px 0;">
    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 8px;">
      <span style="font-size: 14px; color: ${COLOR.ink};">${label}</span>
      <span style="font-family: ${FONT.mono}; font-size: 12px; color: ${COLOR.muted};">${pct}%</span>
    </div>
    <div style="height: 8px; width: 100%; background: ${COLOR.borderSoft}; border-radius: 999px; overflow: hidden;">
      <div style="height: 100%; background: ${color}; border-radius: 999px; width: ${pct}%;"></div>
    </div>
  </div>
`;

const riskCell = (tier, pct, bg, ink) => `
  <div style="background: ${bg}; border: 1px solid ${COLOR.borderSoft}; border-radius: 10px; padding: 24px; min-height: 140px; display:flex; flex-direction:column; justify-content:space-between;">
    <div style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${ink};">${tier}</div>
    <div style="font-family: ${FONT.display}; font-size: 32px; font-weight: 500; color: ${ink};">${pct}<span style="font-size: 16px; color: ${ink}; opacity: 0.7;">%</span></div>
  </div>
`;

const dataTable = (columns, rows) => `
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px; border: 1px solid ${COLOR.borderSoft}; border-radius: 10px; overflow: hidden;">
    <thead>
      <tr>
        ${columns.map((c) => `<th style="text-align: ${c.align || 'left'}; padding: 14px 14px; background: ${COLOR.surfaceLowest}; border-bottom: 1px solid ${COLOR.border}; font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: ${COLOR.muted}; font-weight: 500;">${c.label || c.key}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${rows.map((row, i) => `<tr style="background: ${i % 2 === 0 ? COLOR.surfaceLowest : COLOR.surface};">
        ${columns.map((c) => {
          const raw = typeof c.format === 'function' ? c.format(row) : row[c.key];
          return `<td style="text-align: ${c.align || 'left'}; padding: 14px 14px; border-bottom: 1px solid ${COLOR.borderSoft}; font-size: 12px; color: ${COLOR.ink};">${raw == null ? '' : raw}</td>`;
        }).join('')}
      </tr>`).join('')}
    </tbody>
  </table>
`;

const statusPill = (label, kind) => {
  const palette = {
    approved: { bg: COLOR.successBg, ink: COLOR.success },
    pending: { bg: COLOR.warnBg, ink: COLOR.warn },
    inactive: { bg: '#eae6df', ink: COLOR.muted },
  }[kind] || { bg: '#eae6df', ink: COLOR.muted };
  return `<span style="display:inline-block; padding: 5px 12px; background: ${palette.bg}; color: ${palette.ink}; font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 999px;">${label}</span>`;
};

const renderRichToCanvas = async (root) => {
  const { default: html2canvas } = await import('html2canvas');
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { /* ignore */ }
  }
  root.style.cssText = `
    position: absolute;
    top: -10000px;
    left: 0;
    width: 1100px;
    background: ${COLOR.surface};
    color: ${COLOR.ink};
    font-family: ${FONT.family};
  `;
  document.body.appendChild(root);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  try {
    return await html2canvas(root, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: COLOR.surface,
      logging: false,
      windowWidth: 1100,
      width: root.scrollWidth,
      height: root.scrollHeight,
      onclone: (clonedDoc) => {
        const styles = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
        styles.forEach((s) => s.remove());
        const body = clonedDoc.body;
        body.style.backgroundColor = COLOR.surface;
        body.style.color = COLOR.ink;
        body.style.margin = '0';
        body.style.padding = '0';
        const html = clonedDoc.documentElement;
        html.style.backgroundColor = COLOR.surface;
        html.style.color = COLOR.ink;
      },
    });
  } finally {
    if (root.parentNode) document.body.removeChild(root);
  }
};

const PDF_MARGIN = 36;

const addCanvasToPdf = (canvas, pdf, pageW, pageH) => {
  const margin = PDF_MARGIN;
  const innerW = pageW - margin * 2;
  const ratio = canvas.width / canvas.height;
  const targetW = innerW;
  const targetH = innerW / ratio;
  if (targetH <= pageH - margin * 2) {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const yOffset = (pageH - targetH) / 2;
    pdf.addImage(dataUrl, 'JPEG', margin, yOffset, targetW, targetH);
    return 1;
  }
  const sliceHeightPx = canvas.width * ((pageH - margin * 2) / innerW);
  const yStart = (pageH - Math.min(pageH - margin * 2, canvas.height * (innerW / canvas.width))) / 2;
  let y = 0;
  let page = 1;
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvas.width;
  const tempCtx = tempCanvas.getContext('2d');
  while (y < canvas.height) {
    const slice = Math.min(sliceHeightPx, canvas.height - y);
    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, y, canvas.width, slice, 0, 0, canvas.width, slice);
    const sliceUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
    if (page > 1) pdf.addPage();
    const sliceH = slice * (innerW / canvas.width);
    pdf.addImage(sliceUrl, 'JPEG', margin, yStart, targetW, sliceH);
    y += sliceHeightPx;
    page += 1;
  }
  return page;
};

const stampPageFooters = (pdf, stamp) => {
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(...hexToRgb(COLOR.muted));
    pdf.text(`VendorBridge  •  ${stamp}`, PDF_MARGIN, pdf.internal.pageSize.getHeight() - 16);
    pdf.text(`Page ${i} of ${pageCount}`, pdf.internal.pageSize.getWidth() - PDF_MARGIN, pdf.internal.pageSize.getHeight() - 16, { align: 'right' });
  }
};

export const exportReportsPDF = ({ kpis, allocation, risk, filename = 'vendorbridge-q3-report.pdf' } = {}) => {
  const stamp = new Date().toLocaleString();
  const sections = [
    sectionHeader('KPI', 'Performance snapshot'),
    kpiGrid(kpis || []),
    sectionHeader('Allocation', 'Procurement Allocation'),
    (allocation || []).map((a) => barRow(a.name, a.share, a.color || COLOR.primary)).join(''),
    sectionHeader('Risk', 'Risk Matrix'),
    `<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
      ${(risk || []).map((r) => riskCell(r.tier, r.value, r.bg, r.ink)).join('')}
    </div>`,
  ];
  const html = buildReportShell({ title: 'Q3 Performance Report', subtitle: 'Reports & Analytics', stamp, sections });
  const root = document.createElement('div');
  root.innerHTML = html;
  return renderRichToCanvas(root).then((canvas) => {
    const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'landscape' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    addCanvasToPdf(canvas, pdf, pageW, pageH);
    stampPageFooters(pdf, stamp);
    pdf.save(filename);
  });
};

export const exportVendorsPDF = ({ rows, totalCount, byStatus, totalVolume, search, statusFilter, categoryFilter, countryFilter, filename = 'vendor-directory.pdf' } = {}) => {
  const stamp = new Date().toLocaleString();
  const filterDesc = [
    search && `Search: "${search}"`,
    statusFilter && statusFilter !== 'all' && `Status: ${statusFilter}`,
    categoryFilter && categoryFilter !== 'all' && `Category: ${categoryFilter}`,
    countryFilter && countryFilter !== 'all' && `Country: ${countryFilter}`,
  ].filter(Boolean).join(' • ');

  const statusBreakdown = byStatus || { approved: 0, pending: 0, inactive: 0 };
  const kpis = [
    { label: 'Total Vendors', value: totalCount || rows.length, delta: filterDesc || 'All vendors', sub: '' },
    { label: 'Approved', value: statusBreakdown.approved, delta: `${Math.round((statusBreakdown.approved / Math.max(1, totalCount || 1)) * 100)}%`, deltaPositive: true, sub: 'of total' },
    { label: 'Pending Audit', value: statusBreakdown.pending, delta: `${statusBreakdown.pending} awaiting review`, sub: '' },
    { label: 'YTD PO Volume', value: totalVolume || '—', delta: '+12.5%', deltaPositive: true, sub: 'YoY growth' },
  ];

  const tableColumns = [
    { key: 'name', label: 'Vendor', format: (r) => `<div style="font-weight:500;">${r.name}</div><div style="font-family: ${FONT.mono}; font-size: 10px; color: ${COLOR.muted};">${r.code}</div>` },
    { key: 'categories', label: 'Categories' },
    { key: 'country', label: 'Location', format: (r) => `<div>${r.city}</div><div style="font-family: ${FONT.mono}; font-size: 10px; color: ${COLOR.muted};">${r.country}</div>` },
    { key: 'contact', label: 'Contact', format: (r) => `<div>${r.contact}</div><div style="color: ${COLOR.muted}; font-size: 11px;">${r.email}</div>` },
    { key: 'gst', label: 'GST / VAT', format: (r) => `<span style="font-family: ${FONT.mono};">${r.gst}</span>` },
    { key: 'paymentTerms', label: 'Terms' },
    { key: 'poVolume', label: 'PO Volume', align: 'right', format: (r) => `<span style="font-family: ${FONT.mono};">${r.poVolume}</span>` },
    { key: 'status', label: 'Status', format: (r) => statusPill(r.status, r.statusKind) },
  ];

  const sections = [
    sectionHeader('KPI', 'Directory summary'),
    kpiGrid(kpis),
    sectionHeader('Records', `Vendor records (${rows.length})`),
    dataTable(tableColumns, rows),
  ];

  const html = buildReportShell({ title: 'Vendor Directory', subtitle: filterDesc || 'VendorBridge Master Records', stamp, sections });
  const root = document.createElement('div');
  root.innerHTML = html;
  return renderRichToCanvas(root).then((canvas) => {
    const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'landscape' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    addCanvasToPdf(canvas, pdf, pageW, pageH);
    stampPageFooters(pdf, stamp);
    pdf.save(filename);
  });
};

export const exportPOPDF = ({ po, vendor, shipTo, lineItems, totals, filename = 'purchase-order.pdf' } = {}) => {
  const stamp = new Date().toLocaleString();
  const subtotal = totals?.subtotal || 0;
  const shipping = totals?.shipping || 0;
  const tax = totals?.tax || 0;
  const totalDue = subtotal + shipping + tax;

  const sections = [
    `<div style="display:grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px;">
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px 22px 20px 22px;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Issue Date</div>
        <div style="font-family: ${FONT.mono}; font-size: 14px; color: ${COLOR.ink};">${po?.issueDate || '—'}</div>
      </div>
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px 22px 20px 22px;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Delivery Date</div>
        <div style="font-family: ${FONT.mono}; font-size: 14px; color: ${COLOR.ink};">${po?.deliveryDate || '—'}</div>
      </div>
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px 22px 20px 22px;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Status</div>
        <div>${statusPill(po?.status || 'APPROVED', 'approved')}</div>
      </div>
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px 22px 20px 22px;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">PO Number</div>
        <div style="font-family: ${FONT.mono}; font-size: 14px; color: ${COLOR.ink};">${po?.number || '—'}</div>
      </div>
    </div>`,
    `<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 8px;">
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 26px;">
        <div style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid ${COLOR.border};">Vendor Details</div>
        <div style="font-size: 16px; font-weight: 500; color: ${COLOR.ink}; margin-bottom: 8px;">${vendor?.name || '—'}</div>
        <div style="color: ${COLOR.muted}; font-size: 13px; line-height: 1.6;">${vendor?.address || ''}</div>
        <div style="font-family: ${FONT.mono}; font-size: 11px; color: ${COLOR.muted}; margin-top: 12px;">${vendor?.id || ''}</div>
      </div>
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 26px;">
        <div style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid ${COLOR.border};">Shipping Destination</div>
        <div style="font-size: 16px; font-weight: 500; color: ${COLOR.ink}; margin-bottom: 8px;">${shipTo?.name || '—'}</div>
        <div style="color: ${COLOR.muted}; font-size: 13px; line-height: 1.6;">${shipTo?.address || ''}</div>
        <div style="font-family: ${FONT.mono}; font-size: 11px; color: ${COLOR.muted}; margin-top: 12px;">${shipTo?.attn || ''}</div>
      </div>
    </div>`,
    sectionHeader('Items', 'Line items'),
    dataTable(
      [
        { key: 'item', label: 'Item Description', format: (r) => `<div style="font-weight:500;">${r.item}</div><div style="font-family: ${FONT.mono}; font-size: 10px; color: ${COLOR.muted}; margin-top: 2px;">${r.sku || ''}</div>` },
        { key: 'qty', label: 'Qty', align: 'right' },
        { key: 'unit', label: 'Unit Price', align: 'right' },
        { key: 'amount', label: 'Amount', align: 'right' },
      ],
      lineItems || []
    ),
    `<div style="display:flex; justify-content:flex-end; margin-top: 28px;">
      <div style="width: 340px; background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px;">
        <div style="display:flex; justify-content:space-between; padding: 8px 0; font-size: 13px; color: ${COLOR.muted};"><span>Subtotal</span><span style="font-family: ${FONT.mono}; color: ${COLOR.ink};">${totals?.subtotal}</span></div>
        <div style="display:flex; justify-content:space-between; padding: 8px 0; font-size: 13px; color: ${COLOR.muted};"><span>Shipping</span><span style="font-family: ${FONT.mono}; color: ${COLOR.ink};">${totals?.shipping}</span></div>
        <div style="display:flex; justify-content:space-between; padding: 8px 0; font-size: 13px; color: ${COLOR.muted};"><span>Tax</span><span style="font-family: ${FONT.mono}; color: ${COLOR.ink};">${totals?.tax}</span></div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 16px 0 0 0; margin-top: 10px; border-top: 1px solid ${COLOR.border};">
          <span style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted};">Total Due</span>
          <span style="font-family: ${FONT.display}; font-size: 22px; color: ${COLOR.ink};">${totalDue}</span>
        </div>
      </div>
    </div>`,
    `<div style="margin-top: 36px; padding: 22px; background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; max-width: 640px;">
      <div style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Terms & Conditions</div>
      <div style="font-size: 12px; color: ${COLOR.muted}; line-height: 1.6;">${po?.terms || 'Please confirm receipt within 48 hours. Net 30 payment terms apply unless otherwise stipulated in the master vendor agreement.'}</div>
    </div>`,
  ];

  const html = buildReportShell({ title: `Purchase Order ${po?.number || ''}`, subtitle: 'Purchase Order', stamp, sections });
  const root = document.createElement('div');
  root.innerHTML = html;
  return renderRichToCanvas(root).then((canvas) => {
    const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'portrait' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    addCanvasToPdf(canvas, pdf, pageW, pageH);
    stampPageFooters(pdf, stamp);
    pdf.save(filename);
  });
};

export const exportInvoicePDF = ({ invoice, billFrom, billTo, lineItems, totals, filename = 'invoice.pdf' } = {}) => {
  const stamp = new Date().toLocaleString();
  const subtotal = totals?.subtotal || 0;
  const shipping = totals?.shipping || 0;
  const tax = totals?.tax || 0;
  const totalDue = subtotal + shipping + tax;
  const taxRate = totals?.taxRate ? `${(totals.taxRate * 100).toFixed(1)}%` : '—';

  const sections = [
    `<div style="display:grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px;">
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px 22px 20px 22px;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Invoice Number</div>
        <div style="font-family: ${FONT.mono}; font-size: 14px; color: ${COLOR.ink};">${invoice?.number || '—'}</div>
      </div>
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px 22px 20px 22px;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Issue Date</div>
        <div style="font-family: ${FONT.mono}; font-size: 14px; color: ${COLOR.ink};">${invoice?.issueDate || '—'}</div>
      </div>
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px 22px 20px 22px;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Due Date</div>
        <div style="font-family: ${FONT.mono}; font-size: 14px; color: ${COLOR.ink};">${invoice?.dueDate || '—'}</div>
      </div>
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px 22px 20px 22px;">
        <div style="font-family: ${FONT.mono}; font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Status</div>
        <div>${statusPill(invoice?.status || 'PENDING', invoice?.statusKind || 'pending')}</div>
      </div>
    </div>`,
    `<div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 8px;">
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 26px;">
        <div style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid ${COLOR.border};">Billed By</div>
        <div style="font-size: 16px; font-weight: 500; color: ${COLOR.ink}; margin-bottom: 8px;">${billFrom?.name || '—'}</div>
        <div style="color: ${COLOR.muted}; font-size: 13px; line-height: 1.6;">${billFrom?.address || ''}</div>
        <div style="font-family: ${FONT.mono}; font-size: 11px; color: ${COLOR.muted}; margin-top: 12px;">${billFrom?.taxId || ''}</div>
      </div>
      <div style="background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 26px;">
        <div style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid ${COLOR.border};">Billed To</div>
        <div style="font-size: 16px; font-weight: 500; color: ${COLOR.ink}; margin-bottom: 8px;">${billTo?.name || '—'}</div>
        <div style="color: ${COLOR.muted}; font-size: 13px; line-height: 1.6;">${billTo?.address || ''}</div>
        <div style="font-family: ${FONT.mono}; font-size: 11px; color: ${COLOR.muted}; margin-top: 12px;">${billTo?.attn || ''}</div>
      </div>
    </div>`,
    sectionHeader('Items', 'Invoiced items'),
    dataTable(
      [
        { key: 'item', label: 'Description', format: (r) => `<div style="font-weight:500;">${r.item}</div><div style="font-family: ${FONT.mono}; font-size: 10px; color: ${COLOR.muted}; margin-top: 2px;">${r.sku || ''}</div>` },
        { key: 'qty', label: 'Qty', align: 'right' },
        { key: 'unit', label: 'Unit Price', align: 'right' },
        { key: 'tax', label: 'Tax', align: 'right' },
        { key: 'amount', label: 'Amount', align: 'right' },
      ],
      lineItems || []
    ),
    `<div style="display:flex; justify-content:flex-end; margin-top: 28px;">
      <div style="width: 360px; background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px; padding: 22px;">
        <div style="display:flex; justify-content:space-between; padding: 8px 0; font-size: 13px; color: ${COLOR.muted};"><span>Subtotal</span><span style="font-family: ${FONT.mono}; color: ${COLOR.ink};">${totals?.subtotal}</span></div>
        <div style="display:flex; justify-content:space-between; padding: 8px 0; font-size: 13px; color: ${COLOR.muted};"><span>Shipping</span><span style="font-family: ${FONT.mono}; color: ${COLOR.ink};">${totals?.shipping}</span></div>
        <div style="display:flex; justify-content:space-between; padding: 8px 0; font-size: 13px; color: ${COLOR.muted};"><span>Tax (${taxRate})</span><span style="font-family: ${FONT.mono}; color: ${COLOR.ink};">${totals?.tax}</span></div>
        <div style="display:flex; justify-content:space-between; align-items:center; padding: 16px 0 0 0; margin-top: 10px; border-top: 1px solid ${COLOR.border};">
          <span style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted};">Total Due</span>
          <span style="font-family: ${FONT.display}; font-size: 24px; color: ${COLOR.ink};">${totalDue}</span>
        </div>
      </div>
    </div>`,
    `<div style="margin-top: 36px; padding: 22px; background: ${COLOR.surfaceLowest}; border: 1px solid ${COLOR.borderSoft}; border-radius: 12px;">
      <div style="font-family: ${FONT.mono}; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: ${COLOR.muted}; margin-bottom: 10px;">Payment Instructions</div>
      <div style="font-size: 12px; color: ${COLOR.muted}; line-height: 1.7;">${invoice?.paymentInstructions || 'Remit payment via bank transfer to the account details on file. Reference the invoice number with your payment. Late payments are subject to a 1.5% monthly service charge.'}</div>
    </div>`,
  ];

  const html = buildReportShell({ title: `Invoice ${invoice?.number || ''}`, subtitle: `Invoice for PO ${invoice?.poNumber || ''}`, stamp, sections });
  const root = document.createElement('div');
  root.innerHTML = html;
  return renderRichToCanvas(root).then((canvas) => {
    const pdf = new jsPDF({ unit: 'px', format: 'a4', orientation: 'portrait' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    addCanvasToPdf(canvas, pdf, pageW, pageH);
    stampPageFooters(pdf, stamp);
    pdf.save(filename);
  });
};
