'use client';

import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            fontFamily: 'sans-serif',
            height: '100vh',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#212121',
            color: '#f5f5f5',
            padding: '2rem',
          }}
        >
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff5252' }}>
            Oops! L'application a planté.
          </h1>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', fontWeight: 500 }}>
            Une erreur client non gérée s'est produite.
          </h2>
          <div
            style={{
              backgroundColor: '#333',
              borderRadius: '8px',
              padding: '1.5rem',
              textAlign: 'left',
              maxWidth: '800px',
              width: '100%',
              overflow: 'auto',
            }}
          >
            <h3 style={{ color: '#ff8a80', margin: '0 0 1rem 0' }}>
              Détails de l'erreur :
            </h3>
            <p style={{ fontWeight: 'bold', color: '#f5f5f5', marginBottom: '0.5rem' }}>
              {error.message}
            </p>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: '#bdbdbd',
                fontSize: '0.8rem',
                maxHeight: '300px',
                overflowY: 'auto',
                border: '1px solid #444',
                padding: '1rem',
                borderRadius: '4px',
              }}
            >
              {error.stack}
            </pre>
          </div>
          <p style={{ marginTop: '2rem', color: '#aaa' }}>
            Veuillez copier/coller ce message d'erreur et me le fournir pour
            que je puisse le corriger.
          </p>
          <Button onClick={() => reset()} style={{ marginTop: '1rem' }}>
            Essayer de recharger
          </Button>
        </div>
      </body>
    </html>
  );
}
