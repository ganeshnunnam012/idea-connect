import "./globals.css";
import { Toaster } from 'react-hot-toast';
import Providers from "./providers";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster postition="top-right" />
        </Providers>
      </body>
    </html>
  );
}