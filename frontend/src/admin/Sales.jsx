import React, { useState } from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { Container, Row, Col, Button } from "reactstrap";
import useGetData from "../custom-hooks/useGetData";
import HomeLoader from "../components/Loader/HomeLoader";
import exportToExcel from "../utils/exportToExcel";

import "../styles/sales.css";

const Sales = () => {
  const { data: orders, loading } = useGetData("orders");

  // Calculate total sales amount
  const totalSalesAmount = orders.reduce(
    (total, order) => total + order.totalAmount,
    0
  );

  // Calculate total number of orders
  const totalOrders = orders.length;

  // Calculate total returns
  // Assuming returns are represented by orders with negative total amounts
  const totalReturns = orders.reduce(
    (total, order) =>
      order.totalAmount < 0 ? total + order.totalAmount : total,
    0
  );

  // State to manage export button click
  const [exporting, setExporting] = useState(false);

  // Function to handle export button click
  const handleExport = () => {
    setExporting(true);
    // Call exportToExcel function passing orders data
    exportToExcel(orders)
      .then(() => setExporting(false))
      .catch((error) => {
        console.error("Error exporting data:", error);
        setExporting(false);
      });
  };

  return (
    <Helmet title="Sales">
      <CommonSection title="Sales" />
      <section>
        <Container>
          <Row className="mb-4">
            <Col className="lg-3">
              <div className="revenue__box">
                <h5>Total Sales Amount:</h5>
                <span>{totalSalesAmount}</span>
              </div>
            </Col>
            <Col className="lg-3">
              <div className="order__box">
                <h5>Total Orders</h5>
                <span>{totalOrders}</span>
              </div>
            </Col>
            <Col className="lg-3">
              <div className="products__box">
                <h5>Total Returns</h5>
                <span>{totalReturns}</span>
              </div>
            </Col>
            <Col className="lg-3 d-flex justify-content-center align-items-center">
              <Button
                color="primary"
                onClick={handleExport}
                disabled={loading || exporting}
              >
                {exporting ? "Exporting..." : "Export Sales Data"}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <table className="table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Payment Method</th>
                    <th>Total Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        <div className="d-flex justify-content-center align-items-center">
                          <HomeLoader />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <img
                            src={order.items[0].imgUrl}
                            alt={order.items[0].productName}
                          />
                        </td>
                        <td>{order.items[0].productName}</td>
                        <td>{order.totalQuantity}</td>
                        <td>{order.paymentMethod}</td>
                        <td>{order.totalAmount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Sales;
