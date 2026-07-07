"""
Build migration CSVs untuk Probetes ERP.
Sumber:
  raw/01_database_all.csv       -> order (prodig/all)
  raw/02_probetes_non_prodig.csv-> order (non-prodig)
  raw/04_cohort_pelanggan.csv   -> riwayat transaksi + cohort
Output (mengikuti skema database.md):
  output/staging/  mapping_produk, mapping_channel, mapping_kurir, mapping_cs
  output/master/   customers, products, channels, users, couriers, customer_cohorts
  output/orders/   orders, order_items, customer_transactions
  output/tracking/ shipments, cod_payments, returns
  output/finance/  order_finance
  output/audit/    data_quality_checks

Aturan: tidak menghapus data mentah, nama asli tetap disimpan, data ambigu -> status 'review'.
"""
import csv, io, os, re
from collections import defaultdict, Counter, OrderedDict

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(BASE, "raw")
OUT = os.path.join(BASE, "output")

def outpath(*parts):
    p = os.path.join(OUT, *parts)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    return p

def read_csv(name):
    with io.open(os.path.join(RAW, name), "r", encoding="utf-8-sig", newline="") as f:
        return list(csv.reader(f))

def write_csv(path, header, rows):
    with io.open(path, "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    return len(rows)

# ----------------------------------------------------------------------------
# Helper normalisasi
# ----------------------------------------------------------------------------
def clean_text(s):
    if s is None:
        return ""
    s = s.replace("�", " ").replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s).strip()
    return s

def norm_key(s):
    return clean_text(s).upper()

def normalize_phone(raw):
    """Kembalikan (phone_normalized, review_reason). '' jika kosong."""
    d = re.sub(r"\D", "", raw or "")
    if not d:
        return "", "no_phone"
    reason = ""
    if d.startswith("620"):
        d = "62" + d[3:]
    elif d.startswith("0"):
        d = "62" + d[1:]
    elif d.startswith("8"):
        d = "62" + d
    if not d.startswith("62"):
        reason = "phone_format_aneh"
    if len(d) > 15:
        reason = "phone_terlalu_panjang(kemungkinan 2 nomor)"
        d = d[:13]
    elif len(d) < 10:
        reason = "phone_terlalu_pendek"
    return d, reason

def parse_int(raw):
    """Angka rupiah: '139.000' / '84,650' -> 139000 / 84650. '' -> None."""
    if raw is None:
        return None
    s = re.sub(r"[^\d\-]", "", str(raw))
    if s in ("", "-"):
        return None
    try:
        return int(s)
    except ValueError:
        return None

def parse_date(raw):
    """Kembalikan (iso_date 'YYYY-MM-DD', ok). Terima YYYY-MM-DD dan DD/MM/YYYY."""
    s = clean_text(raw)
    if not s:
        return "", False
    m = re.match(r"^(\d{4})-(\d{1,2})-(\d{1,2})$", s)
    if m:
        y, mo, d = m.groups()
        return f"{y}-{int(mo):02d}-{int(d):02d}", True
    m = re.match(r"^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$", s)
    if m:
        d, mo, y = m.groups()
        return f"{y}-{int(mo):02d}-{int(d):02d}", True
    return s, False

# KEPUTUSAN OWNER no.16: kolom Provinsi — diekstrak otomatis dari teks alamat/kota.
_PROV_VARIANTS = {
    "ACEH": "Aceh",
    "SUMATERA UTARA": "Sumatera Utara", "SUMATRA UTARA": "Sumatera Utara", "SUMUT": "Sumatera Utara",
    "SUMATERA BARAT": "Sumatera Barat", "SUMATRA BARAT": "Sumatera Barat", "SUMBAR": "Sumatera Barat",
    "KEPULAUAN RIAU": "Kepulauan Riau", "KEPRI": "Kepulauan Riau",
    "RIAU": "Riau", "JAMBI": "Jambi",
    "SUMATERA SELATAN": "Sumatera Selatan", "SUMATRA SELATAN": "Sumatera Selatan", "SUMSEL": "Sumatera Selatan",
    "BENGKULU": "Bengkulu", "LAMPUNG": "Lampung",
    "BANGKA BELITUNG": "Kep. Bangka Belitung", "BABEL": "Kep. Bangka Belitung",
    "DKI JAKARTA": "DKI Jakarta", "JAKARTA": "DKI Jakarta",
    "JAWA BARAT": "Jawa Barat", "JABAR": "Jawa Barat", "BANTEN": "Banten",
    "JAWA TENGAH": "Jawa Tengah", "JATENG": "Jawa Tengah",
    "YOGYAKARTA": "DI Yogyakarta", "JOGJA": "DI Yogyakarta",
    "JAWA TIMUR": "Jawa Timur", "JATIM": "Jawa Timur",
    "BALI": "Bali",
    "NUSA TENGGARA BARAT": "NTB", "NTB": "NTB",
    "NUSA TENGGARA TIMUR": "NTT", "NTT": "NTT",
    "KALIMANTAN BARAT": "Kalimantan Barat", "KALBAR": "Kalimantan Barat",
    "KALIMANTAN TENGAH": "Kalimantan Tengah", "KALTENG": "Kalimantan Tengah",
    "KALIMANTAN SELATAN": "Kalimantan Selatan", "KALSEL": "Kalimantan Selatan",
    "KALIMANTAN TIMUR": "Kalimantan Timur", "KALTIM": "Kalimantan Timur",
    "KALIMANTAN UTARA": "Kalimantan Utara", "KALTARA": "Kalimantan Utara",
    "SULAWESI UTARA": "Sulawesi Utara", "SULUT": "Sulawesi Utara",
    "GORONTALO": "Gorontalo",
    "SULAWESI TENGAH": "Sulawesi Tengah", "SULTENG": "Sulawesi Tengah",
    "SULAWESI BARAT": "Sulawesi Barat", "SULBAR": "Sulawesi Barat",
    "SULAWESI SELATAN": "Sulawesi Selatan", "SULSEL": "Sulawesi Selatan",
    "SULAWESI TENGGARA": "Sulawesi Tenggara", "SULTRA": "Sulawesi Tenggara",
    "MALUKU UTARA": "Maluku Utara", "MALUKU": "Maluku",
    "PAPUA BARAT": "Papua Barat", "PAPUA": "Papua",
}
_PROV_RE = re.compile(
    "|".join(sorted((re.escape(k) for k in _PROV_VARIANTS), key=len, reverse=True)),
    re.IGNORECASE)

