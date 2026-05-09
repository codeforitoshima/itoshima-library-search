import { Fragment, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Holding } from "~/lib/parser.server";
import { FloorMap } from "./FloorMap";
import { translateLibrary } from "~/utils/translateLibrary";

export function HoldingsSection({ holdings, bookId }: { holdings: Holding[]; bookId: string }) {
  const { t } = useTranslation();
  const [openMap, setOpenMap] = useState<string | null>(null);

  return (
    <section className="detail-section">
      <h3>{t("holdings.title")}</h3>
      <table className="holdings-table">
        <thead>
          <tr>
            <th>{t("holdings.branch")}</th>
            <th>{t("holdings.type")}</th>
            <th>{t("holdings.location")}</th>
            <th>{t("holdings.status")}</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const key = `${h.library}-${h.materialNo}`;
            const isOpen = openMap === key;
            return (
              <Fragment key={key}>
                <tr>
                  <td>{translateLibrary(h.library, t)}</td>
                  <td>{h.type}</td>
                  <td>{h.location}</td>
                  <td
                    className={
                      h.status.includes("貸出できます")
                        ? "status-available"
                        : "status-lent"
                    }
                  >
                    {h.status.includes("貸出できます")
                      ? t("book.available")
                      : h.status.includes("貸出中") || h.status.includes("借出中")
                      ? t("book.checkedOut")
                      : h.status}
                  </td>
                  <td>
                    {h.floorMapParams && (
                      <button
                        type="button"
                        className="floor-map-toggle"
                        onClick={() => setOpenMap(isOpen ? null : key)}
                        aria-expanded={isOpen}
                      >
                        {t("holdings.map")}
                      </button>
                    )}
                  </td>
                </tr>
                {isOpen && h.floorMapParams && (
                  <tr>
                    <td colSpan={5} className="floor-map-cell">
                      <FloorMap
                        biblioid={bookId}
                        lcdcd={h.floorMapParams.lcdcd}
                        doclno={h.floorMapParams.doclno}
                        displcs={h.floorMapParams.displcs}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
