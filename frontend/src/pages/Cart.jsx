import React, { useEffect } from "react";
import "../styles/cart.css";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";

import { motion } from "framer-motion";
import { cartActions } from "../redux/slice/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import useAuth from "../custom-hooks/useAuth";

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const dispatch = useDispatch();

  const { currentUser } = useAuth();

  const updateCartInFirebase = async () => {
    // Ensure user object and user.uid are defined
    if (!currentUser || !currentUser.uid) {
      console.error("User is not defined, cannot update cart in Firebase.");
      return;
    }

    const cartRef = doc(db, "carts", currentUser.uid);
    try {
      await setDoc(cartRef, { cartItems });
    } catch (error) {
      console.error("Error updating cart in Firebase: ", error);
    }
  };

  const deleteProduct = async (itemId) => {
    dispatch(cartActions.deleteItem(itemId));
    try {
      await updateCartInFirebase();
    } catch (error) {
      console.error("Error deleting product: ", error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const incrementQuantity = async (itemId) => {
    // Dispatch an action to increment the item quantity
    dispatch(cartActions.incrementItemQuantity(itemId));

    // Update cart in Firebase
    try {
      await updateCartInFirebase();
    } catch (error) {
      console.error("Error updating cart quantity in Firebase: ", error);
    }
  };

  const decrementQuantity = async (itemId) => {
    // Find the item to check its quantity before decrementing
    const item = cartItems.find((item) => item.id === itemId);
    if (item && item.quantity > 1) {
      // Only dispatch decrement action if quantity is greater than 1
      dispatch(cartActions.decrementItemQuantity(itemId));

      // Update cart in Firebase
      try {
        await updateCartInFirebase();
      } catch (error) {
        console.error("Error updating cart quantity in Firebase: ", error);
      }
    } else {
      // Show toast notification
      toast.error("Item quantity cannot be less than 1");
    }
  };

  return (
    <Helmet title="Cart">
      <CommonSection title="Shopping Cart" />
      <section>
        <Container>
          <Row>
            <Col lg="9">
              {cartItems.length === 0 ? (
                <h2 className="fs-4 text-center">No item added to the cart</h2>
              ) : (
                <table className="table bordered">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Delete</th>
                    </tr>
                  </thead>

                  <tbody>
                    {cartItems.map((item, index) => (
                      <Tr
                        item={item}
                        key={index}
                        deleteProduct={deleteProduct}
                        incrementQuantity={incrementQuantity}
                        decrementQuantity={decrementQuantity}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </Col>
            <Col lg="3">
              <div>
                <h6 className="d-flex align-items-center justify-content-between">
                  Subtotal
                  <span className="fs-4 fw-bold">₱{totalAmount}</span>
                </h6>
              </div>
              <p className="fs-6 mt-2">
                taxes and shipping will calculate in checkout
              </p>
              <div>
                {cartItems.length > 0 && (
                  <button className="buy__btn w-100">
                    <Link to="/checkout">Checkout</Link>
                  </button>
                )}
                <button className="buy__btn w-100 mt-3">
                  <Link to="/shop">Continue Shopping</Link>
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

const Tr = ({ item, deleteProduct, incrementQuantity, decrementQuantity }) => {
  return (
    <tr>
      <td>
        <img src={item.imgUrl} alt="" />
      </td>
      <td>
        <Link to={`/shop/${item.id}`}>{item.productName}</Link>
      </td>
      <td>₱{item.price}</td>
      <td>
        <div className="d-flex align-items-center gap-3">
          <motion.button
            whileTap={{ scale: 1.3 }}
            style={{
              borderRadius: "100%",
              border: "none",
              backgroundColor: "#fff",
            }}
            onClick={() => decrementQuantity(item.id)}
          >
            <i className="ri-subtract-fill"></i>
          </motion.button>
          {item.quantity}
          <motion.button
            whileTap={{ scale: 1.2 }}
            style={{
              borderRadius: "100%",
              border: "none",
              backgroundColor: "#fff",
            }}
            onClick={() => incrementQuantity(item.id)}
          >
            <i className="ri-add-circle-fill"></i>
          </motion.button>
        </div>
      </td>
      <td>
        <motion.i
          whileTap={{ scale: 1.2 }}
          onClick={() => deleteProduct(item.id)}
          className="ri-delete-bin-line"
        ></motion.i>
      </td>
    </tr>
  );
};

export default Cart;
