import { useProxyQueryStates } from "@/hooks/use-proxy-query-states";
import { Proxy } from "@director/backend/src/services/db/schema";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { INTEGRATION_CONTENT } from "./contants";

export function IntegrationDialog({ proxy }: { proxy: Proxy }) {
  const [{ integrationId }, setProxyQueryStates] = useProxyQueryStates();

  const isManual = integrationId === "manual";
  const integration = integrationId ? INTEGRATION_CONTENT[integrationId] : null;
  const isInstalled =
    integrationId && !isManual && proxy.integrations.includes(integrationId);

  return (
    <AlertDialog
      open={!!integration}
      onOpenChange={() => {
        setProxyQueryStates({
          integrationId: null,
        });
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{integration?.title}</AlertDialogTitle>
          <AlertDialogDescription>
            {integration?.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {integration?.children && integration.children}
        <AlertDialogFooter>
          <AlertDialogCancel>{isManual ? "Okay" : "Cancel"}</AlertDialogCancel>
          {!isManual && <Button>{isInstalled ? "Remove" : "Add"}</Button>}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
