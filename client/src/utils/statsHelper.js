import initialRounds from '../data/initial-data.json';

export function computeLottoStats(rounds, count = 30) {
  const targetRounds = (rounds || initialRounds).slice(0, count);

  const counts = {};
  const bonusCounts = {};
  for (let i = 1; i <= 45; i++) {
    counts[i] = 0;
    bonusCounts[i] = 0;
  }

  targetRounds.forEach(r => {
    [r.drwtNo1, r.drwtNo2, r.drwtNo3, r.drwtNo4, r.drwtNo5, r.drwtNo6].forEach(num => {
      if (num && counts[num] !== undefined) {
        counts[num]++;
      }
    });
    if (r.bnusNo && bonusCounts[r.bnusNo] !== undefined) {
      bonusCounts[r.bnusNo]++;
    }
  });

  const baseWeight = 1;
  const statsList = [];
  let totalWeight = 0;

  for (let i = 1; i <= 45; i++) {
    const cnt = counts[i];
    const weight = cnt + baseWeight;
    totalWeight += weight;
    statsList.push({
      number: i,
      count: cnt,
      bonusCount: bonusCounts[i],
      weight,
      probability: 0
    });
  }

  statsList.forEach(item => {
    item.probability = Number(((item.weight / totalWeight) * 100).toFixed(2));
  });

  const sortedByCount = [...statsList].sort((a, b) => b.count - a.count);
  const hotNumbers = sortedByCount.slice(0, 10);
  const coldNumbers = [...sortedByCount].reverse().slice(0, 10);

  return {
    success: true,
    analyzedRoundsCount: targetRounds.length,
    roundRange: {
      latest: targetRounds[0]?.drwNo,
      oldest: targetRounds[targetRounds.length - 1]?.drwNo
    },
    stats: statsList,
    hotNumbers,
    coldNumbers
  };
}

export function getLatestRound(rounds) {
  const list = rounds || initialRounds;
  return list[0] || null;
}
