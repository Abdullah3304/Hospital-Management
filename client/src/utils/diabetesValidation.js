const CKD_STAGES = ['ckd_12', 'ckd_3', 'ckd_45'];
const PREGNANCY_STAGES = ['preg_1_3', 'preg_4_9', 'postpartum'];

export function validateDiabetesChecklist(row) {
  if (!row) return 'Open Basic Checklist and save required vitals for this patient first.';
  const w = row.weight_kg;
  const h = row.height_m;
  if (w == null || w === '' || Number.isNaN(Number(w)) || Number(w) <= 0) {
    return 'Weight is required for diabetes (for BMI).';
  }
  if (h == null || h === '' || Number.isNaN(Number(h)) || Number(h) <= 0) {
    return 'Height is required for diabetes (for BMI).';
  }
  if (row.ckd && !CKD_STAGES.includes(row.ckd_stage)) {
    return 'CKD is selected: choose CKD 1–2, CKD 3, or CKD 4–5.';
  }
  if (row.pregnancy && !PREGNANCY_STAGES.includes(row.pregnancy_stage)) {
    return 'Pregnancy is selected: choose timing (1–3 months, 4–9 months, or postpartum).';
  }
  return null;
}

export function validateDiabetesHistory(history) {
  const com = Array.isArray(history?.comorbidities) ? history.comorbidities : [];
  if (com.includes('ihd')) {
    const s = history?.ihd_stability;
    if (s !== 'stable' && s !== 'unstable') {
      return 'IHD is selected: choose Stable or Unstable on the History page.';
    }
  }
  return null;
}
