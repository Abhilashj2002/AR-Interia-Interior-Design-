const getEnhancedChatbotResponse = (userMessage: string): { text: string; quickReplies?: string[]; bookingIntent: boolean; suggestionIntent: boolean } => {
  const trimmed = String(userMessage || '').trim();
  const lower = trimmed.toLowerCase();

  if (!chatbotSettingsState.enabled) {
    return {
      text: 'ðŸ’¤ Chat assistant is temporarily disabled by admin. Please use the Inquiry page or call +91 8904712858.',
      quickReplies: ['Go to Inquiry', 'Call Us'],
      bookingIntent: false,
      suggestionIntent: false
    };
  }

  const bookingIntent = bookingIntentPattern.test(lower);
  const explicitSuggestionIntent = suggestionIntentPattern.test(lower);
  const interest = detectCustomerInterest(lower);
  const suggestionIntent = explicitSuggestionIntent || Boolean(interest);

  if (bookingIntent) {
    if (!state.currentUser?.id) {
      return {
        text: 'ðŸ” To book a consultation, please sign in first so we can securely save your booking details and updates.',
        quickReplies: ['Sign In to Book', 'View Services', 'Pricing Info'],
        bookingIntent: true,
        suggestionIntent
      };
    }
    return {
      text: chatbotSettingsState.bookingReply,
      quickReplies: ['Go to Inquiry', 'Book Consultation', 'Pricing Info'],
      bookingIntent: true,
      suggestionIntent
    };
  }

  if (suggestionIntent) {
    const interestKey = interest || 'design';
    const suggestions = getDesignSuggestionsByInterest(interestKey)
      .map((design, index) => `${index + 1}. ${resolveDesignDisplayName(design, { imageUrl: design.previewImage, categoryId: design.categoryId })} â€” ${formatCurrency(getDesignAmount(design as any))}`)
      .join('\n');
    const suggestionText = suggestions
      ? `${chatbotSettingsState.suggestionsIntro}\n\n${suggestions}\n\nTap **View Gallery** to explore more and open 3D previews.`
      : `${chatbotSettingsState.suggestionsIntro}\n\nPlease open the gallery to explore current collections.`;
    return {
      text: suggestionText,
      quickReplies: ['View Gallery', 'Book Consultation', 'Pricing Info'],
      bookingIntent,
      suggestionIntent: true
    };
  }

  // Feedback intent â€” start the inline feedback flow
  const feedbackIntent = /\b(feedback|leave feedback|rate us|give rating|my review|submit feedback|review us|rate experience)\b/.test(lower);
  if (feedbackIntent) {
    if (!state.currentUser?.id) {
      return {
        text: `â­ Want to leave feedback? Please **sign in** first so we can save your review.`,
        quickReplies: ['Sign In', 'View Services', 'Pricing Info'],
        bookingIntent: false,
        suggestionIntent: false
      };
    }
    state.chatbot.feedbackStep = 'awaiting-rating';
    return {
      text: `â­ **We'd love your feedback!**\n\nHow would you rate your overall experience with AR Interia?\n\n_1 = Poor Â· 5 = Excellent_`,
      quickReplies: ['1 â­ Poor', '2 â­â­ Fair', '3 â­â­â­ Good', '4 â­â­â­â­ Great', '5 â­â­â­â­â­ Excellent'],
      bookingIntent: false,
      suggestionIntent: false
    };
  }

  // My Activity intent â€” switch chatbot to activity tab
  const activityIntent = /\b(my activity|my bookings|my history|what i liked|my orders|my profile|my likes|my feedback)\b/.test(lower);
  if (activityIntent && state.currentUser?.id) {
    state.chatbot.activeTab = 'activity';
    return {
      text: `ðŸ“Š I've opened your **Activity Summary**! Check your recent bookings, liked designs, and past feedback in the My Activity tab above.`,
      quickReplies: ['Leave Feedback', 'View Gallery', 'Book Consultation'],
      bookingIntent: false,
      suggestionIntent: false
    };
  }

  const fallback = getBotResponse(trimmed);
  return {
    text: fallback.text,
    quickReplies: fallback.quickReplies,
    bookingIntent,
    suggestionIntent
  };
};

const trackChatbotMessageStats = (response: { bookingIntent: boolean; suggestionIntent: boolean }) => {
  const userType = getChatbotUserType();
  chatbotStatsState.totalMessages += 1;
  if (response.bookingIntent) chatbotStatsState.bookingIntents += 1;
  if (response.suggestionIntent) chatbotStatsState.suggestionIntents += 1;
  if (userType === 'registered') chatbotStatsState.registeredMessages += 1;
  if (userType === 'newGuest') chatbotStatsState.newGuestMessages += 1;
  if (userType === 'returningGuest') chatbotStatsState.returningGuestMessages += 1;
  updateGuestChatbotProfileAfterMessage();
  chatbotStatsState.lastUpdated = new Date().toISOString();
  persistChatbotStats();
  if (state.activeTab === 'admin') {
    render();
  }
};

