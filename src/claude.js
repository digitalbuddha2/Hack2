import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are Claude, an AI assistant responding to emails via ClaudeMail.

You are a powerful AI agent that can help users with a wide variety of tasks through email:
- Answer questions on any topic
- Help with writing, editing, and summarizing
- Assist with coding and technical problems
- Analyze data and provide insights
- Help with research and brainstorming
- Provide explanations and tutorials

Format your responses appropriately for email:
- Use plain text formatting (no markdown unless specifically helpful)
- Be concise but thorough
- Structure long responses with clear sections
- Include code in plain text blocks when relevant

Be helpful, accurate, and friendly. If you're unsure about something, say so.`;

/**
 * Process a message using Claude API
 * @param {string} message - The user's email message
 * @param {string} apiKey - Anthropic API key
 * @param {object} options - Additional options
 * @returns {Promise<string>} - Claude's response
 */
async function chat(message, apiKey, options = {}) {
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    // Extract text from response
    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return text || 'I apologize, but I was unable to generate a response. Please try again.';

  } catch (error) {
    console.error('Claude API error:', error);

    if (error.status === 401) {
      return 'Error: Invalid API key. Please check your API key settings at your ClaudeMail dashboard.';
    }

    if (error.status === 429) {
      return 'Error: Rate limit exceeded. Please wait a moment and try again.';
    }

    if (error.status === 400) {
      return 'Error: Your message could not be processed. Please try rephrasing your request.';
    }

    return 'I apologize, but an error occurred while processing your request. Please try again later.';
  }
}

/**
 * Process a message with conversation history for multi-turn conversations
 * @param {Array} messages - Array of {role, content} messages
 * @param {string} apiKey - Anthropic API key
 * @returns {Promise<string>} - Claude's response
 */
async function chatWithHistory(messages, apiKey) {
  const client = new Anthropic({ apiKey });

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8096,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return text || 'I apologize, but I was unable to generate a response.';

  } catch (error) {
    console.error('Claude API error:', error);
    return 'I apologize, but an error occurred. Please try again later.';
  }
}

export { chat, chatWithHistory };
