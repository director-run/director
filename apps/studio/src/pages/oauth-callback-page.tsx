import { FullScreenError } from "@director.run/design/components/pages/global/error.tsx";
import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useOnboardingProgress } from "../hooks/use-onboarding-progress.ts";

export function OAuthCallbackPage() {
  const { playbookId, targetId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { inProgress } = useOnboardingProgress();

  const error = searchParams.get("error");

  useEffect(() => {
    if (error) {
      return;
    }
    if (inProgress) {
      navigate(`/get-started`);
      return;
    }
    if (playbookId && targetId) {
      navigate(`/${playbookId}`);
    }
  }, [error, inProgress, playbookId, targetId, navigate]);

  if (error) {
    return (
      <FullScreenError
        title="Authentication failed"
        fullScreen
        data={JSON.stringify(error, null, 2)}
      />
    );
  }

  return null;
}
