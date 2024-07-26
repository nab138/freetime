import styles from "./Button.module.css";

export default function LinkButton({
  children,
  href,
}: Readonly<{
  children: React.ReactNode;
  href: string;
}>) {
  return (
    <a className={styles.btn} href={href}>
      {children}
    </a>
  );
}
