// wallet.test.js — Unit Tests สำหรับ Wallet class
// ทดสอบ business logic ล้วน ๆ โดยไม่ผ่าน HTTP layer
//
// แต่ละ describe จัดกลุ่มตาม method
// beforeEach สร้าง wallet ใหม่ก่อนทุก test เพื่อไม่ให้ state รั่วข้าม test

const Wallet = require('../src/wallet');

// ─── Constructor ──────────────────────────────────────────────────────────────

describe('Wallet - constructor', () => {
  test('สร้าง wallet ได้พร้อม id, owner และ balance เริ่มต้นที่ 0', () => {
    const w = new Wallet('Alice');

    expect(w.id).toBeDefined();           // UUID ต้องถูกสร้าง
    expect(w.owner).toBe('Alice');
    expect(w.balance).toBe(0);           // ยอดเริ่มต้นต้องเป็น 0 เสมอ
    expect(w.transactions).toHaveLength(0);
  });

  test('ตัด whitespace หัวท้ายออกจาก owner', () => {
    const w = new Wallet('  Bob  ');
    expect(w.owner).toBe('Bob');
  });

  test('throw error เมื่อ owner เป็น string ว่าง', () => {
    expect(() => new Wallet('')).toThrow('Owner name is required');
    expect(() => new Wallet('   ')).toThrow('Owner name is required'); // whitespace-only
  });

  test('throw error เมื่อ owner ไม่ใช่ string', () => {
    expect(() => new Wallet(null)).toThrow('Owner name is required');
    expect(() => new Wallet(123)).toThrow('Owner name is required');
  });
});

// ─── Deposit ──────────────────────────────────────────────────────────────────

describe('Wallet - deposit', () => {
  let wallet;

  // สร้าง wallet ใหม่ก่อนทุก test — ป้องกัน balance พอกจาก test ก่อนหน้า
  beforeEach(() => { wallet = new Wallet('Alice'); });

  test('ฝากเงินแล้ว balance เพิ่มขึ้นถูกต้อง', () => {
    const balance = wallet.deposit(500);

    expect(balance).toBe(500);           // ค่าที่คืนจาก method
    expect(wallet.getBalance()).toBe(500); // state ภายในต้องตรงกัน
  });

  test('ฝากหลายครั้งสะสมถูกต้อง', () => {
    wallet.deposit(200);
    wallet.deposit(300);

    expect(wallet.getBalance()).toBe(500);
  });

  test('บันทึก transaction ประเภท deposit พร้อม snapshot ของ balance', () => {
    wallet.deposit(100);

    // ตรวจสอบ record ที่บันทึกไว้
    const txn = wallet.getTransactions()[0];
    expect(txn.type).toBe('deposit');
    expect(txn.amount).toBe(100);
    expect(txn.balance).toBe(100); // balance หลัง deposit
  });

  test('throw error เมื่อ amount เป็น 0 หรือติดลบ', () => {
    expect(() => wallet.deposit(0)).toThrow('Amount must be greater than 0');
    expect(() => wallet.deposit(-100)).toThrow('Amount must be greater than 0');
  });

  test('throw error เมื่อ amount ไม่ใช่ตัวเลข', () => {
    expect(() => wallet.deposit('abc')).toThrow('Amount must be a number');
    expect(() => wallet.deposit(NaN)).toThrow('Amount must be a number');
  });
});

// ─── Withdraw ─────────────────────────────────────────────────────────────────

describe('Wallet - withdraw', () => {
  let wallet;

  // ฝาก 1000 ไว้ก่อนเพื่อให้ test ถอนได้โดยไม่ต้อง setup ซ้ำทุก test
  beforeEach(() => {
    wallet = new Wallet('Bob');
    wallet.deposit(1000);
  });

  test('ถอนเงินแล้ว balance ลดถูกต้อง', () => {
    const balance = wallet.withdraw(300);

    expect(balance).toBe(700);
  });

  test('ถอนจนหมดได้ — balance เหลือ 0', () => {
    const balance = wallet.withdraw(1000);

    expect(balance).toBe(0);
  });

  test('บันทึก transaction ประเภท withdrawal', () => {
    wallet.withdraw(400);

    const txns = wallet.getTransactions();
    const last = txns[txns.length - 1]; // transaction ล่าสุดคือ withdrawal ที่เพิ่งทำ
    expect(last.type).toBe('withdrawal');
    expect(last.amount).toBe(400);
  });

  test('throw error เมื่อ balance ไม่เพียงพอ', () => {
    expect(() => wallet.withdraw(9999)).toThrow('Insufficient balance');
  });

  test('throw error เมื่อ amount เป็น 0 หรือติดลบ', () => {
    expect(() => wallet.withdraw(0)).toThrow('Amount must be greater than 0');
    expect(() => wallet.withdraw(-50)).toThrow('Amount must be greater than 0');
  });

  test('throw error เมื่อ amount ไม่ใช่ตัวเลข', () => {
    expect(() => wallet.withdraw(null)).toThrow('Amount must be a number');
  });
});

// ─── Transfer ─────────────────────────────────────────────────────────────────

describe('Wallet - transfer', () => {
  let alice, bob;

  beforeEach(() => {
    alice = new Wallet('Alice');
    bob   = new Wallet('Bob');
    alice.deposit(1000); // alice มีเงินสำหรับโอน
  });

  test('โอนเงินจาก alice ไป bob แล้ว balance ทั้งคู่ถูกต้อง', () => {
    const result = alice.transfer(400, bob);

    expect(result.fromBalance).toBe(600);
    expect(result.toBalance).toBe(400);
  });

  test('บันทึก transfer_out ฝั่ง alice และ transfer_in ฝั่ง bob', () => {
    alice.transfer(200, bob);

    const aliceTxn = alice.getTransactions().find((t) => t.type === 'transfer_out');
    const bobTxn   = bob.getTransactions().find((t) => t.type === 'transfer_in');

    // ต้องมี record การโอนในทั้งสอง wallet
    expect(aliceTxn).toBeDefined();
    expect(aliceTxn.to).toBe(bob.id);   // ระบุปลายทาง

    expect(bobTxn).toBeDefined();
    expect(bobTxn.from).toBe(alice.id); // ระบุต้นทาง
  });

  test('throw error เมื่อ balance ไม่เพียงพอ', () => {
    expect(() => alice.transfer(9999, bob)).toThrow('Insufficient balance');
  });

  test('throw error เมื่อโอนเข้า wallet ตัวเอง', () => {
    expect(() => alice.transfer(100, alice)).toThrow('Cannot transfer to the same wallet');
  });

  test('throw error เมื่อ target ไม่ใช่ instance ของ Wallet', () => {
    expect(() => alice.transfer(100, {})).toThrow('Target must be a valid Wallet');
    expect(() => alice.transfer(100, null)).toThrow('Target must be a valid Wallet');
  });
});

// ─── getTransactions ──────────────────────────────────────────────────────────

describe('Wallet - getTransactions', () => {
  test('คืน array ใหม่ทุกครั้ง (immutability) เพื่อป้องกัน state ถูกแก้จากภายนอก', () => {
    const w = new Wallet('Eve');
    w.deposit(100);

    const snapshot = w.getTransactions();
    snapshot.push({ fake: true }); // แก้ copy ที่ได้มา

    // array ภายใน wallet ต้องไม่เปลี่ยน
    expect(w.getTransactions()).toHaveLength(1);
  });
});
