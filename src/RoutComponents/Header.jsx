import {
  AppBar,
  Avatar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { signOut } from "firebase/auth";
import React from "react";
import {
  getImgLink,
  getUser,
  setNavigatedToProfile,
  setProfileValue,
  setSnackbar,
} from "../store/slices/userReducer";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { auth } from "../firebase";

export default function Header({ settings, headerName, headerLogo }) {
  const dispatch = useDispatch();
  const user = useSelector(getUser);
  const email = user?.email;
  const nickname = user?.nickname;
  const avatar = useSelector(getUser).avatar;

  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [navigateTo, setNavigateTo] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const menuBtnClicked = (setting) => {
    switch (setting) {
      case "Profile":
        dispatch(setProfileValue());
        setNavigateTo(setting);
        break;
      case "Settings":
        setNavigateTo(setting);
        break;
      case "Log out":
        signOutManually();
        break;
      case "New chat":
        setNavigateTo("newChat");
        break;
      default:
        break;
    }
  };

  function signOutManually() {
    signOut(auth)
      .then(() => {
        dispatch(
          setSnackbar({
            show: true,
            message: "Signed out successfully!",
            type: "success",
          })
        );
      })
      .catch((error) => {
        dispatch(
          setSnackbar({
            show: true,
            message: "An error occurred while signing out!",
            type: "error",
          })
        );
      });
  }

  React.useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);
  if (navigateTo) {
    return <Navigate replace to={`/${navigateTo.toLowerCase()}`} />;
  }

  return (
    <div>
      <AppBar position="static" style={{ backgroundColor: "#2fb5be" }}>
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Typography
              variant="h6"
              noWrap
              component="a"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              CHATIFY
            </Typography>
            <div style={{ display: "flex", flexDirection: "row" }}>
              {headerLogo ? (
                <Avatar
                  style={{ width: "40px", height: "40px", marginRight: "10px" }}
                  alt={headerName}
                  src={headerLogo}
                  onClick={() => window.open(headerLogo, "_blank")}
                />
              ) : null}
              <Typography
                variant="h6"
                noWrap
                component="a"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".3rem",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                {headerName}
              </Typography>
            </div>
            <Box
              sx={{ flexGrow: 0 }}
              style={{ display: "flex", flexDirection: "row" }}
            >
              <div
                style={{
                  marginRight: "20px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography variant="h6" noWrap>
                  {nickname}
                </Typography>
                <Typography variant="h9" noWrap>
                  {email}
                </Typography>
              </div>
              <Tooltip title="Menu">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    style={{ width: "50px", height: "50px" }}
                    alt={nickname}
                    src={avatar}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography
                      textAlign="center"
                      onClick={() => menuBtnClicked(setting)}
                    >
                      {setting}
                    </Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </div>
  );
}
