import { Button, Grid, TextField } from "@mui/material";
import React, { useEffect } from "react";
import { auth, db } from "../../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { getSnackbar, setSnackbar } from "../../store/slices/userReducer";
import MySnackbar from "../mySnackbar.jsx";

export default function Members({
  currentEmail,
  setCurrentEmail,
  currentEmailError,
  validateEmail,
  emails,
  setEmails,
  removeEmail,
}) {
  const dispatch = useDispatch();
  const snackbar = useSelector(getSnackbar);

  async function addEmail() {
    validateEmail();
    const q = query(
      collection(db, "Users"),
      where("email", "==", currentEmail)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      dispatch(
        setSnackbar({
          show: true,
          message: "Email not registered!",
          type: "error",
        })
      );
      return;
    }
    if (
      !currentEmailError &&
      !emails.includes(currentEmail) &&
      currentEmail !== auth.currentUser.email &&
      currentEmail.length > 0
    ) {
      setEmails((emails) => [...emails, currentEmail]);
    }
  }

  let emailsList = emails.map((email, id) => (
    <Button
      variant="contained"
      sx={{ mt: 3, mb: 2 }}
      style={{
        borderRadius: "20px",
        backgroundColor: "#2fb5be",
      }}
      key={id}
      onClick={() => removeEmail(id)}
    >
      {email}
    </Button>
  ));

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          variant="standard"
          required
          fullWidth
          id="email"
          value={currentEmail}
          onChange={(e) => {
            setCurrentEmail(e.target.value);
          }}
          error={!!currentEmailError}
          helperText={currentEmailError}
          label="Email Address"
          name="email"
          autoComplete="email"
        />
      </Grid>
      <Grid item xs={12}>
        <Button
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          style={{
            borderRadius: "20px",
            backgroundColor: "#2fb5be",
          }}
          onClick={() => {
            addEmail();
          }}
        >
          Add
        </Button>
      </Grid>
      <Grid item xs={12}>
        {emails ? emailsList : null}
      </Grid>
      {snackbar.show ? (
        <MySnackbar message={snackbar.message} type={snackbar.type} />
      ) : null}
    </Grid>
  );
}
