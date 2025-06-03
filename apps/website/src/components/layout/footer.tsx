import { Container } from "@/components/layout/container";
import { Logo } from "@/components/ui/logo";
import { Pattern } from "@/components/ui/pattern";

export function Footer() {
  return (
    <footer className="relative bg-accent/50">
      <Container className="py-16 md:py-24">
        <div className="flex flex-col items-center gap-4">
          <Logo className="size-12" />
          <div className="flex flex-col items-center gap-1">
            <span className="bg-bg/50 font-medium text-xl leading-6">
              director.run
            </span>
            <span className="bg-bg/50 font-normal text-base text-fg/90 leading-5">
              Made with Ritalin
            </span>
          </div>
        </div>
      </Container>

      <Pattern
        type="dots"
        size={1.25}
        className="-z-10 pointer-events-none absolute inset-0 text-fg/30"
      />
    </footer>
  );
}
