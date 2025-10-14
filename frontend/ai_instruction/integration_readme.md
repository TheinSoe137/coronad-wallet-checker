# Wallet Checker Component

A secure React component for checking EVM wallet addresses against a whitelist database with role-based access control.

## Features

- ✅ **EVM Address Validation** - Real-time validation of wallet addresses
- 🔒 **Secure Database Lookup** - Private MongoDB database with rate limiting
- 🎯 **Role-Based Access** - Support for whitelist, FCFS, and guaranteed roles
- 🎨 **Modern UI** - Clean, responsive design with light/dark themes
- ⚡ **Easy Integration** - Drop-in component for existing React projects
- 📱 **Mobile Friendly** - Fully responsive design

## Quick Start

### 1. Backend Setup

#### Install Dependencies
```bash
npm install express mongodb cors express-rate-limit
```

#### Set up MongoDB
1. Install MongoDB locally or use MongoDB Atlas
2. Update the connection string in `server.js`:
```javascript
const MONGODB_URI = 'mongodb://localhost:27017/walletdb';
// or for MongoDB Atlas:
// const MONGODB_URI = 'mongodb+srv://username:password@cluster.mongodb.net/walletdb';
```

#### Add Sample Data
```bash
node sample-data.js
```

#### Start the Server
```bash
node server.js
```

The server will run on `http://localhost:3001`

### 2. Frontend Integration

#### Copy Component Files
Copy these files to your React project:
```
src/components/WalletChecker/
├── WalletChecker.jsx
├── WalletChecker.module.css
├── hooks/
│   └── useWalletCheck.js
└── utils/
    └── validation.js
```

#### Basic Usage
```javascript
import WalletChecker from './components/WalletChecker/WalletChecker';

function App() {
    return (
        <div className="App">
            <WalletChecker />
        </div>
    );
}
```

#### Advanced Usage
```javascript
import WalletChecker from './components/WalletChecker/WalletChecker';

function App() {
    const handleWalletResult = (result) => {
        console.log('Wallet check result:', result);
        // Handle the result in your app
        if (result.whitelisted) {
            // User is whitelisted, show appropriate content
            // result.role will be 'whitelist', 'fcfs', or 'guaranteed'
        }
    };

    return (
        <div className="App">
            <WalletChecker
                apiEndpoint="http://localhost:3001/api/wallet/check"
                theme="dark"
                onResult={handleWalletResult}
                placeholder="Enter your wallet address..."
            />
        </div>
    );
}
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiEndpoint` | string | `/api/wallet/check` | API endpoint URL |
| `theme` | string | `light` | Theme (`light` or `dark`) |
| `onResult` | function | `null` | Callback function for results |
| `customStyles` | object | `{}` | Custom CSS styles |
| `placeholder` | string | `Enter your wallet address...` | Input placeholder |

## Database Management

### Add Individual Wallet
```bash
node sample-data.js 0x1234567890123456789012345678901234567890 whitelist
```

### Roles
- **whitelist** - Standard whitelist access
- **fcfs** - First Come First Serve access
- **guaranteed** - Guaranteed allocation access

### Manual Database Operations
```javascript
// Connect to MongoDB and add wallets
const { MongoClient } = require('mongodb');

const wallet = {
    wallet_address: '0x1234567890123456789012345678901234567890',
    role: 'whitelist',
    active: true,
    created_at: new Date(),
    updated_at: new Date()
};

// Insert into collection
db.collection('wallets').insertOne(wallet);
```

## API Endpoints

### Check Wallet
```
POST /api/wallet/check
Content-Type: application/json

{
    "address": "0x1234567890123456789012345678901234567890"
}
```

**Response (Found):**
```json
{
    "success": true,
    "data": {
        "whitelisted": true,
        "role": "whitelist",
        "message": "You have whitelist access! You can participate in the whitelist round."
    }
}
```

**Response (Not Found):**
```json
{
    "success": true,
    "data": {
        "whitelisted": false,
        "message": "Address not found in whitelist"
    }
}
```

### Health Check
```
GET /api/health
```

### Statistics (Optional)
```
GET /api/stats
```

## Security Features

- **Rate Limiting** - 30 requests per minute per IP
- **Input Validation** - Strict EVM address format validation
- **SQL Injection Prevention** - MongoDB queries with proper sanitization
- **CORS Protection** - Configurable cross-origin resource sharing
- **Error Handling** - Comprehensive error handling without data leakage

## Customization

### Custom Styling
```javascript
const customStyles = {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '30px'
};

<WalletChecker customStyles={customStyles} />
```

### Custom Role Colors
Edit `WalletChecker.jsx` to customize role colors:
```javascript
const getRoleColor = (role) => {
    const colors = {
        whitelist: '#4CAF50',    // Green
        fcfs: '#FF9800',         // Orange
        guaranteed: '#2196F3'    // Blue
    };
    return colors[role] || '#757575';
};
```

## Environment Variables

Create a `.env` file in your backend directory:
```
MONGODB_URI=mongodb://localhost:27017/walletdb
PORT=3001
```

## Deployment

### Backend Deployment
1. Set up MongoDB database (MongoDB Atlas recommended)
2. Deploy to your preferred platform (Heroku, Vercel, etc.)
3. Update environment variables

### Frontend Integration
1. Update `apiEndpoint` prop with your deployed backend URL
2. Build and deploy your React app

## Troubleshooting

### Common Issues

**"Unable to connect to server"**
- Check if backend server is running
- Verify API endpoint URL
- Check CORS configuration

**"Invalid address format"**
- Ensure address starts with '0x'
- Address must be exactly 42 characters
- Only hexadecimal characters allowed

**"Too many requests"**
- Rate limit exceeded (30 requests/minute)
- Wait before making another request

### Development Tips

1. **Testing**: Use the sample wallet addresses provided by `sample-data.js`
2. **CORS**: Make sure to configure CORS properly for your frontend domain
3. **MongoDB**: Ensure MongoDB is running and accessible
4. **Logs**: Check server logs for detailed error information

## File Structure

```
wallet-checker/
├── frontend/
│   └── components/
│       └── WalletChecker/
│           ├── WalletChecker.jsx
│           ├── WalletChecker.module.css
│           ├── hooks/
│           │   └── useWalletCheck.js
│           └── utils/
│               └── validation.js
├── backend/
│   ├── server.js
│   ├── sample-data.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use in your projects!

---

## Sample Test Data

The following wallet addresses are included in the sample data:

**Whitelist:**
- `0x742d35cc6e8c43c8c1a70d8c6a4aa7c7c4f8e7f4`
- `0x9876543210987654321098765432109876543210`

**FCFS:**
- `0xa1b2c3d4e5f6789012345678901234567890abcd`
- `0xabcdef1234567890abcdef1234567890abcdef12`

**Guaranteed:**
- `0x1234567890123456789012345678901234567890`
- `0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef`

Test with these addresses to see the component in action!