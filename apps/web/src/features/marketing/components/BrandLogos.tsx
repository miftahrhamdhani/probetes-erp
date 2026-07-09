import * as React from "react";

export function TikTokLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" {...props}>
      <path d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
    </svg>
  );
}

export function ShopeeLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.42 5.09A4.1 4.1 0 0 0 12 2a4.1 4.1 0 0 0-3.42 3.09L2.51 7.21a.73.73 0 0 0-.5.84l2.12 11.23a1.44 1.44 0 0 0 1.41 1.18h12.92a1.44 1.44 0 0 0 1.41-1.18l2.12-11.23a.73.73 0 0 0-.5-.84l-6.07-2.12zM12 3.46a2.64 2.64 0 0 1 2 1.83H10a2.64 2.64 0 0 1 2-1.83zm-1.07 11.2c-.8-.11-1.4-.41-1.79-.88a.74.74 0 0 1 1.12-1.04c.15.17.43.34.82.38.38.04.75-.02.93-.15.22-.16.29-.41.13-.67-.14-.24-.46-.38-.99-.54l-.4-.12c-1.05-.33-1.63-.78-1.78-1.39-.14-.52 0-1.13.43-1.64.44-.52 1.09-.84 1.87-.93 1.05-.12 1.94.13 2.51.54a.74.74 0 0 1-.87 1.2c-.31-.22-.84-.4-1.46-.33-.35.04-.63.18-.76.32-.15.18-.18.42-.04.66.1.18.3.31.76.45l.4.13c1.3.41 1.91.95 2.08 1.63.17.65 0 1.34-.49 1.89-.5.56-1.25.9-2.09.99-.13.01-.25.02-.38.02-.73.01-1.47-.14-2.01-.3z" />
    </svg>
  );
}

export function MetaLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth={10} {...props}>
       <path d="M 25 35 C 10 35 10 65 25 65 C 40 65 50 35 75 35 C 90 35 90 65 75 65 C 60 65 50 35 25 35" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SkalevLogo(props: React.SVGProps<SVGSVGElement>) {
  // A sleek 'S' representation for Skalev
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} {...props}>
      <path d="M16 8 L16 6 C16 4 14 3 12 3 C10 3 8 4 8 6 L8 7 C8 9 9 10 11 11 L13 12 C15 13 16 14 16 16 L16 17 C16 19 14 21 12 21 C10 21 8 19 8 17 L8 15" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
