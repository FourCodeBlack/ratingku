// ========================================
// ALL RATINGS - JAVASCRIPT WITH SUPABASE
// ========================================

// Import Supabase Client
import { supabase } from './supabase-client.js';

// Global Variables
let allRatings = [];
let allUsers = [];
let filteredRatings = [];
let currentFilter = 'recent';
let currentRatingFilter = 'all';
let searchQuery = '';

// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const usersList = document.getElementById('usersList');
const ratingsContainer = document.getElementById('ratingsContainer');
const searchInput = document.getElementById('searchInput');
const sortFilter = document.getElementById('sortFilter');
const ratingFilter = document.getElementById('ratingFilter');
const btnRefresh = document.getElementById('btnRefresh');
const userModal = document.getElementById('userModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const toast = document.getElementById('toast');

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

async function initializeApp() {
    try {
        showLoading(true);
        await fetchAllData();
        renderUsers();
        filterAndRenderRatings();
        updateStats();
        showLoading(false);
        showToast('Data loaded successfully!');
    } catch (error) {
        console.error('Initialization error:', error);
        showLoading(false);
        showToast('Error loading data. Please try again.', 'error');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Search input with debounce
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchQuery = e.target.value.toLowerCase().trim();
            filterAndRenderRatings();
        }, 300); // Debounce 300ms
    });

    // Sort filter
    sortFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        filterAndRenderRatings();
    });

    // Rating filter
    ratingFilter.addEventListener('change', (e) => {
        currentRatingFilter = e.target.value;
        filterAndRenderRatings();
    });

    // Refresh button
    btnRefresh.addEventListener('click', async () => {
        showLoading(true);
        await initializeApp();
    });

    // Modal close
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && userModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// ========================================
// DATA FETCHING FROM SUPABASE
// ========================================

async function fetchAllData() {
    try {
        // Fetch ratings dengan join ke profiles, photo_profiles, dan content
        const { data: ratingsData, error: ratingsError } = await supabase
            .from('rating')
            .select(`
                id,
                user_id,
                content_id,
                rating,
                review,
                created_at,
                profiles (
                    username,
                    photo_profiles (url)
                ),
                content (title)
            `)
            .order('created_at', { ascending: false });

        if (ratingsError) {
            console.error('Supabase fetch error:', ratingsError);
            throw new Error('Failed to fetch ratings from Supabase');
        }

        allRatings = ratingsData.map(rating => ({
            id: rating.id,
            user_id: rating.user_id,
            user_name: rating.profiles?.username || 'Unknown User',
            user_photo: rating.profiles?.photo_profiles?.url || null,
            content_id: rating.content_id,
            content_title: rating.content?.title || 'Unknown Content',
            rating: rating.rating,
            review: rating.review || '',
            created_at: rating.created_at
        }));

        // Group ratings by user
        const usersMap = new Map();
        allRatings.forEach(rating => {
            if (!usersMap.has(rating.user_id)) {
                usersMap.set(rating.user_id, {
                    user_id: rating.user_id,
                    user_name: rating.user_name,
                    user_photo: rating.user_photo,
                    ratings: []
                });
            }
            usersMap.get(rating.user_id).ratings.push(rating);
        });

        allUsers = Array.from(usersMap.values()).map(user => ({
            ...user,
            totalRatings: user.ratings.length,
            avgRating: (user.ratings.reduce((sum, r) => sum + r.rating, 0) / user.ratings.length).toFixed(1)
        }));

        filteredRatings = [...allRatings];

    } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Failed to load data from database', 'error');
        throw error;
    }
}

// ========================================
// RENDER FUNCTIONS
// ========================================

