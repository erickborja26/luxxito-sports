import * as React from "react";

import { Button, type ButtonProps } from "./button";

export interface ButtonIntentProps extends Omit<ButtonProps, "variant"> {}

const ButtonPrimary = React.forwardRef<HTMLButtonElement, ButtonIntentProps>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="default" className={className} {...props} />
  ),
);
ButtonPrimary.displayName = "ButtonPrimary";

const ButtonSecondary = React.forwardRef<HTMLButtonElement, ButtonIntentProps>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="secondary" className={className} {...props} />
  ),
);
ButtonSecondary.displayName = "ButtonSecondary";

const ButtonDanger = React.forwardRef<HTMLButtonElement, ButtonIntentProps>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="destructive" className={className} {...props} />
  ),
);
ButtonDanger.displayName = "ButtonDanger";

export { ButtonPrimary, ButtonSecondary, ButtonDanger };
