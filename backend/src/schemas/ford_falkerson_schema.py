from pydantic import BaseModel, Field


class FordFalkersonRequestSchema(BaseModel):
    capacity: list[list[int]]
    source: int = Field(..., ge=0)
    sink: int = Field(..., ge=0)


class FordFalkersonResponseSchema(BaseModel):
    max_flow: float
    result: list[str]
