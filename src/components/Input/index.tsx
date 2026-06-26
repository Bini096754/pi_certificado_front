import React from "react";
import styles from "./style.module.scss";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...rest }, ref) => (
    <div className={styles.container}>
      <label>{label}</label>
      <input ref={ref} {...rest} />
      {error && <span>{error}</span>}
    </div>
  ),
);
export default Input;
