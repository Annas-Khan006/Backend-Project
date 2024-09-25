import { Router } from 'express';
import { registerUser } from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  (req, res, next) => {
    try {
      registerUser(req, res);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
