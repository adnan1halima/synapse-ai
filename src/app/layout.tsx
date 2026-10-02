import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SYNAPSE AI - Digital Twin Platform",
  description: "Enterprise Digital Twin & Healthcare Simulation Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}