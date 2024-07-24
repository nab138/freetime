"use client";

import styles from "./Button.module.css";

export default function ClientButton({
  children,
  onClick,
  type = "button",
  style = {},
  className = "",
}: Readonly<{
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  className?: string;
  onClick: () => void;
}>) {
  return (
    <button
      className={styles.btn + (className === "" ? "" : ` ${className}`)}
      type={type}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}
