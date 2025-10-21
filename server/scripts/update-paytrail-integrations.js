const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

async function updatePayTrailIntegrations() {
    console.log('Updating PayTrail integration paths...');

    const paytrailId = 'af0dffe6-f9b7-4ff9-af13-c2bc5fd135dc';
    
    // Define the new integration paths
    const integrations = [
        {
            name: 'Payment API (HPP)',
            pattern: 'Payments API (HPP)'
        },
        {
            name: 'Payment API (Embedded)',
            pattern: 'Payments API (Embedded)'
        },
        {
            name: 'Plugins',
            pattern: 'Plugins'
        }
    ];

    // Insert new integrations
    for (const integration of integrations) {
        const integrationId = uuidv4();
        
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO partner_integrations (
                id, partner_id, integration_name, integration_pattern, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                integrationId,
                paytrailId,
                integration.name,
                integration.pattern,
                new Date().toISOString(),
                new Date().toISOString()
            ], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`Created integration: ${integration.name} (${integration.pattern})`);
    }

    console.log('Successfully updated PayTrail integration paths!');
}

updatePayTrailIntegrations().catch(err => {
    console.error('Error updating PayTrail integrations:', err);
}).finally(() => {
    db.close();
});
