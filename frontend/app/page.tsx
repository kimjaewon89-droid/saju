'use client';
import { useState, useEffect } from 'react'; // 🌟 useEffect 추가
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '', year: 1990, month: 1, day: 1, time: '12:00', gender: '남성',
    categories: [] as string[],
    question: ''
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // 🌟 방문자 통계 상태 추가
  const [stats, setStats] = useState({ today: 0, total: 0 });

  const categories = ['금전운', '연애운', '직장운', '건강운'];

  // 🌟 화면이 처음 켜질 때 백엔드에서 통계를 가져오는 함수
  useEffect(() => {
    fetch(${process.env.NEXT_PUBLIC_API_URL}/api/stats)
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
      const res = await fetch(${process.env.NEXT_PUBLIC_API_URL}/api/saju, {
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
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 relative font-sans">

      {/* 🌟 레퍼런스 스타일의 풀스크린 로딩 애니메이션 */}
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-all duration-300">
          <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-pulse">🔮</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-indigo-900 mb-2 animate-bounce">
              우주의 기운을 읽는 중...
            </h3>
            <p className="text-slate-500 font-medium">명리학 알고리즘이 명식을 분석하고 있습니다</p>
          </div>
        </div>
      )}

      {/* 헤더 타이틀 */}
      <div className="max-w-xl w-full text-center mb-10 mt-8">
        <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">무엇이든 물어보사주</h1>
        <p className="text-slate-500 text-lg">타고난 오행 기운으로 확인하는 프리미엄 운세</p>
      </div>

      {/* 입력 폼 컨테이너 */}
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 p-8 mb-10">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 이름 & 성별 */}
          <div className="flex gap-4">
            <div className="flex-[2]">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">이름</label>
              <input type="text" placeholder="홍길동" required
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">성별</label>
              <select
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                onChange={(e) => setFormData({...formData, gender: e.target.value})}>
                <option value="남성">남성</option>
                <option value="여성">여성</option>
              </select>
            </div>
          </div>

          {/* 생년월일 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">생년월일</label>
            <div className="flex gap-3">
              <input type="number" placeholder="년(YYYY)" required
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} />
              <input type="number" placeholder="월(MM)" required
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})} />
              <input type="number" placeholder="일(DD)" required
                className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-center"
                onChange={(e) => setFormData({...formData, day: parseInt(e.target.value)})} />
            </div>
          </div>

          {/* 태어난 시간 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">태어난 시간</label>
            <input type="time" required
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold p-4 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
              onChange={(e) => setFormData({...formData, time: e.target.value})} />
          </div>

          {/* 운세 항목 선택 (Chips) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">궁금한 운세 항목 (다중 선택)</label>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                    formData.categories.includes(cat)
                      ? 'bg-indigo-600 text-white border-2 border-indigo-600'
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 주관식 질문 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">구체적인 고민거리</label>
            <textarea
              placeholder="예: 올해 이직을 준비 중인데 언제쯤이 좋을까요?"
              className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-bold p-4 rounded-2xl min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              onChange={(e) => setFormData({...formData, question: e.target.value})}
            />
          </div>

          {/* 제출 버튼 */}
          <button type="submit" disabled={loading} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg py-5 px-4 rounded-2xl shadow-lg shadow-indigo-200 transition-transform transform hover:-translate-y-1 active:scale-95">
            명식 분석 시작하기 ✨
          </button>
        </form>
      </div>

      {/* 🌟 밝은 테마에 맞춘 결과 창 렌더링 */}
      {result && (
        <div className="max-w-xl w-full bg-indigo-50/50 rounded-3xl border-2 border-indigo-100 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-6 duration-500">
          {result.startsWith('🚨') ? (
            <div className="text-red-500 font-bold text-lg text-center p-4 bg-red-50 rounded-2xl">{result}</div>
          ) : (
            <>
              <h2 className="text-2xl font-black text-indigo-950 mb-6 border-b-2 border-indigo-100 pb-4 text-center">
                👑 {formData.name || '고객'}님의 운세 결과
              </h2>
              <div className="bg-white p-6 rounded-2xl mb-6 shadow-sm border border-slate-100">
                <ReactMarkdown
                  components={{
                    h3: ({node, ...props}) => <h3 className="text-xl font-black text-indigo-900 mt-6 mb-3" {...props} />,
                    p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-slate-700 text-[1.05rem]" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 space-y-2 mb-6 text-slate-700 text-[1.05rem]" {...props} />,
                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-bold text-indigo-700 bg-indigo-50 px-1 rounded" {...props} />
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            </>
          )}
        </div>
      )}

      {/* 🌟 화면 하단 방문자 통계 뱃지 */}
      <div className="mt-auto pt-8 pb-6 text-slate-500 font-medium text-sm flex gap-4">
        <div className="bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
          🔥 오늘 방문자 <strong className="text-indigo-600 text-base">{stats.today}</strong>명
        </div>
        <div className="bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
          🌟 누적 방문자 <strong className="text-indigo-600 text-base">{stats.total}</strong>명
        </div>
      </div>

    </main>
  );
}