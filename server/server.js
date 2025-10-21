const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Portfolio Metrics API
app.get('/api/metrics/portfolio', (req, res) => {
  const queries = {
    totalPartners: 'SELECT COUNT(*) as count FROM acquiring_partners WHERE status = "Active"',
    livePartners: 'SELECT COUNT(*) as count FROM acquiring_partners WHERE lifecycle_stage = "Launched"',
    inDevelopment: 'SELECT COUNT(*) as count FROM acquiring_partners WHERE lifecycle_stage = "In Development"',
    totalVolume: 'SELECT SUM(estimated_volume_value) as total FROM acquiring_partners WHERE estimated_volume_value IS NOT NULL',
    healthyPartners: 'SELECT COUNT(*) as count FROM acquiring_partners WHERE health_score >= 80',
    blockedPartners: 'SELECT COUNT(*) as count FROM acquiring_partners WHERE lifecycle_stage = "Blocked"'
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.get(query, (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      results[key] = row.count || row.total || 0;
      completed++;
      
      if (completed === total) {
        // Calculate percentages
        results.healthyPercent = results.totalPartners > 0 ? Math.round((results.healthyPartners / results.totalPartners) * 100) : 0;
        results.inProgressPercent = results.totalPartners > 0 ? Math.round((results.inDevelopment / results.totalPartners) * 100) : 0;
        results.blockedPercent = results.totalPartners > 0 ? Math.round((results.blockedPartners / results.totalPartners) * 100) : 0;
        
        res.json(results);
      }
    });
  });
});

// Partners API
app.get('/api/partners', (req, res) => {
  const { team, owner, status, stage, q, sort = 'name', page = 1, page_size = 20 } = req.query;
  
  let query = `
    SELECT 
      ap.*,
      co.name as commercial_owner_name,
      po.name as primary_owner_name,
      so.name as secondary_owner_name,
      se.name as solution_engineer_name,
      psdo.name as primary_sd_owner_name,
      ssdo.name as secondary_sd_owner_name,
      t.name as team_name,
      parent_ap.name as parent_partner_name
    FROM acquiring_partners ap
    LEFT JOIN users co ON ap.commercial_owner_id = co.id
    LEFT JOIN users po ON ap.primary_owner_id = po.id
    LEFT JOIN users so ON ap.secondary_owner_id = so.id
    LEFT JOIN users se ON ap.solution_engineer_id = se.id
    LEFT JOIN users psdo ON ap.primary_sd_owner_id = psdo.id
    LEFT JOIN users ssdo ON ap.secondary_sd_owner_id = ssdo.id
    LEFT JOIN teams t ON ap.owning_team_id = t.id
    LEFT JOIN acquiring_partners parent_ap ON ap.parent_partner_id = parent_ap.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (team) {
    query += ' AND ap.owning_team_id = ?';
    params.push(team);
  }
  
  if (owner) {
    query += ' AND (ap.commercial_owner_id = ? OR ap.primary_owner_id = ?)';
    params.push(owner, owner);
  }
  
  if (status) {
    query += ' AND ap.status = ?';
    params.push(status);
  }
  
  if (stage) {
    query += ' AND ap.lifecycle_stage = ?';
    params.push(stage);
  }
  
  if (q) {
    query += ' AND (ap.name LIKE ? OR co.name LIKE ? OR po.name LIKE ?)';
    const searchTerm = `%${q}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  // Add sorting
  const validSorts = ['name', 'health_score', 'priority', 'updated_at', 'go_live_date'];
  if (validSorts.includes(sort)) {
    query += ` ORDER BY ap.${sort}`;
    if (sort === 'health_score' || sort === 'go_live_date') {
      query += ' DESC';
    }
  } else {
    query += ' ORDER BY ap.name';
  }
  
  // Add pagination
  const offset = (parseInt(page) - 1) * parseInt(page_size);
  query += ' LIMIT ? OFFSET ?';
  params.push(parseInt(page_size), offset);
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/partners/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      ap.*,
      co.name as commercial_owner_name,
      po.name as primary_owner_name,
      so.name as secondary_owner_name,
      se.name as solution_engineer_name,
      psdo.name as primary_sd_owner_name,
      ssdo.name as secondary_sd_owner_name,
      t.name as team_name,
      parent_ap.name as parent_partner_name
    FROM acquiring_partners ap
    LEFT JOIN users co ON ap.commercial_owner_id = co.id
    LEFT JOIN users po ON ap.primary_owner_id = po.id
    LEFT JOIN users so ON ap.secondary_owner_id = so.id
    LEFT JOIN users se ON ap.solution_engineer_id = se.id
    LEFT JOIN users psdo ON ap.primary_sd_owner_id = psdo.id
    LEFT JOIN users ssdo ON ap.secondary_sd_owner_id = ssdo.id
    LEFT JOIN teams t ON ap.owning_team_id = t.id
    LEFT JOIN acquiring_partners parent_ap ON ap.parent_partner_id = parent_ap.id
    WHERE ap.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }
    res.json(row);
  });
});

