const API_URL = 'https://script.google.com/macros/s/AKfycbwp4QRsxLj51iMbZkAlcP4OqH-3EVCcbFIqkA0sFUzAq8l9HhKnsJDADUv-WnbtEvM/exec';

async function api(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action,
      ...payload
    })
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}
