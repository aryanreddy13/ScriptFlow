import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';



const seedRuns = [
  {
    scriptName: 'Backup Processor',
    triggeredAt: '2026-06-11 09:12:23',
    duration: '00:02:14',
    status: 'Success',
    output: ['[09:12:23] Starting backup...', '[09:12:34] Upload complete.', '[09:14:37] Completed successfully.'],
    metadata: { os: 'Ubuntu 22.04', pid: 1274, exitCode: 0 },
    error: '',
  },
  {
    scriptName: 'Sales Report',
    triggeredAt: '2026-06-10 18:40:07',
    duration: '00:01:02',
    status: 'Success',
    output: ['[18:40:07] Generating report...', '[18:41:09] Report saved.', '[18:41:09] Completed successfully.'],
    metadata: { os: 'Ubuntu 22.04', pid: 1348, exitCode: 0 },
    error: '',
  },
  {
    scriptName: 'Email Digest',
    triggeredAt: '2026-06-09 12:23:58',
    duration: '00:00:54',
    status: 'Failed',
    output: ['[12:23:58] Starting digest...', '[12:24:03] SMTP connection failed.', '[12:24:03] Script failed with exit code 1.'],
    metadata: { os: 'Ubuntu 22.04', pid: 1412, exitCode: 1 },
    error: 'SMTPException: Connection refused',
  },
];

const seedSchedules = [
  { scriptName: 'Backup Processor', cron: '0 2 * * *', nextRun: 'Tomorrow 02:00 UTC', enabled: true },
  { scriptName: 'Sales Report', cron: '0 8 * * 1-5', nextRun: 'Today 08:00 UTC', enabled: true },
  { scriptName: 'Email Digest', cron: '0 18 * * *', nextRun: 'Today 18:00 UTC', enabled: false },
];

export async function seedFirestore() {
  if (!db) throw new Error('Firestore not initialised');

  const results = { runs: 0, schedules: 0 };

  // Only seed if collections are empty
  const [runsSnap, schedulesSnap] = await Promise.all([
    getDocs(collection(db, 'runs')),
    getDocs(collection(db, 'schedules')),
  ]);

  if (runsSnap.empty) {
    await Promise.all(seedRuns.map((r) => addDoc(collection(db, 'runs'), r)));
    results.runs = seedRuns.length;
  }

  if (schedulesSnap.empty) {
    await Promise.all(seedSchedules.map((s) => addDoc(collection(db, 'schedules'), s)));
    results.schedules = seedSchedules.length;
  }

  return results;
}
