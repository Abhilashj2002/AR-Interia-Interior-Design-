// Featured Projects Admin Enhancement Script
// This script adds the Featured Projects section to the admin portfolio manager

const FEATURED_PROJECTS_SECTION = `
  <!-- Featured Projects Section -->
  <div class="mb-8">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-slate-700 text-lg">🏆 Featured Projects</h3>
      <button data-action="add-featured-project" class="text-xs font-semibold px-4 py-2 rounded-lg bg-[color:var(--accent)] text-white hover:opacity-90 transition">+ Add Project</button>
    </div>
    <div class="space-y-4">
      \${(state.portfolioContent.featuredProjects || []).map((project, projIndex) => \`
        <div class="p-5 rounded-2xl border border-black/10 bg-white relative group shadow-sm">
          <button data-action="remove-featured-project" data-index="\${projIndex}" class="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg">×</button>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Title</label>
              <input data-bind="portfolioContent.featuredProjects.\${projIndex}.title" value="\${escapeHtml(project.title)}" class="w-full mt-1 px-3 py-2 rounded-xl border border-black/10 font-semibold" placeholder="e.g., Luxury Beachfront Villa" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Property Type</label>
              <select data-bind="portfolioContent.featuredProjects.\${projIndex}.propertyType" class="w-full mt-1 px-3 py-2 rounded-xl border border-black/10">
                <option value="Villa" \${project.propertyType === 'Villa' ? 'selected' : ''}>Villa</option>
                <option value="Apartment" \${project.propertyType === 'Apartment' ? 'selected' : ''}>Apartment</option>
                <option value="Penthouse" \${project.propertyType === 'Penthouse' ? 'selected' : ''}>Penthouse</option>
              </select>
            </div>
          </div>
          
          <div class="mb-4">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</label>
            <textarea data-bind="portfolioContent.featuredProjects.\${projIndex}.description" rows="2" class="w-full mt-1 px-3 py-2 rounded-xl border border-black/10" placeholder="Project description...">\${escapeHtml(project.description)}</textarea>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location</label>
              <input data-bind="portfolioContent.featuredProjects.\${projIndex}.location" value="\${escapeHtml(project.location)}" class="w-full mt-1 px-3 py-2 rounded-xl border border-black/10" placeholder="e.g., Mumbai, India" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Area</label>
              <input data-bind="portfolioContent.featuredProjects.\${projIndex}.area" value="\${escapeHtml(project.area)}" class="w-full mt-1 px-3 py-2 rounded-xl border border-black/10" placeholder="e.g., 3500 sqft" />
            </div>
            <div>
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Completion Year</label>
              <input data-bind="portfolioContent.featuredProjects.\${projIndex}.completionYear" value="\${escapeHtml(project.completionYear)}" class="w-full mt-1 px-3 py-2 rounded-xl border border-black/10" placeholder="e.g., 2024" />
            </div>
          </div>
          
          <div class="mb-4">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rooms (comma-separated)</label>
            <input data-bind="portfolioContent.featuredProjects.\${projIndex}.rooms" value="\${escapeHtml((project.rooms || []).join(', '))}" class="w-full mt-1 px-3 py-2 rounded-xl border border-black/10" placeholder="e.g., Master Bedroom, Living Room, Kitchen" />
          </div>
          
          <div class="mb-3">
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Project Images</label>
              <button data-action="add-project-image" data-index="\${projIndex}" class="text-xs font-semibold px-3 py-1 rounded-lg bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition">+ Add Image</button>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              \${(project.images || []).map((img, imgIndex) => \`
                <div class="relative group/image">
                  <img src="\${escapeHtml(img.url)}" alt="\${escapeHtml(img.caption || 'Project image')}" class="w-full h-32 object-cover rounded-xl border border-black/10" />
                  <input data-bind="portfolioContent.featuredProjects.\${projIndex}.images.\${imgIndex}.caption" value="\${escapeHtml(img.caption || '')}" class="w-full mt-1 px-2 py-1 rounded-lg border border-black/5 text-xs" placeholder="Caption" />
                  <button data-action="remove-project-image" data-project-index="\${projIndex}" data-image-index="\${imgIndex}" class="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs opacity-0 group-hover/image:opacity-100 transition">×</button>
                </div>
              \`).join('')}
            </div>
          </div>
          
          <div class="flex items-center gap-3 pt-3 border-t border-black/5">
            <label class="text-xs font-semibold text-slate-500">Featured:</label>
            <input type="checkbox" data-bind="portfolioContent.featuredProjects.\${projIndex}.featured" \${project.featured ? 'checked' : ''} class="w-4 h-4 accent-[color:var(--accent)]" />
            <span class="text-xs text-slate-400">Show on portfolio homepage</span>
          </div>
        </div>
      \`).join('')}
      \${!(state.portfolioContent.featuredProjects || []).length ? '<div class="text-center py-12 text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">No featured projects yet. Click "+ Add Project" to showcase your best work.</div>' : ''}
    </div>
  </div>
`;

console.log('Featured Projects section template loaded');
console.log('To use this in main.ts, insert FEATURED_PROJECTS_SECTION before the save-portfolio-content button');
