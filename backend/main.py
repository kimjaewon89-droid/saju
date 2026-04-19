import os
from datetime import date, datetime
from typing import List, Optional

from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

import google.generativeai as genai
from korean_lunar_calendar import KoreanLunarCalendar

# DB 관련 모듈
import database
import models
from database import get_db



# 환경 변수 로드
load_dotenv()

# DB 테이블 자동 생성 (서버 켜질 때 모델을 보고 테이블을 만듭니다)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="무엇이든 물어보사주 API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 일단 모든 도메인 허용 (나중에 Vercel 주소만 넣는 것이 가장 안전합니다)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Gemini API 초기화
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash-lite')


class UserInfo(BaseModel):
    name: str
    year: int
    month: int
    day: int
    time: str
    gender: str
    categories: List[str]
    question: Optional[str] = None


# 🌟 시주(시간의 간지)를 정확히 계산하는 함수
def get_time_pillar(day_stem: str, time_str: str) -> str:
    hour, minute = map(int, time_str.split(':'))
    total_minutes = hour * 60 + minute

    # 1. 지지 판별
    branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]
    if total_minutes < 90 or total_minutes >= 1410:
        branch_idx = 0
    elif total_minutes < 210:
        branch_idx = 1
    elif total_minutes < 330:
        branch_idx = 2
    elif total_minutes < 450:
        branch_idx = 3
    elif total_minutes < 570:
        branch_idx = 4
    elif total_minutes < 690:
        branch_idx = 5
    elif total_minutes < 810:
        branch_idx = 6
    elif total_minutes < 930:
        branch_idx = 7
    elif total_minutes < 1050:
        branch_idx = 8
    elif total_minutes < 1170:
        branch_idx = 9
    elif total_minutes < 1290:
        branch_idx = 10
    else:
        branch_idx = 11

    # 2. 천간 계산
    stems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
    day_stem_idx = stems.index(day_stem)

    start_stem_idx = ((day_stem_idx % 5) * 2) % 10
    time_stem_idx = (start_stem_idx + branch_idx) % 10

    return stems[time_stem_idx] + branches[branch_idx]


