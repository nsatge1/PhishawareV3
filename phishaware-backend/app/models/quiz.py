
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from config.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String, index=True)
    text = Column(String)
    is_phishing = Column(Boolean)
    explanation = Column(String)
    url = Column(String)