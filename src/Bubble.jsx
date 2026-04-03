/**
 * A bubble that moves across the screen using CSS keyframes.
 * The wrapper owns pathing, the shell adds a gentle bob, and the inner core
 * handles the pop animation so those transforms do not conflict.
 */
export default function Bubble({
  id,
  size,
  isPopping,
  basePoints,
  startX,
  startY,
  endX,
  endY,
  midX,
  midY,
  totalRotation,
  duration,
  motionType = 'cross',
  bubbleStyle,
  bobDelay = '0s',
  hoverRadius = 0,
  onPop,
  onExpire,
}) {
  const animationName = motionType === 'drift' ? 'bubble-drift' : 'bubble-cross';

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: `${size}px`,
        height: `${size}px`,
        willChange: 'transform',
        pointerEvents: 'none',
        '--start-x': `${startX}px`,
        '--start-y': `${startY}px`,
        '--mid-x': `${midX ?? (startX + endX) / 2}px`,
        '--mid-y': `${midY ?? (startY + endY) / 2}px`,
        '--end-x': `${endX}px`,
        '--end-y': `${endY}px`,
        '--total-rotation': `${totalRotation}deg`,
        animation: `${animationName} ${duration}s linear forwards`,
        animationPlayState: isPopping ? 'paused' : 'running',
      }}
      onAnimationEnd={(event) => {
        if (event.animationName === animationName) onExpire(id);
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: `-${hoverRadius}px`,
          borderRadius: '50%',
          pointerEvents: isPopping ? 'none' : 'auto',
          cursor: isPopping ? 'default' : 'crosshair',
        }}
        onMouseEnter={(event) => !isPopping && onPop(id, basePoints, event.clientX, event.clientY)}
      />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          animation: `bubble-sway ${Math.max(2.8, duration * 0.45)}s ease-in-out ${bobDelay} infinite`,
          animationPlayState: isPopping ? 'paused' : 'running',
          willChange: 'transform',
        }}
      >
        <div
          className={isPopping ? 'bubble-pop' : ''}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: bubbleStyle.fill,
            boxShadow: [
              `0 12px 34px ${bubbleStyle.glow}`,
              `0 0 0 1px ${bubbleStyle.rim}`,
              'inset 0 -10px 18px rgba(0,0,0,0.24)',
              'inset 0 6px 16px rgba(255,255,255,0.18)',
            ].join(', '),
            opacity: 0.96,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '9%',
              borderRadius: '50%',
              border: `1px solid ${bubbleStyle.rim}`,
              opacity: 0.55,
            }}
          />
          {bubbleStyle.ring && (
            <div
              style={{
                position: 'absolute',
                inset: '16%',
                borderRadius: '50%',
                border: `2px solid ${bubbleStyle.ring}`,
                opacity: 0.7,
                animation: 'space-pulse 2.8s ease-in-out infinite',
              }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '12%',
              width: '46%',
              height: '34%',
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 40% 35%, ${bubbleStyle.sparkle} 0%, rgba(255,255,255,0) 100%)`,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: '18%',
              bottom: '16%',
              width: '24%',
              height: '24%',
              borderRadius: '50%',
              background: bubbleStyle.core,
              filter: 'blur(1px)',
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'linear-gradient(150deg, rgba(255,255,255,0.1) 0%, transparent 46%, rgba(0,0,0,0.12) 100%)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </div>
  );
}
