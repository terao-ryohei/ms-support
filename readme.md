# SES Management System

## Overview
This project is a comprehensive system built to support the sales department in SES (System Engineering Service) businesses. The system is designed to manage clients, affiliated companies, and workers while generating invoices and purchase orders in Excel format based on the managed data.

## Tech Stack
- **Frameworks and Libraries**:
  - [Remix](https://remix.run/): For building the web application with server-side rendering and modern React features.
  - [Hono](https://hono.dev/): A fast, small, and middleware-focused web framework for API routing.
  - [Vite](https://vitejs.dev/): For fast and modern front-end tooling and development.
- **Runtime**:
  - [Bun](https://bun.sh/): A fast JavaScript runtime for running server-side code.
- **Deployment**:
  - [Cloudflare](https://www.cloudflare.com/): For scalable and performant deployment of the application.

## Features
- **Client Management**: Track and manage SES clients and their respective details.
- **Affiliation Management**: Maintain records of affiliated companies and their roles in contracts.
- **Worker Management**: Manage individual worker and their contracts.
- **Document Generation**: Automatically generate Excel-based invoices and purchase orders based on the system's managed data.

## Prerequisites
Ensure the following tools are installed on your system:
- [Node.js](https://nodejs.org/) (preferably Bun for this project)
- [Bun](https://bun.sh/)
- [Git](https://git-scm.com/)
- [Cloudflare CLI](https://developers.cloudflare.com/workers/wrangler/)

## Installation
1. Clone the repository:
```bash
git clone https://github.com/terao-ryohei/ms-support
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
Create a `wrangler.toml` file in the root directory with the necessary configuration.
For example:
```toml
name = "ms-support"
compatibility_date = "2024-10-03"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./build/client"

[[kv_namespaces]]
binding = "RSA"
id = YOUR_KV_ID

[[d1_databases]]
binding = "DB"                                       # i.e. available in your Worker on env.DB
database_name = YOUR-DB-NAME
database_id = YOUR-DB-ID
migrations_dir = "drizzle"

[observability]
enabled = true

[vars]
NODE_ENV = "production"
```

Create a `.env` and `.env.production` file in the root directory with the necessary configuration.
For example:
```env
VITE_API_URL="http://localhost:5173"
```


4. Generate local DB
```bash
bun run generate
bun run local:migration
```

5. Start the development server:
```bash
bun run dev
```

5. Access the application in your browser:
Navigate to `http://localhost:5173`.

## Deployment
To deploy the system on Cloudflare:
1. Build the application:
```bash
bun run build
```

2. Deploy using Cloudflare Wrangler:
```bash
bun run remote:migration
bun run deploy
```

## Usage
1. Navigate through the dashboard to manage clients, affiliates, and contractors.
2. Use the document generation feature to export Excel files for invoices and purchase orders.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

