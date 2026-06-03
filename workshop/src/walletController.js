// walletController.js — Route handlers สำหรับ Wallet API
// แต่ละ function รับ (req, res) จาก Express และเรียก Wallet class

const Wallet = require('./wallet');

// ─── In-memory Store ──────────────────────────────────────────────────────────
// ใช้ Map<walletId, Wallet> เก็บข้อมูลชั่วคราว
// ข้อมูลจะหายเมื่อ server restart (เหมาะสำหรับ demo เท่านั้น)
const wallets = new Map();

// ─── Helpers ─────────────────────────────────────────────────────────────────

// หา wallet จาก id และส่ง 404 ให้อัตโนมัติถ้าไม่พบ
// คืน null เพื่อให้ caller return ออกได้ทันที
function findWallet(id, res) {
  const wallet = wallets.get(id);
  if (!wallet) {
    res.status(404).json({ error: 'Wallet not found' });
    return null;
  }
  return wallet;
}

// ─── Wallet CRUD ──────────────────────────────────────────────────────────────

// POST /wallets — สร้าง wallet ใหม่
// Body: { owner: string }
function createWallet(req, res) {
  try {
    const { owner } = req.body;
    const wallet = new Wallet(owner);
    wallets.set(wallet.id, wallet);
    return res.status(201).json({ message: 'Wallet created', wallet: wallet.toJSON() });
  } catch (err) {
    // Wallet constructor จะ throw ถ้า owner ไม่ถูกต้อง
    return res.status(400).json({ error: err.message });
  }
}

// GET /wallets — ดู wallet ทั้งหมดในระบบ
function getAllWallets(req, res) {
  const list = Array.from(wallets.values()).map((w) => w.toJSON());
  return res.json(list);
}

// GET /wallets/:id — ดู wallet ตาม id
function getWallet(req, res) {
  const wallet = findWallet(req.params.id, res);
  if (!wallet) return;
  return res.json(wallet.toJSON());
}

// ─── Wallet Operations ────────────────────────────────────────────────────────

// POST /wallets/:id/deposit — ฝากเงิน
// Body: { amount: number }
function deposit(req, res) {
  const wallet = findWallet(req.params.id, res);
  if (!wallet) return;

  try {
    const amount  = Number(req.body.amount);
    const balance = wallet.deposit(amount);
    return res.json({ message: 'Deposit successful', balance });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// POST /wallets/:id/withdraw — ถอนเงิน
// Body: { amount: number }
function withdraw(req, res) {
  const wallet = findWallet(req.params.id, res);
  if (!wallet) return;

  try {
    const amount  = Number(req.body.amount);
    const balance = wallet.withdraw(amount);
    return res.json({ message: 'Withdrawal successful', balance });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// POST /wallets/:id/transfer — โอนเงินไปยัง wallet อื่น
// Body: { toWalletId: string, amount: number }
function transfer(req, res) {
  const fromWallet = findWallet(req.params.id, res);
  if (!fromWallet) return;

  // ตรวจสอบ target wallet แยกต่างหากเพื่อให้ error message ชัดเจน
  const toWallet = wallets.get(req.body.toWalletId);
  if (!toWallet) {
    return res.status(404).json({ error: 'Target wallet not found' });
  }

  try {
    const amount = Number(req.body.amount);
    const result = fromWallet.transfer(amount, toWallet);
    return res.json({ message: 'Transfer successful', ...result });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// GET /wallets/:id/transactions — ดูประวัติธุรกรรมทั้งหมด
function getTransactions(req, res) {
  const wallet = findWallet(req.params.id, res);
  if (!wallet) return;
  return res.json(wallet.getTransactions());
}

// ─── Exports ──────────────────────────────────────────────────────────────────
// export wallets ด้วยเพื่อให้ test ไฟล์ reset state ระหว่าง test ได้
module.exports = {
  createWallet,
  getAllWallets,
  getWallet,
  deposit,
  withdraw,
  transfer,
  getTransactions,
  wallets,
};
