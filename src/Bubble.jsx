const COLORS = [
  'bg-blue-400',
  'bg-purple-400',
  'bg-pink-400',
  'bg-cyan-400',
  'bg-green-400',
  'bg-yellow-400',
  'bg-red-400',
  'bg-orange-400',
  'bg-indigo-400',
  'bg-teal-400',
];

export default function Bubble({ id, x, y, size, colorIndex, onPop, isPopping }) {
  const color = COLORS[colorIndex % COLORS.length];

  return (
    <button
      onClick={() => onPop(id)}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      className={`absolute rounded-full ${color} opacity-80 shadow-lg cursor-pointer
        flex items-center justify-center select-none
        transition-transform duration-100
        ${isPopping ? 'scale-150 opacity-0' : 'scale-100 hover:scale-110 animate-bounce'}
      `}
      aria-label="Pop bubble"
    >
      <span className="text-white text-xl font-bold pointer-events-none">
        {isPopping ? '💥' : ''}
      </span>
    </button>
  );
}
