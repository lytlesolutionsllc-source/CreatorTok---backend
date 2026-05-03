import { Response } from 'express';
import OpenAI from 'openai';
import { AuthenticatedRequest, successResponse, errorResponse } from '../types';
import { config } from '../config';

const MAX_PROMPT_LENGTH = 1000;
const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]);

function getOpenAIClient(): OpenAI {
  if (!config.openaiApiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey: config.openaiApiKey });
}

/**
 * POST /api/images/generate
 * Body: { prompt: string }
 * Response: { imageUrl: string }
 *
 * Calls the OpenAI Images API (gpt-image-1) and returns the generated image.
 * No cloud storage is configured, so a base64 data URL is returned.
 * TODO: Integrate with S3/Cloudinary and return a hosted URL once storage is set up.
 */
export async function generateImage(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { prompt } = req.body as { prompt?: string };

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    res.status(400).json(errorResponse('prompt is required and must be a non-empty string'));
    return;
  }

  if (prompt.trim().length > MAX_PROMPT_LENGTH) {
    res.status(400).json(
      errorResponse(`prompt must be ${MAX_PROMPT_LENGTH} characters or fewer`)
    );
    return;
  }

  if (!config.openaiApiKey) {
    res.status(503).json(errorResponse('Image generation is not configured (missing OPENAI_API_KEY)'));
    return;
  }

  try {
    const openai = getOpenAIClient();

    const response = await openai.images.generate({
      model: 'gpt-image-1',
      prompt: prompt.trim(),
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) {
      res.status(500).json(errorResponse('Image generation returned no data'));
      return;
    }

    // Return as a base64 data URL (no cloud storage configured).
    // TODO: Upload to S3/Cloudinary and return a hosted URL instead.
    const imageUrl = `data:image/png;base64,${b64}`;
    res.status(201).json(successResponse({ imageUrl }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json(errorResponse(`Image generation failed: ${message}`));
  }
}

/**
 * POST /api/images/upload
 * Multipart form data with a `file` field containing an image.
 * Response: { imageUrl: string }
 *
 * No cloud storage is configured, so the file is returned as a base64 data URL.
 * TODO: Integrate with S3/Cloudinary and return a hosted URL once storage is set up.
 */
export async function uploadImage(req: AuthenticatedRequest, res: Response): Promise<void> {
  const file = req.file as Express.Multer.File | undefined;

  if (!file) {
    res.status(400).json(errorResponse('A file must be provided in the "file" field'));
    return;
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    res.status(400).json(
      errorResponse(`File type "${file.mimetype}" is not supported. Allowed types: jpeg, png, gif, webp`)
    );
    return;
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    res.status(400).json(
      errorResponse(`File size exceeds the maximum allowed size of ${MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)} MB`)
    );
    return;
  }

  // Return as a base64 data URL (no cloud storage configured).
  // TODO: Upload to S3/Cloudinary and return a hosted URL instead.
  const b64 = file.buffer.toString('base64');
  const imageUrl = `data:${file.mimetype};base64,${b64}`;
  res.status(201).json(successResponse({ imageUrl }));
}
