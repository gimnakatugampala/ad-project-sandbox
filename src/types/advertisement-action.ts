
export type CreateAdvertisementState = {
  fieldErrors?: {
    title?: string[];
    description?: string[];
    price?: string[];
    categoryId?: string[];
    locationId?: string[];
  };
  message?: string;
};