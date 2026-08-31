const CODES = {
  VALIDATION: "VALIDATION",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNAVAILABLE: "UNAVAILABLE",
  INTERNAL: "INTERNAL",
};

class AppError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
  }

  static validation(message, details) {
    return new AppError(CODES.VALIDATION, message, details);
  }

  static notFound(message, details) {
    return new AppError(CODES.NOT_FOUND, message, details);
  }

  static conflict(message, details) {
    return new AppError(CODES.CONFLICT, message, details);
  }

  static unavailable(message, details) {
    return new AppError(CODES.UNAVAILABLE, message, details);
  }
}

class HttpError extends Error {
  constructor(status, message, code = CODES.INTERNAL, details) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static fromAppError(error) {
    const statusByCode = {
      [CODES.VALIDATION]: 400,
      [CODES.NOT_FOUND]: 404,
      [CODES.CONFLICT]: 409,
      [CODES.UNAVAILABLE]: 503,
      [CODES.INTERNAL]: 500,
    };
    return new HttpError(
      statusByCode[error.code] || 500,
      error.message,
      error.code || CODES.INTERNAL,
      error.details
    );
  }
}

function toHttpError(error) {
  if (error instanceof HttpError) return error;
  if (error instanceof AppError) return HttpError.fromAppError(error);
  if (error instanceof SyntaxError && "body" in error) {
    return new HttpError(400, "Invalid JSON body", CODES.VALIDATION);
  }
  return new HttpError(500, error.message || "Internal server error", CODES.INTERNAL);
}

module.exports = {
  AppError,
  HttpError,
  CODES,
  toHttpError,
};
