import React, { useState, useEffect } from 'react';
import EnhancedPartnerCard from './components/EnhancedPartnerCard';
import SubPSPCard from './components/SubPSPCard';
import PartnerDetails from './components/PartnerDetails';
import EnhancedScope from './components/EnhancedScope';
import { AcquiringPartner } from './types';
import { partnersApi } from './services/api';

function App() {
  const [partners, setPartners] = useState<AcquiringPartner[]>([]);
  const [subPSPs, setSubPSPs] = useState<AcquiringPartner[]>([]);
  const [openedPartners, setOpenedPartners] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showScope, setShowScope] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<AcquiringPartner | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      setLoading(true);
      const response = await partnersApi.getAll();
      setPartners(response.data);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubPSPs = async (partnerId: string) => {
    try {
      const response = await partnersApi.getSubPSPs(partnerId);
      // Convert SubPSP objects to AcquiringPartner format for SubPSPCard
      const convertedSubPSPs = response.data.map(subPSP => ({
        ...subPSP,
        priority: 'Medium' as const,
        portfolio_tag: undefined,
        go_live_confidence: undefined,
        project_duration_days: undefined,
        commercial_owner_id: undefined,
        primary_owner_id: undefined,
        secondary_owner_id: undefined,
        solution_engineer_id: undefined,
        primary_sd_owner_id: undefined,
        secondary_sd_owner_id: undefined,
        owning_team_id: undefined,
        parent_partner_id: subPSP.partner_id,
        commercial_owner_name: undefined,
        primary_owner_name: undefined,
        secondary_owner_name: undefined,
        solution_engineer_name: undefined,
        primary_sd_owner_name: undefined,
        secondary_sd_owner_name: undefined,
        team_name: undefined,
        parent_partner_name: undefined,
        volume: subPSP.estimated_volume_band,
        technical_status: subPSP.lifecycle_stage,
        contract_status: undefined,
        project_start: undefined,
        current_phase: undefined,
        next_milestone: undefined,
        risks_blockers: undefined,
        dependencies: undefined,
        integration_paths: undefined,
        kn_features: undefined,
        sub_entities: undefined
      }));
      setSubPSPs(convertedSubPSPs);
    } catch (error) {
      console.error('Error loading sub-PSPs:', error);
    }
  };

  const handlePartnerClick = async (partner: AcquiringPartner) => {
    console.log('Partner clicked:', partner.name);
    
    const isCurrentlyOpen = openedPartners.includes(partner.id);
    
    if (isCurrentlyOpen) {
      // Close the partner and remove its sub-PSPs
      setOpenedPartners(prev => prev.filter(id => id !== partner.id));
      setSubPSPs(prev => prev.filter(subPSP => subPSP.parent_partner_id !== partner.id));
    } else {
      // Open the partner and load its sub-PSPs
      setOpenedPartners(prev => [...prev, partner.id]);
      await loadSubPSPs(partner.id);
    }
  };

  const handleViewDetails = (partner: AcquiringPartner) => {
    setSelectedPartner(partner);
    setShowDetails(true);
  };

  const handleViewScope = (partner: AcquiringPartner) => {
    setSelectedPartner(partner);
    setShowScope(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedPartner(undefined);
  };

  const handleCloseScope = () => {
    setShowScope(false);
    setSelectedPartner(undefined);
  };

  // Filter out partners that have a parent (they should only appear as sub-PSPs)
  const filteredPartners = partners.filter(partner => !partner.parent_partner_id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading partners...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Acquiring Partner Management</h1>
        
        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <React.Fragment key={partner.id}>
              <EnhancedPartnerCard
                partner={partner}
                onViewDetails={handleViewDetails}
                onViewScope={handleViewScope}
                onClick={() => handlePartnerClick(partner)}
              />
              
              {/* Render sub-PSPs for this partner */}
              {openedPartners.includes(partner.id) && 
                subPSPs
                  .filter(subPSP => subPSP.parent_partner_id === partner.id)
                  .map(subPSP => (
                    <SubPSPCard
                      key={subPSP.id}
                      subPSP={subPSP}
                      parentPartner={partner}
                      onViewDetails={handleViewDetails}
                      onViewScope={handleViewScope}
                    />
                  ))
              }
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Partner Details Modal */}
      {showDetails && selectedPartner && (
        <PartnerDetails
          partner={selectedPartner}
          onClose={handleCloseDetails}
        />
      )}

      {/* Scope Modal */}
      {showScope && selectedPartner && (
        <EnhancedScope
          partnerId={selectedPartner.id}
          partnerName={selectedPartner.name}
          onClose={handleCloseScope}
        />
      )}
    </div>
  );
}

export default App;
