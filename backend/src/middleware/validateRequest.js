import createError from 'http-errors';
import { ZodError } from 'zod';
import { ERROR_CODES, ERROR_MESSAGES } from '../config/constants.js';

const extractMissingFields = (issues) =>
  issues
    .filter((issue) => issue.code === 'invalid_type' && issue.received === 'undefined')
    .map((issue) => issue.path.join('.'));

export const validateRequest = ({ params, body, query } = {}) =>
  (req, res, next) => {
    try {
      if (params) {
        req.params = params.parse(req.params);
      }
      if (body) {
        req.body = body.parse(req.body);
      }
      if (query) {
        req.query = query.parse(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const missingFields = extractMissingFields(error.issues);
        const { fieldErrors, formErrors } = error.flatten();
        const err = createError.BadRequest(ERROR_MESSAGES.INVALID_REQUEST);
        err.code = ERROR_CODES.INVALID_REQUEST;
        err.details = {
          ...(missingFields.length ? { missingFields } : {}),
          fieldErrors,
          formErrors,
        };
        next(err);
        return;
      }
      next(error);
    }
  };
