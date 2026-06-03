const Wallet = require('../src/wallet');

// ─── Wallet Class Unit Tests ──────────────────────────────────────────────────

describe('Wallet - constructor', () => {
  test('สร้าง wallet ได้พร้อม id, owner และ balance เริ่มต้นที่ 0', () => {
    const w = new Wallet('Alice');
    expect(w.id).toBeDefined();
    expect(w.owner).toBe('Alice');
    expect(w.balance).toBe(0);
    expect(w.transactions).toHaveLength(0);
  });

  test('ตัด whitespace จาก owner', () => {
    const w = new Wallet('  Bob  ');
    expect(w.owner).toBe('Bob');
  });

  test('throw error เมื่อ owner ว่างเปล่า', () => {
    expect(() => new Wallet('')).toThrow('Owner name is required');
    expect(() => new Wallet('   ')).toThrow('Owner name is required');
  });

  test('throw error เมื่อ owner ไม่ใช่ string', () => {
    expect(() => new Wallet(null)).toThrow('Owner name is required');
    expect(() => new Wallet(123)).toThrow('Owner name is required');
  });
});

// ─── Deposit ──────────────────────────────────────────────────────────────────

describe('Wallet - deposit', () => {
  let wallet;
  beforeEach(() => { wallet = new Wallet('Alice'); });

  test('ฝากเงินและ balance เพิ่มขึ้นถูกต้อง', () => {
    const balance = wallet.deposit(500);
    expect(balance).toBe(500);
    expect(wallet.getBalance()).toBe(500);
  });

  test('ฝากหลายครั้งสะสมถูกต้อง', () => {
    wallet.deposit(200);
    wallet.deposit(300);
    expect(wallet.getBalance()).toBe(500);
  });

  test('บันทึก transaction ประเภท deposit', () => {
    wallet.deposit(100);
    const txn = wallet.getTransactions()[0];
    expect(txn.type).toBe('deposit');
    expect(txn.amount).toBe(100);
    expect(txn.balance).toBe(100);
  });

  test('throw error เมื่อ amount เป็น 0 หรือลบ', () => {
    expect(() => wallet.deposit(0)).toThrow('Deposit amount must be greater than 0');
    expect(() => wallet.deposit(-100)).toThrow('Deposit amount must be greater than 0');
  });

  test('throw error เมื่อ amount ไม่ใช่ตัวเลข', () => {
    expect(() => wallet.deposit('abc')).toThrow('Amount must be a number');
    expect(() => wallet.deposit(NaN)).toThrow('Amount must be a number');
  });
});

// ─── Withdraw ─────────────────────────────────────────────────────────────────

describe('Wallet - withdraw', () => {
  let wallet;
  beforeEach(() => {
    wallet = new Wallet('Bob');
    wallet.deposit(1000);
  });

  test('ถอนเงินและ balance ลดถูกต้อง', () => {
    const balance = wallet.withdraw(300);
    expect(balance).toBe(700);
  });

  test('ถอนจนหมด balance เหลือ 0 ได้', () => {
    const balance = wallet.withdraw(1000);
    expect(balance).toBe(0);
  });

  test('บันทึก transaction ประเภท withdrawal', () => {
    wallet.withdraw(400);
    const txns = wallet.getTransactions();
    const last = txns[txns.length - 1];
    expect(last.type).toBe('withdrawal');
    expect(last.amount).toBe(400);
  });

  test('throw error เมื่อ balance ไม่พอ', () => {
    expect(() => wallet.withdraw(9999)).toThrow('Insufficient balance');
  });

  test('throw error เมื่อ amount เป็น 0 หรือลบ', () => {
    expect(() => wallet.withdraw(0)).toThrow('Withdrawal amount must be greater than 0');
    expect(() => wallet.withdraw(-50)).toThrow('Withdrawal amount must be greater than 0');
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
    bob = new Wallet('Bob');
    alice.deposit(1000);
  });

  test('โอนเงินจาก alice ไป bob ได้ถูกต้อง', () => {
    const result = alice.transfer(400, bob);
    expect(result.fromBalance).toBe(600);
    expect(result.toBalance).toBe(400);
  });

  test('บันทึก transaction ประเภท transfer_out และ transfer_in', () => {
    alice.transfer(200, bob);
    const aliceTxn = alice.getTransactions().find((t) => t.type === 'transfer_out');
    const bobTxn = bob.getTransactions().find((t) => t.type === 'transfer_in');
    expect(aliceTxn).toBeDefined();
    expect(aliceTxn.to).toBe(bob.id);
    expect(bobTxn).toBeDefined();
    expect(bobTxn.from).toBe(alice.id);
  });

  test('throw error เมื่อ balance ไม่พอ', () => {
    expect(() => alice.transfer(9999, bob)).toThrow('Insufficient balance');
  });

  test('throw error เมื่อโอนหา wallet เดิม', () => {
    expect(() => alice.transfer(100, alice)).toThrow('Cannot transfer to the same wallet');
  });

  test('throw error เมื่อ target ไม่ใช่ Wallet', () => {
    expect(() => alice.transfer(100, {})).toThrow('Target must be a valid Wallet');
    expect(() => alice.transfer(100, null)).toThrow('Target must be a valid Wallet');
  });
});

// ─── getTransactions ──────────────────────────────────────────────────────────

describe('Wallet - getTransactions', () => {
  test('คืน array ใหม่ทุกครั้ง (immutable)', () => {
    const w = new Wallet('Eve');
    w.deposit(100);
    const t1 = w.getTransactions();
    t1.push({ fake: true });
    expect(w.getTransactions()).toHaveLength(1);
  });
});
