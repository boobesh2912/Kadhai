// Flat vector illustrations for the demo story (no gradients, no external images).
// Every scene is drawn on a 400x300 canvas; the ground contact line is around y=235-262.

const C = {
  ink: '#1f2937',
  skin: '#f2c29b',
  skinDark: '#e3a37c',
  hair: '#7c5a3c',
  shirt: '#2563eb',
  pants: '#334155',
  car: '#f5b82e',
  carDark: '#d9970f',
  glass: '#cfe8ff',
  hub: '#e5e7eb',
  white: '#ffffff',
  cloud: '#ffffff',
};

/* ------------------------------------------------------------------ people */

function Man({ x, y, s = 1, flip = false, lean = 0, left = [-26, -42], right = [26, -42], worried = false, children }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <rect x="-14" y="-42" width="11" height="42" rx="4" fill={C.pants} />
      <rect x="3" y="-42" width="11" height="42" rx="4" fill={C.pants} />
      <ellipse cx="-11" cy="0" rx="11" ry="4.5" fill={C.ink} />
      <ellipse cx="11" cy="0" rx="11" ry="4.5" fill={C.ink} />
      <g transform={`rotate(${lean} 0 -42)`}>
        <rect x="-22" y="-88" width="44" height="50" rx="17" fill={C.shirt} />
        <path d={`M-18 -78 L${left[0]} ${left[1]}`} stroke={C.shirt} strokeWidth="10" strokeLinecap="round" />
        <circle cx={left[0]} cy={left[1]} r="6" fill={C.skin} />
        <path d={`M18 -78 L${right[0]} ${right[1]}`} stroke={C.shirt} strokeWidth="10" strokeLinecap="round" />
        <circle cx={right[0]} cy={right[1]} r="6" fill={C.skin} />
        {children}
        <circle cx="-18" cy="-103" r="5" fill={C.skin} />
        <circle cx="18" cy="-103" r="5" fill={C.skin} />
        <circle cx="0" cy="-104" r="19" fill={C.skin} />
        <circle cx="-16" cy="-111" r="6" fill={C.hair} />
        <circle cx="16" cy="-111" r="6" fill={C.hair} />
        <path d="M-7 -121 Q0 -128 8 -121" stroke={C.hair} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="-7" cy="-108" r="2.4" fill={C.ink} />
        <circle cx="7" cy="-108" r="2.4" fill={C.ink} />
        <path
          d={worried ? 'M-11 -116 L-4 -113 M11 -116 L4 -113' : 'M-11 -114 Q-7 -117 -3 -114 M3 -114 Q7 -117 11 -114'}
          stroke={C.hair}
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="0" cy="-102" r="4" fill={C.skinDark} />
        <path d="M-11 -96 Q-5 -101 0 -97 Q5 -101 11 -96 Q5 -92 0 -95 Q-5 -92 -11 -96Z" fill={C.hair} />
        <path
          d={worried ? 'M-5 -87 Q0 -91 5 -87' : 'M-6 -89 Q0 -83 6 -89'}
          stroke={C.ink}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  );
}

/* --------------------------------------------------------------------- car */

