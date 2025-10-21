import React, { useState } from 'react';
import { Building2, Users, DollarSign, Calendar, MoreVertical, Code, Settings } from 'lucide-react';
import { AcquiringPartner } from '../types';

interface EnhancedPartnerCardProps {
  partner: AcquiringPartner;
  onEdit?: (partner: AcquiringPartner) => void;
  onViewDetails?: (partner: AcquiringPartner) => void;
  onViewScope?: (partner: AcquiringPartner) => void;
  onViewIntegrations?: (partner: AcquiringPartner) => void;
  onClick?: (partner: AcquiringPartner) => void;
}

const EnhancedPartnerCard: React.FC<EnhancedPartnerCardProps> = ({ 
  partner, 
  onEdit, 
  onViewDetails, 
  onViewScope,
  onViewIntegrations,
  onClick
}) => {
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
    <div 
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() => {
        console.log('Card clicked for partner:', partner.name);
        onClick?.(partner);
      }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(partner.status)}`}>
                  {partner.status}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTechnicalStatusColor(partner.lifecycle_stage || 'In Development')}`}>
                  {partner.lifecycle_stage || 'In Development'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(partner);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>

        {/* Volume and Technical Status */}
        <div className="space-y-2 mb-4">
          {partner.estimated_volume_band && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">{partner.estimated_volume_band}</span>
            </div>
          )}
          {partner.go_live_date && (
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600">Go-live: {partner.go_live_date}</span>
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
          {partner.primary_owner_name && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Primary Owner</span>
              <span className="text-sm font-medium text-gray-900">{partner.primary_owner_name}</span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center space-x-2 text-xs text-gray-400 mb-4">
          <Calendar className="h-3 w-3" />
          <span>Updated {new Date(partner.updated_at).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(partner);
            }}
            className="w-full text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors py-2 border border-primary-200 rounded hover:bg-primary-50"
          >
            View Details
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewScope?.(partner);
              }}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors py-1 border border-blue-200 rounded hover:bg-blue-50"
            >
              <Code className="h-3 w-3 inline mr-1" />
              Scope
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewIntegrations?.(partner);
              }}
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

export default EnhancedPartnerCard;
