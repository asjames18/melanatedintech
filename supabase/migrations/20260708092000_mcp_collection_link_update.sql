-- Update Curated MCP Collection description, clear redundant unlock content, and change to premium pricing.
UPDATE public.products
SET description = 'A curated directory of ready-to-run Model Context Protocol (MCP) servers to give your agents immediate capabilities.

## Active MCP Server Registry
Looking to register, test, or connect to actual live MCP servers? Use our interactive [MCP Server Registry](/mcp) console to manage active endpoints for your agent projects.

## Included MCP Servers
- **File System:** Standard tool for reading, writing, and searching files.
- **SQLite Database:** Safe query tool with read-only limits.
- **Slack Integration:** Send and read channel alerts.
- **Memory Server:** Read and write persistent facts.
- Setup instructions and docker configurations for each server are included.',
    unlock_content = NULL,
    tier = 'premium',
    price_cents = 2900
WHERE slug = 'mcp-collection';
