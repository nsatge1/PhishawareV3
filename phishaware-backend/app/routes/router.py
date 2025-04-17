from fastapi import APIRouter, Depends, HTTPException, Query
from models.phishing import Phishing
from schemas.schemas import CheckContentRequest, PhishingResponse, AIResponse, QuestionOut
from services.services import check_database, ai_phishing_analysis
from sqlalchemy.orm import Session
from config.database import get_db
from models.quiz import Question
import random

router = APIRouter()
@router.post("/check-phishing/", response_model=PhishingResponse)
def check_phishing(request: CheckContentRequest, db=Depends(get_db)):
    content = request.content
    match = check_database(content, db)  
    
    if match:
        record = match["record"]  
        similarity = match["similarity"]  

        is_phishing = bool(record.is_phishing)
        message = f"⚠️ This is a known phishing attempt! (Similarity: {similarity:.2f})" if is_phishing else "✅ This content is safe."

        return {"found_in_db": True, "is_phishing": is_phishing, "message": message}

    return {"found_in_db": False, "message": "Content not found in DB"}

@router.post("/add-phishing/")
def add_phishing_entry(request: CheckContentRequest, is_phishing: bool, db=Depends(get_db)):
    """Manually add phishing data"""
    record = Phishing(content=request.content, is_phishing=is_phishing)
    db.add(record)
    db.commit()  
    return {"message": "Content added successfully!"}

@router.post("/ai-phishing-analysis/", response_model=AIResponse)
def ai_analyze_phishing(request: CheckContentRequest):
    """Endpoint for AI-based phishing analysis"""
    ai_result = ai_phishing_analysis(request.content)
    return ai_result


@router.get("/quiz/random", response_model=QuestionOut)
def get_random_phishing_question(
    level: str = Query(None, description="Niveau de la question (facile, moyen, difficile)"),
    db: Session = Depends(get_db)
):
    if level:
        questions = db.query(Question).filter(Question.level == level).all()
    else:
        questions = db.query(Question).all()

    if not questions:
        raise HTTPException(status_code=404, detail="No questions found.")

    question = random.choice(questions)
    return question