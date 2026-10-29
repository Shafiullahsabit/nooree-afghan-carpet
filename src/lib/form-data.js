import { getDictionary } from "@/i18n/config";

export function getSafeLocale(formData) {
  const locale = String(formData.get("locale") ?? "en");
  return getDictionary(locale) ? locale : "en";
}

export function getTrimmed(formData, name, maxLength) {
  return String(formData.get(name) ?? "").trim().slice(0, maxLength);
}
