import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

const PALETTES = [
  { c1: '#00c6fb', c2: '#005bea', eye: '#4facfe', barb: '#7dd3fc' },
  { c1: '#0cebeb', c2: '#20e3b2', eye: '#29ffc6', barb: '#5eead4' },
  { c1: '#38f9d7', c2: '#43e97b', eye: '#72faca', barb: '#86efac' },
  { c1: '#a8edea', c2: '#fed6e3', eye: '#c1f0ed', barb: '#99f6e4' },
  { c1: '#667eea', c2: '#764ba2', eye: '#a78bfa', barb: '#c4b5fd' },
  { c1: '#00f2fe', c2: '#4facfe', eye: '#67e8f9', barb: '#bae6fd' },
  { c1: '#43e97b', c2: '#38f9d7', eye: '#86efac', barb: '#6ee7b7' },
  { c1: '#4facfe', c2: '#00f2fe', eye: '#7dd3fc', barb: '#a5f3fc' },
];

function FeatherSVG({ size, c1, c2, eye, barb, id }) {
  return (
    <svg width={size * 0.4} height={size} viewBox="0 0 40 100" fill="none" style={{ display: 'block' }}>
      <defs>
        <radialGradient id={`eg-${id}`} cx="50%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="25%" stopColor={eye} />
          <stop offset="55%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`sg-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.5" />
          <stop offset="50%" stopColor={c2} stopOpacity="0.2" />
          <stop offset="100%" stopColor={c2} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Shaft */}
      <path d="M20 100 Q20 55, 20 12" stroke={`url(#sg-${id})`} strokeWidth="1.2" fill="none" opacity="0.6" />
      {/* Outer vane */}
      <path d="M20 6 C8 14, 1 26, 3 42 C4 50, 10 58, 20 62 C30 58, 36 50, 37 42 C39 26, 32 14, 20 6Z" fill={c2} opacity="0.08" />
      {/* Mid vane */}
      <path d="M20 9 C11 16, 4 26, 6 40 C7 47, 12 54, 20 57 C28 54, 33 47, 34 40 C36 26, 29 16, 20 9Z" fill={c1} opacity="0.15" />
      {/* Inner vane */}
      <path d="M20 12 C14 18, 8 28, 10 38 C11 43, 15 50, 20 52 C25 50, 29 43, 30 38 C32 28, 26 18, 20 12Z" fill={c1} opacity="0.2" />
      {/* Eye outer */}
      <ellipse cx="20" cy="30" rx="10" ry="13" fill={`url(#eg-${id})`} opacity="0.6" />
      {/* Eye mid */}
      <ellipse cx="20" cy="29" rx="6" ry="7.5" fill={eye} opacity="0.8" />
      {/* Eye pupil */}
      <ellipse cx="20" cy="28" rx="3" ry="3.5" fill="#0a1628" opacity="0.7" />
      {/* Highlight */}
      <ellipse cx="21" cy="27" rx="1.5" ry="1.8" fill="#fff" opacity="0.6" />
      {/* Barbs left */}
      <path d="M20 14 C16 18, 12 24, 8 32" stroke={barb} strokeWidth="0.3" opacity="0.12" fill="none" />
      <path d="M20 18 C16 22, 11 28, 9 36" stroke={barb} strokeWidth="0.25" opacity="0.1" fill="none" />
      <path d="M20 22 C17 26, 13 32, 10 40" stroke={barb} strokeWidth="0.25" opacity="0.08" fill="none" />
      <path d="M20 28 C17 32, 14 38, 12 44" stroke={barb} strokeWidth="0.2" opacity="0.07" fill="none" />
      <path d="M20 34 C18 38, 15 42, 13 48" stroke={barb} strokeWidth="0.2" opacity="0.06" fill="none" />
      <path d="M20 40 C18 44, 16 48, 15 52" stroke={barb} strokeWidth="0.2" opacity="0.05" fill="none" />
      {/* Barbs right */}
      <path d="M20 14 C24 18, 28 24, 32 32" stroke={barb} strokeWidth="0.3" opacity="0.12" fill="none" />
      <path d="M20 18 C24 22, 29 28, 31 36" stroke={barb} strokeWidth="0.25" opacity="0.1" fill="none" />
      <path d="M20 22 C23 26, 27 32, 30 40" stroke={barb} strokeWidth="0.25" opacity="0.08" fill="none" />
      <path d="M20 28 C23 32, 26 38, 28 44" stroke={barb} strokeWidth="0.2" opacity="0.07" fill="none" />
      <path d="M20 34 C22 38, 25 42, 27 48" stroke={barb} strokeWidth="0.2" opacity="0.06" fill="none" />
      <path d="M20 40 C22 44, 24 48, 25 52" stroke={barb} strokeWidth="0.2" opacity="0.05" fill="none" />
      {/* Hairlines near eye */}
      <path d="M14 24 C16 26, 18 28, 20 28" stroke={barb} strokeWidth="0.15" opacity="0.15" fill="none" />
      <path d="M26 24 C24 26, 22 28, 20 28" stroke={barb} strokeWidth="0.15" opacity="0.15" fill="none" />
      <path d="M12 34 C15 35, 18 36, 20 36" stroke={barb} strokeWidth="0.15" opacity="0.1" fill="none" />
      <path d="M28 34 C25 35, 22 36, 20 36" stroke={barb} strokeWidth="0.15" opacity="0.1" fill="none" />
    </svg>
  );
}

