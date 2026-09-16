import { Logo } from "@/components/shared/logo";
import { Link } from "@/i18n/navigation";

/** Brand mark above the sign-in flow; links back to the homepage. */
export function AuthBrand() {
  return (
    <Link href="/" aria-label="سِيرة" className="rounded-md transition-opacity hover:opacity-80">
      <Logo className="h-10" />
    </Link>
  );
}
