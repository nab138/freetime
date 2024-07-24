import styles from "./Button.module.css";

export default function ClientButton({
  children,
  onClick,
  type = "button",
}: Readonly<{
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  onClick: () => void;
}>) {
  return (
    <button className={styles.btn} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
