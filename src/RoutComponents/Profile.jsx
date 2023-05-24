import { useSelector } from "react-redux";
import MySnackbar from "./mySnackbar.jsx";
import { auth, db } from "../firebase.js";
import { getProfileValue, getSnackbar } from "../store/slices/userReducer.js";
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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Header from "./Header.jsx";

export default function Home() {
  const snackbar = useSelector(getSnackbar);
  const theme = createTheme();
  const [chats, setChats] = React.useState([]);
  const profileValue = useSelector(getProfileValue);

  React.useEffect(() => {
    (async function asyncFunc() {
      const chatSnap = await getDoc(doc(db, "Users", auth.currentUser.uid));
      const userChats = chatSnap.data().chats;
      userChats.forEach(async (id) => {
        const docSnap = await getDoc(doc(db, "Chats", id));
        const chat = {
          ...docSnap.data(),
          id: docSnap.id,
        };
        setChats([...chats, chat]);
      });
    })();
  }, [profileValue, chats]);

  const [navigateTo, setNavigateTo] = React.useState(null);

  React.useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);
  if (navigateTo) {
    return <Navigate replace to={`/${navigateTo.toLowerCase()}`} />;
  }
  let myChats;

  try {
    myChats = chats.map((el, id) => {
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
  } catch (err) {
    console.log(err);
  }
  try {
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
  } catch (err) {
    console.log(err);
  }
}
