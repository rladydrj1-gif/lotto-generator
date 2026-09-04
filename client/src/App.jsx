import React, { useState, useEffect } from 'react';
import LottoBall from './components/LottoBall';
import NumberSelector from './components/NumberSelector';
import StatsViewer from './components/StatsViewer';
import GameResultCard from './components/GameResultCard';
import { generateFiveGames } from './utils/lotto';
import {
  Sparkles,
  Dices,
  RotateCcw,
  ExternalLink,
  Calendar,
  Layers,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export default function App() {
  const [latestRoundInfo, setLatestRoundInfo] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [selectedRoundCount, setSelectedRoundCount] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User constraints
  const [fixedNumbers, setFixedNumbers] = useState([]);
  const [excludedNumbers, setExcludedNumbers] = useState([]);

  // Generated 5 games
  const [generatedGames, setGeneratedGames] = useState([]);

  // Fetch stats and latest info
  const fetchStats = async (count = selectedRoundCount) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/lotto/stats?count=${count}`);
      if (!res.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
      const data = await res.json();
      if (data.success) {
        setStatsData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatest = async () => {
    try {
      const res = await fetch('/api/lotto/latest');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setLatestRoundInfo(data.data);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch latest round info', e);
    }
  };

  useEffect(() => {
    fetchLatest();
    fetchStats(selectedRoundCount);
  }, []);

  const handleSelectRoundCount = (count) => {
    setSelectedRoundCount(count);
    fetchStats(count);
  };

  // Toggle Fixed Numbers (max 5)
  const handleToggleFixed = (num) => {
    if (fixedNumbers.includes(num)) {
      setFixedNumbers(fixedNumbers.filter(n => n !== num));
    } else {
      if (fixedNumbers.length >= 5) {
        alert('고정 번호는 최대 5개까지만 선택할 수 있습니다.');
        return;
      }
      // Remove from excluded if present
      if (excludedNumbers.includes(num)) {
        setExcludedNumbers(excludedNumbers.filter(n => n !== num));
      }
      setFixedNumbers([...fixedNumbers, num].sort((a, b) => a - b));
    }
  };

  // Toggle Excluded Numbers (max 10)
  const handleToggleExcluded = (num) => {
    if (excludedNumbers.includes(num)) {
      setExcludedNumbers(excludedNumbers.filter(n => n !== num));
    } else {
      if (excludedNumbers.length >= 10) {
        alert('제외 번호는 최대 10개까지만 선택할 수 있습니다.');
        return;
      }
      // Remove from fixed if present
      if (fixedNumbers.includes(num)) {
        setFixedNumbers(fixedNumbers.filter(n => n !== num));
      }
      setExcludedNumbers([...excludedNumbers, num].sort((a, b) => a - b));
    }
  };

  const handleResetFilters = () => {
    setFixedNumbers([]);
    setExcludedNumbers([]);
  };

  // Generate 5 Games
  const handleGenerate = () => {
    if (!statsData || !statsData.stats) return;
    const games = generateFiveGames(statsData.stats, fixedNumbers, excludedNumbers);
    setGeneratedGames(games);
  };

  // Auto-generate on initial data load
  useEffect(() => {
    if (statsData && statsData.stats && generatedGames.length === 0) {
      const initialGames = generateFiveGames(statsData.stats, [], []);
      setGeneratedGames(initialGames);
    }
  }, [statsData]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Banner & Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center shadow-md">
              <Dices className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                <span>로또 6/45 스마트 생성기</span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  통계 가중치 엔진
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                동행복권 실시간 당첨 통계 기반 비복원 가중치 확률 추첨
              </p>
            </div>
          </div>

          {/* Latest Round Badge in Header */}
          {latestRoundInfo && (
            <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700/60">
              <div className="text-right">
                <div className="text-xs font-bold text-amber-400">
                  제 {latestRoundInfo.drwNo}회 당첨결과
                </div>
                <div className="text-[11px] text-slate-400">
                  {latestRoundInfo.drwNoDate} 추첨
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[
                  latestRoundInfo.drwtNo1,
                  latestRoundInfo.drwtNo2,
                  latestRoundInfo.drwtNo3,
                  latestRoundInfo.drwtNo4,
                  latestRoundInfo.drwtNo5,
                  latestRoundInfo.drwtNo6
                ].map(n => (
                  <LottoBall key={`top-latest-${n}`} number={n} size="sm" />
                ))}
                <span className="text-slate-400 font-bold px-0.5">+</span>
                <LottoBall number={latestRoundInfo.bnusNo} size="sm" />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Ball Color Legend */}
        <div className="bg-white rounded-xl p-3.5 shadow-2xs border border-slate-200/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <span>공식 로또 볼 색상:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FBC400] shadow-xs"></span> 1~10 노랑
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3.5 h-3.5 rounded-full bg-[#69C8F2] shadow-xs"></span> 11~20 파랑
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3.5 h-3.5 rounded-full bg-[#FF7272] shadow-xs"></span> 21~30 빨강
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3.5 h-3.5 rounded-full bg-[#AAAAAA] shadow-xs"></span> 31~40 회색
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-3.5 h-3.5 rounded-full bg-[#B0D840] shadow-xs"></span> 41~45 초록
            </span>
          </div>
        </div>

        {/* Generate Action Hero Bar */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-indigo-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>가중치 무작위 비복원 추출 모델</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              통계 기반 5게임 원클릭 자동 생성
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl">
              최근 {selectedRoundCount}회차 동안 자주 출현한 번호일수록 더 높은 확률 가중치가 부여되며, 사용자가 설정한 고정 번호 및 제외 번호 규칙이 100% 엄격하게 적용됩니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-8 py-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-lg hover:shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 text-slate-950 fill-current" />
              <span>5게임 생성하기</span>
            </button>
          </div>

          {/* Decorative background shapes */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute left-1/2 -top-20 w-48 h-48 rounded-full bg-indigo-500/30 blur-3xl pointer-events-none" />
        </div>

        {/* Section 1: 5 Games Recommendation Result */}
        <section id="results">
          <GameResultCard
            games={generatedGames}
            fixedNumbers={fixedNumbers}
            onRegenerate={handleGenerate}
            latestRound={latestRoundInfo?.drwNo}
          />
        </section>

        {/* Section 2: Fixed / Excluded Number Customizer */}
        <section id="customizer">
          <NumberSelector
            fixedNumbers={fixedNumbers}
            excludedNumbers={excludedNumbers}
            onToggleFixed={handleToggleFixed}
            onToggleExcluded={handleToggleExcluded}
            onReset={handleResetFilters}
          />
        </section>

        {/* Section 3: Statistics Viewer */}
        <section id="stats">
          {loading ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600">동행복권 최근 당첨 통계를 불러오는 중입니다...</p>
            </div>
          ) : statsData ? (
            <StatsViewer
              stats={statsData.stats}
              hotNumbers={statsData.hotNumbers}
              coldNumbers={statsData.coldNumbers}
              roundRange={statsData.roundRange}
              analyzedCount={statsData.analyzedRoundsCount}
              onSelectRoundCount={handleSelectRoundCount}
              selectedRoundCount={selectedRoundCount}
            />
          ) : null}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-400 py-6 border-t border-slate-200">
        <p>로또 6/45 통계 기반 스마트 생성기 · 동행복권 공개 데이터 기반</p>
        <p className="mt-1 text-[11px] text-slate-400">
          본 서비스에서 제공하는 번호는 통계 분석 및 가중치 확률 기반 추천이며 당첨을 보장하지 않습니다.
        </p>
      </footer>
    </div>
  );
}
