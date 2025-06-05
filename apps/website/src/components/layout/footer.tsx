import { Container } from "@/components/layout/container";
import { SocialIcon } from "@/components/social-icon";
import { Logo } from "@/components/ui/logo";
import { Pattern } from "@/components/ui/pattern";
import { cn } from "@/lib/cn";
import { siteConfig } from "@/site-config";
import { Button, ButtonLabel } from "../ui/button";

export function Footer() {
  return (
    <footer data-slot="footer" className="bg-accent">
      <div className="relative">
        <Container className="relative z-10 flex flex-col-reverse pb-12 sm:flex-col sm:pt-6 sm:pb-0 md:pt-8 lg:pt-12">
          <div className="flex flex-col items-center gap-y-6 sm:flex-row sm:justify-between">
            <div
              className={cn(
                "flex flex-row items-center justify-center gap-1 sm:justify-start",
                "group transition-all duration-300 ease-in-out *:hover:opacity-100 *:group-focus-within:opacity-20 *:group-focus-within:focus-visible:opacity-100 *:group-hover:opacity-20",
              )}
            >
              {siteConfig.navigation.map((it) => {
                return (
                  <Button
                    key={it.label}
                    className="bg-surface ring-offset-4 ring-offset-accent [&:nth-child(2n)]:rounded-full"
                    size="xs"
                    variant="secondary"
                    asChild
                  >
                    <a href={it.href}>
                      <ButtonLabel>{it.label}</ButtonLabel>
                    </a>
                  </Button>
                );
              })}
            </div>

            <div
              className={cn(
                "flex flex-row items-center justify-center gap-5 sm:justify-start",
                "group transition-all duration-300 ease-in-out *:hover:opacity-100 *:group-focus-within:opacity-20 *:group-focus-within:focus-visible:opacity-100 *:group-hover:opacity-20",
              )}
            >
              {siteConfig.profiles.map((it) => {
                return (
                  <a
                    key={it.type}
                    href={it.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-accent text-fg ring-offset-4 ring-offset-accent"
                  >
                    <div className="sr-only">Follow on {it.type}</div>
                    <SocialIcon type={it.type} className="size-6" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 py-16">
            <Logo className="size-12" />
            <div className="flex flex-col items-center gap-1.5">
              <span className="bg-accent font-medium text-xl leading-6 ring-2 ring-accent">
                Director
              </span>
              <span className="bg-accent font-[450] text-base text-fg/75 leading-5 ring-2 ring-accent">
                Made with Ritalin
              </span>
            </div>
          </div>
        </Container>

        <Pattern
          type="dots"
          size={2}
          gap={10}
          patternOffset={{ x: 0, y: 7 }}
          className="pointer-events-none absolute inset-0 z-0 text-fg"
        />
      </div>
    </footer>
  );
}
