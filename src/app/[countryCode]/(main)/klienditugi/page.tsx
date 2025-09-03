"use client"

import { useState, useEffect } from "react"
import PageTemplate from "@modules/common/components/page-template"
import { AnimatedSection, InteractiveCard } from "@modules/common/components/animated-section"
import { 
  MessageSquare, 
  HelpCircle, 
  Phone, 
  Mail, 
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
  Truck,
  CreditCard,
  Package,
  User,
  Heart,
  Star
} from "lucide-react"

declare global {
  interface Window {
    $chatwoot?: {
      toggle: (state?: "open" | "close") => void;
    };
  }
}

const KlienditoegiPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [chatwootLoaded, setChatwootLoaded] = useState(false)

  // Initialize Chatwoot widget
  useEffect(() => {
    // Remove existing script if any
    const existingScript = document.getElementById('chatwoot-sdk')
    if (existingScript) {
      existingScript.remove()
    }

    // Load Chatwoot SDK
    const script = document.createElement('script')
    script.id = 'chatwoot-sdk'
    script.src = 'https://app.chatwoot.com/packs/js/sdk.js'
    script.async = true
    
    script.onload = () => {
      if ((window as any).chatwootSDK) {
        (window as any).chatwootSDK.run({
          websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || 'your-website-token', // Add your Chatwoot website token to environment variables
          baseUrl: process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL || 'https://app.chatwoot.com'
        })
        setChatwootLoaded(true)
      }
    }
    
    document.head.appendChild(script)

    return () => {
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const openChat = () => {
    if (window.$chatwoot) {
      window.$chatwoot.toggle('open')
    } else {
      // Fallback if widget not loaded
      alert('Chat ei ole hetkel saadaval. Palun proovige hiljem uuesti või võtke meiega ühendust e-maili või telefoni teel.')
    }
  }

  const faqItems = [
    {
      category: "Tellimine ja maksmine",
      icon: CreditCard,
      questions: [
        {
          q: "Kas pean konto looma, et tellida?",
          a: "Saad tellida nii külalisena kui ka registreeritud kasutajana. Konto loomine on aga soovitatav, sest see annab sulle ligipääsu püsitellimustele, tellimuste ajaloole ning personaalsetele soovitustele."
        },
        {
          q: "Kuidas saan oma eelmise ostukorvi kiirelt uuesti tellida?",
          a: "Logi sisse oma kontole, ava jaotis \"Minu tellimused\" ja klõpsa vastava tellimuse juures nupule \"Telli uuesti\". Samad tooted lisatakse automaatselt ostukorvi, kus saad vajadusel koguseid muuta."
        },
        {
          q: "Kas püsitellimusele kehtib püsisoodustus?",
          a: "Jah, kõik püsitellijad saavad alati vähemalt -5% allahindlust tavahinnast. Kui käimas on suurema soodustusega kampaania, rakendub sinu ostukorvile alati parim hind."
        },
        {
          q: "Kuidas saan püsitellimuse ajutiselt peatada või tarnekuupäeva muuta?",
          a: "Oma konto \"Püsitellimuste\" jaotises saad tellimuse ühe klikiga pausile panna või valida uue sobiva tarnekuupäeva. Muudatus jõustub kohe ja enne uut tarnepäeva arveldamist ei toimu."
        },
        {
          q: "Kas püsitellimuselt saab tooteid jooksvalt lisada või eemaldada?",
          a: "Jah, loomulikult. Püsitellimuse vaates saad tooteid lihtsalt lisada või eemaldada. Muudatused rakenduvad sinu järgmisele tarnele."
        },
        {
          q: "Milliseid maksekaarte aktsepteerite?",
          a: "Aktsepteerime kõiki levinumaid deebet- ja krediitkaarte, sh Visa, Mastercard ja Maestro."
        },
        {
          q: "Kuidas saan kasutada kinkekaarti või sooduskoodi?",
          a: "Sisesta kood ostukorvis või kassas olevasse kupongiväljale ja vajuta \"Rakenda\". Soodustus arvutatakse summast automaatselt maha."
        },
        {
          q: "Kas hindadele lisandub käibemaks?",
          a: "Ei, kõik meie e-poe hinnad on lõplikud ja sisaldavad juba käibemaksu (22%). Arvel on käibemaksu summa eraldi reana välja toodud."
        }
      ]
    },
    {
      category: "Transport ja tarne",
      icon: Truck,
      questions: [
        {
          q: "Kui palju maksab transport?",
          a: "Transport Omniva ja DPD pakiautomaati maksab 2.99 €. Kulleriga koju maksab 4.99 €. Tellimustele alates 50 € on transport tasuta."
        },
        {
          q: "Kas saan kaubale ise järele tulla?",
          a: "Hetkel meil füüsilist kauplust ega väljastuspunkti ei ole ja kõik tellimused toimetame kohale kulleri või pakiautomaadiga."
        },
        {
          q: "Kas pakute samal päeval tarnet?",
          a: "Hetkel mitte. Kõik tellimused toimetame kohale 1-3 tööpäeva jooksul üle Eesti."
        },
        {
          q: "Kuidas saan oma saadetist jälgida?",
          a: "Niipea kui oleme paki teele pannud, saadame sulle SMS-i ja e-kirja koos jälgimislingiga, mille kaudu näed paki teekonda reaalajas."
        },
        {
          q: "Kas kuller helistab enne kohale jõudmist ette?",
          a: "Enamasti helistab DPD kuller või saadab täpsustava SMS-i 15-30 minutit enne saabumist. Täpne praktika võib piirkonniti erineda."
        },
        {
          q: "Kas pakute kontaktivaba tarnet?",
          a: "Jah, kassas saad märkida valiku \"Jäta pakk ukse taha\". Sellisel juhul asetab kuller saadetise turvaliselt sinu ukse juurde ja teeb sellest tõenduseks ka foto. Pane tähele, et sel juhul vastutad paki eest edasi sina."
        },
        {
          q: "Kas püsitellimustele on transport tasuta?",
          a: "Jah, kõikidele püsitellimustele ja tavatellimustele alates 50 € on transport tasuta. Alla selle summa lisandub tavapärane tarnehind."
        },
        {
          q: "Kas tarnite ka saartele?",
          a: "Jah, tarnime üle Eesti, sh kõikidele suursaartele. Saartele jõuab pakk reeglina +1 tööpäevase viivitusega."
        },
        {
          q: "Mis juhtub, kui sihtkoha pakiautomaat on täis?",
          a: "Sel juhul suunab logistikapartner paki lähimasse vabade kappidega automaati ja teavitab sind sellest SMS-iga. Kui uus asukoht ei sobi, võta ühendust meie klienditoega ja leiame lahenduse."
        }
      ]
    },
    {
      category: "Tooted ja toit",
      icon: Heart,
      questions: [
        {
          q: "Kuidas tagate toidu värskuse?",
          a: "Meie laos kehtib range FIFO-reegel (esimesena sisse, esimesena välja) ja automaatne partiide kontroll. Pakkeliin ei luba väljastada toodet, mille \"parim enne\" kuupäev on lähemal kui 90 päeva."
        },
        {
          q: "Kust on pärit teie müüdavate toitude tooraine?",
          a: "Teeme koostööd usaldusväärsete Euroopa tootjatega (peamiselt Saksamaa, Holland, Prantsusmaa), kellel on tagatud tooraine täielik jälgitavus farmist pakendini."
        },
        {
          q: "Kas lisate valikusse uusi tooteid?",
          a: "Jah, uuendame oma tootevalikut igas kvartalis. Liitu meie uudiskirjaga, et olla uute maitsete ja toodetega alati kursis!"
        },
        {
          q: "Kas müüte ka toortoitu (BARF)?",
          a: "Alustame sügavkülmutatud BARF-toitude müügiga Tallinnas 2025. aasta teises pooles."
        },
        {
          q: "Kas täiskasvanud koera toit sobib ka kutsikale?",
          a: "Ei. Kutsikad vajavad kasvamiseks spetsiaalselt tasakaalustatud ja energiarikast toitu. Palun kasuta toodete leidmiseks filtrit \"Kutsikas\", et leida oma lemmiku vanusele sobivaim toit."
        },
        {
          q: "Kuidas ma tean, kas kassitoit on teraviljavaba?",
          a: "Iga toote lehel on välja toodud detailne koostis. Sealt näed kohe, kas tegemist on teraviljavaba (grain-free) retseptiga või milliseid teravilju see sisaldab."
        }
      ]
    },
    {
      category: "Püsitellimus ja lojaalsus",
      icon: Star,
      questions: [
        {
          q: "Kas püsitellimusel on minimaalne lepinguperiood?",
          a: "Ei, minimaalset perioodi ei ole. Saad püsitellimuse tühistada igal ajal, isegi pärast esimest tarnet."
        },
        {
          q: "Kuidas toimub püsitellimuse eest tasumine?",
          a: "Makse võetakse sinu salvestatud pangakaardilt automaatselt maha umbes 24 tundi enne planeeritud tarnekuupäeva."
        },
        {
          q: "Kas ma saan teavituse, kui püsitellimuse hind muutub?",
          a: "Jah, kui toote hind või kogus muutub, saadame sulle 48 tundi enne makse teostamist teavituskirja. Kui sa 24 tunni jooksul ei reageeri, loeme tellimuse kinnitatuks."
        }
      ]
    },
    {
      category: "Konto ja turvalisus",
      icon: User,
      questions: [
        {
          q: "Unustasin parooli, mida teha?",
          a: "Vajuta sisselogimislehel nupule \"Unustasid parooli?\", sisesta oma e-posti aadress ja me saadame sulle lingi uue parooli loomiseks."
        },
        {
          q: "Kuidas saan muuta oma aadressi või lemmiklooma andmeid?",
          a: "Logi sisse oma kontole ja vali jaotis \"Minu profiil\". Seal saad mugavalt uuendada nii oma kontaktandmeid kui ka lemmikute profiile."
        },
        {
          q: "Kas saan oma konto ja kõik andmed kustutada?",
          a: "Jah. Saada meile vastavasisuline soov e-kirja teel ja me kustutame sinu konto ning kõik seotud andmed 14 päeva jooksul, vastavalt GDPR-i nõuetele."
        }
      ]
    },
    {
      category: "Klienditugi ja probleemid",
      icon: HelpCircle,
      questions: [
        {
          q: "Kuidas saan saata pildi defektsest tootest?",
          a: "Saada palun pilt ja lühike selgitus aadressile tere@kraps.ee - vaatame olukorra kiiresti üle ja leiame lahenduse."
        },
        {
          q: "Kui mu lemmikule uus toit ei maitse, kas saan avatud koti tagastada?",
          a: "Jah, pakume enamikule kuivtoitudele maitsegarantiid. Kui sinu lemmik keeldub toidust, võtame avatud (kuid ca 80% ulatuses täis) koti 14 päeva jooksul tagasi. Raha tagastame ostukrediidina sinu kontole. Täpsemad tingimused leiad tootelehelt."
        },
        {
          q: "Mis juhtub, kui tellimus hilineb ja toit saab kodus otsa?",
          a: "Sinu mure on meie mure! Helista kohe meie klienditoele. Kiire lahendusena saame pakkuda sulle kupongi, millega saad ajutise asendustoidu lähimast lemmikloomapoest."
        },
        {
          q: "Kuidas saan teiega ühendust võtta ja mis on klienditoe tööajad?",
          a: "Meie klienditugi on abiks E-R kell 9.00-20.00, L-P 12.00-18.00 Saad meiega ühendust võtta telefoni teel numbril +372 57840516, e-posti aadressil tere@kraps.ee või otse kodulehe vestlusakna kaudu."
        }
      ]
    }
  ]

  const filteredFaqItems = faqItems.map(category => ({
    ...category,
    questions: category.questions.filter(item => 
      item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <PageTemplate
      title="Klienditugi"
      subtitle="Oleme siin, et aidata! Leia vastused kõige sagedamini esitatud küsimustele või vestle meiega otse."
      badge="Alati abivalmis"
      breadcrumb={{
        href: "/",
        label: "Tagasi avalehele"
      }}
      hero={{
        backgroundGradient: "from-blue-400/20 via-cyan-300/20 to-teal-400/20"
      }}
    >
      {/* Simple Chat Section */}
      <AnimatedSection variant="highlight" className="content-container">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-8 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Kuidas saame aidata?</h2>
            <p className="text-xl mb-6 text-blue-50">
              Alusta vestlust meie klienditeenindusega
            </p>
            
            <button
              onClick={openChat}
              className="bg-white text-blue-600 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
            >
              <MessageSquare className="h-6 w-6 mr-2 inline" />
              Alusta vestlust
            </button>

            <div className="flex items-center justify-center gap-6 mt-6 text-blue-100">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <span>Vastame kiiresti</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span>Eesti- ja ingliskeelne tugi</span>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Alternative Contact Methods */}
      <AnimatedSection variant="default" className="content-container" delay={1}>
        <div className="max-w-4xl mx-auto mb-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Muud kontaktviisid</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <InteractiveCard
              title="E-mail"
              description="tere@kraps.ee - Vastame 24h jooksul"
              icon={Mail}
              action={
                <button 
                  onClick={() => window.open('mailto:tere@kraps.ee')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Saada e-mail →
                </button>
              }
            />
            <InteractiveCard
              title="Telefon"
              description="+372 5784 0516 - E-R 9:00-17:00"
              icon={Phone}
              action={
                <button 
                  onClick={() => window.open('tel:+37257840516')}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Helista →
                </button>
              }
            />
            <InteractiveCard
              title="Live Chat"
              description="Kõige kiirem viis abi saamiseks"
              icon={MessageSquare}
              highlight
              action={
                <button 
                  onClick={openChat}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Alusta vestlust →
                </button>
              }
            />
          </div>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection variant="default" className="content-container" delay={2}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Leia vastus iseseisvalt – Korduma Kippuvad Küsimused (KKK)</h2>
            <p className="text-lg text-gray-700 mb-8">
              Oleme siia alla koondanud vastused kõige levinumatele küsimustele. Suure tõenäosusega leiad siit kiire lahenduse.
            </p>
            
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Otsi küsimuste seast..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-8">
            {filteredFaqItems.map((category, categoryIndex) => (
              <div key={category.category} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <category.icon className="h-6 w-6 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-900">{category.category}</h3>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {category.questions.map((item, index) => {
                    const globalIndex = categoryIndex * 100 + index
                    return (
                      <div key={index} className="px-6 py-4">
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="w-full text-left flex items-center justify-between gap-4 focus:outline-none group"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              {item.q}
                            </span>
                          </div>
                          {openFaq === globalIndex ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        {openFaq === globalIndex && (
                          <div className="mt-4 pl-8 text-gray-700 leading-relaxed">
                            {item.a}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {filteredFaqItems.length === 0 && (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Otsingu tulemusi ei leitud</h3>
              <p className="text-gray-600 mb-6">Proovi teistsuguseid märksõnu või alusta vestlust meie toega</p>
            </div>
          )}
        </div>
      </AnimatedSection>

      {/* Bottom CTA */}
      <AnimatedSection variant="feature" className="content-container" delay={3}>
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-8 text-center">
          <MessageSquare className="h-16 w-16 text-teal-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ei leidnud vastust oma küsimusele?</h3>
          <p className="text-lg text-gray-700 mb-6">
            Ära muretse! Meie sõbralik klienditeenindus on alati valmis aitama.
          </p>
          <p className="text-base text-gray-600">
            Keri üles ja vali endale sobiv viis, kuidas meiega ühendust võtta.
          </p>
        </div>
      </AnimatedSection>
    </PageTemplate>
  )
}

export default KlienditoegiPage 