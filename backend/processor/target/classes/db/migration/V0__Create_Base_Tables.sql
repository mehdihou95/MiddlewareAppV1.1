-- Create Users table with all required columns (no dependencies)
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_locked BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    password_reset_token VARCHAR(255),
    password_reset_expiry TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create User Roles table (depends on Users)
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    roles VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create Clients table first (no dependencies)
CREATE TABLE clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Interfaces table (depends on CLIENTS)
CREATE TABLE interfaces (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    schema_path VARCHAR(255),
    root_element VARCHAR(255),
    namespace VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT uk_client_name UNIQUE (client_id, name)
);

-- Create ASN Headers table with all required columns (depends on CLIENTS)
CREATE TABLE asn_headers (
    asn_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asn_number VARCHAR(50) NOT NULL,
    asn_type VARCHAR(50),
    business_partner_id VARCHAR(50),
    business_partner_name VARCHAR(50),
    receipt_dttm VARCHAR(255) NOT NULL,
    asn_level NUMBER(3,0) DEFAULT 0 NOT NULL,
    region_id NUMBER(9,0) DEFAULT 0,
    business_partner_address_1 VARCHAR2(75),
    business_partner_address_2 VARCHAR2(75),
    business_partner_address_3 VARCHAR2(75),
    business_partner_city VARCHAR2(40),
    business_partner_state_prov VARCHAR2(3),
    business_partner_zip VARCHAR2(10),
    contact_address_1 VARCHAR2(75),
    contact_address_2 VARCHAR2(75),
    contact_address_3 VARCHAR2(75),
    contact_city VARCHAR2(40),
    contact_state_prov VARCHAR2(3),
    contact_zip VARCHAR2(10),
    contact_number VARCHAR2(32),
    appointment_id VARCHAR2(50),
    appointment_dttm DATE,
    appointment_duration NUMBER(8,0) DEFAULT 0,
    driver_name VARCHAR2(50),
    tractor_number VARCHAR2(50),
    delivery_stop_seq NUMBER(4,0) DEFAULT 0,
    pickup_end_dttm DATE,
    delivery_start_dttm DATE,
    delivery_end_dttm DATE,
    actual_departure_dttm DATE,
    actual_arrival_dttm DATE,
    total_weight NUMBER(13,4) DEFAULT 0,
    total_volume NUMBER(13,4) DEFAULT 0,
    volume_uom_id_base NUMBER(9,0) DEFAULT 0,
    total_shipped_qty NUMBER(16,4) DEFAULT 0,
    total_received_qty NUMBER(16,4) DEFAULT 0,
    shipped_lpn_count NUMBER(9,0) DEFAULT 0,
    received_lpn_count NUMBER(9,0) DEFAULT 0,
    has_import_error NUMBER(1,0) DEFAULT 0 NOT NULL,
    has_soft_check_error NUMBER(1,0) DEFAULT 0 NOT NULL,
    has_alerts NUMBER(1,0) DEFAULT 0 NOT NULL,
    is_cogi_generated NUMBER(1,0) DEFAULT 0 NOT NULL,
    is_cancelled NUMBER(1,0) DEFAULT 0 NOT NULL,
    is_closed NUMBER(1,0) DEFAULT 0 NOT NULL,
    is_gift NUMBER(1,0) DEFAULT 0 NOT NULL,
    is_whse_transfer VARCHAR2(1) DEFAULT '0' NOT NULL,
    quality_check_hold_upon_rcpt VARCHAR2(1) DEFAULT '0',
    quality_audit_percent NUMBER(5,2) DEFAULT 0 NOT NULL,
    equipment_type VARCHAR2(8),
    equipment_code VARCHAR2(20),
    equipment_code_id NUMBER(8,0) DEFAULT 0,
    manif_nbr VARCHAR2(20),
    manif_type VARCHAR2(4),
    work_ord_nbr VARCHAR2(12),
    cut_nbr VARCHAR2(12),
    assigned_carrier_code VARCHAR2(10),
    bill_of_lading_number VARCHAR2(30),
    pro_number VARCHAR2(20),
    firm_appt_ind NUMBER(2,0) DEFAULT 0,
    buyer_code VARCHAR2(3),
    asn_priority NUMBER(1,0) DEFAULT 0 NOT NULL,
    schedule_appt NUMBER(1,0) DEFAULT 0 NOT NULL,
    mfg_plnt VARCHAR2(3),
    trailer_number VARCHAR2(20),
    destination_type VARCHAR2(1) DEFAULT '0',
    contact_county VARCHAR2(40),
    contact_country_code VARCHAR2(2) DEFAULT 'US',
    receipt_variance NUMBER(1,0) DEFAULT 0 NOT NULL,
    receipt_type NUMBER(1,0) DEFAULT 0,
    variance_type NUMBER(4,0) DEFAULT 0,
    misc_instr_code_1 VARCHAR2(25),
    misc_instr_code_2 VARCHAR2(25),
    ref_field_1 VARCHAR2(25),
    ref_field_2 VARCHAR2(25),
    ref_field_3 VARCHAR2(25),
    ref_field_4 VARCHAR2(25),
    ref_field_5 VARCHAR2(25),
    ref_field_6 VARCHAR2(25),
    ref_field_7 VARCHAR2(25),
    ref_field_8 VARCHAR2(25),
    ref_field_9 VARCHAR2(25),
    ref_field_10 VARCHAR2(25),
    ref_num1 NUMBER(13,5) DEFAULT 0,
    ref_num2 NUMBER(13,5) DEFAULT 0,
    ref_num3 NUMBER(13,5) DEFAULT 0,
    ref_num4 NUMBER(13,5) DEFAULT 0,
    ref_num5 NUMBER(13,5) DEFAULT 0,
    shipping_cost NUMBER(13,4) DEFAULT 0,
    shipping_cost_currency_code VARCHAR2(3) DEFAULT 'USD',
    invoice_date TIMESTAMP(6),
    invoice_number VARCHAR2(30),
    hibernate_version NUMBER(10,0) DEFAULT 0,
    created_source_type NUMBER(2,0) DEFAULT 0 NOT NULL,
    created_source VARCHAR2(50) DEFAULT 'SYSTEM',
    last_updated_source_type NUMBER(2,0) DEFAULT 0 NOT NULL,
    last_updated_source VARCHAR2(50) DEFAULT 'SYSTEM',
    status VARCHAR(20) NOT NULL,
    notes VARCHAR(1000),
    client_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Create ASN Lines table with VARCHAR line_number (depends on ASN_HEADERS and CLIENTS)
CREATE TABLE asn_lines (
    line_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    header_asn_id BIGINT NOT NULL,
    line_number VARCHAR(255),
    item_id NUMBER(9,0),
    item_name VARCHAR(100),
    item_attr_1 VARCHAR(10),
    item_attr_2 VARCHAR(10),
    item_attr_3 VARCHAR(10),
    item_attr_4 VARCHAR(10),
    item_attr_5 VARCHAR(10),
    package_type_id NUMBER(8,0),
    package_type_desc VARCHAR(50),
    package_type_instance VARCHAR(100),
    epc_tracking_rfid_value VARCHAR(32),
    gtin VARCHAR(25),
    shipped_qty NUMBER(16,4),
    std_pack_qty NUMBER(13,4) DEFAULT 0,
    std_case_qty NUMBER(16,4),
    asn_detail_status NUMBER(3,0) NOT NULL DEFAULT 4,
    std_sub_pack_qty NUMBER(13,4) DEFAULT 0,
    lpn_per_tier NUMBER(5,0),
    tier_per_pallet NUMBER(5,0),
    mfg_plnt VARCHAR(3),
    mfg_date DATE,
    ship_by_date DATE,
    expire_date DATE,
    weight_uom_id_base NUMBER(9,0),
    is_cancelled NUMBER(1,0) NOT NULL DEFAULT 0,
    invn_type VARCHAR(1),
    prod_stat VARCHAR(3),
    cntry_of_orgn VARCHAR(4),
    shipped_lpn_count NUMBER(9,0),
    units_assigned_to_lpn NUMBER(16,4),
    proc_immd_needs VARCHAR(1),
    quality_check_hold_upon_rcpt VARCHAR(1),
    reference_order_nbr VARCHAR(12),
    actual_weight NUMBER(13,4),
    actual_weight_pack_count NUMBER(13,4),
    nbr_of_pack_for_catch_wt NUMBER(13,4),
    retail_price NUMBER(16,4),
    created_source_type NUMBER(2,0) NOT NULL DEFAULT 1,
    created_source VARCHAR(50),
    last_updated_source_type NUMBER(2,0) NOT NULL DEFAULT 1,
    last_updated_source VARCHAR(50),
    hibernate_version NUMBER(10,0),
    cut_nbr VARCHAR(12),
    qty_conv_factor NUMBER(17,8) NOT NULL DEFAULT 1,
    qty_uom_id NUMBER(12,0),
    weight_uom_id NUMBER(9,0),
    qty_uom_id_base NUMBER(9,0),
    exp_receive_condition_code VARCHAR(10),
    asn_recv_rules VARCHAR(200),
    ref_field_1 VARCHAR(25),
    ref_field_2 VARCHAR(25),
    ref_field_3 VARCHAR(25),
    ref_field_4 VARCHAR(25),
    ref_field_5 VARCHAR(25),
    ref_field_6 VARCHAR(25),
    ref_field_7 VARCHAR(25),
    ref_field_8 VARCHAR(25),
    ref_field_9 VARCHAR(25),
    ref_field_10 VARCHAR(25),
    ref_num1 NUMBER(13,5),
    ref_num2 NUMBER(13,5),
    ref_num3 NUMBER(13,5),
    ref_num4 NUMBER(13,5),
    ref_num5 NUMBER(13,5),
    disposition_type VARCHAR(3),
    inv_disposition VARCHAR(15),
    purchase_orders_line_item_id NUMBER(10,0),
    item_number VARCHAR(50),
    item_description VARCHAR(255),
    quantity INT,
    unit_of_measure VARCHAR(50),
    lot_number VARCHAR(50),
    serial_number VARCHAR(50),
    status VARCHAR(20),
    notes VARCHAR(500),
    client_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (header_asn_id) REFERENCES asn_headers(asn_id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Create Processed Files table (depends on INTERFACES and CLIENTS)
CREATE TABLE processed_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message VARCHAR(1000),
    interface_id BIGINT,
    client_id BIGINT NOT NULL,
    processed_data JSON,
    processed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (interface_id) REFERENCES interfaces(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Create Mapping Rules table (depends on CLIENTS and INTERFACES)
CREATE TABLE mapping_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    xml_path VARCHAR(255) NOT NULL,
    database_field VARCHAR(255) NOT NULL,
    transformation VARCHAR(255),
    is_required BOOLEAN DEFAULT FALSE,
    default_value VARCHAR(255),
    priority INT,
    interface_id BIGINT,
    client_id BIGINT NOT NULL,
    description VARCHAR(500),
    source_field VARCHAR(255),
    target_field VARCHAR(255),
    validation_rule VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    table_name VARCHAR(255),
    data_type VARCHAR(50),
    is_attribute BOOLEAN DEFAULT FALSE,
    xsd_element VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (interface_id) REFERENCES interfaces(id)
);

-- Create Audit Logs tables
CREATE TABLE http_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(255) NOT NULL,
    entity_id BIGINT NOT NULL,
    client_id BIGINT,
    details TEXT,
    ip_address VARCHAR(255),
    user_agent VARCHAR(255),
    request_method VARCHAR(10),
    request_url VARCHAR(255),
    request_params TEXT,
    response_status INT,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    execution_time BIGINT,
    duration BIGINT NOT NULL DEFAULT 0,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE method_audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    method VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    error TEXT,
    duration BIGINT NOT NULL,
    level VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create default client
INSERT INTO clients (name, code, description, status, created_at, updated_at)
VALUES ('DEFAULT_CLIENT', 'DEFAULT', 'Default client for existing data', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Create indexes for better query performance
CREATE INDEX idx_asn_headers_document_number ON asn_headers(asn_number);
CREATE INDEX idx_asn_lines_item_number ON asn_lines(item_number);
CREATE INDEX idx_processed_files_file_name ON processed_files(file_name);
CREATE INDEX idx_mapping_rules_source_field ON mapping_rules(source_field);
CREATE INDEX idx_interfaces_type ON interfaces(type);
CREATE INDEX idx_interfaces_root_element ON interfaces(root_element);
CREATE INDEX idx_asn_headers_client_id ON asn_headers(client_id);
CREATE INDEX idx_asn_lines_client_id ON asn_lines(client_id);
CREATE INDEX idx_processed_files_client_id ON processed_files(client_id);
CREATE INDEX idx_mapping_rules_client_id ON mapping_rules(client_id);
CREATE INDEX idx_mapping_rules_interface_id ON mapping_rules(interface_id);
CREATE INDEX idx_interfaces_client_id ON interfaces(client_id);
CREATE INDEX idx_http_audit_logs_username ON http_audit_logs(username);
CREATE INDEX idx_http_audit_logs_client_id ON http_audit_logs(client_id);
CREATE INDEX idx_http_audit_logs_created_at ON http_audit_logs(created_at);
CREATE INDEX idx_method_audit_logs_username ON method_audit_logs(username);
CREATE INDEX idx_method_audit_logs_created_at ON method_audit_logs(created_at); 