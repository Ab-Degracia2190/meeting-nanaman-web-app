import { X, Image } from 'lucide-react';

interface BackgroundFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBackground: (background: string) => void;
  currentBackground: string;
}

const backgroundOptions = [
  {
    id: 'none',
    name: 'None',
    type: 'none',
    preview: 'bg-gray-200'
  },
  {
    id: 'blur',
    name: 'Blur',
    type: 'blur',
    preview: 'bg-gradient-to-br from-blue-400 to-purple-500 blur-sm'
  },
  {
    id: 'office',
    name: 'Office',
    type: 'image',
    preview: 'bg-gradient-to-br from-gray-400 to-gray-600',
    style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'nature',
    name: 'Nature',
    type: 'image', 
    preview: 'bg-gradient-to-br from-green-400 to-blue-500',
    style: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
  },
  {
    id: 'gradient1',
    name: 'Sunset',
    type: 'gradient',
    preview: 'bg-gradient-to-br from-orange-400 to-pink-500',
    style: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)'
  },
  {
    id: 'gradient2', 
    name: 'Ocean',
    type: 'gradient',
    preview: 'bg-gradient-to-br from-blue-400 to-teal-500',
    style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 'gradient3',
    name: 'Space',
    type: 'gradient', 
    preview: 'bg-gradient-to-br from-purple-900 to-blue-900',
    style: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
  },
  {
    id: 'gradient4',
    name: 'Forest',
    type: 'gradient',
    preview: 'bg-gradient-to-br from-green-600 to-lime-400',
    style: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
  }
];

const BackgroundFilters: React.FC<BackgroundFiltersProps> = ({
  isOpen,
  onClose,
  onSelectBackground,
  currentBackground,
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
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 max-h-[70vh] bg-white/95 backdrop-blur-md rounded-xl shadow-xl z-50 border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 bg-gradient-to-r from-rose-50/50 to-orange-50/50">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Background Effects</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Background Options */}
        <div className="p-4 overflow-y-auto max-h-96">
          <div className="grid grid-cols-3 gap-3">
            {backgroundOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onSelectBackground(option.id);
                  onClose();
                }}
                className={`relative group overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                  currentBackground === option.id
                    ? 'border-orange-400 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Preview */}
                <div className="aspect-video relative">
                  {option.type === 'none' ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">None</span>
                    </div>
                  ) : option.type === 'blur' ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 relative">
                      <div className="absolute inset-0 backdrop-blur-sm bg-white/10"></div>
                    </div>
                  ) : (
                    <div 
                      className="w-full h-full"
                      style={{ background: option.style || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    ></div>
                  )}
                  
                  {/* Selected indicator */}
                  {currentBackground === option.id && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-orange-400 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className="p-2 text-xs font-medium text-gray-700 text-center bg-white/50">
                  {option.name}
                </div>
              </button>
            ))}
          </div>

          {/* Note */}
          <div className="mt-4 p-3 bg-blue-50/50 rounded-lg">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> Background effects are simulated for demonstration. 
              Real implementation would require additional video processing libraries.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BackgroundFilters;