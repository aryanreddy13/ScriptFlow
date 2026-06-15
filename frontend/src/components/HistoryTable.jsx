import React, { useState } from 'react';

export default function HistoryTable({ history, statusFilter, setStatusFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalStatusFilter, setInternalStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState('triggeredAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Lifted state resolution
  const activeFilter = setStatusFilter ? statusFilter : internalStatusFilter;
  const setActiveFilter = setStatusFilter ? setStatusFilter : setInternalStatusFilter;

  const toggleRow = (id) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(id);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc when changing fields
    }
  };

  // 1. Filter history
  const filteredHistory = history.filter(item => {
    const matchesSearch = item.scriptName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.file.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = activeFilter === 'ALL' || item.status === activeFilter;
    return matchesSearch && matchesStatus;
  });

  // 2. Sort history
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (aValue === undefined) return 1;
    if (bValue === undefined) return -1;

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // 3. Paginate history
  const totalItems = sortedHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = sortedHistory.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-panelBg border border-panelBorder flex flex-col h-full font-mono text-[#EAEAEA] select-none text-xs">
      
      {/* Top Filter Bar */}
      <div className="p-4 border-b border-panelBorder flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-[#0F0F0F]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-brandAccent text-xs font-bold">[RUN_HISTORY_LOG]</span>
          
          {/* Quick Filters */}
          <div className="flex gap-1 border border-panelBorder p-0.5 bg-[#0A0A0A]">
            {['ALL', 'SUCCESS', 'FAILED'].map(status => (
              <button
                key={status}
                onClick={() => { setActiveFilter(status); setCurrentPage(1); }}
                className={`px-2 py-0.5 text-[9px] font-bold transition-all ${
                  activeFilter === status
                    ? 'bg-[#222] text-white'
                    : 'text-[#71717A] hover:text-[#EAEAEA]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 items-stretch">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="FILTER BY SCRIPT..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="bg-[#0A0A0A] border border-panelBorder text-xs text-[#EAEAEA] px-3 py-1.5 pl-8 focus:outline-none focus:border-brandAccent w-full sm:w-56 placeholder-[#555]"
            />
            <span className="absolute left-2.5 top-2.5 text-[#71717A]">🔍</span>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-panelBorder bg-[#0F0F0F] text-[#71717A] text-[10px] font-bold">
              <th className="p-3 w-[5%]"></th>
              <th className="p-3 w-[25%] cursor-pointer hover:bg-[#151515]" onClick={() => handleSort('scriptName')}>
                [SCRIPT_NAME] {sortField === 'scriptName' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 w-[25%] cursor-pointer hover:bg-[#151515]" onClick={() => handleSort('triggeredAt')}>
                [TRIGGERED_AT_UTC] {sortField === 'triggeredAt' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 w-[15%] cursor-pointer hover:bg-[#151515]" onClick={() => handleSort('duration')}>
                [DURATION] {sortField === 'duration' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 w-[15%] cursor-pointer hover:bg-[#151515]" onClick={() => handleSort('status')}>
                [STATUS] {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-3 w-[15%] text-right">[EXPAND_STDOUT]</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistory.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-[#71717A] bg-[#0A0A0A]/50">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <span className="text-[#333] text-[20px] mb-1">▾</span>
                    <span>NO MATCHING JOB EXECUTION HISTORY LOGGED</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedHistory.map((item) => {
                const isExpanded = expandedRowId === item.id;
                const isFailed = item.status === 'FAILED';

                return (
                  <React.Fragment key={item.id}>
                    <tr
                      className={`border-b border-panelBorder transition-colors duration-100 cursor-pointer hover:bg-[#161616] ${
                        isExpanded ? 'bg-[#121212]' : ''
                      }`}
                      onClick={() => toggleRow(item.id)}
                    >
                      {/* Collapse Indicators */}
                      <td className="p-3 text-center text-[#71717A]">
                        {isExpanded ? '▾' : '▸'}
                      </td>
                      
                      {/* Name & File */}
                      <td className="p-3 font-semibold text-white">
                        <div>{item.scriptName}</div>
                        <div className="text-[9px] text-[#71717A] font-mono mt-0.5">{item.file}</div>
                      </td>

                      {/* Triggered At */}
                      <td className="p-3 font-mono text-[#EAEAEA]">{item.triggeredAt}</td>

                      {/* Duration */}
                      <td className="p-3 font-mono text-[#9CA3AF]">{item.duration}</td>

                      {/* Status */}
                      <td className="p-3 font-mono">
                        {isFailed ? (
                          <span className="text-brandFailure font-bold px-1.5 py-0.5 border border-brandFailure/30 bg-brandFailure/5">[ FAILED ]</span>
                        ) : (
                          <span className="text-brandSuccess font-bold px-1.5 py-0.5 border border-brandSuccess/30 bg-brandSuccess/5">[ SUCCESS ]</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right">
                        <button
                          className={`text-[10px] font-bold px-2 py-0.5 border transition-all ${
                            isExpanded
                              ? 'border-brandAccent text-brandAccent bg-brandAccent/5'
                              : 'border-panelBorder text-[#71717A] hover:border-brandFg hover:text-brandFg'
                          }`}
                        >
                          {isExpanded ? '[CLOSE]' : '[VIEW]'}
                        </button>
                      </td>
                    </tr>

                    {/* Expandable details panel */}
                    {isExpanded && (
                      <tr className="bg-[#0A0A0A]/90 border-b border-panelBorder">
                        <td colSpan="6" className="p-4 font-mono select-text">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                            
                            {/* Execution Metadata block */}
                            <div className="lg:col-span-1 border border-panelBorder p-3 bg-[#0F0F0F] space-y-1.5 text-[10px] text-[#9CA3AF] select-none">
                              <div className="text-brandAccent font-bold text-[11px] border-b border-panelBorder pb-1 flex items-center gap-1.5">
                                [EXECUTION METADATA]
                              </div>
                              <div className="flex justify-between mt-1">
                                <span>RUN_ID:</span>
                                <span className="text-white">{item.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>PYTHON_ENV:</span>
                                <span className="text-white">v{item.metadata.python}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>SYSTEM_OS:</span>
                                <span className="text-white">{item.metadata.os}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>DAEMON_PID:</span>
                                <span className="text-white">{item.metadata.pid}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>PEAK_MEMORY:</span>
                                <span className="text-white">{item.metadata.peakMemory}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>PROCESSED_ITEMS:</span>
                                <span className="text-white">{item.metadata.recordsProcessed}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>TRIGGERED_BY:</span>
                                <span className="text-brandAccent font-bold">{item.triggerType}</span>
                              </div>
                              <div className="flex justify-between border-t border-panelBorder/50 pt-1.5 mt-1 font-bold">
                                <span>EXIT_CODE:</span>
                                <span className={isFailed ? 'text-brandFailure' : 'text-brandSuccess'}>
                                  {item.metadata.exitCode} {isFailed ? '(CRITICAL)' : '(NOMINAL)'}
                                </span>
                              </div>
                            </div>

                            {/* Failure Diagnostic Output */}
                            {isFailed && (
                              <div className="lg:col-span-2 border border-brandFailure/30 p-3 bg-brandFailure/5 text-[10px] space-y-1 select-none">
                                <div className="text-brandFailure font-bold text-[11px] border-b border-brandFailure/20 pb-1 flex items-center gap-1.5">
                                  <span className="text-brandFailure">!</span>
                                  [DIAGNOSTIC CRASH REPORT]
                                </div>
                                <div className="text-brandFailure mt-1.5 bg-[#0F0A0A] p-2 border border-brandFailure/20 font-bold overflow-x-auto leading-relaxed">
                                  {item.logs.find(line => line.includes('[ERROR]') || line.includes('[FATAL]')) || 'Fatal script crash: unknown core exception.'}
                                </div>
                                <div className="text-[#71717A] text-[9px] mt-1.5 leading-relaxed">
                                  SUGGESTION: Verify endpoint accessibility, firewall rules, SMTP ports, and python dependency declarations inside requirements.txt.
                                </div>
                              </div>
                            )}

                            {/* Success Metadata message */}
                            {!isFailed && (
                              <div className="lg:col-span-2 border border-panelBorder p-3 bg-[#0F0F0F] text-[10px] flex flex-col justify-between select-none">
                                <div>
                                  <div className="text-brandSuccess font-bold text-[11px] border-b border-panelBorder pb-1 flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-brandSuccess"></span>
                                    [RUN EXECUTION SUCCESS]
                                  </div>
                                  <div className="text-[#9CA3AF] mt-2 leading-relaxed">
                                    Process completed successfully with exit code 0. Memory and system limits remained within allocated bounds. Transaction logs verified and archived.
                                  </div>
                                </div>
                                <div className="text-[#71717A] text-[9px] border-t border-panelBorder/50 pt-1 mt-2">
                                  STDOUT buffers successfully pushed to S3 telemetry indexes.
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Raw Output Terminal Logs Box */}
                          <div className="space-y-1 text-left">
                            <div className="text-[10px] text-[#71717A] font-bold uppercase mb-1 flex justify-between select-none">
                              <span>[STDOUT / STDERR CONSOLE BUFFER]</span>
                              <span>LINES: {item.logs.length}</span>
                            </div>
                            <div className="bg-[#050505] border border-panelBorder p-3 text-[10px] max-h-48 overflow-y-auto space-y-1 font-mono leading-relaxed select-text">
                              {item.logs.map((logLine, logIdx) => {
                                let color = 'text-[#888]';
                                if (logLine.includes('[SUCCESS]')) color = 'text-brandSuccess';
                                else if (logLine.includes('[ERROR]') || logLine.includes('[FATAL]') || logLine.startsWith('  File ') || logLine.includes('Error:')) color = 'text-brandFailure';
                                else if (logLine.includes('[WARNING]') || logLine.includes('[WARN]')) color = 'text-[#F59E0B]';
                                else if (logLine.includes('[INFO]')) color = 'text-[#DDD]';

                                return (
                                  <div key={logIdx} className={color}>
                                    {logLine}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-panelBorder bg-[#0F0F0F] flex flex-col sm:flex-row justify-between items-center gap-3 select-none text-[10px] text-[#71717A]">
        <div>
          <span>SHOWING {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + itemsPerPage, totalItems)} OF {totalItems} RECORDS</span>
          {activeFilter !== 'ALL' && <span> (FILTERED STATUS: {activeFilter})</span>}
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`px-2 py-0.5 border ${
              currentPage === 1
                ? 'border-[#222] text-[#444] cursor-not-allowed'
                : 'border-panelBorder text-brandFg hover:border-brandAccent hover:text-brandAccent'
            } font-bold`}
          >
            [ &lt;&lt; ]
          </button>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-2 py-0.5 border ${
              currentPage === 1
                ? 'border-[#222] text-[#444] cursor-not-allowed'
                : 'border-panelBorder text-brandFg hover:border-brandAccent hover:text-brandAccent'
            } font-bold`}
          >
            [ PREV ]
          </button>
          
          <span className="px-3 text-white font-bold">
            {String(currentPage).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-2 py-0.5 border ${
              currentPage === totalPages
                ? 'border-[#222] text-[#444] cursor-not-allowed'
                : 'border-panelBorder text-brandFg hover:border-brandAccent hover:text-brandAccent'
            } font-bold`}
          >
            [ NEXT ]
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`px-2 py-0.5 border ${
              currentPage === totalPages
                ? 'border-[#222] text-[#444] cursor-not-allowed'
                : 'border-panelBorder text-brandFg hover:border-brandAccent hover:text-brandAccent'
            } font-bold`}
          >
            [ &gt;&gt; ]
          </button>
        </div>
      </div>
    </div>
  );
}
