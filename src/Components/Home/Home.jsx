import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import {
  convertImageSnapshotToMap,
  getNextImagesSnapshot,
} from "../../firebase/firebase";

import { Container, Grid } from "@material-ui/core";
import GridImage from "../GridImage/GridImage";
import Spinner from "../Spinner/Spinner";

function Home() {
  const [images, setImages] = useState([]);
  const allImages = useRef([]);
  const lastDoc = useRef(null);
  const loaderRef = useRef(null);
  // we set doc limit according device moblie or desktop
  const docLimit = window.innerWidth > 768 ? 9 : 6;

  const observer = useRef(
    new IntersectionObserver(
      async (entries, observer) => {
        // first entry on intersecting
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          // get next image snapshot depends on last document
          const imagesSnapshot = await getNextImagesSnapshot(lastDoc, docLimit);
          // chech imagesnapshot has documents or not
          if (imagesSnapshot.empty) {
            // here unobserve loader and hide loader to prevent
            observer.unobserve(loaderRef.current);
            loaderRef.current.style.display = "none";
          } else {
            // get image map according snapshot
            const imagesMap = await convertImageSnapshotToMap(imagesSnapshot);
            // update allimages ref and
            allImages.current = [...allImages.current, ...imagesMap];
            setImages(allImages.current);
            // update last doc according to snapshot
            lastDoc.current =
              imagesSnapshot.docs[imagesSnapshot.docs.length - 1];
          }
        }
      },
      { threshold: 1 }
    )
  );

  useEffect(() => {
    if (loaderRef.current) {
      const currentObserver = observer.current;
      const loadingButton = loaderRef.current;

      currentObserver.observe(loadingButton);
    }
  }, []);

  return (
    <Container fixed className="home">
      {images && (
        <Grid container spacing={5}>
          {images.map((image, idx) => (
            <GridImage image={image} key={idx} />
          ))}
        </Grid>
      )}
      <div ref={loaderRef} className="loader__container">
        <Spinner />
      </div>
    </Container>
  );
}

export default Home;
