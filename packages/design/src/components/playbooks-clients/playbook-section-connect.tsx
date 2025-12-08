import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { z } from "zod";
import { cn } from "../../helpers/cn";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { Button } from "../ui/button";
import { FormWithSchema } from "../ui/form";
import { SelectNativeField } from "../ui/form/select-native-field";
import { Section, SectionHeader, SectionTitle } from "../ui/section";

export function PlaybookSectionConnect() {
  const [, copy] = useCopyToClipboard();
  const [copied, setCopied] = useState(false);

  const command = "$ director connect test";

  const handleCopy = () => {
    copy(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const schema = z.object({
    playbookId: z.string().trim().min(1, "Required"),
    parameters: z.object({
      "github-personal-access-token": z.string().trim().min(1, "Required"),
    }),
  });

  const defaultValues = {
    playbookId: "staging-playbook",
    parameters: { "github-personal-access-token": "" },
  };

  return (
    <FormWithSchema
      schema={schema}
      defaultValues={defaultValues}
      className="flex flex-col gap-y-3"
      onSubmit={() => {}}
    >
      <Section>
        <SectionHeader>
          <SectionTitle variant="h3" asChild>
            <h3>Connect to Playbook</h3>
          </SectionTitle>
        </SectionHeader>

        <div className="flex w-full flex-col gap-y-0 overflow-hidden rounded-xl bg-accent-subtle shadow-[0_0_0_0.5px_rgba(55,50,46,0.15)]">
          <div className="flex flex-col gap-y-4 p-4">
            <SelectNativeField name="playbookId">
              <option value="staging-playbook">Automatically</option>
              <option value="staging-playbook">Via HTTP</option>
              <option value="staging-playbook">Via STDIO</option>
            </SelectNativeField>
          </div>
          <div className="flex items-center justify-between border-fg/7 border-t-[0.5px] bg-accent px-4 py-2.5">
            <div
              className={cn(
                "flex flex-col w-full resize-none rounded-md bg-surface text-sm",
                "-mx-px border-[0.5px] border-fg/30 pr-0 font-medium font-mono text-[13px] ",
              )}
            >
              <div className="flex-1 px-3 pt-2 pb-0">{command}</div>
              <div className="flex-1 flex justify-end px-2 pb-2 pt-0">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <CheckIcon className="text-green-500" />
                  ) : (
                    <CopyIcon />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </FormWithSchema>
  );
}
