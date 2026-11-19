import { useState, useMemo } from "react";

const CSS = `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap");
:root{--bg:#eef1ef;--surface:#fff;--ink:#16302b;--muted:#5d726d;--line:#d9e1de;--accent:#1f6f5c;--accent-soft:#d8ebe5;--hi:#d99a00;--bad:#b3402f;
box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){color-scheme:dark;--bg:#0f1b19;--surface:#162624;--ink:#e6f0ed;--muted:#92aaa4;--line:#27403c;--accent:#4fb89c;--accent-soft:#1d3a34;--hi:#f0b429;--bad:#e5806e}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#0f1b19;--surface:#162624;--ink:#e6f0ed;--muted:#92aaa4;--line:#27403c;--accent:#4fb89c;--accent-soft:#1d3a34;--hi:#f0b429;--bad:#e5806e}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 "Instrument Sans",system-ui,sans-serif}
button{font:inherit;color:inherit;cursor:pointer}
button:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.wrap{max-width:1120px;margin:0 auto;padding:24px 20px 48px}
header{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:12px;margin-bottom:20px}
h1{font-size:28px;line-height:1.15;margin:0;font-weight:700;letter-spacing:-.02em}
.sub{color:var(--muted);margin:4px 0 0}
.seg{display:inline-flex;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:3px}
.seg button{border:0;background:none;padding:6px 14px;border-radius:8px;color:var(--muted)}
.seg button[aria-pressed="true"]{background:var(--accent);color:#fff}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-bottom:14px}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:18px}
.kpi .v{font-size:30px;font-weight:700;letter-spacing:-.02em;margin-top:2px}
.kpi .l{color:var(--muted)}
.d{font-weight:600;font-size:13px}.up{color:var(--accent)}.down{color:var(--bad)}
.grid{display:grid;grid-template-columns:2fr 1fr;gap:14px;margin-bottom:14px}
@media (max-width:820px){.grid{grid-template-columns:1fr}}
h2{font-size:16px;margin:0 0 12px;font-weight:600}
svg{display:block;width:100%;height:auto;overflow:visible}
.ax{fill:var(--muted);font-size:11px}
.bars{display:grid;gap:12px}
.bar .t{display:flex;justify-content:space-between;margin-bottom:4px}
.bar .tr{height:10px;background:var(--accent-soft);border-radius:5px;overflow:hidden}
.bar .fl{height:100%;background:var(--accent);border-radius:5px}
.tools{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;gap:8px;flex-wrap:wrap}
select{background:var(--surface);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:6px 10px;font:inherit}
.tw{overflow-x:auto}
table{width:100%;border-collapse:collapse;min-width:520px}
th,td{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line)}
th{color:var(--muted);font-weight:500;font-size:13px}
td.n,th.n{text-align:right;font-variant-numeric:tabular-nums}
.pill{padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;background:var(--accent-soft);color:var(--accent)}
.pill.Pending{background:#f7e8bd;color:#7a5800}.pill.Refunded{background:#f3d6d0;color:#8a2c1d}
@media (prefers-color-scheme:dark){.pill.Pending{background:#4a3a0c;color:#f0c453}.pill.Refunded{background:#4a211a;color:#f0a090}}
`;


