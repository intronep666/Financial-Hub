# 💰 Financial Hub - AI-Enabled Personal Finance Platform<div align="center">



A modern, secure, and AI-powered personal financial management platform built with microservices architecture.# 💰 Financial Hub



[![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)### *Your Personal Finance Command Center*

[![FastAPI](https://img.shields.io/badge/FastAPI-0.120.4-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)

[![Python](https://img.shields.io/badge/Python-3.13+-3776AB?style=for-the-badge&logo=python)](https://python.org/)<p align="center">

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)  <img src="https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">

  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">

---  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite">

  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">

## 🚀 Features</p>

## 🐳 Deployment & Tooling Overview

### Docker Compose (Recommended)
Spin up PostgreSQL, Redis, the FastAPI backend, Celery worker, frontend (Nginx), and Alembic migrations with a single command:

```bash
docker compose up --build

Note: The frontend build uses Vite env variables (VITE_API_URL/REACT_APP_API_URL) that are passed to the build via Docker build args in `docker-compose.yml`. By default the Compose file points the frontend at `http://backend:8000` when built.
```

- Backend API: http://localhost:8000
- Frontend UI: http://localhost:3000

Quick smoke test (after services are up and migrations have applied):

```bash
# Start services
docker compose up --build -d

# Wait for the backend: then from the repo root run:
./scripts/smoke_test.sh

# On Windows PowerShell:
powershell -File .\scripts\smoke_test.ps1
```

Environment variables flow from `backend/.env`; override values via Compose or `.env` before running the stack.

### Manual Local Development
```bash
# Backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload

# Frontend
cd frontend && npm install && npm run dev -- --host
```

Optional background processing: run `celery -A celery_app.celery_app worker --loglevel=info` in `backend/` with Redis available.

### Continuous Integration
GitHub Actions workflow `.github/workflows/ci.yml` runs on every push/PR:

- **Backend job**: `pip install -r requirements.txt`, `pytest`, and `python -m compileall -q .`.
- **Frontend job**: `npm install`, `npm test -- --watch=false`, and `npm run build`.

Reproduce locally with the commands above to ensure parity before opening pull requests.



### 🔐 Security & Authentication<p align="center">

- **Secure Cookie-Based JWT** (httpOnly cookies - no localStorage)  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License">

- **bcrypt Password Hashing** with salt rounds  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome">

- **CORS Protection** with credential support  <img src="https://img.shields.io/badge/Made%20with-❤️-red.svg?style=flat-square" alt="Made with Love">

- **Input Validation** with Pydantic schemas</p>



### 💰 Financial Management<p align="center">

- **Transaction Tracking** with AI categorization  A comprehensive personal finance management web application that helps you track expenses, manage loans, and achieve your savings goals with beautiful visualizations and intuitive design.

- **Budget Management** with smart alerts</p>

- **Goal Tracking** with AI predictions

- **Loan Management** (borrowing & lending)<p align="center">

- **Smart Notifications** for important events  <a href="#-features">Features</a> •

  <a href="#-getting-started">Getting Started</a> •

### 🤖 AI/ML Features  <a href="#-tech-stack">Tech Stack</a> •

- **AI Transaction Categorization** (automatic labeling)  <a href="#-screenshots">Screenshots</a> •

- **Spending Pattern Analysis** (detect trends)  <a href="#-contributing">Contributing</a>

- **Predictive Financial Insights** (goal completion estimates)</p>

- **Anomaly Detection** (unusual spending alerts)

- **Voice-to-Text** for transaction entry</div>



### 🏗️ Modern Architecture---

- **Microservices** (Auth, Transaction, Goal, Notification services)

- **Progressive Web App (PWA)** with offline support## ✨ Features

- **Dual Database Support** (SQLite dev / PostgreSQL prod)

- **Real-time Streaming** (Kafka/Kinesis ready)<div align="center">

- **Responsive Design** with Tailwind CSS

| 📊 **Dashboard** | 💳 **Transactions** | 🏦 **Loans** | 🎯 **Goals** |

---|:----------------:|:-------------------:|:-------------:|:-------------:|

| Financial Overview | Easy Entry | Debt Management | Goal Setting |

## 🛠️ Tech Stack| Visual Analytics | Category Organization | Lending Records | Progress Tracking |

| Income & Expense Tracking | Transaction History | Outstanding Balances | Achievement Monitoring |

| Layer | Technologies |

|-------|-------------|</div>

| **Backend** | FastAPI 0.120.4, Python 3.13+, SQLAlchemy, Pydantic |

| **Frontend** | React 19.1.1, Tailwind CSS 3.4.17, Axios, Context API |### 📊 **Smart Dashboard**

| **Database** | SQLite (dev), PostgreSQL (prod ready) |> 🎯 Get a complete snapshot of your financial health at a glance

| **AI/ML** | scikit-learn, spaCy, numpy, pandas |

| **Auth** | JWT with httpOnly cookies, bcrypt |- **💹 Financial Overview**: Monitor total income, expenses, and current balance

| **PWA** | Service Worker, IndexedDB |- **📈 Visual Analytics**: Interactive doughnut charts showing expense breakdown by category  

- **💰 Loan Summary**: Track total debt and money lent to others

---- **🔍 Real-time Insights**: Instant updates reflecting your latest transactions



## 📦 Quick Start### 💳 **Transaction Management**

> 📝 Effortlessly track every penny in and out

### Prerequisites

- Python 3.13+- **⚡ Quick Entry**: Add income and expense transactions with one-click categorization

- Node.js 18+- **🏷️ Smart Categories**: Organize transactions with customizable categories

- Git- **📋 Transaction History**: Beautiful table view with dates, amounts, and categories

- **🔄 Real-time Updates**: See changes reflected instantly across the app

### 1️⃣ Clone Repository

```bash### 🏦 **Loan Tracking System**

git clone https://github.com/intronep666/Financial-Hub.git> 🤝 Never lose track of money borrowed or lent

cd Financial-Hub

```- **📉 Debt Management**: Record and track money you've borrowed

- **📈 Lending Records**: Monitor money you've lent to friends and family

### 2️⃣ Backend Setup- **💳 Outstanding Balances**: Clear view of remaining amounts for all loans

```bash- **📊 Visual Separation**: Distinct views for money you owe vs. money owed to you

# Create & activate virtual environment

python -m venv .venv### 🎯 **Savings Goals**

> 🌟 Turn your dreams into achievable financial targets

# Windows PowerShell

.venv\Scripts\Activate.ps1- **🎪 Goal Creation**: Set specific savings targets (e.g., "New Laptop", "Dream Vacation")

- **📊 Progress Visualization**: Beautiful progress bars with percentage completion

# Windows CMD- **🎉 Multiple Goals**: Manage unlimited savings objectives simultaneously

.venv\Scripts\activate.bat- **🏆 Achievement Tracking**: Celebrate milestones as you reach your targets



# Linux/Mac### 🔐 **Secure Authentication**

source .venv/bin/activate> 🛡️ Your financial data is protected with enterprise-grade security



# Install dependencies- **🔑 JWT Authentication**: Industry-standard token-based security

cd backend- **🚀 Easy Registration**: Streamlined account creation process

pip install -r requirements.txt- **🔒 Protected Routes**: Secure access to personal financial data

- **⚡ Fast Login**: Quick and secure access to your financial dashboard

# Configure environment

# Copy env example for development
copy .env.example .env
# Production guidance: copy .env.production.example to your host's environment variables or use your provider's environment variable features.
# When deploying with Docker Compose the database name is 'financial_hub' (see docker-compose.yml). Ensure your DATABASE_URL points at the correct DB name.

# Edit .env with your settings

## 🛠️ Tech Stack

# Start backend

uvicorn main_modernized:app --reload --host 0.0.0.0 --port 8000<div align="center">

```

### Frontend Powerhouse

### 3️⃣ Frontend Setup (New Terminal)<p>

```bash  <img src="https://skillicons.dev/icons?i=react,js,html,css,tailwind" alt="Frontend Technologies"/>

cd frontend</p>



# Install dependencies| Technology | Version | Purpose |

npm install|------------|---------|---------|

| **React** | 19.1.1 | ⚛️ Modern UI with hooks and functional components |

# Configure environment (optional)| **React Router** | 7.9.1 | 🧭 Client-side routing and navigation |

# Default: REACT_APP_API_URL=http://localhost:8000| **Tailwind CSS** | 2.2.19 | 🎨 Utility-first CSS for responsive design |

| **Chart.js** | 4.5.0 | 📊 Interactive data visualization |

# Start frontend| **Axios** | 1.12.1 | 🌐 HTTP client for API communication |

npm start

```### Backend Infrastructure

<p>

### 4️⃣ Access Application  <img src="https://skillicons.dev/icons?i=python,fastapi,sqlite" alt="Backend Technologies"/>

- **Frontend**: http://localhost:3000</p>

- **Backend API**: http://localhost:8000

- **API Docs**: http://localhost:8000/docs| Technology | Purpose |

- **Interactive API**: http://localhost:8000/redoc|------------|---------|

| **FastAPI** | ⚡ Modern, fast Python web framework |

### 🪟 Windows Quick Start| **SQLAlchemy** | 🗄️ SQL toolkit and Object-Relational Mapping |

```bash| **SQLite** | 💾 Lightweight database for data storage |

# Start both servers at once (Windows) — `START-ALL.bat` launches backend, celery worker (optional), and frontend.
```bat
START-ALL.bat
```

# Or individually (Windows):
```bat
start-backend.bat      # Starts uvicorn backend using repo venv (SKIP_DB_INIT flag respected)
start-celery.bat       # Starts Celery worker for background tasks (optional)
start-frontend.bat     # Starts frontend Vite dev server: `npm run dev -- --host`
```

Cross-platform alternatives are included for Unix/macOS and PowerShell workflows:

 - `start-dev.sh`: Bash script to start the backend with the same dev defaults and `SKIP_DB_INIT=true` to avoid DB initialization on import (good for fast iteration and CI runs).
 - `start-celery.sh`: Start the Celery worker from a shell if Redis is available.
 - `start-dev.ps1`: PowerShell equivalent to `start-dev.sh` for consistent development on Windows PowerShell.

By default the local dev start scripts set `SKIP_DB_INIT=true` to reduce accidental database operations on import; if you want the startup to create tables and run the light migrations, set `SKIP_DB_INIT=false` before starting the backend or run `alembic upgrade head` manually.
```

```

## 🚀 Getting Started

---

<div align="center">

## 📁 Project Structure

### Quick Setup Guide

```*Get your Financial Hub running in just 5 minutes!*

Financial-Hub/

│</div>

├── backend/                      # FastAPI Backend

│   ├── config/                  # Configuration### 📋 Prerequisites

│   │   ├── settings.py         # App settings

│   │   └── database.py         # DB configuration<div align="center">

│   │

│   ├── models/                  # Data Models| Requirement | Version | Download Link |

│   │   ├── database_models.py  # SQLAlchemy ORM|-------------|---------|---------------|

│   │   └── schemas.py          # Pydantic schemas| **Node.js** | v14+ | [Download](https://nodejs.org/) |

│   │| **Python** | 3.8+ | [Download](https://python.org/) |

│   ├── services/                # Microservices| **Package Manager** | npm/yarn | Included with Node.js |

│   │   ├── auth_service.py     # Authentication

│   │   ├── transaction_service.py</div>

│   │   ├── goal_service.py

│   │   ├── notification_service.py### 🔧 Installation

│   │   ├── ai_service.py       # ML features

│   │   └── streaming_service.py<details>

│   │<summary><b>🔽 Click to expand installation steps</b></summary>

│   ├── main_modernized.py      # App entry point

│   ├── requirements.txt        # Python packages#### 1️⃣ **Clone the Repository**

│   └── .env                    # Environment vars```bash

│git clone https://github.com/intronep666/Financial-Hub.git

├── frontend/                    # React Frontendcd Financial-Hub

│   ├── src/```

│   │   ├── components/         # React components

│   │   │   ├── Dashboard.js#### 2️⃣ **Backend Setup** 🐍

│   │   │   ├── Transactions.js```bash

│   │   │   ├── Goals.jscd backend

│   │   │   ├── Loans.js

│   │   │   ├── Login.js# Install dependencies

│   │   │   ├── Register.jspip install fastapi uvicorn sqlalchemy passlib python-jose python-multipart bcrypt

│   │   │   └── Navbar.js

│   │   │# Start the backend server

│   │   ├── context/python main.py

│   │   │   └── AuthContext.js  # Auth state```

│   │   │> 🌐 Backend will be available at `http://localhost:8000`

│   │   ├── utils/

│   │   │   └── offlineStorage.js#### 3️⃣ **Frontend Setup** ⚛️

│   │   │```bash

│   │   ├── App.jscd frontend

│   │   └── index.js

│   │# Install dependencies

│   ├── public/                 # Static filesnpm install

│   ├── package.json

│   └── .env                    # Frontend config# Start the development server

│npm start

├── .venv/                      # Python virtual env```

├── START-ALL.bat               # Start both servers> 🌐 Frontend will be available at `http://localhost:3000`

└── README.md                   # This file

```</details>



---### 🎉 **First Steps**



## 🔧 Configuration<div align="center">



### Backend Environment (.env)| Step | Action | Description |

```env|:----:|--------|-------------|

# Database| 1️⃣ | **Register** | Create your account in seconds |

USE_SQLITE=true| 2️⃣ | **Add Transactions** | Start tracking your income & expenses |

DATABASE_URL=sqlite:///./finance.db| 3️⃣ | **Set Categories** | Organize your financial data |

| 4️⃣ | **Create Goals** | Set savings targets to work towards |

# Security| 5️⃣ | **Track Loans** | Record money borrowed or lent |

SECRET_KEY=your-secret-key-here-change-in-production| 6️⃣ | **Monitor Progress** | Watch your financial health improve! |

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30</div>



# Cookie Settings (IMPORTANT for auth)---

COOKIE_SECURE=false    # Set true in production with HTTPS

COOKIE_SAMESITE=lax## 📱 Screenshots

COOKIE_DOMAIN=localhost

<div align="center">

# Development

DEBUG=true### 🎨 **Beautiful, Responsive Design**

```

| 📊 Dashboard Overview | 💳 Transaction Management |

### Frontend Environment (.env)|:---------------------:|:-------------------------:|

```env| ![Dashboard](https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Dashboard+Preview) | ![Transactions](https://via.placeholder.com/400x300/059669/FFFFFF?text=Transactions+View) |

REACT_APP_API_URL=http://localhost:8000| *Complete financial overview with charts* | *Easy transaction entry and history* |

REACT_APP_ENABLE_PWA=true

REACT_APP_ENABLE_AI_FEATURES=true| 🏦 Loan Tracking | 🎯 Goals Progress |

```|:----------------:|:-----------------:|

| ![Loans](https://via.placeholder.com/400x300/DC2626/FFFFFF?text=Loan+Management) | ![Goals](https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Savings+Goals) |

---| *Track money borrowed and lent* | *Visual progress for savings targets* |



## 🔐 Security Features</div>



| Feature | Implementation |---

|---------|---------------|

| **Authentication** | JWT tokens in httpOnly cookies (not localStorage) |## 🔌 API Documentation

| **Password Storage** | bcrypt hashing with salt |

| **CORS** | Configured for credential-based requests |<div align="center">

| **Input Validation** | Pydantic schemas on all endpoints |

| **SQL Injection** | SQLAlchemy ORM (parameterized queries) |### RESTful API Endpoints

| **XSS Protection** | React's built-in escaping |

</div>

---

<details>

## 📡 API Endpoints<summary><b>🔐 Authentication Endpoints</b></summary>



### Authentication| Method | Endpoint | Description |

```|--------|----------|-------------|

POST   /auth/register          # Register new user| `POST` | `/register` | 👤 User registration |

POST   /auth/login             # Login (sets httpOnly cookie)| `POST` | `/token` | 🔑 User authentication |

POST   /auth/logout            # Logout (clears cookie)

GET    /auth/me                # Get current user info</details>

```

<details>

### Transactions<summary><b>📊 Data Endpoints</b></summary>

```

GET    /transactions/          # List all transactions| Method | Endpoint | Description |

POST   /transactions/          # Create (with AI categorization)|--------|----------|-------------|

PUT    /transactions/{id}      # Update transaction| `GET` | `/summary` | 📈 Financial summary data |

DELETE /transactions/{id}      # Delete transaction| `GET` | `/transactions` | 💳 Get user transactions |

GET    /transactions/analyze   # AI spending analysis| `POST` | `/transactions` | ➕ Add new transaction |

POST   /transactions/voice     # Voice-to-text entry| `GET` | `/categories` | 🏷️ Get expense categories |

```| `GET` | `/loans` | 🏦 Get user loans |

| `POST` | `/loans` | ➕ Add new loan |

### Goals| `GET` | `/goals` | 🎯 Get savings goals |

```| `POST` | `/goals` | ➕ Create new goal |

GET    /goals/                 # List all goals| `GET` | `/charts/expense-by-category` | 📊 Chart data for expenses |

POST   /goals/                 # Create goal

PUT    /goals/{id}             # Update goal</details>

DELETE /goals/{id}             # Delete goal

GET    /goals/{id}/predict     # AI completion prediction---

```

## 🌐 Live Demo

### Budgets

```<div align="center">

GET    /budgets/               # List budgets

POST   /budgets/               # Create budget### 🚀 **Experience Financial Hub Live**

PUT    /budgets/{id}           # Update budget

DELETE /budgets/{id}           # Delete budget<p>

GET    /budgets/alerts         # Get overspending alerts  <a href="#"><img src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Now-4F46E5?style=for-the-badge&logoColor=white" alt="Live Demo"></a>

```  <a href="#"><img src="https://img.shields.io/badge/📱_Mobile_View-Responsive-059669?style=for-the-badge&logoColor=white" alt="Mobile Responsive"></a>

</p>

### Notifications

```*Try it out with the demo account: `demo@example.com` / `password123`*

GET    /notifications/         # List notifications

POST   /notifications/mark-read/{id}</div>

DELETE /notifications/{id}

```---



---## 🤝 Contributing



## 🤖 AI Features<div align="center">



### 1. Transaction Categorization### 💡 **We Welcome Your Ideas!**

Automatically categorizes transactions using ML:

- 🍔 Food & Dining<p>

- 🚗 Transportation  <img src="https://contrib.rocks/image?repo=microsoft/vscode" alt="Contributors" width="400"/>

- 🛍️ Shopping</p>

- 🎬 Entertainment

- 💡 Bills & Utilities</div>

- 🏥 Healthcare

- 📚 EducationContributions make the open source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

- And more...

<details>

### 2. Spending Analysis<summary><b>🔽 How to Contribute</b></summary>

- Pattern detection in spending habits

- Monthly/weekly trend analysis1. **🍴 Fork the Project**

- Category-wise breakdown2. **🌟 Create your Feature Branch** (`git checkout -b feature/AmazingFeature`)

- Anomaly detection for unusual expenses3. **💾 Commit your Changes** (`git commit -m 'Add some AmazingFeature'`)

4. **📤 Push to the Branch** (`git push origin feature/AmazingFeature`)

### 3. Goal Predictions5. **🔄 Open a Pull Request**

- AI-powered savings rate predictions

- Timeline estimation for goal completion</details>

- Personalized recommendations

- Risk assessment### 🐛 **Found a Bug?**

Please [open an issue](https://github.com/intronep666/Financial-Hub/issues) with detailed information.

### 4. Smart Notifications

- Budget overspending alerts### 💡 **Have an Idea?**

- Goal milestone celebrationsWe'd love to hear it! [Start a discussion](https://github.com/intronep666/Financial-Hub/discussions) and let's make it happen.

- Unusual activity warnings

- Bill payment reminders---



---## 📄 License



## 📱 PWA Features<div align="center">



- ✅ **Offline Support** - Works without internetThis project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

- ✅ **Install as App** - Desktop/mobile installation

- ✅ **Background Sync** - Auto-sync when online<p>

- ✅ **Fast Loading** - Service Worker caching  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License">

- 🔜 **Push Notifications** - Coming soon</p>



---</div>



## 🚀 Production Deployment---



### Backend (Heroku Example)## 👨‍💻 Author

```bash

# Install Heroku CLI<div align="center">

heroku create your-app-name

### **Created with ❤️ by intronep666**

# Add PostgreSQL

heroku addons:create heroku-postgresql:hobby-dev<p>

  <a href="https://github.com/intronep666"><img src="https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github" alt="GitHub"></a>

# Set environment variables  <a href="https://linkedin.com/in/yourprofile"><img src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn"></a>

heroku config:set USE_SQLITE=false  <a href="https://twitter.com/yourhandle"><img src="https://img.shields.io/badge/Twitter-Follow-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white" alt="Twitter"></a>

heroku config:set SECRET_KEY=$(openssl rand -hex 32)</p>

heroku config:set COOKIE_SECURE=true

heroku config:set COOKIE_DOMAIN=your-domain.com*"Building tools that make financial management accessible to everyone"*



# Deploy</div>

git push heroku main

---

# Run migrations

heroku run python -c "from config.database import init_db; init_db()"## 🙏 Acknowledgments

```

<div align="center">

### Frontend (Vercel Example)

```bash### **Special Thanks To**

# Install Vercel CLI

npm i -g vercel</div>



# Deploy- 🚀 **React Team** - For the incredible framework

cd frontend- ⚡ **FastAPI** - For making Python web development a joy

vercel --prod- 🎨 **Tailwind CSS** - For beautiful, responsive styling

- 📊 **Chart.js** - For stunning data visualizations

# Set environment variables in Vercel dashboard- 🌟 **Open Source Community** - For inspiration and support

# REACT_APP_API_URL=https://your-backend.herokuapp.com

```---



---<div align="center">



## 🔄 Database Migration (SQLite → PostgreSQL)### 🌟 **Show Your Support**



1. **Update backend/.env**:**If this project helped you, please give it a ⭐ on GitHub!**

```env

USE_SQLITE=false<p>

DATABASE_URL=postgresql://user:password@host:port/dbname  <img src="https://img.shields.io/github/stars/intronep666/Financial-Hub?style=social" alt="GitHub Stars">

```  <img src="https://img.shields.io/github/forks/intronep666/Financial-Hub?style=social" alt="GitHub Forks">

  <img src="https://img.shields.io/github/watchers/intronep666/Financial-Hub?style=social" alt="GitHub Watchers">

2. **Tables auto-create on startup**, or manually:</p>

```bash

python -c "from config.database import init_db; init_db()"### 💰 **Financial Hub** - *Take control of your finances today!*

```

</div>

3. **Migrate data** (optional):
```bash
# Export from SQLite
sqlite3 finance.db .dump > backup.sql

# Import to PostgreSQL (modify as needed)
psql your_database < backup.sql
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.13+

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt

# Check for port conflicts
netstat -ano | findstr :8000
```

### Frontend Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 18+
```

### Authentication Issues
- Open DevTools → Application → Cookies
- Ensure cookie named `access_token` exists
- Verify `COOKIE_SECURE=false` for localhost
- Check `REACT_APP_API_URL` matches backend

### Database Errors
```bash
# Reset database (deletes all data!)
rm backend/finance.db

# Restart backend (auto-creates tables)
```

---

## 🧪 Testing

```bash
# Backend tests (coming soon)
cd backend
pytest

# Frontend tests (coming soon)
cd frontend
npm test
```

---

## 📝 Development Workflow

1. **Create feature branch**: `git checkout -b feature/your-feature`
2. **Make changes** (backend or frontend)
3. **Test locally** with both servers running
4. **Commit**: `git commit -m "feat: your feature description"`
5. **Push**: `git push origin feature/your-feature`
6. **Create Pull Request** on GitHub

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style
- **Python**: Follow PEP 8
- **JavaScript**: Use ESLint + Prettier
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file.

---

## 👨‍💻 Author

**intronep666**
- GitHub: [@intronep666](https://github.com/intronep666)
- Repository: [Financial-Hub](https://github.com/intronep666/Financial-Hub)

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Amazing Python framework
- [React](https://reactjs.org/) - Frontend library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python ORM
- All open-source contributors

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/intronep666/Financial-Hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/intronep666/Financial-Hub/discussions)

---

<div align="center">

**Built with ❤️ using FastAPI, React & AI**

⭐ Star this repo if you find it helpful!

</div>
