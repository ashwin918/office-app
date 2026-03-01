const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, done) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
  } else {
    done();
    console.log('✅ Connected to PostgreSQL database');
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, username, full_name, role, email, department FROM employees WHERE username = $1 AND password = $2',
      [username, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, full_name, email, role, department, created_at FROM employees WHERE role = 'employee' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/employees', async (req, res) => {
  const { username, password, full_name, email, department } = req.body;
  if (!username || !password || !full_name) {
    return res.status(400).json({ error: 'Username, password, and full name are required' });
  }
  try {
    const existing = await pool.query('SELECT id FROM employees WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const result = await pool.query(
      "INSERT INTO employees (username, password, full_name, email, department, role) VALUES ($1, $2, $3, $4, $5, 'employee') RETURNING id, username, full_name, email, department, role",
      [username, password, full_name, email || null, department || null]
    );
    res.json({ success: true, employee: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM employees WHERE id = $1 AND role = $2', [req.params.id, 'employee']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, e.full_name AS assigned_to_name, e.username AS assigned_to_username, a.full_name AS assigned_by_name
      FROM tasks t
      LEFT JOIN employees e ON t.assigned_to = e.id
      LEFT JOIN employees a ON t.assigned_by = a.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tasks/employee/:employeeId', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, a.full_name AS assigned_by_name
      FROM tasks t
      LEFT JOIN employees a ON t.assigned_by = a.id
      WHERE t.assigned_to = $1
      ORDER BY t.created_at DESC
    `, [req.params.employeeId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const { title, description, assigned_to, assigned_by, priority, due_date } = req.body;
  if (!title || !assigned_to) {
    return res.status(400).json({ error: 'Title and assigned employee are required' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, assigned_to, assigned_by, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description || null, assigned_to, assigned_by || null, priority || 'medium', due_date || null]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tasks/:id/progress', async (req, res) => {
  const { completion_percentage, notes, status } = req.body;
  try {
    let autoStatus = status;
    if (!autoStatus) {
      if (completion_percentage === 100) autoStatus = 'completed';
      else if (completion_percentage > 0) autoStatus = 'in_progress';
      else autoStatus = 'pending';
    }
    const result = await pool.query(
      `UPDATE tasks SET completion_percentage = $1, notes = $2, status = $3 WHERE id = $4 RETURNING *`,
      [completion_percentage, notes || null, autoStatus, req.params.id]
    );
    res.json({ success: true, task: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const [empCount, taskStats] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM employees WHERE role = 'employee'"),
      pool.query(`
        SELECT COUNT(*) AS total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
          ROUND(AVG(completion_percentage), 1) AS avg_completion
        FROM tasks
      `)
    ]);
    res.json({ employees: parseInt(empCount.rows[0].count), ...taskStats.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});