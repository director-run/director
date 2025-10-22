import { ChatToUs } from "@director.run/design/components/chat-to-us.tsx";
import { LayoutBreadcrumbHeader } from "@director.run/design/components/layout/layout-breadcrumb-header.js";
import {
  LayoutRoot,
  LayoutView,
  LayoutViewContent,
} from "@director.run/design/components/layout/layout.tsx";
import {} from "@phosphor-icons/react";
import type { Decorator } from "@storybook/react";

export const withLayoutView: Decorator = (Story) => {
  return (
    <LayoutRoot sections={[]}>
      <LayoutView>
        <LayoutBreadcrumbHeader
          breadcrumbs={[
            {
              title: "Dummy",
            },
            {
              title: "Content",
            },
          ]}
        />

        <LayoutViewContent>
          <Story />
        </LayoutViewContent>
      </LayoutView>
      <ChatToUs />
    </LayoutRoot>
  );
};
