import { useMemo, useState, useEffect } from 'react';
import useScripts from '../hooks/useScripts';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

const fallbackSchedules = [
  { id: 'schedule-1', scriptName: 'Backup Processor', cron: '0 2 * * *', nextRun: 'Tomorrow 02:00 UTC', enabled: true },
  { id: 'schedule-2', scriptName: 'Sales Report', cron: '0 8 * * 1-5', nextRun: 'Today 08:00 UTC', enabled: true },
  { id: 'schedule-3', scriptName: 'Email Digest', cron: '0 18 * * *', nextRun: 'Today 18:00 UTC', enabled: false },
];

export default function Scheduler() {
  const { scripts } = useScripts();
  const [schedules, setSchedules] = useState([]);
  const [form, setForm] = useState({ scriptName: '', frequency: 'Daily', customCron: '' });

  useEffect(() => {
    if (!db) {
      setSchedules(fallbackSchedules);
      return;
    }
    const unsubscribe = onSnapshot(collection(db, 'schedules'), (snapshot) => {
      setSchedules(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, () => {
      setSchedules(fallbackSchedules);
    });
    return () => unsubscribe();
  }, []);

  const cronPreview = useMemo(() => {
    if (form.frequency === 'Hourly') return '0 * * * *';
    if (form.frequency === 'Daily') return '0 02 * * *';
    if (form.frequency === 'Weekly') return '0 04 * * 1';
    return form.customCron || '0 00 * * *';
  }, [form]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.scriptName) return;

    const schedule = {
      scriptName: form.scriptName,
      cron: cronPreview,
      nextRun: 'Next execution in 1h',
      enabled: true,
    };

    try {
      if (db) {
        await addDoc(collection(db, 'schedules'), schedule);
      } else {
        setSchedules((current) => [{ id: `schedule-${Date.now()}`, ...schedule }, ...current]);
      }
    } catch (err) {
      console.error(err);
    }
    setForm({ scriptName: '', frequency: 'Daily', customCron: '' });
  };

  const toggleEnabled = async (id) => {
    const item = schedules.find((s) => s.id === id);
    if (!item) return;
    try {
      if (db && !id.startsWith('schedule-')) {
        await updateDoc(doc(db, 'schedules', id), { enabled: !item.enabled });
      } else {
        setSchedules((current) => current.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      if (db && !id.startsWith('schedule-')) {
        await deleteDoc(doc(db, 'schedules', id));
      } else {
        setSchedules((current) => current.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded border border-panelBorder bg-[#111111] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#71717A]">Schedule Matrix</p>
              <h2 className="mt-2 text-2xl font-black text-[#EAEAEA]">Active Cron Schedules</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#222] text-[10px] uppercase tracking-[0.3em] text-[#6b7280]">
                  <th className="px-3 py-3">Script Name</th>
                  <th className="px-3 py-3">Cron Expression</th>
                  <th className="px-3 py-3">Next Run</th>
                  <th className="px-3 py-3">Enabled</th>
                  <th className="px-3 py-3">Delete</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} className="border-b border-[#222] hover:bg-[#0A0A0A]">
                    <td className="px-3 py-4 text-[#EAEAEA]">{schedule.scriptName}</td>
                    <td className="px-3 py-4 text-[#D4D4D8]">{schedule.cron}</td>
                    <td className="px-3 py-4 text-[#9CA3AF]">{schedule.nextRun}</td>
                    <td className="px-3 py-4">
                      <button
                        onClick={() => toggleEnabled(schedule.id)}
                        className={`inline-flex h-7 items-center rounded-full border px-3 text-[10px] uppercase tracking-[0.24em] transition ${schedule.enabled ? 'border-[#22C55E] bg-[#102d12] text-[#22C55E]' : 'border-[#eab308] bg-transparent text-[#eab308]'}`}
                      >
                        {schedule.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>
                    <td className="px-3 py-4">
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-[#EF4444]"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded border border-panelBorder bg-[#111111] p-5">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-[#71717A]">Add Schedule</p>
            <h2 className="mt-2 text-2xl font-black text-[#EAEAEA]">New Cron Job</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-[#9CA3AF]">Script Dropdown</label>
              <select
                value={form.scriptName}
                onChange={(event) => setForm((current) => ({ ...current, scriptName: event.target.value }))}
                className="w-full rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
              >
                <option value="">Select script</option>
                {scripts.map((script) => (
                  <option key={script.id} value={script.name}>{script.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-[#9CA3AF]">Frequency</label>
              <select
                value={form.frequency}
                onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value }))}
                className="w-full rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
              >
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Custom Cron</option>
              </select>
            </div>
            {form.frequency === 'Custom Cron' && (
              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-[#9CA3AF]">Custom Cron</label>
                <input
                  value={form.customCron}
                  onChange={(event) => setForm((current) => ({ ...current, customCron: event.target.value }))}
                  className="w-full rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
                  placeholder="0 2 * * *"
                />
              </div>
            )}
            <div className="rounded border border-[#222] bg-[#0A0A0A] p-4 text-sm text-[#D4D4D8]">
              <p className="mb-2 uppercase tracking-[0.25em] text-[#71717A]">Cron Preview</p>
              <p className="font-mono text-[#EAEAEA]">{cronPreview}</p>
            </div>
            <button
              type="submit"
              className="w-full rounded bg-brandAccent px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#c31818]"
            >
              Save Schedule
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
