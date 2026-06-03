const request = require('supertest');
const app = require('../src/server');
const { wallets } = require('../src/walletController');
const Wallet = require('../src/wallet');

describe('API Vulnerability & Code Quality Tests', () => {
  beforeEach(() => {
    wallets.clear();
  });

  test('POST /wallets/query - should filter wallets based on structured filter', async () => {
    const w1 = new Wallet('Alice');
    w1.deposit(100);
    const w2 = new Wallet('Bob');
    w2.deposit(200);

    wallets.set(w1.id, w1);
    wallets.set(w2.id, w2);

    const res = await request(app)
      .post('/wallets/query')
      .send({ minBalance: 150 });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].owner).toBe('Bob');
  });

  test('POST /wallets/:id/adjust-balance - should adjust balance directly bypassing encapsulation', async () => {
    const w = new Wallet('Charlie');
    wallets.set(w.id, w);

    const res = await request(app)
      .post(`/wallets/${w.id}/adjust-balance`)
      .send({ amount: 500 });

    expect(res.statusCode).toBe(200);
    expect(res.body.balance).toBe(500);
    expect(w.balance).toBe(500);
  });
});
