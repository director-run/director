import { RegistryItemDetail } from "@director.run/studio/components/pages/registry-item-detail.tsx";
import { mockRegistryEntry } from "@director.run/studio/test/fixtures/registry/entry.ts";
import "./fonts.css";
import "./globals.css";
import { ChatToUs } from "@director.run/studio/components/chat-to-us.tsx";
import {
  LayoutRoot,
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
import { Route, Routes, useNavigate } from "react-router-dom";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { NotFoundPage } from "./components/NotFoundPage";

export const KitchenSink = () => {
  return (
    <ContainerWrap>
      <Routes>
        <Route
          path="/"
          element={
            <RegistryItemDetail
              entry={mockRegistryEntry}
              proxiesWithMcp={[]}
              proxiesWithoutMcp={[]}
              serverId={null}
              onInstall={async () => {}}
              onCloseTool={() => {}}
              toolLinks={[]}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ContainerWrap>
  );
};

export const ContainerWrap = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();

  return (
    <LayoutRoot
      sections={[
        {
          id: "links",
          label: "Links",
          items: [
            {
              id: "home",
              label: "Home",
              isActive: false,
              onClick: () => navigate("/"),
            },
            {
              id: "about",
              label: "About",
              isActive: false,
              onClick: () => navigate("/about"),
            },
            {
              id: "contact",
              label: "Contact",
              isActive: false,
              onClick: () => navigate("/contact"),
            },
          ],
        },
        {
          id: "actions",
          items: [],
        },
      ]}
    >
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

        <LayoutViewContent>{children}</LayoutViewContent>
      </LayoutView>
      <ChatToUs />
    </LayoutRoot>
  );
};
