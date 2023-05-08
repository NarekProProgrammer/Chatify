import { createSlice } from "@reduxjs/toolkit";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const userReducer = createSlice({
  name: "user",
  initialState: {
    firstName: "Max",
    lastName: "Karpov",
    dateOfBirth: "16 February",
    floor: "male",
    email: "maxkarpov@gmail.com",
    password: "123asd",
    phone: 123456,
    adress: "St. Pushkin",
    userData: {},
    isLoggedIn: false,
    remember: false,
    imgLink: "",
    snackbar: {
      show: false,
      type: "",
      message: "",
    },
    isAuthenticating: true,
  },

  reducers: {
    updateUserData(state, action) {
      const { field, value } = action.payload;
      state.userData[field] = value;
    },
    setUser: (state, action) => {
      state.userData = action.payload;
    },
    setLog: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setImgLink: (state, action) => {
      state.imgLink = action.payload;
      updateDoc(doc(db, "Users", state.userData.uid), {
        avatar: action.payload,
      });
    },
    setSnackbar: (state, action) => {
      state.snackbar = action.payload;
    },
    setRem: (state, action) => {
      state.remember = action.payload;
    },
    setIsAuthenticating: (state, action) => {
      state.isAuthenticating = false;
    },
  },
});

export default userReducer.reducer;

export const {
  updateSetting,
  setUser,
  setLog,
  setRem,
  setImgLink,
  setSnackbar,
  setIsAuthenticating,
  updateUserData,
} = userReducer.actions;

export const getUser = (state) => state.user.userData;
export const getLog = (state) => state.user.isLoggedIn;
export const getRem = (state) => state.user.remember;
export const getImgLink = (state) => state.user.imgLink;
export const getSnackbar = (state) => state.user.snackbar;
export const getIsAuthenticating = (state) => state.user.isAuthenticating;