function renderUsers() {
    usersList.innerHTML = '';
    
    // Sort users by total ratings
    const sortedUsers = [...allUsers].sort((a, b) => b.totalRatings - a.totalRatings);

    sortedUsers.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        
        // Generate avatar HTML
        const avatarHTML = user.user_photo 
            ? `<div class="user-avatar" style="background-image: url('${user.user_photo}'); background-size: cover; background-position: center;"></div>`
            : `<div class="user-avatar"><i class="fas fa-user"></i></div>`;
        
        userCard.innerHTML = `
            ${avatarHTML}
            <div class="user-details">
                <div class="user-name">${escapeHtml(user.user_name)}</div>
                <div class="user-stats-inline">
                    ${user.totalRatings} rating${user.totalRatings > 1 ? 's' : ''}
                    <span class="rating-badge">
                        <i class="fas fa-star"></i>
                        ${user.avgRating}
                    </span>
                </div>
            </div>
        `;

        userCard.addEventListener('click', () => {
            showUserModal(user);
        });

        usersList.appendChild(userCard);
    });

    // Update user count
    document.getElementById('userCount').textContent = `${allUsers.length} user${allUsers.length > 1 ? 's' : ''}`;
}

function renderRatings() {
    ratingsContainer.innerHTML = '';

    if (filteredRatings.length === 0) {
        const emptyStateHTML = searchQuery || currentRatingFilter !== 'all'
            ? `
                <div class="empty-state">
                    <i class="fas fa-search" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <h3>No ratings found</h3>
                    <p>No results match your search or filter criteria</p>
                    <button onclick="clearFilters()" style="
                        margin-top: 16px;
                        padding: 10px 20px;
                        background: #007bff;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    ">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                </div>
            `
            : `
                <div class="empty-state">
                    <i class="fas fa-star" style="font-size: 48px; color: #ccc; margin-bottom: 16px;"></i>
                    <h3>No ratings yet</h3>
                    <p>Be the first to rate some content!</p>
                </div>
            `;
        
        ratingsContainer.innerHTML = emptyStateHTML;
        return;
    }

    filteredRatings.forEach(rating => {
        const ratingCard = document.createElement('div');
        ratingCard.className = 'rating-card';
        
        // Generate avatar HTML
        const avatarHTML = rating.user_photo 
            ? `<div class="rating-avatar" style="background-image: url('${rating.user_photo}'); background-size: cover; background-position: center;"></div>`
            : `<div class="rating-avatar"><i class="fas fa-user"></i></div>`;
        
        ratingCard.innerHTML = `
            <div class="rating-header">
                <div class="rating-user-info" data-user-id="${rating.user_id}">
                    ${avatarHTML}
                    <div class="rating-username">${escapeHtml(rating.user_name)}</div>
                </div>
                <div class="rating-stars">
                    ${generateStars(rating.rating)}
                </div>
            </div>
            <div class="rating-content">
                <div class="rating-content-title">
                    <i class="fas fa-film"></i>
                    ${escapeHtml(rating.content_title)}
                </div>
                ${rating.review ? `<div class="rating-review">${escapeHtml(rating.review)}</div>` : ''}
            </div>
            <div class="rating-footer">
                <div class="rating-date">
                    <i class="far fa-clock"></i>
                    ${formatDate(rating.created_at)}
                </div>
            </div>
        `;

        // Add click event to user info
        const userInfo = ratingCard.querySelector('.rating-user-info');
        userInfo.addEventListener('click', (e) => {
            e.stopPropagation();
            const user = allUsers.find(u => u.user_id === rating.user_id);
            if (user) showUserModal(user);
        });

        ratingsContainer.appendChild(ratingCard);
    });
}

// ========================================
// FILTER AND RENDER
// ========================================

