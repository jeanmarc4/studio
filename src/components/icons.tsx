import type { SVGProps, ImgHTMLAttributes } from "react";

const iconUrl = "https://firebasestorage.googleapis.com/v0/b/studio-9090208553-5057b.appspot.com/o/FCMImages%2Fsantezen_192x192.png?alt=media&token=ee6970e2-7bdd-48c8-9be9-0d6ad0e53496";


export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        clipRule="evenodd"
      />
      <path
        fill="#fff"
        d="M13 8h-2v3H8v2h3v3h2v-3h3v-2h-3V8z"
      />
    </svg>
  );
}


export function UserMd(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M12 13h-1a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1Z" />
            <path d="M18 12.5h-2" />
            <path dM="15 15.4l1 1" />
            <path dM="15 9.6l1-1" />
        </svg>
    )
}

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M12.24 10.28c.14-.4.24-.81.24-1.28 0-2.21-1.79-4-4-4s-4 1.79-4 4 1.79 4 4 4c.47 0 .88-.09 1.28-.24"/>
            <path d="M12.24 10.28L15.2 13.25"/><path d="M15.2 13.25L18.4 10.1"/><path d="M18.4 10.1L21.6 7"/><path d="M12.24 10.28c.14.4.24.81.24 1.28 0 2.21-1.79 4-4 4s-4-1.79-4 4 1.79-4 4-4c.47 0 .88.09 1.28-.24"/>
            <path d="M22 12c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2c2.21 0 4.21.72 5.88 1.9l-2.88 2.88"/><path d="M22 12h-4"/>
        </svg>
    )
}
