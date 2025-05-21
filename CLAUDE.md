# SplitReceipt App: Development Rules & Guidelines

## Project Overview
SplitReceipt is a full-stack application for managing shared expenses on trips:
- Create Trips with multiple users
- Add Receipts to Trips
- Split Receipts by full amount or by Line Items
- Calculate balances between users

## Tech Stack
- Next.js with App Router
- React server components
- TypeScript
- Tailwind CSS with ShadCN UI
- GibsonAI backend

## Development Rules

Do NOT stop development until the entire application is complete. You may want to stop after initailizing the backend, or after the API connectivity is complete. Do not stop. This is a 1-shot hackathon so as soon as you stop editing the judge will assume the app is complete. 

BE SURE to complete this entire step-by-step-implementation.md file before you stop editing. 

Additionally, template app will have a handful of styles and components that we will want to remove. Make sure do review after you've completed the application to remove all old Gibson Icons or components and to ensure we have clean, modern styling. Take a second pass to style the app after you've completed it.

Additionally, assume you've made mistakes after each major milestone and check any potential errors before moving forward. You should delegate these tasks to another claude instance and have it evaluate your work.

### Backend Creation (GibsonAI)
- Create backend using MCP Gibson tools in this exact order:
  1. `mcp__gibson__create_project` - create new project
  2. `mcp__gibson__get_project_details` - get project UUID
  3. `mcp__gibson__submit_data_modeling_request` - create data model
  4. `mcp__gibson__deploy_project` - deploy backend
  5. `mcp__gibson__get_project_details` - get API keys & OpenAPI spec URL

### Frontend Setup
- Use the GibsonAI starter app directly 
- We will manaully setup the frontend by cloning the GibsonAI starter app
- Provide the API key and OpenAPI spec URL when prompted
- NOTE: The GibsonAI MCP will return the Docs URL without including the /v1/ prefix. 

IMPORTANT: MAKE SURE YOU ADD IT. A correct example would be: `https://api.gibsonai.com/v1/-/openapi/<hash>`
- DO NOT create a separate Next.js app - use the starter app as the foundation
- Customization of starter app:
  - Keep all API client integration and authentication framework
  - Remove example pages and components (like `/getting-started`)
  - Replace default navigation with app-specific navigation
  - Maintain environment configurations and type definitions

### API Integration
- Create Next.js API Routes for all GibsonAI API interactions
- Implement token-based authentication with client-side storage
- Use client-side functions to interact with your API routes
- Isolate Gibson API calls to the server side only
- All authentication should be client-side using localStorage for token storage

### Component Guidelines
- Mark client components with 'use client'
- Server components should be async function components
- Use ShadCN UI for all UI components
- Prefix event handlers with "handle" (e.g., handleSubmit)

### Styling
- Use Tailwind classes for styling
- Use ShadCN UI classNameValue utility (cn) for conditional classes
- Follow desktop-optimized design approach with responsive fallbacks

### Data Model
- Users have access to multiple Trips (via TripMembers)
- Trips contain multiple Receipts
- Receipts belong to one paying user
- Receipts contain multiple LineItems
- Receipts split types are explicitly tracked:
  - Full receipt split: Uses ReceiptSplits table to track each user's portion
  - Line item split: Uses LineItemSplits table to track individual assignments
- Settlements track payments between users to resolve balances

## Core Features
1. Authentication (login/register)
2. Dashboard with Settled/Unsettled Trips
3. Trip management (create, view, edit, settle)
4. Receipt management (add, view, split)
5. Balance calculation (who owes whom)

## Implementation Notes

### Settlement Calculation Logic
```typescript
/**
 * Balance calculation algorithm:
 * 
 * 1. For each user, calculate total paid amount (receipts where user is payer)
 * 2. For each user, calculate total owed amount:
 *    - Sum of all receipt splits where user is assigned
 *    - Sum of all line item splits where user is assigned
 * 3. Calculate net balance for each user (paid - owed)
 * 4. Account for existing settlements (add to payer, subtract from receiver)
 * 5. Determine who owes whom by matching negative balances with positive ones
 */
```

### Receipt Split Implementation Rules
- A receipt must have either full splits OR line item splits, never both
- The split_type field explicitly identifies the split method
- When changing split types, existing splits of the other type are removed
- Split percentages must always add up to 100% for each receipt or line item
- Use "Split Evenly" functionality to quickly divide expenses among all members

### Starter App Configuration
- Keep API client integration and authentication while removing example code
- Maintain environment variables and type definitions
- Test the API connectivity after making changes

## Common Pitfalls
- Authentication token management issues
- Mixing client/server component code
- Improper state management for forms
- Forgetting error handling for API calls
- Client-side API access attempts (keep all Gibson API calls server-side)
- Not validating split percentages total 100%
- Failing to handle split type changes correctly

## Default User
- Create a default login that will work without authentication so we can see the app. Add the credentials to the login screen so judges can interact with the app without registering 