import React from "react";
import "./Spinner.css";
import { CircularProgress } from "@material-ui/core";

//props forwarded ref
const Spinner = () => {
  return (
    <div className="spinner__container">
      <CircularProgress />
    </div>
  );
};

export default Spinner;
