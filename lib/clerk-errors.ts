type ClerkErrorDetail = {
  code?: string;
  message?: string;
};

type ClerkErrorLike = {
  errors?: ClerkErrorDetail[];
};

const PASSWORD_ERROR_CODES = new Set([
  "form_password_too_short",
  "form_password_not_strong_enough",
  "form_password_pwned",
  "form_password_invalid",
]);

function extractClerkErrors(error: unknown): ClerkErrorDetail[] {
  const errors = (error as ClerkErrorLike | undefined)?.errors;
  return Array.isArray(errors) ? errors : [];
}

export function getClerkPasswordErrorMessage(error: unknown): string | null {
  const errors = extractClerkErrors(error);
  if (errors.length === 0) return null;

  const hasPasswordError = errors.some((detail) => {
    const code = detail?.code ?? "";
    return code.includes("password") || PASSWORD_ERROR_CODES.has(code);
  });

  if (!hasPasswordError) return null;

  return "Password does not meet requirements. It must be at least 8 characters and cannot be a weak or commonly breached password.";
}

