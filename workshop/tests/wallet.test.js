// wallet.test.js — Unit Tests สำหรับ Wallet class
//
// ใช้ fixtures จาก tests/fixtures/wallets.js เพื่อ:
//   - ลดโค้ด setup ซ้ำใน beforeEach
//   - ให้ข้อมูล test สอดคล้องกันทั้งไฟล์
//   - ทดสอบ scenario ที่มี transaction history ล่วงหน้าได้

const Wallet = require('../src/wallet');
const {
  RAW_DATA,
  createFixtureWallet,
  Scenarios,
} = require('./fixtures/wallets');

// ─── Constructor ──────────────────────────────────────────────────────────────

describe('Wallet - constructor', () => {
  test('สร้าง wallet ได้พร้อม id, owner และ balance เริ่มต้นที่ 0', () => {
    const w = new Wallet(RAW_DATA.alice.owner);

    expect(w.id).toBeDefined();
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

// ─── Fixture Factory ──────────────────────────────────────────────────────────

describe('Fixture - createFixtureWallet', () => {
  test('สร้าง wallet พร้อม initialBalance ตาม RAW_DATA', () => {
    const w = createFixtureWallet('alice');

    expect(w.owner).toBe('Alice');
    expect(w.balance).toBe(RAW_DATA.alice.initialBalance); // 5,000
    expect(w.transactions).toHaveLength(1);                // deposit 1 ครั้ง
  });

  test('wallet broke มี balance 0 และยังไม่มี transaction', () => {
    const w = createFixtureWallet('broke');

    expect(w.balance).toBe(0);
    expect(w.transactions).toHaveLength(0);
  });

  test('แต่ละ call คืน instance ใหม่ — ไม่แชร์ state กัน', () => {
    const w1 = createFixtureWallet('alice');
    const w2 = createFixtureWallet('alice');

    expect(w1.id).not.toBe(w2.id); // UUID ต่างกัน
    w1.deposit(999);
    expect(w2.balance).toBe(RAW_DATA.alice.initialBalance); // w2 ไม่ถูกกระทบ
  });
});

// ─── Deposit ──────────────────────────────────────────────────────────────────

describe('Wallet - deposit', () => {
  let wallet;

  // ใช้ fixture broke (balance=0) เพื่อให้ตัวเลขตรวจสอบได้ชัดเจน
  beforeEach(() => { wallet = createFixtureWallet('broke'); });

  test('ฝากเงินแล้ว balance เพิ่มขึ้นถูกต้อง', () => {
    const balance = wallet.deposit(500);

    expect(balance).toBe(500);
    expect(wallet.getBalance()).toBe(500);
  });

  test('ฝากหลายครั้งสะสมถูกต้อง', () => {
    wallet.deposit(200);
    wallet.deposit(300);

    expect(wallet.getBalance()).toBe(500);
  });

  test('บันทึก transaction ประเภท deposit พร้อม snapshot ของ balance', () => {
    wallet.deposit(100);

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

  // ใช้ fixture alice (balance=5,000) เพื่อให้ถอนได้ทันทีโดยไม่ต้อง deposit ใน test
  beforeEach(() => { wallet = createFixtureWallet('alice'); });

  test('ถอนเงินแล้ว balance ลดถูกต้อง', () => {
    const balance = wallet.withdraw(1_000);

    expect(balance).toBe(4_000); // 5,000 - 1,000
  });

  test('ถอนจนหมดได้ — balance เหลือ 0', () => {
    const balance = wallet.withdraw(RAW_DATA.alice.initialBalance);

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
    expect(() => wallet.withdraw(99_999)).toThrow('Insufficient balance');
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

  // ใช้ Scenario factory — ได้ wallet ทั้งคู่พร้อม state ที่ reset ก่อนทุก test
  beforeEach(() => {
    alice = createFixtureWallet('alice'); // balance=5,000
    bob   = createFixtureWallet('bob');   // balance=2,000
  });

  test('โอนเงินจาก alice ไป bob แล้ว balance ทั้งคู่ถูกต้อง', () => {
    const result = alice.transfer(1_000, bob);

    expect(result.fromBalance).toBe(4_000); // 5,000 - 1,000
    expect(result.toBalance).toBe(3_000);   // 2,000 + 1,000
  });

  test('บันทึก transfer_out ฝั่ง alice และ transfer_in ฝั่ง bob', () => {
    alice.transfer(500, bob);

    const aliceTxn = alice.getTransactions().find((t) => t.type === 'transfer_out');
    const bobTxn   = bob.getTransactions().find((t) => t.type === 'transfer_in');

    expect(aliceTxn).toBeDefined();
    expect(aliceTxn.to).toBe(bob.id);   // ระบุปลายทาง

    expect(bobTxn).toBeDefined();
    expect(bobTxn.from).toBe(alice.id); // ระบุต้นทาง
  });

  test('throw error เมื่อ balance ไม่เพียงพอ', () => {
    expect(() => alice.transfer(99_999, bob)).toThrow('Insufficient balance');
  });

  test('throw error เมื่อโอนเข้า wallet ตัวเอง', () => {
    expect(() => alice.transfer(100, alice)).toThrow('Cannot transfer to the same wallet');
  });

  test('throw error เมื่อ target ไม่ใช่ instance ของ Wallet', () => {
    expect(() => alice.transfer(100, {})).toThrow('Target must be a valid Wallet');
    expect(() => alice.transfer(100, null)).toThrow('Target must be a valid Wallet');
  });
});

// ─── Scenario: aliceToBob ─────────────────────────────────────────────────────
// ทดสอบ state หลังจากโอนเงินเสร็จแล้ว โดยใช้ Scenario factory

describe('Scenario - aliceToBob (transfer 1,000)', () => {
  let sender, receiver;

  beforeEach(() => {
    ({ sender, receiver } = Scenarios.aliceToBob());
  });

  test('sender มี balance ลดลงหลังโอน', () => {
    // alice เริ่มที่ 5,000 แล้วโอน 1,000
    expect(sender.balance).toBe(RAW_DATA.alice.initialBalance - 1_000); // 4,000
  });

  test('receiver มี balance เพิ่มขึ้นหลังโอน', () => {
    // bob เริ่มที่ 2,000 แล้วรับ 1,000
    expect(receiver.balance).toBe(RAW_DATA.bob.initialBalance + 1_000); // 3,000
  });

  test('sender มี 2 transactions (deposit + transfer_out)', () => {
    const types = sender.getTransactions().map((t) => t.type);
    expect(types).toEqual(['deposit', 'transfer_out']);
  });

  test('receiver มี 2 transactions (deposit + transfer_in)', () => {
    const types = receiver.getTransactions().map((t) => t.type);
    expect(types).toEqual(['deposit', 'transfer_in']);
  });
});

// ─── getTransactions ──────────────────────────────────────────────────────────

describe('Wallet - getTransactions', () => {
  test('คืน array ใหม่ทุกครั้ง (immutability) เพื่อป้องกัน state ถูกแก้จากภายนอก', () => {
    const w = createFixtureWallet('alice');

    const snapshot = w.getTransactions();
    snapshot.push({ fake: true }); // แก้ copy ที่ได้มา

    // array ภายใน wallet ต้องไม่เปลี่ยน
    expect(w.getTransactions()).toHaveLength(1); // มีแค่ deposit ที่ fixture สร้าง
  });
});
