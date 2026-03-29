export function getUserAccess(currentUser) {
  return currentUser?.access === "Admin" ? "Admin" : "User";
}

export function isAdminUser(currentUser) {
  return getUserAccess(currentUser) === "Admin";
}
