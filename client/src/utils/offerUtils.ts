import type { CategoryOffer } from '../types/fashion';

export interface CalculatedPrice {
  originalPrice: number;
  discountPercentage: number;
  discountAmount: number;
  finalPrice: number;
  hasOffer: boolean;
  offerName?: string;
}

/**
 * Calculates discounted price for a product based on active category offers.
 * discountAmount = originalPrice * discountPercentage / 100
 * finalPrice = originalPrice - discountAmount
 */
export const getCalculatedPrice = (
  originalPrice: number,
  categoryIdOrSlug: string,
  categoryName?: string,
  offers: CategoryOffer[] = []
): CalculatedPrice => {
  if (!originalPrice || isNaN(originalPrice) || originalPrice <= 0) {
    return {
      originalPrice: 0,
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: 0,
      hasOffer: false,
    };
  }

  if (!offers || offers.length === 0) {
    return {
      originalPrice,
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: originalPrice,
      hasOffer: false,
    };
  }

  // Find active offer matching categoryId or categoryName
  const activeOffer = offers.find((o) => {
    if (!o.isActive) return false;
    const matchId = o.categoryId && (o.categoryId === categoryIdOrSlug);
    const matchName =
      categoryName &&
      o.categoryName &&
      o.categoryName.trim().toLowerCase() === categoryName.trim().toLowerCase();
    return matchId || matchName;
  });

  if (!activeOffer || !activeOffer.discountPercentage || activeOffer.discountPercentage <= 0) {
    return {
      originalPrice,
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: originalPrice,
      hasOffer: false,
    };
  }

  const discountPercentage = activeOffer.discountPercentage;
  const discountAmount = Math.round((originalPrice * discountPercentage) / 100);
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    originalPrice,
    discountPercentage,
    discountAmount,
    finalPrice,
    hasOffer: true,
    offerName: activeOffer.name,
  };
};
