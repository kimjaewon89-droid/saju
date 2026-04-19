'use client';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '', year: 1990, month: 1, day: 1, time: '12:00', gender: '남성',
    categories: [] as string[],
    question: ''
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({ today: 0, total: 0 });

  const categories = ['금전운', '연애운', '직장운', '건강운'];

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats`)
      .then(res => res.json())
      .then(data => {
        if(data.status === 'success') {
          setStats({ today: data.data.today_visitors, total: data.data.total_visitors });
        }
      })
      .catch(err => console.log("통계 불러오기 실패", err));
  }, []);

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saju`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.status === 'error') {
        setResult(`🚨 분석 실패: ${data.message}`);
      } else {
        setResult(data.data);
      }
    } catch (error) {
      setResult('🚨 서버와 연결할 수 없습니다. 백엔드가 켜져 있는지 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-4 relative font-sans overflow-hidden">

      {/* 🌟 꽉 차는 배경 이미지 레이어 (이전에 만든 세모 패턴 황금 배경) */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/background_final.png')`
        }}
      />

      {/* 🌟 모든 콘텐츠를 감싸는 상위 레이어 */}
      <div className="w-full max-w-4xl z-10 flex flex-col items-center">

        {/* 로딩 애니메이션 (빨간색/황토색 톤으로 변경) */}
        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all duration-300">
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 border-4 border-amber-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl animate-pulse">🔮</span>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-red-900 mb-2 animate-bounce">
                우주의 기운을 읽는 중...
              </h3>
              <p className="text-amber-800 font-medium">명리학 알고리즘이 명식을 분석하고 있습니다</p>
            </div>
          </div>
        )}

        <div className="max-w-xl w-full text-center mb-10 mt-8">
          <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight drop-shadow-md">무엇이든 물어보saju</h1>
          <p className="text-slate-800 font-bold text-lg drop-shadow-sm">내가 궁금한 것을 물어보는 프리미엄 사주</p>
        </div>

        {/* 🌟 폼 컨테이너 */}
        <div className="max-w-xl w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 p-8 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="flex gap-4">
              <div className="flex-[2]">
                <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">이름</label>
                {/* 🌟 누런색(bg-amber-50) 입력 필드 & 클릭 시 빨간색 테두리(focus:ring-red-600) */}
                <input type="text" placeholder="홍길동" required
                  className="w-full bg-amber-50/80 border border-amber-200 text-amber-950 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 transition-all placeholder:text-amber-300"
                  onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">성별</label>
                <select
                  className="w-full bg-amber-50/80 border border-amber-200 text-amber-950 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-pointer"
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">생년월일</label>
              <div className="flex gap-3">
                <input type="number" placeholder="년(YYYY)" required
                  className="w-full bg-amber-50/80 border border-amber-200 text-amber-950 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 transition-all text-center placeholder:text-amber-300"
                  onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} />
                <input type="number" placeholder="월(MM)" required
                  className="w-full bg-amber-50/80 border border-amber-200 text-amber-950 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 transition-all text-center placeholder:text-amber-300"
                  onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})} />
                <input type="number" placeholder="일(DD)" required
                  className="w-full bg-amber-50/80 border border-amber-200 text-amber-950 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 transition-all text-center placeholder:text-amber-300"
                  onChange={(e) => setFormData({...formData, day: parseInt(e.target.value)})} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">태어난 시간</label>
              <input type="time" required
                className="w-full bg-amber-50/80 border border-amber-200 text-amber-950 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 transition-all cursor-pointer"
                onChange={(e) => setFormData({...formData, time: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">궁금한 운세 항목 (다중 선택)</label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                    // 🌟 선택 시 빨간색 바탕으로 변경
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                      formData.categories.includes(cat)
                        ? 'bg-red-600 text-white border-2 border-red-600'
                        : 'bg-white border-2 border-amber-200 text-amber-800 hover:bg-amber-50 hover:border-amber-300'
                    }`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-amber-900 mb-2 ml-1">구체적인 고민거리</label>
              <textarea
                placeholder="예: 올해 이직을 준비 중인데 언제쯤이 좋을까요?"
                className="w-full bg-amber-50/80 border border-amber-200 text-amber-950 font-bold p-4 rounded-2xl min-h-[120px] outline-none focus:ring-2 focus:ring-red-600 transition-all resize-none placeholder:text-amber-300"
                onChange={(e) => setFormData({...formData, question: e.target.value})}
              />
            </div>

            {/* 🌟 명식 분석 시작 버튼 (강렬한 빨간색) */}
            <button type="submit" disabled={loading} className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg py-5 px-4 rounded-2xl shadow-lg shadow-red-200 transition-transform transform hover:-translate-y-1 active:scale-95">
              명식 분석 시작하기 ✨
            </button>
          </form>
        </div>

        {/* 🌟 결과 창 (황토색 톤 유지) */}
        {result && (
          <div className="max-w-xl w-full bg-[#fdfbf7]/95 backdrop-blur-md rounded-3xl border-2 border-amber-200 p-8 shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-500">
            {result.startsWith('🚨') ? (
              <div className="text-red-600 font-bold text-lg text-center p-4 bg-red-50 rounded-2xl">{result}</div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-red-950 mb-6 border-b-2 border-amber-200 pb-4 text-center">
                  👑 {formData.name || '고객'}님의 운세 결과
                </h2>
                <div className="bg-white/95 p-6 rounded-2xl mb-6 shadow-sm border border-amber-100">
                  <ReactMarkdown
                    components={{
                      h3: ({node, ...props}) => <h3 className="text-xl font-black text-red-900 mt-6 mb-3" {...props} />,
                      p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-amber-950 text-[1.05rem]" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-2 mb-6 text-amber-950 text-[1.05rem]" {...props} />,
                      li: ({node, ...props}) => <li className="pl-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-red-700 bg-amber-100/50 px-1 rounded" {...props} />
                    }}
                  >
                    {result}
                  </ReactMarkdown>
                </div>
              </>
            )}
          </div>
        )}

        {/* 🌟 하단 통계 뱃지 */}
        <div className="mt-auto pt-8 pb-6 text-amber-900 font-bold text-sm flex gap-4">
          <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-amber-200 shadow-md flex items-center gap-2">
            🔥 오늘 방문자 <strong className="text-red-600 text-base">{stats.today}</strong>명
          </div>
          <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border border-amber-200 shadow-md flex items-center gap-2">
            🌟 누적 방문자 <strong className="text-red-600 text-base">{stats.total}</strong>명
          </div>
        </div>

      </div>
    </main>
  );
}