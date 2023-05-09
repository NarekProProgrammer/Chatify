import React from "react";
import "./Profile.css";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { doc, updateDoc } from "firebase/firestore";
import { app, db, storage } from "../../firebase";
import { getUser, setImgLink } from "../../store/slices/userReducer";
import { updateUserData } from "../../store/slices/userReducer";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { Button } from "@mui/material";
import { getAuth, updateEmail, updatePassword } from "firebase/auth";

const Profile = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector(getUser);

  const [editingFirstName, setEditingFirstName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [firstName, setFirstName] = useState(userInfo.nickname);
  const [phone, setPhone] = useState(userInfo.phone);
  const [email, setEmail] = useState(userInfo.email);
  const [password, setPassword] = useState(userInfo.password);
  const [file, setFile] = React.useState("");
  const [fileName, setFileName] = React.useState("Profile picture");
  const auth = getAuth(app);
  const uid = auth.currentUser.uid;

  const handleChange = (event) => {
    if (event.target.files[0] && event.target.files[0].type.includes("image")) {
      setFile(event.target.files[0]);
      setFileName(event.target.files[0].name);
    }
  };

  function handleUpload() {
    if (!file) {
      console.log(file);
      alert("Please choose a file first!");
    }

    const storageRef = ref(storage, `/avatars/${uid}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      () => {},
      (err) => console.log(err),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (url) => {
          dispatch(setImgLink(url));
          await updateDoc(doc(db, "Users", uid), {
            avatar: url,
          });
        });
      }
    );
  }

  async function onNickNameSave() {
    await updateDoc(doc(db, "Users", uid), {
      nickname: userInfo.nickname,
    });
  }
  async function onPhoneSave() {
    await updateDoc(doc(db, "Users", uid), {
      phone: userInfo.phone,
    });
  }
  async function onEmailSave() {
    await updateDoc(doc(db, "Users", uid), {
      email: userInfo.email,
    });
    updateEmail(auth.currentUser, email);
  }
  async function onPasswordSave() {
    await updateDoc(doc(db, "Users", uid), {
      password: userInfo.password,
    });
    updatePassword(auth.currentUser, password);
  }

  const onChangeFirstName = async (e) => {
    dispatch(updateUserData({ field: "nickname", value: e.target.value }));
  };
  const onChangePhone = async (e) => {
    dispatch(updateUserData({ field: "phone", value: e.target.value }));
  };
  const onChangeEmail = async (e) => {
    dispatch(updateUserData({ field: "email", value: e.target.value }));
  };
  const onChangePassword = async (e) => {
    dispatch(updateUserData({ field: "password", value: e.target.value }));
  };

  return (
    <div className="main-settings-containter">
      <div className="profile-card">
        <div className="photo-card">
          <img src={userInfo.avatar} alt="avatar" />
          <div className="profile-card-info">
            <h4>{userInfo.nickname}</h4>
          </div>
        </div>
        <div className="avatarChange">
          <label className="profile-photo-upload">
            <input type="file" onChange={handleChange} accept="/image/*" />
            <i className="fa fa-cloud-upload">{fileName}</i>
            <hr />
            <Button
              onClick={handleUpload}
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              style={{
                borderRadius: "20px",
                backgroundColor: "#2fb5be",
              }}
            >
              Upload
            </Button>
          </label>
        </div>
      </div>
      <div className="all-info-column">
        {/* Basic Information */}
        <h3 className="title-table-info">Basic Information</h3>
        <div className="basic-info-column">
          <div className="info-item">
            <p className="info-title">Nickname</p>
            {editingFirstName ? (
              <div>
                <input
                  className="input input-editName"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    onChangeFirstName(e);
                  }}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    onNickNameSave();
                    setEditingFirstName(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div className="">
                <p className="user-info">{firstName}</p>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setEditingFirstName(true);
                  }}
                >
                  <img src="/icon-edit.png" />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Contact Information */}
        <h3 className="title-table-info">Contact Information</h3>
        <div className="basic-info-column">
          <div className="info-item">
            <p className="info-title">Phone</p>
            {editingPhone ? (
              <div>
                <input
                  className="input input-editName"
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    onChangePhone(e);
                  }}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    onPhoneSave();
                    setEditingPhone(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div className="">
                <p className="user-info">{phone}</p>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setEditingPhone(true);
                  }}
                >
                  <img src="/icon-edit.png" />
                </button>
              </div>
            )}
          </div>
          <div className="info-item">
            <p className="info-title">Email</p>
            {editingEmail ? (
              <div>
                <input
                  className="input input-editName"
                  type="text"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    onChangeEmail(e);
                  }}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    onEmailSave();
                    setEditingEmail(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div className="">
                <p className="user-info">{email}</p>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setEditingEmail(true);
                  }}
                >
                  <img src="/icon-edit.png" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <h3 className="title-table-info">Security</h3>
        <div className="personal-info-column">
          <div className="info-item">
            <p className="info-title">Password</p>
            {editingPassword ? (
              <div>
                <input
                  className="input input-editName"
                  type="text"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    onChangePassword(e);
                  }}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    onPasswordSave();
                    setEditingPassword(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div className="">
                <p className="user-info">{password}</p>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setEditingPassword(true);
                  }}
                >
                  <img src="/icon-edit.png" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
