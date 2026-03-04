import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ menuItems, isOpen, setIsOpen, variant }) => {
  const location = useLocation();
  const isFloating = variant === "floating-bottom";

  return (
    <>
      {/* Overlay (Mobile - only for non-floating drawer) */}
      {isOpen && !isFloating && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Bottom Nav (Mobile) or Sidebar (Desktop) */}
      <div
        className={`
          fixed z-50 transition-all duration-300
          ${isFloating
            ? `
              bottom-6 left-1/2 -translate-x-1/2 w-[90%]
              flex flex-row items-center justify-around
              bg-white border-4 border-black shadow-[6px_6px_0px_#000]
              rounded-xl p-3 md:static md:w-64 md:h-full md:flex-col md:translate-x-0 md:rounded-none md:p-6
              translate-y-0
            `
            : `
              top-0 left-0 h-full w-64
              bg-white border-r-4 border-black
              transform ${isOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0 md:static
            `
          }
        `}
      >

        {/* Title (Hidden on mobile floating nav) */}
        {!isFloating && (
          <div className="p-6 font-black text-2xl border-b-4 border-black uppercase italic tracking-tighter">
            PANEL
          </div>
        )}

        {isFloating && (
          <div className="hidden md:block p-6 font-black text-2xl border-b-4 border-black uppercase italic tracking-tighter w-full">
            STUDENT
          </div>
        )}

        <nav className={`
          ${isFloating ? "flex flex-row w-full justify-around md:flex-col md:space-y-3 md:mt-6" : "p-4 space-y-3"}
        `}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 transition-all duration-200
                  ${isFloating
                    ? "p-2 rounded-lg flex-col md:flex-row md:px-4 md:py-3 md:rounded-none"
                    : "px-4 py-3 border-2 border-black shadow-[2px_2px_0px_#000]"
                  }
                  ${isActive
                    ? "bg-[#ccff00] text-black font-black border-2 border-black"
                    : "hover:bg-[#f3f1ea] text-gray-700"}
                `}
              >
                <Icon size={20} />
                <span className={`uppercase text-[10px] md:text-xs font-bold tracking-widest ${isFloating ? "block" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;