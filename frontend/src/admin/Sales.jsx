import React from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { Container } from "reactstrap";

const Sales = () => {
  return (
    <Helmet title="Sales">
      <CommonSection title="Sales" />
      <section>
        <Container>
          <h5>Sales</h5>
        </Container>
      </section>
    </Helmet>
  );
};

export default Sales;
