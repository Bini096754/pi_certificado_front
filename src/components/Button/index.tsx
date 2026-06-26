import React from "react";
import styles from "./style.module.scss";
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...rest
}) => (
  <button className={styles.btn} {...rest}>
    {children}
  </button>
);
export default Button;
