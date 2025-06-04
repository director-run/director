"use client";
import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";

interface ScrambleTextProps {
  text: string;
  scrambleSpeed?: number;
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
}

export const ScrambleText = ({
  text,
  scrambleSpeed = 250,
  useOriginalCharsOnly = false,
  characters = "░▒▓█",
  className,
  ...props
}: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const shuffleText = (text: string) => {
      if (useOriginalCharsOnly) {
        const positions = text.split("").map((char) => ({
          char,
          isSpace: char === "░",
        }));

        const nonSpaceChars = positions
          .filter((p) => !p.isSpace)
          .map((p) => p.char);

        // Shuffle non-space characters
        for (let i = nonSpaceChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonSpaceChars[i], nonSpaceChars[j]] = [
            nonSpaceChars[j],
            nonSpaceChars[i],
          ];
        }

        let charIndex = 0;
        return positions
          .map((p) => {
            if (p.isSpace) {
              return "░";
            }
            return nonSpaceChars[charIndex++];
          })
          .join("");
      } else {
        return text
          .split("")
          .map((char) => {
            if (char === " ") {
              return "░";
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("");
      }
    };

    interval = setInterval(() => {
      setDisplayText(shuffleText(text));
    }, scrambleSpeed);

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [text, characters, scrambleSpeed, useOriginalCharsOnly]);

  return (
    <span
      className={cn("inline-block whitespace-pre-wrap", className)}
      {...props}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{displayText}</span>
    </span>
  );
};
