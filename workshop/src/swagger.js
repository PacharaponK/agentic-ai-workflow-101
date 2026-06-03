// swagger.js — ตั้งค่า OpenAPI spec สำหรับ Digital Wallet API
// swagger-jsdoc จะ scan @swagger JSDoc ใน walletController.js แล้ว generate spec ให้อัตโนมัติ

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Digital Wallet API',
      version: '1.0.0',
      description: 'REST API สำหรับระบบกระเป๋าเงินดิจิทัล — สร้าง ฝาก ถอน และโอนเงินระหว่าง wallet',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Local development' },
    ],
    // ─── Reusable Schemas ──────────────────────────────────────────────────────
    components: {
      schemas: {
        // ข้อมูล wallet ที่คืนจาก API (ไม่รวม transaction history)
        Wallet: {
          type: 'object',
          properties: {
            id:               { type: 'string',  format: 'uuid',      example: 'a1b2c3d4-...' },
            owner:            { type: 'string',                        example: 'Alice' },
            balance:          { type: 'number',                        example: 5000 },
            transactionCount: { type: 'integer',                       example: 3 },
            createdAt:        { type: 'string',  format: 'date-time', example: '2026-01-01T00:00:00.000Z' },
          },
        },
        // รายการธุรกรรมแต่ละรายการ
        Transaction: {
          type: 'object',
          properties: {
            type:      { type: 'string', enum: ['deposit', 'withdrawal', 'transfer_in', 'transfer_out'] },
            amount:    { type: 'number',  example: 500 },
            balance:   { type: 'number',  example: 4500,                description: 'ยอดเงินหลัง transaction' },
            timestamp: { type: 'string',  format: 'date-time' },
            to:        { type: 'string',  format: 'uuid',               description: 'wallet id ปลายทาง (transfer_out เท่านั้น)' },
            from:      { type: 'string',  format: 'uuid',               description: 'wallet id ต้นทาง (transfer_in เท่านั้น)' },
          },
        },
        // Error response
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Insufficient balance' },
          },
        },
      },
    },
  },
  // ไฟล์ที่ให้ swagger-jsdoc scan หา @swagger JSDoc comment
  apis: ['./src/walletController.js'],
};

module.exports = swaggerJsdoc(options);
