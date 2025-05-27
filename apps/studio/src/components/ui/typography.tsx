import { cva } from "class-variance-authority";

export const textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-balance font-medium font-sans text-[25px] leading-tight tracking-[0.01em]",
      h2: "text-balance font-medium font-sans text-[17px] leading-6 tracking-[0.01em]",
      h3: "text-balance font-normal font-sans text-[17px] leading-tight",
      h4: "text-balance font-normal font-sans text-base leading-tight",
      p: "text-pretty text-[15px] leading-6",
      inlineLink:
        "text-inherit underline decoration-gray-10 decoration-dashed underline-offset-3 hover:decoration-gray-12",
    },
    invisibles: {
      false: "",
      true: "[&:not(p)]:before:mr-2 [&:not(p)]:before:text-gray-8 [&:not(p)]:before:tracking-widest",
    },
  },
  defaultVariants: {
    variant: "p",
    invisibles: false,
  },
  compoundVariants: [
    {
      variant: "h1",
      invisibles: true,
      className: "before:content-['#']",
    },
    {
      variant: "h2",
      invisibles: true,
      className: "before:content-['##']",
    },
    {
      variant: "h3",
      invisibles: true,
      className: "before:content-['###']",
    },
    {
      variant: "h4",
      invisibles: true,
      className: "before:content-['####']",
    },
  ],
});
