import { useEffect, useState } from 'react';
import { API_URL } from '../config';

export default function useScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchScripts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/scripts`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        if (isMounted) {
          setScripts(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchScripts();
    
    // Set up polling for script states since we no longer have onSnapshot for realtime updates
    const intervalId = setInterval(fetchScripts, 5000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { scripts, loading, error };
}
