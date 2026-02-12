// API Configuration
// For production: Use the remote server domain
// For local development: Use your computer's local LAN IP (e.g., 192.168.x.x)
// Note: 'localhost' will NOT work on a physical phone.

// You can override this by setting EXPO_PUBLIC_API_URL in your .env file
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://hostshield.org/api'; 
