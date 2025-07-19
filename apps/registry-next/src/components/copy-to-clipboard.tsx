"use client";

import { useCopyToClipboard } from "@director.run/design/hooks/use-copy-to-clipboard";
import { Button } from "@director.run/design/ui/button";
import { CopyIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, useEffect, useState } from "react";

interface CopyToClipboardProps extends ComponentProps<typeof Button> {
  text: string;
}

export function CopyToClipboard({ text, ...props }: CopyToClipboardProps) {
  const t = useTranslations("common");

  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [, copyText] = useCopyToClipboard();

  useEffect(() => {
    if (isCopied) {
      setTimeout(() => setIsCopied(false), 2000);
    }
  }, [isCopied]);

  return (
    <Button
      onClick={() => {
        copyText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      }}
      tooltip={isCopied ? t("copiedToClipboard") : t("copyToClipboard")}
      tooltipProps={{
        open: isCopied || isOpen,
        onOpenChange: setIsOpen,
      }}
      variant="tertiary"
      {...props}
    >
      <CopyIcon />
      <span className="sr-only">{t("copyToClipboard")}</span>
    </Button>
  );
}
