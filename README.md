# Holistic Care CRM

A comprehensive Customer Relationship Management system built with React, Material-UI, and modern web technologies.

## Features

### 🔐 Authentication System
- Secure login with email/password
- Protected routes
- User session management
- Logout functionality

### 🏥 Doctor Management
- Add new doctors with comprehensive information
- Doctor profiles with contact details
- Department and procedure assignments
- Availability scheduling
- Multi-select procedures with chip display

### 📱 Responsive Design
- Mobile-first approach
- Responsive sidebar and navigation
- Adaptive layouts for all screen sizes
- Touch-friendly interface

### 🎨 Modern UI/UX
- Material-UI v5 components
- Custom theme with brand colors
- Smooth animations and transitions
- Professional healthcare aesthetic

## Technology Stack

- **Frontend**: React 19, Material-UI v5
- **Routing**: React Router v7
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Notifications**: Notistack
- **Build Tool**: Vite
- **Styling**: CSS3 with Material-UI theming

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crm
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Usage

### Login Credentials
- **Email**: ahmadraza445@gmail.com
- **Password**: hdc7w8634io@

### Navigation
- **Dashboard**: Overview with statistics and quick actions
- **Doctors**: Manage healthcare professionals
- **Procedures**: View available medical procedures
- **Appointments**: Schedule management
- **Reports**: Analytics and insights
- **Settings**: System configuration

### Adding a Doctor
1. Click the "Add Doctor" button on the dashboard
2. Fill in the required information:
   - Doctor Name
   - Email
   - Department
   - Procedures (multi-select)
   - Contact Number
   - Address
3. Set availability for each day of the week
4. Submit the form

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── forms/          # Form components
│   ├── sidebar/        # Navigation sidebar
│   └── topbar/         # Top navigation bar
├── contexts/           # React Context providers
├── pages/              # Page components
├── theme/              # Material-UI theme configuration
├── assets/             # Images and static files
└── hooks/              # Custom React hooks
```

## API Endpoints

The application is configured to work with the following API endpoints:

- `POST /api/doctors` - Create new doctor
- `GET /api/departments` - Fetch departments
- `GET /api/procedures` - Fetch procedures

## Customization

### Theme Colors
Edit `src/theme/palette.js` to customize the application colors:

```javascript
const palette = {
  primary: {
    main: '#23C7B7',    // Primary brand color
    light: '#7DE8DD',   // Light variant
    dark: '#1EAE9F',    // Dark variant
  },
  // ... other colors
};
```

### Adding New Features
1. Create new components in the appropriate directory
2. Add routes in `src/App.jsx`
3. Update navigation in the sidebar
4. Follow the existing code patterns and styling

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.
