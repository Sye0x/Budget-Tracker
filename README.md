# Modern Budget Tracker (Firestore)

A modern and clean web application that helps users track their monthly budget, expenses, and category-wise spending. The app supports Firebase authentication and stores each user's data securely in Firestore with real-time syncing.

---

## ⭐ Features

- Add, edit, and delete expenses
- Set and update monthly budget
- Realtime Firestore syncing
- Login, Signup
- Category spending chart using Chart.js
- Responsive and modern UI
- Remaining budget automatically calculated
- Data stored under each user securely
- Smooth modals for actions + authentication

---

## 🛠️ Technologies Used

- **HTML, CSS, JavaScript (ES Modules)**
- **Firebase Authentication**
  - Email/Password
  - Anonymous Login
- **Firebase Firestore**
- **Chart.js**
- Modern UI styling

---

## 📚 What I Learned

- How to set up Firebase Auth and handle login/logout states
- Storing user-specific data using Firestore sub-collections
- Using `onSnapshot` for real-time UI updates
- Creating reusable modules (`firebase.js`, `script.js`)
- Updating charts dynamically when data changes
- Handling and sanitizing user input
- Designing responsive layouts and modals

---

## 💪 Challenges & How I Overcame Them

### 1. Authentication Flow

Managing the login state was confusing at first.  
**Solution:** Used `onAuthStateChanged` to update the UI and attach Firestore listeners properly.

### 2. Real-time Firestore Sync

Data did not refresh immediately.  
**Solution:** Replaced manual fetching with Firestore `onSnapshot` for live updates.

### 3. Project Structure

All code in one file became messy.  
**Solution:** Split the Firebase config into `firebase.js` and main logic into `script.js`.

### 4. Chart Overlapping Issue

The chart duplicated every time it updated.  
**Solution:** Called `chart.destroy()` before drawing a new chart.

---

## 🚀 Final Thoughts

This project helped me understand how to combine Firebase, real-time features, and UI design into one complete application. It improved my skills in authentication, database structure, modular JavaScript, and building interactive web apps.
