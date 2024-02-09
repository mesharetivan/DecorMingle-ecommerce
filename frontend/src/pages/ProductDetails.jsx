import React, { useState, useEffect } from "react";
import "../styles/product-details.css";

import { Container, Row, Col } from "reactstrap";
import { useParams } from "react-router-dom";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { motion } from "framer-motion";
import ProductsList from "../components/UI/ProductsList";
import { useDispatch } from "react-redux";
import { cartActions } from "../redux/slice/cartSlice";
import { toast } from "react-toastify";
import { db } from "../firebase.config";
import { doc, getDoc } from "firebase/firestore";
import useGetData from "../custom-hooks/useGetData";
import useUserRole from "../custom-hooks/useUserRole";
import { updateDoc, arrayUnion } from "firebase/firestore";

const ProductDetails = () => {
  const [product, setProduct] = useState({});
  const [tab, setTab] = useState("desc");
  const dispatch = useDispatch();
  const [rating, setRating] = useState(null);
  const { id } = useParams();
  const { data: products } = useGetData("products");
  const docRef = doc(db, "products", id);
  const [reviewText, setReviewText] = useState("");

  const { currentUser, firstName, lastName } = useUserRole();

  useEffect(() => {
    const getProduct = async () => {
      try {
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = docSnap.data();
          let avgRating = 0;

          // Calculate the average rating if reviews are available
          if (productData.reviews && productData.reviews.length > 0) {
            const totalRating = productData.reviews.reduce(
              (acc, review) => acc + review.rating,
              0
            );
            avgRating = totalRating / productData.reviews.length;

            // Round to one decimal place
            avgRating = parseFloat(avgRating.toFixed(1));
          }

          setProduct({
            ...productData,
            avgRating, // Set the calculated avgRating rounded to one decimal
            reviews: productData.reviews || [],
          });
        } else {
          console.log("No product found with id:", id);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
    };

    getProduct();
  }, [id, docRef]);

  const {
    imgUrl,
    productName,
    price,
    avgRating,
    shortDesc,
    reviews = [],
    description,
    category,
  } = product;

  const relatedProducts = products.filter((item) => item.category === category);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("You must be logged in to submit a review.");
      return;
    }
    if (rating === null) {
      toast.error("Please select a rating before submitting your review.");
      return;
    }
    const reviewUserMsg = reviewText;
    const reviewObj = {
      userName: `${firstName} ${lastName}` || "Anonymous",
      text: reviewUserMsg,
      rating: rating,
      userId: currentUser.uid,
      createdAt: new Date(),
    };
    try {
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);
      if (!productSnap.exists()) {
        console.log("No product found with id:", id);
        return;
      }
      const productData = productSnap.data();
      if (!productData.reviews) {
        await updateDoc(productRef, {
          reviews: [],
        });
      }
      await updateDoc(productRef, {
        reviews: arrayUnion(reviewObj),
      });
      setProduct((prevState) => ({
        ...prevState,
        reviews: [...prevState.reviews, reviewObj],
      }));
      setReviewText("");
      setRating(null);
      toast.success("Review submitted successfully");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error submitting review");
    }
  };

  const addToCart = () => {
    dispatch(
      cartActions.addItem({
        id,
        image: imgUrl,
        productName,
        price,
      })
    );
    toast.success("Product added successfully");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const renderStars = () => {
    let stars = [];
    let fullStars = Math.floor(avgRating);
    let noStars = Math.floor(5 - avgRating);
    let halfStar = avgRating - fullStars > 0 ? 1 : 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i
          className="ri-star-fill"
          style={{ color: "coral" }}
          key={`full${i}`}
        ></i>
      );
    }

    if (halfStar) {
      stars.push(
        <i
          className="ri-star-half-line"
          style={{ color: "coral" }}
          key="half"
        ></i>
      );
    }

    for (let i = 0; i < noStars; i++) {
      stars.push(
        <i
          className="ri-star-line"
          style={{ color: "coral" }}
          key={`empty${i}`}
        ></i>
      );
    }

    return stars;
  };

  return (
    <Helmet title={productName}>
      <CommonSection title={productName} />
      <section className="pt-5">
        <Container>
          <Row>
            <Col lg="6">
              <img src={imgUrl} alt="" style={{ borderRadius: "8px" }} />
            </Col>

            <Col lg="6">
              <div className="product__details">
                <h2>{productName}</h2>
                <div className="product__rating d-flex align-items-center gap-5 mb-3 ">
                  <div>{renderStars()}</div>
                  <p>
                    <span>{avgRating}</span> ratings
                  </p>
                </div>
                <div className="d-flex align-items-center gap-5">
                  <span className="product__price">₱{price}</span>
                  <span>Category: {category?.toUpperCase()}</span>
                </div>
                <p className="mt-3">{shortDesc}</p>
                <motion.button
                  whileTap={{ scale: 1.2 }}
                  className="buy__btn"
                  onClick={addToCart}
                >
                  Add to Cart
                </motion.button>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section>
        <Container>
          <Row>
            <Col lg="12">
              <div className="tab__wrapper d-flex align-items-center gap-5">
                <h6
                  className={`${tab === "desc" ? "active__tab" : ""}`}
                  onClick={() => setTab("desc")}
                >
                  Description
                </h6>
                <h6
                  className={`${tab === "rev" ? "active__tab" : ""}`}
                  onClick={() => setTab("rev")}
                >
                  Review ({reviews?.length || 0})
                </h6>
              </div>
              {tab === "desc" ? (
                <div className="tab__content mt-5">
                  <p>{description}</p>
                </div>
              ) : (
                <div className="product__review mt-5">
                  <div className="review__wrapper">
                    <ul>
                      {reviews?.map((item, index) => (
                        <li key={index} className="mb-4">
                          <div className="d-flex align-items-center gap-3">
                            <h6>{item.userName}</h6>
                            <span className="d-flex align-items-center">
                              {item.rating}
                              <i className="ri-star-s-fill"></i>
                            </span>
                          </div>

                          <p>{item.text}</p>
                        </li>
                      ))}
                    </ul>

                    <div className="review__form">
                      <h4>Leave your experience</h4>
                      <form action="" onSubmit={submitHandler}>
                        <div className="form__group d-flex align-items-center gap-5 rating__group">
                          <motion.span
                            whileTap={{ scale: 1.2 }}
                            onClick={() => setRating(1)}
                          >
                            1<i className="ri-star-s-fill"></i>
                          </motion.span>
                          <motion.span
                            whileTap={{ scale: 1.2 }}
                            onClick={() => setRating(2)}
                          >
                            2<i className="ri-star-s-fill"></i>
                          </motion.span>
                          <motion.span
                            whileTap={{ scale: 1.2 }}
                            onClick={() => setRating(3)}
                          >
                            3<i className="ri-star-s-fill"></i>
                          </motion.span>
                          <motion.span
                            whileTap={{ scale: 1.2 }}
                            onClick={() => setRating(4)}
                          >
                            4<i className="ri-star-s-fill"></i>
                          </motion.span>
                          <motion.span
                            whileTap={{ scale: 1.2 }}
                            onClick={() => setRating(5)}
                          >
                            5<i className="ri-star-s-fill"></i>
                          </motion.span>
                        </div>

                        <div className="form__group">
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            rows={4}
                            type="text"
                            placeholder="Review Message...."
                            required
                          />
                        </div>

                        <motion.button
                          whileTap={{ scale: 1.2 }}
                          type="submit"
                          className="buy__btn"
                        >
                          Submit
                        </motion.button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </Col>
            <Col lg="12" className="mt-5">
              <h2 className="related__title mb-3">You might also like</h2>
            </Col>

            <ProductsList data={relatedProducts} />
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default ProductDetails;
