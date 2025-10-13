const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Sample data
const sampleTeams = [
  { id: uuidv4(), name: 'North America Team', description: 'Handles North American acquiring partners' },
  { id: uuidv4(), name: 'Europe Team', description: 'Handles European acquiring partners' },
  { id: uuidv4(), name: 'Asia Pacific Team', description: 'Handles APAC acquiring partners' }
];

const sampleUsers = [
  { id: uuidv4(), name: 'Dexter Vosper', email: 'dexter.vosper@company.com', role: 'Primary Owner', team_id: sampleTeams[0].id },
  { id: uuidv4(), name: 'David Summersbee', email: 'david.summersbee@company.com', role: 'Secondary Owner', team_id: sampleTeams[0].id },
  { id: uuidv4(), name: 'Carin Baker', email: 'carin.baker@company.com', role: 'Solution Engineer', team_id: sampleTeams[0].id },
  { id: uuidv4(), name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'Delivery Manager', team_id: sampleTeams[1].id },
  { id: uuidv4(), name: 'Michael Chen', email: 'michael.chen@company.com', role: 'Solution Engineer', team_id: sampleTeams[2].id }
];

const samplePartners = [
  {
    id: uuidv4(),
    name: 'Stripe',
    description: 'Leading payment processor for online businesses',
    volume: '$200B+',
    status: 'Active',
    primary_owner_id: sampleUsers[0].id,
    secondary_owner_id: sampleUsers[1].id,
    solution_engineer_id: sampleUsers[2].id,
    team_id: sampleTeams[0].id
  },
  {
    id: uuidv4(),
    name: 'JPMorgan Chase',
    description: 'Major financial institution and payment processor',
    volume: '$150B+',
    status: 'Active',
    primary_owner_id: sampleUsers[0].id,
    secondary_owner_id: sampleUsers[1].id,
    solution_engineer_id: sampleUsers[2].id,
    team_id: sampleTeams[0].id
  },
  {
    id: uuidv4(),
    name: 'Adyen',
    description: 'Global payment platform for businesses',
    volume: '$100B+',
    status: 'Active',
    primary_owner_id: sampleUsers[3].id,
    secondary_owner_id: sampleUsers[3].id,
    solution_engineer_id: sampleUsers[4].id,
    team_id: sampleTeams[1].id
  }
];

const sampleActions = [
  {
    id: uuidv4(),
    partner_id: samplePartners[0].id,
    title: 'Q4 Integration Review',
    description: 'Review Stripe integration performance and identify optimization opportunities',
    status: 'In Progress',
    priority: 'High',
    assigned_to: sampleUsers[2].id,
    due_date: '2024-12-31'
  },
  {
    id: uuidv4(),
    partner_id: samplePartners[0].id,
    title: 'API Documentation Update',
    description: 'Update API documentation for new Stripe features',
    status: 'Pending',
    priority: 'Medium',
    assigned_to: sampleUsers[2].id,
    due_date: '2024-11-15'
  },
  {
    id: uuidv4(),
    partner_id: samplePartners[1].id,
    title: 'Compliance Audit',
    description: 'Annual compliance audit for JPMorgan partnership',
    status: 'Pending',
    priority: 'High',
    assigned_to: sampleUsers[0].id,
    due_date: '2024-12-01'
  }
];

// Initialize database with sample data
db.serialize(() => {
  console.log('Initializing database with sample data...');
  
  // Create tables first
  db.run(`CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT NOT NULL CHECK(role IN ('Solution Engineer', 'Delivery Manager', 'Primary Owner', 'Secondary Owner')),
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS acquiring_partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    volume TEXT,
    status TEXT DEFAULT 'Active',
    primary_owner_id TEXT,
    secondary_owner_id TEXT,
    solution_engineer_id TEXT,
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (primary_owner_id) REFERENCES users (id),
    FOREIGN KEY (secondary_owner_id) REFERENCES users (id),
    FOREIGN KEY (solution_engineer_id) REFERENCES users (id),
    FOREIGN KEY (team_id) REFERENCES teams (id)
  )`);

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
  
  // Clear existing data
  db.run('DELETE FROM actions');
  db.run('DELETE FROM acquiring_partners');
  db.run('DELETE FROM users');
  db.run('DELETE FROM teams');
  
  // Insert teams
  const insertTeam = db.prepare('INSERT INTO teams (id, name, description) VALUES (?, ?, ?)');
  sampleTeams.forEach(team => {
    insertTeam.run(team.id, team.name, team.description);
  });
  insertTeam.finalize();
  
  // Insert users
  const insertUser = db.prepare('INSERT INTO users (id, name, email, role, team_id) VALUES (?, ?, ?, ?, ?)');
  sampleUsers.forEach(user => {
    insertUser.run(user.id, user.name, user.email, user.role, user.team_id);
  });
  insertUser.finalize();
  
  // Insert partners
  const insertPartner = db.prepare(`INSERT INTO acquiring_partners 
    (id, name, description, volume, status, primary_owner_id, secondary_owner_id, solution_engineer_id, team_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  samplePartners.forEach(partner => {
    insertPartner.run(
      partner.id, partner.name, partner.description, partner.volume, partner.status,
      partner.primary_owner_id, partner.secondary_owner_id, partner.solution_engineer_id, partner.team_id
    );
  });
  insertPartner.finalize();
  
  // Insert actions
  const insertAction = db.prepare(`INSERT INTO actions 
    (id, partner_id, title, description, status, priority, assigned_to, due_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  sampleActions.forEach(action => {
    insertAction.run(
      action.id, action.partner_id, action.title, action.description, 
      action.status, action.priority, action.assigned_to, action.due_date
    );
  });
  insertAction.finalize();
  
  console.log('Database initialized successfully!');
  console.log(`Created ${sampleTeams.length} teams`);
  console.log(`Created ${sampleUsers.length} users`);
  console.log(`Created ${samplePartners.length} acquiring partners`);
  console.log(`Created ${sampleActions.length} actions`);
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Database connection closed.');
});
