import { esc, money, num, timeLeft, dateStr, pct, toStr, toArr, toNum, toObj } from './format.js';

export function loadingHTML() {
  return `<div class="loading-skeleton"><div class="skeleton title"></div><div class="skeleton list"></div></div>`;
}
export function errorHTML(message) {
  return `<div class="error"><p>${esc(toStr(message))}</p><button data-retry>Retry</button></div>`;
}
export function emptyHTML(message) {
  return `<div class="empty"><p>${esc(toStr(message, 'Nothing here'))}</p></div>`;
}
export function boardHTML(rawCats = [], activeCat = 'All') {
  const cats = [...new Set(toArr(rawCats).flatMap(c => toArr(c)).map(c => toStr(c)).filter(Boolean))];
  const chips = ['All', ...cats].map(cat => `<button data-cat="${esc(cat)}"${cat === activeCat ? ' class="active"' : ''}>${esc(cat)}</button>`).join('');
  return `<section class="board-controls"><input id="q" type="search" aria-label="Search" placeholder="Search bounties" /><div class="chips">${chips}</div><select id="sort" aria-label="Sort"><option value="ending">Ending soon</option><option value="pot">Biggest pot</option><option value="entries">Most entries</option></select></section><div id="list"></div>`;
}
export function boardListHTML(rawList = [], rawPots = {}) {
  const items = toArr(rawList);
  if (!items.length) return emptyHTML('No bounties found');
  const pots = toObj(rawPots);
  const cards = items.map(raw => {
    const it = toObj(raw);
    const slug = toStr(it.slug);
    const potVal = pots[slug] ?? it.potUsd ?? it.rewardAmount;
    const fee = it.entryFeeUsd != null ? money(it.entryFeeUsd) : 'Free entry';
    const sponsor = toStr(toObj(it.sponsor).name ?? it.sponsor);
    return `<article class="card"><h3><a href="#/bounty/${esc(slug)}">${esc(toStr(it.title, slug))}</a></h3><p class="pot">${money(potVal)}</p><p class="fee">${esc(fee)}</p><p class="category">${esc(toStr(it.category))}</p><p class="entries">${num(it.submissionCount)} entries</p><p class="sponsor">${esc(sponsor)}</p><p class="deadline"><span class="cd" data-dl="${esc(toStr(it.deadline))}">${esc(timeLeft(it.deadline))}</span></p></article>`;
  }).join('');
  return `<section class="board-list grid">${cards}</section>`;
}
export function bountyHTML(rawItem, rawFee = null) {
  const item = toObj(rawItem);
  const feeInfo = toObj(rawFee);
  const slug = toStr(item.slug);
  const pot = toNum(item.potUsd ?? item.rewardAmount) + toNum(toObj(feeInfo.pot).fees_usd);
  const fee = feeInfo.amount_usd != null ? money(feeInfo.amount_usd) : (item.entryFeeUsd != null ? money(item.entryFeeUsd) : 'Free entry');
  const skills = toArr(item.skills).map(s => `<span class="chip">${esc(toStr(s))}</span>`).join('');
  const descHtml = toStr(item.description).split(/\n\n+/).filter(part => part.trim()).map(part => {
    if (part.startsWith('## ')) return `<h2>${esc(part.slice(3).trim())}</h2>`;
    if (part.startsWith('- ')) return `<ul>${part.split('\n').map(line => `<li>${esc(line.replace(/^-\s*/, '').trim())}</li>`).join('')}</ul>`;
    return `<p>${esc(part.trim())}</p>`;
  }).join('');
  let rows = [];
  if (Array.isArray(item.rewards)) {
    rows = item.rewards.map(entry => Array.isArray(entry) ? [entry[0], entry[1]] : [toObj(entry).place ?? '', toObj(entry).amount ?? entry]).filter(pair => pair[1] != null);
  } else {
    rows = Object.entries(toObj(item.rewards));
  }
  const rewardsHtml = rows.length ? `<section class="rewards"><h3>Rewards</h3>${rows.map(([place, amount]) => `<div class="reward-row"><span>${esc(toStr(place))}</span><span>${money(amount)}</span></div>`).join('')}</section>` : '';
  return `<article class="bounty-detail"><h1>${esc(toStr(item.title, slug))}</h1><p class="meta"><span class="pot">${money(pot)}</span> <span class="fee">${esc(fee)}</span></p><p class="deadline"><span class="cd" data-dl="${esc(toStr(item.deadline))}">${esc(timeLeft(item.deadline))}</span></p><p class="submissions">${num(item.submissionCount)} submissions</p><p class="category">${esc(toStr(item.category))}</p><div class="skills">${skills}</div><section class="description">${descHtml}</section>${rewardsHtml}<nav class="links"><a href="#/bounty/${esc(slug)}/leaderboard">Leaderboard</a> <a href="https://make.fun/bounty/${esc(slug)}">Open on make.fun</a></nav></article>`;
}
export function leaderboardHTML(rawData, slug) {
  const data = toObj(rawData);
  const note = toObj(data.phase).placements_held ? '<p class="note">Placements held — provisional</p>' : '';
  const entries = toArr(data.entries);
  if (!entries.length) return `<h1>Leaderboard</h1>${note}${emptyHTML('No entries yet')}`;
  const paid = toNum(data.paid_places);
  const rows = entries.map((rawE, i) => {
    const e = toObj(rawE);
    const rank = toNum(e.rank ?? i + 1, i + 1);
    const name = toStr(e.handle ?? e.entrant ?? e.username, '?');
    const entrant = name !== '?' ? `<a href="#/u/${esc(name)}">${esc(name)}</a>` : esc(name);
    const score = e.judge_win_rate_micro != null ? pct(e.judge_win_rate_micro) : esc(toStr(e.score ?? e.win_rate ?? ''));
    const badge = i < paid ? ' <span class="badge">paid</span>' : '';
    return `<tr${i < paid ? ' class="paid"' : ''}><td>${rank}</td><td>${entrant}${badge}</td><td>${score}</td><td>${esc(toStr(e.stage))}</td></tr>`;
  }).join('');
  return `<h1>Leaderboard</h1>${note}<table><thead><tr><th>Rank</th><th>Entrant</th><th>Score</th><th>Stage</th></tr></thead><tbody>${rows}</tbody></table>`;
}
export function profileHTML(rawP, rawR, rawHandle) {
  const p = toObj(rawP);
  const r = toObj(rawR);
  const handle = toStr(rawHandle ?? p.handle);
  const avatar = handle ? `<img class="avatar" crossorigin="anonymous" src="https://make.fun/api/profiles/${esc(handle)}/picture.png" alt="" onerror="this.style.display='none'">` : '';
  const fallback = `<div class="letter">${esc(handle.slice(0, 1).toUpperCase())}</div>`;
  const bio = toStr(p.bio) ? `<p class="bio">${esc(toStr(p.bio))}</p>` : '';
  const stats = [];
  const joined = dateStr(p.created_at ?? p.createdAt);
  if (joined) stats.push(['Joined', joined]);
  if (r.entries != null) stats.push(['Entries', num(r.entries)]);
  if (r.wins != null) stats.push(['Wins', num(r.wins)]);
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === 'number' && !['entries', 'wins'].includes(k)) stats.push([k, num(v)]);
  }
  const statsHTML = stats.length ? `<ul class="stats">${stats.map(([k, v]) => `<li>${esc(toStr(k))}: ${esc(toStr(v))}</li>`).join('')}</ul>` : '';
  const recentItems = toArr(p.entries).map(rawE => { const e = toObj(rawE); return `<li><a href="#/bounty/${esc(toStr(e.slug))}">${esc(toStr(e.title ?? e.slug))}</a></li>`; }).join('');
  const recent = recentItems ? `<h2>Recent entries</h2><ul>${recentItems}</ul>` : '';
  return `<div class="profile">${avatar}${fallback}<h1>${esc(toStr(p.displayName ?? p.display_name, handle))}</h1><p>@${esc(handle)}</p>${bio}${statsHTML}${recent}</div>`;
}
