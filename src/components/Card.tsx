import styles from "./Card.module.css";

export default function Card({
  children,
  className,
}: Readonly<{
  children: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={styles.card + (className ? ` ${className}` : "")}>
      {children}
    </div>
  );
}
