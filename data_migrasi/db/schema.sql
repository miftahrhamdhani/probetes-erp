-- ============================================================================
-- Probetes ERP - Skema Database PostgreSQL
-- Dibuat dari data_migrasi/output (lihat database.md).
-- Semua kolom uang = BIGINT (rupiah bulat). ID = TEXT (PB-CUST-0001 dst).
-- Kolom yang di sumber banyak kosong dibiarkan NULL-able (bukan error).
-- ============================================================================

-- Skema domain agar rapi (semua di satu database probetes_erp).
CREATE SCHEMA IF NOT EXISTS master;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS tracking;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS audit;

-- ---------------------------------------------------------------------------
-- MASTER DATA
-- ---------------------------------------------------------------------------
CREATE TABLE master.customers (
    customer_id        TEXT PRIMARY KEY,
    name               TEXT,
    phone              TEXT,
    phone_normalized   TEXT,
    address            TEXT,
    city               TEXT,
    province           TEXT,
    source_origin      TEXT,
    channel_id         TEXT,
    cs_id              TEXT,
    transaction_count  INTEGER DEFAULT 0,
    status             TEXT
);

CREATE TABLE master.products (
    product_id          TEXT PRIMARY KEY,
    product_final_name  TEXT,
    sku                 TEXT,
    original_names      TEXT,
    category            TEXT,
    qty_total           BIGINT DEFAULT 0,
    value_total         BIGINT DEFAULT 0,
    status              TEXT
);

CREATE TABLE master.channels (
    channel_id          TEXT PRIMARY KEY,
    channel_final_name  TEXT,
    type                TEXT,
    original_names      TEXT,
    platform            TEXT,
    order_count         INTEGER DEFAULT 0,
    value_total         BIGINT DEFAULT 0,
    status              TEXT
);

CREATE TABLE master.couriers (
    courier_id          TEXT PRIMARY KEY,
    courier_final_name  TEXT,
    original_names      TEXT,
    service_type        TEXT,
    order_count         INTEGER DEFAULT 0,
    tracking_count      INTEGER DEFAULT 0,
    status              TEXT
);

CREATE TABLE master.users (
    user_id         TEXT PRIMARY KEY,
    name            TEXT,
    role            TEXT,
    division        TEXT,
    main_channel    TEXT,
    customer_count  INTEGER DEFAULT 0,
    order_count     INTEGER DEFAULT 0,
    value_total     BIGINT DEFAULT 0,
    status          TEXT
);

CREATE TABLE master.mitra (
    mitra_id          TEXT PRIMARY KEY,
    mitra_final_name  TEXT,
    original_names    TEXT,
    order_count       INTEGER DEFAULT 0,
    value_total       BIGINT DEFAULT 0,
    status            TEXT
);

CREATE TABLE master.sumber_lain (
    source_id    TEXT PRIMARY KEY,
    nama         TEXT,
    jenis        TEXT,
    order_count  INTEGER DEFAULT 0
);

CREATE TABLE master.customer_cohorts (
    customer_id          TEXT PRIMARY KEY REFERENCES master.customers(customer_id),
    cohort_month         TEXT,
    first_purchase_date  DATE,
    last_purchase_date   DATE,
    frequency            INTEGER DEFAULT 0,
    total_qty            BIGINT DEFAULT 0,
    total_spent          BIGINT DEFAULT 0,
    last_product_id      TEXT REFERENCES master.products(product_id),
    last_cs_id           TEXT REFERENCES master.users(user_id),
    cluster              TEXT
);

-- ---------------------------------------------------------------------------
-- ORDERS
-- ---------------------------------------------------------------------------
CREATE TABLE orders.orders (
    order_id        TEXT PRIMARY KEY,
    customer_id     TEXT REFERENCES master.customers(customer_id),
    order_date      DATE,
    channel_id      TEXT REFERENCES master.channels(channel_id),
    divisi          TEXT,
    cs_id           TEXT REFERENCES master.users(user_id),
    courier_id      TEXT REFERENCES master.couriers(courier_id),
    mitra_id        TEXT REFERENCES master.mitra(mitra_id),
    payment_method  TEXT,
    total_amount    BIGINT,
    order_status    TEXT,
    source_file_id  TEXT,
    flag            TEXT
);

