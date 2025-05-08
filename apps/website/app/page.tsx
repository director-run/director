import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import ServerCard from "@/components/server-card"
import { servers } from "@/lib/data"
import Pagination from "@/components/pagination"

export default function MCPRegistry() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold mb-2">MCP server registry</h1>
      <p className="text-gray-600 mb-6">
        This registry documents the capabilities of 464 tools across 173 MCP servers.
      </p>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <Input className="pl-10 h-12" placeholder="Search servers..." />
      </div>

      {/* Server Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {servers.map((server) => (
          <ServerCard key={server.id} server={server} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination totalPages={10} currentPage={1} />
    </div>
  )
}
