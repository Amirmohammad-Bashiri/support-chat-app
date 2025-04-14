"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CustomEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

// Limited set of popular emojis by category
const emojisByCategory = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
  ],
  gestures: [
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "👇",
    "☝️",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👏",
    "🙌",
  ],
  animals: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🦆",
    "🦅",
  ],
  food: [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🥑",
    "🍆",
    "🥔",
    "🥕",
  ],
  travel: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🛵",
    "🏍️",
    "🛺",
    "🚲",
    "🛴",
    "🚨",
  ],
  objects: [
    "⌚",
    "📱",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📽️",
    "🎞️",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
  ],
};

export function CustomEmojiPicker({ onEmojiSelect }: CustomEmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState("smileys");

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden w-[250px]">
      <Tabs
        defaultValue="smileys"
        onValueChange={setActiveCategory}
        value={activeCategory}>
        <TabsList className="grid grid-cols-6 h-10">
          <TabsTrigger value="smileys" className="text-lg p-0">
            😀
          </TabsTrigger>
          <TabsTrigger value="gestures" className="text-lg p-0">
            👍
          </TabsTrigger>
          <TabsTrigger value="animals" className="text-lg p-0">
            🐶
          </TabsTrigger>
          <TabsTrigger value="food" className="text-lg p-0">
            🍎
          </TabsTrigger>
          <TabsTrigger value="travel" className="text-lg p-0">
            🚗
          </TabsTrigger>
          <TabsTrigger value="objects" className="text-lg p-0">
            📱
          </TabsTrigger>
        </TabsList>

        {Object.entries(emojisByCategory).map(([category, emojis]) => (
          <TabsContent
            key={category}
            value={category}
            className={cn(
              "p-2 grid grid-cols-5 gap-1 h-[200px]",
              activeCategory !== category && "hidden"
            )}>
            {emojis.map((emoji, index) => (
              <Button
                key={index}
                variant="ghost"
                className="h-10 w-10 p-0 text-lg hover:bg-gray-100"
                onClick={() => onEmojiSelect(emoji)}>
                {emoji}
              </Button>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
