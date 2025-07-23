from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import logging

# Add the parent directory to Python path to import trae_agent
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = FastAPI(title="Trae Agent API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConfigRequest(BaseModel):
    provider: str
    model: str
    api_key: str
    max_steps: int = 10

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Trae Agent API is running"}

@app.post("/api/validate-config")
async def validate_config(config: ConfigRequest):
    try:
        logger.info(f"Validating config for provider: {config.provider}, model: {config.model}")
        
        # Try to import and use trae_agent
        try:
            from trae_agent.utils.config import Config
            from trae_agent.utils.llm_client import get_llm_client
            
            # Create config
            trae_config = Config(
                llm_provider=config.provider,
                llm_model=config.model,
                llm_api_key=config.api_key,
                max_steps=config.max_steps
            )
            
            # Test the client
            client = get_llm_client(trae_config)
            
            logger.info("Config validation successful")
            return {"valid": True, "message": "Configuration is valid"}
            
        except ImportError as e:
            logger.error(f"Import error: {e}")
            # Fallback validation - just check if API key is provided
            if config.api_key and len(config.api_key.strip()) > 0:
                return {"valid": True, "message": "Configuration appears valid (basic validation)"}
            else:
                raise HTTPException(status_code=400, detail="API key is required")
                
    except Exception as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=f"Validation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)