def extract_province(text):
    m = _PROV_RE.search(text or "")
    return _PROV_VARIANTS.get(m.group(0).upper(), "") if m else ""

# ----------------------------------------------------------------------------
# Mapping terkurasi (kurir, pembayaran, channel) + auto (produk, cs)
# ----------------------------------------------------------------------------
COURIER_RULES = [
    (("NINJA",), "Ninja Xpress", "Reguler"),
    (("SICEPAT", "SI CEPAT"), "SiCepat", "Reguler"),
    (("JNT CARGO", "J&T CARGO"), "J&T", "Cargo"),
    (("JNT", "J&T"), "J&T", "Reguler"),
    (("SPX", "SHOPEE"), "SPX (Shopee Xpress)", "Reguler"),
    (("LION",), "Lion Parcel", "Reguler"),
    (("ANTERAJA",), "AnterAja", "Reguler"),
    (("ID EXPRESS", "IDEXPRESS", "ID EKSPRES"), "ID Express", "Reguler"),
    (("SAP",), "SAP Express", "COD"),
    (("JNE",), "JNE", "Reguler"),
    (("POS",), "POS Indonesia", "Reguler"),
    (("GOSEND", "GRAB", "INSTANT", "SAMEDAY", "SAME DAY"), "Instan/Same Day", "Same Day"),
]
def map_courier(raw):
    k = norm_key(raw)
    if not k:
        return "", "", "", ""  # id,final,service,status handled outside
    for keys, final, service in COURIER_RULES:
        if any(x in k for x in keys):
            return final, service, "valid"
    return clean_text(raw).title(), "Reguler", "review"

def map_payment(raw):
    k = norm_key(raw)
    if not k:
        return "", "", "review"        # method, is_cod, status
    if "COD" in k:
        return "COD", "COD", "valid"
    if "TRANSFER" in k or "BANK" in k or "TF" == k:
        return "Non-COD", "Transfer", "valid"
    return clean_text(raw).title(), "", "review"

def map_channel(platform, divisi):
    """Channel = PLATFORM asal order saja (dipisah dari divisi internal).
    KEPUTUSAN OWNER no.13: jenis channel = Akuisisi / Retensi / Marketplace / Offline.
    Meta (iklan) -> Akuisisi; TikTok/Shopee/MP -> Marketplace; Offline -> Stokis (disiapkan)."""
    for src_ in (platform, divisi):
        k = norm_key(src_)
        if not k:
            continue
        if "TIKTOK" in k:
            return "TikTok Shop", "Marketplace", clean_text(src_), "valid"
        if "SHOPEE" in k:
            return "Shopee", "Marketplace", clean_text(src_), "valid"
        if "META" in k or "FACEBOOK" in k or "INSTAGRAM" in k or k in ("FB", "IG"):
            return "Meta", "Akuisisi", clean_text(src_), "valid"
        if k == "MP":
            return "Marketplace Lain", "Marketplace", clean_text(src_), "review"
    return "Unknown", "Belum tercatat", "", "review"

def map_divisi(raw):
    """Divisi/tim internal — kolom terpisah dari channel."""
    k = norm_key(raw)
    if not k:
        return ""
    if "AKUISISI" in k:
        return "Akuisisi"
    if "CRM" in k:
        return "CRM"
    if k == "CS":
        return "CS"
    if "TIKTOK" in k or k == "MP":
        return "Marketplace"
    return clean_text(raw).title()

def map_mitra(raw):
    """Mitra/affiliate — tabel sendiri (keputusan owner no.8)."""
    base = clean_text(raw)
    if not base:
        return "", ""
    letters = re.sub(r"[^A-Z]", "", norm_key(base))
    if letters in ("UPDM", "UP", "UPDMM"):
        return "UP DM", "valid"
    if letters == "UPDN":
        return "UP DM", "review"
    if letters == "JAWARA":
        return "JAWARA", "valid"
    if letters in ("JJAWARA", "JAWAERA"):
        return "JAWARA", "review"
    if letters == "SETIYA":
        return "SETIYA", "valid"
    if letters == "SNS":
        return "SNS", "valid"
    if "TUMBUH" in letters:
        return "Tumbuhpedia", "valid"
    if "TEMANDIET" in letters:
        return "Teman Diet", "valid"
    return base.title(), "review"

