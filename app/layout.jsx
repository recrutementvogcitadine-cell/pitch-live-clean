// layout.jsx
// Layout racine requis par Next.js 13+

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0, background: '#000' }}>{children}</body>
    </html>
  );
}
