import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import BasicInfo from "./BasicInfo";
import Members from "./Members";
import Header from "../Header";
import {
  addChat,
  getUser,
  setCurrentChat,
  updateUserData,
} from "../../store/slices/userReducer";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

const steps = ["Name and Logo", "Members"];

const theme = createTheme();

export default function Checkout() {
  const dispatch = useDispatch();
  const userInfo = useSelector(getUser);

  const [activeStep, setActiveStep] = React.useState(0);
  const [name, setName] = React.useState("Chat");
  const [file, setFile] = React.useState(null);
  const [fileName, setFileName] = React.useState("Chat logo");
  const [currentEmail, setCurrentEmail] = React.useState("");
  const [currentEmailError, setCurrentEmailError] = React.useState(null);
  const [emails, setEmails] = React.useState([]);
  const [navigateTo, setNavigateTo] = React.useState(null);
  let uid = "";

  async function createChat() {
    emails.forEach(async (member, id) => {
      const q = query(collection(db, "Users"), where("email", "==", member));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        setEmails([...emails.slice(0, id), ...emails.slice(id + 1)]);
      }
    });
    const docRef = await addDoc(collection(db, "Chats"), {
      name: name,
      members: [userInfo.email, ...emails],
      messages: [],
    });
    uid = docRef.id;
    const oldChats = (
      await getDoc(doc(db, "Users", auth.currentUser.uid))
    ).data().chats;
    await updateDoc(doc(db, "Users", auth.currentUser.uid), {
      chats: [...oldChats, uid],
    });
    emails.forEach(async (member) => {
      const q = query(collection(db, "Users"), where("email", "==", member));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        return;
      } else {
        member = querySnapshot.docs[0].id;
      }
      const oldChats = (await getDoc(doc(db, "Users", member))).data().chats;
      await updateDoc(doc(db, "Users", member), {
        chats: [...oldChats, uid],
      });
    });
    dispatch(addChat(uid));
    dispatch(setCurrentChat(uid));

    if (!file) {
      return;
    }

    const storageRef = ref(storage, `/logos/${uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          await updateDoc(doc(db, "Chats", uid), {
            logo: url,
          });
        });
      }
    );
  }

  function navigateToChat() {
    setNavigateTo("chat");
  }

  function removeEmail(id) {
    setEmails([...emails.slice(0, id), ...emails.slice(id + 1)]);
  }

  function getStepContent(step) {
    switch (step) {
      case 0:
        return (
          <BasicInfo
            name={name}
            setName={setName}
            setFile={setFile}
            fileName={fileName}
            setFileName={setFileName}
          />
        );
      case 1:
        return (
          <Members
            currentEmail={currentEmail}
            setCurrentEmail={setCurrentEmail}
            currentEmailError={currentEmailError}
            validateEmail={validateEmail}
            emails={emails}
            setEmails={setEmails}
            removeEmail={removeEmail}
          />
        );
      default:
        throw new Error("Unknown step");
    }
  }

  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const validateEmail = () => {
    if (currentEmail.length === 0) {
      setCurrentEmailError("Required");
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(currentEmail)) {
      setCurrentEmailError("Invalid email address");
    } else {
      setCurrentEmailError(null);
    }
  };

  if (navigateTo) {
    return <Navigate replace to={`/${navigateTo.toLowerCase()}`} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Header settings={["Profile"]} headerName="New chat" />
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper
          style={{
            backgroundColor: "white",
            borderRadius: "20px",
          }}
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h4" align="center">
            New chat
          </Typography>
          <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ? (
            <React.Fragment>
              <Typography variant="h5" gutterBottom>
                Press {name} to create it and to to be redirected
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                style={{
                  borderRadius: "20px",
                  backgroundColor: "#2fb5be",
                }}
                onClick={navigateToChat}
              >
                {name}
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {getStepContent(activeStep)}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                {activeStep !== 0 && (
                  <Button
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    style={{
                      borderRadius: "20px",
                      backgroundColor: "#2fb5be",
                      marginRight: "10px",
                    }}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
                <Button
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  style={{
                    borderRadius: "20px",
                    backgroundColor: "#2fb5be",
                  }}
                  onClick={() => {
                    if (activeStep === 0) {
                      if (name === "") {
                        setName("Chat");
                      }
                    }
                    if (activeStep === 1) {
                      createChat();
                    }
                    handleNext();
                  }}
                >
                  {activeStep === steps.length - 1 ? "Create" : "Next"}
                </Button>
              </Box>
            </React.Fragment>
          )}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
