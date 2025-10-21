const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

async function addPaytrailAsSubPSP() {
  console.log('Adding Paytrail as sub-PSP of Nexi...');

  const nexiId = 'a00f11c4-92da-4078-9444-b3fa0acef2eb';
  const paytrailId = 'af0dffe6-f9b7-4ff9-af13-c2bc5fd135dc';

  // First, check if Paytrail already exists
  const existingPaytrail = await new Promise((resolve, reject) => {
    db.get('SELECT id FROM acquiring_partners WHERE id = ?', [paytrailId], (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  if (existingPaytrail) {
    console.log('Paytrail already exists, updating parent relationship...');
    
    // Update existing Paytrail to have Nexi as parent
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE acquiring_partners SET parent_partner_id = ? WHERE id = ?',
        [nexiId, paytrailId],
        function(err) {
          if (err) reject(err);
          else {
            console.log('Updated Paytrail parent relationship');
            resolve();
          }
        }
      );
    });
  } else {
    console.log('Creating new Paytrail partner...');
    
    // Insert Paytrail as sub-PSP of Nexi
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO acquiring_partners (
          id, name, description, status, parent_partner_id,
          technical_status, volume_2025, volume_2026, go_live_date,
          contract_status, volume, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paytrailId,
          'Paytrail',
          'Finnish payment service provider (sub-PSP of Nexi)',
          'Active',
          nexiId,
          'In Development',
          '€25M',
          '€40M',
          '2025-09-01',
          'KNA signed',
          'Medium',
          new Date().toISOString(),
          new Date().toISOString()
        ],
        function(err) {
          if (err) reject(err);
          else {
            console.log('Created Paytrail as sub-PSP of Nexi');
            resolve();
          }
        }
      );
    });
  }

  // Verify the relationship
  const verification = await new Promise((resolve, reject) => {
    db.get(
      `SELECT ap.*, parent.name as parent_name 
       FROM acquiring_partners ap 
       LEFT JOIN acquiring_partners parent ON ap.parent_partner_id = parent.id 
       WHERE ap.id = ?`,
      [paytrailId],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });

  console.log('Verification:', verification);
  console.log('Paytrail successfully added as sub-PSP of Nexi!');
}

addPaytrailAsSubPSP().catch(err => {
  console.error('Error adding Paytrail as sub-PSP:', err);
}).finally(() => {
  db.close();
});
