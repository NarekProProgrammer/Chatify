import { useSelector, useDispatch } from "react-redux";
import MySnackbar from "./mySnackbar.jsx";
import { auth, db } from "../firebase.js";
import {
  getNavigatedToProfile,
  getProfileValue,
  getSnackbar,
  getUser,
  getUserChats,
  setCurrentChat,
  setNavigatedToProfile,
  setUserChats,
} from "../store/slices/userReducer.js";
import * as React from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import { Navigate } from "react-router-dom";
import {
  CssBaseline,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Header from "./Header.jsx";

export default function Home() {
  const snackbar = useSelector(getSnackbar);
  const dispatch = useDispatch();
  const theme = createTheme();
  const userInfo = useSelector(getUser);
  const [chats, setChats] = React.useState([]);
  const profileValue = useSelector(getProfileValue);

  React.useEffect(() => {
    (async function asyncFunc() {
      const currentChats = [];
      userInfo.chats.forEach(async (id) => {
        const docSnap = await getDoc(doc(db, "Chats", id));
        const chat = {
          ...docSnap.data(),
          id: docSnap.id,
        };
        setChats((oldChats) => [...oldChats, chat]);
      });
    })();
  }, [profileValue]);

  const [navigateTo, setNavigateTo] = React.useState(null);

  React.useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);
  if (navigateTo) {
    return <Navigate replace to={`/${navigateTo.toLowerCase()}`} />;
  }

  const myChats = chats.map((el, id) => {
    return (
      <ListItem
        key={id}
        disablePadding
        onClick={async () => {
          await updateDoc(doc(db, "Users", auth.currentUser.uid), {
            currentChat: el.id,
          });
          setNavigateTo("chat");
        }}
      >
        <ListItemButton>
          {el.logo ? (
            <ListItemIcon>
              <Avatar
                style={{ width: "40px", height: "40px" }}
                alt={el.name}
                src={el.logo}
              />
            </ListItemIcon>
          ) : null}
          <ListItemText primary={el.name} />
        </ListItemButton>
      </ListItem>
    );
  });
  return (
    <div>
      <Header
        settings={["New chat", "Settings", "Log out"]}
        headerName="Profile"
      />
      <ThemeProvider theme={theme}>
        <Container
          component="main"
          maxWidth="xs"
          style={{
            color: "white",
            marginTop: "200px",
            width: "25%",
            backgroundColor: "#2fb5be",
            borderRadius: "20px",
          }}
        >
          <CssBaseline />
          <Box>
            <List>{myChats}</List>
          </Box>
        </Container>
      </ThemeProvider>
      {snackbar.show ? (
        <MySnackbar message={snackbar.message} type={snackbar.type} />
      ) : null}
    </div>
  );
}
