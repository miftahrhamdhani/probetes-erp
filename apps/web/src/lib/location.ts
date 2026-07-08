const provinceNames = [
  "Aceh",
  "Sumatera Utara",
  "Sumatera Barat",
  "Riau",
  "Kepulauan Riau",
  "Jambi",
  "Sumatera Selatan",
  "Bengkulu",
  "Lampung",
  "Kep. Bangka Belitung",
  "DKI Jakarta",
  "Banten",
  "Jawa Barat",
  "Jawa Tengah",
  "DI Yogyakarta",
  "Jawa Timur",
  "Bali",
  "NTB",
  "Nusa Tenggara Barat",
  "NTT",
  "Nusa Tenggara Timur",
  "Kalimantan Barat",
  "Kalimantan Tengah",
  "Kalimantan Selatan",
  "Kalimantan Timur",
  "Kalimantan Utara",
  "Sulawesi Utara",
  "Gorontalo",
  "Sulawesi Tengah",
  "Sulawesi Barat",
  "Sulawesi Selatan",
  "Sulawesi Tenggara",
  "Maluku Utara",
  "Maluku",
  "Papua Barat",
  "Papua",
];

function tidyCity(value: string) {
  return value
    .replace(/\b(kota|kab\.?|kabupaten|kecamatan|kec\.?|kelurahan|kel\.?|provinsi|prov\.?)\b/gi, "")
    .replace(/\b(indonesia|id|rt|rw)\b/gi, "")
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[,.;:\-/\s]+|[,.;:\-/\s]+$/g, "")
    .trim();
}

function titleCity(value: string) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => (word ? word[0]!.toUpperCase() + word.slice(1) : word))
    .join(" ")
    .replace(/\bDki\b/g, "DKI")
    .replace(/\bNtb\b/g, "NTB")
    .replace(/\bNtt\b/g, "NTT");
}

export function extractCityFromAddress(address = "", fallback = "") {
  const direct = tidyCity(fallback);
  if (direct) return titleCity(direct);

  const text = address.replace(/\s+/g, " ").trim();
  if (!text) return "";

  const explicit = text.match(/(?:kabupaten\s*\/\s*kota|kab\.?|kabupaten|kota)\s*[:\-]?\s*([A-Za-zÀ-ÿ.'\s]{3,45})/i);
  if (explicit?.[1]) {
    const city = tidyCity(explicit[1].split(/,|\b(?:provinsi|jawa|sumatera|sumatra|sulawesi|kalimantan|bali|banten|ntb|nusa|maluku|papua|lampung|jambi|riau|aceh)\b/i)[0] ?? "");
    if (city) return titleCity(city);
  }

  const parts = text.split(",").map(tidyCity).filter(Boolean);
  const provinceIndex = parts.findIndex((part) =>
    provinceNames.some((province) => part.toLowerCase().includes(province.toLowerCase())),
  );
  if (provinceIndex > 0) {
    const candidate = parts[provinceIndex - 1];
    if (candidate && candidate.length >= 3) return titleCity(candidate);
  }

  return "";
}
