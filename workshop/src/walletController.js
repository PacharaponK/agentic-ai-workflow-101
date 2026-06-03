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

/**
 * @swagger
 * /wallets:
 *   post:
 *     summary: สร้าง wallet ใหม่
 *     tags: [Wallets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [owner]
 *             properties:
 *               owner:
 *                 type: string
 *                 example: Alice
 *     responses:
 *       201:
 *         description: สร้าง wallet สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 wallet:
 *                   $ref: '#/components/schemas/Wallet'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /wallets:
 *   get:
 *     summary: ดู wallet ทั้งหมดในระบบ
 *     tags: [Wallets]
 *     responses:
 *       200:
 *         description: รายการ wallet ทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Wallet'
 */
function getAllWallets(req, res) {
  const list = Array.from(wallets.values()).map((w) => w.toJSON());
  return res.json(list);
}

/**
 * @swagger
 * /wallets/{id}:
 *   get:
 *     summary: ดู wallet ตาม id
 *     tags: [Wallets]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Wallet ID
 *     responses:
 *       200:
 *         description: ข้อมูล wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 *       404:
 *         description: ไม่พบ wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
function getWallet(req, res) {
  const wallet = findWallet(req.params.id, res);
  if (!wallet) return;
  return res.json(wallet.toJSON());
}

// ─── Wallet Operations ────────────────────────────────────────────────────────

/**
 * @swagger
 * /wallets/{id}/deposit:
 *   post:
 *     summary: ฝากเงินเข้า wallet
 *     tags: [Operations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: ฝากเงินสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 balance: { type: number, example: 6000 }
 *       400:
 *         description: จำนวนเงินไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ไม่พบ wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /wallets/{id}/withdraw:
 *   post:
 *     summary: ถอนเงินจาก wallet
 *     tags: [Operations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: ถอนเงินสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 balance: { type: number, example: 4500 }
 *       400:
 *         description: จำนวนเงินไม่ถูกต้อง หรือยอดไม่เพียงพอ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ไม่พบ wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /wallets/{id}/transfer:
 *   post:
 *     summary: โอนเงินไปยัง wallet อื่น
 *     tags: [Operations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: Wallet ID ต้นทาง
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [toWalletId, amount]
 *             properties:
 *               toWalletId:
 *                 type: string
 *                 format: uuid
 *                 description: Wallet ID ปลายทาง
 *               amount:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: โอนเงินสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:     { type: string }
 *                 fromBalance: { type: number, example: 4000 }
 *                 toBalance:   { type: number, example: 3000 }
 *       400:
 *         description: จำนวนเงินไม่ถูกต้อง หรือยอดไม่เพียงพอ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: ไม่พบ wallet ต้นทางหรือปลายทาง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /wallets/{id}/transactions:
 *   get:
 *     summary: ดูประวัติธุรกรรมทั้งหมดของ wallet
 *     tags: [Operations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: รายการธุรกรรม
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: ไม่พบ wallet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
