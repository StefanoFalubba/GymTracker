# 🚀 Quick Setup Guide

## 5-Minute Setup

### 1. Create Supabase Project (2 minutes)

1. Go to **https://supabase.com** and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: GymTracker
   - **Database Password**: (create a strong password - save it!)
   - **Region**: Choose closest to you
4. Click **"Create new project"**
5. Wait ~2 minutes for setup to complete

### 2. Set Up Database (1 minute)

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Open the file `database-schema.sql` from this project
4. Copy ALL the content
5. Paste into the SQL editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see: **"Success. No rows returned"** ✅

### 3. Get API Keys (30 seconds)

1. In Supabase, go to **Settings** → **API** (gear icon in sidebar)
2. Find these two values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Long string starting with `eyJ...`
3. Keep this tab open!

### 4. Configure App (1 minute)

1. Open `js/config.js` in your code editor
2. Replace the placeholder values:

```javascript
export const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',  // ← Paste your Project URL
    anonKey: 'eyJhbGc...'  // ← Paste your anon key
};
```

3. Save the file

### 5. Run the App (30 seconds)

**Option A: Simple (Double-click)**
- Just open `index.html` in your browser

**Option B: Local Server (Recommended)**
```bash
# If you have Python installed:
python -m http.server 8000

# If you have Node.js installed:
npx serve

# Then open: http://localhost:8000
```

### 6. Create Your Account

1. Click **"Create one"** on the login page
2. Enter:
   - **Name**: Your name
   - **Email**: Your email
   - **Password**: At least 6 characters
3. Click **"Create Account"**
4. You're in! 🎉

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Can create an account
- [ ] Can login
- [ ] Dashboard loads without errors
- [ ] Can create a training card
- [ ] Can add exercises to training card
- [ ] Can start a workout
- [ ] Can complete sets
- [ ] Can finish workout
- [ ] Workout appears in history
- [ ] Can view statistics
- [ ] Can change theme colors
- [ ] Theme persists after refresh

---

## 🐛 Common Issues

### "Failed to fetch" or "Network error"
**Solution**: Check `js/config.js` - make sure URL and key are correct (no extra spaces or quotes)

### "Row Level Security policy violation"
**Solution**: Run the database schema again - the RLS policies might not have been created

### "Invalid API key"
**Solution**: Make sure you copied the **anon/public** key, not the service_role key

### Page is blank
**Solution**: Open browser console (F12) and check for errors. Most likely a JavaScript error or missing config.

---

## 🚀 Deploy to Vercel (Optional)

### Quick Deploy

1. Push your code to GitHub
2. Go to **https://vercel.com**
3. Click **"New Project"**
4. Import your GitHub repository
5. Click **"Deploy"**
6. Done! Your app is live 🎉

**Note**: Make sure `js/config.js` has your Supabase credentials before deploying!

---

## 📱 First Steps After Setup

1. **Complete Your Profile**
   - Go to Settings
   - Add your name, age, weight, height
   - Set your fitness goals

2. **Add Custom Exercises** (if needed)
   - The app comes with 20 default exercises
   - You can add more in Training Cards → New Card → Add Exercise

3. **Create Your First Training Card**
   - Go to Training Cards
   - Click "New Training Card"
   - Name it (e.g., "Push Day", "Full Body")
   - Add exercises with sets/reps/weight
   - Assign to days of the week

4. **Start Your First Workout**
   - Go to Dashboard
   - Click "Start: [Your Card Name]"
   - Log your sets as you complete them
   - Click "Finish" when done

5. **Check Your Progress**
   - After a few workouts, go to Statistics
   - Select an exercise
   - View your progress charts!

---

## 💡 Pro Tips

- **Use Training Cards**: Pre-planning saves time during workouts
- **Log Immediately**: Record sets right after completing them
- **Track Progressive Overload**: Try to increase weight or reps each week
- **Customize Your Theme**: Make it feel like YOUR app
- **Export Data Regularly**: Settings → Export Data (just in case!)

---

## 🆘 Need Help?

1. Check the main **README.md** for detailed documentation
2. Check browser console (F12) for error messages
3. Verify Supabase project is active (check dashboard)
4. Make sure you ran the database schema SQL

---

**You're all set! Happy tracking! 💪🏋️**
