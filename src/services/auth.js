import apiService from './api.js';

class AuthService {
  constructor() {
    this.TOKEN_KEY = 'token';
    this.USER_KEY = 'user';
  }

  async login(phone, password) {
    try {
      const response = await apiService.login(phone, password);
      
      if (response.token) {
        localStorage.setItem(this.TOKEN_KEY, response.token);
        
        // Decode token to get user info (basic decode, not secure validation)
        const payload = JSON.parse(atob(response.token.split('.')[1]));
        localStorage.setItem(this.USER_KEY, JSON.stringify(payload));
        
        return { success: true, user: payload };
      }
      
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = '/';
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser() {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp ? payload.exp > currentTime : true;
    } catch (error) {
      return false;
    }
  }

  hasRole(requiredRoles) {
    const user = this.getUser();
    if (!user || !user.role) return false;
    
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.includes(user.role);
    }
    
    return user.role === requiredRoles;
  }
}

export default new AuthService();