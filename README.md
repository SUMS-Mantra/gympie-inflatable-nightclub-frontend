# Frontend - Gympie Inflatable Nightclub

## Pages

### Home.html
Landing page with hero section, package pricing, and call-to-action buttons.

### bookings.html
Interactive calendar for date selection and multi-step booking form.

### about.html
Company information, story, and values.

### contact.html
Contact information and email link.

## JavaScript Files

### calendar-bookings-new.js
Main booking logic:
- Calendar rendering
- Date availability checking
- Multi-step form handling
- API communication

### config.js
Environment-aware API configuration (auto-detects localhost vs production).

## CSS Files

### style.css
Legacy styles (consider migrating to Tailwind or removing).

### survey-modal.css
Additional modal styling.

## Assets

- `Logo.png` - Business logo
- `Nightclub_Main.jpg` - Hero background image

## Usage

Open `Home.html` in a browser or serve with:
```bash
npx http-server -p 3000
```

For production, deploy to Netlify/Vercel - see `PRODUCTION_DEPLOYMENT.md`.
