import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Camera,
  Clock3,
  Coins,
  Gauge,
  RefreshCw,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAdminCameras,
  getAdminCameraTracks,
  type CameraStatus,
  type CameraSummaryItem,
  type CameraTrackItem,
} from "../db";

const POLL_INTERVAL_MS = 5000;

function formatDateTime(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(parsed);
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}m ${rest}s`;
}

function statusLabel(status: CameraStatus): string {
  if (status === "online") return "Online";
  if (status === "degraded") return "Degraded";
  return "Offline";
}

function statusClass(status: CameraStatus): string {
  if (status === "online") return "bg-emerald-100 text-emerald-900 border-emerald-700";
  if (status === "degraded") return "bg-amber-100 text-amber-900 border-amber-700";
  return "bg-rose-100 text-rose-900 border-rose-700";
}

function statusIcon(status: CameraStatus) {
  if (status === "online") return <Wifi size={14} />;
  if (status === "degraded") return <AlertTriangle size={14} />;
  return <WifiOff size={14} />;
}

function percent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function StatusChip({ status }: { status: CameraStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border-2 px-2 py-1 font-mono text-[11px] uppercase font-bold ${statusClass(status)}`}
    >
      {statusIcon(status)}
      {statusLabel(status)}
    </span>
  );
}

function CameraFrame({
  camera,
  tracks,
}: {
  camera: CameraSummaryItem;
  tracks: CameraTrackItem[];
}) {
  return (
    <div className="relative aspect-video overflow-hidden brutal-border bg-black">
      {camera.previewUrl ? (
        <img src={camera.previewUrl} alt={camera.name} className="absolute inset-0 h-full w-full object-cover opacity-80" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,215,0,0.45),transparent_45%),radial-gradient(circle_at_80%_15%,rgba(56,189,248,0.35),transparent_45%),linear-gradient(120deg,#111827,#1f2937,#111827)]" />
      )}

      {camera.status === "offline" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white font-display text-2xl uppercase tracking-wide">
          Stream Offline
        </div>
      ) : (
        tracks.map((track) => (
          <div
            key={track.trackId}
            className="absolute border-2 border-[#FFD700] bg-[#FFD700]/10"
            style={{
              left: `${track.bbox.x * 100}%`,
              top: `${track.bbox.y * 100}%`,
              width: `${track.bbox.w * 100}%`,
              height: `${track.bbox.h * 100}%`,
            }}
          >
            <span className="absolute -top-6 left-0 whitespace-nowrap bg-[#FFD700] px-2 py-1 font-mono text-[10px] font-bold text-black">
              {track.globalId}
            </span>
          </div>
        ))
      )}

      <div className="absolute left-2 top-2 rounded border border-white/30 bg-black/65 px-2 py-1 font-mono text-[11px] uppercase text-white">
        {camera.name}
      </div>
      <div className="absolute bottom-2 right-2 rounded border border-white/30 bg-black/65 px-2 py-1 font-mono text-[11px] uppercase text-white">
        {tracks.length} tracked
      </div>
    </div>
  );
}

