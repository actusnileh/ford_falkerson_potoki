from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import routes


def create_app() -> FastAPI:
    app = FastAPI(title="Ford Falkerson", debug=True)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
    )

    app.include_router(routes)

    return app
