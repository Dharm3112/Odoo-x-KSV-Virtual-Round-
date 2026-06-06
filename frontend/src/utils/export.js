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
