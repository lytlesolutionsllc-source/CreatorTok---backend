import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { generateImage, uploadImage } from '../controllers/image.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { AuthenticatedRequest, errorResponse } from '../types';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB hard limit
});

function wrap(fn: (req: AuthenticatedRequest, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    authMiddleware(req as AuthenticatedRequest, res, () => {
      fn(req as AuthenticatedRequest, res).catch(next);
    });
  };
}

// POST /api/images/generate  — AI image generation via OpenAI
router.post('/generate', wrap(generateImage));

// POST /api/images/upload  — user-provided image upload (multipart/form-data, field: "file")
router.post(
  '/upload',
  (req: Request, res: Response, next: NextFunction) => {
    authMiddleware(req as AuthenticatedRequest, res, () => {
      upload.single('file')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          res.status(400).json(errorResponse(err.message));
          return;
        }
        if (err) {
          next(err);
          return;
        }
        next();
      });
    });
  },
  (req: Request, res: Response, next: NextFunction) => {
    uploadImage(req as AuthenticatedRequest, res).catch(next);
  }
);

export default router;
