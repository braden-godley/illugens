import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import { api } from "@/utils/api";

const links: Array<{
  text: string;
  url: string;
  pattern: RegExp;
}> = [
  {
    text: "Generate",
    url: "/",
    pattern: /^\/$/,
  },
  {
    text: "Gallery",
    url: "/gallery",
    pattern: /^\/gallery$/,
  },
];

const NavigationBar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const matching = links.findIndex((link) => link.pattern.test(pathname));
  const tokensQuery = api.token.getTokens.useQuery();
  return (
    <nav className={cn("container mx-auto my-4 flex justify-between")}>
      <ul className="flex items-center space-x-4 lg:space-x-6">
        {links.map((link, i) => (
          <Link
            key={link.text}
            href={link.url}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              i !== matching ? "text-muted-foreground" : "",
            )}
          >
            {link.text}
          </Link>
        ))}
      </ul>
      {session !== null && (<div className="flex items-center space-x-4 lg:space-x-6">
        <p className="text-sm">Tokens: {tokensQuery.data}</p>
        <Button variant="ghost" size="sm" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
      )}
    </nav>
  );
};

export default NavigationBar;
