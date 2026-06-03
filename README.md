## NutriLog

NutriLog is a Progressive Web App (PWA) for tracking daily meals, calories, macronutrients, recipes, wishlist items, cart flow, and personalized nutrition goals.

This project was built with React, Vite, TypeScript, Tailwind CSS, shadcn/ui, React Router, and Vite PWA.

NutriLog helps users manage their daily nutrition by tracking food intake, calculating calorie and macro goals, saving favorite recipes, managing a meal cart, and reviewing daily nutrition summaries.

## Features

- User login and signup flow
- User onboarding and profile setup
- Personalized calorie and macronutrient goals
- Recipe list and recipe detail page
- Food cart flow
- Wishlist feature
- Daily meal log
- Nutrition summary dashboard
- Mobile-friendly PWA layout
- Installable PWA assets
- Admin panel for recipe, user, and stats management
- Local recipe image assets
- Local security improvements

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Vite PWA
- Vitest

## Getting Started

Install dependencies:

```bash
npm install
```
Run development server:
```
npm run dev
```
Build for production:
```
npm run build
```
Run tests:
```
npm test
```

## Version History

v1.0.0
Initial NutriLog project setup using React, Vite, TypeScript, Tailwind CSS, and shadcn/ui components.

v1.0.1
Improved early UI structure, shared components, layout consistency, and base styling.

v1.0.2
Expanded nutrition pages, reusable UI behavior, and application layout structure.

v1.0.3
Added richer food and recipe data integration with improved nutrition calculation flow.

v1.1.0
Added user flow, protected routes, profile-aware tracking, daily summaries, and improved meal/cart interactions.

v1.2.0
Added PWA assets, mobile-ready improvements, recipe pages, cart, wishlist, and summary improvements.

v1.2.1
Refined onboarding, profile setup, personal nutrition goals, and daily target calculations.

v1.2.2
Completed the main NutriLog PWA feature set, including authentication, onboarding, recipes, cart, wishlist, daily logs, summary dashboard, profile page, and production build configuration.

v1.2.3
Security hardening release.

Security improvements:
- Added PBKDF2-SHA256 password hashing
- Added login brute-force lockout
- Added generic login error messages to reduce user enumeration
- Added stronger password validation
- Added session expiration
- Added automatic migration from plaintext local passwords to hashed passwords
- Added Content Security Policy and security headers
- Fixed production dependency audit vulnerabilities

v1.2.4
Local recipe image fix.

Changes:
- Added local recipe image assets
- Updated recipe data to use local public image paths
- Improved Netlify deployment compatibility for recipe images
- Updated PWA build config to include recipe image assets
  
v1.3.0
Admin panel and deployment stability update.

Changes:
- Added Admin Panel for stats, user overview, and recipe management
- Added admin-only route protection
- Added recipe data persistence through localStorage
- Added automatic migration for older stored recipe data
- Improved admin profile flow for admin accounts without nutrition profiles
- Fixed Unicode and emoji encoding issues across the app
- Improved recipe image loading for Netlify deployment
- Improved mobile spacing for the Add to Cart button and bottom navigation
- Improved stability for recipe list, recipe detail, cart, wishlist, summary, and profile pages
  
## Security Note
NutriLog currently uses browser localStorage for demo authentication and app data. Version v1.2.3 improves local security with password hashing, brute-force lockout, session expiration, and security headers. For production use, authentication should be moved to a backend system with secure server-side password hashing, database storage, server-side rate limiting, and HTTP-only secure cookies.