export default function AdminCameraTrackingPage() {
  const [cameras, setCameras] = useState<CameraSummaryItem[]>([]);
  const [tracks, setTracks] = useState<CameraTrackItem[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState("");

  const loadSnapshot = useCallback(
    async (withLoader: boolean) => {
      if (withLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const [cameraData, trackData] = await Promise.all([
          getAdminCameras(),
          getAdminCameraTracks(selectedCameraId === "all" ? null : selectedCameraId),
        ]);

        setCameras(cameraData.cameras);
        setLastUpdatedAt(trackData.updatedAt || cameraData.updatedAt);

        const hasSelectedCamera =
          selectedCameraId === "all" || cameraData.cameras.some((camera) => camera.id === selectedCameraId);

        if (!hasSelectedCamera) {
          setSelectedCameraId("all");
          const allTracks = await getAdminCameraTracks(null);
          setTracks(allTracks.tracks);
          setLastUpdatedAt(allTracks.updatedAt);
          return;
        }

        setTracks(trackData.tracks);
      } catch (error) {
        console.error("Failed to load camera snapshot", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [selectedCameraId]
  );

  useEffect(() => {
    void loadSnapshot(true);
  }, [loadSnapshot]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = window.setInterval(() => {
      void loadSnapshot(false);
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [autoRefresh, loadSnapshot]);

  const tracksByCamera = useMemo(() => {
    const map = new Map<string, CameraTrackItem[]>();
    for (const track of tracks) {
      if (!map.has(track.cameraId)) map.set(track.cameraId, []);
      map.get(track.cameraId)!.push(track);
    }
    return map;
  }, [tracks]);

  const selectedCamera = useMemo(
    () => cameras.find((camera) => camera.id === selectedCameraId) ?? null,
    [cameras, selectedCameraId]
  );

  const visibleTracks = useMemo(() => {
    if (selectedCameraId === "all") return tracks;
    return tracks.filter((track) => track.cameraId === selectedCameraId);
  }, [tracks, selectedCameraId]);

  const onlineCount = useMemo(
    () => cameras.filter((camera) => camera.status === "online").length,
    [cameras]
  );
  const degradedCount = useMemo(
    () => cameras.filter((camera) => camera.status === "degraded").length,
    [cameras]
  );
  const totalPeople = useMemo(
    () => cameras.reduce((sum, camera) => sum + camera.peopleCount, 0),
    [cameras]
  );
  const avgLatency = useMemo(() => {
    const active = cameras.filter((camera) => camera.status !== "offline");
    if (!active.length) return 0;
    const total = active.reduce((sum, camera) => sum + camera.latencyMs, 0);
    return Math.round(total / active.length);
  }, [cameras]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}>
          <Camera size={64} className="text-black" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="bg-[#FFD700] border-b-4 border-black p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => void loadSnapshot(false)}
            className="flex items-center gap-3 text-black"
            aria-label="Refresh camera dashboard"
          >
            <div className="bg-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Coins className="text-black" size={32} />
            </div>
            <div>
              <h1 className="font-display text-4xl tracking-tight uppercase">Ozone-coin</h1>
              <p className="font-mono text-xs font-bold uppercase">Camera Tracking Center</p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoRefresh((value) => !value)}
              className={`brutal-btn flex items-center gap-2 px-3 py-2 text-xs uppercase ${
                autoRefresh ? "bg-black text-white" : "bg-white text-black"
              }`}
              title={autoRefresh ? "Auto refresh ON" : "Auto refresh OFF"}
            >
              <Activity size={14} />
              {autoRefresh ? "Auto ON" : "Auto OFF"}
            </button>

            <button
              type="button"
              onClick={() => void loadSnapshot(false)}
              className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
              title="Refresh now"
              aria-label="Refresh now"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>

            <Link
              to="/admin"
              className="brutal-btn flex h-[52px] w-[52px] items-center justify-center p-0"
              title="Back to admin"
              aria-label="Back to admin"
            >
              <ArrowLeft size={18} />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="brutal-border bg-white p-5">
            <p className="font-mono text-xs uppercase text-gray-500">Online cameras</p>
            <div className="mt-2 font-display text-5xl">{onlineCount}</div>
            <p className="font-mono text-xs mt-1 text-gray-500">Degraded: {degradedCount}</p>
          </div>
          <div className="brutal-border bg-white p-5">
            <p className="font-mono text-xs uppercase text-gray-500">Tracked people now</p>
            <div className="mt-2 font-display text-5xl">{totalPeople}</div>
            <p className="font-mono text-xs mt-1 text-gray-500">Across all active streams</p>
          </div>
          <div className="brutal-border bg-white p-5">
            <p className="font-mono text-xs uppercase text-gray-500">Average latency</p>
            <div className="mt-2 font-display text-5xl">{avgLatency}ms</div>
            <p className="font-mono text-xs mt-1 text-gray-500">AI and stream pipeline</p>
          </div>
          <div className="brutal-border bg-black text-white p-5">
            <p className="font-mono text-xs uppercase opacity-70">Last refresh</p>
            <div className="mt-2 text-2xl font-display">{lastUpdatedAt ? formatDateTime(lastUpdatedAt) : "--:--:--"}</div>
            <p className="font-mono text-xs mt-2 opacity-70">Interval: {POLL_INTERVAL_MS / 1000}s</p>
          </div>
        </section>

        <section className="brutal-border bg-white p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Camera size={18} />
              <h2 className="font-display text-2xl uppercase">Camera Switcher</h2>
            </div>
            <p className="font-mono text-xs uppercase text-gray-500">{cameras.length} cameras configured</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCameraId("all")}
              className={`rounded-full border-2 border-black px-4 py-2 font-mono text-xs uppercase font-bold ${
                selectedCameraId === "all" ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              All cameras
            </button>

            {cameras.map((camera) => (
              <button
                key={camera.id}
                type="button"
                onClick={() => setSelectedCameraId(camera.id)}
                className={`rounded-full border-2 border-black px-4 py-2 font-mono text-xs uppercase font-bold ${
                  selectedCameraId === camera.id ? "bg-black text-white" : "bg-white text-black"
                }`}
              >
                {camera.name} ({camera.peopleCount})
              </button>
            ))}
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="space-y-4">
            {selectedCameraId === "all" ? (
              <div className="grid gap-4 md:grid-cols-2">
                {cameras.map((camera) => {
                  const cameraTracks = tracksByCamera.get(camera.id) ?? [];
                  return (
                    <div key={camera.id} className="brutal-border bg-white p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-2xl uppercase">{camera.name}</h3>
                          <p className="font-mono text-xs uppercase text-gray-500">{camera.location}</p>
                        </div>
                        <StatusChip status={camera.status} />
                      </div>

                      <CameraFrame camera={camera} tracks={cameraTracks} />

                      <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                        <div className="rounded border border-black px-2 py-1 bg-gray-50">
                          <div className="uppercase text-gray-500">Input</div>
                          <div className="font-bold">{camera.inputFps} fps</div>
                        </div>
                        <div className="rounded border border-black px-2 py-1 bg-gray-50">
                          <div className="uppercase text-gray-500">Process</div>
                          <div className="font-bold">{camera.processFps} fps</div>
                        </div>
                        <div className="rounded border border-black px-2 py-1 bg-gray-50">
                          <div className="uppercase text-gray-500">Latency</div>
                          <div className="font-bold">{camera.latencyMs} ms</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCameraId(camera.id)}
                        className="w-full brutal-btn-yellow text-xs uppercase"
                      >
                        Focus this camera
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : selectedCamera ? (
              <div className="brutal-border bg-white p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-3xl uppercase">{selectedCamera.name}</h2>
                    <p className="font-mono text-xs uppercase text-gray-500">{selectedCamera.location}</p>
                  </div>
                  <StatusChip status={selectedCamera.status} />
                </div>

                <CameraFrame camera={selectedCamera} tracks={tracksByCamera.get(selectedCamera.id) ?? []} />

                <div className="grid gap-3 md:grid-cols-4 text-sm">
                  <div className="brutal-border bg-white p-3">
                    <p className="font-mono text-xs uppercase text-gray-500">People</p>
                    <p className="font-display text-3xl">{selectedCamera.peopleCount}</p>
                  </div>
                  <div className="brutal-border bg-white p-3">
                    <p className="font-mono text-xs uppercase text-gray-500">Input FPS</p>
                    <p className="font-display text-3xl">{selectedCamera.inputFps}</p>
                  </div>
                  <div className="brutal-border bg-white p-3">
                    <p className="font-mono text-xs uppercase text-gray-500">Process FPS</p>
                    <p className="font-display text-3xl">{selectedCamera.processFps}</p>
                  </div>
                  <div className="brutal-border bg-white p-3">
                    <p className="font-mono text-xs uppercase text-gray-500">Latency</p>
                    <p className="font-display text-3xl">{selectedCamera.latencyMs}ms</p>
                  </div>
                </div>

                <div className="rounded border-2 border-dashed border-black px-4 py-3 bg-gray-50 font-mono text-xs uppercase text-gray-600">
                  Last frame at {formatDateTime(selectedCamera.lastFrameAt)}
                </div>
              </div>
            ) : (
              <div className="brutal-border bg-white p-8 text-center font-mono uppercase text-gray-500">
                Selected camera not found
              </div>
            )}
          </section>

          <aside className="brutal-border bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-2xl uppercase flex items-center gap-2">
                <Users size={20} /> People
              </h3>
              <p className="font-mono text-xs uppercase text-gray-500">{visibleTracks.length} tracks</p>
            </div>

            {visibleTracks.length === 0 ? (
              <div className="border-2 border-dashed border-black p-6 text-center font-mono text-xs uppercase text-gray-500">
                No active people detected
              </div>
            ) : (
              <div className="space-y-2 max-h-[760px] overflow-auto pr-1">
                {visibleTracks.map((track) => (
                  <div key={track.trackId} className="rounded border-2 border-black p-3 bg-white">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-xl leading-none">{track.globalId}</p>
                        <p className="font-mono text-[11px] uppercase text-gray-500">
                          {track.cameraName} / {track.zone}
                        </p>
                      </div>
                      <span className="rounded border border-black px-2 py-1 font-mono text-[10px] uppercase font-bold">
                        {percent(track.reidScore)} reid
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono uppercase">
                      <div className="rounded border border-gray-300 px-2 py-1">
                        <div className="text-gray-500">Detection</div>
                        <div className="font-bold">{percent(track.confidence)}</div>
                      </div>
                      <div className="rounded border border-gray-300 px-2 py-1">
                        <div className="text-gray-500">On screen</div>
                        <div className="font-bold">{formatDuration(track.dwellSeconds)}</div>
                      </div>
                      <div className="rounded border border-gray-300 px-2 py-1 col-span-2 flex items-center gap-2">
                        <Clock3 size={12} />
                        <span>Last seen {formatDateTime(track.lastSeenAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t-2 border-black pt-3 text-xs font-mono uppercase">
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 flex items-center gap-1">
                  <Gauge size={12} /> Avg latency
                </span>
                <span className="font-bold">{avgLatency}ms</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-500 flex items-center gap-1">
                  <Activity size={12} /> Auto refresh
                </span>
                <span className="font-bold">{autoRefresh ? "on" : "off"}</span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
