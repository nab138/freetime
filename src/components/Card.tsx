import styles from "./Card.module.css";

export default function Card({
  children,
  className,
  style = {},
}: Readonly<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}>) {
  return (
    <div
      className={styles.card + (className ? ` ${className}` : "")}
      style={style}
    >
      {children}
    </div>
  );
}
