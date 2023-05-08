import React from "react";
import "./Profile.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSetting } from "../../store/slices/userReducer";

const Profile = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.user);

  const [editingFirstName, setEditingFirstName] = useState(false);
  const [editingLastName, setEditingLastName] = useState(false);
  const [editingDateOfBirth, setEditingDateOfBirth] = useState(false);
  const [editingFloor, setEditingFloor] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);

  const onClickEditName = (e) => {
    dispatch(updateSetting({ field: "firstName", value: e.target.value }));
  };
  const onClickEditLastName = (e) => {
    dispatch(updateSetting({ field: "lastName", value: e.target.value }));
  };
  const onClickEditDateOfBirth = (e) => {};
  const onClickEditFloor = (e) => {
    dispatch(updateSetting({ field: "floor", value: e.target.value }));
  };
  const onClickEditEmail = (e) => {
    dispatch(updateSetting({ field: "email", value: e.target.value }));
  };
  const onClickEditPassword = (e) => {
    dispatch(updateSetting({ field: "password", value: e.target.value }));
  };

  const [avatarUrl, setAvatarUrl] = useState("/avatar.png");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setAvatarUrl(reader.result);
    };
  };

  return (
    <div className="main-settings-containter">
      <div className="profile-card">
        <div className="photo-card">
          {/* <img src="/avatar.png" alt="Avataaar" /> */}
          <img src={avatarUrl} alt="avatar" />
          <div class="profile-card-info">
            <h4>{`${userInfo.firstName} ${userInfo.lastName}`}</h4>
          </div>
        </div>
        <div>
          {/* <input className="profile-photo-upload" type="file" onChange={handleFileUpload} /> */}
          <label class="profile-photo-upload">
            <input type="file" onChange={handleFileUpload} />
            <i class="fa fa-cloud-upload"></i> Change profile photo
          </label>
        </div>
      </div>
      <div className="all-info-column">
        {/* Basic Information */}
        <h3 className="title-table-info">Basic Information</h3>
        <div className="basic-info-column">
          <div className="info-item">
            <p className="info-title">First Name</p>
            {editingFirstName ? (
              <div>
                <input
                  className="input input-editName"
                  type="text"
                  value={userInfo.firstName}
                  onChange={onClickEditName}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    setEditingFirstName(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div className="">
                <p className="user-info">{userInfo.firstName}</p>
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
          <div className="info-item">
            <p className="info-title">Last Name</p>
            {editingLastName ? (
              <div>
                <input
                  className="input input-editName"
                  type="text"
                  value={userInfo.lastName}
                  onChange={onClickEditLastName}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    setEditingLastName(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div>
                <p className="user-info">{userInfo.lastName}</p>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setEditingLastName(true);
                  }}
                >
                  <img src="/icon-edit.png" />
                </button>
              </div>
            )}
          </div>
          <div className="info-item">
            <p className="info-title">Date of Birth</p>
            {editingDateOfBirth ? (
              <div>
                <input
                  className="input input-editDateOfBirth"
                  type="text"
                  value={userInfo.dateOfBirth}
                  onChange={onClickEditDateOfBirth}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    setEditingDateOfBirth(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div>
                <p className="user-info">{userInfo.dateOfBirth}</p>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setEditingDateOfBirth(true);
                  }}
                >
                  <img src="/icon-edit.png" />
                </button>
              </div>
            )}
          </div>
          <div className="info-item">
            <p className="info-title">Floor</p>
            {editingFloor ? (
              <div>
                {/* <input className="input input-editDateOfBirth" type="text" value={userInfo.dateOfBirth} onChange={onClickEditDateOfBirth} /> */}
                <select
                  name="floor"
                  id="floor"
                  value={userInfo.floor}
                  onChange={onClickEditFloor}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <button
                  className="btn btn-save"
                  onClick={() => {
                    setEditingFloor(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div>
                <p className="user-info">{userInfo.floor}</p>
                <button
                  className="btn btn-edit"
                  onClick={() => {
                    setEditingFloor(true);
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
        <div className="contact-info-column">
          <div className="info-item">
            <p className="info-title">Adress</p>
            <p className="user-info">{userInfo.adress}</p>
          </div>
          <div className="info-item">
            <p className="info-title">Phone</p>
            <p className="user-info">{userInfo.phone}</p>
          </div>
        </div>

        {/* Personal Information */}
        <h3 className="title-table-info">Personal Information</h3>
        <div className="personal-info-column">
          <div className="info-item">
            <p className="info-title">Email</p>
            {editingEmail ? (
              <div>
                <input
                  className="input input-editEmail"
                  type="text"
                  value={userInfo.email}
                  onChange={onClickEditEmail}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    setEditingEmail(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div>
                <p className="user-info">{userInfo.email}</p>
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
          <div className="info-item">
            <p className="info-title">Password</p>
            {editingPassword ? (
              <div>
                <input
                  className="input input-editPassword"
                  type="password"
                  value={userInfo.password}
                  onChange={onClickEditPassword}
                />
                <button
                  className="btn btn-save"
                  onClick={() => {
                    setEditingPassword(false);
                  }}
                >
                  <img src="/icon-save.png" />
                </button>
              </div>
            ) : (
              <div>
                <p className="user-info">{userInfo.password}</p>
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
