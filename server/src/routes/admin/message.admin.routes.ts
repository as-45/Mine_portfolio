import { Router } from 'express';
import * as controller from '../../controllers/admin/message.admin.controller';

const router = Router();

router.get('/', controller.list);
router.patch('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
