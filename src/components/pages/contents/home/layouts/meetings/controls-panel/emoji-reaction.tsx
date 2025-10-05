import { X, Smile } from 'lucide-react';

interface EmojiReactionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
}

const commonEmojis = [
  '👍', '👎', '👏', '🎉', '😂', '😮', '😍', '🤔',
  '👋', '✋', '🙌', '💪', '🔥', '❤️', '⚡', '✨',
  '😊', '😎', '🤩', '😢', '😤', '😱', '🤯', '🙄'
];

const EmojiReactionPanel: React.FC<EmojiReactionPanelProps> = ({
  isOpen,
  onClose,
  onSelectEmoji,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed left-1/2 bottom-20 transform -translate-x-1/2 w-80 max-w-[90vw] bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl z-50 border border-white/20 dark:border-gray-700/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-rose-50/50 to-orange-50/50 dark:from-gray-700/50 dark:to-gray-600/50">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Reactions</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Emoji Grid */}
        <div className="p-4 grid grid-cols-8 gap-2">
          {commonEmojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                onSelectEmoji(emoji);
                onClose();
              }}
              className="p-2 text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hover:scale-110 transform duration-150"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Note */}
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
            Click an emoji to share your reaction with everyone
          </p>
        </div>
      </div>
    </>
  );
};

export default EmojiReactionPanel;