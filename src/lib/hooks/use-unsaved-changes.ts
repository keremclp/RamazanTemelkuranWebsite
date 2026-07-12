"use client";

import { useCallback, useEffect, useRef } from "react";

const warning = "Kaydedilmemiş değişiklikleriniz var. Sayfadan ayrılmak istiyor musunuz?";

export function useUnsavedChanges() {
  const dirty = useRef(false);

  const markDirty = useCallback(() => {
    dirty.current = true;
  }, []);

  const markSaved = useCallback(() => {
    dirty.current = false;
  }, []);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty.current) return;
      event.preventDefault();
      event.returnValue = "";
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!dirty.current || event.defaultPrevented) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest("a[href]");
      if (!link || link.getAttribute("target") === "_blank") return;

      if (!window.confirm(warning)) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        dirty.current = false;
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleDocumentClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, []);

  return { markDirty, markSaved };
}
