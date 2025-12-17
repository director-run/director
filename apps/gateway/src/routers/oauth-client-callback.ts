import { createOauthCallbackRouter } from "@director.run/mcp/oauth/oauth-callback-router";
import { getLogger } from "@director.run/utilities/logger";
import {} from "@director.run/utilities/middleware/index";
import { joinURL } from "@director.run/utilities/url";
import { auth } from "../auth";
import { env } from "../env";
import { PlaybookStore } from "../playbooks/playbook-store";

const logger = getLogger("OauthClientRouter");

export const createOauthClientRouter = ({
  playbookStore,
}: { playbookStore: PlaybookStore }) =>
  createOauthCallbackRouter({
    getSession: async (req) => {
      const session = await auth.api.getSession({
        headers: req.headers as Record<string, string>,
      });
      if (!session) {
        return null;
      }
      return { userId: session.user.id };
    },
    onAuthorizationSuccess: async (factoryId, providerId, code, userId) => {
      await playbookStore.onAuthorizationSuccess(
        factoryId,
        providerId,
        code,
        userId,
      );
      return {
        redirectUrl: joinURL(
          env.BASE_URL,
          `studio/oauth/${factoryId}/${providerId}/callback`,
        ),
      };
    },
    onAuthorizationError: (factoryId, providerId, error) => {
      logger.error({
        error,
        message: `failed to authorize ${factoryId} ${providerId}: ${error.message}`,
      });

      return {
        redirectUrl: joinURL(
          env.BASE_URL,
          `studio/oauth/${factoryId}/${providerId}/callback?error=${encodeURIComponent(error.message)}`,
        ),
      };
    },
  });
