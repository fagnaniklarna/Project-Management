import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, DollarSign, AlertTriangle, CheckCircle, Clock, FileText, Link, Edit, Save, Plus, Code, GitBranch, Target, Grid } from 'lucide-react';
import { AcquiringPartner, IntegrationType, ProjectStage, PartnerIntegration, LifecycleStage } from '../types';
import { integrationsApi } from '../services/api';
import Scope from './Scope';
import OriginalScope from './OriginalScope';
import PayTrailDetails from './PayTrailDetails';

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
  const [showPayTrailDetails, setShowPayTrailDetails] = useState(false);
  const [integrations, setIntegrations] = useState<PartnerIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  // Fetch integrations when integrations tab is active
  useEffect(() => {
    if (activeTab === 'integrations' && integrations.length === 0) {
      setLoadingIntegrations(true);
      integrationsApi.getByPartner(partner.id)
        .then(response => {
          setIntegrations(response.data);
          setLoadingIntegrations(false);
        })
        .catch(error => {
          console.error('Error fetching integrations:', error);
          setLoadingIntegrations(false);
        });
    }
  }, [activeTab, partner.id, integrations.length]);

  // Calculation functions
  const calculateHealthScore = (partner: AcquiringPartner): number => {
    let score = 100;
    
    // Deduct points for lifecycle stage
    const stagePenalties = {
      'Not Started': -20,
      'Scoping': -10,
      'In Development': -5,
      'Launched': 0,
      'Blocked': -30
    };
    score += stagePenalties[partner.lifecycle_stage] || 0;
    
    // Deduct points for priority (higher priority = more pressure)
    const priorityPenalties = {
      'Low': 0,
      'Medium': -5,
      'High': -10,
      'Critical': -15
    };
    score += priorityPenalties[partner.priority] || 0;
    
    // Deduct points for overdue go-live
    if (partner.go_live_date) {
      const goLiveDate = new Date(partner.go_live_date);
      const today = new Date();
      const daysOverdue = Math.floor((today.getTime() - goLiveDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysOverdue > 0) {
        score -= Math.min(daysOverdue * 2, 30); // Max 30 point penalty
      }
    }
    
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const calculateDaysToGoLive = (partner: AcquiringPartner): number | null => {
    if (!partner.go_live_date) return null;
    
    const goLiveDate = new Date(partner.go_live_date);
    const today = new Date();
    const diffTime = goLiveDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const calculateProjectDuration = (partner: AcquiringPartner): number | null => {
    if (!partner.created_at) return null;
    
    const startDate = new Date(partner.created_at);
    const endDate = partner.lifecycle_stage === 'Launched' && partner.go_live_date 
      ? new Date(partner.go_live_date)
      : new Date(); // Use current date if not live yet
    
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const tabs = [
    { id: 'overview', label: 'Project Overview', icon: Users },
    { id: 'subentities', label: 'Sub-PSPs & Gateways', icon: GitBranch },
    { id: 'integrations', label: 'Integration Paths', icon: Code },
    { id: 'scope', label: 'Scope', icon: Grid },
    { id: 'technical', label: 'Technical Details', icon: CheckCircle },
    { id: 'timeline', label: 'Timeline & Milestones', icon: Calendar },
    { id: 'resources', label: 'Team & Resources', icon: Users },
    { id: 'risks', label: 'Risks & Dependencies', icon: AlertTriangle },
    { id: 'features', label: 'KN Features', icon: Target },
    { id: 'notes', label: 'Notes & Documentation', icon: FileText },
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


  const handleFieldChange = (field: keyof AcquiringPartner, value: string | string[]) => {
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
    value: string | string[],
    field: keyof AcquiringPartner,
    type: 'text' | 'textarea' | 'select' | 'multiselect' = 'text',
    options?: string[]
  ) => {
    if (isEditing) {
      if (type === 'textarea') {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <textarea
              value={Array.isArray(value) ? value.join('\n') : value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>
        );
      } else if (type === 'multiselect' && options) {
        const currentValues = Array.isArray(value) ? value : (value ? [value] : []);
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="space-y-2">
              {options.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentValues.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleFieldChange(field, [...currentValues, option]);
                      } else {
                        handleFieldChange(field, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      } else if (type === 'select' && options) {
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
              value={Array.isArray(value) ? value[0] || '' : value}
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
              value={Array.isArray(value) ? value.join(', ') : value}
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
          <p className="font-medium text-gray-900">
            {Array.isArray(value) ? value.join(', ') : (value || 'Not set')}
          </p>
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
                  {renderEditableField('Priority', editedPartner.priority || 'Medium', 'priority', 'select', ['High', 'Medium', 'Low'])}
                </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              {renderEditableField('Estimated Volume', editedPartner.estimated_volume_band || '', 'estimated_volume_band')}
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Health Score</p>
              <p className={`text-lg font-semibold ${
                calculateHealthScore(editedPartner) >= 80 ? 'text-green-600' :
                calculateHealthScore(editedPartner) >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {calculateHealthScore(editedPartner)}%
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Days to Go-Live</p>
              <p className={`text-lg font-semibold ${
                calculateDaysToGoLive(editedPartner) === null ? 'text-gray-600' :
                calculateDaysToGoLive(editedPartner)! < 0 ? 'text-red-600' :
                calculateDaysToGoLive(editedPartner)! <= 30 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {calculateDaysToGoLive(editedPartner) === null ? 'TBD' :
                 calculateDaysToGoLive(editedPartner)! < 0 ? `${Math.abs(calculateDaysToGoLive(editedPartner)!)} days overdue` :
                 calculateDaysToGoLive(editedPartner)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Project Duration</p>
              <p className={`text-lg font-semibold ${
                calculateProjectDuration(editedPartner) === null ? 'text-gray-600' :
                calculateProjectDuration(editedPartner)! > 365 ? 'text-red-600' :
                calculateProjectDuration(editedPartner)! > 180 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {calculateProjectDuration(editedPartner) === null ? 'TBD' :
                 `${calculateProjectDuration(editedPartner)} days`}
              </p>
            </div>
          </div>
        </div>
      </div>

            {/* Team Assignment */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Team Assignment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderEditableField('Owning Team', editedPartner.team_name || '', 'team_name')}
                {renderEditableField('Portfolio Tag', editedPartner.portfolio_tag || '', 'portfolio_tag', 'select', ['Win Top MoR Black', 'Win Top MoR Cobalt', 'Win Top MoR Platinum', 'Win Top MoR Red'])}
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
          {renderEditableField('Lifecycle Stage', editedPartner.lifecycle_stage || '', 'lifecycle_stage', 'select', ['Not Started', 'Scoping', 'In Development', 'Launched', 'Blocked'])}
          {renderEditableField('Priority', editedPartner.priority || '', 'priority', 'select', ['Low', 'Medium', 'High', 'Critical'])}
          {renderEditableField('Go Live Confidence', editedPartner.go_live_confidence || '', 'go_live_confidence', 'select', ['Low', 'Medium', 'High'])}
          {renderEditableField('Health Score', editedPartner.health_score?.toString() || '', 'health_score')}
        </div>
      </div>

      {/* Volume & Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Volume & Timeline</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderEditableField('Estimated Volume Band', editedPartner.estimated_volume_band || '', 'estimated_volume_band', 'select', ['Low', 'Medium', 'High'])}
          {renderEditableField('Estimated Volume Value', editedPartner.estimated_volume_value?.toString() || '', 'estimated_volume_value')}
          {renderEditableField('Go Live Date', editedPartner.go_live_date || '', 'go_live_date')}
          {renderEditableField('Days to Go Live', editedPartner.days_to_go_live?.toString() || '', 'days_to_go_live')}
        </div>
      </div>
    </div>
  );

  const renderTimelineTab = () => {
    const projectStages: LifecycleStage[] = ['Not Started', 'Scoping', 'In Development', 'Launched', 'Blocked'];
    const currentPhase = editedPartner.lifecycle_stage || 'Not Started';
    const currentIndex = projectStages.indexOf(currentPhase);

    return (
      <div className="space-y-6">
        {/* Project Stage Timeline */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Project Stage Timeline</h4>
          <div className="relative">
            <div className="flex items-center justify-between">
              {projectStages.map((stage, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                
                return (
                  <div key={stage} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      isCompleted ? 'bg-green-500 text-white' :
                      isCurrent ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <span className={`text-xs mt-2 text-center ${
                      isCurrent ? 'font-medium text-blue-600' :
                      isCompleted ? 'text-green-600' :
                      'text-gray-500'
                    }`}>
                      {stage}
                    </span>
                    {isCurrent && (
                      <span className="text-xs text-blue-600 font-medium mt-1">Current</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
          </div>
        </div>

        {/* Timeline Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Timeline Details</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="font-medium">Project Start</span>
              </div>
              {isEditing ? (
                <input
                  type="date"
                  value={editedPartner.created_at ? editedPartner.created_at.split('T')[0] : ''}
                  onChange={(e) => handleFieldChange('created_at', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                />
              ) : (
                <span className="text-sm text-gray-600">{editedPartner.created_at ? new Date(editedPartner.created_at).toLocaleDateString() : 'Not set'}</span>
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-medium">Current Phase</span>
              </div>
              {isEditing ? (
                <select
                  value={currentPhase}
                  onChange={(e) => handleFieldChange('lifecycle_stage', e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  {projectStages.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
              ) : (
                <span className="text-sm text-gray-600">{currentPhase}</span>
              )}
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

        {/* Project Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Project Notes</h4>
          {renderEditableField('Notes', editedPartner.notes || '', 'notes', 'textarea')}
        </div>

        {/* Volume Projections */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Volume Projections</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderEditableField('Volume Band', editedPartner.estimated_volume_band || '', 'estimated_volume_band', 'select', ['Low', 'Medium', 'High'])}
            {renderEditableField('Volume Value', editedPartner.estimated_volume_value?.toString() || '', 'estimated_volume_value')}
          </div>
        </div>
      </div>
    );
  };

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
              onClick={() => {/* TODO: Implement add risk functionality */}}
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
              {isEditing ? (
                <textarea
                  value={editedPartner.notes || 'No risks identified'}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-red-700 bg-transparent"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-red-700">{editedPartner.notes || 'No risks identified'}</p>
              )}
            </div>
          </div>
          <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Medium Priority Risk</p>
              <p className="text-sm text-yellow-700">Technical specifications still under review</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dependencies */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Dependencies</h4>
          {isEditing && (
            <button
              onClick={() => {/* TODO: Implement add dependency functionality */}}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Dependency</span>
            </button>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-yellow-900">Legal Review</p>
              {isEditing ? (
                <textarea
                  value={editedPartner.notes || 'No dependencies identified'}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-yellow-700 bg-transparent"
                  rows={3}
                />
              ) : (
                <p className="text-sm text-yellow-700">Contract terms approval</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Pending</span>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex-1">
              <p className="font-medium text-green-900">Technical Specs</p>
              <p className="text-sm text-green-700">API documentation finalization</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Next Milestone */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Next Milestone</h4>
        {renderEditableField('Project Notes', editedPartner.notes || '', 'notes', 'textarea')}
      </div>
    </div>
  );

  const renderNotesTab = () => (
    <div className="space-y-6">
      {/* Notes & Comments */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Notes & Comments</h4>
        {renderEditableField('Notes', editedPartner.notes || '', 'notes', 'textarea')}
      </div>

      {/* Linked Documents */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Linked Documents</h4>
          {isEditing && (
            <button
              onClick={() => {/* TODO: Implement add document functionality */}}
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

  const renderSubEntitiesTab = () => {
    // For Nexi, show PayTrail as a sub-PSP
    const subPSPs = editedPartner.name === 'Nexi' ? [
      {
        id: 'paytrail-sub-psp',
        name: 'Paytrail',
        description: 'Finnish payment service provider (sub-PSP of Nexi)',
        status_stage: 'Active',
        integration_paths: [
          { type: 'Payments API (HPP)', status: 'In Progress' },
          { type: 'Payments API (Embedded)', status: 'In Progress' },
          { type: 'Plugins', status: 'Not Started' }
        ],
        primary_owner_name: 'Not assigned',
        business_developer_name: 'Not assigned'
      }
    ] : [];

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sub-PSPs & Gateways</h3>
          {isEditing && (
            <button className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Add Sub-Entity</span>
            </button>
          )}
        </div>
        
        <div className="space-y-4">
          {subPSPs.map((subEntity) => (
            <div key={subEntity.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{subEntity.name}</h4>
                  <p className="text-sm text-gray-600">{subEntity.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subEntity.status_stage)}`}>
                  {subEntity.status_stage}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-500">Primary Owner</p>
                  <p className="font-medium">{subEntity.primary_owner_name || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Business Developer</p>
                  <p className="font-medium">{subEntity.business_developer_name || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Integration Paths</p>
                  <p className="font-medium">{subEntity.integration_paths?.length || 0} configured</p>
                </div>
              </div>
              
              {/* Integration Paths */}
              <div className="border-t border-gray-100 pt-4">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Integration Paths</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {subEntity.integration_paths?.map((path, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{path.type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          path.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          path.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {path.status}
                        </span>
                      </div>
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        onClick={() => {
                          // Navigate to PayTrail details with specific integration path
                          if (subEntity.name === 'Paytrail') {
                            setShowPayTrailDetails(true);
                          }
                        }}
                      >
                        View Scope →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              <GitBranch className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No sub-PSPs or gateways configured</p>
              <p className="text-sm">Add sub-entities to track specific integration paths</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Integration Paths</h3>
        {isEditing && (
          <button className="flex items-center space-x-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add Integration Path</span>
          </button>
        )}
      </div>
      
      {loadingIntegrations ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Loading integration paths...</span>
        </div>
      ) : integrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{integration.integration_name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  integration.integration_pattern === 'REST API' ? 'bg-blue-100 text-blue-800' :
                  integration.integration_pattern === 'WebSDK' ? 'bg-green-100 text-green-800' :
                  integration.integration_pattern === 'Plugin' ? 'bg-purple-100 text-purple-800' :
                  integration.integration_pattern === 'MobileSDK' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {integration.integration_pattern}
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-500">Integration Pattern</p>
                  <p className="text-sm font-medium">{integration.integration_pattern}</p>
                </div>
                {integration.planned_go_live_date && (
                  <div>
                    <p className="text-sm text-gray-500">Planned Go-Live</p>
                    <p className="text-sm font-medium">{new Date(integration.planned_go_live_date).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="text-sm font-medium">{new Date(integration.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Code className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No integration paths configured</p>
          <p className="text-sm">Add integration paths to track specific implementation methods</p>
        </div>
      )}
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Klarna Network Features</h3>
        <div className="text-sm text-gray-500">
          Track feature implementation across integration paths
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="space-y-4">
          {[]?.map((feature: any) => (
            <div key={feature.id} className="border-b border-gray-100 pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  feature.implementation_status === 'Implemented' ? 'bg-green-100 text-green-800' :
                  feature.implementation_status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  feature.implementation_status === 'Not Applicable' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {feature.implementation_status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                {feature.integration_paths.map((path: any) => (
                  <span key={path} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {path}
                  </span>
                ))}
              </div>
            </div>
          )) || (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No KN features configured</p>
              <p className="text-sm">Configure features to track implementation status</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'subentities':
        return renderSubEntitiesTab();
      case 'integrations':
        return renderIntegrationsTab();
            case 'scope':
              // Use OriginalScope for "Nexi (Original Model)", regular Scope for others
              if (partner.name === 'Nexi (Original Model)') {
                return <OriginalScope partnerId={partner.id} />;
              } else {
                return <Scope partnerId={partner.id} />;
              }
      case 'technical':
        return renderTechnicalTab();
      case 'timeline':
        return renderTimelineTab();
      case 'resources':
        return renderResourcesTab();
      case 'risks':
        return renderRisksTab();
      case 'features':
        return renderFeaturesTab();
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

      {/* PayTrail Details Modal */}
      {showPayTrailDetails && (
        <PayTrailDetails
          partner={{
            ...partner,
            name: 'Paytrail',
            status: 'Active',
            lifecycle_stage: 'In Development',
            priority: 'High',
            estimated_volume_band: 'Medium',
            estimated_volume_value: 20000000000,
            go_live_date: '2025-07-01',
            health_score: 90,
            days_to_go_live: 193,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }}
          onClose={() => setShowPayTrailDetails(false)}
        />
      )}
    </div>
  );
};

export default PartnerDetails;
