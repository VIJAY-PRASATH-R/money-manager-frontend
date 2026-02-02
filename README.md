# Money Manager – Frontend

Money Manager is a web application designed to help users manage their personal and business finances in a simple and intuitive way. This frontend application provides a clean dashboard, easy transaction entry, and clear financial insights.

The focus of this project is usability, clarity, and real-world finance tracking.

---

## Features

- Dashboard view with:
  - Monthly income and expenditure
  - Weekly income and expenditure
  - Yearly income and expenditure
- Add income and expenses using a popup modal
  - Separate tabs for Income and Expense
- Track transactions with:
  - Date and time
  - One-line description
  - Category (Food, Fuel, Movie, Loan, Medical, etc.)
- Division-based tracking:
  - Personal
  - Office
- Filter transactions by:
  - Category
  - Division (Personal / Office)
  - Date range (between two selected dates)
- Edit income or expense entries within 12 hours
  - Editing is restricted after 12 hours
- Transaction history view
- Category-wise summary of expenses
- Account transfer tracking between accounts
- Responsive and user-friendly UI

---

## Tech Stack

- React.js
- Tailwind CSS
- JavaScript
- REST API integration

---

## Project Structure

src/
components/     Reusable UI components  
pages/          Application pages  
services/       API service files  
utils/          Helper functions  
App.js  
main.jsx  

---

## Installation and Setup

1. Clone the repository  
   git clone https://github.com/VIJAY-PRASATH-R/money-manager-frontend.git

2. Navigate to the project directory  
   cd money-manager-frontend

3. Install dependencies  
   npm install

4. Start the development server  
   npm run dev

---

## Deployment

- The frontend application is deployed and connected to the backend using REST APIs.
- All income and expense updates are reflected across the dashboard views.

---

## Notes

- Designed with a focus on simplicity and ease of use
- Responsive layout suitable for different screen sizes
- Built as part of a time-bound assessment task

---

## Author

Vijay Prasath R  
Frontend Developer
