const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

async function createComprehensiveSchema() {
    console.log('Creating comprehensive database schema...');

    // Drop existing tables to start fresh (in correct order due to foreign keys)
    const dropTables = [
        'DROP TABLE IF EXISTS project_features',
        'DROP TABLE IF EXISTS partner_features', 
        'DROP TABLE IF EXISTS dependencies',
        'DROP TABLE IF EXISTS risks',
        'DROP TABLE IF EXISTS milestones',
        'DROP TABLE IF EXISTS technical_details',
        'DROP TABLE IF EXISTS scope_items',
        'DROP TABLE IF EXISTS integration_paths',
        'DROP TABLE IF EXISTS projects',
        'DROP TABLE IF EXISTS features',
        'DROP TABLE IF EXISTS teams',
        'DROP TABLE IF EXISTS users',
        'DROP TABLE IF EXISTS sub_psps',
        'DROP TABLE IF EXISTS partner_integrations',
        'DROP TABLE IF EXISTS functionalities',
        'DROP TABLE IF EXISTS scope',
        'DROP TABLE IF EXISTS acquiring_partners'
    ];

    for (const sql of dropTables) {
        await new Promise((resolve, reject) => {
            db.run(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    // Create Users table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                role TEXT NOT NULL CHECK(role IN ('Viewer', 'Editor', 'Owner', 'Admin')),
                team_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (team_id) REFERENCES teams (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Teams table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE teams (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                capacity_slots INTEGER,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Acquiring Partners table (updated)
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE acquiring_partners (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('Active', 'Inactive')),
                lifecycle_stage TEXT NOT NULL CHECK(lifecycle_stage IN ('Not Started', 'Scoping', 'In Development', 'Launched', 'Blocked')),
                priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')),
                estimated_volume_band TEXT CHECK(estimated_volume_band IN ('Low', 'Medium', 'High')),
                estimated_volume_value INTEGER,
                portfolio_tag TEXT CHECK(portfolio_tag IN ('Win Top MoR Black', 'Win Top MoR Cobalt', 'Win Top MoR Platinum', 'Win Top MoR Red')),
                go_live_date DATE,
                go_live_confidence TEXT CHECK(go_live_confidence IN ('Low', 'Medium', 'High')),
                health_score INTEGER CHECK(health_score >= 0 AND health_score <= 100),
                days_to_go_live INTEGER,
                project_duration_days INTEGER,
                commercial_owner_id TEXT,
                primary_owner_id TEXT,
                secondary_owner_id TEXT,
                solution_engineer_id TEXT,
                primary_sd_owner_id TEXT,
                secondary_sd_owner_id TEXT,
                owning_team_id TEXT,
                parent_partner_id TEXT,
                last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (commercial_owner_id) REFERENCES users (id),
                FOREIGN KEY (primary_owner_id) REFERENCES users (id),
                FOREIGN KEY (secondary_owner_id) REFERENCES users (id),
                FOREIGN KEY (solution_engineer_id) REFERENCES users (id),
                FOREIGN KEY (primary_sd_owner_id) REFERENCES users (id),
                FOREIGN KEY (secondary_sd_owner_id) REFERENCES users (id),
                FOREIGN KEY (owning_team_id) REFERENCES teams (id),
                FOREIGN KEY (parent_partner_id) REFERENCES acquiring_partners (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Sub-PSPs table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE sub_psps (
                id TEXT PRIMARY KEY,
                partner_id TEXT NOT NULL,
                name TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('Sub-PSP', 'Gateway')),
                status TEXT NOT NULL CHECK(status IN ('Active', 'Inactive')),
                lifecycle_stage TEXT NOT NULL CHECK(lifecycle_stage IN ('Not Started', 'Scoping', 'In Development', 'Launched', 'Blocked')),
                health_score INTEGER CHECK(health_score >= 0 AND health_score <= 100),
                estimated_volume_band TEXT CHECK(estimated_volume_band IN ('Low', 'Medium', 'High')),
                estimated_volume_value INTEGER,
                go_live_date DATE,
                days_to_go_live INTEGER,
                last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (partner_id) REFERENCES acquiring_partners (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Projects table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE projects (
                id TEXT PRIMARY KEY,
                partner_id TEXT NOT NULL,
                name TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('Active', 'Inactive')),
                priority TEXT NOT NULL CHECK(priority IN ('Low', 'Medium', 'High', 'Critical')),
                project_type TEXT NOT NULL CHECK(project_type IN ('New KN Integration', 'Migration', 'Enhancement')),
                estimated_volume_band TEXT CHECK(estimated_volume_band IN ('Low', 'Medium', 'High')),
                estimated_volume_value INTEGER,
                health_score INTEGER CHECK(health_score >= 0 AND health_score <= 100),
                go_live_date DATE,
                days_to_go_live INTEGER,
                duration_days INTEGER,
                owning_team_id TEXT,
                commercial_owner_id TEXT,
                primary_owner_id TEXT,
                last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (partner_id) REFERENCES acquiring_partners (id),
                FOREIGN KEY (owning_team_id) REFERENCES teams (id),
                FOREIGN KEY (commercial_owner_id) REFERENCES users (id),
                FOREIGN KEY (primary_owner_id) REFERENCES users (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Features table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE features (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                category TEXT CHECK(category IN ('API', 'Webhook', 'Reporting', 'Tokenization', 'In-Store', 'SDK', 'Integration')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Partner Features join table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE partner_features (
                id TEXT PRIMARY KEY,
                partner_id TEXT NOT NULL,
                feature_id TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('Requested', 'In Progress', 'Enabled', 'Deferred')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (partner_id) REFERENCES acquiring_partners (id),
                FOREIGN KEY (feature_id) REFERENCES features (id),
                UNIQUE(partner_id, feature_id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Project Features join table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE project_features (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                feature_id TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('Requested', 'In Progress', 'Enabled', 'Deferred')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (feature_id) REFERENCES features (id),
                UNIQUE(project_id, feature_id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Integration Paths table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE integration_paths (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                status TEXT NOT NULL CHECK(status IN ('Not Started', 'Scoping', 'In Development', 'Launched', 'Blocked')),
                last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Scope Items table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE scope_items (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT CHECK(category IN ('Contract', 'Commercial', 'Compliance', 'API', 'SDK', 'Reporting', 'Webhooks', 'In-Store', 'Technical', 'Legal')),
                status TEXT NOT NULL CHECK(status IN ('Not Started', 'In Progress', 'Done', 'Blocked')),
                owner_id TEXT,
                due_date DATE,
                evidence_links TEXT, -- JSON array of URLs
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (owner_id) REFERENCES users (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Technical Details table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE technical_details (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                key TEXT NOT NULL,
                value TEXT,
                status TEXT NOT NULL CHECK(status IN ('Unknown', 'Planned', 'Configured', 'Verified')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Milestones table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE milestones (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                name TEXT NOT NULL,
                target_date DATE,
                confidence TEXT CHECK(confidence IN ('Low', 'Medium', 'High')),
                status TEXT NOT NULL CHECK(status IN ('Planned', 'At Risk', 'Done', 'Missed')),
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Risks table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE risks (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                title TEXT NOT NULL,
                severity TEXT NOT NULL CHECK(severity IN ('Low', 'Medium', 'High', 'Critical')),
                probability TEXT NOT NULL CHECK(probability IN ('Low', 'Medium', 'High')),
                status TEXT NOT NULL CHECK(status IN ('Open', 'Mitigated', 'Closed')),
                owner_id TEXT,
                due_date DATE,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (owner_id) REFERENCES users (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create Dependencies table
    await new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE dependencies (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                type TEXT NOT NULL CHECK(type IN ('Internal', 'Partner', 'Merchant', 'Vendor')),
                description TEXT NOT NULL,
                blocked_by TEXT,
                status TEXT NOT NULL CHECK(status IN ('Identified', 'In Progress', 'Resolved', 'Blocked')),
                owner_id TEXT,
                due_date DATE,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (project_id) REFERENCES projects (id),
                FOREIGN KEY (blocked_by) REFERENCES dependencies (id),
                FOREIGN KEY (owner_id) REFERENCES users (id)
            )
        `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    // Create indexes for performance
    const indexes = [
        'CREATE INDEX idx_partners_status ON acquiring_partners (status)',
        'CREATE INDEX idx_partners_lifecycle ON acquiring_partners (lifecycle_stage)',
        'CREATE INDEX idx_partners_team ON acquiring_partners (owning_team_id)',
        'CREATE INDEX idx_partners_parent ON acquiring_partners (parent_partner_id)',
        'CREATE INDEX idx_sub_psps_partner ON sub_psps (partner_id)',
        'CREATE INDEX idx_projects_partner ON projects (partner_id)',
        'CREATE INDEX idx_projects_status ON projects (status)',
        'CREATE INDEX idx_scope_items_project ON scope_items (project_id)',
        'CREATE INDEX idx_risks_project ON risks (project_id)',
        'CREATE INDEX idx_milestones_project ON milestones (project_id)',
        'CREATE INDEX idx_dependencies_project ON dependencies (project_id)'
    ];

    for (const sql of indexes) {
        await new Promise((resolve, reject) => {
            db.run(sql, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    console.log('Successfully created comprehensive database schema!');
}

createComprehensiveSchema().catch(err => {
    console.error('Error creating schema:', err);
}).finally(() => {
    db.close();
});
