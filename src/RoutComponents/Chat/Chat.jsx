import React, { useReducer } from "react";
import Header from "../Header";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { getCurrentChat, getUser } from "../../store/slices/userReducer";
import { useSelector } from "react-redux";
import MessagesSender from "./MessagesSender";
import { Avatar, Box, ListItem, Typography } from "@mui/material";
import { FixedSizeList } from "react-window";

export default function Chat() {
  const userInfo = useSelector(getUser);
  const [chat, setChat] = React.useState({});
  const [chatId, setChatId] = React.useState("");
  const [chatMembers, setChatMembers] = React.useState([userInfo.email]);
  const [chatMembersDatas, setChatMembersDatas] = React.useState([userInfo]);
  const [messages, setMessages] = React.useState([]);
  const [messagesDatas, setMessagesDatas] = React.useState([]);
  const [reloadV, setReloadV] = React.useState(0);

  async function getUserByEmail(email) {
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
      const unsub = onSnapshot(doc(db, "Chats", docSnap.id), (doc) => {
        if (
          doc.data().messages.toString() !== docSnap.data().messages.toString()
        ) {
          setReloadV(reloadV + 1);
        }
      });
      setChatMembers(docSnap.data().members);
      setMessages(docSnap.data().messages);
    })();
  }, [reloadV]);
  React.useEffect(() => {
    chatMembers.forEach((email) => {
      getUserByEmail(email);
    });
  }, [chatMembers]);
  React.useEffect(() => {
    const currentMessagesDatas = [];
    messages.forEach((messageId) => {
      (async function asyncFunc() {
        const messageInfo = (
          await getDoc(doc(db, "Messages", messageId))
        ).data();
        if (!messageInfo) {
          const messageInfo1 = {
            text: "Message Not Found",
            dateTime: "Not Found",
            author: "Not Found",
          };
          currentMessagesDatas.push(messageInfo1);
          return;
        }
        const currentUserInfo = (
          await getDoc(doc(db, "Users", messageInfo.author))
        ).data();
        messageInfo.author = currentUserInfo.nickname;
        currentMessagesDatas.push(messageInfo);
      })();
    });
    setMessagesDatas(currentMessagesDatas);
  }, [messages]);

  function renderRow(props) {
    let { index, style } = props;
    let currentUserInfo = chatMembersDatas[index];
    if (!currentUserInfo) {
      return "Loading...";
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

  function renderRowMessages(props) {
    let { index, style } = props;
    const currentMessage = messagesDatas[index];
    if (!currentMessage) {
      return "Loading...";
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
            backgroundColor: "white",
            color: "black",
            borderRadius: "20px",
            padding: "10px",
          }}
        >
          <Typography variant="h9" noWrap>
            {currentMessage.author}
          </Typography>
          <Typography
            variant="h6"
            noWrap
            style={{ fontStyle: currentMessage.italic ? "italic" : "inherit" }}
          >
            {currentMessage.text}
          </Typography>
          <Typography variant="h9" noWrap>
            {currentMessage.dateTime}
          </Typography>
        </div>
      </ListItem>
    );
  }

  return (
    <div>
      <Header
        settings={["Profile", "Log out"]}
        headerName={chat.name}
        headerLogo={chat.logo}
      />
      <div style={{ display: "flex", flexDirection: "row" }}>
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
          }}
        >
          <FixedSizeList
            height={400}
            width={340}
            itemSize={46}
            itemCount={chatMembers.length}
            overscanCount={5}
            style={{ marginLeft: "20px" }}
          >
            {renderRow}
          </FixedSizeList>
        </Box>
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
          }}
        >
          <FixedSizeList
            height={400}
            width={340}
            itemSize={46}
            itemCount={messages.length}
            overscanCount={5}
            style={{ marginLeft: "20px" }}
          >
            {renderRowMessages}
          </FixedSizeList>
        </Box>
      </div>
      <hr />
      <MessagesSender chat={chatId} />
    </div>
  );
}
