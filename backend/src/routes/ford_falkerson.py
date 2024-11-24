from src.services.ford_falkerson_service import ford_falkerson_service
from src.schemas.ford_falkerson_schema import (
    FordFalkersonRequestSchema,
    FordFalkersonResponseSchema,
)
from fastapi import APIRouter


router = APIRouter()


@router.post("/ford_falkerson/")
async def ford_falkerson(
    request: FordFalkersonRequestSchema,
) -> FordFalkersonResponseSchema:
    print(request)
    max_flow, result = ford_falkerson_service(
        capacity=request.capacity,
        source=request.source,
        sink=request.sink,
    )

    return FordFalkersonResponseSchema(max_flow=max_flow, result=result)
