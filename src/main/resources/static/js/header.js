document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector("header");
  if (!header) return;

  const isParticipant = window.location.pathname.includes("/participante/");
  const roleTitle = isParticipant
    ? "Olimpiadas Perú - Atleta"
    : "Gestión de las Olimpiadas";

  // Theme colors based on role
  const textColor = isParticipant ? "text-white" : "text-[#ad0017]";
  const borderColor = isParticipant
    ? "border-white/10"
    : "border-outline-variant";
  const bgColor = isParticipant ? "bg-[#1e1e1e]" : "bg-white";

  header.className = `fixed top-0 left-0 w-full z-[60] flex justify-between items-center px-6 h-16 ${bgColor} border-b ${borderColor} shadow-lg`;

  header.innerHTML = `
        <div class="flex items-center gap-4 overflow-hidden w-full">
            <button class="material-symbols-outlined ${textColor} hover:bg-white/5 transition-colors p-2 rounded-full md:hidden shrink-0" onclick="toggleMobileMenu()">menu</button>
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-[#ad0017] rounded flex items-center justify-center text-white shadow-md">
                    <span class="material-symbols-outlined text-xl">emoji_events</span>
                </div>
                <h1 class="font-bold text-lg md:text-xl ${textColor} truncate tracking-tight">${roleTitle}</h1>
            </div>
        </div>
        <div class="flex items-center gap-4 shrink-0">
            <div class="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full border ${borderColor}">
                <div class="w-2 h-2 rounded-full ${isParticipant ? "bg-green-400 animate-pulse" : "bg-blue-400"}"></div>
                <span class="text-[10px] font-extrabold uppercase tracking-widest ${isParticipant ? "text-white/70" : "text-secondary"}">${isParticipant ? "Atleta Verificado" : "Administrador"}</span>
            </div>
        </div>
    `;
});
