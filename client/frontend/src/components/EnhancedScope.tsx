import React, { useState, useEffect, useCallback } from 'react';
import { ScopeMatrixData, ScopeItemLegacy, LifecycleStage } from '../types';
import { scopeApi } from '../services/api';
import { CheckCircle, XCircle, Clock, AlertTriangle, Calendar, Filter, Search } from 'lucide-react';

interface EnhancedScopeProps {
  partnerId: string;
  partnerName: string;
  onClose: () => void;
}

const LIFECYCLE_STATUSES = [
  'General Availability',
  'Early Release (Beta)',
  'Not available',
  'Not Applicable',
  'Deprecated'
] as const;

const INTEGRATION_PATTERNS = ['Payments API (HPP)', 'Payments API (Embedded)', 'Plugins'] as const;

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'General Availability':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'Early Release (Beta)':
      return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'Not available':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'Not Applicable':
      return <XCircle className="w-4 h-4 text-gray-400" />;
    case 'Deprecated':
      return <AlertTriangle className="w-4 h-4 text-orange-500" />;
    default:
      return <XCircle className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'General Availability':
      return 'bg-green-100 text-green-800';
    case 'Early Release (Beta)':
      return 'bg-yellow-100 text-yellow-800';
    case 'Not available':
      return 'bg-red-100 text-red-800';
    case 'Not Applicable':
      return 'bg-gray-100 text-gray-600';
    case 'Deprecated':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const EnhancedScope: React.FC<EnhancedScopeProps> = ({ partnerId, partnerName }) => {
  const [scopeData, setScopeData] = useState<ScopeMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ functionalityId: string; integrationPattern: string } | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingDate, setEditingDate] = useState<string>('');
  
  // Filtering state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requirementFilter, setRequirementFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadScopeData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await scopeApi.getMatrix(partnerId);
      setScopeData(response.data);
    } catch (err) {
      setError('Failed to load scope data');
      console.error('Error loading scope data:', err);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    loadScopeData();
  }, [loadScopeData]);

  const handleCellClick = (functionalityId: string, integrationPattern: string, currentItem: ScopeItemLegacy) => {
    setEditingCell({ functionalityId, integrationPattern });
    setEditingStatus(currentItem.lifecycle_status);
    setEditingDate(currentItem.planned_live_date || '');
  };

  const handleSave = async () => {
    if (!editingCell || !scopeData) return;

    try {
      await scopeApi.update(editingCell.functionalityId, {
        lifecycle_status: editingStatus as LifecycleStage,
        planned_live_date: editingDate || undefined
      });

      await loadScopeData();
      setEditingCell(null);
    } catch (err) {
      console.error('Error saving scope data:', err);
      setError('Failed to save changes');
    }
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditingStatus('');
    setEditingDate('');
  };

  const getRequiredMissingFunctionalities = () => {
    if (!scopeData) return [];

    return scopeData.functionalities.filter(func => {
      if (func.integration_requirement_level !== 'required') return false;
      
      return !scopeData.matrix.some(row => 
        row.functionality.id === func.id &&
        Object.values(row.partners).some(partnerData => 
          Object.values(partnerData.integrations).some(item => 
            true // Always show for now - we'll fix this when we have proper scope data
          )
        )
      );
    });
  };

  const getFilteredMatrix = () => {
    if (!scopeData) return [];

    return scopeData.matrix.filter(row => {
      // Search filter
      if (searchTerm && !row.functionality.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        const hasMatchingStatus = Object.values(row.partners).some(partnerData => 
          Object.values(partnerData.integrations).some(item => true) // Always match for now
        );
        if (!hasMatchingStatus) return false;
      }

      // Requirement filter
      if (requirementFilter !== 'all' && row.functionality.integration_requirement_level !== requirementFilter) {
        return false;
      }

      return true;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadScopeData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!scopeData) {
    return <div>No scope data available</div>;
  }

  const requiredMissing = getRequiredMissingFunctionalities();
  const filteredMatrix = getFilteredMatrix();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900">Scope Management - {partnerName}</h2>
        <p className="text-blue-700 mt-2">
          Track lifecycle status and planned live dates for each functionality across integration patterns
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search functionalities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            {LIFECYCLE_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          {/* Requirement Filter */}
          <select
            value={requirementFilter}
            onChange={(e) => setRequirementFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Requirements</option>
            <option value="required">Required</option>
            <option value="recommended">Recommended</option>
            <option value="optional">Optional</option>
          </select>
        </div>

        {/* Filter Results */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredMatrix.length} of {scopeData.matrix.length} functionalities
        </div>
      </div>

      {/* Required Missing Functionalities */}
      {requiredMissing.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            ⚠️ Required but not implemented functionalities
          </h3>
          <div className="space-y-2">
            {requiredMissing.map(func => (
              <div key={func.id} className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-red-800 font-medium">{func.name}</span>
                <span className="text-red-600 text-sm">({func.integration_requirement_level})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scope Matrix */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Functionality Matrix</h2>
          <p className="text-sm text-gray-600 mt-1">
            Click on any cell to edit lifecycle status and planned live date
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                  Functionality
                </th>
                {INTEGRATION_PATTERNS.map(pattern => (
                  <th key={pattern} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {pattern}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMatrix.map((row) => (
                <tr key={row.functionality.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {row.functionality.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {row.functionality.description}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            row.functionality.integration_requirement_level === 'required' 
                              ? 'bg-red-100 text-red-800' 
                              : row.functionality.integration_requirement_level === 'recommended'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {row.functionality.integration_requirement_level}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {INTEGRATION_PATTERNS.map(pattern => {
                    const partnerKey = Object.keys(row.partners)[0];
                    const partnerData = row.partners[partnerKey];
                    const item: ScopeItemLegacy = (partnerData?.integrations as any)?.[pattern] || {
                      id: '',
                      partner_integration_id: '',
                      functionality_id: row.functionality.id,
                      lifecycle_status: 'Not available',
                      planned_live_date: null,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };
                    
                    const isEditing = editingCell?.functionalityId === row.functionality.id && 
                                    editingCell?.integrationPattern === pattern;

                    return (
                      <td key={pattern} className="px-6 py-4 whitespace-nowrap text-center">
                        {isEditing ? (
                          <div className="space-y-2">
                            <select
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                              {LIFECYCLE_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                            <input
                              type="date"
                              value={editingDate}
                              onChange={(e) => setEditingDate(e.target.value)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={handleSave}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
                            onClick={() => handleCellClick(row.functionality.id, pattern, item)}
                          >
                            <div className="flex items-center justify-center space-x-2">
                              {getStatusIcon(item.lifecycle_status)}
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.lifecycle_status)}`}>
                                {item.lifecycle_status}
                              </span>
                            </div>
                            {item.planned_live_date && (
                              <div className="flex items-center justify-center mt-1 text-xs text-gray-600">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(item.planned_live_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {LIFECYCLE_STATUSES.map(status => (
            <div key={status} className="flex items-center space-x-2">
              {getStatusIcon(status)}
              <span className="text-sm text-gray-700">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedScope;
