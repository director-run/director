"use client";

import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";

export default function PleaseUpdate() {
  return (
    <FullScreenError
      title={"Please Update Director"}
      fullScreen={true}
      subtitle={
        "This version of the studio is no longer used. Please update the CLI to use the hosted version."
      }
      data={[
        "$ npm install -g @director.run/cli@latest",
        "$ director quickstart",
      ].join("\n")}
    />
  );
}
