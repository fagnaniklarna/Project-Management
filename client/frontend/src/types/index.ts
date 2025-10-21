// Core Enums
export type LifecycleStage = 'Not Started' | 'Scoping' | 'In Development' | 'Launched' | 'Blocked';
export type Status = 'Active' | 'Inactive';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type Confidence = 'Low' | 'Medium' | 'High';
export type HealthState = 'Healthy' | 'In Progress' | 'Blocked';
export type ProjectType = 'New KN Integration' | 'Migration' | 'Enhancement';
export type ScopeStatus = 'Not Started' | 'In Progress' | 'Done' | 'Blocked';
export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type Probability = 'Low' | 'Medium' | 'High';
export type DependencyStatus = 'Identified' | 'In Progress' | 'Resolved' | 'Blocked';
export type FeatureStatus = 'Requested' | 'In Progress' | 'Enabled' | 'Deferred';
export type PortfolioTag = 'Win Top MoR Black' | 'Win Top MoR Cobalt' | 'Win Top MoR Platinum' | 'Win Top MoR Red';
export type VolumeBand = 'Low' | 'Medium' | 'High';
export type UserRole = 'Viewer' | 'Editor' | 'Owner' | 'Admin';
export type SubPSPType = 'Sub-PSP' | 'Gateway';
export type TechnicalStatus = 'Unknown' | 'Planned' | 'Configured' | 'Verified';
export type MilestoneStatus = 'Planned' | 'At Risk' | 'Done' | 'Missed';
export type RiskStatus = 'Open' | 'Mitigated' | 'Closed';
export type DependencyType = 'Internal' | 'Partner' | 'Merchant' | 'Vendor';
export type FeatureCategory = 'API' | 'Webhook' | 'Reporting' | 'Tokenization' | 'In-Store' | 'SDK' | 'Integration';
export type ScopeCategory = 'Contract' | 'Commercial' | 'Compliance' | 'API' | 'SDK' | 'Reporting' | 'Webhooks' | 'In-Store' | 'Technical' | 'Legal';

// Legacy types for backward compatibility
export type IntegrationType = 'REST API' | 'WebSDK' | 'Plugin' | 'MobileSDK' | 'In-Store';
export type ProjectStage = LifecycleStage;

// Core Entities
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id?: string;
  team_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  capacity_slots?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AcquiringPartner {
  id: string;
  name: string;
  status: Status;
  lifecycle_stage: LifecycleStage;
  priority: Priority;
  estimated_volume_band?: VolumeBand;
  estimated_volume_value?: number;
  portfolio_tag?: PortfolioTag;
  go_live_date?: string;
  go_live_confidence?: Confidence;
  health_score?: number;
  days_to_go_live?: number;
  project_duration_days?: number;
  commercial_owner_id?: string;
  primary_owner_id?: string;
  secondary_owner_id?: string;
  solution_engineer_id?: string;
  primary_sd_owner_id?: string;
  secondary_sd_owner_id?: string;
  owning_team_id?: string;
  parent_partner_id?: string;
  last_updated_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/joined fields
  commercial_owner_name?: string;
  primary_owner_name?: string;
  secondary_owner_name?: string;
  solution_engineer_name?: string;
  primary_sd_owner_name?: string;
  secondary_sd_owner_name?: string;
  team_name?: string;
  parent_partner_name?: string;
}

export interface SubPSP {
  id: string;
  partner_id: string;
  name: string;
  type: SubPSPType;
  status: Status;
  lifecycle_stage: LifecycleStage;
  health_score?: number;
  estimated_volume_band?: VolumeBand;
  estimated_volume_value?: number;
  go_live_date?: string;
  days_to_go_live?: number;
  last_updated_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/joined fields
  partner_name?: string;
}

export interface Project {
  id: string;
  partner_id: string;
  name: string;
  status: Status;
  priority: Priority;
  project_type: ProjectType;
  estimated_volume_band?: VolumeBand;
  estimated_volume_value?: number;
  health_score?: number;
  go_live_date?: string;
  days_to_go_live?: number;
  duration_days?: number;
  owning_team_id?: string;
  commercial_owner_id?: string;
  primary_owner_id?: string;
  last_updated_at: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Computed/joined fields
  partner_name?: string;
  commercial_owner_name?: string;
  primary_owner_name?: string;
  team_name?: string;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  category?: FeatureCategory;
  created_at: string;
  updated_at: string;
}

