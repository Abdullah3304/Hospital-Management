// Per-disease management flow configuration.
//
// Each disease defines three pages (history, investigation, treatmentPlan),
// each with one or more sections. Sections are either:
//   - { type: 'checkbox', key, title, options: [{ key, label }] }
//   - { type: 'textarea', key, label }
//   - { type: 'select',   key, label, options: ['...'] }
//   - { type: 'prescription', key }  — bullet list (Enter = new bullet, Shift+Enter = newline)
//
// To add a new disease flow, add a new top-level entry. The DB stores the
// responses as JSONB keyed by section.key so no schema changes are needed.

export const Obesity = {
  pageTitle: {
    history: 'HISTORY',
    investigation: 'PRE-OPERATIVE INVESTIGATION\nBARIATRIC / METABOLIC SURGERY',
    treatmentPlan: 'TREATMENT PLAN',
    prescription: 'PRESCRIPTION',
  },
  history: [
    {
      type: 'checkbox',
      key: 'comorbidities',
      title: 'COMORBIDITIES OF OBESITY',
      options: [
        { key: 'diabetes', label: 'Diabetes' },
        { key: 'hypertension', label: 'Hypertension' },
        { key: 'ihd', label: 'IHD' },
        { key: 'nephropathy', label: 'Nephropathy' },
        { key: 'retinopathy', label: 'Retinopathy' },
        { key: 'pcos', label: 'Polycystic ovarian syndrome (PCOS)' },
        { key: 'sleep_apnea', label: 'Sleep Apnea' },
        { key: 'headache', label: 'Headache' },
        { key: 'knee_pain', label: 'Knee Pain' },
        { key: 'back_pain', label: 'Back Pain' },
        { key: 'gerd', label: 'GERD Symptoms' },
        { key: 'fungal_infection', label: 'Fungal Infection (in skin folds)' },
        { key: 'active_uti', label: 'Active UTI' },
      ],
    },
    {
      type: 'checkbox',
      key: 'psychology',
      title: 'PSYCHOLOGY ISSUES',
      options: [
        { key: 'depression', label: 'Depression' },
        { key: 'anxiety', label: 'Anxiety' },
        { key: 'social_isolation', label: 'Social isolation' },
        { key: 'low_self_esteem', label: 'Low self esteem' },
      ],
    },
    {
      type: 'checkbox',
      key: 'past_history',
      title: 'PAST HISTORY',
      options: [
        { key: 'dvt', label: 'DVT' },
        { key: 'varicose_vein', label: 'Varicose Vein' },
        { key: 'acne', label: 'Acne' },
        { key: 'osteoporosis', label: 'Osteoporosis' },
        { key: 'laparotomy', label: 'Laparotomy' },
        { key: 'cancer_surgery', label: 'Any Cancer Surgery' },
        { key: 'chemo_radio', label: 'Chemotherapy / Radiotherapy' },
        { key: 'ibd_ibs', label: 'IBD / IBS' },
        { key: 'bariatric_surgery', label: 'Bariatric Surgery' },
        { key: 'gastric_balloon', label: 'Gastric Balloon' },
        { key: 'family_gastric_carcinoma', label: 'Family History of Gastric Carcinoma' },
      ],
    },
    {
      type: 'checkbox',
      key: 'habits',
      title: 'HABITS',
      options: [
        { key: 'smoking', label: 'Smoking' },
        { key: 'grazer', label: 'Grazer' },
        { key: 'sweet_lover', label: 'Sweet lover' },
        { key: 'alcohol', label: 'Alcohol' },
        { key: 'high_volume_eater', label: 'High Volume eater' },
      ],
    },
    {
      type: 'checkbox',
      key: 'medication',
      title: 'MEDICATION',
      options: [
        { key: 'nsaid_user', label: 'NSAID User' },
        { key: 'blood_thinner_user', label: 'Blood Thinner User' },
        { key: 'anti_psychotic', label: 'Anti-Psychotic Medicine' },
      ],
    },
  ],
  investigation: [
    {
      type: 'checkbox',
      key: 'routine_labs',
      title: 'ROUTINE LABS',
      options: [
        { key: 'cbc_blood_grouping', label: 'CBC and Blood Grouping' },
        { key: 'fasting_blood_glucose', label: 'Fasting blood glucose' },
        { key: 'kidney_function', label: 'Kidney function' },
        { key: 'liver_profile', label: 'Liver profile' },
        { key: 'lipid_profile', label: 'Lipid profile' },
        { key: 'urine_analysis', label: 'Urine analysis' },
        { key: 'pt_inr', label: 'Prothrombin time / INR' },
        { key: 'serum_electrolytes', label: 'Serum Electrolytes' },
        { key: 'viral_marker', label: 'Viral Marker (mainly Anti HCV and HBsAg)' },
      ],
    },
    {
      type: 'checkbox',
      key: 'cardiopulmonary',
      title: 'CARDIOPULMONARY EVALUATION WITH SLEEP APNEA SCREENING',
      options: [
        { key: 'ecg', label: 'ECG' },
        { key: 'cxr', label: 'CXR' },
        { key: 'echocardiography', label: 'Echocardiography (if cardiac disease or pulmonary hypertension suspected)' },
        { key: 'dvt_evaluation', label: 'DVT evaluation (if clinically indicated)' },
        { key: 'pfts', label: 'PFTs (pulmonary function tests)' },
      ],
    },
    {
      type: 'checkbox',
      key: 'nutrient_screening',
      title: 'NUTRIENT SCREENING',
      options: [
        { key: 'iron_studies', label: 'Iron studies' },
        { key: 'b12_folic_acid', label: 'B12 and folic acid (RBC folate, homocysteine, methylmalonic acid optional)' },
        { key: 'vitamin_d', label: '25-vitamin D (vitamin A and E optional); consider more extensive testing' },
        { key: 'malabsorptive_screening', label: 'Patients undergoing malabsorptive procedures \u2014 based on symptoms and risks' },
      ],
    },
  ],
  treatmentPlan: [
    { type: 'textarea', key: 'lifestyle_modification', label: 'Life Style Modification' },
    { type: 'textarea', key: 'diet_management', label: 'Diet Management' },
    { type: 'textarea', key: 'oral_medication', label: 'Oral Medication' },
    { type: 'textarea', key: 'injectables', label: 'Injectables' },
    {
      type: 'select',
      key: 'surgery',
      label: 'Surgery',
      options: [
        'Sleeve Gastrectomy',
        'MGB / DAGB',
        'SASI Bypass',
        'ROUX-N-Y Gastric Bypass',
      ],
    },
  ],
  prescription: [{ type: 'prescription', key: 'notes' }],
};

