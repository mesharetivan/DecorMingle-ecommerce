import React, { useState, useEffect } from "react";
import "../styles/shop.css";

import CommonSection from "../components/UI/CommonSection";
import Helmet from "../components/Helmet/Helmet";
import { Container, Row, Col } from "reactstrap";

import ProductsList from "../components/UI/ProductsList";

import useGetData from "../custom-hooks/useGetData";

import Loader from "../components/Loader/Loader";

const Shop = () => {
  const [filter, setFilter] = useState(null); // Initialize without a filter to fetch all products
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products, loading, error } = useGetData("products", filter);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    if (!loading && products) {
      setProductsData(products);
    }
  }, [products, loading]);

  const handleFilter = (e) => {
    const filterValue = e.target.value;
    if (filterValue === "all") {
      setFilter(null); // Fetch all products when "All" is selected
    } else {
      // Set filter to only include products from the selected category
      setFilter({ field: "category", operator: "==", value: filterValue });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query === "") {
      // If the search query is empty, show all products
      setProductsData(products);
    } else {
      // Filter products based on the search query
      const filteredProducts = products.filter((item) => {
        const name = item.productName || "";
        return name.toLowerCase().includes(query.toLowerCase());
      });
      setProductsData(filteredProducts);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div>Error: {error.message}</div> // Display error message
    );
  }

  return (
    <Helmet title={"Shop"}>
      <CommonSection title="Products"></CommonSection>

      <section>
        <Container>
          <Row>
            <Col lg="3" md="6">
              <div className="filter__widget">
                <select onChange={handleFilter}>
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
