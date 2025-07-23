# Development Setup Guide

## Prerequisites

Make sure you have the following installed:
- Python 3.12+
- Node.js 18+
- Redis (for session management)

## Step-by-Step Setup

### 1. Install Redis (Required for Backend)

**On macOS:**
```bash
brew install redis
brew services start redis
```

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

**On Windows:**
```bash
# Use Docker for Redis
docker run -d -p 6379:6379 redis:7-alpine
```

### 2. Setup Python Backend

Open **Terminal 1** for the backend:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install trae-agent in development mode
cd ..
pip install -e .
cd backend

# Create workspace directory
mkdir -p workspace

# Run the backend server
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend will be available at: http://localhost:8000

### 3. Setup Next.js Frontend

Open **Terminal 2** for the frontend:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at: http://localhost:3000

### 4. Test the Application

1. Open your browser and go to http://localhost:3000
2. Go to the "Config" tab
3. Configure your LLM provider:
   - Select provider (OpenAI, Anthropic, Google, etc.)
   - Enter your API key
   - Choose a model
   - Click "Validate Configuration"
4. Go to the "Chat" tab
5. Start chatting with the agent!

## Environment Variables (Optional)

Create a `.env` file in the backend directory:

```env
# Optional: Set default API keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
OPENROUTER_API_KEY=your_openrouter_key
```

## Troubleshooting

### Backend Issues:
- **Redis Connection Error**: Make sure Redis is running
- **Import Error**: Make sure trae-agent is installed with `pip install -e .`
- **Port 8000 in use**: Change port in uvicorn command

### Frontend Issues:
- **Port 3000 in use**: Next.js will automatically use port 3001
- **API Connection Error**: Make sure backend is running on port 8000
- **WebSocket Connection Failed**: Check if backend WebSocket endpoint is accessible

### Common Issues:
- **CORS Errors**: The backend is configured to allow localhost:3000
- **API Key Validation Fails**: Check your API key and internet connection
- **File Operations Fail**: Make sure the workspace directory exists and is writable

## Development Tips

1. **Hot Reload**: Both servers support hot reload - changes will be reflected automatically
2. **Logs**: Check both terminal windows for error messages
3. **API Testing**: You can test the backend API directly at http://localhost:8000/docs
4. **WebSocket Testing**: Use browser dev tools to monitor WebSocket connections

## Production Deployment

For production, use Docker Compose:
```bash
docker-compose up --build
```