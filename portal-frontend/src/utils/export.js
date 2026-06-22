export function exportToXLS(columns, rows, title) {
  let table = '<table><thead><tr>';
  columns.forEach(col => {
    table += `<th>${col}</th>`;
  });
  table += '</tr></thead><tbody>';
  
  rows.forEach(row => {
    table += '<tr>';
    columns.forEach(col => {
      table += `<td>${row[col] ?? ''}</td>`;
    });
    table += '</tr>';
  });
  table += '</tbody></table>';

  const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportToXML(columns, rows, title) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<dataset>\n';
  rows.forEach((row, index) => {
    xml += '  <record>\n';
    columns.forEach(col => {
      let safeCol = String(col).replace(/[^a-zA-Z0-9]/g, '_');
      if (!safeCol) {
        safeCol = 'col_unknown';
      } else if (/^[0-9]/.test(safeCol)) {
        safeCol = 'col_' + safeCol;
      }
      const safeValue = String(row[col] ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      xml += `    <${safeCol}>${safeValue}</${safeCol}>\n`;
    });
    xml += '  </record>\n';
  });
  xml += '</dataset>';

  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportToJSON(columns, rows, title) {
  const filteredRows = rows.map(row => {
    const obj = {};
    columns.forEach(col => {
      obj[col] = row[col] ?? null;
    });
    return obj;
  });
  const json = JSON.stringify(filteredRows, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportToPDF(columns, rows, title) {
  // Create a hidden iframe to prevent cross-tab process freezing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  let html = `
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { text-align: center; font-size: 18px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead>
            <tr>
  `;
  
  columns.forEach(col => {
    html += `<th>${col}</th>`;
  });
  
  html += `
            </tr>
          </thead>
          <tbody>
  `;
  
  rows.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      html += `<td>${row[col] ?? ''}</td>`;
    });
    html += '</tr>';
  });
  
  html += `
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  const doc = iframe.contentWindow || iframe.contentDocument;
  const targetDocument = doc.document || doc;
  
  targetDocument.open();
  targetDocument.write(html);
  targetDocument.close();

  // Wait for the iframe content to load and apply styles before printing
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    // Cleanup the iframe after the print dialog is closed
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 2000);
  }, 500);
}
