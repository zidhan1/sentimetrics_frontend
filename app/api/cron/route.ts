import { NextResponse } from "next/server";
import { useBrand } from "@/app/providers/BrandProvider";
import axios from "axios";

const brandContext = useBrand();
const { activeBrand, getAuthHeaders } = brandContext || {
  activeBrand: null,
  getAuthHeaders: () => ({}),
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export async function GET() {
  try {
    const shopeeCrisbar = await axios.post(
      `${API_BASE}/scrape/shopee`,
      {
        brandId: activeBrand?.id,
      },
      {
        headers: getAuthHeaders(),
      }
    );

    if (shopeeCrisbar.status !== 200)
      throw new Error("Failed to run cron tasks");

    const data = shopeeCrisbar.data;

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