// Deterministic sample data
function rng(seed){ return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const r = rng(42);
const DAYS = Array.from({ length: 90 }, (_, i) => {
  const base = 1400 + i * 9 + Math.sin(i / 3.2) * 260;
  const rev = Math.round(base + r() * 380);
  return { i, rev, orders: Math.round(rev / 31 + r() * 6) };
});
const PRODUCTS = [
  { name: "Wayanad Estate, 250 g", sold: 842 },
  { name: "Monsoon Malabar, 250 g", sold: 611 },
  { name: "Attappadi Filter, 1 kg", sold: 437 },
  { name: "Cold brew bags, 8 pack", sold: 295 },
  { name: "Tasting set", sold: 168 },
];
const NAMES = ["Anjali Menon","Rahul Nair","Meera Das","Vivek Pillai","Sana Iqbal","Joel Thomas","Divya Raj","Arun Kumar","Lakshmi S.","Faisal Ali"];
const STATUS = ["Paid","Paid","Paid","Pending","Refunded"];
const ORDERS = NAMES.map((n, k) => ({
  id: 4821 - k, name: n, item: PRODUCTS[k % 5].name,
  amt: 480 + Math.round(r() * 2400), status: STATUS[k % 5],
}));

const inr = n => "₹" + n.toLocaleString("en-IN");
const sum = (a, f) => a.reduce((s, x) => s + f(x), 0);

function Kpi({ label, value, delta }) {
  return (
    <div className="card kpi">
      <div className="l">{label}</div>
      <div className="v">{value}</div>
      <div className={"d " + (delta >= 0 ? "up" : "down")}>
        {delta >= 0 ? "▲" : "▼"} {Math.abs(delta).toFixed(1)}% vs previous period
      </div>
    </div>
  );
}

function LineChart({ data }) {
  const [hover, setHover] = useState(null);
  const W = 640, H = 240, P = { l: 44, r: 10, t: 10, b: 24 };
  const max = Math.ceil(Math.max(...data.map(d => d.rev)) / 500) * 500;
  const x = i => P.l + (i / (data.length - 1)) * (W - P.l - P.r);
  const y = v => P.t + (1 - v / max) * (H - P.t - P.b);
  const line = data.map((d, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(d.rev).toFixed(1)).join(" ");
  const area = line + ` L${x(data.length - 1)} ${H - P.b} L${x(0)} ${H - P.b} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => t * max);
  const move = e => {
    const b = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - b.left) / b.width) * W;
    const idx = Math.round(((px - P.l) / (W - P.l - P.r)) * (data.length - 1));
    setHover(Math.max(0, Math.min(data.length - 1, idx)));
  };
  const h = hover != null ? data[hover] : null;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Daily revenue line chart"
         onMouseMove={move} onMouseLeave={() => setHover(null)} onTouchMove={e => move(e.touches[0])}>
      {ticks.map(t => (
        <g key={t}>
          <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="var(--line)" />
          <text className="ax" x={P.l - 8} y={y(t) + 4} textAnchor="end">{t >= 1000 ? t / 1000 + "k" : t}</text>
        </g>
      ))}
      <path d={area} fill="var(--accent-soft)" opacity=".7" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" />
      <text className="ax" x={P.l} y={H - 4}>{data.length} days ago</text>
      <text className="ax" x={W - P.r} y={H - 4} textAnchor="end">Today</text>
      {h && (
        <g>
          <line x1={x(hover)} x2={x(hover)} y1={P.t} y2={H - P.b} stroke="var(--muted)" strokeDasharray="3 3" />
          <circle cx={x(hover)} cy={y(h.rev)} r="5" fill="var(--hi)" stroke="var(--surface)" strokeWidth="2" />
          <g transform={`translate(${Math.min(x(hover) + 10, W - 130)},${P.t + 4})`}>
            <rect width="120" height="40" rx="8" fill="var(--ink)" />
            <text x="10" y="17" fill="var(--surface)" fontSize="11">{data.length - 1 - hover === 0 ? "Today" : (data.length - 1 - hover) + " days ago"}</text>
            <text x="10" y="33" fill="var(--surface)" fontSize="13" fontWeight="600">{inr(h.rev)}</text>
          </g>
        </g>
      )}
    </svg>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState(30);
  const [status, setStatus] = useState("All");
  const cur = useMemo(() => DAYS.slice(-range), [range]);
  const prev = useMemo(() => DAYS.slice(-range * 2, -range), [range]);
  const rev = sum(cur, d => d.rev), pRev = sum(prev, d => d.rev) || 1;
  const ord = sum(cur, d => d.orders), pOrd = sum(prev, d => d.orders) || 1;
  const aov = rev / ord, pAov = pRev / pOrd;
  const pct = (a, b) => ((a - b) / b) * 100;
  const maxSold = PRODUCTS[0].sold;
  const rows = ORDERS.filter(o => status === "All" || o.status === status);

  return (
    <div className="wrap">
      <style>{CSS}</style>
      <header>
        <div>
          <h1>Roastery sales</h1>
          <p className="sub">Online store performance, sample data</p>
        </div>
        <div className="seg" role="group" aria-label="Date range">
          {[7, 30, 90].map(n => (
            <button key={n} aria-pressed={range === n} onClick={() => setRange(n)}>{n} days</button>
          ))}
        </div>
      </header>

      <section className="kpis" aria-label="Key figures">
        <Kpi label="Revenue" value={inr(rev)} delta={pct(rev, pRev)} />
        <Kpi label="Orders" value={ord.toLocaleString("en-IN")} delta={pct(ord, pOrd)} />
        <Kpi label="Average order" value={inr(Math.round(aov))} delta={pct(aov, pAov)} />
      </section>

      <div className="grid">
        <div className="card">
          <h2>Daily revenue</h2>
          <LineChart data={cur} />
        </div>
        <div className="card">
          <h2>Best sellers</h2>
          <div className="bars">
            {PRODUCTS.map(p => (
              <div className="bar" key={p.name}>
                <div className="t"><span>{p.name}</span><strong>{p.sold}</strong></div>
                <div className="tr"><div className="fl" style={{ width: (p.sold / maxSold) * 100 + "%" }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tools">
          <h2 style={{ margin: 0 }}>Recent orders</h2>
          <label>
            <span className="sub">Status </span>
            <select value={status} onChange={e => setStatus(e.target.value)}>
              {["All", "Paid", "Pending", "Refunded"].map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Item</th><th className="n">Amount</th><th>Status</th></tr></thead>
            <tbody>
              {rows.map(o => (
                <tr key={o.id}>
                  <td>#{o.id}</td><td>{o.name}</td><td>{o.item}</td>
                  <td className="n">{inr(o.amt)}</td>
                  <td><span className={"pill " + o.status}>{o.status}</span></td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan="5">No orders with this status. Choose another filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
