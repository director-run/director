import { GetStartedPlaybookForm } from "@director.run/design/components/get-started/get-started-playbook-form.tsx";
import { playbookSchema } from "@director.run/design/components/get-started/get-started-playbook-form.tsx";
import { PlaybookForm } from "@director.run/design/components/playbooks/playbook-form.tsx";
import { RegistryInstallForm } from "@director.run/design/components/registry/registry-install-form.tsx";
import { Button } from "@director.run/design/components/ui/button.tsx";
import { FormWithSchema } from "@director.run/design/components/ui/form.tsx";
import { HiddenField } from "@director.run/design/components/ui/form/hidden-field.tsx";
import { InputField } from "@director.run/design/components/ui/form/input-field.tsx";
import { SelectNativeField } from "@director.run/design/components/ui/form/select-native-field.tsx";
import { TextareaField } from "@director.run/design/components/ui/form/textarea-field.tsx";
import { Toaster, toast } from "@director.run/design/components/ui/toast.tsx";
import { useZodForm } from "@director.run/design/hooks/use-zod-form.tsx";
import { mockRegistryEntry } from "@director.run/design/test/fixtures/registry/entry.ts";
import { z } from "zod";
import { kitchenSinkPlaybooks } from "../fixtures";
import { GallerySection } from "./gallery-section";

const demoSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  bio: z.string().optional(),
  role: z.string(),
  source: z.string(),
});

const demoDefaults = { name: "", bio: "", role: "admin", source: "gallery" };

const submitted = () =>
  toast({ title: "Submitted", description: "The form was submitted." });

export function FormsGallery() {
  const onboardingForm = useZodForm({
    schema: playbookSchema,
    defaultValues: { name: "", description: "A playbook for getting started" },
  });

  return (
    <div className="flex flex-col gap-y-12">
      <GallerySection
        title="Form fields"
        description="Field wrappers built on react-hook-form + zod. Submit empty to see validation."
      >
        <div className="max-w-md">
          <FormWithSchema
            schema={demoSchema}
            defaultValues={demoDefaults}
            onSubmit={() => {
              submitted();
            }}
          >
            <div className="flex flex-col gap-y-6">
              <InputField name="name" label="Name" placeholder="Ada Lovelace" />
              <TextareaField
                name="bio"
                label="Bio"
                helperLabel="Optional"
                placeholder="A short bio"
              />
              <SelectNativeField name="role" label="Role">
                <option value="admin">Admin</option>
                <option value="member">Member</option>
              </SelectNativeField>
              <HiddenField name="source" />
              <Button type="submit">Submit</Button>
            </div>
          </FormWithSchema>
        </div>
      </GallerySection>

      <GallerySection
        title="Playbook form"
        description="One component powering both create and edit."
      >
        <div className="grid max-w-3xl gap-8 md:grid-cols-2">
          <PlaybookForm
            onSubmit={() => {
              submitted();
              return Promise.resolve();
            }}
          >
            <Button>Create playbook</Button>
          </PlaybookForm>
          <PlaybookForm
            defaultValues={{
              name: "Incident Response",
              description: "On-call tooling for triaging incidents.",
            }}
            onSubmit={() => {
              submitted();
              return Promise.resolve();
            }}
          >
            <Button>Save changes</Button>
          </PlaybookForm>
        </div>
      </GallerySection>

      <GallerySection
        title="Registry install form"
        description="Renders required and password parameters from a registry entry."
      >
        <div className="max-w-md">
          <RegistryInstallForm
            registryEntry={mockRegistryEntry}
            playbooks={kitchenSinkPlaybooks()}
            onSubmit={() => {
              submitted();
            }}
          />
        </div>
      </GallerySection>

      <GallerySection title="Onboarding playbook form">
        <div className="max-w-md">
          <GetStartedPlaybookForm
            form={onboardingForm}
            isPending={false}
            onSubmit={() => {
              submitted();
            }}
          />
        </div>
      </GallerySection>

      <Toaster />
    </div>
  );
}
