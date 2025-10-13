const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Team members from the spreadsheet
const teamMembers = [
  { name: 'Justin Boyer', email: 'justin.boyer@company.com', role: 'Primary Owner' },
  { name: 'Nikita Vikhliaev', email: 'nikita.vikhliaev@company.com', role: 'Primary Owner' },
  { name: 'Dexter Vosper', email: 'dexter.vosper@company.com', role: 'Primary Owner' },
  { name: 'David Summersbee', email: 'david.summersbee@company.com', role: 'Secondary Owner' },
  { name: 'Edouard Bayon', email: 'edouard.bayon@company.com', role: 'Primary Owner' },
  { name: 'Szilard Kaltenecker', email: 'szilard.kaltenecker@company.com', role: 'Primary Owner' },
  { name: 'Giuliano Belfiore', email: 'giuliano.belfiore@company.com', role: 'Secondary Owner' },
  { name: 'Akin Toksan', email: 'akin.toksan@company.com', role: 'Primary Owner' },
  { name: 'Volkan Toker', email: 'volkan.toker@company.com', role: 'Secondary Owner' },
  { name: 'Irina Novikova', email: 'irina.novikova@company.com', role: 'Primary Owner' }
];

// Teams based on Leap categories
const teams = [
  { id: uuidv4(), name: 'Red Team', description: 'Handles Red Leap acquiring partners' },
  { id: uuidv4(), name: 'Cobalt Team', description: 'Handles Cobalt Leap acquiring partners' },
  { id: uuidv4(), name: 'Platinum Team', description: 'Handles Platinum Leap acquiring partners' },
  { id: uuidv4(), name: 'Black Team', description: 'Handles Black Leap acquiring partners' }
];

// Acquiring partners from the spreadsheet
const acquiringPartners = [
  // Red Team Partners
  { name: 'Cybersource', leap: 'Red', team: 'Red Team', primary: 'Justin Boyer', secondary: null, volume: '$50B+' },
  { name: 'Clover', leap: 'Red', team: 'Red Team', primary: 'Justin Boyer', secondary: 'Nikita Vikhliaev', volume: '$30B+' },
  { name: 'JPM', leap: 'Red', team: 'Red Team', primary: 'Nikita Vikhliaev', secondary: 'David Summersbee', volume: '$100B+' },
  { name: 'Moneris', leap: 'Red', team: 'Red Team', primary: 'Nikita Vikhliaev', secondary: 'Dexter Vosper', volume: '$25B+' },
  { name: 'ACI', leap: 'Red', team: 'Red Team', primary: 'David Summersbee', secondary: 'Justin Boyer', volume: '$40B+' },
  
  // Cobalt Team Partners
  { name: 'Shopify', leap: 'Cobalt', team: 'Cobalt Team', primary: 'Justin Boyer', secondary: 'Nikita Vikhliaev', volume: '$75B+' },
  { name: 'Stripe', leap: 'Cobalt', team: 'Cobalt Team', primary: 'Dexter Vosper', secondary: 'David Summersbee', volume: '$200B+' },
  
  // Platinum Team Partners
  { name: 'Worldline', leap: 'Platinum', team: 'Platinum Team', primary: 'Edouard Bayon', secondary: 'Giuliano Belfiore', volume: '$60B+' },
  { name: 'Worldpay', leap: 'Platinum', team: 'Platinum Team', primary: 'Szilard Kaltenecker', secondary: 'Edouard Bayon', volume: '$80B+' },
  { name: 'mollie', leap: 'Platinum', team: 'Platinum Team', primary: 'Szilard Kaltenecker', secondary: 'Giuliano Belfiore', volume: '$35B+' },
  { name: 'Nomupay', leap: 'Platinum', team: 'Platinum Team', primary: 'Szilard Kaltenecker', secondary: 'Giuliano Belfiore', volume: '$20B+' },
  { name: 'Checkout', leap: 'Platinum', team: 'Platinum Team', primary: null, secondary: 'Szilard Kaltenecker', volume: '$45B+' },
  { name: 'Lyra', leap: 'Platinum', team: 'Platinum Team', primary: 'Edouard Bayon', secondary: 'Szilard Kaltenecker', volume: '$15B+' },
  
  // Black Team Partners
  { name: 'nexi', leap: 'Black', team: 'Black Team', primary: 'Akin Toksan', secondary: 'Volkan Toker', volume: '$90B+' },
  { name: 'Adyen', leap: 'Black', team: 'Black Team', primary: 'Volkan Toker', secondary: 'Akin Toksan', volume: '$120B+' },
  { name: 'Nuvei', leap: 'Black', team: 'Black Team', primary: 'Irina Novikova', secondary: 'Volkan Toker', volume: '$55B+' }
];

// Initialize database with spreadsheet data
db.serialize(() => {
  console.log('Initializing database with spreadsheet data...');
  
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
  teams.forEach(team => {
    insertTeam.run(team.id, team.name, team.description);
  });
  insertTeam.finalize();
  
  // Create user ID mapping
  const userIds = {};
  teamMembers.forEach(member => {
    userIds[member.name] = uuidv4();
  });
  
  // Insert users
  const insertUser = db.prepare('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)');
  teamMembers.forEach(member => {
    insertUser.run(userIds[member.name], member.name, member.email, member.role);
  });
  insertUser.finalize();
  
  // Create team ID mapping
  const teamIds = {};
  teams.forEach(team => {
    teamIds[team.name] = team.id;
  });
  
  // Insert acquiring partners
  const insertPartner = db.prepare(`INSERT INTO acquiring_partners 
    (id, name, description, volume, status, primary_owner_id, secondary_owner_id, team_id) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  
  acquiringPartners.forEach(partner => {
    const primaryOwnerId = partner.primary ? userIds[partner.primary] : null;
    const secondaryOwnerId = partner.secondary ? userIds[partner.secondary] : null;
    const teamId = teamIds[partner.team];
    
    insertPartner.run(
      uuidv4(),
      partner.name,
      `Win Top MoR ${partner.leap}`,
      partner.volume,
      'Active',
      primaryOwnerId,
      secondaryOwnerId,
      teamId
    );
  });
  insertPartner.finalize();
  
  console.log('Database initialized successfully!');
  console.log(`Created ${teams.length} teams`);
  console.log(`Created ${teamMembers.length} users`);
  console.log(`Created ${acquiringPartners.length} acquiring partners`);
  
  // Print summary
  console.log('\n=== TEAM ASSIGNMENTS ===');
  teams.forEach(team => {
    const teamPartners = acquiringPartners.filter(p => p.team === team.name);
    console.log(`\n${team.name} (${team.leap} Leap):`);
    teamPartners.forEach(partner => {
      console.log(`  - ${partner.name}: ${partner.primary}${partner.secondary ? ` (${partner.secondary})` : ''}`);
    });
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('\nDatabase connection closed.');
});
