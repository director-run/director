"use client";
import { Layout } from "./components/layouts";
import { Page, PageContent, PageHeader } from "./components/page";

export default function DesignPage() {
  return (
    <Layout>
      <Page>
        <PageHeader />
        <PageContent>
          {new Array(100).fill(0).map((_, index) => (
            <div key={index} className="h-10 w-full">
              {index}
            </div>
          ))}
        </PageContent>
      </Page>
    </Layout>
  );
}
