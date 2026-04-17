from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 변경 전: SQLALCHEMY_DATABASE_URL = "postgresql://saju_user..."
# 변경 후: 클라우드(Render)에서 주는 DB 주소를 환경변수로 읽어옵니다.
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(SQLALCHEMY_DATABASE_URL)

# 세션 생성기 (DB에 쿼리를 날릴 때 사용하는 창구)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 모델의 기본 클래스
Base = declarative_base()

# DB 세션을 가져오고 반환하는 의존성 주입 함수
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()