import { VideoOff, X } from "lucide-react";
import PrimaryButton from "@/components/partials/buttons/Primary";

interface NotFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotFoundModal = ({ isOpen, onClose }: NotFoundModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="max-w-md w-full text-center m-4 relative">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-white/20">
          {/* Close Icon Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          >
            <X className="w-6 h-6 cursor-pointer" />
          </button>

          {/* Content */}
          <div className="mb-8">
            <VideoOff className="w-24 h-24 mx-auto text-gray-500 mb-4" />
            <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Meeting Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              The meeting room you're looking for doesn't exist or may have expired.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <PrimaryButton className="text-xs" onClick={onClose}>
              Close
            </PrimaryButton>

            <div className="text-sm text-gray-600">
              <p>Need help? Contact support or try creating a new meeting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundModal;