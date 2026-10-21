export type Product = {
  id: string;
  name: string;
  model: string;
  brand: string;
  category: string;
  description: string;
  status: "Active" | "Inactive";
  imageCount: number;
  thumbnail: string;
};

const img = (seed: string, w = 400) =>
  `https://picsum.photos/seed/${seed}/${w}/${w}`;

export const mockProducts: Product[] = [
  { id: "P001", name: "AirPods Pro", model: "APP-2024", brand: "Apple", category: "Audio", description: "Active noise cancelling wireless earbuds with spatial audio.", status: "Active", imageCount: 12, thumbnail: img("airpods") },
  { id: "P002", name: "Galaxy Watch 6", model: "GW6-44MM", brand: "Samsung", category: "Wearables", description: "Premium smartwatch with health tracking suite.", status: "Active", imageCount: 8, thumbnail: img("watch") },
  { id: "P003", name: "Pixel 8 Pro", model: "PX8P-256", brand: "Google", category: "Smartphone", description: "Flagship Android phone with Tensor G3 chip.", status: "Active", imageCount: 16, thumbnail: img("pixel") },
  { id: "P004", name: "MX Master 3S", model: "MXM3S-GR", brand: "Logitech", category: "Accessories", description: "Performance wireless mouse for productivity.", status: "Active", imageCount: 6, thumbnail: img("mouse") },
  { id: "P005", name: "Kindle Oasis", model: "KO-32GB", brand: "Amazon", category: "E-Reader", description: "Premium e-reader with adjustable warm light.", status: "Inactive", imageCount: 4, thumbnail: img("kindle") },
  { id: "P006", name: "Sony WH-1000XM5", brand: "Sony", model: "WH1KXM5", category: "Audio", description: "Industry-leading noise cancelling over-ear headphones.", status: "Active", imageCount: 10, thumbnail: img("sonyhp") },
  { id: "P007", name: "iPad Air M2", model: "IPA-M2-128", brand: "Apple", category: "Tablet", description: "Lightweight tablet powered by M2 chip.", status: "Active", imageCount: 9, thumbnail: img("ipad") },
  { id: "P008", name: "Nest Hub Max", model: "NHM-2GEN", brand: "Google", category: "Smart Home", description: "Smart display with Google Assistant.", status: "Inactive", imageCount: 5, thumbnail: img("nest") },
];

export const mockHistory = [
  { id: "S1043", thumb: img("scan1", 120), product: "AirPods Pro", model: "APP-2024", match: 98.4, date: "2026-05-28 09:42", status: "Matched" },
  { id: "S1042", thumb: img("scan2", 120), product: "Pixel 8 Pro", model: "PX8P-256", match: 94.1, date: "2026-05-28 09:18", status: "Matched" },
  { id: "S1041", thumb: img("scan3", 120), product: "Galaxy Watch 6", model: "GW6-44MM", match: 88.7, date: "2026-05-27 17:55", status: "Matched" },
  { id: "S1040", thumb: img("scan4", 120), product: "Unknown", model: "—", match: 41.2, date: "2026-05-27 16:03", status: "No Match" },
  { id: "S1039", thumb: img("scan5", 120), product: "MX Master 3S", model: "MXM3S-GR", match: 91.8, date: "2026-05-27 14:21", status: "Matched" },
  { id: "S1038", thumb: img("scan6", 120), product: "Sony WH-1000XM5", model: "WH1KXM5", match: 96.3, date: "2026-05-27 11:09", status: "Matched" },
  { id: "S1037", thumb: img("scan7", 120), product: "iPad Air M2", model: "IPA-M2-128", match: 89.5, date: "2026-05-26 18:44", status: "Matched" },
];

export const techBadges = [
  "OpenAI Vision",
  "Google Vision AI",
  "Vector DB",
  "OCR",
  "AI Embeddings",
  "CLIP",
  "pgvector",
];

export const stats = {
  totalProducts: 248,
  totalImages: 3142,
  recentSearches: 1287,
  matchAccuracy: 96.4,
};

export const productImages = (id: string) =>
  Array.from({ length: 8 }).map((_, i) => ({
    id: `${id}-img-${i}`,
    url: img(`${id}-${i}`, 500),
    label: ["Front", "Side", "Top", "Back", "Packaging", "Angle", "Low light", "Macro"][i],
    primary: i === 0,
  }));