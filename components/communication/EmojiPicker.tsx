import React from 'react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EMOJIS = [
    '😀', '😂', '😊', '😍', '👍', '🎉', '❤️', '🙏', '📚', '✏️', '🏫', '🔔', '👏', '💡', '✅', '❌', '🤔', '🙌', '⭐', '📅'
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 w-64">
            <div className="grid grid-cols-5 gap-2">
                {EMOJIS.map(emoji => (
                    <button
                        key={emoji}
                        type="button"
                        onClick={() => onEmojiSelect(emoji)}
                        className="text-2xl rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 p-1 transition-colors"
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EmojiPicker;