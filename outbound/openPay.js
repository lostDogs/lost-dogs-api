// dependencies
const fetch = require('node-fetch');

const headers = {
  Authentication: `Basic ${new Buffer(`${process.env.OPENPAY_API_KEY}:`).toString('base64')}`,
  'Content-type': 'application/json',
};

const getAddressFromUser = ({ street, city, ext_number: extNumber, int_number: intNumber, zip_code, neighborhood, country }) => ({
  line1: street,
  line2: `#${extNumber} - #${intNumber}`,
  line: neighborhood,
  state: city,
  postal_code: zip_code,
  city,
  country_code: country,
});

const getBaseRequest = () => (
  `${process.env.OPENPAY_URL}/${process.env.OPENPAY_USER_ID}`
);

const validateAndFormatResponse = response => (
  response.json()

  .then(jsonResponse => (
    response.ok ? jsonResponse : Promise.reject({
      statusCode: jsonResponse.http_code,
      error: jsonResponse.description,
    })
  ), err => (
    Promise.reject({
      statusCode: 500,
      error: err.message,
    })
  ))
);

module.exports = {
  createCustomer: ({ _id: external_id, name, lastName: last_name, email, phone_number: phone, address }) => (
    fetch(`${getBaseRequest()}/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        external_id,
        name,
        last_name,
        email,
        phone,
        address: getAddressFromUser(address),
      }),
    }).then(validateAndFormatResponse)
  ),

  getCustomer: ({ customerId }) => (
    fetch(`${getBaseRequest()}/customers/${customerId}`, {
      method: 'GET',
      headers,
    }).then(validateAndFormatResponse)
  ),

  createCharge: ({ customerId, method = 'card', source_id: sourceId, amount, ccv2 = null, currency = 'MXN', description, order_id: orderId, device_session_id: deviceSessionId, capture = false }) => (
    fetch(`${getBaseRequest()}/customers/${customerId}/charges`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        method,
        source_id: sourceId,
        device_session_id: deviceSessionId,
        amount,
        ccv2,
        currency,
        description,
        order_id: orderId,
        capture,
      }),
    }).then(validateAndFormatResponse)
  ),

  confirmCharge: ({ amount, chargeId, customerId }) => (
    fetch(`${getBaseRequest()}/customers/${customerId}/charges/${chargeId}/capture`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount,
      }),
    }).then(validateAndFormatResponse)
  ),

  getCads: ({ customerId }) => (
    fetch(`${getBaseRequest()}/customers/${customerId}/cards`, {
      method: 'GET',
      headers,
    }).then(validateAndFormatResponse)
  ),

  saveCard: ({ source_id: sourceId, device_session_id: sessionId, customerId }) => (
    fetch(`${getBaseRequest()}/customers/${customerId}/cards`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        token_id: sourceId,
        device_session_id: sessionId,
      }),
    }).then(validateAndFormatResponse)
  ),
};
