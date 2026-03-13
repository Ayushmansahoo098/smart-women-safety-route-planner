export const PASSWORD_RULES = [
  {
    key: "minLength",
    label: "Minimum 8 characters",
    test: (value) => value.length >= 8
  },
  {
    key: "uppercase",
    label: "At least one uppercase letter",
    test: (value) => /[A-Z]/.test(value)
  },
  {
    key: "lowercase",
    label: "At least one lowercase letter",
    test: (value) => /[a-z]/.test(value)
  },
  {
    key: "number",
    label: "At least one number",
    test: (value) => /[0-9]/.test(value)
  },
  {
    key: "special",
    label: "At least one special character",
    test: (value) => /[^A-Za-z0-9]/.test(value)
  }
];

export function getPasswordValidationState(password) {
  return PASSWORD_RULES.reduce((result, rule) => {
    result[rule.key] = rule.test(password);
    return result;
  }, {});
}

export function isStrongPassword(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
