"use client";
import { FullScreenError } from "../../components/pages/global/error";

export default function ProxiesPage() {
  return (
    <FullScreenError
      title={"Please Update Director"}
      fullScreen={true}
      subtitle={
        "This version of the studio is out of date. Please update the CLI to continue."
      }
      data={[
        "# Update CLI",
        "$ npm install -g @director.run/cli@latest",
        "$ director quickstart",
      ].join("\n")}
    />
  );
}
