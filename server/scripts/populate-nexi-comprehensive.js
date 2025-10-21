const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

async function populateNexiComprehensive() {
    console.log('Populating comprehensive Nexi data...');

    // First, get the existing Nexi ID
    const nexiId = await new Promise((resolve, reject) => {
        db.get(`SELECT id FROM acquiring_partners WHERE name = 'Nexi'`, (err, row) => {
            if (err) reject(err);
            else resolve(row.id);
        });
    });

    console.log('Found Nexi ID:', nexiId);

    // Define sub-PSPs and their integration paths
    const subPSPs = [
        {
            name: 'Nets Easy (NO, DK, SE)',
            description: 'Nordic payment solution for Norway, Denmark, and Sweden',
            integrationPaths: [
                'Paylink',
                'One-Page Shop - Embedded (JS SDK)',
                'One-Page Shop - Hosted (API only)',
                'WooCommerce Plugin',
                'Shopify Plugin',
                'Magento/Adobe Commerce Plugin',
                'PrestaShop Plugin',
                'Shopware Plugin',
                'JTL Plugin',
                'Oxid Plugin',
                'PayEngine (Server-side / Checkout API)'
            ]
        },
        {
            name: 'XPay / NPG (IT, DE, AT, FI, CH, BE, DK, PT, GB, IE, NL, PO, NO, CZ, ES, SE, FR, GR)',
            description: 'Multi-country payment gateway for European markets',
            integrationPaths: [
                'Hosted Payment Page',
                'Pay by Link',
                'Xpay Build (WebSDK / Drop-in solution)',
                'Server to Server (Server-side / Checkout API)',
                'Disputeless',
                'Wordpress Plugin',
                'Prestashop Plugin',
                'Magento 2 Plugin',
                'Opencart Plugin',
                'Salesforce Plugin',
                'BigCommerce Plugin',
                'Shopware Plugin'
            ]
        },
        {
            name: 'P24 (PL)',
            description: 'Polish payment solution',
            integrationPaths: [
                'Checkout (Server-side / Checkout API)'
            ]
        },
        {
            name: 'PayTrail (FI)',
            description: 'Finnish payment service provider',
            integrationPaths: [
                'Payment API (HPP)',
                'Payment API (Embedded)',
                'PayTrail Plugins'
            ]
        },
        {
            name: 'Paygate / Computop',
            description: 'Payment gateway solution',
            integrationPaths: [
                'Payment Gateway'
            ]
        }
    ];

    // Insert sub-PSPs
    for (const subPSP of subPSPs) {
        const subPSPId = uuidv4();
        
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO acquiring_partners (
                id, name, description, status, parent_partner_id, 
                volume, technical_status, contract_status, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                subPSPId,
                subPSP.name,
                subPSP.description,
                'Active',
                nexiId,
                'Medium',
                'In Development',
                'KNA signed',
                new Date().toISOString(),
                new Date().toISOString()
            ], function(err) {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log(`Created sub-PSP: ${subPSP.name}`);

        // Group integration paths by pattern to avoid unique constraint issues
        const integrationGroups = {
            'Server-Side': [],
            'Web SDK': [],
            'Payments API (HPP)': [],
            'Payments API (Embedded)': [],
            'Plugins': []
        };

        // Categorize each integration path
        for (const integrationPath of subPSP.integrationPaths) {
            if (integrationPath.includes('Plugin')) {
                integrationGroups['Plugins'].push(integrationPath);
            } else if (integrationPath.includes('Embedded') || integrationPath.includes('WebSDK') || integrationPath.includes('Drop-in')) {
                integrationGroups['Web SDK'].push(integrationPath);
            } else if (integrationPath.includes('HPP') || integrationPath.includes('Hosted') || integrationPath.includes('Pay by Link')) {
                integrationGroups['Payments API (HPP)'].push(integrationPath);
            } else if (integrationPath.includes('Embedded')) {
                integrationGroups['Payments API (Embedded)'].push(integrationPath);
            } else {
                integrationGroups['Server-Side'].push(integrationPath);
            }
        }

        // Create one integration per pattern group
        for (const [pattern, paths] of Object.entries(integrationGroups)) {
            if (paths.length > 0) {
                const integrationId = uuidv4();
                const integrationName = paths.length === 1 ? paths[0] : `${pattern} Integrations (${paths.length} options)`;
                
                await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO partner_integrations (
                        id, partner_id, integration_name, integration_pattern, 
                        created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        integrationId,
                        subPSPId,
                        integrationName,
                        pattern,
                        new Date().toISOString(),
                        new Date().toISOString()
                    ], function(err) {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                console.log(`  Created integration: ${integrationName} (${pattern})`);
                if (paths.length > 1) {
                    console.log(`    Includes: ${paths.join(', ')}`);
                }
            }
        }
    }

    console.log('Successfully populated comprehensive Nexi data!');
}

populateNexiComprehensive().catch(err => {
    console.error('Error populating Nexi data:', err);
}).finally(() => {
    db.close();
});
