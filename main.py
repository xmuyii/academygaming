"""Root entrypoint for production deployments (Railway / Docker / Uvicorn)."""
from phase4.app.main import app

__all__ = ["app"]
