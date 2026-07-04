export type ModuleBadgeTone = "green" | "blue" | "neutral";

export interface HeroSlide {
  title: string;
  src: string;
}

export interface LauncherModule {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeTone: ModuleBadgeTone;
  href: string;
  isActive?: boolean;
}
