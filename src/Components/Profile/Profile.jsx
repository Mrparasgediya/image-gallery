import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";
import { withRouter } from "react-router-dom";
import { Container, Grid } from "@material-ui/core";
import { convertDocIdToImage } from "../../firebase/firebase";

import GridImage from "../GridImage/GridImage";
import { getUserProfileData } from "../../firebase/firebase";
import Spinner from "../Spinner/Spinner";

function Profile({ match }) {
  const [profileUser, setProfileUser] = useState(null);
  const [profileUserImages, setProfileUserImages] = useState([]);
  const userImageIds = useRef([]);
  const userImages = useRef([]);
  const lastDocIdx = useRef(0);
  const loaderRef = useRef();
  const imageLoadLimit = window.innerWidth > 768 ? 9 : 6;

  const observer = useRef(
    new IntersectionObserver(
      async (entries, observer) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          if (lastDocIdx.current > userImageIds.current.length) {
            observer.unobserve(loaderRef.current);
            loaderRef.current.style.display = "none";
          } else {
            const nextImagesId = userImageIds.current.filter(
              (_, idx) =>
                lastDocIdx.current <= idx &&
                idx < lastDocIdx.current + imageLoadLimit
            );
            lastDocIdx.current = lastDocIdx.current + imageLoadLimit;

            const nextImages = await convertDocIdToImage(nextImagesId);
            userImages.current = [...userImages.current, ...nextImages];

            setProfileUserImages(userImages.current);
          }
        }
      },
      { threshold: 1 }
    )
  );

  useEffect(() => {
    const getProfileUserAsync = async () => {
      const userData = await getUserProfileData(match.params.userId);
      userImageIds.current = userData.images;
      setProfileUser(userData);
      observer.current.observe(loaderRef.current);
    };
    getProfileUserAsync();
  }, [match.params.userId]);

  return profileUser ? (
    <Container fixed className="profile">
      <div className="profile-header">
        <img
          className="profile-header__img"
          src={profileUser !== null ? profileUser.profileImage : ""}
          alt="profile"
        />
        <span>
          {profileUser
            ? profileUser.name.length > 0
              ? profileUser.name
              : profileUser.email
            : ""}
        </span>
      </div>
      <Grid container spacing={4}>
        {profileUserImages.length > 0 &&
          profileUserImages.map((image, idx) => (
            <GridImage key={idx} image={image} isProfileImage={true} />
          ))}
        <div ref={loaderRef} className="loader__container">
          <Spinner />
        </div>
      </Grid>
    </Container>
  ) : (
    <Spinner />
  );
}

export default withRouter(Profile);
