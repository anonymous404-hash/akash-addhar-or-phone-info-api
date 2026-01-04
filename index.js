export const config = {
  runtime: "edge"
};

const JSON_URL =
  "https://github.com/anonymous404-hash/akash-addhar-info-api/releases/download/v1.0/database2.json";

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const aadharNumber = searchParams.get("aadharNumber");

  if (!aadharNumber) {
    return new Response(JSON.stringify({
      success: false,
      developer: "AKASHHACKER",
      message: "Please provide aadharNumber"
    }), { status: 400 });
  }

  try {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error("Fetch failed");

    const data = await res.json();

    const result = data.find(
      i => String(i.aadharNumber) === String(aadharNumber)
    );

    if (!result) {
      return new Response(JSON.stringify({
        success: false,
        developer: "AKASHHACKER",
        message: "No records found"
      }));
    }

    return new Response(JSON.stringify({
      success: true,
      developer: "AKASHHACKER",
      data: result
    }));

  } catch (e) {
    return new Response(JSON.stringify({
      success: false,
      developer: "AKASHHACKER",
      message: "Database fetch problem"
    }), { status: 500 });
  }
}
