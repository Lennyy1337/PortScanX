/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaNetworkWired,
  FaGlobe,
  FaServer,
  FaClock,
  FaInfoCircle,
  FaPortrait,
  FaPlug,
} from "react-icons/fa";
import { BiSolidError } from "react-icons/bi";

async function scanTarget(target: string) {
  const response = await fetch("/api/v1/scan", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ target }),
  });
  if (!response.ok) throw new Error("Network error when scanning target.");
  return response.json();
}

export default function ScanPage() {
  const { query } = useParams();
  const target = decodeURIComponent(query as string);
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data, error, isLoading } = useQuery({
    queryKey: ["scan", target],
    queryFn: () => scanTarget(target),
    retry: false,
    refetchIntervalInBackground: false,
    refetchInterval: 9999999,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center flex-col">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{
            duration: 1,
            ease: "linear",
            rotate: {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full relative"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full"
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl font-bold mt-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
        >
          Scanning Target...
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-gray-400 mt-2"
        >
          This might take a bit
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center flex flex-col items-center bg-gray-900/50 p-8 rounded-2xl border border-gray-800 backdrop-blur-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeatDelay: 1,
            }}
          >
            <BiSolidError className="w-20 h-20 mb-4 text-red-400/80" />
          </motion.div>

          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Scan Failed
          </h1>
          <p className="text-gray-400 mb-6 max-w-md">
            {(error as Error).message}
          </p>

          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-3 rounded-xl text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <FaArrowLeft />
            Go back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const scanData = data?.data;
  const openPorts = Array.isArray(scanData?.host?.ports?.port)
    ? scanData.host.ports.port.filter(
        (port: any) => port?.state?.state === "open"
      )
    : [];

  const totalPages = Math.ceil(openPorts.length / itemsPerPage);
  const currentPorts = openPorts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const osMatches = Array.isArray(scanData?.host?.os?.osmatch)
    ? scanData.host.os.osmatch
    : [];

  const osGuess =
    osMatches.length > 0
      ? osMatches.sort((a: any, b: any) => b.accuracy - a.accuracy)[0]
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="sm:max-w-7xl max-w-full w-full mx-auto p-8">
        <div className="flex justify-between items-start mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Scan Results
            </h1>
            <p className="text-gray-400 mt-2">
              Analyzing: <span className="text-blue-300">{target}</span>
            </p>
          </motion.div>

          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2 rounded-lg text-white font-medium shadow-lg hover:shadow-blue-500/20 transition-all"
          >
            <FaArrowLeft />
            Back
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <InfoCard
            title="Status"
            value={
              scanData?.host?.status?.state.toUpperCase() as string | "Unkown"
            }
            gradient="from-blue-500 to-blue-600"
            icon={<FaInfoCircle className="w-5 h-5" />}
          />
          <InfoCard
            title="IP Address"
            value={scanData?.host?.address?.addr as string | "Unknown"}
            gradient="from-purple-500 to-purple-600"
            icon={<FaGlobe className="w-5 h-5" />}
          />
          <InfoCard
            title="IP Family"
            value={
              scanData?.host?.address?.addrtype?.toUpperCase() as
                | string
                | "Unkown"
            }
            gradient="from-pink-500 to-pink-600"
            icon={<FaNetworkWired className="w-5 h-5" />}
          />
          <InfoCard
            title="Operating System"
            value={osGuess?.name || "N/A"}
            subvalue={osGuess ? `${osGuess.accuracy}% accuracy` : ""}
            gradient="from-indigo-500 to-indigo-600"
            icon={<FaServer className="w-5 h-5" />}
          />
          <InfoCard
            title="Hostname"
            value={scanData?.host?.hostnames?.hostname?.name ? scanData?.host?.hostnames?.hostname?.name : "N/A"}
            gradient="from-teal-500 to-teal-600"
            icon={<FaPortrait className="w-5 h-5" />}
          />
          <InfoCard
            title="Scan Duration"
            value={
              `${scanData?.runstats?.finished?.elapsed}s` as string | "N/A"
            }
            gradient="from-orange-500 to-orange-600"
            icon={<FaClock className="w-5 h-5" />}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:p-6 p-4 mb-8 shadow-2xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Open Ports
            </h2>
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaChevronLeft />
                Previous
              </motion.button>

              <span className="text-gray-300">
                Page {currentPage} of {totalPages}
              </span>

              <motion.button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-2 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <FaChevronRight />
              </motion.button>
            </div>
          </div>

          {currentPorts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPorts.map((port: any, index: number) => (
                <PortCard key={port.portid} port={port} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No open ports found</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 shadow-2xl"
        >
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Raw Scan Data
          </h2>
          <pre className="text-sm text-gray-300 overflow-auto max-h-96">
            {JSON.stringify(scanData, null, 2)}
          </pre>
        </motion.div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  subvalue,
  gradient,
  icon,
}: {
  title: string;
  value: string;
  subvalue?: string;
  gradient: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${gradient} p-5 rounded-xl shadow-lg`}
    >
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <h3 className="text-sm text-gray-200">{title}</h3>
      </div>
      <p className="text-xl font-semibold mb-1">{value || "N/A"}</p>
      {subvalue && <p className="text-xs text-gray-300">{subvalue}</p>}
    </motion.div>
  );
}

// Updated PortCard with icons
function PortCard({ port, index }: { port: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-gray-800 p-4 rounded-lg hover:bg-gray-750 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <FaPlug className="text-blue-400" />
        <span className="text-blue-400 font-mono">Port {port.portid}</span>
        <span className="text-sm text-green-400 ml-auto">Open</span>
      </div>
      <div className="text-sm text-gray-300">
        <p>Protocol: {port.protocol}</p>
        <p>Service: {port.service?.name || "Unknown"}</p>
      </div>
    </motion.div>
  );
}
