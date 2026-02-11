// import { supabase } from './supabase-client.js';

// // const slider = document.getElementById("backgroundSlider");
// // const sizes = ["size-sm", "size-md", "size-lg"];

// // async function loadImages() {
// //   const { data, error } = await supabaseclient
// //     .storage
// //     .from("images")
// //     .list("", { limit: 20 });

// //   if (error) {
// //     console.error(error);
// //     return;
// //   }

// //   const images = data.filter(f => f.name.endsWith(".png"));
// //   const rows = [[], [], []];

// //   images.forEach((file, i) => {
// //     rows[i % 3].push(file.name);
// //   });

// //   rows.forEach((files, index) => {
// //     const row = document.createElement("div");
// //     row.className = `slider-row row-${index + 1}`;

// //     files.forEach(name => {
// //       const img = document.createElement("img");
// //       img.src = `${SUPABASE_URL}/storage/v1/object/public/images/${encodeURIComponent(name)}`,loading = "lazy"; 
// //       img.className = sizes[Math.floor(Math.random() * sizes.length)];
// //       row.appendChild(img);
// //     });

// //     row.innerHTML += row.innerHTML; 
// //     slider.appendChild(row);
// //   });
// // }

// // loadImages();


// // ========================================
// // BENTO GRID SLIDER
// // ========================================

// async function loadBentoGrid() {
//     try {
//         // Fetch random content dari database
//         const { data: contents, error } = await supabase
//             .from('content')
//             .select('id, title, images(image_url)')
//             .limit(21) // 3 sets x 7 items
//             .order('created_at', { ascending: false });
        
//         if (error) throw error;
        
//         const bentoGrid = document.getElementById('bentoGrid');
//         bentoGrid.innerHTML = '';
        
//         // Generate 21 items (3 sets untuk smooth loop)
//         const itemsToShow = contents && contents.length > 0 ? contents : [];
        
//         for (let i = 0; i < 21; i++) {
//             const content = itemsToShow[i % itemsToShow.length];
//             const bentoItem = document.createElement('div');
//             bentoItem.className = 'bento-item';
            
//             if (content && content.images && content.images.length > 0) {
//                 bentoItem.innerHTML = `
//                     <img src="${content.images[0].image_url}" 
//                          alt="${content.title}"
//                          onclick="location.href='detail.html?id=${content.id}'" />
//                 `;
//             } else {
//                 // Placeholder jika tidak ada gambar
//                 bentoItem.classList.add('placeholder');
//                 bentoItem.innerHTML = `<span>${content?.title || 'No Image'}</span>`;
//             }
            
//             bentoGrid.appendChild(bentoItem);
//         }
        
//     } catch (error) {
//         console.error('Error loading bento grid:', error);
        
//         // Fallback: Show placeholder items
//         const bentoGrid = document.getElementById('bentoGrid');
//         bentoGrid.innerHTML = '';
        
//         const placeholders = [
//             '🎬 Film',
//             '🎮 Game', 
//             '🎵 Music',
//             '📺 Series',
//             '🎭 Anime',
//             '📚 Book',
//             '🎨 Art'
//         ];
        
//         for (let i = 0; i < 21; i++) {
//             const bentoItem = document.createElement('div');
//             bentoItem.className = 'bento-item placeholder';
//             bentoItem.innerHTML = `<span>${placeholders[i % placeholders.length]}</span>`;
//             bentoGrid.appendChild(bentoItem);
//         }
//     }
// }

// // Load on page ready
// document.addEventListener('DOMContentLoaded', () => {
//     loadBentoGrid();
// });