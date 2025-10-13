import React, { useState, useEffect } from 'react';
import { Plus, Building2, Users, TrendingUp } from 'lucide-react';
import PartnerCard from './components/PartnerCard';
import SearchFilters from './components/SearchFilters';
import PartnerForm from './components/PartnerForm';
import PartnerDetails from './components/PartnerDetails';
import { AcquiringPartner, Team, User } from './types';
import { partnersApi, teamsApi, usersApi } from './services/api';

function App() {
  const [partners, setPartners] = useState<AcquiringPartner[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<AcquiringPartner | undefined>();
  
  // Details modal state
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<AcquiringPartner | undefined>();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [partnersResponse, teamsResponse, usersResponse] = await Promise.all([
          partnersApi.getAll(),
          teamsApi.getAll(),
          usersApi.getAll(),
        ]);
        
        setPartners(partnersResponse.data);
        setTeams(teamsResponse.data);
        setUsers(usersResponse.data);
      } catch (err) {
        setError('Failed to load data. Please check if the backend server is running.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter partners based on search and filters
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = !searchQuery || 
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTeam = !selectedTeam || partner.team_name === selectedTeam;
    const matchesOwner = !selectedOwner || 
      partner.primary_owner_name?.includes(selectedOwner) ||
      partner.secondary_owner_name?.includes(selectedOwner) ||
      partner.solution_engineer_name?.includes(selectedOwner);
    const matchesStatus = !selectedStatus || partner.status === selectedStatus;

    return matchesSearch && matchesTeam && matchesOwner && matchesStatus;
  });

  const handleSavePartner = async (partnerData: Omit<AcquiringPartner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (editingPartner) {
        await partnersApi.update(editingPartner.id, partnerData);
        // Refresh partners list
        const response = await partnersApi.getAll();
        setPartners(response.data);
      } else {
        await partnersApi.create(partnerData);
        // Refresh partners list
        const response = await partnersApi.getAll();
        setPartners(response.data);
      }
      setShowForm(false);
      setEditingPartner(undefined);
    } catch (err) {
      setError('Failed to save partner');
      console.error('Error saving partner:', err);
    }
  };

  const handleEditPartner = (partner: AcquiringPartner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleViewDetails = (partner: AcquiringPartner) => {
    setSelectedPartner(partner);
    setShowDetails(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTeam('');
    setSelectedOwner('');
    setSelectedStatus('');
  };

  // Calculate statistics
  const totalPartners = partners.length;
  const activePartners = partners.filter(p => p.status === 'Active').length;
  const totalVolume = partners.reduce((sum, p) => {
    const volume = p.volume?.replace(/[^0-9.]/g, '');
    return sum + (volume ? parseFloat(volume) : 0);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partners...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <p className="text-gray-600">Please make sure the backend server is running on port 5000</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-semibold text-gray-900">Acquiring Partner Management</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Partner</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Partners</p>
                <p className="text-2xl font-semibold text-gray-900">{totalPartners}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                <p className="text-2xl font-semibold text-gray-900">{activePartners}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Volume</p>
                <p className="text-2xl font-semibold text-gray-900">${totalVolume}B+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          selectedTeam={selectedTeam}
          selectedOwner={selectedOwner}
          selectedStatus={selectedStatus}
          teams={teams}
          users={users}
          onSearchChange={setSearchQuery}
          onTeamChange={setSelectedTeam}
          onOwnerChange={setSelectedOwner}
          onStatusChange={setSelectedStatus}
          onClearFilters={clearFilters}
        />

        {/* Partners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              onEdit={handleEditPartner}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {filteredPartners.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No partners found</h3>
            <p className="text-gray-600">
              {partners.length === 0 
                ? "Get started by adding your first acquiring partner."
                : "Try adjusting your search criteria or filters."
              }
            </p>
          </div>
        )}
      </main>

      {/* Partner Form Modal */}
      {showForm && (
        <PartnerForm
          partner={editingPartner}
          teams={teams}
          users={users}
          onSave={handleSavePartner}
          onCancel={() => {
            setShowForm(false);
            setEditingPartner(undefined);
          }}
        />
      )}

      {/* Partner Details Modal */}
      {showDetails && selectedPartner && (
        <PartnerDetails
          partner={selectedPartner}
          onClose={() => {
            setShowDetails(false);
            setSelectedPartner(undefined);
          }}
          onEdit={(partner) => {
            setShowDetails(false);
            setSelectedPartner(undefined);
            setEditingPartner(partner);
            setShowForm(true);
          }}
          onSave={async (updatedPartner) => {
            try {
              await partnersApi.update(updatedPartner.id, updatedPartner);
              // Refresh partners list
              const response = await partnersApi.getAll();
              setPartners(response.data);
              setSelectedPartner(updatedPartner);
            } catch (err) {
              console.error('Error saving partner:', err);
            }
          }}
        />
      )}
    </div>
  );
}

export default App;
