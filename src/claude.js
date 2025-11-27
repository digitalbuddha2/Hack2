const Anthropic = require('@anthropic-ai/sdk');

async function chat(message, apiKey) {
  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are Claude, an AI assistant responding to emails.
Be helpful, concise, and friendly in your responses.
Format your responses appropriately for email - use plain text, not markdown.
Keep responses focused and avoid unnecessary verbosity.
If you're asked to do something you can't do via email (like access files, browse the web, etc.), politely explain the limitation.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
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

module.exports = {
  chat
};
