import { query } from '@anthropic-ai/claude-agent-sdk';

const SYSTEM_PROMPT = `You are Claude, an AI assistant responding to emails via ClaudeMail.

You are a powerful AI agent that can help users with a wide variety of tasks through email:
- Answer questions on any topic
- Help with writing, editing, and summarizing
- Assist with coding and technical problems
- Analyze data and provide insights
- Help with research and brainstorming
- Provide explanations and tutorials
- Search the web for current information
- Fetch and analyze web pages

Format your responses appropriately for email:
- Use plain text formatting (no markdown unless specifically helpful)
- Be concise but thorough
- Structure long responses with clear sections
- Include code in plain text blocks when relevant

You have full access to web tools. Use them freely without asking for permission.
Be helpful, accurate, and friendly. If you're unsure about something, say so.`;

/**
 * Process a message using Claude Agent SDK
 * @param {string} message - The user's email message
 * @param {string} subject - The email subject
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<string>} - The agent's response
 */
async function chat(message, subject, apiKey) {
  process.env.ANTHROPIC_API_KEY = apiKey;

  // Include subject in the prompt
  const fullPrompt = subject
    ? `Subject: ${subject}\n\nMessage:\n${message}`
    : message;

  try {
    let response = '';

    for await (const event of query({
      prompt: fullPrompt,
      options: {
        model: 'claude-sonnet-4-5-20250929',
        systemPrompt: SYSTEM_PROMPT,
        maxTurns: 20,
        allowedTools: ['WebFetch', 'WebSearch'],
        dangerouslySkipPermissions: true,
      }
    })) {
      if (event.type === 'result') {
        response = event.result;
      } else if (event.type === 'text') {
        response += event.content;
      }
    }

    return response || 'I apologize, but I was unable to generate a response. Please try again.';

  } catch (error) {
    console.error('Claude Agent SDK error:', error);

    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      return 'Error: Invalid API key. Please check your API key settings at your ClaudeMail dashboard.';
    }
    if (error.message?.includes('429') || error.message?.includes('rate')) {
      return 'Error: Rate limit exceeded. Please wait a moment and try again.';
    }
    if (error.message?.includes('400') || error.message?.includes('invalid')) {
      return 'Error: Your message could not be processed. Please try rephrasing your request.';
    }

    return 'I apologize, but an error occurred while processing your request. Please try again later.';
  }
}

/**
 * Process a message with full conversation history
 * @param {Array} messages - Array of {role, content, subject} messages
 * @param {string} currentSubject - Current email subject
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<string>} - The agent's response
 */
async function chatWithHistory(messages, currentSubject, apiKey) {
  process.env.ANTHROPIC_API_KEY = apiKey;

  try {
    // Build full conversation context
    const conversationContext = messages
      .map((m, i) => {
        const role = m.role === 'user' ? 'User' : 'Assistant';
        const subjectLine = m.subject ? `[Subject: ${m.subject}]\n` : '';
        return `--- Message ${i + 1} ---\n${role}:\n${subjectLine}${m.content}`;
      })
      .join('\n\n');

    const prompt = `This is an ongoing email conversation. Here is the full history:\n\n${conversationContext}\n\n---\nPlease respond to the user's latest message, taking into account the full conversation context above.`;

    let response = '';

    for await (const event of query({
      prompt,
      options: {
        model: 'claude-sonnet-4-5-20250929',
        systemPrompt: SYSTEM_PROMPT,
        maxTurns: 20,
        allowedTools: ['WebFetch', 'WebSearch'],
        dangerouslySkipPermissions: true,
      }
    })) {
      if (event.type === 'result') {
        response = event.result;
      }
    }

    return response || 'I apologize, but I was unable to generate a response.';

  } catch (error) {
    console.error('Claude Agent SDK error:', error);
    return 'I apologize, but an error occurred. Please try again later.';
  }
}

export { chat, chatWithHistory };
