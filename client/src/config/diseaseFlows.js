// Per-disease management flow configuration.
//
// Each disease defines three pages (history, investigation, treatmentPlan),
// each with one or more sections. Sections are either:
//   - { type: 'checkbox', key, title, options: [{ key, label }] }
//   - { type: 'textarea', key, label }
//   - { type: 'select',   key, label, options: ['...'] }
//
// To add a new disease flow, add a new top-level entry. The DB stores the
// responses as JSONB keyed by section.key so no schema changes are needed.

export const Obesity = {
  pageTitle: {
    history: 'HISTORY',
    investigation: 'PRE-OPERATIVE INVESTIGATION\nBARIATRIC / METABOLIC SURGERY',
    treatmentPlan: 'TREATMENT PLAN',
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
};

const DISEASE_FLOWS = {
  Obesity,
};

export function getDiseaseFlow(disease) {
  return DISEASE_FLOWS[disease] || null;
}

export default DISEASE_FLOWS;
