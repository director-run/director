import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// biome-ignore lint/style/noDefaultExport: <explanation>
export default createMiddleware(routing);

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|icon|install|_next|_vercel|.*\\..*).*)",
};
