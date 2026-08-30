import { useTranslation } from "react-i18next";

interface HelpButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export function HelpButton({ disabled, onClick }: HelpButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={t("selection.components.helpButton.title")}
      aria-label={t("selection.components.helpButton.title")}
      className="
        absolute
        top-4
        left-[68px]
        z-20
        flex
        h-11
        w-11
        cursor-pointer
        items-center
        justify-center
        rounded-xl
        border
        border-slate-700
        bg-slate-800/80
        text-xl
        font-black
        text-slate-300
        shadow-lg
        backdrop-blur-sm
        transition-all
        duration-200
        hover:border-blue-500/50
        hover:bg-slate-700
        hover:text-blue-400
        active:scale-95
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      ?
    </button>
  );
}
