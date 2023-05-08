import { useSelector, useDispatch } from "react-redux";
import MySnackbar from "./mySnackbar.jsx";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import {
  getSnackbar,
  getUser,
  setSnackbar,
} from "../store/slices/userReducer.js";

export default function Home() {
  const email = useSelector(getUser)?.email;
  const nickname = useSelector(getUser)?.nickname;
  const password = useSelector(getUser)?.password;
  const avatar = useSelector(getUser)?.avatar;
  const snackbar = useSelector(getSnackbar);
  const dispatch = useDispatch();

  function signOutManually() {
    signOut(auth)
      .then(() => {
        dispatch(
          setSnackbar({
            show: true,
            message: "Signed out successfully!",
            type: "success",
          })
        );
      })
      .catch((error) => {
        dispatch(
          setSnackbar({
            show: true,
            message: "An error occurred while signing out!",
            type: "error",
          })
        );
      });
  }

  return (
    <div>
      <p>
        Your email: {email}.<br />
        Your nickname: {nickname}.<br />
        Your password: {password}.<br />
        Your avatar:{" "}
        <img
          style={{ maxWidth: "100px", maxHeight: "100px" }}
          src={avatar}
          alt="avatar"
        ></img>
      </p>
      <button onClick={signOutManually}>Sign out</button>
      {snackbar.show ? (
        <MySnackbar message={snackbar.message} type={snackbar.type} />
      ) : null}
    </div>
  );
}
