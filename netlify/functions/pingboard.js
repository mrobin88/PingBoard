// Netlify Function for PingBoard serverless operations
// Handles complex operations that can't be done client-side

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { action, data } = JSON.parse(event.body || '{}');
        
        switch (action) {
            case 'generate_seo':
                return await handleGenerateSEO(data, headers);
            
            case 'bulk_operations':
                return await handleBulkOperations(data, headers);
            
            case 'analytics':
                return await handleAnalytics(data, headers);
            
            case 'search_advanced':
                return await handleAdvancedSearch(data, headers);
            
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid action' })
                };
        }
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
};

// ===== SEO GENERATION (AI-like functionality) =====
async function handleGenerateSEO(data, headers) {
    try {
        const { text, hashtags } = data;
        
        // Enhanced SEO generation (can be connected to AI services later)
        const seoDescription = generateEnhancedSEODescription(text, hashtags);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                seo_description: seoDescription,
                meta_tags: generateMetaTags(text, hashtags)
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}

function generateEnhancedSEODescription(text, hashtags) {
    const baseText = text.replace(/#/g, '');
    
    // Enhanced hashtag expansions
    const hashtagExpansions = {
        'tech': 'technology insights, latest developments, and industry trends',
        'news': 'breaking news, current events, and important updates',
        'business': 'business strategies, market insights, and entrepreneurial tips',
        'health': 'health and wellness advice, medical insights, and fitness tips',
        'travel': 'travel destinations, adventure stories, and vacation planning',
        'food': 'culinary experiences, recipe ideas, and restaurant recommendations',
        'sports': 'sports analysis, game highlights, and athletic achievements',
        'music': 'music reviews, artist spotlights, and concert experiences',
        'books': 'book recommendations, reading insights, and literary discussions',
        'movies': 'film reviews, entertainment news, and cinematic experiences',
        'education': 'learning resources, academic insights, and skill development',
        'finance': 'financial advice, investment tips, and money management',
        'science': 'scientific discoveries, research insights, and technological advances',
        'art': 'artistic creations, creative inspiration, and cultural highlights',
        'fashion': 'style trends, fashion advice, and wardrobe inspiration'
    };
    
    const expansions = [];
    if (hashtags) {
        hashtags.split(',').forEach(tag => {
            const cleanTag = tag.replace('#', '').toLowerCase();
            if (hashtagExpansions[cleanTag]) {
                expansions.push(hashtagExpansions[cleanTag]);
            }
        });
    }
    
    if (expansions.length > 0) {
        return `${baseText}. Explore ${expansions.join(', ')}. Discover insights, discussions, and community perspectives on this topic.`;
    }
    
    return `${baseText}. Join the conversation and discover insights from our community.`;
}

function generateMetaTags(text, hashtags) {
    const baseText = text.replace(/#/g, '');
    const cleanHashtags = hashtags ? hashtags.split(',').map(tag => tag.replace('#', '')) : [];
    
    return {
        title: `${baseText.substring(0, 60)}${baseText.length > 60 ? '...' : ''}`,
        description: generateEnhancedSEODescription(text, hashtags).substring(0, 160),
        keywords: cleanHashtags.join(', '),
        og_title: baseText.substring(0, 60),
        og_description: generateEnhancedSEODescription(text, hashtags).substring(0, 160),
        twitter_card: 'summary',
        twitter_title: baseText.substring(0, 60),
        twitter_description: generateEnhancedSEODescription(text, hashtags).substring(0, 160)
    };
}

// ===== BULK OPERATIONS (Django-like batch operations) =====
async function handleBulkOperations(data, headers) {
    try {
        const { operation, items } = data;
        
        switch (operation) {
            case 'bulk_delete':
                const deleteResult = await supabase
                    .from('pings')
                    .delete()
                    .in('id', items);
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        deleted_count: deleteResult.data?.length || 0
                    })
                };
            
            case 'bulk_update':
                const updateResult = await supabase
                    .from('pings')
                    .update(data.updates)
                    .in('id', items)
                    .select();
                
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        updated_count: updateResult.data?.length || 0,
                        data: updateResult.data
                    })
                };
            
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid bulk operation' })
                };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}

// ===== ANALYTICS (Django-like aggregation) =====
async function handleAnalytics(data, headers) {
    try {
        const { type, filters } = data;
        
        switch (type) {
            case 'user_activity':
                const userStats = await getUserActivityStats(filters);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: userStats
                    })
                };
            
            case 'content_analytics':
                const contentStats = await getContentAnalytics(filters);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: contentStats
                    })
                };
            
            case 'trending_topics':
                const trendingTopics = await getTrendingTopics(filters);
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: trendingTopics
                    })
                };
            
            default:
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ error: 'Invalid analytics type' })
                };
        }
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}

