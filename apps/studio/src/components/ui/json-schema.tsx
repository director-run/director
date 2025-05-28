import { cn } from "@/lib/cn";
import { CaretRightIcon, CircleIcon } from "@phosphor-icons/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion";
import { Slot } from "@radix-ui/react-slot";

import React, { ComponentProps } from "react";

import { Badge, BadgeGroup, BadgeLabel } from "./badge";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateTitle,
} from "./empty-state";
import { List, ListItemDetails, ListItemTitle } from "./list";
import { Markdown } from "./markdown";

export interface JsonSchemaProperty {
  type?: string | string[];
  description?: string;
  required?: boolean | string[];
  default?: unknown;
  example?: unknown;
  format?: string;
  enum?: unknown[];
  const?: unknown;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  additionalProperties?: boolean | JsonSchemaProperty;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  oneOf?: JsonSchemaProperty[];
  anyOf?: JsonSchemaProperty[];
  allOf?: JsonSchemaProperty[];
  $ref?: string;
  title?: string;
}

export interface JsonSchema {
  type?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean | JsonSchemaProperty;
  title?: string;
  description?: string;
}

interface UnionTypeRendererProps {
  unionType: "oneOf" | "anyOf" | "allOf";
  schemas: JsonSchemaProperty[];
  level: number;
}

const formatType = (
  type: string | string[] | undefined,
  format?: string,
): string => {
  if (!type) {
    return "any";
  }

  const typeStr = Array.isArray(type) ? type.join(" | ") : type;

  if (format) {
    return `${typeStr} (${format})`;
  }

  return typeStr;
};

// Helper function to check if array items are simple (primitive types)
const isSimpleArrayItem = (items: JsonSchemaProperty): boolean => {
  // If it has union types, it's complex
  if (items.oneOf || items.anyOf || items.allOf) {
    return false;
  }

  // If it has nested properties, it's complex
  if (items.properties && Object.keys(items.properties).length > 0) {
    return false;
  }

  // If it's an array itself, it's complex
  if (items.type === "array") {
    return false;
  }

  // If it's an object type, it's complex
  if (items.type === "object") {
    return false;
  }

  // Everything else is simple (string, number, boolean, null, etc.)
  return true;
};

// Helper function to format array type with items
const formatArrayType = (property: JsonSchemaProperty): string => {
  if (property.type !== "array" || !property.items) {
    return formatType(property.type, property.format);
  }

  if (isSimpleArrayItem(property.items)) {
    const itemType = formatType(property.items.type, property.items.format);
    return `${itemType}[]`;
  }

  return "array";
};

// Helper function to generate better titles for union options
const generateUnionOptionTitle = (
  schema: JsonSchemaProperty,
  index: number,
): string => {
  // Check for const values (common discriminator pattern)
  if (schema.const !== undefined) {
    return String(schema.const);
  }

  // Check for type.const pattern (common in this schema)
  if (schema.properties?.type?.const !== undefined) {
    return String(schema.properties.type.const);
  }

  // Check for single enum value
  if (schema.enum && schema.enum.length === 1) {
    return String(schema.enum[0]);
  }

  // Use provided title
  if (schema.title) {
    return schema.title;
  }

  // Use description (truncated)
  if (schema.description) {
    return (
      schema.description.slice(0, 50) +
      (schema.description.length > 50 ? "..." : "")
    );
  }

  // Check if it's an empty schema
  if (
    !schema.type &&
    !schema.properties &&
    !schema.oneOf &&
    !schema.anyOf &&
    !schema.allOf
  ) {
    return "Any value";
  }

  // Fallback
  return `Schema ${index + 1}`;
};

// Helper function to check if schema is effectively empty
const isEmptySchema = (schema: JsonSchemaProperty): boolean => {
  return (
    !schema.type &&
    !schema.properties &&
    !schema.oneOf &&
    !schema.anyOf &&
    !schema.allOf &&
    !schema.const &&
    !schema.enum &&
    !schema.items
  );
};

