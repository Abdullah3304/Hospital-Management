const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../auth');

router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { page = 1, search = '' } = req.query;
  const limit = 25;
  const offset = (page - 1) * limit;

  try {
    const searchPattern = search ? `%${search}%` : null;
    const params = searchPattern ? [limit, offset, searchPattern] : [limit, offset];
    const dataWhere = searchPattern ? 'WHERE mobile_number LIKE $3' : '';
    const countWhere = searchPattern ? 'WHERE mobile_number LIKE $1' : '';

    const [countRes, dataRes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM patients ${countWhere}`, searchPattern ? [searchPattern] : []),
      pool.query(`SELECT * FROM patients ${dataWhere} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params)
    ]);

    const total = parseInt(countRes.rows[0].count);
    res.json({
      patients: dataRes.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await pool.query('SELECT * FROM patients WHERE id = $1', [req.params.id]);
    if (!patient.rows.length) return res.status(404).json({ error: 'Patient not found' });

    const latestDisease = await pool.query(
      'SELECT * FROM patient_diseases WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.params.id]
    );

    const existingDiseases = await pool.query(
      'SELECT disease FROM patient_diseases WHERE patient_id = $1',
      [req.params.id]
    );

    res.json({
      ...patient.rows[0],
      latestDisease: latestDisease.rows[0] || null,
      existingDiseases: existingDiseases.rows.map(d => d.disease)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, age, gender, mobile_number, disease, fees } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const patientRes = await client.query(
      'INSERT INTO patients (name, age, gender, mobile_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, age, gender, mobile_number]
    );
    await client.query(
      'INSERT INTO patient_diseases (patient_id, disease, fees) VALUES ($1, $2, $3)',
      [patientRes.rows[0].id, disease, fees]
    );
    await client.query('COMMIT');
    res.status(201).json(patientRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      const msg = err.constraint?.includes('mobile_number')
        ? 'Mobile number already exists'
        : 'Patient already has this disease';
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.put('/:id', async (req, res) => {
  const { name, age, gender, mobile_number, disease, fees, diseaseId } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query(
      'UPDATE patients SET name=$1, age=$2, gender=$3, mobile_number=$4 WHERE id=$5',
      [name, age, gender, mobile_number, req.params.id]
    );

    if (diseaseId) {
      const old = await client.query('SELECT disease FROM patient_diseases WHERE id = $1', [diseaseId]);
      if (old.rows.length && old.rows[0].disease !== disease) {
        await client.query('DELETE FROM disease_checklists WHERE patient_disease_id = $1', [diseaseId]);
      }
      await client.query(
        'UPDATE patient_diseases SET disease=$1, fees=$2 WHERE id=$3',
        [disease, fees, diseaseId]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Updated successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      const msg = err.constraint?.includes('mobile_number')
        ? 'Mobile number already exists'
        : 'Patient already has this disease';
      return res.status(400).json({ error: msg });
    }
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get('/:id/diseases', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT pd.*, COALESCE(ta.submitted, FALSE) AS assessment_submitted
      FROM patient_diseases pd
      LEFT JOIN treatment_assessments ta ON ta.patient_disease_id = pd.id
      WHERE pd.patient_id = $1
      ORDER BY pd.created_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/diseases', async (req, res) => {
  const { disease, fees } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO patient_diseases (patient_id, disease, fees) VALUES ($1, $2, $3) RETURNING *',
      [req.params.id, disease, fees]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Patient already has this disease' });
    res.status(500).json({ error: err.message });
  }
});

router.get('/diseases/:diseaseId/checklist', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM disease_checklists WHERE patient_disease_id = $1',
      [req.params.diseaseId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/diseases/:diseaseId/checklist', async (req, res) => {
  const {
    blood_pressure = '',
    pulse = '',
    temperature = '',
    respiratory_rate = '',
    weight_kg = null,
    height_m = null,
    bmi = null,
    chronic_diseases = '',
    stroke = false,
    ckd = false,
    dcld = false,
    pregnancy = false,
    notes = '',
  } = req.body;

  let computedBmi = bmi;
  if (weight_kg != null && height_m != null && Number(height_m) > 0) {
    computedBmi = Number((Number(weight_kg) / (Number(height_m) ** 2)).toFixed(2));
  }

  try {
    const { rows } = await pool.query(`
      INSERT INTO disease_checklists (
        patient_disease_id, blood_pressure, pulse, temperature, respiratory_rate,
        weight_kg, height_m, bmi, chronic_diseases,
        stroke, ckd, dcld, pregnancy, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      ON CONFLICT (patient_disease_id) DO UPDATE SET
        blood_pressure=$2, pulse=$3, temperature=$4, respiratory_rate=$5,
        weight_kg=$6, height_m=$7, bmi=$8, chronic_diseases=$9,
        stroke=$10, ckd=$11, dcld=$12, pregnancy=$13, notes=$14
      RETURNING *
    `, [
      req.params.diseaseId,
      blood_pressure || '',
      pulse || '',
      temperature || '',
      respiratory_rate || '',
      weight_kg,
      height_m,
      computedBmi,
      chronic_diseases || '',
      !!stroke,
      !!ckd,
      !!dcld,
      !!pregnancy,
      notes || '',
    ]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Disease management assessment (multi-step wizard). Stores history,
// pre-operative investigation, and treatment plan as JSONB, so each
// disease can define its own sections/options on the frontend.
router.get('/diseases/:diseaseId/assessment', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM treatment_assessments WHERE patient_disease_id = $1',
      [req.params.diseaseId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/diseases/:diseaseId/assessment', async (req, res) => {
  const { history = {}, investigation = {}, treatment_plan = {}, prescription = {} } = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO treatment_assessments (patient_disease_id, history, investigation, treatment_plan, prescription, submitted, submitted_at)
      VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
      ON CONFLICT (patient_disease_id) DO UPDATE SET
        history=$2, investigation=$3, treatment_plan=$4, prescription=$5,
        submitted=TRUE,
        submitted_at=COALESCE(treatment_assessments.submitted_at, NOW())
      RETURNING *
    `, [req.params.diseaseId, history, investigation, treatment_plan, prescription]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
