export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold font-headline mb-6 text-primary">Politique de Confidentialité (RGPD)</h1>
      <div className="space-y-6 text-foreground/90">
        <p>
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>

        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">1. Collecte des données personnelles</h2>
          <p>
            Dans le cadre de l'utilisation de l'application SanteConnect, nous collectons les données suivantes :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Données d'identification :</strong> Nom, prénom, adresse e-mail lors de la création de votre compte.</li>
            <li><strong>Données de santé :</strong> Informations sur vos médicaments, rendez-vous, ordonnances et symptômes que vous saisissez volontairement dans l'application.</li>
            <li><strong>Données de connexion :</strong> Informations techniques nécessaires au bon fonctionnement de nos services.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">2. Finalité du traitement des données</h2>
          <p>
            Vos données sont collectées et traitées dans le but exclusif de vous fournir les services de SanteConnect, notamment :
          </p>
           <ul className="list-disc list-inside mt-2 space-y-1">
            <li>La gestion de votre compte utilisateur.</li>
            <li>L'organisation de vos rendez-vous et traitements médicamenteux.</li>
            <li>La fourniture de services basés sur l'IA (analyse de symptômes, lecture d'ordonnances).</li>
            <li>La participation au forum communautaire.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">3. Sécurité et hébergement des données</h2>
          <p>
            Vos données sont hébergées sur les serveurs sécurisés de Firebase (Google) en Europe. Nous mettons en œuvre des mesures de sécurité strictes pour protéger vos données contre tout accès non autorisé. Vos données de santé sont stockées dans une base de données sécurisée (Firestore) avec des règles d'accès qui garantissent que seul vous pouvez accéder à vos informations personnelles.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">4. Partage des données</h2>
          <p>
            SanteConnect ne partage, ne vend et ne loue vos données personnelles à aucun tiers. Les données envoyées à nos modèles d'IA sont utilisées uniquement pour vous fournir une réponse et ne sont pas conservées à des fins d'entraînement des modèles.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">5. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants concernant vos données :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Droit d'accès, de rectification et de suppression de vos données.</li>
            <li>Droit à la portabilité de vos données.</li>
            <li>Droit de limiter ou de vous opposer au traitement de vos données.</li>
          </ul>
          <p className="mt-2">
            Vous pouvez exercer ces droits en nous contactant à l'adresse suivante : <a href="mailto:diojm93@gmail.com" className="text-primary hover:underline">diojm93@gmail.com</a>. Vous pouvez également supprimer votre compte et toutes les données associées directement depuis votre profil (fonctionnalité à venir).
          </p>
        </section>

         <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">6. Cookies</h2>
          <p>
            Nous utilisons uniquement des cookies essentiels au fonctionnement de l'application, tels que ceux nécessaires à la gestion de votre session de connexion. Nous n'utilisons pas de cookies de suivi ou publicitaires.
          </p>
        </section>
      </div>
    </div>
  );
}