CREATE TABLE orders.order_items (
    order_item_id          TEXT PRIMARY KEY,
    order_id               TEXT REFERENCES orders.orders(order_id),
    product_id             TEXT REFERENCES master.products(product_id),
    original_product_name  TEXT,
    qty                    INTEGER,
    unit_price             BIGINT,
    subtotal               BIGINT,
    status                 TEXT
);

-- transaction_id BUKAN unik (baris bundling berbagi TRX id) -> pakai PK sintetis.
CREATE TABLE orders.customer_transactions (
    row_id            BIGSERIAL PRIMARY KEY,
    transaction_id    TEXT,
    order_id          TEXT,
    transaction_date  DATE,
    customer_id       TEXT REFERENCES master.customers(customer_id),
    cs_id             TEXT REFERENCES master.users(user_id),
    product_id        TEXT REFERENCES master.products(product_id),
    qty               INTEGER,
    total_price       BIGINT,
    cohort_month      TEXT,
    status            TEXT
);
CREATE INDEX idx_tx_transaction_id ON orders.customer_transactions(transaction_id);
CREATE INDEX idx_tx_customer_id    ON orders.customer_transactions(customer_id);

-- ---------------------------------------------------------------------------
-- TRACKING
-- ---------------------------------------------------------------------------
CREATE TABLE tracking.shipments (
    shipment_id      TEXT PRIMARY KEY,
    order_id         TEXT REFERENCES orders.orders(order_id),
    tracking_number  TEXT,
    customer_id      TEXT REFERENCES master.customers(customer_id),
    ship_city        TEXT,
    courier_id       TEXT REFERENCES master.couriers(courier_id),
    package_status   TEXT,
    payment_method   TEXT,
    shipping_cost    BIGINT,
    cod_status       TEXT,
    return_status    TEXT,
    flag             TEXT
);

CREATE TABLE tracking.cod_payments (
    cod_payment_id  TEXT PRIMARY KEY,
    order_id        TEXT REFERENCES orders.orders(order_id),
    payment_method  TEXT,
    total_payment   BIGINT,
    shipping_cost   BIGINT,
    packing_fee     BIGINT,
    cod_fee         BIGINT,
    cod_status      TEXT,
    settled_date    DATE,
    check_status    TEXT
);

CREATE TABLE tracking.returns (
    return_id         TEXT PRIMARY KEY,
    order_id          TEXT REFERENCES orders.orders(order_id),
    tracking_number   TEXT,
    customer_id       TEXT REFERENCES master.customers(customer_id),
    city              TEXT,
    issue_type        TEXT,
    reason            TEXT,
    cs_id             TEXT REFERENCES master.users(user_id),
    follow_up_action  TEXT,
    status            TEXT
);

-- ---------------------------------------------------------------------------
-- FINANCE
-- ---------------------------------------------------------------------------
CREATE TABLE finance.order_finance (
    finance_id             TEXT PRIMARY KEY,
    order_id               TEXT REFERENCES orders.orders(order_id),
    invoice_number         TEXT,
    total_payment          BIGINT,
    hpp                    BIGINT,
    shipping_cost          BIGINT,
    cod_fee                BIGINT,
    logistic_fee           BIGINT,
    settled_amount         BIGINT,
    reconciliation_status  TEXT,
    note                   TEXT
);

-- ---------------------------------------------------------------------------
-- AUDIT
-- ---------------------------------------------------------------------------
CREATE TABLE audit.data_quality_checks (
    check_id       BIGSERIAL PRIMARY KEY,
    area           TEXT,
    data_checked   TEXT,
    issue_example  TEXT,
    status         TEXT,
    action         TEXT,
    related_id     TEXT
);
