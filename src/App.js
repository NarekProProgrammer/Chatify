import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import SignIn from "./RoutComponents/SignIn";
import SignUp from "./RoutComponents/SignUp";
import Profile from "./RoutComponents/Profile";
import { useDispatch, useSelector } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import Settings from "./RoutComponents/Settings/Settings";
import {
  getIsAuthenticating,
  getLog,
  setIsAuthenticating,
  setLog,
  setUser,
} from "./store/slices/userReducer";
import { LinearProgress } from "@mui/material";
import Chat from "./RoutComponents/Chat/Chat";
import NewChat from "./RoutComponents/NewChat/Checkout";

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
    dispatch(setIsAuthenticating(false));
  });
  function useForceUpdate() {
    const [value, setValue] = React.useState(0);
    return () => setValue((value) => value + 1);
  }
  const forceUpdate = useForceUpdate();
  const isAuthenticating = useSelector(getIsAuthenticating);
  let isLoggedIn = useSelector(getLog);
  if (isAuthenticating) {
    return <LinearProgress />;
  }
  return (
    <Routes>
      {isLoggedIn ? (
        <>
          <Route path="/profile" index element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/newChat" element={<NewChat />} />
          <Route path="*" element={<Navigate replace to="/profile" />} />
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
