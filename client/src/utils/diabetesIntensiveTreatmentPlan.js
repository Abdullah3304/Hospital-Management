/**
 * When Diabetes history has HbA1c checked and value ≥ 6.4%, treatment plan step
 * shows guided (read-only) cards + notes textareas per clinical infographic.
 */

export function isDiabetesIntensiveTreatmentPlan(history) {
  const inv = history?.diabetes_specific_investigation;
  if (!Array.isArray(inv) || !inv.includes('hba1c')) return false;
  const raw = String(history?.hba1c_value ?? '').trim().replace(/,/g, '');
  if (raw === '') return false;
  const v = parseFloat(raw);
  if (Number.isNaN(v)) return false;
  return v >= 6.4;
}

export function computeChecklistBmi(checklist) {
  if (!checklist) return null;
  const w = parseFloat(checklist.weight_kg);
  const h = parseFloat(checklist.height_m);
  if (!w || !h || h <= 0) return null;
  return Number((w / (h * h)).toFixed(2));
}

const AGE = {
  young: {
    title: 'Young adults (<40 years)',
    bullets: [
      'Longer duration — focus on prevention of complications',
      'Intensive glycemic control (HbA1c <7%)',
      'Consider agents with weight benefit (GLP-1 RA, SGLT2i)',
      'Early combination therapy if needed',
    ],
  },
  middle: {
    title: 'Middle age (40–64 years)',
    bullets: [
      'Standard glycemic target (HbA1c <7%)',
      'Use agents based on weight, comorbidities, cost',
      'Manage CV risk factors aggressively',
    ],
  },
  elderly: {
    title: 'Elderly (≥65 years)',
    bullets: [
      'Individualize targets HbA1c 7.5–8%',
      'Avoid hypoglycemia',
      'Prefer agents with low risk of hypoglycemia',
      'Consider frailty, cognitive status, life expectancy, polypharmacy',
    ],
  },
  unknown: {
    title: 'Age',
    bullets: ['Patient age is not available — confirm age on the patient record for age-stratified guidance.'],
  },
};

const BMI = {
  low_normal: {
    title: 'Low / normal BMI (<25 kg/m²)',
    bullets: [
      'Choose weight-neutral or weight-gain agents if needed',
      'Avoid agents causing weight loss',
      'Focus on nutrition & muscle mass',
    ],
  },
  overweight: {
    title: 'Overweight (BMI 25.0–29.9 kg/m²)',
    bullets: [
      'Lifestyle + Metformin',
      'Add agents with weight benefit if needed: GLP-1 RA, SGLT2 inhibitors',
    ],
  },
  obese: {
    title: 'Obese (BMI ≥30 kg/m²)',
    bullets: [
      'Lifestyle + Metformin',
      'Prefer GLP-1 RA (greatest weight loss)',
      'SGLT2 inhibitors',
      'Consider dual/triple therapy early',
      'Evaluate for bariatric surgery if BMI ≥35 kg/m² (esp. <60 yrs)',
    ],
  },
  unknown: {
    title: 'BMI / weight',
    bullets: ['Enter weight and height in Basic Checklist to compute BMI and show weight-stratified guidance.'],
  },
};

const CV = {
  unstable: {
    title: 'HFrEF / HFmrEF / HFpEF (unstable / significant HF)',
    bullets: [
      'Prioritize drugs with proven HF benefit',
      'SGLT2 inhibitors (Dapagliflozin/Empagliflozin) — reduce HF hospitalization & CV death (Class I)',
      'Continue Metformin if tolerated',
      'Consider GLP-1 RA with CV benefit',
      'Avoid: Pioglitazone (fluid retention)',
      'Monitor volume status & renal function',
    ],
  },
  stable: {
    title: 'Stable / no HF',
    bullets: [
      'Manage per standard protocol',
      'Consider CV risk in overall choice of agents',
    ],
  },
  ihd_pending: {
    title: 'IHD selected',
    bullets: ['On History, choose Stable or Unstable under IHD to show heart-failure–focused guidance.'],
  },
  no_ihd: {
    title: 'IHD / heart failure',
    bullets: ['IHD was not selected on History — apply standard cardiovascular risk review when prescribing.'],
  },
};

const RENAL = {
  ckd_12: {
    title: 'eGFR ≥60 (CKD 1–2)',
    bullets: [
      'Metformin (if tolerated)',
      'SGLT2 inhibitors for renal protection',
      'GLP-1 RA with CV benefit',
      'Control BP, lipids',
      'Monitor albuminuria',
    ],
  },
  ckd_3: {
    title: 'eGFR 30–59 (CKD 3)',
    bullets: [
      'Metformin: continue (reduce dose if eGFR <45)',
      'SGLT2 inhibitors (if eGFR ≥20–25*)',
      'GLP-1 RA preferred',
      'Avoid nephrotoxic drugs',
      'Monitor K+, Cr, albuminuria',
    ],
  },
  ckd_45: {
    title: 'eGFR <30 (CKD 4–5 / dialysis)',
    bullets: [
      'Stop Metformin',
      'Prefer DPP-4 inhibitors (e.g., Linagliptin)',
      'Insulin often required',
      'SGLT2 inhibitors generally not effective (may continue if on dialysis based on specialist advice)',
      'Close monitoring',
    ],
  },
  ckd_pending: {
    title: 'CKD selected',
    bullets: ['In Basic Checklist, choose CKD stage (1–2, 3, or 4–5) to show renal dosing guidance.'],
  },
  no_ckd: {
    title: 'CKD',
    bullets: ['CKD was not selected on Basic Checklist — document CKD stage when applicable for renal dosing.'],
  },
};

