# Wallet Checker Component - Implementation Plan

## Project Overview
A secure, reusable React component that allows users to check if their EVM wallet address is whitelisted in your database and displays their associated role/permissions.

## Core Features
- **Address Input**: Clean input field with EVM address validation
- **Database Lookup**: Secure API call to check whitelist status
- **Role Display**: Shows user's role/permissions if whitelisted
- **Security**: Private database access with proper authentication
- **Responsive Design**: Mobile-friendly interface
- **Easy Integration**: Drop-in component for existing React projects

## Technical Architecture

### Frontend Component Structure
```
WalletChecker/
├── WalletChecker.jsx          # Main component
├── WalletChecker.module.css   # Scoped styling
├── hooks/
│   └── useWalletCheck.js      # Custom hook for API calls
├── utils/
│   └── validation.js          # Address validation utilities
└── types/
    └── index.js               # TypeScript-like prop definitions
```

### Component Features
1. **Input Validation**
   - EVM address format validation (0x + 40 hex characters)
   - Real-time validation feedback
   - Loading states during API calls

2. **API Integration**
   - Secure API endpoint calls
   - Error handling and user feedback
   - Response caching (optional)

3. **UI/UX Elements**
   - Clean, modern design
   - Loading spinners
   - Success/error states
   - Role badge display
   - Copy-to-clipboard functionality

## Backend Requirements (MongoDB - Simple Setup)

### Database Schema
```javascript
// MongoDB Collection: wallets
{
    "_id": ObjectId,
    "wallet_address": "0x1234567890123456789012345678901234567890",
    "role": "whitelist" | "fcfs" | "guaranteed",
    "active": true,
    "created_at": Date,
    "updated_at": Date
}

// Create index for fast lookups
db.wallets.createIndex({ "wallet_address": 1 })
```

### Role Types
- **whitelist**: Standard whitelist access
- **fcfs**: First Come First Serve access
- **guaranteed**: Guaranteed allocation access

### Simple API Endpoint (Express.js + MongoDB)
```javascript
// Basic Express.js setup
const express = require('express');
const { MongoClient } = require('mongodb');

app.post('/api/wallet/check', async (req, res) => {
    try {
        const { address } = req.body;
        
        // Find wallet in database
        const wallet = await db.collection('wallets').findOne({ 
            wallet_address: address.toLowerCase(),
            active: true
        });
        
        if (wallet) {
            res.json({
                success: true,
                data: {
                    whitelisted: true,
                    role: wallet.role,
                    message: getRoleMessage(wallet.role)
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    whitelisted: false,
                    message: "Address not found in whitelist"
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
});

function getRoleMessage(role) {
    const messages = {
        whitelist: "You have whitelist access",
        fcfs: "You have FCFS (First Come First Serve) access", 
        guaranteed: "You have guaranteed allocation access"
    };
    return messages[role] || "Access granted";
}
```

## Security Implementation

### Privacy & Security Measures
1. **Address Hashing** (Optional)
   - Store hashed versions of addresses for extra privacy
   - Use one-way hashing with salt

2. **Rate Limiting**
   - Implement API rate limiting (e.g., 10 requests/minute per IP)
   - Prevent abuse and database overload

3. **Input Sanitization**
   - Validate and sanitize all inputs
   - Prevent SQL injection attacks

4. **HTTPS Only**
   - All API calls over HTTPS
   - Secure data transmission

5. **No Logging of Sensitive Data**
   - Don't log wallet addresses in server logs
   - Implement secure logging practices

## Component Props & Configuration

### Props Interface
```javascript
const WalletChecker = ({
    apiEndpoint = '/api/wallet/check',
    theme = 'light',
    showCopyButton = true,
    onResult = null,
    customStyles = {},
    placeholder = 'Enter your wallet address...'
}) => {
    // Component implementation
}
```

### Configuration Options
- **apiEndpoint**: Custom API endpoint URL
- **theme**: Light/dark theme support
- **showCopyButton**: Toggle copy functionality
- **onResult**: Callback function for result handling
- **customStyles**: Style overrides
- **placeholder**: Custom input placeholder

## Implementation Phases

### Phase 1: Core Component
- [ ] Basic React component structure
- [ ] Input field with validation
- [ ] API integration hook
- [ ] Basic styling and layout

### Phase 2: Security & Backend
- [ ] Database schema setup
- [ ] Secure API endpoint
- [ ] Rate limiting implementation
- [ ] Input sanitization

### Phase 3: Enhanced Features
- [ ] Loading states and animations
- [ ] Error handling and user feedback
- [ ] Role badge styling
- [ ] Copy to clipboard functionality

### Phase 4: Integration & Testing
- [ ] Component documentation
- [ ] Integration examples
- [ ] Unit tests
- [ ] Security testing

## File Structure Deliverables

### Frontend Files
1. **WalletChecker.jsx** - Main React component
2. **WalletChecker.module.css** - Component styles
3. **useWalletCheck.js** - Custom hook for API calls
4. **validation.js** - Address validation utilities
5. **README.md** - Integration guide

### Backend Files
1. **server.js** - Simple Express.js server with MongoDB
2. **database-setup.js** - MongoDB connection and setup
3. **sample-data.js** - Script to add sample wallet data

## Integration Example

```javascript
import WalletChecker from './components/WalletChecker/WalletChecker';

function App() {
    const handleWalletResult = (result) => {
        console.log('Wallet check result:', result);
        // Handle the result in your app
    };

    return (
        <div className="App">
            <WalletChecker
                apiEndpoint="/api/wallet/check"
                theme="dark"
                onResult={handleWalletResult}
            />
        </div>
    );
}
```

## Technology Stack
- **Frontend**: React.js, CSS Modules
- **Backend**: Node.js/Express.js (simple setup)
- **Database**: MongoDB
- **Security**: Basic rate limiting, input validation
- **Validation**: Custom validation utilities

## Dependencies
```json
{
    // Frontend
    "react": "^18.0.0",
    "axios": "^1.6.0",
    
    // Backend
    "express": "^4.18.0",
    "mongodb": "^6.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.0.0"
}
```

## Success Metrics
- Component loads and renders correctly
- Address validation works properly
- Database queries are fast (<100ms)
- Security measures prevent abuse
- Easy integration with existing projects
- Responsive design works on all devices

## Questions for Review
1. Do you prefer a specific styling approach (CSS Modules, Styled Components, etc.)?
2. Do you already have a MongoDB database set up, or should I include setup instructions?
3. What port should the backend server run on (default: 3001)?
4. Do you want different styling/colors for each role type?
5. Should I include a simple script to add sample wallet data for testing?

---

Please review this plan and let me know if you'd like any modifications or have additional requirements. Once approved, I'll proceed with building the component according to this specification.