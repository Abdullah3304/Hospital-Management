/**
 * Build printable rows from disease checklist API row — only non-empty / true values.
 */
export function getFilledChecklistEntries(checklist) {
  if (!checklist) return [];

  const t = (v) => v != null && String(v).trim() !== '';

  const entries = [];

  if (t(checklist.blood_pressure)) {
    entries.push({ label: 'Blood Pressure', value: String(checklist.blood_pressure).trim() });
  }
  if (t(checklist.pulse)) {
    entries.push({ label: 'Pulse', value: String(checklist.pulse).trim() });
  }
  if (t(checklist.temperature)) {
    entries.push({ label: 'Temperature', value: String(checklist.temperature).trim() });
  }
  if (t(checklist.respiratory_rate)) {
    entries.push({ label: 'Respiratory Rate', value: String(checklist.respiratory_rate).trim() });
  }
  if (checklist.weight_kg != null && checklist.weight_kg !== '') {
    entries.push({ label: 'Weight', value: `${checklist.weight_kg} Kilograms` });
  }
  if (checklist.height_m != null && checklist.height_m !== '') {
    entries.push({ label: 'Height', value: `${checklist.height_m} meters` });
  }
  if (checklist.bmi != null && checklist.bmi !== '') {
    entries.push({ label: 'BMI', value: String(checklist.bmi) });
  }
  if (checklist.ckd) {
    const stageLabels = { ckd_12: 'CKD 1–2', ckd_3: 'CKD 3', ckd_45: 'CKD 4–5' };
    const st = checklist.ckd_stage && stageLabels[checklist.ckd_stage];
    entries.push({ label: 'CKD', value: st ? `Yes (${st})` : 'Yes' });
  }
  if (checklist.pregnancy) {
    const pl = { preg_1_3: '1–3 months', preg_4_9: '4–9 months', postpartum: 'Postpartum' };
    const st = checklist.pregnancy_stage && pl[checklist.pregnancy_stage];
    entries.push({ label: 'Pregnancy', value: st ? `Yes (${st})` : 'Yes' });
  }

  return entries;
}

/**
 * From flow config + step key (e.g. 'investigation') + saved JSON,
 * return blocks with only filled content (checkbox selections, non-empty text/select).
 */
export function getFilledFlowStepSections(flow, stepKey, data) {
  if (!flow || !data) return [];
  const sections = flow[stepKey];
  if (!Array.isArray(sections)) return [];

  const blocks = [];

  for (const section of sections) {
    if (section.type === 'prescription' || section.type === 'static') continue;

    const val = data[section.key];

    if (section.type === 'bilateralYesNoGrid') {
      const obj = val && typeof val === 'object' ? val : {};
      const lines = [];
      for (const row of section.rows || []) {
        const cell = obj[row.key];
        if (!cell || typeof cell !== 'object') continue;
        const r = cell.right;
        const l = cell.left;
        if (!r && !l) continue;
        const fmt = (v) => (v === 'yes' ? 'Yes' : v === 'no' ? 'No' : v);
        const parts = [];
        if (r) parts.push(`Right: ${fmt(r)}`);
        if (l) parts.push(`Left: ${fmt(l)}`);
        lines.push(`${row.label}: ${parts.join('; ')}`);
      }
      if (!lines.length) continue;
      const heading = (section.title || '').trim() || 'Details';
      blocks.push({ heading, lines: lines.map((text) => ({ text })) });
      continue;
    }

    if (section.type === 'monofilamentSites') {
      const obj = val && typeof val === 'object' ? val : { right: {}, left: {} };
      const right = obj.right && typeof obj.right === 'object' ? obj.right : {};
      const left = obj.left && typeof obj.left === 'object' ? obj.left : {};
      const lines = [];
      for (const site of section.sites || []) {
        const r = right[site.key];
        const l = left[site.key];
        if (!r && !l) continue;
        const rs = r === '+' ? '+' : r === '-' ? '−' : '';
        const ls = l === '+' ? '+' : l === '-' ? '−' : '';
        lines.push(`${site.label}: Right ${rs || '—'}; Left ${ls || '—'}`);
      }
      if (!lines.length) continue;
      const heading = (section.title || '').trim() || 'Sensory exam';
      blocks.push({ heading, lines: lines.map((text) => ({ text })) });
      continue;
    }

    if (section.type === 'checkbox') {
      const selected = Array.isArray(val) ? val : [];
      const labels = section.options
        ?.filter((opt) => selected.includes(opt.key))
        .map((opt) => opt.label) ?? [];
      if (!labels.length) continue;

      const heading = (section.title || section.label || '').trim() || 'Details';
      const lines = labels.map((text) => ({ text }));
      if (section.key === 'comorbidities' && selected.includes('ihd')) {
        const st = data.ihd_stability;
        if (st === 'stable' || st === 'unstable') {
          lines.push({ text: `IHD: ${st === 'stable' ? 'Stable' : 'Unstable'}` });
        }
      }
      if (section.key === 'diabetes_specific_investigation' && selected.includes('hba1c')) {
        const hv = data.hba1c_value;
        if (hv != null && String(hv).trim() !== '') {
          lines.push({ text: `HbA1C value: ${String(hv).trim()}` });
        }
      }
      blocks.push({ heading, lines });
      continue;
    }

    if (section.type === 'textarea' || section.type === 'text' || section.type === 'select') {
      if (val == null || String(val).trim() === '') continue;
      const heading = (section.label || section.title || '').trim() || 'Details';
      blocks.push({ heading, lines: [{ text: String(val).trim() }] });
    }
  }

  return blocks;
}

export function getPrescriptionNotes(prescription) {
  if (!prescription || typeof prescription !== 'object') return '';
  const raw = prescription.notes;
  return raw == null ? '' : String(raw);
}

function trimText(value) {
  return value == null ? '' : String(value).trim();
}

const DEFAULT_PRINT_DOCTOR = {
  name: 'Prof Dr M. Mohsin Gillani',
  qualifications: [
    'Head of Department General Surgery & Surgical Oncology (GSSO)',
    'Fellow of College of Physician & Surgeon (Pak)',
    'Fellowship in Advanced Laparoscopic Obesity Surgery (BELGIUM)',
    'Fellow of American College of Surgeon (USA)',
    'Director Advance Laparoscopic Surgery Center (SMDC, LHR)',
    'Director Scandinavian Obesity & Diabetes Clinic',
    'Advance Laparoscopic Bariatric, Metabolic & Cancer Surgeon',
    'Director ALCODS',
  ].join('\n'),
};

/**
 * Print header doctor: prescription override → default nameplate text.
 * @returns {{ type: 'custom', name: string, qualifications: string }}
 */
export function getPrintDoctorHeader(_investigation, prescription) {
  const overrideName = trimText(prescription?.override_doctor_name);
  const overrideQual = trimText(prescription?.override_doctor_qualifications);
  if (overrideName || overrideQual) {
    return { type: 'custom', name: overrideName, qualifications: overrideQual };
  }

  return {
    type: 'custom',
    name: DEFAULT_PRINT_DOCTOR.name,
    qualifications: DEFAULT_PRINT_DOCTOR.qualifications,
  };
}
