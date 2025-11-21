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

const API_BASE_URL = resolveBaseUrl('VITE_API_BASE_URL', DEFAULT_ORIGIN);
const WEB_PORTAL_URL = resolveBaseUrl(
  'VITE_WEB_PORTAL_URL',
  DEFAULT_ORIGIN,
);

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(phone, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone, password }),
    });
  }

  // Photo endpoints
  async uploadPhoto(formData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/photos/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }



  // Get photos from web portal
  async getWardenPhotos(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    const url = `${WEB_PORTAL_URL}/api/warden-photos?${queryParams}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getPhotosBySchool(schoolId) {
    return this.request(`/photos/${schoolId}`);
  }

  // School endpoints - synced with web portal API
  async getAllSchools() {
    const url = `${WEB_PORTAL_URL}/api/schools`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getSchoolById(schoolId) {
    const url = `${WEB_PORTAL_URL}/api/schools/${schoolId}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async getSchools() {
    return this.getAllSchools();
  }

  async getSchool(id) {
    return this.getSchoolById(id);
  }

  async createSchool(schoolData) {
    const url = `${WEB_PORTAL_URL}/api/schools`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schoolData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async updateSchool(id, schoolData) {
    const url = `${WEB_PORTAL_URL}/api/schools/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schoolData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  async deleteSchool(id) {
    const url = `${WEB_PORTAL_URL}/api/schools/${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }

  // Remarks endpoints
  async addRemark(photoId, remark) {
    return this.request('/remarks', {
      method: 'POST',
      body: JSON.stringify({ photoId, remark }),
    });
  }
}

export default new ApiService();