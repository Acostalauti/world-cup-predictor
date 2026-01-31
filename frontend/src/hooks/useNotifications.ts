import { useState, useEffect } from "react";
import { client } from "@/api/client";
import type { components } from "@/types/api";

type Prediction = components["schemas"]["Prediction"];

export const useNotifications = (enabled: boolean = true) => {
  const [unnotifiedPredictions, setUnnotifiedPredictions] = useState<Prediction[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const fetchUnnotified = async () => {
      try {
        const { data } = await client.GET("/api/predictions/unnotified");
        if (data) {
          setUnnotifiedPredictions(data);
          setNotificationCount(data.length);
        }
      } catch (error) {
        console.error("Failed to fetch unnotified predictions", error);
      }
    };

    // Fetch immediately
    fetchUnnotified();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnnotified, 30000);

    return () => clearInterval(interval);
  }, [enabled]);

  const openNotificationCenter = () => {
    setIsOpen(true);
  };

  const closeNotificationCenter = () => {
    setIsOpen(false);
    // Clear after closing
    setUnnotifiedPredictions([]);
    setNotificationCount(0);
  };

  return {
    unnotifiedPredictions,
    notificationCount,
    isOpen,
    openNotificationCenter,
    closeNotificationCenter,
  };
};
