import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Activity,
  Target,
  BarChart3,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { PortfolioMetrics, AcquiringPartner, PartnerFilters, LifecycleStage, Status, Priority } from '../types';
import { metricsApi, partnersApi } from '../services/api';

interface DashboardProps {
  onPartnerClick?: (partner: AcquiringPartner) => void;
  onViewDetails?: (partner: AcquiringPartner) => void;
  onViewScope?: (partner: AcquiringPartner) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  onPartnerClick, 
  onViewDetails, 
  onViewScope 
}) => {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [partners, setPartners] = useState<AcquiringPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PartnerFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metricsResponse, partnersResponse] = await Promise.all([
        metricsApi.getPortfolio(),
        partnersApi.getAll({ ...filters, q: searchTerm || undefined })
      ]);
      
      setMetrics(metricsResponse.data);
      setPartners(partnersResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof PartnerFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  const getHealthColor = (score?: number) => {
    if (!score) return 'text-gray-500';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadgeColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getLifecycleColor = (stage: LifecycleStage) => {
    switch (stage) {
      case 'Launched': return 'bg-green-100 text-green-800';
      case 'In Development': return 'bg-blue-100 text-blue-800';
      case 'Scoping': return 'bg-yellow-100 text-yellow-800';
      case 'Not Started': return 'bg-gray-100 text-gray-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatVolume = (value?: number) => {
    if (!value) return 'TBD';
    if (value >= 1000000000000) return `$${(value / 1000000000000).toFixed(1)}T+`;
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B+`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M+`;
    return `$${value.toLocaleString()}`;
  };

  const formatDaysToGoLive = (days?: number) => {
    if (!days) return 'TBD';
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days <= 30) return `${days} days (urgent)`;
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 inline mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Acquiring Partner Portfolio</h1>
              <p className="text-sm text-gray-600">Track partners, projects, and integration health</p>
            </div>
            <button 
              onClick={loadData}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Metrics */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Partners</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.totalPartners}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Live Partners</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.livePartners}</p>
                  <p className="text-xs text-gray-500">{metrics.healthyPercent}% healthy</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">In Development</p>
                  <p className="text-2xl font-semibold text-gray-900">{metrics.inDevelopment}</p>
                  <p className="text-xs text-gray-500">{metrics.inProgressPercent}% of total</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Volume</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatVolume(metrics.totalVolume)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
            <button 
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search partners..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lifecycle Stage</label>
              <select
                value={filters.stage || ''}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Stages</option>
                <option value="Not Started">Not Started</option>
                <option value="Scoping">Scoping</option>
                <option value="In Development">In Development</option>
                <option value="Launched">Launched</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sort || 'name'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="health_score">Health Score</option>
                <option value="priority">Priority</option>
                <option value="go_live_date">Go Live Date</option>
                <option value="updated_at">Last Updated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <div 
              key={partner.id} 
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onPartnerClick?.(partner)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                    <p className="text-sm text-gray-600">{partner.team_name || 'No team assigned'}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthBadgeColor(partner.health_score)}`}>
                      {partner.health_score || 0}% health
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLifecycleColor(partner.lifecycle_stage)}`}>
                      {partner.lifecycle_stage}
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Priority</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(partner.priority)}`}>
                      {partner.priority}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Volume</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatVolume(partner.estimated_volume_value)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Go Live</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDaysToGoLive(partner.days_to_go_live)}
                    </span>
                  </div>
                  
                  {partner.portfolio_tag && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Portfolio</span>
                      <span className="text-sm font-medium text-gray-900">
                        {partner.portfolio_tag}
                      </span>
                    </div>
                  )}
                </div>

                {/* Owners */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    {partner.commercial_owner_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Commercial Owner</span>
                        <span className="text-gray-900">{partner.commercial_owner_name}</span>
                      </div>
                    )}
                    {partner.primary_owner_name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Primary Owner</span>
                        <span className="text-gray-900">{partner.primary_owner_name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-4 pt-4 border-t">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(partner);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewScope?.(partner);
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    View Scope
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {partners.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No partners found matching your criteria</p>
            <button 
              onClick={clearFilters}
              className="mt-2 text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
