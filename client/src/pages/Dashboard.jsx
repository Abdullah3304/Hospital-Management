import { useEffect, useState } from 'react';
import api from '../api';
import { downloadFeesPdf } from '../utils/dashboardPdf';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatFees(fees) {
  return Number(fees || 0).toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfPeriod, setPdfPeriod] = useState('weekly');
  const [pdfFrom, setPdfFrom] = useState('');
  const [pdfTo, setPdfTo] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setError('');
      api.get('/dashboard', { params: { page, date, name } })
        .then(({ data }) => {
          setRows(data.rows);
          setTotalPages(data.totalPages);
          setTotal(data.total);
        })
        .catch(err => setError(err.response?.data?.error || 'Failed to load dashboard'))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [page, date, name]);

  const handlePdfDownload = async () => {
    setPdfLoading(true);
    setError('');
    try {
      const params = pdfPeriod === 'custom'
        ? { period: 'custom', from: pdfFrom, to: pdfTo }
        : { period: pdfPeriod };
      const { data } = await api.get('/dashboard/fees-summary', { params });
      downloadFeesPdf(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Business Dashboard</h2>
        <span className="dashboard-total-badge">{total} record{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="dashboard-filters card-panel">
        <h3>Filters</h3>
        <div className="dashboard-filter-row">
          <div className="form-group">
            <label htmlFor="filter-date">Search by Date</label>
            <input
              id="filter-date"
              type="date"
              value={date}
              onChange={e => { setDate(e.target.value); setPage(1); }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="filter-name">Search by Name</label>
            <input
              id="filter-name"
              type="text"
              placeholder="Patient name..."
              value={name}
              onChange={e => { setName(e.target.value); setPage(1); }}
            />
          </div>
          {(date || name) && (
            <button
              type="button"
              className="btn btn-secondary btn-sm dashboard-clear-btn"
              onClick={() => { setDate(''); setName(''); setPage(1); }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <div className="dashboard-pdf card-panel">
        <h3>Download Fees Report (PDF)</h3>
        <div className="dashboard-filter-row">
          <div className="form-group">
            <label htmlFor="pdf-period">Period</label>
            <select
              id="pdf-period"
              value={pdfPeriod}
              onChange={e => setPdfPeriod(e.target.value)}
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>
          {pdfPeriod === 'custom' && (
            <>
              <div className="form-group">
                <label htmlFor="pdf-from">From</label>
                <input
                  id="pdf-from"
                  type="date"
                  value={pdfFrom}
                  onChange={e => setPdfFrom(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="pdf-to">To</label>
                <input
                  id="pdf-to"
                  type="date"
                  value={pdfTo}
                  onChange={e => setPdfTo(e.target.value)}
                />
              </div>
            </>
          )}
          <button
            type="button"
            className="btn btn-primary dashboard-pdf-btn"
            onClick={handlePdfDownload}
            disabled={pdfLoading || (pdfPeriod === 'custom' && (!pdfFrom || !pdfTo))}
          >
            {pdfLoading ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Age</th>
              <th>Number</th>
              <th>Disease</th>
              <th>Fees Paid</th>
              <th>Visited by Doctor</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="no-data">Loading...</td></tr>
            ) : rows.map((row, i) => (
              <tr key={`${row.mobile_number}-${row.disease}-${row.visit_date}-${i}`}>
                <td>{formatDate(row.visit_date)}</td>
                <td>{row.name}</td>
                <td>{row.age}</td>
                <td>{row.mobile_number}</td>
                <td>{row.disease}</td>
                <td>{formatFees(row.fees)}</td>
                <td>{row.visited_by_doctor}</td>
              </tr>
            ))}
            {!loading && !rows.length && (
              <tr><td colSpan="7" className="no-data">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn btn-sm">
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="btn btn-sm">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
