import { environment } from "src/environments/environment";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export default function getSupabase(): SupabaseClient {
  return createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );
}

