import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import { useModal } from "../../hooks/useModal";
import SchedulerForm from "./SchedularForm";
import Badge from "../../components/ui/badge/Badge";
import parser from "cron-parser";

interface Order {
  id: number;
  name?: string | null;
  description?: string | null;
  request?: {
    url?: string | null;
    httpMethod?: string | null;
    httpHeaders?: { key: string; value: string }[] | null;
    data?: string | null;
  } | null;
  cronExpression?: string | null;
  scheduleAt?: string | null;
  zoneId?: string | null;
  status?: string | null; 
}

export default function BasicTableOne() {
  const [tableData, setTableData] = useState<Order[]>([]);
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetch("/Order.json")
      .then((res) => res.json())
      .then((data: Order[]) => {
        const now = new Date();

        const withStatus = data.map((o, idx) => {
          // ensure each order has an id (generate if missing)
          const ensuredId = o.id != null ? o.id : Date.now() + idx;

          let status: "Active" | "Pending" | "Unknown" = "Unknown";

          try {
            if (o.cronExpression) {
              const interval = parser.parse(o.cronExpression, {
                tz: o.zoneId ?? "Asia/Jakarta",
              });
              const nextRun = interval.next().toDate();
              status = nextRun <= now ? "Active" : "Pending";
            } else if (o.scheduleAt) {
              const sched = new Date(o.scheduleAt);
              status = sched <= now ? "Active" : "Pending";
            }
          } catch (err) {
            console.warn("Error evaluating job status:", err);
          }

          return {
            ...o,
            id: ensuredId,
            status,
          } as Order;
        });

        setTableData(withStatus);
      })
      .catch((err) => console.error("Failed to load orders:", err));
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell className="px-4 py-3">
                <input type="checkbox" className="w-4 h-4 accent-blue-500 rounded" />
              </TableCell>
              {[
                "ID",
                "Name",
                "Description",
                "URL",
                "Method",
                "Headers",
                "Data",
                "Cron Expression",
                "Zone",
                "Status",
              ].map((header) => (
                <TableCell
                  key={header}
                  isHeader
                  className="px-6 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {tableData.map((order) => (
              <TableRow
                key={order.id ?? Math.random()}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => {
                  setSelectedOrder(order);
                  openModal();
                }}
              >
                <TableCell className="px-4 py-2">
                  <input type="checkbox" className="w-4 h-4 accent-blue-500 rounded" />
                </TableCell>

                <TableCell className="px-6 py-2">{order.id ?? "-"}</TableCell>
                <TableCell className="px-6 py-2">{order.name ?? "-"}</TableCell>
                <TableCell className="px-6 py-2 text-gray-500">
                  {order.description ?? "-"}
                </TableCell>

                <TableCell className="px-6 py-2 text-gray-500">
                  {order.request?.url ?? "-"}
                </TableCell>
                <TableCell className="px-6 py-2">
                  {order.request?.httpMethod ?? "-"}
                </TableCell>

                <TableCell className="px-6 py-2 text-gray-500">
                  {order.request?.httpHeaders
                    ? Array.isArray(order.request.httpHeaders)
                      ? order.request.httpHeaders.map((h, i) => (
                          <div key={i}>
                            {h.key}: {h.value}
                          </div>
                        ))
                      : order.request.httpHeaders
                    : "-"}
                </TableCell>

                <TableCell className="px-6 py-2 text-gray-500">
                  {order.request?.data ?? "-"}
                </TableCell>

                <TableCell className="px-6 py-2 text-gray-500">
                  {order.cronExpression ?? "-"}
                </TableCell>
                <TableCell className="px-6 py-2">{order.zoneId ?? "-"}</TableCell>

                <TableCell className="px-6 py-2">
                  <Badge
                    size="sm"
                    color={
                      order.status === "Active"
                        ? "success"
                        : order.status === "Pending"
                        ? "warning"
                        : "error"
                    }
                  >
                    {order.status ?? "Unknown"}
                  </Badge>
                </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

        <Modal isOpen={isOpen} onClose={() => { setSelectedOrder(null); closeModal(); }} className="max-w-[700px] p-4 my-10">
          <div className="max-h-[70vh] overflow-y-auto">
            <SchedulerForm
              initialData={
                selectedOrder
                  ? {
                      id: selectedOrder.id,
                      name: selectedOrder.name,
                      description: selectedOrder.description,
                      scheduleAt: selectedOrder.scheduleAt ?? null,
                      zoneId: selectedOrder.zoneId ?? null,
                      cronExpression: selectedOrder.cronExpression ?? null,
                      request: selectedOrder.request ?? undefined,
                    }
                  : undefined
              }
              onSubmit={(data) => {
                // merge data into order shape
                if (selectedOrder) {
                  setTableData((prev) => prev.map((o) => (o.id === selectedOrder.id ? { ...o, ...data } as Order : o)));
                } else {
                  const newId = Date.now();
                  setTableData((prev) => [...prev, { id: newId, ...data } as Order]);
                }
                setSelectedOrder(null);
                closeModal();
              }}
              onDelete={() => {
                if (selectedOrder) {
                  setTableData((prev) => prev.filter((o) => o.id !== selectedOrder.id));
                  setSelectedOrder(null);
                  closeModal();
                }
              }}
              onCancel={() => { setSelectedOrder(null); closeModal(); }}
            />
          </div>
        </Modal>
    </div>
  );
}
