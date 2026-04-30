/* eslint-disable @typescript-eslint/no-explicit-any */
type RefreshOptions = any;
type ChatbotUserType = any;
type Inquiry = any;
declare var state: any;
declare var apiFetch: any;
declare var getAuthHeaders: any;
declare var normalizeBookingRecord: any;
declare var getBookings: any;
declare var getBookingSortScore: any;
declare var ensureAdminToken: any;
declare var shouldRenderRefreshResult: any;
declare var renderStabilized: any;
declare var initAdminChartsWhenVisible: any;
declare var scheduleAdminChartsRetry: any;
declare var mergeServerLikesWithLocalDislikes: any;
declare var updateAdminCharts: any;
declare var logPerf: any;
declare var getPerfNow: any;
declare var CHATBOT_HISTORY_MAX: any;
declare var chatbotHistoryState: any;
declare var persistChatbotHistory: any;
declare var adminRefreshInFlight: any;

const refreshAdminData = async (options: RefreshOptions = {}) => {
  const refreshStart = getPerfNow();
  if (!state.currentUser || state.currentUser.role !== 'admin') {
    // Do not mutate user session to admin implicitly.
    return;
  }
  if (adminRefreshInFlight) return;
  adminRefreshInFlight = true;
  try {

    if (!state.currentUser?.token) {
      await ensureAdminToken();
    }

    const authHeaders = { ...getAuthHeaders() };

    // Check if we need to refresh bookings (cache for 30 seconds)
    const now = Date.now();
    const bookingsLastFetched = (state.admin as any).bookingsLastFetched || 0;
    const bookingsCacheExpiry = 5 * 1000; // 5 seconds

    let bookingsData = null;
    if (now - bookingsLastFetched > bookingsCacheExpiry || options.force || options.forceRefresh) {
      // Fetch bookings with pagination - start with first page
      const bookingParams = new URLSearchParams({
        limit: '100', // Load more bookings initially for admin
        offset: '0'
      });

      // Apply current filters if they exist
      const filter = state.admin.bookingFilter;
      if (filter.approvalStatus && filter.approvalStatus !== 'all') bookingParams.set('status', filter.approvalStatus);
      if (filter.paymentStatus && filter.paymentStatus !== 'all') bookingParams.set('paymentStatus', filter.paymentStatus);
      if (filter.dateFrom) bookingParams.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) bookingParams.set('dateTo', filter.dateTo);

      bookingsData = await apiFetch(`/bookings?${bookingParams}`, { headers: authHeaders }, 8000);
    }

    const criticalFetches = await Promise.allSettled([
      bookingsData || Promise.resolve(null),
      apiFetch('/customers', { headers: authHeaders }, 6000),
      apiFetch('/invoices/all', { headers: authHeaders }, 6000)
    ]);

    const [bookingsResult, customersResult, invoicesResult] = criticalFetches;

    if (bookingsResult.status === 'fulfilled' && bookingsResult.value && bookingsResult.value.ok) {
      const bookingsResponse = bookingsResult.value;
      const bookingsData = await bookingsResponse.json().catch(() => ({} as any));
      if (bookingsData && Array.isArray(bookingsData.bookings)) {
        const serverBookings = bookingsData.bookings.map((booking: any) => normalizeBookingRecord(booking));
        const localBookings = getBookings().map((booking: any) => normalizeBookingRecord(booking));
        const mergedById = new Map<string, any>();

        [...serverBookings, ...localBookings].forEach((booking: any) => {
          const bookingId = String(booking?.id || '').trim();
          if (!bookingId) return;
          if (!mergedById.has(bookingId)) {
            mergedById.set(bookingId, booking);
          }
        });

        state.admin.bookings = [...mergedById.values()].sort((left: any, right: any) => {
          return getBookingSortScore(right) - getBookingSortScore(left);
        });
        (state.admin as any).bookingsLastSyncedAt = new Date().toISOString();
        (state.admin as any).bookingsLastFetched = now;
        (state.admin as any).bookingsPagination = bookingsData.pagination;
        console.log(`âœ… Loaded ${state.admin.bookings.length} bookings from server (${bookingsData.pagination?.total || 0} total)`);
      }
    } else if (!bookingsData) {
      // Using cached data
      console.log(`ðŸ“‹ Using cached bookings data (${state.admin.bookings?.length || 0} bookings)`);
    } else {
      const fallbackLocalBookings = getBookings().map((booking: any) => normalizeBookingRecord(booking));
      if (fallbackLocalBookings.length > 0) {
        state.admin.bookings = fallbackLocalBookings;
        (state.admin as any).bookingsLastSyncedAt = new Date().toISOString();
      }
    }

    if (customersResult.status === 'fulfilled' && customersResult.value.ok) {
      const customersResponse = customersResult.value;
      const customersData = await customersResponse.json().catch(() => ({} as any));
      if (customersData && customersData.success && Array.isArray(customersData.customers)) {
        state.users = customersData.customers.map((customer: any) => ({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          username: customer.username,
          role: String(customer.role || 'customer').trim().toLowerCase() === 'admin' ? 'admin' : 'customer',
          phone: String(customer.phone || '').trim() || undefined,
          address: String(customer.address || '').trim() || undefined,
          location: String(customer.location || '').trim() || undefined,
          pincode: String(customer.pincode || '').trim() || undefined,
          bio: String(customer.bio || '').trim() || undefined,
          profilePhoto: String(customer.profilePhoto || '').trim() || undefined,
          createdAt: customer.createdAt
        }));
      }
    }

    if (invoicesResult.status === 'fulfilled' && invoicesResult.value.ok) {
      const invoicesResponse = invoicesResult.value;
      const invoicesData = await invoicesResponse.json().catch(() => ({} as any));
      state.admin.invoices = Array.isArray(invoicesData?.invoices) ? invoicesData.invoices : [];
    }

    if (shouldRenderRefreshResult(options) && state.activeTab === 'admin' && state.currentUser?.role === 'admin') {
      renderStabilized();
    }

    if (state.activeTab === 'admin' && state.currentUser?.role === 'admin') {
      requestAnimationFrame(() => {
        initAdminChartsWhenVisible();
        scheduleAdminChartsRetry();
      });
    }

    void Promise.allSettled([
      apiFetch('/ai/designs', { headers: authHeaders }, 4500),
      apiFetch('/likes', { headers: authHeaders }, 4500),
      apiFetch('/feedbacks', { headers: authHeaders }, 4500),
      // Cache enquiries for 60 seconds
      (() => {
        const now = Date.now();
        const enquiriesLastFetched = (state.admin as any).enquiriesLastFetched || 0;
        const enquiriesCacheExpiry = 60 * 1000; // 60 seconds
        return now - enquiriesLastFetched > enquiriesCacheExpiry
          ? apiFetch('/enquiries?limit=100', { headers: authHeaders }, 4500)
          : Promise.resolve(null);
      })(),
      apiFetch('/chatbot/history', { headers: authHeaders }, 4500)
    ]).then(async (results) => {
      const [aiResult, likesResult, feedbacksResult, enquiriesResult, chatbotHistoryResult] = results;

      if (aiResult.status === 'fulfilled' && aiResult.value.ok) {
        const aiResponse = aiResult.value;
        const aiData = await aiResponse.json().catch(() => ({} as any));
        if (aiData && Array.isArray(aiData.designs)) {
          state.admin.aiDesigns = aiData.designs;
        }
      }

      if (likesResult.status === 'fulfilled' && likesResult.value.ok) {
        const likesResponse = likesResult.value;
        const likesData = await likesResponse.json().catch(() => ({} as any));
        if (likesData && likesData.success && Array.isArray(likesData.likes)) {
          state.customer.likes = mergeServerLikesWithLocalDislikes(likesData.likes);
        }
      }

      if (feedbacksResult.status === 'fulfilled' && feedbacksResult.value.ok) {
        const feedbacksResponse = feedbacksResult.value;
        const feedbacksData = await feedbacksResponse.json().catch(() => ({} as any));
        if (feedbacksData && feedbacksData.success && Array.isArray(feedbacksData.feedbacks)) {
          const mappedFeedbacks = feedbacksData.feedbacks.map((feedback: any) => ({
            id: feedback.id,
            userId: feedback.customerId || feedback.userId || '',
            userName: feedback.userName || 'Customer',
            rating: feedback.rating,
            comment: feedback.comment,
            designId: feedback.designId || 'chatbot-general',
            createdAt: feedback.createdAt || new Date().toISOString()
          }));
          state.customer.feedbacks = mappedFeedbacks;
          state.feedbacks = [...mappedFeedbacks];
        }
      }

      if (enquiriesResult.status === 'fulfilled' && enquiriesResult.value && enquiriesResult.value.ok) {
        const enquiriesResponse = enquiriesResult.value;
        const enquiriesData = await enquiriesResponse.json().catch(() => ({} as any));
        if (enquiriesData && enquiriesData.success && Array.isArray(enquiriesData.enquiries)) {
          state.inquiries = enquiriesData.enquiries.map((inquiry: any) => ({
            id: inquiry.id,
            userId: inquiry.userId,
            name: inquiry.name || 'Guest',
            email: inquiry.email || '',
            message: inquiry.message || '',
            status: (inquiry.status as Inquiry['status']) || 'new',
            createdAt: inquiry.createdAt || new Date().toISOString(),
            isReadByAdmin: Boolean(inquiry.isReadByAdmin)
          }));
          (state.admin as any).enquiriesLastFetched = now;
          console.log(`âœ… Loaded ${state.inquiries.length} enquiries from server`);
        }
      } else if (enquiriesResult.status === 'rejected') {
        // Using cached enquiries data
        console.log(`ðŸ“‹ Using cached enquiries data (${state.inquiries?.length || 0} enquiries)`);
      }

      if (chatbotHistoryResult.status === 'fulfilled' && chatbotHistoryResult.value.ok) {
        const historyResponse = chatbotHistoryResult.value;
        const historyData = await historyResponse.json().catch(() => ({} as any));
        if (historyData && historyData.success && Array.isArray(historyData.history)) {
          const mappedHistory = historyData.history.map((item: any) => ({
            id: String(item.id || `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`),
            userType: (item.userType || (item.customerId ? 'registered' : 'newGuest')) as ChatbotUserType,
            userId: String(item.customerId || 'guest'),
            userName: String(item.userName || 'Customer'),
            query: String(item.query || ''),
            response: String(item.response || ''),
            createdAt: String(item.createdAt || new Date().toISOString()),
            customerEmail: String(item.customerEmail || '')
          }));
          chatbotHistoryState = mappedHistory.slice(0, CHATBOT_HISTORY_MAX);
          persistChatbotHistory();
        }
      }

      if (state.activeTab === 'admin' && state.currentUser?.role === 'admin') {
        updateAdminCharts();
      }
    }).catch((backgroundError) => {
      console.warn('Background admin refresh failed:', backgroundError);
    });
  } catch (error) {
    console.warn('Failed to refresh admin data:', error);
  }

  logPerf('refreshAdminData', refreshStart);
  adminRefreshInFlight = false;
};

