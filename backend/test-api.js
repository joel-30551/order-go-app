const URL = 'http://localhost:3000/api/products/ca9efd4e-3cde-40ce-9026-5b97360c7f45';

async function testUpdate() {
  console.log('Sending PUT request to:', URL);
  try {
    const res = await fetch(URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prod_name: 'API Test Update ' + new Date().toLocaleTimeString(),
        prod_price: 25.99
      })
    });

    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));
  } catch (e) {
    console.error('Request failed:', e.message);
  }
}

testUpdate();
