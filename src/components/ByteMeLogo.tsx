
import React from "react";
import { APP_LOGO } from "@/constants/constants";

interface ByteMeLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

export const ByteMeLogo: React.FC<ByteMeLogoProps> = ({ 
  size = "md", 
  className = "",
  showText = false
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20"
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
