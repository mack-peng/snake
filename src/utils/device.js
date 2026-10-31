/**
 * 设备自适应工具（三仓共享，内容级）
 * 按屏宽分档，并在档位变化（旋转 / 拖窗跨档）时通知调用方。
 */
export const DEVICE_PHONE = "phone";
export const DEVICE_TABLET = "tablet";
export const DEVICE_DESKTOP = "desktop";

export const deviceClass = (width = window.innerWidth) =>
  width < 768 ? DEVICE_PHONE : width < 1024 ? DEVICE_TABLET : DEVICE_DESKTOP;

export const onDeviceClassChange = (cb) => {
  let current = deviceClass();
  const handler = () => {
    const next = deviceClass();
    if (next !== current) {
      current = next;
      cb(next);
    }
  };
  window.addEventListener("resize", handler);
  window.addEventListener("orientationchange", handler);
  return () => {
    window.removeEventListener("resize", handler);
    window.removeEventListener("orientationchange", handler);
  };
};
