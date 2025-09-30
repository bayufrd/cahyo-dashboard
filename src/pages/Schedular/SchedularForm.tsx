import { useState, useRef, useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

interface SchedulerFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

function DatePicker({
  value,
  onChange,
  placeholder,
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      const fp = flatpickr(inputRef.current, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        defaultDate: value,
        onChange: (selectedDates) => {
          if (selectedDates[0]) {
            onChange(selectedDates[0].toISOString());
          }
        },
      });
      return () => fp.destroy();
    }
  }, [value, onChange]);

  return (
    <input
      ref={inputRef}
      defaultValue={value}
      placeholder={placeholder}
      className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm 
                 dark:bg-gray-900 dark:text-white/90"
    />
  );
}

// helper buat convert date jadi cron (contoh daily jam yg sama)
function generateCronExpression(dateIso: string | null): string | null {
  if (!dateIso) return null;
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return null;

  const minute = d.getUTCMinutes();
  const hour = d.getUTCHours();
  // contoh: job diulang tiap hari jam & menit yang sama
  return `${minute} ${hour} * * *`;
}

export default function SchedulerForm({
  initialData,
  onSubmit,
  onDelete,
  onCancel,
}: SchedulerFormProps) {
  const [jobName, setJobName] = useState(initialData?.name || "");
  const [jobDescription, setJobDescription] = useState(initialData?.description || "");
  const [scheduleAt, setScheduleAt] = useState(initialData?.scheduleAt || "");
  const [zoneId, setZoneId] = useState(initialData?.zoneId || "Asia/Jakarta");

  const [url, setUrl] = useState(initialData?.request?.url || "");
  const [httpMethod, setHttpMethod] = useState(initialData?.request?.httpMethod || "GET");
  const [httpHeaders, setHttpHeaders] = useState<{ key: string; value: string }[]>(
    initialData?.request?.httpHeaders || [{ key: "", value: "" }]
  );
  const [payload, setPayload] = useState(initialData?.request?.data || "{}");

  const [activeTab, setActiveTab] = useState<"url" | "method" | "headers" | "payload">("url");

  const handleHeaderChange = (i: number, field: "key" | "value", val: string) => {
    const newHeaders = [...httpHeaders];
    newHeaders[i][field] = val;
    setHttpHeaders(newHeaders);
  };

  const addHeader = () => setHttpHeaders([...httpHeaders, { key: "", value: "" }]);
  const removeHeader = (i: number) =>
    setHttpHeaders(httpHeaders.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
      <h5 className="mb-4 font-semibold text-gray-800 text-xl dark:text-white/90">
        {initialData ? "Edit Job" : "Add Job"}
      </h5>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700">Job Name</label>
        <input
          type="text"
          value={jobName}
          onChange={(e) => setJobName(e.target.value)}
          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
        />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700">Job Description</label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
        />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700">Schedule At</label>
        <DatePicker
          value={scheduleAt}
          onChange={(val) => setScheduleAt(val)}
          placeholder="Select date & time"
        />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700">Zona Waktu</label>
        <select
          value={zoneId}
          onChange={(e) => setZoneId(e.target.value)}
          className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
        >
          <option value="Asia/Jakarta">Asia/Jakarta</option>
          <option value="UTC">UTC</option>
          <option value="America/New_York">America/New_York</option>
          <option value="Europe/London">Europe/London</option>
        </select>
      </div>

      <div className="mt-4 border-t pt-4">
        <h6 className="mb-2 font-semibold text-gray-700">Request</h6>

        <div className="flex gap-3 border-b pb-2 text-sm font-medium">
          {["url", "method", "headers", "payload"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-1 ${
                activeTab === tab
                  ? "border-b-2 border-brand-500 text-brand-600"
                  : "text-gray-500"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="mt-3">
          {activeTab === "url" && (
            <div>
              <label className="block text-sm">URL</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          )}

          {activeTab === "method" && (
            <div>
              <label className="block text-sm">HTTP Method</label>
              <select
                value={httpMethod}
                onChange={(e) => setHttpMethod(e.target.value)}
                className="h-11 w-full rounded-lg border px-4 py-2.5 text-sm dark:bg-gray-900 dark:text-white/90"
              >
                {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === "headers" && (
            <div>
              <label className="block text-sm">HTTP Headers</label>
              {httpHeaders.map((h, i) => (
                <div key={i} className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Key"
                    value={h.key}
                    onChange={(e) => handleHeaderChange(i, "key", e.target.value)}
                    className="h-9 flex-1 rounded-lg border px-2 text-sm dark:bg-gray-900 dark:text-white/90"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={h.value}
                    onChange={(e) => handleHeaderChange(i, "value", e.target.value)}
                    className="h-9 flex-1 rounded-lg border px-2 text-sm dark:bg-gray-900 dark:text-white/90"
                  />
                  <button
                    onClick={() => removeHeader(i)}
                    type="button"
                    className="px-2 bg-red-500 text-white rounded-lg"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addHeader}
                className="mt-2 px-3 py-1 bg-blue-500 text-white text-sm rounded-lg"
              >
                + Add Header
              </button>
            </div>
          )}

          {activeTab === "payload" && (
            <div>
              <label className="block text-sm">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={6}
                className="w-full rounded-lg border px-3 py-2 text-sm font-mono dark:bg-gray-900 dark:text-white/90"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600"
          >
            Delete
          </button>
        )}
        <button
          onClick={() =>
            onSubmit({
              name: jobName,
              description: jobDescription,
              scheduleAt,
              zoneId,
              cronExpression: generateCronExpression(scheduleAt), // kalau bisa cron, generate; kalau tidak null
              request: {
                url,
                httpMethod,
                httpHeaders,
                data: payload,
              },
            })
          }
          className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          {initialData ? "Update Changes" : "Add Job"}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-lg bg-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
