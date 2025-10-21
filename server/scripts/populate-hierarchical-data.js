const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Clear existing data
async function clearExistingData() {
  console.log('Clearing existing data...');
  
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM scope', (err) => {
      if (err) reject(err);
      else resolve(this);
    });
  });
  
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM partner_integrations', (err) => {
      if (err) reject(err);
      else resolve(this);
    });
  });
  
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM functionalities', (err) => {
      if (err) reject(err);
      else resolve(this);
    });
  });
  
  await new Promise((resolve, reject) => {
    db.run('DELETE FROM acquiring_partners WHERE name IN (?, ?)', ['Nexi', 'Paytrail'], (err) => {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Create hierarchical functionalities
const functionalities = [
  // Server-Side functionalities
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
  
  // HPP functionalities
  {
    name: 'Hosted Payment Page',
    description: 'Redirect customers to hosted payment page',
    channel: 'Payments API (HPP)',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'HPP Payment Status Check',
    description: 'Check payment status from hosted page',
    channel: 'Payments API (HPP)',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  
  // Embedded functionalities
  {
    name: 'Embedded Payment Form',
    description: 'Embed payment form directly in merchant website',
    channel: 'Payments API (Embedded)',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Embedded Payment Processing',
    description: 'Process payments within embedded form',
    channel: 'Payments API (Embedded)',
    integration_requirement_level: 'required',
    lifecycle_status: 'General Availability'
  },
  
  // Plugin functionalities
  {
    name: 'WooCommerce Plugin',
    description: 'WordPress WooCommerce integration',
    channel: 'Plugins',
    integration_requirement_level: 'optional',
    lifecycle_status: 'General Availability'
  },
  {
    name: 'Magento Plugin',
    description: 'Magento e-commerce integration',
    channel: 'Plugins',
    integration_requirement_level: 'optional',
    lifecycle_status: 'Early Release (Beta)'
  },
  {
    name: 'Shopify Plugin',
    description: 'Shopify store integration',
    channel: 'Plugins',
    integration_requirement_level: 'optional',
    lifecycle_status: 'Not available'
  }
];

async function populateDatabase() {
  console.log('Starting hierarchical database population...');

  // Clear existing data
  await clearExistingData();

  // Insert functionalities
  console.log('Inserting functionalities...');
  for (const func of functionalities) {
    const id = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO functionalities (id, name, description, channel, integration_requirement_level, lifecycle_status) VALUES (?, ?, ?, ?, ?, ?)',
        [id, func.name, func.description, func.channel, func.integration_requirement_level, func.lifecycle_status],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
  }

  // Create Nexi as parent partner
  const nexiId = uuidv4();
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO acquiring_partners 
      (id, name, description, volume, status, team_id, primary_owner_id, secondary_owner_id, 
       solution_engineer_id, commercial_owner_id, primary_sd_owner_id, secondary_sd_owner_id,
       leap_category, technical_status, specs_version, contract_status, pricing_tier,
       volume_2025, volume_2026, go_live_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nexiId, 'Nexi', 'Italian payment service provider', 'High', 'Active',
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

  // Create PayTrail as sub-PSP of Nexi
  const paytrailId = uuidv4();
  await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO acquiring_partners 
      (id, name, description, volume, status, team_id, primary_owner_id, secondary_owner_id, 
       solution_engineer_id, commercial_owner_id, primary_sd_owner_id, secondary_sd_owner_id,
       leap_category, technical_status, specs_version, contract_status, pricing_tier,
       volume_2025, volume_2026, go_live_date) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paytrailId, 'Paytrail', 'Finnish payment service provider (sub-PSP of Nexi)', 'Medium', 'Active',
        null, null, null, null, null, null, null,
        'Tier 2', 'In Development', 'v2.0', 'KNA signed', 'Tier 2',
        '€25M', '€40M', '2025-09-01'
      ],
      function(err) {
        if (err) reject(err);
        else resolve(this);
      }
    );
  });

  // Create Nexi's integration patterns
  const nexiIntegrations = [
    {
      integration_pattern: 'Server-Side',
      planned_go_live_date: '2025-12-01'
    },
    {
      integration_pattern: 'Web SDK',
      planned_go_live_date: '2026-03-01'
    }
  ];

  console.log('Creating Nexi integrations...');
  for (const integration of nexiIntegrations) {
    const id = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO partner_integrations (id, partner_id, integration_pattern, planned_go_live_date) VALUES (?, ?, ?, ?)',
        [id, nexiId, integration.integration_pattern, integration.planned_go_live_date],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
  }

  // Create PayTrail's integration patterns (as sub-PSP of Nexi)
  const paytrailIntegrations = [
    {
      integration_pattern: 'Payments API (HPP)',
      planned_go_live_date: '2025-09-01'
    },
    {
      integration_pattern: 'Payments API (Embedded)',
      planned_go_live_date: '2025-10-01'
    },
    {
      integration_pattern: 'Plugins',
      planned_go_live_date: '2025-11-01'
    }
  ];

  console.log('Creating PayTrail integrations...');
  for (const integration of paytrailIntegrations) {
    const id = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO partner_integrations (id, partner_id, parent_partner_id, integration_pattern, planned_go_live_date) VALUES (?, ?, ?, ?, ?)',
        [id, paytrailId, nexiId, integration.integration_pattern, integration.planned_go_live_date],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });
  }

  // Get all functionalities and integrations for scope creation
  const allFunctionalities = await new Promise((resolve, reject) => {
    db.all('SELECT * FROM functionalities', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  const allIntegrations = await new Promise((resolve, reject) => {
    db.all('SELECT pi.*, ap.name as partner_name, parent_ap.name as parent_partner_name FROM partner_integrations pi JOIN acquiring_partners ap ON pi.partner_id = ap.id LEFT JOIN acquiring_partners parent_ap ON pi.parent_partner_id = parent_ap.id', (err, rows) => {
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

  console.log('Hierarchical database population completed successfully!');
  
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
