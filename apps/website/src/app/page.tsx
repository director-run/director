import { Logo } from "@director/ui/components/brand";

export default async function HomePage() {
  return (
    <div className="p-8">
      <Logo />
      <div className="font-medium tracking-wide">director.run</div>
      <div className="font-light tracking-wide">Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</div>
    </div>
  );
}
