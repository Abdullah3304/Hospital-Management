import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { validateDiabetesChecklist } from '../utils/diabetesValidation';

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
  ckd_stage: '',
  dcld: false,
  pregnancy: false,
  pregnancy_stage: '',
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
  const [checklistError, setChecklistError] = useState('');

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
        ckd_stage: data.ckd_stage || '',
        dcld: !!data.dcld,
        pregnancy: !!data.pregnancy,
        pregnancy_stage: data.pregnancy_stage || '',
        notes: data.notes ?? data.doctor_notes ?? '',
      });
    } else {
      setChecklist({ ...EMPTY_CHECKLIST });
    }
  };

  const closeChecklist = () => {
    setSelected(null);
    setChecklist({ ...EMPTY_CHECKLIST });
    setChecklistError('');
  };

  const updateField = (key, value) => {
    setChecklist(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'ckd' && !value) next.ckd_stage = '';
      if (key === 'pregnancy' && !value) next.pregnancy_stage = '';
      return next;
    });
  };

  const saveChecklist = async () => {
    setChecklistError('');
    const payload = {
      ...checklist,
      weight_kg: checklist.weight_kg === '' ? null : Number(checklist.weight_kg),
      height_m: checklist.height_m === '' ? null : Number(checklist.height_m),
      bmi: bmi === '' ? null : Number(bmi),
      ckd_stage: checklist.ckd ? checklist.ckd_stage || null : null,
      pregnancy_stage: checklist.pregnancy ? checklist.pregnancy_stage || null : null,
    };
    if (selected.disease === 'Diabetes') {
      const err = validateDiabetesChecklist({
        ...payload,
        ckd: !!checklist.ckd,
        pregnancy: !!checklist.pregnancy,
      });
      if (err) {
        setChecklistError(err);
        return;
      }
    }
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
              {checklistError && <div className="error-msg">{checklistError}</div>}
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
                <label>
                  Weight
                  {selected.disease === 'Diabetes' && <span className="label-required"> *</span>}
                </label>
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
                <label>
                  Height
                  {selected.disease === 'Diabetes' && <span className="label-required"> *</span>}
                </label>
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
              {selected.disease === 'Diabetes' && checklist.ckd && (
                <div className="checklist-suboptions" role="group" aria-label="CKD stage">
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="ckd_stage"
                      checked={checklist.ckd_stage === 'ckd_12'}
                      onChange={() => updateField('ckd_stage', 'ckd_12')}
                    />
                    <span>CKD 1–2</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="ckd_stage"
                      checked={checklist.ckd_stage === 'ckd_3'}
                      onChange={() => updateField('ckd_stage', 'ckd_3')}
                    />
                    <span>CKD 3</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="ckd_stage"
                      checked={checklist.ckd_stage === 'ckd_45'}
                      onChange={() => updateField('ckd_stage', 'ckd_45')}
                    />
                    <span>CKD 4–5</span>
                  </label>
                </div>
              )}
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
              {selected.disease === 'Diabetes' && checklist.pregnancy && (
                <div className="checklist-suboptions" role="group" aria-label="Pregnancy timing">
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="pregnancy_stage"
                      checked={checklist.pregnancy_stage === 'preg_1_3'}
                      onChange={() => updateField('pregnancy_stage', 'preg_1_3')}
                    />
                    <span>Pregnancy 1–3 months</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="pregnancy_stage"
                      checked={checklist.pregnancy_stage === 'preg_4_9'}
                      onChange={() => updateField('pregnancy_stage', 'preg_4_9')}
                    />
                    <span>Pregnancy 4–9 months</span>
                  </label>
                  <label className="radio-row">
                    <input
                      type="radio"
                      name="pregnancy_stage"
                      checked={checklist.pregnancy_stage === 'postpartum'}
                      onChange={() => updateField('pregnancy_stage', 'postpartum')}
                    />
                    <span>Postpartum</span>
                  </label>
                </div>
              )}
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
