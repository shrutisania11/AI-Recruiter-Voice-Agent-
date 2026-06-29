# 🎙️ AI Recruiter Voice Agent

An AI-powered voice interview platform that simulates real technical interviews using conversational AI. Users can create personalized mock interviews based on their role, experience level, and technology stack, interact with an AI interviewer through voice, and receive detailed AI-generated feedback after each interview.

---

## 🚀 Live Demo

🔗 **Deployment:**  
https://ai-recruiter-voice-agent-eu188ll2w-shruti-sanias-projects.vercel.app

---

## 📌 Features

- 🔐 Secure User Authentication
- 🎤 AI-Powered Voice Interview
- 🤖 Dynamic Interview Question Generation
- 🗣️ Real-Time Voice Conversation
- 📄 AI-Generated Performance Feedback
- 📊 Interview History Dashboard
- ⚡ Fast & Responsive UI
- 📱 Mobile Responsive Design
- 🌙 Modern User Interface

---

# 📖 Project Overview

AI Recruiter Voice Agent is an intelligent interview simulation platform that leverages Large Language Models (LLMs) and Voice AI to conduct interactive mock interviews.

Instead of answering questions by typing, users communicate naturally using their voice. The AI interviewer asks role-specific technical questions, listens to the user's responses, and provides detailed feedback at the end of the interview.

The platform aims to help students and professionals prepare for real-world technical interviews in an engaging and realistic manner.

---

# 🛠 Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

---

## Backend & Services

- Firebase Authentication
- Firebase Firestore
- Gemini API
- Vapi AI
- Zod

---

## Deployment

- Vercel

---

# 🏗 Architecture

```
                 User

                   │

                   ▼

        Next.js Frontend (React)

                   │

                   ▼

      Firebase Authentication

                   │

                   ▼

      Firestore Database

                   │

                   ▼

      Interview Creation Form

                   │

                   ▼

      Gemini AI Question Generation

                   │

                   ▼

         Interview Saved

                   │

                   ▼

        Vapi Voice Assistant

                   │

      Speech-to-Text (STT)

                   │

                   ▼

      Large Language Model

                   │

      Text-to-Speech (TTS)

                   │

                   ▼

        Voice Conversation

                   │

                   ▼

      Interview Transcript

                   │

                   ▼

 Gemini AI Feedback Generation

                   │

                   ▼

        Firestore Database

                   │

                   ▼

        Results Dashboard
```

---

# 📂 Folder Structure

```
app/
│
├── dashboard/
├── interview/
├── sign-in/
├── sign-up/
├── api/
│
components/
│
├── InterviewCard
├── Navbar
├── Feedback
├── Loader
├── InterviewForm
│
lib/
│
firebase/
│
constants/
│
hooks/
│
types/
│
public/
```

---

# ⚙️ How It Works

### Step 1

User signs in securely using Firebase Authentication.

### Step 2

The user creates a new interview by selecting:

- Job Role
- Experience Level
- Technology Stack

### Step 3

Gemini AI generates customized interview questions.

### Step 4

The generated interview is stored in Firebase Firestore.

### Step 5

The user starts the interview.

### Step 6

Vapi AI initiates a real-time voice conversation.

### Step 7

Speech is converted into text.

### Step 8

The LLM processes the response.

### Step 9

The AI interviewer asks the next question.

### Step 10

At the end of the interview, Gemini AI evaluates the user's performance.

### Step 11

Feedback is stored in Firestore.

### Step 12

The dashboard displays interview history and feedback.

---

# 🔥 Core Functionalities

- Authentication
- Interview Creation
- AI Question Generation
- Voice Interaction
- AI Feedback
- Dashboard
- Interview History

---

# 🤖 AI Workflow

```
User

↓

Voice Input

↓

Speech-to-Text

↓

LLM Processing

↓

Context Understanding

↓

AI Response Generation

↓

Text-to-Speech

↓

Voice Output

↓

Interview Continues
```

---

# 📊 Database Design

## Users

```
User ID
Name
Email
Created At
```

---

## Interviews

```
Interview ID
User ID
Role
Experience
Tech Stack
Questions
Created At
```

---

## Feedback

```
Feedback ID
Interview ID
Overall Score
Strengths
Weaknesses
Suggestions
Transcript
```

---

# 🔒 Security

- Firebase Authentication
- Protected Routes
- Environment Variables
- API Key Protection
- Firestore Security Rules
- Input Validation using Zod

---

# 🚀 Installation

Clone the repository

```bash
git clone https://github.com/your-username/ai-recruiter-voice-agent.git
```

Move into the project

```bash
cd ai-recruiter-voice-agent
```

Install dependencies

```bash
npm install
```

Create a `.env.local`

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

GOOGLE_GENERATIVE_AI_API_KEY=

VAPI_API_KEY=
VAPI_ASSISTANT_ID=
```

Run locally

```bash
npm run dev
```

---

# 🌍 Deployment

The application is deployed on **Vercel**.

Deployment includes:

- Automatic Builds
- CI/CD
- Environment Variables
- Optimized Production Build

---

# 💡 Future Enhancements

- Resume Analysis
- ATS Score Generator
- Coding Interview Round
- Video Interview Support
- Emotion Detection
- Recruiter Dashboard
- Multi-language Support
- Calendar Integration
- Interview Analytics

---

# 📚 Learning Outcomes

Through this project, I gained hands-on experience with:

- Next.js App Router
- TypeScript
- Firebase Authentication
- Firestore Database
- Voice AI Integration
- Large Language Models
- Prompt Engineering
- API Integration
- Responsive UI Development
- Production Deployment

---

# 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👩‍💻 Author

**Shruti Sania**

B.Tech Computer Science Engineering

AI | Machine Learning | Full Stack Development | Voice AI

---

## ⭐ If you found this project useful, consider giving it a star!

