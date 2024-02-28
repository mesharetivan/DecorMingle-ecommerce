import React, { useEffect } from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { Container, Row, Col } from "reactstrap";
import useAuth from "../custom-hooks/useAuth";
import useGetData from "../custom-hooks/useGetData";

const Dashboard = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { currentUser } = useAuth(); // Make sure currentUser is defined

  // Check if currentUser and currentUser.uid are defined
  const userId = currentUser && currentUser.uid ? currentUser.uid : null;

  // Fetch orders data unconditionally
  const { data: orders } = useGetData("orders", {
    field: "customerId",
    operator: "==",
    value: userId, // Pass userId as the value for the filter
  });

  // Calculate total number of orders
  const totalOrders = orders ? orders.length : 0;

  return (
    <>
      <Helmet title="Dashboard">
        <CommonSection title="Dashboard" />
        <section>
          <Container>
            <Row>
              <Col className="lg-3">
                <div className="revenue__box">
                  <h5>My Wallet Balance</h5>
                  <span>₱0</span>
                </div>
              </Col>
              <Col className="lg-3">
                <div className="order__box">
                  <h5>My Orders</h5>
                  <span>{totalOrders}</span>{" "}
                  {/* Display total number of orders */}
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
