import Joi from 'joi'

// Login request validation schema
export const loginSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must not exceed 30 characters'
    }),
  
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long'
    })
})

// User creation/update validation schema
export const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  
  password: Joi.string()
    .min(6)
    .required(),
  
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name must not exceed 100 characters'
    }),
  
  role: Joi.string()
    .valid('ADMIN', 'MANAGER')
    .default('MANAGER')
    .messages({
      'any.only': 'Role must be either ADMIN or MANAGER'
    })
})

// Password change validation schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'string.empty': 'Current password is required'
    }),
  
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.empty': 'New password is required',
      'string.min': 'New password must be at least 6 characters long'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Password confirmation does not match new password',
      'string.empty': 'Password confirmation is required'
    })
})

// Room creation validation schema
export const createRoomSchema = Joi.object({
  number: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Room number is required'
    }),
  
  floor: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Floor must be a number',
      'number.integer': 'Floor must be an integer',
      'number.min': 'Floor must be at least 1',
      'any.required': 'Floor is required'
    }),
  
  area: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Area must be a number',
      'number.positive': 'Area must be a positive number',
      'any.required': 'Area is required'
    }),
  
  type: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Room type is required'
    }),
  
  basePrice: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Base price must be a number',
      'number.positive': 'Base price must be a positive number',
      'any.required': 'Base price is required'
    }),
  
  status: Joi.string()
    .valid('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')
    .default('AVAILABLE')
    .messages({
      'any.only': 'Status must be one of: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE'
    })
})

// Room update validation schema (all fields optional)
export const updateRoomSchema = Joi.object({
  number: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Room number cannot be empty'
    }),
  
  floor: Joi.number()
    .integer()
    .min(1)
    .messages({
      'number.base': 'Floor must be a number',
      'number.integer': 'Floor must be an integer',
      'number.min': 'Floor must be at least 1'
    }),
  
  area: Joi.number()
    .positive()
    .messages({
      'number.base': 'Area must be a number',
      'number.positive': 'Area must be a positive number'
    }),
  
  type: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Room type cannot be empty'
    }),
  
  basePrice: Joi.number()
    .positive()
    .messages({
      'number.base': 'Base price must be a number',
      'number.positive': 'Base price must be a positive number'
    }),
  
  status: Joi.string()
    .valid('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE')
    .messages({
      'any.only': 'Status must be one of: AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
})

// Validation middleware factory
export function validateRequest(schema: Joi.ObjectSchema) {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true // Remove unknown fields
    })

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      })
    }

    // Replace req.body with validated and sanitized data
    req.body = value
    next()
  }
}
