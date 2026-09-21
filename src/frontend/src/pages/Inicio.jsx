import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import studio13 from "../assets/studio13.png";
import Layout from "../pages/Layout/Layout.jsx";

const Inicio = () => {
  

  return (
    <Layout>
      <img src={studio13} alt="Studio13" className="w-full h-screen object-cover"/>
    </Layout>
  );
};

export default Inicio;
