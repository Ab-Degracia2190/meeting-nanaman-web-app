import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Copy,
  ArrowRight,
  Share2,
  Check,
  QrCode,
  Link,
  Download,
  X,
} from "lucide-react";
import PrimaryButton from "@/components/partials/buttons/Primary";

interface ShareViaProps {
  meetingLink: string;
}

const ShareVia = ({ meetingLink }: ShareViaProps) => {
  const navigate = useNavigate();
  const [linkCopied, setLinkCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showCopyOptions, setShowCopyOptions] = useState(false);

  // Generate QR code using qr-server API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    meetingLink
  )}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      setShowCopyOptions(false);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "meeting-qr-code.png";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setShowCopyOptions(false);
    } catch (error) {
      console.error("Failed to download QR code:", error);
    }
  };

  const copyQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();

      if (navigator.clipboard && window.ClipboardItem) {
        const clipboardItem = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([clipboardItem]);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      } else {
        // Fallback: download instead
        downloadQRCode();
      }
      setShowCopyOptions(false);
    } catch (error) {
      console.error("Failed to copy QR code:", error);
      // Fallback: download instead
      downloadQRCode();
    }
  };

  const joinMeeting = () => {
    navigate(meetingLink.split(window.location.origin)[1]);
  };

  const shareViaLink = () => {
    // Check if Web Share API is available
    if (navigator.share) {
      navigator
        .share({
          title: "Meeting Invitation",
          text: "Join our meeting!",
          url: meetingLink,
        })
        .catch(console.error);
    } else {
      // Fallback to copying the link
      copyLink();
    }
    setShowShareOptions(false);
  };

  const shareViaQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();

      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({
          files: [new File([blob], "qr-code.png", { type: "image/png" })],
        })
      ) {
        const file = new File([blob], "meeting-qr-code.png", {
          type: "image/png",
        });
        await navigator.share({
          title: "Meeting QR Code",
          text: "Scan this QR code to join our meeting!",
          files: [file],
        });
      } else {
        // Fallback: download the QR code
        downloadQRCode();
      }
    } catch (error) {
      console.error("Failed to share QR code:", error);
      // Fallback: download the QR code
      downloadQRCode();
    }
    setShowShareOptions(false);
  };

  const copyOptions = [
    {
      name: "Copy Link",
      icon: Link,
      color: "text-blue-600",
      action: copyLink,
    },
    {
      name: "Copy QR Code",
      icon: QrCode,
      color: "text-green-600",
      action: copyQRCode,
    },
    {
      name: "Download QR Code",
      icon: Download,
      color: "text-purple-600",
      action: downloadQRCode,
    },
  ];

  const shareOptions = [
    {
      name: "Share via Link",
      icon: Link,
      color: "text-blue-600",
      action: shareViaLink,
    },
    {
      name: "Share via QR Code",
      icon: QrCode,
      color: "text-green-600",
      action: shareViaQRCode,
    },
  ];

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20 mb-12">
      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Oh bobo join, share o pa-scan mo to
        </h4>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-2xl shadow-md">
            <img
              src={qrCodeUrl}
              alt="Meeting QR Code"
              className="w-48 h-48 object-contain"
              onError={(e) => {
                // Fallback if QR service fails
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                const fallbackDiv = target.nextElementSibling as HTMLElement;
                if (fallbackDiv) {
                  fallbackDiv.style.display = "flex";
                }
              }}
            />
            <div
              className="w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center"
              style={{ display: "none" }}
            >
              <div className="text-center">
                <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">QR Code unavailable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Link Display */}
        <div className="my-6">
          <code className="text-[10px] md:text-xs bg-gray-100/80 dark:bg-gray-700/80 px-3 py-2 rounded-lg font-mono text-gray-700 dark:text-gray-300 block flex-1 truncate">
            {meetingLink}
          </code>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center items-center">
          {/* Copy Button */}
          <div className="relative">
            <div className="relative group">
              <PrimaryButton
                onClick={() => setShowCopyOptions(!showCopyOptions)}
                className="!w-auto !px-4 !py-2 flex items-center justify-center bg-gray-100/80 dark:bg-gray-700/80 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                {linkCopied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </PrimaryButton>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Copy options
              </span>
            </div>

            {/* Copy Options Dropdown */}
            {showCopyOptions && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[250px]">
                <div className="px-6 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span>Copy options</span>
                  <button
                    onClick={() => setShowCopyOptions(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                {copyOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className="w-full px-6 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <option.icon className={`w-4 h-4 ${option.color}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share Button */}
          <div className="relative">
            <div className="relative group">
              <PrimaryButton
                onClick={() => setShowShareOptions(!showShareOptions)}
                className="!w-auto !px-4 !py-2 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </PrimaryButton>
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                Share options
              </span>
            </div>

            {/* Share Options Dropdown */}
            {showShareOptions && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[250px]">
                <div className="px-6 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span>Share options</span>
                  <button
                    onClick={() => setShowShareOptions(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                {/* Primary share options */}
                {shareOptions.map((option) => (
                  <button
                    key={option.name}
                    onClick={option.action}
                    className="w-full px-6 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <option.icon className={`w-4 h-4 ${option.color}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {option.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Join Button */}
          <div className="relative group">
            <PrimaryButton
              onClick={joinMeeting}
              className="!w-auto !px-4 !py-2 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </PrimaryButton>
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 dark:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Join this meeting
            </span>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showShareOptions || showCopyOptions) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowShareOptions(false);
            setShowCopyOptions(false);
          }}
        />
      )}
    </div>
  );
};

export default ShareVia;
