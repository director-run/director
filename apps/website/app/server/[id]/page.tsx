import { CheckCircle, Github } from "lucide-react"
import { servers } from "@/lib/data"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import ToolsTable from "@/components/tools-table"
import ParametersTable from "@/components/parameters-table"
import ReadmeSection from "@/components/readme-section"

interface ServerDetailPageProps {
  params: {
    id: string
  }
}

export default function ServerDetailPage({ params }: ServerDetailPageProps) {
  const server = servers.find((s) => s.id === params.id)

  if (!server) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">{server.name}</h1>
          {server.verified && <CheckCircle className="text-blue-500" size={20} />}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          by {server.provider}{" "}
          {server.providerVerified && (
            <span className="inline-flex items-center justify-center bg-purple-600 text-white text-xs font-medium w-4 h-4">
              ✓
            </span>
          )}
        </div>

        <p className="text-gray-700 mb-6">{server.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          {server.createdDate && (
            <div className="flex items-center gap-1">
              <span>Created {server.createdDate}</span>
            </div>
          )}

          {server.runtime && (
            <div className="flex items-center gap-1">
              <span>{server.runtime}</span>
            </div>
          )}

          {server.license && (
            <div className="flex items-center gap-1">
              <span>{server.license}</span>
            </div>
          )}

          {server.sourceUrl && (
            <Link href={server.sourceUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Github size={14} />
                <span>Source</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Tools Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Tools</h2>
        <ToolsTable tools={server.tools || []} />
      </div>

      {/* Parameters Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Parameters</h2>
        <ParametersTable parameters={server.parameters || []} />
      </div>

      {/* README Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Readme</h2>
        <ReadmeSection readme={server.readme || ""} />
      </div>
    </div>
  )
}
