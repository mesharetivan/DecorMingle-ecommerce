import React, { useState, useRef } from "react";
import {
  Col,
  Container,
  Row,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Form,
  FormGroup,
} from "reactstrap";
import classnames from "classnames";
import LoaderSignUp from "../components/Loader/LoaderSignUp";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateDoc, doc } from "firebase/firestore";
import { auth, storage, db } from "../firebase.config";
import { toast } from "react-toastify";
import useUserRole from "../custom-hooks/useUserRole";
import userIcon from "../assets/images/user-icon.png";
import Orders from "./Orders";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");

  const { currentUser } = useUserRole();

  const fileInputRef = useRef(null);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setLoading(true);
    const storageRef = ref(storage, `images/${Date.now() + username}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Optional: Handle progress
      },
      (error) => {
        console.error("Upload error:", error);
        toast.error(error.message);
        setLoading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then(async (downloadURL) => {
            try {
              await updateProfile(auth.currentUser, { photoURL: downloadURL });
              await updateDoc(doc(db, "users", auth.currentUser.uid), {
                photoURL: downloadURL,
              });
              toast.success("Profile picture updated successfully!");
            } catch (error) {
              console.error("Error updating document in Firestore:", error);
              toast.error("Failed to update profile picture.");
            } finally {
              setLoading(false);
            }
          })
          .catch((error) => {
            console.error("Get download URL error:", error);
            toast.error("Failed to get download URL.");
            setLoading(false);
          });
      }
    );
  };

  const updateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        displayName: username,
        email,
        role,
      });

      await updateProfile(auth.currentUser, { displayName: username });
      toast.success("Settings updated successfully!");
    } catch (error) {
      console.error("Update settings error:", error);
      toast.error("Failed to update account settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="3">
            <div className="d-flex flex-column justify-content-center align-items-center">
              <img
                src={
                  preview || (currentUser && currentUser.photoURL) || userIcon
                }
                alt="User Profile"
                style={{
                  borderRadius: "50%",
                }}
              />
              <input
                ref={fileInputRef}
                type="file"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <button
                className="buy__btn"
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                disabled={loading}
              >
                {loading ? "Updating..." : "Change Profile Picture"}
              </button>
            </div>
          </Col>
          <Col lg="9">
            <Nav tabs>
              <NavItem className="mr-3 mb-4">
                <NavLink
                  className={classnames({ active: activeTab === "1" })}
                  onClick={() => toggleTab("1")}
                >
                  My Orders
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: activeTab === "2" })}
                  onClick={() => toggleTab("2")}
                >
                  Settings
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                <Orders currentUser={currentUser} />
              </TabPane>
              <TabPane tabId="2">
                <Form className="auth__form" onSubmit={updateSettings}>
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
                  <button
                    type="submit"
                    className="buy__auth auth__btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <h4>
                        Updating account{" "}
                        <span>
                          <LoaderSignUp />
                        </span>
                      </h4>
                    ) : (
                      "Update Account"
                    )}
                  </button>
                </Form>
              </TabPane>
            </TabContent>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Profile;
