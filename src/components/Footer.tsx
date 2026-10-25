import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#181A22] border-t border-[#292C36] py-4 text-center text-xs text-[#9CA3B4] mt-auto">
      © {new Date().getFullYear()} OLEXTY Community. All rights reserved.
    </footer>
  );
};