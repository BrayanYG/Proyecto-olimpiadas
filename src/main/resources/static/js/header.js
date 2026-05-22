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

// Premium toast notification system
window.showToast = function (message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "flex items-center gap-3 p-4 bg-white border-l-4 rounded-xl shadow-lg translate-x-full opacity-0 transition-all duration-300 pointer-events-auto cursor-pointer";
  
  let iconName = "check_circle";
  let iconColor = "text-green-600";
  let borderColor = "border-green-600";

  if (type === "error") {
    iconName = "error";
    iconColor = "text-error";
    borderColor = "border-error";
  } else if (type === "warning") {
    iconName = "warning";
    iconColor = "text-amber-500";
    borderColor = "border-amber-500";
  } else if (type === "info") {
    iconName = "info";
    iconColor = "text-blue-500";
    borderColor = "border-blue-500";
  }

  toast.className += ` ${borderColor}`;

  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor} shrink-0 text-2xl">${iconName}</span>
    <div class="flex-1 font-body-md text-sm text-on-surface font-medium">${message}</div>
    <button class="material-symbols-outlined text-on-surface-variant hover:text-on-surface text-lg shrink-0" onclick="event.stopPropagation(); this.parentElement.classList.add('translate-x-full', 'opacity-0'); setTimeout(() => this.parentElement.remove(), 300);">close</button>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-x-full", "opacity-0");
  }, 50);

  const dismissTimeout = setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);

  toast.addEventListener("click", () => {
    clearTimeout(dismissTimeout);
    toast.classList.add("translate-x-full", "opacity-0");
    setTimeout(() => {
      toast.remove();
    }, 300);
  });
};

// Premium confirmation modal system
window.showConfirm = function (message, onConfirm) {
  const backdrop = document.createElement("div");
  backdrop.className = "fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 opacity-0 transition-opacity duration-200";
  
  const modal = document.createElement("div");
  modal.className = "bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-t-4 border-primary p-6 space-y-4 scale-95 opacity-0 transition-all duration-200";
  
  modal.innerHTML = `
    <div class="flex items-start gap-4">
      <div class="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-error text-2xl">warning</span>
      </div>
      <div class="space-y-1 flex-1">
        <h3 class="font-title-lg text-title-lg text-on-surface font-bold">Confirmar Acción</h3>
        <p class="font-body-md text-sm text-on-surface-variant leading-relaxed">${message}</p>
      </div>
    </div>
    <div class="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
      <button id="confirm-cancel" class="px-4 py-2 border-2 border-outline/50 hover:bg-surface-variant rounded-lg font-label-md text-sm text-on-surface transition-colors cursor-pointer">
        Cancelar
      </button>
      <button id="confirm-ok" class="px-4 py-2 bg-primary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-95 transition-all text-sm shadow-md cursor-pointer">
        Confirmar
      </button>
    </div>
  `;
  
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  
  const cancelBtn = modal.querySelector("#confirm-cancel");
  const okBtn = modal.querySelector("#confirm-ok");
  
  const close = () => {
    backdrop.classList.add("opacity-0");
    modal.classList.add("scale-95", "opacity-0");
    setTimeout(() => {
      backdrop.remove();
    }, 200);
  };
  
  cancelBtn.onclick = () => {
    close();
  };
  
  okBtn.onclick = () => {
    close();
    if (typeof onConfirm === "function") {
      onConfirm();
    }
  };

  backdrop.onclick = (e) => {
    if (e.target === backdrop) {
      close();
    }
  };
  
  setTimeout(() => {
    backdrop.classList.remove("opacity-0");
    modal.classList.remove("scale-95", "opacity-0");
  }, 10);
};

