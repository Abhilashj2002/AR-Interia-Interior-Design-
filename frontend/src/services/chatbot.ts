import { ChatMessage } from '../types';

interface BotRule {
    keywords: string[];
    response: string;
    quickReplies?: string[];
}

const RULES: BotRule[] = [
    {
        keywords: ['hello', 'hi', 'hey', 'namaste', 'good morning', 'good evening', 'start'],
        response: `👋 Welcome to **AR Interia**! I'm Aria, your personal design assistant.\n\nI can help you with:\n• Our services & pricing\n• Booking a design consultation\n• Interior design inspiration\n• Gallery & portfolio\n• Luxury showrooms`,
        quickReplies: ['View Services', 'Book Consultation', 'Pricing Info', 'Our Portfolio']
    },
    {
        keywords: ['price', 'cost', 'how much', 'rate', 'inr', 'budget', 'charges', 'pricing', 'fees', 'package'],
        response: `💰 **Our Pricing Packages:**\n\n🥉 **Essential** — ₹2.4L+\nKitchens, bathrooms, single rooms\n\n🥈 **Premium** — ₹3.2L–5L\nFull-home design with premium finishes\n\n🥇 **Luxury** — ₹5L–15L+\nBespoke furniture, custom fabrication, end-to-end project management\n\nAll packages include design previews before construction begins!`,
        quickReplies: ['Book Consultation', 'View Designs', 'Contact Us']
    },
    {
        keywords: ['book', 'appointment', 'consult', 'schedule', 'meet', 'visit', 'call', 'enquire', 'inquiry'],
        response: `📅 **Ready to Book a Consultation?**\n\n1. Go to our **Inquiry** page\n2. Fill in your name, email & project details\n3. Our team will reach out within **24 hours**\n\nOr call us directly:\n📞 +91 8904712858`,
        quickReplies: ['Go to Inquiry', 'Call Us', 'Our Services']
    },
    {
        keywords: ['service', 'what do you do', 'offer', 'work', 'design', 'interior'],
        response: `🏠 **Our Services:**\n\n🖼️ **Gallery** — Explore our curated design inspirations\n💡 **Design Studio** — AI-powered design variants (login required)\n🛋️ **Luxury Showrooms** — Explore curated furniture & finishes\n🏗️ **Custom Fabrication** — Bespoke furniture & cabinetry\n🏡 **Smart Home Setup** — Integrated lighting & automation\n📐 **Full Interior Design** — Kitchen, bedroom, living & more`,
        quickReplies: ['Gallery', 'Design Studio', 'Luxury Showroom', 'Pricing Info', 'Categories']
    },
    {
        keywords: ['bedroom', 'living room', 'kitchen', 'bathroom', 'office', 'dining', 'pooja', 'balcony', 'gym', 'spa'],
        response: `🛏️ **Room Design Specializations:**\n\nWe design every room in your home:\n🛏️ Bedrooms & Master Suites\n🛋️ Living Rooms & Lounges\n🍳 Kitchens (modular & custom)\n🛁 Bathrooms & Wet Rooms\n🍽️ Dining Areas\n🏢 Home Offices\n🧘 Meditation / Pooja Rooms\n🌿 Balconies & Terraces\n💪 Home Gyms & Spas\n\nExplore our **Gallery** for inspiration!`,
        quickReplies: ['View Gallery', 'Browse Designs', 'Get Pricing']
    },
    {
        keywords: ['gallery', 'photos', 'images', 'portfolio', 'projects', 'examples', 'past work', 'showcase'],
        response: `📸 **Our Portfolio & Gallery**\n\nBrowse **150+ premium interior designs** across all room categories — from minimalist Japandi kitchens to royal Rajasthani living rooms.\n\nYou can also explore our **Portfolio** section for behind-the-scenes design stories and team info.`,
        quickReplies: ['Open Gallery', 'View Portfolio', 'Browse Categories']
    },
    {
        keywords: ['showroom', 'luxury', 'furniture', 'sofa', 'marble', 'wardrobe', 'display'],
        response: `👑 **Luxury Showroom**\n\nVisit our virtual showroom featuring:\n🏠 **Luxury Houses** — Villas, bungalows, premium flats\n🏢 **Luxury Apartments** — Studio to penthouse designs\n\nBrowse room by room and find your inspiration. Each item is available for order!`,
        quickReplies: ['Open Showroom', 'Browse Categories', 'Pricing Info']
    },
    {
        keywords: ['contact', 'address', 'location', 'phone', 'email', 'reach', 'where', 'find you'],
        response: `📍 **Contact AR Interia:**\n\n📞 +91 8904712858\n📧 support@arinteria.com\n🗺️ Main Rd, Indiranagar, Bengaluru\n\n⏰ Mon–Sat: 9:00 AM – 7:00 PM\n\nFeel free to reach out — we typically respond within a few hours!`,
        quickReplies: ['Go to Inquiry', 'Book Consultation']
    },
    {
        keywords: ['time', 'duration', 'how long', 'deadline', 'weeks', 'months', 'timeline', 'complete'],
        response: `⏳ **Project Timelines:**\n\n• **Single Room** — 3–5 weeks\n• **2–3 Room Home** — 6–8 weeks\n• **Full Apartment** — 8–12 weeks\n• **Villa / Bungalow** — 12–20 weeks\n\nTimelines include design approval, material procurement, and installation.`,
        quickReplies: ['Book Consultation', 'Pricing Info']
    },
    {
        keywords: ['ai', 'artificial intelligence', 'smart', 'studio', 'generate', 'ai design', 'ai studio', 'design studio'],
        response: `💡 **Design Studio**\n\nOur built-in Design Studio lets you:\n1. Describe your dream room in words\n2. Upload a photo of your current space\n3. Get **AI-generated design variants** instantly\n4. Compare up to 4 design options side-by-side\n\n<span class='font-semibold text-[color:var(--primary)]'>Login required to use Design Studio.</span>`,
        quickReplies: ['Open Design Studio', 'View Gallery', 'Book Consultation']
    },
        {
            keywords: ['gallery', 'show gallery', 'open gallery', 'view gallery'],
            response: `🖼️ **Gallery**\n\nBrowse our gallery to see real project photos and design inspirations for every room and style.\n\nYou can filter by room type, style, or package.`,
            quickReplies: ['Browse Categories', 'Best Packages', 'Open Design Studio']
        },
        {
            keywords: ['categories', 'category', 'room categories', 'browse categories'],
            response: `📂 **Categories**\n\nWe offer curated designs for every room category: Living Room, Bedroom, Kitchen, Bathroom, Office, and more.\n\nSelect a category to see the best packages and gallery for that room.`,
            quickReplies: ['Show Best Package', 'View Gallery', 'Open Design Studio']
        },
        {
            keywords: ['package', 'packages', 'best package', 'show best package'],
            response: `🎁 **Best Packages**\n\nWe recommend the best package for each category based on your needs and budget.\n\nAsk for a room (e.g., "best package for kitchen") to get a tailored suggestion.`,
            quickReplies: ['Get Quote', 'Browse Categories', 'Open Design Studio']
        },
    {
        keywords: ['login', 'sign in', 'account', 'register', 'sign up', 'customer', 'dashboard', 'profile'],
        response: `🔐 **Account & Login**\n\n**Customers** can sign in to:\n• Track active bookings\n• View payment history\n• Save favorite designs\n• Access AI-generated designs\n\n**To sign in:** Click the **Sign In** button in the top right corner.\n\nNew here? You can register a new account from the same page!`,
        quickReplies: ['Sign In', 'View Services']
    },
    {
        keywords: ['payment', 'pay', 'upi', 'phonepe', 'razorpay', 'online payment', 'emi', 'installment'],
        response: `💳 **Payment Options:**\n\n✅ **UPI / PhonePe** — Instant digital payments\n✅ **Bank Transfer (NEFT/RTGS)** — For large projects\n✅ **EMI Options** — Available through partner banks\n\n**Payment Schedule:**\n• 30% advance on booking\n• 40% at material procurement\n• 30% on project completion\n\nAll payments are fully receipted and secure.`,
        quickReplies: ['Book Consultation', 'Contact Us']
    },
    {
        keywords: ['team', 'designer', 'who', 'founder', 'staff', 'expert', 'experience', 'years'],
        response: `👥 **The AR Interia Team:**\n\n👨‍💼 **Abhilash J** — Founder & CEO\nVisionary behind our design-first approach\n\n🧑‍🎨 **Ramesh** — Co-Founder\nLeading design innovation and studio operations\n\nWith **1400+ designers** across India and projects in **4+ cities**, we've been crafting premium spaces since **2004**.`,
        quickReplies: ['View Portfolio', 'Book Consultation']
    },
    {
        keywords: ['vastu', 'feng shui', 'traditional', 'indian', 'ethnic', 'rajasthani', 'mughal', 'heritage', 'classical'],
        response: `🏛️ **Traditional & Vastu-Aware Design:**\n\nWe blend Indian heritage aesthetics with modern luxury:\n\n🕌 Mughal-inspired arches & jaali work\n🌺 Rajasthani motifs & handcrafted elements\n🪔 Vastu-compliant layouts on request\n🎯 Pooja room & meditation spaces\n\nOur designers are experienced in creating spaces that honor Indian culture while embracing contemporary comfort.`,
        quickReplies: ['View Gallery', 'Book Consultation', 'Browse Rooms']
    },
    {
        keywords: ['thank', 'thanks', 'bye', 'goodbye', 'great', 'awesome', 'perfect', 'nice', 'good', 'helpful', 'ok'],
        response: `😊 You're so welcome! It was a pleasure helping you.\n\nRemember, your dream home is just one call away. Don't hesitate to reach out anytime!\n\n✨ **AR Interia** — *Modern Luxury, Perfected.*`,
        quickReplies: ['Book Consultation', 'View Gallery', 'Contact Us']
    }
];