def classify_nonperson(nm):
    """Deteksi nama di kolom CS/ADV yang BUKAN orang (keputusan owner no.9)."""
    low = nm.lower()
    if re.search(r"affil", low):
        return "kategori_affiliate"
    if low in ("non adv", "non iklan", "non-adv"):
        return "placeholder"
    if low in ("iklan", "live", "radio", "tiktok mp"):
        return "channel_sumber"
    if re.search(r"amandia|yacona|herbal|official|sereal|beras organik|^probetes$", low):
        return "toko_brand"
    if low in ("up dm", "teman diet"):
        return "mitra"
    if re.search(r"\d{6,}", nm) or low.startswith("trd"):
        return "id_nyasar"
    return None

def map_product(raw):
    """Kembalikan (final_name, status).
    KEPUTUSAN OWNER (Jul 2026):
    - Prefiks S/Tk TIDAK digabung -> jadi produk terpisah (menunggu penyamaan SKU).
    - Varian 'Bonus' DIGABUNG ke produk inti.
    - 'Dummy' tetap dipisah + review (belum diputuskan).
    Encoding rusak (Ebook90) tetap dibersihkan karena murni masalah teknis."""
    base = clean_text(raw)
    if not base:
        return "", "review"
    status = "valid"
    if re.search(r"\bDummy\b", base, re.IGNORECASE):
        base = re.sub(r"\s*\bDummy\b", "", base, flags=re.IGNORECASE).strip()
        status = "review"
    if re.search(r"\bBonus\b", base, re.IGNORECASE):
        base = clean_text(re.sub(r"\s*\bBonus\b\s*", " ", base, flags=re.IGNORECASE))
    return base, status

# ============================================================================
# BACA SUMBER
# ============================================================================
print("Membaca sumber...")
r01 = read_csv("01_database_all.csv")
r02 = read_csv("02_probetes_non_prodig.csv")
r04 = read_csv("04_cohort_pelanggan.csv")

h01, d01 = r01[0], r01[1:]
h02, d02 = r02[0], r02[1:]

def col_resolver(header):
    idx = {name: i for i, name in enumerate(header)}
    # alias antar file
    aliases = {
        "Tanggal Pesanan": ["Tanggal Pesanan", "Tanggal"],
        "Fee Cod": ["Fee Cod", "Fee COD"],
        "HPP": ["HPP", "hpp"],
        "Tgl Status Penerimaan": ["Tgl Status Penerimaan", "Tgl_Status_Penerimaan"],
    }
    def get(row, name):
        cands = aliases.get(name, [name])
        for c in cands:
            if c in idx and idx[c] < len(row):
                return row[idx[c]]
        return ""
    return get

get01 = col_resolver(h01)
get02 = col_resolver(h02)

def is_empty_order_row(get, row):
    return not (clean_text(get(row, "Customer")) or clean_text(get(row, "No. HP"))
                or clean_text(get(row, "Produk 1")))

# gabungkan order dari 01 & 02 dengan sumbernya
order_src = []  # (get_fn, row, source_file)
for row in d01:
    if not is_empty_order_row(get01, row):
        order_src.append((get01, row, "01_database_all"))
for row in d02:
    if not is_empty_order_row(get02, row):
        order_src.append((get02, row, "02_probetes_non_prodig"))
print(f"Total baris order valid (01+02): {len(order_src)}")

# ============================================================================
# REGISTRIES (assign ID sekali, urut kemunculan)
# ============================================================================
class Registry:
    def __init__(self, prefix, width):
        self.prefix, self.width = prefix, width
        self.map = OrderedDict()  # key -> id
        self.meta = {}            # id -> dict
    def get_id(self, key):
        if key not in self.map:
            self.map[key] = f"{self.prefix}{len(self.map)+1:0{self.width}d}"
        return self.map[key]

customers = Registry("PB-CUST-", 4)
products  = Registry("PRD-", 3)
channels  = Registry("CH-", 3)
users     = Registry("USR-", 3)
couriers  = Registry("EXP-", 3)
mitras    = Registry("MTR-", 3)
sources   = Registry("SRC-", 3)   # nama non-orang dari kolom CS/ADV

audit_rows = []  # area, data_checked, issue_example, status, action, related_id
def flag(area, data_checked, issue, status, action, related_id):
    audit_rows.append([area, data_checked, issue, status, action, related_id])

# ---- kumpulkan customer (urut kemunculan lintas 01->02->04) ----
cust_names = defaultdict(Counter)   # key -> Counter(name)
cust_first_seen_reason = {}
def customer_key(phone_norm, name, reason, loc=""):
    """KEPUTUSAN OWNER no.2: No HP sama -> pelanggan sama (prioritas utama).
    Tanpa HP: nama + alamat/kota jadi kunci -> nama sama tapi alamat beda = pelanggan BEDA."""
    if phone_norm and reason not in ("phone_terlalu_pendek",):
        return "P:" + phone_norm
    nk = norm_key(name)
    if not nk:
        return None
    lk = norm_key(loc)
    return "N:" + nk + ("|" + lk if lk else "")