function filterAndRenderRatings() {
    // Start with all ratings
    filteredRatings = [...allRatings];

    // Apply search filter
    if (searchQuery && searchQuery.length > 0) {
        filteredRatings = filteredRatings.filter(rating => {
            const searchLower = searchQuery.toLowerCase();
            
            // Search in multiple fields
            const matchUsername = rating.user_name && rating.user_name.toLowerCase().includes(searchLower);
            const matchContentTitle = rating.content_title && rating.content_title.toLowerCase().includes(searchLower);
            const matchReview = rating.review && rating.review.toLowerCase().includes(searchLower);
            
            return matchUsername || matchContentTitle || matchReview;
        });
    }

    // Apply rating filter
    if (currentRatingFilter !== 'all') {
        const filterValue = parseInt(currentRatingFilter);
        if (!isNaN(filterValue)) {
            filteredRatings = filteredRatings.filter(rating => rating.rating === filterValue);
        }
    }

    // Apply sort
    switch (currentFilter) {
        case 'recent':
            // Newest first
            filteredRatings.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateB - dateA;
            });
            break;
            
        case 'oldest':
            // Oldest first
            filteredRatings.sort((a, b) => {
                const dateA = new Date(a.created_at);
                const dateB = new Date(b.created_at);
                return dateA - dateB;
            });
            break;
            
        case 'highest':
            // Highest rating first, then by date
            filteredRatings.sort((a, b) => {
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                }
                return new Date(b.created_at) - new Date(a.created_at);
            });
            break;
            
        case 'lowest':
            // Lowest rating first, then by date
            filteredRatings.sort((a, b) => {
                if (a.rating !== b.rating) {
                    return a.rating - b.rating;
                }
                return new Date(b.created_at) - new Date(a.created_at);
            });
            break;
            
        case 'most-active':
            // Sort by users with most ratings
            const userRatingsCount = {};
            allRatings.forEach(r => {
                userRatingsCount[r.user_id] = (userRatingsCount[r.user_id] || 0) + 1;
            });
            
            filteredRatings.sort((a, b) => {
                const countDiff = userRatingsCount[b.user_id] - userRatingsCount[a.user_id];
                if (countDiff !== 0) {
                    return countDiff;
                }
                // If same count, sort by date
                return new Date(b.created_at) - new Date(a.created_at);
            });
            break;
            
        default:
            // Default: recent
            filteredRatings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Update display
    renderRatings();
    updateFilteredStats();
}

// ========================================
// MODAL FUNCTIONS
// ========================================

function showUserModal(user) {
    const modalUserName = document.getElementById('modalUserName');
    const modalUserRatings = document.getElementById('modalUserRatings');
    const modalUserAvgRating = document.getElementById('modalUserAvgRating');
    const userRatingsList = document.getElementById('userRatingsList');

    modalUserName.textContent = user.user_name;
    modalUserRatings.textContent = `${user.totalRatings} rating${user.totalRatings > 1 ? 's' : ''}`;
    modalUserAvgRating.textContent = `${user.avgRating} avg rating`;

    userRatingsList.innerHTML = '';

    // Sort user's ratings by date (newest first)
    const sortedUserRatings = [...user.ratings].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
    );

    sortedUserRatings.forEach(rating => {
        const ratingItem = document.createElement('div');
        ratingItem.className = 'user-rating-item';
        ratingItem.innerHTML = `
            <div class="user-rating-header">
                <div class="content-title-modal">${escapeHtml(rating.content_title)}</div>
                <div class="rating-stars">
                    ${generateStars(rating.rating)}
                </div>
            </div>
            ${rating.review ? `<div class="rating-review">${escapeHtml(rating.review)}</div>` : ''}
            <div class="rating-date-modal">
                <i class="far fa-clock"></i> ${formatDate(rating.created_at)}
            </div>
        `;
        userRatingsList.appendChild(ratingItem);
    });

    userModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    userModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ========================================
// UPDATE STATS
// ========================================

function updateStats() {
    const totalUsers = allUsers.length;
    const totalRatings = allRatings.length;
    const avgRating = totalRatings > 0 
        ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1)
        : '0.0';

    document.getElementById('totalUsers').textContent = totalUsers;
    document.getElementById('totalRatings').textContent = totalRatings;
    document.getElementById('avgRating').textContent = avgRating;
}

