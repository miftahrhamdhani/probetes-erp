import { NextResponse } from "next/server";

/** Error backend dengan status HTTP yang jelas untuk dipetakan di route. */
export class AppError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "AppError";
  }
}

/** Ubah error apa pun menjadi NextResponse JSON yang aman untuk user kantor. */
export function toErrorResponse(error: unknown, fallback = "Terjadi kesalahan.") {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : fallback;
  return NextResponse.json({ error: message }, { status: 500 });
}
