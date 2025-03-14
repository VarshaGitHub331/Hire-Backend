# Hire-Backend
# 🏗️ AI-Powered Freelance Marketplace - Backend

This repository contains the **Node.js backend** for an AI-powered freelance marketplace. It provides authentication, gig/job management, AI-powered recommendations, and real-time notifications.

## 🚀 Features

### 🔹 Freelancer Features
- **AI-Driven Profile Creation**  
  - Extracts skills & categories from resumes using **Gemini AI**.
  - Uses **MiniLM-v6** for **similar skill recommendations**.

- **Gig Management**  
  - AI suggests **categories, skills, and descriptions**.
  - Freelancers can manage and edit gigs easily.

- **AI-Based Proposal Generation**  
  - Automated proposal suggestions based on job descriptions.

### 🔹 Client Features
- **AI-Enhanced Job Posting**  
  - Extracts **skills & budget** from job descriptions.
  - Uses **MiniLM-v6** for **smart job tagging**.

- **Smart Gig Recommendations**  
  - Matches client project descriptions with **AI-recommended gigs**.

- **Bid & Proposal Management**  
  - Clients receive **real-time notifications** for new bids.

### 🔹 Core Functionalities
- **Real-time Notifications** – Implemented using **Redis Pub/Sub**.
- **Live Chat** – Built using **Socket.IO**.
- **Caching & Optimization** – Frequently accessed gigs, jobs, and categories are **cached in Redis**.

## ⚙️ Tech Stack
- **Node.js & Express.js** – Backend framework
- **Sequelize (MySQL)** – Database ORM
- **Redis** – Caching & notifications
- **Socket.IO** – WebSockets for real-time chat
- **Gemini AI API** – AI-powered text processing
- **MiniLM-v6** – Skill similarity matching

## 🔧 Setup & Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/VarshaGitHub331/Hire-Backend
   cd hire-backend
   npm install
   npm start