function updateFilteredStats() {
    // Optional: Update stats based on filtered results
    const filteredCount = filteredRatings.length;
    
    if (filteredCount !== allRatings.length) {
        // Show filtered count
        const ratingsContainer = document.getElementById('ratingsContainer');
        const existingBadge = document.querySelector('.filter-badge');
        
        if (existingBadge) {
            existingBadge.remove();
        }
        
        if (filteredCount > 0) {
            const filterBadge = document.createElement('div');
            filterBadge.className = 'filter-badge';
            filterBadge.style.cssText = `
                padding: 8px 16px;
                background: #f0f0f0;
                border-radius: 8px;
                margin-bottom: 16px;
                font-size: 14px;
                color: #666;
            `;
            filterBadge.innerHTML = `
                <i class="fas fa-filter"></i>
                Showing ${filteredCount} of ${allRatings.length} ratings
                ${searchQuery ? `<span style="color: #007bff; margin-left: 8px;">Search: "${escapeHtml(searchQuery)}"</span>` : ''}
                ${currentRatingFilter !== 'all' ? `<span style="color: #007bff; margin-left: 8px;">Rating: ${currentRatingFilter} stars</span>` : ''}
            `;
            ratingsContainer.parentElement.insertBefore(filterBadge, ratingsContainer);
        }
    } else {
        // Remove badge if showing all
        const existingBadge = document.querySelector('.filter-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, m => map[m]);
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star empty"></i>';
        }
    }
    return stars;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours === 0) {
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        });
    }
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.remove('hidden');
    } else {
        loadingOverlay.classList.add('hidden');
    }
}

function showToast(message, type = 'success') {
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Clear all filters
window.clearFilters = function() {
    searchQuery = '';
    currentRatingFilter = 'all';
    currentFilter = 'recent';
    
    // Reset UI
    searchInput.value = '';
    sortFilter.value = 'recent';
    ratingFilter.value = 'all';
    
    // Re-render
    filterAndRenderRatings();
    showToast('Filters cleared', 'success');
};

// ========================================
// REALTIME SUBSCRIPTION (OPTIONAL)
// ========================================

// Enable realtime updates ketika ada rating baru
function setupRealtimeSubscription() {
    const ratingsSubscription = supabase
        .channel('ratings-channel')
        .on(
            'postgres_changes',
            {
                event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
                schema: 'public',
                table: 'rating'
            },
            (payload) => {
                console.log('Realtime change detected:', payload);
                
                // Refresh data when change detected
                if (payload.eventType === 'INSERT' || 
                    payload.eventType === 'UPDATE' || 
                    payload.eventType === 'DELETE') {
                    showToast('New rating detected! Refreshing...');
                    initializeApp();
                }
            }
        )
        .subscribe();

    return ratingsSubscription;
}

// Call this function to enable realtime updates
// Uncomment the line below in initializeApp() if you want realtime
// setupRealtimeSubscription();

// ========================================
// ADDITIONAL SUPABASE FUNCTIONS
// ========================================

// Function to fetch user's ratings only
async function fetchUserRatings(userId) {
    try {
        const { data, error } = await supabase
            .from('rating')
            .select(`
                id,
                user_id,
                content_id,
                rating,
                review,
                created_at,
                profiles (
                    username,
                    photo_profiles (url)
                ),
                content (title)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user ratings:', error);
        return [];
    }
}

// Function to get statistics
async function fetchStatistics() {
    try {
        // Get total ratings count
        const { count: totalRatings, error: countError } = await supabase
            .from('rating')
            .select('*', { count: 'exact', head: true });

        if (countError) throw countError;

        const { data: avgData, error: avgError } = await supabase
            .from('rating')
            .select('rating');

        if (avgError) throw avgError;

        const avgRating = avgData.length > 0
            ? (avgData.reduce((sum, r) => sum + r.rating, 0) / avgData.length).toFixed(1)
            : 0;

        // Get unique users count
        const { data: usersData, error: usersError } = await supabase
            .from('rating')
            .select('user_id');

        if (usersError) throw usersError;

        const uniqueUsers = new Set(usersData.map(r => r.user_id)).size;

        return {
            totalRatings,
            avgRating,
            totalUsers: uniqueUsers
        };
    } catch (error) {
        console.error('Error fetching statistics:', error);
        return {
            totalRatings: 0,
            avgRating: 0,
            totalUsers: 0
        };
    }
}