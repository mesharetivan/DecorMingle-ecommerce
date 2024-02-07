// VerifyEmail.jsx

import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyActionCode } from "firebase/auth";
import { auth } from "../firebase.config"; // adjust the path as necessary

const VerifyEmail = () => {
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const mode = queryParams.get("mode");
  const actionCode = queryParams.get("oobCode");

  useEffect(() => {
    if (mode === "verifyEmail" && actionCode) {
      // Try to apply the email verification code
      applyActionCode(auth, actionCode)
        .then((resp) => {
          // Email verification successful
          // TODO: Update your app's UI and state as necessary
          console.log("Email verification successful");
        })
        .catch((error) => {
          // Handle error
          console.error("Error in email verification", error);
        });
    }
  }, [mode, actionCode]);

  // Render something based on success or failure
  return (
    <div>
      {mode === "verifyEmail" ? (
        <p>Verifying your email...</p>
      ) : (
        <p>Invalid link or the link has expired.</p>
      )}
    </div>
  );
};

export default VerifyEmail;
