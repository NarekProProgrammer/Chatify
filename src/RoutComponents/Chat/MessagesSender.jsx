import * as React from "react";
import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Textarea from "@mui/joy/Textarea";
import IconButton from "@mui/joy/IconButton";
import Menu from "@mui/joy/Menu";
import MenuItem from "@mui/joy/MenuItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import FormatBold from "@mui/icons-material/FormatBold";
import FormatItalic from "@mui/icons-material/FormatItalic";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import Check from "@mui/icons-material/Check";
import { TextField } from "@mui/material";
import { auth, db, storage } from "../../firebase";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentChat, setImgLink } from "../../store/slices/userReducer";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export default function MessagesSender() {
  const [italic, setItalic] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [messageError, setMessageError] = React.useState(null);
  const storeChatId = useSelector(getCurrentChat);
  const [chatId, setChatId] = React.useState(storeChatId);

  React.useEffect(() => {
    (async function asyncFunc() {
      const currentChatDocSnap = await getDoc(
        doc(db, "Users", auth.currentUser.uid)
      );
      setChatId(currentChatDocSnap.data().currentChat);
    })();
  }, []);

  const validateMessage = () => {
    if (message.length === 0) {
      setMessageError("Required");
    } else {
      setMessageError(null);
    }
  };

  async function sendMessage() {
    validateMessage();
    if (messageError) {
      return;
    }
    const date = new Date();
    let dateTime = `${date.getDate()} ${date.getMonth()} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    const docSnap = await addDoc(collection(db, "Messages"), {
      text: message,
      italic: italic,
      dateTime,
      author: auth.currentUser.uid,
      type: "text",
    });
    const oldMessages = (await getDoc(doc(db, "Chats", chatId))).data()
      .messages;
    await updateDoc(doc(db, "Chats", chatId), {
      messages: [docSnap.id, ...oldMessages],
    });
  }

  const handleChange = async (event) => {
    const file = event.target.files[0],
      fileName = event.target.files[0].name;
    if (fileName === "") {
      return;
    }
    const date = new Date();
    let dateTime = `${date.getDate()} ${date.getMonth()} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
    const docSnap = await addDoc(collection(db, "Messages"), {
      dateTime,
      author: auth.currentUser.uid,
      type: "file",
    });
    const oldMessages = (await getDoc(doc(db, "Chats", chatId))).data()
      .messages;
    await updateDoc(doc(db, "Chats", chatId), {
      messages: [docSnap.id, ...oldMessages],
    });
    const storageRef = ref(storage, `/files/${chatId}/${docSnap.id}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          await updateDoc(doc(db, "Messages", docSnap.id), {
            url,
            fileName,
          });
          await updateDoc(doc(db, "Chat", chatId), {
            reloadV: Math.random(),
          });
        });
      }
    );
  };

  return (
    <FormControl
      style={{
        margin: "20px",
        border: "1px inset black",
        backgroundColor: "#2fb5be",
        color: "white",
        width: "500px",
      }}
    >
      <TextField
        variant="standard"
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        error={!!messageError}
        helperText={messageError}
        autoFocus
        sx={{
          maxWidth: 500,
        }}
        multiline
        style={{
          margin: "10px",
          fontStyle: italic ? "italic" : "initial",
        }}
      />
      <Box
        sx={{
          display: "flex",
          gap: "var(--Textarea-paddingBlock)",
          pt: "var(--Textarea-paddingBlock)",
          flex: "auto",
          marginRight: "10px",
        }}
      >
        <IconButton
          variant={italic ? "soft" : "plain"}
          color={italic ? "primary" : "neutral"}
          aria-pressed={italic}
          onClick={() => setItalic((bool) => !bool)}
        >
          <FormatItalic />
        </IconButton>
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 3, mb: 2, ml: "auto" }}
          style={{
            borderRadius: "20px",
            backgroundColor: "white",
          }}
          onClick={sendMessage}
        >
          Send
        </Button>
        <Button
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          style={{
            borderRadius: "20px",
            backgroundColor: "white",
            marginLeft: "10px",
          }}
        >
          <label>
            <input type="file" onChange={handleChange} />
            Send a file
          </label>
        </Button>
      </Box>
    </FormControl>
  );
}