const UnionTypeRenderer: React.FC<UnionTypeRendererProps> = ({
  unionType,
  schemas,
  level,
}) => {
  const getUnionDescription = (type: string) => {
    switch (type) {
      case "oneOf":
        return "Must match exactly one of the following schemas:";
      case "anyOf":
        return "Must match at least one of the following schemas:";
      case "allOf":
        return "Must match all of the following schemas:";
      default:
        return "Union type:";
    }
  };

  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-2">
        <Badge className="font-mono text-xs">{unionType}</Badge>
        <span className="text-gray-600 text-sm">
          {getUnionDescription(unionType)}
        </span>
      </div>

      <List asChild>
        <Accordion type="multiple">
          {schemas.map((schema, index) => {
            const schemaTitle = generateUnionOptionTitle(schema, index);
            const hasOwnProperties =
              schema.properties && Object.keys(schema.properties).length > 0;

            if (isEmptySchema(schema)) {
              return null;
            }

            return (
              <AccordionItem key={index} value={`option-${index}`} asChild>
                <PropertyItem>
                  <PropertyHeader
                    name={schemaTitle}
                    required={false}
                    type={formatType(schema.type, schema.format)}
                  >
                    <AccordionTrigger className="flex size-6 cursor-pointer items-center justify-center rounded-lg bg-accent text-fg-subtle transition-opacity duration-200 hover:opacity-80 [&[data-state=open]>svg]:rotate-90">
                      <CaretRightIcon
                        weight="bold"
                        className="size-4 transition-transform duration-200"
                      />
                    </AccordionTrigger>
                  </PropertyHeader>
                  <PropertyContent>
                    {schema.description && (
                      <Markdown>{schema.description}</Markdown>
                    )}

                    <PropertyConstraints property={schema} />
                    <PropertyDefault property={schema} />
                    <PropertyExample property={schema} />

                    <AccordionContent>
                      {/* Render nested properties if this option is an object */}
                      {hasOwnProperties && (
                        <List>
                          {Object.entries(schema.properties || {}).map(
                            ([propName, propSchema]) => (
                              <PropertyRow
                                key={propName}
                                name={propName}
                                property={propSchema}
                                required={
                                  Array.isArray(schema.required)
                                    ? schema.required.includes(propName)
                                    : false
                                }
                                level={level + 1}
                              />
                            ),
                          )}
                        </List>
                      )}

                      {/* Handle nested union types */}
                      {schema.oneOf && (
                        <UnionTypeRenderer
                          unionType="oneOf"
                          schemas={schema.oneOf}
                          level={level + 1}
                        />
                      )}
                      {schema.anyOf && (
                        <UnionTypeRenderer
                          unionType="anyOf"
                          schemas={schema.anyOf}
                          level={level + 1}
                        />
                      )}
                      {schema.allOf && (
                        <UnionTypeRenderer
                          unionType="allOf"
                          schemas={schema.allOf}
                          level={level + 1}
                        />
                      )}

                      {/* Handle array items */}
                      {schema.type === "array" && schema.items && (
                        <PropertyRow
                          name="items"
                          property={schema.items}
                          required={false}
                          level={level + 1}
                        />
                      )}
                    </AccordionContent>
                  </PropertyContent>
                </PropertyItem>
              </AccordionItem>
            );
          })}
        </Accordion>
      </List>
    </div>
  );
};

