import React from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from "@material-ui/core";
import "./ProgressDialog.css";

function ProgressDialog({ handleClose, open, isUploading }) {
  return (
    <Dialog open={open}>
      <DialogTitle>Uploading Image</DialogTitle>
      <DialogContent>
        <div className="progress">
          {isUploading ? (
            <div className="uploading">
              <lottie-player
                src="https://assets5.lottiefiles.com/packages/lf20_GxMZME.json"
                background="transparent"
                speed="2"
                style={{ width: "150px", height: "150px" }}
                loop
                autoplay
              ></lottie-player>
            </div>
          ) : (
            <lottie-player
              src="https://assets1.lottiefiles.com/packages/lf20_oMkAre.json"
              background="transparent"
              speed="1"
              style={{ width: "150px", height: "150px" }}
              autoplay
            ></lottie-player>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        {isUploading ? (
          <Button className="button" disabled>
            Home
          </Button>
        ) : (
          <Link to="/" onClick={() => handleClose()}>
            <Button className="button" disabled>
              Home
            </Button>
          </Link>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ProgressDialog;
