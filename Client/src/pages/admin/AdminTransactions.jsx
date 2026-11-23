import AdminTransactionsPanel from '../../components/admin/transactions/AdminTransactionsPanel';

export default function AdminTransactions() {
  return (
    <div>
      <div className="admin-page-header">
        <h1>Quản lý giao dịch</h1>
        <p className="admin-page-description">
          Theo dõi toàn bộ giao dịch, đối chiếu trực tiếp với PayOS và xuất báo cáo theo bộ lọc hiện tại.
        </p>
      </div>
      <AdminTransactionsPanel />
    </div>
  );
}
