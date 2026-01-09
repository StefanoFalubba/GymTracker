# 🏋️ GymTracker - Your Personal Fitness Companion

A comprehensive, modern web application for tracking gym workouts, managing training programs, viewing workout history, and analyzing progress with beautiful charts and customizable themes.

## ✨ Features

### 📊 Dashboard
- **Quick Stats**: Total workouts, current streak, weekly and monthly summaries
- **Last Workout Summary**: Detailed overview of your most recent session
- **Quick Actions**: Start workouts directly from your training cards
- **Recent History**: View your latest workout sessions at a glance

### 📋 Training Cards
- **Create Custom Programs**: Build personalized workout routines
- **Exercise Library**: 20+ default exercises + create your own
- **Day Assignment**: Schedule cards for specific days of the week
- **Detailed Configuration**: Set target sets, reps, and weights for each exercise
- **Easy Management**: Edit, duplicate, or delete training cards

### 💪 Active Workout
- **Real-time Tracking**: Log sets, reps, and weights as you train
- **Workout Timer**: Track your session duration
- **Progress Indicators**: See how many sets you've completed
- **Flexible Input**: Adjust weights and reps on the fly
- **Quick Completion**: Mark sets as complete with one tap

### 📅 History
- **Complete Workout Log**: View all your past training sessions
- **Date Filtering**: Find workouts by date range
- **Detailed Breakdown**: See every exercise, set, rep, and weight
- **Volume Tracking**: Total volume (weight × reps) for each workout
- **Easy Management**: Delete workouts if needed

### 📈 Statistics & Analytics
- **Exercise-Specific Analysis**: Track progress for individual exercises
- **Progress Charts**: Beautiful line charts showing weight progression over time
- **Volume Charts**: Bar charts displaying training volume trends
- **Personal Records**: Track your max weight and estimated 1RM
- **Total Volume**: See cumulative training volume

### ⚙️ Settings
- **Profile Management**: Update personal information and fitness goals
- **Theme Customization**: 
  - Light/Dark mode toggle
  - Custom primary and accent colors
  - Real-time preview
- **Units**: Choose between kg and lbs
- **Data Export**: Download all your data as JSON
- **Multi-device Sync**: Access your data from anywhere

## 🚀 Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6 Modules)
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Charts**: Chart.js
- **Icons**: Lucide Icons
- **Hosting**: Vercel (recommended)

## 📦 Setup Instructions

### Prerequisites
- A Supabase account (free tier is perfect)
- A modern web browser
- (Optional) Vercel account for deployment

### Step 1: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "Start your project"
   - Create a new organization and project
   - Choose a region close to you
   - Wait for the project to be created (~2 minutes)

2. **Run the Database Schema**
   - In your Supabase dashboard, go to the **SQL Editor**
   - Click "New Query"
   - Copy the entire contents of `database-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute
   - You should see "Success. No rows returned" - this is correct!

3. **Get Your API Credentials**
   - Go to **Settings** → **API**
   - Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy your **anon/public** key (long string starting with `eyJ...`)

### Step 2: Configure the App

1. **Update Configuration**
   - Open `js/config.js`
   - Replace `YOUR_SUPABASE_URL` with your Project URL
   - Replace `YOUR_SUPABASE_ANON_KEY` with your anon key

```javascript
export const SUPABASE_CONFIG = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key-here'
};
```

### Step 3: Run Locally

1. **Open the App**
   - Simply open `index.html` in your browser
   - OR use a local server (recommended):
   
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Create an Account**
   - Click "Create one" on the login page
   - Enter your name, email, and password
   - Click "Create Account"
   - You're in! 🎉

### Step 4: Deploy to Vercel (Optional)

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```
   
   OR:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

3. **Configure**
   - No build settings needed (static site)
   - Your app will be live at `https://your-app.vercel.app`

## 🎨 Customization

### Theme Colors

The app uses HSL color system for easy customization:

- **Primary Color**: Default hue is 260 (purple)
- **Accent Color**: Default hue is 340 (pink)

You can change these in the Settings page or directly in CSS:

```css
:root {
    --primary-hue: 260;  /* 0-360 */
    --accent-hue: 340;   /* 0-360 */
}
```

### Adding Custom Exercises

1. Go to Training Cards page
2. Click "New Training Card"
3. Click "Add Exercise"
4. If your exercise isn't in the list, you can add it to the database:
   - Go to Supabase Dashboard → Table Editor → exercises
   - Click "Insert row"
   - Fill in: name, category, muscle_group, equipment
   - Set `is_default` to `true` to make it available to all users

## 📱 Features in Detail

### Dashboard
- **Streak Calculation**: Counts consecutive days with workouts
- **Quick Start**: One-click workout initiation from training cards
- **Recent Activity**: Last 5 workouts displayed

### Training Cards
- **Drag & Drop**: Reorder exercises (coming soon)
- **Templates**: Duplicate existing cards for variations
- **Day Assignment**: Assign to multiple days (e.g., "Monday, Wednesday, Friday")

### Workout Session
- **Auto-fill**: Pre-fills target reps and weights from training card
- **Flexible**: Adjust any value during the workout
- **Timer**: Automatic duration tracking
- **Save Progress**: All data syncs to Supabase in real-time

### Statistics
- **1RM Estimation**: Uses Epley formula: Weight × (1 + Reps/30)
- **Volume Calculation**: Sets × Reps × Weight
- **Chart.js Integration**: Interactive, responsive charts
- **Historical Data**: All-time progress tracking

## 🔒 Security

- **Row Level Security (RLS)**: Users can only access their own data
- **Authentication**: Supabase Auth with JWT tokens
- **Password Hashing**: Automatic via Supabase
- **HTTPS**: Enforced in production

## 🐛 Troubleshooting

### "Error loading data"
- Check your Supabase credentials in `js/config.js`
- Verify the database schema was run successfully
- Check browser console for specific errors

### "Authentication failed"
- Clear browser cache and cookies
- Try incognito/private mode
- Check Supabase Auth settings (should allow email/password)

### Charts not displaying
- Ensure Chart.js CDN is loading (check browser console)
- Verify you have workout data with the selected exercise

### Theme not saving
- Check browser localStorage is enabled
- Verify user_settings table exists in Supabase

## 📊 Database Structure

```
users (Supabase Auth)
├── user_profiles (name, age, weight, height, goals)
├── user_settings (theme, units, preferences)
├── exercises (default + custom)
├── training_cards
│   └── training_card_exercises
├── workouts
    ├── workout_exercises
    └── workout_sets
```

## 🚀 Future Enhancements

- [ ] Rest timer with notifications
- [ ] Exercise video tutorials
- [ ] Social features (share workouts)
- [ ] Progressive overload suggestions
- [ ] Body measurements tracking
- [ ] Nutrition logging
- [ ] Mobile app (React Native)
- [ ] Workout templates marketplace

## 📄 License

MIT License - feel free to use this for personal or commercial projects!

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 💡 Tips for Best Results

1. **Be Consistent**: Log every workout for accurate statistics
2. **Use Training Cards**: Pre-plan your workouts for faster logging
3. **Track Progressive Overload**: Gradually increase weight or reps
4. **Review Statistics**: Check your progress weekly
5. **Customize Your Theme**: Make it yours!

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
3. Check browser console for error messages

---

**Built with 💪 for fitness enthusiasts**

Enjoy tracking your gains! 🏋️‍♂️
