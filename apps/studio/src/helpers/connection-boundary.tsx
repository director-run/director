import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { FullScreenLoader } from "@director.run/design/components/pages/global/loader.tsx";
import { gatewayClient } from "../contexts/backend-context";

const REFRESH_INTERVAL = 5_000;

export const ConnectionBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { error, isLoading } = gatewayClient.health.useQuery(undefined, {
    refetchInterval: REFRESH_INTERVAL,
    retry: false,
    throwOnError: false,
    enabled: true,
  });

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (error) {
    return (
      <FullScreenError
        icon="plugs"
        fullScreen={true}
        title={"Can't connect to the backend"}
        subtitle={"Please make sure director is running and refresh the page."}
        data={[
          "# Start director",
          "$ director serve",
          "$ director studio",
        ].join("\n")}
      />
    );
  }

  return <>{children}</>;
};
