# Simple Server-Side Storage Setup

## Overview

This project now supports **simple file-based server storage** for global configuration and category CSV files. All data is shared globally across all users/sessions.

## How It Works

1. **Global Config**: Stored in `.server-data/config.json` on the server
2. **Category CSVs**: Stored in `.server-data/csv/` directory on the server
3. **All Users See Same Data**: When any user saves settings or uploads a CSV, all other users will see the updated data when they refresh

## Quick Start

### 1. Install Dependencies

```bash
npm install
npm install -D nodemon  # Optional, for auto-restart during development
```

### 2. Start the Server

```bash
# Production mode
node server-simple.js

# Development mode (with auto-restart)
npx nodemon server-simple.js
```

Server will run on `http://localhost:3001`

### 3. Start the Frontend (in another terminal)

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Access the App

- Open `http://localhost:3001` in your browser
- The frontend is served from the server
- All configuration and CSV files are stored on the server

## Directory Structure

```
.server-data/
├── config.json          # Global configuration file
└── csv/                 # Category CSV files
    ├── Electronics.csv
    ├── Fashion.csv
    └── ...
```

## API Endpoints (Simple)

### Config Management

```
GET  /config              → Read global config
POST /config              → Save global config
```

### CSV Management

```
GET    /csv/:category     → Read CSV for category
POST   /csv/:category     → Save/Upload CSV for category
DELETE /csv/:category     → Delete CSV for category
```

### Health Check

```
GET /health               → Check if server is running
```

## Usage Examples

### Load Config on App Start

When the app starts, it automatically loads the config from the server:

```typescript
import { loadConfigFromServer } from "@/lib/server-storage";

const config = await loadConfigFromServer();
```

### Save Config

When Admin saves settings, they're saved to the server:

```typescript
import { saveConfigToServer } from "@/lib/server-storage";

const success = await saveConfigToServer(settings);
```

### Upload CSV for Category

When Admin uploads a CSV, it's saved to the server:

```typescript
import { saveCsvToServer } from "@/lib/server-storage";

const success = await saveCsvToServer("Electronics", csvContent);
```

## Features

✅ **Global Configuration**: All users see the same settings
✅ **Category CSV Upload**: Upload and replace CSV files for each category
✅ **Persistent Storage**: Data survives server restarts
✅ **Simple**: No complex API, just direct file operations
✅ **Easy to Backup**: Just copy the `.server-data/` directory

## Deployment

### Option 1: Single Server (Recommended)

Deploy to a platform that supports Node.js:
- Railway
- Render
- Heroku
- DigitalOcean App Platform
- AWS EC2

The server serves both the frontend (from `dist/`) and the backend API.

### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
COPY server-simple.js ./
EXPOSE 3001
CMD ["node", "server-simple.js"]
```

Build and run:
```bash
docker build -t thaideals .
docker run -p 3001:3001 -v thaideals-data:/app/.server-data thaideals
```

## Backup & Restore

### Backup

```bash
cp -r .server-data/ .server-data.backup/
```

### Restore

```bash
rm -rf .server-data/
cp -r .server-data.backup/ .server-data/
```

## Troubleshooting

### "Cannot connect to server"

1. Ensure server is running: `node server-simple.js`
2. Check port 3001 is available: `lsof -i :3001`
3. Check firewall settings

### "Settings not saving"

1. Check `.server-data/` directory exists and is writable
2. Check server logs for errors
3. Verify `config.json` is valid JSON

### "CSV upload fails"

1. Ensure CSV file size is reasonable
2. Check `.server-data/csv/` directory exists and is writable
3. Verify category name is valid

## Production Considerations

For production deployments, consider:

- Use environment variables for configuration
- Implement authentication for Admin Panel
- Add rate limiting
- Use HTTPS/TLS
- Implement backup strategy
- Monitor disk space
- Set up logging
- Use a process manager (PM2, systemd, etc.)

## Support

Check the server logs for detailed error messages:

```bash
# Run with verbose output
DEBUG=* node server-simple.js
```

Check browser console (F12) for frontend errors.
