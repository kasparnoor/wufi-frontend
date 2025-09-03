"use client"

import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { KrapsButton, LocalizedClientLink } from "@lib/components";

export interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => {
  return (
    <div
      className={clsx(
        "grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-3 gap-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export interface BentoCardProps {
  name: string;
  className?: string;
  background: ReactNode;
  Icon: React.ComponentType<{ className?: string }>;
  description: string;
  href: string;
  cta: string;
}

export const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: BentoCardProps) => (
  <div
    className={clsx(
      "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl",
      "bg-white border border-gray-100 hover:border-yellow-300 shadow-sm hover:shadow-md",
      "transform-gpu transition-all duration-300 hover:-translate-y-1",
      className
    )}
  >
    <div className="absolute inset-0 overflow-hidden">{background}</div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40 z-[1]"></div>
    <div className="pointer-events-none relative z-10 flex flex-col gap-1 p-6 pt-12 pb-24 md:pb-12 mt-auto transition-all duration-300 transform-gpu md:group-hover:-translate-y-8">
      <div className="sticky top-3 w-12 h-12 bg-yellow-400/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-6 w-6 text-yellow-400 transition-all duration-300 ease-in-out group-hover:scale-75" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-yellow-300 transition-colors">
        {name}
      </h3>
      <p className="text-white/90">{description}</p>
    </div>
    <div className="absolute bottom-0 flex w-full md:translate-y-10 transform-gpu flex-row items-center p-4 md:opacity-0 transition-all duration-300 md:group-hover:translate-y-0 md:group-hover:opacity-100 z-20 mt-8">
      <LocalizedClientLink href={href} className="pointer-events-auto">
        <KrapsButton variant="primary" size="small" className="flex items-center">
          {cta}
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </KrapsButton>
      </LocalizedClientLink>
    </div>
    <div className="absolute inset-0 pointer-events-none transform-gpu transition-all duration-300 group-hover:bg-black/40" />
  </div>
);