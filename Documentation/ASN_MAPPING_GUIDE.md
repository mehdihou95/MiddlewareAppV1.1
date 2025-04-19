# ASN Header Mapping Rules Guide

## Overview
This guide outlines the requirements for creating mapping rules for ASN (Advanced Shipping Notice) headers and their fields. Following these guidelines will ensure data integrity and prevent NULL constraint violations.

## Critical Fields
These fields **MUST** have mapping rules and cannot be null.

### Core Fields
| Field Name | Type | Default | Notes |
|------------|------|---------|-------|
| `status` | String | "NEW" | **Handled automatically by backend** - No mapping needed |
| `asn_number` | String | - | Unique identifier for the ASN |
| `asn_type` | Integer | - | Type identifier for the ASN |
| `receipt_dttm` | String | Current Date | Format: YYYY-MM-DD (Handled by backend if not mapped) |
| `asn_level` | Integer | 1 | Hierarchy level of the ASN |

### Required Boolean Flags
All these fields are required and should default to `false`:

| Field Name | Type | Default |
|------------|------|---------|
| `has_import_error` | Boolean | false |
| `has_soft_check_error` | Boolean | false |
| `has_alerts` | Boolean | false |
| `is_cogi_generated` | Boolean | false |
| `is_cancelled` | Boolean | false |
| `is_closed` | Boolean | false |
| `is_gift` | Boolean | false |

### Other Required Fields with Defaults
| Field Name | Type | Default | Notes |
|------------|------|---------|-------|
| `is_whse_transfer` | String | "0" | Warehouse transfer indicator |
| `quality_audit_percent` | BigDecimal | 0 | Precision: 5,2 |
| `asn_priority` | Integer | 0 | Processing priority |
| `schedule_appt` | Integer | 0 | Appointment scheduling flag |

## Optional Fields

### Business Partner Information
| Field Name | Length | Type | Notes |
|------------|--------|------|-------|
| `business_partner_id` | - | String | Partner identifier |
| `business_partner_name` | - | String | Partner name |
| `business_partner_address_1` | 75 | String | Primary address |
| `business_partner_address_2` | 75 | String | Secondary address |
| `business_partner_address_3` | 75 | String | Additional address |
| `business_partner_city` | 40 | String | City |
| `business_partner_state_prov` | 3 | String | State/Province code |
| `business_partner_zip` | 10 | String | ZIP/Postal code |

### Contact Information
| Field Name | Length | Type | Notes |
|------------|--------|------|-------|
| `contact_address_1` | 75 | String | Primary address |
| `contact_address_2` | 75 | String | Secondary address |
| `contact_address_3` | 75 | String | Additional address |
| `contact_city` | 40 | String | City |
| `contact_state_prov` | 3 | String | State/Province code |
| `contact_zip` | 10 | String | ZIP/Postal code |
| `contact_number` | 32 | String | Contact phone/reference |

### Appointment Details
| Field Name | Type | Notes |
|------------|------|-------|
| `appointment_id` | String(50) | Appointment identifier |
| `appointment_dttm` | Date | Appointment date/time |
| `appointment_duration` | Long | Duration in minutes |

### Delivery Information
| Field Name | Type | Notes |
|------------|------|-------|
| `driver_name` | String(50) | |
| `tractor_number` | String(50) | |
| `delivery_stop_seq` | Integer | Stop sequence number |
| `pickup_end_dttm` | Date | |
| `delivery_start_dttm` | Date | |
| `delivery_end_dttm` | Date | |
| `actual_departure_dttm` | Date | |
| `actual_arrival_dttm` | Date | |

### Quantities and Measurements
| Field Name | Type | Precision | Notes |
|------------|------|-----------|-------|
| `total_weight` | BigDecimal | 13,4 | |
| `total_volume` | BigDecimal | 13,4 | |
| `volume_uom_id_base` | Long | - | Unit of measure ID |
| `total_shipped_qty` | BigDecimal | 16,4 | |
| `total_received_qty` | BigDecimal | 16,4 | |
| `shipped_lpn_count` | Long | - | |
| `received_lpn_count` | Long | - | |

### Equipment Information
| Field Name | Type | Length | Notes |
|------------|------|--------|-------|
| `equipment_type` | String | 8 | |
| `equipment_code` | String | 20 | |
| `equipment_code_id` | Long | - | |

### Reference Numbers
| Field Name | Type | Length | Notes |
|------------|------|--------|-------|
| `manif_nbr` | String | 20 | Manifest number |
| `manif_type` | String | 4 | Manifest type |
| `work_ord_nbr` | String | 12 | Work order number |
| `cut_nbr` | String | 12 | Cut number |
| `assigned_carrier_code` | String | 10 | |
| `bill_of_lading_number` | String | 30 | |
| `pro_number` | String | 20 | |
| `firm_appt_ind` | Integer | - | |
| `buyer_code` | String | 3 | |

### Additional Fields
| Field Name | Type | Notes |
|------------|------|-------|
| `notes` | String | General notes |
| `region_id` | Long | Region identifier |

## Best Practices

### 1. Status Management
- Always set an initial status value
- Use consistent status values across the application
- Consider status transitions in your mapping rules

### 2. Date Handling
- Use proper date format transformations
- Consider timezone implications
- Validate date formats in mapping rules

### 3. Numeric Fields
- Use appropriate precision for decimal values
- Consider rounding rules where applicable
- Handle null numeric values appropriately

### 4. String Fields
- Respect maximum length constraints
- Consider string trimming rules
- Handle special characters appropriately

### 5. Default Values
- Set appropriate defaults for required fields
- Document default value logic
- Consider business rules when setting defaults

## Common Mapping Scenarios

### Example 1: Basic Required Fields
```xml
<mapping>
    <field target="status" source="..." default="NEW"/>
    <field target="asn_number" source="..." required="true"/>
    <field target="asn_type" source="..." required="true"/>
    <field target="receipt_dttm" source="..." transform="date_format"/>
</mapping>
```

### Example 2: Boolean Flags
```xml
<mapping>
    <field target="has_import_error" default="false"/>
    <field target="has_soft_check_error" default="false"/>
    <field target="is_closed" default="false"/>
</mapping>
```

## Troubleshooting

### Common Issues
1. NULL constraint violations
   - Check required field mappings
   - Verify default values
   - Validate transformation rules

2. Data type mismatches
   - Verify field types match entity
   - Check transformation rules
   - Validate numeric precision

3. String truncation
   - Check field length constraints
   - Implement trimming rules
   - Validate input data 