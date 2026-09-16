import { logger } from "@/lib/logger";
import { pingDatabase } from "@/server/repositories/health.repository";

export const dynamic = "force-dynamic";

/**
 * Liveness + readiness probe for the hosting platform and the Docker
 * HEALTHCHECK. Returns 503 when the database is unreachable, and never
 * exposes the underlying error to the caller.
 */
export async function GET(): Promise<Response> {
  try {
    await pingDatabase();
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    logger.error("health-check-failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
