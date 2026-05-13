import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

const DISEASES = ['Diabetes', 'Diabetic Foot', 'Laproscopic', 'Obesity', 'Neuropathic Pain', 'Stem Cell Therapy', 'Erectile Dysfunction'];

export default function PatientForm({ addDisease }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && !addDisease;
  const isAddDisease = !!id && !!addDisease;

  const [form, setForm] = useState({
    name: '', age: '', gender: '', mobile_number: '', disease: '', fees: ''
  });
  const [diseaseId, setDiseaseId] = useState(null);
  const [originalDisease, setOriginalDisease] = useState('');
  const [existingDiseases, setExistingDiseases] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/patients/${id}`).then(({ data }) => {
      setForm({
        name: data.name,
        age: data.age,
        gender: data.gender,
        mobile_number: data.mobile_number,
        disease: isAddDisease ? '' : (data.latestDisease?.disease || ''),
        fees: isAddDisease ? '' : (data.latestDisease?.fees || '')
      });
      setDiseaseId(data.latestDisease?.id || null);
      setOriginalDisease(data.latestDisease?.disease || '');
      setExistingDiseases(data.existingDiseases || []);
    });
  }, [id]);

  const availableDiseases = isAddDisease
    ? DISEASES.filter(d => !existingDiseases.includes(d))
    : isEdit
      ? DISEASES.filter(d => d === originalDisease || !existingDiseases.includes(d))
      : DISEASES;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile_number' && !/^\d*$/.test(value)) return;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isAddDisease) {
        await api.post(`/patients/${id}/diseases`, { disease: form.disease, fees: form.fees });
      } else if (isEdit) {
        await api.put(`/patients/${id}`, { ...form, diseaseId });
      } else {
        await api.post('/patients', form);
      }
      navigate('/patients');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  const readOnly = isAddDisease;

  return (
    <div>
      <div className="page-header">
        <h2>{isAddDisease ? 'Add New Disease' : isEdit ? 'Edit Patient' : 'Add Patient'}</h2>
        {isEdit && (
          <button onClick={() => navigate(`/patients/${id}/add-disease`)} className="btn btn-primary">
            Add New Disease
          </button>
        )}
        {!isEdit && !isAddDisease && (
          <button disabled className="btn btn-disabled">Add New Disease</button>
        )}
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              name="mobile_number"
              type="text"
              inputMode="numeric"
              value={form.mobile_number}
              onChange={handleChange}
              readOnly={readOnly}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} readOnly={readOnly} required />
            </div>
            <div className="form-group">
              <label>Age</label>
              <input name="age" type="number" min="1" max="99" value={form.age} onChange={handleChange} readOnly={readOnly} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} disabled={readOnly} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="form-group">
              <label>Disease</label>
              <select name="disease" value={form.disease} onChange={handleChange} required>
                <option value="">Select Disease</option>
                {availableDiseases.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Fees</label>
            <input name="fees" type="number" min="1" value={form.fees} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn btn-primary full-width">
            {isAddDisease ? 'Save' : isEdit ? 'Update' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
