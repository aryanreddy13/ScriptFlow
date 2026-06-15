import React, { useState } from 'react';

export default function ScriptTable({ scripts, onRunScript, onViewLogs, onNavigateToScheduler }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredScripts = scripts.filter(script => 
    script.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
    script.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-panelBg border border-panelBorder flex flex-col h-full font-mono select-none text-[#EAEAEA]">
      {/* Control Panel / Search Header */}
      <div className="p-4 border-b border-panelBorder flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-[#0F0F0F]">
        <div className="flex items-center gap-2">
          <span className="text-brandAccent text-xs font-bold">[SCRIPTS_REGISTRY]</span>
          <span className="text-[10px] text-[#71717A] px-2 py-0.5 border border-panelBorder bg-[#0A0A0A]">
            ACTIVE: {scripts.length}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="SEARCH SCRIPTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0A0A0A] border border-panelBorder text-xs text-[#EAEAEA] px-3 py-1.5 pl-8 focus:outline-none focus:border-brandAccent w-full sm:w-64 placeholder-[#555]"
            />
            <span className="absolute left-2.5 top-2.5 text-[#71717A]">🔍</span>
          </div>
          {/* Quick Schedule Navigation Button */}
          <button
            onClick={onNavigateToScheduler}
            className="bg-[#0A0A0A] border border-panelBorder text-[11px] text-brandFg font-bold px-3 py-1.5 hover:bg-brandAccent hover:text-white transition-colors duration-150 flex items-center justify-center gap-1.5 btn-press"
          >
            +
            [CREATE_TASK]
          </button>
        </div>
      </div>

      {/* Responsive table container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full min-w-[700px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-panelBorder bg-[#0F0F0F] text-[#71717A] text-[10px] font-bold">
              <th className="p-3 w-[20%]">[SCRIPT IDENTIFIER]</th>
              <th className="p-3 w-[35%]">[FUNCTIONAL DESCRIPTION]</th>
              <th className="p-3 w-[15%]">[LAST EXECUTION]</th>
              <th className="p-3 w-[15%]">[TELEMETRY STATUS]</th>
              <th className="p-3 w-[15%] text-right">[ACTIONS]</th>
            </tr>
          </thead>
          <tbody>
            {filteredScripts.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-[#71717A] bg-[#0A0A0A]/50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-[#333] text-2xl mb-1">•</span>
                    <span>NO MATCHING AUTOMATION SCRIPTS REGISTERED ON CORE</span>
                    <span className="text-[10px] text-[#555]">MODIFY FILTER QUERY OR DEFINE NEW SCRIPTS</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredScripts.map((script, idx) => {
                const isRunning = script.lastStatus === 'RUNNING';
                const isFailed = script.lastStatus === 'FAILED';
                const isSuccess = script.lastStatus === 'SUCCESS';

                return (
                  <tr
                    key={script.id}
                    className="border-b border-panelBorder hover:bg-[#161616] transition-colors duration-100 group"
                  >
                    {/* Name / File */}
                    <td className="p-3 font-semibold align-top">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex w-2.5 h-2.5 rounded-sm bg-brandAccent" />
                        <span className="text-white font-mono group-hover:text-brandAccent transition-colors duration-150">
                          {script.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#71717A] font-mono mt-0.5">
                        {script.file}
                      </div>
                    </td>

                    {/* Description */}
                    <td className="p-3 text-[#9CA3AF] leading-relaxed align-top text-[11px]">
                      {script.description}
                      <div className="flex gap-3 mt-1.5 text-[9px] text-[#71717A] font-mono">
                        <span>[CRON: {script.cron}]</span>
                        <span>[FREQ: {script.frequency.toUpperCase()}]</span>
                      </div>
                    </td>

                    {/* Last Run & Duration */}
                    <td className="p-3 align-top font-mono text-[#EAEAEA]">
                      <div>{script.lastRun || 'NEVER'}</div>
                      {script.lastRun && (
                        <div className="text-[10px] text-[#71717A] mt-0.5">
                          ELAPSED: {script.duration}
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="p-3 align-top font-mono">
                      {isRunning ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-brandWarning/30 bg-brandWarning/10 text-[#F59E0B] font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 bg-brandWarning animate-pulse-fast"></span>
                          RUNNING
                        </div>
                      ) : isFailed ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-brandFailure/30 bg-brandFailure/10 text-brandFailure font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 bg-brandFailure"></span>
                          FAILED
                        </div>
                      ) : isSuccess ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-brandSuccess/30 bg-brandSuccess/10 text-brandSuccess font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 bg-brandSuccess"></span>
                          SUCCESS
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#333] bg-[#1a1a1a] text-[#71717A] font-bold text-[10px]">
                          <span className="w-1.5 h-1.5 bg-[#444]"></span>
                          IDLE
                        </div>
                      )}
                      
                      {isFailed && script.errorMessage && (
                        <div className="text-[9px] text-brandFailure mt-1 line-clamp-1 border-t border-brandFailure/10 pt-0.5 max-w-[200px]" title={script.errorMessage}>
                          {script.errorMessage}
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3 text-right align-top space-y-2 sm:space-y-0 sm:space-x-1.5">
                      <button
                        onClick={() => onRunScript(script.id)}
                        disabled={isRunning}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[10px] font-bold transition-all btn-press ${
                          isRunning
                            ? 'bg-[#181818] border border-[#2A2A2A] text-[#555] cursor-not-allowed'
                            : 'bg-brandBg border border-panelBorder text-brandFg hover:border-brandSuccess hover:text-brandSuccess'
                        }`}
                      >
                        ▶
                        [RUN]
                      </button>
                      <button
                        onClick={() => onViewLogs(script.id)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-1 text-[10px] font-bold bg-[#0A0A0A] border border-panelBorder text-brandFg hover:border-brandAccent hover:text-brandAccent transition-all btn-press"
                      >
                        LOG
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
