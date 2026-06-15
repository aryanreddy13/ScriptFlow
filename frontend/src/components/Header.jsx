import { useEffect, useMemo, useState } from 'react';

export default function Header({ title, onMenuClick }) {
  const [localTime, setLocalTime] = useState('00:00:00');
  const [utcTime, setUtcTime] = useState('00:00:00');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setUtcTime(now.toUTCString().slice(17, 25));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusText = useMemo(() => 'SYS_HEALTH: NOMINAL', []);

  return (
    <header className="border-b border-panelBorder bg-[#111111] px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="inline-flex items-center justify-center rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] transition hover:border-brandAccent lg:hidden"
            >
              Menu
            </button>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#71717A]">{title}</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-[#EAEAEA]">{title}</h1>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex items-center rounded-full border border-panelBorder bg-[#090909] px-3 py-2 text-[11px] uppercase tracking-[0.22em] text-[#EAEAEA]">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#22C55E]"></span>
            {statusText}
          </div>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.24em] text-[#9CA3AF]">
            <div>
              <div className="text-[9px] uppercase tracking-[0.35em] text-[#71717A]">UTC</div>
              <div className="mt-1 font-mono font-semibold text-[#EAEAEA]">{utcTime}</div>
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-[0.35em] text-[#71717A]">Local</div>
              <div className="mt-1 font-mono font-semibold text-[#EAEAEA]">{localTime}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
