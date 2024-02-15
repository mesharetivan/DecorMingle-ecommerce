import React, { useEffect } from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";

import "../styles/dashboard.css";

import { Container, Row, Col } from "reactstrap";

// import useGetData from "../custom-hooks/useGetData";

const Dashboard = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);



  return (
    <>
      <Helmet title="Dashboard">
        <CommonSection title="Dashboard" />
        <section>
          <Container>
            <Row>
              <Col className="lg-3">
                <div className="revenue__box">
                  <h5>My Total Sales</h5>
                  <span>₱7894</span>
                </div>
              </Col>
              <Col className="lg-3">
                <div className="order__box">
                  <h5>My Orders</h5>
                  <span>0</span>
                </div>
              </Col>
              <Col className="lg-3">
                <div className="products__box">
                  <h5>My Returns</h5>
                  <span>0</span>
                </div>
              </Col>
            </Row>
          </Container>
        </section>
      </Helmet>
    </>
  );
};

export default Dashboard;
