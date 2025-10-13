export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: 'Solution Engineer' | 'Delivery Manager' | 'Primary Owner' | 'Secondary Owner';
  team_id?: string;
  team_name?: string;
  created_at: string;
}

export interface AcquiringPartner {
  id: string;
  name: string;
  description?: string;
  volume?: string;
  status: string;
  primary_owner_id?: string;
  secondary_owner_id?: string;
  solution_engineer_id?: string;
  commercial_owner_id?: string;
  primary_sd_owner_id?: string;
  secondary_sd_owner_id?: string;
  team_id?: string;
  leap_category?: string;
  technical_status?: string;
  specs_version?: string;
  contract_status?: string;
  pricing_tier?: string;
  volume_2025?: string;
  volume_2026?: string;
  go_live_date?: string;
  primary_owner_name?: string;
  secondary_owner_name?: string;
  solution_engineer_name?: string;
  commercial_owner_name?: string;
  primary_sd_owner_name?: string;
  secondary_sd_owner_name?: string;
  team_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  partner_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}