app.get('/api/partners/:id/sub-psps', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      sp.*,
      ap.name as partner_name
    FROM sub_psps sp
    LEFT JOIN acquiring_partners ap ON sp.partner_id = ap.id
    WHERE sp.partner_id = ?
    ORDER BY sp.name
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Projects API
app.get('/api/partners/:id/projects', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      p.*,
      co.name as commercial_owner_name,
      po.name as primary_owner_name,
      t.name as team_name
    FROM projects p
    LEFT JOIN users co ON p.commercial_owner_id = co.id
    LEFT JOIN users po ON p.primary_owner_id = po.id
    LEFT JOIN teams t ON p.owning_team_id = t.id
    WHERE p.partner_id = ?
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      p.*,
      ap.name as partner_name,
      co.name as commercial_owner_name,
      po.name as primary_owner_name,
      t.name as team_name
    FROM projects p
    LEFT JOIN acquiring_partners ap ON p.partner_id = ap.id
    LEFT JOIN users co ON p.commercial_owner_id = co.id
    LEFT JOIN users po ON p.primary_owner_id = po.id
    LEFT JOIN teams t ON p.owning_team_id = t.id
    WHERE p.id = ?
  `;
  
  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json(row);
  });
});

// Integration Paths API
app.get('/api/projects/:id/integration-paths', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM integration_paths WHERE project_id = ? ORDER BY created_at';
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Scope Items API
app.get('/api/projects/:id/scope-items', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      si.*,
      u.name as owner_name
    FROM scope_items si
    LEFT JOIN users u ON si.owner_id = u.id
    WHERE si.project_id = ?
    ORDER BY si.created_at
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Technical Details API
app.get('/api/projects/:id/technical-details', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM technical_details WHERE project_id = ? ORDER BY created_at';
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Milestones API
app.get('/api/projects/:id/milestones', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM milestones WHERE project_id = ? ORDER BY target_date';
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Risks API
app.get('/api/projects/:id/risks', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      r.*,
      u.name as owner_name
    FROM risks r
    LEFT JOIN users u ON r.owner_id = u.id
    WHERE r.project_id = ?
    ORDER BY r.severity DESC, r.created_at
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Dependencies API
app.get('/api/projects/:id/dependencies', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      d.*,
      u.name as owner_name,
      blocked_d.description as blocked_by_description
    FROM dependencies d
    LEFT JOIN users u ON d.owner_id = u.id
    LEFT JOIN dependencies blocked_d ON d.blocked_by = blocked_d.id
    WHERE d.project_id = ?
    ORDER BY d.status, d.created_at
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Features API
app.get('/api/features', (req, res) => {
  const query = 'SELECT * FROM features ORDER BY category, name';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/projects/:id/features', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      pf.*,
      f.name as feature_name,
      f.description as feature_description,
      f.category as feature_category
    FROM project_features pf
    JOIN features f ON pf.feature_id = f.id
    WHERE pf.project_id = ?
    ORDER BY f.category, f.name
  `;
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Teams API
app.get('/api/teams', (req, res) => {
  const query = 'SELECT * FROM teams ORDER BY name';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Users API
app.get('/api/users', (req, res) => {
  const query = `
    SELECT 
      u.*,
      t.name as team_name
    FROM users u
    LEFT JOIN teams t ON u.team_id = t.id
    ORDER BY u.name
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Enums API
app.get('/api/enums', (req, res) => {
  res.json({
    lifecycle_stage: ['Not Started', 'Scoping', 'In Development', 'Launched', 'Blocked'],
    status: ['Active', 'Inactive'],
    priority: ['Low', 'Medium', 'High', 'Critical'],
    confidence: ['Low', 'Medium', 'High'],
    health_state: ['Healthy', 'In Progress', 'Blocked'],
    project_type: ['New KN Integration', 'Migration', 'Enhancement'],
    scope_status: ['Not Started', 'In Progress', 'Done', 'Blocked'],
    risk_severity: ['Low', 'Medium', 'High', 'Critical'],
    probability: ['Low', 'Medium', 'High'],
    dependency_status: ['Identified', 'In Progress', 'Resolved', 'Blocked'],
    feature_status: ['Requested', 'In Progress', 'Enabled', 'Deferred'],
    portfolio_tag: ['Win Top MoR Black', 'Win Top MoR Cobalt', 'Win Top MoR Platinum', 'Win Top MoR Red'],
    estimated_volume_band: ['Low', 'Medium', 'High']
  });
});

// Partner Integrations API
app.get('/api/partners/:id/integrations', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM partner_integrations WHERE partner_id = ? ORDER BY integration_pattern';
  
  db.all(query, [id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Scope Matrix API
app.get('/api/scope-matrix', (req, res) => {
  const query = `
    SELECT 
      s.*,
      f.name as functionality_name,
      f.description as functionality_description,
      pi.integration_pattern,
      ap.name as partner_name,
      ap.id as partner_id
    FROM scope s
    JOIN functionalities f ON s.functionality_id = f.id
    JOIN partner_integrations pi ON s.partner_integration_id = pi.id
    JOIN acquiring_partners ap ON pi.partner_id = ap.id
    ORDER BY f.name, ap.name, pi.integration_pattern
  `;
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Transform data into matrix format
    const matrixData = {
      functionalities: [],
      partners: {}
    };
    
    rows.forEach(row => {
      // Add functionality if not exists
      if (!matrixData.functionalities.find(f => f.id === row.functionality_id)) {
        matrixData.functionalities.push({
          id: row.functionality_id,
          name: row.functionality_name,
          description: row.functionality_description
        });
      }
      
      // Add partner if not exists
      if (!matrixData.partners[row.partner_id]) {
        matrixData.partners[row.partner_id] = {
          id: row.partner_id,
          name: row.partner_name,
          integrations: {}
        };
      }
      
      // Add integration data
      const integrationKey = row.integration_pattern;
      if (!matrixData.partners[row.partner_id].integrations[integrationKey]) {
        matrixData.partners[row.partner_id].integrations[integrationKey] = {
          id: row.partner_integration_id,
          integration_pattern: row.integration_pattern,
          status: row.status,
          due_date: row.due_date
        };
      }
    });
    
    res.json(matrixData);
  });
});

// Scope Matrix for specific partner
app.get('/api/partners/:id/scope-matrix', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      s.*,
      f.name as functionality_name,
      f.description as functionality_description,
      pi.integration_pattern,
      COALESCE(ap.name, sp.name) as partner_name,
      COALESCE(ap.id, sp.id) as partner_id
    FROM scope s
    JOIN functionalities f ON s.functionality_id = f.id
    JOIN partner_integrations pi ON s.partner_integration_id = pi.id
    LEFT JOIN acquiring_partners ap ON pi.partner_id = ap.id
    LEFT JOIN sub_psps sp ON pi.partner_id = sp.id
    WHERE ap.id = ? OR ap.parent_partner_id = ? OR sp.partner_id = ?
    ORDER BY f.name, COALESCE(ap.name, sp.name), pi.integration_pattern
  `;
  
  db.all(query, [id, id, id], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Transform data into matrix format
    const matrixData = {
      functionalities: [],
      partners: {}
    };
    
    rows.forEach(row => {
      // Add functionality if not exists
      if (!matrixData.functionalities.find(f => f.id === row.functionality_id)) {
        matrixData.functionalities.push({
          id: row.functionality_id,
          name: row.functionality_name,
          description: row.functionality_description
        });
      }
      
      // Add partner if not exists
      if (!matrixData.partners[row.partner_id]) {
        matrixData.partners[row.partner_id] = {
          id: row.partner_id,
          name: row.partner_name,
          integrations: {}
        };
      }
      
      // Add integration data
      const integrationKey = row.integration_pattern;
      if (!matrixData.partners[row.partner_id].integrations[integrationKey]) {
        matrixData.partners[row.partner_id].integrations[integrationKey] = {
          id: row.partner_integration_id,
          integration_pattern: row.integration_pattern,
          status: row.status,
          due_date: row.due_date
        };
      }
    });
    
    res.json(matrixData);
  });
});

// Update scope item
app.put('/api/scope/:id', (req, res) => {
  const { id } = req.params;
  const { status, due_date } = req.body;
  
  const query = 'UPDATE scope SET status = ?, due_date = ?, updated_at = ? WHERE id = ?';
  const params = [status, due_date || null, new Date().toISOString(), id];
  
  db.run(query, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Scope item not found' });
      return;
    }
    
    res.json({ 
      id, 
      status, 
      due_date,
      updated_at: new Date().toISOString()
    });
  });
});

// Health Score Calculation API
app.post('/api/partners/:id/calculate-health', (req, res) => {
  const { id } = req.params;
  
  // Get partner data
  db.get('SELECT * FROM acquiring_partners WHERE id = ?', [id], (err, partner) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (!partner) {
      res.status(404).json({ error: 'Partner not found' });
      return;
    }
    
    // Calculate health score based on various factors
    let healthScore = 100;
    
    // Deduct points for lifecycle stage
    const stagePenalties = {
      'Not Started': -20,
      'Scoping': -10,
      'In Development': -5,
      'Launched': 0,
      'Blocked': -30
    };
    healthScore += stagePenalties[partner.lifecycle_stage] || 0;
    
    // Deduct points for priority (higher priority = more pressure)
    const priorityPenalties = {
      'Low': 0,
      'Medium': -5,
      'High': -10,
      'Critical': -15
    };
    healthScore += priorityPenalties[partner.priority] || 0;
    
    // Deduct points for overdue go-live
    if (partner.go_live_date) {
      const goLiveDate = new Date(partner.go_live_date);
      const today = new Date();
      const daysOverdue = Math.floor((today - goLiveDate) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        healthScore -= Math.min(daysOverdue * 2, 30); // Max 30 point penalty
      }
    }
    
    // Ensure score is between 0 and 100
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));
    
    // Update the partner's health score
    db.run('UPDATE acquiring_partners SET health_score = ?, updated_at = ? WHERE id = ?',
      [healthScore, new Date().toISOString(), id], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({ 
          partner_id: id,
          health_score: healthScore,
          calculated_at: new Date().toISOString()
        });
      });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
