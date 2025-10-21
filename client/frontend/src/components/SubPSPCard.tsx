import React from 'react';
import { Building2, Users, DollarSign, Calendar, MoreVertical, Code, Settings } from 'lucide-react';
import { AcquiringPartner } from '../types';

interface SubPSPCardProps {
  subPSP: AcquiringPartner;
  parentPartner: AcquiringPartner;
  onEdit?: (partner: AcquiringPartner) => void;
  onViewDetails?: (partner: AcquiringPartner) => void;
  onViewScope?: (partner: AcquiringPartner) => void;
  onViewIntegrations?: (partner: AcquiringPartner) => void;
}

const SubPSPCard: React.FC<SubPSPCardProps> = ({ 
  subPSP, 
  parentPartner, 
  onEdit, 
  onViewDetails, 
  onViewScope,
  onViewIntegrations 
}) => {
  console.log('SubPSPCard rendering for:', subPSP.name, 'parent:', parentPartner.name);
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getTechnicalStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-green-100 text-green-800';
      case 'In Development':
        return 'bg-blue-100 text-blue-800';
      case 'Scoping':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 relative">
      {/* TEST ELEMENT - VERY VISIBLE */}
      <div className="absolute top-0 left-0 bg-red-500 text-white p-2 text-xs font-bold z-50">
        SUB-PSP CARD TEST
      </div>
      
      {/* Sub-PSP Indicator */}
      <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
        Sub-PSP
      </div>
      
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{subPSP.name}</h3>
              <p className="text-sm text-gray-500">Sub-PSP of {parentPartner.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subPSP.status)}`}>
                  {subPSP.status}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTechnicalStatusColor(subPSP.lifecycle_stage || 'In Development')}`}>
                  {subPSP.lifecycle_stage || 'In Development'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => onEdit?.(subPSP)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Volume and Technical Status */}
        <div className="space-y-2 mb-4">
          {subPSP.estimated_volume_band && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{subPSP.estimated_volume_band}</span>
            </div>
          )}
          {subPSP.go_live_date && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Go-live: {subPSP.go_live_date}</span>
            </div>
          )}
        </div>

        {/* Team Assignment */}
        {subPSP.team_name && (
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{subPSP.team_name}</span>
          </div>
        )}

        {/* Integration Paths Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Integration Paths</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Payments API (HPP)', status: 'In Progress' },
              { name: 'Payments API (Embedded)', status: 'In Progress' },
              { name: 'Plugins', status: 'Not Started' }
            ].map((path, index) => (
              <span 
                key={index} 
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  path.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  path.status === 'Completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-600'
                }`}
              >
                {path.name}
              </span>
            ))}
          </div>
        </div>

        {/* Owners */}
        <div className="space-y-2 mb-4">
          {subPSP.commercial_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Commercial Owner</span>
              <span className="text-sm font-medium text-gray-900">{subPSP.commercial_owner_name}</span>
            </div>
          )}
          {subPSP.primary_sd_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Primary S&D Owner</span>
              <span className="text-sm font-medium text-gray-900">{subPSP.primary_sd_owner_name}</span>
            </div>
          )}
          {subPSP.primary_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Primary Owner</span>
              <span className="text-sm font-medium text-gray-900">{subPSP.primary_owner_name}</span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-4">
          <Calendar className="h-3 w-3" />
          <span>Updated {new Date(subPSP.updated_at).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={() => onViewDetails?.(subPSP)}
            className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors py-2 border border-primary-200 rounded hover:bg-primary-50"
          >
            View Details
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onViewScope?.(subPSP)}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors py-1 border border-blue-200 rounded hover:bg-blue-50"
            >
              <Code className="h-3 w-3 inline mr-1" />
              Scope
            </button>
            <button
              onClick={() => onViewIntegrations?.(subPSP)}
              className="text-xs font-medium text-green-600 hover:text-green-700 transition-colors py-1 border border-green-200 rounded hover:bg-green-50"
            >
              <Settings className="h-3 w-3 inline mr-1" />
              Integrations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubPSPCard;
