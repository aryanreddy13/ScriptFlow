import React, { useMemo, useState } from 'react';
import useRuns from '../hooks/useRuns';
import StatusBadge from '../components/StatusBadge';

const statusOptions = ['All', 'Success', 'Failed', 'Running'];

export default function History() {
  const { runs } = useRuns();
  const [filters, setFilters] = useState({ scriptName: '', status: 'All', startDate: '', endDate: '' });
  const [expanded, setExpanded] = useState([]);
  const [page, setPage] = useState(1);

  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesScript = filters.scriptName
        ? run.scriptName.toLowerCase().includes(filters.scriptName.toLowerCase())
        : true;

      const matchesStatus = filters.status === 'All' ? true : run.status === filters.status;
      const matchesStart = filters.startDate ? run.triggeredAt >= filters.startDate : true;
      const matchesEnd = filters.endDate ? run.triggeredAt <= filters.endDate : true;

      return matchesScript && matchesStatus && matchesStart && matchesEnd;
    });
  }, [filters, runs]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredRuns.length / pageSize));
  const pagedRuns = filteredRuns.slice((page - 1) * pageSize, page * pageSize);

  const toggleRow = (id) => {
    setExpanded((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="rounded border border-panelBorder bg-[#111111] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-[0.3em] text-[#71717A]">Run History</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={filters.scriptName}
              onChange={(event) => setFilters((current) => ({ ...current, scriptName: event.target.value }))}
              className="w-full sm:w-auto rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
              placeholder="Script Name"
            />
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="w-full sm:w-auto rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
              className="w-full sm:w-auto rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
            />
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
              className="w-full sm:w-auto rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded border border-panelBorder bg-[#111111] p-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#222] text-[10px] uppercase tracking-[0.3em] text-[#6b7280]">
              <th className="px-3 py-3">Script Name</th>
              <th className="px-3 py-3">Triggered At</th>
              <th className="px-3 py-3">Duration</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Output</th>
            </tr>
          </thead>
          <tbody>
            {pagedRuns.map((run) => (
              <React.Fragment key={run.id}>
                <tr className="border-b border-[#222] hover:bg-[#0A0A0A]">
                  <td className="px-3 py-4 text-[#EAEAEA]">{run.scriptName}</td>
                  <td className="px-3 py-4 text-[#D4D4D8]">{run.triggeredAt}</td>
                  <td className="px-3 py-4 text-[#9CA3AF]">{run.duration}</td>
                  <td className="px-3 py-4">
                    <StatusBadge variant={run.status === 'Success' ? 'success' : run.status === 'Failed' ? 'failed' : 'running'}>
                      {run.status}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-4">
                    <button
                      onClick={() => toggleRow(run.id)}
                      className="rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
                    >
                      {expanded.includes(run.id) ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>
                {expanded.includes(run.id) && (
                  <tr className="bg-[#0B0B0B]">
                    <td colSpan={5} className="px-3 py-4 text-sm text-[#D4D4D8]">
                      <div className="grid gap-4 lg:grid-cols-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-[#71717A]">Logs</p>
                          <pre className="mt-2 max-h-40 overflow-auto rounded border border-[#222] bg-[#0A0A0A] p-3 text-[11px] leading-relaxed text-[#EAEAEA]">
{run.output.join('\n')}
                          </pre>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-[#71717A]">Metadata</p>
                          <div className="mt-2 space-y-2 rounded border border-[#222] bg-[#0A0A0A] p-3 text-[11px] text-[#D4D4D8]">
                            <div><strong>OS:</strong> {run.metadata.os}</div>
                            <div><strong>PID:</strong> {run.metadata.pid}</div>
                            <div><strong>Exit Code:</strong> {run.metadata.exitCode}</div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.28em] text-[#71717A]">Errors</p>
                          <div className="mt-2 rounded border border-[#222] bg-[#0A0A0A] p-3 text-[11px] text-[#D4D4D8]">
                            {run.error || 'No errors reported.'}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-[#9CA3AF]">
        <div>{filteredRuns.length} results found</div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
          >
            Previous
          </button>
          <span>Page {page} of {pageCount}</span>
          <button
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            className="rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
