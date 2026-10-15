const db = require('./src/config/db');
const { updateProduct } = require('./src/controllers/productController');

// Mock request and response
const req = {
  params: { id: 'ca9efd4e-3cde-40ce-9026-5b97360c7f45' },
  body: { prod_name: 'Updated Test Product ' + new Date().getTime() }
};

const res = {
  status: function(s) {
    this.statusCode = s;
    return this;
  },
  json: function(j) {
    console.log('Status Code:', this.statusCode);
    console.log('Response JSON:', JSON.stringify(j, null, 2));
    process.exit(this.statusCode === 200 ? 0 : 1);
  }
};

console.log('Testing updateProduct...');
updateProduct(req, res).catch(e => {
  console.error('Test Failed with Error:', e);
  process.exit(1);
});