export default function FocusMode({ onExit }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed(s => s + 1), 1000);
    const handler = (e) => { if (e.key === 'Escape') onExit(); };
    window.addEventListener('keydown', handler);
    return () => { clearInterval(id); window.removeEventListener('keydown', handler); };
  }, [onExit]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  // Track fan cycle phase (0-100) — synced to the 10s animation
  const [visibleCount, setVisibleCount] = useState(35);
  useEffect(() => {
    const FAN_DURATION = 10000; // 10s matches CSS
    const startTime = Date.now();
    const ticker = setInterval(() => {
      const phase = ((Date.now() - startTime) % FAN_DURATION) / FAN_DURATION * 100;
      // As fan feathers fly away (50-95%), increase background count
      // As new feathers emerge (0-25%), return to base count
      if (phase >= 50 && phase < 95) {
        const progress = (phase - 50) / 45; // 0 to 1
        setVisibleCount(Math.round(35 + progress * 25)); // 35 → 60
      } else {
        const progress = phase < 50 ? phase / 25 : (100 - phase) / 5;
        setVisibleCount(Math.round(60 - Math.min(progress, 1) * 25)); // 60 → 35
      }
    }, 200);
    return () => clearInterval(ticker);
  }, []);

  // Generate the full pool of floating feathers (60 max)
  const floatingFeathers = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const p = PALETTES[i % PALETTES.length];
      return {
        id: `fl-${i}`,
        left: Math.random() * 100,
        size: 40 + Math.random() * 35,
        delay: Math.random() * 14,
        duration: 10 + Math.random() * 10,
        swayAmount: 80 + Math.random() * 170,
        swayDuration: 2 + Math.random() * 3,
        initialRotation: Math.random() * 360,
        rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 400),
        opacity: 0.15 + Math.random() * 0.4,
        ...p,
      };
    });
  }, []);

  /*
   * Peacock tail fan — MANY more feathers, centered symmetrically.
   * Each feather's angle is measured from straight-up (0°).
   * Negative = left side, positive = right side.
   * The fan spans 180° total (-90° to +90°).
   */
  const fanFeathers = useMemo(() => {
    const layers = [
      { count: 21, radius: 200, size: 85, arc: 180 }, // outer ring — widest
      { count: 17, radius: 165, size: 78, arc: 160 }, // second ring
      { count: 13, radius: 130, size: 70, arc: 130 }, // third ring
      { count: 9,  radius: 95,  size: 60, arc: 100 }, // fourth ring
      { count: 5,  radius: 60,  size: 50, arc: 50  }, // inner ring — tightest
    ];

    let all = [];
    layers.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        // Spread evenly across the arc, centered at 0° (top)
        const halfArc = layer.arc / 2;
        const angleDeg = -halfArc + (i / (layer.count - 1 || 1)) * layer.arc;

        const p = PALETTES[(li * 3 + i) % PALETTES.length];
        all.push({
          id: `fan-${li}-${i}`,
          angleDeg, // degrees from straight up (-90 to +90)
          radius: layer.radius,
          size: layer.size,
          delay: li * 0.12 + Math.abs(angleDeg) * 0.003, // outer feathers slightly later
          ...p,
        });
      }
    });
    return all;
  }, []);

  return (
    <div className="focus-mode-void">
      {/* Ambient background mist — always present */}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`amb-${i}`}
          className="ambient-mist"
          style={{
            left: `${(i / 11) * 100}%`,
            top: `${15 + Math.random() * 70}%`,
            '--amb-size': `${100 + Math.random() * 150}px`,
            '--amb-drift-x': `${(Math.random() > 0.5 ? 1 : -1) * (30 + Math.random() * 80)}px`,
            '--amb-drift-y': `${(Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 50)}px`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${12 + Math.random() * 10}s`,
          }}
        />
      ))}
      {/* Floating Feather Particles — count pulses with fan cycle */}
      {floatingFeathers.map((f, i) => (
        <div
          key={f.id}
          className="focus-leaf"
          style={{
            left: `${f.left}%`,
            '--leaf-sway': `${f.swayAmount}px`,
            '--leaf-sway-dur': `${f.swayDuration}s`,
            '--leaf-rotation': `${f.rotationSpeed}deg`,
            '--leaf-initial-rot': `${f.initialRotation}deg`,
            animationDelay: `${f.delay}s`,
            animationDuration: `${f.duration}s`,
            opacity: i < visibleCount ? f.opacity : 0,
            transition: 'opacity 0.8s ease',
          }}
        >
          <FeatherSVG size={f.size} c1={f.c1} c2={f.c2} eye={f.eye} barb={f.barb} id={f.id} />
        </div>
      ))}

      <div className="focus-content-zen">
        {/* Peacock Tail Fan */}
        <div className="peacock-fan">
          <div className="peacock-fan-base" />

          {/* Mist particles — appear when feathers vanish */}
          {Array.from({ length: 18 }, (_, i) => (
            <div
              key={`mist-${i}`}
              className="fan-mist"
              style={{
                '--mist-angle': `${-100 + (i / 17) * 200}deg`,
                '--mist-size': `${80 + Math.random() * 120}px`,
                animationDelay: `${i * 0.06}s`,
              }}
            />
          ))}

          {fanFeathers.map(f => (
            <div
              key={f.id}
              className="peacock-fan-feather"
              style={{
                '--fan-angle': `${f.angleDeg}deg`,
                '--fan-radius': `${f.radius}px`,
                animationDelay: `${f.delay}s`,
              }}
            >
              <FeatherSVG size={f.size} c1={f.c1} c2={f.c2} eye={f.eye} barb={f.barb} id={f.id} />
            </div>
          ))}
        </div>

        <div className="focus-typography-shifted">
          <h1 className="focus-title-minimal">FOCUS</h1>
          <div className="focus-elapsed-zen">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>

        <button className="focus-exit-ghost shifted" onClick={onExit}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
