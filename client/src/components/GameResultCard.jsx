import React, { useState } from 'react';
import LottoBall from './LottoBall';
import { Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import { formatGamesForClipboard } from '../utils/lotto';

export default function GameResultCard({
  games,
  fixedNumbers,
  onRegenerate,
  latestRound
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!games || games.length === 0) return;
    const text = formatGamesForClipboard(games, latestRound);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  if (!games || games.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              통계 가중치 5게임 추천 조합 (A ~ E)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            출현 빈도 가중치 무작위 비복원 추첨 알고리즘으로 생성된 조합입니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            다시 생성
          </button>
          <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                복사 완료!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                5게임 전체 복사
              </>
            )}
          </button>
        </div>
      </div>

      {/* 5 Games List */}
      <div className="space-y-3.5">
        {games.map((game, gIdx) => (
          <div
            key={`game-${game.label}`}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition animate-pop"
            style={{ animationDelay: `${gIdx * 0.05}s` }}
          >
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                {game.label}
              </span>
              <span className="text-xs font-bold text-slate-600">
                게임 {gIdx + 1}
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              {game.numbers.map(num => {
                const isFixed = fixedNumbers.includes(num);
                return (
                  <LottoBall
                    key={`g-${game.label}-${num}`}
                    number={num}
                    size="md"
                    isFixed={isFixed}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>* 파란색 [고정] 태그는 사용자가 설정한 고정 번호입니다.</span>
        <span>각 번호는 오름차순으로 정렬되었습니다.</span>
      </div>
    </div>
  );
}
