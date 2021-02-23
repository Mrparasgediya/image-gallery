import React, { lazy, Suspense, useEffect, useState, Fragment } from "react";
import "./App.css";
import { Redirect, Route, Switch } from "react-router-dom";
import { auth, createUserDoc } from "./firebase/firebase";
import Navbar from "./Components/Navbar/Navbar";

const Home = lazy(() => import("./Components/Home/Home"));
const UploadImage = lazy(() =>
  import("./Components/UploadImage/UploadImage.jsx")
);
const Profile = lazy(() => import("./Components/Profile/Profile"));
const SignIn = lazy(() => import("./Components/SignIn/SignIn"));

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unSubscribeFromAuth = auth.onAuthStateChanged(async (userAuth) => {
      if (userAuth) {
        const userData = await createUserDoc(userAuth);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
        console.log(null);
      }
    });

    return () => unSubscribeFromAuth();
  }, []);

  return (
    <Fragment>
      <Navbar currentUser={currentUser} />
      <Suspense
        fallback={
          <div className="app-suspense">
            <span className="app-suspense__text">Image Gallery</span>
          </div>
        }
      >
        <Switch>
          <Route path="/" exact component={Home} />
          <Route
            path="/signin"
            exact
            render={() => (currentUser ? <Redirect to="/" /> : <SignIn />)}
          />
          <Route path="/:userId/upload" component={UploadImage} />
          <Route path="/:userId/profile" component={Profile} />
        </Switch>
      </Suspense>
    </Fragment>
  );
};
export default App;
