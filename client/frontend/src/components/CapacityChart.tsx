import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, CheckCircle, BarChart3 } from 'lucide-react';

const CapacityChart: React.FC = () => {
  const [capacityData, setCapacityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCapacityData = async () => {
      try {
        setLoading(true);
        // Mock data for now since capacityApi doesn't exist
        setCapacityData([]);
      } catch (err) {
        setError('Failed to load capacity data');
        console.error('Error fetching capacity data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCapacityData();
  }, []);

  const getCapacityLevel = (totalCount: number) => {
    if (totalCount === 0) return { level: 'low', color: 'bg-green-100 text-green-800', label: 'Available' };
    if (totalCount <= 2) return { level: 'low', color: 'bg-green-100 text-green-800', label: 'Low' };
    if (totalCount <= 4) return { level: 'medium', color: 'bg-yellow-100 text-yellow-800', label: 'Medium' };
    return { level: 'high', color: 'bg-red-100 text-red-800', label: 'High' };
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Primary Owner':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'Secondary Owner':
        return <Users className="h-4 w-4 text-green-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Primary Owner':
        return 'border-l-blue-500';
      case 'Secondary Owner':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center text-red-600">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const sortedData = [...capacityData].sort((a, b) => b.total_count - a.total_count);
  const totalAccounts = capacityData.reduce((sum, person) => sum + person.total_count, 0);
  const averageWorkload = capacityData.length > 0 ? totalAccounts / capacityData.length : 0;
  const maxCount = Math.max(...capacityData.map(p => p.total_count), 1);

  return (
    <div className="space-y-6">
      {/* Main Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BarChart3 className="h-6 w-6 text-primary-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">POC Capacity Overview</h2>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{totalAccounts}</span> total accounts across{' '}
            <span className="font-medium">{capacityData.length}</span> POCs
          </div>
        </div>

        {/* Bar Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Workload Distribution</h3>
          <div className="space-y-3">
            {sortedData.map((person) => {
              const capacityLevel = getCapacityLevel(person.total_count);
              const barWidth = (person.total_count / maxCount) * 100;
              
              return (
                <div key={person.id} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium text-gray-900 truncate">
                    {person.name}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{person.role}</span>
                      <span className="text-sm font-medium text-gray-900">{person.total_count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          capacityLevel.level === 'low' ? 'bg-green-500' :
                          capacityLevel.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-20">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${capacityLevel.color}`}>
                      {capacityLevel.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Average Workload</p>
              <p className="text-2xl font-bold text-blue-900">{averageWorkload.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600">Available POCs</p>
              <p className="text-2xl font-bold text-green-900">
                {capacityData.filter(p => p.total_count === 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">High Capacity</p>
              <p className="text-2xl font-bold text-yellow-900">
                {capacityData.filter(p => p.total_count > 4).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Capacity List</h3>
        <div className="space-y-3">
          {sortedData.map((person) => {
            const capacityLevel = getCapacityLevel(person.total_count);
            return (
              <div
                key={person.id}
                className={`bg-gray-50 rounded-lg p-4 border-l-4 ${getRoleColor(person.role)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getRoleIcon(person.role)}
                    <div>
                      <h3 className="font-medium text-gray-900">{person.name}</h3>
                      <p className="text-sm text-gray-600">{person.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Total:</span>
                        <span className="text-lg font-bold text-gray-900">{person.total_count}</span>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${capacityLevel.color}`}>
                      {capacityLevel.label}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Workload</span>
                    <span>{person.total_count} accounts</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        capacityLevel.level === 'low' ? 'bg-green-500' :
                        capacityLevel.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((person.total_count / 6) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {capacityData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No POC capacity data available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CapacityChart;
