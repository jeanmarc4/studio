import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Politique de Confidentialité</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-muted-foreground">
            <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">Introduction</h2>
            <p>
              La présente Politique de Confidentialité décrit la manière dont Santé Zen collecte, utilise et protège vos données personnelles dans le cadre de l'utilisation de notre application, conformément au Règlement Général sur la Protection des Données (RGPD).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">1. Données Collectées</h2>
            <p>
              Nous collectons les données suivantes :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li><strong>Informations de compte :</strong> Nom, adresse e-mail, mot de passe chiffré.</li>
                <li><strong>Données de santé :</strong> Médicaments, rendez-vous, médecins, suivis de pathologies (glycémie, tension, etc.), fichiers médicaux. Ces données sont stockées de manière sécurisée et ne sont accessibles que par vous.</li>
                <li><strong>Données d'utilisation :</strong> Interactions avec l'application pour améliorer nos services.</li>
            </ul>
          </section>

           <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">2. Utilisation de vos données</h2>
            <p>
              Vos données sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Fournir les fonctionnalités de l'application (rappels, suivis).</li>
                <li>Personnaliser votre expérience.</li>
                <li>Assurer la sécurité de votre compte.</li>
                <li>Communiquer avec vous concernant votre compte ou nos services.</li>
            </ul>
             <p className="mt-2 font-semibold">Nous ne vendons ni ne partageons jamais vos données de santé avec des tiers à des fins commerciales.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">3. Sécurité des données</h2>
            <p>
              Nous utilisons Firebase Authentication et Firestore, des services de Google, qui appliquent des mesures de sécurité robustes pour protéger vos données. L'accès à vos données est protégé par des règles de sécurité strictes, garantissant que seul vous pouvez y accéder.
            </p>
          </section>
          
           <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">4. Vos Droits</h2>
            <p>
              Conformément au RGPD, vous disposez des droits suivants sur vos données :
            </p>
             <ul className="list-disc list-inside space-y-1 pl-4">
                <li>Droit d'accès.</li>
                <li>Droit de rectification.</li>
                <li>Droit à l'effacement (« droit à l'oubli »).</li>
                <li>Droit à la portabilité des données.</li>
            </ul>
            <p className="mt-2">
              Pour exercer ces droits, veuillez nous contacter à l'adresse e-mail ci-dessous. Vous pouvez également supprimer votre compte et toutes les données associées directement depuis les paramètres de l'application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-2">5. Contact</h2>
            <p>
              Pour toute question relative à cette politique de confidentialité, veuillez nous contacter à : <a href="mailto:sentinelle06@gmail.com" className="text-primary hover:underline">sentinelle06@gmail.com</a>.
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
