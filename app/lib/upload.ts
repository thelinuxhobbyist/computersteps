import { isFileSafeForUpload } from "../lesson-utils";

export const UPLOAD_ENDPOINT = "https://tutri-upload-cleanup.yama-builds.workers.dev";

export async function uploadFileToWorker(file: File): Promise<boolean> {
  if (!isFileSafeForUpload(file)) return false;

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  return response.ok;
}
