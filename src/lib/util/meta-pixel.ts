// Meta Pixel utility for tracking ecommerce events
// https://developers.facebook.com/docs/meta-pixel/reference

declare global {
  interface Window {
    fbq: any;
  }
}

export interface MetaPixelProduct {
  content_id: string;
  content_name: string;
  content_category?: string;
  content_type?: string;
  value?: number;
  currency?: string;
  quantity?: number;
}

export interface MetaPixelPurchaseData {
  content_ids: string[];
  contents: MetaPixelProduct[];
  currency: string;
  value: number;
  num_items: number;
}

export interface MetaPixelSearchData {
  search_string: string;
  content_category?: string;
}

export interface MetaPixelAddToCartData {
  content_ids: string[];
  contents: MetaPixelProduct[];
  currency: string;
  value: number;
}

export interface MetaPixelViewContentData {
  content_ids: string[];
  contents: MetaPixelProduct[];
  content_type: string;
  currency: string;
  value: number;
}

export interface MetaPixelInitiateCheckoutData {
  content_ids: string[];
  contents: MetaPixelProduct[];
  currency: string;
  value: number;
  num_items: number;
}

// Check if Meta Pixel is loaded
export const isMetaPixelLoaded = (): boolean => {
  return typeof window !== 'undefined' && typeof window.fbq !== 'undefined';
};

// Enhanced error handling wrapper
const safeTrack = (eventName: string, eventData: any, callback: () => void): void => {
  if (!isMetaPixelLoaded()) {
    console.warn(`Meta Pixel not loaded. Skipping ${eventName} event.`);
    return;
  }
  
  try {
    callback();
  } catch (error) {
    console.error(`Meta Pixel tracking error for ${eventName}:`, error);
  }
};

// Track PageView event (already handled in layout)
export const trackPageView = (): void => {
  safeTrack('PageView', null, () => {
    window.fbq('track', 'PageView');
  });
};

// Track ViewContent event (product page views)
export const trackViewContent = (data: MetaPixelViewContentData): void => {
  safeTrack('ViewContent', data, () => {
    window.fbq('track', 'ViewContent', {
      content_ids: data.content_ids,
      contents: data.contents,
      content_type: data.content_type,
      currency: data.currency,
      value: data.value
    });
  });
};

// Track AddToCart event
export const trackAddToCart = (data: MetaPixelAddToCartData): void => {
  safeTrack('AddToCart', data, () => {
    window.fbq('track', 'AddToCart', {
      content_ids: data.content_ids,
      contents: data.contents,
      currency: data.currency,
      value: data.value
    });
  });
};

// Track InitiateCheckout event
export const trackInitiateCheckout = (data: MetaPixelInitiateCheckoutData): void => {
  safeTrack('InitiateCheckout', data, () => {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: data.content_ids,
      contents: data.contents,
      currency: data.currency,
      value: data.value,
      num_items: data.num_items
    });
  });
};

// Track Purchase event
export const trackPurchase = (data: MetaPixelPurchaseData): void => {
  safeTrack('Purchase', data, () => {
    window.fbq('track', 'Purchase', {
      content_ids: data.content_ids,
      contents: data.contents,
      currency: data.currency,
      value: data.value,
      num_items: data.num_items
    });
  });
};

// Track Search event
export const trackSearch = (data: MetaPixelSearchData): void => {
  safeTrack('Search', data, () => {
    window.fbq('track', 'Search', {
      search_string: data.search_string,
      content_category: data.content_category
    });
  });
};

// Track Lead event (newsletter signups, contact forms)
export const trackLead = (): void => {
  safeTrack('Lead', null, () => {
    window.fbq('track', 'Lead');
  });
};

// Track CompleteRegistration event
export const trackCompleteRegistration = (): void => {
  safeTrack('CompleteRegistration', null, () => {
    window.fbq('track', 'CompleteRegistration');
  });
};

// Track Contact event
export const trackContact = (): void => {
  safeTrack('Contact', null, () => {
    window.fbq('track', 'Contact');
  });
};

// Track custom events
export const trackCustomEvent = (eventName: string, parameters?: any): void => {
  safeTrack(eventName, parameters, () => {
    window.fbq('trackCustom', eventName, parameters);
  });
};

// Helper function to convert Medusa product to Meta Pixel format
export const convertProductToMetaPixel = (product: any): MetaPixelProduct => {
  const variant = product.variants?.[0];
  const price = variant?.calculated_price || variant?.prices?.[0]?.amount || 0;
  
  return {
    content_id: product.id,
    content_name: product.title,
    content_category: product.categories?.[0]?.name || product.type?.value || 'General',
    content_type: 'product',
    value: Math.round((price / 100) * 100) / 100, // Round to 2 decimal places
    currency: 'EUR',
    quantity: 1
  };
};

// Helper function to convert cart items to Meta Pixel format
export const convertCartItemsToMetaPixel = (items: any[]): MetaPixelProduct[] => {
  return items.map(item => ({
    content_id: item.variant_id || item.id,
    content_name: item.title,
    content_category: item.product?.categories?.[0]?.name || item.product?.type?.value || 'General',
    content_type: 'product',
    value: Math.round(((item.unit_price || 0) / 100) * 100) / 100, // Round to 2 decimal places
    currency: 'EUR',
    quantity: item.quantity || 1
  }));
};

// Helper function to calculate total value from cart items
export const calculateCartValue = (items: any[]): number => {
  const total = items.reduce((sum, item) => {
    const price = (item.unit_price || 0) / 100;
    const quantity = item.quantity || 1;
    return sum + (price * quantity);
  }, 0);
  
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}; 