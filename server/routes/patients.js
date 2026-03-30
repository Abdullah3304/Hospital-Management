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
    const { rows } = await pool.query(
      'SELECT * FROM patient_diseases WHERE patient_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
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
  const { blood_pressure, weight, scan, medication, doctor_notes } = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO disease_checklists (patient_disease_id, blood_pressure, weight, scan, medication, doctor_notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (patient_disease_id) DO UPDATE SET
        blood_pressure=$2, weight=$3, scan=$4, medication=$5, doctor_notes=$6
      RETURNING *
    `, [req.params.diseaseId, blood_pressure || false, weight || false, scan || false, medication || false, doctor_notes || '']);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
