const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // 務必確保這行存在，否則收不到前端傳來的資料

// MySQL 連線設定
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',      // 如果你有設密碼，請填寫在 password
  password: '2473wxyz',      
  database: 'ting'
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL 連線失敗:', err.message);
  } else {
    console.log('✅ 成功連線到 MySQL 資料庫');
  }
});

// GET: 抓取所有預約日期
app.get('/api/bookings', (req, res) => {
  const sql = 'SELECT booking_date FROM appointments';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    // 轉換格式：將資料庫日期轉為 YYYY-MM-DD 字串
    const formattedDates = results.map(row => {
      const d = new Date(row.booking_date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    res.json(formattedDates);
  });
});

// POST: 存入新預約
app.post('/api/bookings', (req, res) => {
  const { date } = req.body;
  console.log("📩 收到預約請求，日期為:", date);

  if (!date) {
    return res.status(400).json({ error: "沒有收到日期資料" });
  }

  const sql = 'INSERT INTO appointments (booking_date) VALUES (?)';
  db.query(sql, [date], (err, result) => {
    if (err) {
      console.error("❌ SQL 寫入失敗:", err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log("🚀 資料成功寫入資料庫！ID:", result.insertId);
    res.json({ message: 'Success', id: result.insertId });
  });
});

app.listen(5000, () => {
  console.log('🌐 後端伺服器運行在 http://localhost:5000');
});
