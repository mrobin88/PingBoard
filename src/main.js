// PingBoard Static App
class PingBoard {
    constructor() {
        this.currentUser = null;
        this.currentView = 'home';
        this.supabase = null;
        this.init();
    }

    async init() {
        // Initialize Supabase
        this.supabase = supabase.createClient(
            'YOUR_SUPABASE_URL',
            'YOUR_SUPABASE_ANON_KEY'
        );

        // Check if user is logged in
        const { data: { user } } = await this.supabase.auth.getUser();
        if (user) {
            this.currentUser = user;
            this.showApp();
        } else {
            this.showHome();
        }

        // Hide loading
        document.getElementById('loading').style.display = 'none';
    }

    showHome() {
        this.currentView = 'home';
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                <!-- Header -->
                <header class="bg-white shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between items-center py-6">
                            <div class="flex items-center">
                                <h1 class="text-3xl font-bold text-gray-900">🚀 PingBoard</h1>
                            </div>
                            <div class="flex space-x-4">
                                <button onclick="app.showLogin()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                                    Sign In
                                </button>
                                <button onclick="app.showRegister()" class="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                                    Sign Up
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Hero Section -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div class="text-center">
                        <h2 class="text-5xl font-bold text-gray-900 mb-6">
                            Your Local Social Network
                        </h2>
                        <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                            PingBoard is a lightweight, self-hosted social networking platform perfect for offices, 
                            communities, and organizations. Share updates, coordinate events, and stay connected.
                        </p>
                        <div class="flex justify-center space-x-4">
                            <button onclick="app.showRegister()" class="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700">
                                Get Started Free
                            </button>
                            <button onclick="app.showLogin()" class="bg-gray-900 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-800">
                                Sign In
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Features -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div class="text-center">
                            <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">🔒</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-2">Private & Secure</h3>
                            <p class="text-gray-600">Your data stays on your network. No third-party tracking.</p>
                        </div>
                        <div class="text-center">
                            <div class="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">📱</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-2">Mobile Ready</h3>
                            <p class="text-gray-600">Works perfectly on phones, tablets, and computers.</p>
                        </div>
                        <div class="text-center">
                            <div class="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span class="text-2xl">⚡</span>
                            </div>
                            <h3 class="text-xl font-semibold text-gray-900 mb-2">Lightning Fast</h3>
                            <p class="text-gray-600">Static frontend with serverless backend for optimal performance.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    showLogin() {
        this.currentView = 'login';
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div class="sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="text-center">
                        <a href="#" onclick="app.showHome()" class="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
                            ← Back to PingBoard
                        </a>
                        <h2 class="text-3xl font-bold text-gray-900">Sign in to your account</h2>
                    </div>
                </div>

                <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form id="loginForm" class="space-y-6">
                            <div>
                                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                                <div class="mt-1">
                                    <input id="email" name="email" type="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                            </div>

                            <div>
                                <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                                <div class="mt-1">
                                    <input id="password" name="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                            </div>

                            <div>
                                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Sign in
                                </button>
                            </div>
                        </form>

                        <div class="mt-6 text-center">
                            <p class="text-sm text-gray-600">
                                Don't have an account?
                                <a href="#" onclick="app.showRegister()" class="font-medium text-blue-600 hover:text-blue-500">Sign up here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Handle login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });
    }

    showRegister() {
        this.currentView = 'register';
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div class="sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="text-center">
                        <a href="#" onclick="app.showHome()" class="inline-flex items-center text-blue-600 hover:text-blue-500 mb-4">
                            ← Back to PingBoard
                        </a>
                        <h2 class="text-3xl font-bold text-gray-900">Create your account</h2>
                    </div>
                </div>

                <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form id="registerForm" class="space-y-6">
                            <div>
                                <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
                                <div class="mt-1">
                                    <input id="username" name="username" type="text" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                            </div>

                            <div>
                                <label for="regEmail" class="block text-sm font-medium text-gray-700">Email</label>
                                <div class="mt-1">
                                    <input id="regEmail" name="email" type="email" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                            </div>

                            <div>
                                <label for="regPassword" class="block text-sm font-medium text-gray-700">Password</label>
                                <div class="mt-1">
                                    <input id="regPassword" name="password" type="password" required class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                </div>
                            </div>

                            <div>
                                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Create account
                                </button>
                            </div>
                        </form>

                        <div class="mt-6 text-center">
                            <p class="text-sm text-gray-600">
                                Already have an account?
                                <a href="#" onclick="app.showLogin()" class="font-medium text-blue-600 hover:text-blue-500">Sign in here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Handle register form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegister();
        });
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.currentUser = data.user;
            this.showApp();
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async handleRegister() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { username }
                }
            });

            if (error) throw error;

            alert('Account created! Please check your email to verify your account.');
            this.showLogin();
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    showApp() {
        this.currentView = 'app';
        this.loadPings();
        this.renderApp();
    }

    renderApp() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Header -->
                <header class="bg-white shadow-sm">
                    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div class="flex justify-between items-center py-6">
                            <div class="flex items-center">
                                <h1 class="text-3xl font-bold text-gray-900">🚀 PingBoard</h1>
                            </div>
                            <div class="flex items-center space-x-4">
                                <span class="text-gray-700">Welcome, ${this.currentUser.user_metadata?.username || this.currentUser.email}</span>
                                <button onclick="app.handleLogout()" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Main Content -->
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <!-- Post Form -->
                        <div class="lg:col-span-1">
                            <div class="bg-white rounded-lg shadow p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">Share a Ping</h3>
                                <form id="pingForm" class="space-y-4">
                                    <div>
                                        <textarea id="pingText" rows="4" class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" placeholder="What's on your mind? Use #hashtags for better discoverability..."></textarea>
                                        <div class="mt-2 text-sm text-gray-500">
                                            <span id="charCount">0</span>/280 characters
                                        </div>
                                    </div>
                                    <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                                        Post Ping
                                    </button>
                                </form>
                            </div>
                        </div>

                        <!-- Pings Feed -->
                        <div class="lg:col-span-2">
                            <div class="bg-white rounded-lg shadow">
                                <div class="px-6 py-4 border-b border-gray-200">
                                    <h3 class="text-lg font-medium text-gray-900">Recent Pings</h3>
                                </div>
                                <div id="pingsFeed" class="divide-y divide-gray-200">
                                    <!-- Pings will be loaded here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Handle ping form
        document.getElementById('pingForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handlePostPing();
        });

        // Character counter
        document.getElementById('pingText').addEventListener('input', (e) => {
            const count = e.target.value.length;
            document.getElementById('charCount').textContent = count;
        });
    }

    async handlePostPing() {
        const text = document.getElementById('pingText').value.trim();
        if (!text) return;

        try {
            const { data, error } = await this.supabase
                .from('pings')
                .insert([
                    {
                        text,
                        user_id: this.currentUser.id,
                        hashtags: this.extractHashtags(text),
                        seo_description: this.generateSEODescription(text)
                    }
                ]);

            if (error) throw error;

            document.getElementById('pingText').value = '';
            document.getElementById('charCount').textContent = '0';
            this.loadPings();
        } catch (error) {
            alert('Failed to post ping: ' + error.message);
        }
    }

    extractHashtags(text) {
        const hashtags = text.match(/#(\w+)/g);
        return hashtags ? hashtags.join(',') : '';
    }

    generateSEODescription(text, hashtags) {
        // Simple SEO generation (can be enhanced)
        const baseText = text.replace(/#/g, '');
        return `${baseText}. Discover insights and discussions on this topic.`;
    }

    async loadPings() {
        try {
            const { data: pings, error } = await this.supabase
                .from('pings')
                .select(`
                    *,
                    profiles:user_id(username, email)
                `)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;

            this.renderPings(pings || []);
        } catch (error) {
            console.error('Failed to load pings:', error);
        }
    }

    renderPings(pings) {
        const feed = document.getElementById('pingsFeed');
        if (!feed) return;

        if (pings.length === 0) {
            feed.innerHTML = `
                <div class="px-6 py-8 text-center text-gray-500">
                    No pings yet. Be the first to share something!
                </div>
            `;
            return;
        }

        feed.innerHTML = pings.map(ping => `
            <div class="px-6 py-4">
                <div class="flex space-x-3">
                    <div class="flex-shrink-0">
                        <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            ${(ping.profiles?.username || ping.profiles?.email || 'U').charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center space-x-2">
                            <span class="text-sm font-medium text-gray-900">
                                ${ping.profiles?.username || ping.profiles?.email || 'Anonymous'}
                            </span>
                            <span class="text-sm text-gray-500">
                                ${new Date(ping.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        <p class="text-gray-900 mt-1">${ping.text}</p>
                        ${ping.hashtags ? `
                            <div class="mt-2">
                                ${ping.hashtags.split(',').map(tag => `
                                    <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2 mb-1">
                                        #${tag.replace('#', '')}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    async handleLogout() {
        await this.supabase.auth.signOut();
        this.currentUser = null;
        this.showHome();
    }
}

// Initialize the app
const app = new PingBoard();
