export const createMidtransTransaction = async (orderData) => {
  try {
    const response = await fetch('/api/midtrans/create-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create transaction');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

export const initMidtransSnap = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === 'true' 
      ? 'https://app.midtrans.com/snap/snap.js' 
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', import.meta.env.VITE_MIDTRANS_CLIENT_KEY);
    script.onload = () => resolve(window.snap);
    document.head.appendChild(script);
  });
};