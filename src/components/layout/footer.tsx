import Link from "next/link";
import { Separator } from "../ui/separator";

export function AppFooter() {
    return (
        <footer className="p-6 mt-auto">
            <Separator />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-sm text-muted-foreground pt-6">
                <p>&copy; {new Date().getFullYear()} Santé Zen. Tous droits réservés.</p>
                <div className="flex items-center gap-4">
                    <Link href="/privacy" className="hover:text-primary transition-colors">
                        Politique de Confidentialité
                    </Link>
                    <Link href="/legal" className="hover:text-primary transition-colors">
                        Mentions Légales
                    </Link>
                     <a href="mailto:sentinelle06@gmail.com" className="hover:text-primary transition-colors">
                        Contact
                    </a>
                </div>
            </div>
        </footer>
    )
}
