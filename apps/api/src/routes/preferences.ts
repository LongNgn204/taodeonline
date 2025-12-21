// Chú thích: API routes cho Teacher Preferences
// CRUD ghi chú mong muốn của giáo viên

import { Hono } from 'hono';
import type { Env } from '../types.js';

const app = new Hono<{ Bindings: Env }>();

interface TeacherPreferences {
    id: string;
    userId: string;
    libraryId?: string;
    notes?: string;
    preferences: {
        difficultyBias: 'easy' | 'balanced' | 'hard';
        focusTopics?: string[];
        excludeTopics?: string[];
        questionStyle: 'formal' | 'practical' | 'contextual';
        exportFormat: 'word' | 'latex' | 'pdf';
        includeHints: boolean;
        shuffleQuestions: boolean;
    };
    createdAt: string;
    updatedAt: string;
}

const DEFAULT_PREFERENCES: TeacherPreferences['preferences'] = {
    difficultyBias: 'balanced',
    questionStyle: 'formal',
    exportFormat: 'word',
    includeHints: true,
    shuffleQuestions: true,
};

/**
 * GET /preferences - Get user's preferences
 */
app.get('/', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = c.env.DB;

    // Get all preferences for this user
    const result = await db.prepare(`
        SELECT * FROM teacher_preferences 
        WHERE user_id = ?
        ORDER BY updated_at DESC
    `).bind(user.id).all();

    return c.json({
        preferences: result.results || [],
    });
});

/**
 * GET /preferences/:id - Get specific preference
 */
app.get('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = c.env.DB;
    const result = await db.prepare(`
        SELECT * FROM teacher_preferences 
        WHERE id = ? AND user_id = ?
    `).bind(id, user.id).first();

    if (!result) {
        return c.json({ error: 'Preferences not found' }, 404);
    }

    return c.json({
        preference: {
            ...result,
            preferences: JSON.parse((result as { preferences_json: string }).preferences_json || '{}'),
        },
    });
});

/**
 * GET /preferences/library/:libraryId - Get preferences for a library
 */
app.get('/library/:libraryId', async (c) => {
    const user = c.get('user');
    const libraryId = c.req.param('libraryId');

    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = c.env.DB;
    const result = await db.prepare(`
        SELECT * FROM teacher_preferences 
        WHERE user_id = ? AND library_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
    `).bind(user.id, libraryId).first();

    if (!result) {
        // Return default preferences if none exist
        return c.json({
            preference: {
                id: null,
                userId: user.id,
                libraryId,
                notes: '',
                preferences: DEFAULT_PREFERENCES,
            },
        });
    }

    return c.json({
        preference: {
            ...result,
            preferences: JSON.parse((result as { preferences_json: string }).preferences_json || '{}'),
        },
    });
});

/**
 * POST /preferences - Create or update preferences
 */
app.post('/', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json<{
        libraryId?: string;
        notes?: string;
        preferences?: Partial<TeacherPreferences['preferences']>;
    }>();

    const db = c.env.DB;
    const now = new Date().toISOString();

    // Check if preferences exist for this library
    let existingId: string | null = null;
    if (body.libraryId) {
        const existing = await db.prepare(`
            SELECT id FROM teacher_preferences 
            WHERE user_id = ? AND library_id = ?
        `).bind(user.id, body.libraryId).first<{ id: string }>();

        existingId = existing?.id || null;
    }

    const preferencesJson = JSON.stringify({
        ...DEFAULT_PREFERENCES,
        ...body.preferences,
    });

    if (existingId) {
        // Update existing
        await db.prepare(`
            UPDATE teacher_preferences 
            SET notes = ?, preferences_json = ?, updated_at = ?
            WHERE id = ?
        `).bind(body.notes || '', preferencesJson, now, existingId).run();

        return c.json({
            id: existingId,
            message: 'Preferences updated',
        });
    } else {
        // Create new
        const id = crypto.randomUUID();

        await db.prepare(`
            INSERT INTO teacher_preferences (id, user_id, library_id, notes, preferences_json, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).bind(id, user.id, body.libraryId || null, body.notes || '', preferencesJson, now, now).run();

        return c.json({
            id,
            message: 'Preferences created',
        }, 201);
    }
});

/**
 * PUT /preferences/:id - Update specific preference
 */
app.put('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json<{
        notes?: string;
        preferences?: Partial<TeacherPreferences['preferences']>;
    }>();

    const db = c.env.DB;
    const now = new Date().toISOString();

    // Get existing to merge preferences
    const existing = await db.prepare(`
        SELECT * FROM teacher_preferences 
        WHERE id = ? AND user_id = ?
    `).bind(id, user.id).first<{ preferences_json: string }>();

    if (!existing) {
        return c.json({ error: 'Preferences not found' }, 404);
    }

    const existingPrefs = JSON.parse(existing.preferences_json || '{}');
    const mergedPrefs = { ...existingPrefs, ...body.preferences };

    await db.prepare(`
        UPDATE teacher_preferences 
        SET notes = COALESCE(?, notes), preferences_json = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
    `).bind(body.notes, JSON.stringify(mergedPrefs), now, id, user.id).run();

    return c.json({
        id,
        message: 'Preferences updated',
    });
});

/**
 * DELETE /preferences/:id - Delete preference
 */
app.delete('/:id', async (c) => {
    const user = c.get('user');
    const id = c.req.param('id');

    if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    const db = c.env.DB;

    await db.prepare(`
        DELETE FROM teacher_preferences 
        WHERE id = ? AND user_id = ?
    `).bind(id, user.id).run();

    return c.json({ message: 'Preferences deleted' });
});

export const preferencesRoutes = app;
export default app;
