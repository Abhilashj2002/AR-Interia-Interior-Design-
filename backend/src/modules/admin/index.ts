/* eslint-disable @typescript-eslint/no-explicit-any */
declare var state: any;
declare var escapeHtml: any;
declare var formatMonthYearDate: any;
declare var chatbotHistoryState: any;
declare var chatbotSettingsState: any;
declare var chatbotStatsState: any;
declare var render: any;
declare var getCategories: any;
declare var getDesigns: any;
declare var getCategoryKeySet: any;
declare var designMatchesCategory: any;
declare var renderImageThumb: any;
declare var resolveDesignDisplayName: any;
declare var getDesignAmount: any;
declare var formatCurrency: any;
declare var root: any;
declare var renderCategoryThumb: any;
declare var renderEmojiOptions: any;

const renderAdminCalculatorHistorySection = (history: any[]): string => {
  return `
    <div class="mt-8 border-t border-black/5 pt-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <span>📋</span> Price Calculator History
        </h3>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">${history.length} records</span>
      </div>
      <div class="space-y-4">
        ${history.length > 0 ? `
          <div class="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <div class="p-4 bg-slate-50/50 border-b border-black/5 grid grid-cols-4 gap-4">
              <div class="flex items-center gap-4 col-span-3">
                <div class="p-3 rounded-lg bg-white border border-black/5">
                  <div class="text-2xl font-black text-slate-700">₹${history.reduce((sum, h) => sum + (h.result || 0), 0).toLocaleString()}</div>
                  <div class="text-[10px] uppercase tracking-wider text-slate-400">Total Estimated</div>
                </div>
              </div>
            </div>
            <div class="overflow-x-auto custom-scroll">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="text-slate-400 uppercase tracking-widest font-black border-b border-black/5">
                    <th class="py-3 px-2">Date & Time</th>
                    <th class="py-3 px-2">User Info</th>
                    <th class="py-3 px-2">Category</th>
                    <th class="py-3 px-2">Calculation Details</th>
                    <th class="py-3 px-2 text-right">Result</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-black/5">
                  ${history.map(item => {
                    const isRegistered = Boolean(item.userId);
                    const dateObj = new Date(item.timestamp);
                    const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                    const formattedTime = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
                    return `
                      <tr class="hover:bg-slate-50 transition">
                        <td class="py-4 px-2">
                          <div class="text-slate-900 font-semibold">${formattedDate}</div>
                          <div class="text-[10px] text-slate-400">${formattedTime}</div>
                        </td>
                        <td class="py-4 px-2">
                          <div class="font-bold text-slate-900">${escapeHtml(item.userName || 'Guest')}</div>
                          <div class="text-[10px]">
                            ${isRegistered 
                              ? '<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">Registered User</span>' 
                              : '<span class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">Guest User</span>'}
                          </div>
                          ${item.customerEmail ? `<div class="text-[10px] text-slate-400">${escapeHtml(item.customerEmail)}</div>` : ''}
                        </td>
                        <td class="py-4 px-2">
                          <span class="px-2 py-1 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-100">${item.category}</span>
                          ${item.packageName ? `<div class="text-[10px] text-slate-500 mt-1">Package: ${escapeHtml(item.packageName)}</div>` : ''}
                        </td>
                        <td class="py-4 px-2 text-slate-600">
                          <div class="font-medium">${item.area} sqft · ${item.bhk} BHK</div>
                          <div class="text-[10px]">Shape: ${item.shape} · Quality: <span class="capitalize">${item.quality}</span></div>
                          ${item.packageId ? `<div class="text-[10px] text-blue-600">Package Applied</div>` : ''}
                        </td>
                        <td class="py-4 px-2 text-right">
                          <div class="font-black text-slate-900 text-lg">₹${Number(item.result || 0).toLocaleString()}</div>
                          ${item.curatedDesigns?.length ? `<div class="text-[10px] text-slate-400">${item.curatedDesigns.length} designs shown</div>` : ''}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                 </tbody>
              </table>
            </div>
          </div>
        ` : `
          <div class="py-20 text-center">
            <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <i class="ri-history-line text-3xl text-slate-300"></i>
            </div>
            <h4 class="text-slate-900 font-bold">No history available</h4>
            <p class="text-slate-500 text-xs">When users use the calculator, records will appear here.</p>
          </div>
        `}
      </div>
    </div>
  `;
};

const renderAdminChatbotFeedbackSection = (): string => {
  // Chatbot-sourced feedbacks are stored with designId = 'chatbot-general'
  const allFeedbacks = [...(state.customer.feedbacks || []), ...(state.feedbacks || [])];
  const chatbotFeedbacks = allFeedbacks
    .filter((f: any) => f && String(f.designId || '') === 'chatbot-general' && f.comment)
    .filter((f: any, idx: number, arr: any[]) => arr.findIndex((x: any) => x.id === f.id) === idx)
    .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const rows = chatbotFeedbacks.length
    ? chatbotFeedbacks.map((f: any) => {
        const stars = '⭐'.repeat(Math.min(5, Math.max(1, Number(f.rating || 1))));
        const name = escapeHtml(String(f.userName || f.customerId || 'Customer'));
        const comment = escapeHtml(String(f.comment || ''));
        const date = formatMonthYearDate(f.createdAt);
        return `
          <div class="p-3 rounded-xl border border-black/5 bg-white">
            <div class="flex items-center justify-between mb-1">
              <div class="font-semibold text-sm text-[color:var(--primary)]">${name}</div>
              <div class="text-[10px] text-slate-400">${date}</div>
            </div>
            <div class="text-xs text-amber-500 mb-1">${stars}</div>
            <p class="text-xs text-slate-600">${comment}</p>
          </div>`;
      }).join('')
    : `<div class="text-sm text-slate-400 py-2">No chatbot feedback yet.</div>`;

  return `
    <div class="mt-6 pt-4 border-t border-black/5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-slate-600">⭐ Feedback Submitted via Chatbot</h3>
        <span class="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">${chatbotFeedbacks.length} entries</span>
      </div>
      <div class="grid gap-3 max-h-64 overflow-y-auto" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">
        ${rows}
      </div>
    </div>`;
};

const renderAdminChatbotHistorySection = (): string => {
  const history = [...chatbotHistoryState]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  const recent = history.slice(0, 30);
  const registeredOnly = history.filter((entry) => entry.userType === 'registered').slice(0, 20);
  const registeredCount = history.filter((entry) => entry.userType === 'registered').length;
  const newGuestCount = history.filter((entry) => entry.userType === 'newGuest').length;
  const returningGuestCount = history.filter((entry) => entry.userType === 'returningGuest').length;

  return `
    <div class="mt-6 pt-4 border-t border-black/5">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-sm font-semibold text-slate-600">ðŸ§  Chatbot Query History</h3>
        <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">${history.length} total queries</span>
      </div>
      <div class="grid grid-cols-3 gap-2 mb-3">
        <div class="p-2 rounded-lg bg-slate-50 border border-black/5">
          <div class="text-[10px] uppercase tracking-wider text-slate-400">Registered</div>
          <div class="text-sm font-bold text-[color:var(--primary)]">${registeredCount}</div>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 border border-black/5">
          <div class="text-[10px] uppercase tracking-wider text-slate-400">New Guest</div>
          <div class="text-sm font-bold text-[color:var(--primary)]">${newGuestCount}</div>
        </div>
        <div class="p-2 rounded-lg bg-slate-50 border border-black/5">
          <div class="text-[10px] uppercase tracking-wider text-slate-400">Returning Guest</div>
          <div class="text-sm font-bold text-[color:var(--primary)]">${returningGuestCount}</div>
        </div>
      </div>
      <div class="mb-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/60">
        <div class="flex items-center justify-between mb-2">
          <h4 class="text-xs font-semibold tracking-wide uppercase text-emerald-800">Registered Customers: What They Typed</h4>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">${registeredOnly.length} recent</span>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          ${registeredOnly.length > 0
      ? registeredOnly.map((item) => {
        const when = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
        const query = escapeHtml(String(item.query || ''));
        const customerLabel = `${String(item.userName || 'Customer')}${item.customerEmail ? ` (${item.customerEmail})` : ''}`;
        return `
                <div class="p-2 rounded-lg border border-emerald-200 bg-white">
                  <div class="text-[10px] text-emerald-700 font-semibold mb-0.5 truncate">${escapeHtml(customerLabel)}</div>
                  <div class="text-[11px] text-slate-700"><span class="font-semibold text-slate-500">Typed:</span> ${query}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">${when}</div>
                </div>
              `;
      }).join('')
      : '<div class="text-xs text-slate-500">No registered customer chatbot queries yet.</div>'}
        </div>
      </div>
      <div class="space-y-2 max-h-72 overflow-y-auto pr-1">
        ${recent.length > 0
      ? recent.map((item) => {
        const when = item.createdAt ? new Date(item.createdAt).toLocaleString() : '';
        const query = escapeHtml(String(item.query || ''));
        const response = escapeHtml(String(item.response || ''));
        const roleTag = item.userType === 'registered' ? 'Registered' : item.userType === 'newGuest' ? 'New Guest' : 'Returning Guest';
        return `
              <div class="p-3 rounded-xl border border-black/5 bg-white">
                <div class="flex items-center justify-between gap-2 mb-1">
                  <div class="text-[11px] font-semibold text-[color:var(--primary)] truncate">${escapeHtml(String(item.userName || 'Guest'))} â€¢ ${roleTag}</div>
                  <div class="text-[10px] text-slate-400 whitespace-nowrap">${when}</div>
                </div>
                <div class="text-[11px] text-slate-700"><span class="font-semibold text-slate-500">Q:</span> ${query}</div>
                <div class="text-[11px] text-slate-600 mt-1"><span class="font-semibold text-slate-500">A:</span> ${response.length > 220 ? `${response.slice(0, 220)}...` : response}</div>
              </div>
            `;
      }).join('')
      : '<div class="text-sm text-slate-400 py-2">No chatbot queries yet.</div>'}
      </div>
    </div>`;
};

const renderAdminChatbotManagerSection = () => {
  const chatbotStats = chatbotStatsState;
  const chatbotSettings = chatbotSettingsState;
  const history = chatbotHistoryState || [];
  const historyRegistered = history.filter((entry) => entry.userType === 'registered').length;
  const historyNewGuest = history.filter((entry) => entry.userType === 'newGuest').length;
  const historyReturningGuest = history.filter((entry) => entry.userType === 'returningGuest').length;
  const registeredCount = historyRegistered > 0 ? historyRegistered : chatbotStats.registeredMessages;
  const guestCount = (historyNewGuest + historyReturningGuest) > 0
    ? (historyNewGuest + historyReturningGuest)
    : (chatbotStats.newGuestMessages + chatbotStats.returningGuestMessages);
  return `
    <div class="spidey-panel p-6">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-6">ðŸ’¬ Chatbot Assistant</h2>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      <div class="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50">
        <div class="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">ðŸ’¬ Messages</div>
        <div class="text-2xl font-bold text-blue-700 mt-1">${chatbotStats.totalMessages}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50">
        <div class="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">ðŸ“… Bookings</div>
        <div class="text-2xl font-bold text-emerald-700 mt-1">${chatbotStats.bookingIntents}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50">
        <div class="text-[10px] uppercase tracking-wider text-amber-600 font-semibold">ðŸ’¡ Suggestions</div>
        <div class="text-2xl font-bold text-amber-700 mt-1">${chatbotStats.suggestionIntents}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50">
        <div class="text-[10px] uppercase tracking-wider text-purple-600 font-semibold">ðŸ‘¤ Registered</div>
        <div class="text-2xl font-bold text-purple-700 mt-1">${registeredCount}</div>
      </div>
      <div class="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 border border-pink-200/50">
        <div class="text-[10px] uppercase tracking-wider text-pink-600 font-semibold">ðŸ‘¥ Guests</div>
        <div class="text-2xl font-bold text-pink-700 mt-1">${guestCount}</div>
      </div>
        </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <form data-form="chatbot-settings" class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <span>âš™ï¸</span> Chatbot Settings
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ¤– Assistant Name</label>
            <input name="assistantName" value="${escapeHtml(chatbotSettings.assistantName)}" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="e.g., Interia Assistant" required />
          </div>
          <div class="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-black/5">
            <input type="checkbox" name="enabled" id="chatbot-enabled" ${chatbotSettings.enabled ? 'checked' : ''} class="w-4 h-4 text-blue-600 rounded" />
            <label for="chatbot-enabled" class="text-sm text-slate-700 font-medium">âœ… Chatbot Enabled</label>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ‘‹ Greeting Message</label>
            <textarea name="greeting" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Hello! I'm your Interia assistant...">${escapeHtml(chatbotSettings.greeting)}</textarea>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold hover:opacity-90 transition shadow-lg shadow-blue-500/25">ðŸ’¾ Save Settings</button>
          <button type="button" data-action="reset-chatbot-settings" class="w-full py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition">â™»ï¸ Reset Settings</button>
        </div>
      </form>
      <div class="space-y-4">
        <h3 class="text-sm font-semibold text-slate-600 flex items-center gap-2">
          <span>ðŸ“</span> Auto-Reply Templates
        </h3>
        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ“… Booking Inquiry Reply</label>
            <textarea name="bookingReply" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="Thank you for your interest in booking...">${escapeHtml(chatbotSettings.bookingReply)}</textarea>
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-500 mb-1">ðŸ’¡ Suggestions Intro</label>
            <textarea name="suggestionsIntro" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-amber-500/20" placeholder="Here are some suggestions...">${escapeHtml(chatbotSettings.suggestionsIntro)}</textarea>
          </div>
        </div>
        <div class="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200">
          <h4 class="text-xs font-semibold text-slate-600 mb-3">ðŸ“Š Quick Stats</h4>
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center p-2 rounded-lg bg-white/50">
              <div class="text-lg font-bold text-blue-600">${chatbotStats.totalMessages}</div>
              <div class="text-[9px] uppercase text-slate-400">Total</div>
            </div>
            <div class="text-center p-2 rounded-lg bg-white/50">
              <div class="text-lg font-bold text-emerald-600">${chatbotStats.bookingIntents}</div>
              <div class="text-[9px] uppercase text-slate-400">Bookings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${renderAdminChatbotFeedbackSection()}
    ${renderAdminChatbotHistorySection()}
    </div>
    `;
};


const renderAdminCatalogSection = () => {
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const designs = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : getDesigns();
  const activeFilter = state.admin.catalogFilter || 'all';
  const categoryKeys = getCategoryKeySet(activeFilter, categories);
  const filteredDesigns = designs
    .filter((design: any) => design.status !== 'inactive' && design.isDeleted !== true)
    .filter((design) => designMatchesCategory(design, categoryKeys));
  return `
    <div class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸŽ¨ 3D Catalog</h2>
            <div class="flex gap-2">
                <span class="text-xs text-slate-400">${filteredDesigns.length} items</span>
        <button data-action="admin-reset-visual-data" class="px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs font-semibold">Reset Visual Data</button>
        <button data-action="open-upload" class="px-3 py-2 rounded-lg bg-[color:var(--primary)] text-white text-xs font-semibold">+ Add Design</button>
            </div>
        </div>
        <div class="mb-4 flex flex-wrap items-center gap-2">
            <select id="admin-catalog-filter" class="px-3 py-2 rounded-xl border border-black/10 text-sm">
                <option value="all" ${activeFilter === 'all' ? 'selected' : ''}>All Categories</option>
                ${categories.map((cat) => `<option value="${cat.id}" ${activeFilter === cat.id ? 'selected' : ''}>${escapeHtml(cat.title || cat.name || cat.id)}</option>`).join('')}
            </select>
            <button type="button" data-action="admin-load-catalog-category" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Load Category</button>
            <button type="button" data-action="admin-load-catalog-all" class="px-3 py-2 rounded-lg border border-black/10 text-slate-600 text-xs font-semibold">Show All</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
            ${filteredDesigns.map(design => `
            <div data-action="preview-catalog-design" data-model-id="${design.id}" class="p-3 rounded-2xl border border-black/5 bg-white shadow-sm flex gap-3 cursor-pointer hover:shadow-md transition-shadow">
          ${renderImageThumb(design.previewImage, design.title, 'w-16 h-16', 'text-[10px]', design.motion3d === true)}
                    <div class="flex-1 min-w-0">
                        <div class="text-sm font-semibold truncate">${escapeHtml(design.title)}</div>
                        <div class="text-[10px] text-slate-400 truncate">${escapeHtml(design.categoryId || 'No Category')}</div>
                        <div class="mt-1 flex gap-2">
              <button type="button" data-action="open-design-editor" data-design-id="${design.id}" data-model-id="${design.id}" class="text-[10px] font-bold text-blue-600">Edit</button>
            <button type="button" data-action="archive-catalog" data-model-id="${design.id}" class="text-[10px] font-bold text-amber-600">Archive</button>
            <button type="button" data-action="delete-catalog" data-model-id="${design.id}" class="text-[10px] font-bold text-red-500">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};

const renderCatalogPreviewModal = () => {
  const previewId = String((state.admin as any).catalogPreviewId || '').trim();
  if (!previewId) return '';

  const design = (state.customer.designs || []).find((item: any) => String(item?.id || '') === previewId)
    || getDesigns().find((item: any) => String(item?.id || '') === previewId)
    || state.catalog.find((item: any) => String(item?.id || '') === previewId);

  if (!design) return '';

  const title = resolveDesignDisplayName(design as any, {
    imageUrl: String((design as any).previewImage || ''),
    categoryId: String((design as any).categoryId || ''),
    fallback: String((design as any).title || 'Design')
  });
  const imageUrl = String((design as any).previewImage || ((design as any).images && (design as any).images[0]) || '/hero-bg.webp');
  const description = String((design as any).description || 'No description available.');
  const categoryLabel = String((design as any).categoryId || (design as any).category || 'Uncategorized');
  const amount = getDesignAmount(design as any);

  return `
    <div class="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" data-action="close-catalog-preview" data-catalog-preview-modal="true" role="dialog" aria-modal="true" aria-label="Catalog design preview">
      <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl" data-action="ignore">
        <div class="p-5 border-b border-black/5 flex items-center justify-between gap-3">
          <h3 class="text-lg font-bold text-[color:var(--primary)] truncate">${escapeHtml(title)}</h3>
          <button type="button" data-action="close-catalog-preview" data-catalog-preview-close="true" class="text-slate-500 text-xl leading-none">âœ•</button>
        </div>
        <div class="p-5 space-y-4">
          <div class="rounded-2xl overflow-hidden border border-black/10 bg-slate-100">
            <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(title)}" data-motion3d="${(design as any).motion3d === true ? 'true' : 'false'}" class="motion-3d w-full h-72 object-cover" />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="p-3 rounded-xl bg-slate-50 border border-black/5">
              <div class="text-[10px] uppercase tracking-wider text-slate-400">Category</div>
              <div class="text-sm font-semibold text-[color:var(--primary)] mt-1">${escapeHtml(categoryLabel)}</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-black/5">
              <div class="text-[10px] uppercase tracking-wider text-slate-400">Price</div>
              <div class="text-sm font-semibold text-[color:var(--primary)] mt-1">${escapeHtml(formatCurrency(amount))}</div>
            </div>
            <div class="p-3 rounded-xl bg-slate-50 border border-black/5">
              <div class="text-[10px] uppercase tracking-wider text-slate-400">3D Motion</div>
              <div class="text-sm font-semibold text-[color:var(--primary)] mt-1">${(design as any).motion3d === true ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>
          <p class="text-sm text-slate-600">${escapeHtml(description)}</p>
          <div class="flex flex-wrap justify-end gap-2 pt-2">
            <button type="button" data-action="open-design-editor" data-design-id="${escapeHtml(String((design as any).id || ''))}" data-model-id="${escapeHtml(String((design as any).id || ''))}" class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold">Edit</button>
            <button type="button" data-action="archive-catalog" data-model-id="${escapeHtml(String((design as any).id || ''))}" class="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold">Archive</button>
            <button type="button" data-action="delete-catalog" data-model-id="${escapeHtml(String((design as any).id || ''))}" class="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;
};

const closeCatalogPreview = (restoreFocus = true) => {
  const returnModelId = String((state.admin as any).catalogPreviewReturnModelId || '').trim();
  (state.admin as any).catalogPreviewId = null;
  (state.admin as any).catalogPreviewReturnModelId = '';
  render();

  if (!restoreFocus || !returnModelId) return;
  requestAnimationFrame(() => {
    const trigger = root.querySelector(`[data-action="preview-catalog-design"][data-model-id="${returnModelId}"]`) as HTMLElement | null;
    trigger?.focus();
  });
};

const focusCatalogPreviewDialog = () => {
  requestAnimationFrame(() => {
    const closeButton = root.querySelector('[data-catalog-preview-close="true"]') as HTMLButtonElement | null;
    closeButton?.focus();
  });
};

const renderAdminFeedbackSection = () => {
  const mergedFeedbacks = [...(state.customer.feedbacks || []), ...(state.feedbacks || [])]
    .filter((feedback) => Boolean(feedback && feedback.comment));
  const uniqueFeedbacks = Array.from(new Map(mergedFeedbacks.map((feedback, index) => {
    const key = String(feedback.id || `${feedback.userId || 'guest'}-${feedback.createdAt || index}`);
    return [key, feedback];
  })).values())
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return `
  <div class="spidey-panel p-6">
    <div class="flex items-center justify-between mb-4 gap-3">
      <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">â­ Public Feedback</h2>
      <button type="button" data-action="refresh-admin-feedback" class="text-xs px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">â†» Refresh</button>
    </div>
      <div class="grid gap-3" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
        ${uniqueFeedbacks.length
      ? uniqueFeedbacks
        .map((feedback) => `
                <div class="p-3 rounded-xl border border-black/5">
                  <div class="flex items-center justify-between">
                    <div class="font-semibold text-[color:var(--primary)] text-sm">${escapeHtml(String(feedback.userName || 'Customer'))}</div>
                    <button data-action="delete-feedback" data-feedback-id="${feedback.id}" class="text-xs text-red-500">Remove</button>
                  </div>
                  <div class="text-xs text-amber-500 mb-1">${'â˜…'.repeat(feedback.rating)}</div>
                  <p class="text-xs text-slate-500">${escapeHtml(feedback.comment)}</p>
                  <div class="text-[10px] text-slate-400 mt-2">${formatMonthYearDate(feedback.createdAt || Date.now())}</div>
                </div>
              `).join('')
      : '<div class="text-sm text-slate-400">No public feedback yet.</div>'
    }
</div>
  </div>
    `;
};

const renderAdminCategoriesSection = () => {
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  return `
    <div class="spidey-panel p-6">
        <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">ðŸ“‚ Categories</h2>
            <button data-action="reset-category" class="text-xs text-[color:var(--accent)]">Clear</button>
        </div>
        <form data-form="category-form" class="space-y-3">
            <input name="title" value="${escapeHtml(state.admin.categoryForm.title)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Category Title" required />
            ${renderEmojiOptions('title')}
            <input name="image" value="${escapeHtml(state.admin.categoryForm.image)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Image URL" />
            <input name="imageFile" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10" />
            ${state.admin.categoryForm.image ? `<img src="${escapeHtml(state.admin.categoryForm.image)}" alt="Category" class="w-full h-32 object-cover rounded-xl border border-black/5" />` : ''}
            <input name="background" value="${escapeHtml(state.admin.categoryForm.background)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Background URL" />
            <textarea name="description" class="w-full px-3 py-2 rounded-xl border border-black/10" rows="3" placeholder="Description">${escapeHtml(state.admin.categoryForm.description)}</textarea>
            ${renderEmojiOptions('description')}
            <select name="status" class="w-full px-3 py-2 rounded-xl border border-black/10">
                <option value="active" ${state.admin.categoryForm.status === 'active' ? 'selected' : ''}>Active</option>
                <option value="inactive" ${state.admin.categoryForm.status === 'inactive' ? 'selected' : ''}>Inactive</option>
            </select>
            <button type="submit" class="w-full py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold">${state.admin.categoryForm.id ? 'Update' : 'Add'} Category</button>
        </form>
        <div class="mt-4 space-y-2 max-h-[240px] overflow-y-auto">
            ${categories.map(cat => `
                <div class="p-3 rounded-xl border border-black/5 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        ${renderCategoryThumb(cat, 'w-10 h-10', 'text-[10px]')}
                        <div>
                            <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(cat.title)}</div>
                            <div class="text-[10px] text-slate-400 capitalize">${cat.status}</div>
                        </div>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" data-action="admin-load-designs-for-category" data-category-id="${cat.id}" class="text-xs text-blue-600">Load Designs</button>
                        <button data-action="edit-category" data-category-id="${cat.id}" class="text-xs text-[color:var(--accent)]">Edit</button>
                        <button data-action="save-category" data-category-id="${cat.id}" class="text-xs text-emerald-600">Save</button>
                        <button data-action="delete-category" data-category-id="${cat.id}" class="text-xs text-red-500">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};

const renderAdminDesignManagerSection = () => {
  const adminAny = state.admin as any;
  const categories = (state.customer.categories && state.customer.categories.length > 0)
    ? state.customer.categories
    : getCategories();
  const designs = (state.customer.designs && state.customer.designs.length > 0)
    ? state.customer.designs
    : getDesigns();
  const activeDesignFilter = adminAny.designCategoryFilter || 'all';
  const designCategoryKeys = getCategoryKeySet(activeDesignFilter, categories);
  const filteredDesigns = designs.filter((design) => designMatchesCategory(design, designCategoryKeys));
  let noImagesMsg = '';
  if (activeDesignFilter !== 'all') {
    const selectedCategory = categories.find((cat) => cat.id === activeDesignFilter);
    const images = selectedCategory && Array.isArray(selectedCategory.images) ? selectedCategory.images : [];
    if (!images || images.length === 0) {
      noImagesMsg = `<div class="p-4 bg-yellow-50 text-yellow-700 rounded-xl mb-4 text-sm">No images found for this category. Please add images to the category to enable design filtering.</div>`;
    }
  }
  return `
    <div class="spidey-panel p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-display font-bold text-[color:var(--primary)]">âœï¸ Designs</h2>
        <button data-action="reset-design" class="text-xs text-[color:var(--accent)]">Clear</button>
      </div>
      <div class="mb-4 flex flex-wrap items-center gap-2">
        <select id="admin-design-filter" class="px-3 py-2 rounded-xl border border-black/10 text-sm">
          <option value="all" ${activeDesignFilter === 'all' ? 'selected' : ''}>All Categories</option>
          ${categories.map((cat) => `<option value="${cat.id}" ${activeDesignFilter === cat.id ? 'selected' : ''}>${escapeHtml(cat.title || cat.name || cat.id)}</option>`).join('')}
        </select>
        <button type="button" data-action="admin-load-design-category" class="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">Load Designs</button>
        <button type="button" data-action="admin-load-design-all" class="px-3 py-2 rounded-lg border border-black/10 text-slate-600 text-xs font-semibold">Show All</button>
        <span class="text-xs text-slate-400">${filteredDesigns.length} designs</span>
      </div>
      ${noImagesMsg}
      <form data-form="design-form" class="space-y-3">
        <input name="title" value="${escapeHtml(state.admin.designForm.title)}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Design Title" required />
        ${renderEmojiOptions('title')}
        <textarea name="description" class="w-full px-3 py-2 rounded-xl border border-black/10" rows="3" placeholder="Description">${escapeHtml(state.admin.designForm.description)}</textarea>
        ${renderEmojiOptions('description')}
        <select name="categoryId" class="w-full px-3 py-2 rounded-xl border border-black/10" required>
          <option value="">Select category</option>
          ${categories.map((cat) => `<option value="${cat.id}" ${state.admin.designForm.categoryId === cat.id ? 'selected' : ''}>${escapeHtml(cat.title)}</option>`).join('')}
        </select>
        <input name="price" type="number" value="${state.admin.designForm.price}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Selling Price" />
        <input name="cost" type="number" value="${state.admin.designForm.cost || 0}" class="w-full px-3 py-2 rounded-xl border border-black/10" placeholder="Internal Cost" />
        <input name="image" type="file" accept="image/*" class="w-full px-3 py-2 rounded-xl border border-black/10" />
        ${state.admin.designForm.images && state.admin.designForm.images[0] ? `<img src="${escapeHtml(state.admin.designForm.images[0])}" class="w-full h-32 object-cover rounded-xl mt-2" />` : ''}
        <button type="submit" class="w-full py-3 rounded-xl bg-[color:var(--primary)] text-white font-semibold">${state.admin.designForm.id ? 'Update' : 'Add'} Design</button>
      </form>
      <div class="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
        ${filteredDesigns.map(design => `
          <div class="p-3 rounded-xl border border-black/5 flex items-center justify-between">
            <div class="flex items-center gap-3">
              ${renderImageThumb(design.previewImage, design.title, 'w-12 h-12', 'text-[10px]')}
              <div>
                <div class="text-sm font-semibold text-[color:var(--primary)]">${escapeHtml(design.title)}</div>
                <div class="text-[10px] text-slate-400">${escapeHtml(design.categoryId || design.category || 'No Category')} â€¢ Price: ${formatCurrency(getDesignAmount(design as any))}${design.cost ? ` â€¢ Cost: ${formatCurrency(design.cost)}` : ''}</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button data-action="edit-design" data-design-id="${design.id}" class="text-xs text-[color:var(--accent)]">Edit</button>
              <button data-action="save-design" data-design-id="${design.id}" class="text-xs text-emerald-600">Save</button>
              <button data-action="delete-design" data-design-id="${design.id}" class="text-xs text-red-500">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    `;
};

const renderAdminUsersActivitySection = () => {
  return `
    <div class="spidey-panel p-6">
      <h2 class="text-xl font-display font-bold text-[color:var(--primary)] mb-4">ðŸ‘¤ Customers</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-black/10 text-slate-500 uppercase text-[10px] tracking-wider">
              <th class="text-left py-3 px-2">Name</th>
              <th class="text-left py-3 px-2">Email</th>
              <th class="text-center py-3 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${state.users.filter((u: any) => String(u?.role || 'customer').toLowerCase() === 'customer').map(u => `
              <tr class="border-b border-black/5 hover:bg-slate-50">
                <td class="py-3 px-2 font-semibold text-[color:var(--primary)]">${escapeHtml(u.name)}</td>
                <td class="py-3 px-2 text-slate-500">${escapeHtml(u.email)}</td>
                <td class="py-3 px-2 text-center">
                  <button type="button" data-action="view-customer" data-customer-id="${escapeHtml(String(u.id || ''))}" class="text-xs text-[color:var(--accent)] font-semibold hover:underline">View Detail</button>
                </td>
              </tr>
            `).join('')
    }
          </tbody>
        </table>
      </div>
    </div>
    `;
};
