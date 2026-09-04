// 로또 공 색상 규격:
// 1~10: 노란색(#FBC400)
// 11~20: 파란색(#69C8F2)
// 21~30: 빨간색(#FF7272)
// 31~40: 회색(#AAAAAA)
// 41~45: 초록색(#B0D840)

export function getBallColorInfo(num) {
  const n = Number(num);
  if (n >= 1 && n <= 10) {
    return {
      bg: '#FBC400',
      text: '#ffffff',
      border: '#E5B100',
      label: 'yellow',
      gradient: 'from-[#ffd233] to-[#e6b000]'
    };
  } else if (n >= 11 && n <= 20) {
    return {
      bg: '#69C8F2',
      text: '#ffffff',
      border: '#53B7E5',
      label: 'blue',
      gradient: 'from-[#82d4f7] to-[#51b6e3]'
    };
  } else if (n >= 21 && n <= 30) {
    return {
      bg: '#FF7272',
      text: '#ffffff',
      border: '#E85B5B',
      label: 'red',
      gradient: 'from-[#ff8f8f] to-[#e85b5b]'
    };
  } else if (n >= 31 && n <= 40) {
    return {
      bg: '#AAAAAA',
      text: '#ffffff',
      border: '#919191',
      label: 'gray',
      gradient: 'from-[#bfbfbf] to-[#999999]'
    };
  } else {
    return {
      bg: '#B0D840',
      text: '#ffffff',
      border: '#9BBE33',
      label: 'green',
      gradient: 'from-[#c2e84d] to-[#9bbe33]'
    };
  }
}

/**
 * 가중치 랜덤 추첨 알고리즘 (Weighted Random Sampling Without Replacement)
 * 1. 고정 번호 우선 배치
 * 2. 1~45 중 제외 번호 및 고정 번호 제거한 후보 번호 목록 및 가중치 구성
 * 3. 6개가 채워질 때까지 비복원 가중치 확률 추첨
 * 4. 오름차순 정렬
 */
export function generateSingleGame(statsList, fixedNumbers = [], excludedNumbers = []) {
  const result = [...fixedNumbers];
  const fixedSet = new Set(fixedNumbers);
  const excludedSet = new Set(excludedNumbers);

  // Weight map from stats or default 1
  const weightMap = new Map();
  if (Array.isArray(statsList) && statsList.length > 0) {
    statsList.forEach(item => {
      weightMap.set(item.number, item.weight || (item.count + 1) || 1);
    });
  }

  // Candidate pool
  const candidates = [];
  for (let i = 1; i <= 45; i++) {
    if (!fixedSet.has(i) && !excludedSet.has(i)) {
      candidates.push({
        number: i,
        weight: weightMap.get(i) || 1
      });
    }
  }

  // Draw until we have 6 numbers
  while (result.length < 6 && candidates.length > 0) {
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    if (totalWeight <= 0) {
      // Fallback: pick any random
      const randomIdx = Math.floor(Math.random() * candidates.length);
      result.push(candidates[randomIdx].number);
      candidates.splice(randomIdx, 1);
      continue;
    }

    const threshold = Math.random() * totalWeight;
    let cumulative = 0;
    let pickedIndex = 0;

    for (let i = 0; i < candidates.length; i++) {
      cumulative += candidates[i].weight;
      if (cumulative >= threshold) {
        pickedIndex = i;
        break;
      }
    }

    result.push(candidates[pickedIndex].number);
    candidates.splice(pickedIndex, 1);
  }

  // Sort ascending
  return result.sort((a, b) => a - b);
}

/**
 * 5게임 (A, B, C, D, E) 일괄 생성
 */
export function generateFiveGames(statsList, fixedNumbers = [], excludedNumbers = []) {
  const gameLabels = ['A', 'B', 'C', 'D', 'E'];
  return gameLabels.map(label => ({
    label,
    numbers: generateSingleGame(statsList, fixedNumbers, excludedNumbers)
  }));
}

/**
 * 5게임 클립보드 복사용 텍스트 포맷팅
 */
export function formatGamesForClipboard(games, latestRound) {
  const header = latestRound ? `[로또 6/45 통계 기반 추천 조합 - 제${latestRound}회차 통계]` : `[로또 6/45 통계 기반 추천 조합]`;
  const lines = games.map(g => {
    const numStr = g.numbers.map(n => String(n).padStart(2, '0')).join(', ');
    return `${g.label}: [ ${numStr} ]`;
  });
  return `${header}\n${lines.join('\n')}\n행운을 빕니다! 🎰✨`;
}
