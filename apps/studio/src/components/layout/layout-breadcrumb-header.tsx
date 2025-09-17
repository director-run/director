"use client";

import type { ReactNode } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import { ScrambleText } from "../ui/scramble-text";
import { LayoutViewHeader } from "./layout";

interface BreadcrumbItem {
  title: string;
  onClick?: () => void;
}

interface LayoutBreadcrumbHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  loading?: boolean;
  children?: ReactNode;
}

export function LayoutBreadcrumbHeader({
  breadcrumbs,
  loading = false,
  children,
}: LayoutBreadcrumbHeaderProps) {
  return (
    <LayoutViewHeader>
      <Breadcrumb className="grow">
        <BreadcrumbList>
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isClickable = !!item.onClick;

            return (
              <>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isClickable ? (
                    <BreadcrumbLink
                      onClick={item.onClick}
                      className="cursor-pointer"
                    >
                      {isLast && loading ? (
                        <ScrambleText text={item.title} />
                      ) : (
                        item.title
                      )}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>
                      {isLast && loading ? (
                        <ScrambleText text={item.title} />
                      ) : (
                        item.title
                      )}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      {children}
    </LayoutViewHeader>
  );
}