async function getUserActivityStats(filters) {
    const { data: pings } = await supabase
        .from('pings')
        .select('created_at, user_id')
        .gte('created_at', filters?.start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    const userActivity = {};
    pings.forEach(ping => {
        const date = ping.created_at.split('T')[0];
        userActivity[date] = (userActivity[date] || 0) + 1;
    });
    
    return {
        daily_activity: userActivity,
        total_pings: pings.length,
        active_users: new Set(pings.map(p => p.user_id)).size
    };
}

async function getContentAnalytics(filters) {
    const { data: pings } = await supabase
        .from('pings')
        .select('category, hashtags, created_at');
    
    const categoryStats = {};
    const hashtagStats = {};
    
    pings.forEach(ping => {
        // Category stats
        categoryStats[ping.category] = (categoryStats[ping.category] || 0) + 1;
        
        // Hashtag stats
        if (ping.hashtags) {
            ping.hashtags.split(',').forEach(tag => {
                const cleanTag = tag.replace('#', '').trim();
                if (cleanTag) {
                    hashtagStats[cleanTag] = (hashtagStats[cleanTag] || 0) + 1;
                }
            });
        }
    });
    
    return {
        category_distribution: categoryStats,
        trending_hashtags: Object.entries(hashtagStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([tag, count]) => ({ tag, count }))
    };
}

async function getTrendingTopics(filters) {
    const { data: pings } = await supabase
        .from('pings')
        .select('hashtags, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
    
    const hashtagCounts = {};
    
    pings.forEach(ping => {
        if (ping.hashtags) {
            ping.hashtags.split(',').forEach(tag => {
                const cleanTag = tag.replace('#', '').trim();
                if (cleanTag) {
                    hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + 1;
                }
            });
        }
    });
    
    return Object.entries(hashtagCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count }));
}

// ===== ADVANCED SEARCH (Django-like complex queries) =====
async function handleAdvancedSearch(data, headers) {
    try {
        const { query, filters, sort, pagination } = data;
        
        let searchQuery = supabase
            .from('pings')
            .select(`
                *,
                profiles:user_id(username, email),
                votes(vote_type, user_id)
            `);
        
        // Text search
        if (query) {
            searchQuery = searchQuery.or(`text.ilike.%${query}%,hashtags.ilike.%${query}%`);
        }
        
        // Apply filters
        if (filters?.category) {
            searchQuery = searchQuery.eq('category', filters.category);
        }
        
        if (filters?.user_id) {
            searchQuery = searchQuery.eq('user_id', filters.user_id);
        }
        
        if (filters?.date_range?.start) {
            searchQuery = searchQuery.gte('created_at', filters.date_range.start);
        }
        
        if (filters?.date_range?.end) {
            searchQuery = searchQuery.lte('created_at', filters.date_range.end);
        }
        
        // Apply sorting
        if (sort?.field && sort?.direction) {
            searchQuery = searchQuery.order(sort.field, { ascending: sort.direction === 'asc' });
        } else {
            searchQuery = searchQuery.order('created_at', { ascending: false });
        }
        
        // Apply pagination
        if (pagination?.limit) {
            searchQuery = searchQuery.limit(pagination.limit);
        }
        
        if (pagination?.offset) {
            searchQuery = searchQuery.range(pagination.offset, pagination.offset + (pagination.limit || 20) - 1);
        }
        
        const { data: results, error } = await searchQuery;
        
        if (error) throw error;
        
        // Process results
        const processedResults = results.map(ping => ({
            ...ping,
            vote_count: calculateVoteCount(ping.votes),
            user_vote: getUserVote(ping.votes, data.current_user_id)
        }));
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: processedResults,
                total: processedResults.length,
                has_more: processedResults.length === (pagination?.limit || 20)
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message })
        };
    }
}

function calculateVoteCount(votes) {
    if (!votes) return 0;
    return votes.reduce((count, vote) => {
        return count + (vote.vote_type === 'upvote' ? 1 : -1);
    }, 0);
}

function getUserVote(votes, userId) {
    if (!votes || !userId) return null;
    const userVote = votes.find(vote => vote.user_id === userId);
    return userVote ? userVote.vote_type : null;
}
