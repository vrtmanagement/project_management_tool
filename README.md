# 📊 Enterprise Management System

A comprehensive project and task management system built with Next.js, MongoDB, and modern web technologies. Organize your work with workspaces, projects, and tasks in a beautiful, intuitive interface.

## ✨ Features

### 🏢 Workspace Management
- Create and manage multiple workspaces
- Switch between workspaces seamlessly
- Workspace-based project organization
- Team member management per workspace
- Persistent workspace selection

### 📁 Project Management
- Full CRUD operations for projects
- Project status tracking (Planning, Active, On-Hold, Completed, Archived)
- Priority levels (Low, Medium, High, Urgent)
- Custom color coding for visual identification
- Start and end date tracking
- Progress tracking with visual indicators
- Grid and list view modes
- Search and filter functionality

### ✅ Task Management
- Create, update, and delete tasks within projects
- Drag & Drop Kanban board interface
- Multiple status columns (To Do, In Progress, In Review, Completed)
- Task assignment to team members
- Due date tracking with overdue indicators
- Priority levels and tags
- Rich task details and descriptions
- Real-time status updates

### 👥 Team Collaboration
- User roles (Admin, Member, Viewer)
- Team member management
- Workspace and project-level permissions
- User profile management
- Team activity tracking

### 🔐 Authentication & Security
- JWT-based authentication
- Secure user registration and login
- Protected API routes
- Role-based access control
- Session management

### 📝 Reflections
- Admin reflection management
- User reflection tracking
- Reflection viewing and management

### 🎨 User Interface
- Modern, responsive design
- Dark mode compatible
- Beautiful animations and transitions
- Intuitive drag-and-drop interface
- Mobile-friendly layout
- Accessible components

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **@dnd-kit** - Drag and drop functionality
- **Axios** - HTTP client
- **date-fns** - Date utilities
- **Sonner** - Toast notifications
- **Framer Motion** - Animations

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing (ready for implementation)

