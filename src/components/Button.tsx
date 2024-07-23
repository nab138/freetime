import styles from "./Button.module.css";

export default function Button({
  children,
  type = "button",
}: Readonly<{
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}>) {
  return (
    <button className={styles.btn} type={type}>
      {children}
    </button>
  );
}
