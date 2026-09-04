import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Serve static build from client/dist if available
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  console.log('[Server] Serving client/dist');
}

// In-memory cache
let cachedRounds = [];
let lastFetchedAt = 0;
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

// Load initial data
try {
  const initialDataRaw = fs.readFileSync(path.join(__dirname, 'initial-data.json'), 'utf-8');
  cachedRounds = JSON.parse(initialDataRaw);
  console.log(`[Cache] Loaded ${cachedRounds.length} initial rounds from initial-data.json`);
} catch (e) {
  console.warn('[Cache] Could not load initial-data.json:', e.message);
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 8000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON response: ' + data.slice(0, 100)));
        }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Request timed out')));
  });
}

// Fetch single round with fallbacks
async function fetchRoundFromDh(drwNo) {
  try {
    const url = drwNo
      ? `https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do?srchLtEpsd=${drwNo}`
      : 'https://www.dhlottery.co.kr/lt645/selectPstLt645Info.do';
    const res = await fetchJson(url);
    if (res && res.data && res.data.list && res.data.list[0]) {
      const item = res.data.list[0];
      return {
        drwNo: item.ltEpsd,
        drwNoDate: item.ltRflYmd ? item.ltRflYmd.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : '',
        drwtNo1: item.tm1WnNo,
        drwtNo2: item.tm2WnNo,
        drwtNo3: item.tm3WnNo,
        drwtNo4: item.tm4WnNo,
        drwtNo5: item.tm5WnNo,
        drwtNo6: item.tm6WnNo,
        bnusNo: item.bnsWnNo,
        firstWinamnt: item.rnk1WnAmt || 0,
        firstPrzwnerCo: item.rnk1WnNope || 0
      };
    }
  } catch (err) {
    // console.warn(`selectPstLt645Info failed for drwNo ${drwNo}:`, err.message);
  }

  if (drwNo) {
    try {
      const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;
      const res = await fetchJson(url);
      if (res && res.returnValue === 'success') {
        return res;
      }
    } catch (err) {
      // console.warn(`getLottoNumber failed for drwNo ${drwNo}:`, err.message);
    }
  }

  return null;
}

// Sync latest rounds
async function syncRounds(count = 50) {
  const now = Date.now();
  if (now - lastFetchedAt < CACHE_TTL_MS && cachedRounds.length >= count) {
    return cachedRounds.slice(0, count);
  }

  try {
    const latestInfo = await fetchRoundFromDh();
    if (!latestInfo) {
      console.warn('[Sync] Could not fetch latest round, using fallback cache');
      return cachedRounds.slice(0, count);
    }

    const latestRound = latestInfo.drwNo;
    const existingMap = new Map(cachedRounds.map(r => [r.drwNo, r]));
    existingMap.set(latestRound, latestInfo);

    const neededRounds = [];
    for (let r = latestRound; r >= Math.max(1, latestRound - count + 1); r--) {
      if (!existingMap.has(r)) {
        neededRounds.push(r);
      }
    }

    if (neededRounds.length > 0) {
      for (let i = 0; i < neededRounds.length; i += 5) {
        const batch = neededRounds.slice(i, i + 5);
        const batchResults = await Promise.all(batch.map(r => fetchRoundFromDh(r)));
        batchResults.forEach((res, idx) => {
          if (res) existingMap.set(batch[idx], res);
        });
      }
    }

    cachedRounds = Array.from(existingMap.values()).sort((a, b) => b.drwNo - a.drwNo);
    lastFetchedAt = now;
  } catch (e) {
    console.error('[Sync] Error during sync:', e.message);
  }

  return cachedRounds.slice(0, count);
}

// Route 1: Latest round
app.get('/api/lotto/latest', async (req, res) => {
  try {
    const rounds = await syncRounds(10);
    if (rounds.length > 0) {
      return res.json({ success: true, data: rounds[0] });
    }
    return res.status(500).json({ success: false, error: 'No data available' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Route 2: Recent rounds list
app.get('/api/lotto/recent', async (req, res) => {
  try {
    const count = Math.min(100, Math.max(5, parseInt(req.query.count) || 30));
    const rounds = await syncRounds(count);
    return res.json({ success: true, count: rounds.length, data: rounds.slice(0, count) });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Route 3: Statistics & Weights
app.get('/api/lotto/stats', async (req, res) => {
  try {
    const count = Math.min(100, Math.max(10, parseInt(req.query.count) || 30));
    const rounds = await syncRounds(count);
    const targetRounds = rounds.slice(0, count);

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

    return res.json({
      success: true,
      analyzedRoundsCount: targetRounds.length,
      roundRange: {
        latest: targetRounds[0]?.drwNo,
        oldest: targetRounds[targetRounds.length - 1]?.drwNo
      },
      stats: statsList,
      hotNumbers,
      coldNumbers
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexHtml = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.sendFile(indexHtml);
  } else {
    res.send('Lotto Server Running. Please build client.');
  }
});

app.listen(PORT, () => {
  console.log(`[Lotto Server] Running on http://localhost:${PORT}`);
});
