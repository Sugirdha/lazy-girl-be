import {
  PlannerWeek,
  PlannerDay,
  WEEK_DAYS,
  DAY_SLOTS,
  WeekDay,
  DaySlot,
} from './planner.types';

const weeks: PlannerWeek[] = [];

export function getOrCreateWeek(startDate: string): PlannerWeek {

    console.log('getOrCreateWeek called with startDate:', startDate);


    let existingWeek = weeks.find((week) => week.startDate === startDate);

    if (!existingWeek) {
        console.log('No existing week found, creating new week for startDate:', startDate);
        existingWeek = {
        startDate,
        days: WEEK_DAYS.flatMap((day) =>
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

export function updateDaySlot(
    startDate: string,
    day: WeekDay,
    slot: DaySlot,
    recipeId: number,
): PlannerDay | null {

    console.log('updateDaySlot called with:', { startDate, day, slot, recipeId });


    const week = getOrCreateWeek(startDate);

    const dayEntry = week.days.find((d) => d.day === day && d.slot === slot);
    if (!dayEntry) {
        return null;
    }

    dayEntry.recipeId = recipeId;
    return dayEntry;
}
