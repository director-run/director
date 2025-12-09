import { LoginPage } from "@director.run/design/components/pages/auth/login.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "pages/login",
  component: LoginPage,
  parameters: { layout: "fullscreen" },
  args: {
    error: null,
    isLoading: false,
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async () => {
      console.log("Login form submitted");
      await new Promise((resolve) => setTimeout(resolve, 100));
    },
    signupLink: <a href="/signup">Sign up</a>,
  },
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    error: null,
    isLoading: false,
    defaultValues: {
      email: "",
      password: "",
    },
  },
};

export const Prefilled: Story = {
  args: {
    error: null,
    isLoading: false,
    defaultValues: {
      email: "barnaby@example.com",
      password: "password",
    },
  },
};

export const Error: Story = {
  args: {
    error: { message: "Login failed" } as Error,
    isLoading: false,
    defaultValues: {
      email: "barnaby@example.com",
      password: "password",
    },
  },
};
