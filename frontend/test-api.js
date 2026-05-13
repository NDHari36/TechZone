const token = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjpbIltPV05FUl0iXSwidXNlcmlkIjoyLCJzdWIiOiJiaW5oIiwiaWF0IjoxNzY1MzEzOTY2LCJleHAiOjE3NjU0MjE5NjZ9.CEL6a0xETiXs53q6n-_rpAyanaeGe8vYmOTcIsQsaDM';

fetch('http://localhost:8081/api/products', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(async res => {
  const text = await res.text();
  console.log('Status:', res.status, res.statusText);
  console.log('Headers:', Object.fromEntries(res.headers.entries()));
  console.log('Body:', text || '(empty)');
  if (text) {
    try {
      console.log('JSON:', JSON.stringify(JSON.parse(text), null, 2));
    } catch (e) {
      console.log('(not JSON)');
    }
  }
})
.catch(err => console.error('Fetch error:', err.message));
