import React, { useState } from 'react';
import useWalletCheck from './hooks/wallet_check_hook';
import { validateEVMAddress } from './utils/validation_utils';
import logo from "./assets/hero-pic.png"



const WalletChecker = ({
    apiEndpoint = 'https://wallet-checker-server.vercel.app/api/wallet/check',
    onResult = null,
   
    placeholder = 'Enter your wallet address (0x...)'
}) => {
    const [address, setAddress] = useState('');
    const [validationError, setValidationError] = useState('');
    const { checkWallet, loading, result, error } = useWalletCheck(apiEndpoint);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setAddress(value);

        // Clear previous validation error
        setValidationError('');

        // Validate address format if input is not empty
        if (value && !validateEVMAddress(value)) {
            setValidationError('Invalid EVM address format');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!address.trim()) {
            setValidationError('Please enter a wallet address');
            return;
        }

        if (!validateEVMAddress(address)) {
            setValidationError('Invalid EVM address format');
            return;
        }

        const result = await checkWallet(address);

        if (onResult) {
            onResult(result);
        }
    };
    const getRoles = (result) => {
        if (!result) return [];
        if (Array.isArray(result.roles)) return result.roles;
        if (typeof result.role === 'string') return [result.role];
        return [];
    };

   
    const getRoleMessage = (role) => {
        const messages = {
          Crown: (
            <>
              Your wallet is eligible! You’ve secured{" "}
              <span className="text-gold-gradient font-semibold">2 NFTs</span> in the{" "}
              <span className="text-gold-gradient font-semibold">FCFS Mint Phase</span>.
              Lets go to mark your calendars, November Xth
            </>
          ),
          Loyal_Crown: (
            <>
              Your wallet is eligible! You’ve secured{" "}
              <span className="text-gold-gradient font-semibold">2 NFTs</span> in the{" "}
              <span className="text-gold-gradient font-semibold">GTD Mint Phase</span>.
              Lets go to mark your calendars, November Xth
            </>
          ),
          Graduated_Crown: (
            <>
              Your wallet is eligible! You’ve secured{" "}
              <span className="text-gold-gradient font-semibold">1 NFT</span> in the{" "}
              <span className="text-gold-gradient font-semibold">Free Mint Phase</span> and{" "}
              <span className="text-gold-gradient font-semibold">2 NFTs</span> in the{" "}
              <span className="text-gold-gradient font-semibold">GTD Mint Phase</span>.
              Lets go to mark your calendars, November Xth
            </>
          ),
        };
      
        return messages[role] || <span className="text-gray-300">Access granted</span>;
      };
      


    const getRoleLabel = (role) => {
        const labels = {
            Crown: 'Crown',
            Loyal_Crown: ' Loyal Crown',
            Graduated_Crown: ' Graduated Crown'
        };
        return labels[role] || role;
    };


    return (
        <div className="min-h-screen w-full my-background flex items-center justify-center p-4 z-9 ">
           {/* <div className="min-h-screen   bg-custom-blur z-1"> */}
            <div className="w-full max-w-md ">
                {/* Glass morphism container */}
                <div className="bg-700/30 rounded-2xl  p-8">
                    <img src={logo} alt="logo" className='w-[120px]  mx-auto' />

                    <h1 className="text-2xl mb-6 font-bold font-[restora] text-gold-gradient text-gold-glow text-center">
                  

                        
                    The Crown Chooses The Worthy
                    <div
  className="absolute  left-1/2 transform -translate-x-1/2  m-2
             w-32 md:w-64 h-0.5 bg-gradient-to-r from-transparent 
             via-[#d4af37] to-transparent opacity-60"
></div>
                    </h1>
                    <p className='text-[#a8a399] text-center text-sm pb-3'>Recognition belongs to the chosen</p>
             

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={address}
                                onChange={handleInputChange}
                                placeholder={placeholder}
                                className={`w-full px-4 py-4 bg-gray-800/60 border rounded-xl text-white placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent
                                    transition-all duration-200 backdrop-blur-sm
                                    ${validationError ? 'border-red-500/50 focus:ring-red-500/50' : 'border-gray-700/50'}`}
                                disabled={loading}
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !!validationError}
                                className='w-full gold-button block text-center  transition-all duration-200 transform hover:'>
                                {loading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Checking...</span>
                                    </div>
                                ) : (
                                    'Check Wallet'
                                )}
                            </button>
                        </div>

                        {validationError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 fade-in-fast">
                                <p className="text-red-400 text-sm font-medium">{validationError}</p>
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className="mt-8 text-center fade-in">
                            <div className="inline-flex items-center space-x-3 bg-gray-900/50 rounded-full px-6 py-3 backdrop-blur-sm">
                                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <p className="text-gray-300 font-medium">Checking wallet status...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 fade-in">
                            <div className="flex items-center space-x-3">
                                <span className="text-red-400 text-xl">❌</span>
                                <p className="text-red-400 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && !loading && !error && (

                        <div className="mt-6 fade-in">
                            {result.whitelisted ? (
                                <div className='realistic-gold-border-thin relative overflow-hidden transition-all duration-300 hover:shadow-xl rounded-xl fade-in-slow'>
                                <div className=" rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm  p-6">
                                    <div className="flex items-center text-center space-x-4">

                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-xl font-bold font-[restora] bg-clip-text text-transparent tracking-wider text-gold-gradient mb-5 text-gold-glow fade-in-slow"> Congratulations!</h3>

                                            {/* Multiple roles display */}
                                            <div className="">
                                                <p className="text-[#E0E0E0] text-sm font-regular">Access Levels:</p>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    
                                                    {result.roles && (
                                                        <div

                                                            className={`inline-flex items-center px-3 py-1.5 rounded-full font-semibold font-[restora] shadow-xl bg-clip-text text-transparent bg-gradient-to-b border border-gray-600/40 text-gold-gradient }`}
                                                        >
                                                            {getRoleLabel(result.roles)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {getRoles(result) && (
                                                <div

                                                className="text-regular text-[#E0E0E0] mb-6 text-center"
                                                
                                                >
                                                  {getRoleMessage(result.roles)} 

                                                </div>
                                            )}

                                           
                                            {result.wallet_data && (
                                                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                                                    <p className="text-gray-400 text-xs font-medium mb-1">Wallet Details:</p>
                                                    <p className="text-gray-300 text-sm font-mono break-all">
                                                        {result.wallet_data.wallet_address}
                                                    </p>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                </div>
                            ) : (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 fade-in">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                                                <span className="text-red-400 text-2xl">❌</span>
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-3">

                                            <p className="text-gray-300 leading-relaxed">{result.message}</p>

                                            {/* Show wallet info even for inactive wallets */}
                                            {result.wallet_data && (
                                                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                                                    <p className="text-gray-400 text-xs font-medium mb-1">Wallet Details:</p>
                                                    <p className="text-gray-300 text-sm font-mono break-all">
                                                        {result.wallet_data.wallet_address}
                                                    </p>
                                                    <p className="text-gray-400 text-xs mt-1">
                                                        Status: <span className="text-red-400">Inactive</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Decorative background elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
      
    );
};

export default WalletChecker;