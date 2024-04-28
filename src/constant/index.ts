export function getBackEndUrl() {
  return "http://127.0.0.1:8000";
}
export function getPrefix() {
  return import.meta.env.VITE_PREFIX || "/";
}
export const ROLE_CODE = {
  TEACHER: "teacher",
  ADMIN: "admin",
  STUDENT: "student",
  ASSISTANT: "assistant"
};

export * from "./_type";
