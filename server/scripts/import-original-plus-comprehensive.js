const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Original team members from the first spreadsheet (keeping original assignments)
const originalTeamMembers = [
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

// Acquiring partners with original owner assignments + comprehensive data
const acquiringPartners = [
  // Red Team Partners (original assignments)
  { 
    name: 'Cybersource', 
    leap: 'Red', 
    team: 'Red Team', 
    primary: 'Justin Boyer', 
    secondary: null, 
    volume: '$50B+',
    technical_status: 'Scoping',
    specs_version: 'V2R8',
    contract_status: 'Termsheet signed; KNA redlines',
    pricing_tier: 'Tier 2',
    volume_2025: '-',
    volume_2026: '-',
    go_live_date: 'Legacy - Live, Klarna Network - April 1, 2026 target'
  },
  { 
    name: 'Clover', 
    leap: 'Red', 
    team: 'Red Team', 
    primary: 'Justin Boyer', 
    secondary: 'Nikita Vikhliaev', 
    volume: '$30B+',
    technical_status: 'Scoping',
    specs_version: 'TBD',
    contract_status: 'KNA signed',
    pricing_tier: 'Tier 0',
    volume_2025: '-',
    volume_2026: '-',
    go_live_date: 'Clover - 31Mar26'
  },
  { 
    name: 'JPM', 
    leap: 'Red', 
    team: 'Red Team', 
    primary: 'Nikita Vikhliaev', 
    secondary: 'David Summersbee', 
    volume: '$100B+',
    technical_status: 'Scoping',
    specs_version: 'V2R7',
    contract_status: 'KNA signed',
    pricing_tier: 'Tier 2',
    volume_2025: '-',
    volume_2026: '-',
    go_live_date: 'January 31, 2026'
  },
  { 
    name: 'Moneris', 
    leap: 'Red', 
    team: 'Red Team', 
    primary: 'Nikita Vikhliaev', 
    secondary: 'Dexter Vosper', 
    volume: '$25B+',
    technical_status: 'Scoping',
    specs_version: 'V2R9',
    contract_status: 'Pitching',
    pricing_tier: 'Tier 2',
    volume_2025: '-',
    volume_2026: '-',
    go_live_date: 'TBC, still going through Term Sheet negotiations'
  },
  { 
    name: 'ACI', 
    leap: 'Red', 
    team: 'Red Team', 
    primary: 'David Summersbee', 
    secondary: 'Justin Boyer', 
    volume: '$40B+',
    technical_status: 'Scoping',
    specs_version: 'TBD',
    contract_status: 'Termsheet redlines',
    pricing_tier: 'Tier 2',
    volume_2025: '-',
    volume_2026: '-',
    go_live_date: 'Target Q3-2026 (Jul 1, 2026)'
  },
  
  // Cobalt Team Partners (original assignments)
  { 
    name: 'Shopify', 
    leap: 'Cobalt', 
    team: 'Cobalt Team', 
    primary: 'Justin Boyer', 
    secondary: 'Nikita Vikhliaev', 
    volume: '$75B+',
    technical_status: 'Not Started',
    specs_version: 'TBD',
    contract_status: 'Pitching',
    pricing_tier: 'Tier 2',
    volume_2025: '-',
    volume_2026: '-',
    go_live_date: 'tbd'
  },
  { 
    name: 'Stripe', 
    leap: 'Cobalt', 
    team: 'Cobalt Team', 
    primary: 'Dexter Vosper', 
    secondary: 'David Summersbee', 
    volume: '$200B+',
    technical_status: 'Launched',
    specs_version: 'V1R6',
    contract_status: 'Termsheet signed; KNA redlines',
    pricing_tier: 'Tier 0',
    volume_2025: '10.9B',
    volume_2026: '-',
    go_live_date: 'Live'
  },
  
  // Platinum Team Partners (original assignments)
  { 
    name: 'Worldline', 
    leap: 'Platinum', 
    team: 'Platinum Team', 
    primary: 'Edouard Bayon', 
    secondary: 'Giuliano Belfiore', 
    volume: '$60B+',
    technical_status: 'In Dev',
    specs_version: 'V2R6, V2R7',
    contract_status: 'no Termsheet; KNA redlines',
    pricing_tier: 'Tier 1',
    volume_2025: '140.6M',
    volume_2026: '10.1bn',
    go_live_date: '1Nov25 (awaiting CRAC approval)'
  },
  { 
    name: 'Worldpay', 
    leap: 'Platinum', 
    team: 'Platinum Team', 
    primary: 'Szilard Kaltenecker', 
    secondary: 'Edouard Bayon', 
    volume: '$80B+',
    technical_status: 'In Dev',
    specs_version: 'V2R6, V2R7, V2R8',
    contract_status: 'Termsheet signed; KNA redlines',
    pricing_tier: 'Tier 0',
    volume_2025: '471.6M',
    volume_2026: '24.6B',
    go_live_date: '30Jan26 (Beta for ENT)'
  },
  { 
    name: 'mollie', 
    leap: 'Platinum', 
    team: 'Platinum Team', 
    primary: 'Szilard Kaltenecker', 
    secondary: 'Giuliano Belfiore', 
    volume: '$35B+',
    technical_status: 'Scoping',
    specs_version: 'V2R7, V2R8',
    contract_status: 'Termsheet signed; KNA redlines',
    pricing_tier: 'Tier 1',
    volume_2025: '2.1bn',
    volume_2026: '19.9bn',
    go_live_date: 'est Q2 2026'
  },
  { 
    name: 'Nomupay', 
    leap: 'Platinum', 
    team: 'Platinum Team', 
    primary: 'Szilard Kaltenecker', 
    secondary: 'Giuliano Belfiore', 
    volume: '$20B+',
    technical_status: 'Scoping',
    specs_version: 'TBD',
    contract_status: 'Pitching',
    pricing_tier: 'Tier 1',
    volume_2025: '-',
    volume_2026: '28.2bn',
    go_live_date: '1Sep26'
  },
  { 
    name: 'Checkout', 
    leap: 'Platinum', 
    team: 'Platinum Team', 
    primary: null, 
    secondary: 'Szilard Kaltenecker', 
    volume: '$45B+',
    technical_status: 'Scoping',
    specs_version: 'TBD',
    contract_status: 'Pitching',
    pricing_tier: 'Tier 1',
    volume_2025: '-',
    volume_2026: '28.2bn',
    go_live_date: '1Sep26'
  },
  { 
    name: 'Lyra', 
    leap: 'Platinum', 
    team: 'Platinum Team', 
    primary: 'Edouard Bayon', 
    secondary: 'Szilard Kaltenecker', 
    volume: '$15B+',
    technical_status: 'Not Started',
    specs_version: 'V2R7, V2R8',
    contract_status: 'Pitching',
    pricing_tier: 'Tier 2',
    volume_2025: '-',
    volume_2026: '-',
    go_live_date: '1Jan26'
  },
  
  // Black Team Partners (original assignments)
  { 
    name: 'nexi', 
    leap: 'Black', 
    team: 'Black Team', 
    primary: 'Akin Toksan', 
    secondary: 'Volkan Toker', 
    volume: '$90B+',
    technical_status: 'Scoping',
    specs_version: 'V2R7, V2R8',
    contract_status: 'KNA signed',
    pricing_tier: 'Tier 1',
    volume_2025: '-',
    volume_2026: '20B',
    go_live_date: '30 June 2025 Nexi Relay'
  },
  { 
    name: 'Adyen', 
    leap: 'Black', 
    team: 'Black Team', 
    primary: 'Volkan Toker', 
    secondary: 'Akin Toksan', 
    volume: '$120B+',
    technical_status: 'Scoping',
    specs_version: 'V2R8',
    contract_status: 'Termsheet redlines',
    pricing_tier: 'Tier 0',
    volume_2025: '105.4m',
    volume_2026: '42B',
    go_live_date: '1Dec25 (Low confidence)'
  },
  { 
    name: 'Nuvei', 
    leap: 'Black', 
    team: 'Black Team', 
    primary: 'Irina Novikova', 
    secondary: 'Volkan Toker', 
    volume: '$55B+',
    technical_status: 'Not Started',
    specs_version: 'TBD',
    contract_status: 'Pitching',
    pricing_tier: 'Tier 2',
    volume_2025: '-',
    volume_2026: '-',
    go_live_date: 'N/A'
  }
];

// Initialize database with original assignments + comprehensive data
db.serialize(() => {
  console.log('Initializing database with original owner assignments + comprehensive data...');
  
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
    role TEXT NOT NULL CHECK(role IN ('Solution Engineer', 'Delivery Manager', 'Primary Owner', 'Secondary Owner', 'Commercial Owner', 'S&D Owner')),
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
  originalTeamMembers.forEach(member => {
    userIds[member.name] = uuidv4();
  });
  
  // Insert users
  const insertUser = db.prepare('INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)');
  originalTeamMembers.forEach(member => {
    insertUser.run(userIds[member.name], member.name, member.email, member.role);
  });
  insertUser.finalize();
  
  // Create team ID mapping
  const teamIds = {};
  teams.forEach(team => {
    teamIds[team.name] = team.id;
  });
  
  // Insert acquiring partners with original assignments + comprehensive data
  const insertPartner = db.prepare(`INSERT INTO acquiring_partners 
    (id, name, description, volume, status, primary_owner_id, secondary_owner_id, team_id, leap_category, 
     technical_status, specs_version, contract_status, pricing_tier, volume_2025, volume_2026, go_live_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
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
      teamId,
      partner.leap,
      partner.technical_status,
      partner.specs_version,
      partner.contract_status,
      partner.pricing_tier,
      partner.volume_2025,
      partner.volume_2026,
      partner.go_live_date
    );
  });
  insertPartner.finalize();
  
  console.log('Database initialized successfully!');
  console.log(`Created ${teams.length} teams`);
  console.log(`Created ${originalTeamMembers.length} users`);
  console.log(`Created ${acquiringPartners.length} acquiring partners`);
  
  // Print summary by team
  console.log('\n=== TEAM ASSIGNMENTS (Original Owners) ===');
  teams.forEach(team => {
    const teamPartners = acquiringPartners.filter(p => p.team === team.name);
    console.log(`\n${team.name} (${team.leap} Leap):`);
    teamPartners.forEach(partner => {
      console.log(`  - ${partner.name}: ${partner.primary}${partner.secondary ? ` (${partner.secondary})` : ''}`);
      console.log(`    Status: ${partner.technical_status} | Contract: ${partner.contract_status}`);
    });
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('\nDatabase connection closed.');
});