// mood: grumpy | happy | smug | sleepy. Origin = ground under the car's left edge; it faces right.
function Car({ x, y, s = 1, mood = 'grumpy', bumper = true, smoke = false, scarf = false, lights = false }) {
  const eye = { cx: 131, cy: -76, r: 11 };
  const lid = { grumpy: 0.3, happy: 0, smug: 0.5, sleepy: 0.62 }[mood];
  const chordY = eye.cy - eye.r + 2 * eye.r * lid;
  const half = Math.sqrt(Math.max(eye.r ** 2 - (chordY - eye.cy) ** 2, 0));
  const pupilDx = { grumpy: 3, happy: 0, smug: 4, sleepy: 0 }[mood];
  const brow = {
    grumpy: 'M118 -93 L143 -85',
    happy: 'M120 -91 Q131 -99 142 -91',
    smug: 'M120 -91 L142 -97',
    sleepy: 'M120 -92 L142 -92',
  }[mood];

  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {smoke && (
        <g fill="#e5e7eb">
          <circle cx="-8" cy="-26" r="6" />
          <circle cx="-22" cy="-38" r="9" />
          <circle cx="-38" cy="-30" r="7" />
        </g>
      )}
      {lights && <polygon points="196,-50 380,-92 380,-8" fill="#fde68a" opacity="0.4" />}
      <rect x="6" y="-64" width="190" height="42" rx="15" fill={C.car} />
      <path d="M44 -62 C50 -92 70 -99 95 -99 L130 -99 C150 -99 160 -82 168 -62 Z" fill={C.car} />
      <path d="M58 -65 C62 -86 74 -91 90 -91 L99 -91 L99 -65 Z" fill={C.glass} />
      <path d="M106 -91 L128 -91 C141 -91 149 -79 155 -65 L106 -65 Z" fill={C.glass} />
      <circle cx={eye.cx} cy={eye.cy} r={eye.r} fill={C.white} />
      <circle cx={eye.cx + pupilDx} cy={eye.cy + 1} r="5" fill={C.ink} />
      {lid > 0 && (
        <path d={`M${eye.cx - half} ${chordY} A${eye.r} ${eye.r} 0 ${lid > 0.5 ? 1 : 0} 1 ${eye.cx + half} ${chordY} Z`} fill={C.car} />
      )}
      <circle cx={eye.cx} cy={eye.cy} r={eye.r} fill="none" stroke={C.ink} strokeWidth="1.6" />
      <path d={brow} stroke={C.ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M100 -64 L100 -28" stroke={C.carDark} strokeWidth="2" />
      <rect x="86" y="-50" width="10" height="3.5" rx="1.7" fill={C.carDark} />
      <path d="M14 -52 Q22 -44 14 -36" stroke={C.carDark} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="190" cy="-48" r="6.5" fill={lights ? '#fef08a' : '#fff7c2'} stroke={C.carDark} strokeWidth="1.5" />
      <rect x="0" y="-34" width="14" height="10" rx="3" fill="#9ca3af" />
      {bumper && <rect x="186" y="-34" width="15" height="10" rx="3" fill="#9ca3af" />}
      {scarf && (
        <g>
          <rect x="183" y="-37" width="21" height="7" rx="3" fill="#ef4444" />
          <rect x="183" y="-32" width="21" height="2.4" fill="#fecaca" />
          <path d="M195 -31 L199 -18 L203 -20 L201 -31Z" fill="#ef4444" />
        </g>
      )}
      {[45, 155].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="-18" r="19" fill={C.ink} />
          <circle cx={cx} cy="-18" r="8" fill={C.hub} />
          <circle cx={cx} cy="-18" r="2.6" fill="#9ca3af" />
        </g>
      ))}
    </g>
  );
}

/* ------------------------------------------------------------- scenery bits */

function Sun({ x = 340, y = 55 }) {
  return <circle cx={x} cy={y} r="26" fill="#fcd34d" />;
}

function Cloud({ x, y, s = 1, color = C.cloud }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <ellipse cx="0" cy="0" rx="30" ry="12" />
      <ellipse cx="-14" cy="-9" rx="16" ry="12" />
      <ellipse cx="10" cy="-12" rx="18" ry="13" />
    </g>
  );
}

function House({ x, y, w = 70, h = 60, wall, roof }) {
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={wall} />
      <polygon points={`${x - 6},${y - h} ${x + w / 2},${y - h - 30} ${x + w + 6},${y - h}`} fill={roof} />
      <rect x={x + w / 2 - 8} y={y - 30} width="16" height="30" rx="2" fill="#fff" opacity="0.85" />
      <rect x={x + 8} y={y - h + 12} width="14" height="14" rx="2" fill="#fff" opacity="0.85" />
    </g>
  );
}

function Tree({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-5" y="-40" width="10" height="40" fill="#92400e" />
      <circle cx="0" cy="-58" r="28" fill="#4ade80" />
      <circle cx="-16" cy="-44" r="16" fill="#4ade80" />
      <circle cx="16" cy="-46" r="17" fill="#4ade80" />
    </g>
  );
}

