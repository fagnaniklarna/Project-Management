const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Create Nexi and Paytrail partners
const partners = [
  {
    name: 'Nexi',
    description: 'Italian payment service provider',
    volume: 'High',
    status: 'Active',
    team_id: null,
    primary_owner_id: null,
    secondary_owner_id: null,
    solution_engineer_id: null,
    commercial_owner_id: null,
    primary_sd_owner_id: null,
    secondary_sd_owner_id: null,
    leap_category: 'Tier 1',
    technical_status: 'In Development',
    specs_version: 'v2.1',
    contract_status: 'Termsheet signed; KNA redlines',
    pricing_tier: 'Tier 1',
    volume_2025: '€50M',
    volume_2026: '€75M',
    go_live_date: '2025-12-01'
  },
  {
    name: 'Paytrail',
    description: 'Finnish payment service provider',
    volume: 'Medium',
    status: 'Active',
    team_id: null,
    primary_owner_id: null,
    secondary_owner_id: null,
    solution_engineer_id: null,
    commercial_owner_id: null,
    primary_sd_owner_id: null,
    secondary_sd_owner_id: null,
    leap_category: 'Tier 2',
    technical_status: 'In Development',
    specs_version: 'v2.0',
    contract_status: 'KNA signed',
    pricing_tier: 'Tier 2',
    volume_2025: '€25M',
    volume_2026: '€40M',
    go_live_date: '2025-09-01'
  }
];

async function createPartners() {
  console.log('Creating Nexi and Paytrail partners...');

  for (const partnerData of partners) {
    const id = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO acquiring_partners 
        (id, name, description, volume, status, team_id, primary_owner_id, secondary_owner_id, 
         solution_engineer_id, commercial_owner_id, primary_sd_owner_id, secondary_sd_owner_id,
         leap_category, technical_status, specs_version, contract_status, pricing_tier,
         volume_2025, volume_2026, go_live_date) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, partnerData.name, partnerData.description, partnerData.volume, partnerData.status,
          partnerData.team_id, partnerData.primary_owner_id, partnerData.secondary_owner_id,
          partnerData.solution_engineer_id, partnerData.commercial_owner_id, partnerData.primary_sd_owner_id,
          partnerData.secondary_sd_owner_id, partnerData.leap_category, partnerData.technical_status,
          partnerData.specs_version, partnerData.contract_status, partnerData.pricing_tier,
          partnerData.volume_2025, partnerData.volume_2026, partnerData.go_live_date
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
    console.log(`Created partner: ${partnerData.name} (${id})`);
  }

  console.log('Partners created successfully!');
}

createPartners()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error creating partners:', err);
    db.close();
    process.exit(1);
  });
