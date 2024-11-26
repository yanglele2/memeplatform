# Meme Platform

A modern meme generation platform built with React, Vite, and Firebase, featuring AI-powered meme generation capabilities using OpenAI.

## Features

- AI-powered meme generation
- Custom meme creation with image upload
- Real-time preview
- Save and share memes
- Responsive design with Tailwind CSS

## Tech Stack

- Frontend:
  - React 18
  - React Router DOM
  - Tailwind CSS
  - Vite
- Backend/Services:
  - Firebase
  - OpenAI API
- Utilities:
  - html2canvas for image manipulation

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yanglele2/memeplatform.git
cd memeplatform
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Development

To start the development server:

```bash
npm run dev
```

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
memeplatform/
├── public/           # Static assets
├── src/             # Source code
├── server/          # Server-side code
├── index.html       # Entry HTML file
├── vite.config.js   # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── package.json     # Project dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Yang Lele - [GitHub](https://github.com/yanglele2)
