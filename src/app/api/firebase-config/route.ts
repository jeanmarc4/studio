import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'lib', 'firebase-config.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(fileContents);
    return NextResponse.json(config);
  } catch (error) {
    console.error("Failed to read firebase-config.json:", error);
    return new NextResponse('Firebase configuration could not be loaded.', { status: 500 });
  }
}
