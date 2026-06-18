import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount) {
  return `Rs. ${Number(amount || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function periodLabel(period, from, to) {
  if (period === 'weekly') return `Weekly Report (${formatDate(from)} – ${formatDate(to)})`;
  if (period === 'monthly') return `Monthly Report (${formatDate(from)} – ${formatDate(to)})`;
  return `Custom Report (${formatDate(from)} – ${formatDate(to)})`;
}

export function downloadFeesPdf(summary) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const title = 'ALCODS — Business Fees Report';
  const subtitle = periodLabel(summary.period, summary.from, summary.to);

  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(80);
  doc.text(subtitle, 14, 26);
  doc.setTextColor(0);

  doc.setFontSize(12);
  doc.text(`Total Fees: ${formatCurrency(summary.totalFees)}`, 14, 36);
  doc.text(`Total Visits: ${summary.visitCount}`, 14, 43);

  if (summary.breakdown?.length) {
    autoTable(doc, {
      startY: 50,
      head: [['Disease', 'Visits', 'Fees']],
      body: summary.breakdown.map(row => [
        row.disease,
        String(row.count),
        formatCurrency(row.fees),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210] },
      styles: { fontSize: 9 },
    });
  }

  const detailStartY = (doc.lastAutoTable?.finalY || 50) + 10;
  doc.setFontSize(12);
  doc.text('Visit Details', 14, detailStartY);

  autoTable(doc, {
    startY: detailStartY + 4,
    head: [['Date', 'Name', 'Age', 'Mobile', 'Disease', 'Fees', 'Doctor']],
    body: (summary.rows || []).map(row => [
      formatDate(row.visit_date),
      row.name,
      String(row.age),
      row.mobile_number,
      row.disease,
      formatCurrency(row.fees),
      row.visited_by_doctor || '—',
    ]),
    theme: 'striped',
    headStyles: { fillColor: [25, 118, 210] },
    styles: { fontSize: 8 },
  });

  const filename = `fees-report-${summary.from}-to-${summary.to}.pdf`;
  doc.save(filename);
}
