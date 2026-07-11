"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RingScene } from "./RingScene";
import {
  DEFAULT_PARAMS,
  CAMERA_PRESET_QUICK_SELECT,
  type RingLabParams,
} from "./ringLabMath";

interface SliderConfig {
  key: keyof RingLabParams;
  label: string;
  min: number;
  max: number;
  step: number;
}

const GEOMETRY_SLIDERS: SliderConfig[] = [
  { key: "radiusPx", label: "Radius", min: 80, max: 900, step: 1 },
  { key: "perspectivePx", label: "Perspective", min: 400, max: 2200, step: 10 },
  { key: "tiltDeg", label: "Tilt", min: -25, max: 25, step: 0.5 },
  { key: "frontLiftPx", label: "Front lift", min: 0, max: 160, step: 1 },
  { key: "verticalOffsetPx", label: "Vertical offset", min: -200, max: 200, step: 1 },
  { key: "cardWidthPx", label: "Card width", min: 60, max: 480, step: 1 },
  { key: "spacingMul", label: "Spacing", min: 0.5, max: 2.5, step: 0.05 },
  { key: "visibleBackCards", label: "Visible back cards", min: 0, max: 20, step: 1 },
  { key: "maxBlurPx", label: "Blur", min: 0, max: 12, step: 0.1 },
  { key: "minOpacity", label: "Opacity (min)", min: 0, max: 1, step: 0.01 },
  { key: "minScale", label: "Scale (min)", min: 0.1, max: 1, step: 0.01 },
];

const LIGHTING_SLIDERS: SliderConfig[] = [
  { key: "ambientIntensity", label: "Ambient", min: 0, max: 1, step: 0.01 },
  { key: "topLightIntensity", label: "Top light", min: 0, max: 1, step: 0.01 },
  { key: "rimLightIntensity", label: "Rim light", min: 0, max: 1, step: 0.01 },
  { key: "floorShadowOpacity", label: "Floor shadow", min: 0, max: 0.5, step: 0.01 },
  { key: "vignetteIntensity", label: "Vignette", min: 0, max: 1, step: 0.01 },
];

