import { useState, useEffect } from 'react';
import { getDocuments, subscribeToCollection } from '../services/firestore';

export const useFirestore = (collectionName, conditions = [], realtime = false) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (realtime) {
      const unsubscribe = subscribeToCollection(
        collectionName,
        (docs) => {
          setDocuments(docs);
          setLoading(false);
        },
        conditions
      );
      return () => unsubscribe();
    } else {
      const fetchDocuments = async () => {
        try {
          setLoading(true);
          const docs = await getDocuments(collectionName, conditions);
          setDocuments(docs);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDocuments();
    }
  }, [collectionName, JSON.stringify(conditions), realtime]);

  return { documents, loading, error };
};