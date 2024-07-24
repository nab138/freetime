"use client";

import styles from "./Button.module.css";

export default function ClientButton({
  children,
  onClick,
  type = "button",
  style = {},
}: Readonly<{
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  onClick: () => void;
}>) {
  return (
    <button className={styles.btn} type={type} onClick={onClick} style={style}>
      {children}
    </button>
  );
}
