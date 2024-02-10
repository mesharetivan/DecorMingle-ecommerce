import React from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { Container } from "reactstrap";

const Shipping = () => {
  return (
    <Helmet title="Shipping Information">
      <CommonSection title="Shipping Informations" />
      <section>
        <Container>
          <h5>Shipping</h5>
        </Container>
      </section>
    </Helmet>
  );
};

export default Shipping;
