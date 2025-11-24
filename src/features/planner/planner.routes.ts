import { Router } from "express";
import { getOrCreateWeek, updateEntry} from "./planner.data";
import { DAY_SLOTS, DaySlot, WEEK_DAYS, WeekDay } from "./planner.types";

export const plannerRouter = Router();

const isWeekDay = (value: unknown): value is WeekDay => {
  return typeof value === 'string' && WEEK_DAYS.some(day => day === value);
};

const isDaySlot = (value: unknown): value is DaySlot => {
  return typeof value === 'string' && DAY_SLOTS.some(slot => slot === value);
};

plannerRouter.get('/week', (req, res) => {
    const {startDate} = req.query;

    if (typeof startDate !== 'string' || !startDate) {
        return res.status(400).json({error: 'startDate query parameter is required'});
    }

    const week = getOrCreateWeek(startDate);
    res.json(week);
})

plannerRouter.post('/week/slot', (req, res) => {
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
        const updatedEntry = updateEntry(startDate, day, slot, recipeId);
        if (updatedEntry) {
            res.json(updatedEntry);
        } else {
            res.status(404).json({error: 'Entry not found'});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
})
