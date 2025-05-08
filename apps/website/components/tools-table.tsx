import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ToolType } from "@/lib/types"

interface ToolsTableProps {
  tools: ToolType[]
}

export default function ToolsTable({ tools }: ToolsTableProps) {
  if (tools.length === 0) {
    return <p className="text-gray-500">No tools available for this server.</p>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/5">Tool</TableHead>
            <TableHead className="w-2/5">Description</TableHead>
            <TableHead className="w-2/5">Inputs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tools.map((tool) => (
            <TableRow key={tool.name}>
              <TableCell className="font-mono">{tool.name}</TableCell>
              <TableCell>
                <div className="space-y-2">
                  <p>{tool.description}</p>
                  {tool.arguments && (
                    <div className="text-sm text-gray-600">
                      <p>
                        It takes {tool.arguments.length} argument{tool.arguments.length !== 1 ? "s" : ""}:
                      </p>
                      <ul className="list-disc pl-5 mt-1 space-y-1">
                        {tool.arguments.map((arg, index) => (
                          <li key={index}>{arg}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {tool.inputs &&
                  tool.inputs.map((input) => (
                    <div key={input.name} className="mb-3">
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{input.name}</span>
                        {input.required && <span className="text-red-500">*</span>}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">{input.type}</div>
                      {input.description && <div className="text-sm mt-1">{input.description}</div>}
                    </div>
                  ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
