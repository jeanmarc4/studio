
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Activer le mode maintenance via la variable d'environnement
  if (process.env.MAINTENANCE_MODE === 'true') {
    const { pathname } = request.nextUrl;

    // Autoriser l'accès à la page de maintenance elle-même et aux ressources nécessaires (fichiers, images)
    if (
      pathname.startsWith('/maintenance') ||
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/api/') ||
      pathname.match(/\.(.*)$/) // Exclut les fichiers (ex: .png, .css)
    ) {
      return NextResponse.next();
    }

    // Rediriger toutes les autres requêtes vers la page de maintenance
    const url = request.nextUrl.clone();
    url.pathname = '/maintenance';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Ce middleware s'appliquera à toutes les routes
export const config = {
  matcher: '/:path*',
};
