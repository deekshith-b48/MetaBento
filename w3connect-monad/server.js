require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ethers } = require('ethers');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to Monad Testnet
const provider = new ethers.JsonRpcProvider(process.env.MONAD_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// In-memory storage
const userXP = {}; // { [walletAddress]: xp }
const transactions = [];

// XP increment endpoint
app.post('/connect', async (req, res) => {
  const { walletAddress } = req.body;
  
  // Initialize XP if new user
  if (!userXP[walletAddress]) {
    userXP[walletAddress] = 0;
  }
  
  // Increment XP
  userXP[walletAddress] += 10;
  
  // Send dummy transaction
  try {
    const tx = await wallet.sendTransaction({
      to: walletAddress,
      value: ethers.parseEther("0.00001")
    });
    
    transactions.push({
      hash: tx.hash,
      from: wallet.address,
      to: walletAddress,
      value: "0.00001 ETH"
    });
    
    res.json({
      success: true,
      xp: userXP[walletAddress],
      txHash: tx.hash,
      message: "Connected successfully! +10 XP"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Connection failed"
    });
  }
});

// Token redemption endpoint
app.post('/redeem', (req, res) => {
  const { walletAddress, xp } = req.body;
  
  if (!userXP[walletAddress] || userXP[walletAddress] < xp) {
    return res.status(400).json({
      success: false,
      message: "Insufficient XP"
    });
  }
  
  // Deduct XP and calculate tokens
  userXP[walletAddress] -= xp;
  const tokens = (xp * 0.1).toFixed(2);
  
  res.json({
    success: true,
    redeemed: `${tokens} MONAD`,
    remainingXP: userXP[walletAddress],
    message: `Redeemed ${tokens} MONAD tokens!`
  });
});

// Get user data
app.get('/user/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  res.json({
    walletAddress,
    xp: userXP[walletAddress] || 0
  });
});

// Get transactions
app.get('/transactions', (req, res) => {
  res.json(transactions);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
