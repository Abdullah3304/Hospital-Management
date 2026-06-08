// Per-disease management flow configuration.
//
// Each disease defines three pages (history, investigation, treatmentPlan),
// each with one or more sections. Sections are either:
//   - { type: 'checkbox', key, title, options: [{ key, label }] }
//   - { type: 'textarea', key, label }
//   - { type: 'select',   key, label, options: ['...'] }
//   - { type: 'prescription', key }  — bullet list (Enter = new bullet, Shift+Enter = newline)
//   - { type: 'static', key, title, body }  — read-only (e.g. ABPI reference scale)
//   - { type: 'bilateralYesNoGrid', key, title, rows: [{ key, label }] }
//   - { type: 'monofilamentSites', key, title, instruction?, sites: [{ key, label }] }
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

// Diabetic Foot: same history + investigation as Diabetes; step 3 = foot exam (stored in treatment_plan JSONB); step 4 = prescription.
export const DiabeticFoot = {
  ...Diabetes,
  steps: ['history', 'investigation', 'treatmentPlan', 'prescription'],
  pageTitle: {
    ...Diabetes.pageTitle,
    treatmentPlan: 'DIABETIC FOOT EXAM',
  },
  treatmentPlan: [
    {
      type: 'bilateralYesNoGrid',
      key: 'foot_inspection',
      title: 'INSPECTION',
      rows: [
        { key: 'deformities', label: 'Deformities' },
        { key: 'callus', label: 'Callus' },
        { key: 'ulceration', label: 'Ulceration' },
        { key: 'amputation', label: 'Amputation' },
      ],
    },
    {
      type: 'bilateralYesNoGrid',
      key: 'palpable_pulses',
      title: 'PALPABLE PULSES',
      rows: [
        { key: 'dorsalis_pedis', label: 'Dorsalis pedis' },
        { key: 'tibialis_posterior', label: 'Tibialis posterior' },
      ],
    },
    {
      type: 'static',
      key: 'abpi_reference',
      title: 'ANKLE BRACHIAL PRESSURE INDEX (ABPI) — reference',
      body: `1.00 to 1.29: normal
0.91 to 0.99: borderline ischemia
0.41 to 0.90: mild to moderate ischemia
0.40 or less: severe disease`,
    },
    { type: 'text', key: 'abpi_right', label: 'ABPI — Right' },
    { type: 'text', key: 'abpi_left', label: 'ABPI — Left' },
    {
      type: 'monofilamentSites',
      key: 'sensory_monofilament',
      title: 'SENSORY FOOT EXAM (10g MONOFILAMENT)',
      instruction:
        'Label each site with + if the patient can feel the 10-gram nylon filament, − if not. Use Clear to reset a site.',
      sites: [
        { key: 'toe_1', label: '1st toe (pad)' },
        { key: 'toe_3', label: '3rd toe (pad)' },
        { key: 'toe_5', label: '5th toe (pad)' },
        { key: 'mth_1', label: '1st metatarsal head' },
        { key: 'mth_3', label: '3rd metatarsal head' },
        { key: 'mth_5', label: '5th metatarsal head' },
        { key: 'midfoot_medial', label: 'Medial midfoot' },
        { key: 'midfoot_lateral', label: 'Lateral midfoot' },
        { key: 'heel', label: 'Heel' },
        { key: 'hallux_dorsal', label: 'Hallux (dorsal / nail bed area)' },
      ],
    },
    {
      type: 'static',
      key: 'vibratory_instruction',
      title: 'VIBRATORY SENSATION',
      body:
        'Using a Rydell–Seiffer tuning fork, test the areas indicated by the clinical protocol; record the score for each foot below.',
    },
    { type: 'text', key: 'vibratory_right', label: 'Vibratory score — Right foot' },
    { type: 'text', key: 'vibratory_left', label: 'Vibratory score — Left foot' },
    {
      type: 'checkbox',
      key: 'risk_low',
      title: 'LOW-RISK PATIENT (all of the following that apply)',
      options: [
        { key: 'intact_protective_sensation', label: 'Intact protective sensation' },
        { key: 'pedal_pulses_present', label: 'Pedal pulses present' },
        { key: 'no_severe_deformity', label: 'No severe deformity' },
        { key: 'no_prior_foot_ulcer', label: 'No prior foot ulcer' },
        { key: 'no_amputation', label: 'No amputation' },
      ],
    },
    {
      type: 'checkbox',
      key: 'risk_high',
      title: 'HIGH-RISK PATIENT (one or more of the following)',
      options: [
        { key: 'loss_protective_sensation', label: 'Loss of protective sensation' },
        { key: 'history_foot_ulcer', label: 'History of foot ulcer' },
        { key: 'absent_pedal_pulses', label: 'Absent pedal pulses' },
        { key: 'severe_foot_deformity', label: 'Severe foot deformity' },
      ],
    },
    {
      type: 'select',
      key: 'education_prior',
      label: 'Has the patient had prior foot care education?',
      options: ['Yes', 'No'],
    },
    {
      type: 'select',
      key: 'education_self_care',
      label: 'Can the patient demonstrate appropriate self-care?',
      options: ['Yes', 'No'],
    },
    {
      type: 'checkbox',
      key: 'management_plan',
      title: 'MANAGEMENT PLAN',
      options: [
        { key: 'provide_preventive_education', label: 'Provide patient education for preventive foot care' },
      ],
    },
  ],
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
  checklist: {
    hidePregnancy: true,
    maleOnly: true,
  },
  steps: ['history', 'investigation', 'treatmentPlan', 'prescription'],
  pageTitle: {
    history: 'HISTORY',
    investigation: 'PHYSICAL EXAMINATION',
    treatmentPlan: 'TREATMENT PLAN',
    prescription: 'PRESCRIPTION',
  },
  history: [
    {
      type: 'select',
      key: 'onset_type',
      label: 'Onset Type',
      options: ['Gradual', 'Sudden'],
    },
    { type: 'text', key: 'etiology', label: 'Etiology', readOnly: true },
    { type: 'select', key: 'morning_erection', label: 'Morning Erection', options: ['Yes', 'No'] },
    { type: 'select', key: 'nocturnal_erection', label: 'Nocturnal Erection', options: ['Yes', 'No'] },
    { type: 'select', key: 'libido', label: 'Libido', options: ['High', 'Low'] },
    {
      type: 'checkbox',
      key: 'hypogonadism',
      title: 'HYPOGONADISM',
      showWhen: { field: 'libido', equals: 'Low' },
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
      ],
    },
    {
      type: 'checkbox',
      key: 'lifestyle',
      title: 'LIFESTYLE',
      options: [
        { key: 'smoking', label: 'Smoking' },
        { key: 'alcohol', label: 'Alcohol' },
        { key: 'inactivity', label: 'Inactivity' },
      ],
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
      ],
    },
    {
      type: 'select',
      key: 'morning_testosterone_result',
      label: 'Morning Total Testosterone (8-10 AM)',
      options: ['Normal', 'Low'],
    },
   
    
    {
      type: 'select',
      key: 'cardiac_risk_level',
      label: 'CARDIAC RISK LEVEL',
      options: [
        'Low Risk',
        'Intermediate Risk',
        'High Risk',
      ],
    },
   
    
    {
      type: 'checkbox',
      key: 'diagnosis_category',
      title: 'Clinical Diagnosis Categorization',
      showWhen: { field: 'cardiac_risk_level', equals: 'Low Risk' },
      options: [
        { key: 'vasculogenic', label: 'Vasculogenic - Most Common' },
        { key: 'diabetic', label: 'Diabetic' },
        { key: 'neurogenic', label: 'Neurogenic' },
        { key: 'hypogonadal', label: 'Hypogonadal' },
        { key: 'psychogenic', label: 'Psychogenic' },
      ],
    },
       {
      type: 'select',
      key: 'special_tests',
      label: 'Special Tests ',
      options: ['Yes', 'No'],
    },
    {
      type: 'select',
      key: 'testosterone_replacement',
      label: 'Testosterone Replacement',
      showWhen: [
      
        { field: 'diagnosis_category', equals: 'hypogonadal' },
      ],
      options: ['Not Indicated', 'Indicated'],
    },
    ],
  treatmentPlan: [
 
    {
      type: 'staticGrid',
      key: 'management_cards_First_Line',
      title: 'FIRST-LINE MANAGEMENT',
      cards: [
        {
          title: '1. Lifestyle & Risk Control',
          body: `Weight Loss: Target >= 5-10%\nGlycemic Control: HbA1c <7%\nExercise: 150min/week\nStop Smoking\nTreat HTN & Dyslipidemia`,
        },
        {
          title: '2. Optimize DM Medications',
          body: `Prefer: SGLT2i (Jardiance/Farxiga), GLP-1 (Ozempic/Trulicity)`,
        },
        {
          title: '3. PDE5 Inhibitors - First Line Drug',
          body: `Sildenafil (Viagra): 50mg - Max 100mg\nTadalafil (Cialis): 10mg - Max 20mg (or 5mg daily)\nVardenafil (Levitra/Staxyn): 10mg - Max 20mg\nTake on empty stomach (Except Tadalafil)\nSexual Stimulation Required - Try >= 5-8 attempts before labeling failure\nCONTRAINDICATED WITH NITRATES`,
        },
      ],
    },
    {
      type: 'textarea',
      key: 'management_note_First_Line',
      label: 'Additional Note',
      
    },
    
    {
      type: 'staticGrid',
      key: 'management_cards_Second_Line',
      title: 'SECOND-LINEMANAGEMENT',
      showWhen: { field: 'diagnosis_category', equals: 'hypogonadal' },
      cards: [
        {
          title: '1. Vacuum Erection Devices (VED)',
          body: `Safe,Effective for Diabetics`,
        },
         {
          title: '2. Intracavernosal Injection (ICI) Therapy',
          body: `Alprostadil(Caverject/Edex)\n Trimix:Alprostadil+ Papaverine + Phentolamine\n Highly Effective in Diabetic ED,`,
        },
        {
          title: '3. Intraurethral Alprostadil (MUSE)',
          body: 'less effective than ICI, but easier to use; may be considered if patient is averse to injections',
        },
      ],
    },
    {
      type: 'textarea',
      key: 'management_note_Second_Line',
      label: 'Additional Note',
      showWhen: { field: 'diagnosis_category', equals: 'hypogonadal' },
    },
    

    {
      type: 'staticGrid',
      key: 'management_cards_Third_Line',
      title: 'THIRD-LINE MANAGEMENT',
            showWhen: { field: 'diagnosis_category', equals: 'hypogonadal' },

      cards: [
        {
          title: '1. Penile Prosthesis Surgery',
          body: `Inflatable (Preferred Malleable: Failure of medical therapy or severe organic ED)`,
        },
         {
          title: '2. Adjuncts / Special Situations',
          body: 'Psychosexual Therapy Performance\n Anxiety/Relationships \n Medication Review: Switch Beta-Blocker to Nebivolol (Bystolic)\n Avoid SSRIs if possible',
        },
        {
          title: 'Combination Therapy:PDE5i + Testosterone\n PDE5i+ ICI',
          body: 'Emerging - Not Routine: Low-intensity Shockwave (Li-ESWT)',
        },
        {
          title: '4. Clinical Pearls',
          body: 'ED= Early marker of CVD\n Diabetic patients often need higher PDE5 doses Poor response?\n Check:Low T,Severe Vascular Disease,Incorrect Use', 
        }
      ],
    },
    {
      type: 'textarea',
      key: 'management_note_Third_Line',
      label: 'Additional Note',
      showWhen: { field: 'diagnosis_category', equals: 'hypogonadal' },
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
  const key = String(disease ?? '').trim();
  return DISEASE_FLOWS[key] || null;
}

export function isFemaleGender(gender) {
  return String(gender ?? '').trim().toLowerCase() === 'female';
}

export function isDiseaseAvailableForGender(disease, gender) {
  const flow = getDiseaseFlow(disease);
  if (flow?.checklist?.maleOnly === true && isFemaleGender(gender)) return false;
  return true;
}

export function shouldShowBasicChecklistPregnancy(disease, gender) {
  if (!isFemaleGender(gender)) return false;
  return getDiseaseFlow(disease)?.checklist?.hidePregnancy !== true;
}

export default DISEASE_FLOWS;
