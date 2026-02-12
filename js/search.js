// ========================================
// SEARCH FEATURE - INTEGRATED WITH EXPLORE
// ========================================

const SCRIPT_ID = 'search-feature';
if (window[SCRIPT_ID]) {
    console.warn('⚠️ Search script already loaded');
    throw new Error('Search script already initialized');
}
window[SCRIPT_ID] = true;

// ========================================
// CONSTANTS
// ========================================

const SEMENTARAIMG = "https://i.pinimg.com/originals/f3/d0/19/f3d019284cfaaf4d093941ecb0a3ea40.gif";
const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";

// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    allContent: [],
    searchResults: [],
    isLoading: false,
    isInitialized: false,
    currentQuery: ''
};

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    searchInput: document.getElementById('searchInput'),
    searchButton: document.getElementById('searchButton'),
    clearButton: document.getElementById('clearButton'),
    searchInfo: document.getElementById('searchInfo'),
    loadingSearch: document.getElementById('loadingSearch'),
    searchResults: document.getElementById('searchResults'),
    searchResultsContainer: document.getElementById('searchResultsContainer'),
    allContent: document.getElementById('allContent')
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function normalizeString(str) {
    return str.toLowerCase().trim();
}

function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    
    const escapedText = escapeHtml(text);
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    
    return escapedText.replace(regex, '<mark style="background: #ffd700; padding: 2px 4px; border-radius: 3px;">$1</mark>');
}

// ========================================
// CARD BUILDER
// ========================================

function makeCard(content, isSearchResult = false, query = '') {
    const img = content.images?.[0]?.image_url || SEMENTARAIMG;
    const desc = content.description ?? "No description yet...";
    const rating = content.avgRating ?? "?";
    
    const title = isSearchResult && query 
        ? highlightText(content.title, query)
        : escapeHtml(content.title);
    
    const description = isSearchResult && query
        ? highlightText(desc, query)
        : escapeHtml(desc);
    
    const highlightClass = isSearchResult ? 'search-highlight' : '';
    
    return `<div class="review-card ${highlightClass}" data-id="${content.id}" style="--image-url: url(${img})">
                <div class="content-card">
                    <div class="darken-card"></div>
                    <h1 class="rating">${rating}/5.0 ★</h1>
                    <p class="deskripsi">${description}</p>
                    <h2 class="judul">${title}</h2>   
                    <div class="open">
                        <button class="button-open" onclick="goToDetail(${content.id})">Lihat</button>
                    </div>
                </div>
            </div>`;
}

// ========================================
// FETCH DATA
// ========================================

