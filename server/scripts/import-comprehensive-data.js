const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Extract data from the CSV structure
const acquiringPartners = [
  // Row 4: Teams, Row 5: Individuals, Row 6: Partner Names
  {
    name: 'Stripe',
    team: 'LP Win Top MoR Cobalt',
    individuals: 'Laurie Banitch, David Summersbee, Carin Baker',
    leap: 'Cobalt',
    status: 'Launched',
    specsVersion: 'V1R6',
    contractStatus: 'Termsheet signed; KNA redlines',
    pricingTier: 'Tier 0',
    volume2025: '10.9B',
    volume2026: '-',
    goLiveDate: 'Live'
  },
  {
    name: 'Stripe',
    team: 'LP Win Top MoR Cobalt', 
    individuals: 'Laurie Banitch, David Summersbee, Carin Baker, Dexter Vosper',
    leap: 'Cobalt',
    status: 'Scoping',
    specsVersion: 'V2R9',
    contractStatus: 'KNA signed',
    pricingTier: 'Tier 0',
    volume2025: '10.9B',
    volume2026: '-',
    goLiveDate: 'Q4 2025'
  },
  {
    name: 'Nexi',
    team: 'LP Win Top MoR Black',
    individuals: 'Ashley Harper, Akin Toksan, Giuliano Belfiore',
    leap: 'Black',
    status: 'Scoping',
    specsVersion: 'V2R7, V2R8',
    contractStatus: 'KNA signed',
    pricingTier: 'Tier 1',
    volume2025: '-',
    volume2026: '20B',
    goLiveDate: '30 June 2025 Nexi Relay'
  },
  {
    name: 'Adyen',
    team: 'LP Win Top MoR Black',
    individuals: 'Akin Toksan, Bryony Macdonald, Volkan Toker',
    leap: 'Black',
    status: 'Scoping',
    specsVersion: 'V2R8',
    contractStatus: 'Termsheet redlines',
    pricingTier: 'Tier 0',
    volume2025: '105.4m',
    volume2026: '42B',
    goLiveDate: '1Dec25 (Low confidence)'
  },
  {
    name: 'J.P. Morgan',
    team: 'LP Win Top MoR Cobalt',
    individuals: 'Ruairidh Henderson, Nikita Vikhliaev, Ashley Goldschmid',
    leap: 'Cobalt',
    status: 'Scoping',
    specsVersion: 'V2R7',
    contractStatus: 'KNA signed',
    pricingTier: 'Tier 2',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: 'January 31, 2026'
  },
  {
    name: 'Worldline',
    team: 'LP Win Top MoR Platinum',
    individuals: 'Isabell Sattler, Szilard Kaltenecker, Giuliano Belfiore, Edouard Bayon',
    leap: 'Platinum',
    status: 'In Dev',
    specsVersion: 'V2R6, V2R7',
    contractStatus: 'no Termsheet; KNA redlines',
    pricingTier: 'Tier 1',
    volume2025: '140.6M',
    volume2026: '10.1bn',
    goLiveDate: '1Nov25 (awaiting CRAC approval)'
  },
  {
    name: 'Worldpay',
    team: 'LP Win Top MoR Platinum',
    individuals: 'Isabell Sattler, Szilard Kaltenecker, Giuliano Belfiore',
    leap: 'Platinum',
    status: 'In Dev',
    specsVersion: 'V2R6, V2R7, V2R8',
    contractStatus: 'Termsheet signed; KNA redlines',
    pricingTier: 'Tier 0',
    volume2025: '471.6M',
    volume2026: '24.6B',
    goLiveDate: '30Jan26 (Beta for ENT)'
  },
  {
    name: 'Mollie',
    team: 'LP Win Top MoR Platinum',
    individuals: 'Robbie Bissett, Edouard Bayon, Giuliano Belfiore',
    leap: 'Platinum',
    status: 'Scoping',
    specsVersion: 'V2R7, V2R8',
    contractStatus: 'Termsheet signed; KNA redlines',
    pricingTier: 'Tier 1',
    volume2025: '2.1bn',
    volume2026: '19.9bn',
    goLiveDate: 'est Q2 2026'
  },
  {
    name: 'Checkout.com',
    team: 'LP Win Top MoR Platinum',
    individuals: 'Kieran Wellbelove, Szilard Kaltenecker, Giuliano Belfiore',
    leap: 'Platinum',
    status: 'Scoping',
    specsVersion: 'TBD',
    contractStatus: 'Pitching',
    pricingTier: 'Tier 1',
    volume2025: '-',
    volume2026: '28.2bn',
    goLiveDate: '1Sep26'
  },
  {
    name: 'Lyra',
    team: 'LP Win Top MoR Platinum',
    individuals: 'Kieran Wellbelove, Szilard Kaltenecker, Edouard Bayon',
    leap: 'Platinum',
    status: 'Not Started',
    specsVersion: 'V2R7, V2R8',
    contractStatus: 'Pitching',
    pricingTier: 'Tier 2',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: '1Jan26'
  },
  {
    name: 'Fiserv/Clover',
    team: 'LP Win Top MoR Cobalt',
    individuals: 'Ashley Goldschmid, Joe Zaycosky, Carin Baker, Jing Hao, Justin Boyer',
    leap: 'Cobalt',
    status: 'Scoping',
    specsVersion: 'TBD',
    contractStatus: 'KNA signed',
    pricingTier: 'Tier 0',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: 'Clover - 31Mar26'
  },
  {
    name: 'ACI Worldwide',
    team: 'LP Win Top MoR Cobalt',
    individuals: 'Ashley Goldschmid, Ruairidh Henderson, Nikita Vikhliaev',
    leap: 'Cobalt',
    status: 'Scoping',
    specsVersion: 'TBD',
    contractStatus: 'Termsheet redlines',
    pricingTier: 'Tier 2',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: 'Target Q3-2026 (Jul 1, 2026)'
  },
  {
    name: 'Cybersource',
    team: 'LP Win Top MoR Cobalt',
    individuals: 'Ashley Goldschmid, Joe Zaycosky, Carin Baker, Nikita Vikhliaev, Justin Boyer',
    leap: 'Cobalt',
    status: 'Scoping',
    specsVersion: 'V2R8',
    contractStatus: 'Termsheet signed; KNA redlines',
    pricingTier: 'Tier 2',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: 'Legacy - Live, Klarna Network - April 1, 2026 target'
  },
  {
    name: 'Moneris',
    team: 'LP Win Top MoR Cobalt',
    individuals: 'Ashley Goldschmid, Joe Zaycosky',
    leap: 'Cobalt',
    status: 'Scoping',
    specsVersion: 'V2R9',
    contractStatus: 'Pitching',
    pricingTier: 'Tier 2',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: 'TBC, still going through Term Sheet negotiations'
  },
  {
    name: 'Shift4',
    team: 'LP Win Top MoR Cobalt',
    individuals: 'Ruairidh Henderson',
    leap: 'Cobalt',
    status: 'Not Started',
    specsVersion: 'TBD',
    contractStatus: 'Pitching',
    pricingTier: 'Tier 2',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: 'Target Q3-2026 (Jul 1, 2026)'
  },
  {
    name: 'Shopify',
    team: 'LP Win Top MoR Cobalt',
    individuals: 'Ashley Goldschmid, Seville Gentry',
    leap: 'Cobalt',
    status: 'Not Started',
    specsVersion: 'TBD',
    contractStatus: 'Pitching',
    pricingTier: 'Tier 2',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: 'tbd'
  },
  {
    name: 'Nuvei',
    team: 'LP Win Top MoR Black',
    individuals: 'Fredrika Jarnvall, Max van Zoelen, Volkan Toker',
    leap: 'Black',
    status: 'Not Started',
    specsVersion: 'TBD',
    contractStatus: 'Pitching',
    pricingTier: 'Tier 2',
    volume2025: '-',
    volume2026: '-',
    goLiveDate: 'N/A'
  }
];

