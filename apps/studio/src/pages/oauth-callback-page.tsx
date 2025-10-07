import { useParams } from "react-router-dom";

export function OAuthCallbackPage() {
  const { workspaceId, targetId } = useParams();

  return (
    <div>
      Got a callback for {workspaceId} {targetId}
    </div>
  );
}
