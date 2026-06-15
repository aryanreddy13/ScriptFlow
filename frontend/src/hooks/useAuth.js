import { useEffect, useState } from 'react';
import { auth, provider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

export default function useAuth() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth || !provider) {
      throw new Error('Firebase is not configured.');
    }
    const result = await signInWithPopup(auth, provider);
    setCurrentUser(result.user);
    return result.user;
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setCurrentUser(null);
  };

  return { currentUser, loading, loginWithGoogle, logout };
}
