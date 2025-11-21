import { useState, useEffect } from 'react';
import apiService from '../services/api';
import photoSync from '../services/photoSync';

export default function PhotoGallery({ schoolId }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    mealType: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchPhotos();
    
    // Connect to real-time updates
    photoSync.connect();
    
    // Listen for photo updates
    const unsubscribe = photoSync.addListener((data) => {
      if (data.type === 'warden_photo_added' || data.type === 'warden_photo_status_updated') {
        // Refresh photos when updates occur
        fetchPhotos();
      }
    });
    
    return () => {
      unsubscribe();
      photoSync.disconnect();
    };
  }, [schoolId, filter]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const filters = {
        schoolId,
        ...filter
      };
      
      // Remove empty filters
      Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
      });

      // Try to get photos from web portal first, fallback to regular API
      try {
        const portalPhotos = await photoSync.getPhotosFromPortal(filters);
        setPhotos(portalPhotos);
      } catch (portalError) {
        console.warn('Failed to get photos from web portal, using regular API:', portalError);
        const response = await apiService.getWardenPhotos(filters);
        setPhotos(response.photos || response);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getMealIcon = (mealType) => {
    switch (mealType) {
      case 'breakfast':
        return '🍳';
      case 'lunch':
        return '🍽️';
      case 'snacks':
        return '🍪';
      case 'dinner':
        return '🍛';
      default:
        return '🍽️';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Photo Gallery</h2>
      
      {/* Filters */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <select
          value={filter.mealType}
          onChange={(e) => setFilter({ ...filter, mealType: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All Meals</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="snacks">Snacks</option>
          <option value="dinner">Dinner</option>
        </select>
        
        <select
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        
        <input
          type="date"
          value={filter.startDate}
          onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Start Date"
        />
        
        <input
          type="date"
          value={filter.endDate}
          onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
          className="border border-gray-300 rounded-lg px-3 py-2"
          placeholder="End Date"
        />
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No photos found</h3>
          <p className="text-gray-600">No photos match your current filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo._id} className="bg-white rounded-lg shadow border overflow-hidden">
              {/* Photo */}
              <div className="relative">
                <img
                  src={photo.photoUrl}
                  alt={`${photo.mealType} meal`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(photo.status)}`}>
                    {photo.status}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {getMealIcon(photo.mealType)} {photo.mealType}
                  </span>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 capitalize">{photo.mealType}</h3>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span>📅 {formatDate(photo.timestamp)}</span>
                  </div>
                  
                  {photo.uploadedBy && (
                    <div className="flex items-center gap-2">
                      <span>👤 {photo.uploadedBy.name}</span>
                    </div>
                  )}
                  
                  {photo.reviewNotes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <strong>Review Notes:</strong> {photo.reviewNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}