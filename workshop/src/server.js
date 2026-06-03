// server.js — Entry point ของ Digital Wallet API
// ลงทะเบียน middleware และ routes ทั้งหมด แล้ว export app สำหรับ testing

const express = require('express');
const {
  createWallet,
  getAllWallets,
  getWallet,
  deposit,
  withdraw,
  transfer,
  getTransactions,
} = require('./walletController');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json()); // parse request body เป็น JSON อัตโนมัติ

// ─── Routes: Wallet CRUD ──────────────────────────────────────────────────────
app.get('/wallets',      getAllWallets);  // ดู wallet ทั้งหมด
app.post('/wallets',     createWallet);  // สร้าง wallet ใหม่
app.get('/wallets/:id',  getWallet);     // ดู wallet ตาม id

// ─── Routes: Wallet Operations ────────────────────────────────────────────────
app.post('/wallets/:id/deposit',      deposit);         // ฝากเงิน
app.post('/wallets/:id/withdraw',     withdraw);        // ถอนเงิน
app.post('/wallets/:id/transfer',     transfer);        // โอนเงิน
app.get('/wallets/:id/transactions',  getTransactions); // ประวัติธุรกรรม

// ─── Health Check ─────────────────────────────────────────────────────────────
// ใช้สำหรับตรวจสอบว่า server ยังทำงานอยู่ (monitoring / load balancer)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

// เริ่ม server เฉพาะเมื่อรันไฟล์นี้โดยตรง (node src/server.js)
// ถ้า require() จาก test ไฟล์จะไม่ listen ซ้ำ
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Digital Wallet server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
