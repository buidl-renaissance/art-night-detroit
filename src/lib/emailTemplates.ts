interface ArtistData {
  name: string;
  artist_alias?: string;
  email: string;
  preferred_canvas_size?: string;
  isTest?: boolean;
}

export function generateArtistAcceptanceEmail(artistData: ArtistData): string {
  const artistName = artistData.artist_alias || artistData.name;
  const canvasSize = artistData.preferred_canvas_size || '18x18';

  return `
Congratulations ${artistName}!

We are excited to inform you that your application to be a featured artist at the Art Night Detroit x Murals in the Market Opening Party has been accepted!

EVENT DETAILS:
- Event: Art Night Detroit x Murals in the Market Opening Party
- Date: September 17, 2025
- Time: 6:00 PM - Late
- Location: 682 E. Fisher Service Dr., Eastern Market, Detroit

YOUR CANVAS:
- Canvas Size: ${canvasSize === 'own-canvas' ? 'You will provide your own canvas' : `${canvasSize} inches`}
- Canvas will be provided at no cost (unless you're bringing your own)
${canvasSize !== 'own-canvas' ? '- If you requested a canvas and would like to start your work before the event, your canvas will be available for pick up Sunday 9/14, 8pm at Studio 202 in the Russell Industrial Center' : ''}
${canvasSize !== 'own-canvas' ? '- Otherwise we will have it available at the start of the event' : ''}

SUPPLIES:
- We encourage you to bring your own easel for comfort and convenience
- Bring your preferred art supplies and materials
- You must supply your own table for displaying your work and additional items

NEXT STEPS:
1. Please confirm your attendance by replying to this email
2. We will send you additional event details and logistics information
3. Arrive at the event location by 5:30 PM for setup
4. Bring your easel and art supplies

SILENT AUCTION & SALES:
- You are expected to have your piece completed by midnight
- Your completed artwork will be available for silent auction
- You set your own starting bid price
- Art Night Detroit will collect a 10% administrative fee from silent auction sales
- You may bring prints and/or other items for sale at your table (no additional fees)

If you have any questions or need to make changes to your participation, please contact us immediately.

We look forward to seeing your creativity in action at the event!

Best regards,
The Art Night Detroit Team

---
${artistData.isTest ? 'This is a test email for the artist acceptance notification system.' : 'This email was sent because you applied to be a featured artist for our event.'}
If you have any questions, please contact us at john@artnightdetroit.com
`;
}

export function generateArtistRejectionEmail(artistData: ArtistData): string {
  const artistName = artistData.artist_alias || artistData.name;

  return `
Dear ${artistName},

Thank you for your interest in participating as a featured artist at the Art Night Detroit x Murals in the Market Opening Party. We sincerely appreciate the time and effort you put into your application.

After careful consideration of all submissions, we have decided not to move forward with your application for this particular event. We received many high-quality submissions and unfortunately have limited space available for featured artists. Please know that this decision was not a reflection of your artistic talent or potential.

We would love for you to still join us as a guest at the event! Here are the details:

EVENT DETAILS:
- Event: Art Night Detroit x Murals in the Market Opening Party
- Date: September 17, 2025
- Time: 6:00 PM - Late
- Location: 682 E. Fisher Service Dr., Eastern Market, Detroit

WHY ATTEND:
- Experience live art creation by featured artists
- Network with other artists and art enthusiasts
- Enjoy the vibrant atmosphere of Eastern Market
- Support the local art community
- Participate in silent auctions and art sales
- Be part of Detroit's growing art scene

We encourage you to come and be inspired by the creativity on display. You never know what opportunities might arise from being part of our community!

We also encourage you to apply for future Art Night Detroit events. We're always looking for talented artists to showcase.

Thank you again for your interest in Art Night Detroit. We hope to see you at the event!

Best regards,
The Art Night Detroit Team

---
${artistData.isTest ? 'This is a test email for the artist rejection notification system.' : 'This email was sent because you applied to be a featured artist for our event.'}
If you have any questions, please contact us at john@artnightdetroit.com
`;
}

