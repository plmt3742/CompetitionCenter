(function () {
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const pad = (n) => String(n).padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  function isoWeek(d) {
    const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNr = (target.getUTCDay() + 6) % 7;
    target.setUTCDate(target.getUTCDate() - dayNr + 3);
    const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
    return 1 + Math.round((target - firstThursday) / 604800000);
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('cc-theme', theme); } catch (e) {}
  }

  $('#themeBtn').addEventListener('click', () => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  function fmtRemain(ms) {
    if (ms <= 0) return '已结束';
    const minutes = Math.floor(ms / 60000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    const mins = minutes % 60;
    if (days > 0) return `${days} 天 ${hours} 小时`;
    if (hours > 0) return `${hours} 小时 ${mins} 分`;
    return `${mins} 分 ${Math.floor((ms % 60000) / 1000)} 秒`;
  }

  function setTimeRow(prefix, start, end) {
    const now = Date.now();
    const total = end - start;
    const elapsed = Math.min(Math.max(now - start, 0), total);
    const pct = total > 0 ? (elapsed / total) * 100 : 0;
    $('#' + prefix + 'Remain').textContent = fmtRemain(end - now);
    $('#' + prefix + 'Pct').textContent = `剩 ${Math.max(0, Math.round(100 - pct))}%`;
    $('#' + prefix + 'Bar').style.width = `${pct.toFixed(2)}%`;
    $('#' + prefix + 'Done').textContent = `已过 ${Math.round(pct)}%`;
  }

  function update() {
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好';
    $('#greeting').innerHTML = `${greeting}，<span class="name">负责人</span>`;
    $('#sealDay').textContent = pad(now.getDate());
    $('#sealMonth').textContent = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`;
    $('#sealMeta').textContent = `${weekdays[now.getDay()]} · 第 ${isoWeek(now)} 周`;
    $('#todayChip').textContent = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} · ${weekdays[now.getDay()]}`;
    $('#timeClock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    $('#timeDate').textContent = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} · ${weekdays[now.getDay()]}`;

    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const termStart = new Date(2026, 8, 1);
    const termEnd = new Date(2027, 0, 15);

    setTimeRow('today', dayStart, dayEnd);
    setTimeRow('week', weekStart, weekEnd);
    setTimeRow('month', monthStart, monthEnd);
    setTimeRow('term', termStart, termEnd);

    const deadline = new Date(2026, 10, 24, 23, 59);
    const diff = deadline - now;
    if (diff > 0) {
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      $('#deadlineCount').innerHTML = `还剩 ${days} 天<br>${pad(hours)} 小时`;
    } else {
      $('#deadlineCount').textContent = '已截止';
    }

    $('#footTime').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  update();
  setInterval(update, 1000);

  // todo interactions
  let totalTodo = 8;
  function updateTodoCount() {
    $('#todoSub').textContent = `${totalTodo} 条未完成 · 本周 15 条`;
    $('#statTodoValue').innerHTML = `${totalTodo}<small>条</small>`;
  }
  $$('.tick').forEach((btn) => {
    btn.addEventListener('click', () => {
      const li = btn.closest('.todo');
      const done = li.classList.toggle('is-done');
      btn.setAttribute('aria-pressed', String(done));
      totalTodo += done ? -1 : 1;
      updateTodoCount();
    });
  });
  $$('#todoChips .chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      $$('#todoChips .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      const filter = chip.dataset.filter;
      let visible = 0;
      $$('.todo').forEach((li) => {
        const show = filter === 'all' || li.dataset.cat === filter;
        li.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });
      $('#todoEmpty').hidden = visible > 0;
    });
  });

  // chart
  const data = [2, 3, 1, 4, 2, 5, 3, 6, 4, 2, 5, 7, 4, 6];
  const x0 = 8, x1 = 412, yTop = 12, yBase = 112;
  const max = Math.max.apply(null, data);
  const step = (x1 - x0) / (data.length - 1);
  const points = data.map((v, i) => [x0 + i * step, yBase - (v / max) * (yBase - yTop)]);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${x1},${yBase} L${x0},${yBase} Z`;
  $('#chartLine').setAttribute('d', line);
  $('#chartArea').setAttribute('d', area);
  $('#chartDots').innerHTML = points.map((p, i) => `<circle class="chart-dot${i === points.length - 1 ? ' now' : ''}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3"/>`).join('');
  const chartCard = $('#chartLine').closest('.card');
  requestAnimationFrame(() => chartCard.classList.add('in'));

  // toast + demo links
  let toastTimer;
  function toast(message) {
    const el = $('#toast');
    el.textContent = message;
    el.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('on'), 2200);
  }
  $('#quickBtn').addEventListener('click', () => toast('快速收集 · 原型入口'));
  $('#searchBtn').addEventListener('click', () => toast('全局搜索 · 原型入口'));
  $$('[data-noop]').forEach((el) => el.addEventListener('click', (e) => e.preventDefault()));
})();
