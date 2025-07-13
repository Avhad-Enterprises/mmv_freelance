export interface VisitorLog {
    id: number;
    session_id: string;
    user_id?: number | null;
    ip_address?: string | null;
    user_agent?: string | null;
    browser_info?: string | null;
    os_info?: string | null;
    device_type?: string | null;
    device_model?: string | null;
    screen_resolution?: string | null;
    browser_language?: string | null;
    referrer_url?: string | null;
    referrer_domain?: string | null;
    entry_page?: string | null;
    exit_page?: string | null;
    current_url: string;
    time_spent: number;
    session_duration?: number | null;
    bounce: boolean;
    page_load_time?: number | null;
    network_type?: string | null;
    country_code?: string | null;
    city?: string | null;
    postal_code?: string | null;
    timezone_offset?: string | null;
    clicks_count?: number | null;
    scroll_percentage?: number | null;
    form_interaction?: any | null;     // could use specific type instead of `any` if structure known
    video_interaction?: any | null;    // same as above
    actions?: any | null;              // same as above
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
    referral_code_used?: string | null;
    platform?: string | null;
    visitor_type?: string | null;
    is_bot: boolean;
    ip_hash?: string | null;
    is_active: number;
    created_by: number;
    created_at: Date;
    updated_at: Date;
    updated_by?: number | null;
    is_deleted: boolean;
    deleted_by?: number | null;
    deleted_at?: Date | null;
  }
  