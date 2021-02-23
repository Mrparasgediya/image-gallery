import React from "react";
import "./SignIn.css";
import { signInWithGoogle } from "../../firebase/firebase";
import { withRouter } from "react-router-dom";
import { Container, Button } from "@material-ui/core";

function SignIn({ history }) {
  return (
    <Container fixed className="sign-in">
      <h3>Sign In</h3>
      <div className="sing-in__buttons">
        <Button
          className="button button--google"
          onClick={async () => {
            await signInWithGoogle();
            history.push("/");
          }}
        >
          Google
        </Button>
      </div>
    </Container>
  );
}

export default withRouter(SignIn);
