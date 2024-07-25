import Link from "next/link";
import styles from "./Button.module.css";

export default function LinkButton({
  children,
  href,
}: Readonly<{
  children: React.ReactNode;
  href: string;
}>) {
  return (
    <Link className={styles.btn} href={href}>
      {children}
    </Link>
  );
}
