import React, { useState } from 'react';
import useWalletCheck from './hooks/wallet_check_hook';
import { validateEVMAddress } from './utils/validation_utils';


const WalletChecker = ({
    apiEndpoint = 'http://localhost:3001/api/wallet/check',
  
    onResult = null,
    customStyles = {},
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

    const getRoleColor = (role) => {
        const colors = {
            gtdwhitelist: 'from-emerald-50 to-emerald-400',
            whitelist: 'from-red-50 to-red-500', 
            gtdfreemint: 'from-yellow-50 to-yellow-500'
        };
        return colors[role] || 'bg-gray-500';
    };

   
    const getRoleLabel = (role) => {
        const labels = {
            gtdwhitelist: 'GTD Whitelist',
            whitelist: 'Whitelist',
            gtdfreemint: 'GTD Freemint'
        };
        return labels[role] || role;
    };

    // const getRolePriority = (role) => {
    //     const priorities = {
    //         gtdfreemint: 3,
    //         whitelist: 2,
    //         whitelist: 1
    //     };
    //     return priorities[role] || 0;
    // };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-zinc-800 to-black flex items-center justify-center p-4" style={customStyles}>
            <div className="w-full max-w-md">
                {/* Glass morphism container */}
                <div className="bg-gray-700/30 rounded-2xl bg-clip-padding backdrop-filter backdrop-blur-sm   p-8">
                    <h1 className="text-3xl font-bold  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-500 mb-6 text-center">
                       Coronad Wallet Checker
                    </h1>
                    
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
                                className="w-full py-4 px-6 bg-purple-800
                                    hover:bg-purple-600 disabled:from-gray-600 disabled:to-gray-700
                                    text-white font-semibold rounded-xl transition-all duration-200 
                                    transform hover:scale-[1.02] disabled:hover:scale-100
                                    focus:outline-none focus:ring-2 focus:ring-purple-500/50
                                    disabled:cursor-not-allowed"
                            >
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
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                <p className="text-red-400 text-sm font-medium">{validationError}</p>
                            </div>
                        )}
                    </div>

                    {loading && (
                        <div className="mt-8 text-center">
                            <div className="inline-flex items-center space-x-3 bg-gray-900/50 rounded-full px-6 py-3 backdrop-blur-sm">
                                <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                <p className="text-gray-300 font-medium">Checking wallet status...</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                                <span className="text-red-400 text-xl">❌</span>
                                <p className="text-red-400 font-medium">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && !loading && !error && (
                        <div className="mt-6">
                            {result.whitelisted ? (
                                <div className=" bg-gray-700/40 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm  rounded-xl p-6">
                                    <div className="flex items-center text-center space-x-4">
                                    
                                        <div className="flex-1 space-y-4">
                                            <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-bl from-yellow-100 to-yellow-500 drop-shadow-xl/50 mb-5"> Congratulations!</h3>
                                            
                                            {/* Multiple roles display */}
                                            <div className="">
                                                <p className="text-gray-400 text-sm font-medium">Access Levels:</p>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                   {result.roles && (
    <div 
        
        className={`inline-flex items-center px-3 py-1.5 rounded-full font-semibold shadow-xl bg-clip-text text-transparent bg-gradient-to-b border border-gray-600/40
        ${getRoleColor(result.roles)}`}
    >
      {getRoleLabel(result.roles)} 
    </div>
)}
                                                </div>
                                            </div>
                                            
                                            {getRoles(result) && (
      <div 
        
      className={`inline-flex items-center px-3 py-1.5 rounded-lg font-regular shadow-xl bg-clip-text text-transparent bg-gradient-to-b
      ${getRoleColor(result.roles)}`}
  >
            Your wallet was found, you can mint in {getRoleLabel(result.roles)} phase.
      
    </div>
)}
                                            
                                            {/* Role count indicator */}

                                            {getRoles(result).length > 0 && (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <p className="text-blue-400 text-sm font-medium">
            {getRoles(result).length>1?`Your wallet has ${getRoles(result).length} different access levels.`: 'Your wallet has only 1 access level.'}
        </p>
    </div>
)}

                                            {/* Wallet info display */}
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
                            ) : (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
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