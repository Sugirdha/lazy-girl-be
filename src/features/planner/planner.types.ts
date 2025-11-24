export type WeekDay = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
export type DaySlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export const WEEK_DAYS: WeekDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; // TODO: take account of user's preferred first day of week
export const DAY_SLOTS: DaySlot[] = ['breakfast', 'lunch', 'snack', 'dinner']; // TODO: Take account of user's preferred slots

export type PlannerEntry = {
    day: WeekDay;
    slot: DaySlot;
    recipeId: number | null;
}

export type PlannerWeek = {
    startDate: string;
    entries: PlannerEntry[];
};