import { useEffect, useMemo, useRef, useState } from 'react';
import useScripts from '../hooks/useScripts';

const streamTemplates = {
  default: [
    '[12:00:01] Starting script...',
    '[12:00:03] Loading records...',
    '[12:00:07] Processing batch 1...',
    '[12:00:12] Completed successfully.',
  ],
  failed: [
    '[12:00:01] Starting script...',
    '[12:00:04] Connecting to external service...',
    '[12:00:08] Error: Connection refused',
    '[12:00:09] Script failed with exit code 1.',
  ],
};

export default function Logs() {
  const { scripts } = useScripts();
  const [selectedScript, setSelectedScript] = useState('');
  const [logs, setLogs] = useState([]);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setSelectedScript(scripts[0]?.name || 'Backup Processor');
  }, [scripts]);

  useEffect(() => {
    setLogs([`[${new Date().toLocaleTimeString('en-US', { hour12: false })}] Waiting for log stream...`]);
  }, [selectedScript]);

  useEffect(() => {
    if (paused) return undefined;

    const interval = setInterval(() => {
      setLogs((current) => {
        const nextLine = streamTemplates[selectedScript?.toLowerCase().includes('backup') ? 'default' : 'failed'][current.length % 4];
        return [...current, nextLine];
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [paused, selectedScript]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const availableScripts = useMemo(
    () => scripts.length ? scripts : [{ id: 'script-01', name: 'Backup Processor' }, { id: 'script-02', name: 'Sales Report' }],
    [scripts]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
        <div className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[#71717A]">Live Logs</p>
          <h2 className="mt-2 text-2xl font-black text-[#EAEAEA]">Terminal Viewer</h2>
        </div>
        <div className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-[#71717A]">Script Selector</p>
          <select
            value={selectedScript}
            onChange={(event) => setSelectedScript(event.target.value)}
            className="mt-4 w-full rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
          >
            {availableScripts.map((script) => (
              <option key={script.id} value={script.name}>{script.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded border border-panelBorder bg-[#111111] p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-[#71717A]">Auto-scroll Log Stream</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPaused((current) => !current)}
              className="rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
            >
              {paused ? 'Resume Stream' : 'Pause Stream'}
            </button>
            <button
              onClick={() => setLogs([])}
              className="rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-[#EF4444]"
            >
              Clear Logs
            </button>
          </div>
        </div>
        <div
          ref={containerRef}
          className="h-[420px] overflow-y-auto rounded border border-[#222] bg-[#0A0A0A] p-4 font-mono text-[12px] leading-6 text-[#EAEAEA]"
        >
          {logs.length === 0 ? (
            <p className="text-sm text-[#71717A]">Stream is empty. Select a script to begin.</p>
          ) : (
            logs.map((line, index) => {
              if (line.includes('Waiting for log stream...')) {
                return (
                  <div key={`init-${index}`} className="mb-3">
                    <div className="whitespace-pre-wrap text-[#9CA3AF]">{line}</div>
                    <div className="mt-3 h-px w-full bg-[#333]" />
                  </div>
                );
              }

              const timestampMatch = line.match(/^\[(.*?)\]\s(.*)/);
              if (!timestampMatch) return <div key={`${line}-${index}`} className="whitespace-pre-wrap">{line}</div>;

              const [, timestamp, content] = timestampMatch;
              
              let contentColor = 'text-white';
              const lowerContent = content.toLowerCase();
              if (lowerContent.includes('error') || lowerContent.includes('failed')) {
                contentColor = 'text-[#ef4444]';
              } else if (lowerContent.includes('completed') || lowerContent.includes('success')) {
                contentColor = 'text-[#22c55e]';
              }

              return (
                <div key={`${line}-${index}`} className="whitespace-pre-wrap">
                  <span className="text-[#666]">{`[${timestamp}] `}</span>
                  <span className={contentColor}>{content}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
