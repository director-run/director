"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "../ui/button";
import { Loader } from "../ui/loader";
import { useConnectContext } from "./connect-context";
import { useConnectDialog } from "./connect-dialog";

export function ConnectButton() {
  const router = useRouter();
  const { status, proxies } = useConnectContext();
  const dialogProps = useConnectDialog();

  useHotkeys(
    "m",
    () => {
      if (status === "ready") {
        router.push("/manage");
      } else {
        dialogProps.onOpenChange(true);
      }
    },
    {
      ignoreModifiers: true,
      enableOnFormTags: false,
    },
  );

  if (status === "loading") {
    return (
      <Button
        className="ml-auto"
        onClick={() => dialogProps.onOpenChange(true)}
      >
        <Loader />
        <span>Connect</span>
      </Button>
    );
  }

  return (
    <Button className="ml-auto" asChild>
      <Link
        href={
          proxies.length === 0 ? "/proxies/new" : `/proxies/${proxies[0].id}`
        }
      >
        <span className="opacity-70">[m]</span>
        <span>Manage</span>
      </Link>
    </Button>
  );
}
