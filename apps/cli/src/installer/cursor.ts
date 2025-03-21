const SQLITE_DB_PATH = "/Users/barnaby/Library/Application Support/Cursor/User/globalStorage/state.vscdb";

const READ_SQL_QUERY = `
SELECT json_extract(value, '$.mcpServers') FROM ItemTable 
WHERE key = 'src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser'
`;

const WRITE_SQL_QUERY = `
UPDATE ItemTable
SET value = json_patch(value, 
  json_object('mcpServers', json_array(
    json_object(
      'identifier', 'def12345-6789-abcd-ef01-23456789abcd',
      'name', 'dev-server',
      'url', 'http://localhost:8080/api',
      'type', 'rest'
    ),
    json_object(
      'identifier', 'abc98765-4321-dcba-fe10-9876543210ab',
      'name', 'test-env',
      'url', 'https://test-api.example.com/events',
      'type', 'sse'
    )
  ))
)
WHERE key = 'src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser';

`;