const FALLBACK_RESPONSES = [
    `🤔 I'm not sure about that specific topic, but I'd love to help!\n\nYou can ask me about:\n• **Services & pricing**\n• **Booking a consultation**\n• **Room designs & inspiration**\n• **Our team & locations**`,
    `I didn't quite catch that — could you rephrase? I'm here to help with anything related to interior design, our services, or booking! 😊`,
    `Hmm, that's a specific one! For detailed questions, our team is always available:\n📞 +91 8904712858\n📧 support@arinteria.com`
];

export const getBotResponse = (userMessage: string): { text: string; quickReplies?: string[] } => {
    const msg = userMessage.toLowerCase().trim();

    for (const rule of RULES) {
        if (rule.keywords.some(kw => msg.includes(kw))) {
            return { text: rule.response, quickReplies: rule.quickReplies };
        }
    }

    const fallback = FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    return {
        text: fallback,
        quickReplies: ['Our Services', 'Pricing Info', 'Book Consultation', 'Contact Us']
    };
};

export const getQuickAction = (label: string): string => {
    const map: Record<string, string> = {
        'View Services': 'Tell me about your services',
        'Book Consultation': 'How do I book a consultation?',
        'Pricing Info': 'What are your prices?',
        'Our Portfolio': 'Show me your portfolio',
        'Contact Us': 'How can I contact you?',
        'View Gallery': 'I want to see your gallery',
        'Browse Designs': 'Show me your designs',
        'Open Gallery': 'Take me to the gallery',
        'Open AI Studio': 'Tell me about the AI design studio',
        'Open Showroom': 'What is the luxury showroom?',
        'Browse Categories': 'What room categories do you have?',
        '3D Visualization': 'How does your 3D visualization work?',
        'AI Studio': 'Tell me about the AI design studio',
        'Luxury Showroom': 'Tell me about the luxury showroom',
        'Call Us': 'What is your phone number?',
        'Go to Inquiry': 'I want to submit an inquiry',
        'Sign In': 'How do I sign in or create an account?',
        'Browse Rooms': 'What rooms do you specialize in?',
        'Get Pricing': 'What are your pricing packages?',
        'Try AI Studio': 'Tell me about the AI design studio',
        'View Portfolio': 'Show me your portfolio',
    };
    return map[label] || label;
};

export const createMessage = (role: 'user' | 'bot', text: string, quickReplies?: string[]): ChatMessage => ({
    id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
    quickReplies
});
