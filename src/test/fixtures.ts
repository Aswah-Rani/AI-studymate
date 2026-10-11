import type { StudyPack } from "@/lib/types";

export const validPack: StudyPack = {
  title: "Photosynthesis",
  tldr: "Plants convert light energy into glucose using chlorophyll in chloroplasts.",
  keyPoints: [
    "Occurs in chloroplasts",
    "Light reactions make ATP and NADPH",
    "Calvin cycle fixes carbon dioxide",
  ],
  quiz: [
    {
      question: "Where does the Calvin cycle occur?",
      options: ["Stroma", "Thylakoid", "Nucleus", "Cytoplasm"],
      answerIndex: 0,
      explanation: "The notes say the Calvin cycle occurs in the stroma.",
    },
    {
      question: "Which pigment captures light?",
      options: ["Melanin", "Chlorophyll", "Keratin", "Hemoglobin"],
      answerIndex: 1,
      explanation: "Chlorophyll is the green pigment in chloroplasts.",
    },
    {
      question: "What do the light reactions release?",
      options: ["Nitrogen", "Methane", "Oxygen", "Helium"],
      answerIndex: 2,
      explanation: "Splitting water releases oxygen.",
    },
  ],
  flashcards: [
    { front: "Where does photosynthesis occur?", back: "Chloroplasts" },
    { front: "What does the Calvin cycle produce?", back: "Glucose" },
    { front: "Name one limiting factor", back: "Light intensity" },
  ],
};

/** Shape of a successful Anthropic Messages API response using forced tool use. */
export function anthropicToolResponse(input: unknown) {
  return {
    id: "msg_test",
    type: "message",
    role: "assistant",
    content: [{ type: "tool_use", id: "toolu_1", name: "create_study_pack", input }],
    stop_reason: "tool_use",
  };
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export const longNotes =
  "Photosynthesis is the process plants use to turn light energy into chemical energy stored as glucose. " +
  "It takes place in the chloroplasts, which contain the green pigment chlorophyll. " +
  "The light-dependent reactions occur in the thylakoid membranes and produce ATP and NADPH. " +
  "The Calvin cycle occurs in the stroma and uses ATP and NADPH to fix carbon dioxide into glucose.";
