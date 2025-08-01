This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.

## QR Code Ticket System

This application includes a QR code-based ticket claiming system for raffles. Here's how it works:

### For Admins:

1. **Generate QR Codes**: Navigate to `/admin/raffles/[raffle-id]/qr-generator`
2. **Set Ticket Count**: Specify how many tickets should be available for the QR code session
3. **Display QR Code**: The system generates a unique QR code that links to the claiming page
4. **Monitor Participants**: View all participants and their claimed tickets at `/admin/raffles/[raffle-id]/participants`

### For Users:

1. **Scan QR Code**: Users scan the QR code with their phone camera
2. **Enter Information**: Fill out the contact form with name, phone, email, and optional Instagram handle
3. **Claim Tickets**: Submit the form to claim their tickets
4. **Confirmation**: Receive confirmation of successful ticket claiming

### Database Schema:

- **participants**: Stores user contact information
- **ticket_claims**: Links participants to specific tickets
- **qr_code_sessions**: Manages active QR code sessions for ticket distribution

### Features:

- ✅ Admin-only QR code generation
- ✅ Unique session codes for each QR code
- ✅ Contact information collection
- ✅ Automatic ticket assignment
- ✅ Session deactivation after use
- ✅ Participant tracking and analytics
- ✅ Mobile-friendly claiming interface
