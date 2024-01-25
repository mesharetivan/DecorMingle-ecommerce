/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const useGetData = (collectionName, filter = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Serialize the filter for useEffect dependency
  const serializedFilter = JSON.stringify(filter);

  useEffect(() => {
    const collectionRef = collection(db, collectionName);

    // Create a query object if filter is provided
    const queryObj = filter
      ? query(collectionRef, where(filter.field, filter.operator, filter.value))
      : collectionRef;

    const unsubscribe = onSnapshot(
      queryObj,
      (querySnapshot) => {
        const updatedData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(updatedData);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    // Clean up function
    return () => unsubscribe();
  }, [collectionName, serializedFilter]);

  return { data, loading, error };
};

export default useGetData;
