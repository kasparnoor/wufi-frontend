import { Repeat, MapPin, ShieldCheck, Heart, TrendingUp } from "lucide-react";
import { BentoGrid, BentoCard } from "./index";
import Image from "next/image";

const features = [
  {
    Icon: Repeat,
    name: "Telli kord, unusta muretsemine",
    description: "Kraps teab su lemmiku toidurutiini paremini kui sina ise.",
    href: "/meist",
    cta: "Loe meist",
    background: (
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src="/images/features/unustamuretsemine.jpg" 
          alt="Telli kord, unusta muretsemine"
          fill
          className="object-cover opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/50 to-indigo-500/60"></div>
      </div>
    ),    
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: MapPin,
    name: "Meie oma – Eestis tehtud, Balti loomadele mõeldud",
    description: "Me ei ole välismaine hiid. Meie loome seda teenust ise, siinsamas.",
    href: "/klienditugi",
    cta: "Võta meiega ühendust",
    background: (
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src="/images/features/estonia.jpg" 
          alt="Eestis tehtud"
          fill
          className="object-cover opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/50 to-emerald-500/60"></div>
      </div>
    ),    
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: ShieldCheck,
    name: "Ainult hoolikalt valitud, kvaliteetsed tooted",
    description: "Me ei müü seda, mida me ise ei annaks oma koerale või kassile. Krapsis on ainult brändid, millele saab kindel olla.",
    href: "/categories",
    cta: "Sirvi meie tootevalikut",
    background: (
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src="/images/features/quality.jpg" 
          alt="Kvaliteetsed tooted"
          fill
          className="object-cover opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/50 to-orange-500/60"></div>
      </div>
    ),    
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Heart,
    name: "Teenindus, mis hoolib su lemmikust nagu sina ise",
    description: "Kui loom saab aasta vanemaks, saadame kaardi. Kui juhtub kurb päev, ei jää sa märkamatuks.",
    href: "/klienditugi",
    cta: "Võta meiega ühendust",
    background: (
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src="/images/features/support.jpg" 
          alt="Teenindus mis hoolib"
          fill
          className="object-cover opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-pink-400/50 to-red-500/60"></div>
      </div>
    ),    
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: TrendingUp,
    name: "Mida rohkem kasutad, seda targemaks muutub",
    description: "Kraps õpib su lemmiku eelistusi, et pakkuda iga kuuga paremat teenust.",
    href: "/konto",
    cta: "Loo oma konto",
    background: (
      <div className="absolute inset-0 w-full h-full">
        <Image 
          src="/images/features/learnsmarter.jpg" 
          alt="Mida rohkem kasutad, seda targemaks muutub"
          fill
          className="object-cover opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/50 to-violet-500/60"></div>
      </div>
    ),    
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export const BentoDemo = () => (
  <BentoGrid className="lg:grid-rows-3">
    {features.map((feature) => (
      <BentoCard key={feature.name} {...feature} />
    ))}
  </BentoGrid>
); 