function PropertyConstraints({ property }: { property: JsonSchemaProperty }) {
  const hasConstraints =
    property.minimum !== undefined ||
    property.maximum !== undefined ||
    property.minLength !== undefined ||
    property.maxLength !== undefined ||
    property.pattern !== undefined ||
    property.enum !== undefined ||
    property.const !== undefined;

  if (!hasConstraints) {
    return null;
  }

  const constraints: [string, string][] = [];

  if (property.minimum !== undefined) {
    constraints.push(["min", String(property.minimum)]);
  }
  if (property.maximum !== undefined) {
    constraints.push(["max", String(property.maximum)]);
  }
  if (property.minLength !== undefined) {
    constraints.push(["minLength", String(property.minLength)]);
  }
  if (property.maxLength !== undefined) {
    constraints.push(["maxLength", String(property.maxLength)]);
  }
  if (property.pattern) {
    constraints.push(["pattern", property.pattern]);
  }
  if (property.enum) {
    constraints.push(["enum", property.enum.join(", ")]);
  }
  if (property.const !== undefined) {
    constraints.push(["const", JSON.stringify(property.const)]);
  }

  return (
    <div className="mb-2 text-gray-500 text-sm">
      {constraints.map(([key, value]) => (
        <div key={key}>
          <span className="font-medium">{key}:</span> {value}
        </div>
      ))}
    </div>
  );
}

function PropertyDefault({ property }: { property: JsonSchemaProperty }) {
  if (!property.default) {
    return null;
  }

  return (
    <div className="text-gray-600 text-sm">
      <span className="font-medium">Default:</span>{" "}
      {JSON.stringify(property.default)}
    </div>
  );
}

function PropertyExample({ property }: { property: JsonSchemaProperty }) {
  if (!property.example) {
    return null;
  }

  return (
    <div className="text-gray-600 text-sm">
      <span className="font-medium">Example:</span>{" "}
      {JSON.stringify(property.example)}
    </div>
  );
}

interface PropertyRowProps {
  name: string;
  property: JsonSchemaProperty;
  required?: boolean;
  level?: number;
  hideHeader?: boolean;
}

function PropertyRow({
  name,
  property,
  required = false,
  level = 0,
  hideHeader = false,
}: PropertyRowProps) {
  const hasNestedProperties =
    property.properties && Object.keys(property.properties).length > 0;
  const hasItems = property.type === "array" && property.items;
  const hasComplexItems =
    hasItems && property.items && !isSimpleArrayItem(property.items);
  const hasUnionTypes = property.oneOf || property.anyOf || property.allOf;

  const getDisplayType = () => {
    if (hasUnionTypes) {
      const unionTypes = [];
      if (property.oneOf) {
        unionTypes.push("oneOf");
      }
      if (property.anyOf) {
        unionTypes.push("anyOf");
      }
      if (property.allOf) {
        unionTypes.push("allOf");
      }
      return unionTypes.join(" & ");
    }

    // Use the enhanced array formatting
    return formatArrayType(property);
  };

  if (hasNestedProperties || hasComplexItems || hasUnionTypes) {
    return (
      <AccordionItem value={name} asChild>
        <PropertyItem>
          {!hideHeader && (
            <PropertyHeader
              name={name}
              required={required}
              type={getDisplayType()}
            >
              <AccordionTrigger className="flex size-6 cursor-pointer items-center justify-center rounded-lg bg-accent text-fg-subtle transition-opacity duration-200 hover:opacity-80 [&[data-state=open]>svg]:rotate-90">
                <CaretRightIcon
                  weight="bold"
                  className="size-4 transition-transform duration-200"
                />
              </AccordionTrigger>
            </PropertyHeader>
          )}
          <PropertyContent className={hideHeader ? "ml-0" : "ml-8"}>
            {property.description && (
              <Markdown>{property.description}</Markdown>
            )}

            <PropertyConstraints property={property} />
            <PropertyDefault property={property} />
            <PropertyExample property={property} />

            {hasItems && !hasComplexItems && property.items && (
              <PropertyConstraints property={property.items} />
            )}

            <AccordionContent>
              {property.oneOf && (
                <UnionTypeRenderer
                  unionType="oneOf"
                  schemas={property.oneOf}
                  level={level}
                />
              )}
              {property.anyOf && (
                <UnionTypeRenderer
                  unionType="anyOf"
                  schemas={property.anyOf}
                  level={level}
                />
              )}
              {property.allOf && (
                <UnionTypeRenderer
                  unionType="allOf"
                  schemas={property.allOf}
                  level={level}
                />
              )}

              {hasNestedProperties && (
                <List>
                  {Object.entries(property.properties || {}).map(
                    ([propName, propSchema]) => (
                      <PropertyRow
                        key={propName}
                        name={`${name}.${propName}`}
                        property={propSchema}
                        required={false}
                        level={level + 1}
                      />
                    ),
                  )}
                </List>
              )}

              {/* Only show nested items view for complex array items */}
              {hasComplexItems && property.items && (
                <PropertyRow
                  name={name}
                  property={property.items}
                  required={false}
                  level={level + 1}
                  hideHeader={true}
                />
              )}
            </AccordionContent>
          </PropertyContent>
        </PropertyItem>
      </AccordionItem>
    );
  }

  const hasConstraints =
    property.minimum !== undefined &&
    property.maximum !== undefined &&
    property.minLength !== undefined &&
    property.maxLength !== undefined &&
    property.pattern !== undefined &&
    property.enum !== undefined &&
    property.const !== undefined;

  const hasNoContent =
    !property.description &&
    !property.default &&
    !property.example &&
    !hasConstraints;

  return (
    <PropertyItem>
      <PropertyHeader name={name} required={required} type={getDisplayType()} />
      {!hasNoContent && (
        <PropertyContent>
          {property.description && <Markdown>{property.description}</Markdown>}
          <PropertyConstraints property={property} />
          <PropertyDefault property={property} />
          <PropertyExample property={property} />
        </PropertyContent>
      )}
    </PropertyItem>
  );
}

