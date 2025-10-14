// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection URL - replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = 'walletdb';
const COLLECTION_NAME = 'wallets';

let db;

app.use(cors({
    origin: "https://wallet-checker-zeta.vercel.app/", // Replace with your React app's origin
   
}));
app.use(express.json());

// Rate limiting - 30 requests per minute per IP
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max:10 , // limit each IP to 30 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    },
    skip: (req) => req.method === 'OPTIONS'
});

app.use('/api/', limiter);

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

// Ensure DB connection in serverless/runtime
async function ensureDatabaseConnection(req, res, next) {
    try {
        if (!db) {
            await connectToDatabase();
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, error: 'Database connection failed' });
    }
}

app.use('/api', ensureDatabaseConnection);

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
        Crown: 'Your wallet is eligible! You’ve secured 2 NFTs in the FCFS Mint Phase. Let’s go, October 20th, mark your calendars!',
        Loyal_Crown: 'Your wallet is eligible! You’ve secured 2 NFTs in the GTD Mint Phase. Let’s go, October 20th, mark your calendars!',
        Graduated_Crown: 'Your wallet is eligible! You’ve secured 1 NFT in the Free Mint Phase and 2 NFTs in the GTD Mint Phase. Let’s go, October 20th, mark your calendars!'
    };
    return messages[role] || 'Access granted';
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Wallet checker API is running',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/wallet/check', async (req, res) => {
    try {
        const { address } = req.body;
        
        // Validate input
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Wallet address is required'
            });
        }
        
        // Validate address format
        if (!validateEVMAddress(address)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid EVM address format'
            });
        }
        
        // Normalize address (lowercase)
        const normalizedAddress = address.toLowerCase().trim();
        
        // Query database
        const wallet = await db.collection(COLLECTION_NAME).findOne({
            wallet_address: normalizedAddress,
            
        });
        
        if (wallet) {
            console.log(wallet)
            res.json({
                success: true,
                data: {
                    whitelisted: true,
                    roles: wallet.roles,
                    message: getRoleMessage(wallet.roles)
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    whitelisted: false,
                    message: 'Address not found in whitelist'
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
});

// Get wallet stats (optional endpoint for admin)
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.collection(COLLECTION_NAME).aggregate([
            
            { $group: { _id: '$roles', count: { $sum: 1 } } }
        ]).toArray();
        
        const totalCount = await db.collection(COLLECTION_NAME);
        
        res.json({
            success: true,
            data: {
                total: totalCount,
                byRole: stats.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {})
            }
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Handle 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// Local dev server only. On Vercel we export the app without listening.
if (require.main === module) {
	(async () => {
		try {
			await connectToDatabase();
			app.listen(PORT, () => {
				console.log(`Server running on port ${PORT}`);
				console.log(`Health check: http://localhost:${PORT}/api/health`);
				console.log(`Wallet check: POST http://localhost:${PORT}/api/wallet/check`);
			});
		} catch (error) {
			console.error('Failed to start server:', error);
			process.exit(1);
		}
	})();
}

module.exports = app;
