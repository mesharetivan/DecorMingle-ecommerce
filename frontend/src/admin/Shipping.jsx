import React, { useRef, useState, useEffect } from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
import { Container, FormGroup } from "reactstrap";
import { toast } from "react-toastify";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import useAuth from "../custom-hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Shipping = () => {
  const formRef = useRef(null);
  const [areaCodes, setAreaCodes] = useState([]);
  const [existingShippingInfo, setExistingShippingInfo] = useState(null);
  const navigate = useNavigate();

  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchAreaCodes = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        const codes = data.map((country) => ({
          code:
            country.idd.root +
            (country.idd.suffixes ? country.idd.suffixes[0] : ""),
          country: country.name.common,
        }));
        setAreaCodes(codes);
      } catch (error) {
        console.error("Error fetching country codes:", error);
      }
    };

    fetchAreaCodes();
  }, []);

  useEffect(() => {
    const fetchShippingInfo = async () => {
      if (!currentUser || !currentUser.uid) {
        return; // Return early if currentUser is not defined or doesn't have a uid
      }
      try {
        const docRef = doc(db, "shippingInfo", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setExistingShippingInfo(docSnap.data());
        } else {
          setExistingShippingInfo(null);
        }
      } catch (error) {
        console.error("Error fetching shipping information:", error);
      }
    };

    fetchShippingInfo();
  }, [currentUser]);

  const handleSubmitInfo = async () => {
    const form = formRef.current;

    if (!form) {
      console.error("Form is not rendered or the ref is not attached.");
      return;
    }

    // Extract form data
    const formData = new FormData(form);
    const name = formData.get("name");
    const email = formData.get("email");
    const areaCode = formData.get("areaCodes");
    const number = areaCode + formData.get("number");
    const address = formData.get("address");
    const city = formData.get("city");
    const postalCode = formData.get("postalCode");
    const country = formData.get("country");

    // Check if all fields are filled
    const isFormFilled =
      name?.trim() &&
      email?.trim() &&
      number?.trim() &&
      address?.trim() &&
      city?.trim() &&
      postalCode?.trim() &&
      country?.trim();

    if (!isFormFilled) {
      navigate("/shop");
      return;
    }

    try {
      // Save shipping info to Firestore
      await setDoc(doc(db, "shippingInfo", currentUser.uid), {
        name,
        email,
        number,
        address,
        city,
        postalCode,
        country,
      });

      toast.success("Shipping information saved successfully!");

      // Clear form fields after successful submission
      form.reset();

      // Navigate to shop page after adding or updating shipping info
      navigate("/shop");
    } catch (error) {
      console.error("Error adding shipping information: ", error);
      toast.error("Error saving shipping information. Please try again later.");
    }
  };

  return (
    <Helmet title="Shipping Information">
      <CommonSection title="Shipping Informations" />
      <section>
        <Container>
          <h6 className="mb-4 fw-bold">Shipping Information</h6>
          <form className="auth__form" ref={formRef}>
            {existingShippingInfo ? (
              <>
                <FormGroup className="form__group">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    name="name"
                    defaultValue={existingShippingInfo.name}
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    defaultValue={existingShippingInfo.email}
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <div className="phone__number">
                    <div className="area__code">
                      <select
                        name="areaCodes"
                        defaultValue={existingShippingInfo.number.substring(
                          0,
                          3
                        )}
                      >
                        {areaCodes.map((item, index) => (
                          <option key={index} value={item.code}>
                            {item.country} ({item.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Enter your number"
                        name="number"
                        defaultValue={existingShippingInfo.number.substring(3)}
                      />
                    </div>
                  </div>
                </FormGroup>
                <FormGroup className="form__group">
                  <input
                    type="text"
                    placeholder="Enter your Street address"
                    name="address"
                    defaultValue={existingShippingInfo.address}
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <input
                    type="text"
                    placeholder="City"
                    name="city"
                    defaultValue={existingShippingInfo.city}
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <input
                    type="text"
                    placeholder="Postal code"
                    name="postalCode"
                    defaultValue={existingShippingInfo.postalCode}
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <input
                    type="text"
                    placeholder="Country"
                    name="country"
                    defaultValue={existingShippingInfo.country}
                  />
                </FormGroup>
              </>
            ) : (
              <p>No shipping information added yet.</p>
            )}

            <button
              type="button"
              className="buy__btn auth__btn w-100"
              onClick={handleSubmitInfo}
            >
              {existingShippingInfo
                ? "Update Shipping Info"
                : "Proceed to Shop"}
            </button>
          </form>
        </Container>
      </section>
    </Helmet>
  );
};

export default Shipping;
