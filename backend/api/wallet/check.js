const { MongoClient } = require('mongodb');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'walletdb';
const COLLECTION_NAME = 'wallets';

let db;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        
        // Create index for fast lookups
        await db.collection(COLLECTION_NAME).createIndex({ wallet_address: 1 });
        
        console.log('Connected to MongoDB successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

// Utility functions
function validateEVMAddress(address) {
    if (!address || typeof address !== 'string') {
        return false;
    }
    
    address = address.trim();
    
    if (!address.startsWith('0x')) {
        return false;
    }
    
    if (address.length !== 42) {
        return false;
    }
    
    const hexPart = address.slice(2);
    const hexRegex = /^[0-9a-fA-F]+$/;
    
    return hexRegex.test(hexPart);
}

function getRoleMessage(role) {
    const messages = {
        whitelist: 'You have whitelist access! You can participate in the whitelist round.',
        fcfs: 'You have FCFS (First Come First Serve) access! You can participate after the whitelist round.',
        guaranteed: 'You have guaranteed allocation access! You are guaranteed a spot in the sale.'
    };
    return messages[role] || 'Access granted';
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST method
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed. Use POST.'
        });
    }

    try {
        // Connect to database
        await connectToDatabase();
        
        const { address } = req.body;
        
        // Validate input
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }

        if (!validateEVMAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address format'
            });
        }

        // Normalize address (lowercase)
        const normalizedAddress = address.toLowerCase();
        
        // Check if wallet exists in database
        const wallet = await db.collection(COLLECTION_NAME).findOne({
            wallet_address: normalizedAddress,
        });
        
        if (wallet) {
            console.log(wallet);
            res.json({
                success: true,
                whitelisted: true,
                roles: wallet.roles,
                message: getRoleMessage(wallet.roles),
                wallet_data: {
                    wallet_address: normalizedAddress
                }
            });
        } else {
            res.json({
                success: true,
                whitelisted: false,
                message: 'Address not found in whitelist',
                wallet_data: {
                    wallet_address: normalizedAddress
                }
            });
        }
        
    } catch (error) {
        console.error('Error checking wallet:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
