import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(process.env.OPENAI_ORG_ID && { organization: process.env.OPENAI_ORG_ID }),
  ...(process.env.OPENAI_PROJECT_ID && { project: process.env.OPENAI_PROJECT_ID }),
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, screenshots, pageNumbers } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Prepare messages with screenshots
    const messages: any[] = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt,
          },
          ...screenshots.map((screenshot: string, index: number) => ({
            type: "image_url",
            image_url: {
              url: screenshot,
            },
          })),
        ],
      },
    ];

    // Use GPT-4 Vision for image understanding
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const explanation = response.choices[0]?.message?.content || "No explanation generated.";

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Error calling OpenAI:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate explanation" },
      { status: 500 }
    );
  }
}
