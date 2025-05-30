import paypal from '@paypal/checkout-server-sdk';

// PayPal environment setup
const environment = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  return process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

// PayPal client
const client = () => {
  return new paypal.core.PayPalHttpClient(environment());
};

// Create PayPal order
export const createOrder = async (courseData) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: courseData.courseId,
      amount: {
        currency_code: 'USD',
        value: courseData.price.toString()
      },
      description: `Course: ${courseData.title}`
    }],
    application_context: {
      brand_name: 'Your Platform Name',
      landing_page: 'BILLING',
      user_action: 'PAY_NOW',
      return_url: 'http://localhost:3000/payment/success',
      cancel_url: 'http://localhost:3000/payment/cancel'
    }
  });

  try {
    const order = await client().execute(request);
    return order;
  } catch (error) {
    throw new Error(`PayPal order creation failed: ${error.message}`);
  }
};

// Capture PayPal order
export const captureOrder = async (orderId) => {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client().execute(request);
    return capture;
  } catch (error) {
    throw new Error(`PayPal order capture failed: ${error.message}`);
  }
};