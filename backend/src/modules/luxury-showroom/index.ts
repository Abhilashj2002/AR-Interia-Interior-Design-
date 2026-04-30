const renderShowroom = () => {
  const propertyType = state.showroomPropertyType || 'house';
  const luxuryStore = getLuxuryShowroomStore();
  const currentProperty = propertyType === 'house' ? luxuryStore.house : luxuryStore.apartment;
  const selectedRoomId = state.selectedShowroomRoom || currentProperty.rooms[0]?.id;
  const selectedRoom = currentProperty.rooms.find((r) => r.id === selectedRoomId) || currentProperty.rooms[0];
  const isLoggedIn = Boolean(state.currentUser);

  // Room type emoji helper
  const roomEmoji = (type: string) => {
    const em: Record<string, string> = {
      'master-bedroom': 'ðŸ‘‘', 'kids': 'ðŸŽ¨', 'kitchen': 'ðŸ‘¨â€ðŸ³', 'living': 'ðŸ›‹ï¸',
      'dining': 'ðŸ½ï¸', 'bathroom': 'ðŸš¿', 'gym': 'ðŸ’ª', 'theatre': 'ðŸŽ¬',
      'pooja': 'ðŸ™', 'garden': 'ðŸŒ¿', 'terrace': 'â›±ï¸', 'balcony': 'ðŸŒ…',
      'bedroom': 'ðŸ›ï¸', 'office': 'ðŸ’¼'
    };
    return em[type] || 'ðŸ“';
  };

  // Load explicit related designs assigned to this room
  const allDesigns = getCustomerDesignPool();
  const allCategories = getCustomerVisibleCategories(state.customer.categories && state.customer.categories.length > 0 ? state.customer.categories : getCategories());
  const displayImages = getShowroomDisplayImages(selectedRoom, allDesigns, allCategories);

  // Quote/Book button: redirect to login if not logged in
  const quoteBtn = (label: string, action: string, extra = '') =>
    isLoggedIn
      ? `<button data-action="${action}" ${extra} class="showroom-btn-primary">${label}</button>`
      : `<button data-action="nav" data-tab="login" class="showroom-btn-primary">${label}</button>`;

  const bookBtn = (label: string, action: string, extra = '') =>
    isLoggedIn
      ? `<button data-action="${action}" ${extra} class="showroom-btn-secondary">${label}</button>`
      : `<button data-action="nav" data-tab="login" class="showroom-btn-secondary">${label}</button>`;

  return `
    <style>
      .showroom-page { background: #0b0b14; min-height: 100vh; color: white; }
      .showroom-room-btn {
        display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px;
        border-radius: 12px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer; transition: all 0.2s; text-align: left;
      }
      .showroom-room-btn:hover { background: rgba(255,255,255,0.08); color: white; }
      .showroom-room-btn.active { background: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.5); color: #fbbf24; }
      .showroom-video-card {
        background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px; overflow: hidden; padding: 24px;
      }
      .showroom-video-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
      .showroom-video-frame {
        position: relative; width: 100%; padding-bottom: 56.25%; background: #111827;
        border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);
      }
      .showroom-video-frame iframe, .showroom-video-frame img {
        position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 16px; object-fit: cover;
      }
      .showroom-design-card {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; overflow: hidden; transition: transform 0.2s;
      }
      .showroom-design-card:hover { transform: translateY(-4px); }
      .showroom-design-img-wrap { position: relative; height: 180px; overflow: hidden; }
      .showroom-design-overlay {
        position: absolute; inset: 0; background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s;
      }
      .showroom-design-card:hover .showroom-design-overlay { opacity: 1; }
      .showroom-design-body { padding: 14px; }
      .showroom-overlay-btn {
        padding: 8px 16px; background: rgba(255,255,255,0.9); color: #111;
        border-radius: 8px; font-weight: 700; font-size: 13px; border: none; cursor: pointer;
      }
      .showroom-card-btn {
        padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: opacity 0.2s;
      }
      .showroom-card-btn.primary { background: #f59e0b; color: #000; }
      .showroom-card-btn.secondary { background: rgba(255,255,255,0.1); color: white; }
      .showroom-btn-primary {
        padding: 10px 22px; background: #f59e0b; color: #000;
        border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; border: none; transition: opacity 0.2s;
      }
      .showroom-btn-primary:hover { opacity: 0.85; }
      .showroom-btn-secondary {
        padding: 10px 22px; background: rgba(255,255,255,0.1); color: white;
        border-radius: 10px; font-weight: 600; font-size: 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); transition: opacity 0.2s;
      }
      .showroom-cta-banner {
        margin-top: 40px; padding: 40px; text-align: center;
        background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(245,158,11,0.1));
        border: 1px solid rgba(124,58,237,0.3); border-radius: 20px;
      }
      .showroom-cta-btn-primary {
        padding: 14px 28px; background: linear-gradient(135deg, #7c3aed, #f59e0b);
        color: white; border-radius: 12px; font-weight: 700; font-size: 15px; border: none; cursor: pointer;
      }
      .showroom-cta-btn-outline {
        padding: 14px 28px; background: transparent; color: white;
        border: 2px solid rgba(255,255,255,0.3); border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer;
      }
      .showroom-video-thumb {
        background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px; padding: 12px; cursor: pointer; transition: all 0.2s; display: block; width: 100%;
      }
      .showroom-video-thumb:hover { background: rgba(255,255,255,0.08); }
    </style>
    <div class="showroom-page" style="background:#0b0b14;min-height:100vh;">
      <!-- Hero banner -->
      <section class="relative pt-28 pb-16 px-6 text-center overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-[#0b0b14] pointer-events-none"></div>
        <div class="relative z-10 max-w-4xl mx-auto">
          <div class="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-purple-500/40 bg-purple-500/10 backdrop-blur mb-6 text-sm font-bold text-purple-300 uppercase tracking-widest">
            âœ¨ Luxury Showroom
          </div>
          <h1 class="text-5xl md:text-7xl font-display font-bold text-white mb-5 leading-tight">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400">Immersive</span>
            Spaces
          </h1>
          <p class="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Explore every room with real video walkthroughs, curated designs, and instant quotes.
          </p>
          <!-- Property type selector -->
          <div class="inline-flex rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-1.5 gap-1">
            <button data-action="select-property" data-property="house"
              class="px-7 py-3 rounded-xl font-bold text-sm transition-all ${propertyType === 'house' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/70 hover:text-white'}">
              ðŸ¡ Luxury Villa
            </button>
            <button data-action="select-property" data-property="apartment"
              class="px-7 py-3 rounded-xl font-bold text-sm transition-all ${propertyType === 'apartment' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/70 hover:text-white'}">
              ðŸ¢ Penthouse Apt
            </button>
          </div>
        </div>
      </section>

      <!-- Main Showroom Layout -->
      <section class="max-w-7xl mx-auto px-4 pb-24 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        <!-- Room List Sidebar -->
        <aside class="flex flex-col gap-2">
          <div class="text-xs uppercase tracking-widest text-slate-500 font-bold px-2 mb-2">Rooms & Spaces</div>
          ${currentProperty.rooms.map((room) => `
            <button
              data-action="select-showroom-room"
              data-room-id="${escapeHtml(room.id)}"
              class="showroom-room-btn ${selectedRoomId === room.id ? 'active' : ''}"
            >
              <span class="text-2xl">${roomEmoji(room.type)}</span>
              <div class="text-left">
                <div class="font-semibold text-sm">${escapeHtml(room.name)}</div>
                ${room.name.toLowerCase() !== room.type.toLowerCase() && room.type.toLowerCase() !== 'master bedroom' && room.name.toLowerCase() !== 'master bedroom' ? `<div class="text-xs opacity-60">${escapeHtml(room.type)}</div>` : ''}
              </div>
            </button>
          `).join('')}
        </aside>

        <!-- Main Content -->
        <main class="flex flex-col gap-8">
          ${selectedRoom ? `

          <!-- ===== VIDEO SECTION ===== -->
          <div class="showroom-video-card">
            <div class="showroom-video-header">
              <div>
                <div class="text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">${escapeHtml(selectedRoom.type)}</div>
                <h2 class="text-3xl font-display font-bold text-white">${escapeHtml(selectedRoom.name)}</h2>
                <p class="text-slate-400 mt-2 text-sm max-w-xl">${escapeHtml(selectedRoom.description)}</p>
              </div>
              <div class="flex gap-3 flex-wrap">
                ${quoteBtn('ðŸ’¬ Get Quote', 'nav', `data-tab="contact"`)}
                ${bookBtn('ðŸ“… Book Design', 'nav', `data-tab="contact"`)}
              </div>
            </div>

            <!-- Video embed -->
            ${selectedRoom.video3d ? (
        (selectedRoom.video3d.includes('youtube.com') || selectedRoom.video3d.includes('youtu.be')) ? `
              <div class="showroom-video-frame" id="showroom-video-container-${escapeHtml(selectedRoom.id)}">
                <!-- Poster/thumbnail shown before play -->
                <div class="showroom-video-poster" id="showroom-poster-${escapeHtml(selectedRoom.id)}"
                  style="position:absolute;inset:0;cursor:pointer;border-radius:16px;overflow:hidden;"
                  data-action="play-showroom-video"
                  data-room-id="${escapeHtml(selectedRoom.id)}"
                  data-video-url="${escapeHtml(selectedRoom.video3d || '')}"
                >
                  <img src="${escapeHtml(selectedRoom.imageUrl)}" alt="${escapeHtml(selectedRoom.name)}"
                    class="motion-3d" data-motion3d="true" style="width:100%;height:100%;object-fit:cover;border-radius:16px;" />
                  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.35);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;">
                    <div style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,0.95);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 32px rgba(0,0,0,0.4);margin-bottom:12px;">
                      <span style="font-size:28px;margin-left:4px;">â–¶</span>
                    </div>
                    <span style="color:white;font-size:14px;font-weight:700;letter-spacing:0.05em;text-shadow:0 2px 8px rgba(0,0,0,0.8);">â–¶ Play Room Tour</span>
                  </div>
                </div>
              </div>
              ` : `
              <div class="showroom-video-frame">
                <video
                  src="${escapeHtml(selectedRoom.video3d)}"
                  poster="${escapeHtml(selectedRoom.imageUrl)}"
                  title="${escapeHtml(selectedRoom.name)} â€” Interior Video Tour"
                  style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;background:black;"
                  controls
                  playsinline
                  preload="metadata"
                ></video>
              </div>
              `
      ) : `
            <div class="showroom-video-frame overflow-hidden">
              <img src="${escapeHtml(selectedRoom.imageUrl)}" alt="${escapeHtml(selectedRoom.name)}" class="motion-3d" data-motion3d="true" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:16px;" />
            </div>
            `}
          </div>

          <!-- ===== DESIGNS SECTION ===== -->
          <div>
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-xl font-bold text-white">
                ðŸ–¼ï¸ Related Designs â€” <span class="text-amber-400">${escapeHtml(selectedRoom.name)}</span>
              </h3>
              ${!isLoggedIn ? `<span class="text-xs text-slate-500 italic">Sign in to quote or book</span>` : ''}
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              ${displayImages.length > 0 ? displayImages.map((img) => `
                <div class="showroom-design-card group">
                  <div class="showroom-design-img-wrap overflow-hidden">
                    <img
                      src="${escapeHtml(img.url)}"
                      alt="${escapeHtml(img.name)}"
                      class="motion-3d w-full h-full object-cover transition-transform duration-500 group-hover:scale-125"
                      data-motion3d="true"
                      loading="lazy"
                    />
                    <div class="showroom-design-overlay">
                      <button
                        data-action="open-3d-room"
                        data-image-url="${escapeHtml(img.url)}"
                        data-room-name="${escapeHtml(img.name)}"
                        class="showroom-overlay-btn"
                      >ðŸ  View 3D</button>
                    </div>
                  </div>
                  <div class="showroom-design-body">
                    <div class="text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">${escapeHtml(img.category)}</div>
                    <h4 class="font-bold text-white text-sm mb-3 line-clamp-2">${escapeHtml(img.name)}</h4>
                    <div class="flex gap-2">
                      ${isLoggedIn
          ? `<button data-action="nav" data-tab="contact" class="showroom-card-btn primary">ðŸ’¬ Quote</button>
                           <button data-action="nav" data-tab="contact" class="showroom-card-btn secondary">ðŸ“… Book</button>`
          : `<button data-action="nav" data-tab="login" class="showroom-card-btn primary w-full" style="text-align:center;">ðŸ”’ Sign in to Quote</button>`
        }
                    </div>
                  </div>
                </div>
              `).join('') : `
                <div class="col-span-full text-center py-12 text-slate-500 italic">
                  No designs found for this room yet. Check back soon!
                </div>
              `}
            </div>
          </div>

          <!-- ===== OTHER VIDEOS IN THIS PROPERTY ===== -->
          <div>
            <h3 class="text-xl font-bold text-white mb-5">ðŸŽ¬ All Room Tour Videos</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              ${currentProperty.rooms.filter((r) => r.video3d).map((room) => `
                <button
                  data-action="select-showroom-room"
                  data-room-id="${escapeHtml(room.id)}"
                  class="showroom-video-thumb group text-left ${selectedRoomId === room.id ? 'ring-2 ring-amber-400' : ''}"
                >
                  <div class="relative h-40 overflow-hidden rounded-xl bg-slate-800">
                    <img src="${escapeHtml(room.imageUrl)}" alt="${escapeHtml(room.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div class="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div class="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <span class="text-white text-2xl">â–¶</span>
                      </div>
                    </div>
                    ${selectedRoomId === room.id ? `<div class="absolute top-2 left-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">Now Playing</div>` : ''}
                  </div>
                  <div class="mt-3">
                    <div class="text-xs text-slate-500 uppercase tracking-wider">${roomEmoji(room.type)} ${escapeHtml(room.type)}</div>
                    <div class="font-bold text-white mt-0.5">${escapeHtml(room.name)}</div>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          ` : '<div class="py-20 text-center text-slate-500">Select a room to explore</div>'}

          <!-- ===== CTA ===== -->
          <div class="showroom-cta-banner">
            <h2 class="text-3xl font-display font-bold text-white mb-3">Ready to Transform Your Space?</h2>
            <p class="text-slate-300 mb-8 max-w-2xl mx-auto">
              Our expert designers will bring your dream home to life with cutting-edge 3D, AR, and smart planning tools.
            </p>
            <div class="flex flex-wrap gap-4 justify-center">
              ${isLoggedIn
      ? `<button data-action="nav" data-tab="contact" class="showroom-cta-btn-primary">ðŸ“… Book a Consultation</button>
                   <button data-action="nav" data-tab="gallery" class="showroom-cta-btn-outline">ðŸ–¼ï¸ Explore Gallery</button>`
      : `<button data-action="nav" data-tab="login" class="showroom-cta-btn-primary">ðŸ”’ Sign In to Get Started</button>
                   <button data-action="nav" data-tab="gallery" class="showroom-cta-btn-outline">ðŸ–¼ï¸ Explore Gallery</button>`
    }
            </div>
          </div>
        </main>
      </section>
      <style>
        @keyframes kenBurns { 0% { transform: scale(1); } 100% { transform: scale(1.15); } }
        .motion-3d[data-motion3d="true"] { animation: kenBurns 20s ease-in-out infinite alternate; transform-origin: center center; }
      </style>
    </div>
  `;
};

// Expose legacy showroom renderer for feature-wrapper delegation.
(globalThis as any).renderShowroom = renderShowroom;



