import { authenticateRequest, createServiceClient } from "../_shared/auth.ts";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const user = await authenticateRequest(req);
    const adminClient = createServiceClient();
    const userId = user.id;

    // Delete price history for user's items
    const { data: userItems } = await adminClient
      .from("items")
      .select("id")
      .eq("user_id", userId);

    if (userItems && userItems.length > 0) {
      const itemIds = userItems.map((i: { id: string }) => i.id);
      await adminClient.from("price_history").delete().in("item_id", itemIds);
    }

    // Delete user data (cascade from profile handles most)
    await adminClient.from("items").delete().eq("user_id", userId);
    await adminClient.from("collections").delete().eq("user_id", userId);
    await adminClient.from("locations").delete().eq("user_id", userId);
    await adminClient.from("scan_usage").delete().eq("user_id", userId);
    await adminClient.from("profiles").delete().eq("id", userId);

    // Delete auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return new Response(JSON.stringify({ error: "Failed to delete account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Account deleted successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = (error as { status?: number }).status ?? 500;
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
