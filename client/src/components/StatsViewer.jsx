import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { TrendingUp, Award, Zap, Flame, Snowflake, BarChart3 } from 'lucide-react';

export default function StatsViewer({
  stats,
  hotNumbers,
  coldNumbers,
  roundRange,
  analyzedCount,
  onSelectRoundCount,
  selectedRoundCount
}) {
  const [viewTab, setViewTab] = useState('heatmap'); // 'heatmap' or 'ranking'

  // Max count for percentage bar
  const maxCount = stats && stats.length > 0
    ? Math.max(...stats.map(s => s.count))
    : 10;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              최근 {analyzedCount}회차 당첨 빈도 통계 분석
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            동행복권 {roundRange?.oldest}회 ~ {roundRange?.latest}회차 (총 {analyzedCount}회) 데이터 기반 번호별 출현 횟수 및 가중치
          </p>
        </div>

        {/* Round Filter selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <span className="text-xs text-slate-500 px-2 font-medium">분석 회차:</span>
          {[20, 30, 50].map(cnt => (
            <button
              key={`round-cnt-${cnt}`}
              onClick={() => onSelectRoundCount(cnt)}
              className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${
                selectedRoundCount === cnt
                  ? 'bg-white text-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              최근 {cnt}회
            </button>
          ))}
        </div>
      </div>

      {/* Hot & Cold Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Hot Numbers */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-orange-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 bg-orange-500 text-white rounded-lg">
              <Flame className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-orange-950">
              🔥 자주 나온 번호 (Hot Numbers TOP 5)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {hotNumbers.slice(0, 5).map((item, idx) => (
              <div key={`hot-${item.number}`} className="flex items-center gap-2 bg-white/90 px-2.5 py-1.5 rounded-xl border border-orange-100 shadow-xs">
                <span className="text-xs font-black text-orange-500 w-3">{idx + 1}</span>
                <LottoBall number={item.number} size="sm" />
                <span className="text-xs font-bold text-slate-700">{item.count}회</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cold Numbers */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50/60 border border-blue-200/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="p-1 bg-blue-500 text-white rounded-lg">
              <Snowflake className="w-4 h-4" />
            </span>
            <span className="text-sm font-bold text-blue-950">
              ❄️ 덜 나온 번호 (Cold Numbers TOP 5)
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {coldNumbers.slice(0, 5).map((item, idx) => (
              <div key={`cold-${item.number}`} className="flex items-center gap-2 bg-white/90 px-2.5 py-1.5 rounded-xl border border-blue-100 shadow-xs">
                <span className="text-xs font-black text-blue-500 w-3">{idx + 1}</span>
                <LottoBall number={item.number} size="sm" />
                <span className="text-xs font-bold text-slate-700">{item.count}회</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2 border-b border-slate-200 w-full">
          <button
            onClick={() => setViewTab('heatmap')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition ${
              viewTab === 'heatmap'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1~45번 전체 빈도 히트맵
          </button>
          <button
            onClick={() => setViewTab('ranking')}
            className={`pb-2 px-3 text-xs font-bold border-b-2 transition ${
              viewTab === 'ranking'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            출현 순위 차트
          </button>
        </div>
      </div>

      {/* View 1: 1~45 Heatmap */}
      {viewTab === 'heatmap' && (
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
          {stats.map(s => {
            const ratio = maxCount > 0 ? (s.count / maxCount) : 0;
            // Highlight background intensity
            let heatClass = 'bg-slate-50 border-slate-200';
            if (ratio >= 0.75) heatClass = 'bg-amber-100/70 border-amber-300';
            else if (ratio >= 0.5) heatClass = 'bg-amber-50/50 border-amber-200';

            return (
              <div
                key={`stat-heat-${s.number}`}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border ${heatClass} transition hover:shadow-sm`}
              >
                <LottoBall number={s.number} size="sm" />
                <span className="text-xs font-extrabold text-slate-800 mt-1">
                  {s.count}회
                </span>
                <span className="text-[10px] text-slate-400">
                  가중치 {s.weight}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Ranking Bars */}
      {viewTab === 'ranking' && (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {[...stats].sort((a, b) => b.count - a.count).map((item, index) => {
            const percent = maxCount > 0 ? Math.round((item.count / maxCount) * 100) : 0;
            return (
              <div key={`rank-${item.number}`} className="flex items-center gap-3 text-xs">
                <span className="w-5 text-right font-black text-slate-400">{index + 1}</span>
                <LottoBall number={item.number} size="sm" />
                <div className="flex-1 bg-slate-100 rounded-full h-3.5 overflow-hidden relative">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(5, percent)}%` }}
                  />
                </div>
                <span className="font-bold text-slate-700 w-12 text-right">
                  {item.count}회 ({item.probability}%)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
