import styles from "./Button.module.css";

export default function Button({
  children,
  type = "button",
  disabled = false,
  style = {},
}: Readonly<{
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  style?: React.CSSProperties;
}>) {
  return (
    <button
      className={styles.btn}
      type={type}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}
