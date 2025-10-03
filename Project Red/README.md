# Project Red - Django Template

## Project Overview

Project Red is a structured foundation for building an interactive fishing game with various engagement features including popups, fake advertisements, and a mock economy system.

## Directory Structure

```
Project Red/
├── .venv/                     # Python virtual environment
├── manage.py                  # Django management script
├── project_red/               # Main Django project configuration
│   ├── __init__.py
│   ├── settings.py           # Project settings (all apps configured)
│   ├── urls.py               # Main URL routing
│   ├── wsgi.py               # WSGI configuration
│   └── asgi.py               # ASGI configuration (async support)
├── core/                      # Base project functionality
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── migrations/
├── frontend/                  # UI templates and static assets
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── migrations/
├── gameplay/                  # Fishing mechanics and game logic
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── migrations/
├── store/                     # Fake economy and payment systems
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── migrations/
├── events/                    # Popups, ads, and chatbot features
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── migrations/
├── database/                  # Data models and relationships
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── migrations/
├── qa/                        # Testing and debugging utilities
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── models.py
│   ├── tests.py
│   ├── views.py
│   └── migrations/
├── docs/                      # Project documentation
│   └── README.md             # Documentation guidelines
└── README.md                 # This file
```

## App Descriptions

### **Core App**
- **Purpose**: Base project functionality, routing, main settings, homepage
- **Responsibilities**: 
  - Main landing page and navigation
  - Core project settings and configurations
  - Base URL routing and common utilities
  - Project-wide middleware and authentication

### **Frontend App**
- **Purpose**: Templates, static assets, UI layouts
- **Responsibilities**:
  - HTML templates and layouts
  - CSS stylesheets and JavaScript files
  - Static asset management
  - UI components and theme management

### **Gameplay App**
- **Purpose**: Fishing mechanics and game logic
- **Responsibilities**:
  - Fishing game mechanics and rules
  - Game state management
  - Player interactions and controls
  - Game progression and scoring

### **Store App**
- **Purpose**: Fake economy and payment gag system
- **Responsibilities**:
  - Mock payment processing
  - Virtual currency management
  - Fake product catalog
  - Purchase simulation and gag transactions

### **Events App**
- **Purpose**: Popups, fake ads, chatbot interruptions
- **Responsibilities**:
  - Pop-up advertisement system
  - Chatbot interactions and responses
  - Event-driven interruptions
  - User engagement features

### **Database App**
- **Purpose**: Models for schema, relationships, persistence
- **Responsibilities**:
  - Database schema definitions
  - Model relationships and constraints
  - Data persistence layer
  - Database utilities and helpers

### **QA App**
- **Purpose**: Testing and debugging (unit + integration)
- **Responsibilities**:
  - Unit test suites
  - Integration testing
  - Debugging utilities
  - Quality assurance tools

## Technology Stack

- **Framework**: Django 5.2.6
- **Python Version**: 3.10.11
- **Environment**: Virtual Environment (.venv)
- **Database**: SQLite (default, can be configured)

## Getting Started

### Prerequisites
- Python 3.10+
- Virtual environment (may need to be configured on your IDE/PC)

### Installation
The project is already set up with a virtual environment and Django installed.

### Running the Project
```bash
# Activate virtual environment (if not already active)
.\.venv\Scripts\Activate.ps1

# Apply migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Development Commands
```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic
```

## Project Status

## Each app contains the standard Django structure but is ready for development:

- Project structure created
- All apps registered in settings
- Virtual environment configured
- Models, views, and templates to be implemented
- URL routing to be configured
- Frontend assets to be added

## Next Steps

1. Define models in each app's `models.py`
2. Create views and URL patterns
3. Design templates in the frontend app
4. Implement game logic in the gameplay app
5. Set up static file handling
6. Configure database relationships
7. Add testing suites in the qa app

## Git Collaboration Workflow

### Setting Up for Your Team

#### 1. **Create GitHub Repository**
1. Go to GitHub and create a new repository named `project-red`
2. **Don't** initialize with README (we already have one)
3. Copy the repository URL

#### 2. **Connect Local Repository to GitHub**
```bash
# Add GitHub remote (replace with your actual repository URL)
git remote add origin https://github.com/yourusername/project-red.git

# Push initial commit to GitHub
git push -u origin master
```

#### 3. **Team Members Clone Repository**
```bash
# Each team member runs this
git clone https://github.com/yourusername/project-red.git
cd project-red

# Set up their own virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1  # On Windows
pip install django
```

### Daily Development Workflow

#### **Before Starting Work:**
```bash
# Always pull latest changes first
git pull origin master

# Create a new branch for your feature
git checkout -b feature/your-feature-name
```

#### **While Working:**
```bash
# Check what files you've changed
git status

# Add your changes
git add .

# Commit with descriptive message
git commit -m "Add: Brief description of what you built"
```

#### **When Ready to Share:**
```bash
# Push your branch to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub for team review
```

#### **Branch Naming Convention:**
- `feature/fishing-mechanics` - New features
- `fix/login-bug` - Bug fixes  
- `update/readme-docs` - Documentation updates

### Team Coordination

#### **Who Works on What:**
- **Core App**: Team lead + routing specialist
- **Frontend App**: UI/UX designer + frontend developer
- **Gameplay App**: Game logic developers
- **Store App**: Backend developer (fake payments)
- **Events App**: Interactive features developer
- **Database App**: Database/backend specialist
- **QA App**: Testing specialist + all team members

#### **Merge Strategy:**
1. Create feature branches for all changes
2. Use Pull Requests for code review
3. Require at least 1 review before merging
4. Delete feature branches after merging

## Contributing

This template provides a solid foundation for collaborative development with clear separation of concerns across different functional areas.

### Quick Setup Commands for New Team Members:
```bash
# 1. Clone the repository
git clone [repository-url]
cd project-red

# 2. Set up environment  
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install django

# 3. Run initial Django setup
python manage.py migrate
python manage.py runserver
```

---

