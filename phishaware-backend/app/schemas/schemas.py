from pydantic import BaseModel
from typing import List

class CheckContentRequest(BaseModel):
    content: str

class PhishingResponse(BaseModel):
    found_in_db: bool
    is_phishing: bool = None
    message: str


class AIResponse(BaseModel):
    is_phishing: bool
    analysis: str
    advice: str
    risk_score: int


class QuestionOut(BaseModel):
    id: int
    level: str
    text: str
    is_phishing : bool
    explanation: str
    url: str

    class Config:
        orm_mode = True