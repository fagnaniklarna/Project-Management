const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

async function addParentPartnerColumn() {
  console.log('Adding parent_partner_id column to acquiring_partners table...');

  try {
    // Add the parent_partner_id column
    await new Promise((resolve, reject) => {
      db.run(
        'ALTER TABLE acquiring_partners ADD COLUMN parent_partner_id TEXT',
        function(err) {
          if (err) {
            if (err.message.includes('duplicate column name')) {
              console.log('Column parent_partner_id already exists');
              resolve();
            } else {
              reject(err);
            }
          } else {
            console.log('Added parent_partner_id column');
            resolve();
          }
        }
      );
    });

    // Add foreign key constraint
    await new Promise((resolve, reject) => {
      db.run(
        'CREATE INDEX IF NOT EXISTS idx_parent_partner_id ON acquiring_partners(parent_partner_id)',
        function(err) {
          if (err) reject(err);
          else {
            console.log('Added index for parent_partner_id');
            resolve();
          }
        }
      );
    });

    console.log('Successfully added parent_partner_id column and index!');
  } catch (err) {
    console.error('Error adding column:', err);
  }
}

addParentPartnerColumn().finally(() => {
  db.close();
});
