import React from 'react';
import { Building2, Users, DollarSign, Calendar, MoreVertical } from 'lucide-react';
import { AcquiringPartner } from '../types';

interface PartnerCardProps {
  partner: AcquiringPartner;
  onEdit?: (partner: AcquiringPartner) => void;
  onViewDetails?: (partner: AcquiringPartner) => void;
}

const PartnerCard: React.FC<PartnerCardProps> = ({ partner, onEdit, onViewDetails }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.status)}`}>
                {partner.status}
              </span>
            </div>
          </div>
          <button 
            onClick={() => onEdit?.(partner)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>


        {/* Volume and Technical Status */}
        <div className="space-y-2 mb-4">
          {partner.volume && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{partner.volume}</span>
            </div>
          )}
          {partner.technical_status && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Status:</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                partner.technical_status === 'Launched' ? 'bg-green-100 text-green-800' :
                partner.technical_status === 'In Dev' ? 'bg-blue-100 text-blue-800' :
                partner.technical_status === 'Scoping' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {partner.technical_status}
              </span>
            </div>
          )}
          {partner.go_live_date && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Go-live:</span>
              <span className="text-xs text-gray-700">{partner.go_live_date}</span>
            </div>
          )}
        </div>

        {/* Team Assignment */}
        {partner.team_name && (
          <div className="flex items-center space-x-2 mb-4">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{partner.team_name}</span>
          </div>
        )}

        {/* Owners */}
        <div className="space-y-2 mb-4">
          {partner.commercial_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Commercial Owner</span>
              <span className="text-sm font-medium text-gray-900">{partner.commercial_owner_name}</span>
            </div>
          )}
          {partner.primary_sd_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Primary S&D Owner</span>
              <span className="text-sm font-medium text-gray-900">{partner.primary_sd_owner_name}</span>
            </div>
          )}
          {partner.secondary_sd_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Secondary S&D Owner</span>
              <span className="text-sm font-medium text-gray-900">{partner.secondary_sd_owner_name}</span>
            </div>
          )}
          {partner.primary_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Primary Owner</span>
              <span className="text-sm font-medium text-gray-900">{partner.primary_owner_name}</span>
            </div>
          )}
          {partner.secondary_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Secondary Owner</span>
              <span className="text-sm font-medium text-gray-900">{partner.secondary_owner_name}</span>
            </div>
          )}
          {partner.solution_engineer_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Solution Engineer</span>
              <span className="text-sm font-medium text-gray-900">{partner.solution_engineer_name}</span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Calendar className="h-3 w-3" />
          <span>Updated {new Date(partner.updated_at).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => onViewDetails?.(partner)}
            className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerCard;
