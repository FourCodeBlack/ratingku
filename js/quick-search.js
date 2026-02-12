// ========================================
// QUICK SEARCH - EXPLORE PAGE
// ========================================

const QUICK_SEARCH_SCRIPT_ID = 'quick-search-explore';
if (window[QUICK_SEARCH_SCRIPT_ID]) {
    console.warn('⚠️ Quick search already loaded');
} else {
    window[QUICK_SEARCH_SCRIPT_ID] = true;

    // ========================================
    // CONSTANTS
    // ========================================

    const SEMENTARAIMG = "https://i.pinimg.com/originals/f3/d0/19/f3d019284cfaaf4d093941ecb0a3ea40.gif";
    const SUPABASE_URL = "https://aervhwynaxjyzqeiijca.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcnZod3luYXhqeXpxZWlpamNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNTAxNTcsImV4cCI6MjA4MzkyNjE1N30.iV8wkRk4_u58kdXyYcaOdN2Pc_8lNP3-1w6oFTo45Ew";

    // ========================================
    // STATE
    // ========================================

    const quickSearchState = {
        allContent: [],
        isLoading: false,
        isFetched: false
    };

    // ========================================
    // DOM ELEMENTS
    // ========================================

    const quickSearchInput = document.getElementById('quickSearchInput');
    const quickSearchResults = document.getElementById('quickSearchResults');

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
        
        return escapedText.replace(regex, '<span class="search-highlight-text">$1</span>');
    }

    // ========================================
    // FETCH CONTENT
    // ========================================

    async function fetchQuickSearchContent() {
        if (quickSearchState.isFetched || quickSearchState.isLoading) {
            return;
        }

        quickSearchState.isLoading = true;

        try {
            console.log('📥 Fetching content for quick search...');

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

            // Fetch ratings
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
                    console.error(`Error fetching rating for ${item.id}:`, error);
                    return {
                        ...item,
                        avgRating: null,
                        hasRating: false
                    };
                }
            }));

            quickSearchState.allContent = contentWithRatings;
            quickSearchState.isFetched = true;

            console.log(`✅ Quick search loaded ${quickSearchState.allContent.length} items`);

        } catch (error) {
            console.error('❌ Error fetching quick search content:', error);
        } finally {
            quickSearchState.isLoading = false;
        }
    }

    // ========================================
    // SEARCH FUNCTION
    // ========================================

    function performQuickSearch(query) {
        if (!query || query.length < 2) {
            quickSearchResults.style.display = 'none';
            return;
        }

        const normalizedQuery = normalizeString(query);

        // Search
        const results = quickSearchState.allContent.filter(item => {
            const title = normalizeString(item.title || '');
            const desc = normalizeString(item.description || '');
            const type = normalizeString(item.type || '');

            return title.includes(normalizedQuery) || 
                   desc.includes(normalizedQuery) || 
                   type.includes(normalizedQuery);
        });

        // Sort by relevance
        results.sort((a, b) => {
            const aTitle = normalizeString(a.title || '');
            const bTitle = normalizeString(b.title || '');

            const aTitleMatch = aTitle.includes(normalizedQuery);
            const bTitleMatch = bTitle.includes(normalizedQuery);

            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;

            if (a.hasRating && !b.hasRating) return -1;
            if (!a.hasRating && b.hasRating) return 1;

            if (a.hasRating && b.hasRating) {
                return parseFloat(b.avgRating) - parseFloat(a.avgRating);
            }

            return 0;
        });

        renderQuickResults(results.slice(0, 5), query); // Show max 5 results
    }

    // ========================================
    // RENDER RESULTS
    // ========================================

    function renderQuickResults(results, query) {
        if (results.length === 0) {
            quickSearchResults.innerHTML = `
                <div class="quick-no-results">
                    <h4>Tidak ada hasil</h4>
                    <p>Coba kata kunci lain atau lihat semua konten</p>
                    <a href="search.html?q=${encodeURIComponent(query)}" class="quick-view-all">
                        Pencarian Lengkap →
                    </a>
                </div>
            `;
        } else {
            const resultsHtml = results.map(item => {
                const img = item.images?.[0]?.image_url || SEMENTARAIMG;
                const rating = item.avgRating ?? "?";
                const title = highlightText(item.title, query);
                const desc = highlightText(item.description || 'No description', query);

                return `
                    <div class="quick-result-item" onclick="goToDetail(${item.id})">
                        <img src="${img}" alt="${escapeHtml(item.title)}" class="quick-result-img">
                        <div class="quick-result-info">
                            <div class="quick-result-title">${title}</div>
                            <div class="quick-result-desc">${desc}</div>
                        </div>
                        <div class="quick-result-rating">${rating}/5.0 ★</div>
                    </div>
                `;
            }).join('');

            quickSearchResults.innerHTML = `
                ${resultsHtml}
                <div style="text-align: center; margin-top: 15px;">
                    <a href="search.html?q=${encodeURIComponent(query)}" class="quick-view-all">
                        Lihat Semua Hasil →
                    </a>
                </div>
            `;
        }

        quickSearchResults.style.display = 'block';
    }

    function showQuickLoading() {
        quickSearchResults.innerHTML = `
            <div class="quick-search-loading">
                <div class="quick-search-spinner"></div>
                <p>Mencari...</p>
            </div>
        `;
        quickSearchResults.style.display = 'block';
    }

    // ========================================
    // EVENT LISTENERS
    // ========================================

    if (quickSearchInput) {
        // Fetch content on first focus
        quickSearchInput.addEventListener('focus', () => {
            if (!quickSearchState.isFetched && !quickSearchState.isLoading) {
                fetchQuickSearchContent();
            }
        });

        // Search with debounce
        quickSearchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();

            clearTimeout(window.quickSearchTimeout);

            if (value.length < 2) {
                quickSearchResults.style.display = 'none';
                return;
            }

            // Show loading
            if (quickSearchState.isFetched) {
                window.quickSearchTimeout = setTimeout(() => {
                    performQuickSearch(value);
                }, 300);
            } else {
                showQuickLoading();
            }
        });

        // Enter key - go to search page
        quickSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const value = e.target.value.trim();
                if (value.length >= 2) {
                    window.location.href = `search.html?q=${encodeURIComponent(value)}`;
                }
            }
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-header')) {
                quickSearchResults.style.display = 'none';
            }
        });
    }

    // ========================================
    // GLOBAL FUNCTION
    // ========================================

    window.goToDetail = function(contentId) {
        window.location.href = `detail.html?id=${contentId}`;
    };

    console.log('✅ Quick search initialized');
}