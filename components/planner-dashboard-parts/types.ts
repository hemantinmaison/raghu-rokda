import type { ReactNode } from "react";

export type TableHeader = {
  label: string;
  icon: ReactNode;
};

export type CreateAction = (formData: FormData) => void | Promise<void>;
