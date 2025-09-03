import { LocalizedClientLink } from "@lib/components"
import { FileX, ArrowLeft } from "lucide-react"

export default function PolicyNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <div className="bg-red-100 rounded-full p-4 mx-auto w-fit">
              <FileX className="h-12 w-12 text-red-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Lehekülge ei leitud
          </h1>
          
          <p className="text-gray-600 mb-8">
            Otsitud poliitikat ei ole saadaval või on see ajutiselt kättesaamatu.
          </p>
          
          <div className="space-y-4">
            <LocalizedClientLink
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              Tagasi avalehele
            </LocalizedClientLink>
            
            <LocalizedClientLink
              href="/klienditugi"
              className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors w-full"
            >
              Klienditugi
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
} 