// Teams based on Leap categories
const teams = [
  { id: uuidv4(), name: 'LP Win Top MoR Cobalt', description: 'Handles Cobalt Leap acquiring partners' },
  { id: uuidv4(), name: 'LP Win Top MoR Platinum', description: 'Handles Platinum Leap acquiring partners' },
  { id: uuidv4(), name: 'LP Win Top MoR Black', description: 'Handles Black Leap acquiring partners' }
];

// Extract unique individuals from all partners
const allIndividuals = new Set();
acquiringPartners.forEach(partner => {
  partner.individuals.split(',').forEach(ind => {
    allIndividuals.add(ind.trim());
  });
});

const teamMembers = Array.from(allIndividuals).map(name => ({
  name: name,
  email: `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
  role: 'Primary Owner' // Default role, can be updated later
}));

// Initialize database with comprehensive data
db.serialize(() => {
  console.log('Initializing database with comprehensive AP timeline data...');
  
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
  
  // Insert acquiring partners with comprehensive data
  const insertPartner = db.prepare(`INSERT INTO acquiring_partners 
    (id, name, description, volume, status, primary_owner_id, secondary_owner_id, team_id, leap_category, 
     technical_status, specs_version, contract_status, pricing_tier, volume_2025, volume_2026, go_live_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  acquiringPartners.forEach(partner => {
    const individuals = partner.individuals.split(',').map(ind => ind.trim());
    const primaryOwnerId = individuals[0] ? userIds[individuals[0]] : null;
    const secondaryOwnerId = individuals[1] ? userIds[individuals[1]] : null;
    const teamId = teamIds[partner.team];
    
    insertPartner.run(
      uuidv4(),
      partner.name,
      `Win Top MoR ${partner.leap}`,
      partner.volume2025 || partner.volume2026 || 'TBD',
      'Active',
      primaryOwnerId,
      secondaryOwnerId,
      teamId,
      partner.leap,
      partner.status,
      partner.specsVersion,
      partner.contractStatus,
      partner.pricingTier,
      partner.volume2025,
      partner.volume2026,
      partner.goLiveDate
    );
  });
  insertPartner.finalize();
  
  console.log('Database initialized successfully!');
  console.log(`Created ${teams.length} teams`);
  console.log(`Created ${teamMembers.length} users`);
  console.log(`Created ${acquiringPartners.length} acquiring partners`);
  
  // Print summary by team
  console.log('\n=== TEAM ASSIGNMENTS ===');
  teams.forEach(team => {
    const teamPartners = acquiringPartners.filter(p => p.team === team.name);
    console.log(`\n${team.name} (${team.leap} Leap):`);
    teamPartners.forEach(partner => {
      const individuals = partner.individuals.split(',').map(ind => ind.trim());
      console.log(`  - ${partner.name}: ${individuals[0]}${individuals[1] ? ` (${individuals[1]})` : ''}`);
      console.log(`    Status: ${partner.status} | Contract: ${partner.contractStatus} | Go-live: ${partner.goLiveDate}`);
    });
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('\nDatabase connection closed.');
});
