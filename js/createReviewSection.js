        const genres = {
            FILM: ["Action", "Romance", "Horror", "Comedy", "Sci-Fi", "Drama"],
            MUSIK: ["Pop", "Rock", "Jazz", "Hip Hop", "Classical", "Electronic"],
            ANIMASI: ["Shonen", "Slice of Life", "Fantasy", "Mecha", "Romance", "Horror"]
        };

        // State
        let currentStep = 1;
        let selectedCategory = null;
        let selectedGenre = null;
        let selectedRating = 0;
        let uploadedImage = null;

        // Elements
        const progressFill = document.getElementById('progressFill');
        const categorySection = document.getElementById('categorySection');
        const genreSection = document.getElementById('genreSection');
        const formSection = document.getElementById('formSection');
        const categoryCards = document.querySelectorAll('.category-card');
        const btnNextCategory = document.getElementById('btnNextCategory');
        const btnBackGenre = document.getElementById('btnBackGenre');
        const btnNextGenre = document.getElementById('btnNextGenre');
        const btnBackForm = document.getElementById('btnBackForm');
        const genreGrid = document.getElementById('genreGrid');
        const genreSubtitle = document.getElementById('genreSubtitle');
        const formSubtitle = document.getElementById('formSubtitle');
        const coverInput = document.getElementById('coverInput');
        const previewImage = document.getElementById('previewImage');
        const stars = document.querySelectorAll('.star');
        const reviewForm = document.getElementById('reviewForm');

        // Update progress bar
        function updateProgress() {
            const progress = (currentStep / 3) * 100;
            progressFill.style.width = progress + '%';
        }

        // Step 1: Category Selection
        categoryCards.forEach(card => {
            card.addEventListener('click', function() {
                categoryCards.forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedCategory = this.dataset.category;
                btnNextCategory.disabled = false;
            });
        });

        btnNextCategory.addEventListener('click', function() {
            if (selectedCategory) {
                currentStep = 2;
                updateProgress();
                loadGenres();
                transitionSection(categorySection, genreSection);
            }
        });

        // Step 2: Genre Selection
        function loadGenres() {
            genreGrid.innerHTML = '';
            genreSubtitle.textContent = `Pilih genre untuk ${selectedCategory}`;
            
            genres[selectedCategory].forEach(genre => {
                const card = document.createElement('div');
                card.className = 'genre-card';
                card.innerHTML = `<div class="genre-name">${genre}</div>`;
                card.addEventListener('click', function() {
                    document.querySelectorAll('.genre-card').forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedGenre = genre;
                    btnNextGenre.disabled = false;
                });
                genreGrid.appendChild(card);
            });
        }

        btnBackGenre.addEventListener('click', function() {
            currentStep = 1;
            updateProgress();
            transitionSection(genreSection, categorySection);
        });

        btnNextGenre.addEventListener('click', function() {
            if (selectedGenre) {
                currentStep = 3;
                updateProgress();
                formSubtitle.textContent = `${selectedCategory} - ${selectedGenre}`;
                transitionSection(genreSection, formSection);
            }
        });

        // Step 3: Form
        btnBackForm.addEventListener('click', function() {
            currentStep = 2;
            updateProgress();
            transitionSection(formSection, genreSection);
        });

        // Image upload
        coverInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                    uploadedImage = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });

        // Star rating
        stars.forEach(star => {
            star.addEventListener('click', function() {
                selectedRating = parseInt(this.dataset.rating);
                stars.forEach((s, index) => {
                    if (index < selectedRating) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
            });

            star.addEventListener('mouseenter', function() {
                const rating = parseInt(this.dataset.rating);
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.style.color = '#FFD700';
                    } else {
                        s.style.color = '#ddd';
                    }
                });
            });
        });

        document.getElementById('starRating').addEventListener('mouseleave', function() {
            stars.forEach((s, index) => {
                if (index < selectedRating) {
                    s.style.color = '#FFD700';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });

        // Form submit
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const reviewData = {
                category: selectedCategory,
                genre: selectedGenre,
                rating: selectedRating,
                cover: uploadedImage,
                review: document.getElementById('reviewText').value
            };

            console.log('Review Data:', reviewData);
            alert('Review berhasil disubmit! Cek console untuk melihat data.');
            
            // Reset form
            resetForm();
        });

        // Transition between sections
        function transitionSection(fromSection, toSection) {
            fromSection.classList.add('fade-out');
            
            setTimeout(() => {
                fromSection.classList.remove('active', 'fade-out');
                toSection.classList.add('active');
            }, 500);
        }

        // Reset form
        function resetForm() {
            currentStep = 1;
            selectedCategory = null;
            selectedGenre = null;
            selectedRating = 0;
            uploadedImage = null;
            
            updateProgress();
            categoryCards.forEach(c => c.classList.remove('selected'));
            stars.forEach(s => s.classList.remove('active'));
            previewImage.style.display = 'none';
            reviewForm.reset();
            btnNextCategory.disabled = true;
            
            transitionSection(formSection, categorySection);
        }

        // Initialize
        updateProgress();