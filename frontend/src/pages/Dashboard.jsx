import { useMemo, useState } from 'react';
import useRuns from '../hooks/useRuns';
import useScripts from '../hooks/useScripts';
import StatusBadge from '../components/StatusBadge';
import { seedFirestore } from '../utils/seedFirestore';

const quickTriggers = [
  'Backup Processor',
  'Sales Report',
  'Email Digest',
];

export default function Dashboard() {
  const { runs } = useRuns();
  const { scripts } = useScripts();
  const [recentAction, setRecentAction] = useState('No actions triggered yet.');
  const [seeding, setSeeding] = useState(false);
  const [seedDone, setSeedDone] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await seedFirestore();
      const total = result.scripts + result.runs + result.schedules;
      if (total === 0) {
        setSeedDone('Collections already have data — nothing to seed.');
      } else {
        setSeedDone(`Seeded: ${result.scripts} scripts, ${result.runs} runs, ${result.schedules} schedules.`);
      }
    } catch (err) {
      setSeedDone(`Error: ${err.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const metrics = useMemo(() => {
    const totalScripts = scripts.length;
    const jobsRunToday = runs.filter((run) => run.triggeredAt.includes(new Date().toISOString().slice(0, 10))).length;
    const successfulRuns = runs.filter((run) => run.status === 'Success').length;
    const failedRuns = runs.filter((run) => run.status === 'Failed').length;
    const runningJobs = scripts.filter((script) => script.status === 'Running').length;
    return {
      totalScripts,
      jobsRunToday,
      successfulRuns,
      failedRuns,
      runningJobs,
      nextScheduledRun: '02:00 UTC',
    };
  }, [runs, scripts]);

  const activeJobs = useMemo(
    () => scripts.filter((script) => script.status === 'Running'),
    [scripts]
  );

  const recentRuns = useMemo(
    () => runs.slice(0, 7).reverse(),
    [runs]
  );

  const handleTrigger = (label) => {
    setRecentAction(`Triggered ${label} at ${new Date().toLocaleTimeString('en-US', { hour12: false })}`);
  };

  return (
    <div className="space-y-6">
      {/* Seed Banner */}
      {(seedDone || (!scripts.length && !runs.length)) && (
        <div className="flex flex-col gap-3 rounded border border-[#333] bg-[#111111] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#9CA3AF]">Database Setup</p>
            <p className="mt-1 text-sm text-[#D4D4D8]">
              {seedDone || 'No data found in Firestore. Make sure your Security Rules are set, then seed the database.'}
            </p>
          </div>
          {!seedDone && (
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="shrink-0 rounded border border-brandAccent bg-[#0A0A0A] px-4 py-2 text-sm uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:bg-brandAccent hover:text-black disabled:opacity-50"
            >
              {seeding ? 'Seeding...' : 'Seed Database'}
            </button>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#71717A]">Total Scripts</p>
          <p className="mt-3 font-sans text-4xl font-bold text-white">{metrics.totalScripts}</p>
        </div>
        <div className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#71717A]">Jobs Run Today</p>
          <p className="mt-3 font-sans text-4xl font-bold text-white">{metrics.jobsRunToday}</p>
        </div>
        <div className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#71717A]">Successful Runs</p>
          <p className="mt-3 font-sans text-4xl font-bold text-white">{metrics.successfulRuns}</p>
        </div>
        <div className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#71717A]">Failed Runs</p>
          <p className="mt-3 font-sans text-4xl font-bold text-white">{metrics.failedRuns}</p>
        </div>
        <div className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#71717A]">Running Jobs</p>
          <p className="mt-3 font-sans text-4xl font-bold text-white">{metrics.runningJobs}</p>
        </div>
        <div className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#71717A]">Next Scheduled Run</p>
          <p className="mt-3 font-sans text-4xl font-bold text-white">{metrics.nextScheduledRun}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded border border-panelBorder bg-[#111111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold uppercase tracking-[0.22em] text-[#71717A]">Active Task Execution</p>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9CA3AF]">Realtime view</span>
          </div>

          {activeJobs.length ? (
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="rounded border border-[#222] bg-[#0B0B0B] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#EAEAEA]">{job.name}</p>
                      <p className="mt-1 text-[11px] text-[#71717A]">{job.filePath}</p>
                    </div>
                    <StatusBadge variant="running">Running</StatusBadge>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
                      <span>Runtime</span>
                      <span>{job.duration}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#0D0D0D]">
                      <div className="h-full rounded-full bg-[#EAB308]" style={{ width: '64%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative flex h-[120px] items-center justify-center rounded border border-[#222] bg-[#0B0B0B] overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-[2px] w-[60%] animate-pulse bg-[#1a1a1a]" />
              </div>
              <p className="relative z-10 text-sm text-[#9CA3AF]">No active jobs are executing right now.</p>
            </div>
          )}
        </section>

        <section className="rounded border border-panelBorder bg-[#111111] p-5">
          <p className="font-semibold uppercase tracking-[0.22em] text-[#71717A]">Quick Trigger Chips</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {quickTriggers.map((chip) => (
              <button
                key={chip}
                onClick={() => handleTrigger(chip)}
                className="rounded border border-panelBorder bg-[#0A0A0A] px-4 py-2 text-sm uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
              >
                {chip}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded border border-[#222] bg-[#0B0B0B] p-4 text-sm text-[#D4D4D8]">
            {recentAction}
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded border border-panelBorder bg-[#111111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold uppercase tracking-[0.22em] text-[#71717A]">Last 7 Days Runs</p>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9CA3AF]">Timeline</span>
          </div>
          <div className="h-72 rounded border border-[#222] bg-[#0A0A0A] p-4">
            <div className="flex h-full items-end gap-3 pb-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex h-full flex-1 flex-col justify-end text-center">
                  <div className="mx-auto mb-2 w-full rounded bg-brandAccent" style={{ height: `${20 + [10, 45, 30, 80, 50, 25, 60][i]}%` }} />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#71717A]">{day}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded border border-panelBorder bg-[#111111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-semibold uppercase tracking-[0.22em] text-[#71717A]">Success Rate</p>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#9CA3AF]">Current Trend</span>
          </div>
          <div className="space-y-4 rounded border border-[#222] bg-[#0A0A0A] p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-[#EAEAEA]">
              <span>Success Ratio</span>
              <span>{runs.length ? `${Math.round((metrics.successfulRuns / runs.length) * 100)}%` : 'N/A'}</span>
            </div>
            <div className="h-48 rounded bg-[#0A0A0A] p-4">
              <div className="relative h-full w-full rounded border border-[#222] bg-[#080808]">
                <div className={`absolute inset-x-0 bottom-0 mx-4 mb-4 h-2 rounded-full ${runs.length ? 'bg-[#22C55E]' : 'bg-[#333]'}`} style={{ width: runs.length ? `${Math.round((metrics.successfulRuns / runs.length) * 100)}%` : '100%' }} />
              </div>
            </div>
            <p className="text-sm leading-6 text-[#D4D4D8]">
              The last seven days show stable execution performance with success metrics aligned to operational targets.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
