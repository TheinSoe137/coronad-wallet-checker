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

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting - 30 requests per minute per IP
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max:10 , // limit each IP to 30 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
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
        process.exit(1);
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

// Start server
async function startServer() {
    await connectToDatabase();
    
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/api/health`);
            console.log(`Wallet check: POST http://localhost:${PORT}/api/wallet/check`);
        });
    }
}

// Only start server if not in production (Vercel)
if (process.env.NODE_ENV !== 'production') {
    startServer().catch(console.error);
}

module.exports = app;