// Diabetes shares the entire Obesity flow, but its History page has one
// extra section appended after MEDICATION (per clinical requirements).
// Pages 2 & 3 are reused as-is; data is persisted under the patient's
// own treatment_assessments row, keyed by patient_disease_id, so there
// is no collision with Obesity assessments.
export const Diabetes = {
  ...Obesity,
  history: [
    ...Obesity.history,
    {
      type: 'checkbox',
      key: 'diabetes_specific_investigation',
      title: 'SPECIFIC PRE-OPERATIVE INVESTIGATION REQUIRED FOR METABOLIC (DIABETES TYPE II) PATIENTS',
      options: [
        { key: 'hba1c', label: 'HbA1C' },
        { key: 'fasting_c_peptide', label: 'Fasting serum C - peptide Level' },
        { key: 'c_peptide_2hr', label: 'Serum C - peptide level after 2 hour meal' },
        { key: 'fasting_insulin', label: 'Fasting serum Insulin Level' },
        { key: 'gad_65_autoantibodies', label: 'GAD 65 Autoantibodies' },
        { key: 'rft', label: 'RFT' },
        { key: 'urine_ce', label: 'Urine C/E' },
      ],
    },
  ],
};

// History + investigation only (same content as Diabetes initially; customize per disease as needed).
export const DiabeticFoot = {
  ...Diabetes,
  steps: ['history', 'investigation', 'prescription'],
};

export const Laproscopic = {
  ...Diabetes,
  steps: ['history', 'investigation', 'prescription'],
};

export const NeuropathicPain = {
  ...Diabetes,
  steps: ['history', 'investigation', 'treatmentPlan', 'prescription'],
  pageTitle: {
    ...Obesity.pageTitle,
    treatmentPlan: 'PAINFUL DIABETIC PERIPHERAL NEUROPATHY',
    prescription: 'PRESCRIPTION',
  },
  treatmentPlan: [
    {
      type: 'checkbox',
      key: 'risk_factors_lifestyle',
      title: 'RISK FACTOR & LIFESTYLE MODIFICATIONS',
      options: [
        { key: 'optimise_glycaemic_control', label: 'Optimise glycaemic control' },
        { key: 'optimise_cardiovascular_risk', label: 'Optimise cardiovascular risk factors' },
      ],
    },
    {
      type: 'checkbox',
      key: 'mono_pharmacotherapy',
      title: 'MONO PHARMACOTHERAPY',
      options: [
        { key: 'gabapentinoid', label: 'Gabapentinoid' },
        { key: 'tca', label: 'TCA' },
        { key: 'snri', label: 'SNRI' },
      ],
    },
    {
      type: 'checkbox',
      key: 'non_pharmacological',
      title: 'NON-PHARMACOLOGICAL TREATMENTS',
      options: [
        { key: 'psychological_support', label: 'Psychological support' },
        { key: 'acupuncture', label: 'Acupuncture' },
        { key: 'tens_frems', label: 'TENS-FREMS' },
      ],
    },
    {
      type: 'checkbox',
      key: 'combination_pharmacotherapy',
      title: 'COMBINATION PHARMACOTHERAPY',
      options: [
        { key: 'gabapentinoid_tca_snri', label: 'Gabapentinoid + TCA or SNRI' },
        { key: 'tca_gabapentinoid', label: 'TCA + Gabapentinoid' },
        { key: 'snri_gabapentinoid', label: 'SNRI + Gabapentinoid' },
      ],
    },
    {
      type: 'checkbox',
      key: 'additional_treatment',
      title: 'ADDITIONAL TREATMENT',
      options: [
        { key: 'capsaicin_patch', label: 'Capsaicin 8% patch' },
        { key: 'lidocaine_patch', label: 'Lidocaine 5% patch' },
        { key: 'tramadol_short_term', label: 'Tramadol (short-term)' },
      ],
    },
    {
      type: 'checkbox',
      key: 'specialist_pain_service',
      title: 'SPECIALIST PAIN SERVICE TREATMENT',
      options: [
        { key: 'spinal_cord_stimulation', label: 'Spinal cord stimulation' },
        { key: 'lidocaine_infusion', label: 'Lidocaine infusion' },
      ],
    },
  ],
};

