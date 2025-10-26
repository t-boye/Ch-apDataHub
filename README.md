# ⚡ CheapData - Ghana's #1 Data Hub

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-7.1.7-646cff.svg)

> A modern, fast, and secure platform for purchasing affordable mobile data bundles in Ghana. Supporting MTN, Telecel, and AirtelTigo networks.

## 🌟 Features

### For Users
- 📱 **Multi-Network Support** - Buy data for MTN, Telecel, and AirtelTigo
- ⚡ **Instant Delivery** - Data delivered within minutes
- 🔒 **Secure Payments** - Paystack integration with card and mobile money support
- 💰 **Crypto Payments** - Bitcoin and USDT (TRC20) support
- 💳 **Digital Wallet** - Top-up and manage your balance
- 🎁 **Referral System** - Earn bonuses by referring friends
- 📊 **Purchase History** - Track all your transactions
- 🎨 **Dark Mode** - Eye-friendly interface with theme switching
- 📞 **24/7 Support** - WhatsApp integration and support tickets
- 🔔 **Push Notifications** - Real-time updates on purchases

### For Admins
- 📈 **Analytics Dashboard** - Real-time revenue and user statistics
- 📦 **Package Management** - Create, edit, and delete data packages
- 👥 **User Management** - View and manage all users
- 💳 **Transaction Monitoring** - Track all payments and purchases
- ✅ **Request Processing** - Approve custom data requests
- 🎯 **Bulk Operations** - Delete multiple packages at once

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cheapdata.git
   cd cheapdata
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env and add your configuration
   # Required: VITE_PAYSTACK_PUBLIC_KEY
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   Navigate to http://localhost:5173
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory. See `.env.example` for all available options.

**Essential Variables:**
```env
# API Configuration
VITE_API_URL=http://localhost:8000/api

# Payment Integration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Push Notifications
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key

# WhatsApp Integration
VITE_WHATSAPP_NUMBER=233XXXXXXXXX
```

### Paystack Setup

1. Create an account at [Paystack](https://paystack.com/)
2. Navigate to Settings → API Keys & Webhooks
3. Copy your **Public Key** (use test key for development)
4. Add it to your `.env` file as `VITE_PAYSTACK_PUBLIC_KEY`

### Push Notifications Setup

Generate VAPID keys for web push notifications:
```bash
npx web-push generate-vapid-keys
```

Add the public key to your `.env` file as `VITE_VAPID_PUBLIC_KEY`

## 📁 Project Structure

```
Ch-apDataHub/
├── frontend/                    # React frontend application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── WhatsAppButton.jsx
│   │   │   └── ...
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ...
│   │   ├── services/            # API and service functions
│   │   │   ├── api.js
│   │   │   └── pushNotifications.js
│   │   ├── App.jsx              # Main app component
│   │   ├── main.jsx             # Entry point
│   │   └── index.css            # Global styles
│   ├── .env.example             # Environment variables template
│   ├── package.json
│   ├── vite.config.js           # Vite configuration
│   └── tailwind.config.js       # Tailwind CSS configuration
└── README.md                    # Project documentation
```

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **Vite 7.1.7** - Build tool and dev server
- **React Router Dom 7.9.3** - Client-side routing
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Framer Motion 12.23.22** - Animation library
- **Material-UI 7.3.2** - Component library
- **Axios 1.12.2** - HTTP client
- **React Toastify 11.0.5** - Toast notifications

### Payment & Integration
- **Paystack** - Payment processing
- **Web Push API** - Push notifications
- **WhatsApp Business API** - Customer support

## 📱 Supported Networks

- 🟡 **MTN Ghana** - Fast & Reliable
- 🔴 **Telecel** - Best Coverage
- 🔵 **AirtelTigo** - Affordable Plans

## 🎨 UI Features

- Modern, clean design with gradient accents
- Fully responsive (mobile, tablet, desktop)
- Dark mode support
- Smooth animations and transitions
- Loading states and skeletons
- Toast notifications for user feedback
- Interactive components with hover effects

## 📦 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🚀 Deployment

### Build for Production

```bash
cd frontend
npm run build
```

The build output will be in the `dist` folder, ready to deploy to:
- **Netlify** (Recommended)
- **Vercel**
- **GitHub Pages**
- **AWS S3**
- Any static hosting service

### Netlify Deployment

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

## 🔐 Security

- Secure authentication with JWT tokens
- HTTPS-only in production
- Environment variables for sensitive data
- CORS protection
- Input validation and sanitization
- Protected routes for authenticated users
- Admin-only routes for administrative functions

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ESLint for code quality
- Follow React best practices
- Write clean, readable code
- Add comments for complex logic
- Test your changes thoroughly

## 🐛 Bug Reports

If you find a bug, please create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Thanks to all contributors
- Paystack for payment integration
- All open-source libraries used in this project

## 📞 Support

- **Email:** support@cheapdata.com
- **WhatsApp:** +233 XX XXX XXXX
- **Website:** https://cheapdata.netlify.app
- **Documentation:** [Wiki](https://github.com/yourusername/cheapdata/wiki)

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Multiple payment gateways
- [ ] Automated data delivery
- [ ] Advanced analytics
- [ ] API for third-party integration
- [ ] Multi-language support
- [ ] Customer loyalty program

---

<div align="center">
  <p>Made with ❤️ in Ghana 🇬🇭</p>
  <p>⚡ CheapData - Ghana's #1 Data Hub</p>
</div>
