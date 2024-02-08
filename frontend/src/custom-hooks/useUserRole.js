import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import useAuth from "./useAuth";

const useUserRole = () => {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);
  // Continue using state hooks for firstName and lastName
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser && currentUser.uid) {
        try {
          const userDoc = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Assuming role is still a top-level field
            setRole(userData.role);
            // Accessing firstName and lastName from the nested profile object
            // Ensuring profile exists before trying to access its properties
            if (userData.profile) {
              setFirstName(userData.profile.firstName || "");
              setLastName(userData.profile.lastName || "");
            } else {
              // If there's no profile object, reset these values
              setFirstName("");
              setLastName("");
            }
          } else {
            // Handle the case where the user document does not exist
            setRole(null);
            setFirstName("");
            setLastName("");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          // Reset states on error
          setRole(null);
          setFirstName("");
          setLastName("");
        }
      } else {
        // Reset states if currentUser is not defined
        setRole(null);
        setFirstName("");
        setLastName("");
      }
    };

    fetchUserRole();
  }, [currentUser]);

  return { currentUser, role, firstName, lastName };
};

export default useUserRole;
