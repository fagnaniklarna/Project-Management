const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Specific names to keep
const allowedNames = [
  'Marissa Fagnani',
  'Justin Boyer', 
  'Akin Toksan',
  'Carin Baker',
  'David Summersbee',
  'Dexter Vosper',
  'Volkan Toker',
  'Edouard Bayon',
  'Giuliano Belfiore',
  'Szilard Kaltenecker',
  'Nikita Vikhliaev'
];

console.log('Updating capacity data to only include specified names...');

db.serialize(() => {
  // First, let's see what users we currently have
  db.all("SELECT id, name, role FROM users WHERE role IN ('Primary Owner', 'Secondary Owner')", [], (err, rows) => {
    if (err) {
      console.error('Error fetching users:', err);
      return;
    }
    
    console.log('Current users in database:');
    rows.forEach(row => {
      console.log(`- ${row.name} (${row.role})`);
    });
    
    // Delete users that are not in the allowed list
    const placeholders = allowedNames.map(() => '?').join(',');
    const deleteQuery = `DELETE FROM users WHERE role IN ('Primary Owner', 'Secondary Owner') AND name NOT IN (${placeholders})`;
    
    db.run(deleteQuery, allowedNames, function(err) {
      if (err) {
        console.error('Error deleting users:', err);
        return;
      }
      
      console.log(`Deleted ${this.changes} users not in the allowed list`);
      
      // Now let's see what's left
      db.all("SELECT id, name, role FROM users WHERE role IN ('Primary Owner', 'Secondary Owner')", [], (err, remainingRows) => {
        if (err) {
          console.error('Error fetching remaining users:', err);
          return;
        }
        
        console.log('\nRemaining users after cleanup:');
        remainingRows.forEach(row => {
          console.log(`- ${row.name} (${row.role})`);
        });
        
        // Test the capacity endpoint
        console.log('\nTesting capacity endpoint...');
        const capacityQuery = `
          SELECT 
            u.id,
            u.name,
            u.role,
            COUNT(DISTINCT CASE WHEN ap.primary_owner_id = u.id THEN ap.id END) as primary_count,
            COUNT(DISTINCT CASE WHEN ap.secondary_owner_id = u.id THEN ap.id END) as secondary_count
          FROM users u
          LEFT JOIN acquiring_partners ap ON (
            ap.primary_owner_id = u.id OR 
            ap.secondary_owner_id = u.id
          )
          WHERE u.role IN ('Primary Owner', 'Secondary Owner')
          GROUP BY u.id, u.name, u.role
          ORDER BY u.name
        `;
        
        db.all(capacityQuery, [], (err, capacityRows) => {
          if (err) {
            console.error('Error testing capacity query:', err);
            return;
          }
          
          console.log('\nCapacity data:');
          capacityRows.forEach(row => {
            const total = row.primary_count + row.secondary_count;
            console.log(`- ${row.name} (${row.role}): ${total} total (${row.primary_count} primary, ${row.secondary_count} secondary)`);
          });
          
          console.log('\n✅ Database updated successfully!');
          db.close();
        });
      });
    });
  });
});