const PREG = {
  preg_1_3: {
    title: 'Preconception & early pregnancy (1–3 months)',
    bullets: [
      'Optimize glycemic control (HbA1c <6.5%)',
      'Stop teratogenic drugs (ACEi/ARB, Statins, SGLT2i, GLP-1 RA)',
      'Continue safe agents',
    ],
  },
  preg_3_9: {
    title: 'Pregnancy (4–9 months)',
    bullets: [
      'First-line: Insulin',
      'Metformin may be continued in selected patients (if already on it and benefits > risks)',
      'Monitor glucose (Fasting <95 mg/dL, 1-hr PP <140 mg/dL, 2-hr PP <120 mg/dL)',
      'Folic acid supplementation',
    ],
  },
  postpartum: {
    title: 'Postpartum',
    bullets: [
      'Reassess therapy',
      'Metformin safe in breastfeeding',
      'Contraception counseling',
      'Screen for diabetes 6–12 weeks postpartum (OGTT)',
    ],
  },
  preg_pending: {
    title: 'Pregnancy selected',
    bullets: ['In Basic Checklist, choose timing (1–3 months, 4–9 months, or postpartum) to show antenatal guidance.'],
  },
  no_preg: {
    title: 'Pregnancy',
    bullets: ['Pregnancy was not selected on Basic Checklist — use standard care if status changes.'],
  },
};

function ageCategory(age) {
  const a = Number(age);
  if (Number.isNaN(a) || age == null || age === '') return 'unknown';
  if (a < 40) return 'young';
  if (a < 65) return 'middle';
  return 'elderly';
}

function bmiCategory(bmi) {
  if (bmi == null || Number.isNaN(bmi)) return 'unknown';
  if (bmi < 25) return 'low_normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}

function ihdCategory(history) {
  const com = Array.isArray(history?.comorbidities) ? history.comorbidities : [];
  if (!com.includes('ihd')) return 'no_ihd';
  if (history?.ihd_stability === 'unstable') return 'unstable';
  if (history?.ihd_stability === 'stable') return 'stable';
  return 'ihd_pending';
}

function ckdCategory(checklist) {
  if (!checklist?.ckd) return 'no_ckd';
  const s = checklist.ckd_stage;
  if (s === 'ckd_12' || s === 'ckd_3' || s === 'ckd_45') return s;
  return 'ckd_pending';
}

function pregnancyCategory(checklist) {
  if (!checklist?.pregnancy) return 'no_preg';
  const s = checklist.pregnancy_stage;
  if (s === 'preg_1_3' || s === 'preg_3_9' || s === 'postpartum') return s;
  return 'preg_pending';
}

export const DIABETES_INTENSIVE_NOTE_KEYS = {
  age: 'diabetes_guidance_age_notes',
  bmi: 'diabetes_guidance_bmi_notes',
  cv: 'diabetes_guidance_cv_notes',
  renal: 'diabetes_guidance_renal_notes',
  pregnancy: 'diabetes_guidance_pregnancy_notes',
};

/**
 * @returns {{ sectionTitle: string, noteKey: string, card: { title: string, bullets: string[] } }[]}
 */
export function getDiabetesIntensiveGuidanceBlocks(patientAge, checklistRow, history) {
  const bmi = computeChecklistBmi(checklistRow);
  return [
    {
      sectionTitle: 'AGE',
      noteKey: DIABETES_INTENSIVE_NOTE_KEYS.age,
      card: AGE[ageCategory(patientAge)],
    },
    {
      sectionTitle: 'BMI / WEIGHT',
      noteKey: DIABETES_INTENSIVE_NOTE_KEYS.bmi,
      card: BMI[bmiCategory(bmi)],
    },
    {
      sectionTitle: 'CCF / HEART FAILURE',
      noteKey: DIABETES_INTENSIVE_NOTE_KEYS.cv,
      card: CV[ihdCategory(history)],
    },
    {
      sectionTitle: 'CKD',
      noteKey: DIABETES_INTENSIVE_NOTE_KEYS.renal,
      card: RENAL[ckdCategory(checklistRow)],
    },
    {
      sectionTitle: 'PREGNANCY',
      noteKey: DIABETES_INTENSIVE_NOTE_KEYS.pregnancy,
      card: PREG[pregnancyCategory(checklistRow)],
    },
  ];
}
