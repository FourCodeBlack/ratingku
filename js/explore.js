// ========================================
// EXPLORE PAGE - CONTENT LOADER
// ========================================

const parent = document.querySelector(".content-container");

// ✅ GLOBAL FLAGS untuk prevent multiple execution
const SCRIPT_ID = 'explore-content-loader';
if (window[SCRIPT_ID]) {
    console.warn('⚠️ Script already loaded, skipping initialization');
    throw new Error('Script already initialized');
}
window[SCRIPT_ID] = true;

// ========================================
// CARD BUILDER
// ========================================

function makeCard(id, urlImage, title, description, rating){
    const escapedTitle = escapeHtml(title);
    const escapedDesc = escapeHtml(description);
    
    const card = `<div class="review-card" data-id="${id}" style="--image-url: url(${urlImage})">
                    <div class="content-card">
                        <div class="darken-card"></div>
                        <h1 class="rating">${rating}/5.0 ★</h1>
                        <p class="deskripsi">${escapedDesc}</p>
                        <h2 class="judul">${escapedTitle}</h2>   
                        <div class="open">
                            <button class="button-open" onclick="goToDetail(${id})">Lihat</button>
                        </div>
                    </div>
                </div>`;
    return card;
}

function renderCard(fullCard, category){
    // ✅ Double check: apakah kategori sudah ada
    const existingCategory = parent.querySelector(`[data-category="${category}"]`);
    
    if (existingCategory) {
        console.warn(`⚠️ Category "${category}" already rendered, skipping...`);
        return;
    }
    
    const content = `<div class="content" data-category="${category}">
                    <h1>${category}</h1>
                    <div class="review-container">
                        ${fullCard}
                    </div>
                </div>`;
    
    parent.insertAdjacentHTML('beforeend', content);
    console.log(`✅ Rendered category: ${category}`);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

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
    loadedCategories: new Set(),
    isInitialized: false,
    isFetching: false
};

// ========================================
// FETCH DATA
// ========================================

async function fetchData(category){
    // ✅ Prevent duplicate fetch
    if (state.loadedCategories.has(category)) {
        console.log(`✅ Category "${category}" already loaded`);
        return;
    }
    
    state.loadedCategories.add(category);
    
    try {
        console.log(`📥 Fetching category: ${category}`);
        
        // Fetch content
        const contentRes = await fetch(
            `${SUPABASE_URL}/rest/v1/content?type=eq.${category}&select=id,title,description,images(image_url)`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        
        if (!contentRes.ok) throw new Error(`HTTP ${contentRes.status}`);
        
        const data = await contentRes.json();
        
        if (!data || data.length === 0) {
            console.log(`⚠️ No content found for category: ${category}`);
            state.loadedCategories.delete(category);
            return;
        }
        
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
        
        // Sort: yang punya rating dulu dengan random order
        contentWithRatings.sort((a, b) => {
            if (a.hasRating && !b.hasRating) return -1;
            if (!a.hasRating && b.hasRating) return 1;
            return Math.random() - 0.5;
        });
        
        // Build cards
        let fullCard = "";
        contentWithRatings.forEach(item => {
            const img = item.images?.[0]?.image_url || SEMENTARAIMG;
            const desc = item.description ?? "No description yet...";
            const rating = item.avgRating ?? "?";
            
            fullCard += makeCard(item.id, SEMENTARAIMG, item.title, desc, rating);
        });
        
        // Render
        renderCard(fullCard, category);
        
    } catch (error) {
        console.error(`❌ Error fetching ${category}:`, error);
        state.loadedCategories.delete(category);
    }
}

// ========================================
// INITIALIZE
// ========================================

async function initializeContent() {
    // ✅ Prevent multiple initialization
    if (state.isInitialized) {
        console.warn('⚠️ Content already initialized');
        return;
    }
    
    if (state.isFetching) {
        console.warn('⚠️ Fetch already in progress');
        return;
    }
    
    state.isInitialized = true;
    state.isFetching = true;
    
    try {
        console.log('🚀 Initializing content loader...');
        
        // ✅ Clear existing content
        if (parent) {
            parent.innerHTML = '';
        } else {
            console.error('❌ .content-container not found!');
            return;
        }
        
        state.loadedCategories.clear();
        
        // Fetch categories
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/content?select=type`,
            {
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`
                }
            }
        );
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        const rawTypes = data.map(item => item.type);
        const types = [...new Set(rawTypes)];
        
        console.log(`📦 Found ${types.length} categories:`, types);
        
        // Fetch all categories
        await Promise.all(types.map(type => fetchData(type)));
        
        // Hide loading
        const loadingGif = document.querySelector('.loading-gif');
        if (loadingGif) {
            loadingGif.style.display = 'none';
        }
        
        // Initialize scroll
        if (typeof initSmoothScroll === 'function') {
            initSmoothScroll();
        }
        
        console.log('✅ All categories loaded!');
        
    } catch (error) {
        console.error('❌ Error loading content:', error);
        
        const loadingGif = document.querySelector('.loading-gif');
        if (loadingGif) {
            loadingGif.style.display = 'none';
        }
        
        if (parent) {
            parent.innerHTML = '<div style="text-align: center; padding: 50px; color: #fff;">Failed to load content. Please refresh the page.</div>';
        }
        
        // Reset flags untuk allow retry
        state.isInitialized = false;
        
    } finally {
        state.isFetching = false;
    }
}

// ========================================
// START
// ========================================

// ✅ Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContent, { once: true });
} else {
    initializeContent();
}

// ========================================
// GLOBAL FUNCTIONS
// ========================================

window.goToDetail = function(contentId) {
    window.location.href = `detail.php?id=${contentId}`;
};

// ========================================
// DEBUG HELPERS
// ========================================

window.debugExplore = function() {
    console.log('=== DEBUG INFO ===');
    console.log('Loaded categories:', Array.from(state.loadedCategories));
    console.log('Is initialized:', state.isInitialized);
    console.log('Is fetching:', state.isFetching);
    console.log('Rendered categories:', parent.querySelectorAll('[data-category]').length);
    console.log('Total cards:', parent.querySelectorAll('.review-card').length);
};