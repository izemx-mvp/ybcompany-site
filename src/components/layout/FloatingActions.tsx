import { site, whatsappHref } from "@/content/site";
import { ChatLauncher } from "@/components/chat/ChatLauncher";

/** Bottom-right stack: chatbot launcher above the WhatsApp button. */
export function FloatingActions() {
  return (
    <div className="fixed right-4 bottom-4 z-[80] flex flex-col items-center gap-3 md:right-6 md:bottom-6">
      <ChatLauncher />
      <a
        href={whatsappHref()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`WhatsApp ${site.name}`}
        className="grid size-12 place-items-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-12px_rgb(0_0_0/0.6)] transition-transform duration-300 hover:scale-105"
      >
        <svg viewBox="0 0 32 32" className="size-6" fill="currentColor" aria-hidden="true">
          <path d="M16.04 3C9.4 3 4 8.36 4 14.97c0 2.12.56 4.18 1.62 6L4 29l8.25-1.57a12.1 12.1 0 0 0 3.79.6C22.66 28.03 28 22.67 28 16.06 28 9.45 22.66 3 16.04 3Zm0 22.86c-1.2 0-2.38-.2-3.5-.6l-.25-.09-4.9.93.95-4.73-.17-.27a9.72 9.72 0 0 1-1.5-5.13c0-5.4 4.42-9.79 9.86-9.79 5.42 0 9.84 4.92 9.84 10.3 0 5.4-4.42 9.38-9.84 9.38Zm5.4-7.3c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.15-.17.2-.35.22-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.57-.48-.5-.67-.5h-.57c-.2 0-.52.08-.79.37-.27.3-1.04 1-1.04 2.45 0 1.44 1.06 2.84 1.21 3.04.15.2 2.08 3.17 5.04 4.45.7.3 1.25.48 1.68.62.7.22 1.35.19 1.85.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
        </svg>
      </a>
    </div>
  );
}
