import axios from 'axios';
import { Team, User, AcquiringPartner, Action } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Teams API
export const teamsApi = {
  getAll: () => api.get<Team[]>('/teams'),
  create: (team: Omit<Team, 'id' | 'created_at'>) => api.post<Team>('/teams', team),
};

// Users API
export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  create: (user: Omit<User, 'id' | 'created_at'>) => api.post<User>('/users', user),
};

// Acquiring Partners API
export const partnersApi = {
  getAll: () => api.get<AcquiringPartner[]>('/partners'),
  getById: (id: string) => api.get<AcquiringPartner>(`/partners/${id}`),
  create: (partner: Omit<AcquiringPartner, 'id' | 'created_at' | 'updated_at'>) => 
    api.post<AcquiringPartner>('/partners', partner),
  update: (id: string, partner: Partial<AcquiringPartner>) => 
    api.put(`/partners/${id}`, partner),
  delete: (id: string) => api.delete(`/partners/${id}`),
  search: (params: { q?: string; team?: string; owner?: string; status?: string }) => 
    api.get<AcquiringPartner[]>('/partners/search', { params }),
};

// Actions API
export const actionsApi = {
  getByPartner: (partnerId: string) => api.get<Action[]>(`/partners/${partnerId}/actions`),
  create: (partnerId: string, action: Omit<Action, 'id' | 'partner_id' | 'created_at' | 'updated_at'>) => 
    api.post<Action>(`/partners/${partnerId}/actions`, action),
};

export default api;
