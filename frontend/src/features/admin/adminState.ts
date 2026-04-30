/**
 * Admin State Management - Centralized admin UI/data state
 */

import type { AdminState, Category, DesignModel, Showroom, ServiceItem, ServiceShowcase, Announcement, Package } from '../../types';

export const createInitialAdminState = (): AdminState => ({
  editingId: null,
  categoryForm: {} as Partial<Category>,
  designForm: {} as Partial<DesignModel>,
  showroomForm: {} as Partial<Showroom>,
  serviceForm: {} as Partial<ServiceItem>,
  showcaseForm: {} as Partial<ServiceShowcase>,
  announcementForm: {} as Partial<Announcement>,
  packageForm: {} as Partial<Package>,
  chatbotForm: {
    ruleId: null,
    keywords: '',
    response: '',
    quickReplies: ''
  },
  viewingBookingId: null,
  designEditOpen: false,
  focusSection: 'dashboard',
  bookingFilter: {
    query: '',
    categoryId: 'all',
    dateFrom: '',
    dateTo: '',
    paymentStatus: 'all',
    approvalStatus: 'all'
  },
  invoices: [],
  invoiceFilter: {
    query: '',
    status: 'all'
  },
  bookings: [],
  aiDesigns: [],
  catalogFilter: 'all',
  catalogFilterDraft: '',
  packageCategoryFilter: 'all',
  packageCategoryFilterDraft: '',
  calculatorSettings: {} as any,
  calculatorForm: {} as any,
  calculatorTab: 'settings'
});

export const adminStateService = {
  /**
   * Reset admin state to initial
   */
  reset: (): AdminState => {
    return createInitialAdminState() as AdminState;
  },

  /**
   * Update specific admin field
   */
  updateField: (state: AdminState, field: keyof AdminState, value: any): AdminState => {
    return {
      ...state,
      [field]: value
    };
  },

  /**
   * Clear focused item
   */
  clearFocus: (state: AdminState): AdminState => {
    return {
      ...state,
      focusSection: undefined
    };
  },

  /**
   * Reset all filters
   */
  resetFilters: (state: AdminState): AdminState => {
    return {
      ...state,
      invoiceFilter: { status: 'all', query: '' },
      bookingFilter: {
        query: '',
        categoryId: 'all',
        dateFrom: '',
        dateTo: '',
        paymentStatus: 'all',
        approvalStatus: 'all'
      },
      catalogFilter: 'all'
    };
  }
};
