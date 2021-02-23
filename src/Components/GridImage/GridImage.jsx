import React, { useState, useRef, useEffect } from "react";
import { Grid, Avatar } from "@material-ui/core";
import { Link } from "react-router-dom";
import "./GridImage.css";
import GetAppTwoToneIcon from "@material-ui/icons/GetAppTwoTone";
import { addImageTotalDownload } from "../../firebase/firebase";

function GridImage({ image, isProfileImage }) {
  const { src, id, totalDownloads, ownerInfo, createdBy } = image;
  const currentDevice = window.innerWidth < 426 ? "mobile" : "desktop";
  const imgRef = useRef();
  const [toggleOverlay, setToggleOverlay] = useState(true);

  useEffect(() => {
    let observer = new IntersectionObserver(
      (entries, observer) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          imgRef.current.src = src[currentDevice];
          observer.unobserve(imgRef.current);
        }
      },
      {
        threshold: 0.5,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer = null;
    };
  }, [src, currentDevice]);

  let imageOwnerInfo;

  if (isProfileImage) {
    imageOwnerInfo = null;
  } else {
    imageOwnerInfo = (
      <Link to={`${createdBy}/profile`}>
        <div className="owner-info  bg--glass">
          {ownerInfo.profileImage ? (
            <Avatar
              className="owner-info__avatar"
              src={ownerInfo.profileImage}
            />
          ) : (
            <Avatar>{ownerInfo.name.charAt(0)}</Avatar>
          )}

          <span className="owner-info__name">{ownerInfo.name}</span>
        </div>
      </Link>
    );
  }

  return (
    <Grid className="image" item xl={4} lg={4} md={6} sm={6} xs={12}>
      <div className="image__container">
        {toggleOverlay && <div className="image__overlay" />}
        <img
          ref={imgRef}
          className="image__img"
          src={src["blur"]}
          alt={id}
          onLoad={() => {
            if (imgRef.current.src === src[currentDevice]) {
              setToggleOverlay(false);
            }
          }}
        />
        <div className="image__content">
          {imageOwnerInfo}

          <div
            className="like__container bg--glass"
            onClick={() => {
              window.open(src.original);
              addImageTotalDownload(id);
            }}
          >
            <GetAppTwoToneIcon className="like__icon" />
            <span className="like__text">{totalDownloads || 0}</span>
          </div>
        </div>
      </div>
    </Grid>
  );
}

export default GridImage;