async function fetchAllContent() {
    if (state.isLoading) return;
    
    state.isLoading = true;
    showLoading(true);
    
    try {
        console.log('📥 Fetching all content...');
        
        // Fetch all content
        const contentRes = await fetch(
            `${SUPABASE_URL}/rest/v1/content?select=id,title,description,type,images(image_url)`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        
        if (!contentRes.ok) throw new Error(`HTTP ${contentRes.status}`);
        
        const data = await contentRes.json();
        
        // Fetch ratings untuk setiap content
        const contentWithRatings = await Promise.all(data.map(async item => {
            try {
                const ratingRes = await fetch(
                    `${SUPABASE_URL}/rest/v1/rating?content_id=eq.${item.id}&select=rating`,
                    {
                        headers: {
                            apikey: SUPABASE_KEY,
                            Authorization: `Bearer ${SUPABASE_KEY}`
                        }
                    }
                );
                
                const ratings = await ratingRes.json();
                
                let avgRating = null;
                if (ratings && ratings.length > 0) {
                    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
                    avgRating = (sum / ratings.length).toFixed(1);
                }
                
                return {
                    ...item,
                    avgRating: avgRating,
                    hasRating: avgRating !== null
                };
            } catch (error) {
                console.error(`Error fetching rating for content ${item.id}:`, error);
                return {
                    ...item,
                    avgRating: null,
                    hasRating: false
                };
            }
        }));
        
        state.allContent = contentWithRatings;
        console.log(`✅ Loaded ${state.allContent.length} items`);
        
        renderAllContent();
        
    } catch (error) {
        console.error('❌ Error fetching content:', error);
        showError();
    } finally {
        state.isLoading = false;
        showLoading(false);
        state.isInitialized = true;
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

function performSearch(query) {
    if (!query || query.length < 2) {
        clearSearch();
        return;
    }
    
    state.currentQuery = query;
    const normalizedQuery = normalizeString(query);
    
    console.log(`🔍 Searching for: "${query}"`);
    
    // Search in title, description, and type
    state.searchResults = state.allContent.filter(item => {
        const title = normalizeString(item.title || '');
        const desc = normalizeString(item.description || '');
        const type = normalizeString(item.type || '');
        
        return title.includes(normalizedQuery) || 
               desc.includes(normalizedQuery) || 
               type.includes(normalizedQuery);
    });
    
    // Sort results: prioritize title matches, then by rating
    state.searchResults.sort((a, b) => {
        const aTitle = normalizeString(a.title || '');
        const bTitle = normalizeString(b.title || '');
        
        const aTitleMatch = aTitle.includes(normalizedQuery);
        const bTitleMatch = bTitle.includes(normalizedQuery);
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        // If both match title or both don't, sort by rating
        if (a.hasRating && !b.hasRating) return -1;
        if (!a.hasRating && b.hasRating) return 1;
        
        if (a.hasRating && b.hasRating) {
            return parseFloat(b.avgRating) - parseFloat(a.avgRating);
        }
        
        return 0;
    });
    
    console.log(`📊 Found ${state.searchResults.length} results`);
    
    renderSearchResults();
    updateSearchInfo();
}

function clearSearch() {
    state.currentQuery = '';
    state.searchResults = [];
    elements.searchInput.value = '';
    elements.clearButton.style.display = 'none';
    elements.searchResults.style.display = 'none';
    elements.allContent.style.display = 'block';
    updateSearchInfo();
    console.log('🧹 Search cleared');
}

// ========================================
// RENDER FUNCTIONS
// ========================================

function renderSearchResults() {
    if (state.searchResults.length === 0) {
        elements.searchResultsContainer.innerHTML = `
            <div class="no-results">
                <h3>Tidak ada hasil ditemukan</h3>
                <p>Coba kata kunci lain atau periksa ejaan Anda</p>
            </div>
        `;
    } else {
        const cardsHtml = state.searchResults
            .map(item => makeCard(item, true, state.currentQuery))
            .join('');
        
        elements.searchResultsContainer.innerHTML = cardsHtml;
    }
    
    elements.searchResults.style.display = 'block';
    elements.allContent.style.display = state.searchResults.length > 0 ? 'block' : 'none';
    
    // Scroll to results
    elements.searchResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAllContent() {
    if (state.allContent.length === 0) {
        elements.allContent.innerHTML = '<div style="color: white; text-align: center; padding: 50px;">No content available.</div>';
        return;
    }
    
    // Group by type
    const grouped = {};
    state.allContent.forEach(item => {
        const type = item.type || 'Lainnya';
        if (!grouped[type]) {
            grouped[type] = [];
        }
        grouped[type].push(item);
    });
    
    // Sort each category: rated items first with random order
    Object.keys(grouped).forEach(type => {
        grouped[type].sort((a, b) => {
            if (a.hasRating && !b.hasRating) return -1;
            if (!a.hasRating && b.hasRating) return 1;
            return Math.random() - 0.5;
        });
    });
    
    // Render categories
    const categoriesHtml = Object.keys(grouped).map(type => {
        const cardsHtml = grouped[type]
            .map(item => makeCard(item, false))
            .join('');
        
        return `<div class="content" data-category="${type}">
                    <h1>${type}</h1>
                    <div class="review-container">
                        ${cardsHtml}
                    </div>
                </div>`;
    }).join('');
    
    elements.allContent.innerHTML = categoriesHtml;
    console.log(`✅ Rendered ${Object.keys(grouped).length} categories`);
}

// ========================================
// UI FUNCTIONS
// ========================================

function showLoading(show) {
    elements.loadingSearch.style.display = show ? 'block' : 'none';
}

function showError() {
    elements.allContent.innerHTML = `
        <div style="background: rgba(255, 255, 255, 0.9); padding: 50px; border-radius: 15px; text-align: center;">
            <h3 style="color: #ff4757; margin-bottom: 10px;">Gagal memuat konten</h3>
            <p style="color: #666;">Silakan refresh halaman atau coba lagi nanti.</p>
        </div>
    `;
}

function updateSearchInfo() {
    if (!state.currentQuery) {
        elements.searchInfo.textContent = `Total: ${state.allContent.length} konten tersedia`;
        elements.searchInfo.classList.remove('active');
    } else {
        elements.searchInfo.textContent = `Ditemukan ${state.searchResults.length} hasil untuk "${state.currentQuery}"`;
        elements.searchInfo.classList.add('active');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        const value = e.target.value.trim();
        
        // Show/hide clear button
        elements.clearButton.style.display = value ? 'block' : 'none';
        
        // Real-time search with debounce
        clearTimeout(window.searchTimeout);
        window.searchTimeout = setTimeout(() => {
            if (value.length >= 2) {
                performSearch(value);
            } else if (value.length === 0) {
                clearSearch();
            }
        }, 300);
    });
    
    // Search on Enter
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const value = e.target.value.trim();
            if (value.length >= 2) {
                performSearch(value);
            }
        }
    });
    
    // Search button
    elements.searchButton.addEventListener('click', () => {
        const value = elements.searchInput.value.trim();
        if (value.length >= 2) {
            performSearch(value);
        }
    });
    
    // Clear button
    elements.clearButton.addEventListener('click', () => {
        clearSearch();
        elements.searchInput.focus();
    });
    
    console.log('✅ Event listeners setup complete');
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================

window.goToDetail = function(contentId) {
    window.location.href = `detail.html?id=${contentId}`;
};

// ========================================
// INITIALIZATION
// ========================================

async function initialize() {
    if (state.isInitialized) {
        console.warn('⚠️ Already initialized');
        return;
    }
    
    console.log('🚀 Initializing search feature...');
    
    setupEventListeners();
    await fetchAllContent();
    
    // Check for URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const queryParam = urlParams.get('q');
    
    if (queryParam) {
        elements.searchInput.value = queryParam;
        elements.clearButton.style.display = 'block';
        performSearch(queryParam);
    }
    
    updateSearchInfo();
    
    console.log('✅ Search feature ready!');
}

// ========================================
// START
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
} else {
    initialize();
}

// ========================================
// DEBUG HELPERS
// ========================================

window.debugSearch = function() {
    console.log('=== SEARCH DEBUG INFO ===');
    console.log('Total content:', state.allContent.length);
    console.log('Search results:', state.searchResults.length);
    console.log('Current query:', state.currentQuery);
    console.log('Is initialized:', state.isInitialized);
    console.log('Is loading:', state.isLoading);
};