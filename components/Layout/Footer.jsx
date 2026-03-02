export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 text-center py-4 mt-10 pb-16 sm:pb-6">
      <p>
  ©️ {new Date().getFullYear()} 
  <span className="text-white font-semibold"> IdeaConnect</span>. 
  All rights reserved.
</p>
      <p className="text-sm mt-1">
        Connecting ideas with the right people.
      </p>
    </footer>
  );
}