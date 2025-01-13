import React, { useRef, useEffect, useState } from "react";

import { motion } from "framer-motion";

import { NavLink, useNavigate } from "react-router-dom";
import "./header.css";

import logo from "../../assets/images/eco-logo.png";
import userIcon from "../../assets/images/user-icon.png";

import { Container, Row } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { cartActions } from "../../redux/slice/cartSlice";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.config";
import { toast } from "react-toastify";
import useUserRole from "../../custom-hooks/useUserRole";
import { db } from "../../firebase.config";
import { doc, setDoc } from "firebase/firestore";

const nav__links = [
  {
    path: "home",
    display: "Home",
  },
  {
    path: "shop",
    display: "Shop",
  },
  {
    path: "cart",
    display: "Cart",
  },
];

const Header = () => {
  const headerRef = useRef(null);
  const menuRef = useRef(null);
  const profileActionsRef = useRef(null);

  const cartItems = useSelector((state) => state.cart.cartItems);
  const wishlistItems = useSelector((state) => state.cart.wishlistItems);

  const [showProfileActions, setShowProfileActions] = useState(false);

  const navigate = useNavigate();
  const { currentUser, role } = useUserRole();

  const dispatch = useDispatch();

  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const totalWishlistQuantity = useSelector(
    (state) => state.cart.totalWishlistQuantity
  );

  const stickyHeaderFunc = () => {
    window.addEventListener("scroll", () => {
      if (
        (document.body.scrollTop > 80 ||
          document.documentElement.scrollTop > 80) &&
        headerRef.current
      ) {
        headerRef.current.classList.add("sticky__header");
      } else if (headerRef.current) {
        headerRef.current.classList.remove("sticky__header");
      }
    });
  };

  useEffect(() => {
    stickyHeaderFunc();
    return () => window.removeEventListener("scroll", stickyHeaderFunc);
  });

  const menuToggle = () => menuRef.current.classList.toggle("active__menu");

  const navigateToCart = () => {
    navigate("/cart");
  };

  const navigateToWishList = () => {
    navigate("/wishlist");
  };

  const toggleProfileActions = () => {
    setShowProfileActions(!showProfileActions);
  };

  const closeProfileActions = () => {
    setShowProfileActions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileActionsRef.current &&
        !profileActionsRef.current.contains(event.target)
      ) {
        closeProfileActions();
      }
    };

    if (showProfileActions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileActions]);

  const updateCartAndWishlistInFirebase = async (userId) => {
    const cartRef = doc(db, "carts", userId);
    const wishlistRef = doc(db, "wishlists", userId);

    const cartData = {
      cartItems,
      totalAmount: cartItems.reduce((acc, item) => acc + item.totalPrice, 0),
      totalQuantity: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    };

    const wishlistData = {
      wishlistItems,
      totalWishlistQuantity: wishlistItems.length,
    };

    try {
      await setDoc(cartRef, cartData);
      await setDoc(wishlistRef, wishlistData);
    } catch (error) {
      console.error("Error updating cart or wishlist data: ", error);
      // Optionally, inform the user about the error.
      toast.error(
        "There was a problem updating your cart or wishlist. Please try again."
      );
    }
  };

  const logout = () => {
    if (currentUser) {
      updateCartAndWishlistInFirebase(currentUser.uid);
    }
    signOut(auth)
      .then(() => {
        dispatch(cartActions.resetCart());
        dispatch(cartActions.resetWishlist());

        setShowProfileActions(false);
        toast.success("Successfully Logout");
        navigate("/login");
      })
      .catch((err) => {
        toast.error(err.message);
      });
  };

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <Row>
          <div className="nav__wrapper">
            <Link to="/home">
              <div className="logo">
                <motion.img whileTap={{ scale: 1.2 }} src={logo} alt="logo" />
                <div>
                  <h1>Printamom</h1>
                </div>
              </div>
            </Link>

            <div className="navigation" ref={menuRef} onClick={menuToggle}>
              <ul className="menu">
                {nav__links.map((item, index) => (
                  <li className="nav__item" key={index}>
                    <NavLink
                      to={item.path}
                      className={(navClass) =>
                        navClass.isActive ? "nav__active" : ""
                      }
                    >
                      {item.display}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="nav__icons">
              <span className="fave__icon" onClick={navigateToWishList}>
                <i className="ri-heart-line"></i>
                <span className="badge">{totalWishlistQuantity}</span>
              </span>
              <span className="cart__icon" onClick={navigateToCart}>
                <i className="ri-shopping-bag-line"></i>
                <span className="badge">{totalQuantity}</span>
              </span>
              <div className="profile">
                <motion.img
                  whileTap={{ scale: 1.2 }}
                  src={currentUser ? currentUser.photoURL : userIcon}
                  alt=""
                  onClick={toggleProfileActions}
                />

                <div
                  ref={profileActionsRef}
                  className={`profile__actions ${
                    showProfileActions ? "show__profileActions" : ""
                  }`}
                  style={{ display: showProfileActions ? "block" : "none" }}
                >
                  {currentUser ? (
                    <span className="d-flex align-items-center justify-content-center flex-column gap-2">
                      <Link
                        to={
                          role === "admin" ? "/dashboard-admin" : "/dashboard"
                        }
                        onClick={closeProfileActions}
                      >
                        <button className="Btn">
                          <div className="sign">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 5C8.13401 5 5 8.13401 5 12C5 13.8525 5.71957 15.5368 6.89445 16.7889L7.05025 16.9497L8.46447 15.5355C7.55964 14.6307 7 13.3807 7 12C7 9.23858 9.23858 7 12 7C12.448 7 12.8822 7.05892 13.2954 7.16944L14.8579 5.60806C13.9852 5.21731 13.018 5 12 5ZM18.3924 9.14312L16.8306 10.7046C16.9411 11.1178 17 11.552 17 12C17 13.3807 16.4404 14.6307 15.5355 15.5355L16.9497 16.9497C18.2165 15.683 19 13.933 19 12C19 10.9824 18.7829 10.0155 18.3924 9.14312ZM16.2426 6.34315L12.517 10.0675C12.3521 10.0235 12.1788 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14C13.1046 14 14 13.1046 14 12C14 11.8212 13.9765 11.6479 13.9325 11.483L17.6569 7.75736L16.2426 6.34315Z"></path>
                            </svg>
                          </div>
                          <div className="text">Dashboard</div>
                        </button>
                      </Link>

                      <button
                        className="Btn"
                        style={{ backgroundColor: "rgb(255, 65, 65)" }}
                        onClick={logout}
                      >
                        <div className="sign">
                          <svg viewBox="0 0 512 512">
                            <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
                          </svg>
                        </div>
                        <div className="text">Logout</div>
                      </button>
                    </span>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center flex-column gap-2">
                      <Link to="/signup" onClick={closeProfileActions}>
                        <button className="Btn">
                          <div className="sign">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12.5 7H8V17H10V14H12.217L14.397 17H16.869L14.3191 13.4907C15.327 12.8763 16 11.7668 16 10.5C16 8.63144 14.5357 7.10487 12.692 7.00518L12.5 7ZM12.5 9C13.2797 9 13.9204 9.59489 13.9931 10.3555L14 10.5L13.9931 10.6445C13.925 11.3576 13.3576 11.925 12.6445 11.9931L12.5 12H10V9H12.5Z"></path>
                            </svg>
                          </div>
                          <div className="text">Signup</div>
                        </button>
                      </Link>
                      <Link to="/login" onClick={closeProfileActions}>
                        <button className="Btn">
                          <div className="sign">
                            <svg viewBox="0 0 512 512">
                              <path d="M217.9 105.9L340.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L217.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1L32 320c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM352 416l64 0c17.7 0 32-14.3 32-32l0-256c0-17.7-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c53 0 96 43 96 96l0 256c0 53-43 96-96 96l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32z"></path>
                            </svg>
                          </div>
                          <div className="text">Login</div>
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="mobile__menu">
                <span onClick={menuToggle}>
                  <i className="ri-menu-line"></i>
                </span>
              </div>
            </div>
          </div>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
