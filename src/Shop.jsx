import { Bot, Coins, Heart, Hourglass, Magnet, ShoppingBag, Star, Turtle } from 'lucide-react';
import { UPGRADES } from './upgrades';

const UPGRADE_ICONS = {
  turtle: Turtle,
  star: Star,
  magnet: Magnet,
  bot: Bot,
  hourglass: Hourglass,
  heart: Heart,
};

export default function Shop({ points, upgrades, onBuy, onClose }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Side panel */}
      <div className="fixed right-0 top-0 h-full w-80 z-50 bg-slate-950/95 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
          <h2 className="flex items-center gap-2 text-white font-bold text-lg">
            <ShoppingBag size={19} strokeWidth={2.2} className="text-sky-300" />
            <span>Shop</span>
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Pearl stash */}
        <div
          className="px-5 py-3 border-b border-white/10 shrink-0"
          style={{ background: 'rgba(234,179,8,0.06)' }}
        >
          <p className="text-xs text-yellow-300/70 uppercase tracking-widest mb-0.5">Pearl Stash</p>
          <p className="flex items-center gap-2 text-2xl font-black text-yellow-400">
            <Coins size={22} strokeWidth={2.4} />
            <span>{points.toLocaleString()}</span>
          </p>
        </div>

        {/* Upgrade list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {UPGRADES.map((upg) => {
            const Icon = UPGRADE_ICONS[upg.icon];
            const level = upgrades[upg.key] || 0;
            const maxed = level >= upg.maxLevel;
            const cost = maxed ? null : upg.costs[level];
            const canAfford = !maxed && points >= cost;

            return (
              <div
                key={upg.key}
                className="bg-white/5 rounded-2xl p-4 border border-white/10"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-2 text-sky-200">
                    <Icon size={20} strokeWidth={2.2} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-white font-bold text-sm">{upg.label}</span>
                      <span className="text-xs text-sky-400/80">{level}/{upg.maxLevel}</span>
                    </div>
                    <p className="text-xs text-white/50 leading-snug mb-2">{upg.description}</p>
                    {/* Level progress bars */}
                    <div className="flex gap-1">
                      {Array.from({ length: upg.maxLevel }, (_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            i < level ? 'bg-sky-400' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => canAfford && onBuy(upg.key)}
                  disabled={maxed || !canAfford}
                  className={`w-full mt-3 py-2 rounded-xl text-sm font-bold transition-all duration-150
                    ${maxed
                      ? 'bg-emerald-500/15 text-emerald-400 cursor-default'
                      : canAfford
                        ? 'bg-sky-500 hover:bg-sky-400 active:scale-95 text-white cursor-pointer'
                        : 'bg-white/8 text-white/25 cursor-not-allowed'
                    }`}
                >
                  {maxed ? '✓ Maxed' : `Buy — ${cost?.toLocaleString()} pearls`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 border-t border-white/10 shrink-0">
          <p className="text-xs text-white/25 text-center">Hover bubbles to pop them</p>
        </div>
      </div>
    </>
  );
}
