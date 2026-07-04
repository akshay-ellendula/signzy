import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import { deleteVendor } from '../services/api';
import VendorTable from '../components/VendorTable';

export default function Vendors() {
  const { vendors, vendorsLoading, vendorsError, refreshVendors } = useAppContext();

  const handleDelete = async (vendor) => {
    if (!window.confirm(`Delete vendor "${vendor.name}"?`)) return;
    const toastId = toast.loading(`Deleting vendor "${vendor.name}"...`);
    try {
      await deleteVendor(vendor._id);
      toast.success(`Vendor "${vendor.name}" deleted successfully!`, { id: toastId });
      refreshVendors();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message, { id: toastId });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Vendor Management</h2>
          <p className="mt-1 text-sm text-slate-500">Add, edit, and monitor the vendors available for routing.</p>
        </div>
        <Link
          to="/vendors/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Vendor
        </Link>
      </div>

      {vendorsError && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{vendorsError}</p>}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        {vendorsLoading ? (
          <p className="p-6 text-center text-sm text-slate-500">Loading vendors…</p>
        ) : (
          <VendorTable vendors={vendors} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}
