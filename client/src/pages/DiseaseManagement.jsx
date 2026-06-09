import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import AssessmentPrintSheet from '../components/AssessmentPrintSheet';
import DiabetesIntensiveTreatmentPlan from '../components/DiabetesIntensiveTreatmentPlan';
import { getDiseaseFlow, getFlowActiveSteps } from '../config/diseaseFlows';
import { printAssessmentSheet } from '../utils/printAssessment';
import { validateDiabetesChecklist, validateDiabetesHistory } from '../utils/diabetesValidation';
import { isDiabetesIntensiveTreatmentPlan } from '../utils/diabetesIntensiveTreatmentPlan';

const STEPS = ['history', 'investigation', 'treatmentPlan', 'prescription'];

function isSectionVisible(section, stepData, allState) {
  if (!section.showWhen) return true;

  const conditions = Array.isArray(section.showWhen) ? section.showWhen : [section.showWhen];

  const matchesCondition = (state, condition) => {
    if (!state || typeof state !== 'object') return false;
    const { field, equals } = condition;
    const value = state[field];
    if (Array.isArray(value)) {
      if (Array.isArray(equals)) {
        return equals.every(eq => value.includes(eq));
      }
      return value.includes(equals);
    }
    return value === equals;
  };

  return conditions.every((condition) => {
    if (matchesCondition(stepData, condition)) return true;
    return Object.values(allState || {}).some(valueSet => matchesCondition(valueSet, condition));
  });
}

