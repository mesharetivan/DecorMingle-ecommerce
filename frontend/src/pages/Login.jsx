import React, { useState, useEffect } from "react";
import "../styles/login.css";

import Helmet from "../components/Helmet/Helmet";
import { Container, Row, Col, Form, FormGroup } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "../firebase.config";
import { db } from "../firebase.config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { cartActions } from "../redux/slice/cartSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

import LoaderLogin from "../components/Loader/LoaderLogin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const fetchCartAndWishlist = async (userId) => {
    const cartRef = doc(db, "carts", userId);
    const wishlistRef = doc(db, "wishlists", userId);

    try {
      let cartSnap = await getDoc(cartRef);
      if (!cartSnap.exists()) {
        await setDoc(cartRef, { cartItems: [] });
        cartSnap = await getDoc(cartRef);
      }
      dispatch(
        cartActions.setCartItems({ cartItems: cartSnap.data().cartItems })
      );

      let wishlistSnap = await getDoc(wishlistRef);

      if (!wishlistSnap.exists()) {
        await setDoc(wishlistRef, { wishlistItems: [] });
        wishlistSnap = await getDoc(wishlistRef);
      }
      dispatch(
        cartActions.setWishlistItems({
          wishlistItems: wishlistSnap.data().wishlistItems,
        })
      );
    } catch (error) {
      console.error("Error fetching or creating cart/wishlist data: ", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      fetchCartAndWishlist(user.uid);
      setTimeout(() => {
        setLoading(false);
        toast.success("Login successful");
        navigate("/home");
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setLoading(false);
        toast.error("Failed to login");
      }, 1000);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email to reset password");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      toast.info(
        "If your email is registered, you will receive a password reset link. Please check your inbox."
      );
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        toast.error("Email not found in our system.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else {
        toast.error(
          "An error occurred while trying to send a password reset email."
        );
      }
    }
  };

  return (
    <Helmet title="Login">
      <section>
        <Container>
          <Row>
            <Col lg="6" className="m-auto text-center">
              <h3 className="fw-bold mb-4">Login</h3>

              <Form className="auth__form" onSubmit={handleLogin}>
                <FormGroup className="form__group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormGroup>
                <button
                  type="submit"
                  className="buy__auth auth__btn"
                  disabled={loading}
                >
                  {loading ? <LoaderLogin /> : "Login"}
                </button>
                <div className="d-flex align-items-center justify-content-center">
                  <p
                    className="auth__btn w-50 d-flex align-items-center justify-content-center"
                    onClick={handleResetPassword}
                  >
                    Forgot password?
                  </p>
                </div>

                <p>
                  Don't have an account?{" "}
                  <Link to="/signup">Create an account</Link>
                </p>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Login;
