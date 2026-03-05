export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach server. Start backend and MongoDB, then try again.";
  }

  return fallbackMessage;
}
