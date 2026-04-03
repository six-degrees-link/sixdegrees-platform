export type Ok<T> = { ok: true; data: T };
export type Err<E = Error> = { ok: false; error: E };
export type Result<T, E = Error> = Ok<T> | Err<E>;

export function ok<T>(data: T): Ok<T> {
  return { ok: true, data };
}

export function err<E = Error>(error: E): Err<E> {
  return { ok: false, error };
}

// Wraps a Supabase query result into a Result<T>.
// Usage:
//   const result = fromSupabase(await supabase.from('users').select('*'))
//   if (!result.ok) { ... result.error ... }
export function fromSupabase<T>(response: {
  data: T | null;
  error: { message: string } | null;
}): Result<T> {
  if (response.error) return err(new Error(response.error.message));
  if (response.data === null) return err(new Error('No data returned'));
  return ok(response.data);
}

// Wraps a Supabase query result that may legitimately return null (e.g. .maybeSingle()).
export function fromSupabaseMaybe<T>(response: {
  data: T | null;
  error: { message: string } | null;
}): Result<T | null> {
  if (response.error) return err(new Error(response.error.message));
  return ok(response.data);
}
