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
import { auth, db } from "../../firebase";
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { getCurrentChat } from "../../store/slices/userReducer";

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
    });
    const oldMessages = (await getDoc(doc(db, "Chats", chatId))).data()
      .messages;
    await updateDoc(doc(db, "Chats", chatId), {
      messages: [...oldMessages, docSnap.id],
    });
  }

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
      </Box>
    </FormControl>
  );
}
