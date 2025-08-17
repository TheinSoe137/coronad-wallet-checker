// hooks/useWalletCheck.js
import { useState } from 'react';

const useWalletCheck = (apiEndpoint) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const checkWallet = async (address) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    address: address.toLowerCase().trim() 
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setResult(data.data);
                return data.data;
            } else {
                throw new Error(data.error || 'Failed to check wallet');
            }
        } catch (err) {
            console.error('Wallet check error:', err);
            const errorMessage = err.message.includes('Failed to fetch') 
                ? 'Unable to connect to server. Please try again.'
                : err.message;
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setError(null);
        setLoading(false);
    };

    return {
        checkWallet,
        loading,
        result,
        error,
        reset
    };
};

export default useWalletCheck;