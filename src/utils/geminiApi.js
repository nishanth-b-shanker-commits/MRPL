// Client-side Gemini API Integration for Question Generation and Semantic Embeddings

// Schema for structured JSON output from Gemini for question generation
const questionSchema = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          questionText: { type: "STRING" },
          questionType: { type: "STRING", enum: ["mcq", "tf", "short"] },
          options: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "List of options for MCQ. Leave empty for TF or short answer."
          },
          correctAnswer: { type: "STRING", description: "Correct answer. For TF, write 'True' or 'False'. For MCQ, write the exact option text. For short answer, write a model answer key." },
          explanation: { type: "STRING" },
          bloomsLevel: { type: "STRING", enum: ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"] }
        },
        required: ["questionText", "questionType", "correctAnswer", "explanation", "bloomsLevel"]
      }
    }
  },
  required: ["questions"]
};

// Local Question Generator fallback
export function generateLocalQuestions(text) {
  const words = text.toLowerCase().split(/\W+/);
  const hasGit = words.includes('git') || words.includes('vcs') || words.includes('commit');
  const hasSecurity = words.includes('security') || words.includes('vpn') || words.includes('password') || words.includes('mfa');
  const hasAgile = words.includes('agile') || words.includes('scrum') || words.includes('sprint') || words.includes('kanban');

  let questions = [];

  if (hasGit) {
    questions = [
      {
        questionText: "What git command is used to integrate changes from one branch into another by rewriting the commits on top of the target branch?",
        questionType: "mcq",
        options: ["git merge", "git rebase", "git checkout", "git push"],
        correctAnswer: "git rebase",
        explanation: "git rebase rewrites the commit history by applying local commits on top of the target branch, providing a cleaner, linear log.",
        bloomsLevel: "Understand"
      },
      {
        questionText: "Using 'git rebase' interactive mode allows squashing multiple commits into a single commit.",
        questionType: "tf",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Interactive rebase (git rebase -i) allows you to edit, squash, rephrase, or drop commits in the commit history.",
        bloomsLevel: "Apply"
      },
      {
        questionText: "What is the primary risk of using 'git push --force' on shared repository branches?",
        questionType: "short",
        options: [],
        correctAnswer: "It can overwrite work committed by other developers, leading to lost history.",
        explanation: "Force pushing rewrites the remote history. If others have pulled and worked on that history, it will desynchronize their trees and potentially discard their work.",
        bloomsLevel: "Analyze"
      }
    ];
  } else if (hasSecurity) {
    questions = [
      {
        questionText: "Which security practice requires verifying credentials using multiple distinct factors?",
        questionType: "mcq",
        options: ["Single Sign-On (SSO)", "Multi-Factor Authentication (MFA)", "Role-Based Access Control (RBAC)", "Transport Layer Security (TLS)"],
        correctAnswer: "Multi-Factor Authentication (MFA)",
        explanation: "MFA requires two or more evidence categories (e.g. something you know, something you have, something you are) to gain entry.",
        bloomsLevel: "Remember"
      },
      {
        questionText: "Sharing your VPN password or corporate network key over secure chat apps like Slack is safe.",
        questionType: "tf",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "Passwords and authentication credentials should never be shared over chats. Use credential vaults and proper secret delegation.",
        bloomsLevel: "Evaluate"
      },
      {
        questionText: "Explain how VPN software secures connections for remote workers.",
        questionType: "short",
        options: [],
        correctAnswer: "By establishing an encrypted tunnel between the user device and the private corporate network.",
        explanation: "A VPN encrypts all data transmission, preventing snooping on public or home networks and routing traffic through the corporate firewall.",
        bloomsLevel: "Understand"
      }
    ];
  } else if (hasAgile) {
    questions = [
      {
        questionText: "In Scrum, which role is responsible for maximizing the product value and maintaining the backlog?",
        questionType: "mcq",
        options: ["Scrum Master", "Product Owner", "Lead Developer", "Project Manager"],
        correctAnswer: "Product Owner",
        explanation: "The Product Owner is the single point of accountability for the Product Backlog and defining the priority of features.",
        bloomsLevel: "Remember"
      },
      {
        questionText: "A Sprint Retrospective is held at the beginning of a Sprint to plan the upcoming backlog items.",
        questionType: "tf",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "The Sprint Retrospective happens at the end of the sprint to review team performance and plan process improvements. Planning is at the beginning.",
        bloomsLevel: "Understand"
      },
      {
        questionText: "What is the main objective of the Daily Standup meeting?",
        questionType: "short",
        options: [],
        correctAnswer: "To synchronize activities, track progress toward the Sprint Goal, and identify blockers.",
        explanation: "The Daily Standup is a 15-minute daily sync for developers to align on the current sprint status and highlight impediments.",
        bloomsLevel: "Apply"
      }
    ];
  } else {
    // Generic fallback questions based on keywords
    questions = [
      {
        questionText: `Based on the text: "${text.substring(0, 60)}...", which statement best summarizes the main idea?`,
        questionType: "mcq",
        options: ["It discusses technical operations.", "It describes organizational structure.", "It is a standard instructional text.", "None of the above."],
        correctAnswer: "It is a standard instructional text.",
        explanation: "The text provides general training content suitable for instructional purposes.",
        bloomsLevel: "Understand"
      },
      {
        questionText: "The content provided suggests this training is essential for day-to-day corporate operations.",
        questionType: "tf",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Instructional and compliance documents form the core repository of employee training.",
        bloomsLevel: "Understand"
      },
      {
        questionText: "What is the primary action recommended in the provided text snippet?",
        questionType: "short",
        options: [],
        correctAnswer: "Understand the core concepts of the tutorial and review best practices.",
        explanation: "Reading and absorbing the material is key to applying these principles.",
        bloomsLevel: "Remember"
      }
    ];
  }

  // Assign difficulty based on 30% Easy, 40% Medium, 30% Hard ratio
  return questions.map((q, idx) => {
    let difficulty = "Medium";
    if (idx === 0) difficulty = "Easy";
    if (idx === 2) difficulty = "Hard";
    return { ...q, difficulty, id: `q-local-${Date.now()}-${idx}` };
  });
}

