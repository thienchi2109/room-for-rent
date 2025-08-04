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
  
  capacity: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .required()
    .messages({
      'number.base': 'Capacity must be a number',
      'number.integer': 'Capacity must be an integer',
      'number.min': 'Capacity must be at least 1',
      'number.max': 'Capacity cannot exceed 10',
      'any.required': 'Capacity is required'
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
  
  capacity: Joi.number()
    .integer()
    .min(1)
    .max(10)
    .messages({
      'number.base': 'Capacity must be a number',
      'number.integer': 'Capacity must be an integer',
      'number.min': 'Capacity must be at least 1',
      'number.max': 'Capacity cannot exceed 10'
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

// Tenant creation validation schema
export const createTenantSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .required()
    .trim()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name must not exceed 100 characters'
    }),

  dateOfBirth: Joi.date()
    .max('now')
    .required()
    .messages({
      'date.base': 'Date of birth must be a valid date',
      'date.max': 'Date of birth cannot be in the future',
      'any.required': 'Date of birth is required'
    }),

  idCard: Joi.string()
    .pattern(/^[0-9]{9,12}$/)
    .required()
    .trim()
    .messages({
      'string.empty': 'ID card number is required',
      'string.pattern.base': 'ID card number must be 9-12 digits',
      'any.required': 'ID card number is required'
    }),

  hometown: Joi.string()
    .min(2)
    .max(200)
    .required()
    .trim()
    .messages({
      'string.empty': 'Hometown is required',
      'string.min': 'Hometown must be at least 2 characters long',
      'string.max': 'Hometown must not exceed 200 characters'
    }),

  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]{10,15}$/)
    .required()
    .trim()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Phone number must be 10-15 digits and may contain +, -, spaces, or parentheses',
      'any.required': 'Phone number is required'
    })
})

// Tenant update validation schema (all fields optional)
export const updateTenantSchema = Joi.object({
  fullName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Full name cannot be empty',
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name must not exceed 100 characters'
    }),

  dateOfBirth: Joi.date()
    .max('now')
    .messages({
      'date.base': 'Date of birth must be a valid date',
      'date.max': 'Date of birth cannot be in the future'
    }),

  idCard: Joi.string()
    .pattern(/^[0-9]{9,12}$/)
    .trim()
    .messages({
      'string.empty': 'ID card number cannot be empty',
      'string.pattern.base': 'ID card number must be 9-12 digits'
    }),

  hometown: Joi.string()
    .min(2)
    .max(200)
    .trim()
    .messages({
      'string.empty': 'Hometown cannot be empty',
      'string.min': 'Hometown must be at least 2 characters long',
      'string.max': 'Hometown must not exceed 200 characters'
    }),

  phone: Joi.string()
    .pattern(/^[0-9+\-\s()]{10,15}$/)
    .trim()
    .messages({
      'string.empty': 'Phone number cannot be empty',
      'string.pattern.base': 'Phone number must be 10-15 digits and may contain +, -, spaces, or parentheses'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
})

// Residency record creation validation schema
export const createResidencyRecordSchema = Joi.object({
  tenantId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Tenant ID is required',
      'any.required': 'Tenant ID is required'
    }),

  type: Joi.string()
    .valid('TEMPORARY_RESIDENCE', 'TEMPORARY_ABSENCE')
    .required()
    .messages({
      'any.only': 'Type must be either TEMPORARY_RESIDENCE or TEMPORARY_ABSENCE',
      'any.required': 'Type is required'
    }),

  startDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .allow(null)
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date'
    }),

  notes: Joi.string()
    .max(500)
    .allow('')
    .trim()
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    })
})

// Residency record update validation schema (all fields optional except tenantId)
export const updateResidencyRecordSchema = Joi.object({
  type: Joi.string()
    .valid('TEMPORARY_RESIDENCE', 'TEMPORARY_ABSENCE')
    .messages({
      'any.only': 'Type must be either TEMPORARY_RESIDENCE or TEMPORARY_ABSENCE'
    }),

  startDate: Joi.date()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .allow(null)
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date'
    }),

  notes: Joi.string()
    .max(500)
    .allow('')
    .trim()
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
})

// Contract creation validation schema
export const createContractSchema = Joi.object({
  contractNumber: Joi.string()
    .trim()
    .allow('')
    .messages({
      'string.empty': 'Contract number cannot be empty if provided'
    }),

  roomId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Room ID is required',
      'any.required': 'Room ID is required'
    }),

  startDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required'
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .required()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date',
      'any.required': 'End date is required'
    }),

  deposit: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': 'Deposit must be a number',
      'number.positive': 'Deposit must be a positive number',
      'any.required': 'Deposit is required'
    }),

  status: Joi.string()
    .valid('ACTIVE', 'EXPIRED', 'TERMINATED')
    .default('ACTIVE')
    .messages({
      'any.only': 'Status must be one of: ACTIVE, EXPIRED, TERMINATED'
    }),

  tenantIds: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .required()
    .messages({
      'array.base': 'Tenant IDs must be an array',
      'array.min': 'At least one tenant must be specified',
      'any.required': 'Tenant IDs are required'
    }),

  primaryTenantId: Joi.string()
    .required()
    .trim()
    .messages({
      'string.empty': 'Primary tenant ID is required',
      'any.required': 'Primary tenant ID is required'
    })
})

// Contract update validation schema (all fields optional)
export const updateContractSchema = Joi.object({
  contractNumber: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Contract number cannot be empty'
    }),

  roomId: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Room ID cannot be empty'
    }),

  startDate: Joi.date()
    .messages({
      'date.base': 'Start date must be a valid date'
    }),

  endDate: Joi.date()
    .greater(Joi.ref('startDate'))
    .messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date'
    }),

  deposit: Joi.number()
    .positive()
    .messages({
      'number.base': 'Deposit must be a number',
      'number.positive': 'Deposit must be a positive number'
    }),

  status: Joi.string()
    .valid('ACTIVE', 'EXPIRED', 'TERMINATED')
    .messages({
      'any.only': 'Status must be one of: ACTIVE, EXPIRED, TERMINATED'
    }),

  tenantIds: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .messages({
      'array.base': 'Tenant IDs must be an array',
      'array.min': 'At least one tenant must be specified'
    }),

  primaryTenantId: Joi.string()
    .trim()
    .messages({
      'string.empty': 'Primary tenant ID cannot be empty'
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
