
import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const collaboration = new Hono<{ Bindings: Env }>();

collaboration.use('*', authMiddleware);

collaboration.get('/connect/:examId', async (c) => {
    const examId = c.req.param('examId');
    const id = c.env.COLLABORATION_DO.idFromName(examId);
    const obj = c.env.COLLABORATION_DO.get(id);

    return obj.fetch(c.req.raw);
});

export default collaboration;
