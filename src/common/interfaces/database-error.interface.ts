export interface DatabaseError extends Error {
  code?: string;

  detail?: string;

  table?: string;

  constraint?: string;

  column?: string;

  dataType?: string;
}
