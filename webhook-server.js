// webhook-server.js
const express = require('express');
const app = express();
const port = 3001;

// CORS middleware สำหรับ development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

app.use(express.json());

app.post('/webhook', (req, res) => {
  console.log('📩 Webhook received!');
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(req.body, null, 2));
  
  // ตอบกลับ LINE
  res.status(200).send('OK');
  
  // จัดการข้อความ
  const events = req.body.events || [];
  
  events.forEach(async (event) => {
    if (event.type === 'message' && event.message.type === 'text') {
      await handleMessage(event);
    }
  });
});

async function handleMessage(event) {
  const accessToken = 'wE1+/bnCirraiwTKbLA5UvveJcCYLfulnlLy4FEU1wdk+8a5uNlc7fzYqK/mWayfFyo9EdmyiLvXLErHn+AWtS4zHib7InjUSx96viPy5FZ49S2uKktIGxZEiuQ1sx5xxLX2Wj9UWuhkbQg94XqGigdB04t89/1O/w1cDnyilFU=';
  
  try {
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        replyToken: event.replyToken,
        messages: [{
          type: 'text',
          text: `ได้รับข้อความ: ${event.message.text} 🤖`
        }]
      })
    });

    if (response.ok) {
      console.log('✅ Reply sent successfully');
    } else {
      console.log('❌ Error:', await response.text());
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

app.get('/', (req, res) => {
  res.send('LINE Bot Webhook Server Running! 🚀');
});

app.listen(port, () => {
  console.log(`🚀 Webhook server running at http://localhost:${port}`);
  console.log(`📝 Webhook URL: http://localhost:${port}/webhook`);
});

module.exports = app;