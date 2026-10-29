import en from "./messages/en.json";
import faAF from "./messages/fa-AF.json";
import psAF from "./messages/ps-AF.json";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/config/site";

export const locales = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "fa-AF", label: "دری", shortLabel: "دری" },
  { code: "ps-AF", label: "پښتو", shortLabel: "پښتو" },
];

const dictionaries = {
  en,
  "fa-AF": faAF,
  "ps-AF": psAF,
};

export function getDictionary(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE] : null;
}
