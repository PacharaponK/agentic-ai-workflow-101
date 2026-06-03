// tests/fixtures/wallets.js — Fixture สำหรับ Wallet tests
//
// แบ่งออกเป็น 3 ส่วน:
//   1. RAW_DATA     — plain object สำหรับ build request body หรือ assert response
//   2. Factories    — ฟังก์ชันสร้าง Wallet instance พร้อมใช้งาน (no side effects)
//   3. Scenarios    — ชุด wallet ที่มี transaction history ครบ ใช้กับ test ที่ซับซ้อน

const Wallet = require('../../src/wallet');

// ─── 1. Raw Data ──────────────────────────────────────────────────────────────
// ใช้เป็น payload ของ API request หรือ assert ค่าพื้นฐาน

const RAW_DATA = {
  alice:   { owner: 'Alice',   initialBalance: 5_000 },
  bob:     { owner: 'Bob',     initialBalance: 2_000 },
  charlie: { owner: 'Charlie', initialBalance:   500 },
  broke:   { owner: 'Dave',    initialBalance:     0 }, // wallet ที่ยังไม่มีเงิน
};

// ─── 2. Factories ─────────────────────────────────────────────────────────────

/**
 * สร้าง Wallet instance จาก key ใน RAW_DATA
 * แต่ละ call คืน instance ใหม่เสมอ — ป้องกัน state รั่วข้าม test
 *
 * @param {'alice'|'bob'|'charlie'|'broke'} key
 * @returns {Wallet}
 */
function createFixtureWallet(key) {
  const { owner, initialBalance } = RAW_DATA[key];
  const wallet = new Wallet(owner);
  if (initialBalance > 0) {
    wallet.deposit(initialBalance);
  }
  return wallet;
}

/**
 * สร้าง wallet คู่ (sender + receiver) พร้อมทำ transfer ตามที่กำหนด
 * ใช้กับ test ที่ต้องการ transaction history ของการโอนเงิน
 *
 * @param {{ senderKey: string, receiverKey: string, transferAmount: number }} options
 * @returns {{ sender: Wallet, receiver: Wallet }}
 */
function createTransferScenario({ senderKey, receiverKey, transferAmount }) {
  const sender   = createFixtureWallet(senderKey);
  const receiver = createFixtureWallet(receiverKey);
  sender.transfer(transferAmount, receiver);
  return { sender, receiver };
}

// ─── 3. Preset Scenarios ──────────────────────────────────────────────────────
// ชุด factory สำเร็จรูปสำหรับ scenario ที่พบบ่อยใน test

const Scenarios = {
  // wallet เดี่ยวที่พร้อมถอน/โอน
  richWallet: () => createFixtureWallet('alice'),

  // wallet เปล่าสำหรับ test เงินไม่พอ
  emptyWallet: () => createFixtureWallet('broke'),

  // คู่โอนเงิน: alice โอน 1,000 ไป bob
  aliceToBob: () =>
    createTransferScenario({
      senderKey:      'alice',
      receiverKey:    'bob',
      transferAmount: 1_000,
    }),

  // คู่โอนเงิน: bob โอน 500 ไป charlie
  bobToCharlie: () =>
    createTransferScenario({
      senderKey:      'bob',
      receiverKey:    'charlie',
      transferAmount: 500,
    }),
};

module.exports = { RAW_DATA, createFixtureWallet, createTransferScenario, Scenarios };
