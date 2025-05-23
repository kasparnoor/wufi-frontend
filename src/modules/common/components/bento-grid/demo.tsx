import { Bone, Calendar, AlertCircle, Package, Heart } from "lucide-react";
import { BentoGrid, BentoCard } from "./index";

const features = [
  {
    Icon: Bone,
    name: "Personaliseeritud toitumiskava",
    description: "Loome just teie lemmikule sobiva toitumiskava, mis arvestab tema tõu, vanuse ja vajadustega.",
    href: "/products",
    cta: "Vaata tooteid",
    background: <img src="https://images.unsplash.com/photo-1623387641168-d9803ddd3f35" alt="Personaliseeritud toitumiskava" className="absolute inset-0 w-full h-full object-cover opacity-80" />,    
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: Calendar,
    name: "Regulaarne kohaletoimetamine",
    description: "Vali oma lemmikule sobiv tarne sagedus ja me toimetame toidu ukseni just siis, kui seda vaja on.",
    href: "/shipping",
    cta: "Loe tarnetingimustest",
    background: <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7" alt="Regulaarne kohaletoimetamine" className="absolute inset-0 w-full h-full object-cover opacity-80" />,    
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: AlertCircle,
    name: "Allergiate arvestamine",
    description: "Pakume allergiavaba toitu, mis sobib kõige tundlikumatele lemmikloomadele.",
    href: "/products?tag=allergiavaba",
    cta: "Allergiavabad tooted",
    background: <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee" alt="Allergiate arvestamine" className="absolute inset-0 w-full h-full object-cover opacity-80" />,    
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: Package,
    name: "Ökosõbralik pakendamine",
    description: "Kõik meie pakendid on täielikult taaskasutatavad ja loodussõbralikud.",
    href: "/about",
    cta: "Loe rohkem",
    background: <img src="https://images.unsplash.com/photo-1582408921715-18e7806365c1" alt="Ökosõbralik pakendamine" className="absolute inset-0 w-full h-full object-cover opacity-80" />,    
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Heart,
    name: "Klienditugi 24/7",
    description: "Meie toitumiseksperdid on teie jaoks olemas ööpäevaringselt, et vastata kõigile lemmiklooma hoolduse küsimustele.",
    href: "/contact",
    cta: "Küsi nõu",
    background: <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad" alt="Klienditugi 24/7" className="absolute inset-0 w-full h-full object-cover opacity-80" />,    
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