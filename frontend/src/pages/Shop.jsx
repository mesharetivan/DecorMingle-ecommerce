import React, { useState, useEffect } from "react";
import "../styles/shop.css";

import CommonSection from "../components/UI/CommonSection";
import Helmet from "../components/Helmet/Helmet";
import { Container, Row, Col } from "reactstrap";

import ProductsList from "../components/UI/ProductsList";

import useGetData from "../custom-hooks/useGetData";

import Loader from "../components/Loader/Loader";

const Shop = () => {
  const [filter, setFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: products, loading, error } = useGetData("products", filter);
  const [productsData, setProductsData] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!loading && products) {
      setProductsData(products);
    }
  }, [products, loading]);

  const handleFilter = (e) => {
    const filterValue = e.target.value;
    if (filterValue === "all") {
      setFilter(null);
    } else {
      setFilter({ field: "category", operator: "==", value: filterValue });
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query === "") {
      setProductsData(products);
    } else {
      const filteredProducts = products.filter((item) => {
        const name = item.productName || "";
        return name.toLowerCase().includes(query.toLowerCase());
      });
      setProductsData(filteredProducts);
    }
  };

  const handleSort = (e) => {
    const sortValue = e.target.value;
    let sortedProducts = [...productsData];

    // Adding price sorting options
    switch (sortValue) {
      case "priceLowToHigh":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "priceHighToLow":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "ascending": // Keep existing name sorting
        sortedProducts.sort((a, b) =>
          a.productName.localeCompare(b.productName)
        );
        break;
      case "descending":
        sortedProducts.sort((a, b) =>
          b.productName.localeCompare(a.productName)
        );
        break;
      default:
        // No default sorting or you can set one as per your requirement
        break;
    }

    setProductsData(sortedProducts);
  };

  if (loading) {
    return (
      <div className="loader">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Helmet title={"Shop"}>
      <CommonSection title="Products"></CommonSection>

      <section>
        <Container>
          <Row>
            <Col lg="4">
              <div className="filter__all-sort">
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
                    <select onChange={handleSort}>
                      <option>Sort By</option>
                      <option value="ascending">Ascending</option>
                      <option value="descending">Descending</option>
                      <option value="priceLowToHigh">Price Low to High</option>
                      <option value="priceHighToLow">Price High to Low</option>
                    </select>
                  </div>
                </Col>
              </div>
            </Col>

            <Col lg="8">
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
