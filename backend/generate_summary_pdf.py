
import os
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Preformatted
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.colors import navy, black, blue, darkgreen

def generate_project_summary_pdf():
    """
    Generates a PDF document summarizing the Kryptos Finance project.
    """
    # Define file path
    file_path = os.path.join(os.path.dirname(__file__), "..", "Kryptos_Finance_Project_Summary.pdf")
    doc = SimpleDocTemplate(file_path)

    # Styles
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name='H1', fontSize=20, leading=24, spaceAfter=12, textColor=navy, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='H2', fontSize=16, leading=20, spaceBefore=10, spaceAfter=8, textColor=navy, fontName='Helvetica-Bold'))
    styles.add(ParagraphStyle(name='H3', fontSize=12, leading=16, spaceBefore=8, spaceAfter=6, textColor=darkgreen, fontName='Helvetica-Bold'))
    
    # Use a different name for the custom code style to avoid conflicts
    styles.add(ParagraphStyle(name='CustomCode', fontName='Courier', fontSize=9, leading=12, textColor=black, backColor='#f0f0f0', borderPadding=4, borderRadius=2))

    story = []

    summary_content = """
# 🏦 KRYPTOS FINANCE - COMPLETE PROJECT SUMMARY

## 📋 PROJECT OVERVIEW

**Project Name:** Kryptos Finance (Financial Hub)  
**Type:** Full-Stack FinTech Web Application  
**Purpose:** Personal finance management with AI-powered insights, transaction tracking, loan management, goal setting, budgeting, and real-time financial health monitoring  
**Status:** Production-Ready ✅  
**Architecture:** Monolithic with RESTful API  

---

## 🎯 CORE FUNCTIONALITY

### 1. **User Authentication & Authorization**
- Secure user registration with email validation (min 8 characters)
- Login with JWT token-based authentication
- Password hashing using **Argon2** (upgraded from bcrypt to remove 72-byte limit)
- HTTP-only cookie storage for security
- Session persistence with token refresh
- Logout with cookie clearing
- Current user session verification (`/auth/me`)

### 2. **Transaction Management**
- **Income tracking** (salary, investments, freelance, etc.)
- **Expense tracking** (food, transport, entertainment, utilities, etc.)
- AI-powered automatic categorization
- Transaction filtering by date, type, category
- Real-time balance calculation
- Transaction CRUD operations (Create, Read, Update, Delete)
- Monthly/yearly transaction aggregation

### 3. **Loan Management (Borrow/Lend)**
- **Borrow tracking** - Track money you owe to others
- **Lend tracking** - Track money others owe you
- Amortization support with interest calculations
- Fields: amount, remaining balance, interest rate, term, payment schedule
- Loan payment tracking (amount paid updates remaining balance)
- Scheduled monthly payment calculation (PMT formula)
- Total interest calculation
- Remaining balance with amortization
- Loan CRUD operations

### 4. **Financial Goals & Savings**
- Goal creation with target amount and deadline
- Progress tracking (current saved vs target)
- AI-powered completion date prediction
- Success probability calculation
- Monthly contribution recommendations (using financial formulas)
- Goal contribution tracking
- Visual progress bars
- Goal CRUD operations

### 5. **Budget Management**
- Monthly budget creation by category
- Budget vs actual spending tracking
- Over-budget alerts
- Budget period filtering (month/year)
- Category-wise spending limits
- Budget CRUD operations

### 6. **Financial Dashboard**
- **Real-time financial overview:**
  - Total income
  - Total expenses
  - Current balance
  - Total debt (borrowed loans)
  - Total lent outstanding
  - Net income
  - Savings rate (%)
  - Debt-to-Income (DTI) ratio
  - Financial health score (0-100)
- **Visual charts:**
  - Income vs Expense bar chart
  - Category breakdown pie chart
  - Monthly trend line chart
- **Health metrics:**
  - Income stability
  - Spending control
  - Savings rate
  - Debt management (DTI-based)
- **Quick actions:**
  - Add transaction
  - Create goal
  - View all transactions
  - Manage loans

### 7. **AI-Powered Features**
- **Transaction categorization** - Auto-assigns categories based on description
- **Anomaly detection** - Flags unusual spending patterns
- **Goal success probability** - Predicts likelihood of achieving savings goals
- **Recommended monthly saving** - Calculates optimal contribution using financial formulas
- **Spending insights** - AI-generated recommendations
- **Future forecasting** - Predicts goal completion dates

### 8. **Notifications System**
- Real-time financial alerts
- Budget overspending warnings
- Goal milestone notifications
- Loan payment reminders
- Notification read/unread status
- Mark all as read functionality

### 9. **Category Management**
- Predefined expense categories (Food, Transport, Entertainment, Utilities, Healthcare, Education, Shopping, Bills, Other)
- Predefined income categories (Salary, Freelance, Investment, Gift, Other)
- User-specific category filtering
- Category-based analytics

---

## 🛠️ TECHNOLOGY STACK

### **Backend (Python)**
```
Framework: FastAPI 0.104.1
Database ORM: SQLAlchemy 2.0.23
Database: SQLite (dev) / PostgreSQL (prod support)
Authentication: JWT (python-jose[cryptography])
Password Hashing: Argon2 (argon2-cffi)
HTTP Client: httpx
CORS: fastapi.middleware.cors
Streaming: aiokafka (real-time data)
Financial Calculations: Decimal (high-precision)
Environment: python-dotenv
Validation: Pydantic v1/v2 compatible
Server: Uvicon (ASGI)
```

### **Frontend (JavaScript/React)**
```
Framework: React 18.2.0
UI Library: Tailwind CSS 3.4.1
Charts: Chart.js 4.4.1 + react-chartjs-2
HTTP Client: Axios 1.6.5
Routing: React Router DOM 6.21.3
Icons: React Icons 5.0.1
Build Tool: Webpack (via Create React App)
Package Manager: npm
```

---

## 📂 COMPLETE FILE STRUCTURE

```
financial-hub/
├── backend/
│   ├── config/
│   │   ├── __init__.py
│   │   ├── database.py          # SQLAlchemy engine, SessionLocal, Base
│   │   └── settings.py          # Environment config (DB_URL, JWT, CORS)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database_models.py   # SQLAlchemy ORM models (User, Transaction, Loan, Goal, Budget, Notification, Category)
│   │   └── schemas.py           # Pydantic schemas (request/response validation)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py      # Authentication, JWT, password hashing (Argon2)
│   │   ├── transaction_service.py # Transaction CRUD + AI categorization
│   │   ├── loan_service.py      # Loan CRUD + amortization
│   │   ├── goal_service.py      # Goal CRUD + AI predictions
│   │   ├── category_service.py  # Category fetching
│   │   ├── notification_service.py # Notification CRUD + event publishing
│   │   ├── summary_service.py   # Financial summary aggregation
│   │   ├── ai_service.py        # AI categorization, anomaly detection, predictions
│   │   ├── streaming_service.py # Kafka real-time data streaming
│   │   └── financial_formulas.py # Time-value-of-money calculations (PV, FV, PMT, DTI, etc.)
│   ├── main.py                  # FastAPI app, CORS, routers, startup events, DB migrations
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # Environment variables (DB_URL, SECRET_KEY, etc.)
│   ├── .env.example             # Environment template
│   └── finance.db               # SQLite database file
├── frontend/
│   ├── public/
│   │   ├── index.html           # HTML template
│   │   ├── manifest.json        # PWA manifest (Kryptos branding)
│   │   ├── favicon.ico          # App icon
│   │   ├── logo192.png
│   │   └── logo512.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js         # Login form + authentication flow
│   │   │   ├── Register.js      # Registration form + email validation
│   │   │   ├── Dashboard.js     # Main dashboard with charts + metrics
│   │   │   ├── Navbar.js        # Navigation bar with user menu
│   │   │   ├── Transactions.js  # Transaction list + filters + add form
│   │   │   ├── Loans.js         # Loan management (borrow/lend)
│   │   │   ├── Goals.js         # Goal tracking + AI predictions
│   │   │   └── Budgets.js       # Budget creation + tracking
│   │   ├── context/
│   │   │   └── AuthContext.js   # Global auth state, API config, login/logout
│   │   ├── App.js               # React Router setup, protected routes
│   │   ├── index.js             # React DOM render, AuthProvider wrapper
│   │   ├── index.css            # Tailwind directives + global styles
│   │   └── reportWebVitals.js   # Performance monitoring
│   ├── package.json             # npm dependencies + scripts
│   ├── tailwind.config.js       # Tailwind theme (colors, spacing, fonts)
│   ├── postcss.config.js        # PostCSS for Tailwind
│   └── .gitignore               # Ignore node_modules, build, .env
├── START-ALL.bat                # Launch backend + frontend (Windows)
├── start-backend.bat            # Start backend only
├── start-frontend.bat           # Start frontend only
├── stop-all.bat                 # Stop all services
├── README.md                    # Project documentation
└── .gitignore                   # Git ignore rules
```
    """

    lines = summary_content.strip().split('\\n')
    in_code_block = False
    code_block_content = ""

    for line in lines:
        stripped_line = line.strip()
        
        if stripped_line.startswith("```"):
            if in_code_block:
                # End of code block
                story.append(Preformatted(code_block_content, styles['CustomCode']))
                code_block_content = ""
                in_code_block = False
            else:
                # Start of code block
                in_code_block = True
            continue

        if in_code_block:
            code_block_content += line + '\\n'
            continue

        if stripped_line.startswith('###'):
            story.append(Paragraph(stripped_line.replace('###', '').strip(), styles['H3']))
        elif stripped_line.startswith('##'):
            story.append(Paragraph(stripped_line.replace('##', '').strip(), styles['H2']))
        elif stripped_line.startswith('#'):
            story.append(Paragraph(stripped_line.replace('#', '').strip(), styles['H1']))
        elif stripped_line == '---':
            story.append(Spacer(1, 12))
        else:
            # Replace markdown bold with HTML bold for Paragraph
            formatted_line = line.replace('**', '<b>').replace('**', '</b>')
            story.append(Paragraph(formatted_line, styles['Body']))

    doc.build(story)
    print(f"PDF generated successfully at: {file_path}")

if __name__ == "__main__":
    generate_project_summary_pdf()
