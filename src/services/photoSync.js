const DEFAULT_ORIGIN =
  typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : '';

const normalizeUrl = (value = '') => value.replace(/\/+$/, '');

const resolveBaseUrl = (envKey, fallback) => {
  const envValue = import.meta.env?.[envKey];
  if (envValue && envValue !== 'undefined' && envValue !== 'null') {
    return normalizeUrl(envValue);
  }
  if (fallback) {
    return normalizeUrl(fallback);
  }
  return '';
};

const WEB_PORTAL_URL = resolveBaseUrl(
  'VITE_WEB_PORTAL_URL',
  DEFAULT_ORIGIN,
);

class PhotoSyncService {
  constructor() {
    this.eventSource = null;
    this.listeners = new Set();
  }

  // Connect to Server-Sent Events for real-time updates
  connect() {
    if (this.eventSource) {
      return;
    }

    try {
      this.eventSource = new EventSource(`${WEB_PORTAL_URL}/api/photos/events`);
      
      this.eventSource.onopen = () => {
        console.log('Photo sync connected');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyListeners(data);
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Photo sync error:', error);
        this.disconnect();
        
        // Retry connection after 5 seconds
        setTimeout(() => {
          this.connect();
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to connect to photo sync:', error);
    }
  }

  // Disconnect from SSE
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  // Add listener for photo updates
  addListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners of updates
  notifyListeners(data) {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in photo sync listener:', error);
      }
    });
  }

  // Manually sync photos to web portal
  async syncPhotoToPortal(photoData) {
    try {
      const response = await fetch(`${WEB_PORTAL_URL}/api/warden-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Photo synced to web portal:', result);
      return result;
    } catch (error) {
      console.error('Failed to sync photo to web portal:', error);
      throw error;
    }
  }

  // Get photos from web portal
  async getPhotosFromPortal(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${WEB_PORTAL_URL}/api/warden-photos?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.photos || result;
    } catch (error) {
      console.error('Failed to get photos from web portal:', error);
      throw error;
    }
  }
}

export default new PhotoSyncService();