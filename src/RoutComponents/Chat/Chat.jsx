import React from "react";
import Header from "../Header";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db, storage } from "../../firebase";
import {
  getSnackbar,
  getUser,
  setSnackbar,
} from "../../store/slices/userReducer";
import { useDispatch, useSelector } from "react-redux";
import MessagesSender from "./MessagesSender";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { deleteObject, ref } from "firebase/storage";
import MySnackbar from "../mySnackbar.jsx";
import Paper from "@mui/material/Paper";
import Draggable from "react-draggable";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

export default function Chat() {
  const userInfo = useSelector(getUser);
  const [chat, setChat] = React.useState({});
  const [chatId, setChatId] = React.useState("");
  const [chatMembers, setChatMembers] = React.useState([userInfo.email]);
  const [chatMembersDatas, setChatMembersDatas] = React.useState([userInfo]);
  const [messages, setMessages] = React.useState([]);
  const [messagesDatas, setMessagesDatas] = React.useState([]);
  const [emailError, setEmailError] = React.useState(null);
  const [editingMessage, setEditingMessage] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [dialogValue, setDialogValue] = React.useState("");
  const [dialogText, setDialogText] = React.useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (type) => {
    setOpen(false);
    if (type === "confirm") {
      if (
        dialogText ===
        "Enter the user's email address you want to add to this chat."
      ) {
        addMember();
      } else {
        removeMember();
      }
    }
    setDialogValue("");
    setDialogText("");
  };

  const snackbar = useSelector(getSnackbar);
  const dispatch = useDispatch();

  React.useEffect(() => {
    (async function asyncFunc() {
      const currentChatDocSnap = await getDoc(
        doc(db, "Users", auth.currentUser.uid)
      );
      const docSnap = await getDoc(
        doc(db, "Chats", currentChatDocSnap.data().currentChat)
      );
      setChat(docSnap.data());
      setChatId(docSnap.id);
      setChatMembers(docSnap.data().members);
      setMessages(docSnap.data().messages);
      onSnapshot(doc(db, "Chats", docSnap.id), (doc) => {
        const newMessages =
          doc.data().messages.toString() !== docSnap.data().messages.toString();
        const newUsers =
          doc.data().members.toString() !== docSnap.data().members.toString();
        if (newMessages) {
          setMessages(doc.data().messages);
        }
        if (newUsers) {
          setChatMembers(doc.data().members);
        }
      });
    })();
  }, []);

  const validateEmail = (email) => {
    if (email.length === 0) {
      setEmailError("Required");
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailError("Invalid email address");
    } else {
      setEmailError(null);
    }
  };

  async function addMember() {
    if (dialogValue.length === 0) {
      return;
    }
    validateEmail(dialogValue);
    const q = query(collection(db, "Users"), where("email", "==", dialogValue));
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
      !emailError &&
      !chatMembers.includes(dialogValue) &&
      dialogValue.length > 0
    ) {
      const oldMembers = (await getDoc(doc(db, "Chats", chatId))).data()
        .members;
      await updateDoc(doc(db, "Chats", chatId), {
        members: [...oldMembers, dialogValue],
      });
      const q = query(
        collection(db, "Users"),
        where("email", "==", dialogValue)
      );
      const querySnapshot = await getDocs(q);
      const newId = querySnapshot.docs[0].id;
      const oldChats = (await getDoc(doc(db, "Users", newId))).data().chats;
      await updateDoc(doc(db, "Users", newId), {
        chats: [...oldChats, chatId],
      });
    }
  }

  async function deleteMessage(id, type) {
    deleteDoc(doc(db, "Messages", id));
    if (type === "file") {
      deleteObject(ref(storage, `/files/${chatId}/${id}`));
    }
    const messagesDocSnap = await getDoc(doc(db, "Chats", chatId));
    let messages = messagesDocSnap.data().messages;
    const index = messages.indexOf(id);
    if (messages.length !== 1) {
      messages.splice(index, 1);
    } else {
      setMessages([]);
      messages = [];
    }
    await updateDoc(doc(db, "Chats", chatId), {
      messages,
    });
  }
  async function editMessage(a, message) {
    if (a === 1) {
      setEditingMessage(message.messageId);
    } else {
      await updateDoc(doc(db, "Messages", editingMessage), {
        text: message.text,
      });
      setEditingMessage(null);
    }
  }

  async function removeMember() {
    if (!chatMembers.includes(dialogValue)) {
      dispatch(
        setSnackbar({
          show: true,
          message: "User is not a member of the chat!",
          type: "error",
        })
      );
      return;
    }
    const membersDocSnap = await getDoc(doc(db, "Chats", chatId));
    const members = membersDocSnap.data().members;
    const index = members.indexOf(dialogValue);
    members.splice(index, 1);
    await updateDoc(doc(db, "Chats", chatId), {
      members,
    });
    const q = query(collection(db, "Users"), where("email", "==", dialogValue));
    const querySnapshot = await getDocs(q);
    const remId = querySnapshot.docs[0].id;
    const chatsDocSnap = await getDoc(doc(db, "Users", remId));
    const chats = chatsDocSnap.data().chats;
    const index1 = chats.indexOf(chatId);
    chats.splice(index1, 1);
    await updateDoc(doc(db, "Users", remId), {
      chats,
    });
  }

  async function addUserData(email) {
    let isNotIncluded = true;
    chatMembersDatas.forEach((user) => {
      if (user.email === email) {
        isNotIncluded = false;
      }
    });
    if (isNotIncluded) {
      const q = query(collection(db, "Users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        const userInfo1 = {
          nickname: "User Not Found",
          email,
        };
        setChatMembersDatas([...chatMembersDatas, userInfo1]);
        return;
      }
      const id = querySnapshot.docs[0].id;
      const userInfo1 = await getDoc(doc(db, "Users", id));
      if (email !== userInfo.email) {
        setChatMembersDatas([
          ...chatMembersDatas,
          { ...userInfo1.data(), id: userInfo1.id },
        ]);
      }
    }
  }

  function renderRow(index) {
    addUserData(chatMembers[index]);
    let currentUserInfo = null;
    chatMembersDatas.forEach((member) => {
      if (member?.email === chatMembers[index]) {
        currentUserInfo = member;
      }
    });
    if (!currentUserInfo) {
      return;
    }
    return (
      <ListItem
        style={{ marginTop: "10px" }}
        key={index}
        component="div"
        disablePadding
      >
        <div
          style={{
            marginRight: "20px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" noWrap>
            {currentUserInfo.nickname}
          </Typography>
          <Typography variant="h9" noWrap>
            {currentUserInfo.email}
          </Typography>
        </div>
        <Avatar
          style={{ width: "50px", height: "50px" }}
          alt={currentUserInfo.nickname}
          src={currentUserInfo.avatar}
        />
      </ListItem>
    );
  }

  async function addMessageData(messageId) {
    let isNotIncluded = true;
    messagesDatas.forEach((message) => {
      if (message?.id === messageId) {
        isNotIncluded = false;
      }
    });
    if (!isNotIncluded) {
      return;
    }
    const docSnap = await getDoc(doc(db, "Messages", messageId));
    const messageInfo = { ...docSnap.data(), messageId };
    if (!messageInfo) {
      const messageInfo1 = {
        text: "Message Not Found",
        dateTime: "Not Found",
        author: "Not Found",
        id: messageId,
      };
      setMessagesDatas([...messagesDatas, messageInfo1]);
    } else {
      const currentUserInfo = (
        await getDoc(doc(db, "Users", messageInfo.author))
      ).data();
      messageInfo.author = currentUserInfo.nickname;
      messageInfo.id = messageId;
      onSnapshot(doc(db, "Messages", messageId), (doc) => {
        if (
          doc.data()?.text !== messageInfo?.text ||
          doc.data()?.url !== messageInfo?.url
        ) {
          setMessagesDatas([...messagesDatas, doc.data()]);
        }
      });
      setMessagesDatas([...messagesDatas, messageInfo]);
    }
  }

  function renderRowMessages(index) {
    addMessageData(messages[index]);
    let currentMessage = null;
    messagesDatas.forEach((message) => {
      if (message?.messageId === messages[index]) {
        currentMessage = message;
      }
    });
    if (!currentMessage) {
      return;
    }
    if (currentMessage.type === "file") {
      return renderRowFile(currentMessage);
    }
    let isMine = false;
    if (currentMessage.author === userInfo.nickname) {
      isMine = true;
    }
    return (
      <ListItem
        style={{
          marginTop: "10px",
        }}
        key={index}
        component="div"
        disablePadding
      >
        <div
          style={{
            marginRight: "20px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            color: "black",
            borderRadius: "20px",
            padding: "10px",
          }}
        >
          <Typography variant="h9" noWrap>
            {currentMessage.author}
          </Typography>
          {editingMessage === currentMessage.messageId ? (
            <input
              style={{
                fontSize: "16px",
                border: "none",
                borderRadius: "20px",
                backgroundColor: "#2FB5BD",
                color: "#FAFAFA",
                padding: "8px 40px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                transition: "box-shadow 0.3s ease-in-out",
                marginRight: "110px",
              }}
              type="text"
              value={currentMessage.text}
              onChange={(e) => {
                const index1 = index === 0 ? 1 : index;
                setMessagesDatas([
                  ...messagesDatas.splice(0, index),
                  {
                    ...currentMessage,
                    text: e.target.value,
                  },
                  ...messagesDatas.splice(index1),
                ]);
              }}
              autoFocus
            />
          ) : (
            <Typography
              variant="h6"
              noWrap
              style={{
                fontStyle: currentMessage.italic ? "italic" : "inherit",
              }}
            >
              {currentMessage.text}
            </Typography>
          )}
          <Typography variant="h9" noWrap>
            {currentMessage.dateTime}
          </Typography>
          {isMine ? (
            <div>
              <Button
                type="submit"
                variant="contained"
                sx={{ mt: 1, mr: 1 }}
                style={{
                  borderRadius: "20px",
                  backgroundColor: "#2fb5be",
                  color: "white",
                  marginLeft: "10px",
                }}
                onClick={() => deleteMessage(currentMessage.messageId)}
              >
                <DeleteIcon />
              </Button>
              {editingMessage === currentMessage.messageId ? (
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 1, mr: 1 }}
                  style={{
                    borderRadius: "20px",
                    backgroundColor: "#2fb5be",
                    color: "white",
                    marginLeft: "10px",
                  }}
                  onClick={() => editMessage(2, currentMessage)}
                >
                  <SaveIcon />
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 1, mr: 1 }}
                  style={{
                    borderRadius: "20px",
                    backgroundColor: "#2fb5be",
                    color: "white",
                    marginLeft: "10px",
                  }}
                  onClick={() => editMessage(1, currentMessage)}
                >
                  <EditIcon />
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </ListItem>
    );
  }

  function renderRowFile(currentMessage) {
    let isMine = false;
    if (currentMessage?.author === userInfo?.nickname) {
      isMine = true;
    }
    return (
      <ListItem
        style={{
          marginTop: "10px",
        }}
        component="div"
        disablePadding
      >
        <div
          style={{
            marginRight: "20px",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "white",
            color: "black",
            borderRadius: "20px",
            padding: "10px",
          }}
        >
          <Typography variant="h9" noWrap>
            {currentMessage?.author}
          </Typography>
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 1, mr: 1, mb: 1 }}
            style={{
              borderRadius: "20px",
              backgroundColor: "#2fb5be",
              color: "white",
              marginLeft: "10px",
            }}
          >
            <a
              href={currentMessage?.url}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: "none", color: "black" }}
            >
              <Typography variant="h9" noWrap>
                {currentMessage?.fileName}
              </Typography>
            </a>
          </Button>
          <Typography variant="h9" noWrap>
            {currentMessage?.dateTime}
          </Typography>
          {isMine ? (
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 1, mr: 1 }}
              style={{
                borderRadius: "20px",
                backgroundColor: "#2fb5be",
                color: "white",
                marginLeft: "10px",
              }}
              onClick={() => deleteMessage(currentMessage.messageId, "file")}
            >
              <DeleteIcon />
            </Button>
          ) : null}
        </div>
      </ListItem>
    );
  }

  const shownMessages = [];
  for (let i = 0; i < messages.length; i++) {
    const shownMessage = renderRowMessages(i);
    shownMessages.push(shownMessage);
  }

  const shownUsers = [];
  for (let i = 0; i < chatMembers.length; i++) {
    const showUser = renderRow(i);
    shownUsers.push(showUser);
  }

  return (
    <div>
      <Header
        settings={["Profile", "Log out"]}
        headerName={chat.name}
        headerLogo={chat.logo}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 400,
            maxWidth: 360,
            margin: "20px",
            border: "1px inset black",
            backgroundColor: "#2fb5be",
            borderRadius: "20px",
            color: "white",
            paddingLeft: "20px",
            paddingBottom: "20px",
          }}
        >
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2, ml: "auto" }}
            style={{
              borderRadius: "20px",
              backgroundColor: "white",
              color: "black",
            }}
            onClick={() => {
              setDialogText(
                "Enter the user's email address you want to add to this chat."
              );
              handleClickOpen();
            }}
          >
            Add
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2, ml: "auto" }}
            style={{
              borderRadius: "20px",
              backgroundColor: "white",
              color: "black",
              marginLeft: "10px",
            }}
            onClick={() => {
              setDialogText(
                "Enter the user's email address you want to remove from this chat."
              );
              handleClickOpen();
            }}
          >
            Remove
          </Button>
          {shownUsers}
        </Box>
        <Box
          sx={{
            width: "100%",
            minHeight: 400,
            maxWidth: 600,
            margin: "20px",
            border: "1px inset black",
            backgroundColor: "#2fb5be",
            borderRadius: "20px",
            color: "white",
            padding: "20px",
          }}
        >
          {shownMessages}
        </Box>
      </div>
      <div style={{ position: "fixed", bottom: 0 }}>
        <MessagesSender chat={chatId} />
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle>Manage chat members</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogText}</DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            value={dialogValue}
            onChange={(e) => setDialogValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose("cancel")}>Cancel</Button>
          <Button onClick={() => handleClose("confirm")}>
            {dialogText ===
            "Enter the user's email address you want to add to this chat."
              ? "Add"
              : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>
      {snackbar.show ? (
        <MySnackbar message={snackbar.message} type={snackbar.type} />
      ) : null}
    </div>
  );
}
