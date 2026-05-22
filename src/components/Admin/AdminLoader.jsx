import React from 'react';
import { Loader2 } from 'lucide-react';

const AdminLoader = ({ message = 'Загрузка данных...' }) => {
  return (
    <div className="admin-loader">
      <div className="admin-loader__content">
        <div className="admin-loader__spinner">
          <Loader2 size={40} className="animate-spin" />
        </div>
        {message && <p className="admin-loader__message">{message}</p>}
      </div>
    </div>
  );
};

export default AdminLoader;
