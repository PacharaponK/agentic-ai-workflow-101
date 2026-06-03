const express = require('express');
const {
  createWallet,
  getWallet,
  deposit,
  withdraw,
  transfer,
  getTransactions,
  getAllWallets,
} = require('./walletController');

const app = express();
app.use(express.json());

app.get('/wallets', getAllWallets);
app.post('/wallets', createWallet);
app.get('/wallets/:id', getWallet);
app.post('/wallets/:id/deposit', deposit);
app.post('/wallets/:id/withdraw', withdraw);
app.post('/wallets/:id/transfer', transfer);
app.get('/wallets/:id/transactions', getTransactions);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Digital Wallet server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
