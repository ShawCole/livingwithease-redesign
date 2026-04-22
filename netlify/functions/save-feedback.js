exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const feedback = JSON.parse(event.body);
    const round = feedback.round || 1;

    // Log the feedback (Netlify function logs are accessible via CLI)
    console.log('FEEDBACK_RECEIVED:', JSON.stringify(feedback));

    // Build summary
    const brandFeedback = feedback.brand_board || {};
    const brandItems = [brandFeedback.colors, brandFeedback.fonts, brandFeedback.motif, brandFeedback.tone].filter(Boolean);
    const changesWithFeedback = (feedback.proposed_changes || []).filter(c => c.comment).length;
    const assumptionsCorrected = (feedback.assumptions || []).filter(a => a.edited).length;
    const totalAssumptions = (feedback.assumptions || []).length;

    // Send notification to Shaw via Telegram
    const telegramToken = '8622076376:AAFyaf3NMxhwAr15MMYKic6vcvcCIw3vU4w';
    const chatId = '6046524812';
    const msg = `Living With Ease — Round ${round} feedback received!\n\nBrand board sections with feedback: ${brandItems.length}/4\nMood board feedback: ${feedback.mood_board ? 'Yes' : 'No'}\nPhotography feedback: ${feedback.photography ? 'Yes' : 'No'}\nChanges with feedback: ${changesWithFeedback}/8\nAssumptions corrected: ${assumptionsCorrected}/${totalAssumptions}\nAdditional notes: ${feedback.additional_notes ? 'Yes' : 'No'}\n\nCheck Netlify function logs for full JSON.`;

    await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: msg })
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Feedback saved', round })
    };
  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process feedback' })
    };
  }
};
