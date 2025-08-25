// PingBoard API Service Layer
// Mimics Django patterns but optimized for Supabase + serverless

class PingBoardAPI {
    constructor(supabase) {
        this.supabase = supabase;
        this.baseURL = '/.netlify/functions';
    }

    // ===== AUTHENTICATION (Django-like auth patterns) =====
    
    async signUp(userData) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: { username: userData.username }
                }
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signIn(credentials) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password
            });
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            if (error) throw error;
            return { success: true, data: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===== PROFILES (Django User model equivalent) =====
    
    async getProfile(userId) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateProfile(userId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===== PINGS (Django Ping model equivalent) =====
    
    async createPing(pingData) {
        try {
            const { data, error } = await this.supabase
                .from('pings')
                .insert([{
                    text: pingData.text,
                    category: pingData.category || 'misc',
                    user_id: pingData.user_id,
                    location: pingData.location,
                    is_anonymous: pingData.is_anonymous || false,
                    hashtags: pingData.hashtags,
                    seo_description: pingData.seo_description
                }])
                .select(`
                    *,
                    profiles:user_id(username, email)
                `)
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getPings(options = {}) {
        try {
            let query = this.supabase
                .from('pings')
                .select(`
                    *,
                    profiles:user_id(username, email),
                    votes(vote_type, user_id)
                `)
                .order('created_at', { ascending: false });

            // Django-like filtering
            if (options.category) {
                query = query.eq('category', options.category);
            }
            
            if (options.user_id) {
                query = query.eq('user_id', options.user_id);
            }
            
            if (options.location) {
                query = query.ilike('location', `%${options.location}%`);
            }
            
            if (options.hashtags) {
                query = query.ilike('hashtags', `%${options.hashtags}%`);
            }

            // Pagination (Django-like)
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
            }

            const { data, error } = await query;
            
            if (error) throw error;
            
            // Process votes like Django would
            const processedData = data.map(ping => ({
                ...ping,
                vote_count: this.calculateVoteCount(ping.votes),
                user_vote: this.getUserVote(ping.votes, options.current_user_id)
            }));
            
            return { success: true, data: processedData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getPing(pingId) {
        try {
            const { data, error } = await this.supabase
                .from('pings')
                .select(`
                    *,
                    profiles:user_id(username, email),
                    votes(vote_type, user_id)
                `)
                .eq('id', pingId)
                .single();
            
            if (error) throw error;
            
            // Process votes
            const processedData = {
                ...data,
                vote_count: this.calculateVoteCount(data.votes),
                user_vote: this.getUserVote(data.votes, this.supabase.auth.getUser()?.id)
            };
            
            return { success: true, data: processedData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updatePing(pingId, updates) {
        try {
            const { data, error } = await this.supabase
                .from('pings')
                .update(updates)
                .eq('id', pingId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deletePing(pingId) {
        try {
            const { error } = await this.supabase
                .from('pings')
                .delete()
                .eq('id', pingId);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===== VOTES (Django ManyToMany equivalent) =====
    
    async voteOnPing(pingId, userId, voteType) {
        try {
            // Remove existing vote if any
            await this.supabase
                .from('votes')
                .delete()
                .eq('ping_id', pingId)
                .eq('user_id', userId);

            // Add new vote
            const { data, error } = await this.supabase
                .from('votes')
                .insert([{
                    ping_id: pingId,
                    user_id: userId,
                    vote_type: voteType
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async removeVote(pingId, userId) {
        try {
            const { error } = await this.supabase
                .from('votes')
                .delete()
                .eq('ping_id', pingId)
                .eq('user_id', userId);
            
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===== UTILITY METHODS (Django-like helpers) =====
    
    calculateVoteCount(votes) {
        if (!votes) return 0;
        return votes.reduce((count, vote) => {
            return count + (vote.vote_type === 'upvote' ? 1 : -1);
        }, 0);
    }

    getUserVote(votes, userId) {
        if (!votes || !userId) return null;
        const userVote = votes.find(vote => vote.user_id === userId);
        return userVote ? userVote.vote_type : null;
    }

    // ===== SEARCH (Django-like search) =====
    
    async searchPings(query, options = {}) {
        try {
            const { data, error } = await this.supabase
                .from('pings')
                .select(`
                    *,
                    profiles:user_id(username, email)
                `)
                .or(`text.ilike.%${query}%,hashtags.ilike.%${query}%`)
                .order('created_at', { ascending: false })
                .limit(options.limit || 20);
            
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===== ANALYTICS (Django-like aggregation) =====
    
    async getPingStats(userId = null) {
        try {
            let query = this.supabase
                .from('pings')
                .select('*', { count: 'exact' });

            if (userId) {
                query = query.eq('user_id', userId);
            }

            const { count, error } = await query;
            
            if (error) throw error;
            return { success: true, data: { total_pings: count } };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    // ===== REAL-TIME (Supabase advantage over Django) =====
    
    subscribeToPings(callback) {
        return this.supabase
            .channel('pings')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'pings' }, 
                callback
            )
            .subscribe();
    }

    subscribeToVotes(callback) {
        return this.supabase
            .channel('votes')
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'votes' }, 
                callback
            )
            .subscribe();
    }
}

export default PingBoardAPI;
