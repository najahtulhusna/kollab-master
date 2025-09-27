import { Button as MantineButton } from "@mantine/core";
import { css, cx } from "@emotion/css";
import type { ComponentProps } from "react";

type CustomButtonProps = ComponentProps<typeof MantineButton> & {
  variantType?: "primary" | "secondary";
};

export const Button = ({
  variantType = "primary",
  className,
  ...props
}: CustomButtonProps) => {
  const primary = css`
    background-color: #131313;
    color: #fff;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: #6b6b6b;
    }
  `;

  const secondary = css`
    background-color: #fff;
    color: #131313;
    transition: background-color 0.3s ease, color 0.3s ease;

    &:hover {
      background-color: #f2f2f2;
      color: #131313;
    }
  `;

  return (
    <MantineButton
      variant="filled"
      color="none"
      className={cx(variantType === "primary" ? primary : secondary, className)}
      {...props}
    />
  );
};
