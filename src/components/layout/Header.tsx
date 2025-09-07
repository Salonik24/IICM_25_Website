import React from 'react';

export default function Header(){
  return (
    <header className="w-full py-4 px-6 bg-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">IICM</div>
        <nav>
          <ul className="flex space-x-6">
            <li><a href="/" className="hover:text-blue-600">Home</a></li>
            <li><a href="/schedule" className="hover:text-blue-600">Schedule</a></li>
            <li><a href="/team" className="hover:text-blue-600">Team</a></li>
            <li><a href="/contact" className="hover:text-blue-600">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
