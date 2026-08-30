import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface AboutModalProps {
  onClose: () => void;
}

const REPOSITORY_URL = "https://github.com/ricardolhc/rumble-challenge";

export function AboutModal({ onClose }: AboutModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  function openRepository() {
    window.open(REPOSITORY_URL, "_blank", "noopener,noreferrer");
  }

  const features = [
    {
      key: "draw",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"
          />
        </svg>
      ),
    },
    {
      key: "drawSettings",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v18M3 12h18"
          />
          <circle cx="12" cy="12" r="8" />
        </svg>
      ),
    },
    {
      key: "globalBans",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="m5.6 5.6 12.8 12.8" />
        </svg>
      ),
    },
    {
      key: "individualBans",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <circle cx="9" cy="8" r="3" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 20c0-3 2.5-5 6-5 1.2 0 2.3.2 3.2.7M17 14v6M14 17h6"
          />
        </svg>
      ),
    },
    {
      key: "challengeMode",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"
          />
        </svg>
      ),
    },
    {
      key: "history",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12a9 9 0 1 0 3-6.7"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4v5h5M12 7v5l3 2"
          />
        </svg>
      ),
    },
    {
      key: "languages",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-6 w-6"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.5 2.7 4 5.8 4 9s-1.5 6.3-4 9c-2.5-2.7-4-5.8-4-9s1.5-6.3 4-9Z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      onMouseDown={handleBackdropClick}
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/70
        px-4
        py-8
        backdrop-blur-sm
      "
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-modal-title"
        className="
          relative
          flex
          max-h-[90vh]
          w-full
          max-w-4xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-700/80
          bg-[#161b24]
          shadow-[0_25px_80px_rgba(0,0,0,0.6)]
        "
      >
        {/* Header */}
        <div className="relative border-b border-slate-700/70 px-6 py-5 sm:px-8">
          <div className="pr-12">
            <div className="mb-1 flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-500/30
                  bg-blue-500/10
                  text-xl
                  font-black
                  text-blue-400
                "
              >
                ?
              </div>

              <h2
                id="about-modal-title"
                className="text-2xl font-bold text-white"
              >
                {t("selection.components.about.title")}
              </h2>
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
              {t("selection.components.about.description")}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            title={t("selection.components.about.close")}
            aria-label={t("selection.components.about.close")}
            className="
              absolute
              top-5
              right-5
              flex
              h-9
              w-9
              cursor-pointer
              items-center
              justify-center
              rounded-lg
              border
              border-slate-700
              bg-slate-800
              text-slate-400
              transition-colors
              hover:border-red-500/40
              hover:bg-red-500/10
              hover:text-red-400
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6l12 12M18 6 6 18"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <section>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">
                {t("selection.components.about.featuresTitle")}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {t("selection.components.about.featuresDescription")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.key}
                  className="
                    group
                    rounded-xl
                    border
                    border-slate-700/70
                    bg-slate-800/40
                    p-4
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                    hover:border-slate-600
                    hover:bg-slate-800/70
                  "
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-emerald-500/20
                        bg-emerald-500/10
                        text-emerald-400
                        transition-colors
                        group-hover:border-emerald-500/40
                      "
                    >
                      {feature.icon}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-200">
                        {t(
                          `selection.components.about.features.${feature.key}.title`,
                        )}
                      </h4>

                      <p className="mt-1 text-sm leading-relaxed text-slate-400">
                        {t(
                          `selection.components.about.features.${feature.key}.description`,
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Como funciona */}
          <section className="mt-7">
            <div
              className="
                rounded-xl
                border
                border-blue-500/20
                bg-blue-500/5
                p-5
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-blue-500/10
                    text-blue-400
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 17v-6M12 7h.01"
                    />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>

                <div>
                  <h3 className="font-bold text-blue-300">
                    {t("selection.components.about.howItWorks.title")}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {t("selection.components.about.howItWorks.description")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Challenge */}
          <section className="mt-4">
            <div
              className="
                rounded-xl
                border
                border-amber-500/20
                bg-amber-500/5
                p-5
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    bg-amber-500/10
                    text-amber-400
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="font-bold text-amber-300">
                    {t("selection.components.about.challenge.title")}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {t("selection.components.about.challenge.description")}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            flex-col
            gap-3
            border-t
            border-slate-700/70
            bg-slate-900/30
            px-6
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-8
          "
        >
          <span className="text-xs text-slate-500">
            {t("selection.components.about.footer")}
          </span>

          <button
            type="button"
            onClick={openRepository}
            className="
              flex
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-slate-600
              bg-slate-800
              px-4
              py-2
              text-sm
              font-semibold
              text-slate-200
              transition-all
              hover:border-slate-500
              hover:bg-slate-700
              hover:text-white
              active:scale-[0.98]
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.426 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.7-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.071 1.531 1.031 1.531 1.031.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.221-.253-4.555-1.112-4.555-4.945 0-1.092.39-1.986 1.029-2.686-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 7.844a9.59 9.59 0 0 1 2.504.337c1.909-1.295 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.7 1.028 1.594 1.028 2.686 0 3.842-2.337 4.687-4.566 4.935.359.31.678.921.678 1.856 0 1.34-.012 2.421-.012 2.75 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z"
                clipRule="evenodd"
              />
            </svg>

            {t("selection.components.about.github")}
          </button>
        </div>
      </div>
    </div>
  );
}
