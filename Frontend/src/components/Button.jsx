import React from "react";
import clsx from "clsx";

const Button = ({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        "inline-flex items-center justify-center gap-2 px-5 py-2 rounded-full font-medium shadow-md transition-all duration-200",
        "bg-red-600 hover:bg-red-700 text-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};

export default Button;
