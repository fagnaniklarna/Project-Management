import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Users, DollarSign, AlertTriangle, CheckCircle, Clock, FileText, Code, XCircle } from 'lucide-react';
import { AcquiringPartner, ScopeMatrixData, ScopeItemLegacy, LifecycleStage } from '../types';
import { scopeApi } from '../services/api';

interface PayTrailDetailsProps {
  partner: AcquiringPartner;
  onClose: () => void;
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

const PayTrailDetails: React.FC<PayTrailDetailsProps> = ({ partner, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Integration path tabs
  const integrationTabs = [
    { id: 'hpp', label: 'Payments API (HPP)', icon: Code },
    { id: 'embedded', label: 'Payments API (Embedded)', icon: Code },
    { id: 'plugins', label: 'Plugins', icon: Code }
  ];

  const tabs = [
    { id: 'overview', label: 'Project Overview', icon: Users },
    { id: 'technical', label: 'Technical Details', icon: CheckCircle },
    { id: 'timeline', label: 'Timeline & Milestones', icon: Calendar },
    { id: 'resources', label: 'Team & Resources', icon: Users },
    { id: 'risks', label: 'Risks & Dependencies', icon: AlertTriangle },
    { id: 'notes', label: 'Notes & Documentation', icon: FileText },
    ...integrationTabs
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{partner.name}</h2>
            <p className="text-sm text-gray-600 mt-1">Sub-PSP of Nexi</p>
            <p className="text-sm text-gray-600">Project ID: KN-{partner.id.slice(-4).toUpperCase()}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {partner.status}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Tier 2
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Estimated Volume</p>
              <p className="text-lg font-semibold text-gray-900">{partner.estimated_volume_band || 'Medium'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Technical Status</p>
              <p className="text-lg font-semibold text-gray-900">{partner.lifecycle_stage}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Go-Live Date</p>
              <p className="text-lg font-semibold text-gray-900">{partner.go_live_date}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Contract Status</p>
              <p className="text-lg font-semibold text-gray-900">{partner.priority || 'High'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Paths Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Integration Paths Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {integrationTabs.map(tab => (
            <div key={tab.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-medium text-gray-900">{tab.label}</h5>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  In Progress
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">Integration scope and functionality tracking</p>
              <button 
                onClick={() => setActiveTab(tab.id)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                View Scope →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrationPathTab = (integrationPath: string) => {
    return <IntegrationPathScope partnerId={partner.id} integrationPath={integrationPath} />;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'hpp':
        return renderIntegrationPathTab('Payments API (HPP)');
      case 'embedded':
        return renderIntegrationPathTab('Payments API (Embedded)');
      case 'plugins':
        return renderIntegrationPathTab('Plugins');
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{partner.name} - Sub-PSP Details</h2>
            <p className="text-sm text-gray-600 mt-1">Sub-PSP of Nexi • Project ID: KN-{partner.id.slice(-4).toUpperCase()}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// Integration Path Scope Component
interface IntegrationPathScopeProps {
  partnerId: string;
  integrationPath: string;
}

const IntegrationPathScope: React.FC<IntegrationPathScopeProps> = ({ partnerId, integrationPath }) => {
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

  // Filter data for the specific integration path
  const filteredData = {
    ...scopeData,
    integrationsByPartner: Object.fromEntries(
      Object.entries(scopeData.integrationsByPartner)
        .map(([key, partnerData]) => [
          key,
          {
            ...partnerData,
            integrations: partnerData.integrations.filter(integration => 
              integration.integration_pattern === integrationPath
            )
          }
        ])
        .filter(([key, partnerData]) => {
          const data = partnerData as { integrations: any[] };
          return data.integrations.length > 0;
        })
    ),
    matrix: scopeData.matrix.map(row => ({
      ...row,
      partners: Object.fromEntries(
        Object.entries(row.partners)
          .map(([key, partnerData]) => [
            key,
            {
              ...partnerData,
              integrations: Object.fromEntries(
                Object.entries(partnerData.integrations).filter(([pattern]) => pattern === integrationPath)
              )
            }
          ])
          .filter(([key, partnerData]) => {
            const data = partnerData as { integrations: { [k: string]: any } };
            return Object.keys(data.integrations).length > 0;
          })
      )
    })).filter(row => Object.keys(row.partners).length > 0)
  };

  return (
    <div className="space-y-6">
      {/* Integration Path Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Code className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-blue-800 font-semibold">{integrationPath} Scope</h3>
        </div>
        <p className="text-blue-700 mt-2">
          Track functionality implementation and lifecycle status for {integrationPath} integration
        </p>
      </div>

      {/* Scope Matrix */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{integrationPath} Functionality Matrix</h2>
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
                {Object.keys(filteredData.integrationsByPartner).map(partnerKey => {
                  const partnerData = filteredData.integrationsByPartner[partnerKey];
                  
                  return (
                    <th key={partnerKey} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">
                          {partnerData.parent_partner_name ? 
                            `${partnerData.parent_partner_name} > ${partnerData.partner_name}` : 
                            partnerData.partner_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {integrationPath}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.matrix.map((row) => (
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
                  {Object.keys(filteredData.integrationsByPartner).map(partnerKey => {
                    const partnerData = filteredData.integrationsByPartner[partnerKey];
                    const partnerRow = row.partners[partnerKey];
                    
                    return (
                      <td key={partnerKey} className="px-6 py-4 whitespace-nowrap text-center">
                        {partnerData.integrations.map((integration: any) => {
                          const item = partnerRow?.integrations[integration.integration_pattern] || {
                            id: null,
                            lifecycle_status: 'Not available',
                            planned_live_date: null,
                            partner_integration_id: integration.id,
                            functionality_id: row.functionality.id
                          };
                          
                          const isEditing = editingCell?.functionalityId === row.functionality.id && 
                                          editingCell?.integrationPattern === integration.integration_pattern &&
                                          editingCell?.partnerKey === partnerKey;

                          return (
                            <div key={integration.integration_pattern}>
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
                                  onClick={() => handleCellClick(row.functionality.id, integration.integration_pattern, item, partnerKey)}
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
                            </div>
                          );
                        })}
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

export default PayTrailDetails;
