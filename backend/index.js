const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Create tables (only once)
pool.query(`
  CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
  );

  CREATE TABLE IF NOT EXISTS slots (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER REFERENCES doctors(id),
    start_time TIMESTAMP NOT NULL,
    total_seats INTEGER NOT NULL DEFAULT 1,
    available_seats INTEGER NOT NULL DEFAULT 1,
    UNIQUE(doctor_id, start_time)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    slot_id INTEGER REFERENCES slots(id),
    patient_name VARCHAR(100) NOT NULL,
    seats INTEGER NOT NULL DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT NOW()
  );
`).catch(err => console.log('Tables already exist or error:', err));

// API to create a doctor
app.post('/doctors', async (req, res) => {
  const { name } = req.body;
  const result = await pool.query('INSERT INTO doctors (name) VALUES ($1) RETURNING *', [name]);
  res.json(result.rows[0]);
});

// API to create a slot
app.post('/slots', async (req, res) => {
  const { doctorId, startTime, totalSeats = 1 } = req.body;
  const result = await pool.query(
    'INSERT INTO slots (doctor_id, start_time, total_seats, available_seats) VALUES ($1, $2, $3, $3) RETURNING *',
    [doctorId, startTime, totalSeats]
  );
  res.json(result.rows[0]);
});

// Get all doctors with their slots
app.get('/doctors', async (req, res) => {
  const doctors = await pool.query('SELECT * FROM doctors');
  const slots = await pool.query('SELECT * FROM slots');
  const data = doctors.rows.map(d => ({
    ...d,
    slots: slots.rows.filter(s => s.doctor_id === d.id)
  }));
  res.json(data);
});

// The super important booking API (prevents overbooking!)
app.post('/bookings', async (req, res) => {
  const { slotId, patientName, seats = 1 } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Lock the slot so no one else can book at the same time
    const slotResult = await client.query(
      'SELECT available_seats FROM slots WHERE id = $1 FOR UPDATE',
      [slotId]
    );

    if (slotResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 'FAILED', message: 'Slot not found' });
    }

    const available = slotResult.rows[0].available_seats;

    if (available < seats) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 'FAILED', message: 'No seats left' });
    }

    // Book the seats
    await client.query(
      'UPDATE slots SET available_seats = available_seats - $1 WHERE id = $2',
      [seats, slotId]
    );

    const booking = await client.query(
      'INSERT INTO bookings (slot_id, patient_name, seats, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [slotId, patientName, seats, 'CONFIRMED']
    );

    await client.query('COMMIT');
    res.json({ status: 'CONFIRMED', booking: booking.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ status: 'FAILED', message: 'Error' });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));