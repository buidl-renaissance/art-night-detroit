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

IMPORTANT INFORMATION:
- This is a community event celebrating Detroit's vibrant art scene
- You'll be creating your artwork live during the event
- Attendees will be able to watch and interact with artists
- All artwork created will be part of the Murals in the Market celebration

If you have any questions or need to make changes to your participation, please contact us immediately.

We look forward to seeing your creativity in action at the event!

Best regards,
The Art Night Detroit Team

---
${artistData.isTest ? 'This is a test email for the artist acceptance notification system.' : 'This email was sent because you applied to be a featured artist for our event.'}
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
