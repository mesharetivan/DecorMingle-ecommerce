import React, { useState, useEffect } from "react";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import Helmet from "../components/Helmet/Helmet";
import "../styles/home.css";

import HomeLoader from "../components/Loader/HomeLoader";

import { Container, Row, Col } from "reactstrap";
import heroImg from "../assets/images/hero-img.png";
import counterImg from "../assets/images/counter-timer-img.png";

import Services from "../services/Services";
import ProductsList from "../components/UI/ProductsList";
import Clock from "../components/UI/Clock";

import useGetData from "../custom-hooks/useGetData";

const Home = () => {
  const { data: products, loading } = useGetData("products");

  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSalesProducts, setBestSalesProducts] = useState([]);
  const [mobileProducts, setMobileProducts] = useState([]);
  const [wirelessProducts, setWirelessProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);

  const year = new Date().getFullYear();

  useEffect(() => {
    const filteredTrendingProducts = products.filter(
      (item) => item.category === "chair"
    );

    const filteredBestSalProducts = products.filter(
      (item) => item.category === "sofa"
    );

    const filteredMobileProducts = products.filter(
      (item) => item.category === "mobile"
    );

    const filteredWirelessProducts = products.filter(
      (item) => item.category === "wireless"
    );

    const filteredPopularProducts = products.filter(
      (item) => item.category === "watch"
    );

    setTrendingProducts(filteredTrendingProducts);
    setBestSalesProducts(filteredBestSalProducts);
    setMobileProducts(filteredMobileProducts);
    setWirelessProducts(filteredWirelessProducts);
    setPopularProducts(filteredPopularProducts);
  }, [products]);
  return (
    <Helmet title={"Home"}>
      <section className="hero__section">
        <Container>
          <Row>
            <Col lg="6" md="6">
              <div className="hero__content">
                <p className="hero__subtitle">Trending Products {year}</p>
                <h2>Enhance Your Space with Printamom</h2>
                <p>
                  Dive into the world of modern interior design with Printamom.
                  Discover our curated selection of trending furniture pieces
                  and decor that promise to bring a fresh, sophisticated touch
                  to your living space. Join us in celebrating the art of
                  contemporary living where style meets functionality.
                </p>
                <motion.button whileTap={{ scale: 1.2 }} className="buy__btn">
                  <Link to={"/shop"}>SHOP NOW</Link>
                </motion.button>
              </div>
            </Col>

            <Col lg="6" md="6">
              <div className="hero__img">
                <img src={heroImg} alt="" />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <Services />

      {/* trending products */}
      <section>
        <Container className="trending__products">
          <Row>
            <Col lg="12" className="text-center">
              <h2 className="section__title">Trending Products</h2>
            </Col>
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <HomeLoader />
              </div>
            ) : (
              <ProductsList data={trendingProducts} />
            )}
          </Row>
        </Container>
      </section>

      {/* best sales products */}
      <section>
        <Container className="best__sales">
          <Row>
            <Col lg="12" className="text-center">
              <h2 className="section__title">Best Sales</h2>
            </Col>
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <HomeLoader />
              </div>
            ) : (
              <ProductsList data={bestSalesProducts} />
            )}
          </Row>
        </Container>
      </section>
      {/* timer counter */}
      <section className="timer__count">
        <Container>
          <Row>
            <Col lg="6" md="12" className="count__down-col">
              <div className="clock__top-content">
                <h4 className="text-white fs-6 mb-2">Exclusive Deals</h4>
                <h3 className="text-white fs-5 mb-3">On Trending Furniture</h3>
              </div>

              <Clock />

              <motion.button
                whileTap={{ scale: 1.2 }}
                className="buy__btn store__btn"
              >
                <Link to="/shop">Explore Offers</Link>
              </motion.button>
            </Col>
            <Col lg="6" md="12" className="text-end counter__img">
              <img src={counterImg} alt="" />
            </Col>
          </Row>
        </Container>
      </section>
      {/* New arrivals */}
      <section className="new__arrivals">
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h2 className="section__title">New Arrivals</h2>
            </Col>
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <HomeLoader />
              </div>
            ) : (
              <>
                <ProductsList data={wirelessProducts} />
                <ProductsList data={mobileProducts} />
              </>
            )}
          </Row>
        </Container>
      </section>
      {/* popular category */}
      <section className="popular__category">
        <Container>
          <Row>
            <Col lg="12" className="text-center">
              <h2 className="section__title">Popular in Category</h2>
            </Col>
            {loading ? (
              <div className="d-flex align-items-center justify-content-center">
                <HomeLoader />
              </div>
            ) : (
              <ProductsList data={popularProducts} />
            )}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Home;
