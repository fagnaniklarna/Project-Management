const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function addSecondNexi() {
  console.log('Adding second Nexi partner...');

  // Create second Nexi partner
  const secondNexiId = uuidv4();
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO acquiring_partners 
      (id, name, description, volume, status, team_id, primary_owner_id, secondary_owner_id, 
       solution_engineer_id, commercial_owner_id, primary_sd_owner_id, secondary_sd_owner_id,
       leap_category, technical_status, specs_version, contract_status, pricing_tier,
       volume_2025, volume_2026, go_live_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        secondNexiId, 'Nexi (Original Model)', 'Italian payment service provider - Original data model', 'High', 'Active',
        null, null, null, null, null, null, null,
        'Tier 1', 'In Development', 'v2.1', 'Termsheet signed; KNA redlines', 'Tier 1',
        '€50M', '€75M', '2025-12-01'
      ],
      function(err) {
        if (err) reject(err);
        else resolve(this);
      }
    );
  });

  // Create integration patterns for second Nexi (HPP, Embedded, Plugins)
  const integrationPatterns = [
    {
      integration_pattern: 'Payments API (HPP)',
      planned_go_live_date: '2025-12-01'
    },
    {
      integration_pattern: 'Payments API (Embedded)',
      planned_go_live_date: '2026-03-01'
    },
    {
      integration_pattern: 'Plugins',
      planned_go_live_date: '2026-06-01'
    }
  ];

  console.log('Creating integration patterns for second Nexi...');
  for (const integration of integrationPatterns) {
    const id = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO partner_integrations (id, partner_id, integration_pattern, planned_go_live_date) VALUES (?, ?, ?, ?)',
        [id, secondNexiId, integration.integration_pattern, integration.planned_go_live_date],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
  }

  // Get all functionalities for scope creation
  const allFunctionalities = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM functionalities', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const allIntegrations = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM partner_integrations WHERE partner_id = ?', [secondNexiId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  console.log('Creating scope entries for second Nexi...');
  
  // Create scope entries for each functionality and integration combination
  for (const func of allFunctionalities) {
    for (const integration of allIntegrations) {
      // Only create scope for matching channels
      if (func.channel === integration.integration_pattern) {
        const scopeId = uuidv4();
        
        // Determine lifecycle status based on functionality requirement level
        let lifecycleStatus = 'Not available';
        if (func.integration_requirement_level === 'required') {
          lifecycleStatus = 'General Availability';
        } else if (func.integration_requirement_level === 'recommended') {
          lifecycleStatus = Math.random() > 0.5 ? 'General Availability' : 'Early Release (Beta)';
        } else {
          lifecycleStatus = Math.random() > 0.7 ? 'General Availability' : 'Not available';
        }

        // Set planned live date based on integration pattern
        let plannedLiveDate = null;
        if (lifecycleStatus === 'General Availability') {
          plannedLiveDate = integration.planned_go_live_date;
        } else if (lifecycleStatus === 'Early Release (Beta)') {
          // Set beta date 3 months before go-live
          const goLiveDate = new Date(integration.planned_go_live_date);
          goLiveDate.setMonth(goLiveDate.getMonth() - 3);
          plannedLiveDate = goLiveDate.toISOString().split('T')[0];
        }

        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO scope (id, partner_integration_id, functionality_id, lifecycle_status, planned_live_date) VALUES (?, ?, ?, ?, ?)',
            [scopeId, integration.id, func.id, lifecycleStatus, plannedLiveDate],
            function(err) {
              if (err) reject(err);
              else resolve(this);
            }
          );
        });
      }
    }
  }

  console.log('Second Nexi partner added successfully!');
  
  // Print summary
  const partnerCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM acquiring_partners WHERE name LIKE ?', ['Nexi%'], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  const integrationCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM partner_integrations WHERE partner_id = ?', [secondNexiId], (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  const scopeCount = await new Promise((resolve, reject) => {
    db.all('SELECT COUNT(*) as count FROM scope s JOIN partner_integrations pi ON s.partner_integration_id = pi.id WHERE pi.partner_id = ?', [secondNexiId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0].count);
    });
  });

  console.log(`\nSummary:`);
  console.log(`- Nexi Partners: ${partnerCount}`);
  console.log(`- Integration Patterns: ${integrationCount}`);
  console.log(`- Scope Entries: ${scopeCount}`);
}

addSecondNexi()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error adding second Nexi:', err);
    db.close();
    process.exit(1);
  });
