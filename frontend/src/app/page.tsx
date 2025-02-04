/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const input = query.trim();
    if (!input) return;

    try {
      if (/^https?:\/\//i.test(input)) {
        const url = new URL(input);
        router.push(`/scan/${encodeURIComponent(url.hostname)}`);
        return;
      }

      if (isValidTarget(input)) {
        router.push(`/scan/${encodeURIComponent(input)}`);
      } else {
        toast.error("Please enter a valid IP address or hostname");
      }
    } catch (error: any) {
      toast(error.toString())
    }
  };

  function isValidTarget(input: string): boolean {
    return isValidIP(input) || isValidHostname(input);
  }

  function isValidIP(input: string): boolean {
    const ipv4Pattern =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

    return ipv4Pattern.test(input) || ipv6Pattern.test(input);
  }

  function isValidHostname(input: string): boolean {
    const hostnamePattern = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
    return hostnamePattern.test(input);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.7 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-6xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              PortScan
            </span>
            <span className="bg-gradient-to-r from-green-400 to-green-700 bg-clip-text text-transparent">
              -X
            </span>
          </h1>
        </motion.div>

        <motion.form
          onSubmit={handleSearch}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-full max-w-2xl"
        >
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter IP address or hostname..."
              className="w-full px-6 py-4 text-lg bg-gray-900 rounded-xl border-2 border-gray-800 outline-none focus:border-green-500 hover:border-green-800 text-white placeholder-gray-500 transition-all shadow-xl"
            />
            <motion.button
              type="submit"
              className="absolute hover:size-105 right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-2 rounded-lg text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-shadow"
            >
              Scan
            </motion.button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 text-gray-500 text-sm"
        >
          Try: 192.168.1.1, example.com, or 8.8.8.8
        </motion.div>

        <motion.footer
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute bottom-8 text-gray-500 text-sm"
        >
          <Link
            href={"https://lennyy1337.dev"}
            className="text-blue-500 underline decoration-blue-600 underline-offset-2"
          >
            Made by lennyy1337
          </Link>
        </motion.footer>
      </div>
    </div>
  );
}
