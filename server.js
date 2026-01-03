const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // 引入 CORS 模組
const app = express();

// 1. 開放跨網域存取 (解決你的 NetworkError)
app.use(cors());
app.use(express.json());

// 2. 設定資料庫連線 (自動讀取 Railway 的環境變數)
const db = mysql.createConnection({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'booking_system',
  port: process.env.MYSQLPORT || 3306
});

db.connect(err => {
  if (err) {
    console.error('資料庫連線失敗: ' + err.stack);
    return;
  }
  console.log('已成功連線至雲端資料庫');
});

// 3. API 路由
// 取得所有預約日期
app.get('/api/bookings', (req, res) => {
  db.query('SELECT booking_date FROM appointments', (err, results) => {
    if (err) return res.status(500).send(err);
    // 將日期格式化為 YYYY-MM-DD 傳給前端
    const dates = results.map(row => row.booking_date.toISOString().split('T')[0]);
    res.json(dates);
  });
});

// 新增預約
app.post('/api/bookings', (req, res) => {
  const { date } = req.body;
  db.query('INSERT INTO appointments (booking_date) VALUES (?)', [date], (err, result) => {
    if (err) return res.status(500).json({ error: '該日期已被預約或發生錯誤' });
    res.json({ message: '預約成功', id: result.insertId });
  });
});

// 4. 啟動伺服器 (使用 Railway 指定的 PORT)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`後端伺服器正在運行，埠號：${PORT}`);
});
