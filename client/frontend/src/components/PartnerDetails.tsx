import React, { useState } from 'react';
import { X, Calendar, Users, DollarSign, AlertTriangle, CheckCircle, Clock, FileText, Link, Edit, Save, Plus } from 'lucide-react';
import { AcquiringPartner } from '../types';

interface PartnerDetailsProps {
  partner: AcquiringPartner;
  onClose: () => void;
  onEdit?: (partner: AcquiringPartner) => void;
  onSave?: (partner: AcquiringPartner) => void;
}

const PartnerDetails: React.FC<PartnerDetailsProps> = ({ partner, onClose, onEdit, onSave }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPartner, setEditedPartner] = useState<AcquiringPartner>(partner);
  const [newRisk, setNewRisk] = useState('');
  const [newDependency, setNewDependency] = useState('');
  const [newDocument, setNewDocument] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'technical', label: 'Technical', icon: CheckCircle },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: Users },
    { id: 'risks', label: 'Risks & Dependencies', icon: AlertTriangle },
    { id: 'notes', label: 'Notes & Docs', icon: FileText },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'inactive':
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
      case 'testing':
        return 'bg-yellow-100 text-yellow-800';
      case 'development':
      case 'in dev':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFieldChange = (field: keyof AcquiringPartner, value: string) => {
    setEditedPartner(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedPartner);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedPartner(partner);
    setIsEditing(false);
  };

  const renderEditableField = (
    label: string,
    value: string,
    field: keyof AcquiringPartner,
    type: 'text' | 'textarea' | 'select' = 'text',
    options?: string[]
  ) => {
    if (isEditing) {
      if (type === 'textarea') {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>
        );
      } else if (type === 'select' && options) {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      } else {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        );
      }
    } else {
      return (
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="font-medium text-gray-900">{value || 'Not set'}</p>
        </div>
      );
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div>
            {renderEditableField('Project Name', editedPartner.name, 'name')}
            <p className="text-sm text-gray-600 mt-1">Project ID: KN-{editedPartner.id.slice(-4).toUpperCase()}</p>
          </div>
          <div className="flex items-center space-x-2">
            {renderEditableField('Status', editedPartner.status, 'status', 'select', ['Active', 'Inactive', 'Pending'])}
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor('Medium')}`}>
              Medium Priority
            </span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              {renderEditableField('Estimated Volume', editedPartner.volume || '', 'volume')}
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Health Score</p>
              <p className="text-lg font-semibold text-gray-900">85%</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Days to Go-Live</p>
              <p className="text-lg font-semibold text-gray-900">120</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Assignment */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Team Assignment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderEditableField('Owning Team', editedPartner.team_name || '', 'team_name')}
          <div>
            <p className="text-sm text-gray-500">Project Type</p>
            <p className="font-medium text-gray-900">New KN Integration</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTechnicalTab = () => (
    <div className="space-y-6">
      {/* Technical Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Technical Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderEditableField('Technical Status', editedPartner.technical_status || '', 'technical_status', 'select', ['Not Started', 'Scoping', 'In Dev', 'Launched'])}
          {renderEditableField('Specs Version', editedPartner.specs_version || '', 'specs_version')}
          <div>
            <p className="text-sm text-gray-500">Integration Type</p>
            <p className="font-medium text-gray-900">REST API, WebSDK</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Testing Status</p>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor('Not Started')}`}>
              Not Started
            </span>
          </div>
        </div>
      </div>

      {/* Contract & Pricing */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Contract & Pricing</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderEditableField('Contract Status', editedPartner.contract_status || '', 'contract_status', 'select', ['Pitching', 'Termsheet redlines', 'Termsheet signed; KNA redlines', 'KNA signed', 'no Termsheet; KNA redlines'])}
          {renderEditableField('Pricing Tier', editedPartner.pricing_tier || '', 'pricing_tier', 'select', ['Tier 0', 'Tier 1', 'Tier 2'])}
        </div>
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Project Timeline</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="font-medium">Project Start</span>
            </div>
            <span className="text-sm text-gray-600">2025-10-13</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <span className="font-medium">Current Phase</span>
            </div>
            <span className="text-sm text-gray-600">{editedPartner.technical_status || 'Scoping'}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <span className="font-medium">Target Go-Live</span>
            </div>
            <span className="text-sm text-gray-600">{editedPartner.go_live_date || 'TBD'}</span>
          </div>
        </div>
      </div>

      {/* Volume Projections */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Volume Projections</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderEditableField('Volume 2025', editedPartner.volume_2025 || '', 'volume_2025')}
          {renderEditableField('Volume 2026', editedPartner.volume_2026 || '', 'volume_2026')}
        </div>
      </div>

      {/* Go Live Date */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Go Live Information</h4>
        {renderEditableField('Go Live Date', editedPartner.go_live_date || '', 'go_live_date')}
      </div>
    </div>
  );

  const renderResourcesTab = () => (
    <div className="space-y-6">
      {/* Team Members */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Team Members</h4>
        <div className="space-y-4">
          {editedPartner.primary_owner_name && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Primary Technical PoC</p>
                <p className="text-sm text-gray-600">{editedPartner.primary_owner_name}</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Primary</span>
            </div>
          )}
          {editedPartner.secondary_owner_name && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Secondary Technical PoC</p>
                <p className="text-sm text-gray-600">{editedPartner.secondary_owner_name}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Secondary</span>
            </div>
          )}
          {editedPartner.commercial_owner_name && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Business Developer</p>
                <p className="text-sm text-gray-600">{editedPartner.commercial_owner_name}</p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">Commercial</span>
            </div>
          )}
        </div>
      </div>

      {/* Resource Allocation */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Resource Allocation</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Development</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Testing</span>
              <span>25%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRisksTab = () => (
    <div className="space-y-6">
      {/* Risks & Blockers */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Risks & Blockers</h4>
          {isEditing && (
            <button
              onClick={() => setNewRisk('')}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Risk</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-red-900">High Priority Risk</p>
              <p className="text-sm text-red-700">Contract negotiations pending - may impact timeline</p>
            </div>
            {isEditing && (
              <button className="text-red-600 hover:text-red-800">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Medium Priority Risk</p>
              <p className="text-sm text-yellow-700">Technical specifications still under review</p>
            </div>
            {isEditing && (
              <button className="text-yellow-600 hover:text-yellow-800">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dependencies */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Dependencies</h4>
          {isEditing && (
            <button
              onClick={() => setNewDependency('')}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Dependency</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Legal Review</p>
              <p className="text-sm text-gray-600">Contract terms approval</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
              {isEditing && (
                <button className="text-gray-600 hover:text-gray-800">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Technical Specs</p>
              <p className="text-sm text-gray-600">API documentation finalization</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Complete</span>
              {isEditing && (
                <button className="text-gray-600 hover:text-gray-800">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Next Milestone</h4>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="font-medium text-blue-900">Contract Signing</p>
          <p className="text-sm text-blue-700">Target: End of Q4 2025</p>
        </div>
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-6">
      {/* Notes & Comments */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Notes & Comments</h4>
        {renderEditableField('Notes', editedPartner.description || '', 'description', 'textarea')}
      </div>

      {/* Linked Documents */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Linked Documents</h4>
          {isEditing && (
            <button
              onClick={() => setNewDocument('')}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Document</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Technical Specification</p>
                <p className="text-sm text-gray-600">v2.1 - Updated API documentation</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link className="h-4 w-4 text-gray-400" />
              {isEditing && (
                <button className="text-gray-600 hover:text-gray-800">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Contract Draft</p>
                <p className="text-sm text-gray-600">Initial terms and conditions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link className="h-4 w-4 text-gray-400" />
              {isEditing && (
                <button className="text-gray-600 hover:text-gray-800">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-4 w-4 mr-2" />
          <span>Last updated: {new Date(editedPartner.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'technical':
        return renderTechnicalTab();
      case 'timeline':
        return renderTimelineTab();
      case 'resources':
        return renderResourcesTab();
      case 'risks':
        return renderRisksTab();
      case 'notes':
        return renderNotesTab();
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
            <h2 className="text-2xl font-semibold text-gray-900">{editedPartner.name} - Project Details</h2>
            <p className="text-sm text-gray-600 mt-1">Project ID: KN-{editedPartner.id.slice(-4).toUpperCase()}</p>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            )}
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

export default PartnerDetails;
