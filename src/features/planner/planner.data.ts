import {
  PlannerWeek,
  PlannerEntry,
  WEEK_DAYS,
  DAY_SLOTS,
  WeekDay,
  DaySlot,
} from './planner.types';

const weeks: PlannerWeek[] = [];

export function getOrCreateWeek(startDate: string): PlannerWeek {
    let existingWeek = weeks.find((week) => week.startDate === startDate);

    if (!existingWeek) {
        existingWeek = {
        startDate,
        entries: WEEK_DAYS.flatMap((day) =>
            DAY_SLOTS.map((slot) => ({
            day,
            slot,
            recipeId: null,
            })),
        ),
        };

        weeks.push(existingWeek);
    }

    return existingWeek;
}

export function updateEntry(
    startDate: string,
    day: WeekDay,
    slot: DaySlot,
    recipeId: number,
): PlannerEntry | null {
    const week = getOrCreateWeek(startDate);

    const dayEntry = week.entries.find((e) => e.day === day && e.slot === slot);
    if (!dayEntry) {
        return null;
    }

    dayEntry.recipeId = recipeId;
    return dayEntry;
}
