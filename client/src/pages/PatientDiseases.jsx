import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const CHECKLIST_CONFIG = {
  'Sugar': ['blood_pressure', 'weight', 'scan', 'medication'],
  'Foot Machine': ['blood_pressure', 'weight', 'scan', 'medication'],
  'Lipo': ['blood_pressure', 'weight', 'scan', 'medication'],
};

const CHECKLIST_LABELS = {
  blood_pressure: 'Blood Pressure',
  weight: 'Weight',
  scan: 'Scan',
  medication: 'Medication',
};

export default function PatientDiseases() {
  const { id } = useParams();
  const [diseases, setDiseases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [doctorNotes, setDoctorNotes] = useState('');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    api.get(`/patients/${id}`).then(({ data }) => setPatientName(data.name));
    api.get(`/patients/${id}/diseases`).then(({ data }) => setDiseases(data));
  }, [id]);

  const openChecklist = async (disease) => {
    setSelected(disease);
    const { data } = await api.get(`/patients/diseases/${disease.id}/checklist`);
    if (data) {
      setChecklist({
        blood_pressure: data.blood_pressure,
        weight: data.weight,
        scan: data.scan,
        medication: data.medication,
      });
      setDoctorNotes(data.doctor_notes || '');
    } else {
      setChecklist({ blood_pressure: false, weight: false, scan: false, medication: false });
      setDoctorNotes('');
    }
  };

  const saveChecklist = async () => {
    await api.put(`/patients/diseases/${selected.id}/checklist`, {
      ...checklist,
      doctor_notes: doctorNotes,
    });
    setSelected(null);
  };

  const items = selected ? (CHECKLIST_CONFIG[selected.disease] || []) : [];

  return (
    <div>
      <div className="page-header">
        <h2>Diseases &mdash; {patientName}</h2>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Disease</th>
              <th>Fees</th>
              <th>Added On</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map(d => (
              <tr key={d.id} onClick={() => openChecklist(d)} className="clickable">
                <td>{d.disease}</td>
                <td>{d.fees}</td>
                <td>{new Date(d.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {!diseases.length && (
              <tr><td colSpan="3" className="no-data">No diseases found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Checklist &mdash; {selected.disease}</h3>
              <button onClick={() => setSelected(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              {items.map(item => (
                <label key={item} className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={checklist[item] || false}
                    onChange={e => setChecklist({ ...checklist, [item]: e.target.checked })}
                  />
                  <span>{CHECKLIST_LABELS[item]}</span>
                </label>
              ))}
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Doctor Notes</label>
                <textarea
                  value={doctorNotes}
                  onChange={e => setDoctorNotes(e.target.value)}
                  rows={6}
                  placeholder="Enter doctor notes here..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={saveChecklist} className="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
