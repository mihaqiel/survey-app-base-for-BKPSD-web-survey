"use client";
import { useEffect } from "react";

export function AutoSave({ surveyId }: { surveyId: string }) {
  const storageKey = `survey_draft_${surveyId}`;

  useEffect(() => {
    // 1. Load existing draft from local storage when the page opens
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      Object.entries(parsed).forEach(([name, value]) => {
        const input = document.getElementsByName(name)[0] as HTMLInputElement | HTMLTextAreaElement;
        if (input) input.value = value as string;
      });
    }

    // 2. Listen for any typing/selection and save it instantly
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (target.name) {
        const currentData = JSON.parse(localStorage.getItem(storageKey) || "{}");
        currentData[target.name] = target.value;
        localStorage.setItem(storageKey, JSON.stringify(currentData));
      }
    };

    window.addEventListener("input", handleInput);
    return () => window.removeEventListener("input", handleInput);
  }, [surveyId, storageKey]);

  return null; // This component is an invisible background process
}