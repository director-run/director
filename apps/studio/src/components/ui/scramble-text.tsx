"use client";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

const CHARS = "░▒▓█";

const shuffleText = (text: string) => {
  return text
    .split("")
    .map((char) => CHARS[Math.floor(Math.random() * CHARS.length)])
    .join("");
};

interface ScrambleTextProps {
  text: string;
  scrambleSpeed?: number;
  className?: string;
}

export const ScrambleText = ({
  text,
  scrambleSpeed = 250,
  className,
  ...props
}: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(shuffleText(text));

  useEffect(() => {
    let interval: NodeJS.Timeout;

    interval = setInterval(() => {
      setDisplayText(shuffleText(text));
    }, scrambleSpeed);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [text, scrambleSpeed]);

  return (
    <span
      className={cn("inline-block whitespace-pre-wrap", className)}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" suppressHydrationWarning>
        {displayText}
      </span>
    </span>
  );
};
