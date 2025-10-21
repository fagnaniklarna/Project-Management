const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function restoreNexiData() {
  console.log('Restoring Nexi data with comprehensive sub-PSPs...');
  
  try {
    // Get Nexi ID
    const nexiId = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM acquiring_partners WHERE name = ?', ['Nexi'], (err, row) => {
        if (err) reject(err);
        else resolve(row?.id);
      });
    });
    
    if (!nexiId) {
      console.log('Nexi not found, creating...');
      const newNexiId = uuidv4();
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO acquiring_partners (
            id, name, status, lifecycle_stage, priority, 
            estimated_volume_band, estimated_volume_value, portfolio_tag,
            go_live_date, go_live_confidence, health_score,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          newNexiId, 'Nexi', 'Active', 'In Development', 'High',
          'High', 50000000000, 'Win Top MoR Cobalt',
          '2025-12-01', 'High', 85,
          new Date().toISOString(), new Date().toISOString()
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      console.log(`Created Nexi with ID: ${newNexiId}`);
    } else {
      console.log(`Found Nexi ID: ${nexiId}`);
    }
    
    const finalNexiId = nexiId || newNexiId;
    
    // Define sub-PSPs with correct schema
    const subPSPs = [
      {
        name: 'Nets Easy',
        type: 'Sub-PSP',
        status: 'Active',
        lifecycle_stage: 'In Development',
        health_score: 85,
        estimated_volume_band: 'Medium',
        estimated_volume_value: 25000000000,
        go_live_date: '2025-08-15',
        notes: 'Nordic payment solution for Norway, Denmark, and Sweden'
      },
      {
        name: 'P24',
        type: 'Sub-PSP', 
        status: 'Active',
        lifecycle_stage: 'Scoping',
        health_score: 70,
        estimated_volume_band: 'Medium',
        estimated_volume_value: 15000000000,
        go_live_date: '2025-10-01',
        notes: 'Polish payment method'
      },
      {
        name: 'Paygate / Computop',
        type: 'Gateway',
        status: 'Active',
        lifecycle_stage: 'Not Started',
        health_score: 60,
        estimated_volume_band: 'Low',
        estimated_volume_value: 8000000000,
        go_live_date: null,
        notes: 'German payment gateway'
      },
      {
        name: 'Paytrail',
        type: 'Sub-PSP',
        status: 'Active',
        lifecycle_stage: 'In Development',
        health_score: 90,
        estimated_volume_band: 'Medium',
        estimated_volume_value: 20000000000,
        go_live_date: '2025-07-01',
        notes: 'Finnish payment service provider'
      }
    ];
    
    // Insert sub-PSPs
    for (const subPSP of subPSPs) {
      const subPSPId = uuidv4();
      
      // Calculate days to go live
      let daysToGoLive = null;
      if (subPSP.go_live_date) {
        const goLiveDate = new Date(subPSP.go_live_date);
        const today = new Date();
        daysToGoLive = Math.ceil((goLiveDate - today) / (1000 * 60 * 60 * 24));
      }
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO sub_psps (
            id, partner_id, name, type, status, lifecycle_stage,
            health_score, estimated_volume_band, estimated_volume_value,
            go_live_date, days_to_go_live, notes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          subPSPId, finalNexiId, subPSP.name, subPSP.type, subPSP.status,
          subPSP.lifecycle_stage, subPSP.health_score, subPSP.estimated_volume_band,
          subPSP.estimated_volume_value, subPSP.go_live_date, daysToGoLive,
          subPSP.notes, new Date().toISOString(), new Date().toISOString()
        ], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      
      console.log(`Created sub-PSP: ${subPSP.name}`);
      
      // Create partner integrations for each sub-PSP
      const integrationPatterns = ['Payments API (HPP)', 'Payments API (Embedded)', 'Plugins'];
      
      for (const pattern of integrationPatterns) {
        const integrationId = uuidv4();
        
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO partner_integrations (
              id, partner_id, integration_pattern, integration_name,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)
          `, [
            integrationId, subPSPId, pattern, `${subPSP.name} - ${pattern}`,
            new Date().toISOString(), new Date().toISOString()
          ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
        });
        
        console.log(`  Created integration: ${pattern}`);
      }
    }
    
    // Create functionalities
    const functionalities = [
      { name: 'Payment Processing', description: 'Core payment processing functionality', channel: 'Payments API (HPP)', requirement: 'required' },
      { name: 'Refund Processing', description: 'Process refunds and cancellations', channel: 'Payments API (HPP)', requirement: 'required' },
      { name: 'Webhook Support', description: 'Receive real-time payment notifications', channel: 'Payments API (HPP)', requirement: 'recommended' },
      { name: 'Tokenization', description: 'Secure token-based payments', channel: 'Payments API (Embedded)', requirement: 'recommended' },
      { name: 'Multi-Currency', description: 'Support for multiple currencies', channel: 'Payments API (HPP)', requirement: 'required' },
      { name: 'Fraud Detection', description: 'Built-in fraud detection and prevention', channel: 'Payments API (HPP)', requirement: 'optional' }
    ];
    
    const functionalityIds = {};
    for (const func of functionalities) {
      const funcId = uuidv4();
      functionalityIds[func.name] = funcId;
      
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO functionalities (id, name, description, channel, integration_requirement_level, lifecycle_status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [funcId, func.name, func.description, func.channel, func.requirement, 'General Availability', new Date().toISOString()], function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        });
      });
      
      console.log(`Created functionality: ${func.name}`);
    }
    
    // Create scope items for each integration
    const scopeStatuses = ['General Availability', 'Early Release (Beta)', 'Not available', 'Not Applicable'];
    const dueDates = ['2025-06-01', '2025-07-01', '2025-08-01', '2025-09-01'];
    
    // Get all partner integrations
    const integrations = await new Promise((resolve, reject) => {
      db.all(`
        SELECT pi.*, sp.name as sub_psp_name 
        FROM partner_integrations pi
        JOIN sub_psps sp ON pi.partner_id = sp.id
        WHERE sp.partner_id = ?
      `, [finalNexiId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const integration of integrations) {
      for (const [funcName, funcId] of Object.entries(functionalityIds)) {
        const scopeId = uuidv4();
        const randomStatus = scopeStatuses[Math.floor(Math.random() * scopeStatuses.length)];
        const randomDueDate = dueDates[Math.floor(Math.random() * dueDates.length)];
        
        await new Promise((resolve, reject) => {
          db.run(`
            INSERT INTO scope (
              id, partner_integration_id, functionality_id, lifecycle_status, planned_live_date,
              created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            scopeId, integration.id, funcId, randomStatus, randomDueDate,
            new Date().toISOString(), new Date().toISOString()
          ], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          });
        });
      }
      
      console.log(`Created scope items for ${integration.sub_psp_name} - ${integration.integration_pattern}`);
    }
    
    console.log('✅ Nexi data restoration completed successfully!');
    
  } catch (error) {
    console.error('Error restoring Nexi data:', error);
  } finally {
    db.close();
  }
}

restoreNexiData();
