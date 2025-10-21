const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

async function seedComprehensiveData() {
    console.log('Seeding comprehensive data...');

    // Create Teams
    const teams = [
        { id: uuidv4(), name: 'Distribution', capacity_slots: 8 },
        { id: uuidv4(), name: 'Integration', capacity_slots: 12 },
        { id: uuidv4(), name: 'Commercial', capacity_slots: 6 },
        { id: uuidv4(), name: 'Technical', capacity_slots: 10 }
    ];

    for (const team of teams) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO teams (id, name, capacity_slots, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`,
                [team.id, team.name, team.capacity_slots, new Date().toISOString(), new Date().toISOString()],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
        console.log(`Created team: ${team.name}`);
    }

    // Create Users
    const users = [
        { id: uuidv4(), name: 'Sarah Johnson', email: 'sarah.johnson@klarna.com', role: 'Owner', team_id: teams[0].id },
        { id: uuidv4(), name: 'Mike Chen', email: 'mike.chen@klarna.com', role: 'Editor', team_id: teams[1].id },
        { id: uuidv4(), name: 'Emma Wilson', email: 'emma.wilson@klarna.com', role: 'Owner', team_id: teams[2].id },
        { id: uuidv4(), name: 'David Rodriguez', email: 'david.rodriguez@klarna.com', role: 'Editor', team_id: teams[3].id },
        { id: uuidv4(), name: 'Lisa Anderson', email: 'lisa.anderson@klarna.com', role: 'Admin', team_id: teams[0].id },
        { id: uuidv4(), name: 'Tom Brown', email: 'tom.brown@klarna.com', role: 'Editor', team_id: teams[1].id }
    ];

    for (const user of users) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO users (id, name, email, role, team_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [user.id, user.name, user.email, user.role, user.team_id, new Date().toISOString(), new Date().toISOString()],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
        console.log(`Created user: ${user.name}`);
    }

    // Create Acquiring Partners
    const partners = [
        {
            id: uuidv4(),
            name: 'Stripe',
            status: 'Active',
            lifecycle_stage: 'Launched',
            priority: 'High',
            estimated_volume_band: 'High',
            estimated_volume_value: 200000000000,
            portfolio_tag: 'Win Top MoR Cobalt',
            go_live_date: '2024-06-01',
            go_live_confidence: 'High',
            health_score: 95,
            days_to_go_live: 0,
            project_duration_days: 180,
            commercial_owner_id: users[2].id,
            primary_owner_id: users[0].id,
            owning_team_id: teams[0].id
        },
        {
            id: uuidv4(),
            name: 'Adyen',
            status: 'Active',
            lifecycle_stage: 'Scoping',
            priority: 'High',
            estimated_volume_band: 'High',
            estimated_volume_value: 120000000000,
            portfolio_tag: 'Win Top MoR Platinum',
            go_live_date: '2025-03-15',
            go_live_confidence: 'Medium',
            health_score: 75,
            days_to_go_live: 145,
            project_duration_days: 90,
            commercial_owner_id: users[2].id,
            primary_owner_id: users[1].id,
            owning_team_id: teams[1].id
        },
        {
            id: uuidv4(),
            name: 'Nexi',
            status: 'Active',
            lifecycle_stage: 'In Development',
            priority: 'High',
            estimated_volume_band: 'High',
            estimated_volume_value: 80000000000,
            portfolio_tag: 'Win Top MoR Black',
            go_live_date: '2025-09-01',
            go_live_confidence: 'High',
            health_score: 88,
            days_to_go_live: 253,
            project_duration_days: 120,
            commercial_owner_id: users[2].id,
            primary_owner_id: users[0].id,
            owning_team_id: teams[0].id
        },
        {
            id: uuidv4(),
            name: 'Nuvei',
            status: 'Active',
            lifecycle_stage: 'Not Started',
            priority: 'Medium',
            estimated_volume_band: 'Medium',
            estimated_volume_value: 55000000000,
            portfolio_tag: 'Win Top MoR Red',
            go_live_date: null,
            go_live_confidence: null,
            health_score: 60,
            days_to_go_live: null,
            project_duration_days: null,
            commercial_owner_id: users[2].id,
            primary_owner_id: users[1].id,
            owning_team_id: teams[1].id
        },
        {
            id: uuidv4(),
            name: 'Checkout',
            status: 'Active',
            lifecycle_stage: 'Scoping',
            priority: 'Medium',
            estimated_volume_band: 'Medium',
            estimated_volume_value: 45000000000,
            portfolio_tag: 'Win Top MoR Cobalt',
            go_live_date: '2025-06-01',
            go_live_confidence: 'Medium',
            health_score: 70,
            days_to_go_live: 162,
            project_duration_days: 90,
            commercial_owner_id: users[2].id,
            primary_owner_id: users[0].id,
            owning_team_id: teams[0].id
        },
        {
            id: uuidv4(),
            name: 'Shopify',
            status: 'Active',
            lifecycle_stage: 'Not Started',
            priority: 'High',
            estimated_volume_band: 'High',
            estimated_volume_value: 75000000000,
            portfolio_tag: 'Win Top MoR Platinum',
            go_live_date: null,
            go_live_confidence: null,
            health_score: 50,
            days_to_go_live: null,
            project_duration_days: null,
            commercial_owner_id: users[2].id,
            primary_owner_id: users[1].id,
            owning_team_id: teams[1].id
        }
    ];

    for (const partner of partners) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO acquiring_partners (
                id, name, status, lifecycle_stage, priority, estimated_volume_band, 
                estimated_volume_value, portfolio_tag, go_live_date, go_live_confidence,
                health_score, days_to_go_live, project_duration_days, commercial_owner_id,
                primary_owner_id, owning_team_id, last_updated_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                partner.id, partner.name, partner.status, partner.lifecycle_stage, partner.priority,
                partner.estimated_volume_band, partner.estimated_volume_value, partner.portfolio_tag,
                partner.go_live_date, partner.go_live_confidence, partner.health_score,
                partner.days_to_go_live, partner.project_duration_days, partner.commercial_owner_id,
                partner.primary_owner_id, partner.owning_team_id, new Date().toISOString(),
                new Date().toISOString(), new Date().toISOString()
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log(`Created partner: ${partner.name}`);
    }

    // Create Sub-PSPs for Nexi
    const nexiId = partners.find(p => p.name === 'Nexi').id;
    const subPSPs = [
        {
            id: uuidv4(),
            partner_id: nexiId,
            name: 'Nets Easy',
            type: 'Sub-PSP',
            status: 'Active',
            lifecycle_stage: 'In Development',
            health_score: 85,
            estimated_volume_band: 'Medium',
            estimated_volume_value: 25000000000,
            go_live_date: '2025-08-15',
            days_to_go_live: 237
        },
        {
            id: uuidv4(),
            partner_id: nexiId,
            name: 'P24',
            type: 'Sub-PSP',
            status: 'Active',
            lifecycle_stage: 'Scoping',
            health_score: 70,
            estimated_volume_band: 'Medium',
            estimated_volume_value: 15000000000,
            go_live_date: '2025-10-01',
            days_to_go_live: 284
        },
        {
            id: uuidv4(),
            partner_id: nexiId,
            name: 'Paygate / Computop',
            type: 'Gateway',
            status: 'Active',
            lifecycle_stage: 'Not Started',
            health_score: 60,
            estimated_volume_band: 'Low',
            estimated_volume_value: 8000000000,
            go_live_date: null,
            days_to_go_live: null
        },
        {
            id: uuidv4(),
            partner_id: nexiId,
            name: 'Paytrail',
            type: 'Sub-PSP',
            status: 'Active',
            lifecycle_stage: 'In Development',
            health_score: 90,
            estimated_volume_band: 'Medium',
            estimated_volume_value: 20000000000,
            go_live_date: '2025-07-01',
            days_to_go_live: 193
        }
    ];

    for (const subPSP of subPSPs) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO sub_psps (
                id, partner_id, name, type, status, lifecycle_stage, health_score,
                estimated_volume_band, estimated_volume_value, go_live_date, days_to_go_live,
                last_updated_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                subPSP.id, subPSP.partner_id, subPSP.name, subPSP.type, subPSP.status,
                subPSP.lifecycle_stage, subPSP.health_score, subPSP.estimated_volume_band,
                subPSP.estimated_volume_value, subPSP.go_live_date, subPSP.days_to_go_live,
                new Date().toISOString(), new Date().toISOString(), new Date().toISOString()
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log(`Created sub-PSP: ${subPSP.name}`);
    }

    // Create Projects for Nexi
    const projects = [
        {
            id: uuidv4(),
            partner_id: nexiId,
            name: 'Nexi Integration',
            status: 'Active',
            priority: 'High',
            project_type: 'New KN Integration',
            estimated_volume_band: 'High',
            estimated_volume_value: 80000000000,
            health_score: 88,
            go_live_date: '2025-09-01',
            days_to_go_live: 253,
            duration_days: 120,
            owning_team_id: teams[0].id,
            commercial_owner_id: users[2].id,
            primary_owner_id: users[0].id
        }
    ];

    for (const project of projects) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO projects (
                id, partner_id, name, status, priority, project_type, estimated_volume_band,
                estimated_volume_value, health_score, go_live_date, days_to_go_live, duration_days,
                owning_team_id, commercial_owner_id, primary_owner_id, last_updated_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                project.id, project.partner_id, project.name, project.status, project.priority,
                project.project_type, project.estimated_volume_band, project.estimated_volume_value,
                project.health_score, project.go_live_date, project.days_to_go_live, project.duration_days,
                project.owning_team_id, project.commercial_owner_id, project.primary_owner_id,
                new Date().toISOString(), new Date().toISOString(), new Date().toISOString()
            ], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log(`Created project: ${project.name}`);
    }

    // Create Features
    const features = [
        { id: uuidv4(), name: 'KN Webhooks v2', description: 'Real-time webhook notifications for payment events', category: 'Webhook' },
        { id: uuidv4(), name: 'Multi-Currency Refunds', description: 'Support for refunds in multiple currencies', category: 'API' },
        { id: uuidv4(), name: 'Tokenization API', description: 'Secure token storage and management', category: 'Tokenization' },
        { id: uuidv4(), name: 'In-Store Payments', description: 'Point of sale integration capabilities', category: 'In-Store' },
        { id: uuidv4(), name: 'Reporting Dashboard', description: 'Analytics and reporting interface', category: 'Reporting' }
    ];

    for (const feature of features) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO features (id, name, description, category, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
                [feature.id, feature.name, feature.description, feature.category, new Date().toISOString(), new Date().toISOString()],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
        console.log(`Created feature: ${feature.name}`);
    }

    // Create Integration Paths for Nexi project
    const nexiProjectId = projects[0].id;
    const integrationPaths = [
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            name: 'Payment API (HPP)',
            description: 'Hosted Payment Page integration',
            status: 'In Development'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            name: 'Payment API (Embedded)',
            description: 'Embedded payment form integration',
            status: 'In Development'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            name: 'Plugins',
            description: 'E-commerce platform plugins',
            status: 'Not Started'
        }
    ];

    for (const path of integrationPaths) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO integration_paths (id, project_id, name, description, status, last_updated_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [path.id, path.project_id, path.name, path.description, path.status, new Date().toISOString(), new Date().toISOString(), new Date().toISOString()],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
        console.log(`Created integration path: ${path.name}`);
    }

    // Create Scope Items for Nexi project
    const scopeItems = [
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            title: 'Contract Signing',
            description: 'Execute partnership agreement',
            category: 'Contract',
            status: 'Done',
            owner_id: users[2].id,
            due_date: '2025-01-15'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            title: 'API Documentation Review',
            description: 'Review and approve technical specifications',
            category: 'Technical',
            status: 'In Progress',
            owner_id: users[0].id,
            due_date: '2025-02-01'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            title: 'Webhook v2 Subscription',
            description: 'Subscribe to refund and chargeback events',
            category: 'Webhooks',
            status: 'In Progress',
            owner_id: users[1].id,
            due_date: '2025-03-15'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            title: 'Compliance Certification',
            description: 'Complete PCI DSS and GDPR compliance review',
            category: 'Compliance',
            status: 'Not Started',
            owner_id: users[3].id,
            due_date: '2025-04-01'
        }
    ];

    for (const item of scopeItems) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO scope_items (id, project_id, title, description, category, status, owner_id, due_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [item.id, item.project_id, item.title, item.description, item.category, item.status, item.owner_id, item.due_date, new Date().toISOString(), new Date().toISOString()],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
        console.log(`Created scope item: ${item.title}`);
    }

    // Create Milestones for Nexi project
    const milestones = [
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            name: 'Contract Signed',
            target_date: '2025-01-15',
            confidence: 'High',
            status: 'Done',
            notes: 'Partnership agreement executed successfully'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            name: 'IQR Complete',
            target_date: '2025-03-01',
            confidence: 'High',
            status: 'Planned',
            notes: 'Initial Quality Review milestone'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            name: 'Sandbox Testing',
            target_date: '2025-05-15',
            confidence: 'Medium',
            status: 'Planned',
            notes: 'Complete sandbox environment testing'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            name: 'Production Launch',
            target_date: '2025-09-01',
            confidence: 'High',
            status: 'Planned',
            notes: 'Go live with production environment'
        }
    ];

    for (const milestone of milestones) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO milestones (id, project_id, name, target_date, confidence, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [milestone.id, milestone.project_id, milestone.name, milestone.target_date, milestone.confidence, milestone.status, milestone.notes, new Date().toISOString(), new Date().toISOString()],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
        console.log(`Created milestone: ${milestone.name}`);
    }

    // Create Risks for Nexi project
    const risks = [
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            title: 'Regulatory Compliance Delay',
            severity: 'High',
            probability: 'Medium',
            status: 'Open',
            owner_id: users[3].id,
            due_date: '2025-03-01',
            notes: 'Potential delay due to regulatory review requirements'
        },
        {
            id: uuidv4(),
            project_id: nexiProjectId,
            title: 'Technical Integration Complexity',
            severity: 'Medium',
            probability: 'High',
            status: 'Open',
            owner_id: users[0].id,
            due_date: '2025-04-15',
            notes: 'Complex integration requirements may extend timeline'
        }
    ];

    for (const risk of risks) {
        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO risks (id, project_id, title, severity, probability, status, owner_id, due_date, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [risk.id, risk.project_id, risk.title, risk.severity, risk.probability, risk.status, risk.owner_id, risk.due_date, risk.notes, new Date().toISOString(), new Date().toISOString()],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                });
        });
        console.log(`Created risk: ${risk.title}`);
    }

    console.log('Successfully seeded comprehensive data!');
}

seedComprehensiveData().catch(err => {
    console.error('Error seeding data:', err);
}).finally(() => {
    db.close();
});
