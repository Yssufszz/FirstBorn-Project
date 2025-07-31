import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getDocument } from '../services/firestore';
import { COLLECTIONS } from '../utils/constants';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDocument(COLLECTIONS.USERS, firebaseUser.uid);
          setUser(firebaseUser);
          setUserData(userDoc);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(firebaseUser);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, userData, loading };
};