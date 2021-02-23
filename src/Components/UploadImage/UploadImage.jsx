import React, { useState, useRef } from "react";
import "./UploadImage.css";
import { withRouter } from "react-router-dom";

import { Button } from "@material-ui/core";
import { uploadImage } from "../../firebase/firebase";
import ProgressDialog from "../ProgressDialog/ProgressDialog";

import Resizer from "react-image-file-resizer";

function UploadImage({ match }) {
  const defaultUploadImageSrc =
    "https://lanecdr.org/wp-content/uploads/2019/08/placeholder.png";

  const [previewSrc, setPreviewSrc] = useState(defaultUploadImageSrc);
  const [toggleProgressDialog, setToggleProgressDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(true);

  const imgRef = useRef();
  const fileInputRef = useRef();

  const resizeFile = (file, maxWidth, quality = 100) => {
    // maxHeight = maxwidth - 100
    // minWidth = maxWidth - 50
    // minHeight = maxWidth - 150

    let MAXWIDTH = maxWidth;
    let MAXHEIGHT = maxWidth - 100;
    let MINWIDTH = maxWidth - 100;
    let MINHEIGHT = maxWidth - 150;

    if (maxWidth === "blur") {
      MAXWIDTH = 10;
      MAXHEIGHT = 10;
      MINWIDTH = 5;
      MINHEIGHT = 5;
    }

    return new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        MAXWIDTH,
        MAXHEIGHT,
        "JPEG",
        quality,
        0,
        (uri) => resolve(uri),
        "base64",
        MINWIDTH,
        MINHEIGHT
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToggleProgressDialog(true);
    const uploadFinished = () => setIsUploading(false);
    // get files ready for uploading
    const file = fileInputRef.current.files[0];
    const desktopImageUrl = await resizeFile(file, 600);
    const mobileImageUrl = await resizeFile(file, 400);
    const blurImageUrl = await resizeFile(file, "blur", 50);
    // upload image to firebase
    const fileOwnerId = match.params.userId;

    await uploadImage(
      fileOwnerId,
      file,
      desktopImageUrl,
      mobileImageUrl,
      blurImageUrl,
      uploadFinished
    );
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setPreviewSrc(reader.result);
      reader.onerror = (error) => console.log(error);
    }
  };

  return (
    <React.Fragment>
      <div className="upload">
        <h3 className="upload__title">Select Image</h3>
        <div>
          <div className="upload-preview">
            <img
              ref={imgRef}
              className="upload-preview__img"
              src={previewSrc}
              alt="prev-img"
            />
          </div>
          <form onSubmit={handleSubmit} className="upload__form">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".png,.jpeg,.jpg"
              required
              name="uploadImage"
            />
            <Button type="submit" className="button">
              Upload
            </Button>
          </form>
        </div>
      </div>
      <ProgressDialog
        open={toggleProgressDialog}
        isUploading={isUploading}
        handleClose={() => setToggleProgressDialog(false)}
      />
    </React.Fragment>
  );
}

export default withRouter(UploadImage);
