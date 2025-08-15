# VolunteerFlow - Recruitment Management System

## Overview

VolunteerFlow is a comprehensive talent acquisition system designed for managing volunteer recruitment across multiple sectors and countries. The application handles the complete 27-month volunteer journey from initial interest through successful deployment, supporting 6 different sectors (education, healthcare, agriculture, environment, technology, and community development).

The system provides end-to-end recruitment pipeline management including lead generation, position management, application processing, medical screening, and volunteer placement tracking with comprehensive reporting and analytics capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with role-based page access
- **UI Framework**: Shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack React Query for server state and caching
- **Forms**: React Hook Form with Zod schema validation

### Backend Architecture
- **Runtime**: Node.js with Express.js web framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Authentication**: Passport.js with OpenID Connect (Replit Auth integration)
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with middleware-based request logging

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Session Storage**: PostgreSQL table for persistent user sessions
- **Connection Management**: Connection pooling via @neondatabase/serverless

### Authentication and Authorization
- **Provider**: Replit's OpenID Connect implementation
- **Session Strategy**: Server-side sessions with secure HTTP-only cookies
- **Authorization**: Role-based access control with middleware protection
- **User Management**: Automatic user creation/updates via OIDC claims

### Data Model Design
- **Core Entities**: Users, Volunteers, Positions, Applications, Medical Screenings, Placements, Activities
- **Status Tracking**: Comprehensive status enums for recruitment pipeline stages
- **Audit Trail**: Activity logging for all major system events
- **Relationships**: Proper foreign key relationships between entities with cascading operations

### Development Workflow
- **Hot Reloading**: Vite development server with HMR support
- **Type Safety**: Full TypeScript coverage across client and server
- **Code Organization**: Monorepo structure with shared schema between frontend and backend
- **Build Process**: Separate client and server build pipelines with ESM modules

## External Dependencies

### Database Services
- **Neon**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations and schema management

### Authentication Services
- **Replit Auth**: OpenID Connect provider for user authentication
- **Passport.js**: Authentication middleware for Express

### UI/UX Libraries
- **Radix UI**: Accessible component primitives for complex interactions
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management and validation

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **TypeScript**: Static type checking and improved developer experience
- **TanStack React Query**: Server state management and caching
- **Zod**: Runtime type validation for forms and API data