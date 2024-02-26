import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Container, Row, Col, Form, FormGroup, Button } from "reactstrap";
import { toast } from "react-toastify";

import { db, storage } from "../firebase.config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import HomeLoader from "../components/Loader/HomeLoader";

const EditProduct = () => {
  const { id } = useParams(); // Get the id from URL parameters
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", id));
        if (productDoc.exists()) {
          setProduct(productDoc.data());
          setLoading(false);
        } else {
          toast.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product: ", error);
        toast.error("Error fetching product");
      }

      window.scrollTo(0, 0);
    };

    fetchProduct();
  }, [id]);

  const updateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = product.imgUrl;
      if (newImage) {
        const imageRef = ref(
          storage,
          `productImages/${Date.now() + newImage.name}`
        );
        const uploadTask = uploadBytesResumable(imageRef, newImage);

        await uploadTask;

        imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
      }

      await updateDoc(doc(db, "products", id), {
        ...product, // Include other product data
        imgUrl: imageUrl, // Update only the image URL
      });

      toast.success("Product updated successfully!");
    } catch (error) {
      console.error("Error updating product: ", error);
      toast.error("Error updating product");
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevProduct) => ({
      ...prevProduct,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      // Create a temporary URL for the image preview
      setImagePreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center">
        <HomeLoader />
      </div>
    );
  }

  return (
    <Helmet title="Edit Product">
      <CommonSection title="Edit Product" />
      <section>
        <Container>
          <Row>
            <Col lg="12">
              <h4 className="mb-5">Edit Product</h4>
              <Form onSubmit={updateProduct}>
                <FormGroup className="form__group">
                  <span>Product title</span>
                  <input
                    type="text"
                    name="productName"
                    value={product.productName}
                    onChange={handleChange}
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <span>Short Description</span>
                  <input
                    type="text"
                    name="shortDesc"
                    value={product.shortDesc}
                    onChange={handleChange}
                  />
                </FormGroup>

                <FormGroup className="form__group">
                  <span>Description</span>
                  <input
                    type="text"
                    name="description"
                    value={product.description}
                    onChange={handleChange}
                  />
                </FormGroup>

                <div className="d-flex align-items-center justify-content-between gap-5">
                  <FormGroup className="form__group w-50">
                    <span>Price</span>
                    <input
                      type="text"
                      name="price"
                      value={`₱${product.price}`}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Extract numeric value from the input
                        const numericValue = value.replace(/[^\d.]/g, "");
                        setProduct((prevProduct) => ({
                          ...prevProduct,
                          price: numericValue,
                        }));
                      }}
                    />
                  </FormGroup>

                  <FormGroup className="form__group w-50">
                    <span>Category</span>
                    <select
                      name="category"
                      className="w-100 p-2"
                      value={product.category}
                      onChange={handleChange}
                    >
                      <option value="chair">Chair</option>
                      <option value="sofa">Sofa</option>
                      <option value="mobile">Mobile</option>
                      <option value="watch">Watch</option>
                      <option value="wireless">Wireless</option>
                    </select>
                  </FormGroup>
                </div>

                <FormGroup className="form__group">
                  <span>Product Image</span>
                  <input type="file" onChange={handleImageChange} />
                  {/* Display image preview */}
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Product Preview"
                      style={{
                        width: "100px",
                        height: "100px",
                        marginTop: "10px",
                      }}
                    />
                  )}
                </FormGroup>

                <Button className="buy__btn" type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Product"}
                </Button>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default EditProduct;
