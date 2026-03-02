import "./globals.css";
import Providers from "./providers";
import Footer from "@/components/Layout/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
          <Providers>
            <div className="flex-1">
              {children}
            </div>
            <Footer />
          </Providers>
      </body>
    </html>
  );
}