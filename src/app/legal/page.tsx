export default function LegalPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold font-headline mb-6 text-primary">Mentions Légales</h1>
      <div className="space-y-6 text-foreground/90">
        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">1. Éditeur du site</h2>
          <p>
            Ce site est édité par SanteConnect.
          </p>
          <p>
            Responsable de la publication : [Votre Nom ou Nom de l'entreprise]
          </p>
          <p>
            Adresse e-mail de contact : <a href="mailto:diojm93@gmail.com" className="text-primary hover:underline">diojm93@gmail.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">2. Hébergement</h2>
          <p>
            Ce site est hébergé par Firebase, un service de Google.
          </p>
          <p>
            Google LLC
            <br />
            1600 Amphitheatre Parkway
            <br />
            Mountain View, CA 94043, USA
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">3. Propriété intellectuelle</h2>
          <p>
            L'ensemble des contenus de ce site (textes, images, logos, etc.) est la propriété exclusive de SanteConnect ou fait l'objet d'une autorisation d'utilisation. Toute reproduction, même partielle, est interdite sans autorisation préalable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold font-headline mb-3">4. Limitation de responsabilité</h2>
          <p>
            Les informations fournies par SanteConnect, y compris par son assistant IA, ne constituent en aucun cas un avis médical. Elles sont fournies à titre indicatif et ne remplacent pas une consultation avec un professionnel de la santé qualifié. L'utilisateur est seul responsable de l'interprétation et de l'utilisation des informations mises à sa disposition.
          </p>
        </section>
      </div>
    </div>
  );
}
