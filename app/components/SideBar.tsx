"use client";

import Link from "next/link";

export default function Sidebar() {
  const menu = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Hello", href: "/dashboard/hello" },
    { label: "HelloFromMain", href: "/hello" },
    { label: "Orders", href: "/orders" },
    { label: "Deliveries", href: "/deliveries" },
    { label: "Invoices", href: "/invoices" },
    { label: "Payments", href: "/payments" },
    { label: "Credit Notes", href: "/credit-notes" },
    { label: "Statement", href: "/statement" },
  ];

  return (
    <nav className="p-2">
      {menu.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block p-3 rounded hover:bg-emerald-500/20 text-white"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
