import type { MCPTool } from "../../../components/types.ts";

export const mockTools = (): MCPTool[] => [
  {
    name: "get-library-docs",
    title: "Get Library Docs",
    description:
      "Fetches up-to-date documentation for a library. You must call 'resolve-library-id' first to obtain the exact Context7-compatible library ID required to use this tool, UNLESS the user explicitly provides a library ID in the format '/org/project' or '/org/project/version' in their query.",
    inputSchema: {
      type: "object",
      properties: {
        context7CompatibleLibraryID: {
          type: "string",
          description:
            "Exact Context7-compatible library ID (e.g., '/mongodb/docs', '/vercel/next.js', '/supabase/supabase', '/vercel/next.js/v14.3.0-canary.87') retrieved from 'resolve-library-id' or directly from user query in the format '/org/project' or '/org/project/version'.",
        },
        topic: {
          type: "string",
          description:
            "Topic to focus documentation on (e.g., 'hooks', 'routing').",
        },
        tokens: {
          type: "number",
          description:
            "Maximum number of tokens of documentation to retrieve (default: 5000). Higher values provide more context but consume more tokens.",
        },
      },
      required: ["context7CompatibleLibraryID"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    serverName: "context-7",
    disabled: false,
  },
  {
    name: "notion-create-comment",
    title: "Create a page comment",
    description: "Add a comment to a page",
    inputSchema: {
      type: "object",
      properties: {
        parent: {
          type: "object",
          properties: {
            page_id: {
              type: "string",
              description:
                "The ID of the parent page (with or without dashes), for example, 195de9221179449fab8075a27c979105",
            },
            type: { type: "string", enum: ["page_id"] },
          },
          required: ["page_id"],
          additionalProperties: false,
          description: "The parent of the comment. This must be a page.",
        },
        rich_text: {
          type: "array",
          items: {
            allOf: [
              {
                type: "object",
                properties: {
                  annotations: {
                    type: "object",
                    properties: {
                      bold: { type: "boolean" },
                      italic: { type: "boolean" },
                      strikethrough: { type: "boolean" },
                      underline: { type: "boolean" },
                      code: { type: "boolean" },
                      color: { type: "string" },
                    },
                    additionalProperties: false,
                    description:
                      "All rich text objects contain an annotations object that sets the styling for the rich text.",
                  },
                },
              },
              {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["text"] },
                      text: {
                        type: "object",
                        properties: {
                          content: {
                            type: "string",
                            maxLength: 2000,
                            description: "The actual text content of the text.",
                          },
                          link: {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  url: {
                                    type: "string",
                                    description: "The URL of the link.",
                                  },
                                },
                                required: ["url"],
                                additionalProperties: false,
                              },
                              { type: "null" },
                            ],
                            description:
                              "An object with information about any inline link in this text, if included.",
                          },
                        },
                        required: ["content"],
                        additionalProperties: false,
                        description:
                          "If a rich text object's type value is `text`, then the corresponding text field contains an object including the text content and any inline link.",
                      },
                    },
                    required: ["text"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["mention"] },
                      mention: {
                        anyOf: [
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["user"] },
                              user: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the user.",
                                  },
                                  object: { type: "string", enum: ["user"] },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the user mention.",
                              },
                            },
                            required: ["user"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["date"] },
                              date: {
                                type: "object",
                                properties: {
                                  start: {
                                    type: "string",
                                    format: "date",
                                    description:
                                      "The start date of the date object.",
                                  },
                                  end: {
                                    anyOf: [
                                      { type: "string", format: "date" },
                                      { type: "null" },
                                    ],
                                    description:
                                      "The end date of the date object, if any.",
                                  },
                                  time_zone: {
                                    type: ["string", "null"],
                                    description:
                                      "The time zone of the date object, if any. E.g. America/Los_Angeles, Europe/London, etc.",
                                  },
                                },
                                required: ["start"],
                                additionalProperties: false,
                                description: "Details of the date mention.",
                              },
                            },
                            required: ["date"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["page"] },
                              page: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the page in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the page mention.",
                              },
                            },
                            required: ["page"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["database"] },
                              database: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the database in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the database mention.",
                              },
                            },
                            required: ["database"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                enum: ["template_mention"],
                              },
                              template_mention: {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_date"],
                                      },
                                      template_mention_date: {
                                        type: "string",
                                        enum: ["today", "now"],
                                      },
                                    },
                                    required: ["template_mention_date"],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_user"],
                                      },
                                      template_mention_user: {
                                        type: "string",
                                        enum: ["me"],
                                      },
                                    },
                                    required: ["template_mention_user"],
                                    additionalProperties: false,
                                  },
                                ],
                                description: "Details of the template mention.",
                              },
                            },
                            required: ["template_mention"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["custom_emoji"] },
                              custom_emoji: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the custom emoji.",
                                  },
                                  name: {
                                    type: "string",
                                    description:
                                      "The name of the custom emoji.",
                                  },
                                  url: {
                                    type: "string",
                                    description: "The URL of the custom emoji.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description:
                                  "Details of the custom emoji mention.",
                              },
                            },
                            required: ["custom_emoji"],
                            additionalProperties: false,
                          },
                        ],
                        description:
                          "Mention objects represent an inline mention of a database, date, link preview mention, page, template mention, or user. A mention is created in the Notion UI when a user types `@` followed by the name of the reference.",
                      },
                    },
                    required: ["mention"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["equation"] },
                      equation: {
                        type: "object",
                        properties: {
                          expression: {
                            type: "string",
                            description: "A KaTeX compatible string.",
                          },
                        },
                        required: ["expression"],
                        additionalProperties: false,
                        description:
                          "Notion supports inline LaTeX equations as rich text objects with a type value of `equation`.",
                      },
                    },
                    required: ["equation"],
                    additionalProperties: false,
                  },
                ],
              },
            ],
          },
          maxItems: 100,
          description:
            "An array of rich text objects that represent the content of the comment.",
        },
      },
      required: ["parent", "rich_text"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-create-database",
    title: "Create Notion database",
    description:
      'Creates a new Notion database with the specified properties schema.\nIf no title property provided, "Name" is auto-added. Returns Markdown with schema and SQLite definition.\nProperty types: title (required), rich_text, number, select, multi_select, date, people, checkbox, url, email, phone_number, formula, relation, rollup.\n\n\t\t<example description="Minimal">{"properties": {}}</example>\n\t\t<example description="Task DB">{"parent": {"page_id": "f336d0bc-b841-465b-8045-024475c079dd"}, "title": [{"text": {"content": "Tasks"}}], "properties": {"Status": {"type": "select", "select": {"options": [{"name": "To Do", "color": "red"}, {"name": "Done", "color": "green"}]}}, "Due Date": {"type": "date", "date": {}}}}</example>',
    inputSchema: {
      type: "object",
      properties: {
        properties: {
          type: "object",
          additionalProperties: {
            allOf: [
              {
                type: "object",
                properties: {
                  description: {
                    anyOf: [
                      { type: "string", minLength: 1, maxLength: 280 },
                      { type: "null" },
                    ],
                    description: "The description of the property.",
                  },
                },
              },
              {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["number"] },
                      number: {
                        type: "object",
                        properties: { format: { type: "string" } },
                        additionalProperties: false,
                      },
                    },
                    required: ["number"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["formula"] },
                      formula: {
                        type: "object",
                        properties: { expression: { type: "string" } },
                        additionalProperties: false,
                      },
                    },
                    required: ["formula"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["select"] },
                      select: {
                        type: "object",
                        properties: {
                          options: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                color: {
                                  type: "string",
                                  enum: [
                                    "default",
                                    "gray",
                                    "brown",
                                    "orange",
                                    "yellow",
                                    "green",
                                    "blue",
                                    "purple",
                                    "pink",
                                    "red",
                                  ],
                                },
                                description: { type: ["string", "null"] },
                              },
                              required: ["name"],
                              additionalProperties: false,
                            },
                            maxItems: 100,
                          },
                        },
                        additionalProperties: false,
                      },
                    },
                    required: ["select"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["multi_select"] },
                      multi_select: {
                        type: "object",
                        properties: {
                          options: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                name: { type: "string" },
                                color: {
                                  type: "string",
                                  enum: [
                                    "default",
                                    "gray",
                                    "brown",
                                    "orange",
                                    "yellow",
                                    "green",
                                    "blue",
                                    "purple",
                                    "pink",
                                    "red",
                                  ],
                                },
                                description: { type: ["string", "null"] },
                              },
                              required: ["name"],
                              additionalProperties: false,
                            },
                            maxItems: 100,
                          },
                        },
                        additionalProperties: false,
                      },
                    },
                    required: ["multi_select"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["status"] },
                      status: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["status"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["relation"] },
                      relation: {
                        allOf: [
                          {
                            type: "object",
                            properties: { data_source_id: { type: "string" } },
                            required: ["data_source_id"],
                          },
                          {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  type: {
                                    type: "string",
                                    enum: ["single_property"],
                                  },
                                  single_property: {
                                    type: "object",
                                    properties: {},
                                    additionalProperties: false,
                                  },
                                },
                                required: ["single_property"],
                                additionalProperties: false,
                              },
                              {
                                type: "object",
                                properties: {
                                  type: {
                                    type: "string",
                                    enum: ["dual_property"],
                                  },
                                  dual_property: {
                                    type: "object",
                                    properties: {
                                      synced_property_id: { type: "string" },
                                      synced_property_name: { type: "string" },
                                    },
                                    additionalProperties: false,
                                  },
                                },
                                required: ["dual_property"],
                                additionalProperties: false,
                              },
                            ],
                          },
                        ],
                      },
                    },
                    required: ["relation"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["rollup"] },
                      rollup: {
                        allOf: [
                          {
                            type: "object",
                            properties: { function: { type: "string" } },
                            required: ["function"],
                          },
                          {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  relation_property_name: { type: "string" },
                                  rollup_property_name: { type: "string" },
                                },
                                required: [
                                  "relation_property_name",
                                  "rollup_property_name",
                                ],
                                additionalProperties: false,
                              },
                              {
                                type: "object",
                                properties: {
                                  relation_property_id: { type: "string" },
                                  rollup_property_name: { type: "string" },
                                },
                                required: [
                                  "relation_property_id",
                                  "rollup_property_name",
                                ],
                                additionalProperties: false,
                              },
                              {
                                type: "object",
                                properties: {
                                  relation_property_name: { type: "string" },
                                  rollup_property_id: { type: "string" },
                                },
                                required: [
                                  "relation_property_name",
                                  "rollup_property_id",
                                ],
                                additionalProperties: false,
                              },
                              {
                                type: "object",
                                properties: {
                                  relation_property_id: { type: "string" },
                                  rollup_property_id: { type: "string" },
                                },
                                required: [
                                  "relation_property_id",
                                  "rollup_property_id",
                                ],
                                additionalProperties: false,
                              },
                            ],
                          },
                        ],
                      },
                    },
                    required: ["rollup"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["unique_id"] },
                      unique_id: {
                        type: "object",
                        properties: { prefix: { type: ["string", "null"] } },
                        additionalProperties: false,
                      },
                    },
                    required: ["unique_id"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["title"] },
                      title: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["title"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["rich_text"] },
                      rich_text: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["rich_text"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["url"] },
                      url: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["url"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["people"] },
                      people: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["people"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["files"] },
                      files: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["files"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["email"] },
                      email: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["email"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["phone_number"] },
                      phone_number: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["phone_number"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["date"] },
                      date: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["date"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["checkbox"] },
                      checkbox: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["checkbox"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["created_by"] },
                      created_by: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["created_by"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["created_time"] },
                      created_time: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["created_time"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["last_edited_by"] },
                      last_edited_by: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["last_edited_by"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["last_edited_time"] },
                      last_edited_time: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["last_edited_time"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["button"] },
                      button: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["button"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["location"] },
                      location: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["location"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["verification"] },
                      verification: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["verification"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["last_visited_time"] },
                      last_visited_time: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["last_visited_time"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["place"] },
                      place: {
                        type: "object",
                        properties: {},
                        additionalProperties: false,
                      },
                    },
                    required: ["place"],
                    additionalProperties: false,
                  },
                ],
              },
            ],
          },
          description:
            "The property schema of the new database. If no title property is provided, one will be automatically added.",
        },
        parent: {
          type: "object",
          properties: {
            page_id: {
              type: "string",
              description:
                "The ID of the parent page (with or without dashes), for example, 195de9221179449fab8075a27c979105",
            },
            type: { type: "string", enum: ["page_id"] },
          },
          required: ["page_id"],
          additionalProperties: false,
          description:
            "The parent under which to create the new database. If omitted, the database will be created as a private page at the workspace level.",
        },
        title: {
          type: "array",
          items: {
            allOf: [
              {
                type: "object",
                properties: {
                  annotations: {
                    type: "object",
                    properties: {
                      bold: { type: "boolean" },
                      italic: { type: "boolean" },
                      strikethrough: { type: "boolean" },
                      underline: { type: "boolean" },
                      code: { type: "boolean" },
                      color: { type: "string" },
                    },
                    additionalProperties: false,
                    description:
                      "All rich text objects contain an annotations object that sets the styling for the rich text.",
                  },
                },
              },
              {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["text"] },
                      text: {
                        type: "object",
                        properties: {
                          content: {
                            type: "string",
                            maxLength: 2000,
                            description: "The actual text content of the text.",
                          },
                          link: {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  url: {
                                    type: "string",
                                    description: "The URL of the link.",
                                  },
                                },
                                required: ["url"],
                                additionalProperties: false,
                              },
                              { type: "null" },
                            ],
                            description:
                              "An object with information about any inline link in this text, if included.",
                          },
                        },
                        required: ["content"],
                        additionalProperties: false,
                        description:
                          "If a rich text object's type value is `text`, then the corresponding text field contains an object including the text content and any inline link.",
                      },
                    },
                    required: ["text"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["mention"] },
                      mention: {
                        anyOf: [
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["user"] },
                              user: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the user.",
                                  },
                                  object: { type: "string", enum: ["user"] },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the user mention.",
                              },
                            },
                            required: ["user"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["date"] },
                              date: {
                                type: "object",
                                properties: {
                                  start: {
                                    type: "string",
                                    format: "date",
                                    description:
                                      "The start date of the date object.",
                                  },
                                  end: {
                                    anyOf: [
                                      { type: "string", format: "date" },
                                      { type: "null" },
                                    ],
                                    description:
                                      "The end date of the date object, if any.",
                                  },
                                  time_zone: {
                                    type: ["string", "null"],
                                    description:
                                      "The time zone of the date object, if any. E.g. America/Los_Angeles, Europe/London, etc.",
                                  },
                                },
                                required: ["start"],
                                additionalProperties: false,
                                description: "Details of the date mention.",
                              },
                            },
                            required: ["date"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["page"] },
                              page: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the page in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the page mention.",
                              },
                            },
                            required: ["page"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["database"] },
                              database: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the database in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the database mention.",
                              },
                            },
                            required: ["database"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                enum: ["template_mention"],
                              },
                              template_mention: {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_date"],
                                      },
                                      template_mention_date: {
                                        type: "string",
                                        enum: ["today", "now"],
                                      },
                                    },
                                    required: ["template_mention_date"],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_user"],
                                      },
                                      template_mention_user: {
                                        type: "string",
                                        enum: ["me"],
                                      },
                                    },
                                    required: ["template_mention_user"],
                                    additionalProperties: false,
                                  },
                                ],
                                description: "Details of the template mention.",
                              },
                            },
                            required: ["template_mention"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["custom_emoji"] },
                              custom_emoji: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the custom emoji.",
                                  },
                                  name: {
                                    type: "string",
                                    description:
                                      "The name of the custom emoji.",
                                  },
                                  url: {
                                    type: "string",
                                    description: "The URL of the custom emoji.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description:
                                  "Details of the custom emoji mention.",
                              },
                            },
                            required: ["custom_emoji"],
                            additionalProperties: false,
                          },
                        ],
                        description:
                          "Mention objects represent an inline mention of a database, date, link preview mention, page, template mention, or user. A mention is created in the Notion UI when a user types `@` followed by the name of the reference.",
                      },
                    },
                    required: ["mention"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["equation"] },
                      equation: {
                        type: "object",
                        properties: {
                          expression: {
                            type: "string",
                            description: "A KaTeX compatible string.",
                          },
                        },
                        required: ["expression"],
                        additionalProperties: false,
                        description:
                          "Notion supports inline LaTeX equations as rich text objects with a type value of `equation`.",
                      },
                    },
                    required: ["equation"],
                    additionalProperties: false,
                  },
                ],
              },
            ],
          },
          maxItems: 100,
          description: "The title of the new database, as a rich text object.",
        },
        description: {
          type: "array",
          items: {
            allOf: [
              {
                type: "object",
                properties: {
                  annotations: {
                    type: "object",
                    properties: {
                      bold: { type: "boolean" },
                      italic: { type: "boolean" },
                      strikethrough: { type: "boolean" },
                      underline: { type: "boolean" },
                      code: { type: "boolean" },
                      color: { type: "string" },
                    },
                    additionalProperties: false,
                    description:
                      "All rich text objects contain an annotations object that sets the styling for the rich text.",
                  },
                },
              },
              {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["text"] },
                      text: {
                        type: "object",
                        properties: {
                          content: {
                            type: "string",
                            maxLength: 2000,
                            description: "The actual text content of the text.",
                          },
                          link: {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  url: {
                                    type: "string",
                                    description: "The URL of the link.",
                                  },
                                },
                                required: ["url"],
                                additionalProperties: false,
                              },
                              { type: "null" },
                            ],
                            description:
                              "An object with information about any inline link in this text, if included.",
                          },
                        },
                        required: ["content"],
                        additionalProperties: false,
                        description:
                          "If a rich text object's type value is `text`, then the corresponding text field contains an object including the text content and any inline link.",
                      },
                    },
                    required: ["text"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["mention"] },
                      mention: {
                        anyOf: [
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["user"] },
                              user: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the user.",
                                  },
                                  object: { type: "string", enum: ["user"] },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the user mention.",
                              },
                            },
                            required: ["user"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["date"] },
                              date: {
                                type: "object",
                                properties: {
                                  start: {
                                    type: "string",
                                    format: "date",
                                    description:
                                      "The start date of the date object.",
                                  },
                                  end: {
                                    anyOf: [
                                      { type: "string", format: "date" },
                                      { type: "null" },
                                    ],
                                    description:
                                      "The end date of the date object, if any.",
                                  },
                                  time_zone: {
                                    type: ["string", "null"],
                                    description:
                                      "The time zone of the date object, if any. E.g. America/Los_Angeles, Europe/London, etc.",
                                  },
                                },
                                required: ["start"],
                                additionalProperties: false,
                                description: "Details of the date mention.",
                              },
                            },
                            required: ["date"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["page"] },
                              page: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the page in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the page mention.",
                              },
                            },
                            required: ["page"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["database"] },
                              database: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the database in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the database mention.",
                              },
                            },
                            required: ["database"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                enum: ["template_mention"],
                              },
                              template_mention: {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_date"],
                                      },
                                      template_mention_date: {
                                        type: "string",
                                        enum: ["today", "now"],
                                      },
                                    },
                                    required: ["template_mention_date"],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_user"],
                                      },
                                      template_mention_user: {
                                        type: "string",
                                        enum: ["me"],
                                      },
                                    },
                                    required: ["template_mention_user"],
                                    additionalProperties: false,
                                  },
                                ],
                                description: "Details of the template mention.",
                              },
                            },
                            required: ["template_mention"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["custom_emoji"] },
                              custom_emoji: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the custom emoji.",
                                  },
                                  name: {
                                    type: "string",
                                    description:
                                      "The name of the custom emoji.",
                                  },
                                  url: {
                                    type: "string",
                                    description: "The URL of the custom emoji.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description:
                                  "Details of the custom emoji mention.",
                              },
                            },
                            required: ["custom_emoji"],
                            additionalProperties: false,
                          },
                        ],
                        description:
                          "Mention objects represent an inline mention of a database, date, link preview mention, page, template mention, or user. A mention is created in the Notion UI when a user types `@` followed by the name of the reference.",
                      },
                    },
                    required: ["mention"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["equation"] },
                      equation: {
                        type: "object",
                        properties: {
                          expression: {
                            type: "string",
                            description: "A KaTeX compatible string.",
                          },
                        },
                        required: ["expression"],
                        additionalProperties: false,
                        description:
                          "Notion supports inline LaTeX equations as rich text objects with a type value of `equation`.",
                      },
                    },
                    required: ["equation"],
                    additionalProperties: false,
                  },
                ],
              },
            ],
          },
          maxItems: 100,
          description:
            "The description of the new database, as a rich text object.",
        },
      },
      required: ["properties"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-create-pages",
    title: "Create pages in Markdown",
    description:
      '## Overview\nCreates one or more Notion pages, with the specified properties and content.\n## Parent\nAll pages created with a single call to this tool will have the same parent. The parent can be a Notion page ("page_id") or data source ("data_source_id"). If the parent is omitted, the pages are created as standalone, workspace-level private pages, and the person that created them can organize them later as they see fit.\nIf you have a database URL, ALWAYS pass it to the "fetch" tool first to get the schema and URLs of each data source under the database. You can\'t use the "database_id" parent type if the database has more than one data source, so you\'ll need to identify which "data_source_id" to use based on the situation and the results from the fetch tool (data source URLs look like collection://<data_source_id>).\nIf you know the pages should be created under a data source, do NOT use the database ID or URL under the "page_id" parameter; "page_id" is only for regular, non-database pages.\n## Properties\nNotion page properties are a JSON map of property names to SQLite values.\nWhen creating pages in a database: - Use the correct property names from the data source schema shown in the fetch tool results. - Always include a title property. Data sources always have exactly one title property, but it may not be named "title", so, again, rely on the fetched data source schema.\nFor pages outside of a database: - The only allowed property is "title",\twhich is the title of the page in inline markdown format. Always include a "title" property.\n**IMPORTANT**: Some property types require expanded formats: - Date properties: Split into "date:{property}:start", "date:{property}:end" (optional), and "date:{property}:is_datetime" (0 or 1) - Place properties: Split into "place:{property}:name", "place:{property}:address", "place:{property}:latitude", "place:{property}:longitude", and "place:{property}:google_place_id" (optional) - Number properties: Use JavaScript numbers (not strings) - Checkbox properties: Use "__YES__" for checked, "__NO__" for unchecked\n**Special property naming**: Properties named "id" or "url" (case insensitive) must be prefixed with "userDefined:" (e.g., "userDefined:URL", "userDefined:id")\n## Examples\n\t\t<example description="Create a standalone page with a title and content">\n\t\t{\n\t\t\t"pages": [\n\t\t\t\t{\n\t\t\t\t\t"properties": {"title": "Page title"},\n\t\t\t\t\t"content": "# Section 1\nSection 1 content\n# Section 2\nSection 2 content"\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t\t</example>\n\t\t<example description="Create a page under a database\'s data source">\n\t\t{\n\t\t\t"parent": {"data_source_id": "f336d0bc-b841-465b-8045-024475c079dd"},\n\t\t\t"pages": [\n\t\t\t\t{\n\t\t\t\t\t"properties": {\n\t\t\t\t\t\t"Task Name": "Task 123",\n\t\t\t\t\t\t"Status": "In Progress",\n\t\t\t\t\t\t"Priority": 5,\n\t\t\t\t\t\t"Is Complete": "__YES__",\n\t\t\t\t\t\t"date:Due Date:start": "2024-12-25",\n\t\t\t\t\t\t"date:Due Date:is_datetime": 0\n\t\t\t\t\t}\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t\t</example>\n\t\t<example description="Create a page with an existing page as a parent">\n\t\t{\n\t\t\t"parent": {"page_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"},\n\t\t\t"pages": [\n\t\t\t\t{\n\t\t\t\t\t"properties": {"title": "Page title"},\n\t\t\t\t\t"content": "# Section 1\nSection 1 content\n# Section 2\nSection 2 content"\n\t\t\t\t}\n\t\t\t]\n\t\t}\n\t\t</example>\n## Content\nNotion page content is a string in Notion-flavored Markdown format.\nDon\'t include the page title at the top of the page\'s content. Only include it under "properties".\nBelow is the full Notion-flavored Markdown specification, applicable to this create pages tool and other tools like update-page and fetch. This spec is also available as a separate MCP resource.\n<preserve> ### Notion-flavored Markdown Notion-flavored Markdown is a variant of standard Markdown with additional features to support all Block and Rich text types. Use tabs for indentation. Use backslashes to escape characters. For example, * will render as * and not as a bold delimiter. Block types: Markdown blocks use a {color="Color"} attribute list to set a block color. Text: Rich text {color="Color"} Children Headings: # Rich text {color="Color"} ## Rich text {color="Color"} ### Rich text {color="Color"} (Headings 4, 5, and 6 are not supported in Notion and will be converted to heading 3.) Bulleted list: - Rich text {color="Color"} Children Numbered list: 1. Rich text {color="Color"} Children\nBulleted and numbered list items should contain inline rich text -- otherwise they will render as empty list items, which look awkward in the Notion UI. (The inline text should be rich text -- any other block type will not be rendered inline, but as a child to an empty list item.)\nRich text types:\nBold:\n**Rich text**\nItalic:\n*Rich text*\nStrikethrough:\n~~Rich text~~\nUnderline:\n<span underline="true">Rich text</span>\nInline code:\n`Code`\nLink:\n[Link text](URL)\nCitation:\n[^URL]\nTo create a citation, you can either reference a compressed URL like this,[^{{1}}] or a full URL like this.[^example.com]\nColors:\n<span color?="Color">Rich text</span>\nInline math:\n$Equation$ or $`Equation`$ if you want to use markdown delimiters within the equation.\nThere must be whitespace before the starting $ symbol and after the ending $ symbol. There must not be whitespace right after the starting $ symbol or before the ending $ symbol.\nInline line breaks within a block (this is mostly useful in multi-line quote or callout blocks, where an ordinary newline character should not be used since it will break up the block structure):\n<br>\nMentions:\nUser:\n<mention-user url="{{URL}}">User name</mention-user>\nThe URL must always be provided, and refer to an existing User.\nBut Providing the user name is optional. In the UI, the name will always be displayed.\nSo an alternative self-closing format is also supported: <mention-user url="{{URL}}"/>\nPage:\n<mention-page url="{{URL}}">Page title</mention-page>\nThe URL must always be provided, and refer to an existing Page.\nProviding the page title is optional. In the UI, the title will always be displayed.\nMentioned pages can be viewed using the "fetch" tool.\nDatabase:\n<mention-database url="{{URL}}">Database name</mention-database>\nThe URL must always be provided, and refer to an existing Database.\nProviding the database name is optional. In the UI, the name will always be displayed.\nMentioned databases can be viewed using the "fetch" tool.\nData source:\n<mention-data-source url="{{URL}}">Data source name</mention-data-source>\nThe URL must always be provided, and refer to an existing data source.\nProviding the data source name is optional. In the UI, the name will always be displayed.\nMentioned data sources can be viewed using the "fetch" tool.\nDate:\n<mention-date start="YYYY-MM-DD" end="YYYY-MM-DD"/>\nDatetime:\n<mention-date start="YYYY-MM-DDThh:mm:ssZ" end="YYYY-MM-DDThh:mm:ssZ"/>\nCustom emoji:\n:emoji_name:\nCustom emoji are rendered as the emoji name surrounded by colons.\nColors:\nText colors (colored text with transparent background):\ngray, brown, orange, yellow, green, blue, purple, pink, red\nBackground colors (colored background with contrasting text):\ngray_bg, brown_bg, orange_bg, yellow_bg, green_bg, blue_bg, purple_bg, pink_bg, red_bg\nUsage:\n- Block colors: Add color="Color" to the first line of any block\n- Rich text colors (text colors and background colors are both supported): Use <span color="Color">Rich text</span>\n#### Advanced Block types for Page content\nThe following block types may only be used in page content.\n<advanced-blocks>\nQuote:\n> Rich text {color="Color"}\n\tChildren\nUse of a single ">" on a line without any other text should be avoided -- this will render as an empty blockquote, which is not visually appealing.\nTo include multiple lines of text in a single blockquote, use a single > and linebreaks (not multiple > lines, which will render as multiple separate blockquotes, unlike in standard markdown):\n> Line 1<br>Line 2<br>Line 3 {color="Color"}\nTo-do:\n- [ ] Rich text {color="Color"}\n\tChildren\n- [x] Rich text {color="Color"}\n\tChildren\nToggle:\n▶ Rich text {color="Color"}\n\tChildren\nToggle heading 1:\n▶# Rich text {color="Color"}\n\tChildren\nToggle heading 2:\n▶## Rich text {color="Color"}\n\tChildren\nToggle heading 3:\n▶### Rich text {color="Color"}\n\tChildren\nFor toggles and toggle headings, the children must be indented in order for them to be toggleable. If you do not indent the children, they will not be contained within the toggle or toggle heading.\nDivider:\n---\nTable:\n<table fit-page-width?="true|false" header-row?="true|false" header-column?="true|false">\n\t<colgroup>\n\t\t<col color?="Color">\n\t\t<col color?="Color">\n\t</colgroup>\n\t<tr color?="Color">\n\t\t<td>Data cell</td>\n\t\t<td color?="Color">Data cell</td>\n\t</tr>\n\t<tr>\n\t\t<td>Data cell</td>\n\t\t<td>Data cell</td>\n\t</tr>\n</table>\nNote: All table attributes are optional. If omitted, they default to false.\nTable structure:\n- <table>: Root element with optional attributes:\n  - fit-page-width: Whether the table should fill the page width\n  - header-row: Whether the first row is a header\n  - header-column: Whether the first column is a header\n- <colgroup>: Optional element defining column-wide styles\n- <col>: Column definition with optional attributes:\n  - color: The color of the column\n\t- width: The width of the column. Leave empty to auto-size.\n- <tr>: Table row with optional color attribute\n- <td>: Data cell with optional color attribute\nColor precedence (highest to lowest):\n1. Cell color (<td color="red">)\n2. Row color (<tr color="blue_bg">)\n3. Column color (<col color="gray">)\nTo format text inside of table cells, use Notion-flavored Markdown, not HTML. For instance, bold text in a table should be wrapped in **, not <strong>.\nEquation:\n$$\nEquation\n$$\n\t\tCode:\n```language\nCode\n```\nXML blocks use the "color" attribute to set a block color.\nCallout:\n<callout icon?="emoji" color?="Color">Rich text</callout>\nTo create a new line within a callout, use <br>, not a newline character. Using a newline character in a callout will cause a rendering bug.\nFor any other formatting inside of callout blocks, use Notion-flavored Markdown, not HTML. For instance, bold text in a callout should be wrapped in **, not <strong>.\nColumns:\n<columns>\n\t<column>\n\t\tChildren\n\t</column>\n\t<column>\n\t\tChildren\n\t</column>\n</columns>\nPage:\n<page url="{{URL}}" color?="Color">Title</page>\nSub-pages can be viewed using the "fetch" tool.\nTo create a new sub-page, omit the URL. You can then update the page content and properties with the "update-page" tool. Example: <page>New Page</page>\nWARNING: Using <page> with an existing page URL will MOVE the page to a new parent page with this content. If moving is not intended use the <mention-page> block instead.\nDatabase:\n<database url?="{{URL}}" inline?="{true|false}" icon?="Emoji" color?="Color" data-source-url?="{{URL}}">Title</database>\nProvide either url or data-source-url attribute:\n- If "url" is an existing database URL it here will MOVE that database into the current page. If you just want to mention an existing database, use <mention-database> instead.\n- If "data-source-url" is an existing data source URL, creates a linked database view.\nTo create a new database, omit both url and data-source-url. Example: <database>New Database</database>\nAfter creating a new or linked database, you can add filters, sorts, groups, or other view configuration with the "update-database" tool using the url of the newly added database.\nThe "inline" attribute toggles how the database is displayed in the UI. If it is true, the database is fully visible and interactive on the page. If false, the database is displayed as a sub-page.\nThere is no "Data Source" block type. Data Sources are always inside a Database, and only Databases can be inserted into a Page.\nAudio:\n<audio source="{{URL}}" color?="Color">Caption</audio>\nFile:\nFile content can be viewed using the "fetch" tool.\n<file source="{{URL}}" color?="Color">Caption</file>\nImage:\nImage content can be viewed using the "fetch" tool.\n<image source="{{URL}}" color?="Color">Caption</image>\nPDF:\nPDF content can be viewed using the "fetch" tool.\n<pdf source="{{URL}}" color?="Color">Caption</pdf>\nVideo:\n<video source="{{URL}}" color?="Color">Caption</video>\n(Note that source URLs can either be compressed URLs, such as source="{{1}}", or full URLs, such as source="example.com". Full URLs enclosed in curly brackets, like source="{{https://example.com}}" or source="{{example.com}}", do not work.)\nTable of contents:\n<table_of_contents color?="Color"/>\nSynced block:\nThe original source for a synced block.\nWhen creating a new synced block, do not provide the URL. After inserting the synced block into a page, the URL will be provided.\n<synced_block url?="{{URL}}">\n\tChildren\n</synced_block>\nNote: When creating new synced blocks, omit the url attribute - it will be auto-generated. When reading existing synced blocks, the url attribute will be present.\nSynced block reference:\nA reference to a synced block.\nThe synced block must already exist and url must be provided.\nYou can directly update the children of the synced block reference and it will update both the original synced block and the synced block reference.\n<synced_block_reference url="{{URL}}">\n\tChildren\n</synced_block_reference>\nMeeting notes:\n<meeting-notes>\n\tRich text (meeting title)\n\t<summary>\n\t\tAI-generated summary of the notes + transcript\n\t</summary>\n\t<notes>\n\t\tUser notes\n\t</notes>\n\t<transcript>\n\t\tTranscript of the audio (cannot be edited)\n\t</transcript>\n</meeting-notes>\n- The <transcript> tag contains a raw transcript and cannot be edited by AI, but it can be edited by a user.\n- When creating new meeting notes blocks, you must omit the <summary> and <transcript> tags.\n- Only include <notes> in a new meeting notes block if the user is SPECIFICALLY requesting note content.\n- Attempting to include or edit <transcript> will result in an error.\n- All content within <summary>, <notes>, and <transcript> tags must be indented at least one level deeper than the <meeting-notes> tag.\nUnknown (a block type that is not supported in the API yet):\n<unknown url="{{URL}}" alt="Alt"/>\n</advanced-blocks>\n\t\t</preserve>',
    inputSchema: {
      type: "object",
      properties: {
        pages: {
          type: "array",
          items: {
            type: "object",
            properties: {
              properties: {
                type: "object",
                additionalProperties: { type: ["string", "number", "null"] },
                description:
                  'The properties of the new page, which is a JSON map of property names to SQLite values. For pages in a database, use the SQLite schema definition shown in <database>. For pages outside of a database, the only allowed property is "title", which is the title of the page and is automatically shown at the top of the page as a large heading.',
              },
              content: {
                type: "string",
                description:
                  "The content of the new page, using Notion Markdown.",
              },
            },
            additionalProperties: false,
          },
          maxItems: 100,
          description: "The pages to create.",
        },
        parent: {
          anyOf: [
            {
              type: "object",
              properties: {
                page_id: {
                  type: "string",
                  description:
                    "The ID of the parent page (with or without dashes), for example, 195de9221179449fab8075a27c979105",
                },
                type: { type: "string", enum: ["page_id"] },
              },
              required: ["page_id"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                database_id: {
                  type: "string",
                  description:
                    "The ID of the parent database (with or without dashes), for example, 195de9221179449fab8075a27c979105",
                },
                type: { type: "string", enum: ["database_id"] },
              },
              required: ["database_id"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                data_source_id: {
                  type: "string",
                  description:
                    "The ID of the parent data source (collection), with or without dashes. For example, f336d0bc-b841-465b-8045-024475c079dd",
                },
                type: { type: "string", enum: ["data_source_id"] },
              },
              required: ["data_source_id"],
              additionalProperties: false,
            },
          ],
          description:
            "The parent under which the new pages will be created. This can be a page (page_id), a database page (database_id), or a data source/collection under a database (data_source_id). If omitted, the new pages will be created as private pages at the workspace level. Use data_source_id when you have a collection:// URL from the fetch tool.",
        },
      },
      required: ["pages"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-duplicate-page",
    title: "Duplicate Notion page",
    description:
      "Duplicate a Notion page. The page must be within the current playbook, and you must have permission to access it. The duplication completes asynchronously, so do not rely on the new page identified by the returned ID or URL to be populated immediately. Let the user know that the duplication is in progress and that they can check back later using the 'fetch' tool or by clicking the returned URL and viewing it in the Notion app.",
    inputSchema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description:
            "The ID of the page to duplicate. This is a v4 UUID, with or without dashes, and can be parsed from a Notion page URL.",
        },
      },
      required: ["page_id"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-fetch",
    title: "Fetch Notion entities",
    description:
      'Retrieves details about a Notion entity (page or database) by URL or ID.\nProvide URL or ID in `id` parameter. Make multiple calls to fetch multiple entities.\nPages use enhanced Markdown format (see "create-pages" tool for spec).\nDatabases return all data sources (collections of pages with same schema). For multi-source databases with URLs like notion.so/db-id?v=view-id, the view ID helps identify which data source to use (check response for view\'s dataSourceUrl).\n\t\t<example>{"id": "https://notion.so/workspace/Page-a1b2c3d4e5f67890"}</example>\n\t\t<example>{"id": "12345678-90ab-cdef-1234-567890abcdef"}</example>',
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "The ID or URL of the Notion page to fetch",
        },
      },
      required: ["id"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-get-comments",
    title: "Get page comments",
    description: "Get all comments of a page",
    inputSchema: {
      type: "object",
      properties: {
        page_id: {
          type: "string",
          description: "Identifier for a Notion page.",
        },
      },
      required: ["page_id"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-get-self",
    title: "Retrieve your token's bot user",
    description: "Retrieve your token's bot user",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-get-teams",
    title: "Get workspace teams",
    description:
      'Retrieves a list of teams (teamspaces) in the current playbook. Shows which teams exist, user membership status, IDs, names, and roles.\nTeams are returned split by membership status and limited to a maximum of 10 results.\n<examples>\n1. List all teams (up to the limit of each type): {}\n2. Search for teams by name: {"query": "engineering"}\n3. Find a specific team: {"query": "Product Design"}\n</examples>',
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          minLength: 1,
          maxLength: 100,
          description:
            "Optional search query to filter teams by name (case-insensitive).",
        },
      },
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-get-user",
    title: "Retrieve a user",
    description: "Retrieve a user",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "object",
          properties: { user_id: { type: "string" } },
          required: ["user_id"],
          additionalProperties: false,
        },
      },
      required: ["path"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-get-users",
    title: "List all users",
    description: "List all users",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "object",
          properties: {
            start_cursor: { type: "string" },
            page_size: { type: "number" },
          },
          additionalProperties: false,
        },
      },
      required: ["query"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-move-pages",
    title: "Move Notion pages",
    description: "Move one or more Notion pages or databases to a new parent.",
    inputSchema: {
      type: "object",
      properties: {
        page_or_database_ids: {
          type: "array",
          items: { type: "string" },
          minItems: 1,
          maxItems: 100,
          description:
            'An array of up to 100 page or database IDs to move. IDs are v4 UUIDs and can be supplied with or without dashes (e.g. extracted from a <page> or <database> URL given by the "search" or "fetch" tool). Data Sources under Databases can\'t be moved individually.',
        },
        new_parent: {
          anyOf: [
            {
              type: "object",
              properties: {
                page_id: {
                  type: "string",
                  description:
                    "The ID of the parent page (with or without dashes), for example, 195de9221179449fab8075a27c979105",
                },
                type: { type: "string", enum: ["page_id"] },
              },
              required: ["page_id"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                database_id: {
                  type: "string",
                  description:
                    "The ID of the parent database (with or without dashes), for example, 195de9221179449fab8075a27c979105",
                },
                type: { type: "string", enum: ["database_id"] },
              },
              required: ["database_id"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: {
                data_source_id: {
                  type: "string",
                  description:
                    "The ID of the parent data source (collection), with or without dashes. For example, f336d0bc-b841-465b-8045-024475c079dd",
                },
                type: { type: "string", enum: ["data_source_id"] },
              },
              required: ["data_source_id"],
              additionalProperties: false,
            },
            {
              type: "object",
              properties: { type: { type: "string", enum: ["playbook"] } },
              required: ["type"],
              additionalProperties: false,
            },
          ],
          description:
            "The new parent under which the pages will be moved. This can be a page, the playbook, a database, or a specific data source under a database when there are multiple. Moving pages to the workspace level adds them as private pages and should rarely be used.",
        },
      },
      required: ["page_or_database_ids", "new_parent"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-search",
    title: "Search Notion and connected sources",
    description:
      'Perform a search over: - "internal": Semantic search over Notion workspace and connected sources (Slack, Google Drive, Github, Jira, Microsoft Teams, Sharepoint, OneDrive, Linear). Supports filtering by creation date and creator. - "user": Search for users by name or email.\nFalls back to "workspace_search" (no connected sources) when user lacks Notion AI.\nUse "fetch" tool for full page/database contents after getting search results.\nTo search within a database: First fetch the database to get the data source URL (collection://...) from <data-source url="..."> tags, then use that as data_source_url. For multi-source databases, match by view ID (?v=...) in URL or search all sources separately.\nDon\'t combine database URL/ID with collection:// prefix for data_source_url. Don\'t use database URL as page_url.\n\t\t<example description="Search with date range filter (only documents created in 2024)">\n\t\t{\n\t\t\t"query": "quarterly revenue report",\n\t\t\t"query_type": "internal",\n\t\t\t"filters": {\n\t\t\t\t"created_date_range": {\n\t\t\t\t\t"start_date": "2024-01-01",\n\t\t\t\t\t"end_date": "2025-01-01"\n\t\t\t\t}\n\t\t\t}\n\t\t}\n\t\t</example>\n\t\t<example description="Teamspace + creator filter">\n\t\t{"query": "project updates", "query_type": "internal", "teamspace_id": "f336d0bc-b841-465b-8045-024475c079dd", "filters": {"created_by_user_ids": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"]}}\n\t\t</example>\n\t\t<example description="Database with date + creator filters">\n\t\t{"query": "design review", "data_source_url": "collection://f336d0bc-b841-465b-8045-024475c079dd", "filters": {"created_date_range": {"start_date": "2024-10-01"}, "created_by_user_ids": ["a1b2c3d4-e5f6-7890-abcd-ef1234567890", "b2c3d4e5-f6a7-8901-bcde-f12345678901"]}}\n\t\t</example>\n\t\t<example description="User search">\n\t\t{"query": "john@example.com", "query_type": "user"}\n\t\t</example>',
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          minLength: 1,
          description:
            'Semantic search query over your entire Notion workspace and connected sources (Slack, Google Drive, Github, Jira, Microsoft Teams, Sharepoint, OneDrive, or Linear). For best results, don\'t provide more than one question per tool call. Use a separate "search" tool call for each search you want to perform.\nAlternatively, the query can be a substring or keyword to find users by matching against their name or email address. For example: "john" or "john@example.com"',
        },
        query_type: { type: "string", enum: ["internal", "user"] },
        data_source_url: {
          type: "string",
          description:
            "Optionally, provide the URL of a Data source to search. This will perform a semantic search over the pages in the Data Source. Note: must be a Data Source, not a Database. <data-source> tags are part of the Notion flavored Markdown format returned by tools like fetch. The full spec is available in the create-pages tool description.",
        },
        page_url: {
          type: "string",
          description:
            "Optionally, provide the URL or ID of a page to search within. This will perform a semantic search over the content within and under the specified page. Accepts either a full page URL (e.g. https://notion.so/workspace/Page-Title-1234567890) or just the page ID (UUIDv4) with or without dashes.",
        },
        teamspace_id: {
          type: "string",
          description:
            "Optionally, provide the ID of a teamspace to restrict search results to. This will perform a search over content within the specified teamspace only. Accepts the teamspace ID (UUIDv4) with or without dashes.",
        },
        filters: {
          type: "object",
          properties: {
            created_date_range: {
              type: "object",
              properties: {
                start_date: {
                  type: "string",
                  format: "date",
                  description:
                    "The start date of the date range as an ISO 8601 date string, if any.",
                },
                end_date: {
                  type: "string",
                  format: "date",
                  description:
                    "The end date of the date range as an ISO 8601 date string, if any.",
                },
              },
              additionalProperties: false,
              description:
                "Optional filter to only produce search results created within the specified date range.",
            },
            created_by_user_ids: {
              type: "array",
              items: { type: "string" },
              maxItems: 100,
              description:
                "Optional filter to only produce search results created by the Notion users that have the specified user IDs.",
            },
          },
          additionalProperties: false,
          description:
            "Optionally provide filters to apply to the search results. Only valid when query_type is 'internal'.",
        },
      },
      required: ["query"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: { readOnlyHint: true, openWorldHint: true },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-update-database",
    title: "Update Notion database",
    description:
      'Update a Notion database\'s properties, name, description, or other attributes. Returns Markdown showing updated structure and schema.\nDatabase properties define columns/fields. See create_database for property types.\nExamples:\n(1) Update database title and description: { "database_id": "f336d0bc-b841-465b-8045-024475c079dd", "title": [{"type": "text", "text": {"content": "Project Tracker 2024"}}], "description": [{"type": "text", "text": {"content": "Track all projects and deliverables"}}] }\n(2) Add new properties to a database: { "database_id": "f336d0bc-b841-465b-8045-024475c079dd", "properties": { "Priority": { "select": { "options": [ {"name": "High", "color": "red"}, {"name": "Medium", "color": "yellow"}, {"name": "Low", "color": "green"} ] } }, "Due Date": {"date": {}}, "Assigned To": {"people": {}} } }\n(3) Rename an existing property (use the property ID or current name): { "database_id": "f336d0bc-b841-465b-8045-024475c079dd", "properties": { "Status": {"name": "Project Status"} } }\n(4) Remove a property (set to null): { "database_id": "f336d0bc-b841-465b-8045-024475c079dd", "properties": { "Old Property": null } }\n(5) Change display mode from inline to full page: { "database_id": "f336d0bc-b841-465b-8045-024475c079dd", "is_inline": false }\n(6) Move to trash (DANGER: confirm with user, cannot undo without Notion UI): {"database_id": "f336d0bc-b841-465b-8045-024475c079dd", "in_trash": true}\nNotes: Cannot delete/create title properties. Max one unique_id property. Cannot update synced databases. Use "fetch" first to see current schema.',
    inputSchema: {
      type: "object",
      properties: {
        database_id: {
          type: "string",
          description:
            "The ID of the database to update. This is a UUID v4, with or without dashes, and can be parsed from a database URL.",
        },
        title: {
          type: "array",
          items: {
            allOf: [
              {
                type: "object",
                properties: {
                  annotations: {
                    type: "object",
                    properties: {
                      bold: { type: "boolean" },
                      italic: { type: "boolean" },
                      strikethrough: { type: "boolean" },
                      underline: { type: "boolean" },
                      code: { type: "boolean" },
                      color: { type: "string" },
                    },
                    additionalProperties: false,
                    description:
                      "All rich text objects contain an annotations object that sets the styling for the rich text.",
                  },
                },
              },
              {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["text"] },
                      text: {
                        type: "object",
                        properties: {
                          content: {
                            type: "string",
                            maxLength: 2000,
                            description: "The actual text content of the text.",
                          },
                          link: {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  url: {
                                    type: "string",
                                    description: "The URL of the link.",
                                  },
                                },
                                required: ["url"],
                                additionalProperties: false,
                              },
                              { type: "null" },
                            ],
                            description:
                              "An object with information about any inline link in this text, if included.",
                          },
                        },
                        required: ["content"],
                        additionalProperties: false,
                        description:
                          "If a rich text object's type value is `text`, then the corresponding text field contains an object including the text content and any inline link.",
                      },
                    },
                    required: ["text"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["mention"] },
                      mention: {
                        anyOf: [
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["user"] },
                              user: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the user.",
                                  },
                                  object: { type: "string", enum: ["user"] },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the user mention.",
                              },
                            },
                            required: ["user"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["date"] },
                              date: {
                                type: "object",
                                properties: {
                                  start: {
                                    type: "string",
                                    format: "date",
                                    description:
                                      "The start date of the date object.",
                                  },
                                  end: {
                                    anyOf: [
                                      { type: "string", format: "date" },
                                      { type: "null" },
                                    ],
                                    description:
                                      "The end date of the date object, if any.",
                                  },
                                  time_zone: {
                                    type: ["string", "null"],
                                    description:
                                      "The time zone of the date object, if any. E.g. America/Los_Angeles, Europe/London, etc.",
                                  },
                                },
                                required: ["start"],
                                additionalProperties: false,
                                description: "Details of the date mention.",
                              },
                            },
                            required: ["date"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["page"] },
                              page: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the page in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the page mention.",
                              },
                            },
                            required: ["page"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["database"] },
                              database: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the database in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the database mention.",
                              },
                            },
                            required: ["database"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                enum: ["template_mention"],
                              },
                              template_mention: {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_date"],
                                      },
                                      template_mention_date: {
                                        type: "string",
                                        enum: ["today", "now"],
                                      },
                                    },
                                    required: ["template_mention_date"],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_user"],
                                      },
                                      template_mention_user: {
                                        type: "string",
                                        enum: ["me"],
                                      },
                                    },
                                    required: ["template_mention_user"],
                                    additionalProperties: false,
                                  },
                                ],
                                description: "Details of the template mention.",
                              },
                            },
                            required: ["template_mention"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["custom_emoji"] },
                              custom_emoji: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the custom emoji.",
                                  },
                                  name: {
                                    type: "string",
                                    description:
                                      "The name of the custom emoji.",
                                  },
                                  url: {
                                    type: "string",
                                    description: "The URL of the custom emoji.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description:
                                  "Details of the custom emoji mention.",
                              },
                            },
                            required: ["custom_emoji"],
                            additionalProperties: false,
                          },
                        ],
                        description:
                          "Mention objects represent an inline mention of a database, date, link preview mention, page, template mention, or user. A mention is created in the Notion UI when a user types `@` followed by the name of the reference.",
                      },
                    },
                    required: ["mention"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["equation"] },
                      equation: {
                        type: "object",
                        properties: {
                          expression: {
                            type: "string",
                            description: "A KaTeX compatible string.",
                          },
                        },
                        required: ["expression"],
                        additionalProperties: false,
                        description:
                          "Notion supports inline LaTeX equations as rich text objects with a type value of `equation`.",
                      },
                    },
                    required: ["equation"],
                    additionalProperties: false,
                  },
                ],
              },
            ],
          },
          maxItems: 100,
          description:
            "The new title of the database, as a rich text object, if you want to update it.",
        },
        description: {
          type: "array",
          items: {
            allOf: [
              {
                type: "object",
                properties: {
                  annotations: {
                    type: "object",
                    properties: {
                      bold: { type: "boolean" },
                      italic: { type: "boolean" },
                      strikethrough: { type: "boolean" },
                      underline: { type: "boolean" },
                      code: { type: "boolean" },
                      color: { type: "string" },
                    },
                    additionalProperties: false,
                    description:
                      "All rich text objects contain an annotations object that sets the styling for the rich text.",
                  },
                },
              },
              {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["text"] },
                      text: {
                        type: "object",
                        properties: {
                          content: {
                            type: "string",
                            maxLength: 2000,
                            description: "The actual text content of the text.",
                          },
                          link: {
                            anyOf: [
                              {
                                type: "object",
                                properties: {
                                  url: {
                                    type: "string",
                                    description: "The URL of the link.",
                                  },
                                },
                                required: ["url"],
                                additionalProperties: false,
                              },
                              { type: "null" },
                            ],
                            description:
                              "An object with information about any inline link in this text, if included.",
                          },
                        },
                        required: ["content"],
                        additionalProperties: false,
                        description:
                          "If a rich text object's type value is `text`, then the corresponding text field contains an object including the text content and any inline link.",
                      },
                    },
                    required: ["text"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["mention"] },
                      mention: {
                        anyOf: [
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["user"] },
                              user: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the user.",
                                  },
                                  object: { type: "string", enum: ["user"] },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the user mention.",
                              },
                            },
                            required: ["user"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["date"] },
                              date: {
                                type: "object",
                                properties: {
                                  start: {
                                    type: "string",
                                    format: "date",
                                    description:
                                      "The start date of the date object.",
                                  },
                                  end: {
                                    anyOf: [
                                      { type: "string", format: "date" },
                                      { type: "null" },
                                    ],
                                    description:
                                      "The end date of the date object, if any.",
                                  },
                                  time_zone: {
                                    type: ["string", "null"],
                                    description:
                                      "The time zone of the date object, if any. E.g. America/Los_Angeles, Europe/London, etc.",
                                  },
                                },
                                required: ["start"],
                                additionalProperties: false,
                                description: "Details of the date mention.",
                              },
                            },
                            required: ["date"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["page"] },
                              page: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the page in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the page mention.",
                              },
                            },
                            required: ["page"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["database"] },
                              database: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description:
                                      "The ID of the database in the mention.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description: "Details of the database mention.",
                              },
                            },
                            required: ["database"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: {
                                type: "string",
                                enum: ["template_mention"],
                              },
                              template_mention: {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_date"],
                                      },
                                      template_mention_date: {
                                        type: "string",
                                        enum: ["today", "now"],
                                      },
                                    },
                                    required: ["template_mention_date"],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["template_mention_user"],
                                      },
                                      template_mention_user: {
                                        type: "string",
                                        enum: ["me"],
                                      },
                                    },
                                    required: ["template_mention_user"],
                                    additionalProperties: false,
                                  },
                                ],
                                description: "Details of the template mention.",
                              },
                            },
                            required: ["template_mention"],
                            additionalProperties: false,
                          },
                          {
                            type: "object",
                            properties: {
                              type: { type: "string", enum: ["custom_emoji"] },
                              custom_emoji: {
                                type: "object",
                                properties: {
                                  id: {
                                    type: "string",
                                    description: "The ID of the custom emoji.",
                                  },
                                  name: {
                                    type: "string",
                                    description:
                                      "The name of the custom emoji.",
                                  },
                                  url: {
                                    type: "string",
                                    description: "The URL of the custom emoji.",
                                  },
                                },
                                required: ["id"],
                                additionalProperties: false,
                                description:
                                  "Details of the custom emoji mention.",
                              },
                            },
                            required: ["custom_emoji"],
                            additionalProperties: false,
                          },
                        ],
                        description:
                          "Mention objects represent an inline mention of a database, date, link preview mention, page, template mention, or user. A mention is created in the Notion UI when a user types `@` followed by the name of the reference.",
                      },
                    },
                    required: ["mention"],
                    additionalProperties: false,
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["equation"] },
                      equation: {
                        type: "object",
                        properties: {
                          expression: {
                            type: "string",
                            description: "A KaTeX compatible string.",
                          },
                        },
                        required: ["expression"],
                        additionalProperties: false,
                        description:
                          "Notion supports inline LaTeX equations as rich text objects with a type value of `equation`.",
                      },
                    },
                    required: ["equation"],
                    additionalProperties: false,
                  },
                ],
              },
            ],
          },
          maxItems: 100,
          description:
            "The new description of the database, as a rich text object, if you want to update it.",
        },
        properties: {
          type: "object",
          additionalProperties: {
            anyOf: [
              {
                allOf: [
                  {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "The name of the property.",
                      },
                      description: {
                        anyOf: [
                          { type: "string", minLength: 1, maxLength: 280 },
                          { type: "null" },
                        ],
                        description: "The description of the property.",
                      },
                    },
                  },
                  {
                    anyOf: [
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["number"] },
                          number: {
                            type: "object",
                            properties: { format: { type: "string" } },
                            additionalProperties: false,
                          },
                        },
                        required: ["number"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["formula"] },
                          formula: {
                            type: "object",
                            properties: { expression: { type: "string" } },
                            additionalProperties: false,
                          },
                        },
                        required: ["formula"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["select"] },
                          select: {
                            type: "object",
                            properties: {
                              options: {
                                type: "array",
                                items: {
                                  allOf: [
                                    {
                                      type: "object",
                                      properties: {
                                        color: {
                                          type: "string",
                                          enum: [
                                            "default",
                                            "gray",
                                            "brown",
                                            "orange",
                                            "yellow",
                                            "green",
                                            "blue",
                                            "purple",
                                            "pink",
                                            "red",
                                          ],
                                        },
                                        description: {
                                          type: ["string", "null"],
                                        },
                                      },
                                    },
                                    {
                                      anyOf: [
                                        {
                                          type: "object",
                                          properties: {
                                            name: { type: "string" },
                                            id: { type: "string" },
                                          },
                                          required: ["name"],
                                          additionalProperties: false,
                                        },
                                        {
                                          type: "object",
                                          properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                          },
                                          required: ["id"],
                                          additionalProperties: false,
                                        },
                                      ],
                                    },
                                  ],
                                },
                                maxItems: 100,
                              },
                            },
                            additionalProperties: false,
                          },
                        },
                        required: ["select"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["multi_select"] },
                          multi_select: {
                            type: "object",
                            properties: {
                              options: {
                                type: "array",
                                items: {
                                  allOf: [
                                    {
                                      type: "object",
                                      properties: {
                                        color: {
                                          type: "string",
                                          enum: [
                                            "default",
                                            "gray",
                                            "brown",
                                            "orange",
                                            "yellow",
                                            "green",
                                            "blue",
                                            "purple",
                                            "pink",
                                            "red",
                                          ],
                                        },
                                        description: {
                                          type: ["string", "null"],
                                        },
                                      },
                                    },
                                    {
                                      anyOf: [
                                        {
                                          type: "object",
                                          properties: {
                                            name: { type: "string" },
                                            id: { type: "string" },
                                          },
                                          required: ["name"],
                                          additionalProperties: false,
                                        },
                                        {
                                          type: "object",
                                          properties: {
                                            id: { type: "string" },
                                            name: { type: "string" },
                                          },
                                          required: ["id"],
                                          additionalProperties: false,
                                        },
                                      ],
                                    },
                                  ],
                                },
                                maxItems: 100,
                              },
                            },
                            additionalProperties: false,
                          },
                        },
                        required: ["multi_select"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["status"] },
                          status: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["status"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["relation"] },
                          relation: {
                            allOf: [
                              {
                                type: "object",
                                properties: {
                                  data_source_id: { type: "string" },
                                },
                                required: ["data_source_id"],
                              },
                              {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["single_property"],
                                      },
                                      single_property: {
                                        type: "object",
                                        properties: {},
                                        additionalProperties: false,
                                      },
                                    },
                                    required: ["single_property"],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      type: {
                                        type: "string",
                                        enum: ["dual_property"],
                                      },
                                      dual_property: {
                                        type: "object",
                                        properties: {
                                          synced_property_id: {
                                            type: "string",
                                          },
                                          synced_property_name: {
                                            type: "string",
                                          },
                                        },
                                        additionalProperties: false,
                                      },
                                    },
                                    required: ["dual_property"],
                                    additionalProperties: false,
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        required: ["relation"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["rollup"] },
                          rollup: {
                            allOf: [
                              {
                                type: "object",
                                properties: { function: { type: "string" } },
                                required: ["function"],
                              },
                              {
                                anyOf: [
                                  {
                                    type: "object",
                                    properties: {
                                      relation_property_name: {
                                        type: "string",
                                      },
                                      rollup_property_name: { type: "string" },
                                    },
                                    required: [
                                      "relation_property_name",
                                      "rollup_property_name",
                                    ],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      relation_property_id: { type: "string" },
                                      rollup_property_name: { type: "string" },
                                    },
                                    required: [
                                      "relation_property_id",
                                      "rollup_property_name",
                                    ],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      relation_property_name: {
                                        type: "string",
                                      },
                                      rollup_property_id: { type: "string" },
                                    },
                                    required: [
                                      "relation_property_name",
                                      "rollup_property_id",
                                    ],
                                    additionalProperties: false,
                                  },
                                  {
                                    type: "object",
                                    properties: {
                                      relation_property_id: { type: "string" },
                                      rollup_property_id: { type: "string" },
                                    },
                                    required: [
                                      "relation_property_id",
                                      "rollup_property_id",
                                    ],
                                    additionalProperties: false,
                                  },
                                ],
                              },
                            ],
                          },
                        },
                        required: ["rollup"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["unique_id"] },
                          unique_id: {
                            type: "object",
                            properties: {
                              prefix: { type: ["string", "null"] },
                            },
                            additionalProperties: false,
                          },
                        },
                        required: ["unique_id"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["title"] },
                          title: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["title"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["rich_text"] },
                          rich_text: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["rich_text"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["url"] },
                          url: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["url"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["people"] },
                          people: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["people"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["files"] },
                          files: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["files"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["email"] },
                          email: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["email"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["phone_number"] },
                          phone_number: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["phone_number"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["date"] },
                          date: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["date"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["checkbox"] },
                          checkbox: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["checkbox"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["created_by"] },
                          created_by: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["created_by"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["created_time"] },
                          created_time: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["created_time"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["last_edited_by"] },
                          last_edited_by: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["last_edited_by"],
                        additionalProperties: false,
                      },
                      {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["last_edited_time"] },
                          last_edited_time: {
                            type: "object",
                            properties: {},
                            additionalProperties: false,
                          },
                        },
                        required: ["last_edited_time"],
                        additionalProperties: false,
                      },
                    ],
                  },
                ],
              },
              {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "The new name of the property.",
                  },
                },
                required: ["name"],
                additionalProperties: false,
              },
              { type: "null" },
            ],
          },
          description:
            "Updates to make to the database's schema. Use null to remove a property, or provide the `name` only to rename a property.",
        },
        is_inline: { type: "boolean" },
        in_trash: { type: "boolean" },
      },
      required: ["database_id"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: false,
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "notion-update-page",
    title: "Update Notion page",
    description:
      '## Overview\nUpdate a Notion page\'s properties or content.\n## Properties\nNotion page properties are a JSON map of property names to SQLite values.\nFor pages in a database: - ALWAYS use the "fetch" tool first to get the data source schema and the\texact property names. - Provide a non-null value to update a property\'s value. - Omitted properties are left unchanged.\n**IMPORTANT**: Some property types require expanded formats: - Date properties: Split into "date:{property}:start", "date:{property}:end" (optional), and "date:{property}:is_datetime" (0 or 1) - Place properties: Split into "place:{property}:name", "place:{property}:address", "place:{property}:latitude", "place:{property}:longitude", and "place:{property}:google_place_id" (optional) - Number properties: Use JavaScript numbers (not strings) - Checkbox properties: Use "__YES__" for checked, "__NO__" for unchecked\n**Special property naming**: Properties named "id" or "url" (case insensitive) must be prefixed with "userDefined:" (e.g., "userDefined:URL", "userDefined:id")\nFor pages outside of a database: - The only allowed property is "title",\twhich is the title of the page in inline markdown format.\n## Content\nNotion page content is a string in Notion-flavored Markdown format. See the "create-pages" tool description for the full enhanced Markdown spec.\nBefore updating a page\'s content with this tool, use the "fetch" tool first to get the existing content to find out the Markdown snippets to use in the "replace_content_range" or "insert_content_after" commands.\n## Examples\n\t\t<example description="Update page properties">\n\t\t{\n\t\t\t"page_id": "f336d0bc-b841-465b-8045-024475c079dd",\n\t\t\t"command": "update_properties",\n\t\t\t"properties": {\n\t\t\t\t"title": "New Page Title",\n\t\t\t\t"status": "In Progress",\n\t\t\t\t"priority": 5,\n\t\t\t\t"checkbox": "__YES__",\n\t\t\t\t"date:deadline:start": "2024-12-25",\n\t\t\t\t"date:deadline:is_datetime": 0,\n\t\t\t\t"place:office:name": "HQ",\n\t\t\t\t"place:office:latitude": 37.7749,\n\t\t\t\t"place:office:longitude": -122.4194\n\t\t\t}\n\t\t}\n\t\t</example>\n\t\t<example description="Replace the entire content of a page">\n\t\t{\n\t\t\t"page_id": "f336d0bc-b841-465b-8045-024475c079dd",\n\t\t\t"command": "replace_content",\n\t\t\t"new_str": "# New Section\nUpdated content goes here"\n\t\t}\n\t\t</example>\n\t\t<example description="Replace specific content in a page">\n\t\t{\n\t\t\t"page_id": "f336d0bc-b841-465b-8045-024475c079dd",\n\t\t\t"command": "replace_content_range",\n\t\t\t"selection_with_ellipsis": "# Old Section...end of section",\n\t\t\t"new_str": "# New Section\nUpdated content goes here"\n\t\t}\n\t\t</example>\n\t\t<example description="Insert content after specific text">\n\t\t{\n\t\t\t"page_id": "f336d0bc-b841-465b-8045-024475c079dd",\n\t\t\t"command": "insert_content_after",\n\t\t\t"selection_with_ellipsis": "## Previous section...",\n\t\t\t"new_str": "\n## New Section\nContent to insert goes here"\n\t\t}\n\t\t</example>\n**Note**: For selection_with_ellipsis, provide only the first ~10 characters, an ellipsis, and the last ~10 characters. Ensure the selection is unique; use longer snippets if needed to avoid ambiguity.',
    inputSchema: {
      type: "object",
      properties: {
        data: {
          allOf: [
            {
              type: "object",
              properties: {
                page_id: {
                  type: "string",
                  description:
                    "The ID of the page to update, with or without dashes.",
                },
              },
              required: ["page_id"],
            },
            {
              anyOf: [
                {
                  type: "object",
                  properties: {
                    command: { type: "string", enum: ["update_properties"] },
                    properties: {
                      type: "object",
                      additionalProperties: {
                        type: ["string", "number", "null"],
                      },
                      description:
                        "A JSON object that updates the page's properties. For pages in a database, use the SQLite schema definition shown in <database>. For pages outside of a database, the only allowed property is \"title\", which is the title of the page in inline markdown format. Use null to remove a property's value.",
                    },
                  },
                  required: ["command", "properties"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: {
                    command: { type: "string", enum: ["replace_content"] },
                    new_str: {
                      type: "string",
                      description:
                        "The new string to replace all content with.",
                    },
                  },
                  required: ["command", "new_str"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: {
                    command: {
                      type: "string",
                      enum: ["replace_content_range"],
                    },
                    selection_with_ellipsis: {
                      type: "string",
                      description:
                        'Unique start and end snippet of the string to replace in the page content, including whitespace. DO NOT provide the entire string to replace. Instead, provide up to the first ~10 characters of the string to replace, an ellipsis, and then up to the last ~10 characters of the string to replace. Make sure you provide enough of the start and end snippet to uniquely identify the string to replace. For example, to replace an entire section, use "old_start_and_end_snippet":"# Section heading...last paragraph."',
                    },
                    new_str: {
                      type: "string",
                      description:
                        "The new string to replace the old string with.",
                    },
                  },
                  required: ["command", "selection_with_ellipsis", "new_str"],
                  additionalProperties: false,
                },
                {
                  type: "object",
                  properties: {
                    command: { type: "string", enum: ["insert_content_after"] },
                    selection_with_ellipsis: {
                      type: "string",
                      description:
                        'Unique start and end snippet of the string to match in the page content, including whitespace. DO NOT provide the entire string to match. Instead, provide up to the first ~10 characters of the string to match, an ellipsis, and then up to the last ~10 characters of the string to match. Make sure you provide enough of the start and end snippet to uniquely identify the string to match. For example, to match an entire section, use "selection_with_ellipsis":"# Section heading...last paragraph."',
                    },
                    new_str: {
                      type: "string",
                      description: "The new content to insert.",
                    },
                  },
                  required: ["command", "selection_with_ellipsis", "new_str"],
                  additionalProperties: false,
                },
              ],
            },
          ],
          description: "The data required for updating a page",
        },
      },
      required: ["data"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
    },
    serverName: "notion",
    disabled: false,
  },
  {
    name: "resolve-library-id",
    title: "Resolve Context7 Library ID",
    description:
      "Resolves a package/product name to a Context7-compatible library ID and returns a list of matching libraries.\n\nYou MUST call this function before 'get-library-docs' to obtain a valid Context7-compatible library ID UNLESS the user explicitly provides a library ID in the format '/org/project' or '/org/project/version' in their query.\n\nSelection Process:\n1. Analyze the query to understand what library/package the user is looking for\n2. Return the most relevant match based on:\n- Name similarity to the query (exact matches prioritized)\n- Description relevance to the query's intent\n- Documentation coverage (prioritize libraries with higher Code Snippet counts)\n- Trust score (consider libraries with scores of 7-10 more authoritative)\n\nResponse Format:\n- Return the selected library ID in a clearly marked section\n- Provide a brief explanation for why this library was chosen\n- If multiple good matches exist, acknowledge this but proceed with the most relevant one\n- If no good matches exist, clearly state this and suggest query refinements\n\nFor ambiguous queries, request clarification before proceeding with a best-guess match.",
    inputSchema: {
      type: "object",
      properties: {
        libraryName: {
          type: "string",
          description:
            "Library name to search for and retrieve a Context7-compatible library ID.",
        },
      },
      required: ["libraryName"],
      additionalProperties: false,
      $schema: "http://json-schema.org/draft-07/schema#",
    },
    serverName: "context-7",
    disabled: false,
  },
];