export const ErectileDysfunction = {
  steps: ['history', 'investigation', 'prescription'],
  pageTitle: {
    history: 'HISTORY',
    investigation: 'PHYSICAL EXAMINATION',
    prescription: 'PRESCRIPTION',
  },
  history: [
    { type: 'select', key: 'morning_erection', label: 'Morning Erection', options: ['Yes', 'No'] },
    { type: 'select', key: 'libido', label: 'Libido', options: ['High', 'Low'] },
    {
      type: 'checkbox',
      key: 'hypogonadism',
      title: '',
      options: [{ key: 'hypogonadism', label: 'Hypogonadism' }],
    },
    {
      type: 'checkbox',
      key: 'ejaculatory_function',
      title: 'EJACULATORY FUNCTION',
      options: [{ key: 'ejaculatory_function', label: 'Ejaculatory Function' }],
    },
    {
      type: 'checkbox',
      key: 'comorbidities',
      title: 'COMORBIDITIES',
      options: [
        { key: 'dm_duration', label: 'DM Duration' },
        { key: 'htn', label: 'HTN' },
        { key: 'cvd', label: 'CVD' },
      ],
    },
    {
      type: 'checkbox',
      key: 'drugs',
      title: 'DRUGS',
      options: [
        { key: 'ssris', label: 'SSRIs' },
        { key: 'beta_blockers', label: 'Beta-blockers' },
        { key: 'thiazides', label: 'Thiazides' },
        { key: 'smoking', label: 'Smoking' },
        { key: 'alcohol', label: 'Alcohol' },
      ],
    },
    {
      type: 'select',
      key: 'onset_type',
      label: 'Onset Type',
      options: ['Organic Etiology', 'Psychogenic Etiology'],
    },
  ],
  investigation: [
    { type: 'text', key: 'bmi', label: 'BMI' },
    { type: 'text', key: 'waist_circumference', label: 'Waist Circumference Obesity' },
    { type: 'text', key: 'bp', label: 'BP' },
    {
      type: 'checkbox',
      key: 'vascular_risk_genital_exam',
      title: 'VASCULAR RISK GENITAL EXAM',
      options: [
        { key: 'peyronies_testicular_atrophy', label: "Peyronie's Testicular Atrophy" },
        { key: 'secondary_sexual_characteristics', label: 'Secondary Sexual Characteristics' },
        { key: 'neuropathy_signs', label: 'Neuropathy Signs' },
      ],
    },
    {
      type: 'checkbox',
      key: 'essential_labs',
      title: 'ESSENTIAL LABS',
      options: [
        { key: 'fasting_hba1c', label: 'Fasting/HbA1c' },
        { key: 'lipid_profile', label: 'Lipid Profile' },
        { key: 'serum_creatinine', label: 'Serum Creatinine' },
        { key: 'morning_testosterone', label: 'Morning Testosterone' },
        { key: 'lh_fsh_prolactin', label: 'LH/FSH/Prolactin' },
      ],
    },
  ],
  prescription: [{ type: 'prescription', key: 'notes' }],
};

const DISEASE_FLOWS = {
  Obesity,
  Diabetes,
  'Diabetic Foot': DiabeticFoot,
  Laproscopic,
  'Neuropathic Pain': NeuropathicPain,
  'Erectile Dysfunction': ErectileDysfunction,
};

export function getDiseaseFlow(disease) {
  return DISEASE_FLOWS[disease] || null;
}

export default DISEASE_FLOWS;
