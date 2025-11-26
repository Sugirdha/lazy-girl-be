import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import type {
  PlannerWeek,
  PlannerEntry as PlannerEntryData,
  WeekDay,
  DaySlot,
} from './planner.types';
import { WEEK_DAYS, DAY_SLOTS } from './planner.types';

export class InvalidStartDateError extends Error {
  constructor(startDate: string) {
    super(`Invalid startDate: ${startDate}`);
    this.name = 'InvalidStartDateError';
  }
}

export class RecipeNotFoundError extends Error {
  constructor(recipeId: number) {
    super(`Recipe ${recipeId} not found`);
    this.name = 'RecipeNotFoundError';
  }
}

type DbPlannerEntry = {
  day: WeekDay;
  slot: DaySlot;
  recipeId: number | null;
};

const dayOrder = new Map(WEEK_DAYS.map((day, index) => [day, index]));
const slotOrder = new Map(DAY_SLOTS.map((slot, index) => [slot, index]));

const parseStartDate = (startDate: string): Date => {
  const parsed = new Date(startDate);
  if (Number.isNaN(parsed.getTime())) {
    throw new InvalidStartDateError(startDate);
  }

  return parsed;
};

const ensureEntries = async (weekId: number): Promise<DbPlannerEntry[]> => {
  const existingEntries = await prisma.plannerEntry.findMany({
    where: { weekId },
    select: {
      day: true,
      slot: true,
      recipeId: true,
    },
  });

  const existingKeys = new Set(existingEntries.map((entry) => `${entry.day}-${entry.slot}`));
  const entriesToCreate: { weekId: number; day: WeekDay; slot: DaySlot }[] = [];

  WEEK_DAYS.forEach((day) => {
    DAY_SLOTS.forEach((slot) => {
      const key = `${day}-${slot}`;
      if (!existingKeys.has(key)) {
        entriesToCreate.push({ weekId, day, slot });
      }
    });
  });

  if (entriesToCreate.length > 0) {
    await prisma.plannerEntry.createMany({ data: entriesToCreate });
    return prisma.plannerEntry.findMany({
      where: { weekId },
      select: {
        day: true,
        slot: true,
        recipeId: true,
      },
    });
  }

  return existingEntries;
};

const toPlannerEntry = (entry: DbPlannerEntry): PlannerEntryData => ({
  day: entry.day,
  slot: entry.slot,
  recipeId: entry.recipeId,
});

const sortEntries = (entries: PlannerEntryData[]): PlannerEntryData[] => {
  return [...entries].sort((a, b) => {
    const dayComparison = (dayOrder.get(a.day) ?? 0) - (dayOrder.get(b.day) ?? 0);

    if (dayComparison !== 0) {
      return dayComparison;
    }

    return (slotOrder.get(a.slot) ?? 0) - (slotOrder.get(b.slot) ?? 0);
  });
};

const ensureWeekContext = async (userId: number, startDate: string) => {
  const parsedDate = parseStartDate(startDate);

  const weekRecord = await prisma.plannerWeek.upsert({
    where: {
      userId_startDate: {
        userId: userId,
        startDate: parsedDate,
      },
    },
    create: {
      userId: userId,
      startDate: parsedDate,
    },
    update: {},
    include: {
      plannerEntries: true,
    },
  });

  const entries = await ensureEntries(weekRecord.id);

   return {
    weekId: weekRecord.id,
    startDateIso: weekRecord.startDate.toISOString(),
    entries,
  };
};

export async function getOrCreateWeek(userId: number, startDate: string): Promise<PlannerWeek> {
  const { entries, startDateIso } = await ensureWeekContext(userId, startDate);

  return {
    startDate: startDateIso,
    entries: sortEntries(entries.map(toPlannerEntry)),
  };
}

export async function updateEntry(
  userId: number,
  startDate: string,
  day: WeekDay,
  slot: DaySlot,
  recipeId: number,
): Promise<PlannerEntryData | null> {
  const { weekId } = await ensureWeekContext(userId, startDate);

  try {
    const entry = await prisma.plannerEntry.update({
      where: {
        weekId_day_slot: {
          weekId,
          day,
          slot,
        },
      },
      data: {
        recipeId,
      },
      select: {
        day: true,
        slot: true,
        recipeId: true,
      },
    });

    return toPlannerEntry(entry);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2003'
    ) {
      throw new RecipeNotFoundError(recipeId);
    }

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    ) {
      return null;
    }

    throw err;
  }
}
