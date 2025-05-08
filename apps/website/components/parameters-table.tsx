import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ParameterType } from "@/lib/types"

interface ParametersTableProps {
  parameters: ParameterType[]
}

export default function ParametersTable({ parameters }: ParametersTableProps) {
  if (parameters.length === 0) {
    return <p className="text-gray-500">No parameters available for this server.</p>
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Parameter</TableHead>
            <TableHead className="w-2/3">Description</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parameters.map((param) => (
            <TableRow key={param.name}>
              <TableCell className="font-mono">
                {param.name}
                {param.required && <span className="text-red-500">*</span>}
              </TableCell>
              <TableCell>{param.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
