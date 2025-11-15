# Port Configuration

## Current Port Setup

To avoid conflicts, the services are configured to use different ports:

- **Frontend (Next.js)**: Port `3000`
- **Backend API**: Port `3001` 
- **AI Fraud Detection Service**: Port `5000`
- **Hardhat Node**: Port `8545`

## Environment Variables

Make sure your environment variables are set correctly:

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Backend (backend/.env)
```env
PORT=3001
FRAUD_DETECTION_SERVICE_URL=http://localhost:5000
```

## If You Need to Change Ports

### Change Backend Port
1. Update `backend/.env`: `PORT=3001` (or your preferred port)
2. Update `backend/src/index.ts`: `const PORT = process.env.PORT || 3001;`
3. Update `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

### Change Frontend Port
1. Update `package.json` scripts or use: `npm run dev -- -p 3002`
2. Or create `next.config.js` with custom port configuration

## Troubleshooting Port Conflicts

If you get "EADDRINUSE" errors:

1. **Find what's using the port:**
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/Mac
   lsof -i :3000
   ```

2. **Kill the process** (Windows):
   ```bash
   taskkill /PID <process_id> /F
   ```

3. **Or change the port** in the service configuration

