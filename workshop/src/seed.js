// seed.js — เติมข้อมูลตัวอย่างลงใน in-memory store
//
// ใช้สำหรับ development เท่านั้น (NODE_ENV=development)
// เรียกผ่าน server.js หรือรันตรงด้วย: node src/seed.js

const Wallet = require('./wallet');

/**
 * เติม wallet ตัวอย่างพร้อม transaction history ลงใน Map ที่ส่งเข้ามา
 * รับ Map แทนการ import โดยตรงเพื่อให้ test seed ได้โดยไม่กระทบ store จริง
 *
 * @param {Map<string, Wallet>} walletsMap — Map จาก walletController
 * @returns {{ alice: Wallet, bob: Wallet, charlie: Wallet, diana: Wallet }}
 */
function seed(walletsMap) {
  // ─── สร้าง wallet ────────────────────────────────────────────────────────

  const alice   = new Wallet('Alice');
  const bob     = new Wallet('Bob');
  const charlie = new Wallet('Charlie');
  const diana   = new Wallet('Diana');   // wallet ยังไม่มีธุรกรรม (edge-case)

  // ─── ฝากเงินเริ่มต้น ─────────────────────────────────────────────────────

  alice.deposit(10_000);   // ลูกค้า VIP
  bob.deposit(3_000);
  charlie.deposit(1_500);
  // diana ไม่ฝากเงิน — ทดสอบ wallet ยอดศูนย์

  // ─── สร้างประวัติธุรกรรม ──────────────────────────────────────────────────

  alice.transfer(2_000, bob);      // alice โอนให้ bob
  bob.transfer(500, charlie);      // bob โอนต่อให้ charlie
  charlie.withdraw(300);           // charlie ถอนเงินออก
  alice.deposit(5_000);            // alice ฝากเพิ่ม
  alice.transfer(1_000, charlie);  // alice โอนให้ charlie โดยตรง

  // ─── บันทึกลง store ───────────────────────────────────────────────────────

  [alice, bob, charlie, diana].forEach((w) => walletsMap.set(w.id, w));

  // สรุปยอดหลัง seed สำหรับ debug
  console.log('─── Seed completed ──────────────────────────');
  [alice, bob, charlie, diana].forEach((w) => {
    console.log(`  ${w.owner.padEnd(8)} id=${w.id}  balance=${w.balance}`);
  });
  console.log('─────────────────────────────────────────────');

  return { alice, bob, charlie, diana };
}

// ─── รันตรงจาก CLI ────────────────────────────────────────────────────────────
// node src/seed.js  →  seed ลง store ของ walletController จริง
if (require.main === module) {
  const { wallets } = require('./walletController');
  seed(wallets);
}

module.exports = seed;
