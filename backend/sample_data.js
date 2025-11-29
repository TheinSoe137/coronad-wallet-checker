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
        const validRoles = ['Crown', 'Loyal_Crown', 'Graduated_Crown'];
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

// Upsert wallet role (replace if exists, add if not)
async function upsertWalletRole(address, roles) {
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
        const validRoles = ['Crown', 'Loyal_Crown', 'Graduated_Crown'];
        if (!validRoles.includes(roles)) {
            console.error(`Invalid roles. Must be one of: ${validRoles.join(', ')}`);
            return;
        }

        const normalizedAddress = address.toLowerCase();

        const result = await collection.updateOne(
            { wallet_address: normalizedAddress },
            {
                $set: {
                    wallet_address: normalizedAddress,
                    roles: roles,
                    updated_at: new Date()
                },
                $setOnInsert: {
                    active: true,
                    created_at: new Date()
                }
            },
            { upsert: true }
        );

        if (result.matchedCount > 0) {
            console.log(`Updated wallet: ${address} with new roles: ${roles}`);
        } else if (result.upsertedCount > 0) {
            console.log(`Added wallet: ${address} with roles: ${roles}`);
        } else {
            // Fallback (shouldn't normally happen)
            console.log(`Upsert completed for ${address}.`);
        }
    } catch (error) {
        console.error('Error upserting wallet role:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Upsert wallet roles from file (replace if exists, add if not)
async function upsertWalletRolesFromFile(filePath, roles) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Validate roles
        const validRoles = ['Crown', 'Loyal_Crown', 'Graduated_Crown'];
        if (!validRoles.includes(roles)) {
            console.error(`Invalid roles. Must be one of: ${validRoles.join(', ')}`);
            return;
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const addresses = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        console.log(`Attempting to upsert ${addresses.length} wallets from ${filePath} with role ${roles}...`);

        for (const address of addresses) {
            if (!validateEVMAddress(address)) {
                console.error(`Skipping invalid EVM address format: ${address}`);
                continue;
            }

            const normalizedAddress = address.toLowerCase();
            const result = await collection.updateOne(
                { wallet_address: normalizedAddress },
                {
                    $set: {
                        wallet_address: normalizedAddress,
                        roles: roles,
                        updated_at: new Date()
                    },
                    $setOnInsert: {
                        active: true,
                        created_at: new Date()
                    }
                },
                { upsert: true }
            );

            if (result.matchedCount > 0) {
                console.log(`Updated wallet: ${address} with new roles: ${roles}`);
            } else if (result.upsertedCount > 0) {
                console.log(`Added wallet: ${address} with roles: ${roles}`);
            } else {
                console.log(`Upsert completed for ${address}.`);
            }
        }

        console.log('Finished upserting wallets from file.');
    } catch (error) {
        console.error('Error upserting wallets from file:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Delete a single wallet by address
async function deleteWallet(address) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        if (!validateEVMAddress(address)) {
            console.error('Invalid EVM address format');
            return;
        }

        const normalizedAddress = address.toLowerCase();
        const result = await collection.deleteOne({ wallet_address: normalizedAddress });

        if (result.deletedCount === 1) {
            console.log(`Deleted wallet: ${address}`);
        } else {
            console.warn(`Wallet not found (nothing deleted): ${address}`);
        }
    } catch (error) {
        console.error('Error deleting wallet:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

// Delete multiple wallets from a file (one address per line)
async function deleteWalletsFromFile(filePath) {
    let client;
    try {
        client = new MongoClient(MONGODB_URI);
        await client.connect();

        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const addresses = fileContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

        console.log(`Attempting to delete ${addresses.length} wallets from ${filePath}...`);

        let deleted = 0;
        let skippedInvalid = 0;
        let notFound = 0;

        for (const address of addresses) {
            if (!validateEVMAddress(address)) {
                console.error(`Skipping invalid EVM address format: ${address}`);
                skippedInvalid += 1;
                continue;
            }

            const normalizedAddress = address.toLowerCase();
            const result = await collection.deleteOne({ wallet_address: normalizedAddress });

            if (result.deletedCount === 1) {
                console.log(`Deleted wallet: ${address}`);
                deleted += 1;
            } else {
                console.warn(`Wallet not found (nothing deleted): ${address}`);
                notFound += 1;
            }
        }

        console.log(`Finished deleting wallets from file. Deleted: ${deleted}, Not found: ${notFound}, Skipped invalid: ${skippedInvalid}`);
    } catch (error) {
        console.error('Error deleting wallets from file:', error);
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
} else if (args[0] === 'delete' && args.length === 2) {
    // Delete individual wallet
    const [, address] = args;
    deleteWallet(address);
} else if (args[0] === 'delete' && args.length === 3 && args[1] === 'file') {
    // Delete wallets from file
    const [, , filePath] = args;
    deleteWalletsFromFile(filePath);
} else if (args.length === 2) {
    // Add individual wallet (keep after 'delete' checks to avoid ambiguity)
    const [address, roles] = args;
    addWallet(address, roles);
} else if (args.length === 3 && args[0] === 'file') {
    const [, filePath, defaultRole] = args;
    addWalletsFromFile(filePath, defaultRole);
} else if (args.length === 3 && args[0] === 'replace') {
    // Replace/add role for a single wallet
    const [, address, roles] = args;
    upsertWalletRole(address, roles);
} else if (args.length === 4 && args[0] === 'replace' && args[1] === 'file') {
    // Replace/add roles for wallets from file
    const [, , filePath, roles] = args;
    upsertWalletRolesFromFile(filePath, roles);
} else {
    console.log('Usage:');
    console.log('  node sample_data.js                    - Insert sample data');
    console.log('  node sample_data.js [address] [roles]   - Add individual wallet');
    console.log('  node sample_data.js delete [address]     - Delete individual wallet');
    console.log('  node sample_data.js delete file [filePath] - Delete wallets from file');
    console.log('  node sample_data.js replace [address] [roles] - Replace/Add wallet role');
    console.log('  node sample_data.js replace file [filePath] [roles] - Replace/Add roles from file');
    console.log('  node sample_data.js file [filePath] [role] - Add wallets from a file');
    console.log('');
    console.log('Examples:');
    console.log('  node sample_data.js 0x1234567890123456789012345678901234567890 whitelist');
    console.log('  node sample_data.js delete 0x1234567890123456789012345678901234567890');
    console.log('  node sample_data.js delete file socwallets.txt');
    console.log('  node sample_data.js replace 0x1234567890123456789012345678901234567890 Crown');
    console.log('  node sample_data.js replace file socwallets.txt Loyal_Crown');
    console.log('  node sample_data.js file wl.txt whitelist');
}
// Crown
//             Loyal_Crown
//             Graduated_Crown