function Bubble({ x, y, w, h = 28, tail = 'left', children, color = C.ink, size = 13 }) {
  const tailPath =
    tail === 'left'
      ? `M${x + 14} ${y + h} L${x + 6} ${y + h + 12} L${x + 28} ${y + h}`
      : `M${x + w - 28} ${y + h} L${x + w - 6} ${y + h + 12} L${x + w - 14} ${y + h}`;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="12" fill="#fff" stroke={C.ink} strokeWidth="2" />
      <path d={tailPath} fill="#fff" stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <rect x={x + 10} y={y + h - 2} width={w - 20} height="4" fill="#fff" />
      <text x={x + w / 2} y={y + h / 2 + size / 3} textAnchor="middle" fontSize={size} fontWeight="700" fill={color} fontFamily="system-ui, sans-serif">
        {children}
      </text>
    </g>
  );
}

function Banana() {
  return (
    <g transform="translate(-4 -6) rotate(-20)">
      <path d="M-2 4 C 8 -16 26 -18 38 -8 C 24 -12 10 -2 -2 4 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="38" cy="-8" r="1.8" fill="#78350f" />
    </g>
  );
}

function Sweat({ x, y }) {
  return (
    <g fill="#60a5fa">
      <path d={`M${x} ${y} q-5 8 0 11 q5 -3 0 -11z`} />
      <path d={`M${x + 14} ${y + 8} q-4 7 0 9 q4 -2 0 -9z`} />
    </g>
  );
}

function Heart({ x, y, s = 1 }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 8 C-14 -4 -10 -16 0 -9 C10 -16 14 -4 0 8Z"
      fill="#f43f5e"
    />
  );
}

/* ------------------------------------------------------------------ scenes */

function StreetScene() {
  return (
    <>
      <rect width="400" height="300" fill="#dff1ff" />
      <Sun />
      <Cloud x={80} y={50} />
      <Cloud x={230} y={80} s={0.7} />
      <rect y="196" width="400" height="44" fill="#bbe7a6" />
      <House x={20} y={206} wall="#fde68a" roof="#f87171" />
      <House x={104} y={206} w={56} h={48} wall="#c7d2fe" roof="#94a3b8" />
      <Tree x={380} y={226} s={0.9} />
      <rect y="238" width="400" height="62" fill="#cbd5e1" />
      <path d="M0 272 H400" stroke="#fff" strokeWidth="4" strokeDasharray="22 16" />
      <Car x={96} y={262} mood="grumpy" smoke />
      <Man x={338} y={262} flip left={[-26, -42]} right={[44, -68]} />
      <Bubble x={266} y={90} w={92} tail="right">Good day!</Bubble>
      <text x="34" y="228" fontSize="13" fontWeight="700" fill={C.ink} fontFamily="system-ui, sans-serif">achoo!</text>
    </>
  );
}

function HonkScene() {
  return (
    <>
      <rect width="400" height="300" fill="#dff1ff" />
      <Sun x={60} y={55} />
      <Cloud x={250} y={55} />
      <rect y="196" width="400" height="44" fill="#bbe7a6" />
      <House x={250} y={206} w={70} h={56} wall="#fbcfe8" roof="#a78bfa" />
      <rect y="238" width="400" height="62" fill="#cbd5e1" />
      <path d="M0 272 H400" stroke="#fff" strokeWidth="4" strokeDasharray="22 16" />
      <Car x={170} y={262} mood="grumpy" />
      <Man x={92} y={262} right={[40, -86]} left={[-26, -44]} worried>
        <g transform="translate(40 -86)">
          <Banana />
        </g>
      </Man>
      <Sweat x={64} y={134} />
      <Bubble x={236} y={88} w={104} h={34} tail="left" color="#dc2626" size={17}>HONK!</Bubble>
    </>
  );
}

