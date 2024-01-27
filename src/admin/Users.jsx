import React from "react";
import { Container, Row, Col } from "reactstrap";

import useGetData from "../custom-hooks/useGetData";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";

const Users = () => {
  const { data: usersData, loading } = useGetData("users");

  const deleteUser = async (id) => {
    try {
      if (!id) {
        console.error("Invalid userId:", id);
        return;
      }

      // Construct the user document reference
      const userDocRef = doc(db, "users", id);

      // Delete the user document from Firestore
      await deleteDoc(userDocRef);

      // Show a success toast
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting user:", error);
      // Show an error toast
      toast.error("Error deleting user. Please try again later.");
    }
  };

  return (
    <section>
      <Container>
        <Row>
          <Col lg="12">
            <h4 className="fw-bold">Users</h4>
          </Col>
          <Col lg="12" className="pt-5">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      <h5 className="pt-5 fw-bold">Loading....</h5>
                    </td>
                  </tr>
                ) : (
                  usersData?.map((user, index) => (
                    <tr key={index}>
                      <td>
                        <img src={user.photoURL} alt="" />
                      </td>
                      <td>{user.displayName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
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
  );
};

export default Users;
