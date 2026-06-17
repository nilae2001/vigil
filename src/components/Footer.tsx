import { GithubIcon, Globe, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <img src="/vigil.png" alt="Vigil Logo" className="h-6 w-auto  " />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild>
            <a
              href="https://github.com/nilae2001/vigil"
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">GitHub</span>
            </a>
          </Button>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Made with{" "}
            <Heart className="inline-block h-3 w-3 text-red-500 fill-red-500" />{" "}
            by{" "}
            <a
              href="https://www.nilaerturk.com"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-blue-400 hover:underline underline-offset-4"
            >
              nila.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
