 # TUKA - The Ultimate Karen App

## Overview
TUKA (The Ultimate Karen App) is a hybrid mobile application that enables citizens to document and report neighborhood issues. The app features a gamification system with a Karen Leaderboard to encourage community participation.

## Features
- Report neighborhood issues with photo/video evidence
- Automatic location tracking for accurate problem reporting
- Interactive map view of all reports
- Filterable list view of reports
- Gamification system with points and levels
- User rankings and leaderboard
- Push notification support
- Dark mode support

## Technology Stack
- **Frontend Framework**: Angular with IONIC
- **Backend**: Supabase (Backend-as-a-Service)
- **Native Features**: Capacitor
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Ionic CLI
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd tuka-app
```

2. Install dependencies:
```bash
npm install
```

3. Add this line to
`/// <reference types="@types/google.maps" />` in `node_modules\@capacitor\google-maps\dist\typings\implementation.d.ts` 

4. Run the development server:
```bash
ionic serve
```

## Building for Native Platforms

### Android
```bash
ionic capacitor add android
ionic capacitor copy android
ionic capacitor sync android
```

### iOS
```bash
ionic capacitor add ios
ionic capacitor copy ios
ionic capacitor sync ios
```

## Project Structure
- `/src/app/components` - Reusable UI components
- `/src/app/pages` - Main application pages
- `/src/app/services` - Business logic and API services
- `/src/app/models` - Data models and types
- `/src/app/guards` - Route guards for authentication
- `/src/app/enums` - Enumerations and constants

## Core Features

### Authentication
- Email/password authentication
- Session management
- Protected routes
- User profile management

### Report Management
- Create, read, update, delete reports
- Categorize issues
- Upload media
- Location tracking
- Status updates

### Gamification
- Point system for user actions
- Level progression
- Leaderboard rankings
- Achievement tracking

### Notifications
- Push notifications for report updates
- Local notifications for level ups
- Custom notification preferences

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Support
For support or bug reports, please open an issue in the repository or contact the development team.

## Authors
- Development Team at [Your Organization]
