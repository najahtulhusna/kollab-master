import { TextInput } from "@mantine/core";
import type { TextInputProps } from "@mantine/core";
import type { ReactNode } from "react";
import { useState } from "react";
import "../css/TextField.css";

interface TextFieldProps
  extends Omit<TextInputProps, "leftSection" | "rightSection"> {
  label?: string;
  placeholder?: string;
  withAsterisk?: boolean;
  leftSection?: ReactNode;
  rightSection?: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isPassword?: boolean;
}

const TextField = ({
  label,
  placeholder,
  withAsterisk,
  leftSection,
  rightSection,
  size = "sm",
  isPassword,
  type,
  ...props
}: TextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = isPassword ? (showPassword ? "text" : "password") : type;
  return (
    <TextInput
      label={label}
      placeholder={placeholder}
      withAsterisk={withAsterisk}
      size={size}
      type={inputType}
      leftSection={leftSection}
      rightSection={
        isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            style={{
              background: "transparent",

              border: "none",

              cursor: "pointer",

              padding: 0,

              display: "flex",

              alignItems: "center",
            }}
          >
            <span className="material-icons" style={{ fontSize: 20 }}>
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        ) : (
          rightSection
        )
      }
      classNames={{
        input: "custom-input",
      }}
      {...props}
    />
  );
};

export default TextField;
