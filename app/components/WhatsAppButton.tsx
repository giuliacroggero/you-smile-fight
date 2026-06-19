export default function WhatsAppButton() {
  const phone = "5511939478812";

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(
    "Olá! Vim pelo site da You Smile Fight e gostaria de mais informações."
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-6 right-6 z-[9999] flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] shadow-2xl transition duration-300 hover:scale-110"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="h-9 w-9 fill-white"
      >
        <path d="M16.01 3C8.83 3 3 8.74 3 15.82c0 2.48.72 4.88 2.09 6.95L3 29l6.43-2.06a13.13 13.13 0 0 0 6.58 1.78C23.17 28.72 29 22.98 29 15.9 29 8.82 23.17 3 16.01 3Zm0 23.4c-2.02 0-3.99-.54-5.72-1.57l-.41-.24-3.81 1.22 1.24-3.7-.27-.42a10.9 10.9 0 0 1-1.69-5.87c0-5.96 4.89-10.8 10.9-10.8s10.9 4.84 10.9 10.8c0 5.96-4.89 10.8-10.94 10.8Zm5.98-8.17c-.33-.16-1.95-.96-2.25-1.07-.3-.11-.52-.16-.74.16-.22.32-.85 1.07-1.04 1.29-.19.21-.38.24-.71.08-.33-.16-1.39-.51-2.64-1.62-.98-.87-1.64-1.95-1.83-2.28-.19-.32-.02-.5.14-.66.15-.15.33-.38.49-.57.16-.19.22-.32.33-.54.11-.21.05-.4-.03-.57-.08-.16-.74-1.77-1.01-2.42-.27-.64-.55-.55-.74-.56h-.63c-.22 0-.57.08-.87.4-.3.32-1.14 1.11-1.14 2.7s1.17 3.12 1.33 3.33c.16.21 2.3 3.47 5.57 4.87.78.33 1.39.53 1.86.68.78.25 1.49.21 2.05.13.63-.09 1.95-.8 2.22-1.57.27-.77.27-1.43.19-1.57-.08-.14-.3-.22-.63-.38Z" />
      </svg>
    </a>
  );
}