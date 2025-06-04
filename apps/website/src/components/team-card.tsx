import Image from "next/image";
import type { ComponentProps } from "react";

import { SocialIcon } from "@/components/social-icon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { SiteConfigMember } from "@/site-config";

type TeamCardProps = ComponentProps<typeof Card> & SiteConfigMember;

export function TeamCard({
  className,
  name,
  description,
  links,
  image,
  ...props
}: TeamCardProps) {
  return (
    <Card className={cn("flex flex-col", className)} {...props}>
      <CardHeader className="grow">
        <Image
          src={image}
          width={48}
          height={48}
          alt={name}
          className="mb-3 size-12 rounded-full bg-accent object-cover"
        />
        <CardTitle>{name}</CardTitle>
        <CardDescription className="text-sm leading-snug">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="!py-3">
        <div className="group flex flex-row flex-wrap gap-2 transition-all duration-300 ease-in-out *:hover:opacity-100 *:group-focus-within:opacity-20 *:group-focus-within:focus-visible:opacity-100 *:group-hover:opacity-20">
          {links.map((it) => (
            <a
              key={`${name}_${it.type}`}
              href={it.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-fg-subtle hover:text-primary [&>svg]:size-5"
            >
              <SocialIcon type={it.type} />
              <span className="sr-only">{it.type}</span>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
