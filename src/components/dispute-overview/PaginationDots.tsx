import React from "react";

interface PaginationDotsProps {
  currentIndex: number;
  total: number;
  className?: string; // Add optional className prop
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  currentIndex,
  total,
  className = "",
}) => {
  return (
    // Removed "mt-6" and added "className" prop
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ease-out ${
            index === currentIndex
              ? "w-6 bg-[#1b1c23]" // Active: longer pill
              : "w-2 bg-gray-200" // Inactive: small dot
          }`}
        />
      ))}
    </div>
  );
};
