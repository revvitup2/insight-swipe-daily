import { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { ServerCrash, Wrench, Clock, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface MaintenanceScreenProps {
  onRetry?: () => void;
}

export const MaintenanceScreen = ({ onRetry }: MaintenanceScreenProps) => {
  const { isDarkMode } = useTheme();
  const [dots, setDots] = useState("");

  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center p-4",
        isDarkMode
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
          : "bg-gradient-to-br from-blue-50 via-white to-purple-50"
      )}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div
          className={cn(
            "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl",
            isDarkMode ? "bg-blue-500/30" : "bg-blue-300"
          )}
          style={{
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className={cn(
            "absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl",
            isDarkMode ? "bg-purple-500/30" : "bg-purple-300"
          )}
          style={{
            animation: "float 8s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative max-w-md w-full">
        <div
          className={cn(
            "rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm border",
            isDarkMode
              ? "bg-gray-800/80 border-gray-700"
              : "bg-white/80 border-gray-200"
          )}
        >
          {/* Icon container */}
          <div className="flex justify-center mb-6">
            <div
              className={cn(
                "relative p-6 rounded-full",
                isDarkMode ? "bg-gray-700/50" : "bg-blue-50"
              )}
            >
              {/* Animated rings */}
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-blue-500" />
              <div
                className="absolute inset-0 rounded-full animate-pulse opacity-30"
                style={{
                  background: isDarkMode
                    ? "radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)"
                    : "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
                }}
              />

              {/* Main icon */}
              <div className="relative">
                <ServerCrash
                  className={cn(
                    "w-12 h-12",
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  )}
                  style={{
                    animation: "shake 2s ease-in-out infinite",
                  }}
                />
                <Wrench
                  className={cn(
                    "w-5 h-5 absolute -bottom-1 -right-1",
                    isDarkMode ? "text-yellow-400" : "text-yellow-600"
                  )}
                  style={{
                    animation: "rotate 3s linear infinite",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div className="text-center space-y-4 mb-8">
            <h1
              className={cn(
                "text-3xl md:text-4xl font-bold",
                isDarkMode
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                  : "text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
              )}
            >
              Under Maintenance
            </h1>

            <p
              className={cn(
                "text-lg",
                isDarkMode ? "text-gray-300" : "text-gray-700"
              )}
            >
              We're making things better for you!
            </p>

            <div className="flex items-center justify-center space-x-2 pt-4">
              <Clock
                className={cn(
                  "w-5 h-5",
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                )}
              />
              <p
                className={cn(
                  "text-base font-medium",
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                )}
              >
                We'll be back in a few minutes{dots}
              </p>
            </div>
          </div>

          {/* Information cards */}
          <div className="space-y-3 mb-8">
            <div
              className={cn(
                "p-4 rounded-xl border",
                isDarkMode
                  ? "bg-gray-700/30 border-gray-600"
                  : "bg-blue-50/50 border-blue-100"
              )}
            >
              <p
                className={cn(
                  "text-sm text-center",
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                )}
              >
                Our team is working hard to improve your experience. This won't
                take long!
              </p>
            </div>
          </div>

          {/* Retry button */}
          {onRetry && (
            <Button
              onClick={onRetry}
              className={cn(
                "w-full py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg shadow-blue-500/50"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/30"
              )}
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
          )}

          {/* Status indicator */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isDarkMode ? "bg-yellow-400" : "bg-yellow-500"
              )}
            />
            <p
              className={cn(
                "text-xs",
                isDarkMode ? "text-gray-500" : "text-gray-500"
              )}
            >
              Status: Maintenance Mode
            </p>
          </div>
        </div>

        {/* Additional info */}
        <p
          className={cn(
            "text-center mt-6 text-sm",
            isDarkMode ? "text-gray-500" : "text-gray-600"
          )}
        >
          Thank you for your patience ❤️
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

