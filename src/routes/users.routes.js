import { Router } from 'express';
import { registerUser } from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// POST /api/v1/users/register
router.route('/register').post(
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  async (req, res, next) => {
    try {
      // Register user using the imported function
      await registerUser(req, res);
    } catch (error) {
      next(error); // اگر کوئی خطا ہو تو اگلے مڈل ویئر کو کال کریں
    }
  }
);

export default router;
