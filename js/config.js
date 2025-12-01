// API Configuration
// Automatically detects environment and sets correct API URL

const API_CONFIG = {
  // Determine if we're in development or production
  isDevelopment: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
  
  // Get base API URL based on environment
  getApiUrl() {
    if (this.isDevelopment) {
      return 'http://localhost:8080';
    }
    // For production, use environment variable or default
    // You can set this during build or deployment
    return window.ENV_API_URL || 'https://your-backend-url.com';
  },
  
  // API endpoints
  endpoints: {
    bookings: '/api/bookings',
  }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;
