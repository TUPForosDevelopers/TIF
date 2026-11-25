export const userFromApi = (user) => ({
  id: user.userId,
  name: user.name,
  age: user.age,
  email: user.email,
  role: user.userRole?.toUpperCase(),
  createdAt: user.dateCreated,
});

export const newUserToApi = (user) => ({
  name: user.name.trim(),
  dateOfBirth: user.dateOfBirth,
  email: user.email.trim(),
  plainPassword: user.password,
});

export const userChangesToApi = (changes) => ({
  name: changes.name?.trim() || null,
  email: changes.email?.trim() || null,
  plainPassword: changes.password || null,
});
