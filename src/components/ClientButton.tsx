"use client";

import styles from "./Button.module.css";

export default function ClientButton({
  children,
  onClick,
  type = "button",
  style = {},
  className = "",
  disabled = false,
}: Readonly<{
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  className?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
}>) {
  return (
    <button
      className={styles.btn + (className === "" ? "" : ` ${className}`)}
      type={type}
      onClick={onClick}
      style={style}
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
