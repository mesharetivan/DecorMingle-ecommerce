import React, { useState } from "react";
import "../styles/shop.css";

import CommonSection from "../components/UI/CommonSection";
import Helmet from "../components/Helmet/Helmet";
import { Container, Row, Col } from "reactstrap";

import products from "../assets/data/products";
import ProductsList from "../components/UI/ProductsList";

const Shop = () => {
  const [productsData, setProductsData] = useState(products);
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state

  const handleFilter = (e) => {
    const filterValue = e.target.value;
    if (filterValue === "all") {
      // If "All" is selected, reset to all products
      setProductsData(products);
    } else {
      // Filter products by category
      const filteredProducts = products.filter(
        (item) => item.category === filterValue
      );
      setProductsData(filteredProducts);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    const filteredProducts = products.filter((item) => {
      const name = item.productName || "";
      return name.toLowerCase().includes(query.toLowerCase());
    });

    setProductsData(filteredProducts);
  };

  return (
    <Helmet title={"Shop"}>
      <CommonSection title="Products"></CommonSection>

      <section>
        <Container>
          <Row>
            <Col lg="3" md="6">
              <div className="filter__widget">
                <select onChange={handleFilter}>
                  <option>Filter By Category</option>
                  <option value="all">All</option>
                  <option value="sofa">Sofa</option>
                  <option value="mobile">Mobile</option>
                  <option value="chair">Chair</option>
                  <option value="watch">Watch</option>
                  <option value="wireless">Wireless</option>
                </select>
              </div>
            </Col>
            <Col lg="3" md="6" className="text-end">
              <div className="filter__widget">
                <select>
                  <option>Sort By</option>
                  <option value="ascending">Ascending</option>
                  <option value="descending">Descending</option>
                </select>
              </div>
            </Col>
            <Col lg="6" md="12">
              <div className="search__box">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <span>
                  <i className="ri-search-line"></i>
                </span>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <section>
        <Container>
          <Row>
            {productsData.length === 0 ? (
              <div className="d-flex align-items-center justify-content-center">
                <h1>No Products Found !</h1>
              </div>
            ) : (
              <ProductsList data={productsData} />
            )}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Shop;
