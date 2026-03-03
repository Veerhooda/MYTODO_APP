import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

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

  // Generate radial particles to match the reference image
  const particles = useMemo(() => {
    const rings = [
      { radius: 0, count: 1, size: 24 },
      { radius: 40, count: 8, size: 24 },
      { radius: 80, count: 16, size: 24 },
      { radius: 120, count: 24, size: 24 },
      { radius: 160, count: 32, size: 24 },
      { radius: 200, count: 40, size: 24 }
    ];

    let allParticles = [];
    
    rings.forEach((ring, ringIdx) => {
      for (let i = 0; i < ring.count; i++) {
        const offsetAngle = (ringIdx % 2 !== 0) ? (Math.PI / ring.count) : 0; // Stagger rings
        const angle = (i / ring.count) * Math.PI * 2 + offsetAngle;
        const x = Math.cos(angle) * ring.radius;
        const y = Math.sin(angle) * ring.radius;
        
        allParticles.push({
          id: `${ringIdx}-${i}`,
          x,
          y,
          size: ring.size,
          delay: (ringIdx * 0.15) // Stagger animation delay slightly by ring outward for a wave effect
        });
      }
    });
    
    return allParticles;
  }, []);

  return (
    <div className="focus-mode-void">
      {/* Zen Particles */}
      {Array.from({ length: 35 }).map((_, i) => (
        <div 
          key={i} 
          className="focus-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 15}s`,
            animationDuration: `${12 + Math.random() * 10}s`,
            opacity: Math.random() * 0.5
          }}
        />
      ))}

      <div className="focus-content-zen">
        {/* Complex Radial Orb */}
        <div className="focus-radial-orb">
          {particles.map(p => (
            <div 
              key={p.id}
              className="radial-dot"
              style={{
                width: p.size,
                height: p.size,
                transform: `translate(${p.x}px, ${p.y}px)`,
                animationDelay: `${p.delay}s`
              }}
            />
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
