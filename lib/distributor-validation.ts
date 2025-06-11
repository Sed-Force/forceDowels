import { z } from "zod";

export const distributorApplicationSchema = z.object({
  // Contact Information
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  emailAddress: z.string().email("Please enter a valid email address"),
  
  // Business Address
  street: z.string().min(5, "Street address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  
  // Business Details
  businessType: z.enum([
    "retailer",
    "wholesaler", 
    "installer",
    "contractor",
    "online-store",
    "other"
  ], {
    required_error: "Please select a business type",
  }),
  businessTypeOther: z.string().optional(),
  yearsInBusiness: z.coerce.number().min(0, "Years in business must be 0 or greater"),
  territory: z.string().min(10, "Please describe your territory/coverage area"),
  purchaseVolume: z.enum([
    "less-than-500",
    "500-1000", 
    "1000-5000",
    "5000-plus"
  ], {
    required_error: "Please select estimated monthly purchase volume",
  }),
  
  // Additional Information
  sellsSimilarProducts: z.enum(["yes", "no"], {
    required_error: "Please select yes or no",
  }),
  similarProductsDetails: z.string().optional(),
  hearAboutUs: z.enum([
    "trade-show",
    "referral",
    "online-search", 
    "social-media",
    "other"
  ], {
    required_error: "Please select how you heard about us",
  }),
  hearAboutUsOther: z.string().optional(),
}).refine((data) => {
  // If business type is "other", require businessTypeOther
  if (data.businessType === "other" && !data.businessTypeOther?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Please specify your business type",
  path: ["businessTypeOther"],
}).refine((data) => {
  // If sells similar products is "yes", require details
  if (data.sellsSimilarProducts === "yes" && !data.similarProductsDetails?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Please specify what similar products you sell",
  path: ["similarProductsDetails"],
}).refine((data) => {
  // If heard about us is "other", require hearAboutUsOther
  if (data.hearAboutUs === "other" && !data.hearAboutUsOther?.trim()) {
    return false;
  }
  return true;
}, {
  message: "Please specify how you heard about us",
  path: ["hearAboutUsOther"],
});

export type DistributorApplicationFormData = z.infer<typeof distributorApplicationSchema>;

// Helper functions for form options
export const businessTypeOptions = [
  { value: "retailer", label: "Retailer" },
  { value: "wholesaler", label: "Wholesaler" },
  { value: "installer", label: "Installer" },
  { value: "contractor", label: "Contractor" },
  { value: "online-store", label: "Online Store" },
  { value: "other", label: "Other" },
];

export const purchaseVolumeOptions = [
  { value: "less-than-500", label: "Less than 500 units" },
  { value: "500-1000", label: "500–1,000 units" },
  { value: "1000-5000", label: "1,000–5,000 units" },
  { value: "5000-plus", label: "5,000+ units" },
];

export const hearAboutUsOptions = [
  { value: "trade-show", label: "Trade Show" },
  { value: "referral", label: "Referral" },
  { value: "online-search", label: "Online Search" },
  { value: "social-media", label: "Social Media" },
  { value: "other", label: "Other" },
];

// US States for the dropdown
export const usStates = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];