export function generateTestArtistAcceptanceEmail(): string {
  // Use the same function with test data
  return generateArtistAcceptanceEmail({
    name: 'Test Artist',
    email: 'test@example.com',
    preferred_canvas_size: '18x18',
    isTest: true
  });
}

export function generateTestArtistRejectionEmail(): string {
  // Use the same function with test data
  return generateArtistRejectionEmail({
    name: 'Test Artist',
    email: 'test@example.com',
    artist_alias: 'TestAlias',
    isTest: true
  });
}

export function generateCanvasPickupEmail(artistData: ArtistData): string {
  const artistName = artistData.artist_alias || artistData.name;
  const canvasSize = artistData.preferred_canvas_size || '18x18';

  return `
Hello ${artistName}!

Reaching out to coordinate on your canvas.

Today we are building the canvases for Wednesday's event starting around 3:00 PM, with the first batch expected to be ready around 6:00 PM. 

${canvasSize !== 'own-canvas' ? 'This evening, pickup is available upon request and tomorrow the studio will be open 8PM-12AM for pickup. Pickup may also be requested on Monday or Tuesday with any remaining canvases brought to the event on Wednesday.' : 'We note that you will be bringing your own canvas.'}

While we encourage artists to complete their work live at the event, we also encourage you to start your work before the event to ensure you have the time to complete a work you are proud of.

Text me at (313) 550-3518 to coordinate your canvas pickup or to join the build process!

Best,
John

EVENT REMINDER:
- Event: Art Night Detroit x Murals in the Market Opening Party
- Date: Tomorrow (September 17, 2025)
- Time: 6:00 PM - Late
- Location: 682 E. Fisher Service Dr., Eastern Market, Detroit

---
${artistData.isTest ? 'This is a test email for the canvas pickup notification system.' : 'This email was sent because you are a confirmed artist for our event.'}
If you have any questions, please contact us at john@artnightdetroit.com
`;
}

export function generateTestCanvasPickupEmail(): string {
  return generateCanvasPickupEmail({
    name: 'Test Artist',
    email: 'test@example.com',
    preferred_canvas_size: '18x18',
    isTest: true
  });
}

export function generateArtistThankYouEmail(artistData: ArtistData): string {
  const artistName = artistData.artist_alias || artistData.name;

  return `${artistName},

Thank you for contributing your work to last Wednesday's Art Night Detroit x Murals in the Market event. We had 25 artists showcase pieces—many created live during the evening—and the energy you brought made the night a success in every sense.

Through the silent auction, we sold eight pieces, with several receiving more than one bid. While many works did not receive bids this time, the event gave us valuable insight into how we can continue to grow opportunities for artists and collectors alike.

We would love your feedback:

What did you think about the silent auction format?

Do you have suggestions for improvements or alternative approaches for future events?

Are there ways we can better support you and your work through these collaborations?

Your input will help us make the next event even stronger.

Artwork Pickup & Meet-Up
Tomorrow (Sunday) starting at 8:00 PM, our studio (Russell Industrial Center, Art Building Unit 202) will be open for artwork pickup. Auction winners are also invited to stop by, which may give you the chance to meet the collectors.

Thank you again for lending your talent, time, and energy to this collaboration. We look forward to building on this momentum together.

With gratitude,
The Art Night Detroit Team

---
${artistData.isTest ? 'This is a test email for the artist thank you notification system.' : 'This email was sent because you participated as a featured artist in our event.'}
If you have any questions, please contact us at john@artnightdetroit.com`;
}

export function generateTestArtistThankYouEmail(): string {
  return generateArtistThankYouEmail({
    name: 'Test Artist',
    email: 'test@example.com',
    artist_alias: 'TestAlias',
    isTest: true
  });
}
