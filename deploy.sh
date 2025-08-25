#!/bin/bash

# 🚀 PingBoard Deployment Script
# Simple deployment to various platforms

echo "🚀 PingBoard Deployment Script"
echo "================================"

# Check if files exist
if [ ! -f "index.html" ] || [ ! -f "app.js" ]; then
    echo "❌ Error: index.html or app.js not found!"
    echo "Make sure you're in the correct directory."
    exit 1
fi

echo "✅ Files found:"
echo "   - index.html"
echo "   - app.js"
echo ""

echo "🌐 Choose deployment option:"
echo "1) Netlify (Drag & Drop)"
echo "2) GitHub Pages"
echo "3) Vercel"
echo "4) Local Test"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Netlify Deployment:"
        echo "1. Go to https://netlify.com"
        echo "2. Drag and drop index.html and app.js"
        echo "3. Your app will be live in seconds!"
        echo ""
        echo "📁 Files ready for upload:"
        ls -la index.html app.js
        ;;
    2)
        echo ""
        echo "📚 GitHub Pages Deployment:"
        echo "1. Push your code to GitHub"
        echo "2. Go to repository Settings > Pages"
        echo "3. Select source branch (usually main)"
        echo "4. Your app will be live at username.github.io/repo-name"
        ;;
    3)
        echo ""
        echo "⚡ Vercel Deployment:"
        echo "1. Go to https://vercel.com"
        echo "2. Connect your GitHub repository"
        echo "3. Vercel will auto-deploy on every push"
        echo "4. Custom domain support included"
        ;;
    4)
        echo ""
        echo "🏠 Local Test Server:"
        echo "Starting local server on http://localhost:3000"
        echo "Press Ctrl+C to stop"
        echo ""
        python3 -m http.server 3000
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment instructions completed!"
echo "Your PingBoard app is ready to go live!"
