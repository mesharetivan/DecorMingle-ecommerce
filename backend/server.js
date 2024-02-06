import express from "express";
import cors from "cors";
import paypal from "@paypal/checkout-server-sdk";
import "dotenv/config";
import { getCode } from "country-list";

const app = express();
const port = 3001;

// Mock database (You should replace this with your actual database logic)
const paymentsDatabase = {};

const corsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

// PayPal client setup
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, World with ES6!");
});

// Fetch the payment details from your database
const fetchPaymentDetails = async (paymentId) => {
  return paymentsDatabase[paymentId] || null;
};

// Create PayPal Payment
app.post("/create-payment", async (req, res) => {
  const { amount, orderInfo, orderID } = req.body;

  const formattedAmount = Number.parseFloat(amount).toFixed(2);

  if (!formattedAmount || isNaN(formattedAmount) || formattedAmount <= 0) {
    return res.status(400).json({
      error: "Invalid or missing amount. Amount must be greater than zero.",
    });
  }

  const countryCode = orderInfo.country ? getCode(orderInfo.country) : null;
  if (!countryCode) {
    return res.status(400).json({
      error: "Invalid or missing country name.",
    });
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: formattedAmount,
        },
        shipping: {
          name: {
            full_name: orderInfo.name,
          },
          address: {
            address_line_1: orderInfo.address,
            admin_area_2: orderInfo.city,
            postal_code: orderInfo.postalCode,
            country_code: countryCode,
          },
        },
        invoice_id: orderID, // PayPal recommends setting this to ensure idempotency
      },
    ],
    application_context: {
      return_url: `http://localhost:3000/thankyou?orderID=${encodeURIComponent(
        orderID
      )}`,
      cancel_url: "http://localhost:3000/home",
    },
  });

  try {
    const order = await client.execute(request);
    const approvalUrl = order.result.links.find(
      (link) => link.rel === "approve"
    ).href;
    res.json({ approvalUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch PayPal Payment Details
app.get("/get-payment-details", async (req, res) => {
  const { paymentId } = req.query; // PayPal returns the order ID in the paymentId query parameter

  const request = new paypal.orders.OrdersGetRequest(paymentId);

  try {
    const order = await client.execute(request);
    const orderDetails = order.result;

    // Extract relevant details you want to send back to your frontend
    const paidAmount = orderDetails.purchase_units[0].amount.value;
    const payerID = orderDetails.payer.payer_id;

    res.json({ paidAmount, payerID });
  } catch (error) {
    console.error("Error fetching PayPal payment details:", error);
    res
      .status(500)
      .send("Something went wrong with fetching the PayPal payment details.");
  }
});

app.post("/execute-payment", async (req, res) => {
  const { orderID } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    const captureId = capture.result.purchase_units[0].payments.captures[0].id;

    // Assuming you have the amount and other details in the capture result
    const paidAmount = capture.result.purchase_units[0].amount.value;

    // Store the payment details in the mock database
    paymentsDatabase[captureId] = {
      paidAmount: paidAmount,
      // ... other details you want to store
    };

    res.json({ status: "success", captureId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