### Development Tools
- **ESLint** - Code linting
- **TypeScript-ready** - Type safety support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18+ and npm/yarn/pnpm
- **MongoDB** database (local or cloud like MongoDB Atlas)
- **Git** for version control

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd emanagementsystem
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/emanagementsystem
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Secret (use a strong random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Next.js (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** 
- Never commit `.env.local` to version control
- Use a strong, random string for `JWT_SECRET` in production
- For MongoDB Atlas, replace the connection string with your actual credentials

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Create Your First Account

1. Navigate to `/register`
2. Create an admin account (first user is typically admin)
3. Log in with your credentials
4. Create your first workspace
5. Start creating projects and tasks!

## 📁 Project Structure

```
emanagementsystem/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Authentication endpoints
│   │   │   ├── workspaces/      # Workspace CRUD
│   │   │   ├── projects/        # Project CRUD
│   │   │   ├── tasks/           # Task CRUD
│   │   │   ├── users/           # User management
│   │   │   └── reflections/     # Reflection endpoints
│   │   └── dashboard/           # Dashboard pages
│   │       ├── page.js          # Main dashboard
│   │       ├── projects/        # Projects list & detail
│   │       ├── team/            # Team management
│   │       ├── settings/        # Settings page
│   │       └── reflections/     # Reflections page
│   ├── components/
│   │   ├── layout/              # Layout components
│   │   ├── projects/            # Project components
│   │   ├── tasks/                # Task components
│   │   ├── workspace/           # Workspace components
│   │   └── ui/                   # shadcn/ui components
│   ├── context/                  # React contexts
│   │   ├── AuthContext.js
│   │   ├── ProjectContext.js
│   │   └── WorkspaceContext.js
│   ├── lib/                      # Utilities
│   │   ├── auth.js
│   │   ├── mongodb.js
│   │   └── utils.js
│   └── models/                   # MongoDB models
│       ├── User.js
│       ├── Workspace.js
│       ├── Project.js
│       ├── Task.js
│       └── Reflection.js
├── public/                        # Static assets
├── .env.local                     # Environment variables (create this)
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Workspaces
- `GET /api/workspaces` - Get all workspaces for user
- `POST /api/workspaces` - Create new workspace
- `DELETE /api/workspaces/[workspaceId]` - Delete workspace
- `POST /api/workspaces/[workspaceId]/members` - Add member to workspace
- `DELETE /api/workspaces/[workspaceId]/members/[memberId]` - Remove member

### Projects
- `GET /api/projects?workspace=[id]` - Get all projects (optionally filtered by workspace)
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get single project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project
- `GET /api/projects/[id]/members` - Get project members

### Tasks
- `GET /api/tasks?project=[id]&status=[status]` - Get all tasks (with filters)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get single task
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Users
- `GET /api/users` - Get all users (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

### Reflections
- `GET /api/reflections` - Get reflections
- `POST /api/reflections` - Create reflection
- `GET /api/reflections/admin` - Get admin reflections

**Note:** All API endpoints (except auth) require JWT authentication via `Authorization: Bearer <token>` header.

## 🎯 Usage Guide

### Creating a Workspace

1. Log in to your account
2. Click "New Workspace" button
3. Enter workspace name and description
4. Click "Create Workspace"
5. The workspace is automatically selected

### Creating a Project

1. Ensure you have a workspace selected
2. Navigate to Projects page or Dashboard
3. Click "New Project" button
4. Fill in project details:
   - Name (required)
   - Description
   - Status
   - Priority
   - Color
   - Start/End dates
5. Click "Create Project"

### Managing Tasks

1. Open a project from the Projects page
2. View the Kanban board with 4 columns:
   - **To Do** - New tasks
   - **In Progress** - Active work
   - **In Review** - Tasks under review
   - **Completed** - Finished tasks
3. **Create Task**: Click "+ Add Task" in any column
4. **Move Task**: Drag and drop between columns
5. **View/Edit**: Click on any task card
6. **Delete**: Use the task menu options

### Team Management

1. Navigate to Team page (`/dashboard/team`)
2. View all system users
3. Add users to current workspace (admin only)
4. Remove users from workspace (admin only)
5. View user roles and details

### Settings

1. Navigate to Settings page (`/dashboard/settings`)
2. View your profile details
3. **Admin users** can:
   - Manage all workspaces
   - View workspace members
   - Delete workspaces
   - Manage system users
   - Delete users (except admins)

## 🔐 User Roles

### Admin
- Full system access
- Can create workspaces
- Can manage all workspaces
- Can add/remove workspace members
- Can delete users (except other admins)
- Can view all reflections

### Member
- Can create projects (in workspaces they belong to)
- Can create and manage tasks
- Can view assigned workspaces and projects
- Limited to their workspace access

### Viewer
- Read-only access
- Can view workspaces and projects they have access to
- Cannot create or modify content

## 🗄️ Database Models

### User
- Name, email, password
- Role (admin, member, viewer)
- Avatar URL
- Created timestamp

### Workspace
- Name, description
- Owner (User reference)
- Members array with roles
- Created/updated timestamps

### Project
- Name, description
- Workspace reference
- Status, priority
- Start/end dates
- Members array
- Color coding
- Created/updated timestamps

### Task
- Title, description
- Project and workspace references
- Status, priority
- Assigned users
- Due date
- Tags, attachments, comments
- Created/updated/completed timestamps

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are set in your hosting platform:
- `MONGODB_URI` - Your production MongoDB connection string
- `JWT_SECRET` - Strong random secret key
- `NEXT_PUBLIC_APP_URL` - Your production domain

### Recommended Hosting Platforms

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **AWS Amplify**
- **DigitalOcean App Platform**

### MongoDB Hosting

- **MongoDB Atlas** (recommended)
- Self-hosted MongoDB
- Other MongoDB cloud providers

## 🧪 Development

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Code Style

- ESLint configuration included
- Follow React best practices
- Use functional components with hooks
- Maintain consistent component structure

## 📚 Additional Documentation

- [Dashboard Guide](./DASHBOARD_GUIDE.md) - Dashboard layout and features
- [Workspace Guide](./WORKSPACE_GUIDE.md) - Workspace management details
- [Project & Task Guide](./PROJECT_TASK_MANAGEMENT_GUIDE.md) - Project and task management

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct in `.env.local`
- Check MongoDB service is running (if local)
- Verify network access (if cloud)
- Check MongoDB connection string format

### Authentication Issues
- Verify `JWT_SECRET` is set
- Clear browser localStorage and cookies
- Check token expiration (default: 7 days)

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (18+ required)

