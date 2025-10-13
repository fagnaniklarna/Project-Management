# Acquiring Partner Management Tool

A comprehensive CRM-style project management tool designed for Solution Engineers and Delivery Managers to track and manage acquiring partners like Stripe, JPMorgan Chase, Adyen, and others.

## Features

- **Partner Management**: Create, edit, and track acquiring partners
- **Team Assignment**: Assign partners to specific teams
- **Owner Management**: Set primary and secondary owners for each partner
- **Solution Engineer Assignment**: Assign dedicated solution engineers
- **Search & Filtering**: Find partners by name, team, owner, or status
- **Volume Tracking**: Track transaction volumes for each partner
- **Status Management**: Monitor partner status (Active, Inactive, Pending)
- **Action Tracking**: Track actions and tasks for each partner

## Tech Stack

- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: React, TypeScript, Tailwind CSS
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Initialize the database with sample data:
   ```bash
   npm run init-db
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd client/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will run on `http://localhost:3000`

## Sample Data

The application comes pre-loaded with sample data including:

- **Teams**: North America Team, Europe Team, Asia Pacific Team
- **Users**: Dexter Vosper (Primary Owner), David Summersbee (Secondary Owner), Carin Baker (Solution Engineer)
- **Partners**: Stripe, JPMorgan Chase, Adyen
- **Actions**: Sample tasks and activities for each partner

## API Endpoints

### Partners
- `GET /api/partners` - Get all partners
- `GET /api/partners/:id` - Get partner by ID
- `POST /api/partners` - Create new partner
- `PUT /api/partners/:id` - Update partner
- `DELETE /api/partners/:id` - Delete partner
- `GET /api/partners/search` - Search partners with filters

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user

### Actions
- `GET /api/partners/:partnerId/actions` - Get actions for a partner
- `POST /api/partners/:partnerId/actions` - Create action for a partner

## Usage

1. **View Partners**: The main dashboard shows all acquiring partners in a card-based layout
2. **Add Partner**: Click the "Add Partner" button to create a new partner
3. **Edit Partner**: Click the menu icon on any partner card to edit
4. **Search**: Use the search bar to find partners by name or description
5. **Filter**: Use the filter dropdowns to filter by team, owner, or status
6. **View Details**: Click "View Details" on any partner card (placeholder for future implementation)

## Database Schema

The application uses SQLite with the following main tables:

- **teams**: Stores team information
- **users**: Stores user information with roles
- **acquiring_partners**: Stores partner information with relationships
- **actions**: Stores action items for each partner

## Development

### Backend Development
- Use `npm run dev` for development with auto-restart
- Database file: `server/database.sqlite`
- API documentation available at `/api` endpoints

### Frontend Development
- Hot reloading enabled in development mode
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design for mobile and desktop

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
