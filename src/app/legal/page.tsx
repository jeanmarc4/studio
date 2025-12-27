import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Mentions Légales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Éditeur de l'application</h2>
            <p>
              L'application Santé Zen est éditée par [Votre Nom ou Nom de votre société], [Votre statut juridique].
            </p>
            <p>
              Adresse : [Votre adresse]
            </p>
            <p>
              Email de contact : <a href="mailto:sentinelle06@gmail.com" className="text-primary hover:underline">sentinelle06@gmail.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. Hébergement</h2>
            <p>
              L'application est hébergée par Google Firebase, un service fourni par Google Ireland Limited.
            </p>
            <p>
              Adresse : Gordon House, Barrow Street, Dublin 4, Irlande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Propriété Intellectuelle</h2>
            <p>
              Tous les contenus présents sur l'application Santé Zen, incluant, de façon non limitative, les graphismes, images, textes, vidéos, animations, sons, logos, gifs et icônes ainsi que leur mise en forme sont la propriété exclusive de l'éditeur à l'exception des marques, logos ou contenus appartenant à d'autres sociétés partenaires ou auteurs.
            </p>
          </section>
          
           <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Avertissement Médical</h2>
            <p>
              Santé Zen est un outil de suivi et d'assistance personnelle. Les informations et services proposés ne constituent en aucun cas un conseil médical, un diagnostic ou un traitement. Consultez toujours un professionnel de santé qualifié pour toute question médicale.
            </p>
          </section>

          <div className="text-center pt-8">
            <Link href="/" className="text-primary hover:underline">
                Retour à l'accueil
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
