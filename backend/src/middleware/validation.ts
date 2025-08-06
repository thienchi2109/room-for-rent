import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query)

    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.details[0].message,
        details: error.details
      })
      return
    }

    next()
  }
}

export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body)

    if (error) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.details[0].message,
        details: error.details
      })
      return
    }

    next()
  }
}
