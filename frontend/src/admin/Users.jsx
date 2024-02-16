import React from "react";
import { Container, Row, Col } from "reactstrap";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/CommonSection";

import "../styles/users.css";

import useGetData from "../custom-hooks/useGetData";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import HomeLoader from "../components/Loader/HomeLoader";

const Users = () => {
  const { data: usersData, loading } = useGetData("users");

  const deleteUser = async (id) => {
    try {
      if (!id) {
        console.error("Invalid userId:", id);
        return;
      }

      const userDocRef = doc(db, "users", id);

      await deleteDoc(userDocRef);

      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);

      toast.error("Error deleting user. Please try again later.");
    }
  };

  return (
    <Helmet title="Users">
      <CommonSection title="All Users" />
      <section>
        <Container>
          <Row>
            <Col lg="12" className="pt-5">
              <table className="table">
                <thead>
                  <tr>
                    <th className="users__th">Image</th>
                    <th className="users__th-user">Username</th>
                    <th className="users__th-email">Email</th>
                    <th className="users__th-role">Role</th>
                    <th className="users__th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center" }}>
                        <div className="d-flex justify-content-center align-items-center">
                          <HomeLoader />
                        </div>
                      </td>
                    </tr>
                  ) : (
                    usersData?.map((user, index) => (
                      <tr key={index}>
                        <td className="users__td">
                          <img
                            src={user.photoURL}
                            alt=""
                            style={{ borderRadius: "8px" }}
                          />
                        </td>
                        <td className="users__td-user">{user.displayName}</td>
                        <td className="users__td-email">{user.email}</td>
                        <td className="users__td-role">{user.role}</td>
                        <td className="users__td-delete">
                          <button
                            className="btn btn-danger"
                            onClick={() => deleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Users;
