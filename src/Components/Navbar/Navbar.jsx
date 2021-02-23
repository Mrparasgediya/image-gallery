import React from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { auth } from "../../firebase/firebase";

import { AppBar, Toolbar, Typography, IconButton } from "@material-ui/core";
import { AddAPhotoOutlined, AccountCircleOutlined } from "@material-ui/icons";
import { ReactComponent as LoginIcon } from "../../assets/icons/login.svg";
import { ReactComponent as LogoutIcon } from "../../assets/icons/logout.svg";

function Navbar({ currentUser }) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Link to="/">
          <Typography variant="h6">Image Gallery</Typography>
        </Link>

        <div className="menu-icons">
          {currentUser ? (
            <IconButton color="inherit" onClick={() => auth.signOut()}>
              <LogoutIcon className="icon--white" />
            </IconButton>
          ) : (
            <Link to="/signin">
              <IconButton color="inherit">
                <LoginIcon className="icon--white" />
              </IconButton>
            </Link>
          )}
          <Link to={currentUser ? `/${currentUser.id}/upload` : "/signin"}>
            <IconButton color="inherit">
              <AddAPhotoOutlined />
            </IconButton>
          </Link>
          <Link to={currentUser ? `/${currentUser.id}/profile` : "/signin"}>
            <IconButton color="inherit">
              <AccountCircleOutlined />
            </IconButton>
          </Link>
        </div>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