for get, row, src in order_src:
    raw_phone = get(row, "No. HP")
    pn, reason = normalize_phone(raw_phone)
    name = clean_text(get(row, "Customer"))
    loc = clean_text(get(row, "Alamat")) or clean_text(get(row, "Kota/Kabupaten"))
    key = customer_key(pn, name, reason, loc)
    if key is None:
        continue
    cid = customers.get_id(key)
    if cid not in customers.meta:
        customers.meta[cid] = {
            "phone_norm": pn, "phone_raw": clean_text(raw_phone),
            "reason": reason, "key": key,
            "city": "", "address": "", "province": "", "channel_id": "", "cs_id": "",
            "source": src, "count": 0,
        }
    customers.meta[cid]["count"] += 1
    cust_names[cid][name] += 1
    m = customers.meta[cid]
    if not m["city"]:
        m["city"] = clean_text(get(row, "Kota/Kabupaten"))
    if not m["address"]:
        m["address"] = clean_text(get(row, "Alamat"))
    if not m["province"]:
        m["province"] = extract_province(
            clean_text(get(row, "Alamat")) + " " + clean_text(get(row, "Kota/Kabupaten")))

# file 04 tambahan customer (User ID = phone)
h04 = r04[0]
d04 = r04[1:]
IDX04 = {"date": 3, "cs": 4, "phone": 5, "product": 6, "qty": 7, "total": 8, "name": 9, "cohort": 10}
def g04(row, k):
    i = IDX04[k]
    return row[i] if i < len(row) else ""

for row in d04:
    name = clean_text(g04(row, "name"))
    raw_phone = g04(row, "phone")
    if not (name or raw_phone):
        continue
    pn, reason = normalize_phone(raw_phone)
    key = customer_key(pn, name, reason)
    if key is None:
        continue
    cid = customers.get_id(key)
    if cid not in customers.meta:
        customers.meta[cid] = {
            "phone_norm": pn, "phone_raw": clean_text(raw_phone),
            "reason": reason, "key": key, "city": "", "address": "", "province": "",
            "channel_id": "", "cs_id": "", "source": "04_cohort", "count": 0,
        }
    cust_names[cid][name] += 1

print(f"Total pelanggan unik: {len(customers.map)}")

# ============================================================================
# ITERASI ORDER -> orders, order_items, tracking, finance + registry master
# ============================================================================
orders_rows, item_rows = [], []
ship_rows, cod_rows, return_rows, finance_rows = [], [], [], []

# akumulasi meta master
prod_meta = defaultdict(lambda: {"orig": Counter(), "qty": 0, "val": 0, "status": "valid"})
chan_meta = defaultdict(lambda: {"orig": Counter(), "type": "", "orders": 0, "val": 0, "status": "valid"})
cour_meta = defaultdict(lambda: {"orig": Counter(), "service": "", "orders": 0, "resi": 0, "status": "valid"})
user_meta = defaultdict(lambda: {"orig": Counter(), "roles": set(), "orders": 0, "val": 0, "custs": set()})
mitra_meta = defaultdict(lambda: {"orig": Counter(), "orders": 0, "val": 0, "status": "valid"})
source_meta = defaultdict(lambda: {"nama": "", "jenis": "", "orders": 0})
# tabel mapping mentah->final (staging)
map_prod, map_chan, map_cour, map_cs, map_mitra_tbl = {}, {}, {}, {}, {}

# untuk cohort
cust_agg = defaultdict(lambda: {"first": "", "last": "", "qty": 0, "spent": 0,
                                "last_prod": "", "last_cs": "", "count": 0, "cohort": ""})

# ---- KEPUTUSAN OWNER no.15: kelompokkan baris jadi transaksi multi-item ----
# 1 transaksi = customer + tanggal (+ ID pesan sebagai penguat).
# Terverifikasi di data: Total Bayar/Ongkir di grup bundling terisi 1 baris ATAU
# terulang dengan nilai sama persis (tidak pernah beda) -> aman diambil sekali.
order_groups = OrderedDict()
_row_n = 0
for get, row, src in order_src:
    _row_n += 1
    pn, reason = normalize_phone(get(row, "No. HP"))
    cname = clean_text(get(row, "Customer"))
    cloc = clean_text(get(row, "Alamat")) or clean_text(get(row, "Kota/Kabupaten"))
    ckey = customer_key(pn, cname, reason, cloc)
    odate, _dok = parse_date(get(row, "Tanggal Pesanan"))
    idp = clean_text(get(row, "idpesan"))
    gkey = (ckey, odate, idp) if ckey else ("__row__", _row_n)
    order_groups.setdefault(gkey, []).append((get, row, src))

order_seq = 0
INVALID_SHIP = re.compile(r"(retur|gagal|batal|cancel)", re.IGNORECASE)

def first_nonempty(vals):
    for v in vals:
        if v not in (None, ""):
            return v
    return None

