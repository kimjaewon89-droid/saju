from sqlalchemy import Column, Integer, String, Date
from database import Base
from datetime import date

class VisitorLog(Base):
    __tablename__ = "visitor_logs"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, index=True)      # 접속자 IP
    visit_date = Column(Date, default=date.today) # 접속 날짜 (기본값: 오늘)
    visit_count = Column(Integer, default=1)      # 오늘 접속 횟수 (기본값: 1)