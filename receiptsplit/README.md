# SplitReceipt

SplitReceipt is a full-stack application for managing shared expenses on trips. It helps users create trips with multiple members, add receipts, split expenses, and calculate balances between members.

## Features

- **User Authentication**: Register and login with email and password
- **Trip Management**: Create, view, and edit trips with multiple members
- **Receipt Management**: Add receipts with full or line item splits
- **Expense Splitting**: Split expenses evenly or by custom percentages
- **Balance Calculation**: Automatically calculate who owes whom
- **Settlement Recording**: Record payments between members to settle balances

## Tech Stack

- **Frontend**: Next.js with App Router, React server components, TypeScript, Tailwind CSS, and ShadCN UI
- **Backend**: GibsonAI hosted backend with MySQL database
- **Authentication**: JWT-based authentication

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` and add your GibsonAI API keys
4. Generate TypeScript types from the OpenAPI spec:
   ```
   npx openapi-typescript YOUR_OPENAPI_SPEC_URL -o src/gibson/types.ts --root-types
   ```
5. Start the development server: `npm run dev`

## Project Structure

- `/src/app`: Next.js app routes and pages
- `/src/components`: UI components
- `/src/lib`: Utility functions and API client
- `/src/gibson`: GibsonAI integration and types

## Default Login

For testing purposes, you can use the following credentials:
- Email: user1@example.com
- Password: password123

## License

MIT