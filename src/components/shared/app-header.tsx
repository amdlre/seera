import { LogoutButton } from "@/components/auth/logout-button";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { Logo } from "@/components/shared/logo";
import { Link } from "@/i18n/navigation";

/** Sticky header for signed-in pages: brand, locale toggle, and sign-out. */
export function AppHeader() {
  return (
    <header className="border-border bg-background sticky top-0 z-40 flex items-center justify-between border-b px-6 py-3">
      <Link href="/dashboard" aria-label="سِيرة">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <LogoutButton />
      </div>
    </header>
  );
}