interface PropertyItemProps extends ComponentProps<"div"> {
  asChild?: boolean;
}

function PropertyItem({
  children,
  className,
  asChild,
  ...props
}: PropertyItemProps) {
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="property-item"
      className={cn(
        "flex flex-col border-accent border-b-[0.5px] py-3 outline-none last:border-b-0",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface PropertyHeaderProps extends ComponentProps<"div"> {
  name: string;
  required: boolean;
  type: string;
}

function PropertyHeader({
  children,
  className,
  name,
  required,
  type,
  ...props
}: PropertyHeaderProps) {
  return (
    <div
      className={cn("grid grid-cols-[24px_1fr_auto] gap-2", className)}
      {...props}
    >
      <div className="shrink-0">
        {children ?? (
          <div className="flex size-6 items-center justify-center">
            <CircleIcon weight="fill" className="size-2 text-fg-subtle" />
          </div>
        )}
      </div>
      <ListItemDetails className="flex-row">
        <ListItemTitle className="font-mono">{name}</ListItemTitle>
      </ListItemDetails>
      <BadgeGroup>
        <Badge>
          <BadgeLabel uppercase>{type}</BadgeLabel>
        </Badge>
        {required && (
          <Badge>
            <BadgeLabel uppercase>required</BadgeLabel>
          </Badge>
        )}
      </BadgeGroup>
    </div>
  );
}

function PropertyContent({
  children,
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={cn("ml-8 flex flex-col gap-y-3", className)} {...props}>
      {children}
    </div>
  );
}

interface JSONSchemaProps {
  schema: JsonSchema;
}

export const JSONSchema: React.FC<JSONSchemaProps> = ({ schema }) => {
  const requiredFields = schema.required || [];

  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return (
      <EmptyState>
        <EmptyStateTitle>No parameters defined</EmptyStateTitle>
        <EmptyStateDescription>
          This tool does not require any parameters.
        </EmptyStateDescription>
      </EmptyState>
    );
  }

  return (
    <List asChild>
      <Accordion type="multiple">
        {Object.entries(schema.properties).map(
          ([propertyName, propertySchema]) => (
            <PropertyRow
              key={propertyName}
              name={propertyName}
              property={propertySchema}
              required={requiredFields.includes(propertyName)}
            />
          ),
        )}
      </Accordion>
    </List>
  );
};
