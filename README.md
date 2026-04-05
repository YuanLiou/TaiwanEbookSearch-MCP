# TaiwanEbookSearch MCP

<!-- TODO: 可以加上 npm version / license badge，例如：
[![npm version](https://img.shields.io/npm/v/taiwan-ebook-search-mcp)](https://www.npmjs.com/package/taiwan-ebook-search-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
-->

讓 AI 透過這個 MCP Server，直接用自然語言查詢各大台灣電子書平台的書籍價格，免開瀏覽器

MCP Server for searching and comparing ebook prices across Taiwan bookstores.

<img width="800px" alt="Preview Image" src="https://github.com/user-attachments/assets/6a2ec289-e5cd-4203-8d36-eec04f1c0f3f" />

## Features

- **`search_ebooks`** — 搜尋書籍並比較各書城價格 (Search for books and compare prices across multiple e-book stores)
- **`list_bookstores`** — 列出所有支援的電子書城及服務狀態 (List all supported e-book stores and their availability)
- **`get_search_result`** — 以 ID 取得過去的搜尋紀錄 (Retrieve past search records by ID)

## Requirements

- Node.js >= 18.0.0

## Setup

### Claude Desktop

編輯 Claude Desktop 設定檔

Edit Claude Desktop configuration file

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "taiwan-ebook-search": {
      "command": "npx",
      "args": ["-y", "@louis383/tw-ebook-search-mcp"]
    }
  }
}
```

重新啟動 Claude Desktop 後即可使用。

Restart Claude Desktop after completion

## Tools

### `search_ebooks`

搜尋書籍並比價，回傳各書城結果

Search for books and compare prices, returning results from each store

| 參數 (Parameter) | 類型 (Type) | 必填 (Required) | 說明 (Description) |
|---|---|---|---|
| `keywords` | `string` | ✅ | 搜尋關鍵字 (書名、作者等) (Search keywords, e.g. book title, author, etc.) |
| `bookstores` | `string[]` | ❌ | 指定書城 ID，省略則搜尋全部可以用的書城 (Specify bookstore IDs; if omitted, all available bookstores will be searched) |
| `maxResultsPerBookstore` | `number` | ❌ | 每個書城最多回傳幾筆 (預設 3) (Maximum number of results per bookstore; default is 3) |

### `list_bookstores`

列出所有支援的電子書城及可用狀態，無需參數

List all supported e-book stores and their availability; no parameters required

### `get_search_result`

以 ID 取得過去的搜尋紀錄

Retrieve past search results by ID

| 參數 (Parameter) | 類型 (Type) | 必填 (Required) | 說明 (Description) |
|---|---|---|---|
| `id` | `string` | ✅ | 搜尋紀錄 ID (Search record ID) |
| `maxResultsPerBookstore` | `number` | ❌ | 每個書城最多回傳幾筆 (預設 3) (Maximum number of results per bookstore; default is 3) |

## Environment Variables

| 變數 (Variable) | 說明 (Description) | 預設值 (Default Value) |
|---|---|---|
| `API_BASE_URL` | API 的 base URL (Base URL of the API) | 台灣電子書搜尋網站網址 TW Ebook Search Url |
| `ALLOW_UNSAFE_API_BASE_URL` | 允許使用非預設的 `API_BASE_URL` (僅限本機開發使用) (Allow using a non-default API_BASE_URL; local development only) | `false` |

## Development

```bash
npm install
npm run build
npm test
```

本機測試方式

Local testing method

```bash
npx @modelcontextprotocol/inspector node ./dist/index.js
```

## License

MIT
