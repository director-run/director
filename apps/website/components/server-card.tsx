import { CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { ServerType } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

interface ServerCardProps {
  server: ServerType
}

export default function ServerCard({ server }: ServerCardProps) {
  return (
    <Link href={`/server/${server.id}`} className="block">
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-6 h-6 flex-shrink-0">
              {server.customIcon ? (
                server.customIcon
              ) : (
                <Image
                  src="/mcp-logo.png"
                  alt="MCP Logo"
                  width={24}
                  height={24}
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{server.name}</h3>
                {server.verified && <CheckCircle className="text-blue-500" size={16} />}
              </div>

              <p className="text-gray-600 text-sm line-clamp-3">{server.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
