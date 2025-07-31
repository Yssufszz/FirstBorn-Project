import { useState, useEffect } from 'react';
import { initMidtransSnap, createMidtransTransaction } from '../services/midtrans';

export const useMidtrans = () => {
  const [snap, setSnap] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initSnap = async () => {
      try {
        const snapInstance = await initMidtransSnap();
        setSnap(snapInstance);
      } catch (error) {
        console.error('Failed to initialize Midtrans:', error);
      }
    };
    
    initSnap();
  }, []);

  const processPayment = async (orderData) => {
    if (!snap) {
      throw new Error('Midtrans not initialized');
    }

    setLoading(true);
    try {
      const transaction = await createMidtransTransaction(orderData);
      
      return new Promise((resolve, reject) => {
        snap.pay(transaction.token, {
          onSuccess: (result) => {
            setLoading(false);
            resolve(result);
          },
          onPending: (result) => {
            setLoading(false);
            resolve(result);
          },
          onError: (result) => {
            setLoading(false);
            reject(result);
          },
          onClose: () => {
            setLoading(false);
            reject(new Error('Payment cancelled'));
          }
        });
      });
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  return { processPayment, loading, isReady: !!snap };
};