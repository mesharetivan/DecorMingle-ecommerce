import React, { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { db } from "../firebase.config";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { cartActions } from "../redux/slice/cartSlice"; // Ensure the import path is correct
import useAuth from "../custom-hooks/useAuth"; // Ensure this import path is correct

const ThankYou = () => {
  const location = useLocation();
  const [paidAmount, setPaidAmount] = useState(null);
  const { currentUser } = useAuth(); // Use your auth hook to get the current user
  const dispatch = useDispatch();

  const clearUserCart = useCallback(async () => {
    if (!currentUser || !currentUser.uid) return;

    const cartRef = doc(db, "carts", currentUser.uid);
    try {
      await setDoc(cartRef, { cartItems: [] }); // Set the cartItems to an empty array
      console.log(`Cart cleared for user ID: ${currentUser.uid}`);
      dispatch(cartActions.resetCart()); // Reset the cart state in Redux store
    } catch (error) {
      console.error("Error clearing cart: ", error);
    }
  }, [currentUser, dispatch]);

  useEffect(() => {
    const fetchPaymentDetails = async (token) => {
      try {
        const response = await fetch(
          `https://bpckgcpnpq.ap-southeast-1.awsapprunner.com/get-payment-details?paymentId=${token}`
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
          await savePaymentInfo(
            token,
            paymentDetails.payerID,
            paymentDetails.paidAmount
          ); // Save payment info to Firestore
          await clearUserCart(); // Clear the cart after successful payment
        }
      } catch (error) {
        console.error("Failed to fetch payment details:", error);
      }
    };

    const query = new URLSearchParams(location.search);
    const token = query.get("token");
    const bankDetailsAmount = query.get("amount");

    if (token) {
      fetchPaymentDetails(token);
    } else if (bankDetailsAmount) {
      // Bank details payment; set the amount directly and clear the cart
      setPaidAmount(bankDetailsAmount);
      clearUserCart();
    }
  }, [location.search, clearUserCart]);

  const savePaymentInfo = async (token, payerID, paidAmount) => {
    try {
      const paymentsCollectionRef = collection(db, "payments");
      const docRef = await addDoc(paymentsCollectionRef, {
        token,
        payerID,
        paidAmount,
        createdAt: new Date(),
      });

      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <Helmet title="Payment Success">
      <CommonSection
        title={`Thank you for your payment${
          paidAmount ? ` of ₱${paidAmount}` : ""
        }!`}
      />
      {/* Optionally, you can include more details or actions for the user here. */}
    </Helmet>
  );
};

export default ThankYou;
