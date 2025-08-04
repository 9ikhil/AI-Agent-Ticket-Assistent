// {import { createAgent, gemini } from "@inngest/agent-kit";

// const analyzeTicket = async (ticket) => {
// const supportAgent = createAgent({
//   model: gemini({
//     model: "gemini-1.5-flash-8b",
//     apiKey: process.env.GEMINI_API_KEY,
//   }),
//   name: "AI ticket analyzer assistant",
//   supportAgent: `You are an expert AI assistant that processes technical support tickets. 

// Your job is to:
// 1. Summarize the issue.
// 2. Estimate its priority.
// 3. Provide helpful notes and resource links for human moderators.
// 4. List relevant technical skills required.

// IMPORTANT:
// - Respond with *only* valid raw JSON.
// - Do NOT include markdown, code fences, comments, or any extra formatting.
// - The format must be a raw JSON object.

// Repeat: Do not wrap your output in markdown or code fences.`,
// });

// const response =
//   await supportAgent.run(`You are a ticket triage agent. Only return a strict JSON object with no extra text, headers, or markdown.
      
// Analyze the following support ticket and provide a JSON object with:

// - summary: A short 1-2 sentence summary of the issue.
// - priority: One of "low", "medium", or "high".
// - helpfulNotes: A detailed technical explanation that a moderator can use to solve this issue. Include useful external links or resources if possible.
// - relatedSkills: An array of relevant skills required to solve the issue (e.g., ["React", "MongoDB"]).

// Respond ONLY in this JSON format and do not include any other text or markdown in the answer:

// {
// "summary": "Short summary of the ticket",
// "priority": "high",
// "helpfulNotes": "Here are useful tips...",
// "relatedSkills": ["React", "Node.js"]
// }

// ---

// Ticket information:

// - Title: ${ticket.title}
// - Description: ${ticket.description}`);

// const raw = response.output[0].context;

// // The AI model is instructed to return a raw JSON object. However, sometimes
// // it might wrap the response in a markdown code block (```json ... ```).
// // This block of code robustly handles both cases and safely parses the JSON.
// try {
//   // Attempt to find and extract JSON from a markdown code block.
//   const match = raw.match(/```json\s*([\s\S]*?)\s*```/i);
//   // If a match is found, use the captured group; otherwise, use the raw response.
//   const jsonString = match ? match[1] : raw.trim();
//   return JSON.parse(jsonString);
// } catch (e) {
//   console.error("Failed to parse JSON from AI response:", e.message);
//   console.error("Raw AI response that failed parsing:", raw);
//   // Return null to indicate failure. The calling function must handle this case.
//   return null;
// }
// };

// export default analyzeTicket;
// }

import { createAgent, gemini } from "@inngest/agent-kit";

const analyzeTicket = async (ticket) => {
  try {
    const supportAgent = createAgent({
      model: gemini({
        model: "gemini-1.5-flash-8b",
        apiKey: process.env.GEMINI_API_KEY,
      }),
      name: "AI Support Ticket Analyzer",
      description: `You are an expert technical support AI that analyzes customer support tickets.

Your job is to:
1. Understand the technical issue described
2. Determine the urgency/priority level
3. Identify what skills/expertise are needed to solve it
4. Provide detailed technical guidance for human moderators
5. Suggest potential solutions and troubleshooting steps

IMPORTANT: You must respond with ONLY valid JSON. No markdown, no code blocks, no extra text.`,
    });

    const analysisPrompt = `Analyze this support ticket and return a JSON object with detailed analysis:

TICKET DETAILS:
Title: ${ticket.title}
Description: ${ticket.description}
Created by: User ID ${ticket.createdBy}

Please return ONLY a JSON object with this exact structure:
{
  "summary": "Brief 1-2 sentence summary of the core issue",
  "priority": "low|medium|high",
  "category": "technical|billing|account|feature-request|bug|other",
  "complexity": "simple|moderate|complex",
  "estimatedResolutionTime": "minutes|hours|days",
  "helpfulNotes": "Detailed technical explanation with step-by-step troubleshooting guide, potential causes, and suggested solutions. Include relevant documentation links if applicable.",
  "relatedSkills": ["skill1", "skill2", "skill3"],
  "suggestedActions": [
    "First action to take",
    "Second action to take", 
    "Third action to take"
  ],
  "potentialCauses": [
    "Most likely cause",
    "Alternative cause",
    "Less likely cause"
  ],
  "riskLevel": "low|medium|high",
  "requiresEscalation": true|false
}

Focus on providing actionable technical guidance that will help a human moderator resolve this issue efficiently.`;

    console.log("Sending request to AI...");
    const response = await supportAgent.run(analysisPrompt);
    
    const rawResponse = response.output[0]?.content || response.output[0]?.context;
    console.log("Raw AI response:", rawResponse);

    // Clean and parse the JSON response
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/i) || 
                       rawResponse.match(/```\s*([\s\S]*?)\s*```/i);
      
      const jsonString = jsonMatch ? jsonMatch[1] : rawResponse.trim();
      const analysis = JSON.parse(jsonString);
      
      // Validate required fields
      if (!analysis.summary || !analysis.priority || !analysis.helpfulNotes) {
        throw new Error("Missing required fields in AI response");
      }

      // Ensure relatedSkills is an array
      if (!Array.isArray(analysis.relatedSkills)) {
        analysis.relatedSkills = [];
      }

      console.log("Successfully parsed AI analysis:", {
        priority: analysis.priority,
        category: analysis.category,
        skillsCount: analysis.relatedSkills.length
      });

      return analysis;

    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", parseError.message);
      console.error("Raw response that failed:", rawResponse);
      
      // Return fallback analysis
      return {
        summary: `Issue: ${ticket.title}`,
        priority: "medium",
        category: "technical",
        complexity: "moderate",
        estimatedResolutionTime: "hours",
        helpfulNotes: `Manual review required for: ${ticket.description}. AI analysis failed to parse properly.`,
        relatedSkills: ["General Support"],
        suggestedActions: ["Review ticket details", "Contact user for clarification", "Escalate if needed"],
        potentialCauses: ["Requires manual analysis"],
        riskLevel: "medium",
        requiresEscalation: false
      };
    }

  } catch (error) {
    console.error("AI analysis failed:", error.message);
    
    // Return basic fallback analysis
    return {
      summary: `Support ticket: ${ticket.title}`,
      priority: "medium",
      category: "technical", 
      complexity: "moderate",
      estimatedResolutionTime: "hours",
      helpfulNotes: `AI analysis unavailable. Manual review required for: ${ticket.description}`,
      relatedSkills: ["General Support"],
      suggestedActions: ["Manual review required"],
      potentialCauses: ["AI analysis failed"],
      riskLevel: "low",
      requiresEscalation: false
    };
  }
};

export default analyzeTicket;