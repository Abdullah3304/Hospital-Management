const router = require('express').Router();
const pool = require('../db');
const { authMiddleware } = require('../auth');

router.use(authMiddleware);

const BASE_FROM = `
  FROM patient_diseases pd
  JOIN patients p ON p.id = pd.patient_id
  LEFT JOIN treatment_assessments ta ON ta.patient_disease_id = pd.id
`;

function buildFilters({ date, name, from, to }) {
  const conditions = [];
  const params = [];
  let i = 1;

  if (date) {
    conditions.push(`DATE(COALESCE(ta.submitted_at, pd.created_at)) = $${i++}`);
    params.push(date);
  }

  if (from && to) {
    conditions.push(`DATE(COALESCE(ta.submitted_at, pd.created_at)) BETWEEN $${i++} AND $${i++}`);
    params.push(from, to);
  } else if (from) {
    conditions.push(`DATE(COALESCE(ta.submitted_at, pd.created_at)) >= $${i++}`);
    params.push(from);
  } else if (to) {
    conditions.push(`DATE(COALESCE(ta.submitted_at, pd.created_at)) <= $${i++}`);
    params.push(to);
  }

  if (name && name.trim()) {
    conditions.push(`p.name ILIKE $${i++}`);
    params.push(`%${name.trim()}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

router.get('/', async (req, res) => {
  const { page = 1, date = '', name = '' } = req.query;
  const limit = 25;
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * limit;

  try {
    const { where, params } = buildFilters({ date, name });
    const countQuery = `SELECT COUNT(*) ${BASE_FROM} ${where}`;
    const dataQuery = `
      SELECT
        p.name,
        p.age,
        p.mobile_number,
        pd.disease,
        pd.fees,
        COALESCE(
          NULLIF(TRIM(ta.prescription->>'override_doctor_name'), ''),
          CASE WHEN ta.submitted THEN 'Doctor' ELSE '—' END
        ) AS visited_by_doctor,
        COALESCE(ta.submitted_at, pd.created_at) AS visit_date
      ${BASE_FROM}
      ${where}
      ORDER BY COALESCE(ta.submitted_at, pd.created_at) DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;

    const [countRes, dataRes] = await Promise.all([
      pool.query(countQuery, params),
      pool.query(dataQuery, [...params, limit, offset]),
    ]);

    const total = parseInt(countRes.rows[0].count, 10);
    res.json({
      rows: dataRes.rows,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/fees-summary', async (req, res) => {
  const { from = '', to = '', period = 'custom' } = req.query;

  try {
    let dateFrom = from;
    let dateTo = to;
    const today = new Date();

    if (period === 'weekly') {
      const day = today.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      dateFrom = monday.toISOString().slice(0, 10);
      dateTo = sunday.toISOString().slice(0, 10);
    } else if (period === 'monthly') {
      dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
      dateTo = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
    }

    if (!dateFrom || !dateTo) {
      return res.status(400).json({ error: 'Date range is required for custom period' });
    }

    const { where, params } = buildFilters({ from: dateFrom, to: dateTo });

    const summaryQuery = `
      SELECT
        COALESCE(SUM(pd.fees), 0)::numeric AS total_fees,
        COUNT(*)::int AS visit_count
      ${BASE_FROM}
      ${where}
    `;

    const breakdownQuery = `
      SELECT pd.disease, COALESCE(SUM(pd.fees), 0)::numeric AS fees, COUNT(*)::int AS count
      ${BASE_FROM}
      ${where}
      GROUP BY pd.disease
      ORDER BY fees DESC
    `;

    const detailQuery = `
      SELECT
        p.name,
        p.age,
        p.mobile_number,
        pd.disease,
        pd.fees,
        COALESCE(
          NULLIF(TRIM(ta.prescription->>'override_doctor_name'), ''),
          CASE WHEN ta.submitted THEN 'Doctor' ELSE '—' END
        ) AS visited_by_doctor,
        COALESCE(ta.submitted_at, pd.created_at) AS visit_date
      ${BASE_FROM}
      ${where}
      ORDER BY COALESCE(ta.submitted_at, pd.created_at) DESC
    `;

    const [summaryRes, breakdownRes, detailRes] = await Promise.all([
      pool.query(summaryQuery, params),
      pool.query(breakdownQuery, params),
      pool.query(detailQuery, params),
    ]);

    res.json({
      period,
      from: dateFrom,
      to: dateTo,
      totalFees: Number(summaryRes.rows[0].total_fees),
      visitCount: summaryRes.rows[0].visit_count,
      breakdown: breakdownRes.rows.map(r => ({
        disease: r.disease,
        fees: Number(r.fees),
        count: r.count,
      })),
      rows: detailRes.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
