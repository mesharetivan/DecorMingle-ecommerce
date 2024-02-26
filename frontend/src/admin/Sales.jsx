import React, { useState, useEffect } from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { Container, Row, Col } from "reactstrap";
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Helmet title="Sales">
      <CommonSection title="Sales" />
      <section>
        <Container>
          <Row className="sales">
            <Col className="lg-3">
              <div className="revenue__box">
                <h5>Total Sales Amount:</h5>
                <span>₱{totalSalesAmount}</span>
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
            <Col className="lg-3">
              <div className="export__data">
                <button
                  className="buy__btn mt-0"
                  onClick={handleExport}
                  disabled={loading || exporting}
                >
                  {exporting ? (
                    <span>Exporting...</span>
                  ) : (
                    <span>Export Sales Data</span>
                  )}
                </button>
              </div>
            </Col>
          </Row>
          <Row>
            <Col lg="12">
              <table className="table">
                <thead style={{ textAlign: "start" }}>
                  <tr>
                    <th>Image</th>
                    <th className="sales_product-name">Product Name</th>
                    <th className="sales__qty">Quantity</th>
                    <th className="sales__payment-method">Payment Method</th>
                    <th className="sales__total">Total Sales</th>
                  </tr>
                </thead>
                <tbody style={{ textAlign: "start" }}>
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
                        <td className="sales_name-td">
                          {order.items[0].productName}
                        </td>
                        <td className="sales__qty-td">{order.totalQuantity}</td>
                        <td className="sales__payment-td">
                          {order.paymentMethod}
                        </td>
                        <td className="sales__total-td">
                          ₱{order.totalAmount}
                        </td>
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
