export interface Env {
  UPLOADS_BUCKET: R2Bucket;
}

const uploadCleanupWorker = {
  async scheduled(_controller: ScheduledController, env: Env): Promise<void> {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;
    const listed = await env.UPLOADS_BUCKET.list({
      prefix: "uploads/",
      include: ["httpMetadata", "customMetadata"],
    });

    const deletions = listed.objects
      .filter((object: R2Object) => {
        const createdAt = object.uploaded || object.httpMetadata?.uploaded || 0;
        return createdAt < cutoff;
      })
      .map((object: R2Object) => object.key);

    for (const key of deletions) {
      await env.UPLOADS_BUCKET.delete(key);
    }

    console.log(`Deleted ${deletions.length} uploaded files older than 24 hours.`);
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "POST") {
      try {
        const formData = await request.formData();
        const file = formData.get("file");

        if (!(file instanceof File)) {
          return Response.json({ error: "Expected a file upload." }, { status: 400 });
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

        return Response.json({ key, success: true });
      } catch (error) {
        console.error("Upload failed", error);
        return Response.json({ error: "Upload failed." }, { status: 500 });
      }
    }

    return new Response("Tutri upload cleanup worker is running.", { status: 200 });
  },
};

export default uploadCleanupWorker;
