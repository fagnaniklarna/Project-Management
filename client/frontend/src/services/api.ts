import axios from 'axios';
import { 
  AcquiringPartner, 
  SubPSP, 
  Project, 
  IntegrationPath, 
  ScopeItem, 
  TechnicalDetail, 
  Milestone, 
  Risk, 
  Dependency, 
  Feature, 
  ProjectFeature, 
  Team, 
  User, 
  PortfolioMetrics, 
  PartnerFilters, 
  HealthScoreCalculation, 
  EnumsResponse,
  PartnerIntegration,
  ScopeItemLegacy,
  ScopeMatrixData,
  Functionality
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Portfolio Metrics API
export const metricsApi = {
  getPortfolio: () => api.get<PortfolioMetrics>('/metrics/portfolio'),
};

// Partners API
export const partnersApi = {
  getAll: (filters?: PartnerFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }
    return api.get<AcquiringPartner[]>(`/partners?${params.toString()}`);
  },
  getById: (id: string) => api.get<AcquiringPartner>(`/partners/${id}`),
  getSubPSPs: (id: string) => api.get<SubPSP[]>(`/partners/${id}/sub-psps`),
  calculateHealth: (id: string) => api.post<HealthScoreCalculation>(`/partners/${id}/calculate-health`),
  create: (partner: Omit<AcquiringPartner, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<AcquiringPartner>('/partners', partner),
  update: (id: string, partner: Partial<AcquiringPartner>) => 
    api.put(`/partners/${id}`, partner),
  delete: (id: string) => api.delete(`/partners/${id}`),
};

// Projects API
export const projectsApi = {
  getByPartner: (partnerId: string) => api.get<Project[]>(`/partners/${partnerId}/projects`),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Project>('/projects', project),
  update: (id: string, project: Partial<Project>) => 
    api.put(`/projects/${id}`, project),
  delete: (id: string) => api.delete(`/projects/${id}`),
};

// Integration Paths API
export const integrationPathsApi = {
  getByProject: (projectId: string) => api.get<IntegrationPath[]>(`/projects/${projectId}/integration-paths`),
  create: (path: Omit<IntegrationPath, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<IntegrationPath>('/integration-paths', path),
  update: (id: string, path: Partial<IntegrationPath>) => 
    api.put(`/integration-paths/${id}`, path),
  delete: (id: string) => api.delete(`/integration-paths/${id}`),
};

// Scope Items API
export const scopeItemsApi = {
  getByProject: (projectId: string) => api.get<ScopeItem[]>(`/projects/${projectId}/scope-items`),
  create: (item: Omit<ScopeItem, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<ScopeItem>('/scope-items', item),
  update: (id: string, item: Partial<ScopeItem>) => 
    api.put(`/scope-items/${id}`, item),
  delete: (id: string) => api.delete(`/scope-items/${id}`),
};

// Technical Details API
export const technicalDetailsApi = {
  getByProject: (projectId: string) => api.get<TechnicalDetail[]>(`/projects/${projectId}/technical-details`),
  create: (detail: Omit<TechnicalDetail, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<TechnicalDetail>('/technical-details', detail),
  update: (id: string, detail: Partial<TechnicalDetail>) => 
    api.put(`/technical-details/${id}`, detail),
  delete: (id: string) => api.delete(`/technical-details/${id}`),
};

// Milestones API
export const milestonesApi = {
  getByProject: (projectId: string) => api.get<Milestone[]>(`/projects/${projectId}/milestones`),
  create: (milestone: Omit<Milestone, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Milestone>('/milestones', milestone),
  update: (id: string, milestone: Partial<Milestone>) => 
    api.put(`/milestones/${id}`, milestone),
  delete: (id: string) => api.delete(`/milestones/${id}`),
};

// Risks API
export const risksApi = {
  getByProject: (projectId: string) => api.get<Risk[]>(`/projects/${projectId}/risks`),
  create: (risk: Omit<Risk, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Risk>('/risks', risk),
  update: (id: string, risk: Partial<Risk>) => 
    api.put(`/risks/${id}`, risk),
  delete: (id: string) => api.delete(`/risks/${id}`),
};

// Dependencies API
export const dependenciesApi = {
  getByProject: (projectId: string) => api.get<Dependency[]>(`/projects/${projectId}/dependencies`),
  create: (dependency: Omit<Dependency, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Dependency>('/dependencies', dependency),
  update: (id: string, dependency: Partial<Dependency>) => 
    api.put(`/dependencies/${id}`, dependency),
  delete: (id: string) => api.delete(`/dependencies/${id}`),
};

// Features API
export const featuresApi = {
  getAll: () => api.get<Feature[]>('/features'),
  getByProject: (projectId: string) => api.get<ProjectFeature[]>(`/projects/${projectId}/features`),
  create: (feature: Omit<Feature, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Feature>('/features', feature),
  update: (id: string, feature: Partial<Feature>) => 
    api.put(`/features/${id}`, feature),
  delete: (id: string) => api.delete(`/features/${id}`),
};

// Teams API
export const teamsApi = {
  getAll: () => api.get<Team[]>('/teams'),
  getById: (id: string) => api.get<Team>(`/teams/${id}`),
  create: (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<Team>('/teams', team),
  update: (id: string, team: Partial<Team>) => 
    api.put(`/teams/${id}`, team),
  delete: (id: string) => api.delete(`/teams/${id}`),
};

// Users API
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  getById: (id: string) => api.get<User>(`/users/${id}`),
  create: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<User>('/users', user),
  update: (id: string, user: Partial<User>) => 
    api.put(`/users/${id}`, user),
  delete: (id: string) => api.delete(`/users/${id}`),
};

// Enums API
export const enumsApi = {
  getAll: () => api.get<EnumsResponse>('/enums'),
};

// Legacy APIs for backward compatibility
export const functionalitiesApi = {
  getAll: () => api.get<Functionality[]>('/functionalities'),
  getByPartner: (partnerId: string) => api.get<Functionality[]>(`/partners/${partnerId}/functionalities`),
};

export const integrationsApi = {
  getByPartner: (partnerId: string) => api.get<PartnerIntegration[]>(`/partners/${partnerId}/integrations`),
  create: (integration: Omit<PartnerIntegration, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<PartnerIntegration>('/integrations', integration),
  update: (id: string, integration: Partial<PartnerIntegration>) => 
    api.put(`/integrations/${id}`, integration),
  delete: (id: string) => api.delete(`/integrations/${id}`),
};

export const scopeApi = {
  getByPartner: (partnerId: string) => api.get<ScopeItemLegacy[]>(`/partners/${partnerId}/scope`),
  getMatrix: (partnerId: string) => api.get<ScopeMatrixData>(`/partners/${partnerId}/scope-matrix`),
  create: (item: Omit<ScopeItemLegacy, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<ScopeItemLegacy>('/scope', item),
  update: (id: string, item: Partial<ScopeItemLegacy>) => 
    api.put(`/scope/${id}`, item),
  delete: (id: string) => api.delete(`/scope/${id}`),
};

export default api;
