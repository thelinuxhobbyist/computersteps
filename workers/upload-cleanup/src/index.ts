export interface Env {
  UPLOADS_BUCKET: R2Bucket;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: corsHeaders,
  });
}

function getUploadedAt(object: R2Object): number {
  const fromMeta = object.customMetadata?.uploadedAt;
  if (fromMeta) {
    const parsed = Number(fromMeta);
    if (!Number.isNaN(parsed)) return parsed;
  }

  if (object.uploaded instanceof Date) {
    return object.uploaded.getTime();
  }

  return 0;
}

const uploadCleanupWorker = {
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    let cursor: string | undefined;
    let deletedCount = 0;

    do {
      const listed = await env.UPLOADS_BUCKET.list({
        prefix: "uploads/",
        cursor,
        include: ["customMetadata"],
      });

      for (const object of listed.objects) {
        const uploadedAt = getUploadedAt(object);
        if (uploadedAt > 0 && uploadedAt < cutoff) {
          await env.UPLOADS_BUCKET.delete(object.key);
          deletedCount += 1;
        }
      }

      cursor = listed.truncated ? listed.cursor : undefined;
    } while (cursor);

    console.log(`Deleted ${deletedCount} uploaded files older than 24 hours.`);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
          return jsonResponse({ error: "Expected a file upload." }, 400);
        }

        const key = `uploads/${crypto.randomUUID()}-${file.name}`;
        await env.UPLOADS_BUCKET.put(key, await file.arrayBuffer(), {
          httpMetadata: {
            contentType: file.type || "application/octet-stream",
          },
          customMetadata: {
            originalName: file.name,
            uploadedAt: Date.now().toString(),
          },
        });

        return jsonResponse({ key, success: true });
      } catch (error) {
        console.error("Upload failed", error);
        return jsonResponse({ error: "Upload failed." }, 500);
      }
    }

    return new Response("Computer Steps upload worker is running.", {
      status: 200,
      headers: corsHeaders,
    });
  },
};

export default uploadCleanupWorker;
