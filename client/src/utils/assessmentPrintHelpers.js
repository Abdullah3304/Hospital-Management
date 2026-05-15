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
  if (t(checklist.chronic_diseases)) {
    entries.push({ label: 'Chronic diseases / Known Case', value: String(checklist.chronic_diseases).trim() });
  }
  if (checklist.stroke) entries.push({ label: 'Stroke', value: 'Yes' });
  if (checklist.ckd) entries.push({ label: 'CKD', value: 'Yes' });
  if (checklist.dcld) entries.push({ label: 'DCLD', value: 'Yes' });
  if (checklist.pregnancy) entries.push({ label: 'Pregnancy', value: 'Yes' });
  if (t(checklist.notes)) {
    entries.push({ label: 'Notes', value: String(checklist.notes).trim() });
  }

  return entries;
}

/**
 * From flow config + step key ('history' | 'investigation') + saved JSON,
 * return blocks with only filled content (checkbox selections, non-empty text/select).
 */
export function getFilledFlowStepSections(flow, stepKey, data) {
  if (!flow || !data) return [];
  const sections = flow[stepKey];
  if (!Array.isArray(sections)) return [];

  const blocks = [];

  for (const section of sections) {
    if (section.type === 'prescription') continue;

    const val = data[section.key];

    if (section.type === 'checkbox') {
      const selected = Array.isArray(val) ? val : [];
      const labels = section.options
        ?.filter((opt) => selected.includes(opt.key))
        .map((opt) => opt.label) ?? [];
      if (!labels.length) continue;

      const heading = (section.title || section.label || '').trim() || 'Details';
      blocks.push({ heading, lines: labels.map((text) => ({ text })) });
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
