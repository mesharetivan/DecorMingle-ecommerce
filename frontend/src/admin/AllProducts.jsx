import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { db } from "../firebase.config";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
//import { useHistory } from "react-router-dom"; // Remove useHistory

import useGetData from "../custom-hooks/useGetData";

import defaultProductImg from "../assets/images/arm-chair-01.jpg";

import "../styles/all-products.css";

import HomeLoader from "../components/Loader/HomeLoader";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";

const AllProducts = () => {
  const { data: products, loading } = useGetData("products");
  const [isDeleting, setIsDeleting] = useState(false);
  //const history = useHistory(); // Remove useHistory
  const navigate = useNavigate(); // Initialize useNavigate

  const deleteProduct = async (productId) => {
    try {
      setIsDeleting(true);
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast.error("Error deleting product");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (productId) => {
    navigate(`/dashboard/edit-product/${productId}`); // Use navigate to navigate to edit route
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Helmet title="All Products">
      <CommonSection title="All Products" />
      <section>
        <Container>
          <Row>
            <Col lg="12">
              <div className="d-flex justify-content-start align-items-center mb-4">
                <Link to="/dashboard/add-product">
                  <button className="buy__btn">Add Product</button>
                </Link>
              </div>
              <table className="table">
                <thead style={{ textAlign: "start" }}>
                  <tr>
                    <th className="products__th">Image</th>
                    <th className="products__th">Title</th>
                    <th className="products__th">Category</th>
                    <th className="products__th">Price</th>
                    <th className="products__th-action">Action</th>
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
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id}>
                        <td className="products__td">
                          <img
                            src={product.imgUrl || defaultProductImg}
                            alt={product.productName}
                            style={{ width: "50px", borderRadius: "8px" }}
                          />
                        </td>
                        <td className="products__td">{product.productName}</td>
                        <td className="products__td">{product.category}</td>
                        <td className="products__td-price">{`₱${product.price}`}</td>
                        <td className="products__td-delete">
                          <div className="d-flex align-items-center justify-content-start gap-3 edit__btn">
                            <button
                              className="btn btn-primary mr-2"
                              onClick={() => handleEdit(product.id)} // Call handleEdit function
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => deleteProduct(product.id)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No products available.
                      </td>
                    </tr>
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

export default AllProducts;
