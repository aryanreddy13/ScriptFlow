import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const fallbackRuns = [
  {
    id: 'run-001',
    scriptName: 'Backup Processor',
    triggeredAt: '2026-06-11 09:12:23',
    duration: '00:02:14',
    status: 'Success',
    output: ['[09:12:23] Starting backup...', '[09:12:34] Upload complete.', '[09:14:37] Completed successfully.'],
    metadata: { os: 'Ubuntu 22.04', pid: 1274, exitCode: 0 },
    error: '',
  },
  {
    id: 'run-002',
    scriptName: 'Sales Report',
    triggeredAt: '2026-06-10 18:40:07',
    duration: '00:01:02',
    status: 'Success',
    output: ['[18:40:07] Generating report...', '[18:41:09] Report saved.', '[18:41:09] Completed successfully.'],
    metadata: { os: 'Ubuntu 22.04', pid: 1348, exitCode: 0 },
    error: '',
  },
  {
    id: 'run-003',
    scriptName: 'Email Digest',
    triggeredAt: '2026-06-09 12:23:58',
    duration: '00:00:54',
    status: 'Failed',
    output: ['[12:23:58] Starting digest...', '[12:24:03] SMTP connection failed.', '[12:24:03] Script failed with exit code 1.'],
    metadata: { os: 'Ubuntu 22.04', pid: 1412, exitCode: 1 },
    error: 'SMTPException: Connection refused',
  },
];

export default function useRuns() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setRuns(fallbackRuns);
      setLoading(false);
      return;
    }

    const runsQuery = query(collection(db, 'runs'), orderBy('triggeredAt', 'desc'));
    const unsubscribe = onSnapshot(
      runsQuery,
      (snapshot) => {
        setRuns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (error) => {
        console.error('Firestore runs subscription error:', error);
        setRuns([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { runs, loading };
}
