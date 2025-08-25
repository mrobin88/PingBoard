# 🗄️ Fix Your PingBoard Database Error

## 🚨 **Current Problem:**
```
{"code":"unexpected_failure","message":"Database error saving new user"}
```

This means your Supabase database doesn't have the required tables and structure!

## ✅ **Quick Fix (5 minutes):**

### **Step 1: Go to Supabase Dashboard**
1. **Visit** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Login** to your account
3. **Select** your PingBoard project

### **Step 2: Open SQL Editor**
1. **Click** "SQL Editor" in the left sidebar
2. **Click** "New query"

### **Step 3: Run the Database Schema**
1. **Copy** the entire content of `supabase-schema.sql`
2. **Paste** it into the SQL Editor
3. **Click** "Run" (▶️ button)

### **Step 4: Verify Setup**
1. **Check** "Table Editor" in left sidebar
2. **You should see** these tables:
   - `profiles`
   - `pings` 
   - `votes`

## 🔍 **What the Schema Creates:**

- ✅ **User profiles** table (extends Supabase auth)
- ✅ **Pings** table (your main content)
- ✅ **Votes** table (upvotes/downvotes)
- ✅ **Automatic triggers** for user creation
- ✅ **Row Level Security** policies
- ✅ **Proper indexes** for performance

## 🎯 **After Running Schema:**

1. **Refresh** your PingBoard app
2. **Try signing up** again
3. **The error should be gone!** ✨

## 🚨 **If You Still Get Errors:**

### **Check RLS Policies:**
1. Go to **Authentication** → **Policies**
2. Make sure **Row Level Security** is enabled
3. Verify policies exist for all tables

### **Check User Permissions:**
1. Go to **Settings** → **API**
2. Verify your **anon key** is correct
3. Make sure **service role key** exists

### **Test Database Connection:**
1. Go to **SQL Editor**
2. Run: `SELECT * FROM profiles LIMIT 1;`
3. Should return empty result (no error)

## 🎉 **Success Indicators:**

- ✅ **No more database errors**
- ✅ **Users can sign up successfully**
- ✅ **Users can create pings**
- ✅ **Voting system works**
- ✅ **Hashtags are extracted**

---

**Need help? Check the main README.md or create a GitHub issue!**
