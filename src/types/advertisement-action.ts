
export type CreateAdvertisementState = {
  fieldErrors?: {
    title?: string[];
    description?: string[];
    price?: string[];
    categoryId?: string[];
    locationId?: string[];
     images?: string[];
  };
  message?: string;
};