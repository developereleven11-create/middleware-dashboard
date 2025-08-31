// 🔹 Viniculum API
const baseUrl =
  'https://pokonut.vineretail.com/RestWS/api/eretail/v1/order/shipmentDetail';
const apiOwner = 'Suraj';
const apiKey =
  '62f9cb823fc9498780ee065d3677c865e628bfab206249c2941b038';

// Viniculum expects the body as just the order number (string or number)
const viniRes = await fetch(baseUrl, {
  method: 'POST',
  headers: {
    ApiOwner: apiOwner,
    Apikey: apiKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(orderNo), // 👈 just the order number directly
});

if (!viniRes.ok) {
  throw new Error(`Viniculum error: ${viniRes.status}`);
}

const viniJson = await viniRes.json();
const viniOrder = viniJson?.orders?.[0] ?? null;
