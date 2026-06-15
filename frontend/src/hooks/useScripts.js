import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const fallbackScripts = [
  {
    id: 'script-001',
    name: 'Backup Processor',
    filePath: 'backup_processor.py',
    description: 'Creates encrypted archive snapshots and transfers them to remote storage.',
    lastRun: '09:12:23',
    status: 'Running',
    duration: '00:02:14',
  },
  {
    id: 'script-002',
    name: 'Sales Report',
    filePath: 'sales_report.py',
    description: 'Compiles today’s sales data into a detailed performance summary.',
    lastRun: '18:40:07',
    status: 'Idle',
    duration: '00:00:00',
  },
  {
    id: 'script-003',
    name: 'Email Digest',
    filePath: 'email_digest.py',
    description: 'Assembles and delivers the daily customer digest email.',
    lastRun: '12:23:58',
    status: 'Idle',
    duration: '00:00:00',
  },
];

export default function useScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      setScripts(fallbackScripts);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'scripts'),
      (snapshot) => {
        setScripts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      () => {
        setScripts(fallbackScripts);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { scripts, loading };
}
