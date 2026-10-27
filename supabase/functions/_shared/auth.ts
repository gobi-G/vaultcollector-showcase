import { createClient } from "npm:@supabase/supabase-js@2";
import { env } from "../../config/env.ts";
import { AuthError } from "./errors.ts";

export type AuthenticatedUser = {
  id: string;
  email: string;
};

export function createServiceClient() {
  return createClient(env.supabaseUrl, env.supabaseServiceKey, {
    auth: { persistSession: false },
  });
}

export async function authenticateRequest(req: Request): Promise<AuthenticatedUser> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid Authorization header");
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createServiceClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new AuthError("Invalid or expired token");
  }

  return { id: user.id, email: user.email ?? "" };
}