function RoadScene() {
  return (
    <>
      <rect width="400" height="300" fill="#e0f2fe" />
      <Sun x={70} y={60} />
      <Cloud x={200} y={50} s={0.8} />
      <ellipse cx="90" cy="206" rx="140" ry="52" fill="#a7e8a0" />
      <ellipse cx="320" cy="212" rx="150" ry="46" fill="#86d98a" />
      <rect y="214" width="400" height="86" fill="#cbd5e1" />
      <path d="M0 262 H400" stroke="#fff" strokeWidth="4" strokeDasharray="22 16" />
      <g stroke="#94a3b8" strokeWidth="4" strokeLinecap="round">
        <path d="M20 218 H70" />
        <path d="M6 236 H62" />
        <path d="M24 254 H72" />
      </g>
      <Car x={118} y={262} mood="smug" />
      <circle cx="170" cy="184" r="14" fill={C.skin} />
      <circle cx="165" cy="181" r="2.2" fill={C.ink} />
      <circle cx="176" cy="181" r="2.2" fill={C.ink} />
      <path d="M164 189 Q170 194 177 189" stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M161 175 Q170 168 179 175" stroke={C.hair} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M180 190 L204 152" stroke={C.skin} strokeWidth="7" strokeLinecap="round" />
      <circle cx="205" cy="150" r="6" fill={C.skin} />
      {/* pigeon */}
      <g transform="translate(300 80)">
        <ellipse cx="0" cy="0" rx="18" ry="11" fill="#94a3b8" />
        <circle cx="16" cy="-6" r="8" fill="#94a3b8" />
        <polygon points="23,-7 31,-5 23,-3" fill="#f59e0b" />
        <circle cx="18" cy="-8" r="1.8" fill={C.ink} />
        <path d="M-6 -4 Q-16 -26 4 -22 Q0 -12 6 -4Z" fill="#64748b" />
        <path d="M-16 2 L-30 8 L-16 8Z" fill="#64748b" />
      </g>
      <path d="M262 74 H236 M268 86 H246" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      {/* Colin the snail */}
      <g transform="translate(352 252)">
        <path d="M-26 0 Q-26 -10 -14 -10 L16 -10 Q28 -10 28 0 Z" fill="#a8a29e" />
        <circle cx="-2" cy="-20" r="15" fill="#f59e0b" />
        <circle cx="-2" cy="-20" r="9" fill="#fbbf24" />
        <circle cx="-2" cy="-20" r="3.5" fill="#f59e0b" />
        <path d="M22 -10 L26 -26" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" />
        <circle cx="26" cy="-28" r="3" fill="#a8a29e" />
        <path d="M28 -4 L44 -18" stroke="#a8a29e" strokeWidth="3" strokeLinecap="round" />
      </g>
      <text x="340" y="288" fontSize="12" fontWeight="700" fill={C.ink} fontFamily="system-ui, sans-serif">Colin</text>
    </>
  );
}

