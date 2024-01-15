import { createContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "../../firebaseConfig";
import { Center, Loader } from "@mantine/core";

export const Context = createContext();

export function AuthContext({ children }) {
  const auth = getAuth();
  const [user, setUser] = useState();
  const [isLoading, setLoading] = useState(true);
  const [householdId, setHouseholdId] = useState("");

  const getHouseholdId = async (user) => {
    const userDoc = await getDoc(doc(firestore, `users/${user.uid}`));
    console.log(userDoc.data().householdId);
    setHouseholdId(userDoc.data().householdId);
  };

  useEffect(() => {
    let unsubscribe;
    unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await getHouseholdId(currentUser, setHouseholdId);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  const values = {
    user: user,
    setUser: setUser,
    householdId: householdId,
    sethouseholdId: setHouseholdId,
  };

  return (
    <Context.Provider value={values}>{!isLoading && children}</Context.Provider>
  );
}
