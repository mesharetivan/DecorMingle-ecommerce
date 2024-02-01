import React, { useState } from "react";
import "../styles/login.css";

import Helmet from "../components/Helmet/Helmet";
import { Container, Row, Col, Form, FormGroup } from "reactstrap";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { setDoc, doc } from "firebase/firestore";

import { auth } from "../firebase.config";
import { storage } from "../firebase.config";
import { db } from "../firebase.config";

import { toast } from "react-toastify";

import LoaderSignUp from "../components/Loader/LoaderSignUp";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("seller");

  const navigate = useNavigate();

  const signup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const storageRef = ref(storage, `images/${Date.now() + username}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      uploadTask.on(
        "state_changed",
        (snapshot) => {},
        (error) => {
          console.error("Upload error:", error);
          toast.error(error.message);
          setTimeout(() => setLoading(false), 1000);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref)
            .then(async (downloadURL) => {
              try {
                await updateProfile(user, {
                  displayName: username,
                  photoURL: downloadURL,
                });
                await setDoc(doc(db, "users", user.uid), {
                  uid: user.uid,
                  displayName: username,
                  email,
                  photoURL: downloadURL,
                  role: role,
                });
                toast.success("Account created successfully!");
                setTimeout(() => {
                  setLoading(false);
                  navigate("/home");
                }, 1000);
              } catch (error) {
                console.error("Error writing document to Firestore:", error);
                toast.error("Failed to create account.");
                setTimeout(() => setLoading(false), 1000);
              }
            })
            .catch((error) => {
              console.error("Get download URL error:", error);
              toast.error("Failed to get download URL.");
              setTimeout(() => setLoading(false), 1000);
            });
        }
      );
    } catch (error) {
      console.error("Signup error:", error);
      toast.error("Something went wrong");
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <Helmet title="Signup">
      <section>
        <Container>
          <Row>
            <Col lg="6" className="m-auto text-center">
              <h3 className="fw-bold mb-4">Signup</h3>

              <Form className="auth__form" onSubmit={signup}>
                <FormGroup className="form__group">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </FormGroup>

                <FormGroup className="form__group">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </FormGroup>
                <FormGroup className="form__group">
                  <p>
                    Are you a :{" "}
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      required
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                    </select>
                  </p>
                </FormGroup>
                <FormGroup className="form__group">
                  <input type="file" onChange={handleImageChange} required />
                  {preview && (
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        marginTop: "10px",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </FormGroup>
                <button
                  type="submit"
                  className="buy__auth auth__btn"
                  disabled={loading}
                >
                  {loading ? (
                    <h4>
                      Creating account{" "}
                      <span>
                        <LoaderSignUp />
                      </span>
                    </h4>
                  ) : (
                    "Create an Account"
                  )}
                </button>
                <p>
                  Already have an account? <Link to="/login">Login</Link>
                </p>
              </Form>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Signup;
