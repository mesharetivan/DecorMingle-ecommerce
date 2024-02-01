import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";

import { db } from "../firebase.config";
import { collection, addDoc } from "firebase/firestore";

const ThankYou = () => {
  const location = useLocation();

  const [paidAmount, setPaidAmount] = useState(null);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      const query = new URLSearchParams(location.search);
      const token = query.get("token");

      try {
        const response = await fetch(
          `http://localhost:3001/get-payment-details?paymentId=${token}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Oops, we haven't got JSON!");
        }

        const paymentDetails = await response.json();

        if (paymentDetails.paidAmount) {
          setPaidAmount(paymentDetails.paidAmount); // Update the state with the fetched amount
          savePaymentInfo(
            token,
            paymentDetails.payerID,
            paymentDetails.paidAmount
          ); // Save payment info to Firestore
        }
      } catch (error) {
        console.error("Failed to fetch payment details:", error);
      }
    };

    fetchPaymentDetails();
  }, [location.search]); // Add location.search to the dependency array

  const savePaymentInfo = async (token, payerID, paidAmount) => {
    try {
      const paymentsCollectionRef = collection(db, "payments");

      const docRef = await addDoc(paymentsCollectionRef, {
        token: token,
        payerID: payerID,
        paidAmount: paidAmount,
        createdAt: new Date(),
      });

      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <Helmet title="Payment Success">
      <CommonSection
        title={`Thank you for your payment${
          paidAmount ? ` of $${paidAmount}` : ""
        }!`}
      />
      {/* Optionally, you can include more details or actions for the user here. */}
    </Helmet>
  );
};

export default ThankYou;