// Call Gemini API for Question Generation
export async function generateGeminiQuestions(apiKey, text) {
  if (!apiKey) {
    return generateLocalQuestions(text);
  }

  const prompt = `You are an expert curriculum developer. Read the following text and generate exactly 3-5 assessment questions based on it.
  Generate:
  - 1-2 Multiple Choice Questions (mcq)
  - 1 True/False Question (tf)
  - 1 Short Answer Question (short)

  Make sure to tag their difficulty (Easy, Medium, Hard) and map each question to a Bloom's Taxonomy level (Remember, Understand, Apply, Analyze, Evaluate, Create).
  Return JSON matching the requested schema.
  
  Content text to analyze:
  "${text}"`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: questionSchema
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(resultText);

    // Assign difficulty based on 30/40/30 ratio dynamically if not assigned
    return parsed.questions.map((q, idx) => {
      const difficulty = idx % 3 === 0 ? "Easy" : (idx % 3 === 1 ? "Medium" : "Hard");
      return {
        ...q,
        difficulty: q.difficulty || difficulty,
        id: `q-gemini-${Date.now()}-${idx}`
      };
    });
  } catch (error) {
    console.error("Gemini API Error, falling back to local question generator:", error);
    return generateLocalQuestions(text);
  }
}

// Compute embeddings using Gemini API
async function getGeminiEmbedding(apiKey, text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: {
        parts: [{ text: text }]
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Embedding API status ${response.status}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Local Semantic Search fallback using tf-idf approximation and synonyms map
export function searchLocal(query, items, synonymsMap) {
  const queryTerms = query.toLowerCase().split(/\W+/).filter(t => t.length > 1);
  if (queryTerms.length === 0) {
    return items.map(item => ({ ...item, score: 0.0 }));
  }

  // Expand query terms using synonyms map
  let expandedQueryTerms = [...queryTerms];
  queryTerms.forEach(term => {
    Object.keys(synonymsMap).forEach(key => {
      if (key === term || synonymsMap[key].includes(term)) {
        expandedQueryTerms.push(key);
        expandedQueryTerms.push(...synonymsMap[key]);
      }
    });
  });
  // Unique terms
  expandedQueryTerms = [...new Set(expandedQueryTerms)];

  const scoredItems = items.map(item => {
    const titleText = item.title.toLowerCase();
    const descText = item.description.toLowerCase();
    const contentText = item.content.toLowerCase();

    let score = 0;

    expandedQueryTerms.forEach(term => {
      // Direct matches get higher weights
      const isOriginalQuery = queryTerms.includes(term);
      const weight = isOriginalQuery ? 1.0 : 0.4;

      if (titleText.includes(term)) score += 3.0 * weight;
      if (descText.includes(term)) score += 1.5 * weight;
      if (contentText.includes(term)) {
        // Count occurrences
        const count = (contentText.split(term).length - 1);
        score += Math.min(count * 0.5, 2.0) * weight;
      }
    });

    // Normalize score to a percentage-like range (0.0 to 1.0)
    const normalizedScore = score > 0 ? Math.min(0.3 + (score / 12.0), 0.95) : 0.05;

    return {
      ...item,
      score: Math.round(normalizedScore * 100) / 100
    };
  });

  return scoredItems.sort((a, b) => b.score - a.score);
}

// AI Semantic Search combining Gemini API with cosine similarity fallback
export async function searchSemantic(apiKey, query, items, synonymsMap) {
  if (!apiKey) {
    return searchLocal(query, items, synonymsMap);
  }

  try {
    // 1. Embed query
    const queryVector = await getGeminiEmbedding(apiKey, query);

    // 2. Embed each item (normally done in background, we do it in-memory here for simplicity)
    const scoredItems = await Promise.all(items.map(async (item) => {
      try {
        const itemText = `${item.title} ${item.description} ${item.content}`;
        const itemVector = await getGeminiEmbedding(apiKey, itemText);
        const similarity = cosineSimilarity(queryVector, itemVector);
        
        // Scale similarity from [-1, 1] to [0.1, 0.99]
        const scaledScore = Math.max(0.1, Math.min(0.99, (similarity + 1) / 2));
        return {
          ...item,
          score: Math.round(scaledScore * 100) / 100
        };
      } catch (err) {
        console.error(`Failed to embed item ${item.id}:`, err);
        // Fallback to local score for this item
        const localResults = searchLocal(query, [item], synonymsMap);
        return localResults[0];
      }
    }));

    return scoredItems.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error("Gemini Embedding API Error, falling back to local matching:", error);
    return searchLocal(query, items, synonymsMap);
  }
}
