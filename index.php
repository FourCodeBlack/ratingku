 <!DOCTYPE html>
 <html>

 <head>
     <title>Ratingku</title>
     <link rel="stylesheet" href="css/universal.css">
     <link rel="stylesheet" href="css/styleIndex.css">
     <link rel="stylesheet" href="css/homepage_section.css">
 </head>

 <body>
     <div>
         <nav class="mainnavbar">
             <div class="logo">
                 <img src="img/logog3.png" width="20px" height="20px">
                 <h1 class="title shine-effect">RATINGKU</h1>
             </div>
             <ul>
                 <li><a href="index.php">Profile</a></li>
                 <li><a href="myReview.php">Your Review</a></li>
                 <li><a href="categories.php">Categories</a></li>
                 <li><a href="search.php">Search</a></li>
                 <button class="login"> Login </button>
                 <button class="premium">Premium
                     <img src="img/crown.png" width="15px" height="15px">
                 </button>
             </ul>
         </nav>

         <div class="container">
             <div class="sidebars">
                 <aside class="sidebar">
                     <div class="left">
                         <img src="img/menu.png" alt="Profile Picture" class="main-image">
                         <img src="img/right-arrow.png" alt="" class="hover-img">
                         <button class="setting"><i class="home"></i>
                             <img src="img/setting.png">
                         </button>
                         <button class="home"><i class="home"></i>
                             <img src="img/crown.png">
                         </button>
                     </div>
                     <div class="right">
                         <div class="button-container">
                             <h3>Categories</h3>
                             <nav class="button-row-1">
                                 <button class="category-1">
                                     <i class="dashboard"></i>
                                     <span> Film</span>
                                 </button>
                                 <button class="category-2">
                                     <i class="dashboard"></i>
                                     <span> Animation</span>
                                 </button>
                                 <button class="category-3">
                                     <i class="dashboard"></i>
                                     <span> Music</span>
                                 </button>
                                 <button class="category-4">
                                     <i class="dashboard"></i>
                                     <span> Game</span>
                                 </button>
                             </nav>
                             <nav class="button-row-2">
                                 <button class="category-5">
                                     <i class="dashboard"></i>
                                     <span> Comic</span>
                                 </button>
                                 <button class="category-6">
                                     <i class="dashboard"></i>
                                     <span> Novel</span>
                                 </button>
                                 <button class="category-7">
                                     <i class="dashboard"></i>
                                     <span> TV Series</span>
                                 </button>
                                 <button class="category-8">
                                     <i class="dashboard"></i>
                                     <span> Minecraft ARG</span>
                                 </button>
                             </nav>
                         </div>
                     </div>
                 </aside>
             </div>
             <div class="background-slider no-copy" id="backgroundSlider"></div>
             <script defer src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
             <script src="js/imageslider.js" defer></script>

             <div class="content-container">
                 <div class="content">
                     <div class="textcontent">
                         <h1 class="title">RATINGKU</h1>
                         <p class="sub-title" id="sub-title"></p>
                         <div class="create-review-button" onclick="location.href='createReview.php'" id="create-button">
                             <span>Buat Rating</span>
                             <img src="img/right-arrow.png" width="10px" height="10px">
                         </div>
                     </div>

                 </div>

                 <div class="section-move">
                     <button class="web-information" onclick="location.href='#section-film'">
                         <img class="web-information-image" src="img/star.png" width="15px" height="15px">
                         <span class="span-web-information">Web Information</span>
                     </button>
                     <button class="best-film">
                         <img class="best-film-image" src="img/star.png" width="15px" height="15px">
                         <span class="-span-best-film">Best Film</span>
                     </button>
                     <button class="best-anime shine-effect" style="--duration: 0.2">
                         <img class="best-anime-image" src="img/star.png" width="15px" height="15px">
                         <span class="-span-best-anime">Best Anime</span>
                     </button>


                 </div>
             </div>

         </div>

         <div class="container-music-slider">
             <link rel="stylesheet" href="css/homepage_section.css">
             <div class="music-element-wrapper">
                 <img class="music-element auto-rotate" src="https://aervhwynaxjyzqeiijca.supabase.co/storage/v1/object/public/element/record-4572383_640.png" />
             </div>
             <div class="running-text">
                 <div class="text-list"></div>
             </div>
         </div>
     </div>

<section class="info-slider">
    <h2>Informasi Website</h2>
    
    <!-- Progress Bar -->
    <div class="progress-container">
        <div class="progress-bar" id="progressBar"></div>
    </div>

    <div class="slider-container">
        <!-- Floating Particles -->
        <div class="particles">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
        </div>
        
        <div class="slider-info" id="infoSlider">
            <!-- Slides akan di-clone oleh JavaScript -->
            <div class="slide" data-index="0">
                <div class="slide-icon">🎯</div>
                <h3>Tujuan</h3>
                <p>
                    Website ini dibuat untuk menjadi platform rating dan ulasan
                    film, animasi, komik, dan game agar pengguna dapat menemukan
                    konten terbaik dengan mudah.
                </p>
            </div>

            <div class="slide" data-index="1">
                <div class="slide-icon">🌟</div>
                <h3>Manfaat</h3>
                <p>
                    Membantu pengguna memilih tontonan atau bacaan berkualitas,
                    berbagi opini, serta membangun komunitas pecinta hiburan.
                </p>
            </div>

            <div class="slide" data-index="2">
                <div class="slide-icon">🙏</div>
                <h3>Ucapan Terima Kasih</h3>
                <p>
                    Terima kasih kepada seluruh pengguna yang telah memberikan
                    rating, ulasan, dan dukungan untuk pengembangan website ini.
                </p>
            </div>

            <div class="slide" data-index="3">
                <div class="slide-icon">💬</div>
                <h3>Testimoni</h3>
                <p>
                    "Website ini sangat membantu saya menemukan film bagus!
                    Tampilannya modern dan mudah digunakan."
                </p>
            </div>
        </div>
    </div>
    
    <!-- Dots Indicator -->
    <div class="dots-container" id="dotsContainer"></div>
    
    <!-- Navigation Buttons -->
    <div class="nav-buttons">
        <button class="nav-btn prev-btn" id="prevBtn">❮</button>
        <button class="nav-btn next-btn" id="nextBtn">❯</button>
    </div>
</section>


     <section class="best-movies" id="section-film">
         <h2>🎬 Film Terbaik 2026</h2>
         <h3>Deretan Film terbaik tahun ini yang disarankan untukmu dan disiap diberi rating</h3>
         <div class="movie-slider" id="movieSlider">
             <div class="slider-track" id="sliderTrack"></div>
         </div>
         </div>
     </section>

     <script src="js/homepage-section.js"></script>
     <script defer src="js/homePage.js"></script>


 </body>

 </html>