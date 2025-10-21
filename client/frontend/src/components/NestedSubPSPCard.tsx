import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Users, DollarSign, AlertTriangle, CheckCircle, Calendar, Code } from 'lucide-react';
import { AcquiringPartner } from '../types';

interface NestedSubPSPCardProps {
  subPSP: AcquiringPartner;
  parentPartner: AcquiringPartner;
  onViewScope?: (subPSP: AcquiringPartner) => void;
  onViewIntegrations?: (subPSP: AcquiringPartner) => void;
}

const NestedSubPSPCard: React.FC<NestedSubPSPCardProps> = ({ 
  subPSP, 
  parentPartner, 
  onViewScope, 
  onViewIntegrations 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-600';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTechnicalStatusColor = (status: string) => {
    switch (status) {
      case 'Live':
        return 'bg-green-100 text-green-800';
      case 'In Development':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="ml-8 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronRight className="h-5 w-5 text-gray-400" />
            )}
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="text-lg font-semibold text-gray-900">{subPSP.name}</h3>
              <span className="text-sm text-gray-500">Sub-PSP of {parentPartner.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subPSP.status || 'Active')}`}>
              {subPSP.status || 'Active'}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTechnicalStatusColor(subPSP.lifecycle_stage || 'In Development')}`}>
              {subPSP.lifecycle_stage || 'In Development'}
            </span>
          </div>
        </div>
        
        {/* Quick Info */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Volume:</span>
            <span className="font-medium">{subPSP.estimated_volume_band || 'Medium'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Go-Live:</span>
            <span className="font-medium">{subPSP.go_live_date || '2025-09-01'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Team:</span>
            <span className="font-medium">{subPSP.owning_team_id || 'Distribution'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">Integrations:</span>
            <span className="font-medium">3 paths</span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="space-y-4">
            {/* Integration Paths */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Integration Paths</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { name: 'Payments API (HPP)', status: 'In Progress', description: 'Hosted Payment Page' },
                  { name: 'Payments API (Embedded)', status: 'In Progress', description: 'Embedded Payment Form' },
                  { name: 'Plugins', status: 'Not Started', description: 'E-commerce Plugins' }
                ].map((path, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{path.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        path.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        path.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {path.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{path.description}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onViewScope?.(subPSP)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Scope →
                      </button>
                      <button 
                        onClick={() => onViewIntegrations?.(subPSP)}
                        className="text-xs text-green-600 hover:text-green-800 font-medium"
                      >
                        View Integrations →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Key Metrics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">2025 Volume</p>
                      <p className="text-sm font-semibold">{subPSP.estimated_volume_band || 'Medium'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">2026 Volume</p>
                      <p className="text-sm font-semibold">{subPSP.estimated_volume_band || 'Medium'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Functionalities</p>
                      <p className="text-sm font-semibold">14 total</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <div>
                      <p className="text-xs text-gray-500">Required Missing</p>
                      <p className="text-sm font-semibold">3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => onViewScope?.(subPSP)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Manage Scope
              </button>
              <button 
                onClick={() => onViewIntegrations?.(subPSP)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                View Integrations
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NestedSubPSPCard;
