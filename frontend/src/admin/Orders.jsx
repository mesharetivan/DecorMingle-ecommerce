import React, { useEffect, useState } from "react";
import { Table } from "reactstrap";
import useAuth from "../custom-hooks/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase.config";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrdersForUser = async () => {
      if (!currentUser || !currentUser.uid) {
        // If there's no user or the user's uid is not loaded yet, don't attempt to fetch orders
        return [];
      }
      try {
        const ordersCollectionRef = collection(db, "orders");
        const q = query(
          ordersCollectionRef,
          where("customerId", "==", currentUser.uid) // Filter by customerId
        );
        const querySnapshot = await getDocs(q);
        const userOrders = [];
        querySnapshot.forEach((doc) => {
          // Add the order data and the doc id to the userOrders array
          userOrders.push({ id: doc.id, ...doc.data() });
        });
        return userOrders;
      } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
      }
    };

    const fetchUserOrders = async () => {
      const userOrders = await fetchOrdersForUser();
      setOrders(userOrders);
    };

    fetchUserOrders();
  }, [currentUser]); // Only re-run the effect if currentUser changes

  const truncateOrderId = (id) => {
    // Find the index of the dash
    const dashIndex = id.indexOf("-");
    if (dashIndex !== -1) {
      // Extract the part after the dash
      const afterDash = id.substring(dashIndex + 1);
      // Now, apply truncation logic if needed
      if (afterDash.length > 15) {
        // Adjust 15 to your preference for the length of the ID
        return `${afterDash.substring(0, 3)}...`;
      }
      return afterDash;
    }
    return id; // Return the original ID if no dash is found
  };

  return (
    <div>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <Table striped>
          <thead>
            <tr>
              <th>Order Date</th>
              <th>Order ID</th>
              <th>Payment Method</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>
                  {order.createdAt &&
                    new Date(order.createdAt.seconds * 1000).toLocaleString()}
                </td>
                <td>#{truncateOrderId(order.id)}</td>
                <td>{order.paymentMethod}</td>
                <td>₱{order.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Orders;
