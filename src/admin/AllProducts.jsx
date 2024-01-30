import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { db } from "../firebase.config";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import useGetData from "../custom-hooks/useGetData";

import defaultProductImg from "../assets/images/arm-chair-01.jpg";

const AllProducts = () => {
  const { data: products, loading } = useGetData("products"); // Destructure loading from useGetData
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <section>
      <Container>
        <Row>
          <Col lg="12">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                 
                  <tr>
                    <td colSpan="5" className="text-center">
                      <h5 className="pt-5 fw-bold">Loading....</h5>
                    </td>
                  </tr>
                ) : products.length > 0 ? (
                 
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={product.imgUrl || defaultProductImg}
                          alt={product.productName}
                          style={{ width: "50px" }}
                        />
                      </td>
                      <td>{product.productName}</td>
                      <td>{product.category}</td>
                      <td>${product.price}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteProduct(product.id)}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete"}
                        </button>
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
            <Link to="/dashboard/add-product">
              <button className="buy__btn">Add Product</button>
            </Link>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AllProducts;
