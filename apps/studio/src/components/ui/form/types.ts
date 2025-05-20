import type { ReactNode } from "react";

export interface CommonFieldProps {
  description?: ReactNode;
  label?: ReactNode;
  helperLabel?: ReactNode;
  name: string;
  hideErrors?: boolean;
}
