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

export const exportPDF = ({
  filename = 'export.pdf',
  title = 'VendorBridge Export',
  subtitle = '',
  columns = [],
  rows = [],
  meta = {},
  orientation = 'portrait',
} = {}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 48;
  const [r, g, b] = hexToRgb('#1a1a1a');
  const [ar, ag, ab] = hexToRgb('#615e57');

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
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      textColor: [26, 26, 26],
      lineColor: [229, 225, 216],
      lineWidth: 0.4,
    },
    headStyles: {
      fillColor: [245, 245, 240],
      textColor: [97, 94, 87],
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [250, 250, 247] },
    columnStyles: Object.fromEntries(
      columns.map((c, i) => [i, c.align ? { halign: c.align } : {}])
    ),
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
