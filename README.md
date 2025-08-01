# Holistic Care CRM

A comprehensive healthcare CRM system for managing patients, appointments, and medical records with role-based access for administrators, managers, and agents.

## Features

- **Role-based Authentication**: Separate dashboards for Admin, Manager, and Agent roles
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Form Validation**: Client-side validation with real-time feedback
- **Password Security**: Password visibility toggle and strength requirements
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Framework**: Next.js 15.4.5 with React 19
- **Styling**: Tailwind CSS 4.0 with custom design system
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Fonts**: Geist Sans and Geist Mono

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd holistic-care
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration values.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Credentials

The application includes demo authentication for testing purposes:

- **Admin**: admin@holisticcare.com / admin123
- **Manager**: manager@holisticcare.com / manager123  
- **Agent**: agent@holisticcare.com / agent123

## Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── auth/              # Authentication pages
│   │   ├── login/         # Login page
│   │   └── forgot-password/ # Password reset page
│   ├── dashboard/         # Role-based dashboards
│   │   ├── admin/         # Admin dashboard
│   │   ├── manager/       # Manager dashboard
│   │   └── agent/         # Agent dashboard
│   ├── globals.css        # Global styles
│   ├── layout.js          # Root layout
│   └── page.js            # Home page
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── ui/                # UI components (shadcn/ui)
│   └── error-boundary.jsx # Error boundary component
└── lib/
    └── utils.js           # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features by Role

### Admin Dashboard
- Complete system overview with statistics
- User management capabilities
- System-wide reports and analytics
- Staff management
- System settings and configuration

### Manager Dashboard
- Team management and oversight
- Department-specific metrics
- Task assignment and tracking
- Performance monitoring
- Schedule management

### Agent Dashboard
- Patient management
- Appointment scheduling
- Task management
- Patient communication
- Personal productivity metrics

## Security Features

- Form validation with real-time feedback
- Password strength requirements
- Secure authentication flow
- Error boundary protection
- Input sanitization

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast support
- Focus management

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.
