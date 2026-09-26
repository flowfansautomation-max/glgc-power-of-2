/* Data layer for the Power of 2 presentation. Sample data until config.js has a SHEET_ID. */

/* ---- Page 1: typed by hand each week ---- */
window.STAGE = {
  title: 'Ushers Count',
  date: '20th September 2026',
  counts: [ { label: 'Podcast', value: 572 }, { label: 'Salvation', value: 406 } ],   // add more lines if the count changes
  total: 978,
  photos: [ 'photos/stage-1.jpg', 'photos/stage-2.jpg', 'photos/stage-3.jpg' ]   // up to 6 on-stage pictures
};

window.P2 = (function () {
  var CFG = window.P2_CONFIG, CGS = window.CGS;
  var TYPES = { 'Tuesday FLOW': 'tue', 'Meeting God Service': 'mgs', 'Friday FLOW': 'fri', 'Saturday Outreach': 'out', 'Sunday Attendance': 'sun' };

  function parseDate(v) {
    if (v == null || v === '') return null;
    if (v instanceof Date) return v;
    var m = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/.exec(String(v));
    if (m) return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    var d = new Date(v); return isNaN(d.getTime()) ? null : d;
  }
  // a "week" runs Tuesday → Sunday and is keyed by its Sunday
  function sundayOf(d) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate()), dow = x.getDay(); x.setDate(x.getDate() + (dow === 0 ? 0 : 7 - dow)); return x; }
  function isoWeek(d) { var t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - day); return Math.ceil(((t - new Date(Date.UTC(t.getUTCFullYear(), 0, 1))) / 86400000 + 1) / 7); }
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function label(sun) { return sun.getDate() + ' ' + MON[sun.getMonth()]; }
  function yes(v) { return /^(yes|y|true|1|✅|present)$/i.test(String(v).trim()); }
  function num(v) { var n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? null : n; }

  function sample() {
    function rnd(s) { var x = Math.sin(s) * 10000; return x - Math.floor(x); }
    var rows = [], sun = sundayOf(new Date()); if (sun > new Date()) sun.setDate(sun.getDate() - 7);
    for (var w = 3; w >= 0; w--) {
      var d = new Date(sun); d.setDate(d.getDate() - 7 * w);
      CGS.forEach(function (c, i) {
        var s = i * 17 + w * 101;
        if (rnd(s) > 0.15) rows.push({ date: d, cg: c.cg, type: 'Tuesday FLOW', value: rnd(s + 1) > 0.3 ? 'Yes' : 'No' });
        if (rnd(s + 2) > 0.15) rows.push({ date: d, cg: c.cg, type: 'Meeting God Service', value: rnd(s + 3) > 0.35 ? 'Yes' : 'No' });
        if (rnd(s + 4) > 0.2) rows.push({ date: d, cg: c.cg, type: 'Friday FLOW', value: rnd(s + 5) > 0.4 ? 'Yes' : 'No' });
        if (rnd(s + 6) > 0.25) rows.push({ date: d, cg: c.cg, type: 'Saturday Outreach', value: Math.round(rnd(s + 7) * 6) });
        if (rnd(s + 8) > 0.15) rows.push({ date: d, cg: c.cg, type: 'Sunday Attendance', value: Math.round(rnd(s + 9) * 9) });
      });
    }
    return rows;
  }

  function fetchSheet() {
    return new Promise(function (resolve, reject) {
      var cb = '__p2cb' + Date.now();
      window[cb] = function (resp) {
        delete window[cb];
        if (!resp || resp.status === 'error') return reject(new Error('Could not read the sheet'));
        var labels = resp.table.cols.map(function (c) { return String(c.label || '').toLowerCase(); });
        function idx(w) { for (var i = 0; i < labels.length; i++) if (labels[i].indexOf(w) !== -1) return i; return -1; }
        var iT = idx('timestamp'), iD = idx('date'), iC = idx('cg'), iR = idx('report'), iV = idx('value');
        resolve(resp.table.rows.map(function (r) {
          var c = r.c || []; function v(i) { return i >= 0 && c[i] ? c[i].v : null; }
          return { date: parseDate(v(iD)) || parseDate(v(iT)), cg: String(v(iC) || '').trim().toUpperCase().replace(/\s+/g, ''), type: String(v(iR) || '').trim(), value: v(iV) };
        }).filter(function (r) { return r.date && r.cg; }));
      };
      var s = document.createElement('script');
      s.src = 'https://docs.google.com/spreadsheets/d/' + CFG.SHEET_ID + '/gviz/tq?sheet=' + encodeURIComponent(CFG.TAB) + '&headers=1&tqx=out:json;responseHandler:' + cb;
      s.onerror = function () { reject(new Error('Could not reach the sheet')); };
      document.body.appendChild(s);
    });
  }

  function build(rows, isSample) {
    var weeks = {}, data = {};
    rows.forEach(function (r) {
      var f = TYPES[r.type]; if (!f) return;
      var sun = sundayOf(r.date), k = sun.getTime(); weeks[k] = sun;
      var d = data[r.cg] || (data[r.cg] = {}); var wk = d[k] || (d[k] = {});
      wk[f] = (f === 'out' || f === 'sun') ? num(r.value) : yes(r.value);     // latest report wins (rows are in time order)
    });
    var weekList = Object.keys(weeks).map(Number).sort(function (a, b) { return a - b; }).map(function (k) { return { key: k, date: weeks[k], wk: isoWeek(weeks[k]), label: label(weeks[k]) }; });
    function get(cg, k, f) { var d = data[cg] && data[cg][k]; return d && d[f] !== undefined ? d[f] : null; }
    function total(k, f) { var s = 0; CGS.forEach(function (c) { var v = get(c.cg, k, f); if (typeof v === 'number') s += v; else if (v === true) s += 1; }); return s; }
    function reported(k, f) { return CGS.filter(function (c) { return get(c.cg, k, f) !== null; }).length; }
    return { sample: !!isSample, weeks: weekList, cgs: CGS, get: get, total: total, reported: reported };
  }

  function load(cb, onErr) {
    if (!CFG.SHEET_ID) return cb(build(sample(), true));
    fetchSheet().then(function (rows) { cb(build(rows, false)); }).catch(onErr || function () {});
  }
  return { load: load };
})();