export interface PartnerFeature {
  id: string;
  partner_id: string;
  feature_id: string;
  status: FeatureStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectFeature {
  id: string;
  project_id: string;
  feature_id: string;
  status: FeatureStatus;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  feature_name?: string;
  feature_description?: string;
  feature_category?: FeatureCategory;
}

export interface IntegrationPath {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: LifecycleStage;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
}

export interface ScopeItem {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  category?: ScopeCategory;
  status: ScopeStatus;
  owner_id?: string;
  due_date?: string;
  evidence_links?: string; // JSON array of URLs
  created_at: string;
  updated_at: string;
  
  // Joined fields
  owner_name?: string;
}

export interface TechnicalDetail {
  id: string;
  project_id: string;
  key: string;
  value?: string;
  status: TechnicalStatus;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  target_date?: string;
  confidence?: Confidence;
  status: MilestoneStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Risk {
  id: string;
  project_id: string;
  title: string;
  severity: RiskSeverity;
  probability: Probability;
  status: RiskStatus;
  owner_id?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  owner_name?: string;
}

export interface Dependency {
  id: string;
  project_id: string;
  type: DependencyType;
  description: string;
  blocked_by?: string;
  status: DependencyStatus;
  owner_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  owner_name?: string;
  blocked_by_description?: string;
}

// Portfolio Metrics
export interface PortfolioMetrics {
  totalPartners: number;
  livePartners: number;
  inDevelopment: number;
  totalVolume: number;
  healthyPartners: number;
  blockedPartners: number;
  healthyPercent: number;
  inProgressPercent: number;
  blockedPercent: number;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Filter and Search Types
export interface PartnerFilters {
  team?: string;
  owner?: string;
  status?: Status;
  stage?: LifecycleStage;
  q?: string;
  sort?: 'name' | 'health_score' | 'priority' | 'updated_at' | 'go_live_date';
  page?: number;
  page_size?: number;
}

// Health Score Calculation
export interface HealthScoreCalculation {
  partner_id: string;
  health_score: number;
  calculated_at: string;
}

// Enums API Response
export interface EnumsResponse {
  lifecycle_stage: LifecycleStage[];
  status: Status[];
  priority: Priority[];
  confidence: Confidence[];
  health_state: HealthState[];
  project_type: ProjectType[];
  scope_status: ScopeStatus[];
  risk_severity: RiskSeverity[];
  probability: Probability[];
  dependency_status: DependencyStatus[];
  feature_status: FeatureStatus[];
  portfolio_tag: PortfolioTag[];
  estimated_volume_band: VolumeBand[];
}

// Legacy interfaces for backward compatibility
export interface IntegrationPathLegacy {
  type: IntegrationType;
  status: LifecycleStage;
  testing_status?: string;
  functionalities?: any[];
  estimated_completion?: string;
}

export interface SubEntity {
  id: string;
  name: string;
  description?: string;
  status_stage: LifecycleStage;
  integration_paths?: IntegrationPathLegacy[];
  primary_owner_name?: string;
  business_developer_name?: string;
}

export interface KNFeature {
  id: string;
  name: string;
  description?: string;
  implementation_status: FeatureStatus;
  integration_paths: string[];
}

// Scope Matrix Types (for backward compatibility)
export interface Functionality {
  id: string;
  name: string;
  description?: string;
  channel: IntegrationType;
  integration_requirement_level?: 'required' | 'recommended' | 'optional';
  lifecycle_status?: LifecycleStage;
}

export interface PartnerIntegration {
  id: string;
  partner_id: string;
  parent_partner_id?: string;
  integration_pattern: IntegrationType;
  integration_name?: string;
  planned_go_live_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ScopeItemLegacy {
  id: string;
  partner_integration_id: string;
  functionality_id: string;
  lifecycle_status: LifecycleStage;
  planned_live_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PartnerData {
  partner: AcquiringPartner;
  integrations: PartnerIntegration[];
}

export interface ScopeMatrixRow {
  functionality: Functionality;
  partners: Record<string, PartnerData>;
}

export interface ScopeMatrixData {
  functionalities: Functionality[];
  integrationsByPartner: Record<string, PartnerData>;
  matrix: ScopeMatrixRow[];
}
