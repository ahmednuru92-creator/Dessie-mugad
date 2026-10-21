// ============================================================================
// 🇪🇹 ደሴ ማርት (Dessie Mart / ሙጋድ ገበያ) — Backend Server & Webhook (server.js)
// ============================================================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// የቴሌግራም ቦት ማዋቀሪያ
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const TELEGRAM_CHANNEL = process.env.TELEGRAM_CHANNEL || '@DessieMarket';

// 1. የመነሻ ቼክ (Health Check Route)
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🇪🇹 ደሴ ማርት (ሙጋድ ገበያ) የባክ-ኤንድ ሰርቨር እና ዌብሁክ በስራ ላይ ናቸው!',
    version: '1.0.0'
  });
});

// 2. ማስታወቂያ የመመዝገቢያ እና የቴሌግራም ብሮድካስት ኤፒአይ
app.post('/api/listings', async (req, res) => {
  try {
    const { title, price, location, category, phone, description } = req.body;

    if (!title || !price) {
      return res.status(400).json({ success: false, message: 'እባክዎ ርዕስ እና ዋጋ በትክክል ይሙሉ!' });
    }

    const telegramMessage = `
🚨 **አዲስ ማስታወቂያ - ደሴ ማርት (ሙጋድ ገበያ)** 🚨

📌 **ርዕስ:** ${title}
📂 **ምድብ:** ${category || 'ሽያጭ'}
💰 **ዋጋ:** ${price} ብር
📍 **አድራሻ:** ${location || 'ደሴ፣ ኢትዮጵያ'}
📞 **ስልክ:** ${phone || '0920044626'}
📝 **መግለጫ:** ${description || 'ምንም ዝርዝር የለም'}

✨ *በደሴ ማርት ሞባይል አፕ እና ዌብሳይት የተለጠፈ*
    `.trim();

    // ወደ ቴሌግራም ቻናል መላክ
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_BOT_TOKEN !== 'YOUR_BOT_TOKEN_HERE') {
      await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: TELEGRAM_CHANNEL,
        text: telegramMessage,
        parse_mode: 'Markdown'
      });
    }

    res.status(200).json({
      success: true,
      message: 'ማስታወቂያዎ ተመዝግቦ ወደ ቴሌግራም ቻናል ተልኳል!',
      data: req.body
    });

  } catch (error) {
    console.error('Telegram Broadcast Error:', error.message);
    res.status(500).json({ success: false, message: 'ሰርቨር ላይ ስህተት አጋጥሟል', error: error.message });
  }
});

// 3. የቴሌብር እና ሲቢኢ ክፍያ ዌብሁክ
app.post('/api/webhook/payment', async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('💳 የተቀበለው የክፍያ መረጃ:', paymentData);

    res.status(200).json({
      status: 'RECEIVED',
      message: 'የክፍያ ዌብሁክ በጥሩ ሁኔታ ተቀብሏል!'
    });

  } catch (error) {
    console.error('Payment Webhook Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ★ ለ Vercel ሰርቨርለስ አሰራር አፕሊኬሽኑን ማስረከብ (Export)
module.exports = app;

// በሎካል ኮምፒዩተር ሲሰራ ብቻ በፖርት 3000 ማሰማራት
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 ደሴ ማርት ሰርቨር በፖርት ${PORT} ላይ በመስራት ላይ ይገኛል...`);
  });
}
