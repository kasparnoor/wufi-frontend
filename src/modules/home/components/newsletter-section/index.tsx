import { NewsletterForm } from "@lib/components/newsletter/newsletter-form"
import { Mail, Gift, Sparkles } from "lucide-react"

export default function NewsletterSection() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-br from-yellow-50 to-yellow-100/50">
      <div className="content-container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4 bg-yellow-400/20 px-6 py-2.5 rounded-full border border-yellow-400/30">
              <Mail className="h-5 w-5 text-yellow-800" />
              <span className="text-yellow-800 font-semibold">Uudiskiri</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Ärge jääge ilma parimast!
            </h2>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              Liituge meie uudiskirjaga ja saage esimesena teada uutest toodetest, 
              eksklusiivsetest pakkumistest ja lemmikloomade hoolduse nippidest.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Gift className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Eksklusiivsed pakkumised</h3>
                <p className="text-sm text-gray-600">Ligipääs kampaaniatele ja soodustustele, mida teised ei näe</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Varajased pakkumised</h3>
                <p className="text-sm text-gray-600">Esimesena teada sooduspakkumistest ja uutest toodetest</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Hooldusnippe</h3>
                <p className="text-sm text-gray-600">Kasulikke nõuandeid lemmikloomade heaolu kohta</p>
              </div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <NewsletterForm
              variant="homepage"
              source="homepage"
              showNameField={true}
              tags={["prospect", "homepage"]}
              placeholder="Sisestage oma e-posti aadress"
              buttonText="Liitu uudiskirjaga"
            />
            
            <p className="text-xs text-gray-500 text-center mt-4">
              See leht on kaitstud reCAPTCHA-ga ja kehtivad Google'i <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline">privaatsuspoliitika</a> ja <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline">teenusetingimused</a>.
            </p>
            <p className="text-xs text-gray-500 text-center mt-4">
              Saatke ainult kasulikku sisu. Logi välja igal ajal.{" "}
              <a href="/privaatsuspoliitika" className="underline hover:text-gray-700">
                Privaatsuspoliitika
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 