const POSTER_COUNT_OPTIONS = [4, 8, 12, 24] as const;
const CAMERA_ANIMATION_MS = 500;
const NUMERIC_KEYS: (keyof RingLabParams)[] = [...GEOMETRY_SLIDERS.map((s) => s.key)];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function RingLab() {
  const [paramsA, setParamsA] = useState<RingLabParams>(DEFAULT_PARAMS);
  const [paramsB, setParamsB] = useState<RingLabParams>(DEFAULT_PARAMS);
  const [editingScene, setEditingScene] = useState<"A" | "B">("A");
  const [posterCount, setPosterCount] = useState(24);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [debugOverlay, setDebugOverlay] = useState(false);
  const [exportedPreset, setExportedPreset] = useState<string | null>(null);
  const [fps, setFps] = useState(0);
  const [renderCountA, setRenderCountA] = useState(0);
  const [renderCountB, setRenderCountB] = useState(0);

  const cameraAnimRef = useRef<number | null>(null);

  const activeParams = editingScene === "A" ? paramsA : paramsB;
  const setActiveParams = editingScene === "A" ? setParamsA : setParamsB;

  useEffect(() => {
    let frameCount = 0;
    let lastFlush = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      frameCount += 1;
      const elapsed = now - lastFlush;
      if (elapsed >= 500) {
        setFps(Math.round((frameCount * 1000) / elapsed));
        frameCount = 0;
        lastFlush = now;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    return () => {
      if (cameraAnimRef.current !== null) cancelAnimationFrame(cameraAnimRef.current);
    };
  }, []);

  const updateParam = useCallback(
    <K extends keyof RingLabParams>(key: K, value: number) => {
      setActiveParams((prev) => ({ ...prev, [key]: value }));
    },
    [setActiveParams],
  );

  const applyPresetAnimated = useCallback(
    (presetParams: Partial<RingLabParams>) => {
      if (cameraAnimRef.current !== null) cancelAnimationFrame(cameraAnimRef.current);

      const from = editingScene === "A" ? paramsA : paramsB;
      const to = { ...from, ...presetParams };
      const startTime = performance.now();

      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / CAMERA_ANIMATION_MS);
        const eased = easeInOutCubic(t);
        const next = { ...from };
        for (const key of NUMERIC_KEYS) {
          if (presetParams[key] !== undefined) {
            (next as Record<string, number>)[key] = lerp(from[key], to[key], eased);
          }
        }
        setActiveParams(next);
        if (t < 1) {
          cameraAnimRef.current = requestAnimationFrame(step);
        } else {
          cameraAnimRef.current = null;
        }
      };

      cameraAnimRef.current = requestAnimationFrame(step);
    },
    [editingScene, paramsA, paramsB, setActiveParams],
  );

  const handleExport = useCallback(() => {
    const p = activeParams;
    const cardHeightPx = p.cardWidthPx * 1.35;
    const preset = `export const desktopPreset: CameraPreset = {
  perspectivePx: ${Math.round(p.perspectivePx)},
  radiusPx: ${Math.round(p.radiusPx)},
  tiltDeg: ${p.tiltDeg},
  liftPx: ${Math.round(p.frontLiftPx)},
  verticalOffsetPx: ${Math.round(p.verticalOffsetPx)},
  cardWidthPx: ${Math.round(p.cardWidthPx)},
  cardHeightPx: ${Math.round(cardHeightPx)},
  // Ring-lab-only tuning below — not part of CameraPreset itself, carry
  // over into stage/lighting constants when this is wired into HeroStage.
  spacingMul: ${p.spacingMul},
  visibleBackCards: ${p.visibleBackCards},
  maxBlurPx: ${p.maxBlurPx},
  minOpacity: ${p.minOpacity},
  minScale: ${p.minScale},
  ambientIntensity: ${p.ambientIntensity},
  topLightIntensity: ${p.topLightIntensity},
  rimLightIntensity: ${p.rimLightIntensity},
  floorShadowOpacity: ${p.floorShadowOpacity},
  vignetteIntensity: ${p.vignetteIntensity},
};`;
    setExportedPreset(preset);
  }, [activeParams]);

  const handleCopy = useCallback(() => {
    if (exportedPreset) void navigator.clipboard.writeText(exportedPreset);
  }, [exportedPreset]);

  if (screenshotMode) {
    return (
      <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
        <RingScene params={paramsA} posterCount={posterCount} showDebugOverlay={false} hideChrome />
        <button
          type="button"
          onClick={() => setScreenshotMode(false)}
          style={{
            position: "fixed",
            top: 12,
            right: 12,
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #E5E5E5",
            background: "rgba(255,255,255,0.9)",
            fontSize: 12,
            cursor: "pointer",
            zIndex: 3000,
          }}
        >
          Exit screenshot mode
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderBottom: "1px solid #E5E5E5",
            flexWrap: "wrap",
          }}
        >
          {POSTER_COUNT_OPTIONS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => setPosterCount(count)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: count === posterCount ? "1px solid #111111" : "1px solid #E5E5E5",
                background: count === posterCount ? "#111111" : "#ffffff",
                color: count === posterCount ? "#ffffff" : "#111111",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              {count}
            </button>
          ))}

          <span style={{ width: 1, height: 20, background: "#E5E5E5", margin: "0 4px" }} />

          {CAMERA_PRESET_QUICK_SELECT.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPresetAnimated(preset.params)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "1px solid #E5E5E5",
                background: "#ffffff",
                color: "#111111",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {preset.label}
            </button>
          ))}

          <span style={{ width: 1, height: 20, background: "#E5E5E5", margin: "0 4px" }} />

          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666666" }}>
            <input type="checkbox" checked={debugOverlay} onChange={(e) => setDebugOverlay(e.target.checked)} />
            Debug overlay
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#666666" }}>
            <input type="checkbox" checked={comparisonMode} onChange={(e) => setComparisonMode(e.target.checked)} />
            Comparison mode
          </label>

          <button
            type="button"
            onClick={() => setScreenshotMode(true)}
            style={{
              marginLeft: "auto",
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid #E5E5E5",
              background: "#ffffff",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Screenshot mode
          </button>

          <span style={{ fontSize: 11, color: "#999999", fontFamily: "monospace" }}>fps: {fps}</span>
        </div>

        <div style={{ flex: 1, display: "flex", gap: comparisonMode ? 8 : 0, padding: comparisonMode ? 8 : 0 }}>
          <div
            style={{ flex: 1, position: "relative", cursor: comparisonMode ? "pointer" : undefined }}
            onClick={() => comparisonMode && setEditingScene("A")}
          >
            {comparisonMode && (
              <div
                style={{
                  position: "absolute",
                  inset: -2,
                  border: editingScene === "A" ? "2px solid #111111" : "2px solid transparent",
                  borderRadius: 14,
                  zIndex: 2100,
                  pointerEvents: "none",
                }}
              />
            )}
            <RingScene
              params={paramsA}
              posterCount={posterCount}
              showDebugOverlay={debugOverlay}
              label={comparisonMode ? "A (editing)" : undefined}
              onRenderTick={setRenderCountA}
            />
          </div>

          {comparisonMode && (
            <div
              style={{ flex: 1, position: "relative", cursor: "pointer" }}
              onClick={() => setEditingScene("B")}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -2,
                  border: editingScene === "B" ? "2px solid #111111" : "2px solid transparent",
                  borderRadius: 14,
                  zIndex: 2100,
                  pointerEvents: "none",
                }}
              />
              <RingScene
                params={paramsB}
                posterCount={posterCount}
                showDebugOverlay={debugOverlay}
                label="B"
                onRenderTick={setRenderCountB}
              />
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          width: 300,
          flexShrink: 0,
          height: "100%",
          overflowY: "auto",
          borderLeft: "1px solid #E5E5E5",
          padding: "16px 20px",
          fontFamily: "system-ui, sans-serif",
          background: "#FAFAFA",
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 600, color: "#111111", margin: "0 0 4px" }}>
          Ring lab — debug controls
        </p>
        <p style={{ fontSize: 11, color: "#999999", margin: "0 0 12px" }}>
          {comparisonMode ? `Editing scene ${editingScene} — click a scene to switch.` : "Camera presets animate in, not final values."}
        </p>

        <div style={{ fontSize: 11, color: "#999999", fontFamily: "monospace", marginBottom: 12 }}>
          React renders — A: {renderCountA}{comparisonMode ? ` / B: ${renderCountB}` : ""}
        </div>

        <p style={{ fontSize: 12, fontWeight: 600, color: "#666666", margin: "16px 0 8px" }}>Geometry</p>
        {GEOMETRY_SLIDERS.map(({ key, label, min, max, step }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666666" }}>
              <span>{label}</span>
              <span style={{ fontWeight: 600, color: "#111111" }}>
                {Number(activeParams[key]).toFixed(key === "spacingMul" || key === "minOpacity" || key === "minScale" ? 2 : 0)}
              </span>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={activeParams[key]}
              onChange={(event) => updateParam(key, parseFloat(event.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        ))}

        <p style={{ fontSize: 12, fontWeight: 600, color: "#666666", margin: "16px 0 8px" }}>Lighting &amp; stage</p>
        {LIGHTING_SLIDERS.map(({ key, label, min, max, step }) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#666666" }}>
              <span>{label}</span>
              <span style={{ fontWeight: 600, color: "#111111" }}>{activeParams[key]}</span>
            </label>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={activeParams[key]}
              onChange={(event) => updateParam(key, parseFloat(event.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        ))}

        <button
          type="button"
          onClick={handleExport}
          style={{
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #111111",
            background: "#111111",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 8,
          }}
        >
          Export CameraPreset ({editingScene})
        </button>

        {exportedPreset && (
          <div style={{ marginTop: 12 }}>
            <pre
              style={{
                fontSize: 11,
                background: "#111111",
                color: "#E5E5E5",
                padding: 12,
                borderRadius: 8,
                overflowX: "auto",
                whiteSpace: "pre-wrap",
              }}
            >
              {exportedPreset}
            </pre>
            <button
              type="button"
              onClick={handleCopy}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid #E5E5E5",
                background: "#ffffff",
                color: "#111111",
                fontSize: 12,
                cursor: "pointer",
                marginTop: 6,
              }}
            >
              Copy to clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
