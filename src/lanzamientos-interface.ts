export interface Launch {
    id:       string;
    name:     string;
    success:  boolean | null;
    date_utc: string;
    rocket:   string;
    links:    {
        patch: {
            small: string | null;
            large: string | null;
        };
        webcast?: string | null;
        wikipedia?: string | null;
    };
    details?: string | null;
}