const { z } = require('zod');
const ApiError = require('../utils/ApiError');

/**
 * Returns an Express middleware that validates `req.body` against a Zod schema.
 * On validation failure, passes an ApiError(400) to Express's error handler
 * via next() so it returns a clean JSON response.
 *
 * @param {z.ZodSchema} schema - The Zod schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const message = result.error.issues.map((e) => `${e.path.join('.') || e.code}: ${e.message}`).join('; ');
    return next(new ApiError(400, message));
  }
  req.body = result.data;
  next();
};

// ── Vendor Schemas ──────────────────────────────────────────────────────────

const createVendorSchema = z.object({
  name: z.string().min(1, 'Vendor name is required').trim(),
  priority: z.number().min(0, 'Priority cannot be negative').default(1),
  weight: z.number().min(0, 'Weight cannot be negative').default(1),
  costPerRequest: z.number().min(0, 'Cost per request cannot be negative').default(0),
  timeoutMs: z.number().min(1, 'Timeout must be at least 1ms').default(3000),
  rateLimitPerMinute: z.number().min(1, 'Rate limit must be at least 1').default(100),
  supportedFeatures: z.array(z.string()).default([]),
  healthStatus: z.enum(['healthy', 'unhealthy']).default('healthy'),
  isActive: z.boolean().default(true),
});

const updateVendorSchema = z.object({
  name: z.string().min(1).trim().optional(),
  priority: z.number().min(0).optional(),
  weight: z.number().min(0).optional(),
  costPerRequest: z.number().min(0).optional(),
  timeoutMs: z.number().min(1).optional(),
  rateLimitPerMinute: z.number().min(1).optional(),
  supportedFeatures: z.array(z.string()).optional(),
  healthStatus: z.enum(['healthy', 'unhealthy']).optional(),
  isActive: z.boolean().optional(),
  currentLatency: z.number().min(0).optional(),
});

// ── Route Request Schema ────────────────────────────────────────────────────

const routeRequestSchema = z.object({
  capability: z.string().optional(),
  payload: z.record(z.any()).optional().default({}),
  strategy: z.string().optional(),
  requirements: z
    .object({
      maxLatencyMs: z.number().optional(),
      preferLowCost: z.boolean().optional(),
    })
    .optional()
    .default({}),
  conditions: z
    .array(
      z.object({
        metric: z.string(),
        operator: z.string().default('>'),
        value: z.number(),
        vendor: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

// ── AI Rule Generator Schema ────────────────────────────────────────────────

const aiRuleSchema = z.object({
  text: z.string().min(1, 'Rule text is required'),
});

// ── Routing Config Schema ───────────────────────────────────────────────────

const routingConfigSchema = z.object({
  sourceText: z.string().min(1, '"sourceText" is required'),
  strategy: z.string().min(1, '"strategy" is required'),
  vendorOrder: z.array(z.string()).optional().default([]),
  weights: z
    .array(z.object({ vendor: z.string(), percentage: z.number() }))
    .nullable()
    .optional()
    .default(null),
  conditions: z.array(z.any()).optional().default([]),
  capability: z.string().optional().default(null),
  isActive: z.boolean().optional().default(false),
});

module.exports = {
  validate,
  createVendorSchema,
  updateVendorSchema,
  routeRequestSchema,
  aiRuleSchema,
  routingConfigSchema,
};
