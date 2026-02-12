# Mobile App - API Connection Update

## Changes Made

### 1. Updated API Configuration
- **File**: `src/config.js`
- **Change**: Updated API URL from hardcoded IP (`http://167.86.78.26:3000/api`) to production server (`https://hostshield.org/api`)
- **Environment Variable Support**: You can now override the API URL using `EXPO_PUBLIC_API_URL` in a `.env` file

### 2. Environment Configuration
- **File**: `.env.example`
- **Purpose**: Documents how to configure the API URL for different environments
- **Usage**: 
  - For production: Use default `https://hostshield.org/api`
  - For local development: Create a `.env` file and set `EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api`

## How to Use

### Production (Default)
The app is now configured to connect to the production API server at `https://hostshield.org/api` by default. No additional configuration needed.

### Local Development
If you want to test against a local API server:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your local IP:
   ```
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
   ```
   (Replace `192.168.1.100` with your computer's actual local IP address)

3. Restart the Expo development server

### Important Notes
- **Never use `localhost`** on physical devices - it won't work!
- Use your computer's **local network IP** (e.g., `192.168.x.x` or `10.0.x.x`)
- The production server uses **HTTPS**, local development typically uses **HTTP**

## API Endpoints Used

The mobile app uses the following API endpoints (all relative to the base URL):

### Authentication
- `POST /auth/login` - User login
  - Request: `{ email, password }`
  - Response: `{ success, accessToken, host }`

### OCR & Guest Management
- `POST /ocr/scan` - Scan passport/ID document
  - Request: FormData with `document` file
  - Response: `{ success, data: { guest info } }`

- `POST /guests/save` - Save guest information
  - Request: Guest data object
  - Response: `{ success }`

- `GET /guests` - Get all guests
  - Response: `{ success, guests: [...] }`

- `POST /guests/register` - Submit guest to police
  - Request: `{ guestId }`
  - Response: `{ success }`

All authenticated requests include the `Authorization: Bearer <token>` header.

## Testing the Connection

1. Start the mobile app:
   ```bash
   cd /Users/boris/git-repos/host-shield/apps/mobile-app
   npm start
   ```

2. Try logging in with your credentials

3. If you encounter connection issues:
   - Check that `https://hostshield.org` is accessible
   - Verify your credentials are correct
   - Check the Expo console for detailed error messages

## Troubleshooting

### "Network Error" on Login
- Verify the API server is running and accessible
- Check if you're using the correct URL (HTTPS for production)
- Ensure your device has internet connectivity

### "Connection Refused"
- If using local development, verify your local IP address is correct
- Make sure the API server is running on the expected port
- Check firewall settings aren't blocking the connection

### SSL/Certificate Errors
- Production uses HTTPS with valid SSL certificates
- If you see SSL errors, the server configuration may need attention
