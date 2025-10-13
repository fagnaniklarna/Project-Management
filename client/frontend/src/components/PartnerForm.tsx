import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { AcquiringPartner, Team, User } from '../types';

interface PartnerFormProps {
  partner?: AcquiringPartner;
  teams: Team[];
  users: User[];
  onSave: (partner: Omit<AcquiringPartner, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ partner, teams, users, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    volume: '',
    status: 'Active',
    primary_owner_id: '',
    secondary_owner_id: '',
    commercial_owner_id: '',
    primary_sd_owner_id: '',
    secondary_sd_owner_id: '',
    team_id: '',
    technical_status: '',
    specs_version: '',
    contract_status: '',
    pricing_tier: '',
    volume_2025: '',
    volume_2026: '',
    go_live_date: '',
  });

  const [showAddPerson, setShowAddPerson] = useState({
    primary: false,
    secondary: false,
    commercial: false,
    primarySd: false,
    secondarySd: false,
  });

  const [newPersonName, setNewPersonName] = useState('');

  // Predefined lists
  const primarySecondaryOwners = [
    'Marissa Fagnani',
    'Justin Boyer',
    'Akin Toksan',
    'Carin Baker',
    'David Summersbee',
    'Dexter Vosper',
    'Volkan Toker',
    'Edouard Bayon',
    'Giuliano Belfiore',
    'Szilard Kaltenecker',
    'Nikita Vikhliaev',
  ];

  const commercialOwners = [
    'Libby Bostain',
    'Daisy Anderson',
    'Ashley Harper',
    'Isabell Sattler',
    'Bryony Macdonald',
    'Fredrika Jarnvall',
    'Robbie Bissett',
    'Kieran Wellbelove',
    'Joe Zaycosky',
    'Max van Zoelen',
    'Ashley Goldschmid',
    'Laurie Banitch',
    'Ruairidh Henderson',
    'Seville Gentry',
  ];

  const technicalStatusOptions = [
    'Not Started',
    'Scoping',
    'In Dev',
    'Launched',
  ];

  const contractStatusOptions = [
    'Pitching',
    'Termsheet redlines',
    'Termsheet signed; KNA redlines',
    'KNA signed',
    'no Termsheet; KNA redlines',
  ];

  const pricingTierOptions = [
    'Tier 0',
    'Tier 1',
    'Tier 2',
  ];

  const statusOptions = [
    'Active',
    'Inactive',
    'Pending',
  ];

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        description: partner.description || '',
        volume: partner.volume || '',
        status: partner.status,
        primary_owner_id: partner.primary_owner_id || '',
        secondary_owner_id: partner.secondary_owner_id || '',
        commercial_owner_id: partner.commercial_owner_id || '',
        primary_sd_owner_id: partner.primary_sd_owner_id || '',
        secondary_sd_owner_id: partner.secondary_sd_owner_id || '',
        team_id: partner.team_id || '',
        technical_status: partner.technical_status || '',
        specs_version: partner.specs_version || '',
        contract_status: partner.contract_status || '',
        pricing_tier: partner.pricing_tier || '',
        volume_2025: partner.volume_2025 || '',
        volume_2026: partner.volume_2026 || '',
        go_live_date: partner.go_live_date || '',
      });
    }
  }, [partner]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddPerson = (type: 'primary' | 'secondary' | 'commercial' | 'primarySd' | 'secondarySd') => {
    if (newPersonName.trim()) {
      const fieldName = `${type}_owner_id`;
      handleChange(fieldName, newPersonName.trim());
      setNewPersonName('');
      setShowAddPerson(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleAddOption = (field: string, value: string) => {
    if (value.trim()) {
      handleChange(field, value.trim());
    }
  };

  const renderEditableDropdown = (
    label: string,
    field: string,
    options: string[],
    placeholder: string,
    addPersonType?: 'primary' | 'secondary' | 'commercial' | 'primarySd' | 'secondarySd'
  ) => {
    const showAdd = showAddPerson[addPersonType || 'primary'];
    const currentValue = formData[field as keyof typeof formData];

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="flex gap-2">
          <select
            value={currentValue}
            onChange={(e) => handleChange(field, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {addPersonType && (
            <button
              type="button"
              onClick={() => setShowAddPerson(prev => ({ ...prev, [addPersonType]: !prev[addPersonType] }))}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
        {showAdd && addPersonType && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              placeholder="Enter new person's name"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => handleAddPerson(addPersonType)}
              className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderEditableInput = (
    label: string,
    field: string,
    placeholder: string,
    type: string = 'text'
  ) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type={type}
          value={formData[field as keyof typeof formData]}
          onChange={(e) => handleChange(field, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder={placeholder}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {partner ? 'Edit Partner' : 'Add New Partner'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderEditableInput('Partner Name *', 'name', 'e.g., Stripe')}
              {renderEditableInput('Volume', 'volume', 'e.g., $200B+')}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Brief description of the partner..."
              />
            </div>

            {/* Team Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Owning Team
              </label>
              <select
                value={formData.team_id}
                onChange={(e) => handleChange('team_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Technical Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Technical Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderEditableDropdown('Technical Status', 'technical_status', technicalStatusOptions, 'Select technical status')}
                {renderEditableInput('Specs Version', 'specs_version', 'e.g., V2R8')}
                {renderEditableDropdown('Contract Status', 'contract_status', contractStatusOptions, 'Select contract status')}
                {renderEditableDropdown('Pricing Tier', 'pricing_tier', pricingTierOptions, 'Select pricing tier')}
              </div>
            </div>

            {/* Volume Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Volume Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderEditableInput('Volume 2025', 'volume_2025', 'e.g., 10.9B')}
                {renderEditableInput('Volume 2026', 'volume_2026', 'e.g., 42B')}
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
              {renderEditableInput('Go Live Date', 'go_live_date', 'e.g., January 31, 2026')}
            </div>

            {/* Owners */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Owners</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderEditableDropdown('Primary Owner', 'primary_owner_id', primarySecondaryOwners, 'Select primary owner', 'primary')}
                {renderEditableDropdown('Secondary Owner', 'secondary_owner_id', primarySecondaryOwners, 'Select secondary owner', 'secondary')}
                {renderEditableDropdown('Commercial Owner', 'commercial_owner_id', commercialOwners, 'Select commercial owner', 'commercial')}
                {renderEditableDropdown('Primary S&D Owner', 'primary_sd_owner_id', primarySecondaryOwners, 'Select primary S&D owner', 'primarySd')}
                {renderEditableDropdown('Secondary S&D Owner', 'secondary_sd_owner_id', primarySecondaryOwners, 'Select secondary S&D owner', 'secondarySd')}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{partner ? 'Update Partner' : 'Create Partner'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerForm;