function MarketScene() {
  return (
    <>
      <rect width="400" height="300" fill="#dff1ff" />
      <Cloud x={70} y={36} s={0.7} />
      <Cloud x={340} y={44} s={0.6} />
      <rect x="40" y="70" width="320" height="150" fill="#e2e8f0" />
      <rect x="130" y="72" width="140" height="28" rx="4" fill="#1e293b" />
      <text x="200" y="92" textAnchor="middle" fontSize="16" fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif" letterSpacing="2">
        MARKET
      </text>
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={40 + i * 32} y="108" width="32" height="26" fill={i % 2 ? '#fff' : '#f87171'} />
      ))}
      <rect x="40" y="134" width="320" height="4" fill="#cbd5e1" />
      <rect x="178" y="150" width="44" height="70" rx="3" fill="#bfdbfe" stroke="#94a3b8" strokeWidth="2" />
      <path d="M200 150 V220" stroke="#94a3b8" strokeWidth="2" />
      <rect x="60" y="150" width="80" height="44" rx="3" fill="#bfdbfe" />
      <rect x="260" y="150" width="80" height="44" rx="3" fill="#bfdbfe" />
      <rect y="220" width="400" height="80" fill="#cbd5e1" />
      <path d="M0 296 H400" stroke="#fff" strokeWidth="3" strokeDasharray="18 14" />
      <Car x={26} y={264} s={0.9} mood="happy" bumper={false} />
      <Man x={252} y={264} s={0.95} lean={22} left={[26, -52]} right={[38, -58]}>
        <rect x="26" y="-66" width="26" height="12" rx="4" fill="#9ca3af" transform="rotate(-6 39 -60)" />
      </Man>
      {/* onlooker clapping */}
      <g transform="translate(366 264)">
        <rect x="-12" y="-44" width="9" height="44" rx="4" fill="#475569" />
        <rect x="3" y="-44" width="9" height="44" rx="4" fill="#475569" />
        <rect x="-16" y="-88" width="32" height="48" rx="14" fill="#f472b6" />
        <circle cx="0" cy="-102" r="15" fill={C.skinDark} />
        <path d="M-15 -104 Q-14 -122 0 -121 Q14 -122 15 -104 Q8 -112 0 -110 Q-8 -112 -15 -104Z" fill="#1f2937" />
        <circle cx="-5" cy="-103" r="2" fill={C.ink} />
        <circle cx="5" cy="-103" r="2" fill={C.ink} />
        <path d="M-5 -96 Q0 -92 5 -96" stroke={C.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M-12 -74 L-4 -64 M12 -74 L4 -64" stroke="#f472b6" strokeWidth="8" strokeLinecap="round" />
      </g>
      <g transform="translate(340 126) rotate(8)">
        <rect width="52" height="26" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
        <text x="26" y="17" textAnchor="middle" fontSize="10" fontWeight="800" fill="#b45309" fontFamily="system-ui, sans-serif">COUPON</text>
      </g>
      <text x="126" y="176" fontSize="15" fontWeight="800" fill="#dc2626" fontFamily="system-ui, sans-serif" transform="rotate(-8 126 176)">CLANG!</text>

    </>
  );
}

function NightScene() {
  const stars = [[40, 40], [90, 80], [150, 36], [210, 70], [260, 30], [370, 100], [60, 130], [330, 150], [120, 110]];
  return (
    <>
      <rect width="400" height="300" fill="#1e293b" />
      {stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.4 : 1.6} fill="#fef9c3" />
      ))}
      <circle cx="326" cy="58" r="24" fill="#fef3c7" />
      <circle cx="318" cy="52" r="5" fill="#fde68a" />
      <circle cx="334" cy="68" r="3.5" fill="#fde68a" />
      <rect x="20" y="146" width="64" height="70" fill="#0f172a" />
      <polygon points="14,146 52,118 90,146" fill="#0b1220" />
      <rect x="34" y="162" width="14" height="14" fill="#fbbf24" />
      <rect x="58" y="162" width="14" height="14" fill="#fbbf24" />
      <rect x="318" y="160" width="60" height="56" fill="#0f172a" />
      <polygon points="312,160 348,134 384,160" fill="#0b1220" />
      <rect x="332" y="174" width="14" height="14" fill="#fbbf24" />
      <rect y="216" width="400" height="84" fill="#334155" />
      <path d="M0 282 H400" stroke="#64748b" strokeWidth="3" strokeDasharray="18 14" />
      <Car x={136} y={262} mood="sleepy" scarf lights />
      <Man x={100} y={262} right={[40, -60]} left={[-26, -44]} />
      <Heart x={210} y={120} s={1.3} />
      <Heart x={232} y={96} s={0.8} />
      <text x="156" y="150" fontSize="14" fontWeight="700" fill="#cbd5e1" fontFamily="system-ui, sans-serif">zzz…</text>
    </>
  );
}

const SCENES = {
  street: StreetScene,
  honk: HonkScene,
  road: RoadScene,
  market: MarketScene,
  night: NightScene,
};

export const SCENE_NAMES = Object.keys(SCENES);

export default function Illustration({ scene, label }) {
  const Scene = SCENES[scene] || StreetScene;
  return (
    <svg viewBox="0 0 400 300" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice" className="illustration">
      <Scene />
    </svg>
  );
}
