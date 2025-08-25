// ============================================================================
// PINGBOARD - MODERN SOCIAL NETWORK (Bootcamp Graduate Style)
// ============================================================================
// Clean, animated, and modern - everything in one file!

// ============================================================================
// CONFIGURATION & LOGGING
// ============================================================================
const SUPABASE_URL = 'https://xtarwopvfxmvfdelspue.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXJ3b3B2ZnhtdmZkZWxzcHVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDA0MjQsImV4cCI6MjA3MTcxNjQyNH0.1V1v_-Kug_X7iDjBAwlIBc1d_Cui_zXHUtv0Qgm9gS4';

// ============================================================================
// LOGGING SYSTEM
// ============================================================================
const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

let currentLogLevel = LOG_LEVELS.DEBUG;

function log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const levelName = levelNames[level];
    
    if (level >= currentLogLevel) {
        const logMessage = `[${timestamp}] [${levelName}] ${message}`;
        
        if (data) {
            console.group(logMessage);
            console.log('Data:', data);
            console.groupEnd();
        } else {
            console.log(logMessage);
        }
        
        // Also log to page for debugging
        if (level >= LOG_LEVELS.WARN) {
            logToPage(levelName, message, data);
        }
    }
}

function logToPage(level, message, data) {
    const debugContainer = document.getElementById('debug-log');
    if (debugContainer) {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${level.toLowerCase()}`;
        logEntry.innerHTML = `
            <span class="log-time">${new Date().toLocaleTimeString()}</span>
            <span class="log-level">${level}</span>
            <span class="log-message">${message}</span>
            ${data ? `<pre class="log-data">${JSON.stringify(data, null, 2)}</pre>` : ''}
        `;
        debugContainer.appendChild(logEntry);
        debugContainer.scrollTop = debugContainer.scrollHeight;
    }
}

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================
function validateConfiguration() {
    log(LOG_LEVELS.INFO, '🔍 Validating app configuration...');
    
    const config = {
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_KEY,
        logLevel: currentLogLevel,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    };
    
    log(LOG_LEVELS.DEBUG, 'Configuration details:', config);
    
    // Validate Supabase URL
    if (!SUPABASE_URL || SUPABASE_URL === '') {
        log(LOG_LEVELS.ERROR, '❌ SUPABASE_URL is missing or empty');
        return false;
    }
    
    // Validate Supabase Key
    if (!SUPABASE_KEY || SUPABASE_KEY === '') {
        log(LOG_LEVELS.ERROR, '❌ SUPABASE_KEY is missing or empty');
        return false;
    }
    
    // Validate URL format
    try {
        new URL(SUPABASE_URL);
        log(LOG_LEVELS.INFO, '✅ SUPABASE_URL format is valid');
    } catch (error) {
        log(LOG_LEVELS.ERROR, '❌ SUPABASE_URL format is invalid:', error);
        return false;
    }
    
    log(LOG_LEVELS.INFO, '✅ Configuration validation passed');
    return true;
}

// ============================================================================
// INITIALIZE SUPABASE
// ============================================================================
let supabase;

async function initializeSupabase() {
    log(LOG_LEVELS.INFO, '🚀 Initializing Supabase client...');
    
    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        log(LOG_LEVELS.WARN, '⚠️ Supabase library not loaded yet, waiting...');
        return false;
    }
    
    try {
        log(LOG_LEVELS.DEBUG, 'Creating Supabase client with:', {
            url: SUPABASE_URL,
            keyLength: SUPABASE_KEY ? SUPABASE_KEY.length : 0
        });
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        
        // Test the connection
        log(LOG_LEVELS.INFO, '🧪 Testing Supabase connection...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
            log(LOG_LEVELS.ERROR, '❌ Supabase connection test failed:', error);
            return false;
        }
        
        log(LOG_LEVELS.INFO, '✅ Supabase connection successful');
        log(LOG_LEVELS.DEBUG, 'Connection test result:', { data, error });
        return true;
        
    } catch (error) {
        log(LOG_LEVELS.ERROR, '❌ Supabase initialization failed:', error);
        return false;
    }
}

// ============================================================================
// APP STATE
// ============================================================================
let currentUser = null;
let currentPage = 'landing';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function showToast(message, type = 'success') {
    log(LOG_LEVELS.INFO, `🍞 Showing toast: ${message} (${type})`);
    
    const toast = document.getElementById('toast');
    const messageEl = document.getElementById('toast-message');
    const iconEl = document.getElementById('toast-icon');
    
    if (!toast || !messageEl || !iconEl) {
        log(LOG_LEVELS.ERROR, '❌ Toast elements not found in DOM');
        return;
    }
    
    // Set message and icon
    messageEl.textContent = message;
    
    if (type === 'success') {
        iconEl.innerHTML = '✅';
        iconEl.className = 'w-6 h-6 text-green-500';
    } else if (type === 'error') {
        iconEl.innerHTML = '❌';
        iconEl.className = 'w-6 h-6 text-red-500';
    } else {
        iconEl.innerHTML = 'ℹ️';
        iconEl.className = 'w-6 h-6 text-blue-500';
    }
    
    // Show toast
    toast.classList.remove('translate-x-full');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3000);
}

function showFatalError(title, message) {
    log(LOG_LEVELS.ERROR, `💀 Fatal error: ${title} - ${message}`);
    
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = `
            <div class="text-center">
                <div class="text-red-500 text-6xl mb-4">💀</div>
                <h2 class="text-xl font-semibold text-gray-700 mb-2">${title}</h2>
                <p class="text-gray-600 mb-4">${message}</p>
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto text-left">
                    <h3 class="font-semibold text-red-800 mb-2">Debug Information:</h3>
                    <div class="text-sm text-red-700">
                        <p><strong>URL:</strong> ${window.location.href}</p>
                        <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
                        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                        <p><strong>Check Console:</strong> Press F12 for detailed logs</p>
                    </div>
                </div>
            </div>
        `;
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    loading.style.opacity = '0';
    setTimeout(() => {
        loading.style.display = 'none';
    }, 500);
}

// ============================================================================
// MAIN APP FUNCTION
// ============================================================================
async function startApp() {
    log(LOG_LEVELS.INFO, '🚀 Starting PingBoard application...');
    
    // Step 1: Validate configuration
    if (!validateConfiguration()) {
        log(LOG_LEVELS.ERROR, '❌ Configuration validation failed, stopping app');
        showFatalError('Configuration Error', 'Please check your Supabase credentials');
        return;
    }
    
    // Step 2: Wait for Supabase library to load
    log(LOG_LEVELS.INFO, '⏳ Waiting for Supabase library to load...');
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    while (typeof window.supabase === 'undefined' && attempts < maxAttempts) {
        attempts++;
        log(LOG_LEVELS.DEBUG, `Attempt ${attempts}/${maxAttempts} - Supabase not loaded yet`);
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (typeof window.supabase === 'undefined') {
        log(LOG_LEVELS.ERROR, '❌ Supabase library failed to load after 5 seconds');
        showFatalError('Library Error', 'Supabase library failed to load. Check your internet connection.');
        return;
    }
    
    log(LOG_LEVELS.INFO, `✅ Supabase library loaded after ${attempts} attempts`);
    
    // Step 3: Initialize Supabase client
    const supabaseInitialized = await initializeSupabase();
    if (!supabaseInitialized) {
        log(LOG_LEVELS.ERROR, '❌ Failed to initialize Supabase client');
        showFatalError('Connection Error', 'Unable to connect to database. Please check your Supabase setup.');
        return;
    }
    
    // Step 4: Check user authentication
    log(LOG_LEVELS.INFO, '👤 Checking user authentication...');
    try {
        await checkUser();
        log(LOG_LEVELS.INFO, '✅ User authentication check completed');
    } catch (error) {
        log(LOG_LEVELS.ERROR, '❌ User authentication check failed:', error);
        showToast('Authentication check failed', 'error');
    }
    
    // Step 5: Hide loading and show app
    log(LOG_LEVELS.INFO, '🎉 App initialization complete, showing landing page');
    hideLoading();
    addDebugButtons(); // Add debug buttons
    showPage('landing');
}

// ============================================================================
// ROUTE: LANDING PAGE (Hero Section)
// ============================================================================
function showLanding() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <!-- Navigation -->
            <nav class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-4">
                        <div class="flex items-center space-x-2">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span class="text-white font-bold text-lg">🚀</span>
                            </div>
                            <h1 class="text-2xl font-bold gradient-text">PingBoard</h1>
                        </div>
                        <div class="flex space-x-4">
                            <button onclick="showPage('login')" class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                                Sign In
                            </button>
                            <button onclick="showPage('signup')" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover-lift">
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Hero Section -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div class="text-center fade-in">
                    <h2 class="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
                        Your Social Network,
                        <span class="gradient-text">Simplified</span>
                    </h2>
                    <p class="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                        PingBoard is the modern way to connect with your community. 
                        Share updates, discover conversations, and build meaningful connections.
                    </p>
                    
                    <!-- Feature Cards -->
                    <div class="grid md:grid-cols-3 gap-8 mb-16">
                        <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 card-shadow hover-lift slide-up" style="animation-delay: 0.1s">
                            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span class="text-2xl">💬</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-3">Smart Posts</h3>
                            <p class="text-gray-600">Share your thoughts with hashtag support and smart categorization.</p>
                        </div>
                        
                        <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 card-shadow hover-lift slide-up" style="animation-delay: 0.2s">
                            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span class="text-2xl">🔒</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-3">Privacy First</h3>
                            <p class="text-gray-600">Your data stays secure with enterprise-grade encryption.</p>
                        </div>
                        
                        <div class="bg-white/60 backdrop-blur-sm rounded-2xl p-8 card-shadow hover-lift slide-up" style="animation-delay: 0.3s">
                            <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <span class="text-2xl">📱</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-3">Mobile Ready</h3>
                            <p class="text-gray-600">Beautiful design that works perfectly on all devices.</p>
                        </div>
                    </div>
                    
                    <!-- CTA Buttons -->
                    <div class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 bounce-in">
                        <button onclick="showPage('signup')" class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover-lift shadow-lg">
                            Start Building Your Community
                        </button>
                        <button onclick="showPage('login')" class="w-full sm:w-auto px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-gray-400 hover:text-gray-900 transition-all duration-200 hover-lift">
                            Sign In to Your Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// ROUTE: SIGNUP PAGE
// ============================================================================
function showSignup() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
            <div class="max-w-md w-full space-y-8 fade-in">
                <div class="text-center">
                    <button onclick="showPage('landing')" class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Home
                    </button>
                    
                    <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span class="text-2xl">🚀</span>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900">Join PingBoard</h2>
                    <p class="mt-2 text-gray-600">Create your account and start connecting</p>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 scale-in">
                    <form onsubmit="handleSignup(event)" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input id="signupUsername" type="text" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Choose a unique username">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input id="signupEmail" type="email" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="your@email.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input id="signupPassword" type="password" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Create a strong password">
                        </div>
                        
                        <button type="submit" id="signupBtn" 
                                class="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover-lift">
                            Create Account
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center">
                        <p class="text-gray-600">
                            Already have an account? 
                            <button onclick="showPage('login')" class="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                Sign in here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// ROUTE: LOGIN PAGE
// ============================================================================
function showLogin() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
            <div class="max-w-md w-full space-y-8 fade-in">
                <div class="text-center">
                    <button onclick="showPage('landing')" class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back to Home
                    </button>
                    
                    <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <span class="text-2xl">🔐</span>
                    </div>
                    <h2 class="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p class="mt-2 text-gray-600">Sign in to your PingBoard account</p>
                </div>
                
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 scale-in">
                    <form onsubmit="handleLogin(event)" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input id="loginEmail" type="email" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="your@email.com">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <input id="loginPassword" type="password" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                   placeholder="Enter your password">
                        </div>
                        
                        <button type="submit" id="loginBtn" 
                                class="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-blue-700 transition-all duration-200 hover-lift">
                            Sign In
                        </button>
                    </form>
                    
                    <div class="mt-6 text-center">
                        <p class="text-gray-600">
                            Don't have an account? 
                            <button onclick="showPage('signup')" class="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                Sign up here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// ROUTE: MAIN APP (Dashboard)
// ============================================================================
function showApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <!-- Navigation -->
            <nav class="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-4">
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span class="text-white font-bold text-lg">🚀</span>
                            </div>
                            <h1 class="text-2xl font-bold gradient-text">PingBoard</h1>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <span class="text-gray-700 font-medium">Welcome, ${currentUser.email}</span>
                            <button onclick="showPage('friend-request')" class="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                                👥 Friends
                            </button>
                            <button onclick="handleLogout()" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors hover-lift">
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Main Content -->
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Post Form -->
                    <div class="lg:col-span-1">
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 hover-lift">
                            <h3 class="text-xl font-semibold text-gray-900 mb-4">Share a Ping</h3>
                            <form onsubmit="handlePost(event)" class="space-y-4">
                                <textarea id="pingText" rows="4" 
                                          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                                          placeholder="What's on your mind? Use #hashtags for better discoverability..."></textarea>
                                
                                <div class="flex items-center justify-between">
                                    <span id="charCount" class="text-sm text-gray-500">0/280</span>
                                    <button type="submit" id="postBtn" 
                                            class="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover-lift">
                                        Post Ping
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Pings Feed -->
                    <div class="lg:col-span-2">
                        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
                            <div class="px-6 py-4 border-b border-gray-200/50">
                                <h3 class="text-xl font-semibold text-gray-900">Recent Pings</h3>
                            </div>
                            <div id="pingsFeed" class="divide-y divide-gray-200/50">
                                <!-- Pings will be loaded here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add character counter
    const textarea = document.getElementById('pingText');
    const charCount = document.getElementById('charCount');
    textarea.addEventListener('input', (e) => {
        const count = e.target.value.length;
        charCount.textContent = `${count}/280`;
        charCount.className = count > 250 ? 'text-sm text-red-500' : 'text-sm text-gray-500';
    });
    
    loadPings();
}

// ============================================================================
// ROUTE: FRIEND REQUEST PAGE
// ============================================================================
function showFriendRequest() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            <div class="max-w-4xl mx-auto px-4 py-8">
                <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover-lift">
                    <div class="text-center mb-8">
                        <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span class="text-4xl">👥</span>
                        </div>
                        <h2 class="text-3xl font-bold text-gray-900 mb-4">Friend Requests</h2>
                        <p class="text-gray-600">Manage your connections and discover new friends</p>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                            <span class="text-6xl mb-4 block">🚧</span>
                            <h3 class="text-xl font-semibold text-gray-700 mb-2">Coming Soon!</h3>
                            <p class="text-gray-500 mb-4">Friend request functionality is under development</p>
                            <button onclick="showApp()" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 hover-lift">
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================================
// PAGE ROUTER
// ============================================================================
function showPage(page) {
    currentPage = page;
    
    switch(page) {
        case 'landing':
            showLanding();
            break;
        case 'signup':
            showSignup();
            break;
        case 'login':
            showLogin();
            break;
        case 'app':
            showApp();
            break;
        case 'friend-request':
            showFriendRequest();
            break;
        default:
            showLanding();
    }
}

// ============================================================================
// AUTHENTICATION HANDLERS
// ============================================================================
async function handleSignup(event) {
    event.preventDefault();
    log(LOG_LEVELS.INFO, '🚀 Starting user signup process...');
    
    const btn = document.getElementById('signupBtn');
    const originalText = btn.textContent;
    
    // Show loading state
    btn.textContent = 'Creating Account...';
    btn.disabled = true;
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    log(LOG_LEVELS.DEBUG, 'Signup form data:', { username, email, passwordLength: password.length });
    
    // Validate input
    if (!username || !email || !password) {
        log(LOG_LEVELS.ERROR, '❌ Missing required fields');
        showToast('Please fill in all fields', 'error');
        btn.textContent = originalText;
        btn.disabled = false;
        return;
    }
    
    try {
        log(LOG_LEVELS.INFO, '📧 Calling Supabase auth.signUp...');
        
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { 
                data: { username },
                emailRedirectTo: window.location.origin
            }
        });
        
        log(LOG_LEVELS.DEBUG, 'Supabase signup response:', { data, error });
        
        if (error) {
            log(LOG_LEVELS.ERROR, '❌ Supabase signup error:', error);
            throw error;
        }
        
        log(LOG_LEVELS.INFO, '✅ User signup successful:', {
            userId: data.user?.id,
            email: data.user?.email,
            emailConfirmed: data.user?.email_confirmed_at
        });
        
        showToast('Account created! Please check your email to verify.', 'success');
        setTimeout(() => showPage('login'), 2000);
        
    } catch (error) {
        log(LOG_LEVELS.ERROR, '💀 Signup failed with error:', error);
        showToast('Signup failed: ' + error.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    log(LOG_LEVELS.INFO, '🔑 Starting user login process...');
    
    const btn = document.getElementById('loginBtn');
    const originalText = btn.textContent;
    
    // Show loading state
    btn.textContent = 'Signing In...';
    btn.disabled = true;
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    log(LOG_LEVELS.DEBUG, 'Login form data:', { email, passwordLength: password.length });
    
    // Validate input
    if (!email || !password) {
        log(LOG_LEVELS.ERROR, '❌ Missing email or password');
        showToast('Please enter email and password', 'error');
        btn.textContent = originalText;
        btn.disabled = false;
        return;
    }
    
    try {
        log(LOG_LEVELS.INFO, '🔐 Calling Supabase auth.signInWithPassword...');
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        log(LOG_LEVELS.DEBUG, 'Supabase login response:', { 
            hasUser: !!data.user, 
            userId: data.user?.id,
            email: data.user?.email,
            error 
        });
        
        if (error) {
            log(LOG_LEVELS.ERROR, '❌ Supabase login error:', error);
            throw error;
        }
        
        if (data.user) {
            currentUser = data.user;
            log(LOG_LEVELS.INFO, '✅ User login successful:', {
                userId: data.user.id,
                email: data.user.email,
                emailConfirmed: data.user.email_confirmed_at
            });
            
            showToast('Welcome back!', 'success');
            showPage('app');
        } else {
            log(LOG_LEVELS.ERROR, '❌ No user data returned from login');
            showToast('Login failed: No user data returned', 'error');
        }
        
    } catch (error) {
        log(LOG_LEVELS.ERROR, '💀 Login failed with error:', error);
        showToast('Login failed: ' + error.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function handleLogout() {
    await supabase.auth.signOut();
    currentUser = null;
    showToast('Signed out successfully', 'info');
    showPage('landing');
}

// ============================================================================
// POST OPERATIONS (CREATE, READ, UPDATE, DELETE)
// ============================================================================
async function handlePost(event) {
    event.preventDefault();
    
    const btn = document.getElementById('postBtn');
    const originalText = btn.textContent;
    
    // Show loading state
    btn.textContent = 'Posting...';
    btn.disabled = true;
    
    const text = document.getElementById('pingText').value.trim();
    if (!text) return;
    
    try {
        const { data, error } = await supabase
            .from('pings')
            .insert([{
                text,
                user_id: currentUser.id,
                hashtags: extractHashtags(text),
                seo_description: generateSEODescription(text)
            }]);
        
        if (error) throw error;
        
        document.getElementById('pingText').value = '';
        document.getElementById('charCount').textContent = '0/280';
        loadPings();
        showToast('Ping posted successfully!', 'success');
    } catch (error) {
        showToast('Failed to post: ' + error.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

async function loadPings() {
    try {
        const { data: pings, error } = await supabase
            .from('pings')
            .select(`
                *,
                profiles:user_id(username, email)
            `)
            .order('created_at', { ascending: false })
            .limit(20);
        
        if (error) throw error;
        
        renderPings(pings || []);
    } catch (error) {
        console.error('Failed to load pings:', error);
        showToast('Failed to load pings', 'error');
    }
}

function renderPings(pings) {
    const feed = document.getElementById('pingsFeed');
    if (!feed) return;
    
    if (pings.length === 0) {
        feed.innerHTML = `
            <div class="px-6 py-12 text-center">
                <span class="text-6xl block mb-4">🎉</span>
                <p class="text-gray-500 text-lg">No pings yet. Be the first to share something!</p>
            </div>
        `;
        return;
    }
    
    feed.innerHTML = pings.map((ping, index) => `
        <div class="px-6 py-6 hover:bg-gray-50/50 transition-colors duration-200 slide-up" style="animation-delay: ${index * 0.1}s">
            <div class="flex space-x-4">
                <div class="flex-shrink-0">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-semibold text-lg">
                            ${(ping.profiles?.username || ping.profiles?.email || 'U').charAt(0).toUpperCase()}
                        </span>
                    </div>
                </div>
                
                <div class="flex-1 min-w-0">
                    <div class="flex items-center space-x-2 mb-2">
                        <span class="text-sm font-semibold text-gray-900">
                            ${ping.profiles?.username || ping.profiles?.email || 'Anonymous'}
                        </span>
                        <span class="text-sm text-gray-500">
                            ${new Date(ping.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    
                    <p class="text-gray-900 mb-3 leading-relaxed">${ping.text}</p>
                    
                    ${ping.hashtags && ping.hashtags.length > 0 ? `
                        <div class="mb-3">
                            ${ping.hashtags.map(tag => `
                                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mr-2 mb-1 hover:bg-blue-200 transition-colors">
                                    #${tag.replace('#', '')}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="flex items-center space-x-4">
                        <button onclick="handleUpdate('${ping.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors hover-lift">
                            ✏️ Edit
                        </button>
                        <button onclick="handleDelete('${ping.id}')" class="text-red-600 hover:text-red-800 text-sm font-medium transition-colors hover-lift">
                            🗑️ Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

async function handleUpdate(pingId) {
    const newText = prompt('Enter new text for your ping:');
    if (!newText) return;
    
    try {
        const { error } = await supabase
            .from('pings')
            .update({ 
                text: newText,
                hashtags: extractHashtags(newText),
                seo_description: generateSEODescription(newText)
            })
            .eq('id', pingId);
        
        if (error) throw error;
        
        loadPings();
        showToast('Ping updated successfully!', 'success');
    } catch (error) {
        showToast('Failed to update: ' + error.message, 'error');
    }
}

async function handleDelete(pingId) {
    if (!confirm('Are you sure you want to delete this ping?')) return;
    
    try {
        const { error } = await supabase
            .from('pings')
            .delete()
            .eq('id', pingId);
        
        if (error) throw error;
        
        loadPings();
        showToast('Ping deleted successfully!', 'success');
    } catch (error) {
        showToast('Failed to delete: ' + error.message, 'error');
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
function extractHashtags(text) {
    const hashtags = text.match(/#(\w+)/g);
    // Return empty array {} for database TEXT[] field, not empty string ""
    return hashtags ? hashtags : [];
}

function generateSEODescription(text) {
    const baseText = text.replace(/#/g, '');
    return `${baseText}. Discover insights and discussions on this topic.`;
}

async function checkUser() {
    log(LOG_LEVELS.INFO, '🔍 Checking current user authentication...');
    
    try {
        if (!supabase) {
            log(LOG_LEVELS.ERROR, '❌ Supabase client not initialized');
            throw new Error('Supabase client not initialized');
        }
        
        // First check if there's an active session
        log(LOG_LEVELS.DEBUG, 'Checking for active session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            log(LOG_LEVELS.WARN, '⚠️ Session check error (this is normal for new users):', sessionError);
        }
        
        if (session && session.user) {
            // User has an active session
            currentUser = session.user;
            log(LOG_LEVELS.INFO, '✅ User logged in via session:', {
                id: session.user.id,
                email: session.user.email,
                emailConfirmed: session.user.email_confirmed_at
            });
            return session.user;
        } else {
            // No active session - this is normal for new visitors
            log(LOG_LEVELS.INFO, 'ℹ️ No active session - user is not logged in (this is normal)');
            currentUser = null;
            return null;
        }
        
    } catch (error) {
        // Don't throw errors for missing sessions - this is expected behavior
        if (error.message && error.message.includes('Auth session missing')) {
            log(LOG_LEVELS.INFO, 'ℹ️ No auth session found (user not logged in)');
            currentUser = null;
            return null;
        }
        
        log(LOG_LEVELS.ERROR, '❌ Unexpected error checking user:', error);
        currentUser = null;
        return null;
    }
}

// Debug panel toggle function
function toggleDebugPanel() {
    const panel = document.getElementById('debug-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        log(LOG_LEVELS.INFO, `Debug panel ${panel.style.display === 'none' ? 'hidden' : 'shown'}`);
    }
}

// Test Supabase connection and auth state
async function testSupabaseConnection() {
    log(LOG_LEVELS.INFO, '🧪 Testing Supabase connection and auth state...');
    
    try {
        // Test basic connection
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
        
        log(LOG_LEVELS.DEBUG, 'Profiles table test:', { profiles, profilesError });
        
        // Test auth state
        const { data: { session: authSession }, error: authError } = await supabase.auth.getSession();
        log(LOG_LEVELS.DEBUG, 'Current auth state:', { 
            hasSession: !!authSession, 
            user: authSession?.user,
            authError 
        });
        
        // Test session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        log(LOG_LEVELS.DEBUG, 'Current session:', { 
            hasSession: !!session, 
            sessionError,
            userId: session?.user?.id 
        });
        
        log(LOG_LEVELS.INFO, '✅ Supabase connection test completed');
        
        return {
            profilesWorking: !profilesError,
            authWorking: !authError,
            sessionWorking: !sessionError,
            currentUser: authSession?.user
        };
        
    } catch (error) {
        log(LOG_LEVELS.ERROR, '❌ Supabase connection test failed:', error);
        return { error: error.message };
    }
}

// Add test button to debug panel
function addDebugButtons() {
    const debugPanel = document.getElementById('debug-panel');
    if (debugPanel) {
        const buttonContainer = debugPanel.querySelector('.flex.justify-between');
        if (buttonContainer) {
            const testBtn = document.createElement('button');
            testBtn.textContent = 'Test DB';
            testBtn.className = 'text-xs bg-blue-700 px-2 py-1 rounded hover:bg-blue-600 ml-2';
            testBtn.onclick = testSupabaseConnection;
            buttonContainer.appendChild(testBtn);
            
            const createTestUserBtn = document.createElement('button');
            createTestUserBtn.textContent = 'Create Test User';
            createTestUserBtn.className = 'text-xs bg-green-700 px-2 py-1 rounded hover:bg-green-600 ml-2';
            createTestUserBtn.onclick = createTestUser;
            buttonContainer.appendChild(createTestUserBtn);
        }
    }
}

// Create a test user account
async function createTestUser() {
    log(LOG_LEVELS.INFO, '🧪 Creating test user account...');
    
    try {
        const testUserData = {
            email: 'test@pingboard.com',
            password: 'testpassword123',
            username: 'testuser'
        };
        
        log(LOG_LEVELS.DEBUG, 'Creating test user with:', testUserData);
        
        const { data, error } = await supabase.auth.signUp({
            email: testUserData.email,
            password: testUserData.password,
            options: { 
                data: { username: testUserData.username },
                emailRedirectTo: window.location.origin
            }
        });
        
        if (error) {
            log(LOG_LEVELS.ERROR, '❌ Failed to create test user:', error);
            showToast('Failed to create test user: ' + error.message, 'error');
            return;
        }
        
        log(LOG_LEVELS.INFO, '✅ Test user created successfully:', {
            userId: data.user?.id,
            email: data.user?.email
        });
        
        // Show credentials in a nice format
        const credentials = `
🎉 Test User Created Successfully!

📧 Email: ${testUserData.email}
🔑 Password: ${testUserData.password}
👤 Username: ${testUserData.username}

You can now use these credentials to log in!
        `;
        
        showToast('Test user created! Check console for credentials', 'success');
        console.log(credentials);
        
        // Also log to debug panel
        log(LOG_LEVELS.INFO, 'Test user credentials:', testUserData);
        
    } catch (error) {
        log(LOG_LEVELS.ERROR, '💀 Error creating test user:', error);
        showToast('Error creating test user: ' + error.message, 'error');
    }
}

// ============================================================================
// START THE APP
// ============================================================================
document.addEventListener('DOMContentLoaded', startApp);
