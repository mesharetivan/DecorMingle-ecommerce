import React from "react";

const Helmet = (props) => {
  document.title = "DecorMingle - " + props.title;
  return <div className="w-100">{props.children}</div>;
};
export default Helmet;
