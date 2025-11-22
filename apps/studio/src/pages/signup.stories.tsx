import { SignupPage } from "@director.run/design/components/pages/auth/signup.tsx";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  title: "pages/signup",
  component: SignupPage,
  parameters: { layout: "fullscreen" },
  args: {
    error: null,
    isLoading: false,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async () => {
      console.log("Signup form submitted");
      await new Promise((resolve) => setTimeout(resolve, 100));
    },
    loginLink: <a href="/login">Log in</a>,
  },
} satisfies Meta<typeof SignupPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    error: null,
    isLoading: false,
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  },
};

export const Prefilled: Story = {
  args: {
    error: null,
    isLoading: false,
    defaultValues: {
      email: "barnaby@example.com",
      password: "password123",
      confirmPassword: "password123",
    },
  },
};

export const Error: Story = {
  args: {
    error: { message: "Email already exists" } as Error,
    isLoading: false,
    defaultValues: {
      email: "barnaby@example.com",
      password: "password123",
      confirmPassword: "password123",
    },
  },
};

export const Loading: Story = {
  args: {
    error: null,
    isLoading: true,
    defaultValues: {
      email: "barnaby@example.com",
      password: "password123",
      confirmPassword: "password123",
    },
  },
};
