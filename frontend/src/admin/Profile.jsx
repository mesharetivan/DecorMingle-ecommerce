import React, { useState, useRef } from "react";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";
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
import {
  updateProfile,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateDoc, doc } from "firebase/firestore";
import { auth, storage, db } from "../firebase.config";
import { toast } from "react-toastify";
import useUserRole from "../custom-hooks/useUserRole";
import userIcon from "../assets/images/user-icon.png";
import Orders from "./Orders";
import { useNavigate } from "react-router-dom";

import "../styles/profile.css";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [updateFirstName, setUpdateFirstName] = useState("");
  const [updateLastName, setUpdateLastName] = useState("");

  const navigate = useNavigate();

  const { currentUser, firstName, lastName } = useUserRole();

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

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();

    if (!email || !password || !currentPassword) {
      toast.error("Please provide email, current password, and new password.");
      return;
    }

    try {
      setLoading(true);

      // Define when re-authentication is needed
      const needReauthentication = true; // Replace with your actual condition

      // Reauthenticate user if necessary
      if (needReauthentication) {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          currentPassword // The user inputs their current password
        );

        await reauthenticateWithCredential(auth.currentUser, credential);

        // Update display name in Firebase Authentication profile
        // Moved inside the reauthentication block
        await updateProfile(auth.currentUser, {
          displayName: username,
        });
      }

      // Now include firstName and lastName in the request to your server endpoint
      const response = await fetch(
        "http://localhost:3001/update-user-credentials",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: auth.currentUser.uid,
            newEmail: email, // New email
            newPassword: password, // New password
            newUsername: username, // New username
            firstName: updateFirstName, // Updated first name
            lastName: updateLastName, // Updated last name
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Log the user out
        await signOut(auth);

        // Display success message
        toast.success(data.message);

        // Redirect user to login page
        navigate("/login");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Helmet title="Profile">
      <CommonSection title="Profile Page" />
      <section>
        <Container>
          <Row>
            <Col lg="4">
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
                <div className="d-flex flex-column gap-3 align-items-center mt-3 w-full">
                  <h5>
                    Hi, {currentUser && firstName} {currentUser && lastName}
                  </h5>
                </div>

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
            <Col lg="8">
              <Nav tabs>
                <NavItem className="nav__item-profile">
                  <NavLink
                    className={classnames({
                      "active-tab-color": activeTab === "1",
                      "inactive-tab-color": activeTab !== "1",
                    })}
                    onClick={() => toggleTab("1")}
                  >
                    Order History
                  </NavLink>
                </NavItem>
                <NavItem className="nav__item-profile">
                  <NavLink
                    className={classnames({
                      "active-tab-color": activeTab === "2",
                      "inactive-tab-color": activeTab !== "2",
                    })}
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
                  <Form
                    className="auth__form"
                    onSubmit={handleUpdateCredentials}
                  >
                    <FormGroup className="form__group">
                      <input
                        type="text"
                        defaultValue={updateFirstName || firstName}
                        placeholder="First Name"
                        onChange={(e) => setUpdateFirstName(e.target.value)}
                        required
                      />
                    </FormGroup>
                    <FormGroup className="form__group">
                      <input
                        type="text"
                        defaultValue={updateLastName || lastName}
                        placeholder="Last Name"
                        onChange={(e) => setUpdateLastName(e.target.value)}
                        required
                      />
                    </FormGroup>
                    <FormGroup className="form__group">
                      <input
                        type="text"
                        defaultValue={
                          username || (currentUser && currentUser.displayName)
                        }
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                    </FormGroup>
                    <FormGroup className="form__group">
                      <input
                        type="email"
                        defaultValue={
                          email || (currentUser && currentUser.email)
                        }
                        placeholder="Enter your email"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </FormGroup>
                    <FormGroup className="form__group">
                      <input
                        type="password"
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </FormGroup>
                    <FormGroup className="form__group">
                      <input
                        type="password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
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
    </Helmet>
  );
};

export default Profile;