@app.post("/api/saju")
async def get_saju_fortune(request: Request, user: UserInfo, db: Session = Depends(get_db)):
    try:
        # ==========================================
        # 🛡️ [운영/방어 체계] IP 추적 및 횟수 제한
        # ==========================================
        client_ip = request.client.host
        today_date = date.today()

        # DB에서 이 IP가 오늘 접속한 기록 조회
        visitor = db.query(models.VisitorLog).filter(
            models.VisitorLog.ip_address == client_ip,
            models.VisitorLog.visit_date == today_date
        ).first()

        if visitor:
            # 기록이 있다면 횟수 확인 (3회 제한)
            if visitor.visit_count >= 100:
                return {"status": "error", "message": "오늘 우주의 기운을 모두 소진하셨습니다. (일일 최대 3회 제한) 내일 다시 찾아주세요!"}
            visitor.visit_count += 1
        else:
            # 오늘 처음 온 IP라면 새로 기록
            new_visitor = models.VisitorLog(ip_address=client_ip, visit_date=today_date, visit_count=1)
            db.add(new_visitor)

        db.commit()  # 변경사항 저장

        # ==========================================
        # 🔮 [명리학 로직] 사주 및 일진 계산
        # ==========================================
        # 1. 시간 입력값 검증
        if not user.time or ':' not in user.time:
            return {"status": "error", "message": "태어난 시간을 정확히 입력해주세요. (예: 12:00)"}

        # 2. 내 사주(원국) 계산
        calendar = KoreanLunarCalendar()
        is_valid_date = calendar.setSolarDate(user.year, user.month, user.day)

        if not is_valid_date:
            return {"status": "error", "message": "달력에 존재하지 않는 날짜입니다. 생년월일을 다시 확인해주세요."}

        korean_gapja = calendar.getGapJaString()
        gapja_parts = korean_gapja.split(' ')

        if len(gapja_parts) < 3:
            return {"status": "error", "message": "명식 변환에 실패했습니다."}

        day_pillar = gapja_parts[2][:2]
        day_stem = day_pillar[0]

        # 3. 내 시주 계산 및 4주 8자 완성
        time_pillar = get_time_pillar(day_stem, user.time)
        full_saju = f"{gapja_parts[0]} {gapja_parts[1]} {day_pillar}일 {time_pillar}시"

        # 4. 오늘의 간지(일진) 계산
        today = datetime.now()
        today_calendar = KoreanLunarCalendar()
        today_calendar.setSolarDate(today.year, today.month, today.day)
        today_gapja = today_calendar.getGapJaString()
        today_date_str = f"{today.year}년 {today.month}월 {today.day}일"

        category_str = ", ".join(user.categories) if user.categories else "전반적인 운세"
        question_part = f"\n[고객의 구체적 질문]\n{user.question}" if user.question else ""

        # ==========================================
        # 🤖 [AI 로직] 프롬프트 및 LLM 호출
        # ==========================================
        prompt = f"""
        당신은 20년 경력의 명리학자이자 팩트를 기반으로 조언하는 현실적인 상담가입니다. 
        다음 고객의 타고난 기운이 어떤지 설명하고 '오늘의 운세'를 답변해주세요.
        예를 들면 오늘의 어떠한 특이사항이 있고 어떠한 기운이 있는지 등
        사주명식과 간지는 굳이 언급하지 않아도 돼

        [고객 정보 및 확정된 🌟내 사주 8자]
        - 이름: {user.name} / 성별: {user.gender}
        - 타고난 사주팔자(원국): {full_saju}

        [🌟오늘의 운세 기준 데이터]
        - 오늘 날짜: {today_date_str}
        - 오늘의 간지(일진): {today_gapja}

        [핵심 상담 항목]: {category_str}
        {question_part}

        [출력 포맷 및 가독성 규칙]
        1. 마크다운(Markdown) 문법을 적극 활용하여 시각적으로 깔끔하게 구조화하세요.
        2. 대주제가 바뀔 때마다 반드시 `###` (H3 태그)를 사용하여 소제목을 달아주세요.
        3. 소제목 아래의 본문은 2~3문장 단위로 짧게 끊고, 문단과 문단 사이에는 반드시 '빈 줄(Empty Line)'을 넣어 여백을 확보하세요.
        4. 특징을 나열하거나 여러 조언을 할 때는 줄글로 쓰지 말고, 반드시 글머리 기호(`-` 또는 `*`)를 사용해 리스트 형태로 작성하세요.
        5. 핵심 키워드나 특히 주의해야 할 점은 **굵게(Bold)** 처리하여 강조하세요.
        6. 모든 답변은 초등학생도 이해 할 수 있을정도로 쉽게 설명하세요 아주 중요

        [요청 사항]
        1. 사주와 오늘의 기운: 타고난 사주({full_saju})와 오늘의 기운({today_gapja})이 만나 어떤 시너지를 내거나 충돌하는지 초등학생도 이해할 정도로 명확하고 쉽게 설명하세요.
        2. 핵심 항목 분석: 선택된 운세 항목({category_str})에 대해 '오늘 하루' 동안 일어날 수 있는 구체적이고 현실적인 조언을 제공하세요.
        3. 질문 답변: 구체적인 질문이 있다면, 사례를 들어서 초등학생도 이해할 수 있을 정도로 쉽게 설명하세요.
        4. 상담의 온도: 전체적으로 신뢰감 있고 희망적인 어조를 유지하되, 무조건적인 덕담은 배제하세요. 좋은 것과 주의할 것의 비율은 8:2로 진행하세요.
        """

        response = model.generate_content(prompt)
        return {"status": "success", "data": response.text}

    except Exception as e:
        return {"status": "error", "message": f"서버 오류: {str(e)}"}


# ==========================================
# 📊 [통계 API] 방문자 데이터 확인
# ==========================================
@app.get("/api/stats")
def get_visitor_stats(db: Session = Depends(get_db)):
    today_date = date.today()

    # 1. 오늘 방문자 수
    today_visitors = db.query(models.VisitorLog).filter(models.VisitorLog.visit_date == today_date).count()

    # 2. 누적 방문자 수 (고유 IP 개수 기준)
    total_visitors = db.query(models.VisitorLog.ip_address).distinct().count()

    return {
        "status": "success",
        "data": {
            "today_visitors": today_visitors,
            "total_visitors": total_visitors
        }
    }
