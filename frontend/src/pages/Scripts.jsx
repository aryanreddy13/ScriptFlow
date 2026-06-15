import { useEffect, useMemo, useState } from 'react';
import useScripts from '../hooks/useScripts';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

export default function Scripts() {
  const { scripts, loading } = useScripts();
  const [scriptList, setScriptList] = useState([]);
  const [open, setOpen] = useState(false);
  const [newScript, setNewScript] = useState({ name: '', filePath: '', description: '' });

  useEffect(() => {
    setScriptList(scripts);
  }, [scripts]);

  const statusCounts = useMemo(
    () => ({
      running: scriptList.filter((script) => script.status === 'Running').length,
      idle: scriptList.filter((script) => script.status === 'Idle').length,
    }),
    [scriptList]
  );

  const handleRegister = async () => {
    if (!newScript.name || !newScript.filePath) return;
    const created = {
      name: newScript.name,
      filePath: newScript.filePath,
      description: newScript.description || 'Custom automation script.',
      lastRun: 'Never',
      status: 'Idle',
      duration: '00:00:00',
    };
    
    try {
      if (db) {
        await addDoc(collection(db, 'scripts'), created);
      } else {
        setScriptList((current) => [{ id: `script-${Date.now()}`, ...created }, ...current]);
      }
    } catch (err) {
      console.error('Failed to register script:', err);
      alert('Failed to register script in database.');
    }

    setNewScript({ name: '', filePath: '', description: '' });
    setOpen(false);
  };

  const handleRunNow = async (id) => {
    try {
      if (db) {
        const scriptRef = doc(db, 'scripts', id);
        await updateDoc(scriptRef, { status: 'Running', lastRun: 'Just now', duration: '00:01:12' });
        
        const scriptToRun = scriptList.find(s => s.id === id) || { name: 'Unknown Script' };
        await addDoc(collection(db, 'runs'), {
          scriptName: scriptToRun.name,
          triggeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          duration: '00:01:12',
          status: 'Running',
          output: ['[12:00:01] Starting script...', '[12:00:02] Initializing...'],
          metadata: { os: 'Ubuntu 22.04', pid: Math.floor(Math.random() * 1000) + 1000, exitCode: null },
          error: ''
        });
      } else {
        setScriptList((current) =>
          current.map((script) =>
            script.id === id
              ? { ...script, status: 'Running', lastRun: 'Just now', duration: '00:01:12' }
              : script
          )
        );
      }
    } catch (err) {
      console.error('Failed to run script:', err);
      alert('Failed to execute script. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#71717A]">Script Registry</p>
          <h2 className="mt-2 text-2xl font-black text-[#EAEAEA]">Automation Scripts</h2>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded border border-panelBorder bg-[#111111] px-4 py-2 text-sm uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
        >
          Register New Script
        </button>
      </div>


      <div className="rounded border border-panelBorder bg-[#111111] p-4 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#222] text-[10px] uppercase tracking-[0.3em] text-[#6b7280]">
              <th className="px-3 py-3">Script Name</th>
              <th className="px-3 py-3">Description</th>
              <th className="px-3 py-3">Last Run</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && scriptList.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-3 py-16 text-center text-[#9CA3AF]">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <svg className="h-10 w-10 text-[#4B5563]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-sm">No scripts registered yet. Click <strong className="text-white">Register New Script</strong> to begin.</p>
                  </div>
                </td>
              </tr>
            ) : (
              (loading ? [] : scriptList).map((script) => (
                <tr key={script.id} className="border-b border-[#222] hover:bg-[#0A0A0A]">
                  <td className="px-3 py-4 text-[#EAEAEA]">{script.name}</td>
                  <td className="px-3 py-4 text-[#D4D4D8]">{script.description}</td>
                  <td className="px-3 py-4 text-[#9CA3AF]">{script.lastRun}</td>
                  <td className="px-3 py-4">
                    <StatusBadge variant={script.status === 'Running' ? 'running' : 'success'}>
                      {script.status}
                    </StatusBadge>
                  </td>
                  <td className="px-3 py-4">
                    <button
                      onClick={() => handleRunNow(script.id)}
                      className="rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-brandAccent"
                    >
                      Run Now
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Register New Script">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-[#9CA3AF]">Script Name</label>
            <input
              value={newScript.name}
              onChange={(event) => setNewScript((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
              placeholder="Enter script name"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-[#9CA3AF]">File Path</label>
            <input
              value={newScript.filePath}
              onChange={(event) => setNewScript((current) => ({ ...current, filePath: event.target.value }))}
              className="w-full rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none"
              placeholder="e.g. backup_processor.py"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.25em] text-[#9CA3AF]">Description</label>
            <textarea
              value={newScript.description}
              onChange={(event) => setNewScript((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded border border-panelBorder bg-[#0A0A0A] px-3 py-2 text-sm text-[#EAEAEA] outline-none resize-none h-20"
              placeholder="What does this script do?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="rounded border border-panelBorder bg-[#0A0A0A] px-4 py-2 text-sm uppercase tracking-[0.18em] text-[#EAEAEA] transition hover:border-[#555]"
            >
              Cancel
            </button>
            <button
              onClick={handleRegister}
              className="rounded bg-brandAccent px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#c31818]"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
