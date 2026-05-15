import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const EMPTY_CHECKLIST = {
  blood_pressure: '',
  pulse: '',
  temperature: '',
  respiratory_rate: '',
  weight_kg: '',
  height_m: '',
  chronic_diseases: '',
  stroke: false,
  ckd: false,
  dcld: false,
  pregnancy: false,
  notes: '',
};

function computeBmi(weightKg, heightM) {
  const w = parseFloat(weightKg);
  const h = parseFloat(heightM);
  if (!w || !h || h <= 0) return '';
  return (w / (h * h)).toFixed(2);
}

export default function PatientDiseases() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diseases, setDiseases] = useState([]);
  const [selected, setSelected] = useState(null);
  const [checklist, setChecklist] = useState(EMPTY_CHECKLIST);
  const [patientName, setPatientName] = useState('');

  const bmi = useMemo(
    () => computeBmi(checklist.weight_kg, checklist.height_m),
    [checklist.weight_kg, checklist.height_m],
  );

  useEffect(() => {
    api.get(`/patients/${id}`).then(({ data }) => setPatientName(data.name));
    api.get(`/patients/${id}/diseases`).then(({ data }) => setDiseases(data));
  }, [id]);

  const openChecklist = async (disease) => {
    setSelected(disease);
    const { data } = await api.get(`/patients/diseases/${disease.id}/checklist`);
    if (data) {
      setChecklist({
        blood_pressure: data.blood_pressure ?? '',
        pulse: data.pulse ?? '',
        temperature: data.temperature ?? '',
        respiratory_rate: data.respiratory_rate ?? '',
        weight_kg: data.weight_kg != null ? String(data.weight_kg) : '',
        height_m: data.height_m != null ? String(data.height_m) : '',
        chronic_diseases: data.chronic_diseases ?? '',
        stroke: !!data.stroke,
        ckd: !!data.ckd,
        dcld: !!data.dcld,
        pregnancy: !!data.pregnancy,
        notes: data.notes ?? data.doctor_notes ?? '',
      });
    } else {
      setChecklist({ ...EMPTY_CHECKLIST });
    }
  };

  const closeChecklist = () => {
    setSelected(null);
    setChecklist({ ...EMPTY_CHECKLIST });
  };

  const updateField = (key, value) => {
    setChecklist(prev => ({ ...prev, [key]: value }));
  };

  const saveChecklist = async () => {
    const payload = {
      ...checklist,
      weight_kg: checklist.weight_kg === '' ? null : Number(checklist.weight_kg),
      height_m: checklist.height_m === '' ? null : Number(checklist.height_m),
      bmi: bmi === '' ? null : Number(bmi),
    };
    await api.put(`/patients/diseases/${selected.id}/checklist`, payload);
    closeChecklist();
  };

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diseases.map(d => (
              <tr key={d.id}>
                <td>{d.disease}</td>
                <td>{d.fees}</td>
                <td>{new Date(d.created_at).toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => openChecklist(d)}
                    >
                      Basic Checklist
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/patients/${id}/diseases/${d.id}/management`)}
                    >
                      {d.assessment_submitted ? 'View / Edit Management' : 'Start Management'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!diseases.length && (
              <tr><td colSpan="4" className="no-data">No diseases found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={closeChecklist}>
          <div className="modal modal-checklist" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Basic Checklist &mdash; {selected.disease}</h3>
              <button onClick={closeChecklist} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Blood Pressure</label>
                <input
                  type="text"
                  value={checklist.blood_pressure}
                  onChange={e => updateField('blood_pressure', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Pulse</label>
                <input
                  type="text"
                  value={checklist.pulse}
                  onChange={e => updateField('pulse', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Temperature</label>
                <input
                  type="text"
                  value={checklist.temperature}
                  onChange={e => updateField('temperature', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Respiratory Rate</label>
                <input
                  type="text"
                  value={checklist.respiratory_rate}
                  onChange={e => updateField('respiratory_rate', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Weight</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={checklist.weight_kg}
                    onChange={e => updateField('weight_kg', e.target.value)}
                  />
                  <span className="input-unit">Kilograms</span>
                </div>
              </div>
              <div className="form-group">
                <label>Height</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={checklist.height_m}
                    onChange={e => updateField('height_m', e.target.value)}
                  />
                  <span className="input-unit">meters</span>
                </div>
              </div>
              <div className="form-group">
                <label>BMI</label>
                <input type="text" value={bmi} readOnly placeholder="Auto-calculated from weight and height" />
              </div>
              <div className="form-group">
                <label>Chronic diseases / Known Case</label>
                <input
                  type="text"
                  value={checklist.chronic_diseases}
                  onChange={e => updateField('chronic_diseases', e.target.value)}
                />
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={checklist.stroke}
                  onChange={e => updateField('stroke', e.target.checked)}
                />
                <span>Stroke</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={checklist.ckd}
                  onChange={e => updateField('ckd', e.target.checked)}
                />
                <span>CKD</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={checklist.dcld}
                  onChange={e => updateField('dcld', e.target.checked)}
                />
                <span>DCLD</span>
              </label>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={checklist.pregnancy}
                  onChange={e => updateField('pregnancy', e.target.checked)}
                />
                <span>Pregnancy</span>
              </label>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Notes</label>
                <textarea
                  value={checklist.notes}
                  onChange={e => updateField('notes', e.target.value)}
                  rows={4}
                  placeholder="Enter notes..."
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
