import { useState, useEffect } from "react";
import { db } from "../firebase.config";
import { collection, onSnapshot } from "firebase/firestore";

const useGetData = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const collectionRef = collection(db, collectionName);

    const unsubscribe = onSnapshot(
      collectionRef,
      (querySnapshot) => {
        const updatedData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(updatedData);
        setLoading(false);
      },
      (error) => {
        setError(error); // Handle errors
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]); // Depend on collectionName instead of collectionRef

  return { data, loading, error }; // Return error as part of the hook's result
};

export default useGetData;