export default function DiseaseManagement() {
  const { id, diseaseId } = useParams();
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState(null);
  const [checklistRow, setChecklistRow] = useState(null);
  const [disease, setDisease] = useState(null);
  const [flow, setFlow] = useState(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState({});
  const [investigation, setInvestigation] = useState({});
  const [treatmentPlan, setTreatmentPlan] = useState({});
  const [prescription, setPrescription] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: patient }, { data: diseases }, { data: assessment }, { data: checklist }] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get(`/patients/${id}/diseases`),
          api.get(`/patients/diseases/${diseaseId}/assessment`),
          api.get(`/patients/diseases/${diseaseId}/checklist`),
        ]);
        if (cancelled) return;

        const current = diseases.find(d => String(d.id) === String(diseaseId));
        if (!current) {
          setError('Disease not found for this patient.');
          return;
        }

        setPatientName(patient.name);
        setPatientAge(patient.age ?? null);
        setChecklistRow(checklist || null);
        setDisease(current);
        setFlow(getDiseaseFlow(current.disease));

        if (assessment) {
          setHistory(assessment.history || {});
          setInvestigation(assessment.investigation || {});
          setTreatmentPlan(assessment.treatment_plan || {});
          setPrescription(assessment.prescription || {});
          setSubmitted(!!assessment.submitted);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Failed to load assessment.');
      }
    })();
    return () => { cancelled = true; };
  }, [id, diseaseId]);

  useEffect(() => {
    let savedTitle = document.title;
    const onBeforePrint = () => {
      savedTitle = document.title;
      document.title = ' ';
    };
    const onAfterPrint = () => {
      document.title = savedTitle;
    };
    window.addEventListener('beforeprint', onBeforePrint);
    window.addEventListener('afterprint', onAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint);
      window.removeEventListener('afterprint', onAfterPrint);
    };
  }, []);

  const stateBag = useMemo(() => ({
    history: [history, setHistory],
    investigation: [investigation, setInvestigation],
    treatmentPlan: [treatmentPlan, setTreatmentPlan],
    prescription: [prescription, setPrescription],
  }), [history, investigation, treatmentPlan, prescription]);

  const intensiveDiabetesTreatmentPlan = useMemo(
    () => disease?.disease === 'Diabetes' && isDiabetesIntensiveTreatmentPlan(history),
    [disease?.disease, history],
  );

  const activeSteps = useMemo(
    () => getFlowActiveSteps(flow, disease?.disease, investigation),
    [flow, disease?.disease, investigation?.cardiac_risk_level],
  );

  useEffect(() => {
    if (step >= activeSteps.length) {
      setStep(Math.max(0, activeSteps.length - 1));
    }
  }, [activeSteps, step]);

  const handleSubmit = async () => {
    if (disease?.disease === 'Diabetes') {
      const checklistErr = validateDiabetesChecklist(checklistRow);
      const historyErr = validateDiabetesHistory(history);
      const msg = checklistErr || historyErr;
      if (msg) {
        setError(msg);
        return;
      }
    }
    setSaving(true);
    setError('');
    try {
      await api.put(`/patients/diseases/${diseaseId}/assessment`, {
        history,
        investigation,
        treatment_plan: treatmentPlan,
        prescription,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save assessment.');
    } finally {
      setSaving(false);
    }
  };

  if (error && !disease) {
    return (
      <div>
        <div className="page-header"><h2>Disease Management</h2></div>
        <div className="error-msg">{error}</div>
      </div>
    );
  }

  if (!disease || !flow) {
    if (disease && !flow) {
      return (
        <div>
          <div className="page-header">
            <h2>Disease Management &mdash; {disease.disease}</h2>
            <button onClick={() => navigate(-1)} className="btn btn-secondary">Back</button>
          </div>
          <div className="form-card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Coming soon</h3>
            <p style={{ color: '#666' }}>
              The management flow for <strong>{disease.disease}</strong> hasn't been
              configured yet.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  const stepKey = activeSteps[step];
  const sections = flow[stepKey];
  const title = flow.pageTitle?.[stepKey] || stepKey.toUpperCase();
  const isLast = step === activeSteps.length - 1;
  const [stepData, setStepData] = stateBag[stepKey];

  return (
    <div className="management-page management-print-root">
      <div className="management-screen-only">
        <div className="page-header">
          <h2 style={{ fontSize: '0.95rem', color: '#666', fontWeight: 500 }}>
            {patientName} &mdash; {disease.disease}
            {submitted && <span className="badge-submitted">Submitted</span>}
          </h2>
          <button onClick={() => navigate(`/patients/${id}/diseases`)} className="btn btn-secondary btn-sm">
            Cancel
          </button>
        </div>

        <div className="step-indicator">
          {activeSteps.map((s, i) => (
            <div key={s} className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
              <span>{i + 1}</span>
            </div>
          ))}
        </div>

        <h1 className="management-title">
          {title.split('\n').map((line, i) => <div key={i}>{line}</div>)}
        </h1>

        {error && <div className="error-msg">{error}</div>}

        {stepKey === 'prescription' && (
          <PrescriptionDoctorRow prescription={prescription} setPrescription={setPrescription} />
        )}

        <div className="management-card">
          {stepKey === 'prescription' ? (
            <PrescriptionField
              value={prescription.notes}
              onChange={val => setPrescription(prev => ({ ...prev, notes: val }))}
            />
          ) : stepKey === 'treatmentPlan' && intensiveDiabetesTreatmentPlan ? (
            <DiabetesIntensiveTreatmentPlan
              patientAge={patientAge}
              checklistRow={checklistRow}
              history={history}
              treatmentPlan={treatmentPlan}
              setTreatmentPlan={setTreatmentPlan}
            />
          ) : Array.isArray(sections) ? (
            sections.filter(section => isSectionVisible(section, stepData, { history, investigation, treatmentPlan, prescription })).map(section => (
            <Section
              key={section.key}
              section={section}
              value={stepData[section.key]}
              onChange={(val) => {
                if (disease?.disease === 'Diabetes' && stepKey === 'history' && section.key === 'comorbidities') {
                  setHistory((h) => {
                    const n = { ...h, comorbidities: val };
                    if (Array.isArray(val) && !val.includes('ihd')) n.ihd_stability = '';
                    return n;
                  });
                } else if (disease?.disease === 'Diabetes' && stepKey === 'history' && section.key === 'diabetes_specific_investigation') {
                  setHistory((h) => {
                    const n = { ...h, diabetes_specific_investigation: val };
                    if (Array.isArray(val) && !val.includes('hba1c')) n.hba1c_value = '';
                    return n;
                  });
                } else {
                  setStepData({ ...stepData, [section.key]: val });
                }
              }}
              diabetesIhd={
                disease?.disease === 'Diabetes' && stepKey === 'history' && section.key === 'comorbidities'
                  ? {
                      stability: stepData.ihd_stability,
                      merge: (patch) => setHistory((h) => ({ ...h, ...patch })),
                    }
                  : null
              }
              hba1cFollowup={
                disease?.disease === 'Diabetes' && stepKey === 'history' && section.key === 'diabetes_specific_investigation'
                  ? {
                      value: stepData.hba1c_value ?? '',
                      merge: (patch) => setHistory((h) => ({ ...h, ...patch })),
                    }
                  : null
              }
            />
          ))
          ) : null}
        </div>

        <div className="management-actions">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="btn btn-secondary">
              Previous
            </button>
          )}
          <div style={{ flex: 1 }} />
          {!isLast && (
            <button onClick={() => setStep(step + 1)} className="btn btn-primary">
              Next
            </button>
          )}
          {isLast && (
            <>
              <button
                type="button"
                onClick={printAssessmentSheet}
                disabled={!submitted}
                className="btn btn-secondary"
                title={submitted ? 'Print prescription' : 'Save first to enable printing'}
              >
                Print
              </button>
              <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
                {saving ? 'Saving...' : submitted ? 'Update' : 'Submit'}
              </button>
            </>
          )}
        </div>
      </div>

      <AssessmentPrintSheet
        patientName={patientName}
        patientAge={patientAge}
        diseaseName={disease?.disease}
        checklist={checklistRow}
        investigation={investigation}
        prescription={prescription}
        flow={flow}
      />
    </div>
  );
}

function StaticSection({ section }) {
  if (section.type === 'staticGrid') {
    return (
      <div className="management-section management-static-grid">
        {section.title && <h3 className="section-title">{section.title}</h3>}
        <div className="management-static-grid-row">
          {section.cards.map(card => (
            <div key={card.title} className="management-static-grid-card">
              <h4>{card.title}</h4>
              <div className="management-static-body">{card.body}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="management-section management-static-block">
      <h3 className="section-title">{section.title}</h3>
      <div className="management-static-body">{section.body}</div>
    </div>
  );
}

function BilateralYesNoGridSection({ section, value, onChange }) {
  const data = value && typeof value === 'object' ? value : {};
  const setCell = (rowKey, side, yn) => {
    const rowVal = data[rowKey] && typeof data[rowKey] === 'object' ? data[rowKey] : {};
    onChange({ ...data, [rowKey]: { ...rowVal, [side]: yn } });
  };
  return (
    <div className="management-section">
      <h3 className="section-title">{section.title}</h3>
      <table className="bilateral-yesno-table">
        <thead>
          <tr>
            <th className="bilateral-yesno-label-col" />
            <th>Right</th>
            <th>Left</th>
          </tr>
        </thead>
        <tbody>
          {(section.rows || []).map((row) => {
            const rowVal = data[row.key] && typeof data[row.key] === 'object' ? data[row.key] : {};
            return (
              <tr key={row.key}>
                <td className="bilateral-yesno-label-col">{row.label}</td>
                <td>
                  <select
                    className="bilateral-yesno-select"
                    value={rowVal.right || ''}
                    onChange={e => setCell(row.key, 'right', e.target.value)}
                  >
                    <option value="">—</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
                <td>
                  <select
                    className="bilateral-yesno-select"
                    value={rowVal.left || ''}
                    onChange={e => setCell(row.key, 'left', e.target.value)}
                  >
                    <option value="">—</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MonofilamentSitesSection({ section, value, onChange }) {
  const data = value && typeof value === 'object' ? value : { right: {}, left: {} };
  const right = data.right && typeof data.right === 'object' ? data.right : {};
  const left = data.left && typeof data.left === 'object' ? data.left : {};

  const setMark = (side, siteKey, mark) => {
    const sideObj = { ...(side === 'right' ? right : left) };
    if (mark === 'clear') {
      delete sideObj[siteKey];
    } else {
      sideObj[siteKey] = mark;
    }
    onChange({ ...data, [side]: sideObj });
  };

  return (
    <div className="management-section">
      <h3 className="section-title">{section.title}</h3>
      {section.instruction && (
        <p className="monofilament-instruction">{section.instruction}</p>
      )}
      <table className="monofilament-sites-table">
        <thead>
          <tr>
            <th>Site</th>
            <th>Right</th>
            <th>Left</th>
          </tr>
        </thead>
        <tbody>
          {(section.sites || []).map((site) => (
            <tr key={site.key}>
              <td>{site.label}</td>
              <td>
                <div className="monofilament-toggle-group">
                  <button
                    type="button"
                    className={`monofilament-btn ${right[site.key] === '+' ? 'active' : ''}`}
                    onClick={() => setMark('right', site.key, '+')}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={`monofilament-btn ${right[site.key] === '-' ? 'active' : ''}`}
                    onClick={() => setMark('right', site.key, '-')}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm monofilament-clear"
                    onClick={() => setMark('right', site.key, 'clear')}
                  >
                    Clear
                  </button>
                </div>
              </td>
              <td>
                <div className="monofilament-toggle-group">
                  <button
                    type="button"
                    className={`monofilament-btn ${left[site.key] === '+' ? 'active' : ''}`}
                    onClick={() => setMark('left', site.key, '+')}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className={`monofilament-btn ${left[site.key] === '-' ? 'active' : ''}`}
                    onClick={() => setMark('left', site.key, '-')}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm monofilament-clear"
                    onClick={() => setMark('left', site.key, 'clear')}
                  >
                    Clear
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Digits and at most one decimal point (for optional HbA1C % field). */
function sanitizeHbA1cNumericInput(raw) {
  if (raw == null || raw === '') return '';
  let s = String(raw).replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    s = `${s.slice(0, dot + 1)}${s.slice(dot + 1).replace(/\./g, '')}`;
  }
  return s;
}

function Section({ section, value, onChange, diabetesIhd, hba1cFollowup }) {
  if (section.type === 'sectionHeading') {
    return (
      <div className="management-section management-section-heading">
        <h3 className="section-title">{section.title}</h3>
      </div>
    );
  }

  if (section.type === 'static' || section.type === 'staticGrid') {
    return <StaticSection section={section} />;
  }

  if (section.type === 'bilateralYesNoGrid') {
    return <BilateralYesNoGridSection section={section} value={value} onChange={onChange} />;
  }

  if (section.type === 'monofilamentSites') {
    return <MonofilamentSitesSection section={section} value={value} onChange={onChange} />;
  }

  if (section.type === 'checkbox') {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (key) => {
      onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
    };
    return (
      <div className="management-section">
        {section.title?.trim() && <h3 className="section-title">{section.title}</h3>}
        <div className="checkbox-grid">
          {section.options.map(opt => (
            <label key={opt.key} className="checkbox-row">
              <input
                type="checkbox"
                checked={selected.includes(opt.key)}
                onChange={() => toggle(opt.key)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
        {diabetesIhd && selected.includes('ihd') && (
          <div className="ihd-stability-followup">
            <p className="ihd-stability-label">IHD classification (required)</p>
            <label className="checkbox-row">
              <input
                type="radio"
                name="diabetes-ihd-stability"
                checked={diabetesIhd.stability === 'stable'}
                onChange={() => diabetesIhd.merge({ ihd_stability: 'stable' })}
              />
              <span>Stable</span>
            </label>
            <label className="checkbox-row">
              <input
                type="radio"
                name="diabetes-ihd-stability"
                checked={diabetesIhd.stability === 'unstable'}
                onChange={() => diabetesIhd.merge({ ihd_stability: 'unstable' })}
              />
              <span>Unstable</span>
            </label>
          </div>
        )}
        {hba1cFollowup && selected.includes('hba1c') && (
          <div className="hba1c-value-followup">
            <label className="hba1c-value-label" htmlFor="diabetes-hba1c-value">HbA1C value (optional, numeric)</label>
            <input
              id="diabetes-hba1c-value"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              className="hba1c-value-input"
              value={hba1cFollowup.value}
              onChange={(e) => {
                const v = sanitizeHbA1cNumericInput(e.target.value);
                hba1cFollowup.merge({ hba1c_value: v });
              }}
              placeholder="e.g. 7.2"
            />
          </div>
        )}
      </div>
    );
  }

  if (section.type === 'text') {
    return (
      <div className="management-section">
        <h3 className="section-title">{section.label}</h3>
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          readOnly={!!section.readOnly}
          placeholder={section.readOnly ? '' : `Enter ${section.label.toLowerCase()}...`}
        />
      </div>
    );
  }

  if (section.type === 'prescription') {
    return <PrescriptionField value={value} onChange={onChange} />;
  }

  if (section.type === 'textarea') {
    return (
      <div className="management-section">
        <h3 className="section-title">{section.label}</h3>
        <textarea
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          rows={4}
          placeholder={`Enter ${section.label.toLowerCase()}...`}
        />
      </div>
    );
  }

  if (section.type === 'select') {
    return (
      <div className="management-section">
        <h3 className="section-title">{section.label}</h3>
        <select value={value || ''} onChange={e => onChange(e.target.value)}>
          <option value="">Select {section.label.toLowerCase()}...</option>
          {section.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}

function PrescriptionDoctorRow({ prescription, setPrescription }) {
  return (
    <div className="prescription-doctor-row">
      <div className="form-group">
        <label htmlFor="prescription-doctor-name">Doctor name:</label>
        <input
          id="prescription-doctor-name"
          type="text"
          value={prescription.override_doctor_name || ''}
          onChange={e =>
            setPrescription(prev => ({ ...prev, override_doctor_name: e.target.value }))
          }
          placeholder="Doctor name"
        />
      </div>
      <div className="form-group">
        <label htmlFor="prescription-doctor-qualifications">Qualifications:</label>
        <input
          id="prescription-doctor-qualifications"
          type="text"
          value={prescription.override_doctor_qualifications || ''}
          onChange={e =>
            setPrescription(prev => ({ ...prev, override_doctor_qualifications: e.target.value }))
          }
          placeholder="Qualifications"
        />
      </div>
    </div>
  );
}

const BULLET = '• ';

function PrescriptionField({ value, onChange }) {
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    const ta = e.target;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = value || '';
    const insert = `\n${BULLET}`;
    const next = text.slice(0, start) + insert + text.slice(end);
    onChange(next);
    const pos = start + insert.length;
    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.selectionStart = pos;
      textareaRef.current.selectionEnd = pos;
    });
  };

  return (
    <div className="management-section prescription-section">
      <textarea
        ref={textareaRef}
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={14}
        placeholder="Enter prescription… (Enter for new bullet, Shift+Enter for new line)"
      />
    </div>
  );
}
