export interface Rocket {
    name:                string;
    family:              Family;
    reusable:            boolean;
    description:         string;
    launch_count:        number;
    maiden_flight:       Date | null;
    failed_launches:     number;
    launch_cost_usd:     number | null;
    success_rate_pct:    number | null;
    successful_launches: number;
}

export type Family = "Falcon" | "Starship";
