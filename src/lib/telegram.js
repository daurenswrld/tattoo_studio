const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

export const sendTelegramMessage = async (message) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram configuration missing. Message not sent.');
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram message');
    }

    return await response.json();
  } catch (error) {
    console.error('Telegram Error:', error);
  }
};

export const sendTelegramPhoto = async (photoFile, caption) => {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.warn('Telegram configuration missing. Photo not sent.');
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  const formData = new FormData();
  formData.append('chat_id', CHAT_ID);
  formData.append('photo', photoFile);
  if (caption) {
    formData.append('caption', caption);
    formData.append('parse_mode', 'HTML');
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to send Telegram photo');
    }

    return await response.json();
  } catch (error) {
    console.error('Telegram Photo Error:', error);
  }
};
