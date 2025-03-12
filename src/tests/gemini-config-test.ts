import dotenv from 'dotenv';
dotenv.config();

async function testGeminiConfig() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  const apiUrl = process.env.VITE_GEMINI_API_URL;

  console.log('Testing Gemini API Configuration:');
  console.log('API URL:', apiUrl);
  console.log('API Key exists:', !!apiKey);

  try {
    const response = await fetch(apiUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello! Please respond with 'OK' if you can hear me."
          }]
        }]
      })
    });

    console.log('\nResponse status:', response.status);
    const text = await response.text();
    console.log('Response body:', text);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(text);
        console.log('\nDetailed error:', JSON.stringify(errorData, null, 2));
      } catch {
        console.log('Could not parse error response as JSON');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testGeminiConfig().catch(console.error); 