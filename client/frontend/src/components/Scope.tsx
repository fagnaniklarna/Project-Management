import React, { useState, useEffect, useCallback } from 'react';
import { ScopeMatrixData, ScopeItemLegacy, ScopeStatus, LifecycleStage } from '../types';
import { scopeApi } from '../services/api';
import { CheckCircle, XCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

interface ScopeProps {
  partnerId: string;
}

const LIFECYCLE_STATUSES = [
  'General Availability',
  'Early Release (Beta)',
  'Not available',
  'Not Applicable',
  'Deprecated'
] as const;


const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Done':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'In Progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'Not Started':
      return <XCircle className="w-4 h-4 text-gray-400" />;
    case 'Blocked':
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <XCircle className="w-4 h-4 text-gray-400" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Done':
      return 'bg-green-100 text-green-800';
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Not Started':
      return 'bg-gray-100 text-gray-800';
    case 'Blocked':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const Scope: React.FC<ScopeProps> = ({ partnerId }) => {
  const [scopeData, setScopeData] = useState<ScopeMatrixData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ functionalityId: string; integrationPattern: string; partnerKey: string } | null>(null);
  const [editingStatus, setEditingStatus] = useState<string>('');
  const [editingDate, setEditingDate] = useState<string>('');

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

  const handleCellClick = (functionalityId: string, integrationPattern: string, currentItem: ScopeItemLegacy, partnerKey: string) => {
    setEditingCell({ functionalityId, integrationPattern, partnerKey });
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

      // Reload data to get updated values
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
      
      // Check if any partner/integration pattern has this functionality as "General Availability"
      return !scopeData.matrix.some(row => 
        row.functionality.id === func.id &&
        Object.values(row.partners).some(partnerData => 
          Object.values(partnerData.integrations).some(item => true) // Always show for now
        )
      );
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

  return (
    <div className="space-y-6">
      {/* Required Missing Functionalities Alert */}
      {requiredMissing.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-yellow-800 font-semibold">Required Functionalities Missing</h3>
          </div>
          <p className="text-yellow-700 mt-2">
            The following required functionalities are not yet implemented:
          </p>
          <ul className="list-disc list-inside text-yellow-700 mt-2">
            {requiredMissing.map(func => (
              <li key={func.id}>{func.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Scope Matrix */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Integration Scope Matrix</h2>
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
                {Object.keys(scopeData.integrationsByPartner).map(partnerKey => {
                  const partnerData = scopeData.integrationsByPartner[partnerKey];
                  const integrationPatterns = partnerData.integrations.map(i => i.integration_pattern);
                  
                  return (
                    <th key={partnerKey} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {partnerData.partner.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {integrationPatterns.join(', ')}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scopeData.matrix.map((row) => (
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
                  {Object.keys(scopeData.integrationsByPartner).map(partnerKey => {
                    const partnerData = scopeData.integrationsByPartner[partnerKey];
                    const partnerRow = row.partners[partnerKey];
                    
                    return (
                      <td key={partnerKey} className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="space-y-2">
                          {partnerData.integrations.map(integration => {
                            const item: ScopeItemLegacy = (partnerRow?.integrations as any)?.[integration.integration_pattern] || {
                              id: '',
                              partner_integration_id: '',
                              functionality_id: row.functionality.id,
                              lifecycle_status: 'Not available',
                              planned_live_date: null,
                              created_at: new Date().toISOString(),
                              updated_at: new Date().toISOString()
                            };
                            
                            const isEditing = editingCell?.functionalityId === row.functionality.id && 
                                            editingCell?.integrationPattern === integration.integration_pattern &&
                                            editingCell?.partnerKey === partnerKey;

                            return (
                              <div key={integration.integration_pattern} className="border-b border-gray-100 last:border-b-0 pb-2 last:pb-0">
                                <div className="text-xs font-medium text-gray-700 mb-1">
                                  {integration.integration_pattern}
                                </div>
                                {isEditing ? (
                                  <div className="space-y-1">
                                    <select
                                      value={editingStatus}
                                      onChange={(e) => setEditingStatus(e.target.value)}
                                      className="block w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    >
                                      {LIFECYCLE_STATUSES.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                      ))}
                                    </select>
                                    <input
                                      type="date"
                                      value={editingDate}
                                      onChange={(e) => setEditingDate(e.target.value)}
                                      className="block w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={handleSave}
                                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={handleCancel}
                                        className="px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div 
                                    className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                                    onClick={() => handleCellClick(row.functionality.id, integration.integration_pattern, item, partnerKey)}
                                  >
                                    <div className="flex items-center justify-center space-x-1">
                                      {getStatusIcon(item.lifecycle_status)}
                                      <span className={`px-1 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.lifecycle_status)}`}>
                                        {item.lifecycle_status}
                                      </span>
                                    </div>
                                    {item.planned_live_date && (
                                      <div className="flex items-center justify-center mt-1 text-xs text-gray-600">
                                        <Calendar className="w-2 h-2 mr-1" />
                                        {new Date(item.planned_live_date).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
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

export default Scope;
