// wallet.js — โมเดลหลักของกระเป๋าเงินดิจิทัล
// จัดการ state (ยอดเงิน + ประวัติธุรกรรม) ทั้งหมดในไฟล์นี้

const { v4: uuidv4 } = require('uuid');

class Wallet {
  // ─── สร้าง wallet ใหม่ ────────────────────────────────────────────────────
  constructor(owner) {
    if (!owner || typeof owner !== 'string' || owner.trim() === '') {
      throw new Error('Owner name is required');
    }

    this.id          = uuidv4();          // UUID ไม่ซ้ำกัน ใช้เป็น primary key
    this.owner       = owner.trim();      // ตัด whitespace หัวท้าย
    this.balance     = 0;                 // ยอดเริ่มต้นเป็น 0 เสมอ
    this.transactions = [];               // ประวัติธุรกรรมทั้งหมด
    this.createdAt   = new Date().toISOString();
  }

  // ─── Validation ───────────────────────────────────────────────────────────

  // ตรวจสอบ amount ก่อนทุก operation — แยกออกมาเพื่อไม่ให้โค้ดซ้ำใน deposit/withdraw
  _validateAmount(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a number');
    }
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
  }

  // บันทึก transaction เข้า array — รวม snapshot ของ balance ณ เวลานั้นด้วย
  _recordTransaction(type, amount, extra = {}) {
    this.transactions.push({
      type,
      amount,
      balance: this.balance,    // บันทึก balance หลัง operation
      timestamp: new Date().toISOString(),
      ...extra,
    });
  }

  // ─── ฝากเงิน ─────────────────────────────────────────────────────────────

  deposit(amount) {
    this._validateAmount(amount);

    this.balance += amount;
    this._recordTransaction('deposit', amount);

    return this.balance;
  }

  // ─── ถอนเงิน ─────────────────────────────────────────────────────────────

  withdraw(amount) {
    this._validateAmount(amount);

    // ป้องกัน balance ติดลบ
    if (amount > this.balance) {
      throw new Error('Insufficient balance');
    }

    this.balance -= amount;
    this._recordTransaction('withdrawal', amount);

    return this.balance;
  }

  // ─── โอนเงิน ─────────────────────────────────────────────────────────────

  transfer(amount, targetWallet) {
    // ตรวจสอบ targetWallet ก่อน เพื่อป้องกัน error ที่ไม่ชัดเจน
    if (!(targetWallet instanceof Wallet)) {
      throw new Error('Target must be a valid Wallet');
    }
    if (targetWallet.id === this.id) {
      throw new Error('Cannot transfer to the same wallet');
    }

    // ใช้ withdraw/deposit ที่มีอยู่แล้วเพื่อลด logic ซ้ำซ้อน
    // หาก withdraw สำเร็จแต่ deposit ล้มเหลว ยอดเงินจะ inconsistent
    // (ระบบ production จริงต้องใช้ transaction atomicity)
    this.withdraw(amount);
    targetWallet.deposit(amount);

    // ปรับประเภท transaction ล่าสุดของทั้งสอง wallet
    // เพื่อให้ประวัติแสดงว่าเป็นการโอน ไม่ใช่ deposit/withdrawal ทั่วไป
    const lastOut = this.transactions[this.transactions.length - 1];
    lastOut.type = 'transfer_out';
    lastOut.to   = targetWallet.id;

    const lastIn = targetWallet.transactions[targetWallet.transactions.length - 1];
    lastIn.type  = 'transfer_in';
    lastIn.from  = this.id;

    return {
      fromBalance: this.balance,
      toBalance:   targetWallet.balance,
    };
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  getBalance() {
    return this.balance;
  }

  // คืน shallow copy เพื่อป้องกัน caller แก้ไข array ภายในโดยตรง
  getTransactions() {
    return [...this.transactions];
  }

  // แปลงเป็น plain object สำหรับ JSON response — ไม่เปิดเผย transactions ทั้งหมด
  toJSON() {
    return {
      id:               this.id,
      owner:            this.owner,
      balance:          this.balance,
      transactionCount: this.transactions.length,
      createdAt:        this.createdAt,
    };
  }
}

module.exports = Wallet;
