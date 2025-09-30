import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import BasicTableOne from "./BasicTableOne";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../../components/ui/modal";
import SchedulerForm from "./SchedularForm";

export default function BasicTables() {
  const { isOpen, openModal, closeModal } = useModal();

  const handleAdd = (data: any) => {
    console.log("New schedular from table:", data);
    closeModal();
  };

  return (
    <>
      <PageBreadcrumb pageTitle="List Schedule" />
      <div className="space-y-6">
        <ComponentCard title="List Schedule">
          
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] p-6 lg:p-10">
        <SchedulerForm onSubmit={handleAdd} onCancel={closeModal} />
      </Modal>
          <div className="flex justify-end mb-4">
            <button
              onClick={openModal}
              className="rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
            >
              Add Schedular
            </button>
          </div>
          <BasicTableOne />
        </ComponentCard>
      </div>

    </>
  );
}
