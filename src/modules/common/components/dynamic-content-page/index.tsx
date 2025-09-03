import { ContentPage } from "../../../../types/content-page"
import { ContentSectionsRenderer } from "../content-sections"

interface DynamicContentPageProps {
  page: ContentPage
}

const DynamicContentPage = ({ page }: DynamicContentPageProps) => {
  return (
    <main className="relative">
      {/* Page Metadata (handled by page component) */}
      
      {/* Render all page sections */}
      <ContentSectionsRenderer sections={page.sections} />
      
      {/* Draft indicator for non-published pages */}
      {page.status !== 'published' && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg">
            <span className="text-sm font-medium">
              {page.status === 'draft' ? '📝 Draft' : '🗄️ Archived'}
            </span>
          </div>
        </div>
      )}
      

    </main>
  )
}

export default DynamicContentPage 