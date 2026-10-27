import { corsHeaders } from "./cors.ts";
import { AppError } from "./errors.ts";

export function jsonResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return new Response(
      JSON.stringify({ error: { code: error.code, message: error.message } }),
      {
        status: error.statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  const message = error instanceof Error ? error.message : "Internal server error";

  return new Response(JSON.stringify({ error: { code: "INTERNAL_ERROR", message } }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
