"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface BackendHealthCheckProps {
  children: React.ReactNode;
}

export default function BackendHealthCheck({
  children,
}: BackendHealthCheckProps) {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [status, setStatus] = useState("Loading Quiz Granny...");
  const [dots, setDots] = useState("");

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    // Check backend health
    const checkBackendHealth = async () => {
      const startTime = Date.now();
      let attempt = 0;
      const maxAttempts = 30; // 30 attempts with 2 second intervals = 1 minute max

      const checkHealth = async () => {
        attempt++;
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/health`,
            {
              method: "GET",
              signal: AbortSignal.timeout(10000), // 10 second timeout
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.status === "ok") {
              setStatus("Almost ready!");
              clearInterval(dotsInterval);
              // Small delay before showing content
              setTimeout(() => {
                setIsBackendReady(true);
              }, 500);
              return true;
            }
          }
        } catch (error) {
          console.log(
            `Health check attempt ${attempt} failed:`,
            error instanceof Error ? error.message : "Unknown error"
          );
        }

        if (attempt >= maxAttempts) {
          setStatus("Taking longer than expected. Please refresh the page.");
          clearInterval(dotsInterval);
          return false;
        }

        // Update status message based on time elapsed
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        if (elapsed > 30) {
          setStatus("Preparing your dashboard");
        } else if (elapsed > 15) {
          setStatus("Getting things ready");
        }

        // Try again after 2 seconds
        setTimeout(checkHealth, 2000);
      };

      await checkHealth();
    };

    checkBackendHealth();

    return () => clearInterval(dotsInterval);
  }, []);

  if (!isBackendReady) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center space-y-6 p-8">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">
              Quiz Granny
            </h1>
            <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          </div>

          {/* Loading Spinner */}
          <div className="flex justify-center">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
          </div>

          {/* Status Message */}
          <div className="space-y-2">
            <p className="text-lg font-medium text-foreground">
              {status}
              <span className="inline-block w-8 text-left">{dots}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Please wait while we load your dashboard
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="w-64 mx-auto">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
