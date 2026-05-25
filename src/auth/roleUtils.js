// hne helpers sghar ywa7dou access mta3 l user bech ba9i l app yesta3mel nafs l format.
// hne function getUserAccess: ta9ra valeur mocht9a men data l 7aliya.
export function getUserAccess(currentUser) {
  return currentUser?.access === "Admin" ? "Admin" : "User";
}

// hne function isAdminUser: true wala false hasb condition mo3ayna fil logic.
export function isAdminUser(currentUser) {
  return getUserAccess(currentUser) === "Admin";
}
