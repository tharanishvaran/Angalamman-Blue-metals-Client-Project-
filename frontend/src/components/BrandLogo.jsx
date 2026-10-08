import React from 'react';

/**
 * BrandLogo — Official Sri Angalamman Blue Metals Animated Crest Emblem
 *
 * Features:
 * - High-definition emblem depicting Goddess Angalamman, temple lamps,
 *   heavy earthmoving machinery (excavator & dumper), and blue metal crushed aggregates.
 * - Multi-layered GPU-accelerated animations:
 *   1. Pulsing golden/royal blue radial aura
 *   2. Dual counter-rotating golden & cyan celestial orbit rings
 *   3. Polished metallic light beam shine sweep
 *   4. Smooth breathing micro-float levitation
 *   5. Interactive 3D hover reaction with radiant drop-shadow flare
 *   6. Dynamic twinkling star sparkles
 */
export default function BrandLogo({
  size = 46,
  showRing = true,
  showAura = true,
  showShine = true,
  showFloat = false,
  showSparkles = false,
  animated = true,
  interactive = true,
  showText = false,
  textPosition = 'right', // 'right' | 'bottom'
  subtitle = 'Blue Metals • Puducherry',
  tamilTag = 'ஸ்ரீ அங்காளம்மன் ப்ளூ மெட்டல்ஸ்',
  className = '',
  style = {},
  onClick
}) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <div
      className={`brand-logo-wrapper ${className}`}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flexDirection: textPosition === 'bottom' ? 'column' : 'row',
        gap: textPosition === 'bottom' ? '0.5rem' : '0.85rem',
        textDecoration: 'none',
        ...style
      }}
    >
      {/* Emblem Frame with layered effects */}
      <div
        className={`brand-logo-container ${animated ? 'animated' : ''} ${showFloat && animated ? 'brand-logo-float' : ''}`}
        style={{
          width: pixelSize,
          height: pixelSize,
          position: 'relative',
          flexShrink: 0
        }}
        title="Sri Angalamman Blue Metals — Official Crest"
      >
        {/* 1. Pulsing Radial Aura Glow */}
        {showAura && animated && <div className="brand-logo-aura" aria-hidden="true" />}

        {/* 2. Outer Dual Counter-Rotating Celestial Orbit Rings */}
        {showRing && animated && (
          <>
            <div className="brand-logo-ring" aria-hidden="true" />
            <div className="brand-logo-ring-outer" aria-hidden="true" />
          </>
        )}

        {/* 3. Twinkling Corner Sparkle Stars */}
        {showSparkles && animated && (
          <>
            <div className="brand-sparkle-dot" style={{ top: '-4px', right: '4px', animationDelay: '0.2s' }} aria-hidden="true" />
            <div className="brand-sparkle-dot" style={{ bottom: '-2px', left: '2px', animationDelay: '1.4s' }} aria-hidden="true" />
          </>
        )}

        {/* 4. Circular Logo Image Frame */}
        <div
          className="brand-logo-img-wrap"
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <img
            src="/logo.png"
            alt="Sri Angalamman Blue Metals Official Emblem"
            className="brand-logo-img"
            loading="eager"
            onError={(e) => {
              // Fallback to assets path if public fails
              if (!e.target.src.includes('media_')) {
                e.target.src = '/images/hero.jpg';
              }
            }}
          />

          {/* 5. Metallic Light Flare Sweep */}
          {showShine && animated && <div className="brand-logo-shine" aria-hidden="true" />}
        </div>
      </div>

      {/* Optional Brand Typography */}
      {showText && (
        <div style={{ textAlign: textPosition === 'bottom' ? 'center' : 'left' }}>
          {tamilTag && (
            <div
              style={{
                fontSize: '0.7rem',
                color: '#fbbf24',
                fontWeight: 700,
                letterSpacing: '0.04em',
                lineHeight: 1.2,
                fontFamily: 'inherit',
                textShadow: '0 0 10px rgba(251, 191, 36, 0.4)'
              }}
            >
              {tamilTag}
            </div>
          )}
          <div
            style={{
              fontWeight: 800,
              fontSize: typeof size === 'number' && size >= 60 ? '1.45rem' : '1.2rem',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <span>Sri Angalamman</span>
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: '0.72rem',
                color: '#f97316',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '0.1rem'
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
