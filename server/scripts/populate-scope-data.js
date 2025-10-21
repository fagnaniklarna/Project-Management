const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Sample functionalities based on the Klarna model
const functionalities = [
  {
    name: 'Read the state of a payment request',
    description: 'Retrieve the current status and details of a payment request',
    channel: 'Server-Side',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Support Tokenization on Authorize',
    description: 'Enable tokenization during the authorization process',
    channel: 'Server-Side',
    integration_requirement_level: 'recommended',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Refund processing',
    description: 'Process refunds for completed transactions',
    channel: 'Server-Side',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Capture payment',
    description: 'Capture previously authorized payments',
    channel: 'Server-Side',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Cancel payment',
    description: 'Cancel pending or authorized payments',
    channel: 'Server-Side',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Web SDK Payment Widget',
    description: 'Embedded payment widget for web applications',
    channel: 'Web SDK',
    integration_requirement_level: 'recommended',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Mobile SDK Payment Flow',
    description: 'Native mobile payment integration',
    channel: 'Mobile SDK',
    integration_requirement_level: 'optional',
    lifecycle_status: 'Early Release (Beta)'
  },
  {
    name: 'Webhook notifications',
    description: 'Receive real-time payment status updates',
    channel: 'Server-Side',
    integration_requirement_level: 'recommended',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Payment method validation',
    description: 'Validate payment methods before processing',
    channel: 'Server-Side',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Fraud detection integration',
    description: 'Integrate with fraud detection systems',
    channel: 'Server-Side',
    integration_requirement_level: 'optional',
    lifecycle_status: 'Not available'
  }
];

// Sample partner integrations for Nexi/Paytrail
const partnerIntegrations = [
  {
    partner_name: 'Nexi',
    integration_pattern: 'Server-Side',
    planned_go_live_date: '2025-12-01'
  },
  {
    partner_name: 'Nexi',
    integration_pattern: 'Web SDK',
    planned_go_live_date: '2026-03-01'
  },
  {
    partner_name: 'Paytrail',
    integration_pattern: 'Server-Side',
    planned_go_live_date: '2025-09-01'
  },
  {
    partner_name: 'Paytrail',
    integration_pattern: 'Web SDK',
    planned_go_live_date: '2025-11-01'
  }
];

async function populateDatabase() {
  console.log('Starting database population...');

  // Insert functionalities
  console.log('Inserting functionalities...');
  for (const func of functionalities) {
    const id = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT OR IGNORE INTO functionalities (id, name, description, channel, integration_requirement_level, lifecycle_status) VALUES (?, ?, ?, ?, ?, ?)',
        [id, func.name, func.description, func.channel, func.integration_requirement_level, func.lifecycle_status],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
  }

  // Get partner IDs
  const partners = await new Promise((resolve, reject) => {
    db.all('SELECT id, name FROM acquiring_partners WHERE name IN (?, ?)', ['Nexi', 'Paytrail'], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  console.log('Found partners:', partners);

  // Insert partner integrations
  console.log('Inserting partner integrations...');
  for (const integration of partnerIntegrations) {
    const partner = partners.find(p => p.name === integration.partner_name);
    if (partner) {
      const id = uuidv4();
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT OR IGNORE INTO partner_integrations (id, partner_id, integration_pattern, planned_go_live_date) VALUES (?, ?, ?, ?)',
          [id, partner.id, integration.integration_pattern, integration.planned_go_live_date],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
    }
  }

  // Get all functionalities and partner integrations for scope creation
  const allFunctionalities = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM functionalities', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const allIntegrations = await new Promise((resolve, reject) => {
    db.all('SELECT pi.*, ap.name as partner_name FROM partner_integrations pi JOIN acquiring_partners ap ON pi.partner_id = ap.id', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  console.log('Creating scope entries...');
  
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
            'INSERT OR IGNORE INTO scope (id, partner_integration_id, functionality_id, lifecycle_status, planned_live_date) VALUES (?, ?, ?, ?, ?)',
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

  console.log('Database population completed successfully!');
  
  // Print summary
  const functionalityCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM functionalities', (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  const integrationCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM partner_integrations', (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  const scopeCount = await new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM scope', (err, row) => {
      if (err) reject(err);
      else resolve(row.count);
    });
  });

  console.log(`\nSummary:`);
  console.log(`- Functionalities: ${functionalityCount}`);
  console.log(`- Partner Integrations: ${integrationCount}`);
  console.log(`- Scope Entries: ${scopeCount}`);
}

populateDatabase()
  .then(() => {
    db.close();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error populating database:', err);
    db.close();
    process.exit(1);
  });
