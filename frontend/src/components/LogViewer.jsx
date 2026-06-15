import React, { useEffect, useRef } from 'react';

export default function LogViewer({ logs, isStreaming, onTogglePause, onClearLogs, selectedScriptName }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && isStreaming) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, isStreaming]);

  const downloadPlaintextLogs = () => {
    if (logs.length === 0) return;
    const cleanLogsStr = logs.map(l => (typeof l === 'string' ? l : l.text)).join('\n');
    const blob = new Blob([cleanLogsStr], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${selectedScriptName || 'scriptflow'}_execution_log_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getLogColor = (line) => {
    const text = String(line);
    if (text.includes('[SUCCESS]')) return 'text-brandSuccess';
    if (text.includes('[ERROR]') || text.includes('[FATAL]') || text.includes('Traceback') || text.startsWith('  File ') || text.includes('Error:')) return 'text-brandFailure';
    if (text.includes('[WARNING]') || text.includes('[WARN]')) return 'text-brandWarning';
    if (text.includes('[CRITICAL]')) return 'text-brandFailure font-bold underline decoration-brandFailure';
    if (text.startsWith('>>>') || text.startsWith('===')) return 'text-brandAccent';
    return 'text-[#D1D5DB]';
  };

  return (
    <div className="bg-panelBg border border-panelBorder flex flex-col h-[500px] font-mono text-xs select-none">
      <div className="p-3 border-b border-panelBorder bg-[#0F0F0F] flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="inline-flex w-2.5 h-2.5 rounded-sm bg-brandAccent" />
          <span className="font-bold text-brandFg">
            [RUN LOG VIEWER] <span className="text-[#71717A] text-[10px] ml-1">{selectedScriptName ? `// TARGET: ${selectedScriptName.toUpperCase()}` : '// AWAITING TARGET'}</span>
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <span className={`w-2 h-2 rounded-none ${isStreaming ? 'bg-brandSuccess animate-pulse-fast' : 'bg-[#71717A]'}`}></span>
            <span className="text-[9px] text-[#71717A] font-bold">
              {isStreaming ? 'WS_STREAMING_ACTIVE' : 'STREAM_PAUSED'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <button
            onClick={onTogglePause}
            disabled={logs.length === 0}
            className={`px-2 py-1 border font-bold flex items-center justify-center transition-all btn-press ${
              logs.length === 0
                ? 'border-[#222] text-[#444] cursor-not-allowed'
                : isStreaming
                ? 'border-brandWarning/50 text-[#F59E0B] bg-[#F59E0B]/5 hover:bg-[#F59E0B]/15'
                : 'border-brandSuccess/50 text-brandSuccess bg-brandSuccess/5 hover:bg-brandSuccess/15'
            }`}
          >
            {isStreaming ? '⏸' : '▶'} {isStreaming ? '[PAUSE STREAM]' : '[RESUME STREAM]'}
          </button>

          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className={`px-2 py-1 border font-bold transition-all btn-press ${
              logs.length === 0
                ? 'border-[#222] text-[#444] cursor-not-allowed'
                : 'border-panelBorder text-[#EAEAEA] hover:border-brandFailure hover:text-brandFailure hover:bg-brandFailure/5'
            }`}
          >
            DEL [CLEAR]
          </button>

          <button
            onClick={downloadPlaintextLogs}
            disabled={logs.length === 0}
            className={`px-2 py-1 border font-bold transition-all btn-press ${
              logs.length === 0
                ? 'border-[#222] text-[#444] cursor-not-allowed'
                : 'border-panelBorder text-[#EAEAEA] hover:border-brandAccent hover:text-brandAccent hover:bg-brandAccent/5'
            }`}
          >
            DL [EXPORT]
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 bg-[#0A0A0A] p-4 overflow-y-auto space-y-1 font-mono text-[11px] selection:bg-brandAccent selection:text-white leading-relaxed border-b border-panelBorder select-text"
        style={{ scrollBehavior: 'smooth' }}
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#71717A] text-[10px] space-y-2 select-none">
            <span className="text-[#333] text-2xl animate-pulse">•</span>
            <span>SOCKET CHANNEL EMPTY // LISTENING FOR AGENT EMISSIONS</span>
            <span className="text-[#555]">TRIGGER A RUN ACTION IN REGISTERED SCRIPTS TO START STREAMING</span>
          </div>
        ) : (
          <>
            {logs.map((line, idx) => (
              <div key={idx} className={`font-mono ${getLogColor(line)}`}>
                {line}
              </div>
            ))}
            {isStreaming && (
              <div className="flex items-center gap-1 text-[11px] text-[#71717A] font-mono mt-1 select-none">
                <span>[PROCESS ACTIVE]</span>
                <span className="w-1.5 h-3 bg-brandSuccess animate-blink"></span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-2 px-3 bg-[#0D0D0D] text-[9px] text-[#71717A] flex justify-between items-center select-none font-mono">
        <span>CHANNEL: WS://CORE-DAEMON:8000/TELEMETRY/STREAM</span>
        <span>BUFFER_SIZE: {logs.length} LINES</span>
        <span>ENCODING: UTF-8</span>
      </div>
    </div>
  );
}
