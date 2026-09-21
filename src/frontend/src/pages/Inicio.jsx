import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import studio13 from "../assets/studio13.png";


const Inicio = () => {
  

  return (
    <img src={studio13} alt="Studio13" className="w-full h-screen object-cover"/>
  );
};

export default Inicio;
