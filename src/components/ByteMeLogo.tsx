
import React from "react";
import { APP_LOGO } from "@/constants/constants";

interface ByteMeLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ByteMeLogo: React.FC<ByteMeLogoProps> = ({ 
  size = "md", 
  className = "" 
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={APP_LOGO} 
        alt="ByteMe" 
        className={`${sizeClasses[size]} object-contain`} 
      />
    </div>
  );
};

export default ByteMeLogo;
