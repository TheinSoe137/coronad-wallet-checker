// sample-data.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
require('dotenv').config()
// MongoDB connection URL - replace with your MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = 'walletdb';
const COLLECTION_NAME = 'wallets';

// Sample wallet data
const sampleWallets = [
   
];

async function insertSampleData() {
    let client;
    
    try {
        console.log('Connecting to MongoDB...');
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        
        // Check if data already exists
        const existingCount = await collection.countDocuments();
        if (existingCount > 0) {
            console.log(`Found ${existingCount} existing wallets.`);
            const answer = await askQuestion('Do you want to clear existing data and insert sample data? (y/n): ');
            if (answer.toLowerCase() !== 'y') {
                console.log('Operation cancelled.');
                return;
            }
            
            // Clear existing data
            await collection.deleteMany({});
            console.log('Cleared existing data.');
        }
        
        // Insert sample data
        console.log('Inserting sample wallet data...');
        const result = await collection.insertMany(sampleWallets);
        
        console.log(`Successfully inserted ${result.insertedCount} sample wallets:`);
        console.log('');
        
        // Display inserted data
        for (const wallet of sampleWallets) {
            console.log(`Address: ${wallet.wallet_address}`);
            console.log(`roles: ${wallet.roles}`);
            console.log('---');
        }
        
        // Create index for fast lookups
        await collection.createIndex({ wallet_address: 1 });
        console.log('Created index on wallet_address field.');
        
        console.log('');
        console.log('Sample data inserted successfully!');
        console.log('You can now test the wallet checker with these addresses.');
        
    } catch (error) {
        console.error('Error inserting sample data:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Helper function to ask questions in terminal
function askQuestion(question) {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

// Add individual wallet function
async function addWallet(address, roles) {
    let client;
    
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);
        
        // Validate address format
        if (!validateEVMAddress(address)) {
            console.error('Invalid EVM address format');
            return;
        }
        
        // Validate roles
        const validRoles = ['whitelist', 'fcfs', 'guaranteed'];
        if (!validRoles.includes(roles)) {
            console.error(`Invalid roles. Must be one of: ${validRoles.join(', ')}`);
            return;
        }
        
        const wallet = {
            wallet_address: address.toLowerCase(),
            roles: roles,
            active: true,
            created_at: new Date(),
            updated_at: new Date()
        };
        
        const result = await collection.insertOne(wallet);
        console.log(`Added wallet: ${address} with roles: ${roles}`);
        
    } catch (error) {
        if (error.code === 11000) {
            console.error('Wallet address already exists in database');
        } else {
            console.error('Error adding wallet:', error);
        }
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Add wallets from file function
async function addWalletsFromFile(filePath, defaultRole) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const addresses = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        console.log(`Attempting to add ${addresses.length} wallets from ${filePath} with role ${defaultRole}...`);

        for (const address of addresses) {
            if (!validateEVMAddress(address)) {
                console.error(`Skipping invalid EVM address format: ${address}`);
                continue;
            }

            const normalizedAddress = address.toLowerCase();
            const existingWallet = await collection.findOne({ wallet_address: normalizedAddress });

            if (existingWallet) {
                console.warn(`Skipping duplicate wallet address: ${address}`);
                continue;
            }

            const wallet = {
                wallet_address: normalizedAddress,
                roles: defaultRole,
            };

            await collection.insertOne(wallet);
            console.log(`Added wallet: ${address} with role: ${defaultRole}`);
        }
        console.log('Finished adding wallets from file.');
    } catch (error) {
        console.error('Error adding wallets from file:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Address validation function
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

// Command line interface
const args = process.argv.slice(2);

if (args.length === 0) {
    // Insert sample data
    insertSampleData();
} else if (args.length === 2) {
    // Add individual wallet
    const [address, roles] = args;
    addWallet(address, roles);
} else if (args.length === 3 && args[0] === 'file') {
    const [, filePath, defaultRole] = args;
    addWalletsFromFile(filePath, defaultRole);
} else {
    console.log('Usage:');
    console.log('  node sample-data.js                    - Insert sample data');
    console.log('  node sample-data.js [address] [roles]   - Add individual wallet');
    console.log('  node sample-data.js file [filePath] [role] - Add wallets from a file');
    console.log('');
    console.log('Examples:');
    console.log('  node sample-data.js 0x1234567890123456789012345678901234567890 whitelist');
    console.log('  node sample-data.js file wl.txt whitelist');
}