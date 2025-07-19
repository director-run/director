import {
  ShellBreadcrumb,
  ShellBreadcrumbList,
  ShellBreadcrumbPage,
} from "@director.run/design/components/shell";

export default function BreadcrumbPage() {
  return (
    <ShellBreadcrumb>
      <ShellBreadcrumbList>
        <ShellBreadcrumbPage>Registry</ShellBreadcrumbPage>
      </ShellBreadcrumbList>
    </ShellBreadcrumb>
  );
}
