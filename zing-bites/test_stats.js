const axios = require('axios');
const API = 'http://localhost:5000/api';

async function test() {
  try {
    const stats = await axios.get(`${API}/truck/public-stats`);
    console.log('Public Stats:', JSON.stringify(stats.data, null, 2));
  } catch (err) {
    console.error('Error fetching public stats:', err.message);
  }
}

test();
