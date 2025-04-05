import { Navigate } from "react-router";
import { useConnectionContext } from "../../components/connection/connection-provider";

export function ProxiesIndexRoute() {
  const { servers } = useConnectionContext();

  if (servers.length === 0) {
    return <Navigate to="/get-started" />;
  }

  return <Navigate to={`/proxies/${servers[0].id}`} />;
}
