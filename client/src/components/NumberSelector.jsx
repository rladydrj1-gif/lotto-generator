import React from 'react';
import { getBallColorInfo } from '../utils/lotto';
import { ShieldCheck, ShieldAlert, RotateCcw, Info } from 'lucide-react';

export default function NumberSelector({
  fixedNumbers,
  excludedNumbers,
  onToggleFixed,
  onToggleExcluded,
  onReset
}) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>🎯 번호 직접 지정 (고정 / 제외)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            고정 번호는 최대 5개, 제외 번호는 최대 10개까지 설정할 수 있습니다.
          </p>
        </div>
        {(fixedNumbers.length > 0 || excludedNumbers.length > 0) && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-red-600 bg-slate-100 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            선택 초기화
          </button>
        )}
      </div>

      {/* Status Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Fixed numbers indicator */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-blue-800 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>고정 번호 (반드시 포함)</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
              {fixedNumbers.length} / 5
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
            {fixedNumbers.length === 0 ? (
              <span className="text-xs text-blue-400 italic">아래 번호판에서 [고정]을 눌러 선택</span>
            ) : (
              fixedNumbers.map(num => (
                <button
                  key={`fix-${num}`}
                  onClick={() => onToggleFixed(num)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-blue-700 transition"
                  title="클릭하여 고정 해제"
                >
                  {num} <span className="text-[10px] opacity-75">✕</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Excluded numbers indicator */}
        <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-red-800 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span>제외 번호 (추첨에서 제외)</span>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-200 text-red-800">
              {excludedNumbers.length} / 10
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
            {excludedNumbers.length === 0 ? (
              <span className="text-xs text-red-400 italic">아래 번호판에서 [제외]를 눌러 선택</span>
            ) : (
              excludedNumbers.map(num => (
                <button
                  key={`ex-${num}`}
                  onClick={() => onToggleExcluded(num)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-red-700 transition"
                  title="클릭하여 제외 해제"
                >
                  {num} <span className="text-[10px] opacity-75">✕</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 1 ~ 45 Number Grid */}
      <div>
        <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
          <span>번호를 클릭하여 <strong>[일반 ➜ 고정 ➜ 제외 ➜ 일반]</strong> 순환 전환하거나 빠른 버튼을 이용하세요.</span>
          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> 고정
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-red-700">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span> 제외
            </span>
          </div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5 sm:gap-2">
          {Array.from({ length: 45 }, (_, idx) => idx + 1).map(num => {
            const isFixed = fixedNumbers.includes(num);
            const isExcluded = excludedNumbers.includes(num);
            const color = getBallColorInfo(num);

            const handleCycle = () => {
              if (isFixed) {
                // Fixed -> Excluded
                onToggleFixed(num);
                onToggleExcluded(num);
              } else if (isExcluded) {
                // Excluded -> None
                onToggleExcluded(num);
              } else {
                // None -> Fixed
                onToggleFixed(num);
              }
            };

            return (
              <div
                key={`num-grid-${num}`}
                className={`relative group rounded-xl p-1.5 flex flex-col items-center justify-center transition border ${
                  isFixed
                    ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300'
                    : isExcluded
                    ? 'bg-red-50 border-red-400 ring-2 ring-red-300 opacity-60'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={handleCycle}
                  className="w-full flex flex-col items-center"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-xs transition transform group-hover:scale-105"
                    style={{
                      backgroundColor: isExcluded ? '#94a3b8' : color.bg,
                      textDecoration: isExcluded ? 'line-through' : 'none'
                    }}
                  >
                    {num}
                  </div>
                  <span className="text-[10px] mt-1 font-semibold">
                    {isFixed ? (
                      <span className="text-blue-700 font-bold">고정</span>
                    ) : isExcluded ? (
                      <span className="text-red-600 font-bold">제외</span>
                    ) : (
                      <span className="text-slate-400 group-hover:text-slate-700">선택</span>
                    )}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
