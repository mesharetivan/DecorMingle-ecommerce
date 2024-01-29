import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase.config";
import useAuth from "./useAuth";

const useUserRole = () => {
  const { currentUser } = useAuth();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
    
      if (currentUser && currentUser.uid) {
        try {
          const userDoc = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDoc);

          if (docSnap.exists()) {
            setRole(docSnap.data()?.role); 
          } else {
            
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
      
        setRole(null);
      }
    };

    fetchUserRole();
  }, [currentUser]);

  return { currentUser, role };
};

export default useUserRole;
