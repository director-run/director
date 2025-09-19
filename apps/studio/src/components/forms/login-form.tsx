import { z } from "zod";
import { Button } from "../ui/button.tsx";
import { FormWithSchema } from "../ui/form.tsx";
import { InputField } from "../ui/form/input-field.tsx";

interface LoginFormProps {
  defaultValues?: {
    email: string;
    password: string;
  };
  onSubmit: (params: {
    email: string;
    password: string;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export function LoginForm({
  onSubmit,
  isSubmitting = false,
  defaultValues,
}: LoginFormProps) {
  const schema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  });

  return (
    <FormWithSchema
      schema={schema}
      defaultValues={
        defaultValues ? defaultValues : { email: "", password: "" }
      }
      className="gap-y-0 overflow-hidden rounded-xl bg-accent-subtle shadow-[0_0_0_0.5px_rgba(55,50,46,0.15)]"
      onSubmit={(values) => {
        onSubmit({
          email: values.email,
          password: values.password,
        });
      }}
    >
      <div className="flex flex-col gap-y-4 p-4">
        <InputField
          type="email"
          name="email"
          label="Email"
          placeholder="Enter your email"
          autoComplete="email"
          autoCorrect="off"
          spellCheck={false}
        />
        <InputField
          type="password"
          name="password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      <div className="border-fg/7 border-t-[0.5px] bg-accent px-4 py-2.5">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </FormWithSchema>
  );
}
