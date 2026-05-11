import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function PatientListing() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get('/patients', { params: { page, search } }).then(({ data }) => {
        setPatients(data.patients);
        setTotalPages(data.totalPages);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [page, search]);

  return (
    <div>
      <div className="page-header">
        <h2>Patients</h2>
        <div className="page-header-actions">
          <input
            type="text"
            placeholder="Search by mobile number..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="search-input"
          />
          <button onClick={() => navigate('/patients/new')} className="btn btn-primary">
            Add Patient
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Mobile Number</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} onClick={() => navigate(`/patients/${p.id}/edit`)} className="clickable">
                <td>{p.name}</td>
                <td>{p.age}</td>
                <td>{p.gender}</td>
                <td>{p.mobile_number}</td>
                <td>
                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/patients/${p.id}/diseases`); }}
                    className="btn btn-primary btn-sm"
                  >
                    Treatment Status
                  </button>
                </td>
              </tr>
            ))}
            {!patients.length && (
              <tr><td colSpan="5" className="no-data">No patients found</td></tr>
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
