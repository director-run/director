import type { ReactNode } from "react"

export interface ServerType {
  id: string
  name: string
  description: string
  customIcon?: ReactNode
  iconBg?: string
  verified: boolean
  provider: string
  providerVerified?: boolean
  createdDate?: string
  runtime?: string
  license?: string
  sourceUrl?: string
  tools?: ToolType[]
  parameters?: ParameterType[]
  readme?: string
}

export interface ToolType {
  name: string
  description: string
  arguments?: string[]
  inputs?: ToolInputType[]
}

export interface ToolInputType {
  name: string
  type: string
  required?: boolean
  description?: string
}

export interface ParameterType {
  name: string
  description: string
  required?: boolean
}
