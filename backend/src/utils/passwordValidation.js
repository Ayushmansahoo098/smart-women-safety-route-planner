const PASSWORD_REQUIREMENTS = [
  {
    key: "minLength",
    message: "Password must be at least 8 characters long.",
    test: (value) => value.length >= 8
  },
  {
    key: "uppercase",
    message: "Password must include at least one uppercase letter.",
    test: (value) => /[A-Z]/.test(value)
  },
  {
    key: "lowercase",
    message: "Password must include at least one lowercase letter.",
    test: (value) => /[a-z]/.test(value)
  },
  {
    key: "number",
    message: "Password must include at least one number.",
    test: (value) => /[0-9]/.test(value)
  },
  {
    key: "special",
    message: "Password must include at least one special character.",
    test: (value) => /[^A-Za-z0-9]/.test(value)
  }
];

function validatePasswordStrength(password = "") {
  const errors = PASSWORD_REQUIREMENTS.filter((rule) => !rule.test(password)).map(
    (rule) => rule.message
  );

  return {
    isValid: errors.length === 0,
    errors
  };
}

export { validatePasswordStrength };
