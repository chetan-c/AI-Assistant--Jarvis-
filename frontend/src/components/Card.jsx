import React, { useContext } from "react";
import { userDataContext } from "../context/userContext";

function Card({ image }) {

  const {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);

  return (
    <div className={`w-[150px] h-[250px] bg-[#030326] border-2 border-[rgba(15,15,24,0.21)] rounded-2xl 
      ${selectedImage == image ? "border-4 border-white  " : "null"}  `}
      onClick={() => {
        {
      
          setSelectedImage(image)
          setBackendImage(null)
          setFrontendImage(null)
        }
}}>
      <img
        src={image}
        className="h-full object-cover overflow-hidden  hover:shadow-blue-950 cursor-pointer border-4 hover:border"
      />
    </div>
  );
}

export default Card;