for gkey, grp in order_groups.items():
    order_seq += 1
    oid = f"ORD-{order_seq:06d}"
    get0, row0, src = grp[0]

    def gv(col):
        return first_nonempty([clean_text(get(row, col)) for get, row, _ in grp]) or ""
    def gnum(col):
        return first_nonempty([parse_int(get(row, col)) for get, row, _ in grp])

    # --- customer (kunci grup) ---
    pn, reason = normalize_phone(get0(row0, "No. HP"))
    cname = clean_text(get0(row0, "Customer"))
    cloc = clean_text(get0(row0, "Alamat")) or clean_text(get0(row0, "Kota/Kabupaten"))
    ckey = customer_key(pn, cname, reason, cloc)
    cid = customers.map.get(ckey, "") if ckey else ""

    # --- item per baris (produk) ---
    qty_sum, nilai_sum, item_n = 0, 0, 0
    first_pid = ""
    for get, row, _s in grp:
        raw_prod = get(row, "Produk 1")
        pfinal, pstatus = map_product(raw_prod)
        pid = ""
        if pfinal:
            pid = products.get_id(norm_key(pfinal))
            pm = prod_meta[pid]
            pm["final"] = pfinal
            if clean_text(raw_prod):
                pm["orig"][clean_text(raw_prod)] += 1
            if pstatus == "review":
                pm["status"] = "review"
            map_prod[clean_text(raw_prod)] = (pid, pfinal, pstatus)
            kode = clean_text(get(row, "Kode Prod 1"))
            if kode:
                pm.setdefault("sku", Counter())[kode] += 1
        qty = parse_int(get(row, "Qty 1")) or (1 if pid else 0)
        nilai = parse_int(get(row, "Nilai Produk"))
        if pid:
            prod_meta[pid]["qty"] += qty
            prod_meta[pid]["val"] += nilai or 0
            if not first_pid:
                first_pid = pid
        item_n += 1
        item_rows.append([
            f"{oid}-{item_n}", oid, pid, clean_text(raw_prod), qty,
            (nilai // qty if (nilai and qty) else (nilai if nilai else "")),
            nilai if nilai is not None else "", pstatus if pid else "review",
        ])
        qty_sum += qty or 0
        nilai_sum += nilai or 0

    # --- channel (platform) + divisi (tim internal) DIPISAH ---
    cfinal, ctype, corig, cstatus = map_channel(gv("Platform"), gv("DIVISI"))
    chid = channels.get_id(norm_key(cfinal))
    cm = chan_meta[chid]; cm["final"] = cfinal; cm["type"] = ctype
    if corig: cm["orig"][corig] += 1
    cm["orders"] += 1; cm["val"] += nilai_sum
    if cstatus == "review": cm["status"] = "review"
    if corig: map_chan[corig] = (chid, cfinal, cstatus)
    divisi_final = map_divisi(gv("DIVISI"))

    # --- mitra (tabel sendiri, keputusan owner no.8) ---
    raw_mitra = gv("Mitra")
    mfinal, mstatus = map_mitra(raw_mitra)
    mid = ""
    if mfinal:
        mid = mitras.get_id(norm_key(mfinal))
        mm = mitra_meta[mid]; mm["final"] = mfinal
        mm["orig"][raw_mitra] += 1
        mm["orders"] += 1; mm["val"] += nilai_sum
        if mstatus == "review": mm["status"] = "review"
        map_mitra_tbl[raw_mitra] = (mid, mfinal, mstatus)

    # --- courier ---
    raw_cour = gv("Ekspedisi")
    exid = ""
    if raw_cour:
        efinal, eservice, estatus = map_courier(raw_cour)
        exid = couriers.get_id(norm_key(efinal))
        em = cour_meta[exid]; em["final"] = efinal; em["service"] = eservice
        em["orig"][raw_cour] += 1; em["orders"] += 1
        if estatus == "review": em["status"] = "review"
        map_cour[raw_cour] = (exid, efinal, estatus)

    # --- users (CS & ADV) ---
    def reg_user(raw, role):
        nm = clean_text(raw)
        if not nm:
            return ""
        jenis = classify_nonperson(nm)
        if jenis:  # bukan orang -> masuk sumber_lain, bukan users (keputusan owner no.9)
            sid = sources.get_id(norm_key(nm))
            sm = source_meta[sid]; sm["nama"] = sm["nama"] or nm; sm["jenis"] = jenis
            sm["orders"] += 1
            map_cs[nm] = (sid, jenis)
            return ""
        uid = users.get_id(norm_key(nm))
        um = user_meta[uid]; um["orig"][nm] += 1; um["roles"].add(role)
        um["orders"] += 1; um["val"] += nilai_sum
        if cid: um["custs"].add(cid)
        map_cs[nm] = (uid, role)
        return uid
    cs_id = reg_user(gv("CS"), "CS")
    adv_id = reg_user(gv("ADV"), "ADV")

    # --- pembayaran ---
    pay_method, pay_kind, pay_status = map_payment(gv("pembayaran "))
    is_cod = (pay_kind == "COD")

    # --- tanggal & nilai uang (ambil sekali per grup; HPP dijumlah per item) ---
    odate, date_ok = parse_date(gv("Tanggal Pesanan"))
    total_bayar = gnum("Total Bayar")
    ongkir = gnum("Ongkir")
    packing = gnum("Packing")
    fee_cod = gnum("Fee Cod")
    _hpp_vals = [parse_int(get(row, "HPP")) for get, row, _ in grp]
    hpp = sum(v for v in _hpp_vals if v) or None
    nilai_rekon = gnum("Nilai Rekonsiliasi")
    tgl_rekon, _ = parse_date(gv("Tanggal rekonsiliasi"))
    status_raw = gv("Status")
    alasan_retur = gv("Alasan Retur")
    resi = gv("No. Resi")
    invoice = gv("No. Invoice")
    kota = gv("Kota/Kabupaten")

    total_amount = total_bayar if total_bayar is not None else (nilai_sum or None)

    # order_status
    is_retur = bool(alasan_retur) or bool(INVALID_SHIP.search(status_raw))
    order_status = "Retur" if is_retur else (status_raw.title() if status_raw else "")
    ostat_flag = "review" if not date_ok or not cid else "valid"

    orders_rows.append([
        oid, cid, odate, chid, divisi_final, cs_id, exid, mid, pay_method,
        total_amount if total_amount is not None else "",
        order_status, src, ostat_flag,
    ])

    # tracking.shipments (semua order punya baris kirim)
    if is_retur:
        pkg = "gagal_kirim" if re.search(r"gagal", status_raw + alasan_retur, re.IGNORECASE) else "retur"
    elif status_raw:
        pkg = "terkirim" if re.search(r"(terkirim|sukses|selesai|diterima)", status_raw, re.IGNORECASE) else "dalam_kirim"
    else:
        pkg = "dalam_kirim"
    cod_status = ("belum_cair" if is_cod else "tidak_ada")
    ship_rows.append([
        f"SHP-{order_seq:06d}", oid, resi, cid, kota, exid, pkg,
        pay_method, ongkir if ongkir is not None else "", cod_status,
        ("retur" if is_retur else "tidak"),
        ("review" if (exid == "" and resi == "") else "valid"),
    ])

    # tracking.cod_payments (hanya COD)
    if is_cod:
        cod_rows.append([
            f"COD-{order_seq:06d}", oid, pay_method,
            total_bayar if total_bayar is not None else "",
            ongkir if ongkir is not None else "",
            packing if packing is not None else "",
            fee_cod if fee_cod is not None else "",
            "belum_cair", tgl_rekon if nilai_rekon else "",
            "cek" if nilai_rekon is None else "valid",
        ])

    # tracking.returns (hanya retur/gagal)
    if is_retur:
        return_rows.append([
            f"RET-{order_seq:06d}", oid, resi, cid, kota,
            ("Gagal Kirim" if pkg == "gagal_kirim" else "Retur"),
            alasan_retur, cs_id, "", "proses",
        ])

    # finance.order_finance (+ logistic_fee, keputusan owner no.14 — kosong dulu,
    # menunggu konfirmasi apakah kolom Packing lama = logistic fee)
    finance_rows.append([
        f"FIN-{order_seq:06d}", oid, invoice,
        total_bayar if total_bayar is not None else "",
        hpp if hpp is not None else "",
        ongkir if ongkir is not None else "",
        fee_cod if fee_cod is not None else "",
        "",  # logistic_fee
        nilai_rekon if nilai_rekon is not None else "",
        ("cocok" if nilai_rekon is not None else "belum"),
        "",
    ])

    # agregasi cohort — count = frekuensi transaksi SETELAH bundling digabung (owner no.17)
    if cid:
        a = cust_agg[cid]
        a["count"] += 1
        a["qty"] += qty_sum
        a["spent"] += (total_amount or 0)
        if date_ok:
            if not a["first"] or odate < a["first"]:
                a["first"] = odate
            if not a["last"] or odate > a["last"]:
                a["last"] = odate; a["last_prod"] = first_pid; a["last_cs"] = cs_id

print(f"Orders: {len(orders_rows)}  Produk: {len(products.map)}  "
      f"Channel: {len(channels.map)}  Kurir: {len(couriers.map)}  User: {len(users.map)}")

# ============================================================================
# customer_transactions (file 04) + cohort_month
# ============================================================================
# KEPUTUSAN OWNER no.12+15: transaksi cohort juga dikelompokkan (customer + tanggal).
# Baris item dalam 1 grup memakai TRX id yang SAMA (rincian produk tetap tersimpan).
tx_rows = []
tx_groups = OrderedDict()
_t_n = 0
for row in d04:
    name = clean_text(g04(row, "name"))
    raw_phone = g04(row, "phone")
    if not (name or raw_phone):
        continue
    _t_n += 1
    pn, reason = normalize_phone(raw_phone)
    ckey = customer_key(pn, name, reason)
    cid = customers.map.get(ckey, "")
    tdate, dok = parse_date(g04(row, "date"))
    gkey = (cid, tdate) if cid else ("__row__", _t_n)
    tx_groups.setdefault(gkey, []).append((row, cid, tdate, dok))

tx_agg = defaultdict(lambda: {"count": 0, "qty": 0, "spent": 0, "first": "", "last": "",
                              "last_prod": "", "last_cs": ""})
tx_seq = 0
for gkey, grp in tx_groups.items():
    tx_seq += 1
    tid = f"TRX-{tx_seq:06d}"
    for row, cid, tdate, dok in grp:
        raw_prod = g04(row, "product")
        pfinal, pstatus = map_product(raw_prod)
        pid = products.get_id(norm_key(pfinal)) if pfinal else ""
        qty = parse_int(g04(row, "qty")) or 0
        total = parse_int(g04(row, "total"))
        cohort = clean_text(g04(row, "cohort"))
        cs_nm = clean_text(g04(row, "cs"))
        cs_id = ""
        if cs_nm and not classify_nonperson(cs_nm):
            cs_id = users.get_id(norm_key(cs_nm))
            um = user_meta[cs_id]; um["orig"][cs_nm] += 1; um["roles"].add("CS")
        if cid and cohort and not cust_agg[cid]["cohort"]:
            cust_agg[cid]["cohort"] = cohort
        tx_rows.append([
            tid, "", tdate, cid, cs_id, pid, qty,
            total if total is not None else "", cohort,
            "valid" if (cid and dok) else "review",
        ])
        if cid:
            ta = tx_agg[cid]
            ta["qty"] += qty
            ta["spent"] += total or 0
            if dok:
                if not ta["first"] or tdate < ta["first"]:
                    ta["first"] = tdate
                if not ta["last"] or tdate > ta["last"]:
                    ta["last"] = tdate; ta["last_prod"] = pid; ta["last_cs"] = cs_id
    cid0 = grp[0][1]
    if cid0:
        tx_agg[cid0]["count"] += 1
print(f"Customer transactions (04): {len(tx_rows)} baris item, {tx_seq} transaksi")

# Pelanggan yang HANYA ada di file cohort: ringkasan (frekuensi/qty/total) diisi
# dari transaksi cohort agar tidak nol. Yang punya order tetap pakai angka order
# (menghindari dobel hitung — irisan 2 sumber masih menunggu jawaban owner).
for cid, ta in tx_agg.items():
    a = cust_agg[cid]
    if a["count"] == 0:
        a["count"] = ta["count"]; a["qty"] = ta["qty"]; a["spent"] = ta["spent"]
        a["first"] = ta["first"]; a["last"] = ta["last"]
        a["last_prod"] = ta["last_prod"]; a["last_cs"] = ta["last_cs"]

# ============================================================================
# TULIS SEMUA CSV
# ============================================================================
def title_from_counter(c):
    return c.most_common(1)[0][0] if c else ""

# ---- master.customers ----
cust_out = []
for cid, m in customers.meta.items():
    name = title_from_counter(cust_names[cid])
    a = cust_agg.get(cid, {})
    cnt = a.get("count", 0)
    spent = a.get("spent", 0)
    if spent >= 5_000_000:
        status = "high_value"
    elif cnt > 1:
        status = "repeat"
    elif cnt == 1:
        status = "baru"
    else:
        status = "review"
    if m["reason"]:
        status = "review"
    cust_out.append([
        cid, name, m["phone_raw"], m["phone_norm"], m["address"], m["city"],
        m.get("province", ""), m["source"], m["channel_id"], m["cs_id"], cnt, status,
    ])
    if m["reason"]:
        if m["reason"] == "no_phone":
            issue = "Tanpa No HP (wajar, dari marketplace - keputusan owner no.1)"
            aksi = "Dedup pakai nama+alamat (owner no.2); cek manual bila ragu"
        else:
            issue, aksi = m["reason"], "Cek nomor HP / kemungkinan merge"
        flag("Pelanggan", f"{cid} {name}", issue, "review", aksi, cid)
write_csv(outpath("master", "customers.csv"),
          ["customer_id", "name", "phone", "phone_normalized", "address", "city",
           "province", "source_origin", "channel_id", "cs_id", "transaction_count",
           "status"], cust_out)

# ---- master.products ----
prod_out = []
for pid, m in prod_meta.items():
    sku = title_from_counter(m.get("sku", Counter()))
    prod_out.append([
        pid, m.get("final", ""), sku,
        " / ".join([o for o, _ in m["orig"].most_common(6)]),
        "", m["qty"], m["val"], m["status"],
    ])
    if m["status"] == "review":
        flag("Produk", f"{pid} {m.get('final','')}",
             "Nama produk bervariasi/prefiks/encoding", "review",
             "Mapping ke produk final", pid)
write_csv(outpath("master", "products.csv"),
          ["product_id", "product_final_name", "sku", "original_names",
           "category", "qty_total", "value_total", "status"], prod_out)

# ---- master.channels ----
# KEPUTUSAN OWNER no.13: channel Offline disiapkan -> Stokis (belum ada datanya di file lama)
_stokis_id = channels.get_id("STOKIS")
chan_meta[_stokis_id]["final"] = "Stokis"
chan_meta[_stokis_id]["type"] = "Offline"

chan_out = []
for chid, m in chan_meta.items():
    chan_out.append([
        chid, m.get("final", ""), m["type"],
        " / ".join([o for o, _ in m["orig"].most_common(6)]),
        "", m["orders"], m["val"],
        "Review" if m["status"] == "review" else "Aktif",
    ])
write_csv(outpath("master", "channels.csv"),
          ["channel_id", "channel_final_name", "type", "original_names",
           "platform", "order_count", "value_total", "status"], chan_out)

# ---- master.couriers ----
cour_out = []
for exid, m in cour_meta.items():
    cour_out.append([
        exid, m.get("final", ""),
        " / ".join([o for o, _ in m["orig"].most_common(6)]),
        m["service"], m["orders"], m["orders"],
        "Review" if m["status"] == "review" else "Aktif",
    ])
write_csv(outpath("master", "couriers.csv"),
          ["courier_id", "courier_final_name", "original_names", "service_type",
           "order_count", "tracking_count", "status"], cour_out)

# ---- master.users ----
user_out = []
for uid, m in user_meta.items():
    user_out.append([
        uid, title_from_counter(m["orig"]), "/".join(sorted(m["roles"])),
        "", "", len(m["custs"]), m["orders"], m["val"], "Aktif",
    ])
write_csv(outpath("master", "users.csv"),
          ["user_id", "name", "role", "division", "main_channel",
           "customer_count", "order_count", "value_total", "status"], user_out)

# ---- master.mitra (keputusan owner no.8: tabel sendiri) ----
mitra_out = []
for mid_, m in mitra_meta.items():
    mitra_out.append([
        mid_, m.get("final", ""),
        " / ".join([o for o, _ in m["orig"].most_common(6)]),
        m["orders"], m["val"],
        "Review" if m["status"] == "review" else "Aktif",
    ])
write_csv(outpath("master", "mitra.csv"),
          ["mitra_id", "mitra_final_name", "original_names",
           "order_count", "value_total", "status"], mitra_out)

# ---- master.sumber_lain (nama non-orang dari kolom CS/ADV, owner no.9) ----
src_out = [[sid, m["nama"], m["jenis"], m["orders"]] for sid, m in source_meta.items()]
write_csv(outpath("master", "sumber_lain.csv"),
          ["source_id", "nama", "jenis", "order_count"], src_out)

# ---- master.customer_cohorts ----
cohort_out = []
for cid, a in cust_agg.items():
    cnt = a["count"]; spent = a["spent"]
    cluster = "high_value" if spent >= 5_000_000 else ("repeat" if cnt > 1 else "baru")
    cohort_month = a["cohort"] or (a["first"][:7] if a["first"] else "")
    cohort_out.append([
        cid, cohort_month, a["first"], a["last"], cnt, a["qty"], spent,
        a["last_prod"], a["last_cs"], cluster,
    ])
write_csv(outpath("master", "customer_cohorts.csv"),
          ["customer_id", "cohort_month", "first_purchase_date", "last_purchase_date",
           "frequency", "total_qty", "total_spent", "last_product_id", "last_cs_id",
           "cluster"], cohort_out)

# ---- orders ----
write_csv(outpath("orders", "orders.csv"),
          ["order_id", "customer_id", "order_date", "channel_id", "divisi", "cs_id",
           "courier_id", "mitra_id", "payment_method", "total_amount", "order_status",
           "source_file_id", "flag"], orders_rows)
write_csv(outpath("orders", "order_items.csv"),
          ["order_item_id", "order_id", "product_id", "original_product_name",
           "qty", "unit_price", "subtotal", "status"], item_rows)
write_csv(outpath("orders", "customer_transactions.csv"),
          ["transaction_id", "order_id", "transaction_date", "customer_id", "cs_id",
           "product_id", "qty", "total_price", "cohort_month", "status"], tx_rows)

# ---- tracking ----
write_csv(outpath("tracking", "shipments.csv"),
          ["shipment_id", "order_id", "tracking_number", "customer_id", "ship_city",
           "courier_id", "package_status", "payment_method", "shipping_cost",
           "cod_status", "return_status", "flag"], ship_rows)
write_csv(outpath("tracking", "cod_payments.csv"),
          ["cod_payment_id", "order_id", "payment_method", "total_payment", "shipping_cost",
           "packing_fee", "cod_fee", "cod_status", "settled_date", "check_status"], cod_rows)
write_csv(outpath("tracking", "returns.csv"),
          ["return_id", "order_id", "tracking_number", "customer_id", "city",
           "issue_type", "reason", "cs_id", "follow_up_action", "status"], return_rows)

# ---- finance ----
write_csv(outpath("finance", "order_finance.csv"),
          ["finance_id", "order_id", "invoice_number", "total_payment", "hpp",
           "shipping_cost", "cod_fee", "logistic_fee", "settled_amount",
           "reconciliation_status", "note"], finance_rows)

# ---- staging mapping ----
write_csv(outpath("staging", "mapping_produk.csv"),
          ["nama_asli", "product_id", "product_final_name", "status"],
          [[k, v[0], v[1], v[2]] for k, v in sorted(map_prod.items())])
write_csv(outpath("staging", "mapping_channel.csv"),
          ["nama_asli", "channel_id", "channel_final_name", "status"],
          [[k, v[0], v[1], v[2]] for k, v in sorted(map_chan.items())])
write_csv(outpath("staging", "mapping_kurir.csv"),
          ["nama_asli", "courier_id", "courier_final_name", "status"],
          [[k, v[0], v[1], v[2]] for k, v in sorted(map_cour.items())])
write_csv(outpath("staging", "mapping_cs.csv"),
          ["nama_asli", "user_id", "role"],
          [[k, v[0], v[1]] for k, v in sorted(map_cs.items())])
write_csv(outpath("staging", "mapping_mitra.csv"),
          ["nama_asli", "mitra_id", "mitra_final_name", "status"],
          [[k, v[0], v[1], v[2]] for k, v in sorted(map_mitra_tbl.items())])

# ---- audit ----
write_csv(outpath("audit", "data_quality_checks.csv"),
          ["area", "data_checked", "issue_example", "status", "action", "related_id"],
          audit_rows)

print("\n=== RINGKASAN OUTPUT ===")
print(f"master/customers.csv         {len(cust_out)}")
print(f"master/products.csv          {len(prod_out)}")
print(f"master/channels.csv          {len(chan_out)}")
print(f"master/couriers.csv          {len(cour_out)}")
print(f"master/users.csv             {len(user_out)}")
print(f"master/customer_cohorts.csv  {len(cohort_out)}")
print(f"orders/orders.csv            {len(orders_rows)}")
print(f"orders/order_items.csv       {len(item_rows)}")
print(f"orders/customer_transactions.csv {len(tx_rows)}")
print(f"tracking/shipments.csv       {len(ship_rows)}")
print(f"tracking/cod_payments.csv    {len(cod_rows)}")
print(f"tracking/returns.csv         {len(return_rows)}")
print(f"finance/order_finance.csv    {len(finance_rows)}")
print(f"audit/data_quality_checks.csv {len(audit_rows)}")
print(f"master/mitra.csv              {len(mitra_out)}")
print(f"master/sumber_lain.csv        {len(src_out)}")
print(f"staging mapping: produk={len(map_prod)} channel={len(map_chan)} "
      f"kurir={len(map_cour)} cs={len(map_cs)} mitra={len(map_mitra_tbl)}")
