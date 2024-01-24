import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { db } from "../firebase.config";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "react-toastify";

import useGetData from "../custom-hooks/useGetData";

import defaultProductImg from "../assets/images/arm-chair-01.jpg";

const AllProducts = () => {
  const { data: products } = useGetData("products");
  const [loading, setLoading] = useState(false);

  const deleteProduct = async (productId) => {
    try {
      setLoading(true);
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product: ", error);
      toast.error("Error deleting product");
    } finally {
      setLoading(false);
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
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img
                          src={product.imgUrl || defaultProductImg}
                          alt={product.title}
                          style={{ width: "50px" }}
                        />
                      </td>
                      <td>{product.title}</td>
                      <td>{product.category}</td>
                      <td>${product.price}</td>
                      <td>
                        <button
                          className="btn btn-danger"
                          onClick={() => deleteProduct(product.id)}
                          disabled={loading}
                        >
                          {loading ? "Deleting..." : "Delete"}
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
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default AllProducts;
