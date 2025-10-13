const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Teams table
  db.run(`CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('Solution Engineer', 'Delivery Manager', 'Primary Owner', 'Secondary Owner')),
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams (id)
  )`);

  // Acquiring Partners table
  db.run(`CREATE TABLE IF NOT EXISTS acquiring_partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    volume TEXT,
    status TEXT DEFAULT 'Active',
    primary_owner_id TEXT,
    secondary_owner_id TEXT,
    solution_engineer_id TEXT,
    commercial_owner_id TEXT,
    primary_sd_owner_id TEXT,
    secondary_sd_owner_id TEXT,
    team_id TEXT,
    leap_category TEXT,
    technical_status TEXT,
    specs_version TEXT,
    contract_status TEXT,
    pricing_tier TEXT,
    volume_2025 TEXT,
    volume_2026 TEXT,
    go_live_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_owner_id) REFERENCES users (id),
    FOREIGN KEY (secondary_owner_id) REFERENCES users (id),
    FOREIGN KEY (solution_engineer_id) REFERENCES users (id),
    FOREIGN KEY (commercial_owner_id) REFERENCES users (id),
    FOREIGN KEY (primary_sd_owner_id) REFERENCES users (id),
    FOREIGN KEY (secondary_sd_owner_id) REFERENCES users (id),
    FOREIGN KEY (team_id) REFERENCES teams (id)
  )`);

  // Actions table for tracking partner actions
  db.run(`CREATE TABLE IF NOT EXISTS actions (
    id TEXT PRIMARY KEY,
    partner_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Medium',
    assigned_to TEXT,
    due_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (partner_id) REFERENCES acquiring_partners (id),
    FOREIGN KEY (assigned_to) REFERENCES users (id)
  )`);
});

// Routes

// Teams routes
app.get('/api/teams', (req, res) => {
  db.all('SELECT * FROM teams ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/teams', (req, res) => {
  const { name, description } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO teams (id, name, description) VALUES (?, ?, ?)', 
    [id, name, description], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name, description });
  });
});

// Users routes
app.get('/api/users', (req, res) => {
  const query = `
    SELECT u.*, t.name as team_name 
    FROM users u 
    LEFT JOIN teams t ON u.team_id = t.id 
    ORDER BY u.name
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { name, email, role, team_id } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO users (id, name, email, role, team_id) VALUES (?, ?, ?, ?, ?)', 
    [id, name, email, role, team_id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name, email, role, team_id });
  });
});

// Acquiring Partners routes
app.get('/api/partners', (req, res) => {
  const query = `
    SELECT 
      ap.*,
      po.name as primary_owner_name,
      so.name as secondary_owner_name,
      se.name as solution_engineer_name,
      co.name as commercial_owner_name,
      psdo.name as primary_sd_owner_name,
      ssdo.name as secondary_sd_owner_name,
      t.name as team_name
    FROM acquiring_partners ap
    LEFT JOIN users po ON ap.primary_owner_id = po.id
    LEFT JOIN users so ON ap.secondary_owner_id = so.id
    LEFT JOIN users se ON ap.solution_engineer_id = se.id
    LEFT JOIN users co ON ap.commercial_owner_id = co.id
    LEFT JOIN users psdo ON ap.primary_sd_owner_id = psdo.id
    LEFT JOIN users ssdo ON ap.secondary_sd_owner_id = ssdo.id
    LEFT JOIN teams t ON ap.team_id = t.id
    ORDER BY t.name, ap.name
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/partners/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      ap.*,
      po.name as primary_owner_name,
      so.name as secondary_owner_name,
      se.name as solution_engineer_name,
      t.name as team_name
    FROM acquiring_partners ap
    LEFT JOIN users po ON ap.primary_owner_id = po.id
    LEFT JOIN users so ON ap.secondary_owner_id = so.id
    LEFT JOIN users se ON ap.solution_engineer_id = se.id
    LEFT JOIN teams t ON ap.team_id = t.id
    WHERE ap.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }
    res.json(row);
  });
});

app.post('/api/partners', (req, res) => {
  const { 
    name, 
    description, 
    volume, 
    status, 
    primary_owner_id, 
    secondary_owner_id, 
    solution_engineer_id, 
    team_id 
  } = req.body;
  
  const id = uuidv4();
  
  db.run(`INSERT INTO acquiring_partners 
    (id, name, description, volume, status, primary_owner_id, secondary_owner_id, solution_engineer_id, team_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [id, name, description, volume, status, primary_owner_id, secondary_owner_id, solution_engineer_id, team_id], 
    function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, name, description, volume, status, primary_owner_id, secondary_owner_id, solution_engineer_id, team_id });
  });
});

app.put('/api/partners/:id', (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    volume, 
    status, 
    primary_owner_id, 
    secondary_owner_id, 
    solution_engineer_id, 
    team_id 
  } = req.body;
  
  db.run(`UPDATE acquiring_partners 
    SET name = ?, description = ?, volume = ?, status = ?, 
        primary_owner_id = ?, secondary_owner_id = ?, solution_engineer_id = ?, team_id = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`, 
    [name, description, volume, status, primary_owner_id, secondary_owner_id, solution_engineer_id, team_id, id], 
    function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Partner updated successfully' });
  });
});

app.delete('/api/partners/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM acquiring_partners WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Partner deleted successfully' });
  });
});

// Actions routes
app.get('/api/partners/:partnerId/actions', (req, res) => {
  const { partnerId } = req.params;
  const query = `
    SELECT a.*, u.name as assigned_to_name
    FROM actions a
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.partner_id = ?
    ORDER BY a.created_at DESC
  `;
  
  db.all(query, [partnerId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/partners/:partnerId/actions', (req, res) => {
  const { partnerId } = req.params;
  const { title, description, status, priority, assigned_to, due_date } = req.body;
  const id = uuidv4();
  
  db.run(`INSERT INTO actions 
    (id, partner_id, title, description, status, priority, assigned_to, due_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
    [id, partnerId, title, description, status, priority, assigned_to, due_date], 
    function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id, partner_id: partnerId, title, description, status, priority, assigned_to, due_date });
  });
});

// Search and filter routes
app.get('/api/partners/search', (req, res) => {
  const { q, team, owner, status } = req.query;
  let query = `
    SELECT 
      ap.*,
      po.name as primary_owner_name,
      so.name as secondary_owner_name,
      se.name as solution_engineer_name,
      t.name as team_name
    FROM acquiring_partners ap
    LEFT JOIN users po ON ap.primary_owner_id = po.id
    LEFT JOIN users so ON ap.secondary_owner_id = so.id
    LEFT JOIN users se ON ap.solution_engineer_id = se.id
    LEFT JOIN teams t ON ap.team_id = t.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (q) {
    query += ` AND (ap.name LIKE ? OR ap.description LIKE ?)`;
    params.push(`%${q}%`, `%${q}%`);
  }
  
  if (team) {
    query += ` AND t.name = ?`;
    params.push(team);
  }
  
  if (owner) {
    query += ` AND (po.name LIKE ? OR so.name LIKE ? OR se.name LIKE ?)`;
    params.push(`%${owner}%`, `%${owner}%`, `%${owner}%`);
  }
  
  if (status) {
    query += ` AND ap.status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY ap.name`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
