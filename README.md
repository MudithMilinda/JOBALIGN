# 🚀 AI Resume Matching Platform

An AI-powered career platform that analyzes resumes, matches candidates with relevant jobs, and provides actionable insights to improve hiring success.

---

## 🌟 Features

* 📄 Smart Resume Analysis
  Extracts skills, experience, and qualifications using AI.

* 🎯 Semantic Job Matching
  Matches users with relevant jobs beyond keyword matching.

* ⚡ Real-Time Insights
  Displays live stats such as users and jobs analyzed.

* 🧠 AI Feedback System
  Provides recommendations to improve resumes.

* 📊 Application Tracking
  Manage and monitor job applications.

* 💳 Stripe Integration
  Secure subscription-based pricing system.

---

## 🛠️ Tech Stack

### Frontend

* Next.js (App Router)
* React
* Tailwind CSS
* Lucide Icons

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Payments

* Stripe

### DevOps

* Docker (optional)

---

## 📁 Project Structure

```
project-root/
│
├── frontend/        # Next.js application
├── backend/         # Node.js API
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (.env)

```
PORT=5000
MONGO_URI=mongodb://mongo:27017/mydb
JWT_SECRET=your_secret
STRIPE_SECRET_KEY=your_stripe_secret
```

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

---

## 🚀 Getting Started

### 1. Clone Repository

```
git clone https://github.com/your-username/your-repo.git](https://github.com/MudithMilinda/JOBALIGN

```

---

### 2. Run Backend

```
cd backend
npm install
npm run dev
```

---

### 3. Run Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Setup (Optional)

Run entire stack using Docker:

```
docker-compose up --build
```

---

## 📡 API Endpoints

### Auth

* `POST /api/auth/signup`
* `POST /api/auth/signin`
* `POST /api/auth/update-plan`

### Stats

* `GET /api/stats/user-count`
* `GET /api/stats/jobs-analyzed`

---

## 💳 Pricing Plans

| Plan     | Price | Features                        |
| -------- | ----- | ------------------------------- |
| Basic    | Free  | Resume analysis, basic matching |
| Standard | $1.50 | Advanced matching, tracking     |
| Premium  | $2.50 | Full AI optimization            |

---

## 🧠 How It Works

1. Upload your resume
2. AI analyzes your data
3. Get matched with jobs
4. Track and apply

---

## 📸 Screenshots

*Add screenshots here (landing page, pricing page, dashboard, etc.)*

---

## 🔐 Authentication

* JWT-based authentication
* Stored in localStorage (frontend)

---

## ⚠️ Notes

* Ensure MongoDB is running before backend
* Use Docker service name (`mongo`) instead of IP
* Stripe is in test mode by default

---

## 📈 Future Improvements

* ✅ Stripe webhook integration
* 🔄 Real-time job scraping
* 📊 Advanced analytics dashboard
* 🌐 Deployment (AWS / Vercel)

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📄 License

MIT License

---

## 👨‍💻 Author

Developed by **Your Name**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
