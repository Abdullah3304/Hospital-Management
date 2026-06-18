const pool = require('./db');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`DROP TRIGGER IF EXISTS users_updated_at ON users`);
    await client.query(`CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at()`);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'doctor'
    `);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE users ADD CONSTRAINT users_role_check
          CHECK (role IN ('admin', 'doctor', 'owner'));
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INTEGER NOT NULL CHECK (age > 0 AND age < 100),
        gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
        mobile_number VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_patients_mobile ON patients(mobile_number)`);
    await client.query(`DROP TRIGGER IF EXISTS patients_updated_at ON patients`);
    await client.query(`CREATE TRIGGER patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at()`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS patient_diseases (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
        disease VARCHAR(50) NOT NULL,
        fees NUMERIC(10,2) NOT NULL CHECK (fees > 0),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(patient_id, disease)
      );
    `);
    await client.query(`DROP TRIGGER IF EXISTS patient_diseases_updated_at ON patient_diseases`);
    await client.query(`CREATE TRIGGER patient_diseases_updated_at BEFORE UPDATE ON patient_diseases FOR EACH ROW EXECUTE FUNCTION update_updated_at()`);

    await client.query(`DROP TABLE IF EXISTS disease_checklists CASCADE`);
    await client.query(`
      CREATE TABLE disease_checklists (
        id SERIAL PRIMARY KEY,
        patient_disease_id INTEGER REFERENCES patient_diseases(id) ON DELETE CASCADE UNIQUE,
        blood_pressure TEXT,
        pulse TEXT,
        temperature TEXT,
        respiratory_rate TEXT,
        weight_kg NUMERIC,
        height_m NUMERIC,
        bmi NUMERIC,
        chronic_diseases TEXT,
        stroke BOOLEAN DEFAULT FALSE,
        ckd BOOLEAN DEFAULT FALSE,
        ckd_stage TEXT,
        dcld BOOLEAN DEFAULT FALSE,
        pregnancy BOOLEAN DEFAULT FALSE,
        pregnancy_stage TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`DROP TRIGGER IF EXISTS disease_checklists_updated_at ON disease_checklists`);
    await client.query(`CREATE TRIGGER disease_checklists_updated_at BEFORE UPDATE ON disease_checklists FOR EACH ROW EXECUTE FUNCTION update_updated_at()`);

    // Per-disease management assessment. JSONB columns allow each disease
    // to define its own sections/options on the frontend without schema migrations.
    await client.query(`DROP TABLE IF EXISTS treatment_assessments CASCADE`);
    await client.query(`
      CREATE TABLE treatment_assessments (
        id SERIAL PRIMARY KEY,
        patient_disease_id INTEGER REFERENCES patient_diseases(id) ON DELETE CASCADE UNIQUE,
        history JSONB NOT NULL DEFAULT '{}'::jsonb,
        investigation JSONB NOT NULL DEFAULT '{}'::jsonb,
        treatment_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
        prescription JSONB NOT NULL DEFAULT '{}'::jsonb,
        submitted BOOLEAN NOT NULL DEFAULT FALSE,
        submitted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_treatment_assessments_disease ON treatment_assessments(patient_disease_id)`);
    await client.query(`DROP TRIGGER IF EXISTS treatment_assessments_updated_at ON treatment_assessments`);
    await client.query(`CREATE TRIGGER treatment_assessments_updated_at BEFORE UPDATE ON treatment_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at()`);

    const password = '!q#3Xv9$LmZ2&p@L';
    const adminHash = await bcrypt.hash(password, 10);
    await client.query(
      `INSERT INTO users (username, password, role) VALUES ('admin.alcods', $1, 'admin')
       ON CONFLICT (username) DO UPDATE SET role = 'admin'`,
      [adminHash]
    );

    const mohsinHash = await bcrypt.hash(password, 10);
    await client.query(
      `INSERT INTO users (username, password, role) VALUES ('Dr.Mohsin.alcods', $1, 'doctor')
       ON CONFLICT (username) DO UPDATE SET role = 'doctor'`,
      [mohsinHash]
    );

    const doctorHash = await bcrypt.hash(password, 10);
    await client.query(
      `INSERT INTO users (username, password, role) VALUES ('doctor.alcods', $1, 'doctor')
       ON CONFLICT (username) DO UPDATE SET role = 'doctor'`,
      [doctorHash]
    );

    const ownerHash = await bcrypt.hash(password, 10);
    await client.query(
      `INSERT INTO users (username, password, role) VALUES ('owner.alcods', $1, 'owner')
       ON CONFLICT (username) DO UPDATE SET role = 'owner'`,
      [ownerHash]
    );

    await client.query(`UPDATE users SET role = 'admin' WHERE username IN ('admin', 'admin.alcods')`);
    await client.query(`UPDATE users SET role = 'doctor' WHERE username IN ('doctor', 'Dr.Mohsin.alcods', 'doctor.alcods')`);
    await client.query(`UPDATE users SET role = 'owner' WHERE username IN ('owner', 'owner.alcods')`);

    await client.query('COMMIT');
    console.log('Seed completed successfully!');
    console.log('Roles: admin.alcods → Admin | Dr.Mohsin.alcods / doctor.alcods → Doctor | owner.alcods → Owner');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
