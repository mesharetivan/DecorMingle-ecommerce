import express from "express";
import cors from "cors";
import paypal from "@paypal/checkout-server-sdk";
import "dotenv/config";
import { getCode } from "country-list";
import admin from "firebase-admin";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3001;

// Mock database (Replace this with your actual database logic)
const paymentsDatabase = {};

// Use cors middleware
app.use(
  cors({
    origin: "https://decor-mingle-ecommerce.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

// PayPal client setup
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Load Firebase service account JSON file
const serviceAccount = JSON.parse(
  fs.readFileSync("./decormingle-b79a5-firebase-adminsdk-ict07-9018a8fe95.json")
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

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
          currency_code: "PHP",
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
        invoice_id: orderID,
      },
    ],
    application_context: {
      return_url: `https://decor-mingle-ecommerce.vercel.app/thankyou?orderID=${encodeURIComponent(
        orderID
      )}`,
      cancel_url: "https://decor-mingle-ecommerce.vercel.app/home",
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
  const { paymentId } = req.query;

  const request = new paypal.orders.OrdersGetRequest(paymentId);

  try {
    const order = await client.execute(request);
    const orderDetails = order.result;

    const paidAmount = orderDetails.purchase_units[0].amount.value;
    const payerID = orderDetails.payer.payer_id;

    res.json({ paidAmount, payerID });
  } catch (error) {
    console.error("Error fetching PayPal payment details:", error);
    res.status(500).send("Error fetching PayPal payment details.");
  }
});

// Execute PayPal Payment
app.post("/execute-payment", async (req, res) => {
  const { orderID } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    const captureId = capture.result.purchase_units[0].payments.captures[0].id;

    const paidAmount = capture.result.purchase_units[0].amount.value;

    paymentsDatabase[captureId] = {
      paidAmount,
      // ... other details you want to store
    };

    res.json({ status: "success", captureId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to update user's email, password, displayName, and role
app.post("/update-user-credentials", async (req, res) => {
  const {
    uid,
    newEmail,
    newPassword,
    newUsername,
    newRole,
    firstName,
    lastName,
  } = req.body;

  try {
    // Check if the new email already exists
    if (newEmail) {
      const userRecord = await admin.auth().getUserByEmail(newEmail);
      if (userRecord.uid !== uid) {
        // If the email belongs to another user, throw a conflict error
        throw new Error("Email address is already in use.");
      }
    }

    // Update the user's email and password in Firebase Authentication
    if (newEmail || newPassword) {
      await admin.auth().updateUser(uid, {
        ...(newEmail && { email: newEmail }),
        ...(newPassword && { password: newPassword }),
      });
    }

    // Initialize an update object for Firestore
    const firestoreUpdate = {};

    if (newUsername) firestoreUpdate.displayName = newUsername;
    if (newRole) firestoreUpdate.role = newRole;

    if (firstName || lastName) {
      firestoreUpdate.profile = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      };
    }

    // Check if there are any fields to update
    if (Object.keys(firestoreUpdate).length === 0) {
      throw new Error("No fields to update.");
    }

    // Update user's data in Firestore
    const userRef = db.collection("users").doc(uid);
    await userRef.update(firestoreUpdate);

    res.status(200).json({ message: "User credentials updated successfully." });
  } catch (error) {
    console.error("Error updating user credentials:", error);
    if (error.message === "Email address is already in use.") {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Define other routes and endpoints here...

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
