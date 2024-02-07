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

const WishList = () => {
  const wishlistItems = useSelector((state) => state.cart.wishlistItems);
  const totalWishlistQuantity = useSelector(
    (state) => state.cart.totalWishlistQuantity
  );
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const updateWishlistInFirebase = async () => {
    if (!user || !user.uid) return;
    const wishlistRef = doc(db, "wishlists", user.uid);
    try {
      await setDoc(wishlistRef, { wishlistItems });
    } catch (error) {
      console.error("Error updating wishlist in Firebase: ", error);
    }
  };

  const deleteFromWishlist = async (itemId) => {
    dispatch(cartActions.removeFromWishlist(itemId));
    await updateWishlistInFirebase();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Helmet title="WishList">
      <CommonSection title="Wish List" />
      <section>
        <Container>
          <Row>
            <Col lg="9">
              {wishlistItems.length === 0 ? (
                <h2 className="fs-4 text-center">
                  No item added to your wish list
                </h2>
              ) : (
                <table className="table bordered">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlistItems.map((item, index) => (
                      <Tr
                        item={item}
                        key={index}
                        deleteFromWishlist={deleteFromWishlist}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </Col>
            <Col lg="3">
              <div>
                <h6 className="d-flex align-items-center justify-content-between">
                  Total Wish List
                  <span className="fs-4 fw-bold">{totalWishlistQuantity}</span>
                </h6>
              </div>
              <div>
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

const Tr = ({ item, deleteFromWishlist }) => {
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
        <motion.i
          whileTap={{ scale: 1.2 }}
          onClick={() => deleteFromWishlist(item.id)}
          className="ri-delete-bin-line"
        ></motion.i>
      </td>
    </tr>
  );
};

export default WishList;
