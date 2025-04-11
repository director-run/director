import { IntegrationButton } from "@/components/integrations/integration-button";
import {
  type Proxy,
  integrationEnum,
} from "@director/backend/src/services/db/schema";

interface ProxyIntegrationsProps {
  proxy: Proxy;
}

export function ProxyIntegrations({ proxy }: ProxyIntegrationsProps) {
  return (
    <div className="flex flex-row gap-x-2">
      {integrationEnum.options.map((it) => {
        return (
          <IntegrationButton
            key={it}
            integrationId={it}
            isInstalled={proxy.integrations.includes(it)}
          />
        );
      })}
    </div>
  );
}
