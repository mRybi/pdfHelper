import React from "react";
import { useHistory } from "react-router-dom";

export const Nav = () => {
  let history = useHistory();
  return (
    <>
      <button onClick={() => history.push("/pdfHelper/")}>Dodaj pieczątke</button>
      <button onClick={() => history.push("/pdfHelper/merge")}>połącz pliki</button>
    </>
  );
};
