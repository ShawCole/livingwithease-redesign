exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const feedback = JSON.parse(event.body);

    // Log the feedback (Netlify function logs are accessible via CLI)
    console.log('FEEDBACK_RECEIVED:', JSON.stringify(feedback));

    // Send notification to Shaw via Telegram
    const telegramToken = '8622076376:AAFyaf3NMxhwAr15MMYKic6vcvcCIw3vU4w';
    const chatId = '6046524812';
    const msg = `Living With Ease feedback received!\n\nBrand comments: ${feedback.brand_comment || '(none)'}\nAdditional notes: ${feedback.additional_notes || '(none)'}\nChanges with feedback: ${feedback.proposed_changes.filter(c => c.comment).length}/8\nAssumptions corrected: ${feedback.assumptions.filter(a => a.edited).length}/10`;

    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg })
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Feedback saved' })
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process feedback' })
    };
  }
};
