import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config"; // Assuming you have a Firestore setup
import useAuth from "./useAuth";

const useUserRole = () => {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      // Ensure currentUser and currentUser.uid are not undefined
      if (currentUser && currentUser.uid) {
        try {
          const userDoc = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            setRole(docSnap.data()?.role); // Use optional chaining for safety
          } else {
            // Handle case where user document doesn't exist
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
        // Handle case where currentUser or currentUser.uid is not available
        setRole(null);
      }
    };

    fetchUserRole();
  }, [currentUser]); // Re-run the effect when currentUser changes

  return { currentUser, role };
};

export default useUserRole;
