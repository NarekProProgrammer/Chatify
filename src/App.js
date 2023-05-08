import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./Components/SignIn";
import SignUp from "./Components/SignUp";
import Home from "./Components/Home";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Settings from "./Components/Profile/Profile";
import { getLog, setLog, setUser } from "./store/slices/userReducer";

export default function App() {
  const dispatch = useDispatch();
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "Users", user.uid);
      const docSnap = await getDoc(docRef);
      const userData = docSnap.data();
      dispatch(setUser(userData));
      dispatch(setLog(true));
    } else {
      dispatch(setLog(false));
    }
  });
  function useForceUpdate() {
    const [value, setValue] = React.useState(0);
    return () => setValue((value) => value + 1);
  }
  const forceUpdate = useForceUpdate();
  let isLoggedIn = useSelector(getLog);
  return (
    <Routes>
      {isLoggedIn ? (
        <>
          <Route path="/" index element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </>
      ) : (
        <>
          <Route path="/signin" element={<SignIn update={forceUpdate} />} />
          <Route path="/signup" element={<SignUp update={forceUpdate} />} />
          <Route path="*" element={<Navigate replace to="/signin" />} />
        </>
      )}
    </Routes>
  );
}
