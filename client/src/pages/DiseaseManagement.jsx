import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { getDiseaseFlow } from '../config/diseaseFlows';

const STEPS = ['history', 'investigation', 'treatmentPlan'];

export default function DiseaseManagement() {
  const { id, diseaseId } = useParams();
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('');
  const [disease, setDisease] = useState(null);
  const [flow, setFlow] = useState(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [history, setHistory] = useState({});
  const [investigation, setInvestigation] = useState({});
  const [treatmentPlan, setTreatmentPlan] = useState({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ data: patient }, { data: diseases }, { data: assessment }] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get(`/patients/${id}/diseases`),
          api.get(`/patients/diseases/${diseaseId}/assessment`),
        ]);
        if (cancelled) return;

        const current = diseases.find(d => String(d.id) === String(diseaseId));
        if (!current) {
          setError('Disease not found for this patient.');
          return;
        }

        setPatientName(patient.name);
        setDisease(current);
        setFlow(getDiseaseFlow(current.disease));

        if (assessment) {
          setHistory(assessment.history || {});
          setInvestigation(assessment.investigation || {});
          setTreatmentPlan(assessment.treatment_plan || {});
          setSubmitted(!!assessment.submitted);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.error || 'Failed to load assessment.');
      }
    })();
    return () => { cancelled = true; };
  }, [id, diseaseId]);

  const stateBag = useMemo(() => ({
    history: [history, setHistory],
    investigation: [investigation, setInvestigation],
    treatmentPlan: [treatmentPlan, setTreatmentPlan],
  }), [history, investigation, treatmentPlan]);

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.put(`/patients/diseases/${diseaseId}/assessment`, {
        history,
        investigation,
        treatment_plan: treatmentPlan,
      });
      setSubmitted(true);
      navigate(`/patients/${id}/diseases`);
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

  const activeSteps = flow.steps || STEPS;
  const stepKey = activeSteps[step];
  const sections = flow[stepKey];
  const title = flow.pageTitle?.[stepKey] || stepKey.toUpperCase();
  const isLast = step === activeSteps.length - 1;
  const [stepData, setStepData] = stateBag[stepKey];

  return (
    <div className="management-page">
      <div className="page-header">
        <h2 style={{ fontSize: '0.95rem', color: '#666', fontWeight: 500 }}>
          {patientName} &mdash; {disease.disease}
          {submitted && <span className="badge-submitted">Submitted</span>}
        </h2>
        <button onClick={() => navigate(`/patients/${id}/diseases`)} className="btn btn-secondary btn-sm">
          Cancel
        </button>
      </div>

      <h1 className="management-title">
        {title.split('\n').map((line, i) => <div key={i}>{line}</div>)}
      </h1>

      <div className="step-indicator">
        {activeSteps.map((s, i) => (
          <div key={s} className={`step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}>
            <span>{i + 1}</span>
          </div>
        ))}
      </div>

      {error && <div className="error-msg">{error}</div>}

      <div className="management-card">
        {sections.map(section => (
          <Section
            key={section.key}
            section={section}
            value={stepData[section.key]}
            onChange={val => setStepData({ ...stepData, [section.key]: val })}
          />
        ))}
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
          <button onClick={handleSubmit} disabled={saving} className="btn btn-primary">
            {saving ? 'Saving...' : submitted ? 'Update' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}

function Section({ section, value, onChange }) {
  if (section.type === 'checkbox') {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (key) => {
      onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
    };
    return (
      <div className="management-section">
        <h3 className="section-title">{section.title}</h3>
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
          placeholder={`Enter ${section.label.toLowerCase()}...`}
        />
      </div>
    );
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
