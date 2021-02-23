import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const config = {
  apiKey: "AIzaSyAK-kdWfvFUfOhjulYaDMFl2fiZwZeRP3Y",
  authDomain: "image-gallery-1f3e1.firebaseapp.com",
  projectId: "image-gallery-1f3e1",
  storageBucket: "image-gallery-1f3e1.appspot.com",
  messagingSenderId: "420990678169",
  appId: "1:420990678169:web:bf9f207f60939200adf408",
  measurementId: "G-7CV8HPVB49",
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

export default firebase;
export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storageRef = firebase.storage().ref();

const googleAuthProvider = new firebase.auth.GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  login_hint: "user@example.com",
});
export const signInWithGoogle = () => auth.signInWithPopup(googleAuthProvider);

export const createUserDoc = async (userAuth) => {
  const collectionRef = firestore.collection("users");

  const userSnapshot = await collectionRef.doc(userAuth.uid).get();

  if (!userSnapshot.exists) {
    const newDoc = firestore.collection("users").doc(userAuth.uid);

    try {
      await newDoc.set({
        id: userAuth.uid,
        email: userAuth.email,
        name: userAuth.displayName,
        profileImage: userAuth.photoURL,
        createdAt: Date.now(),
      });
    } catch (error) {
      console.log(error);
    }
  }

  return userSnapshot.data();
};

const uploadImageAsync = (uploadRef) =>
  new Promise((resolve, reject) =>
    uploadRef.on(
      "state_changed",
      null,

      (error) => reject(error),
      () => {
        resolve(uploadRef.snapshot.ref.getDownloadURL());
      }
    )
  );

export const uploadImage = async (
  ownerId,
  originalFile,
  desktopImageDataUrl,
  mobileImageDataUrl,
  blurImageDataUrl,
  uploadFinished
) => {
  //get image ref
  const imagesDBRef = firestore.collection("images");
  const imageDoc = imagesDBRef.doc();
  // get sotrage ref
  const imageOriginalSrcRef = storageRef.child(
    `original/ig${originalFile.name}`
  );
  const imageDesktopSrcRef = storageRef.child(`desktop/${imageDoc.id}`);
  const imageBlurRef = storageRef.child(`blur/${imageDoc.id}`);
  const imagesMobileSrcRef = storageRef.child(`mobile/${imageDoc.id}`);

  const uploadOriginalImage = imageOriginalSrcRef.put(originalFile);
  const uploadDesktopImage = imageDesktopSrcRef.putString(
    desktopImageDataUrl,
    "data_url"
  );
  const uploadBlurImage = imageBlurRef.putString(blurImageDataUrl, "data_url");
  const uploadMobileImage = imagesMobileSrcRef.putString(
    mobileImageDataUrl,
    "data_url"
  );

  try {
    const blurImageUrl = await uploadImageAsync(uploadBlurImage);
    const mobileImageUrl = await uploadImageAsync(uploadMobileImage);
    const desktopImageUrl = await uploadImageAsync(uploadDesktopImage);
    const originalImageurl = await uploadImageAsync(uploadOriginalImage);

    await updateImageDoc(
      imageDoc,
      ownerId,
      originalImageurl,
      desktopImageUrl,
      mobileImageUrl,
      blurImageUrl
    );

    await addImagetoUser(ownerId, imageDoc.id);

    uploadFinished();
  } catch (error) {
    console.log(error);
  }
};

const updateImageDoc = async (
  imageDoc,
  userId,
  originalUrl,
  desktopUrl,
  mobileUrl,
  blurUrl
) => {
  try {
    await imageDoc.set({
      id: imageDoc.id,
      src: {
        original: originalUrl,
        desktop: desktopUrl,
        mobile: mobileUrl,
        blur: blurUrl,
      },
      totalDownloads: 0,
      createdBy: userId,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.log(error);
  }
};

const addImagetoUser = async (userId, imageId) => {
  const userRef = firestore.collection("users").doc(userId);
  const userSnapshot = await userRef.get();
  const userData = await userSnapshot.data();
  let userImagesArr = userData.images;
  if (userImagesArr) {
    userImagesArr.unshift(imageId);
  } else {
    userImagesArr = [imageId];
  }

  try {
    await userRef.update({
      images: userImagesArr,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getUserDataForImage = async (userId) => {
  const userRef = firestore.collection("users").doc(userId);
  const userSnapshot = await userRef.get();
  const userData = await userSnapshot.data();

  return {
    name: userData.name.length > 0 ? userData.name : userData.email,
    profileImage: userData.profileImage,
  };
};

export const getImagesCount = async () => {
  const imagesRef = firestore.collection("images");
  const imagesSnapshot = await imagesRef.get();
  return imagesSnapshot.docs.length;
};

export const addImageTotalDownload = async (imageId) => {
  const imageRef = firestore.collection("images").doc(imageId);
  const imageSnapshot = await imageRef.get();
  const imageData = await imageSnapshot.data();
  const totalDownloadsCount = imageData.totalDownloads + 1;
  try {
    await imageRef.update({
      totalDownloads: totalDownloadsCount,
    });
    console.log("downlaod count is updated to doc ", imageId);
  } catch (error) {
    console.log(error);
  }
};

export const getUserProfileData = async (userId) => {
  //const imagesDBref = firestore.collection("images");
  const profileUserRef = firestore.collection("users").doc(userId);
  const profileUserSnapshot = await profileUserRef.get();
  const profileUserData = await profileUserSnapshot.data();

  return profileUserData;
};

export const convertDocIdToImage = async (docIdMap) => {
  const imagesRef = firestore.collection("images");
  const data = await Promise.all(
    docIdMap.map(async (docId) => {
      const docRef = imagesRef.doc(docId);
      const docSnapshot = await docRef.get();
      return await docSnapshot.data();
    })
  );
  return data;
};

export const convertImageSnapshotToMap = async (snapshot) => {
  return await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = await doc.data();
      const ownerData = await getUserDataForImage(data.createdBy);
      return {
        ...data,
        ownerInfo: ownerData,
      };
    })
  );
};

export const getNextImagesSnapshot = async (lastLatestDocDOMRef, docLimit) => {
  const lastLatestDoc = lastLatestDocDOMRef.current;
  const imagesDBref = firestore.collection("images");

  const query = lastLatestDoc
    ? imagesDBref
        .orderBy("createdAt", "desc")
        .startAfter(lastLatestDoc)
        .limit(docLimit)
        .get()
    : imagesDBref.orderBy("createdAt", "desc").limit(docLimit).get();
  const imageSnapshot = await query;

  lastLatestDocDOMRef.current =
    imageSnapshot.docs[imageSnapshot.docs.length - 1];

  return imageSnapshot;
};
