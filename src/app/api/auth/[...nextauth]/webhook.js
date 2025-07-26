// pages/api/webhook.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  console.log('📩 Webhook received!');
  console.log(JSON.stringify(req.body, null, 2)); // log ข้อมูลที่ LINE ส่งมา

  res.status(200).send('OK');
}
