# 🚀 Coronad Wallet Checker

## 📜 Project Title and Description

This is a **Full-Stack Web3 Wallet Checker** application designed to determine the eligibility or status of wallet addresses. It features a React-based frontend for user interaction, an Express.js server for API logic, and a MongoDB database for persistence (likely storing whitelisted addresses or wallet status).

> A robust, full-stack solution to efficiently manage and verify the status of user wallets in a Web3 ecosystem.

### ✨ Key Features
* **Full-Stack Architecture:** Separate frontend and backend directories for scalable development.
* **Wallet Submission:** Frontend interface to input or connect wallets for checking.
* **Backend Validation:** Express.js API to process the wallet address against a database.
* **MongoDB Integration:** Persistent storage for managing wallet lists and data.
* **Web3 Ready:** Designed to handle standard Ethereum-compatible wallet addresses.

---

## ⚙️ Tech Stack Used

This project is built using a classic MERN-adjacent stack with a focus on JavaScript for the entire application.

### Frontend Technologies
| Technology | Purpose | Badge |
| :--- | :--- | :--- |
| **React** | Primary JavaScript library for building the user interface. | [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/) |
| **JavaScript** | Core language for the entire frontend application logic. | [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) |
| **CSS** | For custom styling and application presentation. | [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) |

### Backend & Database Technologies
| Technology | Purpose | Badge |
| :--- | :--- | :--- |
| **Express.js** | Node.js web application framework for building the API and server logic. | [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/) |
| **Node.js** | JavaScript runtime environment for the backend server. | [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/) |
| **MongoDB** | NoSQL database for flexible and scalable data storage. | [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/) |

---

## 🛠️ Installation & Setup

This project requires setting up both the frontend and the backend separately.

### Prerequisites

* [Node.js](https://nodejs.org/) (LTS version recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a remote connection string)

### Step-by-Step Instructions

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/TheinSoe137/coronad-wallet-checker.git](https://github.com/TheinSoe137/coronad-wallet-checker.git)
    cd coronad-wallet-checker
    ```

2.  **Configure the Backend**
    * Navigate to the `backend` directory:
        ```bash
        cd backend
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * Create a `.env` file in the `backend` folder and add your configuration (e.g., connection string and port):
        ```
        # .env file content in backend/
        PORT=5000
        MONGO_URI=mongodb+srv://<user>:<password>@<cluster-url>/wallet-checker?retryWrites=true&w=majority
        ```
    * (If necessary) Check `server.js` or API files for other required environment variables.

3.  **Configure the Frontend**
    * Navigate to the `frontend` directory:
        ```bash
        cd ../frontend
        ```
    * Install dependencies:
        ```bash
        npm install
        ```
    * Create a `.env` or `.env.local` file in the `frontend` folder to configure the API endpoint:
        ```
        # .env.local file content in frontend/
        # This points the React app to your running backend server
        REACT_APP_API_BASE_URL=http://localhost:5000/api
        ```

---

## 🏃 How to Run / Usage

You must run the backend server and the frontend application concurrently in two separate terminal windows.

### 1. Start the Backend Server

From the **`backend`** directory:

```bash
npm start
# Server will typically run on http://localhost:5000

## 2. Start the Frontend Application

From the frontend directory:

```bash
npm start
```

# Application will typically open in your browser at [http://localhost:3000](http://localhost:3000)

## Usage

1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Use the interface to input a wallet address or connect a Web3 wallet.
3. The frontend will send a request to the backend API (`/api/check-wallet`).
4. The backend will query the MongoDB database and return the wallet's status (e.g., whitelisted, ineligible).
5. The frontend displays the result to the user.

## 🔗 Live Demo

This project is deployed and available online:
* https://checker.coronad.xyz/
(The link was found in the GitHub repository's information section.)
