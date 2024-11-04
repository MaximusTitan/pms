# Project Context

This is a Next.js-based affiliate marketing platform with admin and partner portals. The project uses Supabase for database and authentication, ShadCN/Tailwind for styling, and integrates with HubSpot, PayPal, and Wix Forms.

# Technical Requirements

- Always use TypeScript for all code examples and suggestions
- Follow Next.js 13+ App Router conventions and best practices
- Use Supabase client for database operations and auth flows
- Implement proper type safety with Supabase-generated types
- Follow React Server Components patterns - use 'use client' only when necessary
- Prefer server-side data fetching over client-side wherever possible

# Coding Standards

- Use 2 spaces for indentation
- Follow functional component patterns with TypeScript interfaces
- Use ShadCN components when available instead of building from scratch
- Follow Tailwind CSS class naming conventions
- Organize imports in this order: React/Next.js, external libraries, components, types/interfaces, utils
- Use meaningful variable and function names that reflect affiliate marketing domain
- Implement proper error handling for API calls and form submissions
- Use React Hook Form for form handling with Zod validation

# Project Structure

- Place new components in appropriate portal directory (admin/ or partner/)
- Use shared/ directory for common components
- Follow feature-based organization within each portal
- Keep API routes in app/api directory following Next.js conventions
- Place types in types/ directory with proper namespacing
- Store utilities in utils/ directory
- Keep Supabase queries in lib/supabase directory

# Database Conventions

- Use camelCase for TypeScript/JavaScript and snake_case for Supabase
- Always include created_at and updated_at timestamps
- Implement proper foreign key relationships
- Use PostgreSQL functions where appropriate
- Follow proper indexing patterns for frequently queried columns

# State Management

- Use React Query for server state management
- Implement proper loading and error states
- Use React Context only when state needs to be shared across multiple components
- Implement proper client-side caching strategies

# Security Considerations

- Implement proper role-based access control (RBAC)
- Sanitize all user inputs
- Use proper authentication checks in API routes
- Implement rate limiting for API endpoints
- Follow security best practices for handling sensitive data

# Integration Requirements

- Use appropriate TypeScript types for external API responses
- Implement proper error handling for third-party services
- Follow HubSpot API best practices for lead tracking
- Implement PayPal's Payouts API with proper validation
- Handle Wix Forms submissions securely

# Performance Guidelines

- Implement proper code splitting and dynamic imports
- Use Next.js Image component for optimized images
- Implement proper caching strategies
- Use proper lazy loading techniques
- Optimize database queries for performance

# Testing Requirements

- Write unit tests for utility functions
- Implement integration tests for critical flows
- Use proper mocking for external services
- Follow testing best practices with proper assertions
- Maintain good test coverage for critical features
