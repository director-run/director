import deepmerge from "deepmerge";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

const fileNames = ["global", "home"];

async function getAndMergeMessages(locale: string) {
  const results = await Promise.all(
    fileNames.map(async (fileName) => {
      const fileJson = (
        await import(`../../locales/${locale}/${fileName}.json`)
      ).default;

      if (fileName === "global") {
        return fileJson;
      }

      return { [fileName.replace(".json", "")]: fileJson };
    }),
  );

  return results.reduce((acc, curr) => deepmerge(acc, curr), {});
}

const defaultMessages = await getAndMergeMessages("en");

// biome-ignore lint/style/noDefaultExport: Required
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const localMessages = await getAndMergeMessages(locale);

  return {
    locale,
    messages: deepmerge(defaultMessages, localMessages),
  };
});
