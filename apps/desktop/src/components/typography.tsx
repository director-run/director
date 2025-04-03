import { cva } from "class-variance-authority";

export const textVariants = cva("", {
  variants: {
    variant: {
      h1: "text-balance font-normal font-sans text-2xl leading-tight tracking-wide",
      h2: "text-balance font-normal font-sans text-xl leading-tight tracking-wide",
      h3: "text-balance font-normal font-sans text-lg leading-tight tracking-wide",
      h4: "text-balance font-mono font-normal text-xs uppercase tracking-widest",
      p: "text-pretty font-light font-mono text-sm leading-relaxed",
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
