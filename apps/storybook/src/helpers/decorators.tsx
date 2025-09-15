import {
  LayoutView,
  LayoutViewContent,
  LayoutViewHeader,
} from "@director.run/studio/components/layout/layout.tsx";
import { Breadcrumb } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbList } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbItem } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbLink } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbSeparator } from "@director.run/studio/components/ui/breadcrumb.tsx";
import { BreadcrumbPage } from "@director.run/studio/components/ui/breadcrumb.tsx";
import type { Decorator } from "@storybook/react";

export const withLayoutView: Decorator = (Story) => {
  return (
    <LayoutView>
      <LayoutViewHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                onClick={() => alert("Library")}
                className="cursor-pointer"
              >
                Library
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Registry Item Detail</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </LayoutViewHeader>

      <LayoutViewContent>
        <Story />
      </LayoutViewContent>
    </LayoutView>
  );
};
