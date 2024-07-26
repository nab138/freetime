import styles from "./Button.module.css";

export default function LinkButton({
  children,
  href,
  style = {},
}: Readonly<{
  children: React.ReactNode;
  href: string;
  style?: React.CSSProperties;
}>) {
  return (
    <a className={styles.btn} href={href} style={style}>
      {children}
    </a>
  );
}
