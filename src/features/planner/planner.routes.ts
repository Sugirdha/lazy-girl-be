import { Router } from 'express';
import { getOrCreateWeek, updateEntry, InvalidStartDateError, RecipeNotFoundError } from './planner.data';
import { DAY_SLOTS, DaySlot, WEEK_DAYS, WeekDay } from './planner.types';

export const plannerRouter = Router();

const isWeekDay = (value: unknown): value is WeekDay => {
  return typeof value === 'string' && WEEK_DAYS.some(day => day === value);
};

const isDaySlot = (value: unknown): value is DaySlot => {
  return typeof value === 'string' && DAY_SLOTS.some(slot => slot === value);
};

plannerRouter.get('/week', async (req, res) => {
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }
    const userId = req.currentUser.id;
    const {startDate} = req.query;

    if (typeof startDate !== 'string' || !startDate) {
        return res.status(400).json({error: 'startDate query parameter is required'});
    }

    try {
        const week = await getOrCreateWeek(userId, startDate);
        res.json(week);
    } catch (err) {
        if (err instanceof InvalidStartDateError) {
            return res.status(400).json({error: err.message});
        }

        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})

plannerRouter.post('/week/slot', async (req, res) => {
    if (!req.currentUser) {
        return res.status(401).json({ message: 'Unauthenticated' });
    }

    const userId = req.currentUser.id;
    const {startDate, day, slot, recipeId} = req.body ?? {};

    if (typeof startDate !== 'string' || !startDate) {
        return res.status(400).json({error: 'startDate is required'});
    }

    if (!isWeekDay(day)) {
        return res.status(400).json({error: 'valid day is required'});
    }

    if (!isDaySlot(slot)) {
        return res.status(400).json({error: 'valid slot is required'});
    }

    if (typeof recipeId !== 'number' || !recipeId) {
        return res.status(400).json({error: 'recipeId is required'});
    }

    try {
        const updatedEntry = await updateEntry(userId, startDate, day, slot, recipeId);
        if (updatedEntry) {
            res.json(updatedEntry);
        } else {
            res.status(404).json({error: 'Entry not found'});
        }
    } catch (err) {
        if (err instanceof InvalidStartDateError) {
            return res.status(400).json({error: err.message});
        }

        if (err instanceof RecipeNotFoundError) {
            return res.status(404).json({error: err.message});
        }

        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})
