import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "MisOr Transit",
  description: "Bus booking and tracking for Tagoloan - Cagayan de Oro route",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-slate-100 font-sans">
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
